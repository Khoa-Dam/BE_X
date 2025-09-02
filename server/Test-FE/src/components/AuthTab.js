import React from 'react';

const AuthTab = ({
    user,
    authForm,
    setAuthForm,
    loading,
    response,
    onRegister,
    onLogin,
    onLogout,
    onRefreshToken
}) => {
    return (
        <div id="auth" className="tab-content">
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
                    <button className="btn btn-danger" onClick={onLogout} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🚪 Logout'}
                    </button>
                </div>
            )}

            <div className="grid">
                <div className="card">
                    <h4>📝 Đăng ký</h4>
                    <div className="form-group">
                        <label>Họ tên:</label>
                        <input
                            type="text"
                            placeholder="Nhập họ tên"
                            value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Nhập email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        />
                    </div>
                    <button className="btn" onClick={onRegister} disabled={loading}>
                        {loading ? <span className="loading"></span> : '📝 Đăng ký'}
                    </button>
                </div>

                <div className="card">
                    <h4>🔑 Đăng nhập</h4>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Nhập email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        />
                    </div>
                    <button className="btn" onClick={onLogin} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🔑 Đăng nhập'}
                    </button>
                </div>

                <div className="card">
                    <h4>🔄 Refresh Token</h4>
                    <button className="btn btn-secondary" onClick={onRefreshToken} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🔄 Refresh Token'}
                    </button>
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

export default AuthTab;
