import { useEffect, useState } from 'react';
import { createPost, listPosts, updatePost, deletePost } from '../../services/posts';
import ResponsePanel from '../ResponsePanel';

export default function PostsTab({ user }) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const [postForm, setPostForm] = useState({ title: '', content: '', status: 'DRAFT' });
    const [postImageFiles, setPostImageFiles] = useState([]);
    const [postImagePreviews, setPostImagePreviews] = useState([]);

    const [updatePostForm, setUpdatePostForm] = useState({ id: '', title: '', content: '' });
    const [updateAddImageFiles, setUpdateAddImageFiles] = useState([]);
    const [updateRemoveImageIds, setUpdateRemoveImageIds] = useState('');
    const [updateReplaceImageIds, setUpdateReplaceImageIds] = useState('');

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleResponse = (data, isError = false) =>
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });

    useEffect(() => {
        // Optional: auto load list khi vào tab
    }, []);

    const doCreatePost = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        if (!postForm.title) return handleResponse('Vui lòng nhập tiêu đề', true);
        setLoading(true);
        try {
            const res = await createPost(postForm, postImageFiles);
            handleResponse(res);
            setPostForm({ title: '', content: '', status: 'DRAFT' });
            setPostImageFiles([]);
            setPostImagePreviews([]);
            await doListPosts();
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Tạo bài viết thất bại', true);
        } finally { setLoading(false); }
    };

    const doListPosts = async (page = currentPage) => {
        setLoading(true);
        try {
            const { success, data, meta } = await listPosts({ page, limit: 10, search, sort, order });
            if (success) {
                setPosts(data);
                setTotalPages(Math.ceil((meta?.total || 0) / 10) || 1);
                setCurrentPage(page);
                handleResponse({ success, data, meta });
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Lấy danh sách bài viết thất bại', true);
        } finally { setLoading(false); }
    };

    const doUpdatePost = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        if (!updatePostForm.id)
            return handleResponse('Vui lòng nhập ID bài viết', true);
        if (!updatePostForm.title && !updatePostForm.content && !updateReplaceImageIds &&
            !updateAddImageFiles.length && !updateRemoveImageIds) {
            return handleResponse('Vui lòng nhập ít nhất một thay đổi', true);
        }
        setLoading(true);
        try {
            const res = await updatePost(updatePostForm.id, {
                title: updatePostForm.title,
                content: updatePostForm.content,
                replaceImageIds: updateReplaceImageIds,
                addImageFiles: updateAddImageFiles,
                removeImageIds: updateRemoveImageIds,
            });
            handleResponse(res);
            setUpdatePostForm({ id: '', title: '', content: '' });
            setUpdateAddImageFiles([]);
            setUpdateRemoveImageIds('');
            setUpdateReplaceImageIds('');
            await doListPosts();
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Cập nhật bài viết thất bại', true);
        } finally { setLoading(false); }
    };

    const doDeletePost = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        const postId = document.getElementById('deletePostId')?.value;
        if (!postId) return handleResponse('Vui lòng nhập ID bài viết', true);
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        setLoading(true);
        try {
            const res = await deletePost(postId);
            handleResponse(res);
            document.getElementById('deletePostId').value = '';
            await doListPosts();
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Xóa bài viết thất bại', true);
        } finally { setLoading(false); }
    };

    return (
        <div className="tab-content active">
            <h2>📝 Posts APIs</h2>

            <div className="grid">
                {/* Create Post */}
                <div className="card">
                    <h4>➕ Tạo bài viết mới</h4>
                    <div className="form-group">
                        <label>Tiêu đề:</label>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề"
                            value={postForm.title}
                            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nội dung:</label>
                        <textarea
                            rows="4"
                            placeholder="Nhập nội dung"
                            value={postForm.content}
                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Trạng thái:</label>
                        <select
                            value={postForm.status}
                            onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ảnh (chọn nhiều):</label>
                        <div className="file-upload" onClick={() => document.getElementById('postImageFiles').click()}>
                            <input
                                type="file"
                                id="postImageFiles"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setPostImageFiles(files);
                                    setPostImagePreviews(files.map((f) => URL.createObjectURL(f)));
                                }}
                            />
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
                    <button className="btn" onClick={doCreatePost} disabled={loading}>
                        {loading ? <span className="loading"></span> : '➕ Tạo bài viết'}
                    </button>
                </div>

                {/* List & Update */}
                <div className="card">
                    <h4>📋 Danh sách bài viết</h4>
                    <div className="form-group">
                        <label>Tìm kiếm:</label>
                        <input type="text" placeholder="Tìm kiếm bài viết" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Sắp xếp theo:</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="createdAt">Ngày tạo</option>
                            <option value="title">Tiêu đề</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Thứ tự:</label>
                        <select value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="desc">Giảm dần</option>
                            <option value="asc">Tăng dần</option>
                        </select>
                    </div>
                    <button className="btn" onClick={() => doListPosts(1)} disabled={loading}>
                        {loading ? <span className="loading"></span> : '📋 Lấy danh sách'}
                    </button>
                </div>

                <div className="card">
                    <h4>✏️ Cập nhật bài viết</h4>
                    <div className="form-group">
                        <label>ID bài viết:</label>
                        <input
                            type="text"
                            placeholder="Nhập ID bài viết"
                            value={updatePostForm.id}
                            onChange={(e) => setUpdatePostForm({ ...updatePostForm, id: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tiêu đề mới:</label>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề mới"
                            value={updatePostForm.title}
                            onChange={(e) => setUpdatePostForm({ ...updatePostForm, title: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nội dung mới:</label>
                        <textarea
                            rows="4"
                            placeholder="Nhập nội dung mới"
                            value={updatePostForm.content}
                            onChange={(e) => setUpdatePostForm({ ...updatePostForm, content: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Thay thế toàn bộ imageIds (nhập id, cách nhau bằng dấu phẩy):</label>
                        <input
                            type="text"
                            placeholder="id1,id2,id3"
                            value={updateReplaceImageIds}
                            onChange={(e) => setUpdateReplaceImageIds(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Thêm ảnh (chọn nhiều):</label>
                        <div className="file-upload" onClick={() => document.getElementById('updateAddImageFiles').click()}>
                            <input
                                type="file"
                                id="updateAddImageFiles"
                                accept="image/*"
                                multiple
                                onChange={(e) => setUpdateAddImageFiles(Array.from(e.target.files || []))}
                            />
                            <p>📁 Click để chọn ảnh thêm</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Xóa ảnh theo ID (cách nhau bằng dấu phẩy):</label>
                        <input
                            type="text"
                            placeholder="id1,id2"
                            value={updateRemoveImageIds}
                            onChange={(e) => setUpdateRemoveImageIds(e.target.value)}
                        />
                    </div>
                    <button className="btn" onClick={doUpdatePost} disabled={loading}>
                        {loading ? <span className="loading"></span> : '💾 Cập nhật'}
                    </button>
                </div>

                <div className="card">
                    <h4>🗑️ Xóa bài viết</h4>
                    <div className="form-group">
                        <label>ID bài viết:</label>
                        <input type="text" id="deletePostId" placeholder="Nhập ID bài viết" />
                    </div>
                    <button className="btn btn-danger" onClick={doDeletePost} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🗑️ Xóa'}
                    </button>
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
                                    <img
                                        src={post.authorAvatarUrl}
                                        alt="avatar"
                                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                )}
                                <div>
                                    <h5 style={{ margin: 0 }}>{post.title}</h5>
                                    <div className="meta" style={{ marginTop: 2 }}>
                                        <strong>Author:</strong> {post.author?.name || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                            <p>{post.content}</p>
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
                            <button onClick={() => doListPosts(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>← Previous</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={currentPage === page ? 'active' : ''}
                                    onClick={() => doListPosts(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => doListPosts(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next →</button>
                        </div>
                    )}
                </div>
            )}

            <ResponsePanel response={response} />
        </div>
    );
}
