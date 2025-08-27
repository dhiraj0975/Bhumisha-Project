import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors, deleteVendor, setEditingVendor } from "../../features/vendor/vendorSlice";
import {
  Building2, FileText, MapPin, Phone, CreditCard, Landmark, FileSignature
} from "lucide-react";

export default function VendorList() {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);
  const [viewVendor, setViewVendor] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  // no local edit form state; we render VendorRegistration inline using Redux editingVendor

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  // Derived data: filter by search and paginate
  const filteredVendors = useMemo(() => {
    if (!search) return vendors;
    const term = search.toLowerCase();
    return vendors.filter((v) =>
      [v.firm_name, v.gst_no, v.address, v.contact_number]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term))
    );
  }, [vendors, search]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  }, [filteredVendors]);

  const currentPageVendors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredVendors.slice(start, start + PAGE_SIZE);
  }, [filteredVendors, page]);

  const handleEdit = (vendor) => {
    dispatch(setEditingVendor(vendor));
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      dispatch(deleteVendor(id));
    }
  };

  // Editing handled by VendorRegistration component

  // Stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => (v.status || "").toString().toLowerCase() === "active").length;
  const inactiveVendors = totalVendors - activeVendors;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Vendors</h2>

      {loading && <p className="text-gray-600">Loading vendors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">Total Vendors</p>
            <Building2 size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{totalVendors}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium  text-green-900">Active</p>
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{activeVendors}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Inactive</p>
            <span className="w-3 h-3 rounded-full bg-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{inactiveVendors}</p>
        </div>
      </div>

      {/* Update form is shown in VendorRegistration page/tab */}

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by firm name, GST, phone, address..."
          className="border rounded px-3 py-2 w-full max-w-md"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex-1" />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firm Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center text-red-500 py-8">{error}</td></tr>
            ) : currentPageVendors.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">No vendors found.</td></tr>
            ) : currentPageVendors.map((v, idx) => (
              <tr key={v.id}>
                <td className="px-6 py-4 whitespace-nowrap">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{v.firm_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{v.gst_no}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2"><Phone size={14} /> {v.contact_number}</td>
                <td className="px-6 py-4">{v.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded text-md font-semibold ${
                    (v.status || "").toString().toLowerCase() === "active" ? "bg-green-100 text-green-800 rounded-full border" : "bg-gray-200 text-gray-700"
                  }`}>
                    {(v.status || "-").toString().toLowerCase() === "active" ? "Active" : (v.status || "inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex gap-2 justify-center">
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200" onClick={() => setViewVendor(v)}>View</button>
                    <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200" onClick={() => handleDelete(v.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* Edit Modal removed; editing handled inline above */}

      {/* View Modal */}
      {viewVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Vendor Details</h2>
              <button onClick={() => setViewVendor(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {(() => {
              const row = viewVendor;
              const bank = row.bank || row || {};
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                      <Building2 size={16} /> Vendor Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Firm Name</p>
                        <p className="font-medium">{row.firm_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">GST No</p>
                        <p className="font-medium">{row.gst_no || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="font-medium flex items-center gap-2"><Phone size={14} /> {row.contact_number || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium flex items-center gap-2"><MapPin size={14} /> {row.address || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                      <CreditCard size={16} /> Bank Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">PAN Number</p>
                        <p className="font-medium flex items-center gap-2"><FileSignature size={14} /> {bank.pan_number ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account Holder</p>
                        <p className="font-medium">{bank.account_holder_name ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bank Name</p>
                        <p className="font-medium flex items-center gap-2"><Landmark size={14} /> {bank.bank_name ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account Number</p>
                        <p className="font-medium">{bank.account_number ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">IFSC Code</p>
                        <p className="font-medium">{bank.ifsc_code ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Branch</p>
                        <p className="font-medium">{bank.branch_name ?? "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
