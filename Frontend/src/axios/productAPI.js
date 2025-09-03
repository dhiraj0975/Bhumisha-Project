import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ✅ Product API calls
const productAPI = {
  create: (data) => api.post("/products", data),
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

export default productAPI;
