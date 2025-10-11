// src/app.js
const express = require("express");
const cors = require("cors");
// Optional middlewares (env-based toggles)
const useHelmet = process.env.USE_HELMET === "true";
const useMorgan = process.env.USE_MORGAN === "true";

const app = express();

// Lazy-require optional deps only when enabled
let helmet = null;
let morgan = null;
if (useHelmet) {
  try { helmet = require("helmet"); } catch { /* no-op */ }
}
if (useMorgan) {
  try { morgan = require("morgan"); } catch { /* no-op */ }
}

// Routes
const vendorRoutes = require("./routes/vendor.routes");
const farmerRoutes = require("./routes/farmer.routes");
const categoryRoutes = require("./routes/categories.routes");
const productRoutes = require("./routes/product.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const customerRouter = require("./routes/customer.routes");
const salesRoutes = require("./routes/sales.routes");
const salePaymentsRoutes = require("./routes/salePayments.routes");
const PurchaseOrderRouter = require("./routes/purchaseOrder.routes");
const SalesOrderRouter = require("./routes/salesOrder.routes");

// ---------- Core Config ----------
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "";
const JSON_LIMIT = process.env.JSON_LIMIT || "2mb";

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL, // allow env frontend if provided
  "https://frontend.bajravijayveerarmytrainingacademy.in",
].filter(Boolean);

// CORS config with explicit 403 for unknown origins
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser clients / server-to-server
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Origin not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  maxAge: 86400,
};

app.use((req, res, next) => {
  // Handle preflight early
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  return cors(corsOptions)(req, res, next);
});

// Body parsers
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Optional security/logging
if (helmet) app.use(helmet());
if (morgan) app.use(morgan("tiny"));

// ---------- Health ----------
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    env: NODE_ENV,
    ts: new Date().toISOString(),
  });
});

// ---------- Routes ----------
app.use("/api/vendors", vendorRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/purchase-orders", PurchaseOrderRouter);
app.use("/api/customers", customerRouter);
app.use("/api/sales", salesRoutes);
app.use("/api/so-orders", SalesOrderRouter);
app.use("/api/sale-payments", salePaymentsRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.originalUrl });
});

// ---------- Error handler ----------
app.use((err, req, res, _next) => {
  // CORS unknown origin -> 403
  if (err && err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked: Origin not allowed" });
  }

  // Structured error response
  const isProd = NODE_ENV === "production";
  const payload = {
    message: "Internal server error",
  };

  if (!isProd) {
    payload.error = {
      message: err?.message,
      stack: err?.stack,
      // Attach query context if set by db wrapper
      sql: err?.query,
      params: err?.params,
    };
    // Console in non-prod
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
  }

  return res.status(500).json(payload);
});

module.exports = app;
