import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseAPI from "../../axios/purchaseApi";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseList({ reload }) {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch list
  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await PurchaseAPI.getAll();
        setPurchases(res.data || []);
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [reload]); // Now reloads properly

 

  if (loading) return <div className="p-6">Loading purchases...</div>;

  // Fullscreen Details View
  // Purchase List View
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 p-3 bg-white shadow-md">Purchases List</h1>

      <table className="w-full border text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="border px-2 py-1">Bill No</th>
            <th className="border px-2 py-1">Vendor</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Total Amount</th>
            <th className="border px-2 py-1">Details</th>
            <th className="border px-2 py-1">Update</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="odd:bg-white even:bg-gray-50">
              <td className="border px-2 py-1">{p.bill_no || "N/A"}</td>
              <td className="border px-2 py-1">{p.vendor_name || p.vendor_id || "N/A"}</td>
              <td className="border px-2 py-1">{p.bill_date ? new Date(p.bill_date).toLocaleDateString() : "N/A"}</td>
              <td className="border px-2 py-1">{fx(p.total_amount)}</td>
              <td className="border px-2 py-1">
                <button
                  className="text-blue-600 underline"
                  onClick={() => navigate(`/purchases/view/${p.id}`)}
                >
                  Details
                </button>
              </td>
              <td className="border px-2 py-1">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => navigate(`/purchases/edit/${p.id}`)}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
