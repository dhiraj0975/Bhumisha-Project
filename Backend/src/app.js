const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");


const vendorRoutes = require("./routes/vendor.routes");
const farmerRoutes = require("./routes/farmer.routes");


app.use(cors({
  origin: process.env.FRONTEND_URL,    
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

// ===============  Middleware for API routes =================

app.use("/api/vendors", vendorRoutes);
app.use("/api/farmers", farmerRoutes);

module.exports = app;
