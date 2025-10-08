// src/pages/sales/SalesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import salesAPI from "../../axios/salesAPI";

export default function SalesList({ onEdit, onCreate, onDetails }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter((r) =>
      [r.bill_no, r.customer_name, r.payment_status, r.payment_method, r.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t))
    );
  }, [rows, q]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await salesAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this sale?")) return;
    setLoading(true);
    try {
      await salesAPI.delete(id);
      toast.success("Sale deleted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const onEditClick = async (sale) => {
    try {
      const { data } = await salesAPI.getById(sale.id);
      onEdit?.(data);
    } catch (e) {
      toast.error("Failed to load sale details");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Sales</h3>
        <div className="flex items-center gap-2">
          <input
            className="border p-2 rounded-lg w-60"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onCreate}>
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Sl.No.</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Bill No</th>    
                <th className="p-2 border">Date</th>
                {/* <th className="p-2 border">Customer</th> */}
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Method</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{idx + 1}</td>
                   <td className="p-2 border">
                    <button
                      type="button"
                      onClick={() => onDetails?.(r.id)}
                      className="text-blue-600 underline hover:text-blue-700"
                      title="View sale details"
                    >
                      {r.customer_name}
                    </button>
                  </td>
                  <td className="p-2 border">{r.bill_no}</td>
                                   
                  <td className="p-2 border">{r.bill_date}</td>

                  <td className="p-2 border">{Number(r.total_amount || 0).toFixed(2)}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        String(r.payment_status).toLowerCase() === "paid"
                          ? "bg-green-500"
                          : String(r.payment_status).toLowerCase() === "partial"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="p-2 border">{r.payment_method}</td>
                  <td className="p-2 border">{r.status}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onEditClick(r)}>
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => onDetails?.(r.id)}>
                        Details
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="p-4 text-center" colSpan={9}>
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


