# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
npm test         # Run tests (watch mode)
npm test -- --watchAll=false   # Single test run
```

## Architecture

FAPARCA is a dark-theme React SPA for mill operations logging. The app uses React 19, React Router v7, Bootstrap 5, and Bootstrap Icons.

**Layout shell** (`App.js`): Fixed sidebar (240px, `--fap-sidebar-w`) + fixed topbar + scrollable `<main>`. On mobile (≤768px), the sidebar slides off-screen and the topbar hamburger toggles it. Responsive CSS is injected as a `<style>` tag in `App.js`.

**Pages** (all in `src/pages/`):
- `Dashboard` — reads from API on mount, falls back to `DEMO_RECORDS` silently on error. Shows stat cards for the latest record and a recent-records table.
- `RegistroMolino` — multi-section form. Form state is initialized from `INITIAL_FORM` (exported from `molinoService`). On submit, calls `createRecord()` which serializes via `buildPayload()`.
- `ConsultaRegistros` — filters records client-side after loading from API (also falls back to `DEMO_RECORDS`). Clicking a row opens a `DetailModal` rendered inline.
- `Configuracion` — persists to `localStorage` key `faparca_config`.

**Service layer** (`src/services/molinoService.js`): All HTTP calls use the native `fetch` API (not axios, despite axios being in `package.json`). Base URL from `REACT_APP_API_URL` env var (`.env` → `https://api.faparca.com/v1`). Endpoints: `POST /mill/records`, `GET /mill/records`, `GET /mill/records/:id`, `DELETE /mill/records/:id`.

**API payload convention**: All JSON keys sent to the backend are in English. UI labels and form field names use Spanish. `buildPayload()` handles the conversion. The `toNum()` helper converts string inputs to floats, returning `null` for invalid values.

**Design system** (`src/styles/faparca.css`): All brand colors, spacing, and typography are CSS custom properties under `:root` prefixed with `--fap-`. Accent colors: green (primary actions), yellow (soft wheat), red (durum wheat), blue (bran). Reusable CSS classes: `.section-card`, `.section-header`, `.section-body`, `.stat-card`, `.fap-table`, `.silo-table`, `.btn-fap`, `.badge-fap`, `.alert-fap`, `.fap-modal-overlay`, `.page-fade`. Bootstrap form classes (`.form-control`, `.form-select`) are overridden in `faparca.css` to match the dark theme.

**Incident detection**: Both Dashboard and ConsultaRegistros use the regex `/paró|alarm|disparó|falla/i` on `observations` to classify records as "Incidencia" vs "Normal".

## Environment

Copy `.env` for local dev — it is gitignored. The only variable is `REACT_APP_API_URL`.
