
// // controllers/purchase.controller.js
// const db = require("../config/db");
// const PurchaseItem = require("../models/purchaseItem.model2");

// const purchaseController = {
//   // Create Purchase with stock increment (size += qty)
//   create: async (req, res) => {
//     const connection = db.promise();
//     try {
//       const { vendor_id, gst_no, bill_no, bill_date, items, status } = req.body;
//       if (!Array.isArray(items) || items.length === 0) {
//         return res.status(400).json({ error: "Items must be a non-empty array" });
//       }

//       await connection.query("START TRANSACTION");

//       const formattedDate = bill_date ? new Date(bill_date).toISOString().split("T")[0] : null;
//       const total_amount = items.reduce((sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0), 0);

//       const [purchaseResult] = await connection.query(
//         `INSERT INTO purchases (vendor_id, gst_no, bill_no, bill_date, total_amount, status)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [vendor_id, gst_no || null, bill_no, formattedDate, total_amount, status || "Active"]
//       );
//       const purchaseId = purchaseResult.insertId;

//       if (items.length > 0) {
//         const values = items.map((i) => [
//           purchaseId,
//           i.product_id,
//           Number(i.rate || 0),
//           Number(i.size || 0),
//           i.unit || "PCS",
//           "Active",
//         ]);

//         await connection.query(
//           `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
//           [values]
//         );

//         // Increment stock with row lock
//         for (const i of items) {
//           const [prodRows] = await connection.query(
//             `SELECT id, size FROM products WHERE id = ? FOR UPDATE`,
//             [i.product_id]
//           );
//           if (!prodRows.length) {
//             await connection.query("ROLLBACK");
//             return res.status(400).json({ error: `product ${i.product_id} not found` });
//           }
//           const curr = Number(prodRows[0].size || 0);
//           const inc = Number(i.size || 0);
//           if (!Number.isFinite(inc) || inc < 0) {
//             await connection.query("ROLLBACK");
//             return res.status(400).json({ error: `invalid size for product ${i.product_id}` });
//           }
//           const newSize = curr + inc;
//           await connection.query(`UPDATE products SET size = ? WHERE id = ?`, [String(newSize), i.product_id]);
//         }
//       }

//       await connection.query("COMMIT");
//       res.status(201).json({ message: "Purchase created successfully", purchase_id: purchaseId });
//     } catch (err) {
//       await db.promise().query("ROLLBACK");
//       console.error("Purchase creation error:", err);
//       res.status(400).json({ error: err.message || "Failed to create purchase" });
//     }
//   },

//   // Update Purchase with stock sync (diff on items)
//   update: async (req, res) => {
//     const { id } = req.params;
//     const { vendor_id, vendor_name, firm_name, gst_no, bill_no, bill_date, status, items } = req.body;

//     if (!vendor_id && !vendor_name) return res.status(400).json({ error: "vendor_id or vendor_name is required" });
//     if (!bill_no) return res.status(400).json({ error: "bill_no is required" });
//     if (!bill_date) return res.status(400).json({ error: "bill_date is required" });

//     const connection = db.promise();
//     try {
//       await connection.query("START TRANSACTION");

//       // Resolve vendor id if only name present
//       let resolvedVendorId = vendor_id;
//       if (!resolvedVendorId) {
//         let [vendorRows] = await connection.query(`SELECT id FROM vendors WHERE vendor_name = ?`, [vendor_name]);
//         if (vendorRows.length > 0) {
//           resolvedVendorId = vendorRows[0].id;
//         } else {
//           const [result] = await connection.query(
//             `INSERT INTO vendors (vendor_name, firm_name, gst_no, status) VALUES (?, ?, ?, ?)`,
//             [vendor_name, firm_name || "", gst_no || null, "active"]
//           );
//           resolvedVendorId = result.insertId;
//         }
//       }

//       const formattedDate = new Date(bill_date).toISOString().split("T")[0];

//       await connection.query(
//         `UPDATE purchases SET vendor_id=?, gst_no=?, bill_no=?, bill_date=?, status=? WHERE id=?`,
//         [resolvedVendorId, gst_no || null, bill_no, formattedDate, status || "Active", id]
//       );

//       if (Array.isArray(items)) {
//         // Fetch existing items
//         const [existingRows] = await connection.query(
//           `SELECT id, product_id, size FROM purchase_items WHERE purchase_id = ?`,
//           [id]
//         );
//         const existingMap = {};
//         const existingIds = [];
//         for (const r of existingRows) {
//           existingMap[r.id] = r;
//           existingIds.push(r.id);
//         }

//         const incomingIds = [];

//         // Process incoming items (updates/inserts) and adjust stock with locks
//         for (const item of items) {
//           const itemId = item.id ? Number(item.id) : null;
//           const newSize = Number(item.size || 0);
//           const prodId = Number(item.product_id);

//           if (itemId) {
//             incomingIds.push(itemId);
//             const prev = existingMap[itemId];
//             const prevSize = prev ? Number(prev.size || 0) : 0;
//             const sizeDelta = newSize - prevSize; // may be negative or positive

//             await connection.query(
//               `UPDATE purchase_items SET product_id=?, rate=?, size=?, unit=?, status=? WHERE id=?`,
//               [prodId, Number(item.rate || 0), newSize, item.unit || "PCS", item.status || "Active", itemId]
//             );

//             if (sizeDelta !== 0) {
//               const [prodRows] = await connection.query(
//                 `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
//                 [prodId]
//               );
//               if (!prodRows.length) {
//                 await connection.query("ROLLBACK");
//                 return res.status(400).json({ error: `product ${prodId} not found` });
//               }
//               const curr = Number(prodRows[0].size || 0);
//               const updated = curr + sizeDelta;
//               if (!Number.isFinite(updated) || updated < 0) {
//                 await connection.query("ROLLBACK");
//                 return res.status(400).json({ error: `stock would go negative for product ${prodId}` });
//               }
//               await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), prodId]);
//             }
//           } else {
//             // insert new item
//             const [insRes] = await connection.query(
//               `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES (?, ?, ?, ?, ?, ?)`,
//               [id, prodId, Number(item.rate || 0), newSize, item.unit || "PCS", "Active"]
//             );
//             // lock and increment stock
//             const [prodRows] = await connection.query(
//               `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
//               [prodId]
//             );
//             if (!prodRows.length) {
//               await connection.query("ROLLBACK");
//               return res.status(400).json({ error: `product ${prodId} not found` });
//             }
//             const curr = Number(prodRows[0].size || 0);
//             const updated = curr + newSize;
//             await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), prodId]);
//           }
//         }

//   // Delete removed items and decrement their size from stock
//         const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
//         if (toDelete.length > 0) {
//           for (const delId of toDelete) {
//             const r = existingMap[delId];
//             if (r) {
//               const [prodRows] = await connection.query(
//                 `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
//                 [r.product_id]
//               );
//               if (prodRows.length) {
//                 const curr = Number(prodRows[0].size || 0);
//                 const updated = curr - Number(r.size || 0);
//                 if (updated < 0) {
//                   await connection.query("ROLLBACK");
//                   return res.status(400).json({ error: `stock would go negative for product ${r.product_id}` });
//                 }
//                 await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), r.product_id]);
//               }
//               await connection.query(`DELETE FROM purchase_items WHERE id = ?`, [delId]);
//             }
//           }
//         }
//       }

//         // Recalculate total_amount from incoming items and update purchases table
//         try {
//           const newTotal = Array.isArray(items)
//             ? items.reduce((s, it) => s + Number(it.rate || 0) * Number(it.size || 0), 0)
//             : null;
//           if (newTotal !== null) {
//             await connection.query(`UPDATE purchases SET total_amount=? WHERE id=?`, [newTotal, id]);
//           }
//         } catch (e) {
//           await connection.query("ROLLBACK");
//           console.error("Failed to update total_amount after syncing items", e);
//           return res.status(500).json({ error: "Failed to update purchase total" });
//         }

//       await connection.query("COMMIT");
//       res.json({ message: "Purchase updated successfully" });
//     } catch (err) {
//       await connection.query("ROLLBACK");
//       console.error("Purchase update error:", err);
//       res.status(400).json({ error: err.message || "Failed to update purchase" });
//     }
//   },

//   // Get all purchases
//   getAll: async (req, res) => {
//     try {
//       const connection = db.promise();
//       const [purchases] = await connection.query(`
//         SELECT 
//           p.id, p.bill_no, p.bill_date, p.total_amount, p.status,
//           v.vendor_name, v.firm_name
//         FROM purchases p
//         JOIN vendors v ON p.vendor_id = v.id
//         ORDER BY p.id DESC
//       `);

//       if (purchases.length === 0) return res.json([]);

//       const purchaseIds = purchases.map((p) => p.id);
//       const [items] = await connection.query(
//         `
//         SELECT pi.*, pr.product_name
//         FROM purchase_items pi
//         JOIN products pr ON pi.product_id = pr.id
//         WHERE pi.purchase_id IN (?)
//       `,
//         [purchaseIds]
//       );

//       const purchasesWithItems = purchases.map((p) => {
//         p.items = items.filter((i) => i.purchase_id === p.id);
//         return p;
//       });

//       res.json(purchasesWithItems);
//     } catch (err) {
//       console.error("GetAll purchases error:", err);
//       res.status(500).json({ error: err.message });
//     }
//   },

//   // Get purchase by ID
//   getById: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const connection = db.promise();

//       const [purchaseRows] = await connection.query(
//         `
//         SELECT p.*, v.vendor_name, v.firm_name
//         FROM purchases p
//         JOIN vendors v ON p.vendor_id = v.id
//         WHERE p.id = ?
//       `,
//         [id]
//       );

//       if (purchaseRows.length === 0) return res.status(404).json({ message: "Purchase not found" });

//       const purchase = purchaseRows[0];
//       const items = await PurchaseItem.findByPurchaseId(id);
//       purchase.items = items;

//       res.json(purchase);
//     } catch (err) {
//       console.error("GetById purchase error:", err);
//       res.status(500).json({ error: err.message });
//     }
//   },
// };

// module.exports = purchaseController;



// controllers/purchase.controller.js
const db = require("../config/db");
const PurchaseItem = require("../models/purchaseItem.model2");

const purchaseController = {
  // Create Purchase (supports farmer)
  create: async (req, res) => {
    const connection = db.promise();
    try {
      const { party_type, vendor_id, farmer_id, vendor_name, firm_name, gst_no, bill_no, bill_date, items, status } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items must be a non-empty array" });
      }
      if (!bill_no) return res.status(400).json({ error: "bill_no is required" });
      if (!bill_date) return res.status(400).json({ error: "bill_date is required" });
      if (!party_type || !["vendor","farmer"].includes(party_type)) {
        return res.status(400).json({ error: "party_type must be 'vendor' or 'farmer'" });
      }

      await connection.query("START TRANSACTION");
      const formattedDate = bill_date ? new Date(bill_date).toISOString().split("T")[0] : null;
      const total_amount = items.reduce((sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0), 0);

      let resolvedVendorId = null;
      let resolvedFarmerId = null;

      if (party_type === "vendor") {
        // Accept either vendor_id or create/find by vendor_name
        if (vendor_id) {
          resolvedVendorId = Number(vendor_id);
        } else if (vendor_name) {
          const [rows] = await connection.query(`SELECT id FROM vendors WHERE vendor_name=?`, [vendor_name]);
          if (rows.length) {
            resolvedVendorId = rows[0].id;
          } else {
            const [ins] = await connection.query(
              `INSERT INTO vendors (vendor_name, firm_name, gst_no, status) VALUES (?, ?, ?, ?)`,
              [vendor_name, firm_name || "", gst_no || null, "active"]
            );
            resolvedVendorId = ins.insertId;
          }
        } else {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: "vendor_id or vendor_name required for vendor party" });
        }
      } else {
        // farmer flow
        if (farmer_id) {
          resolvedFarmerId = Number(farmer_id);
        } else if (req.body.farmer_name) {
          const farmerName = String(req.body.farmer_name).trim();
          const [rows] = await connection.query(`SELECT id FROM farmers WHERE name=?`, [farmerName]);
          if (rows.length) {
            resolvedFarmerId = rows[0].id;
          } else {
            // create minimal farmer row (extend if more fields in UI)
            const [ins] = await connection.query(
              `INSERT INTO farmers (name, status, balance, min_balance) VALUES (?, 'Active', 0.00, 5000.00)`,
              [farmerName]
            );
            resolvedFarmerId = ins.insertId;
          }
        } else {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: "farmer_id or farmer_name required for farmer party" });
        }
      }

      const [purchaseResult] = await connection.query(
        `INSERT INTO purchases (vendor_id, farmer_id, party_type, gst_no, bill_no, bill_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resolvedVendorId,
          resolvedFarmerId,
          party_type,
          gst_no || null,
          bill_no,
          formattedDate,
          total_amount,
          status || "Active"
        ]
      );
      const purchaseId = purchaseResult.insertId;

      if (items.length > 0) {
        const values = items.map((i) => [
          purchaseId,
          Number(i.product_id),
          Number(i.rate || 0),
          Number(i.size || 0),
          i.unit || "PCS",
          "Active",
        ]);

        await connection.query(
          `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
          [values]
        );

        for (const i of items) {
          const prodId = Number(i.product_id);
          const inc = Number(i.size || 0);
          const [prodRows] = await connection.query(
            `SELECT id, size FROM products WHERE id = ? FOR UPDATE`,
            [prodId]
          );
          if (!prodRows.length) {
            await connection.query("ROLLBACK");
            return res.status(400).json({ error: `product ${prodId} not found` });
          }
          const newSize = Number(prodRows[0].size || 0) + inc;
          await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(newSize), prodId]);
        }
      }

      await connection.query("COMMIT");
      res.status(201).json({ message: "Purchase created successfully", purchase_id: purchaseId });
    } catch (err) {
      await db.promise().query("ROLLBACK");
      console.error("Purchase creation error:", err);
      res.status(400).json({ error: err.message || "Failed to create purchase" });
    }
  },

  // Update Purchase (supports farmer)
  update: async (req, res) => {
    const { id } = req.params;
    const { party_type, vendor_id, farmer_id, vendor_name, farmer_name, firm_name, gst_no, bill_no, bill_date, status, items } = req.body;

    if (!bill_no) return res.status(400).json({ error: "bill_no is required" });
    if (!bill_date) return res.status(400).json({ error: "bill_date is required" });
    if (!party_type || !["vendor","farmer"].includes(party_type)) {
      return res.status(400).json({ error: "party_type must be 'vendor' or 'farmer'" });
    }

    const connection = db.promise();
    try {
      await connection.query("START TRANSACTION");

      let resolvedVendorId = null;
      let resolvedFarmerId = null;

      if (party_type === "vendor") {
        if (vendor_id) {
          resolvedVendorId = Number(vendor_id);
        } else if (vendor_name) {
          const [rows] = await connection.query(`SELECT id FROM vendors WHERE vendor_name=?`, [vendor_name]);
          if (rows.length) resolvedVendorId = rows[0].id;
          else {
            const [ins] = await connection.query(
              `INSERT INTO vendors (vendor_name, firm_name, gst_no, status) VALUES (?, ?, ?, ?)`,
              [vendor_name, firm_name || "", gst_no || null, "active"]
            );
            resolvedVendorId = ins.insertId;
          }
        } else {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: "vendor_id or vendor_name required for vendor party" });
        }
      } else {
        if (farmer_id) {
          resolvedFarmerId = Number(farmer_id);
        } else if (farmer_name) {
          const [rows] = await connection.query(`SELECT id FROM farmers WHERE name=?`, [farmer_name]);
          if (rows.length) resolvedFarmerId = rows[0].id;
          else {
            const [ins] = await connection.query(
              `INSERT INTO farmers (name, status, balance, min_balance) VALUES (?, 'Active', 0.00, 5000.00)`,
              [farmer_name]
            );
            resolvedFarmerId = ins.insertId;
          }
        } else {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: "farmer_id or farmer_name required for farmer party" });
        }
      }

      const formattedDate = new Date(bill_date).toISOString().split("T")[0];

      await connection.query(
        `UPDATE purchases 
           SET vendor_id=?, farmer_id=?, party_type=?, gst_no=?, bill_no=?, bill_date=?, status=?
         WHERE id=?`,
        [
          resolvedVendorId,
          resolvedFarmerId,
          party_type,
          gst_no || null,
          bill_no,
          formattedDate,
          status || "Active",
          id
        ]
      );

      if (Array.isArray(items)) {
        const [existingRows] = await connection.query(
          `SELECT id, product_id, size FROM purchase_items WHERE purchase_id = ?`,
          [id]
        );
        const existingMap = {};
        const existingIds = [];
        for (const r of existingRows) {
          existingMap[r.id] = r;
          existingIds.push(r.id);
        }

        const incomingIds = [];

        for (const item of items) {
          const itemId = item.id ? Number(item.id) : null;
          const newSize = Number(item.size || 0);
          const prodId = Number(item.product_id);

          if (itemId) {
            incomingIds.push(itemId);
            const prev = existingMap[itemId];
            const prevSize = prev ? Number(prev.size || 0) : 0;
            const sizeDelta = newSize - prevSize;

            await connection.query(
              `UPDATE purchase_items SET product_id=?, rate=?, size=?, unit=?, status=? WHERE id=?`,
              [prodId, Number(item.rate || 0), newSize, item.unit || "PCS", item.status || "Active", itemId]
            );

            if (sizeDelta !== 0) {
              const [prodRows] = await connection.query(
                `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
                [prodId]
              );
              if (!prodRows.length) {
                await connection.query("ROLLBACK");
                return res.status(400).json({ error: `product ${prodId} not found` });
              }
              const curr = Number(prodRows[0].size || 0);
              const updated = curr + sizeDelta;
              if (!Number.isFinite(updated) || updated < 0) {
                await connection.query("ROLLBACK");
                return res.status(400).json({ error: `stock would go negative for product ${prodId}` });
              }
              await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), prodId]);
            }
          } else {
            await connection.query(
              `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES (?, ?, ?, ?, ?, ?)`,
              [id, prodId, Number(item.rate || 0), newSize, item.unit || "PCS", "Active"]
            );
            const [prodRows] = await connection.query(
              `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
              [prodId]
            );
            if (!prodRows.length) {
              await connection.query("ROLLBACK");
              return res.status(400).json({ error: `product ${prodId} not found` });
            }
            const curr = Number(prodRows[0].size || 0);
            const updated = curr + newSize;
            await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), prodId]);
          }
        }

        const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
        if (toDelete.length > 0) {
          for (const delId of toDelete) {
            const r = existingMap[delId];
            if (r) {
              const [prodRows] = await connection.query(
                `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
                [r.product_id]
              );
              if (prodRows.length) {
                const curr = Number(prodRows[0].size || 0);
                const updated = curr - Number(r.size || 0);
                if (updated < 0) {
                  await connection.query("ROLLBACK");
                  return res.status(400).json({ error: `stock would go negative for product ${r.product_id}` });
                }
                await connection.query(`UPDATE products SET size=? WHERE id=?`, [String(updated), r.product_id]);
              }
              await connection.query(`DELETE FROM purchase_items WHERE id = ?`, [delId]);
            }
          }
        }
      }

      // recompute total
      const newTotal = Array.isArray(items)
        ? items.reduce((s, it) => s + Number(it.rate || 0) * Number(it.size || 0), 0)
        : null;
      if (newTotal !== null) {
        await connection.query(`UPDATE purchases SET total_amount=? WHERE id=?`, [newTotal, id]);
      }

      await connection.query("COMMIT");
      res.json({ message: "Purchase updated successfully" });
    } catch (err) {
      await connection.query("ROLLBACK");
      console.error("Purchase update error:", err);
      res.status(400).json({ error: err.message || "Failed to update purchase" });
    }
  },

  // Get all purchases (show vendor or farmer name)
  getAll: async (_req, res) => {
    try {
      const connection = db.promise();
      const [purchases] = await connection.query(`
        SELECT 
          p.id, p.bill_no, p.bill_date, p.total_amount, p.status, p.party_type,
          v.vendor_name, v.firm_name, f.name AS farmer_name
        FROM purchases p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        LEFT JOIN farmers f ON p.farmer_id = f.id
        ORDER BY p.id DESC
      `);

      if (purchases.length === 0) return res.json([]);

      const purchaseIds = purchases.map((p) => p.id);
      const [items] = await connection.query(
        `
        SELECT pi.*, pr.product_name
        FROM purchase_items pi
        JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id IN (?)
      `,
        [purchaseIds]
      );

      const mapped = purchases.map((p) => {
        const party_name = p.party_type === 'vendor' ? p.vendor_name : p.farmer_name;
        return {
          ...p,
          party_name,
          items: items.filter(i => i.purchase_id === p.id),
        };
      });

      res.json(mapped);
    } catch (err) {
      console.error("GetAll purchases error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get one by id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const connection = db.promise();

      const [rows] = await connection.query(
        `
        SELECT p.*, v.vendor_name, v.firm_name, f.name AS farmer_name
        FROM purchases p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        LEFT JOIN farmers f ON p.farmer_id = f.id
        WHERE p.id = ?
      `,
        [id]
      );

      if (!rows.length) return res.status(404).json({ message: "Purchase not found" });

      const purchase = rows[0];
      const items = await PurchaseItem.findByPurchaseId(id);
      const party_name = purchase.party_type === 'vendor' ? purchase.vendor_name : purchase.farmer_name;

      res.json({ ...purchase, party_name, items });
    } catch (err) {
      console.error("GetById purchase error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = purchaseController;
