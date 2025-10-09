import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g., http://localhost:5000/api
  withCredentials: true,
});

const customersAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
  toggleStatus: (id, currentStatus) =>
    api.put(`/customers/${id}/toggle-status`, { currentStatus }),
  getBalance: (id) => api.get(`/customers/${id}/balance`),
};

export default customersAPI;
