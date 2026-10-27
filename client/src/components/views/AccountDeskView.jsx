import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';

const accountDepartments = {
  CSE: { schoolCode: 'SC', sections: ['A', 'B', 'C'] },
  AIE: { schoolCode: 'SC', sections: ['D', 'E', 'F'] },
  AID: { schoolCode: 'SC', sections: ['G'] },
  ECE: { schoolCode: 'EN', sections: ['H', 'I', 'J'] },
  EAC: { schoolCode: 'EN', sections: ['K'] },
  EEE: { schoolCode: 'EN', sections: ['L'] },
  ELC: { schoolCode: 'EN', sections: ['M'] },
  MEE: { schoolCode: 'EN', sections: ['N'] },
};

const facultyDepartments = ['ECE', 'EEE', 'MEE', 'MAT', 'PHY', 'CHE', 'ENG', 'CSE', 'MBA', 'CIR'];
const authorityDesignations = ['Dean', 'Associate Dean', 'Head of Department', 'Director', 'Other'];

export default function AccountDeskView() {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'club-logins'
  const [people, setPeople] = useState([]);
  const [credentialClubs, setCredentialClubs] = useState([]);
  const [credentialRequests, setCredentialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Form states
  const [kind, setKind] = useState('faculty_coordinator');
  const [adminType, setAdminType] = useState('student_affairs');
  const [department, setDepartment] = useState('CSE');
  const [section, setSection] = useState('A');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPerson, setEditingPerson] = useState(null);

  const currentYear = new Date().getFullYear();
  const joiningYears = Array.from({ length: 10 }, (_, i) => currentYear + 1 - i);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await apiFetch('/profiles');
      setPeople(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load accounts: ' + err.message);
    }
  }, []);

  const loadCredentialDesk = useCallback(async () => {
    try {
      const [clubsRes, requestsRes] = await Promise.all([
        apiFetch('/clubs').catch(() => ({ clubs: [] })),
        apiFetch('/club-credential-change-requests').catch(() => []),
      ]);
      const clubsList = clubsRes.clubs || (Array.isArray(clubsRes) ? clubsRes : []);
      setCredentialClubs(clubsList.filter((c) => c.organizationType !== 'event_organizer'));
      setCredentialRequests(Array.isArray(requestsRes) ? requestsRes : []);
    } catch (err) {
      toast.error('Failed to load club credential desk: ' + err.message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadAccounts(), loadCredentialDesk()]);
    setLoading(false);
  }, [loadAccounts, loadCredentialDesk]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());

    setBusy(true);
    try {
      const payload = {
        ...values,
        role: kind,
        ...(kind === 'college_admin' ? { adminType } : {}),
        ...(kind !== 'college_admin' ? { department } : {}),
        ...(kind === 'student'
          ? {
              section,
              schoolCode: accountDepartments[department]?.schoolCode || 'SC',
            }
          : {}),
      };

      const created = await apiFetch('/profiles', {
        method: 'POST',
        body: payload,
      });

      const identifier = created.facultyId || created.registerNumber || created.rollNumber || '';
      toast.success(
        `Account created for ${created.name || values.name}! ${identifier ? `ID: ${identifier}` : ''}`
      );
      form.reset();
      setDepartment('CSE');
      setSection('A');
      await loadAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async (person) => {
    const confirmMsg = `Permanently delete account for ${person.name || person.fullName} (${person.email})?\nThis removes their login, profile, memberships, and related records.`;
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    try {
      await apiFetch(`/profiles/${encodeURIComponent(person._id || person.id)}`, {
        method: 'DELETE',
      });
      toast.success(`Account for ${person.name || person.fullName} deleted.`);
      setPeople((prev) => prev.filter((p) => (p._id || p.id) !== (person._id || person.id)));
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingPerson) return;
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(formData.entries());

    setBusy(true);
    try {
      await apiFetch(`/profiles/${encodeURIComponent(editingPerson._id || editingPerson.id)}`, {
        method: 'PATCH',
        body: updates,
      });
      toast.success('Account updated successfully.');
      setEditingPerson(null);
      await loadAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to update account');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestClubCredentials = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    setBusy(true);
    try {
      await apiFetch('/club-credential-change-requests', {
        method: 'POST',
        body: values,
      });
      toast.success('Club credential change request sent to Student Affairs for review.');
      form.reset();
      await loadCredentialDesk();
    } catch (err) {
      toast.error(err.message || 'Failed to submit credential request');
    } finally {
      setBusy(false);
    }
  };

  const handleApplyClubCredentials = async (request) => {
    setBusy(true);
    try {
      await apiFetch(`/club-credential-change-requests/${request._id}/apply`, {
        method: 'PATCH',
      });
      toast.success('Approved club credentials applied successfully.');
      await loadCredentialDesk();
    } catch (err) {
      toast.error(err.message || 'Failed to apply credentials');
    } finally {
      setBusy(false);
    }
  };

  const filteredPeople = people
    .filter((person) => person.role !== 'icts' && person.backendRole !== 'icts')
    .filter((person) => {
      if (filter === 'all') return true;
      if (filter === 'student') return person.role === 'student' || person.role === 'STUDENT';
      if (filter === 'faculty') return person.role === 'faculty_coordinator' || person.role === 'FACULTY';
      if (filter === 'admin') return person.role === 'college_admin' || person.role === 'ADMIN';
      return true;
    })
    .filter((person) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (person.name || person.fullName || '').toLowerCase();
      const email = (person.email || '').toLowerCase();
      const roll = (person.registerNumber || person.rollNumber || person.facultyId || '').toLowerCase();
      const dept = (person.department || '').toLowerCase();
      return name.includes(q) || email.includes(q) || roll.includes(q) || dept.includes(q);
    });

  const departmentSections = accountDepartments[department]?.sections || [];
  const departmentOptions =
    kind === 'faculty_coordinator' ? facultyDepartments : Object.keys(accountDepartments);

  return (
    <div className="workspace-stack account-desk-view">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">ICTS DEPARTMENT PORTAL</p>
          <span className="date-badge-pill">Account Desk Administration</span>
        </div>
        <div className="header-row">
          <div className="header-title-block">
            <h1 className="header-title">
              Manage campus logins, <span className="title-accent">roles &amp; credentials</span>
            </h1>
            <p className="header-intro">
              Centralized administrative desk for provisioning student roll numbers, faculty IDs,
              and club shared-login access in Amrita Sangam.
            </p>
          </div>
          <div className="view-toggle-pills" style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
            <button
              type="button"
              className={`editorial-filter-pill ${activeTab === 'accounts' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <Users size={14} /> Accounts Desk
            </button>
            <button
              type="button"
              className={`editorial-filter-pill ${activeTab === 'club-logins' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('club-logins')}
            >
              <KeyRound size={14} /> Club Shared Logins
            </button>
          </div>
        </div>
      </header>

      {/* TAB 1: ACCOUNTS DESK */}
      {activeTab === 'accounts' && (
        <div className="account-desk-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 2fr', gap: '1.5rem' }}>
          {/* Creation Form Card */}
          <div className="surface-card create-account-card reveal-card" style={{ padding: '1.75rem', borderRadius: '1rem', background: 'var(--ws-surface-subtle)', border: '1px solid var(--ws-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'var(--ws-accent-faint)', color: 'var(--ws-accent)', display: 'grid', placeItems: 'center' }}>
                <UserPlus size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Provision New Account</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ws-text-muted)', margin: 0 }}>Create Supabase Auth &amp; MongoDB profile</p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Account Track
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="editorial-input"
                  style={{ width: '100%' }}
                >
                  <option value="student">Student (Roll No e.g. BL.SC.U4CSE25204)</option>
                  <option value="faculty_coordinator">Faculty Mentor (ID e.g. FA23CSE001)</option>
                  <option value="college_admin">Administrator / Student Affairs</option>
                </select>
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Anand Kumar or Aarav Nair"
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Official Email / Login ID
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="user@amrita.edu or cb.en.u4cse22001@cb.students.amrita.edu"
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Initial Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
              </div>

              {kind === 'college_admin' && (
                <>
                  <div>
                    <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Admin Type
                    </label>
                    <select
                      value={adminType}
                      onChange={(e) => setAdminType(e.target.value)}
                      className="editorial-input"
                      style={{ width: '100%' }}
                    >
                      <option value="student_affairs">Student Affairs Directorate</option>
                      <option value="principal">Campus Principal</option>
                      <option value="other_authority">Other University Authority</option>
                    </select>
                  </div>
                  {adminType === 'other_authority' && (
                    <div>
                      <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Authority Designation
                      </label>
                      <select name="designation" required className="editorial-input" style={{ width: '100%' }}>
                        <option value="">Select Designation</option>
                        {authorityDesignations.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {kind !== 'college_admin' && (
                <>
                  <div>
                    <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Academic Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => {
                        const next = e.target.value;
                        setDepartment(next);
                        setSection(accountDepartments[next]?.sections?.[0] || 'A');
                      }}
                      className="editorial-input"
                      style={{ width: '100%' }}
                    >
                      {departmentOptions.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Joining Year
                    </label>
                    <select name="joiningYear" defaultValue={currentYear} className="editorial-input" style={{ width: '100%' }}>
                      {joiningYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {kind === 'student' && (
                <div>
                  <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="editorial-input"
                    style={{ width: '100%' }}
                  >
                    {departmentSections.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--ws-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Roll number will be generated sequentially in this section.
                  </small>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="action-pill-primary"
                style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
              >
                {busy ? 'Provisioning...' : 'Provision Account'} <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Directory & Management List Card */}
          <div className="surface-card account-directory-card reveal-card" style={{ padding: '1.75rem', borderRadius: '1rem', background: 'var(--ws-surface-subtle)', border: '1px solid var(--ws-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Registered Accounts</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ws-text-muted)', margin: 0 }}>{filteredPeople.length} campus accounts found</p>
              </div>

              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['all', 'student', 'faculty', 'admin'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`editorial-filter-pill ${filter === f ? 'is-active' : ''}`}
                    style={{ textTransform: 'capitalize', padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ws-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, email, roll number, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="editorial-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Account rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '550px', overflowY: 'auto' }}>
              {filteredPeople.map((person) => {
                const idVal = person.registerNumber || person.rollNumber || person.facultyId || '';
                const roleLabel =
                  person.role === 'student' || person.role === 'STUDENT'
                    ? 'Student'
                    : person.role === 'faculty_coordinator' || person.role === 'FACULTY'
                    ? 'Faculty'
                    : person.adminType === 'student_affairs'
                    ? 'Student Affairs'
                    : person.adminType || 'Admin';

                return (
                  <div
                    key={person._id || person.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.75rem',
                      background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))',
                      border: '1px solid var(--ws-border-subtle)',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--ws-text-bright)' }}>{person.name || person.fullName}</strong>
                        <span className="editorial-role-chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                          {roleLabel}
                        </span>
                        {idVal && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--ws-accent)', fontWeight: 600 }}>
                            {idVal}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ws-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {person.email}
                        {person.department && ` · Dept: ${person.department}`}
                        {person.designation && ` · ${person.designation}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setEditingPerson(person)}
                        className="subtle-btn"
                        title="Edit account details"
                        style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid var(--ws-border-subtle)', background: 'transparent' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(person)}
                        className="subtle-btn"
                        title="Delete account"
                        style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid var(--ws-border-subtle)', color: 'var(--ws-danger, #e53e3e)', background: 'transparent' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!filteredPeople.length && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ws-text-muted)' }}>
                  <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No accounts found matching your query</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLUB SHARED LOGINS */}
      {activeTab === 'club-logins' && (
        <div className="account-desk-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 2fr', gap: '1.5rem' }}>
          {/* Request Change Card */}
          <div className="surface-card credential-req-card reveal-card" style={{ padding: '1.75rem', borderRadius: '1rem', background: 'var(--ws-surface-subtle)', border: '1px solid var(--ws-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'var(--ws-accent-faint)', color: 'var(--ws-accent)', display: 'grid', placeItems: 'center' }}>
                <KeyRound size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Request Club Login Change</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ws-text-muted)', margin: 0 }}>Subject to Student Affairs sign-off</p>
              </div>
            </div>

            <form onSubmit={handleRequestClubCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Club
                </label>
                <select name="clubId" required className="editorial-input" style={{ width: '100%' }}>
                  <option value="">Select a Club</option>
                  {credentialClubs.map((club) => (
                    <option key={club._id || club.id} value={club._id || club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  New Shared Login Email
                </label>
                <input
                  name="clubLoginEmail"
                  type="email"
                  placeholder="e.g. acm.club@cb.amrita.edu"
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--ws-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Leave blank if only updating the shared password.
                </small>
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  New Shared Password
                </label>
                <input
                  name="clubLoginPassword"
                  type="password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--ws-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Leave blank if only updating the shared email.
                </small>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="action-pill-primary"
                style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
              >
                {busy ? 'Submitting...' : 'Submit to Student Affairs'} <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Request History Card */}
          <div className="surface-card credential-history-card reveal-card" style={{ padding: '1.75rem', borderRadius: '1rem', background: 'var(--ws-surface-subtle)', border: '1px solid var(--ws-border-subtle)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Club Credential Requests &amp; Approvals</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--ws-text-muted)', margin: 0 }}>
                Pending and historical credential changes. Once approved by Student Affairs, click Apply to activate in Supabase.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
              {credentialRequests.map((req) => {
                const status = (req.status || 'pending').toLowerCase();
                const statusColor =
                  status === 'approved'
                    ? 'var(--ws-success, #38a169)'
                    : status === 'rejected'
                    ? 'var(--ws-danger, #e53e3e)'
                    : 'var(--ws-accent, #3182ce)';

                return (
                  <div
                    key={req._id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: 'var(--ws-surface-raised, rgba(255,255,255,0.03))',
                      border: '1px solid var(--ws-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--ws-text-bright)' }}>
                        {req.clubId?.name || 'Club Account'}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '1rem',
                          background: `${statusColor}22`,
                          color: statusColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--ws-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div>Requested by: <strong>{req.requestedBy?.name || req.requestedBy?.email || 'ICTS'}</strong></div>
                      <div>Login Email: <strong>{req.clubLoginEmail || 'Unchanged'}</strong></div>
                      <div>Password change: <strong>{req.passwordChangeRequested ? 'Requested' : 'Unchanged'}</strong></div>
                      {req.rejectionFeedback && (
                        <div style={{ color: 'var(--ws-danger, #e53e3e)' }}>Feedback: {req.rejectionFeedback}</div>
                      )}
                    </div>

                    {status === 'approved' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleApplyClubCredentials(req)}
                          className="action-pill-primary"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                        >
                          <CheckCircle2 size={13} /> Apply Approved Credentials
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {!credentialRequests.length && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ws-text-muted)' }}>
                  <KeyRound size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No club credential requests on record</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingPerson && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setEditingPerson(null)}
        >
          <div
            className="surface-card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              borderRadius: '1rem',
              background: 'var(--ws-surface-subtle, #1a1a1a)',
              border: '1px solid var(--ws-border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="eyebrow" style={{ fontSize: '0.72rem', color: 'var(--ws-accent)', fontWeight: 600 }}>
                  ICTS ACCOUNT DESK
                </span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Edit Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPerson(null)}
                className="subtle-btn"
                style={{ padding: '0.4rem', borderRadius: '0.4rem', border: 'none', background: 'transparent' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  name="name"
                  defaultValue={editingPerson.name || editingPerson.fullName}
                  required
                  maxLength={100}
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email / Login ID
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingPerson.email}
                  required
                  className="editorial-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="subtle-btn"
                  style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--ws-border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="action-pill-primary"
                  style={{ padding: '0.45rem 1.25rem' }}
                >
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
