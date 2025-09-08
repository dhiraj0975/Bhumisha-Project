import axios from "axios";

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

console.log("reached at the API",api);


// ✅ Vendor API calls
const vendorAPI = {
  create: (data) => api.post("/vendors", data),
  getAll: () => api.get("/vendors"),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  remove: (id) => api.delete(`/vendors/${id}`),
  updateStatus: (id, status) => api.patch(`/vendors/${id}/status`, { status }), // ✅ Naya add
};

export default vendorAPI;
