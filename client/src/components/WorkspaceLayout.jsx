import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../auth/useSession';

const navigationByRole = {
  STUDENT: [
    { label: 'My campus', path: '/app', marker: '01' },
    { label: 'Discover clubs', path: '/app/clubs', marker: '02' },
    { label: 'Events', path: '/app/events', marker: '03' },
  ],
  CLUB_COMMITTEE: [
    { label: 'Club desk', path: '/app', marker: '01' },
    { label: 'Club directory', path: '/app/clubs', marker: '02' },
    { label: 'Event calendar', path: '/app/events', marker: '03' },
  ],
  CLUB_EXECUTIVE: [
    { label: 'Event-day desk', path: '/app', marker: '01' },
    { label: 'Club directory', path: '/app/clubs', marker: '02' },
    { label: 'Campus events', path: '/app/events', marker: '03' },
  ],
  CLUB_PRESIDENT: [
    { label: 'President desk', path: '/app', marker: '01' },
    { label: 'Club directory', path: '/app/clubs', marker: '02' },
    { label: 'Campus events', path: '/app/events', marker: '03' },
  ],
  FACULTY: [
    { label: 'Review desk', path: '/app', marker: '01' },
    { label: 'Club directory', path: '/app/clubs', marker: '02' },
    { label: 'Events', path: '/app/events', marker: '03' },
  ],
  ADMIN: [
    { label: 'Overview', path: '/app', marker: '01' },
    { label: 'Clubs', path: '/app/clubs', marker: '02' },
    { label: 'Events', path: '/app/events', marker: '03' },
  ],
};

const roleLabels = {
  STUDENT: 'Student workspace',
  CLUB_COMMITTEE: 'Club committee',
  CLUB_EXECUTIVE: 'Club executive',
  CLUB_PRESIDENT: 'Club president',
  FACULTY: 'Club mentor',
  ADMIN: 'Student Affairs',
};

export default function WorkspaceLayout() {
  const { session, endSession } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const role = session.profile.role;
  const navigation = navigationByRole[role] || [];
  const initials = session.profile.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="workspace">
      <aside className="workspace-rail" aria-label="Workspace navigation">
        <Link className="workspace-brand" to="/" aria-label="CampusSphere home">C</Link>
        <div className="rail-rule" />
        <nav className="rail-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              end={item.path === '/app'}
              to={item.path}
              className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}
              aria-label={item.label}
              title={item.label}
            >
              <span>{item.marker}</span>
              <small>{item.label}</small>
            </NavLink>
          ))}
        </nav>
        <div className="rail-bottom">
          <span className="user-initials" aria-label={`Signed in as ${session.profile.fullName}`}>{initials}</span>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <Link className="workspace-wordmark" to="/">Campus<span>Sphere</span></Link>
          <div className="workspace-account">
            {session.preview && <span className="preview-label">Development preview</span>}
            <span className="account-role">{roleLabels[role]}</span>
            <span className="account-name">{session.profile.fullName}</span>
            <button className="quiet-button signout-button" type="button" onClick={endSession}>Sign out</button>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-workspace-nav"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </header>
        {mobileMenuOpen && (
          <nav id="mobile-workspace-nav" className="mobile-workspace-nav" aria-label="Workspace navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                end={item.path === '/app'}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.marker}</span>{item.label}
              </NavLink>
            ))}
            <button type="button" onClick={endSession}>Sign out</button>
          </nav>
        )}
        {session.preview && (
          <div className="preview-notice" role="note">
            Preview session only · Role controls presentation; authentication and permissions are not connected.
          </div>
        )}
        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
