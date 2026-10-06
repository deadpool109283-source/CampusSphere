import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import '../styles/login.css';

const previewRoles = [
  { role: 'STUDENT', label: 'Student', detail: 'A personal campus home' },
  { role: 'CLUB_EXECUTIVE', label: 'Club executive', detail: 'Event-day attendance preview' },
  { role: 'CLUB_PRESIDENT', label: 'Club president / OB', detail: 'Event requests and club operations' },
  { role: 'FACULTY', label: 'Club mentor', detail: 'Club and attendance reviews' },
  { role: 'ADMIN', label: 'Student Affairs', detail: 'Club setup and final approvals' },
];

export default function Login() {
  const { signIn, startPreview, supabaseConfigured, authError } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(location.state?.from || '/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handlePreview(role) {
    startPreview(role);
    navigate(location.state?.from || '/app', { replace: true });
  }

  return (
    <main className="login-page">
      <header className="public-header">
        <Link className="public-brand" to="/"><span className="brand-seal">C</span>Campus<span>Sphere</span></Link>
        <Link className="quiet-button" to="/">Return to campus <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="login-layout">
        <section className="login-intro">
          <p className="eyebrow">Your campus, in one place</p>
          <h1>Come in.<br /><em>Find your people.</em></h1>
          <p>CampusSphere brings clubs, events, and student life into one shared campus space.</p>
          <span className="login-intro-note">AMRITA · CAMPUS LIFE, CONNECTED</span>
        </section>
        <section className="login-panel" aria-labelledby="login-heading">
          <p className="eyebrow">CampusSphere access</p>
          <h2 id="login-heading">Sign in to your campus</h2>

          {supabaseConfigured ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-label">
                <span>College email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="auth-label">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {(error || authError) && (
                <div className="auth-error-notice" role="alert">
                  {error || authError}
                </div>
              )}
              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in to campus ↗'}
              </button>
            </form>
          ) : (
            <div className="auth-unavailable" role="status">
              <strong>Supabase Auth not configured yet.</strong>
              <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>client/.env</code> to connect real college accounts issued by ICTS.</p>
            </div>
          )}

          <div className="preview-access">
            <div className="preview-heading">
              <span>DEVELOPMENT ONLY</span>
              <span>UI preview sessions</span>
            </div>
            <p>Preview role-specific layouts without credentials.</p>
            <div className="preview-role-list">
              {previewRoles.map((item) => (
                <button key={item.role} type="button" onClick={() => handlePreview(item.role)}>
                  <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
          <p className="login-footnote">For account access, contact Student Affairs or ICTS. Accounts are secured with Supabase Auth & verified by CampusSphere API.</p>
        </section>
      </div>
      <footer className="login-footer">
        <Link to="/">CampusSphere</Link>
        <span>DBMS Mini-Project · Amrita Vishwa Vidyapeetham</span>
      </footer>
    </main>
  );
}
