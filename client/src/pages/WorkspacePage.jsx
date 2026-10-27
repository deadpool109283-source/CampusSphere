import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Download,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Ticket,
  Users,
  WalletCards,
  FolderKanban,
  Laptop,
  ShieldCheck,
  FileSpreadsheet,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useSession } from '../auth/useSession';
import RegistrationDialog from '../components/RegistrationDialog';
import RoleWorkflow from '../components/RoleWorkflow';
import { resolveDashboardTrack } from '../components/WorkspaceLayout';
import AccountDeskView from '../components/views/AccountDeskView';
import AnnouncementsView from '../components/views/AnnouncementsView';
import ClubChatsView from '../components/views/ClubChatsView';
import ClubMembersView from '../components/views/ClubMembersView';
import CredentialRequestsView from '../components/views/CredentialRequestsView';
import EquipmentView from '../components/views/EquipmentView';
import EventReportsView from '../components/views/EventReportsView';
import FundingView from '../components/views/FundingView';
import MembershipView from '../components/views/MembershipView';
import ProfileView from '../components/views/ProfileView';
import ReportsView from '../components/views/ReportsView';
import {
  TechnicalEventProposalModal,
  ClubVerificationModal,
} from '../components/WorkspaceModals';
import EventDetailModal from '../components/EventDetailModal';
import { apiDownload, apiFetch } from '../lib/api';
import {
  hasPreviewApplication,
  readPublishedPreviewEvents,
} from '../lib/workflowPreview';

gsap.registerPlugin(useGSAP);

const roleCopy = {
  STUDENT: {
    eyebrow: 'Campus Life & Hub',
    titleTop: 'A good day starts with',
    titleAccent: 'showing up.',
    intro: 'Your personal window into events, clubs, and moments shaping campus life today.',
  },
  CLUB_COMMITTEE: {
    eyebrow: 'Club Operations Desk',
    titleTop: 'Make good things',
    titleAccent: 'happen here.',
    intro: 'A clear view of the club directory and event calendar for your campus.',
  },
  CLUB_EXECUTIVE: {
    eyebrow: 'Event-Day Command Desk',
    titleTop: 'Be there when',
    titleAccent: 'the moments happen.',
    intro: 'Support your club’s operations and record student attendance in real time.',
  },
  CLUB_PRESIDENT: {
    eyebrow: 'President Executive Desk',
    titleTop: 'Lead your club from',
    titleAccent: 'idea to impact.',
    intro: 'Coordinate your team, submit proposals, and monitor administrative approvals.',
  },
  FACULTY: {
    eyebrow: 'Faculty Mentor Review',
    titleTop: 'Guide good ideas',
    titleAccent: 'into action.',
    intro: 'Review event proposals, evaluate budgets, and verify final attendance records.',
  },
  ADMIN: {
    eyebrow: 'Student Affairs Directorate',
    titleTop: 'Support the whole',
    titleAccent: 'campus community.',
    intro: 'Manage club registrations, approve event budgets, and oversee campus-wide student life.',
  },
};

function getClubCategory(club) {
  if (!club) return 'Technology';
  const name = (club.name || '').toLowerCase();
  if (name.includes('microsoft')) return 'Technology';
  if (club.category && club.category !== 'Campus community' && club.category !== 'Community' && club.category !== 'Student Club') {
    return club.category;
  }
  if (club.clubType === 'technical' || name.includes('cod') || name.includes('tech') || name.includes('robot') || name.includes('comput')) {
    return 'Technology';
  }
  if (name.includes('design') || name.includes('art') || name.includes('media')) {
    return 'Design & Arts';
  }
  return club.category || 'Technology';
}

export default function WorkspacePage() {
  const containerRef = useRef(null);
  const location = useLocation();
  const { clubId } = useParams();
  const { session, reloadProfile } = useSession();
  const profile = session.profile;
  const role = profile?.role || 'STUDENT';
  const track = resolveDashboardTrack(profile, profile?.memberships);
  const assignedClubId = role === 'FACULTY' ? profile?.clubIds?.[0] : undefined;
  const isClubDetail = Boolean(clubId);

  const KNOWN_VIEWS = [
    'clubs',
    'events',
    'membership',
    'members',
    'chats',
    'equipment',
    'funding',
    'reports',
    'event-reports',
    'announcements',
    'credential-requests',
    'account-desk',
    'profile',
  ];
  const matchedView = KNOWN_VIEWS.find((k) => location.pathname.endsWith(`/${k}`));
  const view = isClubDetail ? 'club' : (matchedView || 'home');

  const [data, setData] = useState(null);
  const [requestState, setRequestState] = useState({ key: '', error: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reloadData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const requestKey = `${role}:${track}:${view}:${clubId || ''}:${assignedClubId || ''}:${refreshTrigger}`;

  useEffect(() => {
    const controller = new AbortController();

    let request;
    if (view === 'membership') {
      request = Promise.all([
        apiFetch('/applications', { signal: controller.signal }).catch(() => []),
        apiFetch('/members/mine', { signal: controller.signal }).catch(() => []),
        apiFetch('/participation', { signal: controller.signal }).catch(() => []),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
      ]).then(([applications, memberships, participation, clubRes]) => ({
        applications: Array.isArray(applications) ? applications : [],
        memberships: Array.isArray(memberships) ? memberships : [],
        participation: Array.isArray(participation) ? participation : [],
        clubs: clubRes.clubs || [],
      }));
    } else if (view === 'members') {
      request = Promise.all([
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/members', { signal: controller.signal }).catch(() => []),
      ]).then(([clubRes, members]) => ({
        clubs: clubRes.clubs || [],
        members: Array.isArray(members) ? members : [],
      }));
    } else if (view === 'chats') {
      request = Promise.all([
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/chats', { signal: controller.signal }).catch(() => []),
      ]).then(([clubRes, chats]) => ({
        clubs: clubRes.clubs || [],
        chats: Array.isArray(chats) ? chats : [],
      }));
    } else if (view === 'equipment') {
      request = Promise.all([
        apiFetch('/equipment', { signal: controller.signal }).catch(() => []),
        apiFetch('/equipment-borrows', { signal: controller.signal }).catch(() => []),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/events', { signal: controller.signal }).catch(() => ({ events: [] })),
      ]).then(([equipment, borrows, clubRes, eventRes]) => ({
        equipment: Array.isArray(equipment) ? equipment : [],
        borrows: Array.isArray(borrows) ? borrows : [],
        clubs: clubRes.clubs || [],
        events: eventRes.events || [],
      }));
    } else if (view === 'funding') {
      request = Promise.all([
        apiFetch('/funding-requests', { signal: controller.signal }).catch(() => []),
        apiFetch('/transactions', { signal: controller.signal }).catch(() => []),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/events', { signal: controller.signal }).catch(() => ({ events: [] })),
      ]).then(([funding, transactions, clubRes, eventRes]) => ({
        funding: Array.isArray(funding) ? funding : [],
        transactions: Array.isArray(transactions) ? transactions : [],
        clubs: clubRes.clubs || [],
        events: eventRes.events || [],
      }));
    } else if (view === 'reports') {
      request = Promise.all([
        apiFetch('/reports/summary', { signal: controller.signal }).catch(() => ({})),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
      ]).then(([summary, clubRes]) => ({
        summary: summary || {},
        clubs: clubRes.clubs || [],
      }));
    } else if (view === 'event-reports') {
      request = Promise.all([
        apiFetch('/event-reports', { signal: controller.signal }).catch(() => []),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/events', { signal: controller.signal }).catch(() => ({ events: [] })),
      ]).then(([eventReports, clubRes, eventRes]) => ({
        eventReports: Array.isArray(eventReports) ? eventReports : [],
        clubs: clubRes.clubs || [],
        events: eventRes.events || [],
      }));
    } else if (view === 'announcements') {
      request = Promise.all([
        apiFetch('/announcements', { signal: controller.signal }).catch(() => []),
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
      ]).then(([announcements, clubRes]) => ({
        announcements: Array.isArray(announcements) ? announcements : [],
        clubs: clubRes.clubs || [],
      }));
    } else if (view === 'credential-requests') {
      request = Promise.all([
        apiFetch('/credential-requests', { signal: controller.signal }).catch(() => []),
      ]).then(([credentialRequests]) => ({
        credentialRequests: Array.isArray(credentialRequests) ? credentialRequests : [],
      }));
    } else if (view === 'account-desk') {
      request = Promise.resolve({});
    } else if (view === 'profile') {
      request = Promise.resolve({});
    } else if (view === 'club' && clubId) {
      request = apiFetch(`/club/${clubId}`, { signal: controller.signal });
    } else if (view === 'clubs') {
      request = apiFetch('/clubs', { signal: controller.signal });
    } else if (view === 'events') {
      request = apiFetch('/events', { signal: controller.signal });
    } else if (view === 'home') {
      request = Promise.all([
        apiFetch('/clubs', { signal: controller.signal }).catch(() => ({ clubs: [] })),
        apiFetch('/events', { signal: controller.signal }).catch(() => ({ events: [] })),
        apiFetch('/announcements', { signal: controller.signal }).catch(() => []),
        apiFetch('/funding-requests', { signal: controller.signal }).catch(() => []),
        apiFetch('/equipment-borrows', { signal: controller.signal }).catch(() => []),
        apiFetch('/event-reports', { signal: controller.signal }).catch(() => []),
        apiFetch('/applications', { signal: controller.signal }).catch(() => []),
        apiFetch('/reports/summary', { signal: controller.signal }).catch(() => ({})),
        apiFetch('/credential-requests', { signal: controller.signal }).catch(() => []),
        apiFetch('/notifications', { signal: controller.signal }).catch(() => []),
        apiFetch('/admin/dashboard', { signal: controller.signal }).catch(() => ({})),
      ]).then(([clubRes, eventRes, announcements, funding, borrows, eventReports, applications, summary, credentialRequests, notifications, adminDash]) => ({
        clubs: clubRes.clubs || [],
        events: eventRes.events || [],
        announcements: Array.isArray(announcements) ? announcements : [],
        funding: Array.isArray(funding) ? funding : [],
        borrows: Array.isArray(borrows) ? borrows : [],
        eventReports: Array.isArray(eventReports) ? eventReports : [],
        applications: Array.isArray(applications) ? applications : [],
        summary: summary || {},
        credentialRequests: Array.isArray(credentialRequests) ? credentialRequests : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        attendance: adminDash?.attendance || [],
        upcomingEvents: eventRes.events || [],
      }));
    } else {
      request = Promise.all([
        apiFetch('/clubs', { signal: controller.signal }),
        apiFetch('/events', { signal: controller.signal }),
      ]).then(([clubResult, eventResult]) => ({ clubs: clubResult.clubs, events: eventResult.events }));
    }

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
  }, [view, clubId, role, requestKey, assignedClubId, session.profile]);

  // GSAP Smooth Stagger Entrance Animation
  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll('.reveal-card');
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    },
    { dependencies: [data, view], scope: containerRef }
  );

  const isLoading = requestState.key !== requestKey;
  const error = requestState.key === requestKey ? requestState.error : '';

  const previewEvents =
    import.meta.env.DEV && session.preview
      ? readPublishedPreviewEvents().map((event) => ({
          ...event,
          previewOnly: true,
          registeredCount: event.registeredCount || 0,
          capacity: event.capacity || 100,
          open: true,
        }))
      : [];

  const rawEvents = data?.events || data?.upcomingEvents || [];
  const events = [...previewEvents, ...rawEvents];
  const clubs = data?.clubs || [];

  const handleRegistrationSuccess = useCallback((eventId) => {
    setRegisteredEventIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    toast.success('Registration submitted! Your entry pass is confirmed.');
  }, []);

  // Action Handlers for V2 Domains
  const handleReviewApplication = async (id, values) => {
    await apiFetch(`/applications/${id}/review`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handleRespondInvitation = async (id, status) => {
    await apiFetch(`/members/${id}/respond`, { method: 'PATCH', body: { status } });
    reloadData();
  };

  const handleApplyClub = async (values) => {
    await apiFetch('/applications', { method: 'POST', body: values });
    reloadData();
  };

  const handleUpdateMemberRole = async (id, values) => {
    await apiFetch(`/members/${id}`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handleRemoveMember = async (id) => {
    await apiFetch(`/members/${id}`, { method: 'DELETE' });
    reloadData();
  };

  const handleNominateMember = async (values) => {
    await apiFetch('/members', { method: 'POST', body: values });
    reloadData();
  };

  const handleSendMessage = async (values) => {
    const newMsg = await apiFetch('/chats', { method: 'POST', body: values });
    setData((prev) => ({
      ...prev,
      chats: [...(prev?.chats || []), newMsg],
    }));
  };

  const handleRequestBorrow = async (values) => {
    await apiFetch('/equipment-borrows', { method: 'POST', body: values });
    reloadData();
  };

  const handleReturnEquipment = async (id) => {
    await apiFetch(`/equipment-borrows/${id}/return`, { method: 'PATCH' });
    reloadData();
  };

  const handleReviewBorrow = async (id, values) => {
    await apiFetch(`/equipment-borrows/${id}/review`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handleAddEquipment = async (values) => {
    await apiFetch('/equipment', { method: 'POST', body: values });
    reloadData();
  };

  const handleRequestFunding = async (values) => {
    await apiFetch('/funding-requests', { method: 'POST', body: values });
    reloadData();
  };

  const handleReviewFunding = async (id, values) => {
    await apiFetch(`/funding-requests/${id}/review`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handleCreateEventReport = async (values) => {
    await apiFetch('/event-reports', { method: 'POST', body: values });
    reloadData();
  };

  const handleReviewReport = async (id, values) => {
    await apiFetch(`/event-reports/${id}/review`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handlePostAnnouncement = async (values) => {
    await apiFetch('/announcements', { method: 'POST', body: values });
    reloadData();
  };

  const handleReviewCredentialRequest = async (id, values) => {
    await apiFetch(`/credential-requests/${id}`, { method: 'PATCH', body: values });
    reloadData();
  };

  const handleProposeEvent = async (values) => {
    await apiFetch('/events', { method: 'POST', body: values });
    reloadData();
  };

  if (isLoading) {
    return <WorkspaceLoading />;
  }

  if (error) {
    return <WorkspaceError error={error} />;
  }

  return (
    <div className="workspace-page-content" ref={containerRef}>
      {view === 'club' && <ClubProfile data={data} />}

      {view === 'clubs' && <ClubDirectory clubs={clubs} />}

      {view === 'events' && (
        <EventDirectory
          events={events}
          role={role}
          profile={session.profile}
          registeredEventIds={registeredEventIds}
          onRegister={(event) => setSelectedEvent(event)}
          onPropose={() => setShowProposeModal(true)}
        />
      )}

      {view === 'membership' && (
        <MembershipView
          applications={data?.applications || []}
          memberships={data?.memberships || []}
          participation={data?.participation || []}
          clubs={clubs}
          role={role}
          track={track}
          profile={profile}
          onReviewApplication={handleReviewApplication}
          onRespondInvitation={handleRespondInvitation}
          onApplyClub={handleApplyClub}
        />
      )}

      {view === 'members' && (
        <ClubMembersView
          clubs={clubs}
          members={data?.members || []}
          role={role}
          track={track}
          profile={profile}
          onUpdateMemberRole={handleUpdateMemberRole}
          onRemoveMember={handleRemoveMember}
          onNominateMember={handleNominateMember}
        />
      )}

      {view === 'chats' && (
        <ClubChatsView
          clubs={clubs}
          chats={data?.chats || []}
          role={role}
          track={track}
          profile={profile}
          userName={session.profile?.fullName || 'Student'}
          onSendMessage={handleSendMessage}
        />
      )}

      {view === 'equipment' && (
        <EquipmentView
          equipment={data?.equipment || []}
          borrows={data?.borrows || []}
          clubs={clubs}
          events={events}
          role={role}
          track={track}
          profile={profile}
          onRequestBorrow={handleRequestBorrow}
          onReturnEquipment={handleReturnEquipment}
          onReviewBorrow={handleReviewBorrow}
          onAddEquipment={handleAddEquipment}
        />
      )}

      {view === 'funding' && (
        <FundingView
          funding={data?.funding || []}
          transactions={data?.transactions || []}
          clubs={clubs}
          events={events}
          role={role}
          track={track}
          profile={profile}
          onRequestFunding={handleRequestFunding}
          onReviewFunding={handleReviewFunding}
        />
      )}

      {view === 'reports' && (
        <ReportsView
          summary={data?.summary || {}}
          role={role}
          track={track}
          profile={profile}
        />
      )}

      {view === 'event-reports' && (
        <EventReportsView
          eventReports={data?.eventReports || []}
          clubs={clubs}
          events={events}
          role={role}
          track={track}
          profile={profile}
          onCreateReport={handleCreateEventReport}
          onReviewReport={handleReviewReport}
          onResubmitReport={handleCreateEventReport}
        />
      )}

      {view === 'announcements' && (
        <AnnouncementsView
          announcements={data?.announcements || []}
          clubs={clubs}
          role={role}
          track={track}
          profile={profile}
          onPostAnnouncement={handlePostAnnouncement}
        />
      )}

      {view === 'credential-requests' && (
        <CredentialRequestsView
          credentialRequests={data?.credentialRequests || []}
          role={role}
          track={track}
          profile={profile}
          onReviewCredentialRequest={handleReviewCredentialRequest}
        />
      )}

      {view === 'account-desk' && (
        <AccountDeskView />
      )}

      {view === 'profile' && (
        <ProfileView session={session} role={role} track={track} />
      )}

      {/* OVERVIEW ROUTING PER 6 TRACKS */}
      {view === 'home' && track === 'icts' && (
        <AccountDeskView />
      )}

      {view === 'home' && track === 'student' && (
        <StudentHomeView
          data={data}
          clubs={clubs}
          events={events}
          session={session}
          registeredEventIds={registeredEventIds}
          onRegister={(event) => setSelectedEvent(event)}
        />
      )}

      {view === 'home' && track === 'student-affairs' && (
        <AdminOverview data={data} clubs={clubs} userName={session.profile?.fullName} />
      )}

      {view === 'home' && track === 'mentor' && (
        <MentorOverview data={data} clubs={clubs} events={events} session={session} />
      )}

      {view === 'home' && track === 'executive' && (
        <ExecutiveOverview data={data} clubs={clubs} events={events} session={session} />
      )}

      {view === 'home' && (track === 'office-bearer' || track === 'verified-office-bearer') && (
        <OfficeBearerOverview
          data={data}
          clubs={clubs}
          events={events}
          session={session}
          onOpenVerify={() => setShowVerifyModal(true)}
          onPropose={() => setShowProposeModal(true)}
        />
      )}

      {selectedEvent && (
        <RegistrationDialog
          event={selectedEvent}
          profile={session.profile}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showProposeModal && (
        <TechnicalEventProposalModal
          clubs={clubs}
          onClose={() => setShowProposeModal(false)}
          onSubmit={handleProposeEvent}
        />
      )}

      {showVerifyModal && (
        <ClubVerificationModal
          clubs={clubs}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={() => {
            reloadData();
            if (reloadProfile) reloadProfile();
          }}
        />
      )}
    </div>
  );
}

/* =========================================================================
   STUDENT HOME VIEW (Bento Grid Architecture)
========================================================================= */

function StudentHomeView({
  data,
  clubs,
  events,
  session,
  registeredEventIds,
  onRegister,
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [viewingEvent, setViewingEvent] = useState(null);
  const firstName = (session.profile?.fullName || 'Student').split(' ')[0];

  const currentCarouselEvent = events[carouselIndex] || events[0] || null;

  const handlePrevEvent = () => {
    if (!events.length) return;
    setSlideDirection('prev');
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const handleNextEvent = () => {
    if (!events.length) return;
    setSlideDirection('next');
    setCarouselIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
  };

  const handleSelectCarouselIndex = (idx) => {
    if (idx === carouselIndex) return;
    setSlideDirection(idx > carouselIndex ? 'next' : 'prev');
    setCarouselIndex(idx);
  };

  const filteredEvents = events.filter((evt) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'WORKSHOPS') return /workshop|bootcamp|hands-on/i.test(evt.title);
    if (activeCategory === 'TECH') return /code|hack|robot|tech|ai|dev/i.test(evt.title + ' ' + (evt.club || ''));
    if (activeCategory === 'CULTURAL') return /cultural|music|dance|art|fest/i.test(evt.title + ' ' + (evt.club || ''));
    return true;
  });

  return (
    <div className="workspace-stack">
      {/* Editorial Welcome Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">{roleCopy.STUDENT.eyebrow}</p>
          <span className="date-badge-pill">
            <Calendar size={13} />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="header-title-row">
          <h1>
            {roleCopy.STUDENT.titleTop} <em>{roleCopy.STUDENT.titleAccent}</em>
          </h1>
          <p className="header-subtitle">
            Welcome back, {firstName}. Here is what’s active across Amrita today.
          </p>
        </div>
      </header>

      {/* Primary Bento Grid with Interactive Event Carousel */}
      <section className="bento-grid" aria-label="Campus Highlights">
        {/* Spotlight Carousel Hero Card (2 Cols) */}
        {currentCarouselEvent ? (
          <article className="bento-card bento-spotlight reveal-card spotlight-carousel-container">
            <div className="spotlight-top">
              <div className="spotlight-top-left">
                <span className="live-status-pill">
                  <span className="pulse-dot" />
                  Featured Gathering
                </span>
                <span className="spotlight-club-tag">{currentCarouselEvent.club}</span>
              </div>

              {/* Carousel Navigation Arrows & Quick Trackers */}
              <div className="spotlight-carousel-nav">
                <button
                  type="button"
                  className="carousel-btn-icon"
                  onClick={handlePrevEvent}
                  disabled={events.length <= 1}
                  aria-label="Previous campus gathering"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="carousel-dot-strip" aria-label="Event slide indicator">
                  {events.slice(0, Math.min(events.length, 6)).map((evt, idx) => (
                    <button
                      key={evt.id || idx}
                      type="button"
                      className={`carousel-dot-pill${idx === carouselIndex ? ' is-active' : ''}`}
                      onClick={() => handleSelectCarouselIndex(idx)}
                      aria-label={`Jump to event ${idx + 1}: ${evt.title}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="carousel-btn-icon"
                  onClick={handleNextEvent}
                  disabled={events.length <= 1}
                  aria-label="Next campus gathering"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              className={`spotlight-body spotlight-body-animated slide-${slideDirection}`}
              key={`${currentCarouselEvent.id}-${carouselIndex}`}
            >
              <div className="spotlight-date-block">
                <strong>{eventDay(currentCarouselEvent.date)}</strong>
                <span>{eventMonth(currentCarouselEvent.date)}</span>
              </div>
              <div className="spotlight-details">
                <div className="spotlight-tags-row">
                  <span className="spotlight-counter-badge">
                    {carouselIndex + 1} of {events.length}
                  </span>
                  <span className="spotlight-category-chip">
                    {getClubCategory({ name: currentCarouselEvent.club, category: currentCarouselEvent.category })}
                  </span>
                </div>
                <h2
                  className="spotlight-title-interactive"
                  onClick={() => setViewingEvent(currentCarouselEvent)}
                  title="Click to view full event specs"
                >
                  {currentCarouselEvent.title}
                </h2>
                <div className="spotlight-meta-line">
                  <span>
                    <MapPin size={14} />
                    {currentCarouselEvent.venue || 'Main Auditorium'}
                  </span>
                  <span>·</span>
                  <span>
                    <Clock size={14} />
                    {formatEventDate(currentCarouselEvent.date)}
                  </span>
                </div>
                <p className="spotlight-summary">
                  {currentCarouselEvent.description ||
                    'Join fellow students for this curated session. Limited seats available per department.'}
                </p>
              </div>
            </div>

            <div className="spotlight-footer">
              <div className="spotlight-capacity">
                <div className="capacity-bar">
                  <div
                    className="capacity-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((currentCarouselEvent.registeredCount || 12) /
                            (currentCarouselEvent.capacity || 50)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <span className="capacity-text">
                  <strong>{currentCarouselEvent.registeredCount || 0}</strong> /{' '}
                  {currentCarouselEvent.capacity || 100} places reserved
                </span>
              </div>

              <div className="spotlight-actions-group">
                <button
                  type="button"
                  className="secondary-specs-btn"
                  onClick={() => setViewingEvent(currentCarouselEvent)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  className="primary-action-button"
                  disabled={
                    !currentCarouselEvent.open ||
                    registeredEventIds.includes(currentCarouselEvent.id) ||
                    (currentCarouselEvent.previewOnly &&
                      hasPreviewApplication(
                        currentCarouselEvent.id,
                        session.profile?.rollNumber
                      ))
                  }
                  onClick={() => onRegister(currentCarouselEvent)}
                >
                  {registeredEventIds.includes(currentCarouselEvent.id) ||
                  (currentCarouselEvent.previewOnly &&
                    hasPreviewApplication(
                      currentCarouselEvent.id,
                      session.profile?.rollNumber
                    )) ? (
                    <>
                      <CheckCircle2 size={16} /> Applied
                    </>
                  ) : currentCarouselEvent.open ? (
                    <>
                      Apply for pass <ArrowRight size={16} />
                    </>
                  ) : (
                    'Capacity Reached'
                  )}
                </button>
              </div>
            </div>
          </article>
        ) : (
          <article className="bento-card bento-spotlight reveal-card empty-card">
            <div className="empty-message">
              <Sparkles size={28} className="empty-icon" />
              <h3>No Major Events Scheduled Today</h3>
              <p>Check back shortly or explore club activities below.</p>
            </div>
          </article>
        )}

        {/* Quick Metrics & Pass Status (1 Col) */}
        <div className="bento-column reveal-card">
          <div className="metric-card metric-primary">
            <div className="metric-icon-wrap">
              <Ticket size={20} />
            </div>
            <div>
              <span className="metric-value">
                {registeredEventIds.length +
                  (data?.registeredEvents?.length || 0)}
              </span>
              <p className="metric-title">Event Passes</p>
              <small className="metric-subtext">Active registrations confirmed</small>
            </div>
            <Link to="/app/events" className="metric-link" aria-label="View passes">
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Compass size={20} />
            </div>
            <div>
              <span className="metric-value">{clubs.length || 8}</span>
              <p className="metric-title">Active Clubs</p>
              <small className="metric-subtext">Registered campus communities</small>
            </div>
            <Link to="/app/clubs" className="metric-link" aria-label="Explore clubs">
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="metric-card metric-status">
            <div className="status-indicator">
              <span className="status-dot green" />
              <span>Campus ID Active</span>
            </div>
            <p className="status-roll">
              {session.profile?.rollNumber || 'CB.EN.U4CSE22001'}
            </p>
            <span className="status-dept">
              {session.profile?.department || 'Computer Science & Engineering'}
            </span>
          </div>
        </div>
      </section>

      {/* Event Timeline & Category Filter Section */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Upcoming Schedule</p>
            <h2>Campus Events & Sessions</h2>
          </div>

          <div className="filter-pill-group">
            {[
              { id: 'ALL', label: 'All Gatherings' },
              { id: 'TECH', label: 'Tech & Code' },
              { id: 'WORKSHOPS', label: 'Workshops' },
              { id: 'CULTURAL', label: 'Cultural' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill${activeCategory === cat.id ? ' is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="events-three-col-grid">
          {filteredEvents.slice(0, 6).map((evt) => {
            const evtDate = dateParts(evt.date);
            const capacity = Number(evt.capacity || 100);
            const registered = Number(evt.registeredCount || 0);
            const percent = Math.min(100, Math.round((registered / capacity) * 100));
            const isRegistered =
              registeredEventIds.includes(evt.id) ||
              (evt.previewOnly &&
                hasPreviewApplication(evt.id, session.profile?.rollNumber));

            return (
              <article
                className="event-card-modern"
                key={evt.id}
                onClick={() => setViewingEvent(evt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setViewingEvent(evt);
                  }
                }}
              >
                {/* Media banner with picture */}
                <div className="event-card-media">
                  <img
                    src={evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                    alt={evt.title}
                    loading="lazy"
                    className="event-card-img"
                  />
                  <div className="event-card-media-shade" />

                  {/* Floating Date Badge */}
                  <div className="event-card-date-badge">
                    <span className="event-date-day">{evtDate.day}</span>
                    <span className="event-date-mon">{evtDate.month}</span>
                  </div>

                  {/* Category Tag Top Right */}
                  <div className="event-card-top-tag">
                    <span className="event-category-badge">{evt.category || 'Gathering'}</span>
                  </div>

                  {/* Bottom Media Bar */}
                  <div className="event-card-media-footer">
                    <span className="event-club-pill">{evt.club}</span>
                    {evt.open && (
                      <span className="event-od-pill">
                        <Sparkles size={11} /> OD Pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="event-card-body">
                  <h3 className="event-card-title">{evt.title}</h3>

                  <p className="event-card-excerpt">
                    {evt.description || 'Join this engaging campus gathering to build, collaborate, and connect with peers.'}
                  </p>

                  <div className="event-card-meta-list">
                    <span className="event-meta-item">
                      <MapPin size={13} />
                      <span>{evt.venue || 'Amrita Campus'}</span>
                    </span>
                    <span className="event-meta-item">
                      <Calendar size={13} />
                      <span>{String(evt.date || '').slice(0, 10)}</span>
                    </span>
                  </div>

                  {/* Capacity Meter */}
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
                      <strong className={evt.open ? 'status-open' : 'status-full'}>
                        {evt.open ? 'Seats Open' : 'Full'}
                      </strong>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="event-card-footer">
                    <button
                      type="button"
                      className="event-card-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingEvent(evt);
                      }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="event-card-register-btn"
                      disabled={!evt.open || isRegistered}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isRegistered && evt.open) {
                          onRegister(evt);
                        }
                      }}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} /> Registered
                        </>
                      ) : evt.open ? (
                        'Register ↗'
                      ) : (
                        'Closed'
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="empty-grid-notice">
              <p>No events found for this filter category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Clubs Spotlight */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Student Communities</p>
            <h2>Explore Active Clubs</h2>
          </div>
          <Link className="editorial-arrow-link" to="/app/clubs">
            <span>Explore all {clubs.length} clubs</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="clubs-grid-modern">
          {clubs.slice(0, 3).map((club, idx) => {
            const clubCategory = getClubCategory(club);
            return (
              <Link
                to={`/app/clubs/${club.id}`}
                className="club-card-modern"
                key={club.id}
              >
                <div className="club-card-top">
                  <span className="club-card-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="club-card-name">{club.name}</h3>
                <p className="club-card-desc">{club.description}</p>
                <div className="club-card-footer">
                  <div className="club-footer-info">
                    <span className="club-members-count">
                      <Users size={14} />
                      {club.members ?? 42} active members
                    </span>
                    <span className="club-hover-type-badge">
                      <Tag size={12} className="type-badge-icon" />
                      <span className="type-badge-text">{clubCategory}</span>
                    </span>
                  </div>
                  <span className="club-explore-arrow">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Campus Announcements Bulletin */}
      {data?.announcements?.length > 0 && (
        <section className="workspace-section reveal-card">
          <div className="section-header-modern">
            <div>
              <p className="eyebrow">Campus Bulletin</p>
              <h2>Latest Announcements</h2>
            </div>
          </div>
          <div className="announcements-stack">
            {data.announcements.map((item) => (
              <article className="announcement-item" key={item.id}>
                <div className="announcement-source">
                  <span className="bulletin-chip">{item.club}</span>
                  <time className="bulletin-time">Recent notice</time>
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Floating Window Event Detail Modal */}
      {viewingEvent && (
        <EventDetailModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onRegister={(evt) => {
            setViewingEvent(null);
            onRegister(evt);
          }}
          isRegistered={
            registeredEventIds.includes(viewingEvent.id) ||
            (viewingEvent.previewOnly &&
              hasPreviewApplication(viewingEvent.id, session.profile?.rollNumber))
          }
          actionLabel="Register for this pass now"
        />
      )}
    </div>
  );
}

/* =========================================================================
   FACULTY MENTOR OVERVIEW
========================================================================= */

function MentorOverview({ data, clubs, events, session }) {
  const profile = session.profile;
  const firstName = (profile?.fullName || 'Mentor').split(' ')[0];
  const assignedClubs = clubs.filter(
    (c) =>
      c.mentor === profile?.id ||
      (c.mentorIds || []).some((m) => (m._id || m) === profile?.id) ||
      (profile?.clubNames || []).includes(c.name) ||
      c.name === profile?.clubName
  );
  const activeClubs = assignedClubs.length > 0 ? assignedClubs : clubs;

  const pendingEvents = (data?.events || []).filter((e) => e.status === 'mentor_pending');
  const pendingEquipment = (data?.borrows || []).filter((b) => b.status === 'mentor_pending');
  const pendingFunding = (data?.funding || []).filter((f) => f.status === 'mentor_pending');
  const pendingReports = (data?.eventReports || []).filter((r) => r.status === 'mentor_pending');
  const announcements = (data?.announcements || []).slice(0, 4);

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">FACULTY MENTOR ADVISORY DESK</p>
          <span className="date-badge-pill">
            <ShieldCheck size={13} /> Assigned Club Purview
          </span>
        </div>
        <div className="header-title-row">
          <h1>
            Guide student initiatives <em>into excellence.</em>
          </h1>
          <p className="header-subtitle">
            Welcome back, {firstName}. Review event proposals, equipment requisitions, grant budgets, and completion reports for your assigned clubs.
          </p>
        </div>
      </header>

      {/* Assigned Clubs Context Strip */}
      <div className="bento-card reveal-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--ws-surface-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ws-accent)', textTransform: 'uppercase' }}>Mentored Communities</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {activeClubs.map((c) => (
                <span key={c._id || c.id} className="editorial-role-chip" style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          <Link to="/app/members" className="editorial-arrow-link" style={{ fontSize: '0.85rem' }}>
            <span>View club rosters</span> <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Review Queues KPI Strip */}
      <div className="admin-kpi-grid reveal-card">
        <Link to="/app/events" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Event Proposals</span>
          <strong className="kpi-number">{pendingEvents.length}</strong>
          <span className="kpi-foot">Awaiting your approval</span>
        </Link>
        <Link to="/app/equipment" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Equipment Borrows</span>
          <strong className="kpi-number">{pendingEquipment.length}</strong>
          <span className="kpi-foot">Asset requisition reviews</span>
        </Link>
        <Link to="/app/funding" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Funding Grants</span>
          <strong className="kpi-number">{pendingFunding.length}</strong>
          <span className="kpi-foot">Budget grant reviews</span>
        </Link>
        <Link to="/app/event-reports" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Event Reports</span>
          <strong className="kpi-number">{pendingReports.length}</strong>
          <span className="kpi-foot">OD rosters to certify</span>
        </Link>
      </div>

      {/* Actionable Review Queue Preview */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Pending Actions</p>
            <h3>Items Requiring Faculty Review</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {pendingEvents.slice(0, 3).map((evt) => (
            <div key={evt._id || evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))', border: '1px solid var(--ws-border-subtle)' }}>
              <div>
                <strong>{evt.title}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--ws-text-muted)', display: 'block' }}>{evt.club} · Event Proposal</span>
              </div>
              <Link to="/app/events" className="action-pill-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Review Proposal</Link>
            </div>
          ))}
          {pendingFunding.slice(0, 2).map((f) => (
            <div key={f._id || f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))', border: '1px solid var(--ws-border-subtle)' }}>
              <div>
                <strong>₹{Number(f.requestedAmount || 0).toLocaleString('en-IN')} Grant Requisition</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--ws-text-muted)', display: 'block' }}>{f.clubId?.name || 'Club'} · {f.purpose}</span>
              </div>
              <Link to="/app/funding" className="action-pill-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Review Budget</Link>
            </div>
          ))}
          {!pendingEvents.length && !pendingFunding.length && !pendingEquipment.length && !pendingReports.length && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ws-text-muted)' }}>
              <CheckCircle2 size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5, color: 'var(--ws-success)' }} />
              <p style={{ margin: 0 }}>All faculty review queues are clear.</p>
            </div>
          )}
        </div>
      </section>

      {/* Announcements noticeboard */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Campus Bulletins</p>
            <h3>Recent Announcements</h3>
          </div>
          <Link to="/app/announcements" className="editorial-arrow-link" style={{ fontSize: '0.85rem' }}>
            <span>All notices</span> <ArrowUpRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {announcements.map((note, idx) => (
            <div key={note._id || idx} style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))', border: '1px solid var(--ws-border-subtle)' }}>
              <strong style={{ fontSize: '0.9rem' }}>{note.title}</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--ws-text-muted)' }}>{note.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   CLUB EXECUTIVE OVERVIEW
========================================================================= */

function ExecutiveOverview({ data, clubs, events, session }) {
  const profile = session.profile;
  const firstName = (profile?.fullName || 'Executive').split(' ')[0];
  const pendingApps = (data?.applications || []).filter((a) => a.status === 'pending');
  const upcomingEvts = events.slice(0, 3);
  const announcements = (data?.announcements || []).slice(0, 3);

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">CLUB EXECUTIVE COMMAND DESK</p>
          <span className="date-badge-pill">
            <Users size={13} /> Executive Wing
          </span>
        </div>
        <div className="header-title-row">
          <h1>
            Empower your club, <em>lead the day.</em>
          </h1>
          <p className="header-subtitle">
            Welcome back, {firstName}. Manage student recruitment, engage members in club chat, and publish community announcements.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="admin-kpi-grid reveal-card">
        <Link to="/app/membership" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Pending Applications</span>
          <strong className="kpi-number">{pendingApps.length}</strong>
          <span className="kpi-foot">Students awaiting induction</span>
        </Link>
        <Link to="/app/chats" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Club Chats</span>
          <strong className="kpi-number">Active</strong>
          <span className="kpi-foot">Direct team channels</span>
        </Link>
        <Link to="/app/announcements" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Announcements</span>
          <strong className="kpi-number">{data?.announcements?.length || 0}</strong>
          <span className="kpi-foot">Broadcast bulletins</span>
        </Link>
      </div>

      {/* Pending Items & Direct Actions */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Executive Responsibilities</p>
            <h3>Authorised Actions &amp; Queues</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/app/announcements" className="action-pill-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              Publish Announcement
            </Link>
            <Link to="/app/membership" className="subtle-btn" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', border: '1px solid var(--ws-border-subtle)', borderRadius: '0.5rem' }}>
              Review Applications
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {pendingApps.slice(0, 3).map((app) => (
            <div key={app._id || app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))', border: '1px solid var(--ws-border-subtle)' }}>
              <div>
                <strong>{app.profileId?.name || 'Applicant'}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--ws-text-muted)', display: 'block' }}>Applied for {app.requestedPosition || 'Membership'}</span>
              </div>
              <Link to="/app/membership" className="subtle-btn" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', border: '1px solid var(--ws-border-subtle)', borderRadius: '0.4rem' }}>
                Review
              </Link>
            </div>
          ))}
          {!pendingApps.length && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ws-text-muted)' }}>No pending recruitment applications.</p>
          )}
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Event Calendar</p>
            <h2>Upcoming Campus Gatherings</h2>
          </div>
          <Link to="/app/events" className="editorial-arrow-link">
            <span>View all</span> <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="events-three-col-grid">
          {upcomingEvts.map((evt) => (
            <article className="event-card-modern" key={evt.id || evt._id}>
              <div className="event-card-media">
                <img src={evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'} alt={evt.title} className="event-card-img" />
              </div>
              <div className="event-card-body">
                <h3 className="event-card-title">{evt.title}</h3>
                <p className="event-card-excerpt">{evt.description || 'Campus event scheduled.'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   CLUB OFFICE BEARER OVERVIEW
========================================================================= */

function OfficeBearerOverview({ data, clubs, events, session, onOpenVerify, onPropose }) {
  const profile = session.profile;
  const firstName = (profile?.fullName || 'Leader').split(' ')[0];
  const isVerified = Boolean(profile?.isClubAccount || profile?.verifiedClubId);
  const authorizedClubName = profile?.verifiedClubName || profile?.clubName || (profile?.memberships?.[0]?.clubId?.name) || 'Authorized Club';

  const clubEvents = (data?.events || []).filter((e) =>
    e.club === authorizedClubName || String(e.clubId) === String(profile?.verifiedClubId)
  );
  const clubEquipment = (data?.borrows || []).filter((b) =>
    String(b.clubId?._id || b.clubId) === String(profile?.verifiedClubId)
  );
  const clubFunding = (data?.funding || []).filter((f) =>
    String(f.clubId?._id || f.clubId) === String(profile?.verifiedClubId)
  );
  const clubReports = (data?.eventReports || []).filter((r) =>
    String(r.clubId?._id || r.clubId) === String(profile?.verifiedClubId)
  );

  const handleExportClubCounts = async () => {
    try {
      await apiDownload('/reports/clubs/export', `${authorizedClubName.toLowerCase().replace(/\s+/g, '-')}-analytics.csv`);
      toast.success('Club analytics summary exported!');
    } catch (err) {
      toast.error(err.message || 'Failed to export club analytics');
    }
  };

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">CLUB OFFICE BEARER DESK</p>
          <span className="date-badge-pill">
            <ShieldCheck size={13} /> {authorizedClubName}
          </span>
        </div>
        <div className="header-title-row">
          <h1>
            Lead your community, <em>shape the campus.</em>
          </h1>
          <p className="header-subtitle">
            Welcome, {firstName}. Manage event proposals, equipment requisitions, grant budgets, and official completion reports for {authorizedClubName}.
          </p>
        </div>
      </header>

      {/* Verification Status Banner */}
      {!isVerified ? (
        <div className="bento-card reveal-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--ws-surface-subtle)', border: '1px solid var(--ws-accent-faint, rgba(230,57,70,0.2))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--ws-accent)', fontWeight: 600 }}>2-Stage Verification Required</span>
              <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem' }}>Verify Club Shared Credentials</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ws-text-muted)' }}>
                Sign in with your club's shared credentials to unlock event proposals, equipment borrowing, grant funding, and completion report submissions.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenVerify}
              className="action-pill-primary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem' }}
            >
              <KeyRound size={14} /> Verify Club Credentials
            </button>
          </div>
        </div>
      ) : (
        <div className="bento-card reveal-card" style={{ padding: '1rem 1.5rem', background: 'rgba(56, 161, 105, 0.08)', border: '1px solid rgba(56, 161, 105, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--ws-success, #38a169)' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--ws-text-bright)' }}>Verified Shared Session Active</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--ws-text-muted)', display: 'block' }}>Authorized club management unlocked for {authorizedClubName}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onPropose}
                className="action-pill-primary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                <Plus size={14} /> Propose Event
              </button>
              <button
                type="button"
                onClick={handleExportClubCounts}
                className="subtle-btn"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', border: '1px solid var(--ws-border-subtle)', borderRadius: '0.5rem' }}
              >
                <Download size={13} /> Export Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Status Strip */}
      <div className="admin-kpi-grid reveal-card">
        <Link to="/app/events" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Proposed Events</span>
          <strong className="kpi-number">{clubEvents.length}</strong>
          <span className="kpi-foot">View proposal statuses</span>
        </Link>
        <Link to="/app/equipment" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Equipment Requests</span>
          <strong className="kpi-number">{clubEquipment.length}</strong>
          <span className="kpi-foot">Lab assets requisitioned</span>
        </Link>
        <Link to="/app/funding" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Funding Requisitions</span>
          <strong className="kpi-number">{clubFunding.length}</strong>
          <span className="kpi-foot">Grant budget requests</span>
        </Link>
        <Link to="/app/event-reports" className="kpi-card" style={{ textDecoration: 'none' }}>
          <span className="kpi-label">Completion Reports</span>
          <strong className="kpi-number">{clubReports.length}</strong>
          <span className="kpi-foot">Post-event OD filings</span>
        </Link>
      </div>

      {/* Active Proposal Statuses Queue */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Authorised Club Activities</p>
            <h3>Live Proposals &amp; Submissions</h3>
          </div>
          <Link to="/app/events" className="editorial-arrow-link" style={{ fontSize: '0.85rem' }}>
            <span>Manage events</span> <ArrowUpRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {clubEvents.map((evt) => {
            const status = (evt.status || 'pending').toLowerCase();
            return (
              <div key={evt._id || evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))', border: '1px solid var(--ws-border-subtle)' }}>
                <div>
                  <strong>{evt.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ws-text-muted)', display: 'block' }}>Date: {new Date(evt.date || Date.now()).toLocaleDateString()} · {evt.venue || 'Campus Venue'}</span>
                </div>
                <span className={`editorial-role-chip`} style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {status.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
          {!clubEvents.length && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ws-text-muted)' }}>No event proposals submitted yet for this club.</p>
          )}
        </div>
      </section>

      {/* Club Chat Channel Link */}
      <section className="bento-card reveal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Community Communication</p>
            <h3 style={{ margin: '0.2rem 0' }}>Club Office Bearer Channel</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ws-text-muted)' }}>Coordinate event logistics and member communications.</p>
          </div>
          <Link to="/app/chats" className="action-pill-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.95rem' }}>
            Open Club Chat
          </Link>
        </div>
      </section>
    </div>
  );
}

function OperationsOverview({ role, userName, clubs, events }) {
  const [viewingEvent, setViewingEvent] = useState(null);
  const copy = roleCopy[role] || roleCopy.CLUB_PRESIDENT;
  const firstName = (userName || 'Leader').split(' ')[0];

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">{copy.eyebrow}</p>
          <span className="date-badge-pill">
            <Layers size={13} />
            Command Center
          </span>
        </div>
        <div className="header-title-row">
          <h1>
            {copy.titleTop} <em>{copy.titleAccent}</em>
          </h1>
          <p className="header-subtitle">
            Welcome back, {firstName}. {copy.intro}
          </p>
        </div>
      </header>

      <section className="reveal-card">
        <RoleWorkflow clubs={clubs} />
      </section>
    </div>
  );
}

/* =========================================================================
   ADMIN / STUDENT AFFAIRS OVERVIEW
========================================================================= */

function AdminOverview({ data, clubs, userName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const attendance = data?.attendance || [];
  const eventCount = data?.upcomingEvents?.length || (data?.events || []).length || 0;

  const allEvents = data?.events || [];
  const allEquipment = data?.borrows || [];
  const allFunding = data?.funding || data?.fundingRequests || [];
  const allReports = data?.eventReports || [];
  const allCredentials = data?.credentialRequests || [];
  const announcements = data?.announcements || [];

  const pendingEvents = allEvents.filter((e) =>
    ['pending', 'mentor_pending', 'student_affairs_pending'].includes(e.status?.toLowerCase())
  );
  const pendingEquipment = allEquipment.filter((b) =>
    ['pending', 'submitted', 'mentor_approved'].includes(b.status?.toLowerCase())
  );
  const pendingFunding = allFunding.filter((f) =>
    ['pending', 'submitted', 'under_review', 'mentor_approved'].includes(f.status?.toLowerCase())
  );
  const pendingReports = allReports.filter((r) =>
    ['pending', 'submitted', 'under_review', 'mentor_approved'].includes(r.status?.toLowerCase())
  );
  const pendingCredentials = allCredentials.filter((c) =>
    ['pending', 'requested'].includes(c.status?.toLowerCase())
  );

  const totalPending =
    pendingEvents.length +
    pendingEquipment.length +
    pendingFunding.length +
    pendingReports.length +
    pendingCredentials.length;

  const totalMembers =
    data?.summary?.totalMembers ||
    clubs.reduce((acc, c) => acc + (c.membersCount || c.memberCount || 0), 0) ||
    '2,400+';

  const filteredAttendance = attendance.filter((rec) => {
    const q = searchTerm.toLowerCase();
    return (
      rec.name?.toLowerCase().includes(q) ||
      rec.reg?.toLowerCase().includes(q) ||
      rec.event?.toLowerCase().includes(q)
    );
  });

  function downloadCsv() {
    const rows = [['Student Name', 'Registration Number', 'Event', 'Check-in Time']];
    attendance.forEach((record) =>
      rows.push([record.name, record.reg, record.event, record.time])
    );
    const csv = rows
      .map((row) =>
        row.map((val) => `"${String(val ?? '').replaceAll('"', '""')}"`).join(',')
      )
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amrita-attendance-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance CSV report downloaded.');
  }

  // Combine top urgent pending items for quick action
  const urgentQueue = [
    ...pendingEvents.map((e) => ({
      id: e._id || e.id,
      type: 'Event Proposal',
      title: e.title,
      club: e.club,
      status: e.status,
      link: '/app/events',
      icon: Calendar,
      date: e.date,
    })),
    ...pendingEquipment.map((eq) => ({
      id: eq._id || eq.id,
      type: 'Equipment Requisition',
      title: eq.item_name || eq.itemName || eq.purpose || 'Equipment Requisition',
      club: eq.club_name || eq.clubName || eq.club,
      status: eq.status,
      link: '/app/equipment',
      icon: Laptop,
      date: eq.borrow_date || eq.borrowDate || eq.createdAt,
    })),
    ...pendingFunding.map((fn) => ({
      id: fn._id || fn.id,
      type: 'Grant Funding',
      title: fn.purpose || fn.title || `Grant Requisition ₹${fn.amount || 0}`,
      club: fn.club_name || fn.clubName || fn.club,
      status: fn.status,
      link: '/app/funding',
      icon: WalletCards,
      date: fn.createdAt,
    })),
    ...pendingReports.map((rp) => ({
      id: rp._id || rp.id,
      type: 'Completion Report',
      title: rp.event_title || rp.eventTitle || rp.title || 'Event Completion Report',
      club: rp.club_name || rp.clubName || rp.club,
      status: rp.status,
      link: '/app/event-reports',
      icon: FileSpreadsheet,
      date: rp.submitted_at || rp.createdAt,
    })),
    ...pendingCredentials.map((cr) => ({
      id: cr._id || cr.id,
      type: 'Club Login Change',
      title: `Credential Request for ${cr.club_name || cr.clubName || cr.clubId}`,
      club: cr.club_name || cr.clubName || cr.clubId,
      status: cr.status,
      link: '/app/credential-requests',
      icon: KeyRound,
      date: cr.requested_at || cr.createdAt,
    })),
  ].slice(0, 8);

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">{roleCopy.ADMIN.eyebrow}</p>
          <span className="date-badge-pill">
            <CheckCircle2 size={13} />
            Institutional Dashboard
          </span>
        </div>
        <div className="header-title-row">
          <h1>
            {roleCopy.ADMIN.titleTop} <em>{roleCopy.ADMIN.titleAccent}</em>
          </h1>
          <p className="header-subtitle">
            Welcome, {userName}. Overseeing campus life, club approvals, and student affairs.
          </p>
        </div>
      </header>

      {/* Admin Institutional KPI Metric Cards */}
      <div className="admin-kpi-grid reveal-card">
        <div className="kpi-card">
          <span className="kpi-label">Registered Clubs</span>
          <strong className="kpi-number">{clubs.length}</strong>
          <span className="kpi-foot">Campus communities active</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Scheduled Events</span>
          <strong className="kpi-number">{eventCount}</strong>
          <span className="kpi-foot">Published campus calendar</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active Members</span>
          <strong className="kpi-number">{totalMembers}</strong>
          <span className="kpi-foot">Across all clubs &amp; societies</span>
        </div>
        <div className="kpi-card" style={totalPending > 0 ? { borderColor: 'rgba(230, 57, 70, 0.4)' } : {}}>
          <span className="kpi-label">Pending Approvals</span>
          <strong className="kpi-number" style={totalPending > 0 ? { color: 'var(--ws-accent, #e63946)' } : {}}>
            {totalPending}
          </strong>
          <span className="kpi-foot">Awaiting Institutional Sign-Off</span>
        </div>
      </div>

      {/* Institutional Approval Queues Strip */}
      <section className="reveal-card">
        <div className="section-header-modern" style={{ marginBottom: '1rem' }}>
          <div>
            <p className="eyebrow">Institutional Review Queues</p>
            <h2>Pending Action Workflows</h2>
          </div>
        </div>
        <div className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/app/events" className="kpi-card" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Event Proposals</span>
              <Calendar size={18} style={{ color: 'var(--ws-text-muted)' }} />
            </div>
            <strong className="kpi-number" style={pendingEvents.length > 0 ? { color: 'var(--ws-accent)' } : {}}>
              {pendingEvents.length}
            </strong>
            <span className="kpi-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Pending review</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>

          <Link to="/app/equipment" className="kpi-card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Equipment Requests</span>
              <Laptop size={18} style={{ color: 'var(--ws-text-muted)' }} />
            </div>
            <strong className="kpi-number" style={pendingEquipment.length > 0 ? { color: 'var(--ws-accent)' } : {}}>
              {pendingEquipment.length}
            </strong>
            <span className="kpi-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Lab asset requests</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>

          <Link to="/app/funding" className="kpi-card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Funding Grants</span>
              <WalletCards size={18} style={{ color: 'var(--ws-text-muted)' }} />
            </div>
            <strong className="kpi-number" style={pendingFunding.length > 0 ? { color: 'var(--ws-accent)' } : {}}>
              {pendingFunding.length}
            </strong>
            <span className="kpi-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Budget requisitions</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>

          <Link to="/app/event-reports" className="kpi-card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Event Reports</span>
              <FileSpreadsheet size={18} style={{ color: 'var(--ws-text-muted)' }} />
            </div>
            <strong className="kpi-number" style={pendingReports.length > 0 ? { color: 'var(--ws-accent)' } : {}}>
              {pendingReports.length}
            </strong>
            <span className="kpi-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Post-event filings</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>

          <Link to="/app/credential-requests" className="kpi-card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-label">Club Login Changes</span>
              <KeyRound size={18} style={{ color: 'var(--ws-text-muted)' }} />
            </div>
            <strong className="kpi-number" style={pendingCredentials.length > 0 ? { color: 'var(--ws-accent)' } : {}}>
              {pendingCredentials.length}
            </strong>
            <span className="kpi-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Office-bearer requests</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>
        </div>
      </section>

      {/* Priority Approvals Review Desk */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="bento-label">Awaiting Institutional Decision</p>
            <h3>Priority Review Queues</h3>
          </div>
          <span className="editorial-role-chip" style={{ fontSize: '0.78rem' }}>
            {totalPending} Items Total
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {urgentQueue.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.type}-${item.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '0.75rem',
                  background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))',
                  border: '1px solid var(--ws-border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(230, 57, 70, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ws-accent, #e63946)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="eyebrow" style={{ fontSize: '0.68rem', margin: 0, textTransform: 'uppercase' }}>
                        {item.type}
                      </span>
                      {item.club && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--ws-text-muted)' }}>
                          · {item.club}
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--ws-text-bright)' }}>{item.title}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="editorial-role-chip" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    {(item.status || 'pending').replace(/_/g, ' ')}
                  </span>
                  <Link
                    to={item.link}
                    className="action-pill-primary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', textDecoration: 'none' }}
                  >
                    Review <ArrowRight size={12} style={{ display: 'inline', marginLeft: 4 }} />
                  </Link>
                </div>
              </div>
            );
          })}
          {!urgentQueue.length && (
            <div className="empty-grid-notice" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--ws-success, #38a169)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ws-text-muted)' }}>
                All institutional approval queues are up to date. No pending submissions require immediate review.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* System-wide Announcements */}
      {announcements.length > 0 && (
        <section className="bento-card reveal-card">
          <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="bento-label">Campus Communications</p>
              <h3>Institutional Announcements</h3>
            </div>
            <Link to="/app/announcements" className="editorial-arrow-link" style={{ fontSize: '0.85rem' }}>
              <span>View all announcements</span> <ArrowUpRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {announcements.slice(0, 3).map((item) => (
              <div
                key={item._id || item.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))',
                  border: '1px solid var(--ws-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{item.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ws-text-muted)' }}>
                    {item.club_name || item.clubName || 'College Wide'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ws-text-muted)', lineHeight: 1.4 }}>
                  {item.content?.length > 150 ? `${item.content.slice(0, 150)}...` : item.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabular Attendance Report with Search & CSV Export */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Attendance Ledger</p>
            <h2>Recent Student Check-Ins</h2>
          </div>
          <button
            type="button"
            className="secondary-action-button"
            onClick={downloadCsv}
            disabled={!attendance.length}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="table-search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search student name, registration number, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="modern-table-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration No.</th>
                <th>Event Name</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <strong>{rec.name}</strong>
                  </td>
                  <td>
                    <span className="reg-code">{rec.reg}</span>
                  </td>
                  <td>{rec.event}</td>
                  <td>
                    <time>{rec.time}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredAttendance.length && (
            <div className="empty-table-state">
              <p>No check-in records matching your query.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   CLUBS DIRECTORY VIEW
========================================================================= */

function ClubDirectory({ clubs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    ...Array.from(new Set(clubs.map((c) => c.category).filter(Boolean))),
  ];

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' || club.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Campus Communities</p>
        </div>
        <div className="header-title-row">
          <h1>
            Clubs for every <em>kind of curious.</em>
          </h1>
          <p className="header-subtitle">
            Discover student-led clubs shaping technical innovation, arts, and leadership across Amrita.
          </p>
        </div>
      </header>

      {/* Search and Category Filter Toolbar */}
      <div className="directory-toolbar reveal-card">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search clubs by name or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill${selectedCategory === cat ? ' is-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Clubs' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="clubs-grid-modern reveal-card">
        {filteredClubs.map((club, idx) => {
          const clubCategory = getClubCategory(club);
          return (
            <Link
              to={`/app/clubs/${club.id}`}
              className="club-card-modern"
              key={club.id}
            >
              <div className="club-card-top">
                <span className="club-card-num">{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="club-card-name">{club.name}</h3>
              <p className="club-card-desc">{club.description}</p>
              <div className="club-card-footer">
                <div className="club-footer-info">
                  <span className="club-members-count">
                    <Users size={14} />
                    {club.members ?? 40} members
                  </span>
                  <span className="club-hover-type-badge">
                    <Tag size={12} className="type-badge-icon" />
                    <span className="type-badge-text">{clubCategory}</span>
                  </span>
                </div>
                <span className="club-explore-arrow">
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {filteredClubs.length === 0 && (
        <div className="empty-message">
          <p>No clubs matching your search filter.</p>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   CLUB PROFILE VIEW
========================================================================= */

function ClubProfile({ data }) {
  const club = data?.club;
  if (!club) {
    return (
      <div className="empty-message">
        <h3>Club Not Found</h3>
        <p>The requested club may not exist in the active directory.</p>
        <Link to="/app/clubs" className="secondary-action-button">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      <div className="back-nav-container">
        <Link to="/app/clubs" className="back-button-modern">
          <ArrowLeft size={15} />
          <span>Return to Clubs Directory</span>
        </Link>
      </div>

      <header className="club-profile-hero reveal-card">
        <div className="club-hero-glass-cover" />
        <div className="club-hero-content">
          <div className="club-hero-badge-row">
            <span className="club-category-pill">{club.category || 'Technology & Innovation'}</span>
            <span className="club-status-indicator">
              <span className="club-status-dot" />
              {club.recruitmentOpen !== false ? 'Recruiting Active Members' : 'Active Wing'}
            </span>
          </div>

          <h1 className="club-profile-title">{club.name}</h1>
          <p className="club-lead-desc">{club.description || 'Dedicated to advancing student initiatives, collaborative projects, technical workshops, and campus community engagement.'}</p>

          <div className="club-stats-strip">
            <div className="club-stat-box">
              <div className="club-stat-icon">
                <Users size={16} />
              </div>
              <div>
                <span className="club-stat-val">{club.members ?? '48'}</span>
                <span className="club-stat-label">Active Members</span>
              </div>
            </div>

            <div className="club-stat-box">
              <div className="club-stat-icon">
                <Ticket size={16} />
              </div>
              <div>
                <span className="club-stat-val">{data.upcomingEvents?.length || club.events || '3'}</span>
                <span className="club-stat-label">Scheduled Events</span>
              </div>
            </div>

            <div className="club-stat-box">
              <div className="club-stat-icon">
                <GraduationCap size={16} />
              </div>
              <div>
                <span className="club-stat-val">{club.facultyCoordinator || club.mentor?.name || 'Faculty In-Charge'}</span>
                <span className="club-stat-label">Staff Mentor</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Upcoming Club Events */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Program Schedule</p>
            <h2>Upcoming Club Events</h2>
          </div>
          {data.upcomingEvents?.length > 0 && (
            <Link className="editorial-arrow-link" to="/app/events">
              <span>View full calendar</span>
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>

        <div className="events-bento-grid">
          {(data.upcomingEvents || []).map((evt) => (
            <article className="event-tile-card" key={evt.id || evt._id}>
              <div className="event-tile-header">
                <span className="event-tile-club">{club.name}</span>
                <span className="event-tile-date">
                  {eventDay(evt.date)} {eventMonth(evt.date)}
                </span>
              </div>
              <h3 className="event-tile-title">{evt.title}</h3>
              <div className="event-tile-venue">
                <MapPin size={13} />
                <span>{evt.venue || 'Campus Venue'}</span>
              </div>
            </article>
          ))}
          {!data.upcomingEvents?.length && (
            <div className="empty-grid-notice">
              <p>No upcoming events currently scheduled by {club.name}. Check back as proposals are approved.</p>
            </div>
          )}
        </div>
      </section>

      {/* Club Members Roster */}
      <section className="workspace-section reveal-card">
        <div className="section-header-modern">
          <div>
            <p className="eyebrow">Core Committee</p>
            <h2>Club Leadership &amp; Office Bearers</h2>
          </div>
        </div>

        <div className="roster-grid">
          {(data.members || []).map((mem, index) => (
            <div className="roster-member-card" key={`${mem.name}-${index}`}>
              <div className="roster-avatar">
                {mem.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="roster-meta">
                <strong className="roster-name">{mem.name}</strong>
                <span className="roster-role-badge">{mem.role || 'Member'}</span>
              </div>
            </div>
          ))}
          {!data.members?.length && (
            <div className="empty-grid-notice">
              <p>Club member roster is verified and synchronized upon officer sign-in.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   EVENTS DIRECTORY VIEW
========================================================================= */

function EventDirectory({ events, role, profile, registeredEventIds, onRegister, onPropose }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingEvent, setViewingEvent] = useState(null);
  const dateInputId = useId();

  const mayApply = ['STUDENT', 'CLUB_EXECUTIVE', 'CLUB_PRESIDENT', 'CLUB_COMMITTEE'].includes(
    role
  );
  const canPropose = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE'].includes(role);

  const visibleEvents = events.filter((evt) => {
    const matchesDate = !selectedDate || String(evt.date).slice(0, 10) === selectedDate;
    const matchesSearch =
      !searchQuery ||
      evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.club?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  return (
    <div className="workspace-stack">
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Calendar & Schedule</p>
        </div>
        <div className="header-title-row">
          <h1>
            Find your next <em>campus story.</em>
          </h1>
          <p className="header-subtitle">
            Explore workshops, hackathons, guest lectures, and cultural gatherings across Amrita.
          </p>
        </div>
        {canPropose && onPropose && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={onPropose}
            >
              <Plus size={16} /> Propose Event
            </button>
          </div>
        )}
      </header>

      {/* Filter and Date Bar */}
      <div className="directory-toolbar reveal-card">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search events by title or hosting club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="date-filter-group">
          <label htmlFor={dateInputId}>Date</label>
          <input
            id={dateInputId}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button
              type="button"
              className="clear-date-btn"
              onClick={() => setSelectedDate('')}
            >
              Clear
            </button>
          )}
          <span className="results-badge">{visibleEvents.length} events</span>
        </div>
      </div>

      <div className="events-three-col-grid">
        {visibleEvents.map((event) => {
          const evtDate = dateParts(event.date);
          const capacity = Number(event.capacity || 100);
          const registered = Number(event.registeredCount || 0);
          const percent = Math.min(100, Math.round((registered / capacity) * 100));
          const isRegistered =
            registeredEventIds.includes(event.id) ||
            hasPreviewApplication(event.id, profile?.rollNumber);
          const isOwnClub = event.club === profile?.clubName;

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

                  {mayApply && (
                    isOwnClub ? (
                      <span className="own-club-badge" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        Your Club
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="event-card-register-btn"
                        disabled={!event.open || isRegistered}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRegistered && event.open) {
                            onRegister(event);
                          }
                        }}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} /> Applied
                          </>
                        ) : event.open ? (
                          'Register ↗'
                        ) : (
                          'Full'
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {visibleEvents.length === 0 && (
          <div className="empty-message" style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center' }}>
            <p>No events found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {viewingEvent && (
        <EventDetailModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onRegister={(evt) => {
            setViewingEvent(null);
            onRegister(evt);
          }}
          isRegistered={
            registeredEventIds.includes(viewingEvent.id) ||
            hasPreviewApplication(viewingEvent.id, profile?.rollNumber)
          }
          actionLabel="Register for this pass now"
        />
      )}
    </div>
  );
}

/* =========================================================================
   UTILITIES
========================================================================= */

function WorkspaceLoading() {
  return (
    <div className="workspace-loading-state" role="status" aria-label="Loading workspace">
      <div className="loading-spinner" />
      <p>Opening Amrita Sangam...</p>
    </div>
  );
}

function WorkspaceError({ error }) {
  return (
    <div className="workspace-error-state" role="alert">
      <p className="eyebrow">Connection Notice</p>
      <h2>Unable to sync with campus service</h2>
      <p>{error}</p>
      <button
        type="button"
        className="primary-action-button"
        onClick={() => window.location.reload()}
      >
        Retry connection
      </button>
    </div>
  );
}

function eventDay(value) {
  if (!value) return '—';
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
  if (!value) return 'SOON';
  if (/today/i.test(String(value))) return 'NOW';
  if (/tomorrow/i.test(String(value))) return 'SOON';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase();
  }
  const match = String(value).match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i
  );
  return match?.[1]?.toUpperCase() || 'SOON';
}

function formatEventDate(value) {
  if (!value) return 'Date TBD';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

function dateParts(value) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(parsed),
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsed).toUpperCase(),
    };
  }
  return { day: eventDay(value), month: eventMonth(value) };
}
