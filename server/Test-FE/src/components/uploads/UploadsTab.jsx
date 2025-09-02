import { useState } from 'react';
import { uploadFile, getFileMeta, deleteFile } from '../../services/files';
import ResponsePanel from '../ResponsePanel';

export default function UploadsTab({ user }) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [fileId, setFileId] = useState('');
    const [deleteId, setDeleteId] = useState('');

    const handleResponse = (data, isError = false) =>
        setResponse({ data, isError, timestamp: new Date().toLocaleString() });

    const onUpload = async (e) => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const res = await uploadFile(file);
            handleResponse(res);
        } catch (e2) {
            handleResponse(e2?.response?.data?.error?.message || 'Upload file thất bại', true);
        } finally { setLoading(false); }
    };

    const onGetMeta = async () => {
        if (!fileId) return handleResponse('Vui lòng nhập ID file', true);
        setLoading(true);
        try {
            const res = await getFileMeta(fileId);
            handleResponse(res);
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Lấy thông tin file thất bại', true);
        } finally { setLoading(false); }
    };

    const onDelete = async () => {
        if (!user) return handleResponse('Vui lòng đăng nhập trước', true);
        if (!deleteId) return handleResponse('Vui lòng nhập ID file', true);
        if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;
        setLoading(true);
        try {
            const res = await deleteFile(deleteId);
            handleResponse(res);
            setDeleteId('');
        } catch (e) {
            handleResponse(e?.response?.data?.error?.message || 'Xóa file thất bại', true);
        } finally { setLoading(false); }
    };

    return (
        <div className="tab-content active">
            <h2>📤 Upload APIs</h2>

            <div className="grid">
                <div className="card">
                    <h4>📁 Upload File</h4>
                    <div className="file-upload" onClick={() => document.getElementById('uploadFile').click()}>
                        <input type="file" id="uploadFile" onChange={onUpload} />
                        <p>📁 Click để chọn file</p>
                    </div>
                </div>

                <div className="card">
                    <h4>ℹ️ Lấy thông tin file</h4>
                    <div className="form-group">
                        <label>File ID:</label>
                        <input type="text" placeholder="Nhập ID file" value={fileId} onChange={(e) => setFileId(e.target.value)} />
                    </div>
                    <button className="btn" onClick={onGetMeta} disabled={loading}>
                        {loading ? <span className="loading"></span> : 'ℹ️ Lấy thông tin'}
                    </button>
                </div>

                <div className="card">
                    <h4>🗑️ Xóa file</h4>
                    <div className="form-group">
                        <label>File ID:</label>
                        <input type="text" placeholder="Nhập ID file" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
                    </div>
                    <button className="btn btn-danger" onClick={onDelete} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🗑️ Xóa'}
                    </button>
                </div>
            </div>

            <ResponsePanel response={response} />
        </div>
    );
}
