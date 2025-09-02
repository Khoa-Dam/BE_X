import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserByEmail } from '../utils/db';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    const user = await getUserByEmail(email);

    if (!user || user.password !== password) { // In a real app, compare hashed passwords
      toast.error('Invalid email or password');
      return;
    }

    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Login successful!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-black p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-black font-bold text-2xl">H</span>
          </div>
          <h1 className="text-3xl font-bold">Sign in to Hulk-Hub</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
          <button type="submit" className="w-full bg-white text-black font-bold py-3 px-4 rounded-full hover:bg-gray-200 transition-colors">
            Sign In
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-4 text-gray-500">or</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <div className="space-y-4">
          <button className="w-full bg-white text-black font-semibold py-2 px-4 rounded-full border border-gray-700 hover:bg-gray-200 transition-colors">
            Sign in with Google
          </button>
          <button className="w-full bg-white text-black font-semibold py-2 px-4 rounded-full border border-gray-700 hover:bg-gray-200 transition-colors">
            Sign in with Apple
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-6 text-center text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
