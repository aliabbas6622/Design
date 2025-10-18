import React from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border ${COLORS[type]} flex items-center gap-2 animate-fade-in-up`}>
    {type === 'success' && (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
    )}
    {type === 'error' && (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" d="M8 8l8 8M16 8l-8 8" /></svg>
    )}
    {type === 'info' && (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" d="M12 16v-4M12 8h.01" /></svg>
    )}
    <span className="flex-1 text-sm">{message}</span>
    {onClose && (
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"/></svg>
      </button>
    )}
  </div>
);

export default Notification;
