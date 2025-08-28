// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // ✅ API Base URL
// const API_URL = "http://localhost:5000/api/farmers";

// // ✅ Async Thunks
// export const fetchFarmers = createAsyncThunk("farmers/fetchAll", async () => {
//   const res = await axios.get(API_URL);
//   return res.data;
// });

// export const addFarmer = createAsyncThunk("farmers/add", async (farmer) => {
//   const res = await axios.post(API_URL, farmer);
//   return res.data;
// });

// export const updateFarmer = createAsyncThunk(
//   "farmers/update",
//   async ({ id, data }) => {
//     const res = await axios.put(`${API_URL}/${id}`, data);
//     return { id, ...data };
//   }
// );

// export const deleteFarmer = createAsyncThunk("farmers/delete", async (id) => {
//   await axios.delete(`${API_URL}/${id}`);
//   return id;
// });

// // ✅ Slice
// const farmerSlice = createSlice({
//   name: "farmers",
//   initialState: {
//     list: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchFarmers.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchFarmers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload;
//       })
//       .addCase(fetchFarmers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       })

//       // Add
//       .addCase(addFarmer.fulfilled, (state, action) => {
//         state.list.push(action.payload);
//       })

//       // Update
//       .addCase(updateFarmer.fulfilled, (state, action) => {
//         const index = state.list.findIndex((f) => f.id === action.payload.id);
//         if (index !== -1) state.list[index] = action.payload;
//       })

//       // Delete
//       .addCase(deleteFarmer.fulfilled, (state, action) => {
//         state.list = state.list.filter((f) => f.id !== action.payload);
//       });
//   },
// });

// export default farmerSlice.reducer;




import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import farmerAPI from "../../axios/farmerAPI";

// ✅ Thunks
export const fetchFarmers = createAsyncThunk("farmers/fetchFarmers", async () => {
  const res = await farmerAPI.getAll();
  return res.data;
});

export const addFarmer = createAsyncThunk("farmers/addFarmer", async (data) => {
  const res = await farmerAPI.create(data);
  return res.data;
});

export const updateFarmer = createAsyncThunk("farmers/updateFarmer", async ({ id, data }) => {
  const res = await farmerAPI.update(id, data);
  return res.data;
});

export const deleteFarmer = createAsyncThunk("farmers/deleteFarmer", async (id) => {
  await farmerAPI.remove(id);
  return id;
});

export const updateFarmerStatus = createAsyncThunk("farmers/updateStatus", async ({ id, status }) => {
  const res = await farmerAPI.updateStatus(id, status);
  return res.data;
});

// ✅ Slice
const farmerSlice = createSlice({
  name: "farmers",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFarmers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFarmers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addFarmer.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateFarmer.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteFarmer.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f.id !== action.payload);
      })
      .addCase(updateFarmerStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      });
  },
});

export default farmerSlice.reducer;
