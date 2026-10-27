import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionProvider } from './auth/SessionProvider';
import PageTransition from './components/PageTransition';
import RequireSession from './components/RequireSession';
import WorkspaceLayout from './components/WorkspaceLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import PublicDirectory from './pages/PublicDirectory';
import WorkspacePage from './pages/WorkspacePage';
import './styles/home.css';
import './styles/workspace.css';
import './styles/login.css';
import './styles/directory.css';
import './styles/profile.css';
import './styles/registration.css';
import './styles/theme-overrides.css';

export default function App() {
  return (
    <SessionProvider>
      <Toaster position="top-right" richColors />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clubs" element={<PublicDirectory kind="clubs" />} />
          <Route path="/clubs/:clubId" element={<PublicDirectory kind="club" />} />
          <Route path="/events" element={<PublicDirectory kind="events" />} />
          <Route element={<RequireSession />}>
            <Route path="/app" element={<WorkspaceLayout />}>
              <Route index element={<WorkspacePage />} />
              <Route path="clubs" element={<WorkspacePage />} />
              <Route path="clubs/:clubId" element={<WorkspacePage />} />
              <Route path="events" element={<WorkspacePage />} />
              <Route path="membership" element={<WorkspacePage />} />
              <Route path="members" element={<WorkspacePage />} />
              <Route path="chats" element={<WorkspacePage />} />
              <Route path="equipment" element={<WorkspacePage />} />
              <Route path="funding" element={<WorkspacePage />} />
              <Route path="reports" element={<WorkspacePage />} />
              <Route path="event-reports" element={<WorkspacePage />} />
              <Route path="announcements" element={<WorkspacePage />} />
              <Route path="credential-requests" element={<WorkspacePage />} />
              <Route path="account-desk" element={<WorkspacePage />} />
              <Route path="profile" element={<WorkspacePage />} />
            </Route>
          </Route>
          <Route path="/student/*" element={<Navigate to="/app" replace />} />
          <Route path="/president/*" element={<Navigate to="/app" replace />} />
          <Route path="/mentor/*" element={<Navigate to="/app" replace />} />
          <Route path="/admin/*" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </SessionProvider>
  );
}
