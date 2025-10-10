// controllers/purchaseOrder.controller.js
const PurchaseOrder = require("../models/purchaseOrder.model");
const PurchaseOrderItem = require("../models/purchaseOrderItem.model");

// Numeric helpers
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// ✅ Helper: per-item calculation (percent-per-qty discount on rate)
const calculateItem = (item) => {
  const qty = toNum(item.qty);
  const rate = toNum(item.rate);
  const amount = qty * rate;

  const discountRatePerUnit = (rate * toNum(item.discount_per_qty)) / 100;
  const discount_total = discountRatePerUnit * qty;

  const taxable = amount - discount_total;
  const gst_amount = (taxable * toNum(item.gst_percent)) / 100;
  const final_amount = taxable + gst_amount;

  return {
    amount: Number(amount.toFixed(2)),
    discount_rate: Number(discountRatePerUnit.toFixed(2)),
    discount_total: Number(discount_total.toFixed(2)),
    gst_amount: Number(gst_amount.toFixed(2)),
    final_amount: Number(final_amount.toFixed(2)),
  };
};

const purchaseOrderController = {
  // ✅ Create Purchase Order with Items
  create: async (req, res) => {
    try {
      const {
        po_no,
        vendor_id,
        date,
        bill_time,
        address,
        mobile_no,
        gst_no,
        place_of_supply,
        terms_condition,
        items = [],
        status, // optional
      } = req.body;

      if (!vendor_id) return res.status(400).json({ error: "vendor_id is required" });
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items are required" });
      }

      // Compute totals
      let totalAmount = 0,
        totalGST = 0,
        finalAmount = 0;
      const computedItems = items.map((it) => {
        const calc = calculateItem(it);
        totalAmount += calc.amount - calc.discount_total;
        totalGST += calc.gst_amount;
        finalAmount += calc.final_amount;
        return { raw: it, calc };
      });

      // Create header
      const poData = {
        po_no,
        vendor_id: Number(vendor_id),
        date,
        bill_time,
        address,
        mobile_no,
        gst_no,
        place_of_supply,
        terms_condition,
        total_amount: Number(totalAmount.toFixed(2)),
        gst_amount: Number(totalGST.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        status: status || "Issued",
      };
      const headerResult = await PurchaseOrder.create(poData);
      const purchase_order_id = headerResult.insertId;

      // Insert items
      const createdItems = [];
      for (const { raw, calc } of computedItems) {
const itemData = {
  purchase_order_id,
  product_id: Number(raw.product_id),
  hsn_code: raw.hsn_code || "",
  qty: Number(raw.qty || 0),
  rate: Number(raw.rate || 0),
  discount_per_qty: Number(raw.discount_per_qty || 0),
  gst_percent: Number(raw.gst_percent || 0),
  status: raw.status || "Active",
};

        const itemResult = await PurchaseOrderItem.create(itemData);
        createdItems.push({ id: itemResult.insertId, ...itemData });
      }

      return res.status(201).json({
        message: "Purchase Order created successfully",
        purchase_order: {
          id: purchase_order_id,
          ...poData,
          items: createdItems,
          summary: {
            total_taxable: Number(totalAmount.toFixed(2)),
            total_gst: Number(totalGST.toFixed(2)),
            grand_total: Number(finalAmount.toFixed(2)),
          },
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  // ✅ Get All Purchase Orders (grouped with items + summary)
  getAll: async (_req, res) => {
    try {
      const poRows = await PurchaseOrder.getAllRaw();

      const poMap = {};
      for (const row of poRows) {
        const poId = row.purchase_order_id;
        if (!poMap[poId]) {
          poMap[poId] = {
            id: poId,
            po_no: row.po_no,
            vendor_name: row.vendor_name,
            date: row.date,
            bill_time: row.bill_time,
            address: row.address,
            mobile_no: row.mobile_no,
            gst_no: row.gst_no,
            place_of_supply: row.place_of_supply,
            terms_condition: row.terms_condition,
            status: row.status,
            items: [],
            summary: { total_taxable: 0, total_gst: 0, grand_total: 0 },
          };
        }

        // keep final_amount key for consistency across endpoints
        poMap[poId].items.push({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          hsn_code: row.hsn_code,
          qty: Number(row.qty),
          rate: Number(row.rate),
          amount: Number(row.amount),
          discount_per_qty: Number(row.discount_per_qty),
          discount_rate: Number(row.discount_rate),
          discount_total: Number(row.discount_total),
          gst_percent: Number(row.gst_percent),
          gst_amount: Number(row.item_gst),
          final_amount: Number(row.item_final),
        });

        poMap[poId].summary.total_taxable += Number(row.amount) - Number(row.discount_total);
        poMap[poId].summary.total_gst += Number(row.item_gst);
        poMap[poId].summary.grand_total += Number(row.item_final);
      }

      const pos = Object.values(poMap).map((po) => ({
        ...po,
        summary: {
          total_taxable: Number(po.summary.total_taxable.toFixed(2)),
          total_gst: Number(po.summary.total_gst.toFixed(2)),
          grand_total: Number(po.summary.grand_total.toFixed(2)),
        },
      }));

      return res.json(pos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  // ✅ Get Single Purchase Order with Items & Summary
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const poRows = await PurchaseOrder.getById(id);
      if (poRows.length === 0) return res.status(404).json({ message: "PO not found" });

      const itemRows = await PurchaseOrderItem.getByPOId(id);

      const summary = itemRows.reduce(
        (acc, item) => {
          acc.total_taxable += Number(item.amount) - Number(item.discount_total);
          acc.total_gst += Number(item.gst_amount);
          acc.grand_total += Number(item.final_amount);
          return acc;
        },
        { total_taxable: 0, total_gst: 0, grand_total: 0 }
      );

      return res.json({
        ...poRows[0],
        items: itemRows,
        summary: {
          total_taxable: Number(summary.total_taxable.toFixed(2)),
          total_gst: Number(summary.total_gst.toFixed(2)),
          grand_total: Number(summary.grand_total.toFixed(2)),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  // ✅ Delete Purchase Order with Items
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await PurchaseOrderItem.deleteByPOId(id);
      await PurchaseOrder.delete(id);
      return res.json({ message: "Purchase Order deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  // ✅ Generate Invoice payload from PO
  getInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const poRows = await PurchaseOrder.getById(id);
      if (poRows.length === 0) return res.status(404).json({ message: "PO not found" });

      const po = poRows[0];
      const items = await PurchaseOrderItem.getByPOId(id);

      const summary = items.reduce(
        (acc, item) => {
          acc.total_taxable += Number(item.amount) - Number(item.discount_total);
          acc.total_gst += Number(item.gst_amount);
          acc.grand_total += Number(item.final_amount);
          return acc;
        },
        { total_taxable: 0, total_gst: 0, grand_total: 0 }
      );

      return res.json({
        invoiceNo: `INV-${po.id}`,
        date: po.date,
        vendor: {
          // Name not joined in this header query; keep details from PO header
          name: undefined,
          address: po.address,
          gst_no: po.gst_no,
        },
        items,
        summary: {
          total_taxable: Number(summary.total_taxable.toFixed(2)),
          total_gst: Number(summary.total_gst.toFixed(2)),
          grand_total: Number(summary.grand_total.toFixed(2)),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  // ✅ Update Purchase Order & its Items (upsert)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        po_no,
        vendor_id,
        date,
        bill_time,
        address,
        mobile_no,
        gst_no,
        place_of_supply,
        terms_condition,
        status,
        items = [],
      } = req.body;

      if (!vendor_id) return res.status(400).json({ error: "vendor_id is required" });
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items are required" });
      }

      // Recalculate totals
      let totalAmount = 0,
        totalGST = 0,
        finalAmount = 0;
      const computed = items.map((it) => {
        const calc = calculateItem(it);
        totalAmount += calc.amount - calc.discount_total;
        totalGST += calc.gst_amount;
        finalAmount += calc.final_amount;
        return { raw: it, calc };
      });

      // Update header
      await PurchaseOrder.updateHeader(id, {
        po_no,
        vendor_id: Number(vendor_id),
        date,
        bill_time,
        address,
        mobile_no,
        gst_no,
        place_of_supply,
        terms_condition,
        total_amount: Number(totalAmount.toFixed(2)),
        gst_amount: Number(totalGST.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        status: status || "Issued",
      });

      // Upsert items
      for (const { raw, calc } of computed) {
const itemData = {
  product_id: Number(raw.product_id),
  hsn_code: raw.hsn_code || "",
  qty: Number(raw.qty || 0),
  rate: Number(raw.rate || 0),
  discount_per_qty: Number(raw.discount_per_qty || 0),
  gst_percent: Number(raw.gst_percent || 0),
  status: raw.status || "Active",
};

        if (raw.id) {
          await PurchaseOrderItem.update(raw.id, itemData);
        } else {
          await PurchaseOrderItem.create({ purchase_order_id: id, ...itemData });
        }
      }

      return res.json({ message: "Purchase Order updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = purchaseOrderController;
