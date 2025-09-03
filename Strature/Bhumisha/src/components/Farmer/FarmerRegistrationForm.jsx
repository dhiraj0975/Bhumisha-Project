import React, { useState } from "react";

export default function FarmerRegistrationForm({ onAddFarmer }) {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    district: "",
    tehsil: "",
    halka: "",
    village: "",
    contact: "",
    khasara: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.fatherName) {
      onAddFarmer({ ...formData, id: Date.now() });
      setFormData({
        name: "",
        fatherName: "",
        district: "",
        tehsil: "",
        halka: "",
        village: "",
        contact: "",
        khasara: "",
      });
    }
  };

  return (
    <form
      className="bg-white shadow-lg rounded-xl p-6 space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-bold mb-4">Farmer Registration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Farmer Name"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="fatherName"
          value={formData.fatherName}
          placeholder="Father Name"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="district"
          value={formData.district}
          placeholder="District"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="tehsil"
          value={formData.tehsil}
          placeholder="Tehsil"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="halka"
          value={formData.halka}
          placeholder="Patwari Halka"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="village"
          value={formData.village}
          placeholder="Village"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="contact"
          value={formData.contact}
          placeholder="Contact Number"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="khasara"
          value={formData.khasara}
          placeholder="Khasara Number"
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Register Farmer
      </button>
    </form>
  );
}
