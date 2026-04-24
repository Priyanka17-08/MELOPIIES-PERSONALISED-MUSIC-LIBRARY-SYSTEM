import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NOTE_CHARS = ['♪', '♫', '♬', '♩', '🎵', '🎶', '🎼', '🎸', '🎹', '🎺', '🥁', '🎻'];

function FloatingNote({ note, style }) {
  return (
    <div className="float-note" style={style}>{note}</div>
  );
}

export default function LoginPage() {
  const { doLogin }  = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
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
    setLoading(true);
    try {
      await doLogin(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">

      {/* ── Animated waveform bars ── */}
      <div className="wave-container">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="wave-bar" style={{
            animationDelay: (i * 0.08) + 's',
            height: (20 + Math.random() * 60) + 'px',
          }} />
        ))}
      </div>

      {/* ── Floating music notes ── */}
      {notes.map(n => (
        <FloatingNote
          key={n.id}
          note={n.note}
          style={{
            left:            n.left + '%',
            fontSize:        n.size + 'px',
            opacity:         n.opacity,
            animationDelay:  n.delay + 's',
            animationDuration: n.dur + 's',
          }}
        />
      ))}

      {/* ── Vinyl record decoration ── */}
      <div className="vinyl-left">
        <div className="vinyl-disk">
          <div className="vinyl-label">
            <div className="vinyl-dot" />
          </div>
        </div>
      </div>
      <div className="vinyl-right">
        <div className="vinyl-disk vinyl-disk-sm">
          <div className="vinyl-label">
            <div className="vinyl-dot" />
          </div>
        </div>
      </div>

      {/* ── Login Card ── */}
      <div className="login-card-new">
        <div className="login-logo">
          <div className="login-logo-icon">🎵</div>
          <div className="login-logo-text">Melopiies</div>
          <div className="login-logo-sub">Your music, your world</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="login-form-new">
          <div className="login-field">
            <span className="login-field-icon">📧</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              required
              placeholder="Email address"
              className="login-input-new"
            />
          </div>
          <div className="login-field">
            <span className="login-field-icon">🔒</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handle}
              required
              placeholder="Password"
              className="login-input-new"
            />
          </div>
          <button className="login-btn-new" disabled={loading}>
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span>Sign In ♪</span>
            )}
          </button>
        </form>

        <p className="login-register-link">
          New here? <Link to="/register">Create account</Link>
        </p>
        <p className="login-demo-hint">
          Demo: demo@musiclib.com / priya
        </p>
      </div>

      {/* ── Bottom soundwave ── */}
      <div className="bottom-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,0 1440,60 L1440,120 L0,120 Z"
            fill="rgba(124,106,245,0.12)" />
          <path d="M0,80 C200,20 400,100 600,60 C800,20 1000,100 1200,60 C1350,30 1440,80 1440,80 L1440,120 L0,120 Z"
            fill="rgba(124,106,245,0.06)" />
        </svg>
      </div>
    </div>
  );
}