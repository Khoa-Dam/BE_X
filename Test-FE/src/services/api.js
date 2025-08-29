import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:4000/api/v1',
    withCredentials: true,
});

// --- Axios interceptor: auto refresh once on 401 ---
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
        if (error?.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribers.push(() => resolve(api(originalRequest)));
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await api.post('/auth/refresh');
                isRefreshing = false;
                onRefreshed();
                return api(originalRequest);
            } catch (e) {
                isRefreshing = false;
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
