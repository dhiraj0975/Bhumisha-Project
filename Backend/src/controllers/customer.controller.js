
const Customer = require('../models/customer.model.js');

const normalizeBooleans = (body) => ({
  ...body,
  add_gst: body.add_gst === true || body.add_gst === 1 || String(body.add_gst).toLowerCase() === "true" ? 1 : 0,
  gst_percent: Number(body.gst_percent ?? 0),
});


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

  // 3️⃣ Create new customer (supports new fields)
  create: (req, res) => {
    const { name, email, phone, address, status, add_gst, balance, min_balance } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // optional email check only if email provided
    if (email) {
      return Customer.findByEmail(email, (err, existingCustomer) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error while checking email" });
        }
        if (existingCustomer) {
          return res.status(400).json({ message: "Email already exists" });
        }
        Customer.create(
          normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
          (err2, customer) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({ message: "Failed to create customer" });
            }
            res.status(201).json(customer);
          }
        );
      });
    }

    // if email not provided, just create
    Customer.create(
      normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
      (err, customer) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to create customer" });
        }
        res.status(201).json(customer);
      }
    );
  },

  // 4️⃣ Update customer (partial, supports new fields)
  update: (req, res) => {
    const id = req.params.id;
    if (req.body.name !== undefined && !req.body.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const payload = normalizeBooleans(req.body);

    Customer.update(id, payload, (err, affectedRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update customer" });
      }
      if (!affectedRows) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ id, ...payload });
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
  // 7️⃣ Get customer balance (previous due)
getBalance: (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: "Customer id required" });

  Customer.getBalanceAggregate(id, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch balance" });
    }
    // shape: { previous_due: number, advance: number }
    res.json({
      customer_id: Number(id),
      previous_due: Number(data?.previous_due || 0),
      advance: Number(data?.advance || 0),
    });
  });
},

};

module.exports = CustomerController;
 