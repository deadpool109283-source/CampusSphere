import { useState } from 'react';

export default function EventApplicationForm({ onSubmit, onClose, initialRegNo = '' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    regNo: initialRegNo,
    branch: '',
    semester: '1',
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(submitError.message || 'Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="registration-number">University registration number</label>
        <input
          autoComplete="off"
          id="registration-number"
          name="regNo"
          onChange={updateField}
          placeholder="e.g. AM.EN.U4CSE23001"
          required
          value={formData.regNo}
        />
      </div>
      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="registration-branch">Department</label>
          <select id="registration-branch" name="branch" onChange={updateField} required value={formData.branch}>
            <option value="">Choose department</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="MECH">Mechanical</option>
            <option value="AI">Artificial Intelligence</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="registration-semester">Semester</label>
          <select id="registration-semester" name="semester" onChange={updateField} required value={formData.semester}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="form-note">The event service validates capacity and prevents duplicate registrations.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="quiet-button" type="button" onClick={onClose}>Cancel</button>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering…' : 'Confirm registration'}
        </button>
      </div>
    </form>
  );
}
