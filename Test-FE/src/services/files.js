import { api } from './api';

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export async function getFileMeta(fileId) {
    const res = await api.get(`/uploads/${fileId}`);
    return res.data;
}

export async function deleteFile(fileId) {
    const res = await api.delete(`/uploads/${fileId}`);
    return res.data;
}
