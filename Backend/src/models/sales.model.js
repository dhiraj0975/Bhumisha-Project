const mysql = require('mysql2/promise');

const Sales = {
  getConnection: async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: false,
    });
    return conn;
  },

  // Generate next bill number like BILL-001, BILL-002 ...
  getNewBillNo: async () => {
    const conn = await Sales.getConnection();
    try {
      const [rows] = await conn.execute('SELECT bill_no FROM sales ORDER BY id DESC LIMIT 1');
      let lastNo = 0;
      if (rows.length && rows[0].bill_no) {
        const parts = String(rows[0].bill_no).split('-');
        lastNo = parseInt(parts[1], 10) || 0;
      }
      return `BILL-${String(lastNo + 1).padStart(3, '0')}`;
    } finally {
      await conn.end();
    }
  },

  // Create sale: inserts sale + items, updates stock, computes totals,
  // computes previous due, posts payment (sale_payments), and sets payment_status
  create: async (payload) => {
    const {
      customer_id,
      bill_no,
      bill_date,
      payment_status = 'Unpaid',
      payment_method = 'Cash',
      remarks = null,
      status = 'Active',
      items = [],
      cash_received = 0, // NEW
    } = payload;

    if (!customer_id || !bill_date) throw new Error('customer_id and bill_date are required');

    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();

      // Bill no
      let finalBillNo = bill_no;
      if (!finalBillNo) {
        const [last] = await conn.execute('SELECT bill_no FROM sales ORDER BY id DESC LIMIT 1');
        let lastNo = 0;
        if (last.length && last[0].bill_no) {
          const parts = String(last[0].bill_no).split('-');
          lastNo = parseInt(parts[1], 10) || 0;
        }
        finalBillNo = `BILL-${String(lastNo + 1).padStart(3, '0')}`;
      }

      // Insert sale header with zero totals initially
      const [saleRes] = await conn.execute(
        `INSERT INTO sales
         (customer_id, bill_no, bill_date, total_taxable, total_gst, total_amount, payment_status, payment_method, remarks, status)
         VALUES (?, ?, ?, 0.00, 0.00, 0.00, ?, ?, ?, ?)`,
        [customer_id, finalBillNo, bill_date, payment_status, payment_method, remarks, status]
      );
      const sale_id = saleRes.insertId;

      let total_taxable = 0, total_gst = 0, total_amount = 0;

      // Insert items and decrement stock
      if (Array.isArray(items) && items.length) {
        for (const item of items) {
          if (!item.product_id || !item.qty) continue;

          // Lock product row for stock correctness
          const [prodRows] = await conn.execute(
            `SELECT 
               id,
               total AS rate,
               CAST(NULLIF(REPLACE(gst, '%', ''), '') AS DECIMAL(5,2)) AS gst_percent,
               size
             FROM products
             WHERE id=? FOR UPDATE`,
            [item.product_id]
          );
          if (!prodRows.length) throw new Error(`product ${item.product_id} not found`);

          const prod = prodRows[0];
          const currentSizeNum = Number(prod.size || 0);
          const qty = Number(item.qty || 0);
          if (!Number.isFinite(qty) || qty <= 0) throw new Error(`invalid qty for product ${item.product_id}`);

          // Stock check against size
          if (qty > currentSizeNum) {
            throw new Error(`insufficient stock for product ${item.product_id}: available ${currentSizeNum}, requested ${qty}`);
          }

          // Pricing
          const rate = Number(item.rate ?? prod.rate ?? 0);
          const discount_rate = Number(item.discount_rate ?? 0);
          const discount_amount = Number(item.discount_amount ?? (rate * qty * discount_rate) / 100);
          const taxable_amount = Number((rate * qty) - discount_amount);
          const gst_percent = Number(item.gst_percent ?? prod.gst_percent ?? 0);
          const gst_amount = Number((taxable_amount * gst_percent) / 100);
          const net_total = Number(taxable_amount + gst_amount);
          const unit = item.unit || 'PCS';

          // Insert sale item
          await conn.execute(
            `INSERT INTO sale_items
             (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [sale_id, item.product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit]
          );

          // Decrement size (stock)
          const newSize = currentSizeNum - qty;
          await conn.execute(`UPDATE products SET size = ? WHERE id = ?`, [String(newSize), item.product_id]);

          total_taxable += taxable_amount;
          total_gst += gst_amount;
          total_amount += net_total;
        }
      }

      // Update totals on sale
      await conn.execute(
        'UPDATE sales SET total_taxable=?, total_gst=?, total_amount=? WHERE id=?',
        [total_taxable.toFixed(2), total_gst.toFixed(2), total_amount.toFixed(2), sale_id]
      );

      // Compute previous due (sum sales - sum payments)
      const [[agg]] = await conn.query(
        `
        SELECT
          COALESCE((
            SELECT SUM(s.total_amount)
            FROM sales s
            WHERE s.customer_id = ? AND (s.status IS NULL OR s.status <> 'Cancelled')
          ), 0) AS total_sales,
          COALESCE((
            SELECT SUM(p.amount)
            FROM sale_payments p
            WHERE p.customer_id = ?
          ), 0) AS total_payments
        `,
        [customer_id, customer_id]
      );
      const total_sales = Number(agg?.total_sales || 0);
      const total_payments = Number(agg?.total_payments || 0);
      const previous_due = Math.max(total_sales - total_payments, 0);

      // gross_due = previous_due + current sale total
      const gross_due = previous_due + Number(total_amount || 0);

      // Post payment if any
      const cash = Number(cash_received || 0);
      if (cash > 0) {
        await conn.execute(
          `INSERT INTO sale_payments (sale_id, customer_id, payment_date, amount, method, remarks)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sale_id,
            customer_id,
            bill_date,                     // record payment on bill date
            cash.toFixed(2),
            payment_method || 'Cash',
            remarks || null,
          ]
        );
      }

      // new due and payment status
      const new_due = Math.max(gross_due - cash, 0);
      let final_payment_status = 'Unpaid';
      if (new_due <= 0 && (cash > 0 || gross_due === 0)) {
        final_payment_status = 'Paid';
      } else if (cash > 0 && new_due > 0) {
        final_payment_status = 'Partial';
      }

      // Persist payment_status on sale header
      await conn.execute(
        `UPDATE sales SET payment_status=? WHERE id=?`,
        [final_payment_status, sale_id]
      );

      await conn.commit();
      return {
        id: sale_id,
        bill_no: finalBillNo,
        total_taxable,
        total_gst,
        total_amount,
        previous_due,
        cash_received: cash,
        new_due,
        payment_status: final_payment_status,
      };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // Lightweight list with customer name
  getAll: async () => {
    const conn = await Sales.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT s.*, c.name AS customer_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         ORDER BY s.id DESC`
      );
      return rows;
    } finally {
      await conn.end();
    }
  },

  // Single sale with embedded items
  getById: async (id) => {
    const conn = await Sales.getConnection();
    try {
      const [saleRows] = await conn.execute(
        `SELECT s.*, c.name AS customer_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         WHERE s.id=?`,
        [id]
      );
      if (!saleRows.length) return null;

      const [items] = await conn.execute(
        `SELECT si.*, p.product_name AS item_name, p.hsn_code
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id=?`,
        [id]
      );

      return { ...saleRows[0], items };
    } finally {
      await conn.end();
    }
  },

  // Update sale header and optionally replace items; stock is restored and re-applied
  update: async (id, data) => {
    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();

      // Load existing sale
      const [existRows] = await conn.execute('SELECT * FROM sales WHERE id=?', [id]);
      if (!existRows.length) throw new Error('sale not found');

      const existing = existRows[0];

      const {
        customer_id,
        bill_no = null,
        bill_date = null,
        payment_status = 'Unpaid',
        payment_method = 'Cash',
        remarks = null,
        status = 'Active',
        items, // optional array to replace
      } = data;

      const final_customer_id = customer_id ?? existing.customer_id;
      const final_bill_no = bill_no ?? existing.bill_no;
      const final_bill_date = bill_date ?? existing.bill_date;
      const final_payment_status = payment_status ?? existing.payment_status;
      const final_payment_method = payment_method ?? existing.payment_method;
      const final_remarks = remarks ?? existing.remarks;
      const final_status = status ?? existing.status;

      if (!final_customer_id) throw new Error('customer_id is required');

      // Update sale header minimal fields first
      await conn.execute(
        `UPDATE sales
         SET customer_id=?, bill_no=?, bill_date=?, payment_status=?, payment_method=?, remarks=?, status=?
         WHERE id=?`,
        [final_customer_id, final_bill_no, final_bill_date, final_payment_status, final_payment_method, final_remarks, final_status, id]
      );

      let total_taxable = Number(existing.total_taxable || 0);
      let total_gst = Number(existing.total_gst || 0);
      let total_amount = Number(existing.total_amount || 0);

      if (Array.isArray(items)) {
        // 1) Restore stock from old items
        const [oldItems] = await conn.execute(
          `SELECT product_id, qty FROM sale_items WHERE sale_id=?`,
          [id]
        );
        for (const it of oldItems) {
          const [prodRows] = await conn.execute(
            `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
            [it.product_id]
          );
          if (prodRows.length) {
            const currentSizeNum = Number(prodRows[0].size || 0);
            const newSize = currentSizeNum + Number(it.qty || 0);
            await conn.execute(`UPDATE products SET size=? WHERE id=?`, [String(newSize), it.product_id]);
          }
        }

        // 2) Delete old items
        await conn.execute('DELETE FROM sale_items WHERE sale_id=?', [id]);

        // 3) Insert new items and decrement stock + recalc totals
        total_taxable = 0; total_gst = 0; total_amount = 0;

        for (const item of items) {
          if (!item.product_id || !item.qty) continue;

          const [prodRows] = await conn.execute(
            `SELECT 
               id,
               total AS rate,
               CAST(NULLIF(REPLACE(gst, '%', ''), '') AS DECIMAL(5,2)) AS gst_percent,
               size
             FROM products WHERE id=? FOR UPDATE`,
            [item.product_id]
          );
          if (!prodRows.length) throw new Error(`product ${item.product_id} not found`);

          const prod = prodRows[0];
          const currentSizeNum = Number(prod.size || 0);
          const qty = Number(item.qty || 0);
          if (qty > currentSizeNum) {
            throw new Error(`insufficient stock for product ${item.product_id}: available ${currentSizeNum}, requested ${qty}`);
          }

          const rate = Number(item.rate ?? prod.rate ?? 0);
          const discount_rate = Number(item.discount_rate ?? 0);
          const discount_amount = Number(item.discount_amount ?? (rate * qty * discount_rate) / 100);
          const taxable_amount = Number((rate * qty) - discount_amount);
          const gst_percent = Number(item.gst_percent ?? prod.gst_percent ?? 0);
          const gst_amount = Number((taxable_amount * gst_percent) / 100);
          const net_total = Number(taxable_amount + gst_amount);
          const unit = item.unit || 'PCS';

          await conn.execute(
            `INSERT INTO sale_items
             (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [id, item.product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit]
          );

          const newSize = currentSizeNum - qty;
          await conn.execute(`UPDATE products SET size=? WHERE id=?`, [String(newSize), item.product_id]);

          total_taxable += taxable_amount;
          total_gst += gst_amount;
          total_amount += net_total;
        }

        await conn.execute(
          'UPDATE sales SET total_taxable=?, total_gst=?, total_amount=? WHERE id=?',
          [total_taxable.toFixed(2), total_gst.toFixed(2), total_amount.toFixed(2), id]
        );
      }

      await conn.commit();
      return { id, total_taxable, total_gst, total_amount };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // Delete sale (optionally restore stock; here we are not restoring to keep behaviour same as your version)
  delete: async (id) => {
    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute('DELETE FROM sale_items WHERE sale_id=?', [id]);
      const [res] = await conn.execute('DELETE FROM sales WHERE id=?', [id]);
      await conn.commit();
      return res;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // All sales by customer with embedded items
  getByCustomerId: async (customer_id) => {
    const conn = await Sales.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT s.*, c.name AS customer_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         WHERE s.customer_id=?
         ORDER BY s.id DESC`,
        [customer_id]
      );

      for (const sale of rows) {
        const [items] = await conn.execute(
          `SELECT si.*, p.product_name AS item_name, p.hsn_code
           FROM sale_items si
           JOIN products p ON si.product_id = p.id
           WHERE si.sale_id=?`,
          [sale.id]
        );
        sale.items = items;
      }
      return rows;
    } finally {
      await conn.end();
    }
  },
};

module.exports = Sales;
