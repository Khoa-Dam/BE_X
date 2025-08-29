import axios from 'axios';
import { normalizeAuthorAvatar, normalizePostImages } from '../utils/helpers';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:4000/api/v1';
axios.defaults.withCredentials = true;

// Authentication APIs
export const authAPI = {
    register: async (userData) => {
        const res = await axios.post('/auth/register', userData);
        return res.data;
    },

    login: async (credentials) => {
        const res = await axios.post('/auth/login', credentials);
        return res.data;
    },

    logout: async () => {
        const res = await axios.post('/auth/logout');
        return res.data;
    },

    refresh: async () => {
        const res = await axios.post('/auth/refresh');
        return res.data;
    }
};

// User APIs
export const userAPI = {
    getProfile: async () => {
        const res = await axios.get('/users/me');
        return res.data;
    },

    updateProfile: async (updateData) => {
        const res = await axios.patch('/users/me', updateData);
        return res.data;
    },

    uploadAvatar: async (file) => {
        console.log('userAPI.uploadAvatar - file:', file);
        const formData = new FormData();
        formData.append('file', file);
        console.log('userAPI.uploadAvatar - formData entries:', Array.from(formData.entries()));
        const res = await axios.post('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
};

// Posts APIs
export const postsAPI = {
    create: async (postData, imageFiles = []) => {
        let imageIds = [];
        if (imageFiles?.length) {
            for (const f of imageFiles) {
                const fd = new FormData();
                fd.append('file', f);
                const up = await axios.post('/uploads', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (up.data?.success) imageIds.push(up.data.data.id);
            }
        }
        const payload = { ...postData };
        if (imageIds.length) payload.imageIds = imageIds;

        const res = await axios.post('/posts', payload);
        return res.data;
    },

    list: async (params = {}) => {
        const res = await axios.get('/posts', { params });
        if (res.data.success) {
            const raw = res.data.data || [];
            // Chuẩn hoá ảnh & avatar cho mỗi post
            const normalized = await Promise.all(raw.map(async (p) => ({
                ...p,
                imagesNormalized: await normalizePostImages(p),
                authorAvatarUrl: await normalizeAuthorAvatar(p)
            })));
            return { ...res.data, data: normalized };
        }
        return res.data;
    },

    update: async (postId, updateData, addImageFiles = [], removeImageIds = '', replaceImageIds = '') => {
        const updatePayload = { ...updateData };

        // Replace toàn bộ imageIds nếu nhập
        if (replaceImageIds.trim()) {
            const ids = replaceImageIds.split(',').map(x => x.trim()).filter(Boolean);
            updatePayload.imageIds = ids;
        } else {
            // Nếu không replace, cho phép add/remove
            if (addImageFiles?.length) {
                const addIds = [];
                for (const f of addImageFiles) {
                    const fd = new FormData();
                    fd.append('file', f);
                    const up = await axios.post('/uploads', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (up.data?.success) addIds.push(up.data.data.id);
                }
                if (addIds.length) updatePayload.addImageIds = addIds;
            }
            if (removeImageIds.trim()) {
                const rem = removeImageIds.split(',').map(x => x.trim()).filter(Boolean);
                if (rem.length) updatePayload.removeImageIds = rem;
            }
        }

        const res = await axios.patch(`/posts/${postId}`, updatePayload);
        return res.data;
    },

    delete: async (postId) => {
        const res = await axios.delete(`/posts/${postId}`);
        return res.data;
    }
};

// Upload APIs
export const uploadAPI = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    getMeta: async (fileId) => {
        const res = await axios.get(`/uploads/${fileId}`);
        return res.data;
    },

    delete: async (fileId) => {
        const res = await axios.delete(`/uploads/${fileId}`);
        return res.data;
    }
};
