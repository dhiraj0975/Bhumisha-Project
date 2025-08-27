import { configureStore } from "@reduxjs/toolkit";
import vendorReducer from "../features/vendor/vendorSlice"; 

const store = configureStore({
  reducer: {
    vendors: vendorReducer, // ✅ same key jo aap selector me use karte ho
  },
});

export default store;
