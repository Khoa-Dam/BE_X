export default function Tabs({ active, onChange }) {
    const items = [
        { key: 'auth', label: '🔐 Authentication' },
        { key: 'users', label: '👤 Users' },
        { key: 'posts', label: '📝 Posts' },
        { key: 'uploads', label: '📤 Uploads' },
        { key: 'google', label: '🌐 Google OAuth' },
        { key: 'chat', label: '💬 Chat' }
    ];

    return (
        <div className="tabs">
            {items.map((t) => (
                <button
                    key={t.key}
                    className={`tab ${active === t.key ? 'active' : ''}`}
                    onClick={() => onChange(t.key)}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
