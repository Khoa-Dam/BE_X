import React from 'react';

const UsersTab = ({
    user,
    loading,
    response,
    onGetProfile,
    onUpdateProfile,
    onUploadAvatar
}) => {
    return (
        <div id="users" className="tab-content">
            <h2>👤 User APIs</h2>

            <div className="grid">
                <div className="card">
                    <h4>👤 Lấy thông tin profile</h4>
                    <button className="btn" onClick={onGetProfile} disabled={loading}>
                        {loading ? <span className="loading"></span> : '👤 Get Profile'}
                    </button>
                </div>

                <div className="card">
                    <h4>✏️ Cập nhật profile</h4>
                    <div className="form-group">
                        <label>Tên mới:</label>
                        <input type="text" id="updateName" placeholder="Nhập tên mới" />
                    </div>
                    <button className="btn" onClick={onUpdateProfile} disabled={loading}>
                        {loading ? <span className="loading"></span> : '💾 Cập nhật'}
                    </button>
                </div>

                <div className="card">
                    <h4>🖼️ Upload Avatar</h4>
                    <div className="file-upload" onClick={() => document.getElementById('avatarFile').click()}>
                        <input
                            type="file"
                            id="avatarFile"
                            accept="image/*"
                            onChange={onUploadAvatar}
                        />
                        <p>📁 Click để chọn file ảnh</p>
                    </div>
                </div>
            </div>

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

export default UsersTab;
