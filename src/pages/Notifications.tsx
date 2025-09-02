import React, { useState } from 'react';
import { Heart, User, MessageSquare, AtSign, Settings2, Star } from 'lucide-react';

// Define interfaces for our data structures
interface UserProfile {
    name: string;
    avatar: string;
    bio?: string;
}

interface PostInfo {
    excerpt: string;
}

interface Notification {
    id: number;
    type: 'like' | 'follow' | 'reply' | 'mention';
    user: UserProfile;
    post?: PostInfo;
    reply?: PostInfo;
    time: string;
}

// Placeholder data for notifications
const notificationsData: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    post: { excerpt: 'A beautiful sunset over the mountains.' },
    time: '2h',
  },
  {
    id: 2,
    type: 'follow',
    user: { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', bio: 'Photographer & Traveler. Capturing moments from around the world.' },
    time: '5h',
  },
  {
    id: 3,
    type: 'reply',
    user: { name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    reply: { excerpt: 'This looks great! Check out my profile for more art.' },
    time: '1d',
  },
  {
    id: 4,
    type: 'mention',
    user: { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
    post: { excerpt: 'Just saw the new Hulk-Hub feature, @yourhandle you should check it out.' },
    time: '2d',
  },
  {
    id: 5,
    type: 'like',
    user: { name: 'Maria Chan', avatar: 'https://wallpapers.com/images/high/anime-profile-picture-jioug7q8n43yhlwn.jpg'},
    post: { excerpt: 'わあ！とてもきれいですね。好きです！ - Wow! Its so beautiful. I like it!'},
    time: '3h',
  }
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'like': return <Heart size={24} className="text-red-500" />;
    case 'follow': return <User size={24} className="text-blue-500" />;
    case 'reply': return <MessageSquare size={24} className="text-green-500" />;
    case 'mention': return <AtSign size={24} className="text-purple-500" />;
    default: return <Star size={24} className="text-yellow-500" />;
  }
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
    const contentText = notification.post?.excerpt || notification.reply?.excerpt;

    return (
        <div className="p-4 flex space-x-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors duration-200 ease-in-out cursor-pointer">
            <div className="w-8 flex-shrink-0 mt-1">
                <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <img src={notification.user.avatar} alt={notification.user.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="text-white">
                            <span className="font-bold hover:underline">{notification.user.name}</span>
                            {notification.type === 'like' && ' liked your post'}
                            {notification.type === 'follow' && ' followed you'}
                            {notification.type === 'reply' && ' replied to your post'}
                            {notification.type === 'mention' && ' mentioned you'}
                        </p>
                        <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                </div>
                
                {contentText && (
                    <p className="text-gray-400 pl-13">
                        {contentText}
                    </p>
                )}

                {notification.type === 'follow' && notification.user.bio && (
                    <p className="text-gray-400 pl-13">
                        {notification.user.bio}
                    </p>
                )}
            </div>
        </div>
    );
};

const Notifications = () => {
  const [filter, setFilter] = useState('All');
  const tabs = ['All', 'Verified', 'Mentions'];

  const parseTime = (time: string): number => {
    const value = parseInt(time.slice(0, -1));
    const unit = time.slice(-1);
    switch (unit) {
      case 'h':
        return value;
      case 'd':
        return value * 24;
      default:
        return 0;
    }
  };

  const sortedNotifications = [...notificationsData].sort((a, b) => parseTime(a.time) - parseTime(b.time));

  return (
    <div className="w-full">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-xl border-b border-gray-800 p-3 flex items-center justify-between z-10">
            <h1 className="text-xl font-bold">Notifications</h1>
            <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                <Settings2 size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 flex">
            {tabs.map(tab => (
                <button 
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 text-center py-3 font-semibold transition-colors duration-200 relative ${filter === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-900/50'}`}>
                {tab}
                {filter === tab && <div className="absolute bottom-0 left-0 right-0 mx-auto w-14 h-1 bg-blue-500 rounded-full"></div>}
                </button>
            ))}
        </div>

        <div>
            {sortedNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    </div>
  );
};

export default Notifications;