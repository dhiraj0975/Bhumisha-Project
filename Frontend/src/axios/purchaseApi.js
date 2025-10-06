// src/api/purchase.api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", // fallback
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

const PurchaseAPI = {
  // ✅ Get all purchases
  getAll: () => api.get("/purchase"),

  // ✅ Get single purchase by ID
  getById: (id) => api.get(`/purchase/${id}`),

  // ✅ Create new purchase
  create: (data) => api.post("/purchase", data),

  // ✅ Update existing purchase
  update: (id, data) => api.put(`/purchase/${id}`, data),

  // ✅ Delete purchase
  delete: (id) => api.delete(`/purchase/${id}`),
};

export default PurchaseAPI;
