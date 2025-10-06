const db = require("../config/db");
const PurchaseItem = require("./purchaseItem.model2");

const Purchase = {
  // ✅ Create Purchase + Items + Update Stock
  create: async (data) => {
    const { vendor_id, gst_no, bill_no, bill_date, status, items } = data;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be a non-empty array");
    }

    const conn = db.promise(); // direct promise without getConnection
    try {
      await conn.beginTransaction();

      const formattedDate = bill_date
        ? new Date(bill_date).toISOString().split("T")[0]
        : null;

    const total_amount = items.reduce(
  (sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0),
  0
);


      // 1️⃣ Insert into purchases
      const [purchaseResult] = await conn.query(
        `INSERT INTO purchases (vendor_id, gst_no, bill_no, bill_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [vendor_id, gst_no || null, bill_no, formattedDate, total_amount, status || "Active"]
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
        await conn.query(
          `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
          [values]
        );

        // 3️⃣ Update product stock
        for (let i of items) {
          await conn.query(
            `UPDATE products SET size = size + ? WHERE id = ?`,
            [i.size, i.product_id]
          );
        }
      }

      await conn.commit();
      return purchaseId;
    } catch (err) {
      await conn.rollback();
      console.error("Purchase creation error:", err);
      throw err;
    }
  },

  // ✅ Update Purchase + Items + Stock
// update: async (req, res) => {
//   const { id } = req.params;
//   const { vendor_id, gst_no, bill_no, bill_date, status, items } = req.body;

//   const connection = await db.promise().getConnection();
//   try {
//     await connection.beginTransaction();

//     // 1️⃣ Update purchase table
//     await connection.query(
//       `UPDATE purchases SET vendor_id=?, gst_no=?, bill_no=?, bill_date=?, status=? WHERE id=?`,
//       [vendor_id, gst_no, bill_no, bill_date, status, id]
//     );

//     // 2️⃣ Update or insert purchase_items
//     if (Array.isArray(items) && items.length > 0) {
//       for (let item of items) {
//         if (item.id) {
//           // update existing item
//           await connection.query(
//             `UPDATE purchase_items SET product_id=?, rate=?, size=?, unit=?, status=? WHERE id=?`,
//             [item.product_id, item.rate, item.size, item.unit || "PCS", item.status || "Active", item.id]
//           );
//         } else {
//           // insert new item
//           await connection.query(
//             `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES (?, ?, ?, ?, ?, ?)`,
//             [id, item.product_id, item.rate, item.size, item.unit || "PCS", "Active"]
//           );
//         }
//       }
//     }

//     await connection.commit();
//     res.json({ message: "Purchase updated successfully" });
//   } catch (err) {
//     await connection.rollback();
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     connection.release();
//   }
// }

// ,

  // ✅ Get all purchases with vendor name and products
  findAll: async () => {
    const conn = db.promise();

    try {
      // 1️⃣ Get all purchases with vendor info
      const [purchases] = await conn.query(`
        SELECT 
          p.id, 
          p.bill_no, 
          p.bill_date, 
          p.total_amount, 
          p.status,
          v.vendor_name, 
          v.firm_name
        FROM purchases p
        JOIN vendors v ON p.vendor_id = v.id
        ORDER BY p.id DESC
      `);

      if (purchases.length === 0) return [];

      // 2️⃣ Get all items for these purchases
      const purchaseIds = purchases.map(p => p.id);
      const [items] = await conn.query(`
        SELECT pi.*, pr.product_name
        FROM purchase_items pi
        JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id IN (?)
      `, [purchaseIds]);

      // 3️⃣ Attach items to respective purchases
      const purchasesWithItems = purchases.map(p => {
        p.items = items.filter(i => i.purchase_id === p.id);
        return p;
      });

      return purchasesWithItems;

    } catch (err) {
      console.error("Error fetching purchases:", err);
      throw err;
    }
  },



  // ✅ Get purchase by ID with items
  findById: async (id) => {
    const conn = db.promise();
    const [purchaseRows] = await conn.query(
      `SELECT p.*, v.name AS vendor_name, v.firm_name
       FROM purchases p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    if (purchaseRows.length === 0) return null;
    const purchase = purchaseRows[0];

    const items = await PurchaseItem.findByPurchaseId(id);
    purchase.items = items;

    return purchase;
  },
}

module.exports = Purchase;
