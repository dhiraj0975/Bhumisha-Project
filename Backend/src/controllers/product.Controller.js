// const Product = require("../models/productsModel");

// const createProduct = (req, res) => {
//   Product.create(req.body, (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     res.status(201).json({ message: "Product created", id: result.insertId });
//   });
// };

// const getProducts = (req, res) => {
//   Product.getAll((err, results) => {
//     if (err) return res.status(500).json({ error: err });
//     res.json(results);
//   });
// };

// const getProductById = (req, res) => {
//   Product.getById(req.params.id, (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     if (result.length === 0) return res.status(404).json({ message: "Product not found" });
//     res.json(result[0]);
//   });
// };

// const updateProduct = (req, res) => {
//   Product.update(req.params.id, req.body, (err) => {
//     if (err) return res.status(500).json({ error: err });
//     res.json({ message: "Product updated" });
//   });
// };

// const deleteProduct = (req, res) => {
//   Product.delete(req.params.id, (err) => {
//     if (err) return res.status(500).json({ error: err });
//     res.json({ message: "Product deleted" });
//   });
// };

// module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };



// controllers/product.Controller.js
const Product = require("../models/productsModel");

const validate = (body, isCreate = true) => {
  const errors = [];

  // Requireds on create
  if (isCreate && (body.category_id === undefined || body.category_id === "")) {
    errors.push("category_id is required");
  }
  if (isCreate && (body.product_name === undefined || String(body.product_name).trim() === "")) {
    errors.push("product_name is required");
  }

  // Optional constraints
  if (body.size !== undefined && String(body.size).length > 64) {
    errors.push("size too long (max 64)");
  }

  // Numeric checks
  const numericFields = [
    "purchase_rate",
    "transport_charge",
    "local_transport",
    "packaging_cost",
    "packing_weight",
    "value",
    "discount_30",
    "discount_25",
    "discount_50",
    "total",
    "gst"
  ];
  numericFields.forEach((f) => {
    if (body[f] !== undefined && body[f] !== null && body[f] !== "") {
      if (isNaN(Number(body[f]))) errors.push(`${f} must be a number`);
    }
  });

  return errors;
};

const safeErr = (err) => ({ error: err?.sqlMessage || err?.message || String(err) });

// Create
const createProduct = (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  Product.create(req.body, (err, result) => {
    if (err) return res.status(500).json(safeErr(err));
    return res.status(201).json({ message: "Product created", id: result.insertId });
  });
};

// List all
const getProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json(safeErr(err));
    return res.json(results);
  });
};

// Get one
const getProductById = (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json(safeErr(err));
    if (!Array.isArray(result) || result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(result[0]);
  });
};

// Update
const updateProduct = (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const errors = validate(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  Product.update(id, req.body, (err, dbRes) => {
    if (err) return res.status(500).json(safeErr(err));
    // optional: check affectedRows if needed using dbRes
    return res.json({ message: "Product updated" });
  });
};

// Delete
const deleteProduct = (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  Product.delete(id, (err, dbRes) => {
    if (err) return res.status(500).json(safeErr(err));
    // optional: if (dbRes.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product deleted" });
  });
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
