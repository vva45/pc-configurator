# Forge Visual North Star

This document is the permanent product reference for Forge's future visual evolution. It records a direction, not an implementation specification or authorization to begin a future phase. Phase 4's SVG remains the current implementation and useful fallback.

## Product principle

The PC should progressively become the configurator's **visual protagonist**. The interface supports the machine rather than competing with it. The intended hierarchy is:

1. PC / visual scene;
2. current category;
3. component options;
4. actions and tools;
5. secondary instrumentation.

This is intentionally different from a dashboard of three equivalent panels. The approved external reference informs composition, hierarchy, and experience only. Forge must not copy another brand's branding, logos, assets, wording, proprietary iconography, exact colors, 3D models, pixel-perfect layout, or trade dress.

## Destination composition

- **Compact top bar:** Forge brand, status/price, and global actions.
- **Left category rail:** primary categories, vertical navigation, and build state, clearly subordinate to the PC.
- **Central 3D stage:** a large three-quarter-perspective PC, environmental lighting, orbit/camera controls, inspection, and a representation of the real build.
- **Compact right tool rail:** camera, expand, reset view, and—when supported—exploded view.
- **Bottom component deck:** horizontally browsable compact options for the active category, essential specifications, price, compatibility, and purchase action.

The object should receive most of the visual attention: fewer simultaneous panels, fewer competing borders, less permanently visible copy, more negative space, and contextual secondary information.

## Forge visual identity

The destination extends rather than replaces the established PCB / FR-4 language:

- near-black FR-4 and dark graphite foundations;
- dark green structural surfaces;
- restrained ENIG gold for functional emphasis;
- cyan for functional confirmation;
- red and amber only for meaningful states;
- contained ambient lighting and, at most, a subtle halo or grading behind the PC.

It must feel like Forge—not violet reference artwork, generic RGB gaming UI, glassmorphism, or a generic storefront.

## Future 3D product direction

The future PC may show a visible chassis in three-quarter perspective, a partially visible interior, and components derived from the real `VisualBuildModel`. Soft shadows, physically plausible but restrained lighting, dark materials, functional accents, and an orbit/turntable presentation should create a premium product feeling. Extreme photorealism is not required; clarity, performance, identity, and interaction take priority.

The desired interaction is physical and causal:

- selecting a category focuses or highlights its zone;
- selecting or changing a component updates its representation;
- a conflict visibly marks the affected zone;
- the next step may receive a restrained ENIG signal.

Forge should feel like configuring a physical machine, not merely completing a form. No part should be selected automatically as a consequence of visual navigation.

## Two complementary experiences

Forge must retain both layers:

### Technical / engineering

Lists, filters, compatibility, detailed specifications, POST, Forge Score, power, and instrumentation remain first-class capabilities. The existing technical mode may preserve its current Forge density.

### Visual / assembly

The PC scene, focused category, component deck, camera, and assembly visualization provide a more spatial product experience. This mode favors fewer panels, more negative space, and contextual disclosure.

A cinematic composition must not remove technical capability merely to make a cleaner screenshot.

## Responsive direction

The desktop reference must not be compressed literally onto a phone. At 360, 390, and 430 px, the future direction is a top or full-screen stage, compact category tabs/rail, component deck below, accessible touch-first camera controls, and a safe fallback. Five desktop columns must never be forced into 390 px.

## Performance and resilience

Any future 3D implementation must be lazy-loaded and code-split. Avoid loading a 3D runtime when the user never enters the 3D view where practical. Use adaptive DPR and quality, honor reduced motion, and degrade safely on mobile. Phase 4's SVG remains a valuable accessible, lightweight fallback.

## Governance

This North Star guides Phase 5 and later visual work but starts none of it. Each phase still requires explicit scope, implementation, validation, review, and approval. In particular, this document does not authorize installing Three.js, creating a 3D canvas, or redesigning the current shell.
