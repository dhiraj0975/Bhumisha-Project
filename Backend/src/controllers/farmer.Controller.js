const FarmerModel = require("../models/farmerModel");

// =================  Create =================
const createFarmer = (req, res) => {
  const {
    name,
    father_name,
    district,
    tehsil,
    patwari_halka,
    village,
    contact_number,
    khasara_number,
    bank,
    status
  } = req.body;

  FarmerModel.createFarmer(
    {
      name,
      father_name,
      district,
      tehsil,
      patwari_halka,
      village,
      contact_number,
      khasara_number,
      status: status || "active", // ✅ default active
    },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Farmer added successfully!" });
    }
  );
};

// =============== Read ==================
const getFarmers = (req, res) => {
  FarmerModel.getFarmers((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// =============== Update ==================
const updateFarmer = (req, res) => {
  const farmer_id = req.params.id;
  const {
    name,
    father_name,
    district,
    tehsil,
    patwari_halka,
    village,
    contact_number,
    khasara_number,
    bank,
    status
  } = req.body;

  FarmerModel.updateFarmer(
    farmer_id,
    {
      name,
      father_name,
      district,
      tehsil,
      patwari_halka,
      village,
      contact_number,
      khasara_number,
      status,
    },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Farmer updated successfully!" });
    }
  );
};

// =============== Delete ==================
const deleteFarmer = (req, res) => {
  const farmer_id = req.params.id;

  FarmerModel.deleteFarmer(farmer_id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Farmer deleted successfully!" });
  });
};

// =============== Update Status (Active/Inactive) ==================
const updateFarmerStatus = (req, res) => {
  const farmer_id = req.params.id;
  const { status } = req.body;

  // Convert to lowercase and validate
  const normalizedStatus = status.toLowerCase();
  if (!["active", "inactive"].includes(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  FarmerModel.updateFarmerStatus(farmer_id, normalizedStatus, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Farmer status updated to ${normalizedStatus}` });
  });
};

module.exports = {
  createFarmer,
  getFarmers,
  updateFarmer,
  deleteFarmer,
  updateFarmerStatus,
};
