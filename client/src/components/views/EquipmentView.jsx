import {
  Check,
  Laptop,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddEquipmentModal, EquipmentBorrowModal, RejectionFeedbackDialog } from '../WorkspaceModals';

export default function EquipmentView({
  equipment = [],
  borrows = [],
  clubs = [],
  events = [],
  role = 'STUDENT',
  onRequestBorrow,
  onReturnEquipment,
  onReviewBorrow,
  onAddEquipment,
}) {
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  const canAccessEquipment = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE', 'CLUB_COMMITTEE'].includes(role);
  const canManage = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT'].includes(role);
  const canReview = ['ADMIN', 'FACULTY'].includes(role);

  const pendingBorrows = borrows.filter((b) =>
    ['mentor_pending', 'student_affairs_pending', 'pending'].includes(b.status?.toLowerCase())
  );

  const handleReturn = async (borrow) => {
    try {
      await onReturnEquipment(borrow._id || borrow.id);
      toast.success('Equipment marked as returned. Inventory updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to return equipment');
    }
  };

  const handleApprove = async (borrow) => {
    try {
      await onReviewBorrow(borrow._id || borrow.id, { status: 'approved' });
      toast.success('Equipment loan approved!');
    } catch (err) {
      toast.error(err.message || 'Failed to approve loan');
    }
  };

  const handleRejectPrompt = (borrow) => {
    setRejectionTarget(borrow);
  };

  const handleConfirmRejection = async (feedback) => {
    if (!rejectionTarget) return;
    try {
      await onReviewBorrow(rejectionTarget._id || rejectionTarget.id, {
        status: 'rejected',
        feedback,
      });
      toast.success('Equipment loan declined with feedback.');
    } catch (err) {
      toast.error(err.message || 'Failed to decline loan');
    }
  };

  if (!canAccessEquipment) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">Gear, AV &amp; Laboratory Requisitions</p>
          </div>
          <div className="header-title-row">
            <h1>
              Equipment Cupboard &amp; <em>Loan Desk.</em>
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
            Equipment Inventory Access Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Hardware inventory loans and equipment custody queues are restricted to active club executives, committee members, and faculty coordinators.
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
          <p className="eyebrow">Gear, AV &amp; Laboratory Requisitions</p>
        </div>
        <div className="header-title-row">
          <h1>
            Equipment Cupboard &amp; <em>Loan Desk.</em>
          </h1>
          <p className="header-subtitle">
            Borrow audio-visual units, sensors, and event gear, manage multi-tier approvals, and track return schedules.
          </p>
        </div>
        {canManage && (
          <div className="header-action-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="primary-action-button"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Add Equipment Item
            </button>
          </div>
        )}
      </header>

      {/* Approvals Review Queue (Mentor & Student Affairs) */}
      {canReview && pendingBorrows.length > 0 && (
        <section className="bento-card reveal-card" style={{ borderLeft: '4px solid var(--crimson)' }}>
          <div className="bento-card-header">
            <div className="bento-icon-wrap" style={{ background: 'var(--crimson-tint)', color: 'var(--crimson)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="bento-label" style={{ color: 'var(--crimson)' }}>Pending Sign-Off</p>
              <h3>Equipment Loan Approvals ({pendingBorrows.length})</h3>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingBorrows.map((borrow) => (
              <article
                key={borrow._id || borrow.id}
                className="glass-surface"
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: '1px solid var(--rule-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 15, color: 'var(--ink)' }}>
                      {borrow.equipmentId?.name || 'Equipment Unit'}
                    </strong>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'var(--amber-tint)',
                        color: 'var(--amber)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {borrow.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    For {borrow.eventId?.title || 'Campus Event'} · Requested by {borrow.profileId?.name || 'Club President'} · Due{' '}
                    {new Date(borrow.dueDate || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {borrow.purpose && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-secondary)' }}>
                      <strong>Purpose:</strong> {borrow.purpose}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="primary-action-button"
                    style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => handleApprove(borrow)}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    type="button"
                    className="secondary-action-button danger-hover"
                    style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => handleRejectPrompt(borrow)}
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Equipment Grid */}
      <div className="workspace-bento-grid">
        {equipment.map((item) => {
          const activeBorrow = borrows.find(
            (b) =>
              (b.equipmentId?._id || b.equipmentId) === (item._id || item.id) &&
              ['borrowed', 'approved'].includes(b.status?.toLowerCase())
          );
          const isAvailable = (item.availableQuantity || 0) > 0;

          return (
            <article key={item._id || item.id} className="bento-card reveal-card">
              <div className="bento-card-header" style={{ alignItems: 'flex-start' }}>
                <div className="bento-icon-wrap" style={{ background: 'var(--glass-surface-warm)', color: 'var(--crimson)' }}>
                  <Laptop size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="bento-label">{item.clubId?.name || 'Campus Inventory'}</p>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(32,29,27,0.06)',
                        color: 'var(--ink-secondary)',
                      }}
                    >
                      {item.condition || 'Good'}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                </div>
              </div>

              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', margin: '12px 0 16px' }}>
                {item.description || 'Shared equipment maintained by campus organizations.'}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 14,
                  borderTop: '1px solid var(--rule-subtle)',
                  marginTop: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isAvailable ? 'var(--emerald)' : 'var(--crimson)',
                    }}
                  />
                  <span style={{ color: isAvailable ? 'var(--emerald)' : 'var(--crimson)' }}>
                    {item.availableQuantity} of {item.totalQuantity} available
                  </span>
                </div>

                <div>
                  {activeBorrow ? (
                    <button
                      type="button"
                      className="secondary-action-button"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => handleReturn(activeBorrow)}
                    >
                      <RotateCcw size={13} /> Check In / Return
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-action-button"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      disabled={!isAvailable}
                      onClick={() => setSelectedItemForBorrow(item)}
                    >
                      Request Loan
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {equipment.length === 0 && (
        <div className="empty-message" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            No equipment items listed in the campus cupboard yet.
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedItemForBorrow && (
        <EquipmentBorrowModal
          equipment={selectedItemForBorrow}
          events={events}
          onClose={() => setSelectedItemForBorrow(null)}
          onSubmit={onRequestBorrow}
        />
      )}

      {showAddModal && (
        <AddEquipmentModal
          clubs={clubs}
          onClose={() => setShowAddModal(false)}
          onSubmit={onAddEquipment}
        />
      )}

      {rejectionTarget && (
        <RejectionFeedbackDialog
          kind="borrow"
          onClose={() => setRejectionTarget(null)}
          onSubmit={handleConfirmRejection}
        />
      )}
    </div>
  );
}
