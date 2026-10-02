import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import '../styles/directory.css';

function PublicFrame({ children }) {
  return (
    <main className="directory-page">
      <header className="public-header">
        <Link className="public-brand" to="/"><span className="brand-seal">C</span>Campus<span>Sphere</span></Link>
        <nav aria-label="CampusSphere"><Link to="/clubs">Clubs</Link><Link to="/events">Events</Link></nav>
        <Link className="quiet-button" to="/login">Sign in <span aria-hidden="true">↗</span></Link>
      </header>
      {children}
      <footer className="directory-footer"><Link to="/">CampusSphere</Link><span>Demo API listings · PostgreSQL persistence is not connected.</span></footer>
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
        <p className="eyebrow">CampusSphere · Discover</p>
        <h1>{kind === 'events' ? <>Make room for<br /><em>what’s next.</em></> : kind === 'club' ? <>A place to<br /><em>belong.</em></> : <>Find your<br /><em>community.</em></>}</h1>
        <p>Explore the people, ideas, and gatherings shaping campus life.</p>
      </section>
      {error ? (
        <div className="directory-state" role="alert">
          <strong>We couldn’t load this campus information.</strong>
          <p>{error}</p>
          <Link to="/">Return home</Link>
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

function EventList({ events }) {
  if (!events.length) return <div className="directory-state"><strong>No upcoming events are listed.</strong><p>New campus events will appear here when published.</p></div>;

  return (
    <section className="directory-list" aria-label="Campus events">
      {events.map((event, index) => (
        <article className="directory-row event-directory-row" key={event.id}>
          <span className="directory-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="directory-row-main"><strong>{event.title}</strong><small>{event.club}</small></span>
          <span className="directory-row-detail">{event.date}<br />{event.venue}</span>
          <Link className="directory-arrow" to="/login" aria-label={`Sign in to register for ${event.title}`}>↗</Link>
        </article>
      ))}
    </section>
  );
}

function ClubDetail({ data }) {
  const club = data.club;
  if (!club) return <div className="directory-state"><strong>Club not found.</strong><Link to="/clubs">Browse all clubs</Link></div>;

  return (
    <section className="club-detail-public">
      <div className="club-detail-banner">
        <span>{club.category || 'Campus community'}</span>
        <h2>{club.name}</h2>
        <p>{club.members ?? '—'} members · {club.events ?? 0} events</p>
        <Link className="button-crimson" to="/login">Sign in to apply <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="club-detail-copy">
        <div><p className="eyebrow">About this club</p><p>{club.description || 'Club details will be published soon.'}</p></div>
        <div><p className="eyebrow">Faculty coordinator</p><p>{club.facultyCoordinator || 'Not listed'}</p></div>
      </div>
    </section>
  );
}
