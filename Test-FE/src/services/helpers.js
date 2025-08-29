import { api } from './api';

// Lấy URL file từ id
export async function fetchFileUrl(fileId) {
    if (!fileId) return null;
    try {
        const r = await api.get(`/uploads/${fileId}`);
        return r?.data?.data?.secureUrl || r?.data?.data?.url || null;
    } catch {
        return null;
    }
}

// Chuẩn hoá avatar tác giả từ nhiều shape khác nhau
export async function normalizeAuthorAvatar(post) {
    const a = post?.author;
    if (!a) return null;
    if (a.avatarUrl) return a.avatarUrl;
    if (a.avatar?.url) return a.avatar.url;
    if (a.avatarId?.secureUrl) return a.avatarId.secureUrl;

    if (typeof a.avatarId === 'string') return await fetchFileUrl(a.avatarId);
    if (a.avatarId?._id) return await fetchFileUrl(a.avatarId._id);
    return null;
}

// Chuẩn hoá danh sách ảnh của post -> [{ id, url }]
export async function normalizePostImages(post) {
    if (Array.isArray(post.images) && post.images.length) {
        return post.images
            .map((img) => ({ id: String(img.id || img._id), url: img.secureUrl || img.url }))
            .filter((x) => x.url);
    }
    if (Array.isArray(post.imageIds) && post.imageIds.length) {
        const urls = await Promise.all(
            post.imageIds.map((id) => fetchFileUrl(typeof id === 'string' ? id : id?._id))
        );
        return urls
            .map((url, idx) => (url ? { id: String(post.imageIds[idx]), url } : null))
            .filter(Boolean);
    }
    return [];
}
