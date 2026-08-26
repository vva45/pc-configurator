# Forge — Current Project State

This document records the repository state verified during the Codex Cloud audit on **2026-08-25**. It describes the current baseline, not future implementation requirements. Revalidate changing facts such as the remote `main` commit, catalog size, and test counts before treating them as current in a later task.

## Current production baseline

- Repository: `vva45/pc-configurator`
- Official source of truth: GitHub `main`
- Audited `main`: `6acd21bbae4fbb381180e0b02321ed4005b4c1c7`
- PR #1: **Merge Forge Phase 1 shell into main**
- PR #1 status at audit: merged into `main`

The audited checkout and the GitHub `refs/heads/main` reference both resolved to the commit above. The repository alone does not prove which commit an external production deployment is serving; verify the deployment separately when that distinction matters.

## Phase 1

### Phase 1

- Commit: `cef98500b9e0df646aed6850ae85a6d9c2445429`
- Message: `feat: redesign Forge phase 1 shell`
- Result: established the redesigned Forge shell and its PCB-inspired visual treatment in `src/app/globals.css`.

### Phase 1.1

- Commit: `dd12cb39279ee0f7cfa5a97268c9e51c9919ce3f`
- Message: `style: polish Forge phase 1 responsive shell`
- Result: refined the engineering-workstation surface hierarchy, three-panel presentation, header, component states, and responsive behavior.

### Phase 1.2

- Commit: `f3f1a530839d16ef8540049c1e048d268edc0322`
- Message: `style: final polish Forge phase 1 shell`
- Result: completed final responsive polish, including mobile density, empty System Status sizing, safe-area spacing, and compact header details.

### Merge

- Commit: `6acd21bbae4fbb381180e0b02321ed4005b4c1c7`
- Message: `Merge pull request #1 from vva45/v2-phase-1-shell`

**Phase 1 status: COMPLETE / APPROVED / MERGED.**

The three Phase 1 commits changed only `src/app/globals.css`. They did not change configurator behavior, APIs, catalog data, dependencies, or the compatibility and power engines.

## Current functionality

The audit verified that Forge currently provides:

- a server-side parts catalog exposed in compatibility-aware, filtered, sorted pages;
- free-text search, specification filters, sorting, legacy/museum visibility, and incremental pagination;
- single-part and multi-part category selection, quantities, removal, and build totals;
- compatibility gating with visible blocked reasons;
- identification of selected components that conflict with the rest of the build;
- automatic progression after single-select categories and when RAM fills the available DIMM slots;
- manual next-step guidance after a selection in multi-select categories;
- worst-case, gaming, transient-spike, and recommended-PSU calculations;
- a POST report with OK, warning, and failure states;
- region/currency presentation and region-specific store search links;
- per-part `StoreSheet`, whole-build shopping list, and tower summary;
- build sharing through URL query parameters and server-assisted restoration through `/api/build`;
- desktop, tablet, and tab-based mobile layouts.

These capabilities form the regression baseline. A visual or UX phase must preserve them unless its explicit task says otherwise.

## Catalog state

The 2026-08-25 audit validated **16,458 catalog items**. This is a dated validation result, not a permanent catalog constant: re-run the repository verification before quoting it as the current count after catalog changes.

The audited distribution included the full set of core, auxiliary, expansion, network, and peripheral categories represented by `src/data/categories.ts`.

## Current validation baseline

Results recorded on 2026-08-25 from the audited `main` baseline:

| Check | Result |
| --- | --- |
| `npm run verify` | **PASS** |
| Engine assertions | **4,461 PASS / 0 failures** |
| Catalog audit | **16,458 items / 0 problems** |

`npm run verify` runs typecheck, lint, the bundled engine suite, and the catalog audit. The audit emitted non-failing environment/tooling notices about npm's `http-proxy` environment configuration and Babel deoptimizing formatting for very large catalog modules; neither caused a validation failure.

## Known architectural observations

These are current facts and review considerations, not automatic tasks and not authorization to refactor:

- `src/app/globals.css` retains historical base layers followed by Phase 1 overrides, including repeated responsive breakpoints.
- Some Phase 1 CSS selectors depend on the current DOM hierarchy and positional child selectors in `Configurator.tsx` and its children.
- In the 901–1180 px tablet range, the current UI shows Build and Catalog while `SYSTEM STATUS` is hidden; mobile status tabs begin at 900 px.
- `README.md` contains historical catalog counts and validation figures that are older than the baseline recorded here. Treat this file as the operational state reference for those changing facts.
- Mobile safe-area rules reserve space for independently injected floating controls that are not implemented in this repository.
- Region selection changes the displayed currency symbol and store set; it does not perform live exchange-rate conversion.

Do not “fix” any of these observations unless a future task explicitly includes that work.
