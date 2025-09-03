import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  withCredentials: true,
});

// ✅ Farmer API calls
const farmerAPI = {
  create: (data) => api.post("/farmers", data),
  getAll: () => api.get("/farmers"),
  update: (id, data) => api.put(`/farmers/${id}`, data),
  remove: (id) => api.delete(`/farmers/${id}`),
  updateStatus: (id, status) => api.patch(`/farmers/${id}/status`, { status }), // ✅ active/inactive
};

export default farmerAPI;
