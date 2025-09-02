import { useState } from 'react';
import { getMe, updateMe, uploadAvatar } from '../../services/auth';
import ResponsePanel from '../ResponsePanel';

export default function UsersTab({ user, setUser }) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [name, setName] = useState('');

    const handleResponse = (data, isError = false) =>
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });

    const getProfile = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        setLoading(true);
        try {
            const res = await getMe();
            if (res.success) {
                setUser(res.data);
                handleResponse(res);
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Lấy profile thất bại', true);
        } finally { setLoading(false); }
    };

    const doUpdateProfile = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        if (!name) return handleResponse('Vui lòng nhập tên mới', true);
        setLoading(true);
        try {
            const res = await updateMe({ name });
            if (res.success) {
                setUser(res.data);
                handleResponse(res);
                setName('');
            }
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Cập nhật profile thất bại', true);
        } finally { setLoading(false); }
    };

    const onUploadAvatar = async (e) => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const res = await uploadAvatar(file);
            if (res.success) {
                setUser(res.data.user);
                handleResponse(res);
            }
        } catch (e2) {
            handleResponse(e2?.response?.data?.error?.message || 'Upload avatar thất bại', true);
        } finally { setLoading(false); }
    };

    return (
        <div className="tab-content active">
            <h2>👤 User APIs</h2>

            <div className="grid">
                <div className="card">
                    <h4>👤 Lấy thông tin profile</h4>
                    <button className="btn" onClick={getProfile} disabled={loading}>
                        {loading ? <span className="loading"></span> : '👤 Get Profile'}
                    </button>
                </div>

                <div className="card">
                    <h4>✏️ Cập nhật profile</h4>
                    <div className="form-group">
                        <label>Tên mới:</label>
                        <input type="text" placeholder="Nhập tên mới" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <button className="btn" onClick={doUpdateProfile} disabled={loading}>
                        {loading ? <span className="loading"></span> : '💾 Cập nhật'}
                    </button>
                </div>

                <div className="card">
                    <h4>🖼️ Upload Avatar</h4>
                    <div className="file-upload" onClick={() => document.getElementById('avatarFile').click()}>
                        <input type="file" id="avatarFile" accept="image/*" onChange={onUploadAvatar} />
                        <p>📁 Click để chọn file ảnh</p>
                    </div>
                </div>
            </div>

            <ResponsePanel response={response} />
        </div>
    );
}
