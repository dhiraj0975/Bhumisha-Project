import React from "react";
import PurchaseForm from "./PurchaseForm";
import PurchaseList from "./PurchaseList";

export default function Purchases() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage Purchases</h1>
      
      {/* Purchase Form */}
      <div className="mb-10">
        <PurchaseForm />
      </div>

      {/* Purchase List */}
      <div>
        <PurchaseList />
      </div>
    </div>
  );
}
