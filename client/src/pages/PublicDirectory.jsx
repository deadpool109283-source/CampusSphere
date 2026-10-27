import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  GraduationCap,
  MapPin,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import EventDetailModal from '../components/EventDetailModal';
import '../styles/directory.css';

function PublicFrame({ children }) {
  return (
    <main className="directory-page">
      <header className="public-header">
        <Link className="public-brand" to="/"><span className="brand-seal">A</span>Amrita<span>Sangam</span></Link>
        <nav aria-label="Amrita Sangam"><Link to="/clubs">Clubs</Link><Link to="/events">Events</Link></nav>
        <div className="public-header-actions">
          <ThemeToggle />
          <Link className="quiet-button" to="/login">Sign in <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      {children}
      <footer className="directory-footer"><Link to="/">Amrita Sangam</Link><span>Campus listings · Amrita Vishwa Vidyapeetham</span></footer>
    </main>
  );
}

function LoadingRows() {
  return (
    <div className="directory-loading" role="status" aria-label="Loading">
      <span /><span /><span />
    </div>
  );
}

export default function PublicDirectory({ kind }) {
  const { clubId } = useParams();
  const [result, setResult] = useState({ key: '', data: null, error: '' });
  const requestKey = `${kind}:${clubId || ''}`;

  useEffect(() => {
    const controller = new AbortController();
    const path = kind === 'club' ? `/club/${clubId}` : `/${kind}`;

    apiFetch(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: '' });
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError' && !controller.signal.aborted) {
          setResult({ key: requestKey, data: null, error: requestError.message });
        }
      });

    return () => controller.abort();
  }, [kind, clubId, requestKey]);

  const data = result.key === requestKey ? result.data : null;
  const error = result.key === requestKey ? result.error : '';

  return (
    <PublicFrame>
      <section className="directory-heading">
        <p className="eyebrow">Amrita Sangam · Discover</p>
        <h1>{kind === 'events' ? <>Make room for<br /><em>what’s next.</em></> : kind === 'club' ? <>A place to<br /><em>belong.</em></> : <>Find your<br /><em>community.</em></>}</h1>
        <p>Explore the people, ideas, and gatherings shaping campus life.</p>
      </section>
      {error ? (
        <div className="directory-state" role="alert">
          <strong>We couldn’t load this campus information.</strong>
          <p>{error}</p>
          <Link to="/" className="quiet-button" style={{ display: 'inline-flex', marginTop: 12 }}>
            <ArrowLeft size={13} />
            <span>Return to campus</span>
          </Link>
        </div>
      ) : !data ? <LoadingRows /> : kind === 'club' ? (
        <ClubDetail data={data} />
      ) : kind === 'events' ? (
        <EventList events={data.events || []} />
      ) : (
        <ClubList clubs={data.clubs || []} />
      )}
    </PublicFrame>
  );
}

function ClubList({ clubs }) {
  if (!clubs.length) return <div className="directory-state"><strong>No clubs are listed yet.</strong><p>Check back when clubs have been added.</p></div>;

  return (
    <section className="directory-list" aria-label="Clubs">
      {clubs.map((club, index) => (
        <Link className="directory-row" to={`/clubs/${club.id}`} key={club.id}>
          <span className="directory-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="directory-row-main"><strong>{club.name}</strong><small>{club.category || 'Campus community'}</small></span>
          <span className="directory-row-detail">{club.members ?? '—'} members</span>
          <span className="directory-arrow" aria-hidden="true">↗</span>
        </Link>
      ))}
    </section>
  );
}

function dateParts(value) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(parsed),
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase(),
    };
  }
  return { day: '24', month: 'OCT' };
}

function EventList({ events }) {
  const [viewingEvent, setViewingEvent] = useState(null);
  const navigate = useNavigate();

  if (!events.length) {
    return (
      <div className="directory-state">
        <strong>No upcoming events are listed.</strong>
        <p>New campus events will appear here when published.</p>
      </div>
    );
  }

  return (
    <>
      <section className="events-three-col-grid" aria-label="Campus events">
        {events.map((event) => {
          const evtDate = dateParts(event.date);
          const capacity = Number(event.capacity || 100);
          const registered = Number(event.registeredCount || 0);
          const percent = Math.min(100, Math.round((registered / capacity) * 100));

          return (
            <article
              className="event-card-modern"
              key={event.id}
              onClick={() => setViewingEvent(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setViewingEvent(event);
                }
              }}
            >
              <div className="event-card-media">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                  alt={event.title}
                  loading="lazy"
                  className="event-card-img"
                />
                <div className="event-card-media-shade" />

                <div className="event-card-date-badge">
                  <span className="event-date-day">{evtDate.day}</span>
                  <span className="event-date-mon">{evtDate.month}</span>
                </div>

                <div className="event-card-top-tag">
                  <span className="event-category-badge">{event.category || 'Gathering'}</span>
                </div>

                <div className="event-card-media-footer">
                  <span className="event-club-pill">{event.club}</span>
                  {event.open && (
                    <span className="event-od-pill">
                      <Sparkles size={11} /> OD Pass
                    </span>
                  )}
                </div>
              </div>

              <div className="event-card-body">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-excerpt">
                  {event.description || 'Join this engaging campus gathering to build, collaborate, and connect with peers.'}
                </p>

                <div className="event-card-meta-list">
                  <span className="event-meta-item">
                    <MapPin size={13} />
                    <span>{event.venue || 'Amrita Campus'}</span>
                  </span>
                  <span className="event-meta-item">
                    <Calendar size={13} />
                    <span>{String(event.date || '').slice(0, 10)}</span>
                  </span>
                </div>

                <div className="event-card-capacity-box">
                  <div className="capacity-bar-track">
                    <div
                      className="capacity-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="capacity-labels-row">
                    <span>
                      <Ticket size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {registered} / {capacity} places booked
                    </span>
                    <strong className={event.open ? 'status-open' : 'status-full'}>
                      {event.open ? 'Seats Open' : 'Full'}
                    </strong>
                  </div>
                </div>

                <div className="event-card-footer">
                  <button
                    type="button"
                    className="event-card-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingEvent(event);
                    }}
                  >
                    <span>View Details</span>
                    <ArrowRight size={13} />
                  </button>

                  <Link
                    to="/login"
                    className="event-card-register-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Sign in to register ↗
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {viewingEvent && (
        <EventDetailModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onRegister={() => {
            setViewingEvent(null);
            navigate('/login');
          }}
          actionLabel="Sign in to register"
        />
      )}
    </>
  );
}

function ClubDetail({ data }) {
  const club = data.club;
  if (!club) {
    return (
      <div className="directory-state">
        <strong>Club not found.</strong>
        <p>The requested campus club could not be found or has not been listed yet.</p>
        <Link to="/clubs" className="back-button-modern" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={14} /> Return to Clubs Directory
        </Link>
      </div>
    );
  }

  const upcomingEvents = data.upcomingEvents || [];

  return (
    <section className="club-detail-public">
      <div className="club-detail-actions-top">
        <Link to="/clubs" className="back-button-modern">
          <ArrowLeft size={14} /> Return to Clubs Directory
        </Link>
      </div>

      <div className="club-detail-banner">
        <div className="club-banner-glass-accent" />
        <div className="club-banner-top-row">
          <span className="club-category-pill">{club.category || 'Technology & Innovation'}</span>
          <span className="club-status-indicator">
            <span className="club-status-dot" />
            Active Campus Wing
          </span>
        </div>

        <h2>{club.name}</h2>
        <p className="club-banner-subtitle">
          {club.description || 'Dedicated to advancing student initiatives, collaborative projects, technical workshops, and campus community engagement.'}
        </p>

        <div className="club-banner-kpi-row">
          <div className="club-banner-kpi-item">
            <Users size={16} />
            <div>
              <strong>{club.members ?? '48'}</strong>
              <small>Members</small>
            </div>
          </div>
          <div className="club-banner-kpi-item">
            <Ticket size={16} />
            <div>
              <strong>{upcomingEvents.length || club.events || '3'}</strong>
              <small>Events</small>
            </div>
          </div>
          <div className="club-banner-kpi-item">
            <GraduationCap size={16} />
            <div>
              <strong>{club.facultyCoordinator || 'Staff Coordinator'}</strong>
              <small>Faculty Mentor</small>
            </div>
          </div>
        </div>

        <div className="club-banner-actions">
          <Link className="button-crimson" to="/login">
            Sign in to apply for membership <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <div className="club-detail-bento-grid">
        <article className="club-detail-card">
          <div className="card-header-clean">
            <p className="eyebrow">About the Community</p>
            <h3>Mission &amp; Overview</h3>
          </div>
          <p className="club-desc-text">
            {club.description || 'Dedicated to fostering collaboration and hands-on peer learning among Amrita students.'}
          </p>
          <div className="club-detail-meta-list">
            <div className="meta-list-row">
              <span className="meta-label">Domain Focus</span>
              <span className="meta-value">{club.category || 'Technology'}</span>
            </div>
            <div className="meta-list-row">
              <span className="meta-label">Faculty In-Charge</span>
              <span className="meta-value">{club.facultyCoordinator || 'Amrita Directorate of Student Affairs'}</span>
            </div>
            <div className="meta-list-row">
              <span className="meta-label">Recruitment Status</span>
              <span className="meta-value status-open">Open for Student Applications</span>
            </div>
          </div>
        </article>

        <article className="club-detail-card">
          <div className="card-header-clean">
            <p className="eyebrow">Program Calendar</p>
            <h3>Scheduled Gatherings</h3>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="club-events-mini-list">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div className="mini-event-item" key={event.id || event._id}>
                  <div className="mini-event-date">
                    <Calendar size={14} />
                    <span>{event.date || 'Upcoming'}</span>
                  </div>
                  <strong className="mini-event-title">{event.title}</strong>
                  <div className="mini-event-venue">
                    <MapPin size={12} />
                    <span>{event.venue || 'Amrita Campus'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-subcard">
              <p>No upcoming events currently listed. Sign in to view internal workshops.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
