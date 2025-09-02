import axios from 'axios';

// Helper: lấy URL file từ id (nếu chưa populate)
export async function fetchFileUrl(fileId) {
    if (!fileId) return null;
    try {
        const r = await axios.get(`/uploads/${fileId}`);
        return r?.data?.data?.secureUrl || r?.data?.data?.url || null;
    } catch { return null; }
}

// Helper: chuẩn hoá avatar tác giả từ nhiều shape khác nhau
export async function normalizeAuthorAvatar(post) {
    const a = post?.author;
    if (!a) return null;
    // Ưu tiên các trường URL sẵn có từ BE mới
    if (a.avatarUrl) return a.avatarUrl;
    if (a.avatar?.url) return a.avatar.url;
    if (a.avatarId?.secureUrl) return a.avatarId.secureUrl;

    // Nếu chỉ có id
    if (typeof a.avatarId === 'string') return await fetchFileUrl(a.avatarId);
    if (a.avatarId?._id) return await fetchFileUrl(a.avatarId._id);
    return null;
}

// Helper: chuẩn hoá danh sách ảnh của post -> [{ id, url }]
export async function normalizePostImages(post) {
    // Trường hợp backend trả về images (đã populate)
    if (Array.isArray(post.images) && post.images.length) {
        return post.images.map((img) => ({ id: String(img.id || img._id), url: img.secureUrl || img.url })).filter(x => x.url);
    }
    // Trường hợp backend chỉ trả imageIds (id thuần)
    if (Array.isArray(post.imageIds) && post.imageIds.length) {
        const urls = await Promise.all(post.imageIds.map((id) => fetchFileUrl(typeof id === 'string' ? id : id?._id)));
        return urls.map((url, idx) => url ? { id: String(post.imageIds[idx]), url } : null).filter(Boolean);
    }
    return [];
}

// Axios interceptor setup
export function setupAxiosInterceptors() {
    let isRefreshing = false;
    let subscribers = [];

    function onRefreshed() {
        subscribers.forEach((cb) => cb());
        subscribers = [];
    }

    axios.interceptors.response.use(
        (res) => res,
        async (error) => {
            const originalRequest = error.config;
            if (error?.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve) => {
                        subscribers.push(() => resolve(axios(originalRequest)));
                    });
                }
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    await axios.post('/auth/refresh');
                    isRefreshing = false;
                    onRefreshed();
                    return axios(originalRequest);
                } catch (e) {
                    isRefreshing = false;
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );
}
