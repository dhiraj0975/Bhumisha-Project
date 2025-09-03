    const db = require("../config/db");

    const Category = {
    getAll: (callback) => {
        const sql = "SELECT * FROM categories";
        db.query(sql, callback);
    },

    create: (name, callback) => {
        const sql = "INSERT INTO categories (name) VALUES (?)";
        db.query(sql, [name], callback);
    },

    update: (id, name, callback) => {
        const sql = "UPDATE categories SET name = ? WHERE id = ?";
        db.query(sql, [name, id], callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM categories WHERE id = ?";
        db.query(sql, [id], callback);
    }
    };

    module.exports = Category;
