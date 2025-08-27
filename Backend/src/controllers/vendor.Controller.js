const VendorModel = require("../models/vendorModel");

// =================  Create =================
const createVendor = (req, res) => {
  const { firm_name, gst_no, address, contact_number, bank, status } = req.body;

  VendorModel.createVendor(
    { firm_name, gst_no, address, contact_number, status },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Vendor added successfully!" });
    }
  );
};

// =============== Read ==================
const getVendors = (req, res) => {
  VendorModel.getVendors((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// =============== Update ==================
const updateVendor = (req, res) => {
  const vendor_id = req.params.id;
  const { firm_name, gst_no, address, contact_number, bank, status } = req.body;

  VendorModel.updateVendor(
    vendor_id,
    { firm_name, gst_no, address, contact_number, status },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Vendor updated successfully!" });
    }
  );
};

// =============== Delete ==================
const deleteVendor = (req, res) => {
  const vendor_id = req.params.id;

  VendorModel.deleteVendor(vendor_id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Vendor deleted successfully!" });
  });
};

// =============== Update Status (Active/Inactive) ==================
const updateVendorStatus = (req, res) => {
  const vendor_id = req.params.id;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  VendorModel.updateVendorStatus(vendor_id, status, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Vendor status updated to ${status}` });
  });
};

module.exports = {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,
  updateVendorStatus, 
};
