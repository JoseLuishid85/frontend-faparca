import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/faparca.css';

import Sidebar  from './components/Sidebar';
import Topbar   from './components/Topbar';

import Dashboard         from './pages/Dashboard';
import RegistroMolino    from './pages/RegistroMolino';
import ConsultaRegistros from './pages/ConsultaRegistros';
import Configuracion     from './pages/Configuracion';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('faparca_theme') || 'dark');

  const toggleTheme = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    localStorage.setItem('faparca_theme', next);
    return next;
  });

  // Apply theme attribute to <html> so CSS variables cascade globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setSidebarOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main */}
        <div style={{
          marginLeft: 'var(--fap-sidebar-w)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
          className="main-wrapper"
        >
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/registro"      element={<RegistroMolino />} />
              <Route path="/consulta"      element={<ConsultaRegistros />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Responsive CSS injected globally */}
      <style>{`
        @media (max-width: 768px) {
          .main-wrapper { margin-left: 0 !important; }
          .fap-sidebar { transform: translateX(-100%); }
          .fap-sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.5); }
          #hamburger-btn { display: flex !important; }
        }
      `}</style>
    </BrowserRouter>
    </ThemeContext.Provider>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--fap-text-muted)' }}>
      <i className="bi bi-exclamation-triangle" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: 'var(--fap-yellow)' }} />
      <h4 style={{ color: 'var(--fap-text)', marginBottom: 8 }}>Página no encontrada</h4>
      <p>La ruta solicitada no existe.</p>
    </div>
  );
}