import React from 'react';

/**
 * StatCard — Metric summary card
 * @param {string}  color   - 'green' | 'red' | 'yellow' | 'blue'
 * @param {string}  label   - Short uppercase label
 * @param {string}  value   - Main metric value
 * @param {string}  sub     - Secondary description
 * @param {string}  icon    - Bootstrap icon class e.g. 'bi-boxes'
 */
export default function StatCard({ color = 'green', label, value, sub, icon }) {
  return (
    <div className={`stat-card ${color}`}>
      {icon && (
        <i
          className={`bi ${icon}`}
          style={{
            position: 'absolute', right: 18, top: 16,
            fontSize: 28, opacity: 0.12, color: '#fff',
          }}
        />
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
