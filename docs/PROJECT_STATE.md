# Forge — Current Project State

This document records the repository state verified during the Phase 3 documentation closeout on **2026-08-26**. It describes the current production baseline, not future implementation requirements. Revalidate changing facts such as the remote `main` commit, catalog size, and test counts before treating them as current in a later task.

## Current production baseline

- Repository: `vva45/pc-configurator`
- Official source of truth: GitHub `main`
- Audited `origin/main` SHA: `17b74b808c6571ee0d240b8d5bd99711ec488bc4`
- PR #1: Phase 1 shell, merged through `6acd21bbae4fbb381180e0b02321ed4005b4c1c7`
- PR #4: Phase 2 build flow, merged through `51d8857317e5dcecc7f232d47fdef2d13bbbe629`
- PR #5: Phase 2 closeout, implementation commit `26f75b99116b950ac82f9dc295adf4325a541c42`, merged through `e94e7a54280ad03bc11ca57e364e33d2851e5825`
- PR #6: Phase 3 Forge Intelligence, implementation commit `f6951d7ef9f91bb29847b1cd6d7bf126485af258`, merged through `17b74b808c6571ee0d240b8d5bd99711ec488bc4`

GitHub Actions completed successfully for the audited `main` SHA. Its GitHub commit status also reports the Vercel deployment as successful. Phase 3 is therefore confirmed merged and published in production.

## Phase status

| Phase | Scope | Status |
| --- | --- | --- |
| Phase 1 | Shell, responsive behavior, and Forge visual identity | **COMPLETE / APPROVED / MERGED / PRODUCTION** |
| Phase 2 | Build Flow + Part Selection UX | **COMPLETE / APPROVED / MERGED / PRODUCTION** |
| Phase 3 | Forge Intelligence: Score, Insight, and Guidance | **COMPLETE / APPROVED / MERGED / PRODUCTION** |

## Phase history

### Phase 1

Phase 1 established the redesigned shell, PCB-inspired visual treatment, three-panel presentation, and responsive behavior. Its implementation and polish commits were `cef98500b9e0df646aed6850ae85a6d9c2445429`, `dd12cb39279ee0f7cfa5a97268c9e51c9919ce3f`, and `f3f1a530839d16ef8540049c1e048d268edc0322`; PR #1 merged them into `main` through `6acd21bbae4fbb381180e0b02321ed4005b4c1c7`.

### Phase 2

Phase 2 established guided slot states, dynamically derived required-CORE progress, `PartCard` 2.0 hierarchy, visible compatible/selected/blocked states and reasons, and responsive/mobile orientation. Its final closeout corrected active-installed slot semantics and ARIA, separated card selection from purchase interaction, and hardened empty total, POST, power, and search states. PR #4 delivered the build flow and PR #5 completed its approved closeout.

### Phase 3

PR #6 added a deterministic Forge Intelligence layer:

- **Forge Score:** a 0–100 build-integrity and readiness score that is unavailable for an empty build and explicitly does not represent performance. Its compact breakdown is CORE / 35, COMPATIBILITY / 30, POST / 20, and POWER / 15. CORE completion is derived dynamically from required CORE categories, so the optional GPU does not penalize required completion. The remaining sections account for real compatibility conflicts, POST warnings/failures, and selected-PSU/power status.
- **Forge Insight:** deterministic, prioritized `critical`, `warning`, `info`, and `success` signals for compatibility conflicts, POST results, PSU margin, the next build step, and required-CORE completion.
- **Guidance:** contextual actions open the next category or PSU category and can apply the recommended minimum wattage. They reuse the configurator's existing category navigation and catalog filtering instead of introducing a parallel flow.

## Phase 3 architecture

- `src/lib/forge-intelligence.ts` contains the pure analysis layer and its real public functions: `calculateForgeScore`, `generateForgeInsights`, and `analyzeForgeBuild`.
- `src/components/configurator/ForgeIntelligence.tsx` renders the score, compact breakdown, prioritized insight modules, and native action buttons.
- `src/components/configurator/Configurator.tsx` derives the analysis input from the selected build, required categories, compatibility results, POST report, and power report, then connects guidance to existing navigation and filters.

The intelligence layer is pure and deterministic. It uses no external AI, external APIs, or benchmarks; it does not traverse or ship the complete catalog to the client. It reuses existing selected-build state, category metadata, compatibility/POST logic, power calculations, and server-side catalog workflow.

## Current functionality

The audited production baseline provides:

- a server-side parts catalog exposed in compatibility-aware, filtered, sorted pages;
- free-text search, specification filters, sorting, legacy/museum visibility, and incremental pagination;
- single-part and multi-part category selection, quantities, removal, and build totals;
- compatibility gating, visible blocked reasons, and selected-component conflict identification;
- automatic and manual category progression appropriate to single- and multi-select categories;
- worst-case, gaming, transient-spike, recommended-PSU, and POST calculations;
- Forge Score, prioritized Forge Insights, and contextual build/PSU guidance;
- region/currency presentation, store links, per-part `StoreSheet`, and a whole-build shopping list;
- build sharing through URL query parameters and server-assisted restoration through `/api/build`;
- desktop, tablet, and tab-based mobile layouts.

These capabilities form the regression baseline. A later visual or UX phase must preserve them unless its explicit task says otherwise.

## Catalog state

The 2026-08-26 closeout audit validated **16,458 catalog items with 0 problems**. This is a dated validation result, not a permanent catalog constant: re-run repository verification before quoting it after catalog changes.

## Current validation baseline

Results recorded on 2026-08-26 from the Phase 3 production baseline:

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | **PASS** |
| ESLint | **PASS** |
| Engine assertions | **4,482 PASS / 0 failures** |
| Catalog audit | **16,458 items / 0 problems** |
| `npm run verify` | **PASS** |
| Next.js production build | **PASS** |

`npm run verify` runs typecheck, lint, the bundled engine suite, and the catalog audit. Verification emitted non-failing notices about npm's `http-proxy` environment configuration and Babel deoptimizing formatting for very large catalog modules; neither caused a validation failure.

## Known architectural observations

These are current facts and review considerations, not automatic tasks and not authorization to refactor:

- `src/app/globals.css` retains historical base layers followed by Phase 1 and later overrides, including repeated responsive breakpoints.
- Some styling depends on the current DOM hierarchy in `Configurator.tsx` and its children.
- In the 901–1180 px tablet range, Build and Catalog remain visible while System Status is hidden; mobile status tabs begin at 900 px.
- Mobile safe-area rules reserve space for independently injected floating controls that are not implemented in this repository.
- Region selection changes the displayed currency symbol and store set; it does not perform live exchange-rate conversion.

Do not “fix” any of these observations unless a future task explicitly includes that work.
