const express = require("express");
const { createFarmer, getFarmers, updateFarmer, deleteFarmer, updateFarmerStatus } = require("../controllers/farmer.Controller");

const farmerRoutes = express.Router();

farmerRoutes.post("/", createFarmer);
farmerRoutes.get("/", getFarmers);
farmerRoutes.put("/:id", updateFarmer);
farmerRoutes.delete("/:id", deleteFarmer);
farmerRoutes.patch("/:id/status", updateFarmerStatus);  // ✅ new route

module.exports = farmerRoutes;
