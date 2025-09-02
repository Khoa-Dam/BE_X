import React from 'react';

const TabNavigation = ({ activeTab, onTabChange }) => {
    return (
        <div className="tabs">
            <button
                className={`tab ${activeTab === 'auth' ? 'active' : ''}`}
                onClick={() => onTabChange('auth')}
            >
                🔐 Authentication
            </button>
            <button
                className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => onTabChange('users')}
            >
                👤 Users
            </button>
            <button
                className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => onTabChange('posts')}
            >
                📝 Posts
            </button>
            <button
                className={`tab ${activeTab === 'uploads' ? 'active' : ''}`}
                onClick={() => onTabChange('uploads')}
            >
                📤 Uploads
            </button>
            <button
                className={`tab ${activeTab === 'google' ? 'active' : ''}`}
                onClick={() => onTabChange('google')}
            >
                🌐 Google OAuth
            </button>
        </div>
    );
};

export default TabNavigation;
