import React, { useEffect, useState } from "react";
import {
  Building2, FileText, MapPin, Phone, CreditCard, Landmark, FileSignature
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addVendor,
  fetchVendors,
  updateVendor,
  clearEditingVendor,
} from "../../features/vendor/vendorSlice";

const VendorRegistration = ({ onAddVendor }) => {
  const dispatch = useDispatch();
  const { editingVendor } = useSelector((state) => state.vendors);

  const [form, setForm] = useState({
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

  // Pre-fill form if editingVendor exists
  useEffect(() => {
    console.log("Editing Vendor in VendorRegistration:", editingVendor); // Debug log
    if (editingVendor) {
      setForm({
        firm_name: editingVendor.firm_name || "",
        gst_no: editingVendor.gst_no || "",
        address: editingVendor.address || "",
        contact_number: editingVendor.contact_number || "",
        pan_number: editingVendor.bank?.pan_number || "",
        account_holder_name: editingVendor.bank?.account_holder_name || "",
        bank_name: editingVendor.bank?.bank_name || "",
        account_number: editingVendor.bank?.account_number || "",
        ifsc_code: editingVendor.bank?.ifsc_code || "",
        branch_name: editingVendor.bank?.branch_name || "",
      });
    } else {
      setForm({
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
    }
  }, [editingVendor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingVendor) {
      await dispatch(
        updateVendor({
          id: editingVendor.id,
          vendor: {
            firm_name: form.firm_name,
            gst_no: form.gst_no,
            address: form.address,
            contact_number: form.contact_number,
            status: editingVendor.status || "active",
            bank: {
              ...editingVendor.bank, // Preserve existing bank properties
              pan_number: form.pan_number,
              account_holder_name: form.account_holder_name,
              bank_name: form.bank_name,
              account_number: form.account_number,
              ifsc_code: form.ifsc_code,
              branch_name: form.branch_name,
            },
          },
        })
      );
      dispatch(clearEditingVendor());
      onAddVendor?.(); // Trigger tab switch to list
    } else {
      await dispatch(
        addVendor({
          firm_name: form.firm_name,
          gst_no: form.gst_no,
          address: form.address,
          contact_number: form.contact_number,
          status: "active",
          bank: {
            pan_number: form.pan_number,
            account_holder_name: form.account_holder_name,
            bank_name: form.bank_name,
            account_number: form.account_number,
            ifsc_code: form.ifsc_code,
            branch_name: form.branch_name,
          },
        })
      );
      onAddVendor?.(); // Trigger tab switch to list
    }

    setForm({
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

    dispatch(fetchVendors());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-8 rounded-2xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        {editingVendor ? "Update Vendor" : "Vendor Registration"}
      </h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Building2 className="text-blue-600" size={18} /> Firm Name
          </label>
          <input
            type="text"
            name="firm_name"
            value={form.firm_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter firm name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <FileText className="text-blue-600" size={18} /> GST Number
          </label>
          <input
            type="text"
            name="gst_no"
            value={form.gst_no}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter GST number"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1 flex items-center gap-2">
            <MapPin className="text-blue-600" size={18} /> Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter complete address"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Phone className="text-blue-600" size={18} /> Contact Number
          </label>
          <input
            type="text"
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <input
            type="text"
            name="pan_number"
            value={form.pan_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter PAN number"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> Account Holder Name
          </label>
          <input
            type="text"
            name="account_holder_name"
            value={form.account_holder_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account holder name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} /> Bank Name
          </label>
          <input
            type="text"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter bank name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> Account Number
          </label>
          <input
            type="text"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account number"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> IFSC Code
          </label>
          <input
            type="text"
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter IFSC code"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} /> Branch Name
          </label>
          <input
            type="text"
            name="branch_name"
            value={form.branch_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter branch name"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
        >
          {editingVendor ? "Update Vendor" : "Register Vendor"}
        </button>
      </div>
    </form>
  );
};

export default VendorRegistration;