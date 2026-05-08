import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent2)', letterSpacing: '-1px', marginBottom: 8 }}>TaskFlow</div>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Sign in to your workspace</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" placeholder="you@company.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text2)' }}>
            Demo: <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text)', fontSize: 12 }}>admin@taskflow.com / admin1234</span>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
          No account? <Link to="/signup" style={{ color: 'var(--accent2)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
