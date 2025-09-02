import React from 'react';

const PostsTab = ({
    user,
    loading,
    response,
    posts,
    currentPage,
    totalPages,
    postForm,
    setPostForm,
    postImageFiles,
    setPostImageFiles,
    postImagePreviews,
    setPostImagePreviews,
    updatePostForm,
    setUpdatePostForm,
    updateAddImageFiles,
    setUpdateAddImageFiles,
    updateRemoveImageIds,
    setUpdateRemoveImageIds,
    updateReplaceImageIds,
    setUpdateReplaceImageIds,
    onCreatePost,
    onListPosts,
    onUpdatePost,
    onDeletePost,
    onPageChange
}) => {
    return (
        <div id="posts" className="tab-content">
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
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`img-${idx}`}
                                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <button className="btn" onClick={onCreatePost} disabled={loading}>
                        {loading ? <span className="loading"></span> : '➕ Tạo bài viết'}
                    </button>
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
                    <button className="btn" onClick={onListPosts} disabled={loading}>
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
                    <button className="btn" onClick={onUpdatePost} disabled={loading}>
                        {loading ? <span className="loading"></span> : '💾 Cập nhật'}
                    </button>
                </div>

                <div className="card">
                    <h4>🗑️ Xóa bài viết</h4>
                    <div className="form-group">
                        <label>ID bài viết:</label>
                        <input type="text" id="deletePostId" placeholder="Nhập ID bài viết" />
                    </div>
                    <button className="btn btn-danger" onClick={onDeletePost} disabled={loading}>
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
                            {/* Hiển thị tất cả ảnh */}
                            {Array.isArray(post.imagesNormalized) && post.imagesNormalized.length > 0 ? (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                                    {post.imagesNormalized.map((img) => (
                                        <div key={img.id} style={{ textAlign: 'center' }}>
                                            <img
                                                src={img.url}
                                                alt={img.id}
                                                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }}
                                            />
                                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>ID: {img.id}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : Array.isArray(post.images) && post.images.length > 0 ? (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                                    {post.images.map((img) => (
                                        <div key={img.id || img._id} style={{ textAlign: 'center' }}>
                                            <img
                                                src={img.secureUrl || img.url}
                                                alt={img.filename}
                                                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }}
                                            />
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
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={currentPage === page ? 'active' : ''}
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {response && (
                <div className={`response ${response.isError ? 'error' : 'success'}`}>
                    <div className={`status ${response.isError ? 'error' : 'success'}`}>
                        {response.isError ? '❌ Error' : '✅ Success'}
                    </div>
                    <div><strong>Timestamp:</strong> {response.timestamp}</div>
                    <pre>{JSON.stringify(response.data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PostsTab;
