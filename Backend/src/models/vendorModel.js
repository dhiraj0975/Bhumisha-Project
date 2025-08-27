const db = require("../config/db");

// ================= Create Vendor =================
const createVendor = (vendorData, bankData, callback) => {
  const vendorQuery =
    "INSERT INTO vendors (firm_name, gst_no, address, contact_number, status) VALUES (?, ?, ?, ?, ?)";
  db.query(
    vendorQuery,
    [
      vendorData.firm_name,
      vendorData.gst_no,
      vendorData.address,
      vendorData.contact_number,
      vendorData.status || "active",
    ],
    (err, result) => {
      if (err) return callback(err);

      const vendor_id = result.insertId;
      const bankQuery = `INSERT INTO vendor_bank_details 
        (vendor_id, pan_number, account_holder_name, bank_name, account_number, ifsc_code, branch_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        bankQuery,
        [
          vendor_id,
          bankData.pan_number,
          bankData.account_holder_name,
          bankData.bank_name,
          bankData.account_number,
          bankData.ifsc_code,
          bankData.branch_name,
        ],
        (bankErr) => {
          if (bankErr) return callback(bankErr);
          callback(null, vendor_id);
        }
      );
    }
  );
};

// ================= Get Vendors =================
const getVendors = (callback) => {
  const query = `SELECT v.id, v.firm_name, v.gst_no, v.address, v.contact_number, v.status,
                 b.pan_number, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name
                 FROM vendors v
                 LEFT JOIN vendor_bank_details b ON v.id = b.vendor_id`;
  db.query(query, callback);
};

// ================= Update Vendor =================
const updateVendor = (vendor_id, vendorData, bankData, callback) => {
  const vendorQuery =
    "UPDATE vendors SET firm_name=?, gst_no=?, address=?, contact_number=?, status=? WHERE id=?";
  db.query(
    vendorQuery,
    [
      vendorData.firm_name,
      vendorData.gst_no,
      vendorData.address,
      vendorData.contact_number,
      vendorData.status,
      vendor_id,
    ],
    (err) => {
      if (err) return callback(err);

      const bankQuery = `UPDATE vendor_bank_details 
        SET pan_number=?, account_holder_name=?, bank_name=?, account_number=?, ifsc_code=?, branch_name=? 
        WHERE vendor_id=?`;

      db.query(
        bankQuery,
        [
          bankData.pan_number,
          bankData.account_holder_name,
          bankData.bank_name,
          bankData.account_number,
          bankData.ifsc_code,
          bankData.branch_name,
          vendor_id,
        ],
        callback
      );
    }
  );
};

// ================= Delete Vendor =================
const deleteVendor = (vendor_id, callback) => {
  const query = "DELETE FROM vendors WHERE id=?";
  db.query(query, [vendor_id], callback);
};

// ================= Update Status Only =================
const updateVendorStatus = (vendor_id, status, callback) => {
  const query = "UPDATE vendors SET status=? WHERE id=?";
  db.query(query, [status, vendor_id], callback);
};

// ================= Get Single Vendor By Id (with bank) =================
const getVendorById = (vendor_id, callback) => {
  const query = `SELECT v.id, v.firm_name, v.gst_no, v.address, v.contact_number, v.status,
                 b.pan_number, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name
                 FROM vendors v
                 LEFT JOIN vendor_bank_details b ON v.id = b.vendor_id
                 WHERE v.id = ?`;
  db.query(query, [vendor_id], callback);
};

module.exports = {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  getVendorById,
};
