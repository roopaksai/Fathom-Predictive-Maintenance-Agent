# Fathom — Predictive Maintenance Agent

A dark, industrial "command-center" frontend for a predictive-maintenance demo. It drives a shared Gradio space running a PMI-failure classification baseline, explains every prediction, and maintains an honest local history of every assessment you run.

## Pages

| Route | Module |
| --- | --- |
| `/overview` | Fleet dashboard — health summary, risk gauge, distribution, trend, attention, recent alerts + predictions |
| `/analyze` | Machine risk assessment — 6 sensor inputs + product type, one-click run |
| `/machines` | Per-machine health, latest risk, signal trend |
| `/alerts` | Alert center — file/acknowledge/resolve lifecycle |
| `/history` | Full prediction history with filters and risk trend |
| `/insights` | SHAP-style attribution + plain-language explanation of a chosen assessment |
| `/settings` | Connection, data controls, honesty & calibration notes |

## How it works

1. **Live first** — `POST /gradio_api/call/assess` streams via SSE to an assessment endpoint (`src/lib/api/gradio.ts`).
2. **Honest fallback** — if the backend is unreachable or its ZeroGPU quota is exhausted, a deterministic physics engine (`src/lib/api/fallback.ts`) takes over. Every result is labeled `Live model` or `Simulated`; the sidebar/topbar show the connection state.
3. **No invented data** — assessments are persisted to `localStorage` (zustand `persist`). Every machine, alert, trend, and insight derives from assessments actually run in this browser. The data panels in Settings clear it all.

## Configuration

The default backend is configured in `src/lib/config.ts`:

```
DEFAULT_API_BASE = "https://vvsgyuv123-predictive-maintenance-demo.hf.space"
```

It expects a Gradio 4+ app exposing `/gradio_api` with a `call/assess` routine accepting:

```
productType (L/M/H), airTemp, processTemp, speed, torque, toolWear, machineId, state
```

Options:

- Set `VITE_API_BASE` to point the app at a different Gradio instance at build time.
- In-app, the Settings page edits the API base, forces the simulated engine, and re-checks connectivity at runtime.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve the production build locally
```

`vercel.json` ships an SPA rewrite and long-lived asset caching for Vercel deploys.

## Honesty & scope

Failure probabilities and health classifications are **decision-support only** and are not certified predictions. Where a live model cannot be reached, the simulated engine is deterministic and clearly badged — it exists so the demo never breaks, not to imitate the model's calibration.