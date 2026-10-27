import {
  Check,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CredentialRequestsView({
  credentialRequests = [],
  role = 'ADMIN',
  onReviewCredentialRequest,
}) {
  const canReview = ['ADMIN', 'FACULTY'].includes(role);

  const handleReview = async (req, status) => {
    try {
      await onReviewCredentialRequest(req._id || req.id, { status });
      toast.success(`Club credential change ${status === 'approved' ? 'approved' : 'declined'}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update credential request');
    }
  };

  if (!canReview) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">ICTS Security &amp; Identity Desk</p>
          </div>
          <div className="header-title-row">
            <h1>
              Shared Club Accounts &amp; <em>Credential Changes.</em>
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
            ICTS Security Access Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Shared club account alteration requests and administrative identity logs are restricted strictly to Student Affairs Directorate and ICTS systems administrators.
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
          <p className="eyebrow">ICTS Security &amp; Identity Desk</p>
        </div>
        <div className="header-title-row">
          <h1>
            Shared Club Accounts &amp; <em>Credential Changes.</em>
          </h1>
          <p className="header-subtitle">
            Authorize changes to institutional club login emails and reset shared passwords requested by ICTS or student presidents.
          </p>
        </div>
      </header>

      {/* Security Context Banner */}
      <section className="bento-card reveal-card" style={{ background: 'var(--glass-surface-warm)', border: '1px solid var(--rule-subtle)' }}>
        <div className="bento-card-header">
          <div className="bento-icon-wrap" style={{ background: 'var(--emerald-tint)', color: 'var(--emerald)' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="bento-label" style={{ color: 'var(--emerald)' }}>Institutional Policy</p>
            <h3>Authorized Handover Protocol</h3>
          </div>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
          To prevent unauthorized lockouts during annual executive handovers, modifications to chartered club accounts require explicit administrative verification before ICTS applies directory sync updates.
        </p>
      </section>

      {/* Requests List */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header">
          <div className="bento-icon-wrap" style={{ background: 'var(--glass-surface-warm)', color: 'var(--crimson)' }}>
            <KeyRound size={18} />
          </div>
          <div>
            <p className="bento-label">Pending Verifications</p>
            <h3>Account Alteration Requests</h3>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {credentialRequests.map((req) => {
            const status = (req.status || 'pending').toLowerCase();
            const isApproved = status === 'approved';
            const isPending = status === 'pending';

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
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 16, color: 'var(--ink)' }}>
                      {req.clubId?.name || 'Chartered Club'}
                    </strong>
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
                      {status}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    Requested by {req.requestedBy?.name || req.requestedBy?.email || 'ICTS Helpdesk'}
                  </p>

                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--ink-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} style={{ color: 'var(--muted)' }} />
                      {req.clubLoginEmail ? (
                        <>New email: <strong>{req.clubLoginEmail}</strong></>
                      ) : (
                        'Email unchanged'
                      )}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={14} style={{ color: 'var(--muted)' }} />
                      {req.passwordChangeRequested ? 'Password reset requested (Encrypted)' : 'Password unchanged'}
                    </span>
                  </div>
                </div>

                {canReview && isPending && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="primary-action-button"
                      style={{ padding: '7px 14px', fontSize: 12 }}
                      onClick={() => handleReview(req, 'approved')}
                    >
                      <Check size={14} /> Authorize Change
                    </button>
                    <button
                      type="button"
                      className="secondary-action-button danger-hover"
                      style={{ padding: '7px 14px', fontSize: 12 }}
                      onClick={() => handleReview(req, 'rejected')}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}

          {credentialRequests.length === 0 && (
            <div className="empty-message" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                No pending club credential change requests to review.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
