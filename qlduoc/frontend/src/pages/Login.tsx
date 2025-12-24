import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      
      console.log('Login success:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      alert('Đăng nhập thành công!');
      navigate('/');
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Left side - Image */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
          alt="Pharmacy Management" 
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
        />
        <div className="z-20 p-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Quản Lý Dược</h1>
          <p className="text-lg text-blue-100 mb-8">
            Hệ thống quản lý dược phẩm toàn diện, hiệu quả và chính xác.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-500 opacity-20 z-10"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400 opacity-20 z-10"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Đăng nhập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            &copy; 2025 QLDuoc System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
