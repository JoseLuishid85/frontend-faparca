/**
 * molinoService.js
 * Centralized API calls for the Mill Control System (FAPARCA)
 * All payload field names are in English as required.
 */

const BASE_URL = process.env.REACT_APP_API_URL;

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// ─── Helper ────────────────────────────────────────────────
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── POST: Create a new mill record ────────────────────────
/**
 * @param {Object} formData  - Raw form data from RegistroMolino
 * @returns {Promise<Object>} - Created record from API
 *
 * JSON shape sent to the backend (all keys in English):
 * {
 *   date, shift, operator, assistant, shift_description,
 *   wg_readings: { durum_wg401, wg501, wg503, soft_wg201, wg301, wg303 },
 *   soft_silos:  [{ silo, measurement, tons }],
 *   durum_silos: [{ silo, measurement, tons }],
 *   flour_bran_silos: [{ silo, type, measurement, tons }],
 *   soft_flowmeter, soft_absolute_value,
 *   durum_flowmeter, durum_absolute_value,
 *   mixed_additives, unmixed_additives,
 *   magnet_residue_grams,
 *   observations
 * }
 */
export async function createRecord(formData) {
  const payload = buildPayload(formData);
  const res = await fetch(`${BASE_URL}/windmill`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─── GET: Fetch records with optional filters ───────────────
/**
 * @param {Object} filters - { date_from, date_to, shift, operator }
 * @returns {Promise<Array>}
 */
export async function getRecords() {
  const res = await fetch(`${BASE_URL}/windmill`, { headers });
  const data = await handleResponse(res);
  return data.map(normalizeRecord);
}

function parseJsonField(val) {
  if (val == null || typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return val; }
}

function normalizeRecord(r) {
  return {
    ...r,
    wg_readings:      parseJsonField(r.wg_readings),
    soft_silos:       parseJsonField(r.soft_silos),
    durum_silos:      parseJsonField(r.durum_silos),
    flour_bran_silos: parseJsonField(r.flour_bran_silos),
  };
}

// ─── GET: Fetch a single record by ID ──────────────────────
export async function getRecordById(id) {
  const res = await fetch(`${BASE_URL}/windmill/${id}`, { headers });
  return handleResponse(res);
}

// ─── DELETE: Remove a record ────────────────────────────────
export async function deleteRecord(id) {
  const res = await fetch(`${BASE_URL}/windmill/${id}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(res);
}

// ─── Payload Builder ────────────────────────────────────────
// Converts the React form state into the English-keyed API payload
export function buildPayload(f) {
  return {
    date:               f.date,
    shift:              f.shift,
    operator:           f.operator,
    assistant:          f.assistant,
    shift_description:  f.shift_description,

    wg_readings: {
      durum_wg401:  toNum(f.wg_durum_wg401),
      wg501:        toNum(f.wg_wg501),
      wg503:        toNum(f.wg_wg503),
      soft_wg201:   toNum(f.wg_soft_wg201),
      wg301:        toNum(f.wg_wg301),
      wg303:        toNum(f.wg_wg303),
    },

    soft_silos: f.soft_silos.map(s => ({
      silo:        s.silo,
      measurement: toNum(s.measurement),
      tons:        toNum(s.tons),
    })),

    durum_silos: f.durum_silos.map(s => ({
      silo:        s.silo,
      measurement: toNum(s.measurement),
      tons:        toNum(s.tons),
    })),

    flour_bran_silos: f.flour_bran_silos.map(s => ({
      silo:        s.silo,
      type:        s.type,           // 'flour' | 'bran'
      measurement: toNum(s.measurement),
      tons:        toNum(s.tons),
    })),

    soft_flowmeter:       toNum(f.soft_flowmeter),
    soft_absolute_value:  toNum(f.soft_absolute_value),
    durum_flowmeter:      toNum(f.durum_flowmeter),
    durum_absolute_value: toNum(f.durum_absolute_value),

    mixed_additives:   f.mixed_additives,
    unmixed_additives: f.unmixed_additives,
    magnet_residue_grams: toNum(f.magnet_residue_grams),

    observations: f.observations,
  };
}

// ─── Helpers ────────────────────────────────────────────────
function toNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// Initial empty form state — mirrors buildPayload structure
export const INITIAL_FORM = {
  date:              new Date().toISOString().split('T')[0],
  shift:             '',
  operator:          '',
  assistant:         '',
  shift_description: '',

  wg_durum_wg401: '', wg_wg501: '', wg_wg503: '',
  wg_soft_wg201:  '', wg_wg301: '', wg_wg303: '',

  soft_silos: [
    { silo: 201, measurement: '', tons: '' },
    { silo: 202, measurement: '', tons: '' },
    { silo: 203, measurement: '', tons: '' },
    { silo: 204, measurement: '', tons: '' },
    { silo: 205, measurement: '', tons: '' },
    { silo: 206, measurement: '', tons: '' },
  ],

  durum_silos: [
    { silo: 401, measurement: '', tons: '' },
    { silo: 402, measurement: '', tons: '' },
    { silo: 403, measurement: '', tons: '' },
    { silo: 404, measurement: '', tons: '' },
  ],

  flour_bran_silos: [
    { silo: 701, type: 'flour', measurement: '', tons: '' },
    { silo: 702, type: 'flour', measurement: '', tons: '' },
    { silo: 703, type: 'bran',  measurement: '', tons: '' },
    { silo: 704, type: 'bran',  measurement: '', tons: '' },
  ],

  soft_flowmeter:       '',
  soft_absolute_value:  '',
  durum_flowmeter:      '',
  durum_absolute_value: '',
  mixed_additives:      '',
  unmixed_additives:    '',
  magnet_residue_grams: '',
  observations:         '',
};
