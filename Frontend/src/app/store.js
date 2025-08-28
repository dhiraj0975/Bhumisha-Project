import { configureStore } from "@reduxjs/toolkit";
import vendorReducer from "../features/vendor/vendorSlice";
import farmerReducer from './../features/farmers/farmerSlice'; // 👈 naya slice import


const store = configureStore({
  reducer: {
    vendors: vendorReducer, // vendor ke liye
    farmers: farmerReducer, // farmer ke liye
  },
});

export default store;
