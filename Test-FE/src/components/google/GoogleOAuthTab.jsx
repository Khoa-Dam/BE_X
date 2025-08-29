import ResponsePanel from '../ResponsePanel';
import { useState } from 'react';
import { doGoogleLogin } from '../../services/auth';

export default function GoogleOAuthTab() {
    const [response, setResponse] = useState(null);
    return (
        <div className="tab-content active">
            <h2>🌐 Google OAuth</h2>
            <div className="card">
                <h4>🔑 Đăng nhập bằng Google</h4>
                <p>Click vào nút bên dưới để đăng nhập bằng Google:</p>
                <button className="btn" onClick={doGoogleLogin}>🌐 Đăng nhập Google</button>
            </div>
            <ResponsePanel response={response} />
        </div>
    );
}
