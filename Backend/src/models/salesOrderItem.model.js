const db = require("../config/db");

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        err.query = sql;
        err.params = params;
        return reject(err);
      }
      resolve([results]);
    });
  });

const SalesOrderItem = {
  create: async (data) => {
    const sql = `
      INSERT INTO sales_order_items
      (sales_order_id, product_id, hsn_code, qty, rate, discount_per_qty, gst_percent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      toNum(data.sales_order_id),
      toNum(data.product_id),
      data.hsn_code || "",
      toNum(data.qty),
      toNum(data.rate),
      toNum(data.discount_per_qty),
      toNum(data.gst_percent),
      data.status || "Active",
    ];
    const [res] = await q(sql, values);
    return res;
  },

  getBySOId: async (id) => {
    const sql = `
      SELECT soi.*, p.product_name
      FROM sales_order_items soi
      JOIN products p ON p.id = soi.product_id
      WHERE soi.sales_order_id = ?
      ORDER BY soi.id ASC
    `;
    const [rows] = await q(sql, [toNum(id)]);
    return rows;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE sales_order_items SET
        product_id = ?, hsn_code = ?, qty = ?, rate = ?,
        discount_per_qty = ?, gst_percent = ?, status = ?
      WHERE id = ?
    `;
    const values = [
      toNum(data.product_id),
      data.hsn_code || "",
      toNum(data.qty),
      toNum(data.rate),
      toNum(data.discount_per_qty),
      toNum(data.gst_percent),
      data.status || "Active",
      toNum(id),
    ];
    const [res] = await q(sql, values);
    return res;
  },

  deleteBySOId: async (soId) => {
    const [res] = await q(`DELETE FROM sales_order_items WHERE sales_order_id = ?`, [toNum(soId)]);
    return res;
  },
};

module.exports = SalesOrderItem;
