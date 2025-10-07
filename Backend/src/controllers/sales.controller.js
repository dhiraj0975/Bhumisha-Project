// controllers/sales.controller.js
const Sales = require('../models/sales.model');
const SaleItems = require('../models/saleItems.model');

const SalesController = {
  // Create sale with items
  async createSale(req, res) {
    try {
      const {
        customer_id,
        bill_no,
        bill_date,
        items,
        status = 'Active',
        payment_status = 'Unpaid',
        payment_method = 'Cash',
        remarks = null,
      } = req.body;

      if (!customer_id || !bill_date || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: 'Customer, bill_date and items[] required' });
      }

      const result = await Sales.create({
        customer_id,
        bill_no,
        bill_date,
        status,
        payment_status,
        payment_method,
        remarks,
        items,
      });

      return res.status(201).json({
        message: 'Sale created successfully',
        id: result.id,
        bill_no: result.bill_no,
        total_taxable: result.total_taxable,
        total_gst: result.total_gst,
        total_amount: result.total_amount,
      });
    } catch (err) {
      console.error('createSale error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // List all sales (lightweight)
  async getSales(req, res) {
    try {
      const sales = await Sales.getAll();
      return res.json(sales);
    } catch (err) {
      console.error('getSales error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // Get single sale with items
  async getSaleByIdWithItems(req, res) {
    try {
      const sale_id = Number(req.params.id);
      if (!sale_id) return res.status(400).json({ error: 'Invalid sale ID' });

      const sale = await Sales.getById(sale_id);
      if (!sale) return res.status(404).json({ error: 'Sale not found' });

      const items = await SaleItems.getBySaleId(sale_id);
      return res.json({ ...sale, items });
    } catch (err) {
      console.error('getSaleByIdWithItems error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // Update sale + optionally replace items
  async updateSale(req, res) {
    try {
      const sale_id = Number(req.params.id);
      if (!sale_id) return res.status(400).json({ error: 'Invalid sale ID' });

      let {
        customer_id,
        bill_no = null,
        bill_date = null,
        items,
        status,
        payment_status,
        payment_method,
        remarks,
      } = req.body;

      // Minimum guards for header-level required fields
      if (!customer_id) return res.status(400).json({ error: 'Customer ID is required' });
      if (!bill_date) return res.status(400).json({ error: 'Bill date is required' });

      // 1) If items provided, replace and compute totals first
      let totals = { total_taxable: undefined, total_gst: undefined, total_amount: undefined };
      if (Array.isArray(items)) {
        await SaleItems.deleteBySaleId(sale_id);
        totals = await SaleItems.createBulk(sale_id, items);
      }

      // 2) Single-pass header + payment + totals update to avoid overwrites
      const result = await Sales.update(sale_id, {
        customer_id,
        bill_no,
        bill_date,
        status,
        payment_status,
        payment_method,
        remarks,
        // If items not provided, leave totals undefined; model should preserve existing
        total_taxable: totals.total_taxable,
        total_gst: totals.total_gst,
        total_amount: totals.total_amount,
        // Signal model not to re-handle items
        items: undefined,
      });

      return res.json({
        message: 'Sale updated successfully',
        total_taxable: totals.total_taxable ?? result.total_taxable,
        total_gst: totals.total_gst ?? result.total_gst,
        total_amount: totals.total_amount ?? result.total_amount,
      });
    } catch (err) {
      console.error('updateSale error:', err);
      return res.status(500).json({ error: err.message || 'Server Error' });
    }
  },

  // Delete sale
  async deleteSale(req, res) {
    try {
      const sale_id = Number(req.params.id);
      if (!sale_id) return res.status(400).json({ error: 'Invalid sale ID' });

      await Sales.delete(sale_id);
      return res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
      console.error('deleteSale error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // Get next bill number
  async getNewBillNo(req, res) {
    try {
      const bill_no = await Sales.getNewBillNo();
      return res.json({ bill_no });
    } catch (err) {
      console.error('getNewBillNo error:', err);
      return res.status(500).json({ error: err.message });
    }
  },

  // List all sales with items embedded
  async getAllSalesWithItems(req, res) {
    try {
      const sales = await Sales.getAll();
      const withItems = await Promise.all(
        sales.map(async (s) => {
          const items = await SaleItems.getBySaleId(s.id);
          return { ...s, items };
        })
      );
      return res.json(withItems);
    } catch (err) {
      console.error('getAllSalesWithItems error:', err);
      return res.status(500).json({ error: 'Failed to fetch sales' });
    }
  },
};

module.exports = SalesController;
