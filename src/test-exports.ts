/* Punto de entrada del paquete de tests (.test-build/t.cjs).
   Expone los internos que consumen test-motor.cjs y audit-catalogo.cjs
   con la misma forma (__t) que el empaquetado del monolito. */
import { P } from "./data/parts";
import { CAT, CATS, GROUPS } from "./data/categories";
import { PLATFORM, gate, runPost } from "./lib/compat";
import { calcPower } from "./lib/power";
import { FILTERS, KEYSPECS } from "./lib/filters";
import { REGIONS, searchTerm, storesFor } from "./lib/regions";
import { queryCatalog } from "./lib/catalog-server";
import { analyzeForgeBuild, calculateForgeScore, generateForgeInsights } from "./lib/forge-intelligence";
import { createVisualBuildModel, getInitialVisualPart, gpuFamilyLabel, visualCapacityLabel } from "./lib/visual-build";
import { createVisual3DScene } from "./lib/visual-3d";
import { aioGeometry, createVisualHardwareProfile, inferCaseStyle, parseCaseDimensions } from "./lib/visual-hardware-profile";
import { getTabSwipeGestureOwner, isIntentionalTabSwipe } from "./lib/tab-swipe";

export const __t = {
  P, gate, runPost, calcPower, CATS, CAT, GROUPS,
  FILTERS, KEYSPECS, PLATFORM, REGIONS, storesFor, searchTerm, queryCatalog,
  analyzeForgeBuild, calculateForgeScore, generateForgeInsights,
  createVisualBuildModel, getInitialVisualPart, gpuFamilyLabel, visualCapacityLabel, createVisual3DScene,
  aioGeometry, createVisualHardwareProfile, inferCaseStyle, parseCaseDimensions,
  getTabSwipeGestureOwner, isIntentionalTabSwipe,
};
