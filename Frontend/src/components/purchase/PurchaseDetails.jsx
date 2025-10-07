import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PurchaseAPI from "../../axios/purchaseApi";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseDetails() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await PurchaseAPI.getById(purchaseId);
        setPurchase(res.data);
      } catch (err) {
        console.error("Failed to fetch purchase details", err);
        alert("Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [purchaseId]);

  if (loading) return <div className="p-6">Loading purchase details...</div>;
  if (!purchase) return <div className="p-6">No purchase found.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Purchase Details - Bill No: {purchase.bill_no}</h1>

      <div className="mb-4">
        <strong>Vendor:</strong> {purchase.vendor_name || purchase.vendor_id}
      </div>
      <div className="mb-4">
        <strong>Date:</strong> {new Date(purchase.bill_date).toLocaleDateString()}
      </div>
      <div className="mb-4">
        <strong>Address:</strong> {purchase.address}
      </div>
      <div className="mb-4">
        <strong>Mobile No:</strong> {purchase.mobile_no}
      </div>
      <div className="mb-4">
        <strong>GST No:</strong> {purchase.gst_no}
      </div>
      <div className="mb-4">
        <strong>Terms & Conditions:</strong> {purchase.terms_condition || "N/A"}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Items</h2>

      <table className="w-full border text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="border px-2 py-1">SI</th>
            <th className="border px-2 py-1">Item Name</th>
            <th className="border px-2 py-1">HSNCode</th>
            <th className="border px-2 py-1">Size</th>
            <th className="border px-2 py-1">Rate</th>
            <th className="border px-2 py-1">Discount %</th>
            <th className="border px-2 py-1">GST %</th>
            <th className="border px-2 py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchase.items?.map((item, idx) => {
            const base = (item.size || 0) * (item.rate || 0);
            const discAmt = (base * (item.d1_percent || 0)) / 100;
            const taxable = base - discAmt;
            const gstAmt = (taxable * (item.gst_percent || 0)) / 100;
            const finalAmt = taxable + gstAmt;

            return (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{item.item_name || item.product_name}</td>
                <td className="border px-2 py-1">{item.hsn_code}</td>
                <td className="border px-2 py-1">{item.size}</td>
                <td className="border px-2 py-1">{fx(item.rate)}</td>
                <td className="border px-2 py-1">{fx(item.d1_percent)}</td>
                <td className="border px-2 py-1">{fx(item.gst_percent)}</td>
                <td className="border px-2 py-1">{fx(finalAmt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 font-semibold text-lg">
        Total Amount: {fx(purchase.summary?.final || purchase.total_amount)}
      </div>
    </div>
  );
}
