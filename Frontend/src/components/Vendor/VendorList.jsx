import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../DataTable/DataTable";
import { fetchVendors, updateVendor, deleteVendor } from "../../features/vendor/vendorSlice"; // Import updateVendor
import { Pencil, Trash2 } from "lucide-react";
import {
  Building2, FileText, MapPin, Phone, CreditCard, Landmark, FileSignature
} from "lucide-react"; // Import icons
import { TextField, Button } from "@mui/material"; // Import MUI components

export default function VendorList() {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);
  const [columns, setColumns] = useState([]);
  const [editingVendor, setEditingVendor] = useState(null); // State for tracking editing vendor
  const [form, setForm] = useState({ // State for form values
    firm_name: "",
    gst_no: "",
    address: "",
    contact_number: "",
    pan_number: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
  });

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  useEffect(() => {
    if (vendors.length > 0) {
      const firstVendor = vendors[0];
      const dynamicColumns = [];

      Object.keys(firstVendor).forEach((key) => {
        if (key === "status") {
          dynamicColumns.push({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            width: 120,
            renderCell: (params) => (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  params.value === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {params.value ? params.value.toUpperCase() : "N/A"}
              </span>
            ),
          });
          return;
        }

        if (key === "bank") {
          // Expand nested bank fields as separate readable columns
          const bankCols = [
            { field: "bank_pan_number", headerName: "PAN NUMBER", valueGetter: (params) => params.row.bank?.pan_number || "" },
            { field: "bank_account_holder_name", headerName: "ACCOUNT HOLDER NAME", valueGetter: (params) => params.row.bank?.account_holder_name || "" },
            { field: "bank_name", headerName: "BANK NAME", valueGetter: (params) => params.row.bank?.bank_name || "" },
            { field: "bank_account_number", headerName: "ACCOUNT NUMBER", valueGetter: (params) => params.row.bank?.account_number || "" },
            { field: "bank_ifsc_code", headerName: "IFSC CODE", valueGetter: (params) => params.row.bank?.ifsc_code || "" },
            { field: "bank_branch_name", headerName: "BRANCH NAME", valueGetter: (params) => params.row.bank?.branch_name || "" },
          ];
          bankCols.forEach((c) => dynamicColumns.push({ ...c, width: 180 }));
          return;
        }

        dynamicColumns.push({
          field: key,
          headerName: key.replace(/_/g, " ").toUpperCase(),
          width: 150,
        });
      });

      // Action column
      dynamicColumns.push({
        field: "actions",
        headerName: "ACTIONS",
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <div className="flex gap-2">
            {/* Edit */}
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() => handleEdit(params.row)}
            >
              <Pencil size={16} />
            </button>
            {/* Delete */}
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              onClick={() => handleDelete(params.row.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      });

      setColumns(dynamicColumns);
    }
  }, [vendors]);

  const handleEdit = (vendor) => {
    console.log("Editing vendor:", vendor); // Inspect the vendor object
    setEditingVendor(vendor);
    const bank = vendor.bank || {}; // Ensure bank is an object
    setForm({
      firm_name: vendor.firm_name || "",
      gst_no: vendor.gst_no || "",
      address: vendor.address || "",
      contact_number: vendor.contact_number || "",
      pan_number: bank.pan_number ?? "", // Handle null/undefined values
      account_holder_name: bank.account_holder_name ?? "", // Handle null/undefined values
      bank_name: bank.bank_name ?? "", // Handle null/undefined values
      account_number: bank.account_number ?? "", // Handle null/undefined values
      ifsc_code: bank.ifsc_code ?? "", // Handle null/undefined values
      branch_name: bank.branch_name ?? "", // Handle null/undefined values
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      dispatch(deleteVendor(id));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateVendor({
      id: editingVendor.id,
      vendor: {
        ...editingVendor, // Keep other vendor properties
        firm_name: form.firm_name,
        gst_no: form.gst_no,
        address: form.address,
        contact_number: form.contact_number,
        bank: {
          pan_number: form.pan_number,
          account_holder_name: form.account_holder_name,
          bank_name: form.bank_name,
          account_number: form.account_number,
          ifsc_code: form.ifsc_code,
          branch_name: form.branch_name,
        }
      }
    }));
    setEditingVendor(null); // Clear editing state
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Vendor List</h2>

      {loading && <p className="text-gray-600">Loading vendors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {editingVendor ? ( // Conditional rendering: Show form if editingVendor is not null
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-8 rounded-2xl shadow-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Update Vendor
          </h2>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Building2 className="text-blue-600" size={18} /> Firm Name
              </label>
              <TextField
                fullWidth
                type="text"
                name="firm_name"
                value={form.firm_name}
                onChange={handleChange}
                placeholder="Enter firm name"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <FileText className="text-blue-600" size={18} /> GST Number
              </label>
              <TextField
                fullWidth
                type="text"
                name="gst_no"
                value={form.gst_no}
                onChange={handleChange}
                placeholder="Enter GST number"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1 flex items-center gap-2">
                <MapPin className="text-blue-600" size={18} /> Address
              </label>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Phone className="text-blue-600" size={18} /> Contact Number
              </label>
              <TextField
                fullWidth
                type="text"
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
              />
            </div>
          </div>

          {/* Bank Details */}
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-1">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <FileSignature className="text-blue-600" size={18} /> PAN Number
              </label>
              <TextField
                fullWidth
                type="text"
                name="pan_number"
                value={form.pan_number}
                onChange={handleChange}
                placeholder="Enter PAN number"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={18} /> Account Holder Name
              </label>
              <TextField
                fullWidth
                type="text"
                name="account_holder_name"
                value={form.account_holder_name}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Landmark className="text-blue-600" size={18} /> Bank Name
              </label>
              <TextField
                fullWidth
                type="text"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={18} /> Account Number
              </label>
              <TextField
                fullWidth
                type="text"
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
                placeholder="Enter account number"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={18} /> IFSC Code
              </label>
              <TextField
                fullWidth
                type="text"
                name="ifsc_code"
                value={form.ifsc_code}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Landmark className="text-blue-600" size={18} /> Branch Name
              </label>
              <TextField
                fullWidth
                type="text"
                name="branch_name"
                value={form.branch_name}
                onChange={handleChange}
                placeholder="Enter branch name"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
            >
              Update Vendor
            </Button>
          </div>
        </form>
      ) : ( // Otherwise, show the DataTable
        !loading && !error && vendors.length > 0 && (
          <DataTable
            rows={vendors.map((vendor) => ({
              id: vendor.id,
              ...vendor,
            }))}
            columns={columns}
            pageSize={5}
            checkboxSelection
            autoHeight
          />
        )
      )}

      {!loading && !error && vendors.length === 0 && (
        <p className="text-gray-500 mt-4">No vendors found.</p>
      )}
    </div>
  );
}
