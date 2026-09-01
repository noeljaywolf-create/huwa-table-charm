import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/account');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-stone-800">Sign in</h1>
        <p className="text-sm text-stone-500 mt-1">Demo: <span className="font-mono">demo@huwa.com</span> / <span className="font-mono">Pass1234!</span> · Admin: <span className="font-mono">admin@huwa.com</span></p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-stone-600">New here? <Link to="/register" className="text-teal-700 font-medium">Create an account</Link></p>
      </div>
    </div>
  );
}
