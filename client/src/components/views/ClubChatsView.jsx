import { useEffect, useRef, useState } from 'react';
import {
  Lock,
  MessageCircle,
  Send,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClubChatsView({
  clubs = [],
  chats = [],
  role = 'STUDENT',
  userName = 'Student',
  onSendMessage,
}) {
  const canAccessChats = true;
  const canAccessObRoom = ['ADMIN', 'FACULTY', 'CLUB_PRESIDENT', 'CLUB_EXECUTIVE', 'CLUB_COMMITTEE'].includes(role);

  // Find user's designated club or fallback
  const userClub = clubs.find((c) => {
    const cid = String(c._id || c.id || '');
    return cid === 'club-msft' || c.name?.toLowerCase().includes('coding') || c.name?.toLowerCase().includes('microsoft');
  }) || clubs[0];

  const [selectedClubId, setSelectedClubId] = useState(userClub?._id || userClub?.id || 'club-msft');
  const [selectedRoom, setSelectedRoom] = useState('members');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // If user is a club executive, restrict the selector to only their club
  const isExecutive = ['CLUB_EXECUTIVE', 'CLUB_COMMITTEE', 'CLUB_PRESIDENT'].includes(role);
  const visibleClubs = isExecutive ? [userClub] : clubs;
  const currentClub = visibleClubs.find((c) => (c._id || c.id) === selectedClubId) || visibleClubs[0];

  const activeMessages = chats.filter(
    (msg) =>
      (msg.clubId?._id || msg.clubId?.id || msg.clubId) === selectedClubId &&
      (msg.group || 'members') === selectedRoom
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedRoom, selectedClubId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSending(true);
    const content = inputText.trim();
    setInputText('');
    try {
      await onSendMessage({
        clubId: selectedClubId,
        group: selectedRoom,
        senderName: userName,
        content,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="workspace-stack">
      {/* Editorial Header */}
      <header className="workspace-editorial-header reveal-card">
        <div className="header-meta">
          <p className="eyebrow">Real-Time Messaging &amp; Channels</p>
        </div>
        <div className="header-title-row">
          <h1>
            Club Channels &amp; <em>Discussions.</em>
          </h1>
          <p className="header-subtitle">
            Connect with your fellow club members in open community rooms or coordinate private office-bearer logistics.
          </p>
        </div>
      </header>

      {/* Non-executive Student Restriction Notice */}
      {!canAccessChats ? (
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
            Club Executive Channel Access Restricted
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Real-time club discussion channels and office-bearer coordination rooms are reserved exclusively for verified student executives and club officers.
          </p>
          <div style={{ display: 'inline-flex', gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'var(--glass-surface-warm)',
                border: '1px solid var(--rule-subtle)',
                color: 'var(--ink-secondary)',
              }}
            >
              Apply for an Executive Wing role in the Membership tab to gain channel permissions.
            </span>
          </div>
        </div>
      ) : (
        /* Main Chat Interface */
        <div className="bento-card reveal-card chat-view-card">
          {/* Top Controls Bar */}
          <div className="chat-topbar">
            <div className="chat-channel-group">
              <span className="chat-channel-label">Channel:</span>
              <select
                className="text-input chat-channel-select"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                disabled={isExecutive && visibleClubs.length <= 1}
              >
                {visibleClubs.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} {isExecutive ? '(Your Assigned Club)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selector Tabs */}
            <div className="chat-rooms-toggle">
              <button
                type="button"
                className={`chat-room-tab ${selectedRoom === 'members' ? 'active' : ''}`}
                onClick={() => setSelectedRoom('members')}
              >
                <Users size={13} />
                <span>General Member Room</span>
              </button>

              {canAccessObRoom ? (
                <button
                  type="button"
                  className={`chat-room-tab ${selectedRoom === 'office_bearers' ? 'active ob-active' : ''}`}
                  onClick={() => setSelectedRoom('office_bearers')}
                >
                  <Lock size={13} />
                  <span>Office Bearers (Private)</span>
                </button>
              ) : (
                <span
                  className="chat-room-restricted-badge"
                  title="Office bearer room requires leadership credentials"
                >
                  <Lock size={11} /> OB Only
                </span>
              )}
            </div>
          </div>

          {/* Message Feed Area */}
          <div className="chat-messages-container">
            {selectedRoom === 'office_bearers' && (
              <div className="chat-notice-banner ob-banner">
                <Lock size={14} />
                <span>
                  <strong>Confidential Leadership Room:</strong> Only verified office-bearers and faculty mentors have access to this room.
                </span>
              </div>
            )}

            {activeMessages.map((msg) => {
              const isMe = msg.senderId?.name === userName;
              const senderInitial = (msg.senderId?.name || 'M').slice(0, 2).toUpperCase();

              return (
                <div
                  key={msg._id || msg.id}
                  className={`chat-message-row ${isMe ? 'is-me' : 'is-other'}`}
                >
                  {!isMe && (
                    <div className="chat-sender-avatar">
                      {senderInitial}
                    </div>
                  )}

                  <div className="chat-bubble-wrap">
                    <div className="chat-message-meta">
                      <span className="chat-sender-name">
                        {isMe ? 'You' : msg.senderId?.name || 'Club Member'}
                      </span>
                      <time className="chat-timestamp">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    <div className={`chat-bubble ${isMe ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeMessages.length === 0 && (
              <div className="chat-empty-state">
                <MessageCircle size={36} />
                <p>No messages yet in this room. Be the first to start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer Bar */}
          <form onSubmit={handleSend} className="chat-composer-bar">
            <input
              type="text"
              className="text-input chat-composer-input"
              placeholder={`Message ${currentClub?.name || 'club'} ${selectedRoom === 'office_bearers' ? 'office bearers' : 'members'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="primary-action-button chat-send-btn"
              disabled={sending || !inputText.trim()}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
