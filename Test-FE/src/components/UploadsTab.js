import React from 'react';

const UploadsTab = ({
    user,
    loading,
    response,
    onUploadFile,
    onGetFileMeta,
    onDeleteFile
}) => {
    return (
        <div id="uploads" className="tab-content">
            <h2>📤 Upload APIs</h2>

            <div className="grid">
                <div className="card">
                    <h4>📁 Upload File</h4>
                    <div className="file-upload" onClick={() => document.getElementById('uploadFile').click()}>
                        <input
                            type="file"
                            id="uploadFile"
                            onChange={onUploadFile}
                        />
                        <p>📁 Click để chọn file</p>
                    </div>
                </div>

                <div className="card">
                    <h4>ℹ️ Lấy thông tin file</h4>
                    <div className="form-group">
                        <label>File ID:</label>
                        <input type="text" id="fileId" placeholder="Nhập ID file" />
                    </div>
                    <button className="btn" onClick={onGetFileMeta} disabled={loading}>
                        {loading ? <span className="loading"></span> : 'ℹ️ Lấy thông tin'}
                    </button>
                </div>

                <div className="card">
                    <h4>🗑️ Xóa file</h4>
                    <div className="form-group">
                        <label>File ID:</label>
                        <input type="text" id="deleteFileId" placeholder="Nhập ID file" />
                    </div>
                    <button className="btn btn-danger" onClick={onDeleteFile} disabled={loading}>
                        {loading ? <span className="loading"></span> : '🗑️ Xóa'}
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

export default UploadsTab;
