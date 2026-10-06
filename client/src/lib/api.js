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
      headers,
      body,
    });
  } catch (err) {
    throw new Error('CampusSphere could not reach the backend API. Please make sure your friend’s Express server is running on ' + (API_BASE.startsWith('http') ? API_BASE : 'https://localhost:5000'));
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

export async function apiFetch(path, options = {}) {
  const cleanPath = path.replace(/\/$/, '');

  // 1. /clubs
  if (cleanPath === '/clubs') {
    const rawClubs = await rawFetch('/clubs', options);
    const clubsList = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    const result = [...clubsList];
    result.clubs = clubsList;
    return result;
  }

  // 2. /events
  if (cleanPath === '/events') {
    const rawEvents = await rawFetch('/events', options);
    const eventsList = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);
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

    const club = clubsList.find((c) => String(c.id) === String(targetId) || String(c._id) === String(targetId));
    if (!club) {
      throw new Error('Club not found.');
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

    const clubs = Array.isArray(rawClubs) ? rawClubs.map(normalizeClub) : (rawClubs.clubs || []).map(normalizeClub);
    const events = Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent) : (rawEvents.events || []).map(normalizeEvent);
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

  // Default passthrough to backend
  return rawFetch(cleanPath, options);
}

// Alias for friend's original codebase usage
export const api = rawFetch;

export default apiFetch;
