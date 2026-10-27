import { useEffect, useRef, useState } from 'react';
import { Calendar, Check, Compass, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import EventApplicationForm from './EventApplicationForm';
import { apiFetch } from '../lib/api';
import { fireSuccessBurst } from '../lib/confetti';
import { savePreviewApplication } from '../lib/workflowPreview';
import '../styles/registration.css';

export default function RegistrationDialog({ event, profile, onClose, onSuccess }) {
  const dialogRef = useRef(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector('input')?.focus();

    function containFocus(eventObject) {
      if (eventObject.key === 'Escape') {
        onClose();
        return;
      }
      if (eventObject.key !== 'Tab' || !dialog) return;

      const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (eventObject.shiftKey && document.activeElement === first) {
        eventObject.preventDefault();
        last?.focus();
      } else if (!eventObject.shiftKey && document.activeElement === last) {
        eventObject.preventDefault();
        first?.focus();
      }
    }

    dialog?.addEventListener('keydown', containFocus);
    return () => {
      dialog?.removeEventListener('keydown', containFocus);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  async function handleRegister(formData) {
    try {
      if (event.previewOnly && import.meta.env.DEV) {
        const saved = savePreviewApplication({
          eventId: event.id,
          eventTitle: event.title,
          studentName: formData.studentName,
          regNo: formData.regNo,
          branch: formData.branch,
          semester: formData.semester,
          submittedAt: new Date().toISOString(),
        });
        if (!saved) throw new Error('You have already applied for this event.');
        fireSuccessBurst();
        setRegisteredSuccess(true);
        onSuccess(event.id);
        toast.success('Registration confirmed! Entry pass issued.');
        return;
      }
      const result = await apiFetch('/events/register', {
        method: 'POST',
        body: JSON.stringify({
          eventId: event.id,
          studentName: formData.studentName,
          regNo: formData.regNo,
          branch: formData.branch,
          semester: formData.semester,
        }),
      });
      fireSuccessBurst();
      setRegisteredSuccess(true);
      onSuccess(event.id);
      toast.success(result.message || 'Registration confirmed! Entry pass issued.');
    } catch (error) {
      toast.error(error.message || 'Registration could not be completed.');
      throw error;
    }
  }

  const handleFinish = () => {
    setRegisteredSuccess(false);
    onClose();
  };

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(eventObject) => {
        if (eventObject.target === eventObject.currentTarget) {
          handleFinish();
        }
      }}
    >
      {registeredSuccess ? (
        /* Floating Registration Completion Card */
        <section
          className="registration-success-floating-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-dialog-title"
        >
          <div className="success-badge-halo">
            <Check size={36} strokeWidth={2.8} />
          </div>

          <span
            className="eyebrow"
            style={{
              color: 'var(--emerald)',
              letterSpacing: '1.4px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            REGISTRATION CONFIRMED
          </span>

          <h2
            id="success-dialog-title"
            style={{
              margin: '10px 0 8px',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'var(--font-display, inherit)',
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
            }}
          >
            You’re officially on the attendee list!
          </h2>

          <p
            style={{
              margin: '0 0 20px',
              color: 'var(--muted)',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            Your entry pass is active for{' '}
            <strong style={{ color: 'var(--ink)' }}>{event.title}</strong>. Your attendance record will automatically sync with Student Affairs for On-Duty (OD) regularization.
          </p>

          <div className="success-details-pill-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink)' }}>
              <Calendar size={16} color="var(--crimson)" />
              <strong>{event.date || 'Upcoming Campus Date'}</strong>
            </div>
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink)' }}>
                <Compass size={16} color="var(--crimson)" />
                <span>{event.venue}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', fontSize: '12px' }}>
              <Sparkles size={14} color="var(--amber)" />
              <span>Host: {event.club || 'Amrita Campus Club'}</span>
            </div>
          </div>

          <button
            className="primary-action-button"
            type="button"
            style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 700, borderRadius: '999px' }}
            onClick={handleFinish}
          >
            Got it, take me back
          </button>
        </section>
      ) : (
        /* Standard Registration Form Modal */
        <section
          className="workspace-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          aria-describedby="register-details"
          ref={dialogRef}
        >
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">Campus event · Registration</p>
              <h2 id="register-title">{event.title}</h2>
            </div>
            <button className="dialog-close" type="button" onClick={onClose} aria-label="Close registration">
              <X size={16} />
            </button>
          </div>
          <p className="dialog-event-details" id="register-details">
            {event.club} · {event.date} · {event.venue}
          </p>
          <EventApplicationForm
            onSubmit={handleRegister}
            onClose={onClose}
            initialName={profile?.fullName || ''}
            initialRegNo={profile?.rollNumber || ''}
            initialBranch={profile?.branch || ''}
            initialSemester={profile?.semester || '1'}
            previewOnly={event.previewOnly}
          />
        </section>
      )}
    </div>
  );
}
