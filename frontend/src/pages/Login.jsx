import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/employer', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    if (role === 'admin') { setEmail('admin@sahod.ph'); setPassword('admin123'); }
    else { setEmail('employer@sahod.ph'); setPassword('employer123'); }
  }

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="glyph">₱</div>
        <h1>Payroll, signed in.</h1>
        <p>Sahod runs payroll for Philippine teams — admins manage the whole system, employers run payroll and check their people.</p>
        <div className="demo-box">
          <b>Demo accounts</b><br />
          Admin — admin@sahod.ph / admin123<br />
          Employer — employer@sahod.ph / employer123
        </div>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="sub">Enter your email and password to open your dashboard.</p>
          {error && <div className="error-msg">{error}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ph" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fillDemo('admin')}>Use admin demo</button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fillDemo('employer')}>Use employer demo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
