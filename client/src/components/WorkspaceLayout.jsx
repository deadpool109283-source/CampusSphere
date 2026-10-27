import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Compass,
  FolderKanban,
  KeyRound,
  Laptop,
  Layers,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Sparkles,
  User,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useSession } from '../auth/useSession';
import NotificationPopover from './NotificationPopover';
import ThemeToggle from './ThemeToggle';

export function resolveDashboardTrack(profile, memberships = []) {
  if (profile?.role === 'ICTS' || profile?.backendRole === 'icts') return 'icts';
  if (profile?.role === 'ADMIN' || profile?.backendRole === 'college_admin') return 'student-affairs';
  if (profile?.role === 'FACULTY' || profile?.backendRole === 'faculty_coordinator') return 'mentor';
  if (profile?.isClubAccount || profile?.verifiedClubId) return 'verified-office-bearer';

  const list = (memberships && memberships.length) ? memberships : (profile?.memberships || []);
  const activeMemberships = list.filter((m) => m.membershipStatus === 'active');
  const isOfficeBearer = activeMemberships.some((m) =>
    ['president', 'vice_president', 'treasurer', 'secretary', 'office_bearer'].includes(m.position) ||
    (m.position === 'executive' && m.officeBearerGroup)
  );
  if (isOfficeBearer || profile?.role === 'CLUB_PRESIDENT' || profile?.role === 'CLUB_COMMITTEE') {
    return 'office-bearer';
  }
  const isExecutive = activeMemberships.some((m) => m.position === 'executive') || profile?.role === 'CLUB_EXECUTIVE';
  if (isExecutive) return 'executive';

  return 'student';
}

export function getNavigationForTrack(track, profile) {
  switch (track) {
    case 'student':
      return [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Membership', path: '/app/membership', icon: Users },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
    case 'executive':
      return [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Membership', path: '/app/membership', icon: Users },
        { label: 'Club chats', path: '/app/chats', icon: MessageSquare },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
    case 'office-bearer':
    case 'verified-office-bearer':
      return [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Membership', path: '/app/membership', icon: Users },
        { label: 'Club chats', path: '/app/chats', icon: MessageSquare },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
    case 'mentor':
      return [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Membership', path: '/app/membership', icon: Users },
        { label: 'Club members', path: '/app/members', icon: Users },
        { label: 'Equipment', path: '/app/equipment', icon: Laptop },
        { label: 'Funding', path: '/app/funding', icon: WalletCards },
        { label: 'Event reports', path: '/app/event-reports', icon: FolderKanban },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
    case 'student-affairs': {
      const items = [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Equipment', path: '/app/equipment', icon: Laptop },
        { label: 'Funding', path: '/app/funding', icon: WalletCards },
        { label: 'Reports', path: '/app/reports', icon: BarChart3 },
        { label: 'Event reports', path: '/app/event-reports', icon: FolderKanban },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'Club login changes', path: '/app/credential-requests', icon: KeyRound },
      ];
      if (!profile?.adminType || profile?.adminType === 'student_affairs') {
        items.push({ label: 'My profile', path: '/app/profile', icon: User });
      }
      return items;
    }
    case 'icts':
      return [
        { label: 'Account Desk', path: '/app/account-desk', icon: KeyRound },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
    default:
      return [
        { label: 'Overview', path: '/app', icon: Sparkles },
        { label: 'Explore clubs', path: '/app/clubs', icon: Compass },
        { label: 'Events', path: '/app/events', icon: Calendar },
        { label: 'Membership', path: '/app/membership', icon: Users },
        { label: 'Announcements', path: '/app/announcements', icon: Megaphone },
        { label: 'My profile', path: '/app/profile', icon: User },
      ];
  }
}

const trackLabels = {
  student: 'Student',
  executive: 'Club Executive',
  'office-bearer': 'Office Bearer',
  'verified-office-bearer': 'Club Account',
  mentor: 'Faculty Mentor',
  'student-affairs': 'Student Affairs',
  icts: 'ICTS Account Desk',
};

export default function WorkspaceLayout() {
  const { session, endSession } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  const profile = session.profile;
  const track = resolveDashboardTrack(profile, profile?.memberships);
  const navigation = getNavigationForTrack(track, profile);
  const displayRoleLabel = trackLabels[track] || 'Campus Member';

  const initials = (session.profile?.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click-outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <div className="workspace-shell">
      {/* Editorial Top Navigation Bar */}
      <header className="workspace-navbar">
        <div className="navbar-left">
          <Link className="brand-mark" to="/app" aria-label="Campus Hub">
            <span className="brand-seal">A</span>
            <span className="brand-text">
              Amrita<span>Sangam</span>
            </span>
          </Link>
        </div>

        {/* Central Segmented Pill Navigation */}
        <nav className="navbar-center" aria-label="Main Navigation">
          <div className="segmented-dock">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  end={item.path === '/app'}
                  to={item.path}
                  className={({ isActive }) =>
                    `segmented-item${isActive ? ' is-active' : ''}`
                  }
                >
                  <Icon className="nav-icon" size={15} strokeWidth={2.2} />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Right User & Actions Bar */}
        <div className="navbar-right">
          {session.preview && (
            <span className="preview-badge" title="Role controls presentation only">
              Preview Mode
            </span>
          )}

          {/* Real-Time Notification Bell Popover */}
          <NotificationPopover role={profile?.role || 'STUDENT'} session={session} />

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          <div className="user-profile-widget" ref={profileRef}>
            <button
              type="button"
              className="user-trigger"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-expanded={profileDropdownOpen}
              aria-label="User profile options"
            >
              <div className="user-avatar">{initials}</div>
              <div className="user-meta">
                <span className="user-name">{session.profile?.fullName || 'Amrita Student'}</span>
                <span className="user-role-chip">{displayRoleLabel}</span>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="profile-dropdown-panel" role="menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{session.profile?.fullName}</p>
                  <p className="dropdown-email">{session.profile?.email || 'student@amrita.edu'}</p>
                  <span className="dropdown-role-tag">{displayRoleLabel}</span>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-info">
                  <div className="info-row">
                    <span>Roll number</span>
                    <strong>{session.profile?.rollNumber || 'CB.EN.U4CSE22001'}</strong>
                  </div>
                  {session.profile?.department && (
                    <div className="info-row">
                      <span>Department</span>
                      <strong>{session.profile.department}</strong>
                    </div>
                  )}
                  {session.profile?.clubName && (
                    <div className="info-row">
                      <span>Club</span>
                      <strong>{session.profile.clubName}</strong>
                    </div>
                  )}
                </div>
                <div className="dropdown-divider" />
                <Link
                  to="/app/profile"
                  className="dropdown-profile-link"
                  onClick={() => setProfileDropdownOpen(false)}
                  role="menuitem"
                >
                  <User size={14} />
                  <span>My Profile &amp; Security</span>
                </Link>
                <button
                  type="button"
                  className="dropdown-signout"
                  onClick={endSession}
                  role="menuitem"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="mobile-drawer"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <span className="brand-seal">A</span>
              <div>
                <strong>{session.profile?.fullName}</strong>
                <p>{displayRoleLabel}</p>
              </div>
            </div>
            <div className="mobile-drawer-links">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    end={item.path === '/app'}
                    to={item.path}
                    className={({ isActive }) =>
                      `mobile-link${isActive ? ' is-active' : ''}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            <div className="mobile-drawer-footer">
              <button type="button" className="mobile-signout" onClick={endSession}>
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {session.preview && (
        <aside className="preview-top-banner">
          <span>Development preview session · All features & permissions simulated.</span>
        </aside>
      )}

      {/* Main Page Canvas */}
      <main className="workspace-main-container">
        <Outlet />
      </main>
    </div>
  );
}
