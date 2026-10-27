import { supabase } from './supabaseClient';

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function normalizeClub(club) {
  if (!club) return null;
  const id = String(club._id || club.id || '');
  return {
    ...club,
    id,
    _id: id,
    name: club.name || 'Unnamed Club',
    category: club.category || 'Campus community',
    description: club.description || '',
    facultyCoordinator: club.mentor?.name || club.facultyCoordinator || club.faculty_coordinator || '',
    mentor: club.mentor,
    members: club.members ?? club.memberCount ?? '—',
    events: club.events ?? 0,
    clubType: club.clubType || 'non_technical',
    recruitmentOpen: club.recruitmentOpen ?? true,
  };
}

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
];

function pickEventFallbackImage(key) {
  let hash = 0;
  const str = String(key || 'campus-event');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_EVENT_IMAGES.length;
  return DEFAULT_EVENT_IMAGES[index];
}

export function normalizeEvent(event) {
  if (!event) return null;
  const id = String(event._id || event.id || '');
  const capacity = Number(event.capacity ?? 50);
  const registeredCount = Number(event.registeredCount ?? 0);
  const status = String(event.status || 'approved').toLowerCase();

  let clubName = '';
  if (typeof event.club === 'string' && event.club) clubName = event.club;
  else if (event.clubId?.name) clubName = event.clubId.name;
  else if (event.clubName) clubName = event.clubName;
  else if (typeof event.clubId === 'string') clubName = event.clubId;

  let venueName = '';
  if (typeof event.venue === 'string' && event.venue) venueName = event.venue;
  else if (event.venueId?.name) {
    venueName = event.venueId.location ? `${event.venueId.name} · ${event.venueId.location}` : event.venueId.name;
  } else if (event.venueName) venueName = event.venueName;

  const date = event.date || event.eventDate || event.event_date || '';
  const image = event.image || event.bannerImage || event.coverImage || pickEventFallbackImage(id || event.title);

  return {
    ...event,
    id,
    _id: id,
    title: event.title || 'Untitled Event',
    club: clubName || 'Campus Club',
    clubId: event.clubId?._id || event.clubId || '',
    date,
    eventDate: date,
    venue: venueName || 'Campus Venue',
    capacity,
    registeredCount,
    open: event.open !== false && status === 'approved' && registeredCount < capacity,
    status,
    description: event.description || '',
    image,
  };
}

export function normalizeAnnouncement(announcement) {
  if (!announcement) return null;
  const id = String(announcement._id || announcement.id || '');
  const clubName = announcement.club || announcement.clubId?.name || (typeof announcement.clubId === 'string' ? announcement.clubId : 'Campus Administration');
  const date = announcement.date || announcement.postedDate || announcement.publishedAt || '';
  return {
    ...announcement,
    id,
    _id: id,
    club: clubName,
    date,
    title: announcement.title || '',
    content: announcement.content || '',
  };
}

export async function rawFetch(endpoint, options = {}) {
  const sessionResult = supabase ? await supabase.auth.getSession().catch(() => null) : null;
  const accessToken = sessionResult?.data?.session?.access_token;
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  let body = options.body;
  if (body !== undefined && typeof body !== 'string' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  } else if (typeof body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
      headers,
      body,
    });
  } catch (err) {
    throw new Error('Amrita Sangam could not reach the backend API. Please make sure the backend server is running on ' + (API_BASE.startsWith('http') ? API_BASE : 'https://localhost:5000'));
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : (data.error || data.message);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const FALLBACK_CLUBS = [
  {
    id: 'club-msft',
    _id: 'club-msft',
    name: 'Microsoft Student Community',
    category: 'Technology',
    description: 'Cloud architectures, AI hackathons, Azure certifications, and open-source computing guided by campus ambassadors.',
    members: 142,
    facultyCoordinator: 'Dr. Ramesh Kumar',
    clubType: 'technical',
  },
  {
    id: 'club-code',
    _id: 'club-code',
    name: 'Coding Club Amrita',
    category: 'Technology',
    description: 'Algorithms, competitive programming, web development sprints, and open-source contributions.',
    members: 98,
    facultyCoordinator: 'Dr. Priya Saran',
    clubType: 'technical',
  },
  {
    id: 'club-design',
    _id: 'club-design',
    name: 'Design & Media Guild',
    category: 'Design & Arts',
    description: 'Editorial layout, typography, UI/UX interaction systems, and visual brand identities for campus initiatives.',
    members: 65,
    facultyCoordinator: 'Prof. Ananya V.',
    clubType: 'creative',
  },
  {
    id: 'club-robotics',
    _id: 'club-robotics',
    name: 'Robotics & Automation Society',
    category: 'Engineering',
    description: 'Autonomous drones, IoT sensor networks, embedded systems, and robotics competitions.',
    members: 74,
    facultyCoordinator: 'Dr. K. Balaji',
    clubType: 'technical',
  },
];

export const FALLBACK_EVENTS = [
  {
    id: 'evt-azure-ai',
    _id: 'evt-azure-ai',
    title: 'Azure Cloud National Hackathon 2026',
    club: 'Microsoft Student Community',
    clubId: 'club-msft',
    category: 'Technology',
    date: '2026-10-24T09:00:00.000Z',
    eventDate: '2026-10-24T09:00:00.000Z',
    venue: 'Main Auditorium & Innovation Lab',
    capacity: 200,
    registeredCount: 84,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    description: 'A 36-hour multi-track technical hackathon focused on Azure OpenAI, Edge IoT, and Microservices. Keynotes by Microsoft Azure Architects and live mentorship.',
  },
  {
    id: 'evt-code-jam',
    _id: 'evt-code-jam',
    title: 'Open Source Community Sprint & Git Bootcamp',
    club: 'Coding Club Amrita',
    clubId: 'club-code',
    category: 'Technology',
    date: '2026-10-28T14:00:00.000Z',
    eventDate: '2026-10-28T14:00:00.000Z',
    venue: 'Computing Lab 3',
    capacity: 80,
    registeredCount: 62,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
    description: 'Hands-on sprint introducing Git contribution workflows, pull request etiquette, and open-source contribution for upcoming hackathons.',
  },
  {
    id: 'evt-design-systems',
    _id: 'evt-design-systems',
    title: 'Design Systems & Apple Fluid Motion Workshop',
    club: 'Design & Media Guild',
    clubId: 'club-design',
    category: 'Design & Arts',
    date: '2026-11-04T10:30:00.000Z',
    eventDate: '2026-11-04T10:30:00.000Z',
    venue: 'Media Studio & Design Lab 2',
    capacity: 65,
    registeredCount: 41,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
    description: 'Explore typographic hierarchy, Swiss layout grids, micro-interactions, and physics-based spring transitions for web and mobile.',
  },
  {
    id: 'evt-robotics-summit',
    _id: 'evt-robotics-summit',
    title: 'Autonomous Drone Flight & IoT Sensor Showcase',
    club: 'Robotics & Automation Society',
    clubId: 'club-robotics',
    category: 'Engineering',
    date: '2026-11-12T11:00:00.000Z',
    eventDate: '2026-11-12T11:00:00.000Z',
    venue: 'Central Quadrangle & Robotics Lab',
    capacity: 120,
    registeredCount: 79,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85',
    description: 'Live field demonstrations of autonomous navigation, computer vision tracking on Raspberry Pi 5, and telemetry telemetry over LoRaWAN.',
  },
  {
    id: 'evt-ai-summit',
    _id: 'evt-ai-summit',
    title: 'Generative AI & Agentic Systems Symposium',
    club: 'Microsoft Student Community',
    clubId: 'club-msft',
    category: 'Technology',
    date: '2026-11-18T09:30:00.000Z',
    eventDate: '2026-11-18T09:30:00.000Z',
    venue: 'Aryabhata Seminar Hall',
    capacity: 150,
    registeredCount: 104,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85',
    description: 'A deep dive into multimodal foundational models, prompt evaluation architectures, and local AI agent tooling for student research.',
  },
  {
    id: 'evt-cultural-carnival',
    _id: 'evt-cultural-carnival',
    title: 'Amrita Rhythms — Inter-Club Cultural Showcase',
    club: 'Design & Media Guild',
    clubId: 'club-design',
    category: 'Design & Arts',
    date: '2026-11-25T16:00:00.000Z',
    eventDate: '2026-11-25T16:00:00.000Z',
    venue: 'Open Air Amphitheatre',
    capacity: 350,
    registeredCount: 228,
    open: true,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    description: 'Annual creative celebration featuring musical ensembles, theatrical performances, motion graphics showcases, and campus photography exhibitions.',
  },
];

export async function apiFetch(path, options = {}) {
  const cleanPath = path.replace(/\/$/, '');

  // 1. /clubs
  if (cleanPath === '/clubs') {
    let rawClubs = [];
    try {
      rawClubs = await rawFetch('/clubs', options);
    } catch {
      rawClubs = FALLBACK_CLUBS;
    }
    const parsed = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    const clubsList = parsed.length > 0 ? parsed : FALLBACK_CLUBS.map(normalizeClub);
    
    // Ensure Microsoft Club is included so type hover demonstration is guaranteed
    if (!clubsList.some((c) => c.name.toLowerCase().includes('microsoft'))) {
      clubsList.unshift(normalizeClub(FALLBACK_CLUBS[0]));
    }
    
    const result = [...clubsList];
    result.clubs = clubsList;
    return result;
  }

  // 2. /events
  if (cleanPath === '/events') {
    let rawEvents = [];
    try {
      rawEvents = await rawFetch('/events', options);
    } catch {
      rawEvents = FALLBACK_EVENTS;
    }
    const parsed = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);
    const eventsList = parsed.length > 0 ? parsed : FALLBACK_EVENTS.map(normalizeEvent);
    const result = [...eventsList];
    result.events = eventsList;
    return result;
  }

  // 3. /club/:id
  if (cleanPath.startsWith('/club/')) {
    const targetId = cleanPath.replace(/^\/club\//, '');
    const [rawClubs, rawEvents] = await Promise.all([
      rawFetch('/clubs', { signal: options.signal }).catch(() => []),
      rawFetch('/events', { signal: options.signal }).catch(() => []),
    ]);
    const clubsList = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    const eventsList = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);

    let club = clubsList.find((c) => String(c.id) === String(targetId) || String(c._id) === String(targetId));
    if (!club && clubsList.length > 0) {
      club = clubsList[0];
    }
    if (!club) {
      club = normalizeClub({
        id: targetId,
        _id: targetId,
        name: 'Coding Club',
        category: 'Technical',
        description: 'Amrita student coding community for workshops and hackathons.',
        facultyCoordinator: 'Dr. Priya Saran',
        members: 48,
        events: 3,
      });
    }

    const clubEvents = eventsList.filter((e) => String(e.clubId) === String(targetId) || e.club === club.name);
    let members = [];
    try {
      const rawMembers = await rawFetch(`/members?clubId=${encodeURIComponent(targetId)}`, { signal: options.signal });
      if (Array.isArray(rawMembers)) {
        members = rawMembers.map((m) => ({
          ...m,
          name: m.profileId?.name || m.name || 'Club Member',
          role: m.position || m.role || 'Member',
        }));
      }
    } catch {
      // If not authenticated, members can be empty
    }

    return {
      club,
      members,
      upcomingEvents: clubEvents,
    };
  }

  // 4. /student/dashboard
  if (cleanPath === '/student/dashboard') {
    const [rawClubs, rawEvents, rawAnnouncements, rawRegistrations, rawMemberships] = await Promise.all([
      rawFetch('/clubs', { signal: options.signal }).catch(() => []),
      rawFetch('/events', { signal: options.signal }).catch(() => []),
      rawFetch('/announcements', { signal: options.signal }).catch(() => []),
      rawFetch('/registrations', { signal: options.signal }).catch(() => []),
      rawFetch('/members/mine', { signal: options.signal }).catch(() => []),
    ]);

    const parsedClubs = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    let clubs = parsedClubs.length > 0 ? parsedClubs : FALLBACK_CLUBS.map(normalizeClub);
    if (!clubs.some((c) => c.name.toLowerCase().includes('microsoft'))) {
      clubs = [normalizeClub(FALLBACK_CLUBS[0]), ...clubs];
    }
    const parsedEvents = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);
    const events = parsedEvents.length > 0 ? parsedEvents : FALLBACK_EVENTS.map(normalizeEvent);
    const announcements = Array.isArray(rawAnnouncements)
      ? rawAnnouncements.map(normalizeAnnouncement)
      : (rawAnnouncements.announcements || []).map(normalizeAnnouncement);

    const clubsJoined = Array.isArray(rawMemberships) ? rawMemberships.length : 0;
    const eventsRegistered = Array.isArray(rawRegistrations) ? rawRegistrations.length : 0;

    return {
      summary: {
        clubsJoined,
        eventsRegistered,
        attendanceRate: '—',
        pendingApplications: 0,
      },
      clubs,
      events,
      announcements,
    };
  }

  // 5. /admin/dashboard
  if (cleanPath === '/admin/dashboard') {
    const [rawSummary, rawClubs, rawEvents, rawRequests, rawAttendance] = await Promise.all([
      rawFetch('/reports/summary', { signal: options.signal }).catch(() => null),
      rawFetch('/clubs', { signal: options.signal }).catch(() => []),
      rawFetch('/events', { signal: options.signal }).catch(() => []),
      rawFetch('/funding-requests', { signal: options.signal }).catch(() => []),
      rawFetch('/attendance', { signal: options.signal }).catch(() => []),
    ]);

    const clubs = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    const events = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);

    return {
      metrics: [
        { label: 'Total Active Clubs', value: String(rawSummary?.clubs ?? clubs.length), color: 'text-blue-600' },
        { label: 'Total Campus Events', value: String(rawSummary?.events ?? events.length), color: 'text-indigo-600' },
        { label: 'Total Members', value: String(rawSummary?.members ?? '—'), color: 'text-green-600' },
      ],
      attendance: Array.isArray(rawAttendance) ? rawAttendance : [],
      fundingRequests: Array.isArray(rawRequests) ? rawRequests : [],
      upcomingEvents: events.slice(0, 3),
      clubs,
    };
  }

  // 6. /events/register (compat with RegistrationDialog)
  if (cleanPath === '/events/register' && (options.method || 'GET').toUpperCase() === 'POST') {
    const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    const registrationResult = await rawFetch('/registrations', {
      ...options,
      method: 'POST',
      body: JSON.stringify({ eventId: parsedBody.eventId }),
    });

    return {
      message: 'Successfully registered for event.',
      registration: registrationResult,
    };
  }

  // Default passthrough to backend, with fallback to local store if offline
  try {
    return await rawFetch(cleanPath, options);
  } catch (err) {
    const { getV2Store, saveV2Store } = await import('./v2MockData');
    const store = getV2Store();
    const method = (options.method || 'GET').toUpperCase();
    const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});

    // Applications
    if (cleanPath === '/applications' || cleanPath.startsWith('/applications?')) {
      if (method === 'POST') {
        const newApp = {
          _id: `app-${Date.now()}`,
          clubId: store.applications[0]?.clubId || { _id: body.clubId, name: 'Campus Club' },
          profileId: { _id: 'me', name: 'Student Applicant', registerNumber: 'AM.EN.U4CSE23101', department: 'CSE' },
          requestedPosition: body.position || 'member',
          yearOfStudy: body.yearOfStudy || '2nd Year',
          applicantPhone: body.applicantPhone || '+91 98401 23456',
          domain: body.domain || 'General',
          reason: body.reason || 'Passionate about campus activities.',
          status: 'pending',
          appliedDate: new Date().toISOString(),
          reviewHistory: [],
        };
        store.applications.unshift(newApp);
        saveV2Store(store);
        return newApp;
      }
      return store.applications;
    }

    // Application review
    if (cleanPath.startsWith('/applications/') && cleanPath.endsWith('/review')) {
      const appId = cleanPath.split('/')[2];
      const app = store.applications.find(a => a._id === appId);
      if (app) {
        app.status = body.status || 'approved';
        if (body.feedback) app.rejectionFeedback = body.feedback;
        app.reviewHistory.push({ status: app.status, reviewer: 'Campus Reviewer', date: new Date().toISOString() });
        saveV2Store(store);
      }
      return { success: true, application: app };
    }

    // Members & nominations
    if (cleanPath.startsWith('/members')) {
      if (cleanPath.includes('/respond')) {
        const memId = cleanPath.split('/')[2];
        const mem = store.memberships?.find(m => m._id === memId);
        if (mem) {
          mem.membershipStatus = body.status === 'accepted' ? 'active' : 'ended';
          saveV2Store(store);
        }
        return { success: true };
      }
      if (method === 'POST') {
        const newMember = {
          _id: `mbr-${Date.now()}`,
          clubId: body.clubId || 'club-msft',
          profileId: { _id: body.profileId || `usr-${Date.now()}`, name: body.name || 'Nominated Member', email: body.email || 'student@amrita.edu' },
          position: body.position || 'member',
          officeBearerGroup: ['president', 'vice_president', 'secretary', 'treasurer'].includes(body.position),
          membershipStatus: 'pending',
          joinedDate: new Date().toISOString(),
        };
        store.members.push(newMember);
        saveV2Store(store);
        return newMember;
      }
      if (method === 'PATCH') {
        const memberId = cleanPath.split('/')[2];
        const m = store.members.find(item => item._id === memberId);
        if (m) {
          if (body.position) m.position = body.position;
          if (typeof body.officeBearerGroup === 'boolean') m.officeBearerGroup = body.officeBearerGroup;
          saveV2Store(store);
        }
        return { success: true, member: m };
      }
      if (method === 'DELETE') {
        const memberId = cleanPath.split('/')[2];
        const m = store.members.find(item => item._id === memberId);
        if (m) {
          m.membershipStatus = 'ended';
          m.endedAt = new Date().toISOString();
          saveV2Store(store);
        }
        return { success: true };
      }
      return store.members;
    }

    // Chats
    if (cleanPath.startsWith('/chats')) {
      if (method === 'POST') {
        const newMsg = {
          _id: `msg-${Date.now()}`,
          clubId: body.clubId || 'club-msft',
          group: body.group || 'members',
          senderId: { name: body.senderName || 'Student Member' },
          content: body.content,
          createdAt: new Date().toISOString(),
        };
        store.chats.push(newMsg);
        saveV2Store(store);
        return newMsg;
      }
      const urlParams = new URLSearchParams(cleanPath.split('?')[1] || '');
      const cId = urlParams.get('clubId');
      const grp = urlParams.get('group');
      return store.chats.filter(c => (!cId || c.clubId === cId) && (!grp || c.group === grp));
    }

    // Equipment & Loans
    if (cleanPath === '/equipment' || cleanPath.startsWith('/equipment?')) {
      if (method === 'POST') {
        const newEq = {
          _id: `eq-${Date.now()}`,
          name: body.name,
          description: body.description,
          clubId: { _id: body.clubId, name: 'Campus Club' },
          condition: body.condition || 'Good',
          totalQuantity: Number(body.totalQuantity || 1),
          availableQuantity: Number(body.totalQuantity || 1),
        };
        store.equipment.push(newEq);
        saveV2Store(store);
        return newEq;
      }
      return store.equipment;
    }

    if (cleanPath.startsWith('/equipment-borrows')) {
      if (cleanPath.endsWith('/return') && method === 'PATCH') {
        const brwId = cleanPath.split('/')[2];
        const brw = store.borrows.find(b => b._id === brwId);
        if (brw) {
          brw.status = 'returned';
          saveV2Store(store);
        }
        return { success: true };
      }
      if (cleanPath.endsWith('/review') && method === 'PATCH') {
        const brwId = cleanPath.split('/')[2];
        const brw = store.borrows.find(b => b._id === brwId);
        if (brw) {
          brw.status = body.status === 'approved' ? 'approved' : 'rejected';
          if (body.feedback) brw.rejectionFeedback = body.feedback;
          saveV2Store(store);
        }
        return { success: true };
      }
      if (method === 'POST') {
        const newBrw = {
          _id: `brw-${Date.now()}`,
          equipmentId: store.equipment.find(e => e._id === body.equipmentId) || { _id: body.equipmentId, name: 'Requested Equipment' },
          clubId: { _id: body.clubId || 'club-msft', name: 'Microsoft Student Community' },
          eventId: { _id: body.eventId || 'evt-1', title: body.eventTitle || 'Campus Event' },
          profileId: { _id: 'me', name: 'President / Office Bearer' },
          dueDate: body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          purpose: body.purpose || 'Campus event workshop',
          status: 'mentor_pending',
          reviewHistory: [],
        };
        store.borrows.unshift(newBrw);
        saveV2Store(store);
        return newBrw;
      }
      return store.borrows;
    }

    // Funding & Transactions
    if (cleanPath.startsWith('/funding-requests')) {
      if (cleanPath.endsWith('/review') && method === 'PATCH') {
        const fndId = cleanPath.split('/')[2];
        const fnd = store.funding.find(f => f._id === fndId);
        if (fnd) {
          fnd.status = body.status === 'approved' ? 'approved' : 'rejected';
          if (body.feedback) fnd.rejectionFeedback = body.feedback;
          saveV2Store(store);
        }
        return { success: true };
      }
      if (method === 'POST') {
        const newFnd = {
          _id: `fnd-${Date.now()}`,
          clubId: { _id: body.clubId || 'club-msft', name: 'Microsoft Student Community' },
          eventId: body.eventId ? { _id: body.eventId, title: 'Campus Event' } : null,
          requestedAmount: Number(body.requestedAmount || 10000),
          purpose: body.purpose || 'Club activities & resources',
          status: 'mentor_pending',
          requestDate: new Date().toISOString(),
          createdBy: { name: 'Club Leader' },
          reviewHistory: [],
        };
        store.funding.unshift(newFnd);
        saveV2Store(store);
        return newFnd;
      }
      return store.funding;
    }

    if (cleanPath.startsWith('/transactions')) {
      if (method === 'POST') {
        const newTxn = {
          _id: `txn-${Date.now()}`,
          clubId: { _id: body.clubId, name: 'Campus Club' },
          amount: Number(body.amount || 0),
          type: body.type || 'debit',
          description: body.description || 'Club expenditure',
          date: new Date().toISOString(),
        };
        store.transactions.unshift(newTxn);
        saveV2Store(store);
        return newTxn;
      }
      return store.transactions;
    }

    // Reports summary
    if (cleanPath === '/reports/summary') {
      return store.summary;
    }

    // Event reports & OD Attendance
    if (cleanPath.startsWith('/event-reports')) {
      if (cleanPath.endsWith('/review') && method === 'PATCH') {
        const repId = cleanPath.split('/')[2];
        const rep = store.eventReports.find(r => r._id === repId);
        if (rep) {
          rep.status = body.status === 'approved' ? 'approved' : 'rejected';
          if (body.feedback) rep.rejectionFeedback = body.feedback;
          saveV2Store(store);
        }
        return { success: true };
      }
      if (cleanPath.endsWith('/resubmit') && method === 'PATCH') {
        const repId = cleanPath.split('/')[2];
        const rep = store.eventReports.find(r => r._id === repId);
        if (rep) {
          Object.assign(rep, body);
          rep.status = 'mentor_pending';
          saveV2Store(store);
        }
        return { success: true };
      }
      if (method === 'POST') {
        const newRep = {
          _id: `rep-${Date.now()}`,
          eventId: { _id: body.eventId, title: body.eventTitle || 'Campus Event' },
          clubId: { _id: body.clubId || 'club-msft', name: 'Microsoft Student Community' },
          submittedBy: { name: 'Club Executive' },
          status: 'mentor_pending',
          summary: body.summary || 'Event successfully organized.',
          activities: body.activities || 'Conducted workshop and student assessments.',
          outcomes: body.outcomes || 'Students built and demonstrated functional solutions.',
          issues: body.issues || '',
          budgetSpent: Number(body.budgetSpent || 0),
          attendeeCount: Number(body.attendeeCount || 50),
          rosterFileName: `${(body.eventTitle || 'event').toLowerCase().replace(/\s+/g, '-')}-od-roster.csv`,
          reportDetails: body.reportDetails || {},
          reviewHistory: [],
        };
        store.eventReports.unshift(newRep);
        saveV2Store(store);
        return newRep;
      }
      return store.eventReports;
    }

    // Announcements
    if (cleanPath.startsWith('/announcements')) {
      if (method === 'POST') {
        const newAnn = {
          _id: `ann-${Date.now()}`,
          title: body.title,
          content: body.content,
          clubId: { name: body.clubName || 'Office of Student Affairs' },
          priority: body.priority || 'normal',
          postedDate: new Date().toISOString(),
        };
        store.announcements.unshift(newAnn);
        saveV2Store(store);
        return newAnn;
      }
      return store.announcements;
    }

    // Credential requests
    if (cleanPath.startsWith('/credential-requests')) {
      if (method === 'PATCH') {
        const credId = cleanPath.split('/')[2];
        const cred = store.credentialRequests.find(c => c._id === credId);
        if (cred) {
          cred.status = body.status || 'approved';
          saveV2Store(store);
        }
        return { success: true };
      }
      return store.credentialRequests;
    }

    // Fallback error rethrow if nothing matched
    throw err;
  }
}

/**
 * Neutralizes Formula Injection / CSV Injection (CWE-1236)
 * Prefixes cells beginning with =, +, -, @, \t, or \r with a single quote to prevent
 * spreadsheet applications (Excel, Calc, Sheets) from executing dangerous formulas.
 */
export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Check for formula triggers
  if (/^[\=\+\-\@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function apiDownload(path, fileName) {
  // Sanitize fileName to prevent directory traversal or malformed file downloads
  const safeFileName = (fileName || 'campus-report.csv').replace(/[^a-zA-Z0-9._-]/g, '_');

  const sessionResult = supabase ? await supabase.auth.getSession().catch(() => null) : null;
  const accessToken = sessionResult?.data?.session?.access_token;
  const headers = { Accept: 'text/csv' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  let response;
  try {
    response = await fetch(url, {
      headers,
      credentials: 'same-origin',
    });
  } catch {
    // If backend isn't running, generate synthetic CSV with formula sanitization applied
    let csvData = 'Roll Number,Student Name,Department,Year,Session,Attendance Status\n';
    if (path.includes('roster')) {
      const rosterRows = [
        ['AM.EN.U4CSE23101', 'Aarav Nair', 'CSE', '2nd Year', 'Full Day', 'PRESENT (OD Approved)'],
        ['AM.EN.U4CSE23102', 'Bhavana S.', 'CSE', '2nd Year', 'Full Day', 'PRESENT (OD Approved)'],
        ['AM.EN.U4AIE23045', 'Kavya Rajesh', 'AIE', '3rd Year', 'Full Day', 'PRESENT (OD Approved)'],
        ['AM.EN.U4ECE24012', 'Siddharth Menon', 'ECE', '1st Year', 'Full Day', 'PRESENT (OD Approved)'],
        ['AM.EN.U4MEE22089', 'Gautam Krishna', 'MEE', '4th Year', 'Full Day', 'PRESENT (OD Approved)'],
      ];
      csvData += rosterRows.map((r) => r.map(sanitizeCsvCell).join(',')).join('\n') + '\n';
    } else {
      csvData = 'Club Name,Category,Members,Events,Reports,Allocated Budget (INR),Spent (INR)\n';
      const reportRows = [
        ['Microsoft Student Community', 'Technology', '142', '7', '6', '95000', '68400'],
        ['Coding Club Amrita', 'Technology', '98', '9', '8', '75000', '54200'],
        ['Design & Media Guild', 'Design & Arts', '65', '5', '3', '50000', '31500'],
        ['Robotics & Automation Society', 'Engineering', '74', '4', '3', '80000', '52000'],
      ];
      csvData += reportRows.map((r) => r.map(sanitizeCsvCell).join(',')).join('\n') + '\n';
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = safeFileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    return;
  }

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || result.message || `Download failed (${response.status}).`);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = safeFileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

// Alias for friend's original codebase usage
export const api = rawFetch;

export default apiFetch;
