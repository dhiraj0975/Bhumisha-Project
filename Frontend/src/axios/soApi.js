import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// SALES ORDERS
export const soApi = {
  list: () => api.get("/so-orders"),
  get: (id) => api.get(`/so-orders/${id}`),
  create: (data) => api.post("/so-orders", data),
  update: (id, data) => api.put(`/so-orders/${id}`, data),
  remove: (id) => api.delete(`/so-orders/${id}`),
  invoice: (id) => api.get(`/so-orders/${id}/invoice`),
};

// Reference data (customers, products)
export const refApi = {
  customers: () => api.get("/customers"),
  products: () => api.get("/products"),
};
