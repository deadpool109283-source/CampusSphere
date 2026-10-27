import {
  Download,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiDownload } from '../../lib/api';

export default function ReportsView({
  summary = {},
  role = 'STUDENT',
  track = 'student',
  profile = null,
}) {
  const [downloading, setDownloading] = useState(false);
  const isStudentAffairs = role === 'ADMIN' || track === 'student-affairs';
  const isVerifiedOb = track === 'verified-office-bearer' || Boolean(profile?.verifiedClubId);
  const canAccessReports = isStudentAffairs || isVerifiedOb || role === 'FACULTY' || track === 'mentor';

  const defaultReports = [
    {
      _id: 'club-msft',
      name: 'Microsoft Student Community',
      category: 'Technology',
      members: 142,
      events: 7,
      reportsSubmitted: 6,
      announcements: 8,
      allocated: 95000,
      spent: 68400,
    },
    {
      _id: 'club-code',
      name: 'Coding Club Amrita',
      category: 'Technology',
      members: 98,
      events: 9,
      reportsSubmitted: 8,
      announcements: 11,
      allocated: 75000,
      spent: 54200,
    },
    {
      _id: 'club-design',
      name: 'Design & Media Guild',
      category: 'Design & Arts',
      members: 65,
      events: 5,
      reportsSubmitted: 3,
      announcements: 4,
      allocated: 50000,
      spent: 31500,
    },
    {
      _id: 'club-robotics',
      name: 'Robotics & Automation Society',
      category: 'Engineering',
      members: 74,
      events: 4,
      reportsSubmitted: 3,
      announcements: 6,
      allocated: 80000,
      spent: 52000,
    },
  ];

  const allReports = summary.clubReports && summary.clubReports.length > 0 ? summary.clubReports : defaultReports;
  const clubReports = (isVerifiedOb && !isStudentAffairs && profile?.verifiedClubId)
    ? allReports.filter((c) => String(c._id) === String(profile.verifiedClubId) || c.name === profile.verifiedClubName || c.name === profile.clubName)
    : allReports;

  const handleExportCsv = async () => {
    setDownloading(true);
    try {
      await apiDownload('/reports/clubs/export', 'campus-club-analytics-report.csv');
      toast.success('Campus club analytics report downloaded as CSV!');
    } catch (err) {
      toast.error(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (!canAccessReports) {
    return (
      <div className="workspace-stack">
        <header className="workspace-editorial-header reveal-card">
          <div className="header-meta">
            <p className="eyebrow">Institutional Analytics &amp; NAAC Metrics</p>
          </div>
          <div className="header-title-row">
            <h1>
              Campus Analytics &amp; <em>Club Performance.</em>
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
            Directorate &amp; Leadership Analytics Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Institutional club performance audits, directorate metrics, and fiscal compliance summaries are restricted exclusively to chartered club presidents, faculty mentors, and Student Affairs directors.
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
          <p className="eyebrow">Institutional Analytics &amp; NAAC Metrics</p>
        </div>
        <div className="header-title-row">
          <h1>
            Campus Analytics &amp; <em>Club Performance.</em>
          </h1>
          <p className="header-subtitle">
            Executive oversight into club health, student engagement volumes, activity frequencies, and fiscal compliance.
          </p>
        </div>
        <div className="header-action-group" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="primary-action-button"
            onClick={handleExportCsv}
            disabled={downloading}
          >
            <Download size={16} /> {downloading ? 'Preparing CSV...' : 'Export Analytics CSV'}
          </button>
        </div>
      </header>

      {/* KPI Summary Cards */}
      <div className="metrics-strip reveal-card">
        <div className="metric-card">
          <p className="metric-label">CLUB COMMUNITIES</p>
          <div className="metric-value-row">
            <span className="metric-value">{summary.clubs || clubReports.length}</span>
          </div>
          <p className="metric-foot">Official chartered organizations</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">ACTIVE MEMBERS</p>
          <div className="metric-value-row">
            <span className="metric-value">{summary.members || 379}</span>
          </div>
          <p className="metric-foot">Inducted campus students</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">EVENTS CONDUCTED</p>
          <div className="metric-value-row">
            <span className="metric-value">{summary.events || 25}</span>
          </div>
          <p className="metric-foot">In current academic year</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">REPORTS AUDITED</p>
          <div className="metric-value-row">
            <span className="metric-value">{summary.reportsSubmitted || 20}</span>
          </div>
          <p className="metric-foot">With OD attendance records</p>
        </div>
      </div>

      {/* Club Activity & Budget Table */}
      <section className="bento-card reveal-card">
        <div className="bento-card-header">
          <div className="bento-icon-wrap" style={{ background: 'var(--glass-surface-warm)', color: 'var(--crimson)' }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <p className="bento-label">Performance Breakdown</p>
            <h3>Club Operational Summary</h3>
          </div>
        </div>

        <div className="roster-table-wrap" style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule-subtle)', color: 'var(--muted)', fontSize: 11, letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>COMMUNITY</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>MEMBERS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>EVENTS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>REPORTS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>UPDATES</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>BUDGET SPENT</th>
              </tr>
            </thead>
            <tbody>
              {clubReports.map((c) => {
                const spent = Number(c.spent || 0);
                const allocated = Number(c.allocated || 1);
                const pct = Math.min(Math.round((spent / allocated) * 100), 100);

                return (
                  <tr key={c._id || c.name} style={{ borderBottom: '1px solid var(--rule-subtle)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>{c.name}</strong>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.category || 'Technical'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.members}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.events}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.reportsSubmitted || 0}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{c.announcements || 0} updates</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          ₹{spent.toLocaleString('en-IN')}{' '}
                          <small style={{ color: 'var(--muted)', fontWeight: 400 }}>of ₹{allocated.toLocaleString('en-IN')}</small>
                        </span>
                        <div style={{ width: 120, height: 6, borderRadius: 999, background: 'rgba(32,29,27,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--crimson)', borderRadius: 999 }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'var(--glass-surface-warm)', border: '1px solid var(--rule-subtle)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-secondary)' }}>
          <ShieldCheck size={18} style={{ color: 'var(--emerald)' }} />
          <span>Financial allocations and event completion metrics are audited periodically by the Directorate of Student Affairs.</span>
        </div>
      </section>
    </div>
  );
}
