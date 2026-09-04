/* ═══════════════════════════════════════════════════════════════════
   COLOCACIÓN 3D — de un VisualBuildModel a una escena montada

   Todo se calcula en MILÍMETROS reales y se pasa a unidades de escena
   (1 unidad = 100 mm) al describir cada pieza. Ninguna cota es «a ojo»:
   la placa mide lo que dice su formato, la gráfica lo que dice el catálogo
   y el chasis lo que dicen sus dimensiones. Lo que el catálogo no da
   (altura de una gráfica, grosor de un radiador) se toma de la norma o
   del valor típico de su clase, y se dice en el comentario.

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
export type ChassisFamily = "standard" | "airflow" | "dual-chamber" | "compact";
export type RadiatorMount = "top" | "front" | "side" | "bottom" | "rear";
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Box3Tuple { min: Vector3Tuple; max: Vector3Tuple }

const U = 0.01; // mm → unidades de escena
const mm3 = (v: Vector3Tuple): Vector3Tuple => [v[0] * U, v[1] * U, v[2] * U];
const finite = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
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
  chipset: [number, number];       // centro del disipador del chipset
}
export function boardSpec(form: unknown, dimm?: unknown): BoardSpec {
  const f = String(form || "ATX").toLowerCase();
  const itx = f.includes("itx"), micro = f.includes("micro") || f.includes("matx"), eatx = f.includes("e-atx") || f.includes("eatx");
  const dimmSlots = Math.round(clamp(dimm, itx ? 2 : 4, 1, 8));
  if (itx) return { form: "Mini-ITX", h: 170, d: 170, slots: 1, dimm: Math.min(2, dimmSlots), socket: [88, 66], ramU0: 138, ramPitch: 10, ramLen: 133, ramV0: 18, pcieV: 150, pcieU0: 45, pcieLen: 89, m2: [[100, 122]], ioV: [10, 135], chipset: [40, 122] };
  const h = micro ? 244 : 305, d = eatx ? 305 : 244;
  return {
    form: eatx ? "E-ATX" : micro ? "Micro-ATX" : "ATX", h, d, slots: micro ? 4 : 7, dimm: dimmSlots,
    socket: [125, 72], ramU0: 183, ramPitch: 10, ramLen: 133, ramV0: 12,
    pcieV: 160 + 1.5 * 20.32, pcieU0: 50, pcieLen: 89,
    m2: micro ? [[110, 128]] : [[110, 128], [110, 250]],
    ioV: [10, 165], chipset: [205, h - 70],
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
  trayX: number;                           // X de la cara de la bandeja donde apoyan los separadores
  boardFaceX: number;                      // X de la cara de componentes del PCB
  boardTopY: number; boardRearZ: number;   // borde superior y trasero de la placa
  board: BoardSpec;
  shroud?: Box3Tuple;                      // cubierta de la fuente, si la hay
  psuBay: { center: Vector3Tuple; vertical: boolean; top: boolean; front?: boolean };
  driveBay: { origin: Vector3Tuple; step: Vector3Tuple; vertical: boolean };
  mounts: Partial<Record<RadiatorMount, MountPlane>>;
  fanSlots: FanSlot[];
  panels: { window: "glass" | "mesh" | "solid"; front: "glass" | "mesh" | "solid" | "wood" };
  label: string;
}

export function chassisFamily(style?: CaseStyle, name = ""): ChassisFamily {
  if (style === "WIDE_DUAL_CHAMBER" || style === "AQUARIUM" || /O11|SHOWCASE|DUAL.?CHAMBER|VISION/i.test(name)) return "dual-chamber";
  if (style === "COMPACT_TOWER" || style === "MINI_TOWER" || style === "HTPC") return "compact";
  if (/AIR|FLOW|MESH|TORRENT/i.test(name)) return "airflow";
  return "standard";
}

const DEFAULT_SIZE: Record<ChassisFamily, Vector3Tuple> = { standard: [215, 465, 450], airflow: [230, 480, 470], "dual-chamber": [285, 460, 465], compact: [205, 400, 350] };

export function createChassisLayout(profile: VisualHardwareProfile, boardForm?: unknown, dimm?: unknown): ChassisLayout {
  const family = chassisFamily(profile.style, profile.label);
  const dims = profile.dimensions;
  const size: Vector3Tuple = dims
    ? [clamp(dims.width, DEFAULT_SIZE[family][0], 120, 450), clamp(dims.height, DEFAULT_SIZE[family][1], 250, 800), clamp(dims.depth, DEFAULT_SIZE[family][2], 220, 700)]
    : DEFAULT_SIZE[family];
  const [w, h, d] = size;
  const shell: Box3Tuple = { min: [-w / 2, -h / 2, -d / 2], max: [w / 2, h / 2, d / 2] };
  /* Chapa de 1 mm, pies de 18 mm, frontal con hueco de 22 mm para el aire. */
  const interior: Box3Tuple = { min: [shell.min[0] + 3, shell.min[1] + 20, shell.min[2] + 22], max: [shell.max[0] - 5, shell.max[1] - 4, shell.max[2] - 3] };
  const dual = family === "dual-chamber";
  /* Detrás de la bandeja quedan 24 mm para cables; en doble cámara, 92 para la fuente. */
  const trayX = interior.min[0] + (dual ? 92 : 24);
  const chamber: Box3Tuple = { min: [trayX, interior.min[1], interior.min[2]], max: [interior.max[0], interior.max[1], interior.max[2]] };
  const board = boardSpec(boardForm, dimm);
  const boardFaceX = trayX + 6.35 + 1.6;

  /* Fuente: abajo atrás casi siempre; en la cámara trasera en las de doble
     cámara; arriba en las pocas que la llevan ahí (Torrent y similares). */
  const psuPos = String(profile.caseFeatures?.psuPosition || "").toLowerCase();
  const psuRear = dual || /trasera|rear/.test(psuPos);
  const chamberH = chamber.max[1] - chamber.min[1];
  /* En los cubos ITX sin sitio para una cubierta (NR200 y parecidos) la fuente va
     arriba y delante, sobre la zona libre que deja la placa; abajo chocaría con la
     gráfica. Las torres que la llevan arriba de origen (Torrent) también. */
  const compactTop = !psuRear && chamberH < 380;
  const psuOnTop = /superior|top/.test(psuPos) || /torrent/i.test(profile.label) || compactTop;
  const shroudTop = !psuRear && !psuOnTop && chamberH >= 380 ? chamber.min[1] + 100 : chamber.min[1];
  const shroud: Box3Tuple | undefined = shroudTop > chamber.min[1]
    ? { min: [chamber.min[0], chamber.min[1], chamber.min[2] + 52], max: [chamber.max[0], shroudTop, chamber.max[2]] }
    : undefined;

  /* La placa cuelga del techo: deja arriba sitio para un ventilador o un radiador
     (25 a 65 mm) y apoya el borde trasero a 8 mm del panel trasero. */
  const topMargin = clamp(chamber.max[1] - shroudTop - board.h - 15, 40, 25, 65);
  const boardTopY = chamber.max[1] - topMargin;
  const boardRearZ = interior.max[2] - 8;

  const psuBay = psuRear
    ? { center: [trayX - 48, interior.min[1] + 115, 0] as Vector3Tuple, vertical: true, top: false }
    : { center: [(chamber.min[0] + chamber.max[0]) / 2, psuOnTop ? chamber.max[1] - 49 : chamber.min[1] + 49, 0] as Vector3Tuple, vertical: false, top: psuOnTop, front: compactTop };
  const driveBay = dual
    ? { origin: [trayX - 12, interior.min[1] + 160, interior.min[2] + 90] as Vector3Tuple, step: [0, 0, 115] as Vector3Tuple, vertical: true }
    : { origin: [chamber.min[0] + 44, chamber.min[1] + 16, chamber.min[2] + 60] as Vector3Tuple, step: [0, 30, 0] as Vector3Tuple, vertical: false };

  /* Anclajes de radiador: capacidad nominal que declara la caja y luz real. */
  const declared = (profile.caseFeatures?.radiatorMounts || {}) as Record<string, unknown>;
  const hasDeclared = Object.keys(declared).length > 0;
  const cap = (k: string, fallback: number) => (hasDeclared ? finite(declared[k], 0) : fallback);
  const cx = (chamber.min[0] + chamber.max[0]) / 2 + 8;
  const openTop = shroud ? shroudTop : chamber.min[1];
  const mounts: Partial<Record<RadiatorMount, MountPlane>> = {};
  const topCap = cap("top", family === "compact" ? 240 : 280), frontCap = cap("front", dual ? 0 : family === "compact" ? 240 : 360);
  const sideCap = cap("side", dual ? 360 : 0), bottomCap = cap("bottom", dual ? 360 : 0), rearCap = cap("rear", 120);
  if (topCap) mounts.top = { mount: "top", center: [cx, chamber.max[1] - 16, (chamber.min[2] + chamber.max[2]) / 2 + 10], normal: [0, -1, 0], longAxis: "z", capacityMm: topCap, spanMm: chamber.max[2] - chamber.min[2] - 30 };
  /* La cubierta de la fuente se retira 52 mm del frontal precisamente para que el
     radiador baje por delante de ella: el hueco frontal es toda la cámara. */
  const frontMid = (chamber.min[1] + chamber.max[1]) / 2, radFrontSpan = chamber.max[1] - chamber.min[1] - 20;
  if (frontCap) mounts.front = { mount: "front", center: [cx, frontMid, chamber.min[2] + 25 + 16], normal: [0, 0, 1], longAxis: "y", capacityMm: frontCap, spanMm: radFrontSpan };
  if (sideCap) mounts.side = { mount: "side", center: [cx, (openTop + chamber.max[1]) / 2, chamber.min[2] + 62], normal: [0, 0, 1], longAxis: "y", capacityMm: sideCap, spanMm: chamber.max[1] - openTop - 16 };
  if (bottomCap && !shroud && (psuRear || psuOnTop)) mounts.bottom = { mount: "bottom", center: [cx, chamber.min[1] + 16, (chamber.min[2] + chamber.max[2]) / 2 - 10], normal: [0, 1, 0], longAxis: "z", capacityMm: bottomCap, spanMm: chamber.max[2] - chamber.min[2] - 30 };
  if (rearCap) mounts.rear = { mount: "rear", center: [boardFaceX + 62, boardTopY - 62, interior.max[2] - 16], normal: [0, 0, -1], longAxis: "y", capacityMm: rearCap, spanMm: 150 };

  /* Posiciones de ventilador de caja: frontal de abajo arriba, trasero, techo. */
  const sizes = (profile.caseFeatures?.fanSizes || [120, 140]).filter((n): n is number => typeof n === "number");
  const frontFan = sizes.includes(140) ? 140 : sizes[0] || 120;
  const fanSlots: FanSlot[] = [];
  const frontSpan = chamber.max[1] - openTop - 8;
  const nFront = Math.max(1, Math.min(3, Math.floor(frontSpan / (frontFan + 6))));
  const frontStart = openTop + 6 + frontFan / 2 + (frontSpan - nFront * (frontFan + 6)) / 2;
  for (let i = 0; i < nFront; i++) fanSlots.push({ position: [cx, frontStart + i * (frontFan + 6), chamber.min[2] + 14], normal: [0, 0, 1], size: frontFan, where: "front" });
  fanSlots.push({ position: [boardFaceX + 62, boardTopY - 62, interior.max[2] - 14], normal: [0, 0, -1], size: 120, where: "rear" });
  const topSpan = chamber.max[2] - chamber.min[2] - 40;
  const nTop = Math.max(0, Math.min(3, Math.floor(topSpan / 126)));
  for (let i = 0; i < nTop; i++) fanSlots.push({ position: [cx, chamber.max[1] - 14, chamber.max[2] - 30 - 63 - i * 126], normal: [0, -1, 0], size: 120, where: "top" });

  const panels = profile.caseFeatures?.panels || { window: "glass" as const, front: "solid" as const };
  const wood = /nogal|walnut|roble|oak|madera|wood/i.test(`${profile.label} ${profile.caseFeatures?.color || ""}`);
  return {
    family, size, shell, interior, chamber, trayX, boardFaceX, boardTopY, boardRearZ, board, shroud, psuBay, driveBay, mounts, fanSlots,
    panels: { window: panels.window, front: wood ? "wood" : dual ? "glass" : panels.front }, label: profile.label,
  };
}

/* ── Piezas ──────────────────────────────────────────────────────────── */
export interface Visual3DPart {
  id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState;
  position: Vector3Tuple; size: Vector3Tuple; bounds: Box3Tuple;    // unidades de escena
  units: Array<{ position: Vector3Tuple; normal?: Vector3Tuple }>;   // cada ejemplar (RAM, discos, ventiladores)
  instances: number;
  metadata: VisualPart["metadata"]; profile: VisualHardwareProfile;
  /* Por dónde sale la pieza en la vista explosionada: dirección y distancia (unidades). */
  explode: { dir: Vector3Tuple; distance: number };
  /* Lo que el renderizador necesita para dar forma a la pieza. */
  detail: Record<string, number | string | boolean | undefined>;
  mount?: RadiatorMount; tubePaths?: Vector3Tuple[][]; connectionTarget?: Vector3Tuple; board?: BoardSpec;
  overflow?: string;
}
export interface Visual3DScene {
  chassis: Visual3DPart; parts: Visual3DPart[]; layout: ChassisLayout;
  chassisFans: Array<{ position: Vector3Tuple; normal: Vector3Tuple; size: number }>; // unidades
  focusTarget: Vector3Tuple; bounds: Box3Tuple;
  camera: { direction: Vector3Tuple; target: Vector3Tuple; fov: number; minDistance: number; maxDistance: number; radius: number };
}

function describe(src: VisualPart, kind: Visual3DKind, center: Vector3Tuple, size: Vector3Tuple, profile: VisualHardwareProfile, explode: Visual3DPart["explode"], detail: Visual3DPart["detail"] = {}, units?: Array<{ position: Vector3Tuple; normal?: Vector3Tuple }>): Visual3DPart {
  const us = (units || [{ position: center }]).map((u) => ({ position: mm3(u.position), normal: u.normal }));
  const scaled = mm3(size);
  /* Una pieza con normal (ventilador) tiene su grosor a lo largo de ella. */
  const oriented = (n?: Vector3Tuple): Vector3Tuple => !n ? scaled : n[1] ? [scaled[0], scaled[2], scaled[1]] : n[0] ? [scaled[2], scaled[1], scaled[0]] : scaled;
  const bounds = us.reduce((acc, u) => union(acc, boxAt(u.position, oriented(u.normal))), boxAt(us[0].position, oriented(us[0].normal)));
  return { id: src.category, kind, category: src.category, source: src, state: src.state, position: mm3(center), size: scaled, bounds, units: us, instances: us.length, metadata: src.metadata, profile, explode: { dir: explode.dir, distance: explode.distance * U }, detail };
}

export function resolveRadiatorMount(layout: ChassisLayout, radSize: number): RadiatorMount | undefined {
  const dual = layout.family === "dual-chamber";
  const order: RadiatorMount[] = radSize >= 360 ? (dual ? ["side", "top", "bottom", "front"] : ["front", "top", "side"])
    : radSize >= 240 ? (dual ? ["top", "side", "bottom", "front"] : ["top", "front", "side"]) : ["rear", "top", "front", "side"];
  const fanSize = radSize === 280 || radSize === 420 || radSize === 140 ? 140 : 120;
  const len = Math.round(radSize / fanSize) * fanSize + 12;
  return order.find((m) => { const p = layout.mounts[m]; return p && p.capacityMm >= radSize && p.spanMm >= len; }) ?? order.find((m) => layout.mounts[m]);
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

/** VisualBuildModel → escena montada. Determinista: misma entrada, misma escena. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts;
  const caseProfile = createVisualHardwareProfile(p.case!);
  const mboProfile = createVisualHardwareProfile(p.mbo!);
  const L = createChassisLayout(caseProfile, p.mbo?.metadata.form, p.mbo?.metadata.dimmSlots);
  const B = L.board;
  const profile = (x: VisualPart) => createVisualHardwareProfile(x, mboProfile);
  /* (u, v, h) sobre la placa → centro en mm del chasis. */
  const onBoard = (u: number, v: number, h: number): Vector3Tuple => [L.boardFaceX + h, L.boardTopY - v, L.boardRearZ - u];
  const parts: Visual3DPart[] = [];

  /* Placa base: PCB de 1,6 mm sobre separadores de 6,35. */
  const mbo = describe(p.mbo!, "motherboard", [L.boardFaceX - 0.8, L.boardTopY - B.h / 2, L.boardRearZ - B.d / 2], [1.6, B.h, B.d], mboProfile, { dir: [1, 0, 0], distance: 130 }, { form: B.form, slots: B.slots, dimm: B.dimm });
  mbo.board = B; parts.push(mbo);

  /* CPU: zócalo de 45 mm con la tapa de 40 encima, 7 mm en total. */
  parts.push(describe(p.cpu!, "cpu", onBoard(B.socket[0], B.socket[1], 3.5), [7, 45, 45], profile(p.cpu!), { dir: [1, 0, 0], distance: 220 }));

  /* RAM: los módulos van a los zócalos más lejos de la CPU (A2/B2 y luego A1/B1). */
  const modules = Math.min(B.dimm, Math.round(clamp(p.ram?.metadata.modules, 2, 1, 8)));
  const ramH = clamp(p.ram?.metadata.heightMm, 40, 31, 60);
  const ramUnits = Array.from({ length: modules }, (_, i) => ({ position: onBoard(B.ramU0 + (B.dimm - 1 - i) * B.ramPitch, B.ramV0 + B.ramLen / 2, ramH / 2 + 2) }));
  parts.push(describe(p.ram!, "ram", ramUnits[0].position, [ramH, B.ramLen, 7], profile(p.ram!), { dir: [1, 0, 0], distance: 180 }, { slots: B.dimm, rgb: Boolean(p.ram?.metadata.rgb) }, ramUnits));

  /* Gráfica: soporte en el borde trasero, PCB en la ranura ×16 y el disipador
     colgando hacia abajo con los ventiladores mirando al suelo. La altura no
     viene en el catálogo: 115 mm en dos ranuras, 130 en 2,5 y 140 en tres o
     más, lo habitual en cada clase. */
  const gpuSlots = clamp(p.gpu?.metadata.slots, 2.5, 1, 4);
  const gpuLenReal = clamp(p.gpu?.metadata.lengthMm, 280, 140, 460);
  const gpuMaxLen = L.boardRearZ - L.chamber.min[2] - 6;
  const gpuLen = Math.min(gpuLenReal, gpuMaxLen);
  const gpuH = gpuSlots <= 2 ? 115 : gpuSlots < 3 ? 130 : 140;
  const gpuT = gpuSlots * 20.32 - 2;
  const gpu = describe(p.gpu!, "gpu", [L.boardFaceX + 6 + gpuH / 2, L.boardTopY - B.pcieV - gpuT / 2 + 4, L.boardRearZ - gpuLen / 2], [gpuH, gpuT, gpuLen], profile(p.gpu!), { dir: [1, 0, 0], distance: 280 },
    { fans: gpuLenReal < 290 ? 2 : 3, hpwr: Boolean(p.gpu?.metadata.hpwr), conn8: finite(p.gpu?.metadata.conn8, 0), conn6: finite(p.gpu?.metadata.conn6, 0), lengthMm: gpuLenReal, slots: gpuSlots });
  if (gpuLenReal > gpuMaxLen) gpu.overflow = `${gpuLenReal} mm no caben en los ${Math.round(gpuMaxLen)} mm libres`;
  parts.push(gpu);

  /* Refrigeración. */
  const ck = coolerKind(p.cooler?.metadata.type, p.cooler?.metadata.radiatorMm);
  const socket = onBoard(B.socket[0], B.socket[1], 0);
  const coolerMax = L.chamber.max[0] - L.boardFaceX - 6;
  if (ck.kind === "aio") {
    const radSize = clamp(ck.radSize, 240, 120, 420);
    const fanSize = radSize === 280 || radSize === 420 || radSize === 140 ? 140 : 120;
    const fans = Math.max(1, Math.round(radSize / fanSize));
    const radLen = fans * fanSize + 12, radW = fanSize + 4, radT = 30;
    const mount = resolveRadiatorMount(L, radSize);
    const plane = (mount && L.mounts[mount]) || L.mounts.top || L.mounts.front || L.mounts.rear!;
    const alongZ = plane.longAxis === "z";
    const usableLen = Math.min(radLen, plane.spanMm);
    const fansThatFit = Math.max(1, Math.min(fans, Math.floor((usableLen - 12) / fanSize)));
    const size: Vector3Tuple = alongZ ? [radW, radT, usableLen] : [radW, usableLen, radT];
    const center: Vector3Tuple = [plane.center[0], plane.center[1], plane.center[2]];
    const outward: Vector3Tuple = [-plane.normal[0], -plane.normal[1], -plane.normal[2]];
    const aio = describe(p.cooler!, "aio", center, size, profile(p.cooler!), { dir: outward, distance: 160 }, { radSize, fanSize, fans: fansThatFit, mount: plane.mount, along: plane.longAxis, radT });
    aio.mount = plane.mount;
    /* Bomba sobre el zócalo y dos tubos que salen hacia el cristal, suben y
       entran por el depósito del radiador más cercano. */
    const block: Vector3Tuple = [socket[0] + 22, socket[1], socket[2]];
    aio.connectionTarget = mm3(block);
    const tankZ = alongZ ? center[2] + Math.sign(socket[2] - center[2] || 1) * (usableLen / 2 - 14) : center[2];
    const tankY = alongZ ? center[1] - radT / 2 - 3 : center[1] + usableLen / 2 - 14;
    const faceZ = plane.mount === "rear" ? center[2] - radT / 2 - 14 : center[2] + radT / 2 + 14;
    const inside = (pt: Vector3Tuple): Vector3Tuple => [Math.min(Math.max(pt[0], L.chamber.min[0] + 8), L.chamber.max[0] - 8), Math.min(Math.max(pt[1], L.chamber.min[1] + 8), L.chamber.max[1] - 8), Math.min(Math.max(pt[2], L.chamber.min[2] + 8), L.chamber.max[2] - 8)];
    aio.tubePaths = [-10, 10].map((off) => {
      const a: Vector3Tuple = [block[0] + 18, block[1] + off, block[2] - 24];
      const lift: Vector3Tuple = [Math.min(block[0] + 70, L.chamber.max[0] - 20), block[1] + 45 + off, block[2] - 40];
      const near: Vector3Tuple = alongZ ? [center[0] + 4, tankY - 16, tankZ + off] : [center[0] + 4, tankY + off, faceZ];
      const end: Vector3Tuple = alongZ ? [center[0] + 4, tankY, tankZ + off] : [center[0] + 4, tankY + off, faceZ - Math.sign(faceZ - center[2]) * 12];
      return [a, lift, near, end].map(inside).map(mm3);
    });
    parts.push(aio);
  } else {
    /* Torre: bloque de 50 mm de aletas centrado en el zócalo y ventilador de 27 mm
       delante (hacia el frontal). Doble torre: dos bloques con un ventilador entre
       medias y otro delante, 154 mm en total, como un NH-D15. */
    const height = Math.min(clamp(p.cooler?.metadata.heightMm, ck.kind === "top-flow" ? 70 : ck.kind === "stock" ? 45 : 158, 30, 200), coolerMax);
    const fanSize = clamp(p.cooler?.metadata.fanSizeMm, 120, 80, 140);
    const towers = ck.kind === "dual-tower" ? 2 : 1;
    const tower = ck.kind === "tower" || ck.kind === "dual-tower";
    const depth = tower ? (towers === 2 ? 154 : 77) : fanSize + 6;
    const width = fanSize + 6;
    const center: Vector3Tuple = [L.boardFaceX + 7 + (height - 7) / 2, socket[1], tower ? socket[2] - 13.5 : socket[2]];
    const cooler = describe(p.cooler!, "air-cooler", center, [height - 7, width, depth], profile(p.cooler!), { dir: [1, 0, 0], distance: 300 },
      { kind: ck.kind, towers, fanSize, heightMm: height, fans: Math.round(clamp(p.cooler?.metadata.fans, towers === 2 ? 2 : 1, 0, 3)) });
    cooler.connectionTarget = mm3(socket);
    parts.push(cooler);
  }

  /* Fuente: ATX 150×86, SFX 125×63,5; el largo lo da el catálogo. */
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase();
  const sfx = psuForm.includes("sfx");
  const psuLen = clamp(p.psu?.metadata.lengthMm, sfx ? (psuForm.includes("-l") ? 130 : 100) : 150, 90, 230);
  const psuW = sfx ? 125 : 150, psuH = sfx ? 63.5 : 86;
  const bay = L.psuBay;
  const psuSize: Vector3Tuple = bay.vertical ? [psuH, psuW, psuLen] : [psuW, psuH, psuLen];
  const psuCenter: Vector3Tuple = bay.vertical
    ? [bay.center[0], bay.center[1], L.interior.max[2] - psuLen / 2 - 10]
    : [bay.center[0], bay.center[1] + (bay.top ? (86 - psuH) / 2 : -(86 - psuH) / 2), bay.front ? L.chamber.min[2] + psuLen / 2 + 8 : L.chamber.max[2] - psuLen / 2 - 8];
  parts.push(describe(p.psu!, "psu", psuCenter, psuSize, profile(p.psu!), { dir: [0, 0, 1], distance: 220 }, { form: sfx ? (psuForm.includes("-l") ? "SFX-L" : "SFX") : "ATX", watt: finite(p.psu?.metadata.watt, 0), vertical: bay.vertical, top: bay.top }));

  /* Almacenamiento: M.2 sobre la placa; 2,5" y 3,5" en la bahía. */
  const drives = (() => { try { return JSON.parse(String(p.storage?.metadata.drives || "[]")) as Array<{ type: string }>; } catch { return []; } })();
  const stType = String(p.storage?.metadata.type || "M.2");
  const count = Math.round(clamp(p.storage?.metadata.count, 1, 1, 4));
  const kinds = (drives.length ? drives.map((x) => x.type) : Array.from({ length: count }, () => stType)).slice(0, 4);
  const m2Units = kinds.filter((k) => k === "M.2").slice(0, B.m2.length).map((_, i) => ({ position: onBoard(B.m2[i][0], B.m2[i][1], 4) }));
  const sataKinds = kinds.filter((k) => k !== "M.2");
  if (m2Units.length && (!sataKinds.length || kinds[0] === "M.2")) {
    parts.push(describe(p.storage!, "m2", m2Units[0].position, [3, 22, 80], profile(p.storage!), { dir: [1, 0, 0], distance: 150 }, { extra: sataKinds.length }, m2Units));
  } else {
    const kind3: Visual3DKind = sataKinds[0]?.includes("3.5") ? "drive-35" : "drive-25";
    const dsize: Vector3Tuple = kind3 === "drive-35" ? (L.driveBay.vertical ? [26, 147, 102] : [102, 26, 147]) : (L.driveBay.vertical ? [7, 100, 70] : [70, 7, 100]);
    const units = (sataKinds.length ? sataKinds : ["2.5"]).map((_, i) => ({ position: [L.driveBay.origin[0] + L.driveBay.step[0] * i, L.driveBay.origin[1] + L.driveBay.step[1] * i + (L.driveBay.vertical ? 0 : dsize[1] / 2), L.driveBay.origin[2] + L.driveBay.step[2] * i] as Vector3Tuple }));
    parts.push(describe(p.storage!, kind3, units[0].position, dsize, profile(p.storage!), { dir: L.driveBay.vertical ? [-1, 0, 0] : [0, -1, 0], distance: 120 }, { m2: m2Units.length }, units));
  }

  /* Ventiladores: los que trae la caja son del chasis; los elegidos ocupan las
     posiciones libres. Un radiador se lleva las de su cara. */
  const aioPart = parts.find((x) => x.kind === "aio");
  const taken = new Set<RadiatorMount>(aioPart?.mount === "side" ? ["front", "side"] : aioPart?.mount ? [aioPart.mount] : []);
  const free = L.fanSlots.filter((s) => !taken.has(s.where));
  const included = Math.min(free.length, Math.round(clamp(caseProfile.caseFeatures?.fanIncluded, 0, 0, 6)));
  const chosen = Math.round(clamp(p.fan?.metadata.count, 0, 0, 9));
  const chosenSlots = free.slice(included, included + chosen);
  const fallback = free[Math.min(included, free.length - 1)] || L.fanSlots[0];
  const fanUnits = (chosenSlots.length ? chosenSlots : [fallback]).map((s) => ({ position: s.position, normal: s.normal }));
  const fanSize = chosenSlots[0]?.size || clamp(p.fan?.metadata.sizeMm, 120, 80, 200);
  parts.push(describe(p.fan!, "fan", fanUnits[0].position, [fanSize, fanSize, 25], profile(p.fan!), { dir: [0, 0, -1], distance: 140 }, { size: fanSize }, fanUnits));
  const chassisFans = free.slice(0, included).map((s) => ({ position: mm3(s.position), normal: s.normal, size: s.size }));

  /* Tiras LED: arista superior junto al cristal y, si hay dos, la inferior. */
  const rgbN = Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3));
  const stripLen = L.chamber.max[2] - L.chamber.min[2] - 60;
  const lowY = L.shroud ? L.shroud.max[1] + 10 : L.chamber.min[1] + 10;
  const rgbUnits = Array.from({ length: rgbN }, (_, i) => ({ position: [L.chamber.max[0] - 14 - (i === 2 ? 60 : 0), i === 1 ? lowY : L.chamber.max[1] - 10, (L.chamber.min[2] + L.chamber.max[2]) / 2] as Vector3Tuple }));
  parts.push(describe(p.rgb!, "rgb", rgbUnits[0].position, [6, 6, stripLen], profile(p.rgb!), { dir: [1, 0, 0], distance: 120 }, {}, rgbUnits));

  /* Tarjetas de expansión: primera ranura libre por debajo de la gráfica. */
  const expN = Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3));
  const firstFree = Math.min(B.pcieV + Math.ceil(gpuSlots) * 20.32 + 20.32, B.h - 18);
  const expUnits = Array.from({ length: expN }, (_, i) => ({ position: onBoard(60, firstFree + i * 20.32 - 5, 6 + 30) }));
  parts.push(describe(p.expansion!, "expansion", expUnits[0].position, [62, 16, 120], profile(p.expansion!), { dir: [1, 0, 0], distance: 200 }, {}, expUnits));

  /* Chasis y encuadre. */
  const chassis = describe(p.case!, "chassis", [0, 0, 0], L.size, caseProfile, { dir: [0, 0, 0], distance: 0 }, { family: L.family, window: L.panels.window, front: L.panels.front });
  const radius = (Math.hypot(...L.size) / 2) * U;
  const target: Vector3Tuple = [L.trayX * U * 0.3, -0.02, 0];
  return {
    chassis, parts, layout: L, chassisFans, focusTarget: target, bounds: { min: mm3(L.shell.min), max: mm3(L.shell.max) },
    camera: { direction: [1, 0.3, -0.62], target, fov: 36, minDistance: radius * 1.05, maxDistance: radius * 3.4, radius },
  };
}

export const containsBox = (outer: Box3Tuple, inner: Box3Tuple, epsilon = 0.003) =>
  outer.min.every((v, i) => inner.min[i] >= v - epsilon) && outer.max.every((v, i) => inner.max[i] <= v + epsilon);
const overlaps = (a: Box3Tuple, b: Box3Tuple, epsilon = 0.002) => a.min.every((v, i) => v < b.max[i] - epsilon) && b.min.every((v, i) => v < a.max[i] - epsilon);

/** Contrato físico del montaje: lo comprueban las pruebas y el diagnóstico en desarrollo. */
export function validateVisual3DScene(scene: Visual3DScene): string[] {
  const errors: string[] = [];
  const L = scene.layout;
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
  if (gpu.bounds.min[0] < mbo.bounds.max[0]) errors.push("gpu:inside-board");
  if (Math.abs(gpu.bounds.max[1] - 0.04 - (L.boardTopY - L.board.pcieV) * U) > 0.003) errors.push("gpu:off-pcie-slot");
  if (overlaps(gpu.bounds, psu.bounds)) errors.push("gpu:overlaps-psu");
  if (cooler.kind === "aio") {
    const plane = cooler.mount ? L.mounts[cooler.mount] : undefined;
    if (!plane || cooler.position.join() !== mm3(plane.center).join()) errors.push("aio:radiator-off-mount");
    else if (plane.capacityMm < finite(cooler.detail.radSize, 240)) errors.push("aio:radiator-too-big-for-mount");
    for (const path of cooler.tubePaths || []) for (const pt of path) if (!pt.every((v, i) => v >= interior.min[i] - 0.003 && v <= interior.max[i] + 0.003)) errors.push("aio:tube-outside");
  } else {
    if (Math.abs(cooler.position[1] - cpu.position[1]) > 0.002) errors.push("cooler:off-socket");
    if (overlaps(cooler.bounds, gpu.bounds)) errors.push("cooler:overlaps-gpu");
  }
  if (!L.psuBay.vertical && !L.psuBay.top && L.shroud && psu.bounds.max[1] > L.shroud.max[1] * U + 0.002) errors.push("psu:above-shroud");
  return errors;
}
