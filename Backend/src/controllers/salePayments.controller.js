// controllers/salePayments.controller.js
const SalePayments = require('../models/salePayments.model');
const Sales = require('../models/sales.model');

const SalePaymentsController = {
  // Add a payment and auto-update sale.payment_status
  async addPayment(req, res) {
    try {
      const { sale_id, customer_id, payment_date, amount, method = 'Cash', remarks = null } = req.body;

      if (!sale_id || !customer_id || !payment_date || !amount || Number(amount) <= 0) {
        return res
          .status(400)
          .json({ error: 'sale_id, customer_id, payment_date and positive amount required' });
      }

      const result = await SalePayments.create({
        sale_id,
        customer_id,
        payment_date,
        amount,
        method,
        remarks,
      });

      // Model returns { sale_id, paid, due, payment_status }
      return res.status(201).json({ message: 'Payment recorded', ...result });
    } catch (err) {
      console.error('addPayment error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // List payments for a sale
  async getPaymentsBySale(req, res) {
    try {
      const sale_id = Number(req.params.sale_id);
      if (!sale_id) return res.status(400).json({ error: 'Invalid sale ID' });

      const rows = await SalePayments.listBySale(sale_id);
      return res.json(rows);
    } catch (err) {
      console.error('getPaymentsBySale error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // Delete a payment and recompute sale.payment_status
  async deletePayment(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid payment ID' });

      const result = await SalePayments.delete(id);
      if (!result?.affectedRows) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      return res.json({ message: 'Payment deleted' });
    } catch (err) {
      console.error('deletePayment error:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
  },

  // Customer ledger: sales with paid, pending and payments[] array
  async getCustomerLedger(req, res) {
    try {
      const customer_id = Number(req.params.customer_id);
      if (!customer_id) return res.status(400).json({ error: 'Invalid customer ID' });

      const sales = await Sales.getByCustomerId(customer_id);
      const payments = await SalePayments.getByCustomerId(customer_id); // Needs to exist in model

      let ledger = [];
      let totalSale = 0,
        totalPaid = 0,
        totalPending = 0;

      for (const sale of sales) {
        const salePayments = payments.filter((p) => p.sale_id === sale.id);
        const paidAmount = salePayments.reduce((a, p) => a + Number(p.amount || 0), 0);
        const pending = Math.max(Number(sale.total_amount || 0) - paidAmount, 0);

        totalSale += Number(sale.total_amount || 0);
        totalPaid += paidAmount;
        totalPending += pending;

        ledger.push({
          sale_id: sale.id,
          bill_no: sale.bill_no,
          date: sale.bill_date,
          total_amount: Number(sale.total_amount || 0),
          paid: paidAmount,
          pending,
          payments: salePayments,
        });
      }

      return res.json({ ledger, totalSale, totalPaid, totalPending });
    } catch (err) {
      console.error('getCustomerLedger error:', err);
      return res.status(500).json({ error: 'Failed to fetch customer ledger' });
    }
  },

  // Customer summary totals only
  async getCustomerSummary(req, res) {
    try {
      const customer_id = Number(req.params.customer_id);
      if (!customer_id) return res.status(400).json({ error: 'Invalid customer ID' });

      const sales = await Sales.getByCustomerId(customer_id);
      const payments = await SalePayments.getByCustomerId(customer_id);

      let totalSale = 0,
        totalPaid = 0,
        totalPending = 0;

      for (const sale of sales) {
        const paidAmount = payments
          .filter((p) => p.sale_id === sale.id)
          .reduce((a, p) => a + Number(p.amount || 0), 0);

        totalSale += Number(sale.total_amount || 0);
        totalPaid += paidAmount;
        totalPending += Math.max(Number(sale.total_amount || 0) - paidAmount, 0);
      }

      return res.json({ totalSale, totalPaid, totalPending });
    } catch (err) {
      console.error('getCustomerSummary error:', err);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
  },
};

module.exports = SalePaymentsController;
