import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
    ],
  },
  {
    section: 'Registro',
    items: [
      { to: '/registro', label: 'Nuevo Registro', icon: 'bi-pencil-square' },
      { to: '/consulta', label: 'Consultar Registros', icon: 'bi-search' },
    ],
  }
  /*
  {
    section: 'Sistema',
    items: [
      { to: '/configuracion', label: 'Configuración', icon: 'bi-gear' },
    ],
  },*/
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <nav
        style={{
          width: 'var(--fap-sidebar-w)',
          background: 'var(--fap-dark)',
          borderRight: '1px solid var(--fap-border)',
          height: '100vh',
          position: 'fixed',
          left: 0, top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.3s',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className={`fap-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--fap-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 38, height: 38,
            background: 'var(--fap-yellow)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 20, color: '#0d0d0d',
            fontStyle: 'italic',
            fontFamily: 'var(--fap-font-display)',
          }}>F</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--fap-text)', fontFamily: 'var(--fap-font-display)' }}>
              FAPARCA
            </div>
            <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', letterSpacing: 1 }}>
              Control de Molino
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <div style={{
                fontSize: 10, color: 'var(--fap-text-muted)',
                letterSpacing: 2, textTransform: 'uppercase',
                padding: '10px 20px 4px', fontWeight: 600,
              }}>
                {section}
              </div>
              {items.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 20px',
                    textDecoration: 'none',
                    fontSize: 13.5,
                    color: isActive ? 'var(--fap-text)' : 'var(--fap-text-muted)',
                    borderLeft: `3px solid ${isActive ? 'var(--fap-green)' : 'transparent'}`,
                    background: isActive ? 'rgba(45,156,78,0.12)' : 'transparent',
                    transition: 'all 0.15s',
                  })}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: 17, width: 20 }} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--fap-border)',
          fontSize: 11, color: 'var(--fap-text-muted)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <i className="bi bi-circle-fill" style={{ color: 'var(--fap-green)', fontSize: 7 }} />
          Sistema v1.0.0 — Activo
        </div>
      </nav>
    </>
  );
}
