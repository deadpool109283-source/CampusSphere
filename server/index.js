import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(cors());
app.use(express.json());

const clubs = [
  {
    id: 1,
    name: 'Coding Club',
    category: 'Technology',
    description: 'Peer-led club focused on coding, open-source projects and hackathons.',
    facultyCoordinator: 'Dr. Priya Saran',
    members: 42,
    events: 5,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Robotics Club',
    category: 'Innovation',
    description: 'Build robots and compete in maker challenges across campus.',
    facultyCoordinator: 'Prof. Arjun S.',
    members: 31,
    events: 4,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Debate Society',
    category: 'Communication',
    description: 'Develop speaking, research and public leadership skills through structured debates.',
    facultyCoordinator: 'Dr. Meera Roy',
    members: 28,
    events: 3,
    status: 'Active',
  },
];

const events = [
  {
    id: 1,
    club: 'Coding Club',
    title: 'Intro to React',
    venue: 'Lab 3',
    date: '2026-10-12T14:00:00+05:30',
    capacity: 50,
    registeredCount: 45,
    open: true,
    description: 'Build interactive UIs with React and reusable component patterns.',
  },
  {
    id: 2,
    club: 'Robotics Club',
    title: 'Drone Racing Basics',
    venue: 'Main Ground',
    date: '2026-10-15T16:30:00+05:30',
    capacity: 20,
    registeredCount: 12,
    open: true,
    description: 'Learn principles of autonomous flight and safe drone controls.',
  },
  {
    id: 3,
    club: 'AI Society',
    title: 'Guest Lecture: AI',
    venue: 'Auditorium',
    date: '2026-10-20T17:00:00+05:30',
    capacity: 200,
    registeredCount: 200,
    open: false,
    description: 'A focused guest talk on responsible AI and research opportunities.',
  },
  {
    id: 4,
    club: 'Debate Society',
    title: 'Inter-Department Debate',
    venue: 'Seminar Hall',
    date: '2026-10-03T11:00:00+05:30',
    capacity: 60,
    registeredCount: 31,
    open: true,
    description: 'Topic-based parliamentary debate between departments.',
  },
];

const announcements = [
  {
    id: 1,
    title: 'Hackathon Team Formation',
    content: 'Students can submit their project idea and team preferences before Friday.',
    club: 'Coding Club',
    date: '2026-10-02',
  },
  {
    id: 2,
    title: 'Robotics Workshop Registration',
    content: 'Seats are filling quickly for the drone workshop. Register before noon.',
    club: 'Robotics Club',
    date: '2026-10-02',
  },
  {
    id: 3,
    title: 'Campus System Update',
    content: 'The approval workflow for club budgets and events has been upgraded.',
    club: 'Administration',
    date: '2026-10-01',
  },
];

const attendance = [
  { id: 1, name: 'Veluru Deekshith Sai', reg: 'BL.EN.U4CSE...', event: 'Robotics Workshop', time: '14:05 PM' },
  { id: 2, name: 'Amit Patel', reg: 'BL.EN.U4ECE...', event: 'Hackathon 2026', time: '09:12 AM' },
  { id: 3, name: 'Priya Sharma', reg: 'BL.EN.U4AI...', event: 'AI Guest Lecture', time: '16:45 PM' },
];

const fundingRequests = [
  { id: 1, club: 'Coding Club', title: 'Hackathon Travel Kit', amount: '₹12,000', status: 'APPROVED' },
  { id: 2, club: 'Robotics Club', title: 'Competition Parts', amount: '₹8,500', status: 'PENDING' },
  { id: 3, club: 'Debate Society', title: 'Stage Microphones', amount: '₹4,200', status: 'UNDER REVIEW' },
];

const registrationKeys = new Set();

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'CampusSphere API is running.' });
});

app.get('/api/clubs', (req, res) => {
  res.json({ clubs });
});

app.get('/api/events', (req, res) => {
  res.json({ events });
});

app.get('/api/student/dashboard', (req, res) => {
  res.json({
    summary: {
      clubsJoined: 3,
      eventsRegistered: 6,
      attendanceRate: '92%',
      pendingApplications: 2,
    },
    clubs,
    events,
    announcements,
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  const metrics = [
    { label: 'Total Active Clubs', value: '24', color: 'text-blue-600' },
    { label: 'Students Attended Today', value: '142', color: 'text-indigo-600' },
    { label: 'Events Completed', value: '5', color: 'text-green-600' },
  ];

  res.json({
    metrics,
    attendance,
    fundingRequests,
    upcomingEvents: events.slice(0, 3),
  });
});

app.get('/api/club/:id', (req, res) => {
  const clubId = Number(req.params.id);
  const club = clubs.find((item) => item.id === clubId);

  if (!club) {
    return res.status(404).json({ message: 'Club not found.' });
  }

  return res.json({
    club,
    members: [
      { name: 'Aarav Nair', role: 'Member' },
      { name: 'Rohan Verma', role: 'President' },
      { name: 'Meera Iyer', role: 'Member' },
    ],
    upcomingEvents: events.filter((event) => event.club === club.name).slice(0, 2),
  });
});

app.post('/api/events/register', (req, res) => {
  const { eventId, studentName, regNo, branch, semester } = req.body;

  if (!eventId || !studentName || !regNo) {
    return res.status(400).json({ message: 'Missing required registration fields.' });
  }

  const event = events.find((item) => item.id === Number(eventId));

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (!event.open) {
    return res.status(409).json({ message: 'This event has reached capacity or is closed.' });
  }

  const registrationKey = `${event.id}:${String(regNo).trim().toUpperCase()}`;
  if (registrationKeys.has(registrationKey)) {
    return res.status(409).json({ message: 'This student is already registered for the event.' });
  }

  const registration = {
    id: Date.now(),
    eventId: event.id,
    title: event.title,
    studentName,
    regNo,
    branch,
    semester,
    status: 'REGISTERED',
  };

  if (event.registeredCount >= event.capacity) {
    event.open = false;
    return res.status(409).json({ message: 'Capacity reached. Please choose another event.', registration });
  }

  registrationKeys.add(registrationKey);
  event.registeredCount += 1;
  if (event.registeredCount >= event.capacity) {
    event.open = false;
  }

  return res.status(201).json({
    message: `Successfully registered for ${event.title}.`,
    registration,
  });
});

app.listen(PORT, () => {
  console.log(`CampusSphere API running on http://localhost:${PORT}`);
});
