import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../DataTable/DataTable";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchPurchases } from "../../features/purchase/purchaseSlice";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseList({ reload }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: purchases = [] } = useSelector((state) => state.purchases || {});

  const [viewPurchase, setViewPurchase] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch purchases initially and whenever `reload` changes (parent signals refresh)
  useEffect(() => {
    dispatch(fetchPurchases());
  }, [dispatch, reload]);

  const filtered = useMemo(() => {
    if (!search) return purchases;
    const term = search.toLowerCase();
    return purchases.filter((p) => [p.bill_no, p.vendor_name, p.gst_no, p.total_amount]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [purchases, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered]);
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((s, p) => s + Number(p.total_amount || 0), 0);

  const columns = [
    { field: "sl_no", headerName: "Sl.No.", width: 80, sortable: false, renderCell: (params) => {
        const pageStart = (page - 1) * PAGE_SIZE;
        const rowIndex = currentPageRows.findIndex(r => r.id === params.row.id);
        return pageStart + rowIndex + 1;
      }
    },
    { field: "bill_no", headerName: "Bill No", flex: 1 },
    { field: "vendor_name", headerName: "Vendor", flex: 1 },
    { field: "bill_date", headerName: "Date", width: 140, renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : "N/A" },
    { field: "total_amount", headerName: "Total Amount", width: 140, renderCell: (params) => fx(params.value) },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton color="primary" onClick={() => setViewPurchase(params.row)} title="View">
            <VisibilityIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => navigate(`/purchases/edit/${params.row.id}`)} title="Edit">
            <EditIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchases</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">Total Purchases</p>
            <p className="text-sm text-blue-600">#</p>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{totalPurchases}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-900">Total Amount</p>
            <p className="text-sm text-green-600">₹</p>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{fx(totalAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Records</p>
            <p className="text-sm text-gray-600">{filtered.length}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">Page {page}/{totalPages}</p>
        </div>
      </div>

      {/* Search and actions */}
      {/* <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by bill no, vendor, amount..."
          className="border rounded px-3 py-2 w-full max-w-md"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex-1" />
      </div> */}

      <div className="bg-white rounded shadow overflow-x-auto mb-6">
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={10}
          checkboxSelection={false}
          title="Purchases List"
          getRowId={(row) => row?.id}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >Next</button>
      </div>

      {/* View Modal */}
      {viewPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Purchase Details</h2>
              <button onClick={() => setViewPurchase(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-indigo-700 mb-3">Purchase Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Bill No</p>
                    <p className="font-medium">{viewPurchase.bill_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vendor</p>
                    <p className="font-medium">{viewPurchase.vendor_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{viewPurchase.bill_date ? new Date(viewPurchase.bill_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium">{fx(viewPurchase.total_amount || 0)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-purple-700 mb-2">Items</h4>
                <div className="overflow-auto max-h-64">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">SI</th>
                        <th className="border px-2 py-1">Item</th>
                        <th className="border px-2 py-1">Size</th>
                        <th className="border px-2 py-1">Rate</th>
                        <th className="border px-2 py-1">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPurchase.items?.map((it, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="border px-2 py-1">{idx + 1}</td>
                          <td className="border px-2 py-1">{it.item_name || it.product_name}</td>
                          <td className="border px-2 py-1">{it.size}</td>
                          <td className="border px-2 py-1">{fx(it.rate)}</td>
                          <td className="border px-2 py-1">{fx((it.size || 0) * (it.rate || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button onClick={() => setViewPurchase(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
