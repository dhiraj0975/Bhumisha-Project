const VendorModel = require("../models/vendorModel");

// =================  Create =================
// const createVendor = (req, res) => {
//   const { firm_name, gst_no, address, contact_number, bank, status } = req.body;

//   VendorModel.createVendor(
//     { firm_name, gst_no, address, contact_number, status },
//     bank,
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Vendor added successfully!" });
//     }
//   );
// };

const createVendor = (req, res) => {
  try {
    const { vendor_name, firm_name, gst_no, address, contact_number, bank, status } = req.body;
    console.log("Received vendor data:", req.body); // Debug log

    VendorModel.createVendor(
      {vendor_name, firm_name, gst_no, address, contact_number, status },
      bank,
      (err, result) => {
        if (err) {
          console.error("Error in createVendor:", err); // Debug log
          return res.status(500).json({ error: err.message });
        }
        
        console.log("Vendor created with ID:", result.insertId); // Debug log
        
        // Get the newly created vendor with bank details
        VendorModel.getVendorById(result.insertId, (err, vendor) => {
          if (err) {
            console.error("Error fetching created vendor:", err); // Debug log
            // Even if we can't fetch the vendor details, we still return success
            // with the basic information we have
            return res.status(201).json({
              message: "Vendor added successfully!",
              vendor: {
                id: result.insertId,
                vendor_name,
                firm_name,
                gst_no,
                address,
                contact_number,
                status,
                bank
              }
            });
          }
          
          // If vendor is null, still return success with basic info
          if (!vendor) {
            console.log("Vendor not found after creation, using basic info");
            return res.status(201).json({
              message: "Vendor added successfully!",
              vendor: {
                id: result.insertId,
                vendor_name,
                firm_name,
                gst_no,
                address,
                contact_number,
                status,
                bank
              }
            });
          }
          
          console.log("Vendor created successfully:", vendor); // Debug log
          res.status(201).json({
            message: "Vendor added successfully!",
            vendor: vendor
          });
        });
      }
    );
  } catch (error) {
    console.error("Unexpected error in createVendor:", error); // Debug log
    res.status(500).json({ error: error.message });
  }
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
  const {vendor_name, firm_name, gst_no, address, contact_number, bank, status } = req.body;

  VendorModel.updateVendor(
    vendor_id,
    {vendor_name, firm_name, gst_no, address, contact_number, status },
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

  // Convert to lowercase and validate
  const normalizedStatus = status.toLowerCase();
  if (!["active", "inactive"].includes(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  VendorModel.updateVendorStatus(vendor_id, normalizedStatus, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Vendor status updated to ${normalizedStatus}` });
  });
};

const getVendorById = (vendor_id, callback) => {
  const query = `SELECT v.id,v.vendor_name, v.firm_name, v.gst_no, v.address, v.contact_number, v.status,
                 b.pan_number, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name
                 FROM vendors v
                 LEFT JOIN vendor_bank_details b ON v.id = b.vendor_id
                 WHERE v.id = ?`;
  db.query(query, [vendor_id], (err, results) => {
    if (err) {
      console.error("Error in getVendorById:", err);
      return callback(err);
    }
    
    // Check if we got any results
    if (results.length === 0) {
      console.log("No vendor found with ID:", vendor_id);
      return callback(null, null);
    }
    
    // Return the first result (should be only one)
    callback(null, results[0]);
  });
};

module.exports = {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,
  updateVendorStatus, 
  getVendorById
};
