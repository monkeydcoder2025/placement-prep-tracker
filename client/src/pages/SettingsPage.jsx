import React, { useEffect, useState } from 'react';
import { fetchSettings, updateStartDate, removePanic } from '../utils/api';
import { Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [startDateStr, setStartDateStr] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, index: null });
  const toast = useToast();

  const load = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
      setStartDateStr(s.start_date || '');
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
    <div>
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

      <ConfirmModal 
        isOpen={confirmModal.open}
        title="Delete Panic Pause?"
        message="This will remove the pause and shift the schedule back. This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeletePanic}
        onCancel={() => setConfirmModal({ open: false, index: null })}
      />
    </div>
  );
};

export default SettingsPage;
