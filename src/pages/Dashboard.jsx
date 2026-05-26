import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { getRecords } from '../services/molinoService';

// Demo data used when the backend is not yet connected
const DEMO_RECORDS = [
  {
    id: 1, date: '2026-05-22', shift: 'A',
    operator: 'Liberato Escalona', assistant: 'Pedro Ramos',
    soft_silos:  [{ tons: 37.5 }, { tons: 35 }, { tons: 0 }, { tons: 0 }, { tons: 0 }, { tons: 35 }],
    durum_silos: [{ tons: 32.5 }, { tons: 50 }, { tons: 15 }, { tons: 15 }],
    flour_bran_silos: [
      { type: 'flour', tons: 0 }, { type: 'flour', tons: 29 },
      { type: 'bran', tons: 15 }, { type: 'bran', tons: 0 },
    ],
    magnet_residue_grams: 56,
    observations: 'Se disparó Inversa RM402\nSe paró molienda del Durum. Motor RH506.',
  },
  {
    id: 2, date: '2026-05-21', shift: 'B',
    operator: 'Jorge Pérez', assistant: 'Luis Medina',
    soft_silos:  [{ tons: 40 }, { tons: 30 }, { tons: 25 }, { tons: 0 }, { tons: 0 }, { tons: 0 }],
    durum_silos: [{ tons: 30 }, { tons: 28 }, { tons: 14 }, { tons: 10 }],
    flour_bran_silos: [
      { type: 'flour', tons: 0 }, { type: 'flour', tons: 25 },
      { type: 'bran', tons: 10 }, { type: 'bran', tons: 0 },
    ],
    magnet_residue_grams: 32,
    observations: 'Sin novedades',
  },
  {
    id: 3, date: '2026-05-21', shift: 'A',
    operator: 'María Torres', assistant: 'Ana Rivas',
    soft_silos:  [{ tons: 38 }, { tons: 35 }, { tons: 0 }, { tons: 0 }, { tons: 0 }, { tons: 27.5 }],
    durum_silos: [{ tons: 35 }, { tons: 45 }, { tons: 0 }, { tons: 10 }],
    flour_bran_silos: [
      { type: 'flour', tons: 0 }, { type: 'flour', tons: 22 },
      { type: 'bran', tons: 12 }, { type: 'bran', tons: 0 },
    ],
    magnet_residue_grams: 44,
    observations: 'Motor RH506 disparado durante molienda Durum.',
  },
];

function sumTons(silos = []) {
  return silos.reduce((a, s) => a + (parseFloat(s.tons) || 0), 0);
}

function hasIncident(obs = '') {
  return /paró|alarm|disparó|falla/i.test(obs);
}

export default function Dashboard() {
  const [records, setRecords]   = useState(DEMO_RECORDS);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecords()
      .then(data => setRecords(data))
      .catch(() => { /* keep demo data */ })
      .finally(() => setLoading(false));
  }, []);

  // Aggregate stats from the most recent record
  const latest     = records[0] || {};
  const totalSoft  = sumTons(latest.soft_silos);
  const totalDurum = sumTons(latest.durum_silos);
  const totalFlour = (latest.flour_bran_silos || []).filter(s => s.type === 'flour').reduce((a, s) => a + (parseFloat(s.tons) || 0), 0);
  const totalBran  = (latest.flour_bran_silos || []).filter(s => s.type === 'bran').reduce((a, s)  => a + (parseFloat(s.tons) || 0), 0);

  return (
    <div className="page-fade" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--fap-text-muted)', marginBottom: 2 }}>
          Resumen del último turno registrado
        </p>
        <h5 style={{ fontWeight: 700, color: 'var(--fap-text)', fontFamily: 'var(--fap-font-display)', letterSpacing: 0.5 }}>
          Operaciones del Molino
        </h5>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard color="green"  label="Harina Total"    value={`${totalFlour} t`} sub="Silos 701 + 702"    icon="bi-boxes" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard color="yellow" label="Trigo Blando"    value={`${totalSoft} t`}  sub="Silos 201 – 206"   icon="bi-grid-3x3" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard color="red"    label="Trigo Durum"     value={`${totalDurum} t`} sub="Silos 401 – 404"   icon="bi-grid-3x3-gap" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard color="blue"   label="Afrecho Total"   value={`${totalBran} t`}  sub="Silos 703 + 704"   icon="bi-archive" />
        </div>
      </div>

      <div className="row g-3">
        {/* Recent records table */}
        <div className="col-12 col-lg-8">
          <div className="section-card">
            <div className="section-header">
              <h6>
                <i className="bi bi-table" style={{ color: 'var(--fap-green)' }} />
                Últimos Registros
              </h6>
              {loading
                ? <span className="badge-fap badge-yellow">Cargando...</span>
                : <span className="badge-fap badge-green">{records.length} registros</span>
              }
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="fap-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Operador</th>
                    <th>Blando (t)</th>
                    <th>Durum (t)</th>
                    <th>Harina (t)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 8).map(r => {
                    
                    const s  = (sumTons(r.soft_silos) || 0).toFixed(2);
                    const d  = (sumTons(r.durum_silos) || 0).toFixed(2);
                    const fl = (r.flour_bran_silos || [])
                      .filter(x => x.type === 'flour')
                      .reduce((a, x) => a + (parseFloat(x.tons) || 0), 0)
                      .toFixed(2);
                    const incident = hasIncident(r.observations);
                    return (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.date}</td>
                        <td>
                          <span style={{
                            background: 'rgba(45,156,78,0.15)', color: 'var(--fap-green-light)',
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                          }}>{r.shift}</span>
                        </td>
                        <td>{r.operator}</td>
                        <td className="text-yellow">{s}</td>
                        <td className="text-red">{d}</td>
                        <td className="text-green">{fl}</td>
                        <td>
                          <span className={`badge-fap ${incident ? 'badge-yellow' : 'badge-green'}`}>
                            {incident ? 'Incidencia' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent observations */}
        <div className="col-12 col-lg-4">
          <div className="section-card" style={{ height: '100%' }}>
            <div className="section-header">
              <h6>
                <i className="bi bi-exclamation-triangle" style={{ color: 'var(--fap-yellow)' }} />
                Observaciones
              </h6>
            </div>
            <div className="section-body">
              {records
                .filter(r => r.observations && r.observations.trim())
                .slice(0, 4)
                .map(r => (
                  <div key={r.id} style={{
                    borderLeft: `3px solid ${hasIncident(r.observations) ? 'var(--fap-red)' : 'var(--fap-border)'}`,
                    paddingLeft: 10, marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--fap-text-muted)', marginBottom: 3 }}>
                      {r.date} · Turno {r.shift} · {r.operator}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#ccc', lineHeight: 1.6 }}>
                      {r.observations.split('\n')[0]}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
