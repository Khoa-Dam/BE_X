import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings2, MailPlus, Send, Smile, Paperclip } from 'lucide-react';

// Define interfaces for our data structures
interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
}

interface Conversation {
  id: number;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

// Placeholder data
const initialConversations: Conversation[] = [
    {
        id: 1,
        name: 'Tony Stark',
        username: 'ironman',
        avatar: 'https://media.istockphoto.com/id/1360554439/vi/anh/%C4%91%E1%BA%A3o-nhi%E1%BB%87t-%C4%91%E1%BB%9Bi-maldives.jpg?s=612x612&w=0&k=20&c=pqWxvBFhn0_mJQF-oNyiDS56iahHule2vZmmVbjc_TA=',
        lastMessage: 'Perfect, see you then.',
        time: '1h',
        unread: 2,
        messages: [
            { id: 1, text: 'Hey, how is it going?', time: '2h', sender: 'me' },
            { id: 2, text: 'Going good, what about you?', time: '2h', sender: 'other' },
            { id: 3, text: 'I am also good. I have a question.', time: '1h', sender: 'me' },
            { id: 4, text: 'Sure, ask away.', time: '1h', sender: 'other' },
            { id: 5, text: 'Perfect, see you then.', time: '1h', sender: 'me' },
        ]
    },
    {
        id: 2,
        name: 'Peter Parker',
        username: 'spiderman',
        avatar: 'https://picsum.photos/seed/picsum/400/400',
        lastMessage: 'Did you see that new movie? It was awesome!',
        time: '3h',
        unread: 0,
        messages: [
            { id: 1, text: 'Did you see that new movie? It was awesome!', time: '3h', sender: 'other' },
        ]
    },
    {
        id: 3,
        name: 'Steve Rogers',
        username: 'captainamerica',
        avatar: 'https://picsum.photos/seed/eiusmod/400/400',
        lastMessage: 'On my way.',
        time: '1d',
        unread: 0,
        messages: [
            { id: 1, text: 'On my way.', time: '1d', sender: 'other' },
        ]
    },
];

const ConversationItem = ({ conv, onClick, isSelected }: { conv: Conversation, onClick: () => void, isSelected: boolean }) => (
    <div className={`p-3 flex space-x-3 hover:bg-gray-900 cursor-pointer border-b border-gray-800 ${isSelected ? 'bg-gray-800' : ''}`} onClick={onClick}>
        <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1 min-w-0"> {/* min-w-0 để truncate hoạt động */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1 min-w-0 flex-1"> {/* Thêm min-w-0 và flex-1 */}
                    <span className="font-bold truncate">{conv.name}</span>
                    <span className="text-gray-500 truncate">@{conv.username}</span>
                </div>
                <span className="text-gray-500 text-sm ml-2 whitespace-nowrap">{conv.time}</span>
            </div>
            <div className="flex justify-between items-start mt-1">
                <p className="text-gray-400 truncate flex-1">{conv.lastMessage}</p> {/* Thêm flex-1 */}
                {conv.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2">
                        {conv.unread}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const ChatMessage = ({ message }: { message: Message }) => {
    const isMe = message.sender === 'me';
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                <p>{message.text}</p>
                <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} text-right`}>{message.time}</div>
            </div>
        </div>
    );
};

const Messages = () => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);


    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedConversation) return;

        const newMessageObj: Message = {
            id: selectedConversation.messages.length + 1,
            text: newMessage,
            time: 'Just now',
            sender: 'me',
        };

        const updatedConversations = conversations.map(conv => {
            if (conv.id === selectedConversation.id) {
                return {
                    ...conv,
                    messages: [...conv.messages, newMessageObj],
                    lastMessage: newMessage,
                    time: 'Just now',
                };
            }
            return conv;
        });

        setConversations(updatedConversations);
        const updatedSelectedConv = updatedConversations.find(c => c.id === selectedConversation.id);
        if (updatedSelectedConv) {
            setSelectedConversation(updatedSelectedConv);
        }
        setNewMessage('');
    };

    const handleSelectConversation = (conv: Conversation) => {
        const fullConv = conversations.find(c => c.id === conv.id);
        if (fullConv) {
            setSelectedConversation(fullConv);
        }
    }

    return (
        <div className="w-full h-screen flex">
            {/* Left Pane: Conversations */}
            <div className="w-2/5 border-r border-gray-800 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-xl p-3 flex items-center justify-between z-10 border-b border-gray-800">
                    <h1 className="text-xl font-bold">Messages</h1>
                    <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-white"><Settings2 size={20} /></button>
                        <button className="text-gray-400 hover:text-white"><MailPlus size={20} /></button>
                    </div>
                </div>
                {/* Search */}
                <div className="p-3 border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" placeholder="Search Direct Messages" className="w-full bg-gray-900 text-white rounded-full py-2 pl-11 pr-4 focus:outline-none" />
                    </div>
                </div>
                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => <ConversationItem key={conv.id} conv={conv} onClick={() => handleSelectConversation(conv)} isSelected={selectedConversation?.id === conv.id} />)}
                </div>
            </div>

            {/* Right Pane: Chat */}
            {selectedConversation ? (
                <div className="w-3/5 flex flex-col">
                    {/* Chat Header */}
                    <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-xl p-3 flex items-center z-10 border-b border-gray-800">
                        <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full object-cover mr-4" />
                        <div>
                            <h2 className="font-bold">{selectedConversation.name}</h2>
                            <p className="text-sm text-gray-500">@{selectedConversation.username}</p>
                        </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {selectedConversation.messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Start a new message"
                                className="w-full bg-gray-800 text-white rounded-full py-3 pl-20 pr-16 focus:outline-none"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex space-x-3">
                                <button className="text-gray-400 hover:text-white"><Smile size={22} /></button>
                                <button className="text-gray-400 hover:text-white"><Paperclip size={22} /></button>
                            </div>
                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                                onClick={handleSendMessage}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-3/5 flex flex-col items-center justify-center text-center p-8">
                    <div className="max-w-sm">
                        <h2 className="text-3xl font-bold mb-2">Select a message</h2>
                        <p className="text-gray-500">
                            Choose from your existing conversations, start a new one, or just keep swimming.
                        </p>
                        <button className="mt-6 bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600 transition-colors">
                            New Message
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;

