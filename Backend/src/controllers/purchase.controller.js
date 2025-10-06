const db = require("../config/db");
const PurchaseItem = require("../models/purchaseItem.model2"); // PurchaseItem model

const purchaseController = {
  // ✅ Create Purchase
  create: async (req, res) => {
    try {
      const { vendor_id, gst_no, bill_no, bill_date, items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items must be a non-empty array" });
      }

      const connection = db.promise();
      await connection.query("START TRANSACTION");

      const formattedDate = bill_date
        ? new Date(bill_date).toISOString().split("T")[0]
        : null;

      const total_amount = items.reduce(
        (sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0),
        0
      );

      // 1️⃣ Insert into purchases
      const [purchaseResult] = await connection.query(
        `INSERT INTO purchases (vendor_id, gst_no, bill_no, bill_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [vendor_id, gst_no || null, bill_no, formattedDate, total_amount, "Active"]
      );
      const purchaseId = purchaseResult.insertId;

      // 2️⃣ Insert purchase items
      const values = items.map((i) => [
        purchaseId,
        i.product_id,
        i.rate,
        i.size,
        i.unit || "PCS",
        "Active",
      ]);

      if (values.length > 0) {
        await connection.query(
          `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
          [values]
        );

        // 3️⃣ Update product stock
        for (let i of items) {
          await connection.query(
            `UPDATE products SET size = size + ? WHERE id = ?`,
            [i.size, i.product_id]
          );
        }
      }

      await connection.query("COMMIT");
      res.status(201).json({ message: "Purchase created successfully", purchase_id: purchaseId });
    } catch (err) {
      await db.promise().query("ROLLBACK");
      console.error("Purchase creation error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Update Purchase
update: async (req, res) => {
  const { id } = req.params;
  const { vendor_name, firm_name, gst_no, bill_no, bill_date, status, items } = req.body;

  if (!vendor_name) return res.status(400).json({ error: "vendor_name is required" });
  if (!bill_no) return res.status(400).json({ error: "bill_no is required" });
  if (!bill_date) return res.status(400).json({ error: "bill_date is required" });

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Check if vendor exists
    let [vendorRows] = await connection.query(
      `SELECT id FROM vendors WHERE vendor_name = ?`,
      [vendor_name]
    );

    let vendor_id;
    if (vendorRows.length > 0) {
      vendor_id = vendorRows[0].id;
    } else {
      // ✅ Create new vendor if not exists
      const [result] = await connection.query(
        `INSERT INTO vendors (vendor_name, firm_name, gst_no, status) VALUES (?, ?, ?, ?)`,
        [vendor_name, firm_name || "", gst_no || null, "active"]
      );
      vendor_id = result.insertId;
    }

    const formattedDate = new Date(bill_date).toISOString().split("T")[0];

    // ✅ Update purchase table
    await connection.query(
      `UPDATE purchases SET vendor_id=?, gst_no=?, bill_no=?, bill_date=?, status=? WHERE id=?`,
      [vendor_id, gst_no || null, bill_no, formattedDate, status || "Active", id]
    );

    // ✅ Update or insert purchase_items
    if (Array.isArray(items) && items.length > 0) {
      for (let item of items) {
        if (item.id) {
          await connection.query(
            `UPDATE purchase_items SET product_id=?, rate=?, size=?, unit=?, status=? WHERE id=?`,
            [item.product_id, item.rate, item.size, item.unit || "PCS", item.status || "Active", item.id]
          );
        } else {
          await connection.query(
            `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, item.product_id, item.rate, item.size, item.unit || "PCS", "Active"]
          );
        }

        // ✅ Update product stock
        await connection.query(
          `UPDATE products SET size = size + ? WHERE id = ?`,
          [item.size, item.product_id]
        );
      }
    }

    await connection.commit();
    res.json({ message: "Purchase updated successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Purchase update error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
}




,

  // ✅ Get all purchases
  getAll: async (req, res) => {
    try {
      const connection = db.promise();
      const [purchases] = await connection.query(`
        SELECT 
          p.id, p.bill_no, p.bill_date, p.total_amount, p.status,
          v.vendor_name, v.firm_name
        FROM purchases p
        JOIN vendors v ON p.vendor_id = v.id
        ORDER BY p.id DESC
      `);

      if (purchases.length === 0) return res.json([]);

      const purchaseIds = purchases.map(p => p.id);
      const [items] = await connection.query(`
        SELECT pi.*, pr.product_name
        FROM purchase_items pi
        JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id IN (?)
      `, [purchaseIds]);

      const purchasesWithItems = purchases.map(p => {
        p.items = items.filter(i => i.purchase_id === p.id);
        return p;
      });

      res.json(purchasesWithItems);
    } catch (err) {
      console.error("GetAll purchases error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ✅ Get purchase by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const connection = db.promise();

      const [purchaseRows] = await connection.query(`
        SELECT p.*, v.vendor_name, v.firm_name
        FROM purchases p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.id = ?
      `, [id]);

      if (purchaseRows.length === 0) return res.status(404).json({ message: "Purchase not found" });

      const purchase = purchaseRows[0];
      const items = await PurchaseItem.findByPurchaseId(id);
      purchase.items = items;

      res.json(purchase);
    } catch (err) {
      console.error("GetById purchase error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = purchaseController;
