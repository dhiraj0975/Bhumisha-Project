// src/components/Farmers/FarmerRegister.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addFarmer, updateFarmer } from "../../features/farmers/farmerSlice";

export default function FarmerRegister({ selectedFarmer, onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    district: "",
    tehsil: "",
    patwari_halka: "",
    village: "",
    contact_number: "",
    khasara_number: "",
    // bank: "",
    status: "active",
  });

  // ✅ Jab edit mode me ho, form ko pre-fill kar do
  useEffect(() => {
    if (selectedFarmer) {
      setFormData(selectedFarmer);
    }
  }, [selectedFarmer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedFarmer) {
      // ✅ Update mode
      dispatch(updateFarmer({ id: selectedFarmer.id, data: formData }));
    } else {
      // ✅ Add mode
      dispatch(addFarmer(formData));
    }

    // Reset form & close modal/page
    setFormData({
      name: "",
      father_name: "",
      district: "",
      tehsil: "",
      patwari_halka: "",
      village: "",
      contact_number: "",
      khasara_number: "",
    
      status: "active",
    });
    if (onClose) onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-xl p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-4">
        {selectedFarmer ? "Update Farmer" : "Register Farmer"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.keys(formData).map((field) => {
          if (field === "status") {
            return (
              <select
                key={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="border p-2 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            );
          }
          return (
            <input
              key={field}
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              className="border p-2 rounded-lg"
            />
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {selectedFarmer ? "Update" : "Register"}
      </button>
    </form>
  );
}
