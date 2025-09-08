import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import vendorAPI from "../../axios/vendorsAPI.js";

// ✅ Fetch vendors
export const fetchVendors = createAsyncThunk("vendor/fetchVendors", async () => {
  const res = await vendorAPI.getAll();
  return res.data;
});

// ✅ Add vendor
export const addVendor = createAsyncThunk("vendor/addVendor", async (vendor, { rejectWithValue }) => {
  console.log("this is call the thunk ",vendor);
  
  try {
    const res = await vendorAPI.create(vendor);
    console.log("this is the response of the vendor",res);
    
    toast.success("Vendor successfully registered! 🎉");
    return res.data;
  } catch (error) {
    toast.error("Failed to register vendor. Please try again.");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Update vendor
export const updateVendor = createAsyncThunk(
  "vendor/updateVendor",
  async ({ id, vendor }, { rejectWithValue }) => {
    try {
      await vendorAPI.update(id, vendor);
      toast.success("Vendor details updated successfully! ✅");
      return { id, data: vendor }; // Optimistic update
    } catch (error) {
      toast.error("Failed to update vendor details. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Delete vendor
export const deleteVendor = createAsyncThunk("vendor/deleteVendor", async (id, { rejectWithValue }) => {
  try {
    await vendorAPI.remove(id);
    toast.success("Vendor deleted successfully! 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete vendor. Please try again.");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Update vendor status
export const updateVendorStatus = createAsyncThunk(
  "vendor/updateVendorStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await vendorAPI.updateStatus(id, status);
      toast.success(`Vendor ${status === "active" ? "activated" : "deactivated"} successfully! ✅`);
      return { id, status };
    } catch (error) {
      toast.error("Failed to update vendor status. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
