import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const PAGE_TITLES = {
  '/':             'Dashboard',
  '/registro':     'Nuevo Registro',
  '/consulta':     'Consultar Registros',
  '/configuracion':'Configuración',
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const title = PAGE_TITLES[pathname] || 'FAPARCA';
  const now = new Date().toLocaleDateString('es-VE', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <header style={{
      background: 'var(--fap-dark)',
      borderBottom: '1px solid var(--fap-border)',
      height: 'var(--fap-topbar-h)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="btn-fap btn-fap-outline"
          style={{ padding: '6px 8px', display: 'none' }}
          id="hamburger-btn"
          aria-label="Abrir menú"
        >
          <i className="bi bi-list" style={{ fontSize: 20 }} />
        </button>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fap-text)', fontFamily: 'var(--fap-font-display)', letterSpacing: 0.5 }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--fap-text-muted)', marginLeft: 12 }}>
            {now}
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge-fap badge-online">
          <i className="bi bi-circle-fill" style={{ fontSize: 7 }} />
          En línea
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--fap-panel)',
            border: '1px solid var(--fap-border)',
            borderRadius: 20,
            padding: '4px 8px',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          <i
            className="bi bi-sun-fill"
            style={{ fontSize: 13, color: theme === 'light' ? 'var(--fap-yellow)' : 'var(--fap-text-hint)', transition: 'color 0.2s' }}
          />
          <div style={{
            width: 32, height: 17,
            background: theme === 'light' ? 'var(--fap-green)' : 'var(--fap-border)',
            borderRadius: 10,
            position: 'relative',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute',
              top: 2,
              left: theme === 'light' ? 15 : 2,
              width: 13, height: 13,
              background: '#fff',
              borderRadius: '50%',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
            }} />
          </div>
          <i
            className="bi bi-moon-stars-fill"
            style={{ fontSize: 13, color: theme === 'dark' ? 'var(--fap-blue-light)' : 'var(--fap-text-hint)', transition: 'color 0.2s' }}
          />
        </button>

        <button className="btn-fap btn-fap-outline" style={{ padding: '5px 8px' }} title="Notificaciones">
          <i className="bi bi-bell" style={{ fontSize: 16 }} />
        </button>
        <button className="btn-fap btn-fap-outline" style={{ padding: '5px 8px' }} title="Perfil de usuario">
          <i className="bi bi-person-circle" style={{ fontSize: 16 }} />
        </button>
      </div>
    </header>
  );
}
