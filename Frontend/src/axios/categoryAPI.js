import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ✅ Category API calls
const categoryAPI = {
  create: (data) => api.post("/categories", data),
  getAll: () => api.get("/categories"),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
  updateStatus: (id, status) => api.patch(`/categories/${id}/status`, { status }),
};

export default categoryAPI;
