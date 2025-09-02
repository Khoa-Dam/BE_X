import React, { useEffect, useState } from 'react';
import { Home, Compass, Bell, Mail, Bookmark, User as UserIcon, MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/db';

interface User {
  id?: number;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string;
  backgroundAvatar: string;
  occupation: string;
  location: string;
  joinDate: string;
  stats: {
    following: number;
    followers: number;
  };
}

const Sidebar = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, [location]);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">H</span> 
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-4 px-3 py-3 rounded-full hover:bg-gray-900 transition-colors ${
                  location.pathname === item.path ? 'font-bold' : ''
                }`}
              >
                <item.icon size={26} />
                <span className="text-xl hidden xl:block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Post Button */}
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full mt-6 w-full xl:w-auto">
        <Link to="/">
          <span className="hidden xl:block">Post</span>
          <span className="xl:hidden">+</span>
        </Link>
      </button>

      {/* User Profile */}
      <div className="mt-auto pt-4">
        <Link to="/profile">
          {user && (
              <div className="flex items-center justify-between p-3 rounded-full hover:bg-gray-900 cursor-pointer w-full">
                  <div className="flex items-center space-x-3">
                      <img
                          src={user.avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="hidden xl:block">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-gray-500 text-sm">@{user.username}</div>
                      </div>
                  </div>
                  <MoreHorizontal className="hidden xl:block" size={20} />
              </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
