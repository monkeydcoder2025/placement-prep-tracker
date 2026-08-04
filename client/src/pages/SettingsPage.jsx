import React, { useEffect, useState } from 'react';
import { fetchSettings, updateStartDate, removePanic, updateTelegram } from '../utils/api';
import { Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [startDateStr, setStartDateStr] = useState('');
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, index: null });
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('reduce-motion') === 'true';
  });
  const toast = useToast();

  // Apply reduce-motion class to document
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('reduce-motion', String(reduceMotion));
  }, [reduceMotion]);

  const load = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
      setStartDateStr(s.start_date || '');
      setBotToken(s.telegram_bot_token || '');
      setChatId(s.telegram_chat_id || '');
    } catch(e) {
      console.error(e);
      toast.error('Failed to load settings');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateDate = async () => {
    try {
      await updateStartDate(startDateStr);
      toast.success('Start date updated! Schedule has been recalculated.');
      load();
    } catch(e) {
      console.error(e);
      toast.error('Failed to update date');
    }
  };

  const handleUpdateTelegram = async () => {
    try {
      await updateTelegram(botToken, chatId);
      toast.success('Telegram settings updated successfully!');
      load();
    } catch(e) {
      console.error(e);
      toast.error('Failed to update Telegram settings');
    }
  };

  const handleDeletePanic = async (idx) => {
    setConfirmModal({ open: true, index: idx });
  };

  const confirmDeletePanic = async () => {
    const idx = confirmModal.index;
    setConfirmModal({ open: false, index: null });
    try {
      await removePanic(idx);
      toast.success('Panic pause removed. Schedule adjusted.');
      load();
    } catch(e) {
      console.error(e);
      toast.error('Failed to remove panic pause');
    }
  };

  if (!settings) {
    return (
      <div className="skeleton-container">
        <div className="skeleton skeleton-header"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your tracker configuration</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title">Schedule Settings</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Start Date</label>
            <input 
              type="date" 
              value={startDateStr} 
              onChange={e => setStartDateStr(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button className="btn btn-primary" style={{ marginTop: '28px' }} onClick={handleUpdateDate}>
            Update Date
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title">Panic Pause History</h3>
        {(!settings.panic_pauses || settings.panic_pauses.length === 0) ? (
          <p style={{ color: 'var(--text-muted)' }}>No panic pauses used yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {settings.panic_pauses.map((pause, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Pause {i + 1}</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pause.startDate} to {pause.endDate}</div>
                </div>
                <button className="btn btn-ghost" onClick={() => handleDeletePanic(i)} style={{ color: 'var(--accent-red)', padding: '8px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title">Accessibility</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Reduce Motion</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Disable animations and transitions throughout the app
            </p>
          </div>
          <button
            onClick={() => setReduceMotion(v => !v)}
            style={{
              width: '48px',
              height: '26px',
              borderRadius: '13px',
              border: 'none',
              background: reduceMotion ? 'var(--accent-green)' : 'var(--bg-tertiary)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '3px',
              left: reduceMotion ? '25px' : '3px',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title">Notifications (Telegram)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Get daily reminders for today's tasks and past-due tasks.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Bot Token</label>
            <input 
              type="text" 
              value={botToken} 
              onChange={e => setBotToken(e.target.value)}
              placeholder="e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', width: '100%', maxWidth: '400px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Chat ID</label>
            <input 
              type="text" 
              value={chatId} 
              onChange={e => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', width: '100%', maxWidth: '400px' }}
            />
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleUpdateTelegram}>
              Save Telegram Settings
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title">Calendar Subscription</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Subscribe to this URL in Google Calendar, Apple Calendar, or Outlook to see your tasks dynamically.
        </p>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-card)', wordBreak: 'break-all' }}>
          <code>{window.location.origin}/api/calendar/feed.ics</code>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.open}
        title="Delete Panic Pause?"
        message="This will remove the pause and shift the schedule back. This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeletePanic}
        onCancel={() => setConfirmModal({ open: false, index: null })}
      />
    </motion.div>
  );
};

export default SettingsPage;
