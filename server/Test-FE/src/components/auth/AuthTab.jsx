import { useState } from 'react';
import { register, login, logout, refresh } from '../../services/auth';
import ResponsePanel from '../ResponsePanel';

export default function AuthTab({ user, setUser }) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

    const handleResponse = (data, isError = false) =>
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });

    const doRegister = async () => {
        if (!authForm.name || !authForm.email || !authForm.password)
            return handleResponse('Vui lòng điền đầy đủ thông tin', true);
        setLoading(true);
        try {
            const res = await register(authForm);
            if (res.success) {
                setUser(res.data);
                handleResponse(res);
                setAuthForm({ name: '', email: '', password: '' });
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Đăng ký thất bại', true);
        } finally { setLoading(false); }
    };

    const doLogin = async () => {
        if (!authForm.email || !authForm.password)
            return handleResponse('Vui lòng điền đầy đủ thông tin', true);
        setLoading(true);
        try {
            const res = await login({ email: authForm.email, password: authForm.password });
            if (res.success) {
                setUser(res.data);
                handleResponse(res);
                setAuthForm({ name: '', email: '', password: '' });
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Đăng nhập thất bại', true);
        } finally { setLoading(false); }
    };

    const doLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
            handleResponse({ message: 'Đăng xuất thành công' });
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Đăng xuất thất bại', true);
        } finally { setLoading(false); }
    };

    const doRefresh = async () => {
        setLoading(true);
        try {
            const res = await refresh();
            if (res.success) {
                setUser(res.data);
                handleResponse(res);
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Refresh token thất bại', true);
        } finally { setLoading(false); }
    };

    return (
        <div className="tab-content active">
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
                    <button className="btn btn-danger" onClick={doLogout} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🚪 Logout'}
                    </button>
                </div>
            )}

            <div className="grid">
                <div className="card">
                    <h4>📝 Đăng ký</h4>
                    <div className="form-group">
                        <label>Họ tên:</label>
                        <input type="text" placeholder="Nhập họ tên" value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" placeholder="Nhập email" value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input type="password" placeholder="Nhập mật khẩu" value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                    </div>
                    <button className="btn" onClick={doRegister} disabled={loading}>
                        {loading ? <span className="loading" /> : '📝 Đăng ký'}
                    </button>
                </div>

                <div className="card">
                    <h4>🔑 Đăng nhập</h4>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" placeholder="Nhập email" value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input type="password" placeholder="Nhập mật khẩu" value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                    </div>
                    <button className="btn" onClick={doLogin} disabled={loading}>
                        {loading ? <span className="loading" /> : '🔑 Đăng nhập'}
                    </button>
                </div>

                <div className="card">
                    <h4>🔄 Refresh Token</h4>
                    <button className="btn btn-secondary" onClick={doRefresh} disabled={loading}>
                        {loading ? <span className="loading" /> : '🔄 Refresh Token'}
                    </button>
                </div>
            </div>

            <ResponsePanel response={response} />
        </div>
    );
}
