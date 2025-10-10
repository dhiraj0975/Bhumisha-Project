const express = require('express');
const customerRouter = express.Router();
const CustomerController = require('../controllers/customer.controller');

// CRUD
customerRouter.get('/', CustomerController.getAll);
customerRouter.get('/:id', CustomerController.getById);
customerRouter.post('/', CustomerController.create);
customerRouter.put('/:id', CustomerController.update);
customerRouter.delete('/:id', CustomerController.delete);

// Balance (aggregate)
customerRouter.get('/:id/balance', CustomerController.getBalance);

// Toggle status
customerRouter.put('/:id/toggle-status', CustomerController.toggleStatus);

// NEW: Statement (ledger with opening + running balance + AM/PM)
customerRouter.get('/:id/statement', CustomerController.getStatement);

// NEW: Summary KPIs
customerRouter.get('/:id/summary', CustomerController.getSummary);
customerRouter.get('/:id/statement.csv', CustomerController.exportStatementCSV);
customerRouter.get('/:id/statement.pdf', CustomerController.exportStatementPDF);


module.exports = customerRouter;
