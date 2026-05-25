import React, { useState } from 'react';
import { createRecord, buildPayload, INITIAL_FORM } from '../services/molinoService';

// ─── Sub-component: Silo Table ──────────────────────────────
function SiloTable({ silos, onChange, accentColor }) {
  return (
    <table className="silo-table">
      <thead>
        <tr>
          <th>Silo</th>
          <th>Medida</th>
          <th>Toneladas</th>
        </tr>
      </thead>
      <tbody>
        {silos.map((s, idx) => (
          <tr key={s.silo}>
            <td style={{ textAlign: 'center', fontWeight: 700, color: accentColor, fontSize: 12 }}>
              {s.silo}
            </td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={s.measurement}
                onChange={e => onChange(idx, 'measurement', e.target.value)}
              />
            </td>
            <td>
              <input
                type="number"
                placeholder="0"
                value={s.tons}
                onChange={e => onChange(idx, 'tons', e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Sub-component: Flour/Bran Silo Table ──────────────────
function FlourBranTable({ silos, onChange }) {
  return (
    <table className="silo-table">
      <thead>
        <tr>
          <th>Silo</th>
          <th>Tipo</th>
          <th>Medida</th>
          <th>Ton</th>
        </tr>
      </thead>
      <tbody>
        {silos.map((s, idx) => {
          const color = s.type === 'flour'
            ? 'var(--fap-green-light)'
            : 'var(--fap-blue-light)';
          return (
            <tr key={s.silo}>
              <td style={{ textAlign: 'center', fontWeight: 700, color, fontSize: 12 }}>{s.silo}</td>
              <td style={{ fontSize: 10, color: 'var(--fap-text-muted)', textAlign: 'center' }}>
                {s.type === 'flour' ? 'Harina' : 'Afrecho'}
              </td>
              <td>
                <input
                  type="number"
                  placeholder="0"
                  value={s.measurement}
                  onChange={e => onChange(idx, 'measurement', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="0"
                  value={s.tons}
                  onChange={e => onChange(idx, 'tons', e.target.value)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Section Label ──────────────────────────────────────────
function SectionLabel({ icon, label, color = 'var(--fap-text-muted)' }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color,
      textTransform: 'uppercase', letterSpacing: 1.5,
      marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7,
    }}>
      <i className={`bi ${icon}`} />
      {label}
    </p>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function RegistroMolino() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [alert, setAlert]         = useState(null);   // { type: 'success'|'error', msg }
  const [sending, setSending]     = useState(false);

  // Generic field updater
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Silo array updater
  const updateSilo = (arrayKey, idx, field, value) => {
    setForm(f => {
      const arr = [...f[arrayKey]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [arrayKey]: arr };
    });
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.date || !form.shift || !form.operator) {
      setAlert({ type: 'error', msg: 'Complete los campos obligatorios: Fecha, Turno y Operador.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSending(true);
    setAlert(null);
    try {
      await createRecord(form);
      setAlert({ type: 'success', msg: 'Registro enviado exitosamente al servidor.' });
      setForm(INITIAL_FORM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setAlert({ type: 'error', msg: `Error al enviar: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setAlert(null);
  };

  const jsonPayload = JSON.stringify(buildPayload(form), null, 2);

  return (
    <div className="page-fade" style={{ padding: 24 }}>

      {/* Alert */}
      {alert && (
        <div className={`alert-fap alert-${alert.type}`}>
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ fontSize: 16 }} />
          {alert.msg}
          <button
            onClick={() => setAlert(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <i className="bi bi-x" />
          </button>
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h6>
            <i className="bi bi-pencil-square" style={{ color: 'var(--fap-green)' }} />
            Formulario de Registro — Molino
          </h6>
          <span style={{ fontSize: 11, color: 'var(--fap-text-muted)' }}>
            * Campos obligatorios
          </span>
        </div>

        <div className="section-body">

          {/* ── 1. HEADER INFO ── */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Turno *</label>
              <select
                className="form-select"
                value={form.shift}
                onChange={e => set('shift', e.target.value)}
              >
                <option value="">--</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Operador *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del operador"
                value={form.operator}
                onChange={e => set('operator', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Ayudante</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del ayudante"
                value={form.assistant}
                onChange={e => set('assistant', e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Se recibe turno</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Molienda del Blando y Durum activa"
                value={form.shift_description}
                onChange={e => set('shift_description', e.target.value)}
              />
            </div>
          </div>

          <hr className="fap-separator" />

          {/* ── 2. WG READINGS ── */}
          <SectionLabel icon="bi-speedometer" label="Lecturas de Fluxómetros (WG)" color="var(--fap-text-muted)" />
          <div className="row g-3 mb-3">
            {[
              { label: 'Durum WG401',   field: 'wg_durum_wg401', ph: '0' },
              { label: 'WG501',         field: 'wg_wg501',       ph: '20000' },
              { label: 'WG503',         field: 'wg_wg503',       ph: '5000' },
              { label: 'Blando WG201',  field: 'wg_soft_wg201',  ph: '0' },
              { label: 'WG301',         field: 'wg_wg301',       ph: '15000' },
              { label: 'WG303',         field: 'wg_wg303',       ph: '3000' },
            ].map(({ label, field, ph }) => (
              <div className="col-6 col-md-2" key={field}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={ph}
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          <hr className="fap-separator" />

          {/* ── 3. SILOS ── */}
          <div className="row g-4 mb-3">
            <div className="col-12 col-md-4">
              <SectionLabel icon="bi-grid-3x3" label="Silos Blando" color="var(--fap-yellow)" />
              <SiloTable
                silos={form.soft_silos}
                accentColor="var(--fap-yellow-light)"
                onChange={(idx, field, val) => updateSilo('soft_silos', idx, field, val)}
              />
            </div>
            <div className="col-12 col-md-4">
              <SectionLabel icon="bi-grid-3x3-gap" label="Silos Durum" color="var(--fap-red-light)" />
              <SiloTable
                silos={form.durum_silos}
                accentColor="var(--fap-red-light)"
                onChange={(idx, field, val) => updateSilo('durum_silos', idx, field, val)}
              />
            </div>
            <div className="col-12 col-md-4">
              <SectionLabel icon="bi-boxes" label="Harina & Afrecho" color="var(--fap-green-light)" />
              <FlourBranTable
                silos={form.flour_bran_silos}
                onChange={(idx, field, val) => updateSilo('flour_bran_silos', idx, field, val)}
              />
            </div>
          </div>

          <hr className="fap-separator" />

          {/* ── 4. FLOWMETERS & ADDITIVES ── */}
          <SectionLabel icon="bi-activity" label="Fluxómetros Absolutos y Aditivos" />
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <label className="form-label">Fluxómetro Blando</label>
              <input type="number" className="form-control"
                value={form.soft_flowmeter}
                onChange={e => set('soft_flowmeter', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Valor Absoluto Blando</label>
              <input type="number" className="form-control"
                value={form.soft_absolute_value}
                onChange={e => set('soft_absolute_value', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Fluxómetro Durum</label>
              <input type="number" className="form-control"
                value={form.durum_flowmeter}
                onChange={e => set('durum_flowmeter', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Valor Absoluto Durum</label>
              <input type="number" className="form-control"
                value={form.durum_absolute_value}
                onChange={e => set('durum_absolute_value', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Aditivos mezclados</label>
              <input type="text" className="form-control" placeholder="Ej: 10 kg"
                value={form.mixed_additives}
                onChange={e => set('mixed_additives', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Aditivos sin mezclar</label>
              <input type="text" className="form-control" placeholder="Ej: 3 bolsos"
                value={form.unmixed_additives}
                onChange={e => set('unmixed_additives', e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Residuo de imanes (g)</label>
              <input type="number" className="form-control" placeholder="gramos"
                value={form.magnet_residue_grams}
                onChange={e => set('magnet_residue_grams', e.target.value)} />
            </div>
          </div>

          <hr className="fap-separator" />

          {/* ── 5. OBSERVATIONS ── */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Anote cualquier incidencia, alarma o novedad del turno..."
                value={form.observations}
                onChange={e => set('observations', e.target.value)}
              />
            </div>
          </div>

          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn-fap btn-fap-outline" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise" /> Limpiar
            </button>
            
            <button className="btn-fap btn-fap-green" onClick={handleSubmit} disabled={sending}>
              {sending
                ? <><i className="bi bi-hourglass-split" /> Procesando...</>
                : <><i className="bi bi-send" /> Guardar Registro</>
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
