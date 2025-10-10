import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // fallback
  withCredentials: true, // cookies/session ke liye
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ✅ Purchase Order API
const PurchaseOrderAPI = {
  getAll: () => api.get("/purchase-orders"),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post("/purchase-orders", data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  getInvoice: (id) => api.get(`/purchase-orders/${id}/invoice`),
};
export default PurchaseOrderAPI;
