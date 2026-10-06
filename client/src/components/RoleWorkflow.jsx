import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '../auth/useSession';
import { readWorkflowPreview } from '../lib/workflowPreview';
import '../styles/workflow.css';

const STORAGE_KEY = 'campussphere-workflow-ui-preview';
const PREVIEW_EVENT_START = new Date(Date.now() - 15 * 60 * 1000).toISOString();
const PREVIEW_EVENT_END = new Date(Date.now() + 45 * 60 * 1000).toISOString();
function createInitialWorkflow() {
  return {
    requests: [
      {
        id: 'request-coding-1',
        clubId: 1,
        clubName: 'Coding Club',
        title: 'Campus Code Jam',
        date: '2026-10-18',
        startTime: '10:00',
        endTime: '16:00',
        venue: 'Innovation Lab',
        description: 'A collaborative coding event for students across departments.',
        president: 'Rohan Verma',
        status: 'MENTOR_REVIEW',
        mentorRemark: '',
        affairsRemark: '',
      },
      {
        id: 'request-robotics-1',
        clubId: 2,
        clubName: 'Robotics Club',
        title: 'Autonomous Bot Showcase',
        date: '2026-10-22',
        startTime: '13:00',
        endTime: '17:00',
        venue: 'Engineering Atrium',
        description: 'A demonstration of student-built autonomous robots.',
        president: 'Rohan Verma',
        status: 'AFFAIRS_REVIEW',
        mentorRemark: 'Mentor approved. Venue and safety plan reviewed.',
        affairsRemark: '',
      },
      {
        id: 'request-coding-approved',
        clubId: 1,
        clubName: 'Coding Club',
        title: 'Git & GitHub Basics',
        date: '2026-10-12',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Lab 3',
        description: 'A hands-on introduction to collaborative version control.',
        president: 'Rohan Verma',
        status: 'APPROVED',
        mentorRemark: 'Approved.',
        affairsRemark: 'Approved for publication.',
      },
    ],
    clubs: [],
    departments: {
      PR: ['Neha Kapoor'],
      'Social Media': ['Aarav Nair'],
      'Event Operations': ['Kiran Rao'],
    },
    publishedEvents: [],
    attendance: {
      clubId: 1,
      clubName: 'Coding Club',
      eventTitle: 'Coding Club evening workshop',
      startAt: PREVIEW_EVENT_START,
      endAt: PREVIEW_EVENT_END,
      cardsCaptured: 0,
      submittedAt: '',
      mentorDecision: '',
      mentorRemark: '',
      studentAffairsStatus: '',
    },
  };
}

function readWorkflow() {
  try {
    return { ...createInitialWorkflow(), ...(readWorkflowPreview() || {}) };
  } catch (error) {
    console.error('Unable to restore CampusSphere workflow preview data:', error);
    return createInitialWorkflow();
  }
}

function updateWorkflow(setWorkflow, update) {
  setWorkflow((current) => update(current));
}

function saveWorkflow(workflow) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
  } catch (error) {
    console.error('Unable to save CampusSphere workflow preview data:', error);
    toast.error('This preview change could not be saved in this browser session.');
  }
}

const statusText = {
  MENTOR_REVIEW: 'Awaiting mentor',
  AFFAIRS_REVIEW: 'Awaiting Student Affairs',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  LIVE: 'Taking attendance',
  CLOSED: 'Attendance closed',
  SUBMITTED: 'Submitted to mentor',
  REVIEWED: 'Mentor reviewed',
  IN_PROGRESS: 'In progress',
  PENDING: 'Awaiting OD review',
  FOLLOW_UP: 'Follow-up requested',
  OD_APPROVED: 'OD approved',
};

function StatusPill({ status }) {
  return <span className={`workflow-status workflow-status-${status.toLowerCase().replaceAll('_', '-')}`}>{statusText[status] || status}</span>;
}

export default function RoleWorkflow({ clubs = [] }) {
  const { session } = useSession();
  const profile = session.profile;
  const role = profile.role;
  const [workflow, setWorkflow] = useState(readWorkflow);
  const [mentorRemarks, setMentorRemarks] = useState({});
  const [affairsRemarks, setAffairsRemarks] = useState({});

  useEffect(() => {
    if (session.preview) saveWorkflow(workflow);
  }, [session.preview, workflow]);

  if (!session.preview) return null;
  if (role === 'CLUB_EXECUTIVE') {
    return (
      <ExecutiveAttendance
        profile={profile}
        workflow={workflow}
        setWorkflow={setWorkflow}
      />
    );
  }
  if (role === 'CLUB_PRESIDENT' || role === 'CLUB_COMMITTEE') {
    return (
      <PresidentDesk
        profile={profile}
        workflow={workflow}
        setWorkflow={setWorkflow}
      />
    );
  }
  if (role === 'FACULTY') {
    const assignedClubNames = profile.clubNames || [];
    const mentorWorkflow = {
      ...workflow,
      requests: workflow.requests.filter((request) => (
        profile.clubIds?.some((id) => String(id) === String(request.clubId))
      )),
      clubs: [],
      publishedEvents: workflow.publishedEvents.filter((event) => assignedClubNames.includes(event.clubName)),
      attendance: assignedClubNames.includes(workflow.attendance.clubName)
        ? workflow.attendance
        : {
          clubId: null,
          clubName: '',
          eventTitle: '',
          cardsCaptured: 0,
          submittedAt: '',
          mentorDecision: '',
          mentorRemark: '',
          studentAffairsStatus: '',
        },
      departments: {},
    };
    return (
      <MentorDesk
        profile={profile}
        workflow={mentorWorkflow}
        setWorkflow={setWorkflow}
        remarks={mentorRemarks}
        setRemarks={setMentorRemarks}
      />
    );
  }
  if (role === 'ADMIN') {
    return (
      <StudentAffairsDesk
        clubs={[...clubs, ...workflow.clubs]}
        workflow={workflow}
        setWorkflow={setWorkflow}
        remarks={affairsRemarks}
        setRemarks={setAffairsRemarks}
      />
    );
  }
  return null;
}

function ExecutiveAttendance({ profile, workflow, setWorkflow }) {
  const attendance = workflow.attendance;
  const [now, setNow] = useState(0);
  const [photoPreview, setPhotoPreview] = useState('');
  const [captureError, setCaptureError] = useState('');
  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);
  const eventIsLive = now >= new Date(attendance.startAt).getTime() && now <= new Date(attendance.endAt).getTime();
  const attendanceClosed = Boolean(attendance.submittedAt || attendance.mentorDecision);
  const eligible = eventIsLive && !attendanceClosed;

  async function captureIdPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !eligible) return;
    setCaptureError('');
    try {
      const preview = await readAttachment(file, 4_000_000);
      setPhotoPreview(preview);
      updateWorkflow(setWorkflow, (current) => ({
        ...current,
        attendance: {
          ...current.attendance,
          cardsCaptured: (current.attendance.cardsCaptured || 0) + 1,
        },
      }));
      toast.success('ID card photo captured in this preview. Identity was not scanned.');
    } catch (error) {
      setCaptureError(error.message || 'The ID card photo could not be opened.');
    }
  }

  return (
    <section className="workflow-panel">
      <WorkflowHeading eyebrow="Executive · event-day desk" title="Capture ID cards." detail={`${profile.clubName} · Registered and on-the-spot attendees can both have their ID-card photos captured during the event.`} />
      <article className="workflow-event-live">
        <div><span className="workflow-kicker">CLUB EVENT</span><h3>{attendance.eventTitle}</h3><p>{formatTime(attendance.startAt)} – {formatTime(attendance.endAt)}</p></div>
        <StatusPill status={attendanceClosed ? (attendance.mentorDecision ? 'REVIEWED' : 'SUBMITTED') : eventIsLive ? 'LIVE' : 'CLOSED'} />
      </article>
      {!eventIsLive && !attendanceClosed && <p className="workflow-inline-note">Attendance opens at the event start time and closes when the event ends.</p>}
      <div className="workflow-camera">
        <div className="workflow-camera-copy">
          <span className="workflow-kicker">ID CARD CAMERA</span>
          <h3>Take a photo of each attendee’s ID card.</h3>
          <p>No student selection or barcode scanning. You can photograph cards for registered or on-the-spot attendees; registration-number scanning will be added when the scanner app is available.</p>
          <label className="primary-button workflow-camera-button" htmlFor="attendance-id-camera" aria-disabled={!eligible}>
            {photoPreview ? 'Capture another ID card' : 'Open camera'}
          </label>
          <input
            id="attendance-id-camera"
            className="workflow-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            disabled={!eligible}
            onChange={captureIdPhoto}
          />
          <span className="workflow-camera-count">{attendance.cardsCaptured || 0} ID card photos captured</span>
        </div>
        {photoPreview ? (
          <figure className="workflow-camera-preview">
            <img src={photoPreview} alt="Most recently captured ID card preview" />
            <figcaption>Temporary preview · not uploaded or saved</figcaption>
          </figure>
        ) : (
          <div className="workflow-camera-placeholder" aria-hidden="true"><span>＋</span><small>Camera preview</small></div>
        )}
      </div>
      {captureError && <p className="workflow-capture-error" role="alert">{captureError}</p>}
      <p className="workflow-inline-note">Photos are held only in this page’s memory. This preview records the number of photos captured, not verified student identities or attendance.</p>
      {attendanceClosed && <p className="workflow-inline-note">Attendance entry is closed. The President submitted the final list to the mentor.</p>}
      <PreviewOnlyNote />
    </section>
  );
}

function PresidentDesk({ profile, workflow, setWorkflow }) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const ownRequests = workflow.requests.filter((request) => request.clubId === profile.clubId);
  const approvedRequests = ownRequests.filter((request) => request.status === 'APPROVED');
  const attendance = workflow.attendance;
  const capturedCardCount = attendance.cardsCaptured || 0;

  function submitRequest(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = {
      id: `request-${Date.now()}`,
      clubId: profile.clubId,
      clubName: profile.clubName,
      title: form.get('title'),
      date: form.get('date'),
      startTime: form.get('startTime'),
      endTime: form.get('endTime'),
      venue: form.get('venue'),
      description: form.get('description'),
      president: profile.fullName,
      status: 'MENTOR_REVIEW',
      mentorRemark: '',
      affairsRemark: '',
    };
    updateWorkflow(setWorkflow, (current) => ({ ...current, requests: [request, ...current.requests] }));
    event.currentTarget.reset();
    setRequestOpen(false);
    toast.success('Event request added to the preview mentor queue.');
  }

  async function publishEvent(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const requestId = form.get('requestId');
    const source = approvedRequests.find((request) => request.id === requestId);
    if (!source) return;
    const poster = form.get('poster');
    const application = form.get('application');
    try {
      const posterDataUrl = poster?.size ? await readAttachment(poster, 1_200_000) : '';
      const applicationDataUrl = application?.size ? await readAttachment(application, 1_000_000) : '';
      updateWorkflow(setWorkflow, (current) => ({
        ...current,
        publishedEvents: [{
          id: `published-${Date.now()}`,
          sourceId: source.id,
          title: source.title,
          clubName: source.clubName,
          date: source.date,
          startTime: source.startTime,
          endTime: source.endTime,
          venue: source.venue,
          posterName: poster?.name || '',
          posterDataUrl,
          applicationName: application?.name || '',
          applicationDataUrl,
        }, ...current.publishedEvents],
      }));
      formElement.reset();
      setPostOpen(false);
      toast.success('Event post created in the UI preview.');
    } catch (error) {
      toast.error(error.message || 'The event attachments could not be added.');
    }
  }

  function submitAttendance() {
    if (!capturedCardCount || attendance.submittedAt) return;
    updateWorkflow(setWorkflow, (current) => ({
      ...current,
      attendance: {
        ...current.attendance,
        submittedAt: new Date().toISOString(),
        mentorDecision: '',
        mentorRemark: '',
        studentAffairsStatus: '',
      },
    }));
    toast.success('ID-card photo count submitted to the mentor in this preview.');
  }

  return (
    <div className="workflow-stack">
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="President · club operations" title="Move your club forward." detail={`${profile.clubName} · Requests, event publishing, attendance hand-off, and team assignments.`} />
        <div className="workflow-action-row">
          <button className="primary-button" type="button" onClick={() => setRequestOpen((open) => !open)}>Request event approval</button>
          <button className="secondary-button" type="button" onClick={() => setPostOpen((open) => !open)} disabled={!approvedRequests.length}>Post an approved event</button>
        </div>
        {requestOpen && (
          <form className="workflow-form workflow-form-grid" onSubmit={submitRequest}>
            <div className="workflow-form-intro"><span className="workflow-kicker">NEW EVENT REQUEST</span><h3>{profile.clubName}</h3><p>Club is filled from your role and cannot be changed here.</p></div>
            <label>Event name<input name="title" required maxLength="120" /></label>
            <label>Date<input type="date" name="date" required /></label>
            <label>Start time<input type="time" name="startTime" required /></label>
            <label>End time<input type="time" name="endTime" required /></label>
            <label>Venue<input name="venue" required maxLength="120" /></label>
            <label className="workflow-field-wide">Description<textarea name="description" required rows="3" maxLength="800" /></label>
            <div className="workflow-field-wide workflow-form-actions"><button className="primary-button" type="submit">Send to mentor</button><button className="secondary-button" type="button" onClick={() => setRequestOpen(false)}>Cancel</button></div>
          </form>
        )}
        {postOpen && (
          <form className="workflow-form workflow-form-grid" onSubmit={publishEvent}>
            <div className="workflow-form-intro"><span className="workflow-kicker">PUBLISH A CAMPUS EVENT</span><h3>Approved event details</h3><p>Choose a fully approved request and attach its poster and application form.</p></div>
            <label className="workflow-field-wide">Approved event
              <select name="requestId" required defaultValue="">
                <option value="" disabled>Select an approved event</option>
                {approvedRequests.map((request) => <option value={request.id} key={request.id}>{request.title} · {request.date}</option>)}
              </select>
            </label>
            <label>Event poster<input type="file" name="poster" accept="image/*" /><small>Image up to 1.2 MB · preview attachment stored in this browser session.</small></label>
            <label>Application form<input type="file" name="application" accept=".pdf,.doc,.docx,.png,.jpg" /><small>Up to 1 MB · preview attachment stored in this browser session.</small></label>
            <div className="workflow-field-wide workflow-form-actions"><button className="primary-button" type="submit">Publish event post</button><button className="secondary-button" type="button" onClick={() => setPostOpen(false)}>Cancel</button></div>
          </form>
        )}
      </section>

      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Approval tracker" title="Your event requests." detail="Mentor review comes first; approved requests then move to Student Affairs." />
        <div className="workflow-request-list">{ownRequests.length ? ownRequests.map((request) => <RequestCard request={request} key={request.id} />) : <WorkflowEmpty>No requests yet. Start with an event approval request.</WorkflowEmpty>}</div>
      </section>

      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Attendance hand-off" title="Review, then submit." detail={`${capturedCardCount} ID-card photos captured for ${attendance.eventTitle}. Executives take photos; the President submits the photo count to the mentor. No names or registration numbers are identified in this preview.`} />
        <div className="workflow-action-row">
          <StatusPill status={attendance.mentorDecision || (attendance.submittedAt ? 'SUBMITTED' : 'IN_PROGRESS')} />
          <button className="primary-button" type="button" disabled={!capturedCardCount || Boolean(attendance.submittedAt)} onClick={submitAttendance}>Submit ID-card count to mentor</button>
        </div>
        {attendance.submittedAt && <p className="workflow-inline-note">Submitted {new Date(attendance.submittedAt).toLocaleString()} · {attendance.mentorDecision || 'Awaiting mentor review'}</p>}
      </section>

      <DepartmentAssignments workflow={workflow} setWorkflow={setWorkflow} />

      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Published by your club" title="Event posts." detail="Only fully approved requests can be posted for students to discover and apply." />
        {workflow.publishedEvents.length ? <div className="workflow-published-list">{workflow.publishedEvents.filter((item) => item.clubName === profile.clubName).map((item) => (
          <article className="workflow-published-card" key={item.id}>
            <span className="workflow-kicker">{item.date} · {item.startTime}–{item.endTime}</span>
            <h3>{item.title}</h3><p>{item.venue}</p>
            {item.posterDataUrl && <img className="workflow-poster-preview" src={item.posterDataUrl} alt={`${item.title} event poster`} />}
            <div>
              <span>{item.posterName ? `Poster: ${item.posterName}` : 'Poster not attached'}</span>
              {item.applicationDataUrl ? <a href={item.applicationDataUrl} target="_blank" rel="noreferrer">{item.applicationName}</a> : <span>{item.applicationName ? `Form: ${item.applicationName}` : 'No application form attached'}</span>}
            </div>
          </article>
        ))}</div> : <WorkflowEmpty>No event posts yet. Publish an approved event to see it here.</WorkflowEmpty>}
      </section>
      <PreviewOnlyNote />
    </div>
  );
}

function DepartmentAssignments({ workflow, setWorkflow }) {
  const [departmentName, setDepartmentName] = useState('');
  const departments = Object.keys(workflow.departments);
  const executives = ['Aarav Nair', 'Neha Kapoor', 'Kiran Rao', 'Meera Iyer'];

  function addDepartment(event) {
    event.preventDefault();
    const name = departmentName.trim();
    if (!name || workflow.departments[name]) return;
    updateWorkflow(setWorkflow, (current) => ({
      ...current,
      departments: { ...current.departments, [name]: [] },
    }));
    setDepartmentName('');
    toast.success('Department added in the UI preview.');
  }

  function toggle(department, name) {
    updateWorkflow(setWorkflow, (current) => {
      const members = current.departments[department] || [];
      const updated = members.includes(name) ? members.filter((member) => member !== name) : [...members, name];
      return { ...current, departments: { ...current.departments, [department]: updated } };
    });
  }

  return (
    <section className="workflow-panel">
      <WorkflowHeading eyebrow="Club team" title="Assign departments." detail="Organize executives into the teams that support your club’s events." />
      <form className="workflow-add-department" onSubmit={addDepartment}>
        <label htmlFor="new-department">Add a department</label>
        <input id="new-department" maxLength="40" value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} placeholder="e.g. Design or Sponsorship" />
        <button className="secondary-button" type="submit" disabled={!departmentName.trim() || Boolean(workflow.departments[departmentName.trim()])}>Add department</button>
      </form>
      <div className="workflow-departments">{departments.map((department) => (
        <fieldset key={department}>
          <legend>{department}</legend>
          {executives.map((name) => (
            <label key={name}><input type="checkbox" checked={(workflow.departments[department] || []).includes(name)} onChange={() => toggle(department, name)} />{name}</label>
          ))}
        </fieldset>
      ))}</div>
      <p className="workflow-inline-note">Assignments are a UI preview and are visible in this browser session only.</p>
    </section>
  );
}

function MentorDesk({ profile, workflow, setWorkflow, remarks, setRemarks }) {
  const clubNames = profile.clubNames || [];
  const eventRequests = workflow.requests.filter((request) => clubNames.includes(request.clubName) && request.status === 'MENTOR_REVIEW');
  const attendance = workflow.attendance;
  const membersByClub = {
    'Coding Club': [
      { name: 'Rohan Verma', role: 'President' },
      { name: 'Aarav Nair', role: 'Executive · Event operations' },
      { name: 'Neha Kapoor', role: 'Executive · PR' },
      { name: 'Kiran Rao', role: 'Executive · Social media' },
    ],
  };
  const canReviewAttendance = clubNames.includes(attendance.clubName);

  function decideRequest(request, decision) {
    const remark = (remarks[request.id] || '').trim();
    if (decision === 'REJECTED' && !remark) {
      toast.error('Add a remark before rejecting this request.');
      return;
    }
    updateWorkflow(setWorkflow, (current) => ({
      ...current,
      requests: current.requests.map((item) => item.id === request.id
        ? { ...item, status: decision === 'APPROVED' ? 'AFFAIRS_REVIEW' : decision, mentorRemark: decision === 'APPROVED' ? 'Approved by mentor.' : remark }
        : item),
    }));
    toast.success(decision === 'APPROVED' ? 'Request sent to Student Affairs.' : 'Request rejected with your remark.');
  }

  function reviewAttendance(decision) {
    updateWorkflow(setWorkflow, (current) => ({
      ...current,
      attendance: {
        ...current.attendance,
        mentorDecision: decision,
        mentorRemark: decision === 'REVIEWED' ? 'Attendance received and reviewed.' : 'Please verify the submitted attendance.',
        studentAffairsStatus: decision === 'REVIEWED' ? 'PENDING' : '',
      },
    }));
    toast.success(decision === 'REVIEWED' ? 'Attendance marked reviewed.' : 'Attendance returned for follow-up.');
  }

  return (
    <div className="workflow-stack">
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Mentor · club review" title="Requests needing your decision." detail={`Assigned clubs: ${clubNames.join(', ') || 'No clubs assigned'}. Rejections require a remark.`} />
        {eventRequests.length ? eventRequests.map((request) => (
          <article className="workflow-review-card" key={request.id}>
            <div className="workflow-review-top"><div><span className="workflow-kicker">{request.clubName} · {request.president}</span><h3>{request.title}</h3></div><StatusPill status={request.status} /></div>
            <p>{request.date} · {request.startTime}–{request.endTime} · {request.venue}</p><p>{request.description}</p>
            <label className="workflow-remark">Decision remark<textarea rows="2" value={remarks[request.id] || ''} onChange={(event) => setRemarks((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Required to reject; optional to approve." /></label>
            <div className="workflow-form-actions"><button className="primary-button" type="button" onClick={() => decideRequest(request, 'APPROVED')}>Approve · send to Student Affairs</button><button className="secondary-button" type="button" onClick={() => decideRequest(request, 'REJECTED')}>Reject request</button></div>
          </article>
        )) : <WorkflowEmpty>No event requests are waiting for mentor review.</WorkflowEmpty>}
      </section>
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Attendance review" title="President submissions." detail="Executives capture ID-card photos. The President submits the captured photo count to you; student identities are not scanned in this preview." />
        {canReviewAttendance && attendance.submittedAt ? (
          <article className="workflow-review-card">
            <div className="workflow-review-top"><div><span className="workflow-kicker">{attendance.clubName} · {attendance.eventTitle}</span><h3>{attendance.cardsCaptured || 0} ID-card photos captured</h3></div><StatusPill status={attendance.mentorDecision || 'SUBMITTED'} /></div>
            <p>Submitted {new Date(attendance.submittedAt).toLocaleString()}</p>
            <div className="workflow-action-row"><button className="primary-button" type="button" disabled={Boolean(attendance.mentorDecision)} onClick={() => reviewAttendance('REVIEWED')}>Mark reviewed</button><button className="secondary-button" type="button" disabled={Boolean(attendance.mentorDecision)} onClick={() => reviewAttendance('FOLLOW_UP')}>Request follow-up</button></div>
          </article>
        ) : <WorkflowEmpty>No final attendance submissions are waiting for review.</WorkflowEmpty>}
      </section>
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Mentor · club roster" title="Your club members." detail="A preview of the roster and executive department assignments for your assigned clubs." />
        {clubNames.map((clubName) => (
          <div className="workflow-roster-group" key={clubName}>
            <h3>{clubName}</h3>
            {(membersByClub[clubName] || []).map((member) => (
              <article className="workflow-roster-row" key={`${clubName}-${member.name}`}>
                <span>{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                <strong>{member.name}</strong>
                <small>{member.role}</small>
              </article>
            ))}
          </div>
        ))}
      </section>
      <PreviewOnlyNote />
    </div>
  );
}

function StudentAffairsDesk({ clubs, workflow, setWorkflow, remarks, setRemarks }) {
  const [clubFormOpen, setClubFormOpen] = useState(false);
  const requests = workflow.requests.filter((request) => request.status === 'AFFAIRS_REVIEW');

  function addClub(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const club = { id: `preview-club-${Date.now()}`, name: form.get('name'), category: form.get('category'), description: form.get('description'), members: 0 };
    updateWorkflow(setWorkflow, (current) => ({ ...current, clubs: [club, ...current.clubs] }));
    event.currentTarget.reset();
    setClubFormOpen(false);
    toast.success('Club added to the UI preview directory.');
  }

  function decideRequest(request, decision) {
    const remark = (remarks[request.id] || '').trim();
    if (decision === 'REJECTED' && !remark) {
      toast.error('Add a remark before rejecting this request.');
      return;
    }
    updateWorkflow(setWorkflow, (current) => ({
      ...current,
      requests: current.requests.map((item) => item.id === request.id
        ? { ...item, status: decision, affairsRemark: decision === 'APPROVED' ? 'Approved by Student Affairs.' : remark }
        : item),
    }));
    toast.success(decision === 'APPROVED' ? 'Event request approved for publication.' : 'Event request rejected with a remark.');
  }

  return (
    <div className="workflow-stack">
      <section className="workflow-panel">
        <div className="workflow-heading-row"><WorkflowHeading eyebrow="Student Affairs · campus directory" title="Manage clubs." detail={`${clubs.length} clubs currently visible, including preview additions.`} /><button className="primary-button" type="button" onClick={() => setClubFormOpen((open) => !open)}>Add a club</button></div>
        {clubFormOpen && <form className="workflow-form workflow-form-grid" onSubmit={addClub}>
          <label>Club name<input name="name" required maxLength="120" /></label>
          <label>Category<input name="category" required maxLength="80" /></label>
          <label className="workflow-field-wide">Description<textarea name="description" rows="3" required maxLength="500" /></label>
          <div className="workflow-field-wide workflow-form-actions"><button className="primary-button" type="submit">Add to directory</button><button className="secondary-button" type="button" onClick={() => setClubFormOpen(false)}>Cancel</button></div>
        </form>}
        <div className="workflow-club-list">{clubs.map((club) => <div key={club.id}><strong>{club.name}</strong><span>{club.category || 'Campus community'}</span></div>)}</div>
      </section>
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="Final event approval" title="Mentor-approved requests." detail="Review the details and make the Student Affairs decision. Rejections require a remark." />
        {requests.length ? requests.map((request) => (
          <article className="workflow-review-card" key={request.id}>
            <div className="workflow-review-top"><div><span className="workflow-kicker">{request.clubName} · {request.president}</span><h3>{request.title}</h3></div><StatusPill status={request.status} /></div>
            <p>{request.date} · {request.startTime}–{request.endTime} · {request.venue}</p><p>{request.description}</p>
            <p className="workflow-mentor-remark">Mentor: {request.mentorRemark}</p>
            <label className="workflow-remark">Decision remark<textarea rows="2" value={remarks[request.id] || ''} onChange={(event) => setRemarks((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Required to reject; optional to approve." /></label>
            <div className="workflow-form-actions"><button className="primary-button" type="button" onClick={() => decideRequest(request, 'APPROVED')}>Approve for publication</button><button className="secondary-button" type="button" onClick={() => decideRequest(request, 'REJECTED')}>Reject request</button></div>
          </article>
        )) : <WorkflowEmpty>No mentor-approved event requests are awaiting your decision.</WorkflowEmpty>}
      </section>
      <section className="workflow-panel">
        <WorkflowHeading eyebrow="OD · attendance hand-off" title="Club attendance submissions." detail="Mentors review President-submitted ID-card photo counts before OD processing." />
        {workflow.attendance.studentAffairsStatus === 'PENDING' ? (
          <article className="workflow-review-card">
            <div className="workflow-review-top"><div><span className="workflow-kicker">{workflow.attendance.clubName} · Mentor reviewed</span><h3>{workflow.attendance.eventTitle}</h3></div><StatusPill status="PENDING" /></div>
            <p>{workflow.attendance.cardsCaptured || 0} ID-card photos captured · ready for OD processing</p>
            <button className="primary-button" type="button" onClick={() => updateWorkflow(setWorkflow, (current) => ({
              ...current,
              attendance: { ...current.attendance, studentAffairsStatus: 'OD_APPROVED' },
            }))}>Approve attendance for OD</button>
          </article>
        ) : workflow.attendance.studentAffairsStatus === 'OD_APPROVED' ? (
          <p className="workflow-inline-note">OD attendance approved for {workflow.attendance.eventTitle}.</p>
        ) : (
          <WorkflowEmpty>No mentor-reviewed attendance is waiting for OD processing.</WorkflowEmpty>
        )}
      </section>
      <PreviewOnlyNote />
    </div>
  );
}

function RequestCard({ request }) {
  return (
    <article className="workflow-request-card">
      <div className="workflow-review-top"><div><span className="workflow-kicker">{request.date} · {request.startTime}–{request.endTime}</span><h3>{request.title}</h3></div><StatusPill status={request.status} /></div>
      <p>{request.venue}</p>
      {request.mentorRemark && <p className="workflow-mentor-remark">Mentor: {request.mentorRemark}</p>}
      {request.affairsRemark && <p className="workflow-mentor-remark">Student Affairs: {request.affairsRemark}</p>}
    </article>
  );
}

function WorkflowHeading({ eyebrow, title, detail }) {
  return <header className="workflow-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{detail && <p>{detail}</p>}</header>;
}

function WorkflowEmpty({ children }) {
  return <p className="workflow-empty">{children}</p>;
}

function PreviewOnlyNote() {
  return <p className="workflow-preview-note">UI workflow preview only · Changes stay in this browser session and are not submitted to the campus backend.</p>;
}

function formatTime(value) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function readAttachment(file, maximumBytes) {
  if (file.size > maximumBytes) {
    return Promise.reject(new Error(`${file.name} exceeds the ${Math.round(maximumBytes / 1_000_000)} MB preview limit.`));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error(`Could not read ${file.name}.`));
    };
    reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}
