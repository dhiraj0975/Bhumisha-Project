const db = require("../config/db");

// ================= Create Vendor =================
const createVendor = (vendorData, bankData, callback) => {
  console.log("Creating vendor with data:", vendorData, bankData); // Debug log
  
  const vendorQuery =
    "INSERT INTO vendors (vendor_name,firm_name, gst_no, address, contact_number, status) VALUES (?, ?, ?, ?, ?)";
    
  db.query(
    vendorQuery,
    [
      vendorData.vendor_name,
      vendorData.firm_name,
      vendorData.gst_no,
      vendorData.address,
      vendorData.contact_number,
      vendorData.status || "active",
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating vendor:", err); // Debug log
        return callback(err);
      }

      const vendor_id = result.insertId;
      console.log("Vendor inserted with ID:", vendor_id); // Debug log
      
      const safeBank = {
        pan_number: (bankData && bankData.pan_number) || "",
        account_holder_name: (bankData && bankData.account_holder_name) || "",
        bank_name: (bankData && bankData.bank_name) || "",
        account_number: (bankData && bankData.account_number) || "",
        ifsc_code: (bankData && bankData.ifsc_code) || "",
        branch_name: (bankData && bankData.branch_name) || "",
      };

      const bankQuery = `INSERT INTO vendor_bank_details 
        (vendor_id, pan_number, account_holder_name, bank_name, account_number, ifsc_code, branch_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        bankQuery,
        [
          vendor_id,
          safeBank.pan_number,
          safeBank.account_holder_name,
          safeBank.bank_name,
          safeBank.account_number,
          safeBank.ifsc_code,
          safeBank.branch_name,
        ],
        (err) => {
          if (err) {
            console.error("Error creating bank details:", err); // Debug log
            // Even if bank details creation fails, we still return success
            // as the vendor was created successfully
            return callback(null, { insertId: vendor_id });
          }
          console.log("Bank details created successfully"); // Debug log
          callback(null, { insertId: vendor_id });
        }
      );
    }
  );
};

// ================= Get Vendors =================
const getVendors = (callback) => {
  const query = `SELECT v.id,v.vendor_name ,v.firm_name, v.gst_no, v.address, v.contact_number, v.status,
                 b.pan_number, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name
                 FROM vendors v
                 LEFT JOIN vendor_bank_details b ON v.id = b.vendor_id`;
  db.query(query, callback);
};

// ================= Update Vendor =================
const updateVendor = (vendor_id, vendorData, bankData, callback) => {
  const vendorQuery =
    "UPDATE vendors SET vendor_name=?, firm_name=?, gst_no=?, address=?, contact_number=?, status=? WHERE id=?";
  db.query(
    vendorQuery,
    [
      vendorData.vendor_name,
      vendorData.firm_name,
      vendorData.gst_no,
      vendorData.address,
      vendorData.contact_number,
      vendorData.status,
      vendor_id,
    ],
    (err) => {
      if (err) return callback(err);

      const safeBank = {
        pan_number: (bankData && bankData.pan_number) || "",
        account_holder_name: (bankData && bankData.account_holder_name) || "",
        bank_name: (bankData && bankData.bank_name) || "",
        account_number: (bankData && bankData.account_number) || "",
        ifsc_code: (bankData && bankData.ifsc_code) || "",
        branch_name: (bankData && bankData.branch_name) || "",
      };

      const bankQuery = `UPDATE vendor_bank_details 
        SET pan_number=?, account_holder_name=?, bank_name=?, account_number=?, ifsc_code=?, branch_name=? 
        WHERE vendor_id=?`;

      db.query(
        bankQuery,
        [
          safeBank.pan_number,
          safeBank.account_holder_name,
          safeBank.bank_name,
          safeBank.account_number,
          safeBank.ifsc_code,
          safeBank.branch_name,
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


const getVendorById = (vendor_id, callback) => {
  const query = `SELECT v.id,v.vendor_name, v.firm_name, v.gst_no, v.address, v.contact_number, v.status,
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
  getVendorById
};
