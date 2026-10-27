import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FolderKanban,
  KeyRound,
  Laptop,
  Megaphone,
  ShieldCheck,
  Trash2,
  Users,
  WalletCards,
  Calendar,
} from 'lucide-react';

export default function NotificationPopover({ role = 'STUDENT' }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'requests'
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Generate realistic, contextual notifications based on role
  const isPresident = role === 'CLUB_PRESIDENT';
  const isFaculty = role === 'FACULTY';
  const isAdmin = role === 'ADMIN';

  const [notifications, setNotifications] = useState(() => {
    const list = [];

    if (isPresident || isFaculty || isAdmin) {
      list.push({
        id: 'notif-app-1',
        category: 'requests',
        type: 'application',
        badge: 'MEMBERSHIP',
        icon: Users,
        title: 'New Membership Application',
        subtitle: 'Aarav Nair (CSE, 2nd Year) applied for Cloud & AI domain.',
        path: '/app/membership',
        unread: true,
        time: '15m ago',
      });
      list.push({
        id: 'notif-fnd-1',
        category: 'requests',
        type: 'funding',
        badge: 'BUDGET',
        icon: WalletCards,
        title: 'Funding Sign-Off Required',
        subtitle: '₹45,000 grant for Azure Hackathon awaiting review.',
        path: '/app/funding',
        unread: true,
        time: '1h ago',
      });
      list.push({
        id: 'notif-eq-1',
        category: 'requests',
        type: 'equipment',
        badge: 'EQUIPMENT',
        icon: Laptop,
        title: 'Equipment Loan Requisition',
        subtitle: 'Sony 4K Camcorder kit requested for Hackathon.',
        path: '/app/equipment',
        unread: true,
        time: '3h ago',
      });
    }

    if (role === 'STUDENT') {
      list.push({
        id: 'notif-inv-1',
        category: 'requests',
        type: 'nomination',
        badge: 'LEADERSHIP',
        icon: ShieldCheck,
        title: 'Leadership Nomination',
        subtitle: 'You were nominated as Vice President for Microsoft Student Community!',
        path: '/app/membership',
        unread: true,
        time: 'Just now',
      });
      list.push({
        id: 'notif-ann-1',
        category: 'all',
        type: 'announcement',
        badge: 'CAMPUS',
        icon: Megaphone,
        title: 'Kalotsav 2026 Stage Schedule',
        subtitle: 'Cultural week stage allocations and registration are now live.',
        path: '/app/announcements',
        unread: true,
        time: '2h ago',
      });
      list.push({
        id: 'notif-evt-1',
        category: 'all',
        type: 'event',
        badge: 'CONFIRMED',
        icon: Calendar,
        title: 'Event Pass Confirmed',
        subtitle: 'Your On-Duty pass for Azure Cloud Hackathon is approved.',
        path: '/app/events',
        unread: false,
        time: 'Yesterday',
      });
    }

    if (isAdmin) {
      list.push({
        id: 'notif-cred-1',
        category: 'requests',
        type: 'credential',
        badge: 'SECURITY',
        icon: KeyRound,
        title: 'Club Login Alteration',
        subtitle: 'ICTS submitted shared email change for Microsoft Community.',
        path: '/app/credential-requests',
        unread: true,
        time: '30m ago',
      });
    }

    return list;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;
  const requestsCount = notifications.filter((n) => n.category === 'requests').length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return n.unread;
    if (activeTab === 'requests') return n.category === 'requests';
    return true;
  });

  // Click-outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleItemClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setOpen(false);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="campus-notification-widget" ref={popoverRef}>
      <button
        type="button"
        className={`campus-notification-bell ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-badge-dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-popover-panel">
          {/* Popover Header */}
          <div className="popover-header">
            <div className="popover-title-row">
              <span className="popover-brand-badge">Amrita Sangam</span>
              <h4>Campus Alerts</h4>
              {unreadCount > 0 && (
                <span className="popover-unread-pill">{unreadCount} new</span>
              )}
            </div>
            <div className="popover-actions-group">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="popover-action-btn"
                  onClick={markAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="popover-action-btn is-danger"
                  onClick={clearAllNotifications}
                  title="Clear all alerts"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="popover-tabs-bar">
            <button
              type="button"
              className={`popover-tab-pill ${activeTab === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`popover-tab-pill ${activeTab === 'unread' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
            {requestsCount > 0 && (
              <button
                type="button"
                className={`popover-tab-pill ${activeTab === 'requests' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Requests ({requestsCount})
              </button>
            )}
          </div>

          {/* Scrollable Notification Items List */}
          <div className="popover-scroll-body">
            {filteredNotifications.map((item) => {
              const Icon = item.icon || FolderKanban;
              return (
                <article
                  key={item.id}
                  className={`notification-row-item ${item.unread ? 'is-unread' : ''}`}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                >
                  <div className="notif-icon-circle">
                    <Icon size={16} />
                  </div>
                  <div className="notif-meta-col">
                    <div className="notif-title-row">
                      <div className="notif-heading-group">
                        {item.badge && <span className="notif-category-chip">{item.badge}</span>}
                        <strong>{item.title}</strong>
                      </div>
                      <time className="notif-time">{item.time}</time>
                    </div>
                    <p className="notif-sub">{item.subtitle}</p>
                  </div>
                  {item.unread && <span className="unread-indicator-dot" />}
                </article>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="popover-empty-notice">
                <Bell size={28} className="empty-bell-icon" />
                <p><strong>All caught up!</strong></p>
                <p>No {activeTab !== 'all' ? activeTab : ''} notifications right now. New campus circulars will appear here.</p>
              </div>
            )}
          </div>

          <div className="popover-footer">
            <span>Amrita Sangam Notification Center</span>
          </div>
        </div>
      )}
    </div>
  );
}
