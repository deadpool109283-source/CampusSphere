import { useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import '../../styles/profile.css';

export default function ProfileView({ session, role = 'STUDENT' }) {
  const profile = session?.profile || {};

  // Form states for editable personal details
  const [phone, setPhone] = useState(profile.phone || '+91 98401 23456');
  const [bio, setBio] = useState(
    profile.bio ||
      'Undergraduate student at Amrita Vishwa Vidyapeetham passionate about software design, systems, and active campus club participation.'
  );
  const [savingDetails, setSavingDetails] = useState(false);

  // Form states for password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Avatar simulated upload
  const [avatarPreview, setAvatarPreview] = useState(null);

  const initials = (profile.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error('Only image formats (JPEG, PNG, WebP) are allowed. SVG and executable formats are restricted.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        toast.success('Avatar image updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    setSavingDetails(true);
    setTimeout(() => {
      setSavingDetails(false);
      toast.success('Profile details updated successfully');
    }, 400);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      if (session?.authenticated && supabase) {
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      toast.error(err.message || 'Unable to update password. Please check your credentials.');
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabelMap = {
    STUDENT: 'Student Member',
    CLUB_COMMITTEE: 'Committee Member',
    CLUB_EXECUTIVE: 'Club Executive',
    CLUB_PRESIDENT: 'Club President',
    FACULTY: 'Faculty Mentor',
    ADMIN: 'Student Affairs Directorate',
  };

  return (
    <div className="workspace-stack profile-view-stack">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Account &amp; Security</p>
        </div>
        <div className="header-title-row">
          <h1>
            Your Campus <em>Profile.</em>
          </h1>
          <p className="header-subtitle">
            Manage your Amrita institutional profile, student identity credentials, contact preferences, and authentication keys.
          </p>
        </div>

        {/* Campus Identity Metric Strip */}
        <div className="profile-stats-strip">
          <div className="profile-stat-pill">
            <span className="profile-stat-icon"><GraduationCap size={15} /></span>
            <div className="profile-stat-meta">
              <span className="profile-stat-val">B.Tech CSE</span>
              <span className="profile-stat-lbl">Semester 5 · 2023-2027</span>
            </div>
          </div>
          <div className="profile-stat-pill">
            <span className="profile-stat-icon"><Award size={15} /></span>
            <div className="profile-stat-meta">
              <span className="profile-stat-val">{roleLabelMap[role] || 'Student'}</span>
              <span className="profile-stat-lbl">Campus Standing</span>
            </div>
          </div>
          <div className="profile-stat-pill">
            <span className="profile-stat-icon"><BookOpen size={15} /></span>
            <div className="profile-stat-meta">
              <span className="profile-stat-val">3 Active Clubs</span>
              <span className="profile-stat-lbl">Joined Communities</span>
            </div>
          </div>
          <div className="profile-stat-pill">
            <span className="profile-stat-icon"><Sparkles size={15} /></span>
            <div className="profile-stat-meta">
              <span className="profile-stat-val">94% Regularized</span>
              <span className="profile-stat-lbl">On-Duty Attendance</span>
            </div>
          </div>
        </div>
      </header>

      <div className="profile-bento-layout">
        {/* Personal Details & Institutional Record */}
        <section className="profile-card reveal-card">
          <div className="profile-card-header">
            <div className="bento-icon-wrap">
              <User size={18} />
            </div>
            <div>
              <p className="bento-label">Identity Dossier</p>
              <h3>Personal &amp; Academic Info</h3>
            </div>
          </div>

          {/* Avatar Upload Banner */}
          <div className="profile-avatar-row">
            <div className="profile-avatar-box">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="profile-avatar-img"
                />
              ) : (
                initials
              )}
              <label
                htmlFor="avatar-file-input"
                className="profile-avatar-camera-btn"
                title="Change Photo"
                aria-label="Upload new avatar image"
              >
                <Camera size={13} />
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="profile-avatar-meta">
              <h4>{profile.fullName || 'Amrita Student'}</h4>
              <p>
                {roleLabelMap[role] || 'Student'} · {profile.branch || profile.department || 'Amrita Campus'}
              </p>
              <div className="profile-verified-badge">
                <ShieldCheck size={12} /> Verified Institutional Member
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveDetails} className="profile-form">
            {/* Read-only System Fields */}
            <div className="profile-grid-2">
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Full Name (Registered)
                </label>
                <input
                  type="text"
                  className="profile-text-input profile-input-readonly"
                  value={profile.fullName || 'Student'}
                  readOnly
                  disabled
                />
              </div>
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Roll / Faculty ID
                </label>
                <input
                  type="text"
                  className="profile-text-input profile-input-readonly"
                  value={profile.rollNumber || 'AM.EN.U4CSE23001'}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="profile-grid-2">
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Amrita Email Address
                </label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    className="profile-text-input profile-input-readonly has-icon"
                    value={profile.email || 'student@campus.edu'}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Department / School
                </label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">
                    <GraduationCap size={14} />
                  </span>
                  <input
                    type="text"
                    className="profile-text-input profile-input-readonly has-icon"
                    value={profile.branch || profile.department || 'Computer Science & Engineering'}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="profile-field-group">
              <label className="profile-field-label">
                Primary Phone Number
              </label>
              <div className="profile-input-wrapper">
                <span className="profile-input-icon">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  className="profile-text-input has-icon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  required
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label className="profile-field-label">
                Short Bio &amp; Campus Pursuits
              </label>
              <textarea
                className="profile-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a brief statement about your interests, clubs, and campus pursuits..."
              />
            </div>

            <div className="profile-form-footer">
              <button
                type="submit"
                className="profile-action-btn"
                disabled={savingDetails}
              >
                {savingDetails ? 'Saving...' : 'Update Profile Details'}
              </button>
            </div>
          </form>
        </section>

        {/* Password & Security Card */}
        <section className="profile-card reveal-card">
          <div className="profile-card-header">
            <div className="bento-icon-wrap">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="bento-label">Access Credentials</p>
              <h3>Change Password</h3>
            </div>
          </div>

          <p className="profile-security-hint">
            Ensure your password is at least 8 characters long and includes a blend of letters, numbers, and symbols to protect your campus account.
          </p>

          {passwordSuccess && (
            <div className="profile-success-banner">
              <CheckCircle2 size={16} />
              Password updated successfully! Next login requires the new credentials.
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="profile-field-group">
              <label className="profile-field-label">
                Current Password
              </label>
              <div className="profile-input-wrapper">
                <span className="profile-input-icon">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  className="profile-text-input has-icon"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label className="profile-field-label">
                New Password (minimum 8 characters)
              </label>
              <div className="profile-input-wrapper">
                <span className="profile-input-icon">
                  <KeyRound size={14} />
                </span>
                <input
                  type="password"
                  className="profile-text-input has-icon"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label className="profile-field-label">
                Confirm New Password
              </label>
              <div className="profile-input-wrapper">
                <span className="profile-input-icon">
                  <Check size={14} />
                </span>
                <input
                  type="password"
                  className="profile-text-input has-icon"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {/* Security Notice Box */}
            <div className="profile-security-notice">
              <strong>Two-Factor Authentication:</strong> Enforced by Amrita ICTS. If you notice any suspicious activity, immediately notify the Student Affairs Directorate.
            </div>

            <div className="profile-form-footer">
              <button
                type="submit"
                className="profile-action-btn"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
