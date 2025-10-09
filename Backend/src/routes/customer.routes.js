const express = require('express');
const customerRouter = express.Router();
const CustomerController = require('../controllers/customer.controller');

// ✅ CRUD routes
customerRouter.get('/', CustomerController.getAll );        // GET all customers
customerRouter.get('/:id', CustomerController.getById);    // GET customer by ID
customerRouter.post('/', CustomerController.create);       // CREATE customer
customerRouter.put('/:id', CustomerController.update);     // UPDATE customer
customerRouter.delete('/:id', CustomerController.delete);  // DELETE customer
// ✅ Customer balance (previous due)
customerRouter.get('/:id/balance', CustomerController.getBalance);


// ✅ Toggle status route
customerRouter.put('/:id/toggle-status', CustomerController.toggleStatus); // Toggle Active/Inactive

module.exports = customerRouter;
