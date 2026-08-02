import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const TOAST_ICONS = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const TOAST_COLORS = {
  success: 'var(--accent-green)',
  error: 'var(--accent-red)',
  info: 'var(--accent-blue)',
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const color = TOAST_COLORS[toast.type] || TOAST_COLORS.info;

  return (
    <div className="toast-item" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="toast-icon" style={{ color }}>{TOAST_ICONS[toast.type] || TOAST_ICONS.info}</div>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onDismiss(toast.id)}>
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  let idCounter = 0;

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + (idCounter++);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
