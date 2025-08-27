const express = require("express");
const app = express();
const cors = require("cors");
const vendorRoutes = require("./routes/vendor.routes");


app.use(cors({
  origin: process.env.FRONTEND_URL,    
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ===============  Middleware for API routes =================

app.use("/api/vendors", vendorRoutes);

module.exports = app;
