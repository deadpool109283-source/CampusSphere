import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import '../styles/login.css';

const previewRoles = [
  { role: 'STUDENT', label: 'Student', detail: 'A personal campus home' },
  { role: 'CLUB_COMMITTEE', label: 'Club committee', detail: 'A focused club desk' },
  { role: 'FACULTY', label: 'Faculty', detail: 'An approval workspace' },
  { role: 'ADMIN', label: 'Administration', detail: 'Campus-wide oversight' },
];

export default function Login() {
  const { startPreview } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="auth-unavailable" role="status">
            <strong>Authentication is not connected yet.</strong>
            <p>The current API has no sign-in or profile endpoint. We won’t accept credentials or create a pretend authenticated session.</p>
          </div>
          {import.meta.env.DEV && (
            <div className="preview-access">
              <div className="preview-heading">
                <span>DEVELOPMENT ONLY</span>
                <span>UI preview sessions</span>
              </div>
              <p>Preview role-specific layouts without implying authorization or enabling protected actions.</p>
              <div className="preview-role-list">
                {previewRoles.map((item) => (
                  <button key={item.role} type="button" onClick={() => handlePreview(item.role)}>
                    <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="login-footnote">For account access, contact Student Affairs. Authentication will be enabled when the campus identity provider is configured.</p>
        </section>
      </div>
      <footer className="login-footer">
        <Link to="/">CampusSphere</Link>
        <span>DBMS Mini-Project · Amrita Vishwa Vidyapeetham</span>
      </footer>
    </main>
  );
}
