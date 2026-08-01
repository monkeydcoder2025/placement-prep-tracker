import React, { useEffect, useState } from 'react';
import { fetchSettings, updateStartDate, removePanic } from '../utils/api';
import { Trash2 } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [startDateStr, setStartDateStr] = useState('');

  const load = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
      setStartDateStr(s.start_date || '');
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateDate = async () => {
    try {
      await updateStartDate(startDateStr);
      alert('Start date updated! Schedule has been recalculated.');
      load();
    } catch(e) {
      console.error(e);
      alert('Failed to update date');
    }
  };

  const handleDeletePanic = async (idx) => {
    if (window.confirm('Delete this panic pause? The schedule will shift back.')) {
      try {
        await removePanic(idx);
        load();
      } catch(e) {
        console.error(e);
      }
    }
  };

  if (!settings) return <div className="empty-state">Loading settings...</div>;

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
      
    </div>
  );
};

export default SettingsPage;
