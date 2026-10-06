import { createContext } from 'react';

export const SessionContext = createContext(null);
export const STORAGE_KEY = 'campussphere-dev-preview-session';

export const previewProfiles = {
  STUDENT: {
    id: 'preview-student',
    fullName: 'Aarav Nair',
    email: 'aarav@campus.edu',
    rollNumber: 'AM.EN.U4CSE23001',
    role: 'STUDENT',
  },
  CLUB_COMMITTEE: {
    id: 'preview-committee',
    fullName: 'Rohan Verma',
    email: 'rohan@campus.edu',
    rollNumber: 'AM.EN.U4CSE22009',
    role: 'CLUB_COMMITTEE',
    clubId: 1,
    clubName: 'Coding Club',
    position: 'Office bearer',
    branch: 'CSE',
    semester: '7',
  },
  CLUB_EXECUTIVE: {
    id: 'preview-executive',
    fullName: 'Aarav Nair',
    email: 'aarav@campus.edu',
    rollNumber: 'AM.EN.U4CSE23001',
    role: 'CLUB_EXECUTIVE',
    clubId: 1,
    clubName: 'Coding Club',
    position: 'Executive',
    branch: 'CSE',
    semester: '6',
  },
  CLUB_PRESIDENT: {
    id: 'preview-president',
    fullName: 'Rohan Verma',
    email: 'rohan@campus.edu',
    rollNumber: 'AM.EN.U4CSE22009',
    role: 'CLUB_PRESIDENT',
    clubId: 1,
    clubName: 'Coding Club',
    position: 'President',
    branch: 'CSE',
    semester: '7',
  },
  FACULTY: {
    id: 'preview-faculty',
    fullName: 'Dr. Priya Saran',
    email: 'priya.faculty@campus.edu',
    role: 'FACULTY',
    clubIds: [1],
    clubNames: ['Coding Club'],
  },
  ADMIN: {
    id: 'preview-admin',
    fullName: 'Aisha Khan',
    email: 'aisha.admin@campus.edu',
    role: 'ADMIN',
    department: 'Student Affairs',
  },
};
