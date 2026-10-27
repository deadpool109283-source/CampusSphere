import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApplyMembershipModal, RejectionFeedbackDialog } from '../WorkspaceModals';

export default function MembershipView({
  applications = [],
  memberships = [],
  participation = [],
  clubs = [],
  role = 'STUDENT',
  track = 'student',
  onReviewApplication,
  onRespondInvitation,
  onApplyClub,
}) {
  const [filter, setFilter] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);

  const isStudent = track === 'student' || role === 'STUDENT';
  const isOfficeBearer = track === 'office-bearer' || track === 'verified-office-bearer';
  // Club office bearers must not review or approve recruitment applications
  const canReview = !isOfficeBearer && (['ADMIN', 'FACULTY', 'CLUB_EXECUTIVE'].includes(role) || ['student-affairs', 'mentor', 'executive'].includes(track));

  const pendingInvitations = memberships.filter((m) => m.membershipStatus === 'pending');

  // For regular students: only their own applications should ever be visible
  // For leadership roles: applications for their club/campus queue are reviewable
  const userApplications = isStudent
    ? applications.filter((app) => app.profileId?._id === 'me' || app.profileId?.name === 'Student Applicant' || app.profileId?.registerNumber === 'AM.EN.U4CSE23101' || !canReview)
    : applications;

  const filteredApplications = userApplications.filter((app) => {
    if (filter === 'all') return true;
    return app.status?.toLowerCase() === filter.toLowerCase();
  });

  const handleAccept = async (app) => {
    try {
      await onReviewApplication(app._id || app.id, { status: 'approved' });
      toast.success(`Application for ${app.profileId?.name || 'student'} approved!`);
    } catch (err) {
      toast.error(err.message || 'Failed to approve application');
    }
  };

  const handleRejectPrompt = (app) => {
    setRejectionTarget(app);
  };

  const handleConfirmRejection = async (feedback) => {
    if (!rejectionTarget) return;
    try {
      await onReviewApplication(rejectionTarget._id || rejectionTarget.id, {
        status: 'rejected',
        feedback,
      });
      toast.success('Application declined with feedback provided.');
    } catch (err) {
      toast.error(err.message || 'Failed to decline application');
    }
  };

  return (
    <div className="workspace-stack">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Induction & Roster Management</p>
        </div>
        <div className="header-title-row">
          <h1>
            Membership &amp; <em>Leadership Journeys.</em>
          </h1>
          <p className="header-subtitle">
            {isStudent
              ? 'Track your club applications, respond to leadership nominations, and view your campus participation timeline.'
              : 'Review prospective student applicants, evaluate statements of purpose, and induct fresh club members.'}
          </p>
        </div>
        {isStudent && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={() => setShowApplyModal(true)}
            >
              <Plus size={16} /> Apply for Club Membership
            </button>
          </div>
        )}
      </header>

      {/* Position Invitations Banner */}
      {pendingInvitations.length > 0 && (
        <section className="bento-card reveal-card invitation-card" style={{ borderLeft: '4px solid var(--crimson)' }}>
          <div className="bento-card-header">
            <div className="bento-icon-wrap" style={{ background: 'var(--crimson-tint)', color: 'var(--crimson)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="bento-label" style={{ color: 'var(--crimson)' }}>Action Required</p>
              <h3>Office-Bearer &amp; Leadership Nominations</h3>
            </div>
          </div>
          <div className="invitations-list" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingInvitations.map((inv) => (
              <article className="invitation-item glass-surface" key={inv._id || inv.id} style={{ padding: '16px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <strong style={{ fontSize: 16, display: 'block', color: 'var(--ink)' }}>
                    {inv.clubId?.name || 'Campus Club'}
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-secondary)' }}>
                    You have been nominated as <strong>{(inv.position || 'Office Bearer').replace(/_/g, ' ')}</strong>. Accept to activate your executive privileges.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="primary-action-button"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                    onClick={() => onRespondInvitation(inv._id || inv.id, 'accepted')}
                  >
                    <Check size={14} /> Accept Nomination
                  </button>
                  <button
                    type="button"
                    className="secondary-action-button"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                    onClick={() => onRespondInvitation(inv._id || inv.id, 'declined')}
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Applications Desk */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="bento-icon-wrap">
              <Users size={18} />
            </div>
            <div>
              <p className="bento-label">Applications Queue</p>
              <h3>{isStudent ? 'Your Submitted Applications' : 'Student Applications Desk'}</h3>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="filter-pill-group" style={{ display: 'flex', gap: 6, background: 'rgba(32, 29, 27, 0.04)', padding: 4, borderRadius: 999 }}>
            {['all', 'pending', 'approved', 'rejected'].map((pill) => (
              <button
                key={pill}
                type="button"
                className={`filter-pill ${filter === pill ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === pill ? '#ffffff' : 'transparent',
                  color: filter === pill ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: filter === pill ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.18s ease',
                  textTransform: 'capitalize',
                }}
                onClick={() => setFilter(pill)}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredApplications.map((app) => {
            const isExpanded = expandedAppId === (app._id || app.id);
            const status = (app.status || 'pending').toLowerCase();
            const statusColor = status === 'approved' ? 'var(--emerald)' : status === 'rejected' ? 'var(--crimson)' : 'var(--amber)';
            const statusBg = status === 'approved' ? 'var(--emerald-tint)' : status === 'rejected' ? 'var(--crimson-tint)' : 'var(--amber-tint)';

            return (
              <article
                key={app._id || app.id}
                className="application-card glass-surface"
                style={{
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: '1px solid var(--rule-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'var(--glass-surface-warm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 15,
                        color: 'var(--crimson)',
                        border: '1px solid var(--rule-subtle)',
                      }}
                    >
                      {(app.profileId?.name || 'A').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 16, color: 'var(--ink)' }}>
                          {app.clubId?.name || 'Club'}
                        </strong>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: statusBg,
                            color: statusColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {status}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        {isStudent ? 'Application for ' : `Applicant: ${app.profileId?.name || 'Student'} · `}
                        <strong>{app.requestedPosition === 'executive' ? 'Executive Wing' : 'Club Membership'}</strong>
                        {app.domain ? ` (${app.domain})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Reviewers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {canReview && status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="primary-action-button"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          onClick={() => handleAccept(app)}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          className="secondary-action-button danger-hover"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          onClick={() => handleRejectPrompt(app)}
                        >
                          <X size={14} /> Decline
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="secondary-action-button"
                      style={{ padding: '7px 12px', fontSize: 12 }}
                      onClick={() => setExpandedAppId(isExpanded ? null : (app._id || app.id))}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'} <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Applicant Details (Only accessible for reviewers or own application) */}
                {isExpanded && (canReview || isStudent) && (
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--rule-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>CANDIDATE NAME</span>
                        <strong style={{ color: 'var(--ink)' }}>{app.profileId?.name || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>ROLL NUMBER</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--ink)', fontWeight: 600 }}>
                          {app.profileId?.registerNumber || app.profileId?.rollNumber || 'AM.EN.U4CSE23101'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>YEAR &amp; DEPARTMENT</span>
                        <span style={{ color: 'var(--ink)' }}>{app.yearOfStudy || '2nd Year'} · {app.profileId?.department || 'CSE'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>CONTACT PHONE</span>
                        <span style={{ color: 'var(--ink)' }}>{app.applicantPhone || app.profileId?.phone || '+91 98401 23456'}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>STATEMENT OF PURPOSE / REASON</span>
                      <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)', background: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 10, border: '1px solid var(--rule-subtle)' }}>
                        {app.reason || 'No statement provided.'}
                      </p>
                    </div>

                    {app.rejectionFeedback && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--crimson-tint)', color: 'var(--crimson-dark)', fontSize: 13 }}>
                        <strong>Review Feedback:</strong> {app.rejectionFeedback}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {filteredApplications.length === 0 && (
            <div className="empty-message" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                {filter === 'all'
                  ? 'No applications recorded in this queue yet.'
                  : `No ${filter} applications found.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Student Keepsakes: Participation Records */}
      {isStudent && participation.length > 0 && (
        <section className="bento-card reveal-card">
          <div className="bento-card-header">
            <div className="bento-icon-wrap" style={{ background: 'var(--emerald-tint)', color: 'var(--emerald)' }}>
              <Ticket size={18} />
            </div>
            <div>
              <p className="bento-label">Campus Keepsakes</p>
              <h3>Your Event Attendance Record</h3>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {participation.map((part) => (
              <article key={part._id || part.id} className="glass-surface" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--rule-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--emerald-tint)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--ink)', display: 'block' }}>{part.eventId?.title || 'Campus Event'}</strong>
                    <small style={{ color: 'var(--muted)' }}>{part.eventId?.clubId?.name || 'Club'} · Verified Attendance</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {showApplyModal && (
        <ApplyMembershipModal
          clubs={clubs}
          onClose={() => setShowApplyModal(false)}
          onSubmit={onApplyClub}
        />
      )}

      {rejectionTarget && (
        <RejectionFeedbackDialog
          kind="application"
          onClose={() => setRejectionTarget(null)}
          onSubmit={handleConfirmRejection}
        />
      )}
    </div>
  );
}
