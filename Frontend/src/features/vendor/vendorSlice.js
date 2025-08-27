import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import vendorAPI from "../../axios/vendorsAPI";

// ✅ Thunks
export const fetchVendors = createAsyncThunk("vendor/fetchVendors", async () => {
  const res = await vendorAPI.getAll();
  return res.data;
});

export const addVendor = createAsyncThunk("vendor/addVendor", async (vendor) => {
  const res = await vendorAPI.create(vendor);
  return res.data;
});

export const updateVendor = createAsyncThunk(
  "vendor/updateVendor",
  async ({ id, vendor }) => {
    const res = await vendorAPI.update(id, vendor);
    // Backend may return only a message; optimistically update using submitted data
    return { id, data: vendor };
  }
);

export const deleteVendor = createAsyncThunk("vendor/deleteVendor", async (id) => {
  await vendorAPI.remove(id);
  return id;
});

// ✅ Slice
const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
    editingVendor: null,
  },
  reducers: {
    setEditingVendor: (state, action) => {
      const payload = JSON.parse(JSON.stringify(action.payload)); // Deep clone
      state.editingVendor = {
        ...payload,
        bank: payload.bank || {}, // Ensure bank property exists
      };
    },
    clearEditingVendor: (state) => {
      state.editingVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || "Failed to load vendors");
      })

      // Add
      .addCase(addVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.push(action.payload);
        toast.success("Vendor created");
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || "Create failed");
      })

      // Update
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          // Update the vendor object, including the nested bank object
          state.vendors[index] = {
            ...state.vendors[index],
            ...action.payload.data,
            bank: {
              ...state.vendors[index].bank,
              ...action.payload.data.bank,
            },
          };
        }
        state.editingVendor = null;
        toast.success("Vendor updated");
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || "Update failed");
      })

      // Delete
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter((v) => v.id !== action.payload);
        toast.success("Vendor deleted");
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || "Delete failed");
      });
  },
});

export const { setEditingVendor, clearEditingVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
