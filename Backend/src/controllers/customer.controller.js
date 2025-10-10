// const Customer = require('../models/customer.model.js');

// const normalizeBooleans = (body) => ({
//   ...body,
//   add_gst: body.add_gst === true || body.add_gst === 1 || String(body.add_gst).toLowerCase() === "true" ? 1 : 0,
//   gst_percent: Number(body.gst_percent ?? 0),
// });

// const safeDate = (d, fallback) => {
//   const t = new Date(d);
//   return isNaN(t.getTime()) ? fallback : d;
// };
// const toInt = (v, d) => {
//   const n = parseInt(v, 10);
//   return Number.isFinite(n) && n > 0 ? n : d;
// };

// const CustomerController = {
//   // existing handlers...
//   getAll: (req, res) => {
//     Customer.getAll((err, customers) => {
//       if (err) return res.status(500).json({ message: "Failed to fetch customers" });
//       res.json(customers);
//     });
//   },

//   getById: (req, res) => {
//     const id = req.params.id;
//     Customer.getById(id, (err, customer) => {
//       if (err) return res.status(500).json({ message: "Failed to fetch customer" });
//       if (!customer) return res.status(404).json({ message: "Customer not found" });
//       res.json(customer);
//     });
//   },

//   create: (req, res) => {
//     const { name, email, phone, address, status, add_gst, balance, min_balance } = req.body;
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     if (email) {
//       return Customer.findByEmail(email, (err, existing) => {
//         if (err) return res.status(500).json({ message: "Database error while checking email" });
//         if (existing) return res.status(400).json({ message: "Email already exists" });
//         Customer.create(
//           normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
//           (err2, customer) => {
//             if (err2) return res.status(500).json({ message: "Failed to create customer" });
//             res.status(201).json(customer);
//           }
//         );
//       });
//     }

//     Customer.create(
//       normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
//       (err, customer) => {
//         if (err) return res.status(500).json({ message: "Failed to create customer" });
//         res.status(201).json(customer);
//       }
//     );
//   },

//   update: (req, res) => {
//     const id = req.params.id;
//     if (req.body.name !== undefined && !req.body.name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     const payload = normalizeBooleans(req.body);
//     Customer.update(id, payload, (err, affected) => {
//       if (err) return res.status(500).json({ message: "Failed to update customer" });
//       if (!affected) return res.status(404).json({ message: "Customer not found" });
//       res.json({ id, ...payload });
//     });
//   },

//   delete: (req, res) => {
//     const id = req.params.id;
//     Customer.delete(id, (err, affected) => {
//       if (err) return res.status(500).json({ message: "Failed to delete customer" });
//       if (!affected) return res.status(404).json({ message: "Customer not found" });
//       res.json({ message: "Customer deleted successfully" });
//     });
//   },

//   toggleStatus: (req, res) => {
//     const id = req.params.id;
//     const { currentStatus } = req.body;
//     Customer.toggleStatus(id, currentStatus, (err, newStatus) => {
//       if (err) return res.status(500).json({ message: "Failed to update status" });
//       res.json({ id, status: newStatus });
//     });
//   },

//   getBalance: (req, res) => {
//     const id = req.params.id;
//     if (!id) return res.status(400).json({ message: "Customer id required" });
//     Customer.getBalanceAggregate(id, (err, data) => {
//       if (err) return res.status(500).json({ message: "Failed to fetch balance" });
//       res.json({
//         customer_id: Number(id),
//         previous_due: Number(data?.previous_due || 0),
//         advance: Number(data?.advance || 0),
//       });
//     });
//   },

//   // ✅ NEW: Customer Statement (ledger with opening + running balance)
//   getStatement: (req, res) => {
//     const id = Number(req.params.id);
//     if (!id) return res.status(400).json({ message: "Customer id required" });

//     const now = new Date();
//     const defaultTo = now.toISOString().slice(0, 10);
//     const defaultFrom = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

//     const from = safeDate(req.query.from, defaultFrom);
//     const to = safeDate(req.query.to, defaultTo);

//     const page = toInt(req.query.page, 1);
//     const limit = Math.min(toInt(req.query.limit, 50), 200);
//     const offset = (page - 1) * limit;

//     const sort = String(req.query.sort || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

//     Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort }, (err, payload) => {
//       if (err) return res.status(500).json({ message: "Failed to fetch statement" });
//       res.json({
//         customer_id: id,
//         from,
//         to,
//         page,
//         limit,
//         rows: payload.rows,
//         totals: payload.totals,
//       });
//     });
//   },

//   // ✅ NEW: Customer Summary KPIs
//   getSummary: (req, res) => {
//     const id = Number(req.params.id);
//     if (!id) return res.status(400).json({ message: "Customer id required" });

//     const as_of = safeDate(req.query.as_of, new Date().toISOString().slice(0, 10));

//     Customer.getSummaryQuery({ customerId: id, as_of }, (err, data) => {
//       if (err) return res.status(500).json({ message: "Failed to fetch summary" });
//       res.json({ customer_id: id, as_of, ...data });
//     });
//   },
// };

// module.exports = CustomerController;






const Customer = require('../models/customer.model.js');
const PDFDocument = require('pdfkit');

const normalizeBooleans = (body) => ({
  ...body,
  add_gst: body.add_gst === true || body.add_gst === 1 || String(body.add_gst).toLowerCase() === "true" ? 1 : 0,
  gst_percent: Number(body.gst_percent ?? 0),
});

const safeDate = (d, fallback) => {
  const t = new Date(d);
  return isNaN(t.getTime()) ? fallback : d;
};
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const CustomerController = {
  getAll: (req, res) => {
    Customer.getAll((err, customers) => {
      if (err) return res.status(500).json({ message: "Failed to fetch customers" });
      res.json(customers);
    });
  },

  getById: (req, res) => {
    const id = req.params.id;
    Customer.getById(id, (err, customer) => {
      if (err) return res.status(500).json({ message: "Failed to fetch customer" });
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    });
  },

  create: (req, res) => {
    const { name, email, phone, address, status, add_gst, balance, min_balance } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    if (email) {
      return Customer.findByEmail(email, (err, existing) => {
        if (err) return res.status(500).json({ message: "Database error while checking email" });
        if (existing) return res.status(400).json({ message: "Email already exists" });
        Customer.create(
          normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
          (err2, customer) => {
            if (err2) return res.status(500).json({ message: "Failed to create customer" });
            res.status(201).json(customer);
          }
        );
      });
    }

    Customer.create(
      normalizeBooleans({ name, email, phone, address, status, add_gst, balance, min_balance }),
      (err, customer) => {
        if (err) return res.status(500).json({ message: "Failed to create customer" });
        res.status(201).json(customer);
      }
    );
  },

  update: (req, res) => {
    const id = req.params.id;
    if (req.body.name !== undefined && !req.body.name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const payload = normalizeBooleans(req.body);
    Customer.update(id, payload, (err, affected) => {
      if (err) return res.status(500).json({ message: "Failed to update customer" });
      if (!affected) return res.status(404).json({ message: "Customer not found" });
      res.json({ id, ...payload });
    });
  },

  delete: (req, res) => {
    const id = req.params.id;
    Customer.delete(id, (err, affected) => {
      if (err) return res.status(500).json({ message: "Failed to delete customer" });
      if (!affected) return res.status(404).json({ message: "Customer not found" });
      res.json({ message: "Customer deleted successfully" });
    });
  },

  toggleStatus: (req, res) => {
    const id = req.params.id;
    const { currentStatus } = req.body;
    Customer.toggleStatus(id, currentStatus, (err, newStatus) => {
      if (err) return res.status(500).json({ message: "Failed to update status" });
      res.json({ id, status: newStatus });
    });
  },

  getBalance: (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Customer id required" });
    Customer.getBalanceAggregate(id, (err, data) => {
      if (err) return res.status(500).json({ message: "Failed to fetch balance" });
      res.json({
        customer_id: Number(id),
        previous_due: Number(data?.previous_due || 0),
        advance: Number(data?.advance || 0),
      });
    });
  },

  // NEW Statement
  getStatement: (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Customer id required" });

    const now = new Date();
    const defaultTo = now.toISOString().slice(0, 10);
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const from = safeDate(req.query.from, defaultFrom);
    const to = safeDate(req.query.to, defaultTo);

    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 50), 200);
    const offset = (page - 1) * limit;

    const sort = String(req.query.sort || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort }, (err, payload) => {
      if (err) return res.status(500).json({ message: "Failed to fetch statement" });
      res.json({
        customer_id: id,
        from,
        to,
        page,
        limit,
        rows: payload.rows,
        totals: payload.totals,
      });
    });
  },

  // NEW Summary KPIs
  getSummary: (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Customer id required" });

    const as_of = safeDate(req.query.as_of, new Date().toISOString().slice(0, 10));

    Customer.getSummaryQuery({ customerId: id, as_of }, (err, data) => {
      if (err) return res.status(500).json({ message: "Failed to fetch summary" });
      res.json({ customer_id: id, as_of, ...data });
    });
  },

  exportStatementCSV: (req, res) => {
  const id = Number(req.params.id);
  const { from, to, sort = 'asc' } = req.query;
  const page = 1, limit = 100000, offset = 0; // export all within range
  Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort }, (err, payload) => {
    if (err) return res.status(500).send('Failed to export');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="customer_${id}_statement.csv"`);
    const rows = payload.rows || [];
    const header = ['tx_datetime','tx_type','ref_no','amount','net_effect','running_balance','payment_method','note'];
    res.write('\uFEFF'); // BOM
    res.write(header.join(',') + '\n');
    for (const r of rows) {
      const line = [
        r.tx_datetime,
        r.tx_type,
        r.ref_no,
        Number(r.amount).toFixed(2),
        Number(r.net_effect).toFixed(2),
        Number(r.running_balance).toFixed(2),
        r.payment_method || '',
        (r.note || '').replace(/\r?\n/g,' ').replace(/"/g,'""'),
      ].map(v => `"${String(v ?? '')}"`).join(',');
      res.write(line + '\n');
    }
    res.end();
  });
},



exportStatementPDF: (req, res) => {
  const id = Number(req.params.id);
  const { from, to, sort = 'asc' } = req.query;
  const page = 1, limit = 100000, offset = 0;
  Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort }, (err, payload) => {
    if (err) return res.status(500).send('Failed to export');
    const rows = payload.rows || [];
    const totals = payload.totals || {};
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="customer_${id}_statement.pdf"`);
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    doc.pipe(res);

    // Header
    doc.fontSize(14).text(`Customer Statement`, { align: 'center' });
    doc.moveDown(0.2).fontSize(10).text(`Customer ID: ${id} | From: ${from} | To: ${to}`, { align: 'center' });
    doc.moveDown();

    

    // KPIs
    const fmt = (n) => (Number(n || 0)).toFixed(2);
    doc.fontSize(10)
      .text(`Opening: ₹${fmt(totals.opening_balance)}  Total Invoiced: ₹${fmt(totals.total_invoiced)}  Total Paid: ₹${fmt(totals.total_paid)}  Outstanding: ₹${fmt(totals.outstanding_as_of || totals.outstanding_as_of_to)}  Payments: ${totals.payment_count || totals.payment_count_upto}`);
    doc.moveDown();


    


    // Table header
    const cols = ['Date/Time','Type','Ref No','Amount','Net Effect','Run Bal','Method','Remarks'];
    const widths = [90,45,70,60,60,60,60,170];
    let x = doc.page.margins.left, y = doc.y, i;
    doc.font('Helvetica-Bold');
    for (i=0;i<cols.length;i++) { doc.text(cols[i], x, y, { width: widths[i] }); x += widths[i]; }
    doc.moveDown(0.5).font('Helvetica');

    // Rows with pagination
    const lineHeight = 14;
    const pageHeight = doc.page.height - doc.page.margins.bottom;
    for (const r of rows) {
      if (doc.y + lineHeight > pageHeight) doc.addPage();
      x = doc.page.margins.left;
      const data = [
        r.tx_datetime, r.tx_type, r.ref_no,
        `₹${fmt(r.amount)}`, `₹${fmt(r.net_effect)}`, `₹${fmt(r.running_balance)}`,
        r.payment_method || '-', (r.note || '').slice(0,120),
      ];
      for (i=0;i<data.length;i++) { doc.text(String(data[i]), x, doc.y, { width: widths[i] }); x += widths[i]; }
      doc.moveDown(0.2);
    }

    doc.end();
  });
}


};

module.exports = CustomerController;
