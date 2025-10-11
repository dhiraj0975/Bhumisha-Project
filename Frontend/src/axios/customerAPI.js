// src/axios/customerAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g., http://localhost:4000/api
  withCredentials: true,
});

// Optional: unify error messages
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    // console.warn("API Error:", msg);
    return Promise.reject({ ...err, message: msg });
  }
);

const customersAPI = {
  // CRUD
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),            // expects { name, email?, phone?, address?, status?, gst_no?, balance?, min_balance? }
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),

  // Status/Balance
  toggleStatus: (id, currentStatus) => api.put(`/customers/${id}/toggle-status`, { currentStatus }),
  getBalance: (id) => api.get(`/customers/${id}/balance`),

  // Statement + Summary
  getStatement: (id, params) => api.get(`/customers/${id}/statement`, { params }), // { from, to, page, limit, sort }
  getSummary: (id, params) => api.get(`/customers/${id}/summary`, { params }),     // { as_of }

  // Exports
  exportStatementCSV: (id, params) =>
    api.get(`/customers/${id}/statement.csv`, { params, responseType: "blob" }),
  exportStatementPDF: (id, params) =>
    api.get(`/customers/${id}/statement.pdf`, { params, responseType: "blob" }),
};

export default customersAPI;
