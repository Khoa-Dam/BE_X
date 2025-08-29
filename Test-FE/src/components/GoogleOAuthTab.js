import React from 'react';

const GoogleOAuthTab = ({
    loading,
    response,
    onGoogleLogin
}) => {
    return (
        <div id="google" className="tab-content">
            <h2>🌐 Google OAuth</h2>

            <div className="card">
                <h4>🔑 Đăng nhập bằng Google</h4>
                <p>Click vào nút bên dưới để đăng nhập bằng Google:</p>
                <button className="btn" onClick={onGoogleLogin}>
                    🌐 Đăng nhập Google
                </button>
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

export default GoogleOAuthTab;
