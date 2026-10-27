import {
  Check,
  ChevronDown,
  Download,
  FolderKanban,
  Lock,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiDownload } from '../../lib/api';
import { CreateEventReportModal, RejectionFeedbackDialog } from '../WorkspaceModals';

export default function EventReportsView({
  eventReports = [],
  clubs = [],
  events = [],
  role = 'STUDENT',
  onCreateReport,
  onReviewReport,
}) {
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const canAccessReports = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE'].includes(role);
  const canCreate = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE'].includes(role);
  const canReview = ['ADMIN', 'FACULTY'].includes(role);

  const filteredReports = eventReports.filter((rep) => {
    if (filter === 'all') return true;
    return rep.status?.toLowerCase().includes(filter.toLowerCase());
  });

  const handleDownloadRoster = async (report) => {
    setDownloadingId(report._id || report.id);
    try {
      const fileName = report.rosterFileName || `${(report.eventId?.title || 'event').toLowerCase().replace(/\s+/g, '-')}-od-roster.csv`;
      await apiDownload(`/event-reports/${report._id || report.id}/roster`, fileName);
      toast.success('OD attendance roster exported successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to download OD roster');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleApprove = async (report) => {
    try {
      await onReviewReport(report._id || report.id, { status: 'approved' });
      toast.success('Event completion report approved!');
    } catch (err) {
      toast.error(err.message || 'Failed to approve report');
    }
  };

  const handleRejectPrompt = (report) => {
    setRejectionTarget(report);
  };

  const handleConfirmRejection = async (feedback) => {
    if (!rejectionTarget) return;
    try {
      await onReviewReport(rejectionTarget._id || rejectionTarget.id, {
        status: 'rejected',
        feedback,
      });
      toast.success('Event report declined with feedback provided.');
    } catch (err) {
      toast.error(err.message || 'Failed to decline report');
    }
  };

  if (!canAccessReports) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">Post-Event Completion &amp; Official Records</p>
          </div>
          <div className="header-title-row">
            <h1>
              Event Reports &amp; <em>OD Attendance.</em>
            </h1>
          </div>
        </header>

        <div className="bento-card reveal-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--crimson-tint)',
              color: 'var(--crimson)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: 20, margin: '0 0 8px', color: 'var(--ink)' }}>
            Event Completion Dossiers Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Official post-event completion dossiers, financial spending reports, and verified OD regularization rosters are restricted to designated event organizers, club executives, and faculty reviewers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Post-Event Completion &amp; Official Records</p>
        </div>
        <div className="header-title-row">
          <h1>
            Event Reports &amp; <em>OD Attendance.</em>
          </h1>
          <p className="header-subtitle">
            Submit formal event completion dossiers, record SDG impact alignments, and download official On-Duty (OD) rosters.
          </p>
        </div>
        {canCreate && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Create Completion Report
            </button>
          </div>
        )}
      </header>

      {/* Reports Queue */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="bento-icon-wrap" style={{ background: 'var(--glass-surface-warm)', color: 'var(--crimson)' }}>
              <FolderKanban size={18} />
            </div>
            <div>
              <p className="bento-label">Audit Files</p>
              <h3>Event Dossiers &amp; OD Rosters</h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'rgba(32,29,27,0.04)', padding: 4, borderRadius: 999 }}>
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

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredReports.map((report) => {
            const isExpanded = expandedReportId === (report._id || report.id);
            const status = (report.status || 'pending').toLowerCase();
            const isApproved = status === 'approved';
            const isPending = status.includes('pending');
            const details = report.reportDetails || {};
            const completion = details.activityCompletion || {};

            return (
              <article
                key={report._id || report.id}
                className="glass-surface"
                style={{
                  padding: '24px',
                  borderRadius: 18,
                  border: '1px solid var(--rule-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 17, color: 'var(--ink)' }}>
                        {report.eventId?.title || 'Campus Event'}
                      </strong>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        · {report.clubId?.name || 'Club'}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: isApproved ? 'var(--emerald-tint)' : isPending ? 'var(--amber-tint)' : 'var(--crimson-tint)',
                          color: isApproved ? 'var(--emerald)' : isPending ? 'var(--amber)' : 'var(--crimson)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Submitted by {report.submittedBy?.name || 'Club Representative'} ·{' '}
                      <strong>{report.attendeeCount || 0} attendees</strong> · ₹
                      {Number(report.budgetSpent || 0).toLocaleString('en-IN')} actual expenditure
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="primary-action-button"
                      style={{ padding: '7px 14px', fontSize: 12 }}
                      onClick={() => handleDownloadRoster(report)}
                      disabled={downloadingId === (report._id || report.id)}
                    >
                      <Download size={13} />{' '}
                      {downloadingId === (report._id || report.id) ? 'Exporting...' : 'Download OD Roster (CSV)'}
                    </button>

                    {canReview && isPending && (
                      <>
                        <button
                          type="button"
                          className="primary-action-button"
                          style={{ padding: '7px 14px', fontSize: 12, background: 'var(--emerald)' }}
                          onClick={() => handleApprove(report)}
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          type="button"
                          className="secondary-action-button danger-hover"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          onClick={() => handleRejectPrompt(report)}
                        >
                          <X size={13} /> Decline
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="secondary-action-button"
                      style={{ padding: '7px 12px', fontSize: 12 }}
                      onClick={() => setExpandedReportId(isExpanded ? null : (report._id || report.id))}
                    >
                      {isExpanded ? 'Hide Details' : 'Full Dossier'}{' '}
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Brief Summary & Highlights */}
                <div style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  <p style={{ margin: 0 }}>
                    <strong>Executive Summary:</strong> {report.summary}
                  </p>
                  {report.activities && (
                    <p style={{ margin: '4px 0 0' }}>
                      <strong>Activities Conducted:</strong> {report.activities}
                    </p>
                  )}
                  {report.outcomes && (
                    <p style={{ margin: '4px 0 0' }}>
                      <strong>Key Outcomes:</strong> {report.outcomes}
                    </p>
                  )}
                  {report.issues && (
                    <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
                      <strong>Issues &amp; Learnings:</strong> {report.issues}
                    </p>
                  )}
                </div>

                {report.rejectionFeedback && (
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--crimson-tint)', color: 'var(--crimson-dark)', fontSize: 13 }}>
                    <strong>Review Feedback:</strong> {report.rejectionFeedback}
                  </div>
                )}

                {/* Expanded Full Report Details Accordion */}
                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 16, borderTop: '1px solid var(--rule-subtle)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>EVENT CATEGORY</span>
                        <strong>{details.eventCategory?.selected?.join(', ') || 'Flagship'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>PROGRAM TYPE</span>
                        <span>{details.programType?.selected?.join(', ') || 'Level 2: Workshop'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>PARTICIPANT BREAKDOWN</span>
                        <span>
                          Internal: {details.participants?.internalCount || '—'} · External:{' '}
                          {details.participants?.externalCount || '0'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>SDG ALIGNMENT</span>
                        <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>
                          {details.sdgAlignment?.selected?.join(', ') || 'SDG 4 — Quality Education'}
                        </span>
                      </div>
                    </div>

                    {completion.detailedReport?.value && (
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>DETAILED NARRATIVE (AUDIT ARCHIVE)</span>
                        <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.6, background: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 10, border: '1px solid var(--rule-subtle)' }}>
                          {completion.detailedReport.value}
                        </p>
                      </div>
                    )}

                    {completion.impactAnalysis?.value && (
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 600 }}>IMPACT ANALYSIS</span>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-secondary)' }}>
                          {completion.impactAnalysis.value}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="empty-message" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                No event reports found in this view.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventReportModal
          clubs={clubs}
          events={events}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateReport}
        />
      )}

      {rejectionTarget && (
        <RejectionFeedbackDialog
          kind="eventReport"
          onClose={() => setRejectionTarget(null)}
          onSubmit={handleConfirmRejection}
        />
      )}
    </div>
  );
}
