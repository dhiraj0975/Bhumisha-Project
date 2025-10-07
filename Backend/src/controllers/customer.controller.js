const Customer = require('../models/customer.model.js');

const CustomerController = {
  // 1️⃣ Get all customers
  getAll: (req, res) => {
    Customer.getAll((err, customers) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch customers" });
      }
      res.json(customers);
    });
  },

  // 2️⃣ Get customer by ID
  getById: (req, res) => {
    const id = req.params.id;
    Customer.getById(id, (err, customer) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch customer" });
      }
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    });
  },

  // 3️⃣ Create new customer
// 3️⃣ Create new customer
create: (req, res) => {
  const { name, email, phone, address, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  // 🔹 Step 1: Check if email already exists
  Customer.findByEmail(email, (err, existingCustomer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error while checking email" });
    }

    if (existingCustomer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 Step 2: If not found, create new customer
    Customer.create({ name, email, phone, address, status }, (err, customer) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create customer" });
      }
      res.status(201).json(customer);
    });
  });
},


  // 4️⃣ Update customer
  update: (req, res) => {
    const id = req.params.id;
    if (!req.body.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    Customer.update(id, req.body, (err, affectedRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update customer" });
      }
      if (!affectedRows) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ id, ...req.body });
    });
  },

  // 5️⃣ Delete customer
  delete: (req, res) => {
    const id = req.params.id;

    Customer.delete(id, (err, affectedRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete customer" });
      }
      if (!affectedRows) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    });
  },

  // 6️⃣ Toggle status (Active/Inactive)
  toggleStatus: (req, res) => {
    const id = req.params.id;
    const { currentStatus } = req.body;

    Customer.toggleStatus(id, currentStatus, (err, newStatus) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update status" });
      }
      res.json({ id, status: newStatus });
    });
  },
};

module.exports = CustomerController;
