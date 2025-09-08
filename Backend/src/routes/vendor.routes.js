const express = require("express");
const { createVendor, getVendors, updateVendor, deleteVendor, updateVendorStatus } = require("../controllers/vendor.Controller");

const vendorRoutes = express.Router();

console.log("router call");


vendorRoutes.post("/", createVendor);
vendorRoutes.get("/", getVendors);
vendorRoutes.put("/:id", updateVendor);
vendorRoutes.delete("/:id", deleteVendor);
vendorRoutes.patch("/:id/status", updateVendorStatus);

module.exports = vendorRoutes;
