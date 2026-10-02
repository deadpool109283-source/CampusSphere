import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSession } from '../auth/useSession';
import RegistrationDialog from '../components/RegistrationDialog';
import { apiFetch } from '../lib/api';

const roleCopy = {
  STUDENT: {
    eyebrow: 'Your campus, today',
    titleTop: 'A good day starts',
    titleAccent: 'with showing up.',
    intro: 'The people, events, and moments that make your campus yours.',
  },
  CLUB_COMMITTEE: {
    eyebrow: 'Club operations',
    titleTop: 'Make good things',
    titleAccent: 'happen here.',
    intro: 'A clear view of the club directory and event calendar for your campus.',
  },
  FACULTY: {
    eyebrow: 'Faculty workspace',
    titleTop: 'A closer view of',
    titleAccent: 'campus life.',
    intro: 'Review current club and event information from across the campus.',
  },
  ADMIN: {
    eyebrow: 'Campus overview',
    titleTop: 'The campus,',
    titleAccent: 'in motion.',
    intro: 'A practical overview of the activity currently exposed by the CampusSphere service.',
  },
};

export default function WorkspacePage() {
  const location = useLocation();
  const { clubId } = useParams();
  const { session } = useSession();
  const role = session.profile.role;
  const isClubDetail = Boolean(clubId);
  const view = isClubDetail ? 'club' : location.pathname.endsWith('/clubs') ? 'clubs' : location.pathname.endsWith('/events') ? 'events' : 'home';
  const [data, setData] = useState(null);
  const [requestState, setRequestState] = useState({ key: '', error: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const requestKey = `${role}:${view}:${clubId || ''}`;

  useEffect(() => {
    const controller = new AbortController();

    const request = view === 'club'
      ? apiFetch(`/club/${clubId}`, { signal: controller.signal })
      : view === 'clubs'
        ? apiFetch('/clubs', { signal: controller.signal })
        : view === 'events'
          ? apiFetch('/events', { signal: controller.signal })
          : role === 'STUDENT'
            ? apiFetch('/student/dashboard', { signal: controller.signal })
            : role === 'ADMIN'
                ? Promise.all([
                  apiFetch('/admin/dashboard', { signal: controller.signal }),
                  apiFetch('/clubs', { signal: controller.signal }),
                ]).then(([dashboard, clubResult]) => ({ ...dashboard, clubs: clubResult.clubs }))
              : Promise.all([
                apiFetch('/clubs', { signal: controller.signal }),
                apiFetch('/events', { signal: controller.signal }),
              ]).then(([clubResult, eventResult]) => ({ clubs: clubResult.clubs, events: eventResult.events }));

    request
      .then((responseData) => {
        if (controller.signal.aborted) return;
        setData(responseData);
        setRequestState({ key: requestKey, error: '' });
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError' && !controller.signal.aborted) {
          setRequestState({ key: requestKey, error: requestError.message });
        }
      });

    return () => controller.abort();
  }, [view, clubId, role, requestKey]);

  const isLoading = requestState.key !== requestKey;
  const error = requestState.key === requestKey ? requestState.error : '';
  const events = data?.events || [];
  const clubs = data?.clubs || [];
  const onRegistrationSuccess = useCallback((eventId) => {
    setRegisteredEventIds((current) => [...current, eventId]);
    setData((current) => current && ({
      ...current,
      events: current.events?.map((event) => (
        event.id === eventId
          ? { ...event, registeredCount: event.registeredCount + 1, open: event.registeredCount + 1 < event.capacity }
          : event
      )),
    }));
  }, []);

  if (isLoading) return <WorkspaceLoading />;
  if (error) return <WorkspaceError error={error} />;
  if (view === 'club') return <ClubProfile data={data} />;
  if (view === 'clubs') return <ClubDirectory clubs={clubs} />;
  if (view === 'events') {
    return (
      <>
        <EventDirectory
          events={events}
          role={role}
          registeredEventIds={registeredEventIds}
          onRegister={setSelectedEvent}
        />
        {selectedEvent && (
          <RegistrationDialog
            event={selectedEvent}
            profile={session.profile}
            onClose={() => setSelectedEvent(null)}
            onSuccess={onRegistrationSuccess}
          />
        )}
      </>
    );
  }

  if (role === 'STUDENT') {
    return (
      <div className="workspace-stack">
        <WorkspaceHero copy={roleCopy[role]} userName={session.profile.fullName} />
        <section className="today-feature">
          <div className="today-feature-label"><span>UP NEXT</span><span>{events.length ? 'FROM THE EVENT CALENDAR' : 'CAMPUS CALENDAR'}</span></div>
          {events.length ? (
            <div className="today-feature-content">
              <div className="event-date-large"><strong>{eventDay(events[0].date)}</strong><span>{eventMonth(events[0].date)}</span></div>
              <div className="today-event-copy">
                <p className="eyebrow">{events[0].club}</p>
                <h2>{events[0].title}</h2>
                <p>{events[0].venue} <span>·</span> {formatEventDate(events[0].date)}</p>
              </div>
              <div className="today-event-action">
                <span>{events[0].registeredCount}/{events[0].capacity} places</span>
                <button
                  className="primary-button"
                  type="button"
                  disabled={!events[0].open || registeredEventIds.includes(events[0].id)}
                  onClick={() => setSelectedEvent(events[0])}
                >
                  {registeredEventIds.includes(events[0].id) ? 'Registered' : events[0].open ? 'Register' : 'Full'}
                </button>
              </div>
            </div>
          ) : <EmptyState title="Nothing scheduled just yet." detail="When campus events are published, they’ll show up here." />}
        </section>
        <section className="workspace-section">
          <div className="section-heading">
            <div><p className="eyebrow">The communities</p><h2>Find where you fit.</h2></div>
            <Link className="text-link" to="/app/clubs">Browse clubs <span>↗</span></Link>
          </div>
          <ClubStrip clubs={clubs.slice(0, 3)} />
        </section>
        {data?.announcements?.length > 0 && (
          <section className="workspace-section announcements">
            <div className="section-heading"><div><p className="eyebrow">Notes from campus</p><h2>Latest announcements</h2></div></div>
            {data.announcements.map((item) => (
              <article className="announcement-row" key={item.id}>
                <span>{item.club}</span><h3>{item.title}</h3><p>{item.content}</p>
              </article>
            ))}
          </section>
        )}
        <PreviewDataNote />
        {selectedEvent && (
          <RegistrationDialog
            event={selectedEvent}
            profile={session.profile}
            onClose={() => setSelectedEvent(null)}
            onSuccess={onRegistrationSuccess}
          />
        )}
      </div>
    );
  }

  if (role === 'ADMIN') {
    return <AdminOverview data={data} clubs={clubs} userName={session.profile.fullName} />;
  }

  return <OperationsOverview role={role} userName={session.profile.fullName} clubs={clubs} events={events} />;
}

function WorkspaceHero({ copy, userName }) {
  const firstName = userName.split(' ')[0];
  return (
    <header className="workspace-hero">
      <div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.titleTop}<br /><em>{copy.titleAccent}</em></h1></div>
      <p className="workspace-intro">Good day, {firstName}. {copy.intro}</p>
    </header>
  );
}

function OperationsOverview({ role, userName, clubs, events }) {
  const faculty = role === 'FACULTY';
  const copy = roleCopy[role];
  return (
    <div className="workspace-stack">
      <WorkspaceHero copy={copy} userName={userName} />
      <section className="notice-panel" role="note">
        <span className="notice-mark">i</span>
        <div>
          <strong>{faculty ? 'Approval decisions are not connected yet.' : 'Committee workflows are not connected yet.'}</strong>
          <p>The current API exposes club and event listings only. It does not provide application queues, approval status, or management actions. This workspace won’t show fabricated tasks.</p>
        </div>
      </section>
      <section className="workspace-section">
        <div className="section-heading">
          <div><p className="eyebrow">{faculty ? 'Campus activity' : 'Club directory'}</p><h2>{faculty ? 'Current events' : 'Campus communities'}</h2></div>
          <Link className="text-link" to="/app/events">Event calendar <span>↗</span></Link>
        </div>
        <EventRows events={events.slice(0, 4)} />
      </section>
      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">Communities</p><h2>{clubs.length} clubs listed</h2></div><Link className="text-link" to="/app/clubs">View directory <span>↗</span></Link></div>
        <ClubStrip clubs={clubs.slice(0, 3)} />
      </section>
      <PreviewDataNote />
    </div>
  );
}

function AdminOverview({ data, clubs, userName }) {
  const attendance = data?.attendance || [];
  const requests = data?.fundingRequests || [];
  const eventCount = data?.upcomingEvents?.length || 0;

  function downloadCsv() {
    const rows = [['Student', 'Registration number', 'Event', 'Attendance marked']];
    attendance.forEach((record) => rows.push([record.name, record.reg, record.event, record.time]));
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'campussphere-attendance.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance export downloaded.');
  }

  return (
    <div className="workspace-stack">
      <WorkspaceHero copy={roleCopy.ADMIN} userName={userName} />
      <div className="admin-facts">
        <div><strong>{clubs.length}</strong><span>Clubs in current listing</span></div>
        <div><strong>{eventCount}</strong><span>Events in overview response</span></div>
        <div><strong>{attendance.length}</strong><span>Attendance records returned</span></div>
      </div>
      <section className="workspace-section">
        <div className="section-heading">
          <div><p className="eyebrow">Attendance report</p><h2>Recent check-ins</h2></div>
          <button className="text-link button-link" type="button" onClick={downloadCsv} disabled={!attendance.length}>Download CSV <span>↓</span></button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Event</th><th>Marked at</th></tr></thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}><td><strong>{record.name}</strong><small>{record.reg}</small></td><td>{record.event}</td><td>{record.time}</td></tr>
              ))}
            </tbody>
          </table>
          {!attendance.length && <EmptyState title="No attendance records returned." detail="The service has no records for this report." />}
        </div>
      </section>
      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">Budget requests</p><h2>Funding activity</h2></div></div>
        {requests.length ? requests.map((item) => (
          <article className="funding-row" key={item.id}>
            <div><h3>{item.title}</h3><p>{item.club}</p></div>
            <strong>{item.amount}</strong><span className={`status-label status-${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span>
          </article>
        )) : <EmptyState title="No funding activity returned." detail="New requests will appear here when the service supports them." />}
      </section>
      <PreviewDataNote />
    </div>
  );
}

function ClubDirectory({ clubs }) {
  return (
    <div className="workspace-stack">
      <PageHeading eyebrow="Find your community" title={<>Clubs for every<br /><em>kind of curious.</em></>} detail="Browse the communities that make campus more than a place to study." />
      {clubs.length ? <ClubStrip clubs={clubs} expanded /> : <EmptyState title="No clubs have been listed." detail="When clubs are published, you’ll find them here." />}
      <PreviewDataNote />
    </div>
  );
}

function ClubProfile({ data }) {
  const club = data?.club;
  if (!club) return <EmptyState title="Club not found." detail="It may have been removed from the directory." />;
  return (
    <div className="workspace-stack">
      <div className="club-profile-banner">
        <Link className="back-link" to="/app/clubs">← All clubs</Link>
        <p className="eyebrow">{club.category || 'Campus community'}</p>
        <h1>{club.name}</h1>
        <p>{club.members ?? '—'} members <span>·</span> {club.facultyCoordinator || 'Coordinator not listed'}</p>
        <p className="club-profile-description">{club.description}</p>
      </div>
      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">Coming up</p><h2>Club events</h2></div></div>
        <EventRows events={data.upcomingEvents || []} />
      </section>
      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">The people</p><h2>Club roster</h2></div></div>
        {(data.members || []).map((member, index) => (
          <article className="member-row" key={`${member.name}-${index}`}><span>{initialsFor(member.name)}</span><strong>{member.name}</strong><small>{member.role}</small></article>
        ))}
        {!data.members?.length && <EmptyState title="No roster information available." detail="Roster details aren’t published for this club." />}
      </section>
      <PreviewDataNote />
    </div>
  );
}

function EventDirectory({ events, role, registeredEventIds, onRegister }) {
  return (
    <div className="workspace-stack">
      <PageHeading eyebrow="What’s happening" title={<>Find your next<br /><em>campus story.</em></>} detail="Workshops, talks, and gatherings happening across the campus." />
      {events.length ? events.map((event, index) => (
        <article className="event-listing" key={event.id}>
          <div className="event-listing-index">{String(index + 1).padStart(2, '0')}</div>
          <div className="event-listing-date"><strong>{eventDay(event.date)}</strong><span>{eventMonth(event.date)}</span></div>
          <div className="event-listing-main"><p className="eyebrow">{event.club}</p><h2>{event.title}</h2><p>{event.venue} <span>·</span> {formatEventDate(event.date)}</p>{event.description && <p className="event-description">{event.description}</p>}</div>
          <div className="event-listing-action"><span>{event.registeredCount}/{event.capacity} places</span>{role === 'STUDENT' && <button className="primary-button" type="button" disabled={!event.open || registeredEventIds.includes(event.id)} onClick={() => onRegister(event)}>{registeredEventIds.includes(event.id) ? 'Registered' : event.open ? 'Register' : 'Full'}</button>}</div>
        </article>
      )) : <EmptyState title="No upcoming events are listed." detail="New campus events will appear here when published." />}
      <PreviewDataNote />
    </div>
  );
}

function EventRows({ events }) {
  if (!events.length) return <EmptyState title="No events were returned." detail="The current campus event listing has no results." />;
  return events.map((event, index) => (
    <article className="event-row" key={event.id}>
      <span className="event-row-index">{String(index + 1).padStart(2, '0')}</span>
      <div><h3>{event.title}</h3><p>{event.club} <span>·</span> {event.venue}</p></div>
      <time>{formatEventDate(event.date)}</time>
    </article>
  ));
}

function ClubStrip({ clubs, expanded = false }) {
  if (!clubs.length) return <EmptyState title="No clubs were returned." detail="The current campus club listing has no results." />;
  return (
    <div className={`club-strip${expanded ? ' club-strip-expanded' : ''}`}>
      {clubs.map((club, index) => (
        <Link className="workspace-club-row" to={`/app/clubs/${club.id}`} key={club.id}>
          <span className="workspace-club-index">{String(index + 1).padStart(2, '0')}</span>
          <div><span>{club.category || 'Campus community'}</span><h3>{club.name}</h3><p>{club.description}</p></div>
          <span className="workspace-club-members">{club.members ?? '—'} <small>members</small></span>
          <span className="workspace-club-arrow" aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}

function PageHeading({ eyebrow, title, detail }) {
  return <header className="workspace-hero directory-page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><p className="workspace-intro">{detail}</p></header>;
}

function EmptyState({ title, detail, children }) {
  return <div className="workspace-empty"><span aria-hidden="true">—</span><div><strong>{title}</strong><p>{detail}</p>{children}</div></div>;
}

function WorkspaceLoading() {
  return <div className="workspace-loading" role="status" aria-label="Loading workspace"><span /><span /><span /></div>;
}

function WorkspaceError({ error }) {
  return <div className="workspace-error" role="alert"><p className="eyebrow">Couldn’t load workspace data</p><h1>We hit a snag.</h1><p>{error}</p><button className="quiet-button" type="button" onClick={() => window.location.reload()}>Try again</button></div>;
}

function PreviewDataNote() {
  return <p className="data-source-note">Development preview · Data is provided by the current demo API, not yet persisted to PostgreSQL.</p>;
}

function eventDay(value) {
  if (/today/i.test(String(value))) return 'TODAY';
  if (/tomorrow/i.test(String(value))) return 'NEXT';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en', { day: '2-digit' }).format(parsed);
  }
  const match = String(value).match(/\b(\d{1,2})\b/);
  return match?.[1] || '—';
}

function eventMonth(value) {
  if (/today/i.test(String(value))) return 'NOW';
  if (/tomorrow/i.test(String(value))) return 'SOON';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase();
  }
  const match = String(value).match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  return match?.[1]?.toUpperCase() || 'SOON';
}

function formatEventDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

function initialsFor(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('');
}
