# Forge Design System

This document describes the visual system currently implemented by the Phase 1 CSS. It is a reference for preserving Forge's identity, not a request to redesign the interface or implement the roadmap.

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

## Desktop

Above 1180 px, Forge is a three-panel workstation:

1. **BUILD CONTROL / 01** — categories, selected parts, quantities, conflict contacts, and build summary entry point.
2. **CATALOG / WORKSPACE / 02** — search, sort, filters, catalog results, compatibility states, and selection.
3. **SYSTEM STATUS / 03** — power instrumentation, consumption distribution, PSU guidance, POST, and build actions.

The catalog receives the largest share of width. Build and Status support the central workspace rather than appearing as three equal dashboard cards.

## Mobile

At 900 px and below:

- the header compacts into two rows while retaining brand, region, shopping action, and total;
- sticky tabs switch between `Montaje`, `Catálogo`, and `Consumo y POST`;
- only one main panel is shown at a time;
- the catalog presents a single card per row at normal phone widths through its responsive auto-fill grid;
- System Status uses natural height when empty instead of forcing an empty viewport-height panel;
- build, catalog, status actions, and scroll targets reserve bottom space with `env(safe-area-inset-bottom)` for external floating controls and device safe areas;
- filter controls expand within the catalog rather than remaining a permanent side rail.

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
