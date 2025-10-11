import axios from "axios";

// Base URL: .env me VITE_API_BASE_URL set kar sakte ho, fallback localhost
// Example: VITE_API_BASE_URL=https://your-backend-domain.com/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // CORS credentials allowed if backend me enabled
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20s
});

// Optional: Attach auth token if needed
api.interceptors.request.use(
  (config) => {
    // Example token attach:
    // const token = localStorage.getItem("access_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const resp = error?.response;
    const msg =
      resp?.data?.error ||
      resp?.data?.message ||
      error?.message ||
      "Request failed";
    // Console for debugging; UI me toast dikhana ho to yaha hook kar sakte ho
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("API Error:", {
        url: error?.config?.url,
        method: error?.config?.method,
        status: resp?.status,
        data: resp?.data,
      });
    }
    // Error ko consistent format me throw karo
    return Promise.reject({
      status: resp?.status || 0,
      message: msg,
      data: resp?.data,
    });
  }
);

// ---------- SALES ORDERS ----------
export const soApi = {
  list: () => api.get("/so-orders"),                          // GET /api/so-orders
  get: (id) => api.get(`/so-orders/${id}`),                   // GET /api/so-orders/:id
  create: (data) => api.post("/so-orders", data),             // POST /api/so-orders
  update: (id, data) => api.put(`/so-orders/${id}`, data),    // PUT /api/so-orders/:id
  remove: (id) => api.delete(`/so-orders/${id}`),             // DELETE /api/so-orders/:id
  invoice: (id) => api.get(`/so-orders/${id}/invoice`),       // GET /api/so-orders/:id/invoice
};

// ---------- Reference Data ----------
export const refApi = {
  customers: () => api.get("/customers"),   // GET /api/customers
  products: () => api.get("/products"),     // GET /api/products
};

// ---------- Optional helper wrappers (safe calls) ----------
// Yeh helpers UI components me try/catch kam kar dete hain
export const safe = async (promiseFn) => {
  try {
    const res = await promiseFn();
    return { ok: true, data: res.data, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message, status: e.status || 0, data: e.data };
  }
};

// Example usage in component:
// const { ok, data, error } = await safe(() => soApi.create(payload));
