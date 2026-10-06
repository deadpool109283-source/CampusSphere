import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import EventApplicationForm from './EventApplicationForm';
import { apiFetch } from '../lib/api';
import { savePreviewApplication } from '../lib/workflowPreview';
import '../styles/registration.css';

export default function RegistrationDialog({ event, profile, onClose, onSuccess }) {
  const dialogRef = useRef(null);

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
        toast.success('Application saved in this browser preview.');
        onSuccess(event.id);
        onClose();
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
      toast.success(result.message || 'Registration confirmed.');
      onSuccess(event.id);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Registration could not be completed.');
      throw error;
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(eventObject) => {
      if (eventObject.target === eventObject.currentTarget) onClose();
    }}>
      <section className="workspace-dialog" role="dialog" aria-modal="true" aria-labelledby="register-title" aria-describedby="register-details" ref={dialogRef}>
        <div className="dialog-heading">
          <div><p className="eyebrow">Campus event · Registration</p><h2 id="register-title">{event.title}</h2></div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close registration">×</button>
        </div>
        <p className="dialog-event-details" id="register-details">{event.club} · {event.date} · {event.venue}</p>
        <EventApplicationForm
          onSubmit={handleRegister}
          onClose={onClose}
          initialName={profile.fullName || ''}
          initialRegNo={profile.rollNumber || ''}
          initialBranch={profile.branch || ''}
          initialSemester={profile.semester || '1'}
          previewOnly={event.previewOnly}
        />
      </section>
    </div>
  );
}
