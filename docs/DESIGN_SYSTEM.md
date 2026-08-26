# Forge Design System

This document describes the visual system implemented through Phase 4. It is a reference for preserving Forge's identity, not a request to redesign the interface or implement the roadmap.

## Design concept

Forge is an **engineering workstation inspired by premium PCB hardware**. It should feel like a focused technical lab and a precise hardware instrument.

It is not:

- a generic storefront;
- generic gaming RGB;
- a SaaS dashboard;
- a decorative concept disconnected from component selection and system status.

The catalog is the main working surface. Build controls provide the assembly sequence, while System Status provides power and POST instrumentation.

## Palette

The current canonical values are defined in `src/app/globals.css`. Their semantic roles are:

| Token | Current value | Role |
| --- | --- | --- |
| `--board` | `#050d09` | Deep FR-4 page background and darkest foundation |
| `--board-2` | `#0a1811` | Base elevated panel/control surface |
| `--board-3` | `#10251a` | Hover and stronger elevated green surface |
| `--board-4` | `#173725` | Highest dark-green board elevation available to the shell |
| `--surface` | `#0b1d14` | General semantic surface |
| `--surface-raised` | `#102b1d` | Raised instrumentation or control surface |
| `--surface-catalog` | `#123420` | Catalog workspace emphasis |
| `--card` | `#0e291a` | Part-card surface |
| `--trace` | `#285742` | PCB traces, dividers, outlines, and inactive contacts |
| `--trace-soft` | `rgba(86,146,111,.34)` | Subdued structural separation |
| `--silk` | `#edf5ef` | Primary high-contrast PCB “silkscreen” text |
| `--silk-dim` | `#8eae9c` | Secondary labels and technical metadata |
| `--gold` | `#dfb85e` | ENIG functional emphasis |
| `--gold-dim` | `#a0803d` | Restrained secondary gold emphasis |
| `--amber` | `#E3A83C` | Warning state |
| `--red` | `#E05A48` | Error, conflict, or blocked state |
| `--cyan` | `#4FB9A5` | Successful/OK instrumentation state |

Do not invent or substitute a new palette casually. Use the semantic role of a token rather than spreading its raw value through new work.

## Surface hierarchy

### Background

`--board` is the deepest layer. Fine dots, traces, restrained radial illumination, and near-black green gradients evoke a PCB without becoming decorative noise.

### Main panels

The Build, Catalog, and System Status panels are framed workstation modules. Borders, shallow highlights, and controlled shadows separate them without creating floating glass cards.

### Catalog workspace

The catalog is the widest and most visually prominent panel. Its greener surface, stronger border, and gold section label establish it as the primary workspace.

### Filter surface

Filters sit inside the catalog as a darker, subordinate control rail. They must remain clearly part of the catalog workflow rather than compete with it.

### Cards

Part cards use a distinct green elevation, a small gold trace, and restrained hover lift. Selected and blocked cards communicate state before decoration.

### Status modules

Power, consumption detail, POST, and actions read as related instrumentation modules inside System Status. Their visual density should support scanning technical information.

### Active / selected

Active slots and selected cards use ENIG gold borders, contacts, and limited glow. Warnings use amber; errors and conflicts use red. Do not use gold as a generic background for every surface.

## Guided build states

`CORE BUILD n / N` measures only required CORE categories containing a selection. Its segments
are generated from category metadata; optional CORE parts such as the GPU do not change `N`.

Slots use one explicit state at a time:

- **SIGUIENTE:** the active, empty category and strongest orientation signal;
- **EDITANDO:** the active category already containing installed parts;
- **INSTALADO:** a filled category that is not active;
- **REQUERIDO:** an empty required category that is not active;
- **OPCIONAL:** an empty optional category that is not active;
- **CONFLICTO:** an installed part conflicts with the current build.

Text, border/contact treatment, `aria-label`, and `aria-current` must describe the same state.
Required is intentionally quieter than Next; conflict uses a limited red edge and badge rather
than flooding the full build panel.

## PartCard 2.0

The information order is brand, name, key specifications, compatibility state, reason, price,
and actions. PCB art supplies traces and the category icon without duplicating the brand.

- **Compatible:** selectable and marked in cyan.
- **Selected:** selectable, with restrained ENIG border and selected state.
- **Blocked:** not selectable, marked incompatible, and accompanied by the real reason.

Selection and “Dónde comprar” are separate native buttons: keyboard focus is visible, purchase
does not select the part, and a blocked card cannot be activated. On mobile the same semantic
classes—not positional child selectors—control a one-card-per-row hierarchy, readable reason,
price, and full-width purchase action at narrow widths.

## Typography

Forge currently uses three type families loaded in `src/app/globals.css`:

- **Archivo:** display and brand typography. Its wide, heavy uppercase treatment gives major labels an industrial hardware character.
- **IBM Plex Mono:** technical labels, values, controls, prices, POST output, and instrumentation. It provides the visual language of schematics and lab equipment.
- **Inter Tight:** primary interface and reading text. It keeps dense information compact and legible.

Uppercase eyebrow labels, restrained letter spacing, and concise technical language reinforce the workstation hierarchy. Do not apply display styling indiscriminately to body copy.

## Gold usage

ENIG gold is a functional signal reserved for:

- active state;
- selected state;
- primary calls to action;
- price and important numeric emphasis;
- keyboard focus;
- PCB-style contacts;
- important instrumentation and the main catalog label.

Gold should remain scarce enough to preserve meaning. Do not turn the whole interface gold or use broad gold gradients as generic decoration.

## Forge Intelligence

### Forge Score

Forge Score is a technical instrument, not a gamified rating. It uses a large but controlled numeric reading, a qualitative status, a compact CORE / Compatibility / POST / Power breakdown, and a restrained progress bar. ENIG gold provides the functional signal while the surrounding module remains part of the PCB workstation.

The score communicates build integrity and readiness; it is not a performance score and does not use benchmarks. Do not replace it with a generic SaaS donut, celebratory gamification, or decorative charting.

### Forge Insight

Insights are compact, modular technical signals. Severity uses icon, text, and color together rather than relying on color alone:

- **critical:** contained red treatment for conflicts or failed checks;
- **warning:** amber treatment for conditions requiring review;
- **info:** cyan/silkscreen treatment for orientation and next steps;
- **success:** restrained positive state for confirmed readiness.

Contextual actions use native buttons and the established Forge control language. Insight modules should remain scannable instrumentation, not become promotional cards or chat-style AI output.

## Phase 4 Visual Build

Phase 4 adds a lightweight SVG schematic of the machine without changing the catalog-first workstation hierarchy. Its zones communicate `empty`, `next`, `installed`, `warning`, and `conflict` states through the established semantic palette. The compact Build Control preview provides immediate assembly context; the inspector expands the same live model on desktop and mobile and lets each visual zone navigate to its existing catalog category.

`VisualBuildModel` separates selected-build normalization from presentation. The SVG consumes this stable boundary today, and future renderers should consume it rather than interpreting the complete catalog in a visual component. Installed metadata, grouped categories, quantities, next-step guidance, and compatibility states therefore remain renderer-independent.

The future destination is defined in [`docs/VISUAL_NORTH_STAR.md`](./VISUAL_NORTH_STAR.md). That direction expands Forge toward a more cinematic product experience; it does not replace the current PCB / FR-4 identity or authorize a future implementation by itself.

## Desktop

Above 1180 px, Forge is a three-panel workstation:

1. **BUILD CONTROL / 01** — categories, selected parts, quantities, conflict contacts, and build summary entry point.
2. **CATALOG / WORKSPACE / 02** — search, sort, filters, catalog results, compatibility states, and selection.
3. **SYSTEM STATUS / 03** — power instrumentation, consumption distribution, PSU guidance, POST, and build actions.

The catalog receives the largest share of width. Build and Status support the central workspace rather than appearing as three equal dashboard cards.

Forge Score and Forge Insight live at the top of System Status above the existing power and POST instrumentation.

## Tablet

From 901 px through 1180 px, Build and Catalog remain visible and System Status remains hidden. Phase 3 does not change this breakpoint or introduce a separate intelligence surface at tablet width.

## Mobile

At 900 px and below:

- the header compacts into two rows while retaining brand, region, shopping action, and total;
- sticky tabs switch between `Montaje`, `Catálogo`, and `Consumo y POST`;
- only one main panel is shown at a time;
- the catalog presents a single card per row at normal phone widths through its responsive auto-fill grid;
- System Status uses natural height when empty instead of forcing an empty viewport-height panel;
- build, catalog, status actions, and scroll targets reserve bottom space with `env(safe-area-inset-bottom)` for external floating controls and device safe areas;
- filter controls expand within the catalog rather than remaining a permanent side rail.

Forge Intelligence lives inside the existing `Consumo y POST` tab; it does not add a fourth tab. Its approximate reading order is Score, Insights, Power, POST, and actions.

At 400 px and below, the header controls and tabs compact further. Preserve legibility and tap targets when refining density.

## Motion

Motion should be:

- subtle;
- functional;
- restrained;
- used to clarify state changes and hierarchy, not to entertain.

Current patterns include slight card lift, slot movement, contact glow, a power-gauge sweep, and short panel entry motion. The global `prefers-reduced-motion: reduce` rule disables animations and transitions; preserve that behavior.

## Things to avoid

- RGB rainbow palettes;
- excessive neon or bloom;
- glassmorphism;
- giant or soft floating shadows;
- generic gaming aesthetics;
- generic ecommerce/storefront aesthetics;
- generic SaaS dashboard styling;
- gratuitous animation;
- making every border, label, and surface gold;
- reducing technical status and compatibility information to decoration.
