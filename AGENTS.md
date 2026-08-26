<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Forge — Project Instructions

## Source of truth

- GitHub `main` is the official source of truth for Forge.
- Never depend on user-local paths, clones, files, or another computer.
- Never assume that previous conversations or prior Codex sessions are available.
- Read this `AGENTS.md` and the project documentation in `docs/` before implementing changes.
- Use `docs/PROJECT_STATE.md` for the recorded baseline, `docs/DESIGN_SYSTEM.md` for the current visual language, and `docs/ROADMAP.md` for high-level future direction.

## Git workflow

- Never implement a new phase directly on `main`.
- Start a new branch from the current remote GitHub `main`; verify the remote baseline before editing.
- Use one branch per phase.
- Do not merge into `main` automatically unless the user explicitly instructs you to do so.
- Stop after completing each phase. Do not begin the next phase automatically.
- The user reviews the deployment Preview before approving a merge.

## Existing architecture

- Forge uses Next.js 16, React 19, and TypeScript.
- `src/components/configurator/Configurator.tsx` is the main client orchestrator. It composes `BuildPane`, `CatalogPane`, and `StatusPane`.
- `/api/parts` serves the server-side catalog in filtered, sorted, compatibility-aware pages. Do not move the complete catalog into the client bundle.
- `/api/build` resolves serialized build URL parameters into complete selected parts.
- The compatibility engine gates part selection, identifies conflicts, and produces the POST report.
- The power engine calculates worst-case, gaming, transient-spike, and recommended-PSU values.
- Builds can be shared and restored through URL query parameters; restoration is resolved on the server and revalidated in the client.

## Regression protection

Preserve all existing behavior unless a task explicitly changes it. In particular, do not break:

- part selection, multi-select categories, quantities, and removal;
- filters, search, sorting, pagination, and legacy/museum visibility;
- compatibility gating, blocked reasons, and selected-part conflict indication;
- automatic category progression and manual next-step progression for multi-select categories;
- POST reporting and power calculation;
- region and currency presentation;
- shopping list and `StoreSheet` purchase links;
- build sharing and restoration from the URL.

## Design identity

- Forge is a premium engineering workstation and technical hardware lab inspired by PCB / FR-4 materials.
- Use near-black, dark PCB green surfaces with restrained ENIG gold as a functional accent.
- The catalog is the primary workspace; build controls and system instrumentation support it.
- Preserve the premium-hardware, technical-instrument character.
- Do not turn Forge into generic RGB gaming UI, glassmorphism, a neon-heavy interface, a generic SaaS dashboard, or a generic storefront.

## Responsive

- **Desktop, wider than 1180 px:** three panels — Build, Catalog, and System Status.
- **Tablet, 901–1180 px:** Build and Catalog remain visible; System Status is currently hidden.
- **Mobile, 900 px and below:** tabs switch between `Montaje`, `Catálogo`, and `Consumo y POST`, with one panel visible at a time.

## Validation

Before finishing any implementation phase, run:

1. typecheck;
2. lint;
3. tests / `npm run verify`;
4. production build;
5. responsive validation for the viewports affected by the task.

Report any real new failure clearly. Do not automatically attribute a failure to historical problems or to another environment; reproduce it and assess it against the current branch first.

Documentation-only changes may use a documentation-specific validation scope when the task explicitly allows it, but must still verify the diff, referenced paths, and that executable files were not changed.

## Scope discipline

- Do not expand the scope of a phase on your own initiative.
- Do not start the next phase automatically.
- Do not perform large refactors unless they are explicitly requested.
- Prefer small, reviewable changes with a clear relationship to the requested phase.
