import React, { useState } from 'react';

const DEFAULT_CONFIG = {
  api_url:      process.env.REACT_APP_API_URL,
  plant_name:   'Molino Principal — FAPARCA',
  company_name: 'FAPARCA',
  timezone:     'America/Caracas',
};

export default function Configuracion() {
  const [cfg, setCfg]     = useState(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const handleSave = () => {
    // In a real app: persist to localStorage or send to API
    localStorage.setItem('faparca_config', JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-fade" style={{ padding: 24 }}>
      {saved && (
        <div className="alert-fap alert-success" style={{ marginBottom: 20 }}>
          <i className="bi bi-check-circle" style={{ fontSize: 16 }} />
          Configuración guardada correctamente.
        </div>
      )}

      {/* API Config */}
      <div className="section-card">
        <div className="section-header">
          <h6><i className="bi bi-cloud" style={{ color: 'var(--fap-green)' }} /> Conexión al Servidor</h6>
        </div>
        <div className="section-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label">URL Base de la API</label>
              <input type="text" className="form-control"
                value={cfg.api_url}
                onChange={e => set('api_url', e.target.value)}
                placeholder="https://api.miservidor.com/v1" />
              <small style={{ color: 'var(--fap-text-muted)', fontSize: 11, marginTop: 4, display: 'block' }}>
                Los registros se enviarán a <code style={{ color: 'var(--fap-green-light)', background: 'var(--fap-panel)', padding: '1px 6px', borderRadius: 4 }}>{cfg.api_url}/mill/records</code>
              </small>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Zona Horaria</label>
              <select className="form-select"
                value={cfg.timezone}
                onChange={e => set('timezone', e.target.value)}>
                <option value="America/Caracas">Venezuela (UTC-4)</option>
                <option value="America/Bogota">Colombia (UTC-5)</option>
                <option value="America/Lima">Perú (UTC-5)</option>
                <option value="America/Santiago">Chile (UTC-3/-4)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Plant info */}
      <div className="section-card">
        <div className="section-header">
          <h6><i className="bi bi-building" style={{ color: 'var(--fap-yellow)' }} /> Información de la Planta</h6>
        </div>
        <div className="section-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Nombre de la Planta</label>
              <input type="text" className="form-control"
                value={cfg.plant_name}
                onChange={e => set('plant_name', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Nombre de la Empresa</label>
              <input type="text" className="form-control"
                value={cfg.company_name}
                onChange={e => set('company_name', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="section-card">
        <div className="section-header">
          <h6><i className="bi bi-info-circle" style={{ color: 'var(--fap-blue-light)' }} /> Acerca del Sistema</h6>
        </div>
        <div className="section-body">
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', fontSize: 13, color: '#ccc' }}>
            {[
              { label: 'Versión',    val: '1.0.0' },
              { label: 'Framework', val: 'React + Bootstrap 5' },
              { label: 'API',       val: 'REST / JSON' },
              { label: 'Entorno',   val: process.env.NODE_ENV },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-fap btn-fap-green" onClick={handleSave}>
          <i className="bi bi-save" /> Guardar Configuración
        </button>
      </div>
    </div>
  );
}
