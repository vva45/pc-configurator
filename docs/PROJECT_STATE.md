# Forge — Current Project State

This document records the repository state verified during the Phase 2 closeout on **2026-08-26**. It describes the current baseline, not future implementation requirements. Revalidate changing facts such as the remote `main` commit, catalog size, and test counts before treating them as current in a later task.

## Current production baseline

- Repository: `vva45/pc-configurator`
- Official source of truth: GitHub `main`
- Phase 2 merge baseline on `main`: `51d8857317e5dcecc7f232d47fdef2d13bbbe629`
- PR #1: Phase 1 shell, merged through `6acd21bbae4fbb381180e0b02321ed4005b4c1c7`
- PR #2: persistent project documentation, merged through `696878b`
- PR #3: Phase 2 implementation history, merged into the Phase 2 branch through `6d1bd66`
- PR #4: **V2 phase 2 build flow**, merged into `main` through `51d8857317e5dcecc7f232d47fdef2d13bbbe629`

The closeout began with the audited checkout and GitHub `refs/heads/main` both at the Phase 2
merge SHA above. The closeout commit on `main` is the commit containing this document; use Git
for its immutable SHA. Deployment status must be verified independently after publication.

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

## Phase 2

Phase 2 established guided slot states, dynamically derived required-CORE progress, `PartCard`
2.0 hierarchy, visible compatible/selected/blocked states and reasons, and responsive/mobile
orientation. The final closeout corrected active-installed slot semantics and ARIA, removed the
legacy `.slot.active` and positional PartCard styling assumptions, separated card selection from
purchase interaction, and hardened empty total, POST, power, and search states.

**Phase 2 status: COMPLETE / APPROVED / MERGED.** Production status is confirmed only after the
published closeout commit passes GitHub Actions and the production deployment reports Ready.

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

Results recorded on 2026-08-26 during the Phase 2 closeout:

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
