import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import { useSession } from '../auth/useSession';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/login.css';

export default function Login() {
  const { signIn, resetPassword, supabaseConfigured, authError } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'forgot'
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      const rawFrom = location.state?.from;
      const safeRedirect = typeof rawFrom === 'string' && rawFrom.startsWith('/') && !rawFrom.startsWith('//') && !rawFrom.includes('\\')
        ? rawFrom
        : '/app';
      navigate(safeRedirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    if (!email) return;
    setResetError('');
    setResetLoading(true);
    try {
      if (resetPassword) {
        await resetPassword(email);
      }
      setResetSent(true);
    } catch (err) {
      setResetError(err.message || 'Unable to send recovery email. Please check the address.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="login-page">
      <header className="public-header public-header-clean">
        <div className="login-header-actions">
          <ThemeToggle />
          <Link className="login-return-button" to="/" aria-label="Return to Campus Home">
            <ArrowLeft size={14} />
            <span>Return to campus</span>
          </Link>
        </div>
      </header>

      <div className="login-center-stage">
        <section className="login-panel-card" aria-label="Authentication">
          <div className="auth-card-header">
            <Link to="/" className="auth-brand-center" aria-label="Amrita Sangam Home">
              <span className="auth-brand-title">
                Amrita<span className="auth-brand-accent">Sangam</span>
              </span>
              <span className="auth-brand-caption">Campus Life & Engagement Portal</span>
            </Link>
            <h2>{mode === 'signin' ? 'Sign in' : 'Reset password'}</h2>
          </div>

          {supabaseConfigured ? (
            mode === 'signin' ? (
              <form className="auth-form-minimal" onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <label htmlFor="login-email" className="auth-field-label">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@amrita.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="login-password" className="auth-field-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {(error || authError) && (
                  <div className="auth-error-notice" role="alert">
                    {error || authError}
                  </div>
                )}

                <button className="auth-submit-btn-minimal" type="submit" disabled={loading}>
                  {loading ? 'Verifying…' : (
                    <>
                      Sign in <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="auth-forgot-row">
                  <button
                    type="button"
                    className="auth-link-subtle"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setResetSent(false);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              /* Forgot Password Form */
              <form className="auth-form-minimal" onSubmit={handleResetPassword}>
                {resetSent ? (
                  <div className="auth-success-state">
                    <CheckCircle2 size={32} className="auth-success-icon" />
                    <h3>Recovery link sent</h3>
                    <p>Check <strong>{email}</strong> for instructions to reset your password.</p>
                    <button
                      type="button"
                      className="auth-secondary-btn-minimal"
                      onClick={() => {
                        setMode('signin');
                        setResetSent(false);
                      }}
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="auth-forgot-desc">
                      Enter your university email and we will send you a recovery link.
                    </p>
                    <div className="auth-input-group">
                      <label htmlFor="reset-email" className="auth-field-label">Email</label>
                      <div className="auth-input-wrapper">
                        <Mail size={16} className="auth-input-icon" />
                        <input
                          id="reset-email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@amrita.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {resetError && (
                      <div className="auth-error-notice" role="alert">
                        {resetError}
                      </div>
                    )}

                    <div className="auth-actions-stack">
                      <button className="auth-submit-btn-minimal" type="submit" disabled={resetLoading}>
                        {resetLoading ? 'Sending link…' : (
                          <>
                            Send recovery email <KeyRound size={15} />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="auth-secondary-btn-minimal"
                        onClick={() => {
                          setMode('signin');
                          setResetError('');
                        }}
                      >
                        Back to sign in
                      </button>
                    </div>
                  </>
                )}
              </form>
            )
          ) : (
            <div className="auth-unavailable" role="status">
              <p>Authentication service currently unavailable.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="login-footer">
        <Link to="/" className="footer-brand-link">Amrita Sangam</Link>
        <span>Amrita Vishwa Vidyapeetham</span>
      </footer>
    </main>
  );
}
