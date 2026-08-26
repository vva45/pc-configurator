import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";
import { aioGeometry, createVisualHardwareProfile, type CaseStyle, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

export type Vector3Tuple = [number, number, number];
export type ChassisFamily = "standard" | "airflow" | "dual-chamber" | "compact";
export type RadiatorMount = "top" | "front" | "side";
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Box3Tuple { min: Vector3Tuple; max: Vector3Tuple }

/** Every renderer position is resolved from this chassis-local mount map. */
export interface ChassisAnchors {
  motherboardTray: Vector3Tuple;
  rearIoPlane: Vector3Tuple;
  cpuSocketAnchor: Vector3Tuple;
  ramBankAnchor: Vector3Tuple;
  pcieSlotAnchor: Vector3Tuple;
  gpuBodyAnchor: Vector3Tuple;
  m2Anchors: Vector3Tuple[];
  sataTrayAnchors: Vector3Tuple[];
  psuBayAnchor: Vector3Tuple;
  frontMountAnchor: Vector3Tuple;
  topMountAnchor: Vector3Tuple;
  sideMountAnchor?: Vector3Tuple;
  rearFanAnchor: Vector3Tuple;
  storageCageAnchor: Vector3Tuple;
}

export interface ChassisLayout {
  family: ChassisFamily;
  size: Vector3Tuple;
  shell: Box3Tuple;
  interior: Box3Tuple;
  anchors: ChassisAnchors;
  tray: Vector3Tuple; motherboard: Vector3Tuple; rearIo: Vector3Tuple; cpuSocket: Vector3Tuple;
  ramSlots: Vector3Tuple; pcie: Vector3Tuple; m2: Vector3Tuple[]; psuBay: Vector3Tuple;
  storageBay: Vector3Tuple; expansionSlots: Vector3Tuple;
  radiatorMounts: Record<RadiatorMount, Vector3Tuple | undefined>;
  radiatorCapacity: Record<RadiatorMount, number>;
  preferredRadiatorMount: RadiatorMount;
}

export interface Visual3DPart { id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState; position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple; size: Vector3Tuple; bounds: Box3Tuple; instances: number; metadata: VisualPart["metadata"]; profile: VisualHardwareProfile; connectionTarget?: Vector3Tuple; mount?: RadiatorMount; }
export interface Visual3DScene { chassis: Visual3DPart; parts: Visual3DPart[]; layout: ChassisLayout; focusTarget: Vector3Tuple; bounds: Box3Tuple; camera: { position: Vector3Tuple; target: Vector3Tuple; fov: number; minDistance: number; maxDistance: number; }; }

const clamp = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : fallback));
const formFactor = (form: unknown) => { const value = String(form || "ATX").toLowerCase(); if (value.includes("mini") || value.includes("itx")) return { h: 1.7, d: 1.7 }; if (value.includes("micro") || value.includes("matx")) return { h: 2.44, d: 2.44 }; if (value.includes("e-atx") || value.includes("eatx")) return { h: 3.05, d: 3.3 }; return { h: 3.05, d: 2.44 }; };
const boxAt = (position: Vector3Tuple, size: Vector3Tuple): Box3Tuple => ({ min: position.map((v, i) => v - size[i] / 2) as Vector3Tuple, max: position.map((v, i) => v + size[i] / 2) as Vector3Tuple });
const desc = (part: VisualPart, kind: Visual3DKind, position: Vector3Tuple, profile: VisualHardwareProfile, size: Vector3Tuple, scale: Vector3Tuple = [1, 1, 1], instances = 1): Visual3DPart => ({ id: part.category, kind, category: part.category, source: part, state: part.state, position, rotation: [0, 0, 0], scale, size, bounds: boxAt(position, size), instances, metadata: part.metadata, profile });

export function chassisFamily(style?: CaseStyle, name = ""): ChassisFamily {
  if (style === "WIDE_DUAL_CHAMBER" || style === "AQUARIUM") return "dual-chamber";
  if (style === "COMPACT_TOWER" || style === "MINI_TOWER" || style === "HTPC") return "compact";
  if (/AIR|FLOW|MESH|TORRENT/i.test(name)) return "airflow";
  return "standard";
}

/** X runs tray→open side, Y bottom→top, Z rear→front. */
export function createChassisLayout(profile: VisualHardwareProfile): ChassisLayout {
  const family = chassisFamily(profile.style, profile.label);
  const defaults: Record<ChassisFamily, Vector3Tuple> = { standard: [2.35, 4.9, 4.55], airflow: [2.4, 5, 4.85], "dual-chamber": [2.95, 4.7, 4.65], compact: [2.15, 4.15, 3.9] };
  const measured = profile.dimensions;
  const size = measured ? [clamp(measured.width / 100, defaults[family][0], 2.1, 3.15), clamp(measured.height / 100, defaults[family][1], 4.05, 5.5), clamp(measured.depth / 100, defaults[family][2], 3.85, 5.35)] as Vector3Tuple : defaults[family];
  const [w, h, d] = size;
  const shell: Box3Tuple = { min: [-w / 2, -h / 2, -d / 2], max: [w / 2, h / 2, d / 2] };
  const clearance = .12;
  const interior: Box3Tuple = { min: [shell.min[0] + clearance, shell.min[1] + clearance, shell.min[2] + clearance], max: [shell.max[0] - clearance, shell.max[1] - clearance, shell.max[2] - clearance] };
  const trayX = interior.min[0] + .06;
  const boardCenter: Vector3Tuple = [trayX + .07, .32, interior.min[2] + 1.42];
  const cpu: Vector3Tuple = [boardCenter[0] + .12, boardCenter[1] + .55, boardCenter[2] - .28];
  const pcie: Vector3Tuple = [boardCenter[0] + .32, boardCenter[1] - .68, interior.min[2] + .2];
  const side = family === "dual-chamber" ? [interior.max[0] - .16, .32, .55] as Vector3Tuple : undefined;
  const storage: Vector3Tuple = family === "dual-chamber" ? [interior.min[0] + .28, -.65, interior.max[2] - .5] : [interior.max[0] - .18, -.72, interior.max[2] - .48];
  const anchors: ChassisAnchors = {
    motherboardTray: [trayX, .2, -.25], rearIoPlane: [boardCenter[0], .9, interior.min[2]], cpuSocketAnchor: cpu,
    ramBankAnchor: [cpu[0] + .04, cpu[1], cpu[2] + .68], pcieSlotAnchor: pcie,
    gpuBodyAnchor: [pcie[0] + .34, pcie[1], interior.min[2] + (d - .34) / 2],
    m2Anchors: [[boardCenter[0] + .14, boardCenter[1] - .25, boardCenter[2] - .02], [boardCenter[0] + .14, boardCenter[1] - .58, boardCenter[2] + .45]],
    sataTrayAnchors: [storage, [storage[0], storage[1] + .42, storage[2]]],
    psuBayAnchor: family === "dual-chamber" ? [interior.min[0] + .74, interior.min[1] + .62, .82] : [interior.min[0] + .72, interior.min[1] + .62, interior.min[2] + .83],
    frontMountAnchor: [0, .32, interior.max[2] - .13], topMountAnchor: [0, interior.max[1] - .13, .1], sideMountAnchor: side,
    rearFanAnchor: [0, 1.45, interior.min[2] + .13], storageCageAnchor: storage,
  };
  const mounts = { top: anchors.topMountAnchor, front: anchors.frontMountAnchor, side: anchors.sideMountAnchor };
  const capacity: Record<RadiatorMount, number> = { top: family === "compact" ? 240 : d >= 4.5 ? 360 : 280, front: family === "compact" ? 240 : h >= 4.7 ? 360 : 280, side: side ? 360 : 0 };
  const preferred = (["top", "front", "side"] as RadiatorMount[]).find(m => mounts[m] && capacity[m] >= 240) || "front";
  return { family, size, shell, interior, anchors, tray: anchors.motherboardTray, motherboard: boardCenter, rearIo: anchors.rearIoPlane, cpuSocket: cpu, ramSlots: anchors.ramBankAnchor, pcie: anchors.pcieSlotAnchor, m2: anchors.m2Anchors, psuBay: anchors.psuBayAnchor, storageBay: storage, expansionSlots: [pcie[0], pcie[1] - .38, interior.min[2] + .1], radiatorMounts: mounts, radiatorCapacity: capacity, preferredRadiatorMount: preferred };
}

const radiatorMountFor = (layout: ChassisLayout, size: number): RadiatorMount => (["top", "front", "side"] as RadiatorMount[]).find(m => layout.radiatorMounts[m] && layout.radiatorCapacity[m] >= size) || (["top", "front", "side"] as RadiatorMount[]).find(m => layout.radiatorMounts[m])!;

/** Pure VisualBuildModel → deterministic, semantic-anchor assembly. One unit is 100 mm. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts; const caseProfile = createVisualHardwareProfile(p.case!); const layout = createChassisLayout(caseProfile);
  const mboProfile = createVisualHardwareProfile(p.mbo!); const profile = (part: VisualPart) => createVisualHardwareProfile(part, mboProfile);
  const board = formFactor(p.mbo?.metadata.form); const boardSize: Vector3Tuple = [.11, Math.min(board.h, layout.size[1] - .75), Math.min(board.d, layout.size[2] - .65)];
  const gpuLength = clamp(p.gpu?.metadata.lengthMm, 280, 170, Math.min(400, (layout.interior.max[2] - layout.anchors.pcieSlotAnchor[2]) * 100 - 8)) / 100;
  const gpuPosition: Vector3Tuple = [layout.anchors.gpuBodyAnchor[0], layout.anchors.gpuBodyAnchor[1], layout.anchors.pcieSlotAnchor[2] + gpuLength / 2];
  const chassis = desc(p.case!, "chassis", [0, 0, 0], caseProfile, layout.size, layout.size);
  const parts: Visual3DPart[] = [
    desc(p.mbo!, "motherboard", layout.motherboard, mboProfile, boardSize, [1, boardSize[1] / 2.9, boardSize[2] / 2.45]),
    desc(p.cpu!, "cpu", layout.anchors.cpuSocketAnchor, profile(p.cpu!), [.13, .48, .48], [.13, .48, .48]),
    desc(p.ram!, "ram", layout.anchors.ramBankAnchor, profile(p.ram!), [.12, 1.05, .7], [1, 1, 1], Math.round(clamp(p.ram?.metadata.modules, 2, 1, 4))),
    desc(p.gpu!, "gpu", gpuPosition, profile(p.gpu!), [.68, .72, gpuLength], [1, 1, gpuLength / 2.75]),
  ];
  const aio = aioGeometry(p.cooler?.metadata.radiatorMm, p.cooler?.metadata.fans);
  if (p.cooler?.metadata.mode === "aio") {
    const mount = radiatorMountFor(layout, aio.radiatorMm); const position = layout.radiatorMounts[mount]!;
    const radiatorSize: Vector3Tuple = mount === "top" ? [.62, .24, 1.9 * aio.lengthMm / 240] : mount === "front" ? [.62, 1.9 * aio.lengthMm / 240, .24] : [.24, 1.9 * aio.lengthMm / 240, .62];
    const cooler = desc(p.cooler!, "aio", position, profile(p.cooler!), radiatorSize, [aio.lengthMm / 240, aio.widthMm / 126, aio.thicknessMm / 30], aio.fanCount);
    cooler.mount = mount; cooler.connectionTarget = layout.anchors.cpuSocketAnchor; parts.push(cooler);
  } else parts.push(desc(p.cooler!, "air-cooler", [layout.anchors.cpuSocketAnchor[0] + .52, layout.anchors.cpuSocketAnchor[1], layout.anchors.cpuSocketAnchor[2]], profile(p.cooler!), [1.02, 1.28, .9], [clamp(p.cooler?.metadata.heightMm, 155, 70, 180) / 155, 1, 1]));
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase(); const psuScale = psuForm.includes("sfx") ? (psuForm.includes("-l") ? .82 : .72) : 1;
  parts.push(desc(p.psu!, "psu", layout.anchors.psuBayAnchor, profile(p.psu!), [1.42 * psuScale, 1.12 * psuScale, 1.48 * psuScale], [psuScale, psuScale, psuScale]));
  const storageType = String(p.storage?.metadata.type || "M.2"); const storageKind: Visual3DKind = storageType.includes("3.5") ? "drive-35" : storageType.includes("2.5") ? "drive-25" : "m2";
  const storagePosition = storageKind === "m2" ? layout.anchors.m2Anchors[0] : layout.anchors.sataTrayAnchors[0];
  const storageSize: Vector3Tuple = storageKind === "m2" ? [.1, .24, .82] : storageKind === "drive-25" ? [.18, 1, .72] : [.28, 1.35, 1];
  parts.push(desc(p.storage!, storageKind, storagePosition, profile(p.storage!), storageSize, [1, 1, 1], Math.round(clamp(p.storage?.metadata.count, 1, 1, storageKind === "m2" ? 2 : 2))));
  parts.push(desc(p.fan!, "fan", layout.anchors.frontMountAnchor, profile(p.fan!), [.2, 2.2, .7], [1, 1, 1], Math.round(clamp(p.fan?.metadata.count, 2, 1, 3))));
  parts.push(desc(p.rgb!, "rgb", [layout.interior.min[0] + .06, 0, .4], profile(p.rgb!), [.08, 3.5, .08], [1, 1, 1], Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3))));
  parts.push(desc(p.expansion!, "expansion", layout.expansionSlots, profile(p.expansion!), [.32, .26, 1.5], [1, 1, 1], Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3))));
  const radius = Math.hypot(...layout.size) / 2; const target: Vector3Tuple = [0, .08, 0];
  return { chassis, parts, layout, focusTarget: target, bounds: layout.shell, camera: { position: [radius * 1.15, radius * .68, radius * 1.35], target, fov: 38, minDistance: radius * 1.08, maxDistance: radius * 3.2 } };
}

export const containsBox = (outer: Box3Tuple, inner: Box3Tuple, epsilon = .001) => outer.min.every((v, i) => inner.min[i] >= v - epsilon) && outer.max.every((v, i) => inner.max[i] <= v + epsilon);

/** Test/debug assertions for the primary physical mounting contract. */
export function validateVisual3DScene(scene: Visual3DScene): string[] {
  const errors: string[] = []; const by = (category: VisualCategory) => scene.parts.find(part => part.category === category)!;
  for (const category of ["mbo", "cpu", "ram", "gpu", "cooler", "psu", "storage"] as VisualCategory[]) if (!containsBox(scene.layout.interior, by(category).bounds)) errors.push(`${category}:outside-interior`);
  const mbo = by("mbo"); for (const category of ["cpu", "ram"] as VisualCategory[]) { const part = by(category); if (part.position[1] < mbo.bounds.min[1] || part.position[1] > mbo.bounds.max[1] || part.position[2] < mbo.bounds.min[2] || part.position[2] > mbo.bounds.max[2]) errors.push(`${category}:outside-motherboard`); }
  const storage = by("storage"); if (storage.kind === "m2" && (storage.position[1] < mbo.bounds.min[1] || storage.position[1] > mbo.bounds.max[1] || storage.position[2] < mbo.bounds.min[2] || storage.position[2] > mbo.bounds.max[2])) errors.push("m2:outside-motherboard");
  const gpu = by("gpu"); if (Math.abs(gpu.bounds.min[2] - scene.layout.anchors.pcieSlotAnchor[2]) > .01) errors.push("gpu:detached-from-pcie");
  const psu = by("psu"); if (psu.position[1] > scene.layout.interior.min[1] + 1.3) errors.push("psu:outside-bay");
  const cooler = by("cooler"); if (cooler.kind === "aio" && (!cooler.mount || !scene.layout.radiatorMounts[cooler.mount] || !cooler.connectionTarget || cooler.connectionTarget.join() !== scene.layout.anchors.cpuSocketAnchor.join())) errors.push("aio:invalid-loop");
  return errors;
}
