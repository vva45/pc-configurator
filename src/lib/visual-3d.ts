/* ═══════════════════════════════════════════════════════════════════
   COLOCACIÓN 3D — de un VisualBuildModel a una escena montada

   Las medidas del catálogo se conservan en milímetros y se pasan a
   unidades de escena (1 unidad = 100 mm). El interior del chasis, los
   anclajes y las cotas ausentes se aproximan según formato o familia.
   Por eso los avisos de encaje son estimaciones visuales, no mediciones
   del modelo exacto ni resultados del motor de compatibilidad. Una pieza
   que no cabe conserva su tamaño y se señala; nunca se encoge para caber.

   Ejes, con el chasis en su sitio y el espectador delante del cristal:
     +X  de la bandeja de la placa hacia el panel de cristal (hacia ti)
     +Y  hacia arriba
     +Z  hacia la TRASERA del chasis (el frontal queda en −Z)
   Con esa mano derecha, mirando desde delante-izquierda-arriba, el
   cristal queda a la izquierda de la imagen y el frontal a la derecha,
   como en cualquier foto de producto. No hace falta espejar nada.

   Sobre la placa se usan coordenadas de tablero:
     u  mm desde el borde trasero (escudo I/O) hacia el frontal
     v  mm desde el borde superior hacia abajo
     h  mm de altura sobre la cara de componentes
   ═══════════════════════════════════════════════════════════════════ */
import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";
import { createVisualHardwareProfile, type CaseStyle, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

export type Vector3Tuple = [number, number, number];
export type ChassisFamily = "standard" | "airflow" | "dual-chamber" | "compact" | "sandwich";
export type RadiatorMount = "top" | "front" | "side" | "bottom" | "rear";
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Box3Tuple { min: Vector3Tuple; max: Vector3Tuple }

const U = 0.01; // mm → unidades de escena
const mm3 = (v: Vector3Tuple): Vector3Tuple => [v[0] * U, v[1] * U, v[2] * U];
const finite = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const positive = (value: unknown, fallback: number) => { const result = finite(value, fallback); return result > 0 ? result : fallback; };
const clamp = (value: unknown, fallback: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, finite(value, fallback)));
const boxAt = (center: Vector3Tuple, size: Vector3Tuple): Box3Tuple => ({
  min: [center[0] - size[0] / 2, center[1] - size[1] / 2, center[2] - size[2] / 2],
  max: [center[0] + size[0] / 2, center[1] + size[1] / 2, center[2] + size[2] / 2],
});
const union = (a: Box3Tuple, b: Box3Tuple): Box3Tuple => ({
  min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
  max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])],
});

/* ── Formatos de placa: alto × fondo en mm, ranuras de expansión y DIMM ─
   El alto (305 en ATX) va vertical en una torre; el fondo (244) va del
   escudo I/O hacia el frontal. Las ranuras de expansión van a 20,32 mm
   de paso por debajo de la zona I/O, que ocupa los 160 mm superiores. */
export interface BoardSpec {
  form: "E-ATX" | "ATX" | "Micro-ATX" | "Mini-ITX";
  h: number; d: number;            // alto y fondo del PCB
  slots: number;                   // ranuras de expansión en el borde trasero
  dimm: number;                    // zócalos de memoria
  socket: [number, number];        // centro del zócalo de CPU (u, v)
  ramU0: number; ramPitch: number; // primer zócalo DIMM y separación
  ramLen: number; ramV0: number;   // largo del zócalo (133 mm) y dónde empieza
  pcieV: number;                   // v del centro de la ranura ×16 principal
  pcieU0: number; pcieLen: number; // dónde empieza y cuánto mide el conector ×16
  m2: Array<[number, number]>;     // centros de M.2 2280 (u, v), tumbados
  ioV: [number, number];           // tramo v del bloque de puertos traseros
  slot0V: number;                  // centro v de la primera ranura de expansión (las tapas van a 20,32 mm)
  chipset: [number, number];       // centro del disipador del chipset
  atx24: [number, number];         // conector de 24 pines, de canto en el borde delantero
  eps: [number, number];           // conector EPS de 8 pines de la CPU, arriba junto al I/O
  sata: [number, number];          // bloque de puertos SATA acodados, borde delantero
  fp: [number, number];            // cabecera del panel frontal, esquina inferior delantera
}
export function boardSpec(form: unknown, dimm?: unknown): BoardSpec {
  const f = String(form || "ATX").toLowerCase();
  const itx = f.includes("itx"), micro = f.includes("micro") || f.includes("matx"), eatx = f.includes("e-atx") || f.includes("eatx");
  const dimmSlots = Math.round(clamp(dimm, itx ? 2 : 4, 1, 8));
  /* ITX: los DIMM van pegados al canto delantero, la ranura ×16 al canto inferior y
     el M.2 tumbado entre el zócalo y la ranura. */
  if (itx) return { form: "Mini-ITX", h: 170, d: 170, slots: 1, dimm: Math.min(2, dimmSlots), socket: [88, 66], ramU0: 138, ramPitch: 10, ramLen: 133, ramV0: 10, pcieV: 160, pcieU0: 45, pcieLen: 89, m2: [[70, 140]], ioV: [10, 135], slot0V: 160, chipset: [40, 122], atx24: [161, 100], eps: [40, 8], sata: [160, 152], fp: [150, 163] };
  const h = micro ? 244 : 305, d = eatx ? 305 : 244;
  return {
    form: eatx ? "E-ATX" : micro ? "Micro-ATX" : "ATX", h, d, slots: micro ? 4 : 7, dimm: dimmSlots,
    socket: [125, 72], ramU0: 183, ramPitch: 10, ramLen: 133, ramV0: 12,
    pcieV: 160 + 1.5 * 20.32, pcieU0: 50, pcieLen: 89,
    m2: micro ? [[110, 128]] : [[110, 128], [110, 250]],
    /* El escudo I/O acaba 5 mm antes de la primera tapa de ranura (161): no se tocan. */
    ioV: [10, 156], slot0V: 160 + 10.16, chipset: [205, h - 70],
    atx24: [d - 9, 112], eps: [45, 8], sata: [d - 6, micro ? 190 : 200], fp: [d - 20, h - 8],
  };
}

/* ── Chasis ──────────────────────────────────────────────────────────── */
export interface MountPlane { mount: RadiatorMount; center: Vector3Tuple; normal: Vector3Tuple; longAxis: "y" | "z"; capacityMm: number; spanMm: number }
export interface FanSlot { position: Vector3Tuple; normal: Vector3Tuple; size: number; where: RadiatorMount }
export interface ChassisLayout {
  family: ChassisFamily;
  size: Vector3Tuple;                      // exterior en mm: ancho X, alto Y, fondo Z
  shell: Box3Tuple; interior: Box3Tuple;   // exterior y espacio útil, en mm
  chamber: Box3Tuple;                      // cámara principal, delante de la bandeja
  gpuChamber?: Box3Tuple;                  // en un sándwich, el hueco de la gráfica al otro lado de la bandeja
  trayX: number;                           // X de la cara de la bandeja donde apoyan los separadores
  boardFaceX: number;                      // X de la cara de componentes del PCB
  boardTopY: number; boardRearZ: number;   // borde superior y trasero de la placa
  board: BoardSpec;
  shroud?: Box3Tuple;                      // cubierta de la fuente, si la hay
  psuBay: { center: Vector3Tuple; vertical: boolean; top: boolean; front?: boolean };
  driveBay: { origin: Vector3Tuple; step: Vector3Tuple; vertical: boolean; room: number };
  mounts: Partial<Record<RadiatorMount, MountPlane>>;
  fanSlots: FanSlot[];
  rearFan?: { center: Vector3Tuple; size: number };  // hueco del ventilador trasero, al lado del escudo I/O
  grommets: { top: Vector3Tuple; upper: Vector3Tuple; mid: Vector3Tuple; low: Vector3Tuple }; // pasacables de la bandeja
  panels: { window: "glass" | "mesh" | "solid"; front: "glass" | "mesh" | "solid" | "wood" };
  label: string;
}

/** Familia de chasis. Un «sándwich» (Ridge, Meshlicious, A4-H2O) es una caja ITX
    estrecha con la gráfica al otro lado de la bandeja, paralela a la placa. */
export function chassisFamily(style?: CaseStyle, name = "", width = 0, itxOnly = false): ChassisFamily {
  if (itxOnly && width > 0 && width < 170) return "sandwich";
  if (style === "WIDE_DUAL_CHAMBER" || style === "AQUARIUM" || /O11|SHOWCASE|DUAL.?CHAMBER|VISION/i.test(name)) return "dual-chamber";
  if (style === "COMPACT_TOWER" || style === "MINI_TOWER" || style === "HTPC") return "compact";
  if (/AIR|FLOW|MESH|TORRENT/i.test(name)) return "airflow";
  return "standard";
}

const DEFAULT_SIZE: Record<ChassisFamily, Vector3Tuple> = { standard: [215, 465, 450], airflow: [230, 480, 470], "dual-chamber": [285, 460, 465], compact: [205, 400, 350], sandwich: [125, 360, 380] };

export function createChassisLayout(profile: VisualHardwareProfile, boardForm?: unknown, dimm?: unknown, gpuSlots?: unknown): ChassisLayout {
  const dims = profile.dimensions;
  const itxOnly = /^\s*mini-?itx(\s*\/\s*mini-?dtx)?\s*$/i.test(profile.caseFeatures?.forms || "");
  const family = chassisFamily(profile.style, profile.label, dims?.width || 0, itxOnly);
  const size: Vector3Tuple = dims
    ? [clamp(dims.width, DEFAULT_SIZE[family][0], 90, 450), clamp(dims.height, DEFAULT_SIZE[family][1], 200, 800), clamp(dims.depth, DEFAULT_SIZE[family][2], 200, 700)]
    : DEFAULT_SIZE[family];
  const [w, h, d] = size;
  const shell: Box3Tuple = { min: [-w / 2, -h / 2, -d / 2], max: [w / 2, h / 2, d / 2] };
  const dual = family === "dual-chamber", sandwich = family === "sandwich", compact = family === "compact";
  /* Chapa: 3 mm al lado ciego y 5 al cristal, 14 de pies y 3 de techo (4 y 2 en un
     sándwich, que va al milímetro), 22 delante para el aire. */
  const interior: Box3Tuple = { min: [shell.min[0] + 3, shell.min[1] + (sandwich ? 4 : 14), shell.min[2] + 22], max: [shell.max[0] - 5, shell.max[1] - (sandwich ? 2 : 3), shell.max[2] - 3] };
  const board = boardSpec(boardForm, dimm);
  const coolerRoom = clamp(profile.caseFeatures?.coolerClearanceMm, 70, 45, 120);
  /* Detrás de la bandeja: 24 mm para cables (14 en cubos compactos, 92 para la
     fuente en doble cámara). En un sándwich la bandeja parte la caja: la placa se
     queda con lo que pide su disipador y la gráfica con el resto. */
  /* En el sándwich el reparto es proporcional: el disipador pide su altura más
     14 mm de placa y separadores; la gráfica, tres ranuras (62) más 4 de holgura.
     Si la caja no da para ambos, cada lado se queda corto en la misma proporción
     y la pieza que no cabe lo dice. */
  const boardSide = (interior.max[0] - interior.min[0] - 1.4) * (coolerRoom + 14) / (coolerRoom + 14 + 66);
  const trayX = sandwich ? interior.max[0] - boardSide : interior.min[0] + (dual ? 92 : compact ? 14 : 24);
  const chamber: Box3Tuple = { min: [trayX, interior.min[1], interior.min[2]], max: [interior.max[0], interior.max[1], interior.max[2]] };
  const gpuChamber: Box3Tuple | undefined = sandwich ? { min: [interior.min[0], interior.min[1], interior.min[2]], max: [trayX - 2, interior.max[1], interior.max[2]] } : undefined;
  const boardFaceX = trayX + 6.35 + 1.6;
  const chamberH = chamber.max[1] - chamber.min[1];
  const cxMid = (chamber.min[0] + chamber.max[0]) / 2;

  /* Dónde va la fuente, por este orden:
       · en la cámara trasera, si la caja es de doble cámara o lo dice el catálogo;
       · de pie sobre la placa en un sándwich;
       · arriba atrás si el catálogo lo dice (Torrent y parecidas);
       · abajo atrás bajo una cubierta si placa y fuente caben apiladas;
       · abajo delante, en el fondo que deja la placa, si la gráfica queda por encima;
       · y si no, arriba delante, como en los cubos ITX (NR200). */
  const psuPos = String(profile.caseFeatures?.psuPosition || "").toLowerCase();
  const psuRear = dual || /trasera|rear/.test(psuPos);
  const psuDeclaredTop = /superior|top/.test(psuPos) || /torrent/i.test(profile.label);
  /* Lo que cuelga de la placa hacia abajo: ella misma o la gráfica, que en ITX y
     Micro-ATX asoma por debajo del canto inferior (ranura ×16 más su grosor). */
  const hang = Math.max(board.h, board.pcieV + clamp(gpuSlots, 2.5, 1, 4) * 20.32 - 6);
  const stack = chamberH - 92 - hang;
  const boardFrontZ0 = interior.max[2] - 8 - board.d;
  const frontRoom = boardFrontZ0 - (chamber.min[2] + 8);
  const gpuAbovePsu = chamberH - 10 - (board.pcieV + 80) >= 96;
  const psuTopRear = !psuRear && !sandwich && psuDeclaredTop;
  const psuUnderBoard = !psuRear && !sandwich && !psuTopRear && stack >= 8;
  const psuBottomFront = !psuRear && !sandwich && !psuTopRear && !psuUnderBoard && frontRoom >= 166 && gpuAbovePsu;
  const psuTopFront = !psuRear && !sandwich && !psuTopRear && !psuUnderBoard && !psuBottomFront;
  /* En un sándwich la fuente SFX va tumbada arriba a lo ancho de la caja (A4-H2O),
     de pie sobre la placa si la caja es estrecha y alta (Ridge) o de pie delante
     de la placa si no hay altura (Meshlicious). */
  const sandwichPsu: "flat" | "stand" | "front" = !sandwich ? "flat"
    : chamberH >= board.h + 63.5 + 4 && interior.max[0] - interior.min[0] >= 128 ? "flat"
    : chamberH >= board.h + 133 + 4 ? "stand"
    : frontRoom >= 108 ? "front" : "flat";
  /* Cubierta de 100 mm cuando sobra altura y de 92 como mínimo: la fuente ATX
     mide 86 y apoya a 4 mm del suelo. */
  const shroudH = Math.min(100, Math.max(92, chamberH - board.h - 22));
  const shroudTop = psuUnderBoard ? chamber.min[1] + shroudH : chamber.min[1];
  const shroud: Box3Tuple | undefined = psuUnderBoard
    ? { min: [chamber.min[0], chamber.min[1], chamber.min[2] + 52], max: [chamber.max[0], shroudTop, chamber.max[2]] }
    : undefined;

  /* La placa cuelga del techo, o de la fuente si esta va arriba: deja 22 a 65 mm
     para un ventilador o un radiador y apoya el borde trasero a 8 mm del panel. */
  const ceiling = psuTopRear ? chamber.max[1] - 96 : sandwich && sandwichPsu === "flat" ? chamber.max[1] - 65.5 : sandwich && sandwichPsu === "stand" ? chamber.max[1] - 133 : chamber.max[1];
  /* Debajo de la placa quedan 4 mm (o lo que asome la gráfica); con la fuente
     abajo delante, la placa sube lo justo para que la gráfica pase por encima. */
  let topMargin = clamp(ceiling - shroudTop - board.h - (sandwich ? 15 : Math.max(4, hang - board.h + 4)), 40, sandwich ? 2 : 10, 65);
  if (psuBottomFront) topMargin = Math.max(10, Math.min(topMargin, chamberH - 96 - (board.pcieV + 75)));
  const boardTopY = ceiling - topMargin;
  const boardRearZ = interior.max[2] - 8;
  const boardFrontZ = boardRearZ - board.d;
  const openTop = shroud ? shroudTop : chamber.min[1];

  const psuBay = psuRear
    ? { center: [trayX - 48, interior.min[1] + 115, 0] as Vector3Tuple, vertical: true, top: false }
    : sandwich && sandwichPsu === "flat" ? { center: [(interior.min[0] + interior.max[0]) / 2, chamber.max[1] - 47, 0] as Vector3Tuple, vertical: false, top: true }
    : sandwich && sandwichPsu === "stand" ? { center: [Math.min(trayX + 37.75, chamber.max[0] - 36), chamber.max[1] - 4 - 62.5, 0] as Vector3Tuple, vertical: true, top: true }
    : sandwich ? { center: [Math.min(trayX + 37.75, chamber.max[0] - 36), chamber.min[1] + 4 + 62.5, 0] as Vector3Tuple, vertical: true, top: false, front: true }
    : psuTopRear ? { center: [cxMid, chamber.max[1] - 47, 0] as Vector3Tuple, vertical: false, top: true }
    : psuTopFront ? { center: [cxMid, chamber.max[1] - 47, 0] as Vector3Tuple, vertical: false, top: true, front: true }
    : psuBottomFront ? { center: [cxMid, chamber.min[1] + 47, 0] as Vector3Tuple, vertical: false, top: false, front: true }
    : { center: [cxMid, chamber.min[1] + 47, 0] as Vector3Tuple, vertical: false, top: false };
  /* Discos: tumbados bajo la cubierta, detrás del frontal; de pie detrás de la
     bandeja cuando no hay cubierta (y en doble cámara); en un sándwich, de pie
     en el suelo del lado de la placa. `room` es el grosor que admite la bahía. */
  const driveBay = sandwich && gpuChamber
    ? { origin: [(gpuChamber.min[0] + gpuChamber.max[0]) / 2 + 3.5, interior.min[1] + 62, interior.min[2] + 42] as Vector3Tuple, step: [0, 0, 78] as Vector3Tuple, vertical: true, room: gpuChamber.max[0] - gpuChamber.min[0] - 4 }
    : dual || !shroud
      ? { origin: [trayX - 2, interior.min[1] + 160, interior.min[2] + 90] as Vector3Tuple, step: [0, 0, 115] as Vector3Tuple, vertical: true, room: trayX - 2 - interior.min[0] }
      : { origin: [chamber.min[0] + 44, chamber.min[1] + 16, chamber.min[2] + 133] as Vector3Tuple, step: [0, 30, 0] as Vector3Tuple, vertical: false, room: shroudTop - chamber.min[1] - 16 };

  /* Anclajes de radiador: capacidad nominal que declara la caja y luz real. El
     centro se acerca al cristal para que un radiador de 140 no pise la memoria. */
  const declared = (profile.caseFeatures?.radiatorMounts || {}) as Record<string, unknown>;
  const hasDeclared = Object.keys(declared).length > 0;
  const cap = (k: string, fallback: number) => (hasDeclared ? finite(declared[k], 0) : fallback);
  const cx = Math.min(cxMid + 8, chamber.max[0] - 12 - 72);
  const mounts: Partial<Record<RadiatorMount, MountPlane>> = {};
  const topCap = cap("top", compact ? 240 : sandwich ? 0 : 280), frontCap = cap("front", dual || sandwich ? 0 : compact ? 240 : 360);
  const sideCap = cap("side", dual ? 360 : 0), bottomCap = cap("bottom", dual ? 360 : 0), rearCap = cap("rear", sandwich ? 0 : 120);
  /* Hueco del ventilador trasero: al lado del escudo I/O (44,45 mm de ancho),
     hacia el cristal, con el canto superior a la altura del borde de la placa.
     Un 120 salvo que la caja declare radiador trasero de 140 o no quepa. */
  const ioRight = boardFaceX + 46;
  const rearRoom = interior.max[0] - 4 - ioRight;
  const rearFanSize = [140, 120, 92, 80].find((s) => s <= Math.min(rearRoom, rearCap || 120));
  const rearFan = rearFanSize ? { center: [ioRight + rearRoom / 2, Math.min(boardTopY - rearFanSize / 2 + 8, ceiling - rearFanSize / 2 - 6), interior.max[2] - 14] as Vector3Tuple, size: rearFanSize } : undefined;
  /* El techo termina 30 mm antes del panel trasero (ahí va el ventilador trasero)
     y empieza detrás de una fuente que vaya arriba y delante. */
  /* El techo empieza justo detrás de los ventiladores frontales y llega hasta el
     panel trasero: un radiador largo pasa por encima del ventilador trasero, que
     entonces se queda sin sitio (lo decide el montaje). */
  const topZ: [number, number] = [psuTopFront ? chamber.min[2] + 8 + 130 + 10 : chamber.min[2] + 28.5, interior.max[2] - 6];
  /* Techo abierto solo si sobre la placa quedan 30 mm para un ventilador y la cámara tiene anchura para él. */
  const topOpen = !psuTopRear && !sandwich && topZ[1] - topZ[0] >= 132 && topMargin >= 30 && chamber.max[0] - chamber.min[0] >= 130;
  if (topCap && topOpen) mounts.top = { mount: "top", center: [cx, chamber.max[1] - 16, (topZ[0] + topZ[1]) / 2], normal: [0, -1, 0], longAxis: "z", capacityMm: topCap, spanMm: topZ[1] - topZ[0] };
  /* La cubierta de la fuente se retira 52 mm del frontal precisamente para que el
     radiador baje por delante de ella: el hueco frontal es toda la cámara, salvo
     que la fuente esté abajo delante. */
  const frontLow = psuBottomFront ? chamber.min[1] + 96 : chamber.min[1];
  const frontHigh = psuTopFront ? chamber.max[1] - 100 : chamber.max[1];
  const frontMid = (frontLow + frontHigh) / 2, radFrontSpan = frontHigh - frontLow - 20;
  if (frontCap && frontRoom >= 62) mounts.front = { mount: "front", center: [cx, frontMid, chamber.min[2] + 25 + 16], normal: [0, 0, 1], longAxis: "y", capacityMm: frontCap, spanMm: radFrontSpan };
  /* «Lateral»: en doble cámara es la pared vertical delante de la placa; en cubos
     compactos y sándwiches es el soporte del panel lateral, junto a la gráfica. */
  const sideZ: [number, number] = [psuTopFront ? chamber.min[2] + 8 + 130 + 10 : chamber.min[2] + 20, interior.max[2] - 30];
  if (sideCap) mounts.side = compact || sandwich
    ? { mount: "side", center: [chamber.max[0] - 16, Math.min(openTop + 16 + 72, chamber.max[1] - 16 - 72), (sideZ[0] + sideZ[1]) / 2], normal: [-1, 0, 0], longAxis: "z", capacityMm: sideCap, spanMm: sideZ[1] - sideZ[0] }
    : { mount: "side", center: [cx, (openTop + chamber.max[1]) / 2, chamber.min[2] + 62], normal: [0, 0, 1], longAxis: "y", capacityMm: sideCap, spanMm: chamber.max[1] - openTop - 16 };
  if (bottomCap && !shroud && (psuRear || psuTopRear || psuTopFront)) mounts.bottom = { mount: "bottom", center: [cx, chamber.min[1] + 16, (sideZ[0] + sideZ[1]) / 2], normal: [0, 1, 0], longAxis: "z", capacityMm: bottomCap, spanMm: sideZ[1] - sideZ[0] };
  if (rearCap && rearFan) mounts.rear = { mount: "rear", center: [rearFan.center[0], rearFan.center[1], interior.max[2] - 16], normal: [0, 0, -1], longAxis: "y", capacityMm: Math.min(rearCap, rearFan.size), spanMm: rearFan.size + 20 };

  /* Posiciones de ventilador de caja: frontal de abajo arriba (menos lo que tape
     una fuente delante), trasero y techo. */
  const sizes = (profile.caseFeatures?.fanSizes || [120, 140]).filter((n): n is number => typeof n === "number");
  const frontFan = sizes.includes(140) ? 140 : sizes[0] || 120;
  const fanSlots: FanSlot[] = [];
  if (!sandwich && frontRoom >= 30 && chamber.max[0] - chamber.min[0] >= frontFan + 8) {
    const frontSpan = chamber.max[1] - openTop - 8;
    const nFront = Math.max(1, Math.min(3, Math.floor(frontSpan / (frontFan + 6))));
    const frontStart = openTop + 6 + frontFan / 2 + (frontSpan - nFront * (frontFan + 6)) / 2;
    for (let i = 0; i < nFront; i++) {
      const y = frontStart + i * (frontFan + 6);
      if (psuTopFront && y + frontFan / 2 > chamber.max[1] - 96) continue;
      if (psuBottomFront && y - frontFan / 2 < chamber.min[1] + 96) continue;
      fanSlots.push({ position: [cx, y, chamber.min[2] + 14], normal: [0, 0, 1], size: frontFan, where: "front" });
    }
  }
  if (rearFan) fanSlots.push({ position: rearFan.center, normal: [0, 0, -1], size: rearFan.size, where: "rear" });
  if (topOpen) {
    const nTop = Math.max(0, Math.min(3, Math.floor((topZ[1] - topZ[0]) / 126)));
    for (let i = 0; i < nTop; i++) fanSlots.push({ position: [cx, chamber.max[1] - 14, topZ[1] - 63 - i * 126], normal: [0, -1, 0], size: 120, where: "top" });
  }

  /* Pasacables de la bandeja: tres en el canto delantero de la placa (24 pines,
     gráfica y cables bajos) y uno arriba junto al I/O para el EPS de la CPU. */
  const gz = Math.min(boardFrontZ - 6, Math.max(boardFrontZ - 14, chamber.min[2] + 95));
  const gx = trayX + 1;
  const grommets = {
    top: [gx, boardTopY + Math.min(10, Math.max(4, topMargin - 14)), boardRearZ - 70] as Vector3Tuple,
    upper: [gx, boardTopY - board.atx24[1], gz] as Vector3Tuple,
    mid: [gx, boardTopY - board.pcieV + 6, gz] as Vector3Tuple,
    low: [gx, Math.max(boardTopY - board.h + 6, openTop + 14), gz] as Vector3Tuple,
  };

  const panels = profile.caseFeatures?.panels || { window: "glass" as const, front: "solid" as const };
  const wood = /nogal|walnut|roble|oak|madera|wood/i.test(`${profile.label} ${profile.caseFeatures?.color || ""}`);
  return {
    family, size, shell, interior, chamber, gpuChamber, trayX, boardFaceX, boardTopY, boardRearZ, board, shroud, psuBay, driveBay, mounts, fanSlots, rearFan, grommets,
    panels: { window: panels.window, front: wood ? "wood" : dual ? "glass" : panels.front }, label: profile.label,
  };
}

/* ── Piezas ──────────────────────────────────────────────────────────── */
export interface Visual3DUnit { position: Vector3Tuple; normal?: Vector3Tuple; size?: Vector3Tuple }
export interface Visual3DPart {
  id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState;
  position: Vector3Tuple; size: Vector3Tuple; bounds: Box3Tuple;    // unidades de escena
  units: Visual3DUnit[];                                            // cada ejemplar (RAM, discos, ventiladores)
  instances: number;
  metadata: VisualPart["metadata"]; profile: VisualHardwareProfile;
  /* Por dónde sale la pieza en la vista explosionada: dirección y distancia (unidades). */
  explode: { dir: Vector3Tuple; distance: number };
  /* Lo que el renderizador necesita para dar forma a la pieza. */
  detail: Record<string, number | string | boolean | undefined>;
  mount?: RadiatorMount; tubePaths?: Vector3Tuple[][]; connectionTarget?: Vector3Tuple; board?: BoardSpec;
  overflow?: string;
}
/* Un cable: recorrido en unidades, radio de cada hilo, cuántos hilos van en
   paralelo y en qué dirección se abren (una cinta de 24 pines es plana). */
export interface Visual3DCable { kind: "atx24" | "eps" | "pcie" | "sata" | "panel"; path: Vector3Tuple[]; radius: number; strands: number; spread: Vector3Tuple }
export interface Visual3DScene {
  chassis: Visual3DPart; parts: Visual3DPart[]; layout: ChassisLayout;
  chassisFans: Array<{ position: Vector3Tuple; normal: Vector3Tuple; size: number }>; // unidades
  cables: Visual3DCable[];
  focusTarget: Vector3Tuple; bounds: Box3Tuple;
  camera: { direction: Vector3Tuple; target: Vector3Tuple; fov: number; minDistance: number; maxDistance: number; radius: number };
}

/* Una pieza con normal (ventilador) tiene su grosor a lo largo de ella. */
const oriented = (size: Vector3Tuple, n?: Vector3Tuple): Vector3Tuple => !n ? size : n[1] ? [size[0], size[2], size[1]] : n[0] ? [size[2], size[1], size[0]] : size;
const unitBox = (part: Visual3DPart, u: Visual3DUnit) => boxAt(u.position, oriented(u.size || part.size, u.normal));

function describe(src: VisualPart, kind: Visual3DKind, center: Vector3Tuple, size: Vector3Tuple, profile: VisualHardwareProfile, explode: Visual3DPart["explode"], detail: Visual3DPart["detail"] = {}, units?: Visual3DUnit[]): Visual3DPart {
  const us: Visual3DUnit[] = (units || [{ position: center }]).map((u) => ({ position: mm3(u.position), normal: u.normal, size: u.size ? mm3(u.size) : undefined }));
  const scaled = mm3(size);
  const bounds = us.reduce((acc, u) => union(acc, boxAt(u.position, oriented(u.size || scaled, u.normal))), boxAt(us[0].position, oriented(us[0].size || scaled, us[0].normal)));
  return { id: src.category, kind, category: src.category, source: src, state: src.state, position: mm3(center), size: scaled, bounds, units: us, instances: us.length, metadata: src.metadata, profile, explode: { dir: explode.dir, distance: explode.distance * U }, detail };
}

export function resolveRadiatorMount(layout: ChassisLayout, radSize: number, blocked: RadiatorMount[] = []): RadiatorMount | undefined {
  const dual = layout.family === "dual-chamber";
  const order: RadiatorMount[] = radSize >= 360 ? (dual ? ["side", "top", "bottom", "front"] : ["front", "top", "side"])
    : radSize >= 240 ? (dual ? ["top", "side", "bottom", "front"] : ["top", "front", "side"]) : ["rear", "top", "front", "side"];
  const fanSize = radSize === 280 || radSize === 420 || radSize === 140 ? 140 : 120;
  const len = Math.round(radSize / fanSize) * fanSize + 12;
  const fits = (m: RadiatorMount) => { const p = layout.mounts[m]; return Boolean(p && p.capacityMm >= radSize && p.spanMm >= len); };
  return order.find((m) => !blocked.includes(m) && fits(m)) ?? order.find(fits) ?? order.find((m) => !blocked.includes(m) && layout.mounts[m]) ?? order.find((m) => layout.mounts[m]);
}

/** Interpreta el tipo de disipador que trae el catálogo. */
export function coolerKind(type: unknown, radiatorMm?: unknown): { kind: "aio" | "tower" | "dual-tower" | "top-flow" | "stock"; radSize?: number } {
  const t = String(type || "").toLowerCase();
  const rad = finite(radiatorMm, 0);
  if (rad || /aio|líquid|liquid/.test(t)) return { kind: "aio", radSize: rad || Number((t.match(/(\d{3})/) || [])[1]) || 240 };
  if (/doble|dual|d15|d14/.test(t)) return { kind: "dual-tower" };
  if (/stock/.test(t)) return { kind: "stock" };
  if (/low|compact|top|pasiv|servidor/.test(t)) return { kind: "top-flow" };
  return { kind: "tower" };
}

const present = (x?: VisualPart) => Boolean(x && x.state !== "empty" && x.state !== "next");

/** Qué zócalos DIMM ocupan `modules` módulos (índices desde la CPU, 0 el más cercano).
    Cuatro zócalos: 4, 2, 3, 1 (doble canal en A2/B2 primero); dos: el lejano primero;
    otros recuentos, de lejos a cerca. */
export function dimmPopulation(dimm: number, modules: number): number[] {
  const order = dimm === 4 ? [3, 1, 2, 0] : dimm === 2 ? [1, 0] : Array.from({ length: dimm }, (_, i) => dimm - 1 - i);
  return order.slice(0, Math.max(1, Math.min(modules, dimm))).sort((a, b) => a - b);
}
const axisOf = (n: Vector3Tuple) => (n[0] ? 0 : n[1] ? 1 : 2);

/** VisualBuildModel → escena montada. Determinista: misma entrada, misma escena. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts;
  const caseProfile = createVisualHardwareProfile(p.case!);
  const mboProfile = createVisualHardwareProfile(p.mbo!);
  const L = createChassisLayout(caseProfile, p.mbo?.metadata.form, p.mbo?.metadata.dimmSlots, p.gpu?.metadata.slots);
  const B = L.board;
  const sandwich = L.family === "sandwich";
  const profile = (x: VisualPart) => createVisualHardwareProfile(x, mboProfile);
  /* (u, v, h) sobre la placa → centro en mm del chasis. */
  const onBoard = (u: number, v: number, h: number): Vector3Tuple => [L.boardFaceX + h, L.boardTopY - v, L.boardRearZ - u];
  const parts: Visual3DPart[] = [];

  /* Placa base: PCB de 1,6 mm sobre separadores de 6,35. */
  const mbo = describe(p.mbo!, "motherboard", [L.boardFaceX - 0.8, L.boardTopY - B.h / 2, L.boardRearZ - B.d / 2], [1.6, B.h, B.d], mboProfile, { dir: [1, 0, 0], distance: 130 }, { form: B.form, slots: B.slots, dimm: B.dimm });
  mbo.board = B; parts.push(mbo);
  if (B.h > L.chamber.max[1] - L.chamber.min[1] - 8) mbo.overflow = `Una placa ${B.form} (${B.h} mm) no cabe en los ${Math.round(L.chamber.max[1] - L.chamber.min[1])} mm de alto de esta caja`;

  /* CPU: zócalo de 45 mm con la tapa de 40 encima, 7 mm en total. */
  parts.push(describe(p.cpu!, "cpu", onBoard(B.socket[0], B.socket[1], 3.5), [7, 45, 45], profile(p.cpu!), { dir: [1, 0, 0], distance: 220 }));

  /* RAM: se puebla como un montador. En cuatro zócalos, dos módulos van al 2 y al 4
     (doble canal), uno solo al más lejano de la CPU; en dos zócalos, uno solo al lejano. */
  const modules = Math.min(B.dimm, Math.round(clamp(p.ram?.metadata.modules, 2, 1, 8)));
  const ramH = clamp(p.ram?.metadata.heightMm, 40, 31, 60);
  const ramUnits = dimmPopulation(B.dimm, modules).map((slot) => ({ position: onBoard(B.ramU0 + slot * B.ramPitch, B.ramV0 + B.ramLen / 2, ramH / 2 + 2) }));
  parts.push(describe(p.ram!, "ram", ramUnits[0].position, [ramH, B.ramLen, 7], profile(p.ram!), { dir: [1, 0, 0], distance: 180 }, { slots: B.dimm, rgb: Boolean(p.ram?.metadata.rgb) }, ramUnits));

  /* Refrigeración, antes que la gráfica: un radiador delante o al lado le quita sitio. */
  const ck = coolerKind(p.cooler?.metadata.type, p.cooler?.metadata.radiatorMm);
  const socket = onBoard(B.socket[0], B.socket[1], 0);
  const coolerMax = L.chamber.max[0] - L.boardFaceX - 6;
  let frontObstacleZ = L.chamber.min[2] + 6;
  let gpuXLimit = L.chamber.max[0] - 2;
  if (ck.kind === "aio") {
    const radSize = positive(ck.radSize, 240);
    const fanSize = radSize === 280 || radSize === 420 || radSize === 140 ? 140 : 120;
    const fans = Math.max(1, Math.round(radSize / fanSize));
    const radLen = fans * fanSize + 12, radW = fanSize + 4, radT = 30;
    /* En el techo, radiador y ventiladores bajan 58 mm: si pisan la memoria se
       prefiere el frontal, como hace cualquier montador. */
    const top = L.mounts.top;
    const ramTop = L.boardTopY - B.ramV0 + 2;
    const topHitsRam = Boolean(top && top.center[0] - radW / 2 < L.boardFaceX + 2 + ramH && top.center[0] + radW / 2 > L.boardFaceX + 2 && top.center[1] - radT / 2 - 27 < ramTop);
    /* Y en el panel lateral de un cubo, radiador y ventiladores entran 57 mm: si
       no dejan sitio a la memoria, tampoco. */
    const side = L.mounts.side;
    const sideHitsRam = Boolean(side && side.normal[0] === -1 && side.center[0] - radT / 2 - 27 < L.boardFaceX + 2 + ramH && side.center[1] + radW / 2 > L.boardTopY - B.ramV0 - B.ramLen && side.center[1] - radW / 2 < ramTop);
    const blocked: RadiatorMount[] = [...(topHitsRam ? ["top" as const] : []), ...(sideHitsRam ? ["side" as const] : [])];
    const mount = resolveRadiatorMount(L, radSize, blocked);
    const plane: MountPlane = (mount && L.mounts[mount]) || L.mounts.top || L.mounts.front || L.mounts.side || L.mounts.rear
      || { mount: "side", center: [L.chamber.max[0] - 16, L.chamber.min[1] + 88, (L.chamber.min[2] + L.chamber.max[2]) / 2], normal: [-1, 0, 0], longAxis: "z", capacityMm: 0, spanMm: L.chamber.max[2] - L.chamber.min[2] - 60 };
    const nAxis = axisOf(plane.normal), lAxis = plane.longAxis === "z" ? 2 : 1, wAxis = [0, 1, 2].find((a) => a !== nAxis && a !== lAxis)!;
    // El anclaje puede ser insuficiente; el radiador conserva su longitud y ventiladores.
    const size: Vector3Tuple = [0, 0, 0]; size[nAxis] = radT; size[lAxis] = radLen; size[wAxis] = radW;
    const center: Vector3Tuple = [plane.center[0], plane.center[1], plane.center[2]];
    const outward: Vector3Tuple = [-plane.normal[0], -plane.normal[1], -plane.normal[2]];
    const aio = describe(p.cooler!, "aio", center, size, profile(p.cooler!), { dir: outward, distance: 160 }, { radSize, fanSize, fans, mount: plane.mount, along: plane.longAxis, radT, normalX: plane.normal[0], normalY: plane.normal[1], normalZ: plane.normal[2] });
    aio.mount = plane.mount;
    if (plane.spanMm < radLen) aio.overflow = `Radiador de ${radSize} mm: el anclaje representado tiene unos ${Math.round(plane.spanMm)} mm libres`;
    else if (plane.capacityMm < radSize) aio.overflow = `La caja no admite un radiador de ${radSize} mm ahí`;
    else if (topHitsRam && plane.mount === "top") aio.overflow = `El radiador superior roza la memoria: faltan ${Math.round(ramTop - (plane.center[1] - radT / 2 - 27))} mm`;
    else if (sideHitsRam && plane.mount === "side") aio.overflow = `El radiador lateral roza la memoria: faltan ${Math.round(L.boardFaceX + 2 + ramH - (plane.center[0] - radT / 2 - 27))} mm`;
    else if (plane.normal[1] !== 0 && aio.bounds.min[0] < (L.boardFaceX + 2) * U - 0.001) aio.overflow = `Radiador de ${radW} mm de ancho: sobre la placa quedan ${Math.round(L.chamber.max[0] - L.boardFaceX - 2)} mm`;
    if (plane.normal[2] === 1) frontObstacleZ = Math.max(frontObstacleZ, plane.center[2] + radT / 2 + 29);
    if (plane.normal[0] === -1) gpuXLimit = Math.min(gpuXLimit, plane.center[0] - radT / 2 - 29);
    /* Bomba sobre el zócalo y dos tubos que salen hacia el cristal, suben y
       entran por el depósito del radiador más cercano a la CPU. */
    const block: Vector3Tuple = [socket[0] + 22, socket[1], socket[2]];
    aio.connectionTarget = mm3(block);
    const tank: Vector3Tuple = [center[0], center[1], center[2]];
    tank[lAxis] += Math.sign(socket[lAxis] - center[lAxis] || 1) * (radLen / 2 - 14);
    const inside = (pt: Vector3Tuple): Vector3Tuple => [Math.min(Math.max(pt[0], L.chamber.min[0] + 8), L.chamber.max[0] - 8), Math.min(Math.max(pt[1], L.chamber.min[1] + 8), L.chamber.max[1] - 8), Math.min(Math.max(pt[2], L.chamber.min[2] + 8), L.chamber.max[2] - 8)];
    aio.tubePaths = [-10, 10].map((off) => {
      const a: Vector3Tuple = [block[0] + 18, block[1] + off, block[2] - 24];
      const lift: Vector3Tuple = [Math.min(block[0] + 70, L.chamber.max[0] - 20), block[1] + 45 + off, block[2] - 40];
      const near: Vector3Tuple = [tank[0], tank[1], tank[2]]; near[nAxis] += plane.normal[nAxis] * (radT / 2 + 16); near[wAxis] += off; if (nAxis !== 0) near[0] += 4;
      const end: Vector3Tuple = [tank[0], tank[1], tank[2]]; end[nAxis] += plane.normal[nAxis] * (radT / 2 + 2); end[wAxis] += off; if (nAxis !== 0) end[0] += 4;
      return [a, lift, near, end].map(inside).map(mm3);
    });
    parts.push(aio);
  } else {
    /* Torre: bloque de 50 mm de aletas centrado en el zócalo y ventilador de 27 mm
       delante (hacia el frontal). Doble torre: dos bloques con un ventilador entre
       medias y otro delante, 154 mm en total, como un NH-D15. */
    const height = positive(p.cooler?.metadata.heightMm, ck.kind === "top-flow" ? 70 : ck.kind === "stock" ? 45 : 158);
    const fanSize = clamp(p.cooler?.metadata.fanSizeMm, 120, 80, 140);
    const towers = ck.kind === "dual-tower" ? 2 : 1;
    const tower = ck.kind === "tower" || ck.kind === "dual-tower";
    const depth = tower ? (towers === 2 ? 154 : 77) : fanSize + 6;
    const width = fanSize + 6;
    const center: Vector3Tuple = [L.boardFaceX + 7 + (height - 7) / 2, socket[1], tower ? socket[2] - 13.5 : socket[2]];
    const cooler = describe(p.cooler!, "air-cooler", center, [height - 7, width, depth], profile(p.cooler!), { dir: [1, 0, 0], distance: 300 },
      { kind: ck.kind, towers, fanSize, heightMm: height, fans: Math.round(clamp(p.cooler?.metadata.fans, towers === 2 ? 2 : 1, 0, 3)) });
    cooler.connectionTarget = mm3(socket);
    if (height > coolerMax) cooler.overflow = `Disipador de ${height} mm: hasta el panel representado hay unos ${Math.round(coolerMax)} mm`;
    parts.push(cooler);
  }

  /* Ventiladores: los que trae la caja son del chasis; los elegidos ocupan las
     posiciones libres. Un radiador se lleva las de su cara, y un radiador
     delante deja sin sitio a los ventiladores del techo que le caen encima. */
  const aioPart = parts.find((x) => x.kind === "aio");
  const taken = new Set<RadiatorMount>(aioPart?.mount === "side" && L.family === "dual-chamber" ? ["front", "side"] : aioPart?.mount ? [aioPart.mount] : []);
  /* Un radiador en el techo que llega hasta atrás y baja hasta el ventilador trasero le quita el sitio. */
  if (aioPart?.mount === "top" && L.rearFan && aioPart.bounds.max[2] > (L.rearFan.center[2] - L.rearFan.size / 2 - 12.5) * U && aioPart.bounds.min[1] - 0.27 < (L.rearFan.center[1] + L.rearFan.size / 2) * U) taken.add("rear");
  const free = L.fanSlots.filter((s) => !taken.has(s.where) && !(s.where === "top" && s.position[2] - s.size / 2 < frontObstacleZ + 4));
  const included = Math.min(free.length, Math.round(clamp(caseProfile.caseFeatures?.fanIncluded, 0, 0, 6)));
  const chosen = Math.round(clamp(p.fan?.metadata.count, 0, 0, 12));
  const chosenSlots: typeof free = [];
  const fallback = free[Math.min(included, free.length - 1)] || L.fanSlots[0] || { position: [L.chamber.max[0] - 20, L.chamber.max[1] - 70, 0] as Vector3Tuple, normal: [-1, 0, 0] as Vector3Tuple, size: 120, where: "side" as const };
  const selectedSizes: number[] = (() => { try { return JSON.parse(String(p.fan?.metadata.sizesMm || "[]")); } catch { return []; } })();
  const remaining = free.slice(included);
  const fanUnits: Visual3DUnit[] = Array.from({ length: Math.max(1, chosen) }, (_, i) => {
    const diameter = positive(selectedSizes[i] ?? p.fan?.metadata.sizeMm, fallback.size);
    const index = remaining.findIndex((slot) => slot.size >= diameter);
    const slot = index >= 0 ? remaining.splice(index, 1)[0] : fallback;
    if (index >= 0) chosenSlots.push(slot);
    return { position: slot.position, normal: slot.normal, size: [diameter, diameter, 25] };
  });
  const fanSize = fanUnits[0].size![0];
  const fanPart = describe(p.fan!, "fan", fanUnits[0].position, [fanSize, fanSize, 25], profile(p.fan!), { dir: [0, 0, -1], distance: 140 }, { size: fanSize }, fanUnits);
  if (present(p.fan) && chosenSlots.length < chosen) fanPart.overflow = chosenSlots.length ? `Solo quedan ${chosenSlots.length} posiciones libres para ${chosen} ventiladores` : "No queda ninguna posición libre para más ventiladores";
  parts.push(fanPart);
  const chassisFans = free.slice(0, included).map((s) => ({ position: mm3(s.position), normal: s.normal, size: s.size }));
  const frontFanned = free.slice(0, included).some((s) => s.where === "front") || (present(p.fan) && chosenSlots.some((s) => s.where === "front"));
  if (frontFanned) frontObstacleZ = Math.max(frontObstacleZ, L.chamber.min[2] + 14 + 12.5 + 2);

  /* Gráfica: soporte en el borde trasero, PCB en la ranura ×16 y el disipador
     colgando hacia abajo con los ventiladores mirando al suelo. La altura no
     viene en el catálogo: 115 mm en dos ranuras, 130 en 2,5 y 140 en tres o
     más, lo habitual en cada clase. El fondo libre es el menor entre lo que
     dice la caja y lo que dejan los ventiladores o el radiador de delante. En
     un sándwich va al otro lado de la bandeja, paralela a la placa, con los
     ventiladores hacia el panel y los conectores hacia abajo. */
  const drives = (() => { try { return JSON.parse(String(p.storage?.metadata.drives || "[]")) as Array<{ type: string }>; } catch { return []; } })();
  const stType = String(p.storage?.metadata.type || "M.2");
  const count = Math.round(clamp(p.storage?.metadata.count, 1, 1, 4));
  const kinds = (drives.length ? drives.map((x) => x.type) : Array.from({ length: count }, () => stType)).slice(0, 4);
  const sataKinds = kinds.filter((k) => k !== "M.2");
  const sataDrives = present(p.storage) && sataKinds.length > 0 && kinds[0] !== "M.2";
  /* En un sándwich los discos SATA van de pie delante de la gráfica, en su cámara. */
  if (sandwich && sataDrives) frontObstacleZ = Math.max(frontObstacleZ, L.chamber.min[2] + 42 + 35 + (sataKinds.length > 1 ? 78 : 0) + 6);
  const gpuSlots = clamp(p.gpu?.metadata.slots, 2.5, 1, 4);
  const gpuLenReal = positive(p.gpu?.metadata.lengthMm, 280);
  const gpuMaxLen = Math.min(L.boardRearZ - frontObstacleZ - 4, finite(caseProfile.caseFeatures?.gpuClearanceMm, 9999));
  const gpuLen = gpuLenReal;
  const gpuH = gpuSlots <= 2 ? 115 : gpuSlots < 3 ? 130 : 140;
  const gpuT = gpuSlots * 20.32 - 2;
  const GC = L.gpuChamber;
  const gpuCenter: Vector3Tuple = sandwich && GC
    ? [GC.min[0] + 4 + gpuT / 2, GC.min[1] + 12 + gpuH / 2, L.boardRearZ - gpuLen / 2]
    : [L.boardFaceX + 6 + gpuH / 2, L.boardTopY - B.pcieV - gpuT / 2 + 4, L.boardRearZ - gpuLen / 2];
  const gpu = describe(p.gpu!, "gpu", gpuCenter, sandwich ? [gpuT, gpuH, gpuLen] : [gpuH, gpuT, gpuLen], profile(p.gpu!), { dir: sandwich ? [-1, 0, 0] : [1, 0, 0], distance: 280 },
    { fans: gpuLenReal < 290 ? 2 : 3, hpwr: Boolean(p.gpu?.metadata.hpwr), conn8: finite(p.gpu?.metadata.conn8, 0), conn6: finite(p.gpu?.metadata.conn6, 0), lengthMm: gpuLenReal, slots: gpuSlots, sandwich });
  if (gpuLenReal > gpuMaxLen) gpu.overflow = `${gpuLenReal} mm no caben en los ${Math.round(gpuMaxLen)} mm libres${frontObstacleZ > L.chamber.min[2] + 6 ? (sandwich ? " con los discos delante" : " con lo que hay delante") : ""}`;
  else if (sandwich && GC && gpuT > GC.max[0] - GC.min[0] - 6) gpu.overflow = `Gráfica de ${Math.round(gpuT)} mm de grosor: el hueco lateral tiene ${Math.round(GC.max[0] - GC.min[0] - 6)} mm`;
  else if (!sandwich && L.boardFaceX + 6 + gpuH > gpuXLimit) gpu.overflow = `Gráfica de ${gpuH} mm de alto: hasta el panel quedan ${Math.round(gpuXLimit - L.boardFaceX - 6)} mm`;
  parts.push(gpu);

  /* Fuente: ATX 150×86, SFX 125×63,5; el largo lo da el catálogo. */
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase();
  const sfx = psuForm.includes("sfx");
  const psuLen = clamp(p.psu?.metadata.lengthMm, sfx ? (psuForm.includes("-l") ? 130 : 100) : 150, 90, 230);
  const psuW = sfx ? 125 : 150, psuH = sfx ? 63.5 : 86;
  const bay = L.psuBay;
  const psuSize: Vector3Tuple = bay.vertical ? [psuH, psuW, psuLen] : [psuW, psuH, psuLen];
  const psuCenter: Vector3Tuple = bay.vertical
    ? [bay.center[0], bay.center[1], bay.front ? L.chamber.min[2] + psuLen / 2 + 8 : L.interior.max[2] - psuLen / 2 - 10]
    : [bay.center[0], bay.center[1] + (bay.top ? (86 - psuH) / 2 : -(86 - psuH) / 2), bay.front ? L.chamber.min[2] + psuLen / 2 + 8 : L.chamber.max[2] - psuLen / 2 - 8];
  const psu = describe(p.psu!, "psu", psuCenter, psuSize, profile(p.psu!), { dir: [0, 0, 1], distance: 220 }, { form: sfx ? (psuForm.includes("-l") ? "SFX-L" : "SFX") : "ATX", watt: finite(p.psu?.metadata.watt, 0), vertical: bay.vertical, top: bay.top, front: Boolean(bay.front) });
  const interiorBox: Box3Tuple = { min: mm3(L.interior.min), max: mm3(L.interior.max) };
  const boardFrontZ = L.boardRearZ - B.d;
  if (!containsBox(interiorBox, psu.bounds)) psu.overflow = sandwich ? `Aquí solo cabe una fuente SFX: esta mide ${psuW}×${psuH} mm` : `Una fuente de ${psuLen} mm no cabe en su hueco`;
  else if (bay.front && !bay.vertical && psuCenter[2] + psuLen / 2 > boardFrontZ - 4 && psuCenter[1] + psuH / 2 > L.boardTopY - B.h) psu.overflow = `Una fuente de ${psuLen} mm delante de la placa ${B.form} choca con ella: hay ${Math.round(boardFrontZ - L.chamber.min[2] - 8)} mm`;
  parts.push(psu);

  /* Almacenamiento: M.2 sobre la placa; 2,5" y 3,5" en la bahía, sin invadir la fuente. */
  const m2Units = kinds.filter((k) => k === "M.2").slice(0, B.m2.length).map((_, i) => ({ position: onBoard(B.m2[i][0], B.m2[i][1], 4) }));
  if (m2Units.length && (!sataKinds.length || kinds[0] === "M.2")) {
    parts.push(describe(p.storage!, "m2", m2Units[0].position, [3, 22, 80], profile(p.storage!), { dir: [1, 0, 0], distance: 150 }, { extra: sataKinds.length }, m2Units));
  } else {
    const bayD = L.driveBay;
    const kind3: Visual3DKind = sataKinds[0]?.includes("3.5") ? "drive-35" : "drive-25";
    const dsize: Vector3Tuple = kind3 === "drive-35" ? (bayD.vertical ? [26, 147, 102] : [102, 26, 147]) : (bayD.vertical ? [7, 100, 70] : [70, 7, 100]);
    const wanted = sataKinds.length ? sataKinds : ["2.5"];
    /* Hasta dónde llega la bahía en Z: la fuente, si comparte carril. */
    const psuMinZ = psuCenter[2] - psuLen / 2;
    const sameLane = sandwich ? false : bayD.vertical ? bay.vertical : !bay.vertical && !bay.front && !bay.top;
    const limitZ = sameLane ? psuMinZ - 6 : L.interior.max[2] - 10;
    let originZ = bayD.vertical ? bayD.origin[2] : Math.max(bayD.origin[2], frontObstacleZ + dsize[2] / 2 + 6);
    let overflow: string | undefined;
    if (!bayD.vertical && originZ + dsize[2] / 2 > limitZ) {
      const minZ = Math.max(L.chamber.min[2] + 52 + dsize[2] / 2 + 2, frontObstacleZ + dsize[2] / 2 + 6);
      originZ = Math.max(minZ, limitZ - dsize[2] / 2);
      if (originZ + dsize[2] / 2 > limitZ + 0.5) overflow = `Con una fuente de ${psuLen} mm no queda sitio bajo la cubierta para discos de ${kind3 === "drive-35" ? "3,5" : "2,5"}″`;
    }
    const perDrive = bayD.vertical ? 0 : dsize[1] + 4;
    const fitCount = bayD.vertical
      ? Math.max(1, Math.min(wanted.length, Math.floor((limitZ - originZ - dsize[2] / 2) / bayD.step[2]) + 1))
      : Math.max(1, Math.min(wanted.length, Math.floor(bayD.room / perDrive)));
    const units = wanted.slice(0, fitCount).map((_, i) => ({ position: [bayD.vertical ? bayD.origin[0] - dsize[0] / 2 : bayD.origin[0], bayD.origin[1] + (bayD.vertical ? 0 : perDrive * i + dsize[1] / 2), originZ + bayD.step[2] * i] as Vector3Tuple }));
    const drive = describe(p.storage!, kind3, units[0].position, dsize, profile(p.storage!), { dir: bayD.vertical ? [-1, 0, 0] : [0, -1, 0], distance: 120 }, { m2: m2Units.length }, units);
    if (bayD.vertical && dsize[0] > bayD.room) overflow = `Detrás de la bandeja solo hay ${Math.round(bayD.room)} mm: un disco de ${dsize[0]} mm no cabe`;
    else if (fitCount < wanted.length) overflow = `Solo caben ${fitCount} de ${wanted.length} discos en la bahía`;
    drive.overflow = overflow;
    parts.push(drive);
  }

  /* Tiras LED: arista superior pegada al cristal y, si hay dos, la inferior. */
  const rgbN = Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3));
  const stripLen = L.chamber.max[2] - L.chamber.min[2] - 60;
  const lowY = L.shroud ? L.shroud.max[1] + 10 : L.chamber.min[1] + 10;
  const rgbUnits = Array.from({ length: rgbN }, (_, i) => ({ position: [L.chamber.max[0] - 4 - (i === 2 ? 60 : 0), i === 1 ? lowY : L.chamber.max[1] - 10, (L.chamber.min[2] + L.chamber.max[2]) / 2] as Vector3Tuple }));
  parts.push(describe(p.rgb!, "rgb", rgbUnits[0].position, [6, 6, stripLen], profile(p.rgb!), { dir: [1, 0, 0], distance: 120 }, {}, rgbUnits));

  /* Tarjetas de expansión: primera ranura libre por debajo de la gráfica. */
  const expN = Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3));
  const freeSlots = sandwich ? 0 : B.slots - Math.ceil(gpuSlots);
  const firstFree = Math.min(B.pcieV + Math.ceil(gpuSlots) * 20.32 + 20.32, B.h - 18);
  const expUnits = Array.from({ length: Math.max(1, Math.min(expN, freeSlots)) }, (_, i) => ({ position: onBoard(60, firstFree + i * 20.32 - 5, 6 + 30) }));
  const expansion = describe(p.expansion!, "expansion", expUnits[0].position, [62, 16, 120], profile(p.expansion!), { dir: [1, 0, 0], distance: 200 }, {}, expUnits);
  if (freeSlots < 1) expansion.overflow = sandwich ? "En un sándwich la única ranura es para la gráfica" : `La placa ${B.form} no deja ranura libre bajo la gráfica`;
  else if (expN > freeSlots) expansion.overflow = `Solo quedan ${freeSlots} ranuras libres para ${expN} tarjetas`;
  parts.push(expansion);

  /* Cables: cada uno sale de un pasacables de la bandeja y llega a su conector,
     sin salirse de la cámara. Solo hay cables de alimentación con fuente y placa. */
  const G = L.grommets;
  const keep = (pt: Vector3Tuple): Vector3Tuple => [Math.min(Math.max(pt[0], L.trayX), L.chamber.max[0] - 6), Math.min(Math.max(pt[1], L.chamber.min[1] + 6), L.chamber.max[1] - 6), Math.min(Math.max(pt[2], L.chamber.min[2] + 6), L.chamber.max[2] - 6)];
  const cable = (kind: Visual3DCable["kind"], pts: Vector3Tuple[], radius: number, strands: number, spread: Vector3Tuple): Visual3DCable => ({ kind, path: pts.map(keep).map(mm3), radius: radius * U, strands, spread });
  const cables: Visual3DCable[] = [];
  if (present(p.mbo) && present(p.case)) {
    const fp = onBoard(B.fp[0], B.fp[1], 8);
    cables.push(cable("panel", [[fp[0] + 2, fp[1], fp[2]], [fp[0] + 12, fp[1] - 6, fp[2] - 14], [L.trayX + 10, G.low[1] - 4, G.low[2] + 2], G.low], 1.8, 1, [0, 1, 0]));
    if (sataDrives) {
      const port = onBoard(B.sata[0], B.sata[1], 8);
      cables.push(cable("sata", [[port[0], port[1], port[2] - 10], [port[0] + 8, port[1] - 24, port[2] - 24], [L.trayX + 14, G.low[1] + 10, G.low[2] + 4], G.low], 2.4, 1, [0, 1, 0]));
    }
  }
  if (present(p.psu) && present(p.mbo)) {
    const head = onBoard(B.atx24[0], B.atx24[1], 21);
    cables.push(cable("atx24", [[G.upper[0], head[1], G.upper[2]], [L.boardFaceX + 26, head[1], G.upper[2] - 4], [head[0] + 18, head[1], head[2] - 16], [head[0] + 3, head[1], head[2]]], 3.2, 4, [0, 1, 0]));
    const eps = onBoard(B.eps[0], B.eps[1], 19);
    cables.push(cable("eps", [G.top, [L.boardFaceX + 30, G.top[1] - 2, eps[2] + 6], [eps[0] + 12, eps[1] + 4, eps[2] + 2], [eps[0] + 2, eps[1], eps[2]]], 3.2, 2, [0, 0, 1]));
    if (present(p.gpu) && !sandwich) {
      const hpwr = Boolean(p.gpu?.metadata.hpwr);
      const plugs = hpwr ? 1 : Math.max(0, Math.min(3, finite(p.gpu?.metadata.conn8, 0) + finite(p.gpu?.metadata.conn6, 0)));
      for (let i = 0; i < plugs; i++) {
        const plug: Vector3Tuple = [gpuCenter[0] + gpuH / 2 + 9, gpuCenter[1] + gpuT / 2 - 7, gpuCenter[2] + gpuLen / 2 - 60 - i * 22];
        const approachZ = G.mid[2] + 0.35 * (plug[2] - G.mid[2]);
        cables.push(cable("pcie", [[plug[0] + 2, plug[1], plug[2]], [plug[0] + 26, plug[1] + 10, plug[2] - 24], [L.trayX + 36, G.mid[1] + 4, approachZ], G.mid], hpwr ? 3 : 3.2, hpwr ? 3 : 2, [0, 1, 0]));
      }
    }
  }

  /* Las interferencias se señalan sin alterar las medidas de las piezas. */
  const SIDES = ["hacia el lado ciego", "por abajo", "por delante", "hacia el cristal", "por arriba", "por detrás"];
  for (const x of parts) {
    if (x.overflow || x.category === "rgb") continue;
    const over = [0, 1, 2].map((k) => (interiorBox.min[k] - x.bounds.min[k]) / U).concat([0, 1, 2].map((k) => (x.bounds.max[k] - interiorBox.max[k]) / U));
    const worst = over.reduce((best, v, i) => (v > over[best] ? i : best), 0);
    if (over[worst] > 0.3) x.overflow = `No cabe: sobresale ${Math.round(over[worst])} mm ${SIDES[worst]}`;
  }

  // Todos los avisos usan al menos un anclaje o espacio interior inferido.
  for (const x of parts) if (x.overflow) x.overflow = `Estimación visual: ${x.overflow}`;

  /* Chasis y encuadre. */
  const chassis = describe(p.case!, "chassis", [0, 0, 0], L.size, caseProfile, { dir: [0, 0, 0], distance: 0 }, { family: L.family, window: L.panels.window, front: L.panels.front });
  const radius = (Math.hypot(...L.size) / 2) * U;
  const target: Vector3Tuple = [L.trayX * U * 0.3, -0.02, 0];
  return {
    chassis, parts, layout: L, chassisFans, cables, focusTarget: target, bounds: { min: mm3(L.shell.min), max: mm3(L.shell.max) },
    camera: { direction: [1, 0.3, -0.62], target, fov: 36, minDistance: radius * 1.05, maxDistance: radius * 3.4, radius },
  };
}

export const containsBox = (outer: Box3Tuple, inner: Box3Tuple, epsilon = 0.003) =>
  outer.min.every((v, i) => inner.min[i] >= v - epsilon) && outer.max.every((v, i) => inner.max[i] <= v + epsilon);
const overlaps = (a: Box3Tuple, b: Box3Tuple, epsilon = 0.002) => a.min.every((v, i) => v < b.max[i] - epsilon) && b.min.every((v, i) => v < a.max[i] - epsilon);

/* Pares que se tocan por diseño: el disipador abraza la CPU y una torre doble
   vuela sobre la memoria; el M.2 va sobre la placa. */
const TOUCHING: Array<[VisualCategory, VisualCategory]> = [["cooler", "cpu"], ["cooler", "ram"], ["storage", "mbo"]];

/** Contrato físico del montaje: lo comprueban las pruebas y el diagnóstico en desarrollo. */
export function validateVisual3DScene(scene: Visual3DScene): string[] {
  const errors: string[] = [];
  const L = scene.layout;
  const sandwich = L.family === "sandwich";
  const interior: Box3Tuple = { min: mm3(L.interior.min), max: mm3(L.interior.max) };
  const by = (c: VisualCategory) => scene.parts.find((x) => x.category === c)!;
  for (const x of scene.parts) if (!x.overflow && !containsBox(interior, x.bounds)) errors.push(`${x.category}:outside-interior`);
  const mbo = by("mbo"), cpu = by("cpu"), ram = by("ram"), gpu = by("gpu"), cooler = by("cooler"), psu = by("psu");
  if (Math.abs(mbo.bounds.min[0] - (L.trayX + 6.35) * U) > 0.002) errors.push("motherboard:detached-from-tray");
  const inBoard = (pt: Vector3Tuple) => pt[1] <= mbo.bounds.max[1] + 0.001 && pt[1] >= mbo.bounds.min[1] - 0.001 && pt[2] <= mbo.bounds.max[2] + 0.001 && pt[2] >= mbo.bounds.min[2] - 0.001;
  if (!inBoard(cpu.position)) errors.push("cpu:off-board");
  if (Math.abs(cpu.position[1] - (L.boardTopY - L.board.socket[1]) * U) > 0.002 || Math.abs(cpu.position[2] - (L.boardRearZ - L.board.socket[0]) * U) > 0.002) errors.push("cpu:off-socket");
  for (const u of ram.units) { if (!inBoard(u.position)) errors.push("ram:off-board"); if (u.position[2] >= cpu.position[2]) errors.push("ram:wrong-side-of-cpu"); }
  if (Math.abs(gpu.bounds.max[2] - L.boardRearZ * U) > 0.002) errors.push("gpu:bracket-not-at-rear");
  if (!sandwich && gpu.bounds.min[0] < mbo.bounds.max[0]) errors.push("gpu:inside-board");
  if (!sandwich && Math.abs(gpu.bounds.max[1] - 0.04 - (L.boardTopY - L.board.pcieV) * U) > 0.003) errors.push("gpu:off-pcie-slot");
  if (cooler.kind === "aio") {
    const plane = cooler.mount ? L.mounts[cooler.mount] : undefined;
    if (!plane) { if (!cooler.overflow) errors.push("aio:radiator-off-mount"); }
    else if (cooler.position.join() !== mm3(plane.center).join()) errors.push("aio:radiator-off-mount");
    else if (plane.capacityMm < finite(cooler.detail.radSize, 240) && !cooler.overflow) errors.push("aio:radiator-too-big-for-mount");
    for (const path of cooler.tubePaths || []) for (const pt of path) if (!pt.every((v, i) => v >= interior.min[i] - 0.003 && v <= interior.max[i] + 0.003)) errors.push("aio:tube-outside");
  } else {
    if (Math.abs(cooler.position[1] - cpu.position[1]) > 0.002) errors.push("cooler:off-socket");
  }
  if (!L.psuBay.vertical && !L.psuBay.top && L.shroud && psu.bounds.max[1] > L.shroud.max[1] * U + 0.002) errors.push("psu:above-shroud");

  /* Nada se cruza: piezas montadas entre sí, ventiladores contra piezas y
     contra el hueco del escudo I/O, radiador con sus ventiladores contra lo
     que tiene debajo. Una pieza con aviso de que no cabe ya está señalada. */
  const solid = scene.parts.filter((x) => present(x.source) && !x.overflow && x.category !== "rgb");
  const skip = (a: VisualCategory, b: VisualCategory) => TOUCHING.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
    const a = solid[i], b = solid[j];
    if (skip(a.category, b.category)) continue;
    for (const ua of a.units) for (const ub of b.units) if (overlaps(unitBox(a, ua), unitBox(b, ub))) { errors.push(`${a.category}:overlaps-${b.category}`); break; }
  }
  const ioBox: Box3Tuple = { min: mm3([L.boardFaceX, L.boardTopY - L.board.ioV[1], L.boardRearZ - 30]), max: mm3([L.boardFaceX + 46, L.boardTopY - L.board.ioV[0], L.interior.max[2]]) };
  const fanBoxes = scene.chassisFans.map((f) => boxAt(f.position, oriented([f.size * U, f.size * U, 0.25], f.normal)));
  for (const f of fanBoxes) {
    if (overlaps(f, ioBox)) errors.push("fan:overlaps-io");
    for (const x of solid) if (x.category !== "fan") for (const u of x.units) if (overlaps(f, unitBox(x, u))) { errors.push(`fan:overlaps-${x.category}`); break; }
  }
  const fanPart = by("fan");
  if (present(fanPart.source) && !fanPart.overflow) for (const u of fanPart.units) if (overlaps(unitBox(fanPart, u), ioBox)) errors.push("fan:overlaps-io");
  if (cooler.kind === "aio" && !cooler.overflow) {
    const n: Vector3Tuple = [finite(cooler.detail.normalX, 0), finite(cooler.detail.normalY, 0), finite(cooler.detail.normalZ, 0)];
    const env: Box3Tuple = { min: [...cooler.bounds.min] as Vector3Tuple, max: [...cooler.bounds.max] as Vector3Tuple };
    for (let k = 0; k < 3; k++) { if (n[k] > 0) env.max[k] += 0.27; if (n[k] < 0) env.min[k] -= 0.27; }
    if (overlaps(env, ioBox)) errors.push("aio:overlaps-io");
    for (const x of solid) if (x.category !== "cooler" && x.category !== "cpu") for (const u of x.units) if (overlaps(env, unitBox(x, u))) { errors.push(`aio:overlaps-${x.category}`); break; }
  }
  for (const c of scene.cables) for (const pt of c.path) if (!pt.every((v, i) => v >= interior.min[i] - 0.003 && v <= interior.max[i] + 0.003)) { errors.push(`cable:${c.kind}-outside`); break; }
  return errors;
}
