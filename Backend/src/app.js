const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");


const vendorRoutes = require("./routes/vendor.routes");
const farmerRoutes = require("./routes/farmer.routes");
const categoryRoutes = require("./routes/categories.routes");
const productRoutes = require("./routes/product.routes");
const purchaseRoutes = require("./routes/purchase.routes");


// ===============  Middleware for CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend.bajravijayveerarmytrainingacademy.in",
];


app.use(cors({
  origin: process.env.FRONTEND_URL || allowedOrigins,    
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());
app.use(bodyParser.json());

// ===============  Middleware for API routes =================

app.use("/api/vendors", vendorRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchase", purchaseRoutes);

module.exports = app;
