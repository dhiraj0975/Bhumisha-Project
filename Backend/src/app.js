const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");


const vendorRoutes = require("./routes/vendor.routes");
const farmerRoutes = require("./routes/farmer.routes");
const categoryRoutes = require("./routes/categories.routes");
const productRoutes = require("./routes/product.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const customerRouter = require("./routes/customer.routes");
const salesRoutes = require("./routes/sales.routes");
const salePaymentsRoutes = require("./routes/salePayments.routes");


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
app.use("/api/customers", customerRouter);
app.use('/api/sales', salesRoutes);
app.use('/api/sale-payments', salePaymentsRoutes);

module.exports = app;
