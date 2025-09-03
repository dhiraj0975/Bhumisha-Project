const Category = require("../models/categoriesModel");

const getCategories = (req, res) => {
  Category.getAll((err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
};

const createCategory = (req, res) => {
  const { name } = req.body;
  Category.create(name, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category created", id: result.insertId });
  });
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  Category.update(id, name, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category updated" });
  });
};

const deleteCategory = (req, res) => {
  const { id } = req.params;
  Category.delete(id, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category deleted" });
  });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
