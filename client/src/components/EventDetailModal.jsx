import { useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import '../styles/registration.css';

function dateParts(value) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(parsed),
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase(),
      weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(parsed),
      time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(parsed),
    };
  }
  return { day: '24', month: 'OCT', weekday: 'Saturday', time: '10:00 AM' };
}

export default function EventDetailModal({
  event,
  onClose,
  onRegister,
  isRegistered = false,
  actionLabel = 'Register for this event',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (!event) return null;

  const dateInfo = dateParts(event.date || event.eventDate);
  const capacity = Number(event.capacity || 100);
  const registeredCount = Number(event.registeredCount || 0);
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isFull = !event.open || (registeredCount >= capacity && capacity > 0);

  return (
    <div
      className="event-floating-window-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div
        className="event-floating-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="event-floating-close-btn"
          onClick={onClose}
          aria-label="Close event details"
        >
          <X size={18} />
        </button>

        {/* Hero Photo Banner */}
        <div className="event-floating-hero">
          <img
            src={event.image}
            alt={event.title}
            className="event-floating-hero-img"
            loading="eager"
          />
          <div className="event-floating-hero-shade" />

          {/* Floating Date Badge */}
          <div className="event-floating-date-badge">
            <span className="floating-date-day">{dateInfo.day}</span>
            <span className="floating-date-mon">{dateInfo.month}</span>
          </div>

          {/* Tags on Top of Banner */}
          <div className="event-floating-tags-strip">
            <span className="event-floating-club-badge">{event.club}</span>
            <span className="event-floating-category-badge">
              {event.category || 'Campus Gathering'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="event-floating-body">
          <div className="event-floating-title-section">
            <div className="event-floating-eyebrow-row">
              <span className="event-floating-indicator-dot" />
              <span className="event-floating-eyebrow">
                Official Campus Event · {dateInfo.weekday}
              </span>
              <span className="event-floating-od-pill">
                <Sparkles size={12} /> OD Regularization Approved
              </span>
            </div>

            <h2 className="event-floating-heading">{event.title}</h2>

            <p className="event-floating-description">
              {event.description ||
                'Join fellow students for this engaging campus session. Connect with organizing leads, participate in hands-on activities, and expand your campus network.'}
            </p>
          </div>

          {/* Specs / Meta Grid */}
          <div className="event-floating-specs-grid">
            <div className="event-spec-card">
              <div className="event-spec-icon-box">
                <Calendar size={18} />
              </div>
              <div className="event-spec-meta">
                <span className="event-spec-label">Date &amp; Schedule</span>
                <strong className="event-spec-val">
                  {String(event.date || '').slice(0, 10)}
                </strong>
                <small className="event-spec-sub">
                  <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                  {dateInfo.time} onwards
                </small>
              </div>
            </div>

            <div className="event-spec-card">
              <div className="event-spec-icon-box">
                <MapPin size={18} />
              </div>
              <div className="event-spec-meta">
                <span className="event-spec-label">Venue &amp; Hall</span>
                <strong className="event-spec-val">
                  {event.venue || 'Amrita Campus Venue'}
                </strong>
                <small className="event-spec-sub">Main Campus Quadrangle</small>
              </div>
            </div>

            <div className="event-spec-card">
              <div className="event-spec-icon-box">
                <Ticket size={18} />
              </div>
              <div className="event-spec-meta">
                <span className="event-spec-label">Registration Capacity</span>
                <strong className="event-spec-val">
                  {registeredCount} / {capacity} places booked
                </strong>
                <div className="event-spec-capacity-bar">
                  <div
                    className="event-spec-capacity-fill"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="event-spec-card">
              <div className="event-spec-icon-box">
                <GraduationCap size={18} />
              </div>
              <div className="event-spec-meta">
                <span className="event-spec-label">Attendance &amp; OD</span>
                <strong className="event-spec-val">
                  Full Day Duty Approved
                </strong>
                <small className="event-spec-sub">
                  Attendance registered directly to university portal
                </small>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="event-floating-actions-row">
            {isRegistered ? (
              <div className="event-registered-pill-status">
                <CheckCircle2 size={18} />
                <span>You have an active registration pass for this event</span>
              </div>
            ) : isFull ? (
              <div className="event-full-pill-status">
                <span>Maximum capacity reached for this gathering</span>
              </div>
            ) : (
              <button
                type="button"
                className="event-floating-primary-btn"
                onClick={() => {
                  if (onRegister) {
                    onRegister(event);
                  }
                }}
              >
                <span>{actionLabel}</span>
                <ArrowRight size={16} />
              </button>
            )}

            <button
              type="button"
              className="event-floating-secondary-btn"
              onClick={onClose}
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
