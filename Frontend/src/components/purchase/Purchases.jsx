import React, { useState } from "react";
import PurchaseForm from "./PurchaseForm";
import PurchaseList from "./PurchaseList";

export default function Purchases() {
  const [reloadFlag, setReloadFlag] = useState(0);

  const handlePurchaseSaved = () => {
    setReloadFlag((prev) => prev + 1);
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 bg-white p-3 shadow-md">Manage Purchases</h1>
      
      {/* Purchase Form */}
      <div className="mb-10">
        <PurchaseForm onSaved={handlePurchaseSaved} />
      </div>

      {/* Purchase List */}
      <div>
        <PurchaseList reload={reloadFlag} />
      </div>
    </div>
  );
}
