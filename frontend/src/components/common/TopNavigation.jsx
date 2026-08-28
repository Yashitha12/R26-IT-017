import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingQueue, backendOnline } = useApp();

  const navItems = [
    { path: '/register', label: '1. User Registration', icon: 'fa-user-plus' },
    { path: '/identity', label: '2. Identity Application & KYC', icon: 'fa-id-card-clip' },
    { path: '/officer', label: '3. Officer KYC Review', icon: 'fa-user-shield', badge: pendingQueue.length },
    { path: '/welfare-services', label: '4. Welfare Services', icon: 'fa-hand-holding-heart' },
    { path: '/dashboard', label: 'Dashboard & Loans', icon: 'fa-table-columns' },
    { path: '/inspector', label: 'Inspector', icon: 'fa-chart-network' },
  ];

  const isCurrent = (path) => {
    if (path === '/register' && (location.pathname === '/' || location.pathname === '/register')) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Brand */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => navigate('/register')}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#0d9488',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', lineHeight: 1.2 }}>SmartGrama</div>
          <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: '600' }}>Digital Welfare Platform</div>
        </div>
      </div>

      {/* Nav items pills */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '9999px' }}>
        {navItems.map((item) => {
          const active = isCurrent(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                border: 'none',
                background: active ? '#ffffff' : 'transparent',
                color: active ? '#0d9488' : '#64748b',
                fontWeight: active ? '700' : '500',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Backend Online Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: backendOnline ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${backendOnline ? '#a7f3d0' : '#fecaca'}`,
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '700',
          color: backendOnline ? '#065f46' : '#991b1b',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: backendOnline ? '#10b981' : '#ef4444',
            display: 'inline-block',
          }}
        ></span>
        <span>{backendOnline ? 'Backend Online' : 'Backend Offline'}</span>
      </div>
    </header>
  );
};
