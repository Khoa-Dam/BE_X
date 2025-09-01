import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { api } from "../../services/api";
import ResponsePanel from "../ResponsePanel";

export default function ChatTab() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [response, setResponse] = useState(null);
  const messagesEndRef = useRef(null);

  const handleResponse = (data, isError = false) =>
    setResponse({ data, isError, timestamp: new Date().toLocaleString() });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Kết nối socket
    const newSocket = io("http://localhost:4000", {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    newSocket.on("chat:message", (data) => {
      if (activeChat?._id === data.chatId) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
        scrollToBottom();
      }
    });

    setSocket(newSocket);
    fetchChats();

    return () => newSocket.close();
    // eslint-disable-next-line
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data.data);
    } catch (e) {
      handleResponse(e?.response?.data?.error?.message || "Lỗi lấy danh sách chats", true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    try {
      const res = await api.post(`/chats/${activeChat._id}/messages`, {
        content: message,
      });
      setMessage("");
      setActiveChat(res.data.data);
      scrollToBottom();
    } catch (e) {
      handleResponse(e?.response?.data?.error?.message || "Lỗi gửi tin nhắn", true);
    }
  };

  return (
    <div className="tab-content active">
      <h2>💬 Chat</h2>

      <div className="grid">
        {/* Sidebar */}
        <div className="card" style={{ minHeight: "400px" }}>
          <h4>📂 Danh sách hội thoại</h4>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`post-item ${
                    activeChat?._id === chat._id ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveChat(chat)}
                >
                  <strong>
                    {chat.participants
                      .filter((p) => p._id !== localStorage.getItem("userId"))
                      .map((p) => p.name)
                      .join(", ")}
                  </strong>
                </div>
              ))
            ) : (
              <p className="meta">Không có hội thoại nào</p>
            )}
          </div>
        </div>

        {/* Chat main */}
        <div className="card" style={{ minHeight: "400px", display: "flex", flexDirection: "column" }}>
          {activeChat ? (
            <>
              <h4>💬 {activeChat.participants.map((p) => p.name).join(", ")}</h4>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 10,
                  background: "#f8f9fa",
                }}
              >
                {activeChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 12,
                      textAlign:
                        msg.sender._id === localStorage.getItem("userId")
                          ? "right"
                          : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        background:
                          msg.sender._id === localStorage.getItem("userId")
                            ? "#667eea"
                            : "#e0e0e0",
                        color:
                          msg.sender._id === localStorage.getItem("userId")
                            ? "#fff"
                            : "#333",
                        padding: "8px 12px",
                        borderRadius: 12,
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                        {msg.sender.name}
                      </div>
                      <div>{msg.content}</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                style={{ display: "flex", gap: 10 }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="form-group"
                  style={{ flex: 1, padding: 10 }}
                />
                <button type="submit" className="btn">
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="meta" style={{ textAlign: "center", margin: "auto" }}>
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </div>

      <ResponsePanel response={response} />
    </div>
  );
}
