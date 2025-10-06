import React, { useEffect, useState } from "react";
import PurchaseAPI from "../../axios/PurchaseAPI";

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await PurchaseAPI.getAll();
        setPurchases(res.data); // API response array
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) return <div>Loading purchases...</div>;
  if (purchases.length === 0) return <div>No purchases found</div>;

  return (
    <div className="p-3">
      <table className="w-full border text-sm">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Vendor</th>
            <th className="border px-2 py-1">Bill No</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="odd:bg-white even:bg-gray-50">
              <td className="border px-2 py-1">{p.id}</td>
              <td className="border px-2 py-1">{p.vendor_name}</td>
              <td className="border px-2 py-1">{p.bill_no}</td>
              <td className="border px-2 py-1">{new Date(p.bill_date).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{p.total_amount}</td>
              <td className="border px-2 py-1">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseList;
