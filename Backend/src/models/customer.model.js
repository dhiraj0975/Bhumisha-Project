const db = require('../config/db'); // mysql2 (non-promise) config

const Customer = {
  // 1️⃣ Get all customers
  getAll: (callback) => {
    const sql = `
      SELECT *, 
        DATE_FORMAT(created_at, '%Y-%m-%d %h:%i:%s %p') AS created_at_formatted, 
        DATE_FORMAT(updated_at, '%Y-%m-%d %h:%i:%s %p') AS updated_at_formatted 
      FROM customers 
      ORDER BY id DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  // 2️⃣ Get customer by ID
  getById: (id, callback) => {
    const sql = `
      SELECT *, 
        DATE_FORMAT(created_at, '%Y-%m-%d %h:%i:%s %p') AS created_at_formatted, 
        DATE_FORMAT(updated_at, '%Y-%m-%d %h:%i:%s %p') AS updated_at_formatted 
      FROM customers WHERE id = ?
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // 3️⃣ Create new customer
  create: (data, callback) => {
    const { name, email, phone, address, status } = data;
    const sql = `
      INSERT INTO customers (name, email, phone, address, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    db.query(sql, [name, email || "", phone || "", address || "", status || "Active"], (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId, name, email, phone, address, status: status || "Active" });
    });
  },

  // 4️⃣ Update customer
  update: (id, data, callback) => {
    const { name, email, phone, address, status } = data;
    const sql = `
      UPDATE customers 
      SET name=?, email=?, phone=?, address=?, status=?, updated_at=NOW() 
      WHERE id=?
    `;
    db.query(sql, [name, email || "", phone || "", address || "", status || "Active", id], (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    });
  },

  // 5️⃣ Delete customer
  delete: (id, callback) => {
    const sql = "DELETE FROM customers WHERE id=?";
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    });
  },

  // 6️⃣ Toggle status (Active/Inactive)
  toggleStatus: (id, currentStatus, callback) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const sql = "UPDATE customers SET status=?, updated_at=NOW() WHERE id=?";
    db.query(sql, [newStatus, id], (err, result) => {
      if (err) return callback(err);
      callback(null, newStatus);
    });
  },
  findByEmail: (email, callback) => {
  const sql = "SELECT * FROM customers WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.length ? result[0] : null);
  });
},

};

module.exports = Customer;
