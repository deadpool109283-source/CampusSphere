import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { apiFetch } from '../lib/api';
import '../styles/home.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clubImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1100&q=85',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=85',
];

function dateParts(value) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(parsed),
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase(),
    };
  }
  const day = String(value).match(/\b(\d{1,2})\b/)?.[1] || '—';
  const month = String(value).match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i)?.[1]?.toUpperCase() || 'SOON';
  return { day, month };
}

export default function Home() {
  const pageRef = useRef(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([apiFetch('/clubs', { signal: controller.signal }), apiFetch('/events', { signal: controller.signal })])
      .then(([clubData, eventData]) => {
        setClubs(clubData.clubs || []);
        setEvents(eventData.events || []);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: '(min-width: 900px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      ({ conditions }) => {
        const { desktop, reduceMotion } = conditions;
        if (reduceMotion) return undefined;

        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .from('.landing-nav', { y: -18, autoAlpha: 0, duration: 0.55 })
          .from('.hero-kicker, .hero-title-line, .hero-copy, .hero-actions', {
            y: 24,
            autoAlpha: 0,
            duration: 0.65,
            stagger: 0.09,
          }, '-=0.28')
          .from('.hero-photo', { scale: 1.04, autoAlpha: 0, duration: 0.8 }, '-=0.45');

        gsap.to('.hero-copy-wrap', {
          y: 80,
          autoAlpha: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '.landing-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });

        pageRef.current?.querySelectorAll('.reveal-on-scroll').forEach((element) => {
          gsap.from(element, {
            y: 28,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        if (desktop) {
          const track = pageRef.current?.querySelector('.club-track');
          const gallery = pageRef.current?.querySelector('.club-gallery');
          if (track && gallery && track.scrollWidth > gallery.clientWidth) {
            const distance = () => Math.max(0, track.scrollWidth - gallery.clientWidth);
            gsap.to(track, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: gallery,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
          }
        }

        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(refreshFrame);
      },
      pageRef,
    );
    return () => media.revert();
  }, { scope: pageRef, dependencies: [isLoading, clubs.length, events.length], revertOnUpdate: true });

  const featuredEvent = events[0];
  const featuredDate = featuredEvent ? dateParts(featuredEvent.date) : null;

  return (
    <main id="top" ref={pageRef} className="campus-landing">
      <header className="landing-nav">
        <Link className="brand-mark" to="/" aria-label="CampusSphere home">
          <span className="brand-seal" aria-hidden="true">C</span>
          <span>Campus<span>Sphere</span></span>
        </Link>
        <nav className="landing-links" aria-label="Main navigation">
          <Link to="/clubs">Explore clubs</Link>
          <Link to="/events">Campus events</Link>
        </nav>
        <Link className="nav-login" to="/login">Sign in <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="landing-hero">
        <div className="hero-copy-wrap">
          <p className="hero-kicker"><span /> The digital front door to campus life</p>
          <h1 className="hero-title">
            <span className="hero-title-line">YOUR CAMPUS.</span>
            <span className="hero-title-line hero-title-offset">YOUR CLUBS.</span>
            <span className="hero-title-line">YOUR MOMENTS.</span>
          </h1>
          <div className="hero-bottom">
            <p className="hero-copy">Find your people, discover what’s happening, and make your mark on campus.</p>
            <div className="hero-actions">
              <Link className="button-crimson" to="/clubs">Explore the community <span aria-hidden="true">↘</span></Link>
              <Link className="button-text" to="/login">I’m part of campus <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo" role="img" aria-label="Students gathering on a university campus" />
          <div className="hero-photo-caption"><span>01 / CAMPUS LIFE</span><span>Make room for what moves you.</span></div>
          <span className="hero-side-note">AMRITA · EST. 2003</span>
        </div>
        <a className="scroll-cue" href="#clubs"><span /> Scroll to discover</a>
      </section>

      <section className="campus-numbers" aria-label="CampusSphere listings">
        <p className="section-eyebrow">A campus, connected</p>
        <div className="numbers-grid">
          <div><strong>{isLoading ? '—' : clubs.length}</strong><span>Clubs listed</span></div>
          <div><strong>{isLoading ? '—' : events.length}</strong><span>Events listed</span></div>
          <p>One place for everything happening beyond the classroom.</p>
        </div>
        <p className="landing-data-note">Current listings are provided by the CampusSphere API.</p>
        {error && <p className="landing-data-note" role="status">Campus listings are temporarily unavailable.</p>}
      </section>

      <section className="club-gallery" id="clubs">
        <div className="club-gallery-heading">
          <div className="reveal-on-scroll">
            <p className="section-eyebrow">Find your people</p>
            <h2>There’s a place<br />for <em>your kind</em> of curious.</h2>
          </div>
          <p className="gallery-hint">Communities making<br />campus their own <span>→</span></p>
        </div>
        {isLoading ? (
          <p className="landing-list-state" role="status">Finding campus communities…</p>
        ) : clubs.length ? (
          <div className="club-track">
            {clubs.map((club, index) => (
              <article className="club-card" key={club.id}>
                <img src={clubImages[index % clubImages.length]} alt="" loading="lazy" />
                <div className="club-card-shade" />
                <div className="club-card-top"><span>{String(index + 1).padStart(2, '0')} / {String(clubs.length).padStart(2, '0')}</span><span>{club.category || 'Campus community'}</span></div>
                <div className="club-card-bottom">
                  <div><p>{club.members ?? '—'} members</p><h3>{club.name}</h3></div>
                  <Link to={`/clubs/${club.id}`} aria-label={`Explore ${club.name}`}>↗</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="landing-list-state">{error || 'No clubs are listed yet.'}</p>
        )}
        <div className="gallery-footer"><span>DISCOVER YOUR COMMUNITY</span><Link to="/clubs">Explore all clubs <span>↗</span></Link></div>
      </section>

      <section className="event-feature" id="events">
        <div className="event-feature-copy reveal-on-scroll">
          <p className="section-eyebrow">{featuredEvent ? `Next on campus · ${featuredDate.day} ${featuredDate.month}` : 'Campus events'}</p>
          <h2>Make something<br /><em>that matters.</em></h2>
          <p>{featuredEvent?.description || 'Big ideas, late nights, and a team you haven’t met yet. Find the next gathering on campus.'}</p>
          <Link className="button-crimson" to="/events">Discover campus events <span aria-hidden="true">↗</span></Link>
        </div>
        {featuredEvent ? (
          <article className="event-poster reveal-on-scroll">
            <div className="event-poster-image" role="img" aria-label={`${featuredEvent.title} event`} />
            <div className="event-date"><strong>{featuredDate.day}</strong><span>{featuredDate.month}<br />CAMPUS</span></div>
            <div className="event-poster-title">
              <span>{featuredEvent.club}</span>
              <h3>{featuredEvent.title}</h3>
              <div><span>{featuredEvent.venue}</span><span>{featuredEvent.date}</span></div>
            </div>
          </article>
        ) : (
          <div className="event-poster-empty">{isLoading ? 'Loading campus calendar…' : error || 'No events are listed yet.'}</div>
        )}
      </section>

      <section className="closing-cta">
        <p className="section-eyebrow">Join the campus story</p>
        <h2>More than a schedule.<br /><em>A life between classes.</em></h2>
        <Link className="button-cream" to="/login">Step into CampusSphere <span aria-hidden="true">↗</span></Link>
        <span className="closing-stamp" aria-hidden="true">CS<br />26</span>
      </section>

      <footer className="landing-footer">
        <Link className="brand-mark" to="/"><span className="brand-seal" aria-hidden="true">C</span><span>Campus<span>Sphere</span></span></Link>
        <p>DBMS Mini-Project · Amrita Vishwa Vidyapeetham</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
