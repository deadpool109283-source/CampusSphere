import { useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { CreateAnnouncementModal } from '../WorkspaceModals';

export default function AnnouncementsView({
  announcements = [],
  clubs = [],
  role = 'STUDENT',
  track = 'student',
  onPostAnnouncement,
}) {
  const [showPostModal, setShowPostModal] = useState(false);

  const isOfficeBearer = track === 'office-bearer' || track === 'verified-office-bearer';
  // Club office bearers must not receive permission to publish club announcements
  const canPost = !isOfficeBearer && (['ADMIN', 'FACULTY', 'CLUB_EXECUTIVE'].includes(role) || ['student-affairs', 'mentor', 'executive'].includes(track));

  return (
    <div className="workspace-stack">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Campus Circulars &amp; Notices</p>
        </div>
        <div className="header-title-row">
          <h1>
            Campus Announcements &amp; <em>Noticeboard.</em>
          </h1>
          <p className="header-subtitle">
            Stay informed with official circulars, fest stage schedules, and recruitment broadcasts from across Amrita.
          </p>
        </div>
        {canPost && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={() => setShowPostModal(true)}
            >
              <Plus size={16} /> New Announcement
            </button>
          </div>
        )}
      </header>

      {/* Announcements Stream */}
      <div className="announcements-stack">
        {announcements.map((note, idx) => {
          const isHighPriority = note.priority === 'high';
          const isNew = idx < 2;

          return (
            <article
              key={note._id || note.id || idx}
              className={`announcement-item reveal-card ${isHighPriority ? 'priority-high' : ''}`}
            >
              <div className="announcement-source">
                <div className="announcement-icon-badge">
                  <Megaphone size={14} />
                </div>
                <span className="bulletin-chip">
                  {note.clubId?.name || note.club || 'Office of Student Affairs'}
                </span>
                <time className="bulletin-time">
                  {new Date(note.postedDate || note.date || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>

                <div className="announcement-tags-right">
                  {isNew && <span className="announcement-pill-new">NEW</span>}
                  {isHighPriority && <span className="announcement-pill-alert">IMPORTANT</span>}
                </div>
              </div>

              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </article>
          );
        })}

        {announcements.length === 0 && (
          <div className="empty-message" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              No campus announcements posted at this time.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPostModal && (
        <CreateAnnouncementModal
          clubs={clubs}
          onClose={() => setShowPostModal(false)}
          onSubmit={onPostAnnouncement}
        />
      )}
    </div>
  );
}
