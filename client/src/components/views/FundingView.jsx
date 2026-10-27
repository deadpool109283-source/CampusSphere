import {
  BarChart3,
  Check,
  Lock,
  Plus,
  WalletCards,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { FundingRequestModal, RejectionFeedbackDialog } from '../WorkspaceModals';

export default function FundingView({
  funding = [],
  transactions = [],
  clubs = [],
  events = [],
  role = 'STUDENT',
  track = 'student',
  onRequestFunding,
  onReviewFunding,
}) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const isOfficeBearer = track === 'office-bearer' || track === 'verified-office-bearer';
  const canAccessFunding = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE', 'CLUB_COMMITTEE'].includes(role) || ['student-affairs', 'mentor', 'office-bearer', 'verified-office-bearer', 'executive'].includes(track);
  const canManage = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT'].includes(role) || ['student-affairs', 'mentor', 'office-bearer', 'verified-office-bearer'].includes(track);
  const canReview = ['ADMIN', 'FACULTY'].includes(role) || ['student-affairs', 'mentor'].includes(track);
  // Club office bearers must not receive permission to access funding transactions
  const canAccessTransactions = !isOfficeBearer && (['ADMIN', 'FACULTY'].includes(role) || ['student-affairs', 'mentor'].includes(track));

  // Spending breakdown calculation
  const debitTransactions = transactions.filter((t) => (t.type || 'debit') === 'debit');
  const totalSpent = debitTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalRequested = funding.reduce((acc, f) => acc + Number(f.requestedAmount || 0), 0);
  const approvedCount = funding.filter((f) => f.status === 'approved').length;

  const maxTxnAmount = Math.max(...debitTransactions.map((t) => Number(t.amount || 0)), 1);

  const filteredFunding = funding.filter((item) => {
    if (filter === 'all') return true;
    return item.status?.toLowerCase().includes(filter.toLowerCase());
  });

  const handleApprove = async (request) => {
    try {
      await onReviewFunding(request._id || request.id, { status: 'approved' });
      toast.success('Funding request approved!');
    } catch (err) {
      toast.error(err.message || 'Failed to approve funding');
    }
  };

  const handleRejectPrompt = (request) => {
    setRejectionTarget(request);
  };

  const handleConfirmRejection = async (feedback) => {
    if (!rejectionTarget) return;
    try {
      await onReviewFunding(rejectionTarget._id || rejectionTarget.id, {
        status: 'rejected',
        feedback,
      });
      toast.success('Funding request rejected with feedback.');
    } catch (err) {
      toast.error(err.message || 'Failed to reject funding');
    }
  };

  if (!canAccessFunding) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">Financial Grants &amp; Ledger Transparency</p>
          </div>
          <div className="header-title-row">
            <h1>
              Funding Grants &amp; <em>Expenditure Ledger.</em>
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
            Club Treasury &amp; Grants Access Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Funding requisition history and financial ledger debits are restricted exclusively to verified club officers, committee members, and administrative mentors.
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
          <p className="eyebrow">Financial Grants &amp; Ledger Transparency</p>
        </div>
        <div className="header-title-row">
          <h1>
            Funding Grants &amp; <em>Expenditure Ledger.</em>
          </h1>
          <p className="header-subtitle">
            Submit grant applications for campus events, trace financial disbursements, and audit itemized expenditures.
          </p>
        </div>
        {canManage && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={() => setShowRequestModal(true)}
            >
              <Plus size={16} /> New Funding Request
            </button>
          </div>
        )}
      </header>

      {/* KPI Stats Row */}
      <div className="metrics-strip reveal-card">
        <div className="metric-card">
          <p className="metric-label">TOTAL GRANTED EXPENSES</p>
          <div className="metric-value-row">
            <span className="metric-value">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
          <p className="metric-foot">Recorded against verified invoices</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">ACTIVE PROPOSAL VALUE</p>
          <div className="metric-value-row">
            <span className="metric-value">₹{totalRequested.toLocaleString('en-IN')}</span>
          </div>
          <p className="metric-foot">Across {funding.length} club requests</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">APPROVED GRANTS</p>
          <div className="metric-value-row">
            <span className="metric-value">{approvedCount}</span>
          </div>
          <p className="metric-foot">Sign-off by Student Affairs</p>
        </div>
      </div>

      {/* Spending Breakdown Chart / Ledger */}
      {canAccessTransactions ? (
        <section className="bento-card reveal-card">
          <div className="bento-card-header">
            <div className="bento-icon-wrap" style={{ background: 'var(--glass-surface-warm)', color: 'var(--crimson)' }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="bento-label">Disbursement Ledger</p>
              <h3>Where Club Funds Are Spent</h3>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {debitTransactions.slice(0, 6).map((txn) => {
              const pct = Math.max(Math.round((Number(txn.amount || 0) / maxTxnAmount) * 100), 5);
              return (
                <div key={txn._id || txn.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>{txn.description}</strong>
                      <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                        ({txn.clubId?.name || 'Campus Club'})
                      </span>
                    </div>
                    <strong style={{ color: 'var(--crimson)' }}>
                      ₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      borderRadius: 999,
                      background: 'rgba(32, 29, 27, 0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, var(--crimson), #c4384e)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {debitTransactions.length === 0 && (
              <p style={{ margin: '14px 0', color: 'var(--muted)', fontSize: 13 }}>
                No expenses recorded in the ledger yet.
              </p>
            )}
          </div>
        </section>
      ) : (
        <div className="bento-card reveal-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--ws-surface-subtle)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ws-text-muted)' }}>
            <strong>Ledger Privacy Notice:</strong> Detailed campus transaction ledgers and disbursement audits are restricted to Faculty Mentors and Student Affairs administration.
          </p>
        </div>
      )}

      {/* Funding Requests Queue */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="bento-icon-wrap">
              <WalletCards size={18} />
            </div>
            <div>
              <p className="bento-label">Proposals &amp; Approvals</p>
              <h3>Funding Requisitions</h3>
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

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredFunding.map((req) => {
            const status = (req.status || 'pending').toLowerCase();
            const isApproved = status === 'approved';
            const isPending = status.includes('pending');

            return (
              <article
                key={req._id || req.id}
                className="glass-surface"
                style={{
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: '1px solid var(--rule-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 16, color: 'var(--ink)' }}>
                      {req.clubId?.name || 'Club'}
                    </strong>
                    {req.eventId?.title && (
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        · For <em>{req.eventId.title}</em>
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: isApproved ? 'var(--emerald-tint)' : isPending ? 'var(--amber-tint)' : 'var(--crimson-tint)',
                        color: isApproved ? 'var(--emerald)' : isPending ? 'var(--amber)' : 'var(--crimson)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
                    <strong>Purpose:</strong> {req.purpose}
                  </p>

                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Requested by {req.createdBy?.name || 'Club Executive'} · Applied{' '}
                    {new Date(req.requestDate || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  {req.rejectionFeedback && (
                    <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'var(--crimson-tint)', color: 'var(--crimson-dark)', fontSize: 12 }}>
                      <strong>Review Feedback:</strong> {req.rejectionFeedback}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <strong style={{ fontSize: 20, color: 'var(--ink)' }}>
                    ₹{Number(req.requestedAmount || 0).toLocaleString('en-IN')}
                  </strong>

                  {canReview && isPending && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="primary-action-button"
                        style={{ padding: '7px 14px', fontSize: 12 }}
                        onClick={() => handleApprove(req)}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        className="secondary-action-button danger-hover"
                        style={{ padding: '7px 14px', fontSize: 12 }}
                        onClick={() => handleRejectPrompt(req)}
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {filteredFunding.length === 0 && (
            <div className="empty-message" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                No funding requests found in this view.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {showRequestModal && (
        <FundingRequestModal
          clubs={clubs}
          events={events}
          onClose={() => setShowRequestModal(false)}
          onSubmit={onRequestFunding}
        />
      )}

      {rejectionTarget && (
        <RejectionFeedbackDialog
          kind="funding"
          onClose={() => setRejectionTarget(null)}
          onSubmit={handleConfirmRejection}
        />
      )}
    </div>
  );
}
