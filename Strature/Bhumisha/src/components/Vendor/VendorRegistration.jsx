import React, { useState } from "react";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  CreditCard,
  Landmark,
  FileSignature, // ✅ replaced Signature with FileSignature
} from "lucide-react";

const VendorRegistration = ({ onAddVendor }) => {
  const [form, setForm] = useState({
    firmName: "",
    gstNo: "",
    address: "",
    contact: "",
    panNo: "",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branchName: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddVendor(form);
    setForm({
      firmName: "",
      gstNo: "",
      address: "",
      contact: "",
      panNo: "",
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      branchName: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-8 rounded-2xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Vendor Registration
      </h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firm Name */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Building2 className="text-blue-600" size={18} />
            Firm Name
          </label>
          <input
            type="text"
            name="firmName"
            value={form.firmName}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter firm name"
            required
          />
        </div>

        {/* GST No */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <FileText className="text-blue-600" size={18} />
            GST Number
          </label>
          <input
            type="text"
            name="gstNo"
            value={form.gstNo}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter GST number"
            required
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-1 flex items-center gap-2">
            <MapPin className="text-blue-600" size={18} />
            Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter complete address"
            required
          ></textarea>
        </div>

        {/* Contact */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Phone className="text-blue-600" size={18} />
            Contact Number
          </label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter contact number"
            required
          />
        </div>
      </div>

      {/* Bank Details Section */}
      <h3 className="text-xl font-semibold text-gray-700 border-b pb-1">
        Bank Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAN Number */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <FileSignature className="text-blue-600" size={18} />
            PAN Number
          </label>
          <input
            type="text"
            name="panNo"
            value={form.panNo}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter PAN number"
            required
          />
        </div>

        {/* Account Holder Name */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} />
            Account Holder Name
          </label>
          <input
            type="text"
            name="accountHolder"
            value={form.accountHolder}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account holder name"
            required
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} />
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter bank name"
            required
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} />
            Account Number
          </label>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account number"
            required
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} />
            IFSC Code
          </label>
          <input
            type="text"
            name="ifsc"
            value={form.ifsc}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter IFSC code"
            required
          />
        </div>

        {/* Branch Name */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} />
            Branch Name
          </label>
          <input
            type="text"
            name="branchName"
            value={form.branchName}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter branch name"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Register Vendor
        </button>
      </div>
    </form>
  );
};

export default VendorRegistration;
