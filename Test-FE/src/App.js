import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:4000/api/v1';
axios.defaults.withCredentials = true;

// Helper: lấy URL file từ id (nếu chưa populate)
async function fetchFileUrl(fileId) {
    if (!fileId) return null;
    try {
        const r = await axios.get(`/uploads/${fileId}`);
        return r?.data?.data?.secureUrl || r?.data?.data?.url || null;
    } catch { return null; }
}

// Helper: chuẩn hoá avatar tác giả từ nhiều shape khác nhau
async function normalizeAuthorAvatar(post) {
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
async function normalizePostImages(post) {
    // Trường hợp backend trả về images (đã populate)
    if (Array.isArray(post.images) && post.images.length) {
        return post.images.map((img) => ({ id: String(img.id || img._id), url: img.secureUrl || img.url })).filter(x => x.url);
    }
    // Trường hợp backend chỉ trả imageIds (id thuần)
    if (Array.isArray(post.imageIds) && post.imageIds.length) {
        const urls = await Promise.all(post.imageIds.map((id) => fetchFileUrl(typeof id === 'string' ? id : id?._id)));
        return urls.map((url, idx) => url ? ({ id: String(post.imageIds[idx]), url }) : null).filter(Boolean);
    }
    return [];
}

// Axios interceptor: tự động refresh khi gặp 401 một lần
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

function App() {
    const [activeTab, setActiveTab] = useState('auth');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Form states
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Create Post form
    const [postForm, setPostForm] = useState({
        title: '',
        content: '',
        status: 'DRAFT'
    });
    const [postImageFiles, setPostImageFiles] = useState([]); // multiple images
    const [postImagePreviews, setPostImagePreviews] = useState([]);

    // Update Post form
    const [updatePostForm, setUpdatePostForm] = useState({
        id: '',
        title: '',
        content: ''
    });
    const [updateAddImageFiles, setUpdateAddImageFiles] = useState([]); // images to add
    const [updateRemoveImageIds, setUpdateRemoveImageIds] = useState(''); // comma-separated ids
    const [updateReplaceImageIds, setUpdateReplaceImageIds] = useState(''); // comma-separated to replace all

    useEffect(() => {
        checkAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResponse = (data, isError = false) => {
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });
    };

    const checkAuthStatus = async () => {
        try {
            const res = await axios.get('/users/me');
            if (res.data?.success) setUser(res.data.data);
        } catch (err) {
            try {
                await axios.post('/auth/refresh');
                const res2 = await axios.get('/users/me');
                if (res2.data?.success) setUser(res2.data.data);
            } catch (_) { setUser(null); }
        }
    };

    const showTab = (tabName) => { setActiveTab(tabName); setResponse(null); };

    // Authentication APIs (giữ nguyên)
    const register = async () => {
        if (!authForm.name || !authForm.email || !authForm.password) { handleResponse('Vui lòng điền đầy đủ thông tin', true); return; }
        setLoading(true);
        try { const res = await axios.post('/auth/register', authForm); if (res.data.success) { setUser(res.data.data); handleResponse(res.data); setAuthForm({ name: '', email: '', password: '' }); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Đăng ký thất bại', true); }
        finally { setLoading(false); }
    };

    const login = async () => {
        if (!authForm.email || !authForm.password) { handleResponse('Vui lòng điền đầy đủ thông tin', true); return; }
        setLoading(true);
        try { const res = await axios.post('/auth/login', { email: authForm.email, password: authForm.password }); if (res.data.success) { setUser(res.data.data); handleResponse(res.data); setAuthForm({ name: '', email: '', password: '' }); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Đăng nhập thất bại', true); }
        finally { setLoading(false); }
    };

    const logout = async () => { setLoading(true); try { await axios.post('/auth/logout'); setUser(null); handleResponse({ message: 'Đăng xuất thành công' }); setPosts([]); } catch (error) { handleResponse(error.response?.data?.error?.message || 'Đăng xuất thất bại', true); } finally { setLoading(false); } };
    const refreshToken = async () => { setLoading(true); try { const res = await axios.post('/auth/refresh'); if (res.data.success) { setUser(res.data.data); handleResponse(res.data); } } catch (error) { handleResponse(error.response?.data?.error?.message || 'Refresh token thất bại', true); } finally { setLoading(false); } };

    // User APIs (giữ nguyên)
    const getProfile = async () => { if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; } setLoading(true); try { const res = await axios.get('/users/me'); if (res.data.success) { setUser(res.data.data); handleResponse(res.data); } } catch (error) { handleResponse(error.response?.data?.error?.message || 'Lấy profile thất bại', true); } finally { setLoading(false); } };
    const updateProfile = async () => { if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; } const newName = document.getElementById('updateName').value; if (!newName) { handleResponse('Vui lòng nhập tên mới', true); return; } setLoading(true); try { const res = await axios.patch('/users/me', { name: newName }); if (res.data.success) { setUser(res.data.data); handleResponse(res.data); document.getElementById('updateName').value = ''; } } catch (error) { handleResponse(error.response?.data?.error?.message || 'Cập nhật profile thất bại', true); } finally { setLoading(false); } };
    const uploadAvatar = async (event) => { if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; } const file = event.target.files[0]; if (!file) return; setLoading(true); try { const formData = new FormData(); formData.append('file', file); const res = await axios.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); if (res.data.success) { setUser(res.data.data.user); handleResponse(res.data); } } catch (error) { handleResponse(error.response?.data?.error?.message || 'Upload avatar thất bại', true); } finally { setLoading(false); } };

    // Posts APIs
    const createPost = async () => {
        if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; }
        if (!postForm.title) { handleResponse('Vui lòng nhập tiêu đề', true); return; }
        setLoading(true);
        try {
            // Upload nhiều ảnh nếu có
            let imageIds = [];
            if (postImageFiles?.length) {
                for (const f of postImageFiles) {
                    const fd = new FormData();
                    fd.append('file', f);
                    const up = await axios.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    if (up.data?.success) imageIds.push(up.data.data.id);
                }
            }
            const payload = { ...postForm };
            if (imageIds.length) payload.imageIds = imageIds;
            const res = await axios.post('/posts', payload);
            if (res.data.success) {
                handleResponse(res.data);
                setPostForm({ title: '', content: '', status: 'DRAFT' });
                setPostImageFiles([]);
                setPostImagePreviews([]);
                if (activeTab === 'posts') listPosts();
            }
        } catch (error) { handleResponse(error.response?.data?.error?.message || 'Tạo bài viết thất bại', true); }
        finally { setLoading(false); }
    };

    const listPosts = async () => {
        setLoading(true);
        try {
            const search = document.getElementById('searchPosts')?.value || '';
            const sort = document.getElementById('sortPosts')?.value || 'createdAt';
            const order = document.getElementById('orderPosts')?.value || 'desc';
            const res = await axios.get('/posts', { params: { page: currentPage, limit: 10, search, sort, order } });
            if (res.data.success) {
                const raw = res.data.data || [];
                // Chuẩn hoá ảnh & avatar cho mỗi post
                const normalized = await Promise.all(raw.map(async (p) => ({
                    ...p,
                    imagesNormalized: await normalizePostImages(p),
                    authorAvatarUrl: await normalizeAuthorAvatar(p)
                })));
                setPosts(normalized);
                setTotalPages(Math.ceil(res.data.meta.total / 10));
                handleResponse(res.data);
            }
        } catch (error) { handleResponse(error.response?.data?.error?.message || 'Lấy danh sách bài viết thất bại', true); }
        finally { setLoading(false); }
    };

    const updatePost = async () => {
        if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; }
        if (!updatePostForm.id) { handleResponse('Vui lòng nhập ID bài viết', true); return; }
        if (!updatePostForm.title && !updatePostForm.content && !updateReplaceImageIds && !updateAddImageFiles.length && !updateRemoveImageIds) {
            handleResponse('Vui lòng nhập ít nhất một thay đổi', true);
            return;
        }
        setLoading(true);
        try {
            const updateData = {};
            if (updatePostForm.title) updateData.title = updatePostForm.title;
            if (updatePostForm.content) updateData.content = updatePostForm.content;

            // Replace toàn bộ imageIds nếu nhập
            if (updateReplaceImageIds.trim()) {
                const ids = updateReplaceImageIds.split(',').map(x => x.trim()).filter(Boolean);
                updateData.imageIds = ids;
            } else {
                // Nếu không replace, cho phép add/remove
                if (updateAddImageFiles?.length) {
                    const addIds = [];
                    for (const f of updateAddImageFiles) {
                        const fd = new FormData();
                        fd.append('file', f);
                        const up = await axios.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        if (up.data?.success) addIds.push(up.data.data.id);
                    }
                    if (addIds.length) updateData.addImageIds = addIds;
                }
                if (updateRemoveImageIds.trim()) {
                    const rem = updateRemoveImageIds.split(',').map(x => x.trim()).filter(Boolean);
                    if (rem.length) updateData.removeImageIds = rem;
                }
            }

            const res = await axios.patch(`/posts/${updatePostForm.id}`, updateData);
            if (res.data.success) {
                handleResponse(res.data);
                setUpdatePostForm({ id: '', title: '', content: '' });
                setUpdateAddImageFiles([]);
                setUpdateRemoveImageIds('');
                setUpdateReplaceImageIds('');
                listPosts();
            }
        } catch (error) { handleResponse(error.response?.data?.error?.message || 'Cập nhật bài viết thất bại', true); }
        finally { setLoading(false); }
    };

    const deletePost = async () => {
        if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; }
        const postId = document.getElementById('deletePostId').value;
        if (!postId) { handleResponse('Vui lòng nhập ID bài viết', true); return; }
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        setLoading(true);
        try { const res = await axios.delete(`/posts/${postId}`); if (res.data.success) { handleResponse(res.data); document.getElementById('deletePostId').value = ''; listPosts(); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Xóa bài viết thất bại', true); }
        finally { setLoading(false); }
    };

    // Upload tab APIs (giữ nguyên)
    const uploadFile = async (event) => { if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; } const file = event.target.files[0]; if (!file) return; setLoading(true); try { const formData = new FormData(); formData.append('file', file); const res = await axios.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); if (res.data.success) handleResponse(res.data); } catch (error) { handleResponse(error.response?.data?.error?.message || 'Upload file thất bại', true); } finally { setLoading(false); } };
    const getFileMeta = async () => { const fileId = document.getElementById('fileId').value; if (!fileId) { handleResponse('Vui lòng nhập ID file', true); return; } setLoading(true); try { const res = await axios.get(`/uploads/${fileId}`); if (res.data.success) handleResponse(res.data); } catch (error) { handleResponse(error.response?.data?.error?.message || 'Lấy thông tin file thất bại', true); } finally { setLoading(false); } };
    const deleteFile = async () => { if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; } const fileId = document.getElementById('deleteFileId').value; if (!fileId) { handleResponse('Vui lòng nhập ID file', true); return; } if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return; setLoading(true); try { const res = await axios.delete(`/uploads/${fileId}`); if (res.data.success) { handleResponse(res.data); document.getElementById('deleteFileId').value = ''; } } catch (error) { handleResponse(error.response?.data?.error?.message || 'Xóa file thất bại', true); } finally { setLoading(false); } };

    const googleLogin = () => { window.location.href = 'http://localhost:4000/api/v1/auth/google'; };

    return (
        <div className="container">
            <div className="header">
                <h1>🔧 API Testing Dashboard</h1>
                <p>Test tất cả các API endpoints của server</p>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'auth' ? 'active' : ''}`} onClick={() => showTab('auth')}>🔐 Authentication</button>
                <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => showTab('users')}>👤 Users</button>
                <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => showTab('posts')}>📝 Posts</button>
                <button className={`tab ${activeTab === 'uploads' ? 'active' : ''}`} onClick={() => showTab('uploads')}>📤 Uploads</button>
                <button className={`tab ${activeTab === 'google' ? 'active' : ''}`} onClick={() => showTab('google')}>🌐 Google OAuth</button>
            </div>

            <div className="content">
                {/* Authentication Tab */}
                <div id="auth" className={`tab-content ${activeTab === 'auth' ? 'active' : ''}`}>
                    <h2>🔐 Authentication APIs</h2>

                    {user && (
                        <div className="user-info">
                            <h3>👤 Thông tin người dùng</h3>
                            <p><strong>ID:</strong> {user._id}</p>
                            <p><strong>Tên:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            {user.avatarUrl && (
                                <p><strong>Avatar:</strong> <img src={user.avatarUrl} alt="Avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} /></p>
                            )}
                            <button className="btn btn-danger" onClick={logout} disabled={loading}>
                                {loading ? <span className="loading"></span> : '🚪 Logout'}
                            </button>
                        </div>
                    )}

                    <div className="grid">
                        <div className="card">
                            <h4>📝 Đăng ký</h4>
                            <div className="form-group">
                                <label>Họ tên:</label>
                                <input type="text" placeholder="Nhập họ tên" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" placeholder="Nhập email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu:</label>
                                <input type="password" placeholder="Nhập mật khẩu" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                            </div>
                            <button className="btn" onClick={register} disabled={loading}>{loading ? <span className="loading"></span> : '📝 Đăng ký'}</button>
                        </div>

                        <div className="card">
                            <h4>🔑 Đăng nhập</h4>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" placeholder="Nhập email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu:</label>
                                <input type="password" placeholder="Nhập mật khẩu" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                            </div>
                            <button className="btn" onClick={login} disabled={loading}>{loading ? <span className="loading"></span> : '🔑 Đăng nhập'}</button>
                        </div>

                        <div className="card">
                            <h4>🔄 Refresh Token</h4>
                            <button className="btn btn-secondary" onClick={refreshToken} disabled={loading}>{loading ? <span className="loading"></span> : '🔄 Refresh Token'}</button>
                        </div>
                    </div>

                    {response && (
                        <div className={`response ${response.isError ? 'error' : 'success'}`}>
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>{response.isError ? '❌ Error' : '✅ Success'}</div>
                            <div><strong>Timestamp:</strong> {response.timestamp}</div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Users Tab */}
                <div id="users" className={`tab-content ${activeTab === 'users' ? 'active' : ''}`}>
                    <h2>👤 User APIs</h2>

                    <div className="grid">
                        <div className="card">
                            <h4>👤 Lấy thông tin profile</h4>
                            <button className="btn" onClick={getProfile} disabled={loading}>{loading ? <span className="loading"></span> : '👤 Get Profile'}</button>
                        </div>

                        <div className="card">
                            <h4>✏️ Cập nhật profile</h4>
                            <div className="form-group">
                                <label>Tên mới:</label>
                                <input type="text" id="updateName" placeholder="Nhập tên mới" />
                            </div>
                            <button className="btn" onClick={updateProfile} disabled={loading}>{loading ? <span className="loading"></span> : '💾 Cập nhật'}</button>
                        </div>

                        <div className="card">
                            <h4>🖼️ Upload Avatar</h4>
                            <div className="file-upload" onClick={() => document.getElementById('avatarFile').click()}>
                                <input type="file" id="avatarFile" accept="image/*" onChange={uploadAvatar} />
                                <p>📁 Click để chọn file ảnh</p>
                            </div>
                        </div>
                    </div>

                    {response && (
                        <div className={`response ${response.isError ? 'error' : 'success'}`}>
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>{response.isError ? '❌ Error' : '✅ Success'}</div>
                            <div><strong>Timestamp:</strong> {response.timestamp}</div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Posts Tab */}
                <div id="posts" className={`tab-content ${activeTab === 'posts' ? 'active' : ''}`}>
                    <h2>📝 Posts APIs</h2>

                    <div className="grid">
                        {/* Create Post */}
                        <div className="card">
                            <h4>➕ Tạo bài viết mới</h4>
                            <div className="form-group">
                                <label>Tiêu đề:</label>
                                <input type="text" placeholder="Nhập tiêu đề" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Nội dung:</label>
                                <textarea rows="4" placeholder="Nhập nội dung" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái:</label>
                                <select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}>
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ảnh (chọn nhiều):</label>
                                <div className="file-upload" onClick={() => document.getElementById('postImageFiles').click()}>
                                    <input type="file" id="postImageFiles" accept="image/*" multiple onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setPostImageFiles(files);
                                        setPostImagePreviews(files.map((f) => URL.createObjectURL(f)));
                                    }} />
                                    <p>📁 Click để chọn ảnh</p>
                                </div>
                                {postImagePreviews?.length ? (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                                        {postImagePreviews.map((src, idx) => (
                                            <img key={idx} src={src} alt={`img-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            <button className="btn" onClick={createPost} disabled={loading}>{loading ? <span className="loading"></span> : '➕ Tạo bài viết'}</button>
                        </div>

                        {/* List & Update */}
                        <div className="card">
                            <h4>📋 Danh sách bài viết</h4>
                            <div className="form-group">
                                <label>Tìm kiếm:</label>
                                <input type="text" id="searchPosts" placeholder="Tìm kiếm bài viết" />
                            </div>
                            <div className="form-group">
                                <label>Sắp xếp theo:</label>
                                <select id="sortPosts">
                                    <option value="createdAt">Ngày tạo</option>
                                    <option value="title">Tiêu đề</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Thứ tự:</label>
                                <select id="orderPosts">
                                    <option value="desc">Giảm dần</option>
                                    <option value="asc">Tăng dần</option>
                                </select>
                            </div>
                            <button className="btn" onClick={listPosts} disabled={loading}>{loading ? <span className="loading"></span> : '📋 Lấy danh sách'}</button>
                        </div>

                        <div className="card">
                            <h4>✏️ Cập nhật bài viết</h4>
                            <div className="form-group">
                                <label>ID bài viết:</label>
                                <input type="text" placeholder="Nhập ID bài viết" value={updatePostForm.id} onChange={(e) => setUpdatePostForm({ ...updatePostForm, id: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề mới:</label>
                                <input type="text" placeholder="Nhập tiêu đề mới" value={updatePostForm.title} onChange={(e) => setUpdatePostForm({ ...updatePostForm, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Nội dung mới:</label>
                                <textarea rows="4" placeholder="Nhập nội dung mới" value={updatePostForm.content} onChange={(e) => setUpdatePostForm({ ...updatePostForm, content: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Thay thế toàn bộ imageIds (nhập id, cách nhau bằng dấu phẩy):</label>
                                <input type="text" placeholder="id1,id2,id3" value={updateReplaceImageIds} onChange={(e) => setUpdateReplaceImageIds(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Thêm ảnh (chọn nhiều):</label>
                                <div className="file-upload" onClick={() => document.getElementById('updateAddImageFiles').click()}>
                                    <input type="file" id="updateAddImageFiles" accept="image/*" multiple onChange={(e) => setUpdateAddImageFiles(Array.from(e.target.files || []))} />
                                    <p>📁 Click để chọn ảnh thêm</p>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Xóa ảnh theo ID (cách nhau bằng dấu phẩy):</label>
                                <input type="text" placeholder="id1,id2" value={updateRemoveImageIds} onChange={(e) => setUpdateRemoveImageIds(e.target.value)} />
                            </div>
                            <button className="btn" onClick={updatePost} disabled={loading}>{loading ? <span className="loading"></span> : '💾 Cập nhật'}</button>
                        </div>

                        <div className="card">
                            <h4>🗑️ Xóa bài viết</h4>
                            <div className="form-group">
                                <label>ID bài viết:</label>
                                <input type="text" id="deletePostId" placeholder="Nhập ID bài viết" />
                            </div>
                            <button className="btn btn-danger" onClick={deletePost} disabled={loading}>{loading ? <span className="loading"></span> : '🗑️ Xóa'}</button>
                        </div>
                    </div>

                    {/* Posts List */}
                    {posts.length > 0 && (
                        <div className="posts-list">
                            <h3>📋 Danh sách bài viết</h3>
                            {posts.map((post) => (
                                <div key={post._id || post.id} className="post-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {post.authorAvatarUrl && (
                                            <img src={post.authorAvatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <h5 style={{ margin: 0 }}>{post.title}</h5>
                                            <div className="meta" style={{ marginTop: 2 }}>
                                                <strong>Author:</strong> {post.author?.name || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    <p>{post.content}</p>
                                    {/* Hiển thị tất cả ảnh */}
                                    {Array.isArray(post.imagesNormalized) && post.imagesNormalized.length > 0 ? (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                                            {post.imagesNormalized.map((img) => (
                                                <div key={img.id} style={{ textAlign: 'center' }}>
                                                    <img src={img.url} alt={img.id} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} />
                                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>ID: {img.id}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(post.images) && post.images.length > 0 ? (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                                            {post.images.map((img) => (
                                                <div key={img.id || img._id} style={{ textAlign: 'center' }}>
                                                    <img src={img.secureUrl || img.url} alt={img.filename} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} />
                                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>ID: {img.id || img._id}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="meta">Không có ảnh</div>
                                    )}
                                    <div className="meta">
                                        <strong>Status:</strong> {post.status} | <strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>← Previous</button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {response && (
                        <div className={`response ${response.isError ? 'error' : 'success'}`}>
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>{response.isError ? '❌ Error' : '✅ Success'}</div>
                            <div><strong>Timestamp:</strong> {response.timestamp}</div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Uploads Tab */}
                <div id="uploads" className={`tab-content ${activeTab === 'uploads' ? 'active' : ''}`}>
                    <h2>📤 Upload APIs</h2>

                    <div className="grid">
                        <div className="card">
                            <h4>📁 Upload File</h4>
                            <div className="file-upload" onClick={() => document.getElementById('uploadFile').click()}>
                                <input type="file" id="uploadFile" onChange={uploadFile} />
                                <p>📁 Click để chọn file</p>
                            </div>
                        </div>

                        <div className="card">
                            <h4>ℹ️ Lấy thông tin file</h4>
                            <div className="form-group">
                                <label>File ID:</label>
                                <input type="text" id="fileId" placeholder="Nhập ID file" />
                            </div>
                            <button className="btn" onClick={getFileMeta} disabled={loading}>{loading ? <span className="loading"></span> : 'ℹ️ Lấy thông tin'}</button>
                        </div>

                        <div className="card">
                            <h4>🗑️ Xóa file</h4>
                            <div className="form-group">
                                <label>File ID:</label>
                                <input type="text" id="deleteFileId" placeholder="Nhập ID file" />
                            </div>
                            <button className="btn btn-danger" onClick={deleteFile} disabled={loading}>{loading ? <span className="loading"></span> : '🗑️ Xóa'}</button>
                        </div>
                    </div>

                    {response && (
                        <div className={`response ${response.isError ? 'error' : 'success'}`}>
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>{response.isError ? '❌ Error' : '✅ Success'}</div>
                            <div><strong>Timestamp:</strong> {response.timestamp}</div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Google OAuth Tab */}
                <div id="google" className={`tab-content ${activeTab === 'google' ? 'active' : ''}`}>
                    <h2>🌐 Google OAuth</h2>

                    <div className="card">
                        <h4>🔑 Đăng nhập bằng Google</h4>
                        <p>Click vào nút bên dưới để đăng nhập bằng Google:</p>
                        <button className="btn" onClick={googleLogin}>🌐 Đăng nhập Google</button>
                    </div>

                    {response && (
                        <div className={`response ${response.isError ? 'error' : 'success'}`}>
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>{response.isError ? '❌ Error' : '✅ Success'}</div>
                            <div><strong>Timestamp:</strong> {response.timestamp}</div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
