import React, { useState, useEffect } from 'react';
import './App.css';
import { chatAPI } from './services/api';


// Components
import {
    Header,
    TabNavigation,
    AuthTab,
    UsersTab,
    PostsTab,
    UploadsTab,
    GoogleOAuthTab
} from './components';

// Services
import * as authAPI from './services/auth';
import * as userAPI from './services/users';
import * as postsAPI from './services/posts';
import * as uploadAPI from './services/files';
import { setupAxiosInterceptors } from './utils/helpers';

// Setup axios interceptors
setupAxiosInterceptors();

function App() {
    const [activeTab, setActiveTab] = useState('auth');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debug log
    console.log('App rendered, activeTab:', activeTab);

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
    const [postImageFiles, setPostImageFiles] = useState([]);
    const [postImagePreviews, setPostImagePreviews] = useState([]);

    // Update Post form
    const [updatePostForm, setUpdatePostForm] = useState({
        id: '',
        title: '',
        content: ''
    });
    const [updateAddImageFiles, setUpdateAddImageFiles] = useState([]);
    const [updateRemoveImageIds, setUpdateRemoveImageIds] = useState('');
    const [updateReplaceImageIds, setUpdateReplaceImageIds] = useState('');

    useEffect(() => {
        console.log('App useEffect - checkAuthStatus called');
        checkAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResponse = (data, isError = false) => {
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });
    };

    const checkAuthStatus = async () => {
        try {
            const res = await userAPI.getMe();
            if (res.success) setUser(res.data);
        } catch (err) {
            try {
                await authAPI.refresh();
                const res2 = await userAPI.getMe();
                if (res2.success) setUser(res2.data);
            } catch (_) { setUser(null); }
        }
    };

    const showTab = (tabName) => {
        console.log('showTab called with:', tabName);
        setActiveTab(tabName);
        setResponse(null);
    };

    // Authentication APIs (giữ nguyên)
    const register = async () => {
        if (!authForm.name || !authForm.email || !authForm.password) { handleResponse('Vui lòng điền đầy đủ thông tin', true); return; }
        setLoading(true);
        try { const res = await authAPI.register(authForm); if (res.success) { setUser(res.data); handleResponse(res.data); setAuthForm({ name: '', email: '', password: '' }); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Đăng ký thất bại', true); }
        finally { setLoading(false); }
    };

    const login = async () => {
        if (!authForm.email || !authForm.password) { handleResponse('Vui lòng điền đầy đủ thông tin', true); return; }
        setLoading(true);
        try { const res = await authAPI.login({ email: authForm.email, password: authForm.password }); if (res.success) { setUser(res.data); handleResponse(res.data); setAuthForm({ name: '', email: '', password: '' }); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Đăng nhập thất bại', true); }
        finally { setLoading(false); }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authAPI.logout();
            setUser(null);
            handleResponse({ message: 'Đăng xuất thành công' });
            setPosts([]);
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Đăng xuất thất bại', true);
        } finally {
            setLoading(false);
        }
    };
    const refreshToken = async () => {
        setLoading(true);
        try {
            const res = await authAPI.refresh();
            if (res.success) {
                setUser(res.data);
                handleResponse(res.data);
            }
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Refresh token thất bại', true);
        } finally {
            setLoading(false);
        }
    };

    // User APIs (giữ nguyên)
    const getProfile = async () => {
        if (!user) {
            handleResponse('Vui lòng đăng nhập trước', true);
            return;
        }
        setLoading(true);
        try {
            const res = await userAPI.getMe();
            if (res.success) {
                setUser(res.data);
                handleResponse(res.data);
            }
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Lấy profile thất bại', true);
        } finally {
            setLoading(false);
        }
    };
    const updateProfile = async () => {
        if (!user) {
            handleResponse('Vui lòng đăng nhập trước', true);
            return;
        }
        const newName = document.getElementById('updateName').value;
        if (!newName) {
            handleResponse('Vui lòng nhập tên mới', true);
            return;
        }
        setLoading(true);
        try {
            const res = await userAPI.updateMe({ name: newName });
            if (res.success) {
                setUser(res.data);
                handleResponse(res.data);
                document.getElementById('updateName').value = '';
            }
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Cập nhật profile thất bại', true);
        } finally {
            setLoading(false);
        }
    };
    const uploadAvatar = async (event) => {
        if (!user) {
            handleResponse('Vui lòng đăng nhập trước', true);
            return;
        }
        const file = event.target.files[0];
        console.log('Upload avatar - file:', file);
        if (!file) return;
        setLoading(true);
        try {
            const res = await userAPI.uploadAvatar(file);
            if (res.success) {
                setUser(res.data.user);
                handleResponse(res.data);
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            handleResponse(error.response?.data?.error?.message || 'Upload avatar thất bại', true);
        } finally {
            setLoading(false);
        }
    };

    // Posts APIs
    const createPost = async () => {
        if (!user) { handleResponse('Vui lòng đăng nhập trước', true); return; }
        if (!postForm.title) { handleResponse('Vui lòng nhập tiêu đề', true); return; }
        setLoading(true);
        try {
            const res = await postsAPI.createPost(postForm, postImageFiles);
            if (res.success) {
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
            const res = await postsAPI.listPosts({ page: currentPage, limit: 10, search, sort, order });
            console.log('[POSTS LIST] response:', res);
            console.log('[POSTS LIST] response.data:', res.data);
            if (res.success) {
                setPosts(res.data);
                setTotalPages(Math.ceil(res.meta.total / 10));
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
            const res = await postsAPI.updatePost(
                updatePostForm.id,
                {
                    title: updatePostForm.title,
                    content: updatePostForm.content,
                    replaceImageIds: updateReplaceImageIds,
                    addImageFiles: updateAddImageFiles,
                    removeImageIds: updateRemoveImageIds,
                }
            );
            if (res.success) {
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
        try { const res = await postsAPI.deletePost(postId); if (res.success) { handleResponse(res.data); document.getElementById('deletePostId').value = ''; listPosts(); } }
        catch (error) { handleResponse(error.response?.data?.error?.message || 'Xóa bài viết thất bại', true); }
        finally { setLoading(false); }
    };

    // Upload tab APIs (giữ nguyên)
    const uploadFile = async (event) => {
        if (!user) {
            handleResponse('Vui lòng đăng nhập trước', true);
            return;
        }
        const file = event.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const res = await uploadAPI.uploadFile(file);
            if (res.success) handleResponse(res.data);
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Upload file thất bại', true);
        } finally {
            setLoading(false);
        }
    };

    const getFileMeta = async () => {
        const fileId = document.getElementById('fileId').value;
        if (!fileId) {
            handleResponse('Vui lòng nhập ID file', true);
            return;
        }
        setLoading(true);
        try {
            const res = await uploadAPI.getFileMeta(fileId);
            if (res.success) handleResponse(res.data);
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Lấy thông tin file thất bại', true);
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async () => {
        if (!user) {
            handleResponse('Vui lòng đăng nhập trước', true);
            return;
        }
        const fileId = document.getElementById('deleteFileId').value;
        if (!fileId) {
            handleResponse('Vui lòng nhập ID file', true);
            return;
        }
        if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;
        setLoading(true);
        try {
            const res = await uploadAPI.deleteFile(fileId);
            if (res.success) {
                handleResponse(res.data);
                document.getElementById('deleteFileId').value = '';
            }
        } catch (error) {
            handleResponse(error.response?.data?.error?.message || 'Xóa file thất bại', true);
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = () => {
        window.location.href = 'http://localhost:4000/api/v1/auth/google';
    };

    // Chat real time

    const [chatForm, setChatForm] = useState({ userId: '', chatId: '', content: '' });
    const [messages, setMessages] = useState([]);

    async function getOrCreateChat() {
        try {
            setLoading(true);
            const res = await chatAPI.getOrCreate(chatForm.userId);
            setResponse({ data: res, isError: false, timestamp: new Date().toLocaleString() });
            setChatForm({ ...chatForm, chatId: res._id });
            // có thể load luôn tin nhắn của chat này
            const msgs = await chatAPI.getMessages(res._id);
            setMessages(msgs);
        } catch (err) {
            setResponse({ data: err.message, isError: true, timestamp: new Date().toLocaleString() });
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage() {
        try {
            setLoading(true);
            const res = await chatAPI.sendMessage(chatForm.chatId, { content: chatForm.content });
            setResponse({ data: res, isError: false, timestamp: new Date().toLocaleString() });
            setMessages([...messages, res]); // thêm tin nhắn mới vào danh sách
            setChatForm({ ...chatForm, content: '' });
        } catch (err) {
            setResponse({ data: err.message, isError: true, timestamp: new Date().toLocaleString() });
        } finally {
            setLoading(false);
        }
    }


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
                <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => showTab('chat')}>🌐 Chat</button>
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
                            {posts.map((post) => {
                                console.log('Post data:', post);
                                return (
                                    <div key={post._id || post.id} className="post-item">
                                        <h5>{post.title}</h5>
                                        <p>{post.content}</p>
                                        {/* Hiển thị tất cả ảnh */}
                                        {Array.isArray(post.images) && post.images.length > 0 ? (
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                {post.authorAvatarUrl ? (
                                                    <img src={post.authorAvatarUrl} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                                                        👤
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>Author:</strong> {post.author?.name || 'Unknown'}
                                                </div>
                                            </div>
                                            <div>
                                                <strong>Status:</strong> {post.status} | <strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

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
                {/* Chat Tab */}
                <div id="chat" className={`tab-content ${activeTab === 'chat' ? 'active' : ''}`}>
                    <h2>💬 Chat APIs</h2>

                    {!user && (
                        <div className="warning">
                            ⚠️ Vui lòng đăng nhập trước khi sử dụng Chat.
                        </div>
                    )}

                    {user && (
                        <>
                            {/* Tạo/Chọn Chat */}
                            <div className="card">
                                <h4>📂 Lấy/Tạo Chat với User</h4>
                                <div className="form-group">
                                    <label>User ID:</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập userId muốn chat cùng"
                                        value={chatForm.userId}
                                        onChange={(e) =>
                                            setChatForm({ ...chatForm, userId: e.target.value })
                                        }
                                    />
                                </div>
                                <button className="btn" onClick={getOrCreateChat} disabled={loading}>
                                    {loading ? <span className="loading"></span> : '📂 Lấy/Tạo Chat'}
                                </button>
                            </div>

                            {/* Gửi tin nhắn */}
                            <div className="card">
                                <h4>✉️ Gửi tin nhắn</h4>
                                <div className="form-group">
                                    <label>Chat ID:</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập chatId"
                                        value={chatForm.chatId}
                                        onChange={(e) =>
                                            setChatForm({ ...chatForm, chatId: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nội dung:</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn"
                                        value={chatForm.content}
                                        onChange={(e) =>
                                            setChatForm({ ...chatForm, content: e.target.value })
                                        }
                                    />
                                </div>
                                <button className="btn" onClick={sendMessage} disabled={loading}>
                                    {loading ? <span className="loading"></span> : '📩 Gửi'}
                                </button>
                            </div>

                            {/* Danh sách tin nhắn */}
                            {messages.length > 0 && (
                                <div className="card">
                                    <h4>🗂️ Danh sách tin nhắn</h4>
                                    <ul className="messages-list">
                                        {messages.map((msg) => (
                                            <li key={msg._id}>
                                                <strong>{msg.sender?.name || 'Ẩn danh'}:</strong> {msg.content}
                                                <span className="timestamp">
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}

                    {response && (
                        <div
                            className={`response ${response.isError ? 'error' : 'success'}`}
                        >
                            <div className={`status ${response.isError ? 'error' : 'success'}`}>
                                {response.isError ? '❌ Error' : '✅ Success'}
                            </div>
                            <div>
                                <strong>Timestamp:</strong> {response.timestamp}
                            </div>
                            <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default App;
