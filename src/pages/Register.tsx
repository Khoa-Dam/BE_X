import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUser, getUserByEmail } from '../utils/db';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      toast.error('User with this email already exists');
      return;
    }

    const newUser = {
      name,
      email,
      password, // In a real app, hash this password
      username: email.split('@')[0],
      bio: '',
      avatar: `https://avatar.iran.liara.run/public`,
      backgroundAvatar: 'https://picsum.photos/seed/picsum/800/600',
      occupation: '',
      location: '',
      joinDate: new Date().toISOString(),
      stats: {
        following: 0,
        followers: 0,
      }
    };

    await addUser(newUser);
    toast.success('Registration successful!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-black p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-black font-bold text-2xl">H</span>
          </div>
          <h1 className="text-3xl font-bold">Create your account</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            <input type="checkbox" id="terms" name="terms" required />
            <label htmlFor="terms" className="ml-2">
              By signing up, you agree to the <Link to="#" className="text-blue-500 hover:underline">Terms of Service</Link> and <Link to="#" className="text-blue-500 hover:underline">Privacy Policy</Link>, including <Link to="#" className="text-blue-500 hover:underline">Cookie Use</Link>.
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-colors">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500">
          Have an account already?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
