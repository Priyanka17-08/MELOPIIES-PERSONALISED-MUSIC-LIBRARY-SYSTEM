import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NOTE_CHARS = ['♪', '♫', '♬', '♩', '🎵', '🎶', '🎼', '🎸', '🎹', '🎺'];

export default function RegisterPage() {
  const { doSignup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes]     = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id:    i,
      note:  NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)],
      left:  Math.random() * 100,
      delay: Math.random() * 8,
      dur:   6 + Math.random() * 8,
      size:  14 + Math.random() * 22,
      opacity: 0.15 + Math.random() * 0.4,
    }));
    setNotes(generated);
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return; }
    setLoading(true);
    try {
      await doSignup(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="wave-container">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="wave-bar" style={{
            animationDelay: (i * 0.08) + 's',
            height: (20 + Math.random() * 60) + 'px',
          }} />
        ))}
      </div>

      {notes.map(n => (
        <div key={n.id} className="float-note" style={{
          left: n.left + '%', fontSize: n.size + 'px',
          opacity: n.opacity, animationDelay: n.delay + 's',
          animationDuration: n.dur + 's',
        }}>
          {n.note}
        </div>
      ))}

      <div className="vinyl-left">
        <div className="vinyl-disk">
          <div className="vinyl-label"><div className="vinyl-dot" /></div>
        </div>
      </div>

      <div className="login-card-new">
        <div className="login-logo">
          <div className="login-logo-icon">🎵</div>
          <div className="login-logo-text">Melopiies</div>
          <div className="login-logo-sub">Join the music community</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="login-form-new">
          <div className="login-field">
            <span className="login-field-icon">👤</span>
            <input type="text" name="username" value={form.username}
              onChange={handle} required placeholder="Username"
              className="login-input-new" />
          </div>
          <div className="login-field">
            <span className="login-field-icon">📧</span>
            <input type="email" name="email" value={form.email}
              onChange={handle} required placeholder="Email address"
              className="login-input-new" />
          </div>
          <div className="login-field">
            <span className="login-field-icon">🔒</span>
            <input type="password" name="password" value={form.password}
              onChange={handle} required placeholder="Password"
              className="login-input-new" />
          </div>
          <button className="login-btn-new" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account ♪'}
          </button>
        </form>

        <p className="login-register-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="bottom-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,0 1440,60 L1440,120 L0,120 Z"
            fill="rgba(124,106,245,0.12)" />
        </svg>
      </div>
    </div>
  );
}