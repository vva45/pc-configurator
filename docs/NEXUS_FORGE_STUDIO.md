# FORGE × NEXUS — unified studio

Implemented 2026-09-29 from FORGE main `270630a`. NEXUS reference: project `appgprj_6a9bf8c3a3f88191953d18d6d21934d1`, local source commit `9d691edd5249b2aa3e4a6b886925b462d52f882f` (version 8). This repository remains the source of truth for the combined application.

## Product

- A single selected-build state drives the category rail, 3D scene, catalog, technical sheet, game simulation, shopping list and shared URL.
- A fresh visit starts with an editable complete example (Ryzen 7 7800X3D, RTX 5070 Ti Gaming Trio, 32 GB DDR5, 2 TB SSD, O11 Dynamic EVO). Explicit shared URLs take priority. `?empty=1` preserves a deliberately cleared build across reloads.
- Configurador contains the large interactive PC, component selection, installed-parts overview and three configurable game cards.
- Ficha técnica contains expandable descriptions and specifications, quantities/removal, connection details, power, POST, share and text export.
- Taller avanzado preserves the original catalog, filtering, pagination, accessories and instrumentation.
- Prices remain EUR catalog references in every region. Region changes store links; there is no fabricated exchange-rate conversion.

## Rendering and data boundaries

The FORGE server catalog, compatibility engine, power engine and physical scene normalization remain intact. The NEXUS renderer is not copied wholesale because it only understands its own restricted case/component IDs. Principal, interior, front and rear camera presets, zoom controls, visible dimensions and improved fan geometry use the existing FORGE physical model. No hardware is scaled to force it into a chassis.

These are procedural representations based on available catalog dimensions and inferred mounting profiles, not manufacturer CAD. Exact internal mounting geometry and cosmetic details remain approximate. Mixed storage and specialized hardware are not exhaustively represented as manufacturer-specific 3D models. The technical sheet shows the selected catalog model regardless of visualization coverage.

## Game simulation

`src/data/games.ts` contains 117 NEXUS game profiles and compact editorial CPU/GPU indices. It does not import the full hardware catalog into the browser. The module matches exact normalized CPU names and unambiguous GPU family + VRAM keys; unsupported, ambiguous and unknown models do not receive default performance values.

The original NEXUS smooth-minimum CPU/GPU formula produces illustrative FPS ranges. Resolution/quality factors are editorial, not calibrated benchmark results; +/-17% specific and +/-27% genre intervals are not statistical error bounds. The UI explicitly labels simulated results and distinguishes genre-only profiles. Native rendering, no RT, no upscaling, no frame generation. Configuration conflicts suppress results. Incomplete builds are identified. FORGE integrity scoring remains separate.

Game choices, quality and selected resolution live in the configurator shell, so switching to the technical sheet or advanced workshop and back preserves them. These preferences last for the open page session; they are not included in shared hardware URLs. The shell imports their TypeScript type only, keeping the game library in the dynamically loaded panel.

## Regression corrections

M.2/SATA slot gating and POST now count quantities of repeated storage references. PCIe 5.0 SSD warnings also count physical units. Catalog request errors expose a retry action; stale requests are aborted when the query changes.

## Validation

- `npm run verify`: TypeScript, ESLint, 4,662 engine assertions, 16,458 catalog references with no audit issues, game simulation checks and technical-sheet checks.
- `npm run build`: production compilation.
- Browser: desktop/tablet/mobile layouts; initial build and shared build restoration; quantity updates; empty-state persistence; category navigation/search; 3D presets/zoom; technical-sheet share; regional shopping links; game and resolution changes.

The new tests are included in the normal test/verify pipeline. Text export is covered by automated tests; a browser download was not verified. Third-party game covers have a textual fallback when unavailable.

