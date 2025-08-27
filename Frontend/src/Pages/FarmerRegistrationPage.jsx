import React, { useState } from "react";
import FarmerRegistrationForm from "../components/Farmer/FarmerRegistrationForm";
import FarmerList from "../components/Farmer/FarmerList";
// import FarmerRegistrationForm from "../components/FarmerRegistrationForm";
// import FarmerList from "../components/FarmerList";

export default function FarmerRegistrationPage() {
  const [activeTab, setActiveTab] = useState("form");
  const [farmers, setFarmers] = useState([
    {
      id: 1,
      name: "Ramesh Kumar",
      fatherName: "Suresh Kumar",
      district: "Bhopal",
      tehsil: "Huzur",
      halka: "Halka-1",
      village: "Sehore",
      contact: "9876543210",
      khasara: "12345",
    },
    {
      id: 2,
      name: "Sita Ram",
      fatherName: "Mohan Lal",
      district: "Indore",
      tehsil: "Depalpur",
      halka: "Halka-3",
      village: "Rajgarh",
      contact: "9123456789",
      khasara: "67890",
    },
  ]);

  const addFarmer = (newFarmer) => {
    setFarmers([...farmers, newFarmer]);
    setActiveTab("list");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "form" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Farmer Registration
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Farmer List
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "form" ? (
        <FarmerRegistrationForm onAddFarmer={addFarmer} />
      ) : (
        <FarmerList farmers={farmers} />
      )}
    </div>
  );
}
