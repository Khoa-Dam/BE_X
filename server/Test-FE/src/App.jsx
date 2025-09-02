import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import AuthTab from './components/auth/AuthTab';
import UsersTab from './components/users/UsersTab';
import PostsTab from './components/posts/PostsTab';
import UploadsTab from './components/uploads/UploadsTab';
import GoogleOAuthTab from './components/google/GoogleOAuthTab';
import { getMe, refresh } from './services/auth';

export default function App() {
    const [activeTab, setActiveTab] = useState('auth');
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me?.success) setUser(me.data);
            } catch {
                try {
                    await refresh();
                    const me2 = await getMe();
                    if (me2?.success) setUser(me2.data);
                } catch (_) {
                    setUser(null);
                }
            }
        })();
    }, []);

    return (
        <div className="container">
            <Header />
            <Tabs active={activeTab} onChange={(k) => setActiveTab(k)} />
            <div className="content">
                {activeTab === 'auth' && <AuthTab user={user} setUser={setUser} />}
                {activeTab === 'users' && <UsersTab user={user} setUser={setUser} />}
                {activeTab === 'posts' && <PostsTab user={user} />}
                {activeTab === 'uploads' && <UploadsTab user={user} />}
                {activeTab === 'google' && <GoogleOAuthTab />}
            </div>
        </div>
    );
}
