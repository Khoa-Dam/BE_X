import { api } from './api';
import { normalizeAuthorAvatar, normalizePostImages } from './helpers';

export async function createPost(payload, imageFiles = []) {
    let imageIds = [];
    if (imageFiles?.length) {
        for (const f of imageFiles) {
            const fd = new FormData();
            fd.append('file', f);
            const up = await api.post('/uploads', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (up.data?.success) imageIds.push(up.data.data.id);
        }
    }
    const data = { ...payload };
    if (imageIds.length) data.imageIds = imageIds;

    const res = await api.post('/posts', data);
    return res.data;
}

export async function listPosts({ page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc' } = {}) {
    const res = await api.get('/posts', { params: { page, limit, search, sort, order } });
    const raw = res.data?.data || [];
    const normalized = await Promise.all(
        raw.map(async (p) => ({
            ...p,
            imagesNormalized: await normalizePostImages(p),
            authorAvatarUrl: await normalizeAuthorAvatar(p),
        }))
    );
    const meta = res.data?.meta || {};
    return { success: res.data?.success, data: normalized, meta };
}

export async function updatePost(postId, { title, content, replaceImageIds, addImageFiles, removeImageIds }) {
    if (!postId) throw new Error('Missing postId');

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    if (replaceImageIds?.trim()) {
        updateData.imageIds = replaceImageIds.split(',').map((x) => x.trim()).filter(Boolean);
    } else {
        if (addImageFiles?.length) {
            const addIds = [];
            for (const f of addImageFiles) {
                const fd = new FormData();
                fd.append('file', f);
                const up = await api.post('/uploads', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (up.data?.success) addIds.push(up.data.data.id);
            }
            if (addIds.length) updateData.addImageIds = addIds;
        }
        if (removeImageIds?.trim()) {
            const rem = removeImageIds.split(',').map((x) => x.trim()).filter(Boolean);
            if (rem.length) updateData.removeImageIds = rem;
        }
    }

    const res = await api.patch(`/posts/${postId}`, updateData);
    return res.data;
}

export async function deletePost(postId) {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
}
