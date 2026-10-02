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
  },
  FACULTY: {
    id: 'preview-faculty',
    fullName: 'Dr. Priya Saran',
    email: 'priya.faculty@campus.edu',
    role: 'FACULTY',
  },
  ADMIN: {
    id: 'preview-admin',
    fullName: 'Aisha Khan',
    email: 'aisha.admin@campus.edu',
    role: 'ADMIN',
  },
};
