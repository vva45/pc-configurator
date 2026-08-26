import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";
import { aioGeometry, createVisualHardwareProfile, type CaseStyle, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

export type Vector3Tuple = [number, number, number];
export type ChassisFamily = "standard" | "airflow" | "dual-chamber" | "compact";
export type RadiatorMount = "top" | "front" | "side";
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";

export interface ChassisLayout {
  family: ChassisFamily;
  size: Vector3Tuple;
  shell: { min: Vector3Tuple; max: Vector3Tuple };
  tray: Vector3Tuple;
  motherboard: Vector3Tuple;
  rearIo: Vector3Tuple;
  cpuSocket: Vector3Tuple;
  ramSlots: Vector3Tuple;
  pcie: Vector3Tuple;
  m2: Vector3Tuple[];
  psuBay: Vector3Tuple;
  storageBay: Vector3Tuple;
  expansionSlots: Vector3Tuple;
  radiatorMounts: Record<RadiatorMount, Vector3Tuple | undefined>;
  preferredRadiatorMount: RadiatorMount;
}

export interface Visual3DPart { id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState; position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple; instances: number; metadata: VisualPart["metadata"]; profile: VisualHardwareProfile; connectionTarget?: Vector3Tuple; mount?: RadiatorMount; }
export interface Visual3DScene { chassis: Visual3DPart; parts: Visual3DPart[]; layout: ChassisLayout; focusTarget: Vector3Tuple; bounds: { min: Vector3Tuple; max: Vector3Tuple }; camera: { position: Vector3Tuple; target: Vector3Tuple; fov: number; minDistance: number; maxDistance: number; }; }

const clamp = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : fallback));
const formScale = (form: unknown): Vector3Tuple => { const value = String(form || "ATX").toLowerCase(); if (value.includes("mini") || value.includes("itx")) return [1, .7, .7]; if (value.includes("micro") || value.includes("matx")) return [1, .84, .82]; if (value.includes("e-atx") || value.includes("eatx")) return [1, 1.06, 1.08]; return [1, 1, 1]; };
const desc = (part: VisualPart, kind: Visual3DKind, position: Vector3Tuple, profile: VisualHardwareProfile, scale: Vector3Tuple = [1, 1, 1], instances = 1): Visual3DPart => ({ id: part.category, kind, category: part.category, source: part, state: part.state, position, rotation: [0, 0, 0], scale, instances, metadata: part.metadata, profile });

export function chassisFamily(style?: CaseStyle, name = ""): ChassisFamily {
  if (style === "WIDE_DUAL_CHAMBER" || style === "AQUARIUM") return "dual-chamber";
  if (style === "COMPACT_TOWER" || style === "MINI_TOWER" || style === "HTPC") return "compact";
  if (/AIR|FLOW|MESH|TORRENT/i.test(name)) return "airflow";
  return "standard";
}

/** Semantic case interior. X runs tray→window, Y bottom→top, Z rear→front. */
export function createChassisLayout(profile: VisualHardwareProfile): ChassisLayout {
  const family = chassisFamily(profile.style, profile.label);
  const defaults: Record<ChassisFamily, Vector3Tuple> = { standard: [2.25, 4.8, 4.45], airflow: [2.35, 4.9, 4.75], "dual-chamber": [2.85, 4.65, 4.55], compact: [2.05, 4.05, 3.75] };
  const measured = profile.dimensions;
  const size = measured ? [clamp(measured.width / 100, 2.2, 2, 3.1), clamp(measured.height / 100, 4.7, 3.8, 5.4), clamp(measured.depth / 100, 4.4, 3.6, 5.3)] as Vector3Tuple : defaults[family];
  const [w, h, d] = size; const min: Vector3Tuple = [-w / 2, -h / 2, -d / 2]; const max: Vector3Tuple = [w / 2, h / 2, d / 2];
  const trayX = min[0] + .16; const board: Vector3Tuple = [trayX + .055, family === "compact" ? .1 : .22, -.42];
  const sideMount = family === "dual-chamber" ? [max[0] - .2, .35, .5] as Vector3Tuple : undefined;
  return { family, size, shell: { min, max }, tray: [trayX, .15, -.35], motherboard: board,
    rearIo: [board[0], .78, min[2] + .13], cpuSocket: [board[0] + .12, .78, -.6], ramSlots: [board[0] + .16, .85, .08],
    pcie: [board[0] + .3, -.62, -.45], m2: [[board[0] + .13, -.02, -.42], [board[0] + .13, -.38, .2]],
    psuBay: family === "dual-chamber" ? [min[0] + .55, min[1] + .62, .75] : [min[0] + .72, min[1] + .62, min[2] + .85],
    storageBay: family === "dual-chamber" ? [min[0] + .38, -.65, 1.45] : [max[0] - .3, -.72, max[2] - .48],
    expansionSlots: [board[0] + .22, -.92, min[2] + .15],
    radiatorMounts: { top: [0, max[1] - .2, .15], front: [0, .25, max[2] - .2], side: sideMount },
    preferredRadiatorMount: family === "dual-chamber" ? "side" : family === "airflow" ? "front" : "top" };
}

/** Pure VisualBuildModel → deterministic, anchor-based technical assembly. One unit is 100 mm. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts; const caseProfile = createVisualHardwareProfile(p.case!); const layout = createChassisLayout(caseProfile);
  const mboProfile = createVisualHardwareProfile(p.mbo!); const profile = (part: VisualPart) => createVisualHardwareProfile(part, mboProfile);
  const chassis = desc(p.case!, "chassis", [0, 0, 0], caseProfile, layout.size);
  const parts: Visual3DPart[] = [
    desc(p.mbo!, "motherboard", layout.motherboard, mboProfile, formScale(p.mbo?.metadata.form)),
    desc(p.cpu!, "cpu", layout.cpuSocket, profile(p.cpu!), [.13, .48, .48]),
    desc(p.ram!, "ram", layout.ramSlots, profile(p.ram!), [1, 1, 1], Math.round(clamp(p.ram?.metadata.modules, 2, 1, 4))),
    desc(p.gpu!, "gpu", layout.pcie, profile(p.gpu!), [1, 1, clamp(p.gpu?.metadata.lengthMm, 280, 170, Math.min(400, layout.size[2] * 82)) / 280]),
  ];
  const coolerMode = p.cooler?.metadata.mode === "aio" ? "aio" : "air-cooler"; const aio = aioGeometry(p.cooler?.metadata.radiatorMm, p.cooler?.metadata.fans);
  if (coolerMode === "aio") {
    const mount = layout.preferredRadiatorMount; const cooler = desc(p.cooler!, "aio", layout.radiatorMounts[mount]!, profile(p.cooler!), [aio.lengthMm / 240, aio.widthMm / 126, aio.thicknessMm / 30], aio.fanCount);
    cooler.mount = mount; cooler.connectionTarget = layout.cpuSocket; parts.push(cooler);
  } else parts.push(desc(p.cooler!, "air-cooler", [layout.cpuSocket[0] + .5, layout.cpuSocket[1], layout.cpuSocket[2]], profile(p.cooler!), [clamp(p.cooler?.metadata.heightMm, 155, 70, 180) / 155, 1, 1]));
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase(); const psuScale = psuForm.includes("sfx") ? (psuForm.includes("-l") ? .82 : .72) : 1;
  parts.push(desc(p.psu!, "psu", layout.psuBay, profile(p.psu!), [psuScale, psuScale, psuScale]));
  const storageType = String(p.storage?.metadata.type || "M.2"); const storageKind: Visual3DKind = storageType.includes("3.5") ? "drive-35" : storageType.includes("2.5") ? "drive-25" : "m2";
  parts.push(desc(p.storage!, storageKind, storageKind === "m2" ? layout.m2[0] : layout.storageBay, profile(p.storage!), [1, 1, 1], Math.round(clamp(p.storage?.metadata.count, 1, 1, storageKind === "m2" ? 2 : 3))));
  parts.push(desc(p.fan!, "fan", [0, .15, layout.shell.max[2] - .18], profile(p.fan!), [1, 1, 1], Math.round(clamp(p.fan?.metadata.count, 2, 1, 3))));
  parts.push(desc(p.rgb!, "rgb", [layout.shell.min[0] + .1, 0, .4], profile(p.rgb!), [1, 1, 1], Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3))));
  parts.push(desc(p.expansion!, "expansion", layout.expansionSlots, profile(p.expansion!), [1, 1, 1], Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3))));
  const radius = Math.hypot(...layout.size) / 2; const target: Vector3Tuple = [0, .05, 0];
  return { chassis, parts, layout, focusTarget: target, bounds: layout.shell, camera: { position: [radius * 1.15, radius * .68, radius * 1.35], target, fov: 38, minDistance: radius * 1.1, maxDistance: radius * 3.2 } };
}
