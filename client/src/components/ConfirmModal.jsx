import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
  if (!isOpen) return null;

  const confirmColor = variant === 'danger' ? 'var(--accent-red)' : 'var(--accent-orange)';

  return (
    <>
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-container">
        <div className="modal-icon" style={{ color: confirmColor }}>
          <AlertTriangle size={28} />
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className="btn" style={{ background: confirmColor, color: '#fff' }} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
