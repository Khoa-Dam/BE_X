import axios from "axios";
//import { api } from './api';

/**
 * Axios instance
 */
export const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true, // dùng cookie httpOnly nếu backend trả cookie
});

/**
 * Refresh helper: gọi /auth/refresh và set Authorization header nếu backend trả accessToken
 */
async function refreshTokenAndSetHeader() {
  const res = await api.post("/auth/refresh");
  // Nếu backend trả accessToken trong body, set vào header (tuỳ backend)
  if (res?.data?.accessToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
  }
  return res.data;
}

/**
 * Interceptor xử lý auto-refresh khi nhận 401
 */
let isRefreshing = false;
let subscribers = [];

function onRefreshed() {
  subscribers.forEach((cb) => cb());
  subscribers = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh, chờ tới khi refresh xong rồi gọi lại originalRequest
        return new Promise((resolve) => {
          subscribers.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshTokenAndSetHeader();
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (e) {
        isRefreshing = false;
        // Nếu refresh thất bại — reject để FE xử lý (redirect login...)
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

/* ===========================
   AUTH API
   =========================== */

export const authAPI = {
  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },
  login: async (payload) => {
    const res = await api.post("/auth/login", payload);
    // Nếu backend trả accessToken, set luôn
    if (res?.data?.accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
    }
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/auth/logout");
    // xoá header khi logout
    delete api.defaults.headers.common["Authorization"];
    return res.data;
  },
  refresh: async () => {
    const data = await refreshTokenAndSetHeader();
    return data;
  },
  doGoogleLogin: () => {
    window.location.href = `${api.defaults.baseURL.replace(/\/api\/v1$/, "")}/api/v1/auth/google`;
  },
};

/* ===========================
   USER API
   =========================== */

export const userAPI = {
  getMe: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  updateMe: async (payload) => {
    const res = await api.patch("/users/me", payload);
    return res.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    // axios tự set Content-Type + boundary
    const res = await api.post("/users/me/avatar", formData);
    return res.data;
  },
  // ví dụ thêm các API user khác nếu cần
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
};

/* ===========================
   POSTS API (ví dụ)
   =========================== */

export const postsAPI = {
  getAll: async (params = {}) => {
    const res = await api.get("/posts", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post("/posts", payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/posts/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
};

/* ===========================
   UPLOAD API (ví dụ)
   =========================== */

export const uploadAPI = {
  uploadFile: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/upload", form);
    return res.data;
  },
};

/* ===========================
   Export default (tùy ý)
   =========================== */

//export default api;

export const chatAPI = {
  getChats: () => api.get('/chats'),
  getOrCreate: (userId) => api.get(`/chats/with/${userId}`),
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId, message) => api.post(`/chats/${chatId}/messages`, { message }),
};
