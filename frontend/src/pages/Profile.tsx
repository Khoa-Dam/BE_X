import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUser } from '../utils/db';
import toast from 'react-hot-toast';

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

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEditedUser(currentUser);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditedUser({ ...user });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedUser) {
      await updateUser(editedUser);
      localStorage.setItem('user', JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editedUser) {
      setEditedUser({ ...editedUser, [name]: value });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editedUser) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editedUser) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, backgroundAvatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logout successful!');
    navigate('/login');
  };

  if (!user || !editedUser) {
    return <div>Loading...</div>; // Or a more sophisticated loading state
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-md">
          {/* Background Avatar and Profile Header */}
          <div className="relative">
            <img
              src={editedUser.backgroundAvatar}
              alt="Background Avatar"
              className="w-full h-64 object-cover rounded-t-lg"
            />
            {isEditing && (
              <>
                <button 
                  onClick={() => backgroundInputRef.current?.click()}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  Edit Background
                </button>
                <input
                  type="file"
                  ref={backgroundInputRef}
                  onChange={handleBackgroundChange}
                  className="hidden"
                  accept="image/*"
                />
              </>
            )}
            <div className="absolute bottom-0 left-4 transform translate-y-1/2">
              <img
                src={editedUser.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-900"
              />
              {isEditing && (
                <>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    Edit
                  </button>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
                </>
              )}
            </div>
            <div className="absolute bottom-4 right-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 ease-in-out">
                    Save
                  </button>
                  <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-400 transition-colors duration-300 ease-in-out">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={handleEdit} className="border border-blue-500 text-blue-500 px-4 py-2 bg-opacity-40 bg-gray-500 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="pt-20 px-6 pb-6">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-500">@{user.username}</p>
            </div>

            <div className="mt-4 flex flex-col space-y-2 text-gray-400 text-lg">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{user.occupation}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.location}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-start space-x-8">
              <div className="text-center flex">
                <p className="font-bold text-lg">{user.stats.following}</p>
                <p className="text-gray-400 text-lg ml-1">Following</p>
              </div>
              <div className="text-center flex">
                <p className="font-bold text-lg">{user.stats.followers}</p>
                <p className="text-gray-400 text-lg ml-1">Followers</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold">Bio</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedUser.bio}
                  onChange={handleChange}
                  className="w-full mt-2 p-2 border transition-color duration-200 bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  rows={4}
                />
              ) : (
                <p className="text-gray-400 mt-2 text-lg">{user.bio}</p>
              )}
            </div>

            {isEditing && (
              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xl font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedUser.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 transition-color duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-xl font-medium">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editedUser.username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 transition-color duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className="block text-xl font-medium">Occupation</label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={editedUser.occupation}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 transition-color duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-xl font-medium">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editedUser.location}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 transition-color duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="joinDate" className="block text-xl font-medium">Join Date</label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={editedUser.joinDate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 transition-color duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </form>
            )}

            <div className="mt-8 border-t border-gray-700 pt-5">
              <button
                onClick={handleLogout}
                className="w-full text-center text-red-500 hover:bg-red-500 hover:text-white px-3 py-3 rounded-md transition-colors duration-300 ease-in-out"
              >
                Log Out
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;