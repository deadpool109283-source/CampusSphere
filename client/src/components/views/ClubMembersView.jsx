import {
  Lock,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClubMembersView({
  clubs = [],
  members = [],
  role = 'CLUB_PRESIDENT',
  track = 'mentor',
  onUpdateMemberRole,
  onRemoveMember,
  onNominateMember,
}) {
  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?._id || clubs[0]?.id || 'club-msft');
  const [includePast, setIncludePast] = useState(false);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineePosition, setNomineePosition] = useState('executive');
  const [showNominateForm, setShowNominateForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const isOfficeBearer = track === 'office-bearer' || track === 'verified-office-bearer';
  const canAccessRoster = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE', 'CLUB_COMMITTEE'].includes(role) || ['mentor', 'student-affairs', 'executive'].includes(track);
  const canManage = (['ADMIN', 'FACULTY'].includes(role) || ['mentor', 'student-affairs'].includes(track)) || (role === 'CLUB_PRESIDENT' && !isOfficeBearer);
  const canRemove = canManage && !isOfficeBearer;

  const currentClub = clubs.find((c) => (c._id || c.id) === selectedClubId) || clubs[0];

  const clubMembers = members.filter((m) => {
    const clubMatch = (m.clubId?._id || m.clubId?.id || m.clubId) === selectedClubId;
    if (!clubMatch) return false;
    if (!includePast && m.membershipStatus === 'ended') return false;
    return true;
  });

  const handleNominateSubmit = async (e) => {
    e.preventDefault();
    if (!nomineeName || !nomineeEmail) return;
    setBusy(true);
    try {
      await onNominateMember({
        clubId: selectedClubId,
        name: nomineeName,
        email: nomineeEmail,
        position: nomineePosition,
      });
      toast.success(`Leadership invitation sent to ${nomineeName}!`);
      setNomineeName('');
      setNomineeEmail('');
      setShowNominateForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to nominate member');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (member, newPosition) => {
    try {
      await onUpdateMemberRole(member._id || member.id, {
        position: newPosition,
        officeBearerGroup: ['president', 'vice_president', 'secretary', 'treasurer'].includes(newPosition),
      });
      toast.success(`Updated role for ${member.profileId?.name || 'member'} to ${newPosition.replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update member position');
    }
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`Are you sure you want to end membership for ${member.profileId?.name || 'this member'}?`)) {
      return;
    }
    try {
      await onRemoveMember(member._id || member.id);
      toast.success(`Membership concluded for ${member.profileId?.name || 'member'}.`);
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  if (!canAccessRoster) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">Roster &amp; Leadership Governance</p>
          </div>
          <div className="header-title-row">
            <h1>
              Club Members &amp; <em>Leadership Council.</em>
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
            Club Leadership Roster Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Internal club roster administration, role promotions, and member removal permissions require verified executive standing. Visit the Clubs Directory to view public club details.
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
          <p className="eyebrow">Roster &amp; Leadership Governance</p>
        </div>
        <div className="header-title-row">
          <h1>
            Club Members &amp; <em>Leadership Council.</em>
          </h1>
          <p className="header-subtitle">
            Manage your club active roster, assign executive portfolios, and maintain historical membership logs.
          </p>
        </div>
      </header>

      {/* Roster Controls Bar */}
      <div className="directory-toolbar reveal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Active Club:</span>
            <select
              className="text-input"
              style={{ width: 'auto', minWidth: 220, padding: '8px 14px' }}
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
            >
              {clubs.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={includePast}
              onChange={(e) => setIncludePast(e.target.checked)}
            />
            Include past alumni / ended members
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="results-badge">{clubMembers.length} members</span>
          {canManage && (
            <button
              type="button"
              className="primary-action-button"
              style={{ padding: '8px 16px', fontSize: 13 }}
              onClick={() => setShowNominateForm(!showNominateForm)}
            >
              <UserPlus size={15} /> {showNominateForm ? 'Close Form' : 'Nominate Leader'}
            </button>
          )}
        </div>
      </div>

      {/* Nominate Member Form */}
      {showNominateForm && (
        <section className="bento-card reveal-card" style={{ border: '1px solid var(--crimson-glow)', background: 'var(--glass-surface-warm)' }}>
          <div className="bento-card-header">
            <div className="bento-icon-wrap" style={{ background: 'var(--crimson-tint)', color: 'var(--crimson)' }}>
              <Shield size={18} />
            </div>
            <div>
              <p className="bento-label" style={{ color: 'var(--crimson)' }}>Leadership Appointment</p>
              <h3>Nominate Member for Executive Position</h3>
            </div>
          </div>

          <form onSubmit={handleNominateSubmit} style={{ marginTop: 16 }}>
            <div className="form-row-3col">
              <div className="form-field-group">
                <label className="field-label" htmlFor="nom-name">Student Full Name</label>
                <input
                  id="nom-name"
                  type="text"
                  className="text-input"
                  placeholder="e.g., Bhavana Sundaram"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="field-label" htmlFor="nom-email">Amrita Email Address</label>
                <input
                  id="nom-email"
                  type="email"
                  className="text-input"
                  placeholder="bhavana@am.students.amrita.edu"
                  value={nomineeEmail}
                  onChange={(e) => setNomineeEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="field-label" htmlFor="nom-pos">Position</label>
                <select
                  id="nom-pos"
                  className="text-input"
                  value={nomineePosition}
                  onChange={(e) => setNomineePosition(e.target.value)}
                >
                  <option value="president">President</option>
                  <option value="vice_president">Vice President</option>
                  <option value="secretary">Secretary</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="office_bearer">Office Bearer</option>
                  <option value="executive">Executive Team</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => setShowNominateForm(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-action-button"
                disabled={busy}
              >
                {busy ? 'Sending Nomination...' : 'Send Position Invite'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Members Roster Table */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header">
          <div className="bento-icon-wrap">
            <Users size={18} />
          </div>
          <div>
            <p className="bento-label">Roster Directory</p>
            <h3>Members of {currentClub?.name || 'Club'}</h3>
          </div>
        </div>

        <div className="roster-table-wrap" style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule-subtle)', color: 'var(--muted)', fontSize: 11, letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>MEMBER</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>JOINED DATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>ASSIGNED POSITION</th>
                {canRemove && <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {clubMembers.map((member) => {
                const isEnded = member.membershipStatus === 'ended';
                const isPending = member.membershipStatus === 'pending';
                const isOb = ['president', 'vice_president', 'secretary', 'treasurer', 'office_bearer'].includes(member.position);

                return (
                  <tr
                    key={member._id || member.id}
                    style={{
                      borderBottom: '1px solid var(--rule-subtle)',
                      opacity: isEnded ? 0.6 : 1,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isOb ? 'var(--crimson-tint)' : 'var(--glass-surface-warm)',
                            color: isOb ? 'var(--crimson)' : 'var(--ink)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            border: '1px solid var(--rule-subtle)',
                          }}
                        >
                          {(member.profileId?.name || 'M').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)' }}>
                            {member.profileId?.name || 'Club Member'}
                          </strong>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {member.profileId?.email || 'student@amrita.edu'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: isEnded ? 'rgba(32,29,27,0.06)' : isPending ? 'var(--amber-tint)' : 'var(--emerald-tint)',
                          color: isEnded ? 'var(--muted)' : isPending ? 'var(--amber)' : 'var(--emerald)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isEnded ? 'Ended' : isPending ? 'Invited' : 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>
                      {isEnded
                        ? `Ended ${new Date(member.endedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : new Date(member.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {canManage && !isEnded ? (
                        <select
                          className="text-input"
                          style={{ padding: '6px 10px', fontSize: 12, width: 'auto', minWidth: 140 }}
                          value={member.position || 'member'}
                          onChange={(e) => handleRoleChange(member, e.target.value)}
                        >
                          <option value="member">General Member</option>
                          <option value="executive">Executive</option>
                          <option value="office_bearer">Office Bearer</option>
                          <option value="secretary">Secretary</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="vice_president">Vice President</option>
                          <option value="president">President</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          {(member.position || 'member').replace(/_/g, ' ')}
                        </span>
                      )}
                    </td>

                    {canRemove && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {!isEnded && (
                          <button
                            type="button"
                            className="secondary-action-button danger-hover"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            onClick={() => handleRemove(member)}
                            title="End club membership"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {clubMembers.length === 0 && (
            <div className="empty-message" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                No active members found in this club roster.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
