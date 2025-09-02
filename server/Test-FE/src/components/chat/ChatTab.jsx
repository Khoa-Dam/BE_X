import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { api, chatAPI, userAPI } from '../../services/api';

export default function ChatTab() {
    const [connected, setConnected] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [events, setEvents] = useState([]);
    const [me, setMe] = useState(null);
    const messagesEndRef = useRef(null);

    const socketRef = useRef(null);

    useEffect(() => {
        const s = io(api.defaults.baseURL.replace('/api/v1', ''), {
            withCredentials: true,
            transports: ['websocket'],
            auth: {
                token: api.defaults.headers.common['Authorization']?.replace('Bearer ', ''),
            },
        });
        socketRef.current = s;

        s.on('connect', () => setConnected(true));
        s.on('disconnect', () => setConnected(false));
        s.on('chat:message', (payload) => {
            setEvents((e) => [{ ts: Date.now(), type: 'chat:message', payload }, ...e]);
            if (activeChat && payload.chatId === activeChat._id) {
                setMessages((prev) => [...prev, payload.message]);
            }
        });

        return () => { s.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            // load me
            try {
                const meRes = await userAPI.getMe();
                if (meRes?.success) setMe(meRes.data);
            } catch { }
            // load chats
            const res = await chatAPI.getChats();
            if (res?.success) setChatList(res.data);
        })();
    }, []);

    // Auto open first chat and load history
    useEffect(() => {
        if (!activeChat && chatList && chatList.length > 0) {
            openChat(chatList[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatList]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function openChat(chat) {
        setActiveChat(chat);
        socketRef.current?.emit('chat:join', chat._id);
        const res = await chatAPI.getMessages(chat._id);
        if (res?.success) setMessages(res.data);
    }

    async function handleSend() {
        if (!activeChat || !text.trim()) return;
        const res = await chatAPI.sendMessage(activeChat._id, text.trim());
        if (res?.success) {
            // server returns updated chat; append last message optimistically
            setMessages((prev) => [...prev, { content: text.trim(), sender: { name: 'Me' }, createdAt: new Date().toISOString() }]);
            setText('');
        }
    }

    return (
        <div className="chat-container">
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className={`dot ${connected ? 'dot-online' : 'dot-offline'}`} />
                    <span>{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="chat-list">
                    {chatList.map((c) => (
                        <div
                            key={c._id}
                            className={`chat-list-item ${activeChat?._id === c._id ? 'active' : ''}`}
                            onClick={() => openChat(c)}
                        >
                            <div className="avatar">
                                {c.participants?.filter((p) => p._id !== me?._id)[0]?.name?.[0] ?? 'C'}
                            </div>
                            <div className="meta">
                                <div className="name">{c.participants?.map((p) => p.name).join(', ')}</div>
                                <div className="last">{c.lastMessage?.content ?? 'No messages yet'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="chat-main">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div className="title">{activeChat.participants?.map((p) => p.name).join(', ')}</div>
                        </div>
                        <div className="chat-messages">
                            {messages.map((m, idx) => {
                                const senderId = m.sender?._id || m.sender;
                                const isMe = me && senderId && String(senderId) === String(me.id || me._id);
                                return (
                                    <div key={idx} className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                                        <div className="content">{m.content}</div>
                                        <div className="time">{new Date(m.createdAt || Date.now()).toLocaleTimeString()}</div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-composer">
                            <input
                                className="chat-input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Aa"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                            />
                            <button className="btn-send" onClick={handleSend} disabled={!text.trim()}>Gửi</button>
                        </div>
                    </>
                ) : (
                    <div className="chat-empty">Chọn một cuộc chat để bắt đầu</div>
                )}

                <div className="card" style={{ marginTop: 12 }}>
                    <h3>Events</h3>
                    <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(events, null, 2)}</pre>
                </div>
            </main>
        </div>
    );
}
