import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryAPI from "../../axios/categoryAPI";
import { toast } from "react-toastify";

// ✅ Fetch all
export const fetchCategories = createAsyncThunk("categories/fetchAll", async () => {
  const res = await categoryAPI.getAll();
  return res.data;
});

// ✅ Add
export const addCategory = createAsyncThunk("categories/add", async (data, { rejectWithValue }) => {
  try {
    const res = await categoryAPI.create(data);
    toast.success("Category added ✅");
    return { id: res.data.id, name: data.name };
  } catch (error) {
    toast.error("Failed to add category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Update
export const updateCategory = createAsyncThunk("categories/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    await categoryAPI.update(id, data);
    toast.success("Category updated ✅");
    return { id, ...data };
  } catch (error) {
    toast.error("Failed to update category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Delete
export const deleteCategory = createAsyncThunk("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await categoryAPI.remove(id);
    toast.success("Category deleted 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Slice
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
