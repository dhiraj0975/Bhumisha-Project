import React, { useEffect, useState } from "react";
import PurchaseAPI from "../../axios/purchaseApi";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseList({ reload }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  // Fetch one purchase details
  const showDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await PurchaseAPI.getById(id);
      console.log("Purchase details:", res.data); // Debug
      setSelectedPurchase(res.data || null);
    } catch (err) {
      alert("Failed to load purchase details");
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading purchases...</div>;

  // Fullscreen Details View
  if (selectedPurchase) {
    const p = selectedPurchase;

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <button
          onClick={() => setSelectedPurchase(null)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          ← Back to Purchases
        </button>

        <h1 className="text-3xl font-bold mb-6">
          Purchase Details - Bill No: {p.bill_no || "N/A"}
        </h1>

        <div className="mb-4">
          <strong>Vendor:</strong> {p.vendor_name || p.vendor_id || "N/A"}
        </div>
        <div className="mb-4">
          <strong>Date:</strong> {p.bill_date ? new Date(p.bill_date).toLocaleDateString() : "N/A"}
        </div>
       
       {/* commenting out address and mobile no as these fields are not present in the backend */}


        {/* <div className="mb-4">
          <strong>Address:</strong> {p.address || "N/A"}
        </div>
        <div className="mb-4">
          <strong>Mobile No:</strong> {p.mobile_no || "N/A"}
        </div> */}

        

        <div className="mb-4">
          <strong>GST No:</strong> {p.gst_no || "N/A"}
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
            {p.items?.map((item, idx) => {
              const base = (item.size || 0) * (item.rate || 0);
              const discAmt = (base * (item.d1_percent || 0)) / 100;
              const taxable = base - discAmt;
              const gstAmt = (taxable * (item.gst_percent || 0)) / 100;
              const finalAmt = taxable + gstAmt;

              return (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.item_name || item.product_name}</td>
                  <td className="border px-2 py-1">{item.hsn_code || ""}</td>
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
          Total Amount: {fx(p.summary?.final || p.total_amount || 0)}
        </div>
      </div>
    );
  }

  // Purchase List View
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Purchases List</h1>

      <table className="w-full border text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="border px-2 py-1">Bill No</th>
            <th className="border px-2 py-1">Vendor</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Total Amount</th>
            <th className="border px-2 py-1">Details</th>
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
                  onClick={() => showDetails(p.id)}
                  disabled={detailsLoading}
                >
                  {detailsLoading ? "Loading..." : "Details"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
