// models/salePayments.model.js
const db = require('../config/db');
const mysql = require('mysql2/promise');

const SalePayments = {
  getConnection: async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    return conn;
  },

  create: async ({ sale_id, customer_id, payment_date, amount, method = 'Cash', remarks = null }) => {
    if (!sale_id || !customer_id || !payment_date || !amount) {
      throw new Error('sale_id, customer_id, payment_date, amount are required');
    }
    const conn = await SalePayments.getConnection();
    try {
      await conn.beginTransaction();

      // Insert payment
      await conn.execute(
        `INSERT INTO sale_payments (sale_id, customer_id, payment_date, amount, method, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sale_id, customer_id, payment_date, amount, method, remarks]
      );

      // Recalculate payment_status for sale based on total payments
      const [[sale]] = await conn.query(
        'SELECT total_amount FROM sales WHERE id=?',
        [sale_id]
      );
      const [[agg]] = await conn.query(
        'SELECT COALESCE(SUM(amount),0) AS paid FROM sale_payments WHERE sale_id=?',
        [sale_id]
      );

      const paid = Number(agg.paid || 0);
      const due = Number(sale?.total_amount || 0);
      let payment_status = 'Unpaid';
      if (paid <= 0) payment_status = 'Unpaid';
      else if (paid > 0 && paid < due) payment_status = 'Partial';
      else if (paid >= due) payment_status = 'Paid';

      await conn.execute(
        'UPDATE sales SET payment_status=? WHERE id=?',
        [payment_status, sale_id]
      );

      await conn.commit();
      return { sale_id, paid, due, payment_status };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  listBySale: async (sale_id) => {
    const conn = await SalePayments.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM sale_payments WHERE sale_id=? ORDER BY id DESC`,
        [sale_id]
      );
      return rows;
    } finally {
      await conn.end();
    }
  },

  delete: async (id) => {
    const conn = await SalePayments.getConnection();
    try {
      await conn.beginTransaction();

      // Find sale_id to recompute status after delete
      const [[row]] = await conn.query('SELECT sale_id FROM sale_payments WHERE id=?', [id]);
      if (!row) {
        await conn.rollback();
        return { affectedRows: 0 };
      }
      const sale_id = row.sale_id;

      const [res] = await conn.execute('DELETE FROM sale_payments WHERE id=?', [id]);

      // Recompute payment_status
      const [[sale]] = await conn.query('SELECT total_amount FROM sales WHERE id=?', [sale_id]);
      const [[agg]] = await conn.query('SELECT COALESCE(SUM(amount),0) AS paid FROM sale_payments WHERE sale_id=?', [sale_id]);
      const paid = Number(agg.paid || 0);
      const due = Number(sale?.total_amount || 0);
      let payment_status = 'Unpaid';
      if (paid <= 0) payment_status = 'Unpaid';
      else if (paid > 0 && paid < due) payment_status = 'Partial';
      else if (paid >= due) payment_status = 'Paid';

      await conn.execute('UPDATE sales SET payment_status=? WHERE id=?', [payment_status, sale_id]);

      await conn.commit();
      return res;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },
  getByCustomerId: async (customer_id) => {
  const conn = await SalePayments.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM sale_payments WHERE customer_id=? ORDER BY payment_date ASC, id ASC',
      [customer_id]
    );
    return rows;
  } finally {
    await conn.end();
  }
},
};

module.exports = SalePayments;
