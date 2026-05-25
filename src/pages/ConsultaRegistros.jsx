import React, { useState, useEffect, useCallback } from 'react';
import { getRecords } from '../services/molinoService';

// ─── Demo data (same shape as API response) ─────────────────
const DEMO_RECORDS = [
  {
    id: 1, date: '2026-05-22', shift: 'A',
    operator: 'Liberato Escalona', assistant: 'Pedro Ramos',
    shift_description: 'Molienda del Blando y Durum activa',
    wg_readings: { durum_wg401: null, wg501: 20000, wg503: 5000, soft_wg201: null, wg301: 15000, wg303: 3000 },
    soft_silos:  [{ silo:201,measurement:4.5,tons:37.5},{silo:202,measurement:5,tons:35},{silo:203,measurement:0,tons:0},{silo:204,measurement:0,tons:0},{silo:205,measurement:0,tons:0},{silo:206,measurement:5,tons:35}],
    durum_silos: [{silo:401,measurement:5.5,tons:32.5},{silo:402,measurement:2,tons:50},{silo:403,measurement:4,tons:15},{silo:404,measurement:6,tons:15}],
    flour_bran_silos: [{silo:701,type:'flour',measurement:0,tons:0},{silo:702,type:'flour',measurement:6,tons:29},{silo:703,type:'bran',measurement:7,tons:15},{silo:704,type:'bran',measurement:0,tons:0}],
    soft_flowmeter:750501, soft_absolute_value:1981733052,
    durum_flowmeter:7242152, durum_absolute_value:2519965355,
    mixed_additives:'10 kg', unmixed_additives:'3 bolsos',
    magnet_residue_grams:56,
    observations:'Se disparó Inversa RM402\nSe Pasó molienda se terminó trigo Blando\nSe paró molienda del Durum se disparo motor RH506 DS',
  },
  {
    id: 2, date: '2026-05-21', shift: 'B',
    operator: 'Jorge Pérez', assistant: 'Luis Medina',
    shift_description: 'Molienda normal Blando',
    wg_readings:{}, soft_silos:[{silo:201,tons:40},{silo:202,tons:30},{silo:203,tons:25},{silo:204,tons:0},{silo:205,tons:0},{silo:206,tons:0}],
    durum_silos:[{silo:401,tons:30},{silo:402,tons:28},{silo:403,tons:14},{silo:404,tons:10}],
    flour_bran_silos:[{silo:701,type:'flour',tons:0},{silo:702,type:'flour',tons:25},{silo:703,type:'bran',tons:10},{silo:704,type:'bran',tons:0}],
    soft_flowmeter:0,soft_absolute_value:0,durum_flowmeter:0,durum_absolute_value:0,
    mixed_additives:'8 kg',unmixed_additives:'2 bolsos',magnet_residue_grams:32,
    observations:'Sin novedades',
  },
  {
    id: 3, date: '2026-05-21', shift: 'A',
    operator: 'María Torres', assistant: 'Ana Rivas',
    shift_description: 'Molienda Durum activa',
    wg_readings:{}, soft_silos:[{silo:201,tons:38},{silo:202,tons:35},{silo:203,tons:0},{silo:204,tons:0},{silo:205,tons:0},{silo:206,tons:27.5}],
    durum_silos:[{silo:401,tons:35},{silo:402,tons:45},{silo:403,tons:0},{silo:404,tons:10}],
    flour_bran_silos:[{silo:701,type:'flour',tons:0},{silo:702,type:'flour',tons:22},{silo:703,type:'bran',tons:12},{silo:704,type:'bran',tons:0}],
    soft_flowmeter:0,soft_absolute_value:0,durum_flowmeter:0,durum_absolute_value:0,
    mixed_additives:'12 kg',unmixed_additives:'1 bolso',magnet_residue_grams:44,
    observations:'Motor RH506 disparado durante molienda Durum.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────
const sumTons    = arr  => (arr || []).reduce((a, s) => a + (parseFloat(s.tons) || 0), 0);
const hasIncident = obs => /paró|alarm|disparó|falla/i.test(obs || '');
const fmtNum     = n    => (n != null && n !== '' && !isNaN(n)) ? Number(n).toLocaleString('es-VE') : '—';

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ record: r, onClose }) {
  if (!r) return null;
  const softTotal  = sumTons(r.soft_silos);
  const durumTotal = sumTons(r.durum_silos);
  const flourTotal = (r.flour_bran_silos || []).filter(s => s.type === 'flour').reduce((a, s) => a + (parseFloat(s.tons) || 0), 0);
  const branTotal  = (r.flour_bran_silos || []).filter(s => s.type === 'bran').reduce((a, s)  => a + (parseFloat(s.tons) || 0), 0);

  return (
    <div className="fap-modal-overlay" onClick={onClose}>
      <div className="fap-modal" onClick={e => e.stopPropagation()}>
        <div className="fap-modal-header">
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--fap-font-display)', color: 'var(--fap-text)' }}>
            Detalle del Registro — ID {r.id}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--fap-text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >
            <i className="bi bi-x" />
          </button>
        </div>
        <div className="fap-modal-body">
          {/* Header info */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Fecha</div>
              <div style={{ fontWeight: 600 }}>{r.date}</div>
            </div>
            <div className="col-6 col-md-2">
              <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Turno</div>
              <span style={{ background: 'rgba(45,156,78,0.2)', color: 'var(--fap-green-light)', padding: '2px 10px', borderRadius: 4, fontWeight: 700 }}>
                {r.shift}
              </span>
            </div>
            <div className="col-12 col-md-4">
              <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Operador</div>
              <div style={{ fontWeight: 600 }}>{r.operator}</div>
            </div>
            <div className="col-12 col-md-3">
              <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Ayudante</div>
              <div>{r.assistant || '—'}</div>
            </div>
            {r.shift_description && (
              <div className="col-12">
                <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Descripción del Turno</div>
                <div style={{ color: 'var(--fap-text)' }}>{r.shift_description}</div>
              </div>
            )}
          </div>

          <hr className="fap-separator" />

          {/* Totals */}
          <div className="row g-2 mb-3">
            {[
              { label: 'Blando', value: `${softTotal} t`,  color: 'var(--fap-yellow-light)' },
              { label: 'Durum',  value: `${durumTotal} t`, color: 'var(--fap-red-light)' },
              { label: 'Harina', value: `${flourTotal} t`, color: 'var(--fap-green-light)' },
              { label: 'Afrecho',value: `${branTotal} t`,  color: 'var(--fap-blue-light)' },
            ].map(({ label, value, color }) => (
              <div className="col-6 col-md-3" key={label}>
                <div style={{ background: 'var(--fap-panel)', border: '1px solid var(--fap-border)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--fap-font-display)', color }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <hr className="fap-separator" />

          {/* Silos detail */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div style={{ fontSize: 10, color: 'var(--fap-yellow)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Silos Blando</div>
              {(r.soft_silos || []).map(s => (
                <div key={s.silo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--fap-text-muted)' }}>Silo {s.silo}</span>
                  <span style={{ fontWeight: 600, color: 'var(--fap-yellow-light)' }}>{s.tons ?? 0} t</span>
                </div>
              ))}
            </div>
            <div className="col-12 col-md-4">
              <div style={{ fontSize: 10, color: 'var(--fap-red-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Silos Durum</div>
              {(r.durum_silos || []).map(s => (
                <div key={s.silo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--fap-text-muted)' }}>Silo {s.silo}</span>
                  <span style={{ fontWeight: 600, color: 'var(--fap-red-light)' }}>{s.tons ?? 0} t</span>
                </div>
              ))}
            </div>
            <div className="col-12 col-md-4">
              <div style={{ fontSize: 10, color: 'var(--fap-green-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Harina / Afrecho</div>
              {(r.flour_bran_silos || []).map(s => (
                <div key={s.silo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--fap-text-muted)' }}>Silo {s.silo} <span style={{ fontSize: 10 }}>({s.type === 'flour' ? 'Harina' : 'Afrecho'})</span></span>
                  <span style={{ fontWeight: 600, color: s.type === 'flour' ? 'var(--fap-green-light)' : 'var(--fap-blue-light)' }}>{s.tons ?? 0} t</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flowmeters & additives */}
          <hr className="fap-separator" />
          <div className="row g-2 mb-3" style={{ fontSize: 12 }}>
            {[
              { label: 'Fluxómetro Blando',    val: fmtNum(r.soft_flowmeter) },
              { label: 'Val. Abs. Blando',      val: fmtNum(r.soft_absolute_value) },
              { label: 'Fluxómetro Durum',      val: fmtNum(r.durum_flowmeter) },
              { label: 'Val. Abs. Durum',       val: fmtNum(r.durum_absolute_value) },
              { label: 'Aditivos Mezclados',    val: r.mixed_additives || '—' },
              { label: 'Aditivos Sin Mezclar',  val: r.unmixed_additives || '—' },
              { label: 'Residuo Imanes',        val: r.magnet_residue_grams != null ? `${r.magnet_residue_grams} g` : '—' },
            ].map(({ label, val }) => (
              <div className="col-6 col-md-3" key={label}>
                <span style={{ color: 'var(--fap-text-muted)', fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Observations */}
          {r.observations && (
            <>
              <hr className="fap-separator" />
              <div style={{ fontSize: 10, color: 'var(--fap-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Observaciones
              </div>
              <div style={{
                background: 'var(--fap-black)', padding: '12px 14px',
                borderRadius: 8, borderLeft: '3px solid var(--fap-red)',
                fontSize: 12.5, lineHeight: 1.7, color: 'var(--fap-text)',
                whiteSpace: 'pre-line',
              }}>
                {r.observations}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ConsultaRegistros() {
  const [records,  setRecords]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({
    date_from: '', date_to: '', shift: '', operator: '',
  });

  useEffect(() => {
    setLoading(true);
    getRecords()
      .then(data => { setRecords(data); setFiltered(data); })
      .catch(() => { setRecords(DEMO_RECORDS); setFiltered(DEMO_RECORDS); })
      .finally(() => setLoading(false));
  }, []);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const handleSearch = useCallback(() => {
    let result = [...records];
    if (filters.date_from) result = result.filter(r => r.date >= filters.date_from);
    if (filters.date_to)   result = result.filter(r => r.date <= filters.date_to);
    if (filters.shift)     result = result.filter(r => r.shift === filters.shift);
    if (filters.operator)  result = result.filter(r =>
      r.operator.toLowerCase().includes(filters.operator.toLowerCase())
    );
    setFiltered(result);
  }, [records, filters]);

  const handleReset = () => {
    setFilters({ date_from: '', date_to: '', shift: '', operator: '' });
    setFiltered(records);
  };

  return (
    <div className="page-fade" style={{ padding: 24 }}>

      {/* Detail Modal */}
      {selected && <DetailModal record={selected} onClose={() => setSelected(null)} />}

      {/* Filters */}
      <div className="section-card mb-3">
        <div className="section-header">
          <h6><i className="bi bi-funnel" style={{ color: 'var(--fap-green)' }} /> Filtros de Búsqueda</h6>
        </div>
        <div className="section-body">
          <div className="row g-3">
            <div className="col-6 col-md-2">
              <label className="form-label">Fecha Desde</label>
              <input type="date" className="form-control"
                value={filters.date_from}
                onChange={e => setFilter('date_from', e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Fecha Hasta</label>
              <input type="date" className="form-control"
                value={filters.date_to}
                onChange={e => setFilter('date_to', e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Turno</label>
              <select className="form-select"
                value={filters.shift}
                onChange={e => setFilter('shift', e.target.value)}>
                <option value="">Todos</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Operador</label>
              <input type="text" className="form-control" placeholder="Buscar operador..."
                value={filters.operator}
                onChange={e => setFilter('operator', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="col-12 col-md-3" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn-fap btn-fap-green" style={{ flex: 1 }} onClick={handleSearch}>
                <i className="bi bi-search" /> Buscar
              </button>
              <button className="btn-fap btn-fap-outline" onClick={handleReset} title="Limpiar filtros">
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section-card">
        <div className="section-header">
          <h6><i className="bi bi-table" style={{ color: 'var(--fap-green)' }} /> Resultados</h6>
          {loading
            ? <span className="badge-fap badge-yellow"><i className="bi bi-hourglass-split" /> Cargando</span>
            : <span className="badge-fap badge-green">{filtered.length} registros</span>
          }
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="fap-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Turno</th>
                <th>Operador</th>
                <th>Ayudante</th>
                <th>Blando (t)</th>
                <th>Durum (t)</th>
                <th>Harina (t)</th>
                <th>Afrecho (t)</th>
                <th>Imanes (g)</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', color: 'var(--fap-text-muted)', padding: 32 }}>
                    <i className="bi bi-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                    No se encontraron registros
                  </td>
                </tr>
              )}
              {filtered.map(r => {
                const soft  = sumTons(r.soft_silos);
                const durum = sumTons(r.durum_silos);
                const flour = (r.flour_bran_silos||[]).filter(s=>s.type==='flour').reduce((a,s)=>a+(parseFloat(s.tons)||0),0);
                const bran  = (r.flour_bran_silos||[]).filter(s=>s.type==='bran').reduce((a,s) =>a+(parseFloat(s.tons)||0),0);
                const incident = hasIncident(r.observations);
                return (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--fap-text-muted)', fontFamily: 'monospace' }}>{r.id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.date}</td>
                    <td>
                      <span style={{ background:'rgba(45,156,78,0.15)', color:'var(--fap-green-light)', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700 }}>
                        {r.shift}
                      </span>
                    </td>
                    <td>{r.operator}</td>
                    <td style={{ color: 'var(--fap-text-muted)' }}>{r.assistant || '—'}</td>
                    <td className="text-yellow">{soft}</td>
                    <td className="text-red">{durum}</td>
                    <td className="text-green">{flour}</td>
                    <td className="text-blue">{bran}</td>
                    <td>{r.magnet_residue_grams ?? '—'}</td>
                    <td>
                      <span className={`badge-fap ${incident ? 'badge-yellow' : 'badge-green'}`}>
                        {incident ? 'Incidencia' : 'Normal'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-fap btn-fap-outline"
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={() => setSelected(r)}
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
