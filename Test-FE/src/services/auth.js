import { api } from './api';

export async function register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
}

export async function login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
}

export async function logout() {
    const res = await api.post('/auth/logout');
    return res.data;
}

export async function refresh() {
    const res = await api.post('/auth/refresh');
    return res.data;
}

export async function getMe() {
    const res = await api.get('/users/me');
    return res.data;
}

export async function updateMe(payload) {
    const res = await api.patch('/users/me', payload);
    return res.data;
}

export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export function doGoogleLogin() {
    window.location.href = 'http://localhost:4000/api/v1/auth/google';
}
