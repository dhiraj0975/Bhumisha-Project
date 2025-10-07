// src/axios/salesAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Sales API aligned with routes/sales.routes.js
const salesAPI = {
  // GET all sales (lightweight list)
  getAll: () => api.get("/sales"),

  // GET sale with items by ID
  getById: (id) => api.get(`/sales/${id}`),

  // POST new sale (expects { customer_id, bill_date, items[], ... })
  create: (data) => api.post("/sales", data),

  // PUT update sale
  update: (id, data) => api.put(`/sales/${id}`, data),

  // DELETE sale
  delete: (id) => api.delete(`/sales/${id}`),

  // GET new bill number
  getNewBillNo: () => api.get("/sales/new-bill-no"),

  // Optional: if a separate items endpoint is added later
  // getItemsBySaleId: (id) => api.get(`/sales/${id}/items`),

  // Optional: invoice endpoint when implemented server-side
  // getInvoice: (id) => api.get(`/sales/${id}/invoice`),
};

export default salesAPI;
 