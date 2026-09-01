import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
        <h1 className="text-2xl font-bold text-stone-800">Create account</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {(['name', 'email', 'password'] as const).map((f) => (
            <div key={f}>
              <label className="block text-sm text-stone-600 capitalize mb-1">{f}</label>
              <input
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
                required
                minLength={f === 'password' ? 8 : undefined}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-50">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-stone-600">Already registered? <Link to="/login" className="text-teal-700 font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
