import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.isSuccess ? '#065f46' : '#991b1b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <span>{t.isSuccess ? '✓' : '⚠️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
