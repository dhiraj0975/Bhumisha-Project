const express = require("express");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categories.Controller");
const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);      
categoryRoutes.post("/", createCategory);    
categoryRoutes.put("/:id", updateCategory);  
categoryRoutes.delete("/:id", deleteCategory);

module.exports = categoryRoutes;
