import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import useStore from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useStore();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await register({ name: form.name, email: form.email, password: form.password });
      } else {
        data = await login({ email: form.email, password: form.password });
      }
      loginUser(data.access_token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500">
            {isRegister
              ? 'Sign up to start renting or listing trees'
              : 'Sign in to manage your rentals'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update('name')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Your name"
                />
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={update('password')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : isRegister
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-primary font-medium hover:underline"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-400 mt-2">
          <Link to="/trees" className="hover:text-gray-600">
            Or continue browsing without signing in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
