import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productAPI from "../../axios/productAPI";
import { toast } from "react-toastify";

// ✅ Fetch all
export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const res = await productAPI.getAll();
  return res.data;
});

// ✅ Add
export const addProduct = createAsyncThunk("products/add", async (data, { rejectWithValue }) => {
  try {
    const res = await productAPI.create(data);
    toast.success("Product added ✅");
    return { id: res.data.id, ...data };
  } catch (error) {
    toast.error("Failed to add product ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Update
export const updateProduct = createAsyncThunk("products/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    await productAPI.update(id, data);
    toast.success("Product updated ✅");
    return { id, ...data };
  } catch (error) {
    toast.error("Failed to update product ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Delete
export const deleteProduct = createAsyncThunk("products/delete", async (id, { rejectWithValue }) => {
  try {
    await productAPI.remove(id);
    toast.success("Product deleted 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete product ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export default productSlice.reducer;
