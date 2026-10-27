import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export const CLOSURE_REPORT_OPTIONS = {
  promotion: ['LinkedIn Page/URL', 'Link to photos and videos', 'Campus Digital Signage', 'Department Broadcast'],
  eventCategory: ['Flagship', 'Independent', 'Club Collaboration', 'Coordinated with another event'],
  programType: [
    'Level 1: Expert Talks',
    'Level 1: Mentoring Sessions',
    'Level 1: Performances',
    'Level 2: Workshop',
    'Level 2: Seminar',
    'Level 2: Conference',
    'Level 3: Exhibitions & Demos',
    'Level 3: Competitions',
    'Level 3: Visits to external locations',
    'Level 4: Cultural Fest',
    'Level 4: Challenges',
    'Level 4: Hackathons',
  ],
  programTheme: [
    'Literary & Communication',
    'Cultural & Arts',
    'Social & Community Engagement',
    'Leadership & Management',
    'Celebrations & Recreation',
    'Film, Media & Content',
    'Wellness, Ethics & Life Skills',
    'Sports and Fitness',
    'Commemorative Days and Events',
  ],
  sdgAlignment: [
    'SDG 1 — No Poverty',
    'SDG 2 — Zero Hunger',
    'SDG 3 — Good Health and Well-being',
    'SDG 4 — Quality Education',
    'SDG 5 — Gender Equality',
    'SDG 6 — Clean Water and Sanitation',
    'SDG 7 — Affordable and Clean Energy',
    'SDG 8 — Decent Work and Economic Growth',
    'SDG 9 — Industry, Innovation and Infrastructure',
    'SDG 10 — Reduced Inequalities',
    'SDG 11 — Sustainable Cities and Communities',
    'SDG 12 — Responsible Consumption and Production',
    'SDG 13 — Climate Action',
    'SDG 14 — Life Below Water',
    'SDG 15 — Life on Land',
    'SDG 16 — Peace, Justice and Strong Institutions',
    'SDG 17 — Partnerships for the Goals',
  ],
  sessionMode: ['Offline', 'Online', 'Hybrid'],
  resourcePerson: ['External', 'Internal', 'Alumni'],
};

export const COMPLETION_REPORT_FIELDS = [
  ['duration', 'Duration of the activity (hours/days)', 'text'],
  ['startDate', 'Start date', 'date'],
  ['endDate', 'End date', 'date'],
  ['expenditure', 'Expenditure (figures & words)', 'text'],
  ['resourcePersonDetails', 'Resource person details', 'textarea'],
  ['discussionHighlights', 'Discussion highlights of resource person & institutional leadership', 'textarea'],
  ['objectiveAchieved', 'Program objective achieved', 'textarea'],
  ['skillsAcquired', 'Skills acquired by student participants', 'textarea'],
  ['detailedReport', 'Detailed report (maximum 1000 words)', 'textarea'],
  ['impactAnalysis', 'Impact analysis & outcomes', 'textarea'],
];

export const REPORT_IMAGE_FIELDS = [
  ['brochure', 'Brochure / Flyer Poster'],
  ['photograph1', 'Photograph 1 (Inauguration / Stage)'],
  ['photograph2', 'Photograph 2 (Session / Audience)'],
  ['photograph3', 'Photograph 3 (Interactive / Hands-on)'],
  ['photograph4', 'Photograph 4 (Valedictory / Memento)'],
];

export function RejectionFeedbackDialog({ kind = 'request', onClose, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please provide specific feedback for why this was declined.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit(feedback.trim());
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="dialog-header">
          <div className="header-badge warning-badge">Review Action</div>
          <h2>Provide Rejection Feedback</h2>
          <p className="dialog-subtitle">
            Explain to the applicant or club coordinator what revisions are required.
          </p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="reject-feedback">
              Reviewer Notes / Actionable Feedback <span className="required-mark">*</span>
            </label>
            <textarea
              id="reject-feedback"
              className="text-input"
              rows={4}
              required
              placeholder="e.g., Please attach the verified invoice breakdown from the finance desk before resubmitting."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="primary-action-button danger-button" disabled={busy}>
              {busy ? 'Submitting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ApplyMembershipModal({ clubs = [], selectedClub, onClose, onSubmit }) {
  const [clubId, setClubId] = useState(selectedClub?._id || selectedClub?.id || clubs[0]?._id || clubs[0]?.id || '');
  const [domain, setDomain] = useState('General');
  const [yearOfStudy, setYearOfStudy] = useState('2nd Year');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [reason, setReason] = useState('');
  const [position, setPosition] = useState('member');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        clubId,
        domain,
        yearOfStudy,
        applicantPhone,
        reason,
        position,
      });
      toast.success('Your membership application has been submitted!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="dialog-header">
          <div className="header-badge">Student Induction</div>
          <h2>Apply for Club Membership</h2>
          <p className="dialog-subtitle">
            Join a vibrant campus community, collaborate on projects, and build experiences.
          </p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="app-club">Target Club</label>
            <select
              id="app-club"
              className="text-input"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
            >
              {clubs.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} ({c.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="app-year">Current Year of Study</label>
              <select
                id="app-year"
                className="text-input"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              >
                <option value="1st Year">1st Year (B.Tech / Int. M.Sc)</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate (M.Tech / MBA)</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="app-role">Applying For</label>
              <select
                id="app-role"
                className="text-input"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="member">General Member</option>
                <option value="executive">Executive Team Consideration</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="app-domain">Preferred Domain / Wing</label>
              <input
                id="app-domain"
                type="text"
                className="text-input"
                placeholder="e.g., Cloud & AI, Design, Operations, Content"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="app-phone">Contact Phone</label>
              <input
                id="app-phone"
                type="tel"
                className="text-input"
                placeholder="+91 98401 23456"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="app-reason">
              Statement of Purpose / Why do you want to join?
            </label>
            <textarea
              id="app-reason"
              className="text-input"
              rows={3}
              placeholder="Highlight your background, relevant projects, and what you aim to achieve in this club..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Submitting Application...' : 'Send Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TechnicalEventProposalModal({ clubs = [], onClose, onSubmit }) {
  const [clubId, setClubId] = useState(clubs[0]?._id || clubs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('technical');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('Central Auditorium');
  const [quarter, setQuarter] = useState('Q2 (Oct-Dec)');
  const [programDrivenBy, setProgramDrivenBy] = useState('Self-driven');
  const [programLevel, setProgramLevel] = useState('Level 2: Workshop / Seminar');
  const [programTheme, setProgramTheme] = useState('Leadership & Management');
  const [sessionMode, setSessionMode] = useState('Offline');
  const [presidingOfficial, setPresidingOfficial] = useState('');
  const [resourcePersonType, setResourcePersonType] = useState('External');
  const [resourcePersonDetails, setResourcePersonDetails] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('15000');
  const [budgetInWords, setBudgetInWords] = useState('INR Fifteen Thousand Only');
  const [durationHours, setDurationHours] = useState('4');
  const [internalParticipants, setInternalParticipants] = useState('100');
  const [externalParticipants, setExternalParticipants] = useState('0');
  const [programDescription, setProgramDescription] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [selectedSdgs, setSelectedSdgs] = useState(['SDG 4 — Quality Education', 'SDG 9 — Industry, Innovation and Infrastructure']);
  const [selectedPos, setSelectedPos] = useState(['PO1', 'PO2', 'PO3', 'PO5']);
  const [busy, setBusy] = useState(false);

  const toggleSdg = (sdg) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdg) ? prev.filter((s) => s !== sdg) : [...prev, sdg]
    );
  };

  const togglePo = (po) => {
    setSelectedPos((prev) =>
      prev.includes(po) ? prev.filter((p) => p !== po) : [...prev, po]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        clubId,
        title,
        eventType,
        eventDate,
        endDate: endDate || eventDate,
        venue,
        description: programDescription,
        technicalDetails: {
          quarter,
          programDrivenBy,
          programLevel,
          programTheme,
          sessionMode,
          presidingOfficial,
          resourcePersonType,
          resourcePersonDetails,
          estimatedBudget: Number(estimatedBudget),
          budgetInWords,
          durationHours: Number(durationHours),
          internalParticipants: Number(internalParticipants),
          externalParticipants: Number(externalParticipants),
          programDescription,
          impactAnalysis,
          sdgGoals: selectedSdgs,
          programOutcomes: selectedPos,
        },
      });
      toast.success('Technical event proposal submitted for Mentor Review!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit proposal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="dialog-header">
          <div className="header-badge">Formal Club Proposal</div>
          <h2>Propose Technical Campus Event</h2>
          <p className="dialog-subtitle">
            Submit a structured event proposal aligned with SDG targets and institutional program outcomes.
          </p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-club">Host Club</label>
              <select id="prop-club" className="text-input" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                {clubs.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-type">Event Category</label>
              <select id="prop-type" className="text-input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="technical">Technical Event / Workshop / Hackathon</option>
                <option value="non_technical">Non-Technical / Cultural / Social</option>
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="prop-title">Event Title</label>
            <input
              id="prop-title"
              type="text"
              className="text-input"
              placeholder="e.g., Azure Cloud National Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-3col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-date">Start Date & Time</label>
              <input id="prop-date" type="datetime-local" className="text-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-end">End Date & Time</label>
              <input id="prop-end" type="datetime-local" className="text-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-venue">Proposed Venue</label>
              <input id="prop-venue" type="text" className="text-input" value={venue} onChange={(e) => setVenue(e.target.value)} required />
            </div>
          </div>

          <div className="form-section-divider">
            <span>Academic Alignment & Specifications</span>
          </div>

          <div className="form-row-3col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-qtr">Quarter</label>
              <select id="prop-qtr" className="text-input" value={quarter} onChange={(e) => setQuarter(e.target.value)}>
                <option value="Q1 (Jul-Sep)">Q1 (Jul-Sep)</option>
                <option value="Q2 (Oct-Dec)">Q2 (Oct-Dec)</option>
                <option value="Q3 (Jan-Mar)">Q3 (Jan-Mar)</option>
                <option value="Q4 (Apr-Jun)">Q4 (Apr-Jun)</option>
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-driven">Program Driven By</label>
              <select id="prop-driven" className="text-input" value={programDrivenBy} onChange={(e) => setProgramDrivenBy(e.target.value)}>
                <option value="Self-driven">Self-driven</option>
                <option value="IIC">IIC</option>
                <option value="MIC">MIC</option>
                <option value="Ministry">Ministry</option>
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-level">Program Level</label>
              <select id="prop-level" className="text-input" value={programLevel} onChange={(e) => setProgramLevel(e.target.value)}>
                <option value="Level 1: Talks / Mentoring">Level 1: Talks / Mentoring</option>
                <option value="Level 2: Workshop / Seminar">Level 2: Workshop / Seminar</option>
                <option value="Level 3: Competitions / Demos">Level 3: Competitions / Demos</option>
                <option value="Level 4: Hackathon / Fest">Level 4: Hackathon / Fest</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-theme">Program Theme</label>
              <select id="prop-theme" className="text-input" value={programTheme} onChange={(e) => setProgramTheme(e.target.value)}>
                {CLOSURE_REPORT_OPTIONS.programTheme.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-mode">Session Mode</label>
              <select id="prop-mode" className="text-input" value={sessionMode} onChange={(e) => setSessionMode(e.target.value)}>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-res-type">Resource Person Type</label>
              <select id="prop-res-type" className="text-input" value={resourcePersonType} onChange={(e) => setResourcePersonType(e.target.value)}>
                <option value="External">External Speaker / Expert</option>
                <option value="Internal">Internal Faculty / Student</option>
                <option value="Alumni">Campus Alumni Network</option>
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-official">Presiding Official</label>
              <input id="prop-official" type="text" className="text-input" placeholder="e.g., Dean, School of Computing" value={presidingOfficial} onChange={(e) => setPresidingOfficial(e.target.value)} />
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="prop-res-details">Resource Person / Speaker Details</label>
            <textarea id="prop-res-details" className="text-input" rows={2} placeholder="Name, designation, organization, and brief profile..." value={resourcePersonDetails} onChange={(e) => setResourcePersonDetails(e.target.value)} />
          </div>

          <div className="form-row-3col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-budget">Estimated Budget (INR)</label>
              <input id="prop-budget" type="number" min="0" className="text-input" value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-duration">Duration (Hours)</label>
              <input id="prop-duration" type="number" min="1" className="text-input" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="prop-intexp">Internal / External Audience</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" min="0" placeholder="Internal" className="text-input" value={internalParticipants} onChange={(e) => setInternalParticipants(e.target.value)} />
                <input type="number" min="0" placeholder="External" className="text-input" value={externalParticipants} onChange={(e) => setExternalParticipants(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="prop-budget-words">Budget in Words</label>
            <input id="prop-budget-words" type="text" className="text-input" placeholder="e.g., INR Fifteen Thousand Only" value={budgetInWords} onChange={(e) => setBudgetInWords(e.target.value)} />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="prop-desc">Program Description & Objectives</label>
            <textarea id="prop-desc" className="text-input" rows={3} placeholder="Comprehensive description of the event agenda, topics covered, and targeted student learning..." value={programDescription} onChange={(e) => setProgramDescription(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label">Sustainable Development Goals (SDG Alignment)</label>
            <div className="checkbox-chips-grid">
              {CLOSURE_REPORT_OPTIONS.sdgAlignment.slice(0, 10).map((sdg) => (
                <label key={sdg} className={`chip-checkbox ${selectedSdgs.includes(sdg) ? 'active' : ''}`}>
                  <input type="checkbox" checked={selectedSdgs.includes(sdg)} onChange={() => toggleSdg(sdg)} />
                  {sdg.split('—')[0].trim()}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label">Program Outcomes (PO Mapping)</label>
            <div className="checkbox-chips-grid">
              {['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map((po) => (
                <label key={po} className={`chip-checkbox ${selectedPos.includes(po) ? 'active' : ''}`}>
                  <input type="checkbox" checked={selectedPos.includes(po)} onChange={() => togglePo(po)} />
                  {po}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="prop-impact">Expected Impact Analysis</label>
            <textarea id="prop-impact" className="text-input" rows={2} placeholder="Explain the expected tangible student outcomes, prototype creations, or placement benefits..." value={impactAnalysis} onChange={(e) => setImpactAnalysis(e.target.value)} />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Submitting Proposal...' : 'Submit Event Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EquipmentBorrowModal({ equipment, events = [], onClose, onSubmit }) {
  const [eventId, setEventId] = useState(events[0]?._id || events[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        equipmentId: equipment?._id || equipment?.id,
        eventId,
        dueDate,
        purpose,
      });
      toast.success('Equipment loan request submitted to Mentor!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit loan request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="dialog-header">
          <div className="header-badge">Resource Requisition</div>
          <h2>Request Equipment Loan</h2>
          <p className="dialog-subtitle">
            Borrow <strong>{equipment?.name}</strong> for an approved campus event or club initiative.
          </p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="brw-event">Linked Campus Event</label>
            <select id="brw-event" className="text-input" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
              {events.map((evt) => (
                <option key={evt._id || evt.id} value={evt._id || evt.id}>{evt.title || evt.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="brw-due">Expected Return Date</label>
            <input id="brw-due" type="date" className="text-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="brw-purpose">Usage Purpose & Safe Handling Plan</label>
            <textarea id="brw-purpose" className="text-input" rows={3} placeholder="Explain how this equipment will be utilized and where it will be stored during the event..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Sending Request...' : 'Send Loan Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddEquipmentModal({ clubs = [], onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState(clubs[0]?._id || clubs[0]?.id || '');
  const [condition, setCondition] = useState('Excellent');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        name,
        description,
        clubId,
        condition,
        totalQuantity: Number(totalQuantity),
      });
      toast.success('Equipment item added to inventory!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to add equipment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="dialog-header">
          <div className="header-badge">Inventory Management</div>
          <h2>Add New Equipment Item</h2>
          <p className="dialog-subtitle">Record newly procured or club-allocated gear available for student events.</p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="eq-name">Item Name</label>
            <input id="eq-name" type="text" className="text-input" placeholder="e.g., Sennheiser Wireless Handheld Mic Kit" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="eq-club">Managing Club / Desk</label>
              <select id="eq-club" className="text-input" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                {clubs.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="eq-qty">Total Quantity</label>
              <input id="eq-qty" type="number" min="1" className="text-input" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} required />
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="eq-condition">Physical Condition</label>
            <select id="eq-condition" className="text-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="Excellent">Excellent (New / Mint)</option>
              <option value="Good">Good (Operational)</option>
              <option value="Fair">Fair (Operational with cosmetic wear)</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="eq-desc">Description & Specifications</label>
            <textarea id="eq-desc" className="text-input" rows={3} placeholder="Model number, connection interfaces, included cables or adapters..." value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Registering Gear...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FundingRequestModal({ clubs = [], events = [], onClose, onSubmit }) {
  const [clubId, setClubId] = useState(clubs[0]?._id || clubs[0]?.id || '');
  const [eventId, setEventId] = useState(events[0]?._id || events[0]?.id || '');
  const [requestedAmount, setRequestedAmount] = useState('25000');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        clubId,
        eventId: eventId || null,
        requestedAmount: Number(requestedAmount),
        purpose,
      });
      toast.success('Funding request submitted for Mentor Review!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit funding request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="dialog-header">
          <div className="header-badge">Financial Grant</div>
          <h2>Submit Funding Request</h2>
          <p className="dialog-subtitle">Request university budget allocation for approved club activities and event logistics.</p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="fnd-club">Club</label>
              <select id="fnd-club" className="text-input" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                {clubs.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="fnd-event">Linked Event (Optional)</label>
              <select id="fnd-event" className="text-input" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                <option value="">General Club Budget</option>
                {events.map((e) => (
                  <option key={e._id || e.id} value={e._id || e.id}>{e.title || e.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="fnd-amt">Amount Requested (INR)</label>
            <input id="fnd-amt" type="number" min="500" step="100" className="text-input" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="fnd-purpose">Expense Itemization & Justification</label>
            <textarea id="fnd-purpose" className="text-input" rows={4} placeholder="Detail item-wise costs: Speaker honorarium, participant refreshments, trophies, stationery..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Submitting Request...' : 'Send Funding Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateEventReportModal({ clubs = [], events = [], onClose, onSubmit }) {
  const [eventId, setEventId] = useState(events[0]?._id || events[0]?.id || '');
  const [summary, setSummary] = useState('');
  const [activities, setActivities] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [issues, setIssues] = useState('');
  const [budgetSpent, setBudgetSpent] = useState('12500');
  const [attendeeCount, setAttendeeCount] = useState('85');
  const [internalCount, setInternalCount] = useState('75');
  const [externalCount, setExternalCount] = useState('10');
  const [selectedCategory, setSelectedCategory] = useState('Flagship');
  const [selectedType, setSelectedType] = useState('Level 2: Workshop');
  const [selectedSdgs, setSelectedSdgs] = useState(['SDG 4 — Quality Education', 'SDG 9 — Industry, Innovation and Infrastructure']);
  const [detailedReport, setDetailedReport] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleSdg = (sdg) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdg) ? prev.filter((s) => s !== sdg) : [...prev, sdg]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const selectedEvt = events.find((item) => (item._id || item.id) === eventId);
    try {
      await onSubmit({
        eventId,
        eventTitle: selectedEvt?.title || 'Campus Event',
        clubId: selectedEvt?.clubId?._id || selectedEvt?.clubId || clubs[0]?._id || clubs[0]?.id,
        summary,
        activities,
        outcomes,
        issues,
        budgetSpent: Number(budgetSpent),
        attendeeCount: Number(attendeeCount),
        reportDetails: {
          eventCategory: { selected: [selectedCategory], remark: '' },
          programType: { selected: [selectedType], remark: '' },
          sdgAlignment: { selected: selectedSdgs, remark: '' },
          participants: { selected: ['internal', 'external'], internalCount, externalCount, remark: 'Verified via gate scanner.' },
          activityCompletion: {
            detailedReport: { value: detailedReport, remark: '' },
            impactAnalysis: { value: impactAnalysis, remark: '' },
            expenditure: { value: `INR ${budgetSpent}`, remark: 'Settled with Finance Desk' },
          },
        },
      });
      toast.success('Event completion report submitted for review!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="dialog-header">
          <div className="header-badge">Post-Event Closure</div>
          <h2>Create Event Completion Report</h2>
          <p className="dialog-subtitle">Submit final activity documentation and download student OD rosters upon approval.</p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-event">Concluded Event</label>
            <select id="rep-event" className="text-input" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
              {events.map((e) => (
                <option key={e._id || e.id} value={e._id || e.id}>{e.title || e.name} ({e.club || 'Club'})</option>
              ))}
            </select>
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="rep-category">Event Category</label>
              <select id="rep-category" className="text-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {CLOSURE_REPORT_OPTIONS.eventCategory.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="rep-type">Program Type</label>
              <select id="rep-type" className="text-input" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {CLOSURE_REPORT_OPTIONS.programType.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="rep-attendees">Total Attendees</label>
              <input id="rep-attendees" type="number" min="1" className="text-input" value={attendeeCount} onChange={(e) => setAttendeeCount(e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="rep-internal">Internal Count</label>
              <input id="rep-internal" type="number" min="0" className="text-input" value={internalCount} onChange={(e) => setInternalCount(e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="rep-spent">Actual Budget Spent (INR)</label>
              <input id="rep-spent" type="number" min="0" className="text-input" value={budgetSpent} onChange={(e) => setBudgetSpent(e.target.value)} required />
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-summary">Executive Summary</label>
            <textarea id="rep-summary" className="text-input" rows={2} placeholder="Concise overview of what took place..." value={summary} onChange={(e) => setSummary(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-act">Conducted Activities</label>
            <textarea id="rep-act" className="text-input" rows={2} placeholder="Step-by-step itinerary, workshops, demonstrations..." value={activities} onChange={(e) => setActivities(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-outcomes">Tangible Outcomes Achieved</label>
            <textarea id="rep-outcomes" className="text-input" rows={2} placeholder="Skills acquired, prototypes delivered, certifications granted..." value={outcomes} onChange={(e) => setOutcomes(e.target.value)} required />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-issues">Challenges & Learnings (Optional)</label>
            <textarea id="rep-issues" className="text-input" rows={2} placeholder="Logistical hiccups, bandwidth limits, venue constraints..." value={issues} onChange={(e) => setIssues(e.target.value)} />
          </div>

          <div className="form-field-group">
            <label className="field-label">Sustainable Development Goals (SDG Alignment)</label>
            <div className="checkbox-chips-grid">
              {CLOSURE_REPORT_OPTIONS.sdgAlignment.slice(0, 10).map((sdg) => (
                <label key={sdg} className={`chip-checkbox ${selectedSdgs.includes(sdg) ? 'active' : ''}`}>
                  <input type="checkbox" checked={selectedSdgs.includes(sdg)} onChange={() => toggleSdg(sdg)} />
                  {sdg.split('—')[0].trim()}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-detailed">Detailed Activity Narrative (Up to 1000 words)</label>
            <textarea id="rep-detailed" className="text-input" rows={4} placeholder="Full narrative record for institutional NAAC / NBA audit archives..." value={detailedReport} onChange={(e) => setDetailedReport(e.target.value)} />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="rep-impact">Impact Analysis & Long-term Benefits</label>
            <textarea id="rep-impact" className="text-input" rows={2} placeholder="Post-event follow-ups, hackathon incubations, student feedback..." value={impactAnalysis} onChange={(e) => setImpactAnalysis(e.target.value)} />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Submitting Report...' : 'File Completion Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateAnnouncementModal({ clubs = [], onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [clubName, setClubName] = useState('Office of Student Affairs');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        title,
        content,
        priority,
        clubName,
      });
      toast.success('Campus announcement published!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to post announcement');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="dialog-header">
          <div className="header-badge">Campus Bulletin</div>
          <h2>Post New Announcement</h2>
          <p className="dialog-subtitle">Broadcast news, registration dates, or policy updates across the student directory.</p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="ann-title">Headline</label>
            <input id="ann-title" type="text" className="text-input" placeholder="e.g., Kalotsav 2026 Stage Schedule Published" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-row-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="ann-club">Publishing Authority</label>
              <input id="ann-club" type="text" className="text-input" value={clubName} onChange={(e) => setClubName(e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="field-label" htmlFor="ann-priority">Priority Level</label>
              <select id="ann-priority" className="text-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normal (Standard notice)</option>
                <option value="high">Important (Crimson alert badge)</option>
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="ann-content">Notice Content</label>
            <textarea id="ann-content" className="text-input" rows={4} placeholder="Full message text, instructions, and deadlines..." value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClubVerificationModal({ clubs = [], onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch('/auth/club-login', {
        method: 'POST',
        body: { email: email.trim(), password },
      });
      toast.success('Club shared credentials verified! Office bearer management unlocked.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Incorrect club email or password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="registration-dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="registration-dialog-panel glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="dialog-header">
          <div className="header-badge">2-Stage Verification</div>
          <h2>Verify Club Access</h2>
          <p className="dialog-subtitle">
            Sign in with your club's shared credentials to unlock proposal submissions, equipment &amp; funding requests, and completion reports.
          </p>
          <button type="button" className="dialog-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-body-flow">
          <div className="form-field-group">
            <label className="field-label" htmlFor="club-verify-email">Club Shared Email</label>
            <input
              id="club-verify-email"
              type="email"
              className="text-input"
              placeholder="e.g. acm@cb.amrita.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label className="field-label" htmlFor="club-verify-pwd">Club Shared Password</label>
            <input
              id="club-verify-pwd"
              type="password"
              className="text-input"
              placeholder="Enter shared club password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="secondary-action-button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="primary-action-button" disabled={busy}>
              {busy ? 'Verifying...' : 'Verify & Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

