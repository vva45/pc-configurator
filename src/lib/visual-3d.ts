import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";
import { aioGeometry, createVisualHardwareProfile, type CaseStyle, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

export type Vector3Tuple = [number, number, number];
export type ChassisFamily = "standard" | "airflow" | "dual-chamber" | "compact";
export type ChassisArchetype = "STANDARD_TOWER" | "AIRFLOW_TOWER" | "DUAL_CHAMBER_SHOWCASE" | "COMPACT_TOWER";
export type RadiatorMount = "top" | "front" | "side";
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Box3Tuple { min: Vector3Tuple; max: Vector3Tuple }
export interface MountPlane { mount: RadiatorMount; center: Vector3Tuple; normal: Vector3Tuple; longAxis: "y" | "z"; capacityMm: number }

/** Canonical chassis-local contract. X is tray→window, Y is bottom→top, Z is rear→front. */
export interface ChassisAnchors {
  caseInnerBounds: Box3Tuple;
  motherboardTrayPlane: Vector3Tuple;
  rearIoZone: Vector3Tuple;
  rearPcieZone: Vector3Tuple;
  cpuSocketAnchor: Vector3Tuple;
  ramBankAnchor: Vector3Tuple;
  gpuPcieAnchor: Vector3Tuple;
  psuBayAnchor: Vector3Tuple;
  m2Anchors: Vector3Tuple[];
  sataAnchors: Vector3Tuple[];
  topRadiatorMount: MountPlane;
  frontRadiatorMount: MountPlane;
  sideRadiatorMount?: MountPlane;
  aioBlockAnchor: Vector3Tuple;
  rearFanAnchor: Vector3Tuple;
  // Stable legacy names used by the renderer/tests.
  motherboardTray: Vector3Tuple; rearIoPlane: Vector3Tuple; pcieSlotAnchor: Vector3Tuple; gpuBodyAnchor: Vector3Tuple;
  sataTrayAnchors: Vector3Tuple[]; frontMountAnchor: Vector3Tuple; topMountAnchor: Vector3Tuple; sideMountAnchor?: Vector3Tuple; storageCageAnchor: Vector3Tuple;
}

export interface ChassisLayout {
  archetype: ChassisArchetype; family: ChassisFamily; size: Vector3Tuple; shell: Box3Tuple; interior: Box3Tuple; anchors: ChassisAnchors;
  tray: Vector3Tuple; motherboard: Vector3Tuple; rearIo: Vector3Tuple; cpuSocket: Vector3Tuple; ramSlots: Vector3Tuple; pcie: Vector3Tuple;
  m2: Vector3Tuple[]; psuBay: Vector3Tuple; storageBay: Vector3Tuple; expansionSlots: Vector3Tuple;
  radiatorMounts: Record<RadiatorMount, Vector3Tuple | undefined>; radiatorCapacity: Record<RadiatorMount, number>; preferredRadiatorMount: RadiatorMount;
}
export interface Visual3DPart { representedRadiatorMm?: number; id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState; position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple; size: Vector3Tuple; bounds: Box3Tuple; instances: number; metadata: VisualPart["metadata"]; profile: VisualHardwareProfile; connectionTarget?: Vector3Tuple; tubeEndpoints?: [Vector3Tuple, Vector3Tuple]; tubePath?: Vector3Tuple[]; mount?: RadiatorMount; }
export interface Visual3DScene { chassis: Visual3DPart; parts: Visual3DPart[]; layout: ChassisLayout; focusTarget: Vector3Tuple; bounds: Box3Tuple; camera: { position: Vector3Tuple; target: Vector3Tuple; fov: number; minDistance: number; maxDistance: number }; }

const finite = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, finite(value, fallback)));
const formFactor = (form: unknown) => { const v = String(form || "ATX").toLowerCase(); if (v.includes("mini") || v.includes("itx")) return { h: 1.7, d: 1.7 }; if (v.includes("micro") || v.includes("matx")) return { h: 2.44, d: 2.44 }; if (v.includes("e-atx") || v.includes("eatx")) return { h: 3.05, d: 3.3 }; return { h: 3.05, d: 2.44 }; };
const boxAt = (position: Vector3Tuple, size: Vector3Tuple): Box3Tuple => ({ min: position.map((v, i) => v - size[i] / 2) as Vector3Tuple, max: position.map((v, i) => v + size[i] / 2) as Vector3Tuple });
const desc = (part: VisualPart, kind: Visual3DKind, position: Vector3Tuple, profile: VisualHardwareProfile, size: Vector3Tuple, scale: Vector3Tuple = [1, 1, 1], instances = 1): Visual3DPart => ({ id: part.category, kind, category: part.category, source: part, state: part.state, position, rotation: [0, 0, 0], scale, size, bounds: boxAt(position, size), instances, metadata: part.metadata, profile });
const normalized = (bounds: Box3Tuple, x: number, y: number, z: number): Vector3Tuple => [bounds.min[0] + (bounds.max[0] - bounds.min[0]) * x, bounds.min[1] + (bounds.max[1] - bounds.min[1]) * y, bounds.min[2] + (bounds.max[2] - bounds.min[2]) * z];

export function chassisFamily(style?: CaseStyle, name = ""): ChassisFamily {
  if (style === "WIDE_DUAL_CHAMBER" || style === "AQUARIUM" || /O11|SHOWCASE|DUAL.?CHAMBER/i.test(name)) return "dual-chamber";
  if (style === "COMPACT_TOWER" || style === "MINI_TOWER" || style === "HTPC") return "compact";
  if (/AIR|FLOW|MESH|TORRENT/i.test(name)) return "airflow";
  return "standard";
}

/** Resolves every mount from proportions of the useful interior; no viewport coordinates participate. */
export function createChassisLayout(profile: VisualHardwareProfile): ChassisLayout {
  const family = chassisFamily(profile.style, profile.label);
  const archetypes: Record<ChassisFamily, { name: ChassisArchetype; size: Vector3Tuple }> = {
    standard: { name: "STANDARD_TOWER", size: [2.35, 4.9, 4.55] }, airflow: { name: "AIRFLOW_TOWER", size: [2.4, 5, 4.85] },
    "dual-chamber": { name: "DUAL_CHAMBER_SHOWCASE", size: [2.95, 4.7, 4.65] }, compact: { name: "COMPACT_TOWER", size: [2.15, 4.15, 3.9] },
  };
  const base = archetypes[family]; const measured = profile.dimensions;
  const size: Vector3Tuple = measured ? [clamp(measured.width / 100, base.size[0], 2.1, 3.15), clamp(measured.height / 100, base.size[1], 4.05, 5.5), clamp(measured.depth / 100, base.size[2], 3.85, 5.35)] : base.size;
  const [w, h, d] = size; const shell: Box3Tuple = { min: [-w / 2, -h / 2, -d / 2], max: [w / 2, h / 2, d / 2] };
  const interior: Box3Tuple = { min: [shell.min[0] + .12, shell.min[1] + .12, shell.min[2] + .12], max: [shell.max[0] - .12, shell.max[1] - .12, shell.max[2] - .12] };
  const boardDepth = family === "compact" ? 1.7 : 2.44;
  const tray = normalized(interior, .035, .55, 0); tray[2] = interior.min[2] + boardDepth / 2 + .1;
  const boardCenter: Vector3Tuple = [tray[0] + .055, tray[1], tray[2]];
  const cpu = [boardCenter[0] + .12, boardCenter[1] + .48, boardCenter[2] - .22] as Vector3Tuple;
  const ram = [cpu[0] + .02, cpu[1], cpu[2] + .66] as Vector3Tuple; const pcie = [boardCenter[0] + .055, boardCenter[1] - .67, interior.min[2] + .18] as Vector3Tuple;
  const storage = family === "dual-chamber" ? normalized(interior, .15, .25, .76) : normalized(interior, .84, .24, .78);
  const psu = family === "dual-chamber" ? normalized(interior, .34, .15, .28) : normalized(interior, .5, .15, .25);
  const topPoint = normalized(interior, .58, .5, .55); const frontPoint = normalized(interior, .58, .54, .5);
  const top: MountPlane = { mount: "top", center: [topPoint[0], interior.max[1] - .18, topPoint[2]], normal: [0, -1, 0], longAxis: "z", capacityMm: family === "compact" ? 240 : d >= 4.5 ? 360 : 280 };
  const front: MountPlane = { mount: "front", center: [frontPoint[0], frontPoint[1], interior.max[2] - .18], normal: [0, 0, -1], longAxis: "y", capacityMm: family === "compact" ? 240 : h >= 4.7 ? 360 : 280 };
  const sidePoint = normalized(interior, .5, .53, .7);
  const side: MountPlane | undefined = family === "dual-chamber" ? { mount: "side", center: [interior.min[0] + .18, sidePoint[1], sidePoint[2]], normal: [1, 0, 0], longAxis: "y", capacityMm: 360 } : undefined;
  const m2: Vector3Tuple[] = [[cpu[0] + .015, boardCenter[1] - .22, boardCenter[2] - .05], [cpu[0] + .015, boardCenter[1] - .52, boardCenter[2] + .42]];
  const sata: Vector3Tuple[] = [storage, [storage[0], storage[1] + .42, storage[2]]];
  const anchors: ChassisAnchors = {
    caseInnerBounds: interior, motherboardTrayPlane: tray, rearIoZone: [boardCenter[0], boardCenter[1] + .62, interior.min[2] + .02], rearPcieZone: pcie,
    cpuSocketAnchor: cpu, ramBankAnchor: ram, gpuPcieAnchor: pcie, psuBayAnchor: psu, m2Anchors: m2, sataAnchors: sata,
    topRadiatorMount: top, frontRadiatorMount: front, sideRadiatorMount: side, aioBlockAnchor: cpu, rearFanAnchor: normalized(interior, .55, .78, .025),
    motherboardTray: tray, rearIoPlane: [boardCenter[0], boardCenter[1] + .62, interior.min[2] + .02], pcieSlotAnchor: pcie,
    gpuBodyAnchor: [pcie[0] + .32, pcie[1], pcie[2]], sataTrayAnchors: sata, frontMountAnchor: front.center, topMountAnchor: top.center,
    sideMountAnchor: side?.center, storageCageAnchor: storage,
  };
  const radiatorMounts = { top: top.center, front: front.center, side: side?.center }; const radiatorCapacity = { top: top.capacityMm, front: front.capacityMm, side: side?.capacityMm || 0 };
  const order: RadiatorMount[] = family === "dual-chamber" ? ["side", "top", "front"] : ["top", "front", "side"];
  const preferredRadiatorMount = order.find(m => radiatorMounts[m] && radiatorCapacity[m] >= 240) ?? order.find(m => radiatorMounts[m])!;
  return { archetype: base.name, family, size, shell, interior, anchors, tray, motherboard: boardCenter, rearIo: anchors.rearIoZone, cpuSocket: cpu, ramSlots: ram, pcie, m2, psuBay: psu, storageBay: storage, expansionSlots: [pcie[0], pcie[1] - .4, pcie[2]], radiatorMounts, radiatorCapacity, preferredRadiatorMount };
}

export function resolveRadiatorMount(layout: ChassisLayout, requestedMm: number): RadiatorMount {
  const order: RadiatorMount[] = layout.family === "dual-chamber" ? ["side", "top", "front"] : ["top", "front", "side"];
  return order.find(m => layout.radiatorMounts[m] && layout.radiatorCapacity[m] >= requestedMm) ?? order.filter(m => layout.radiatorMounts[m]).sort((a, b) => layout.radiatorCapacity[b] - layout.radiatorCapacity[a])[0];
}

/** Pure VisualBuildModel → deterministic assembly. One world unit is 100 mm. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts; const caseProfile = createVisualHardwareProfile(p.case!); const layout = createChassisLayout(caseProfile);
  const mboProfile = createVisualHardwareProfile(p.mbo!); const profile = (part: VisualPart) => createVisualHardwareProfile(part, mboProfile);
  const ff = formFactor(p.mbo?.metadata.form); const boardSize: Vector3Tuple = [.11, Math.min(ff.h, layout.size[1] - .75), Math.min(ff.d, layout.size[2] - .65)];
  const maxGpu = (layout.interior.max[2] - layout.anchors.gpuPcieAnchor[2] - .08) * 100; const gpuLength = clamp(p.gpu?.metadata.lengthMm, 280, 170, Math.min(400, maxGpu)) / 100;
  const gpuPosition: Vector3Tuple = [layout.anchors.gpuPcieAnchor[0] + .34, layout.anchors.gpuPcieAnchor[1], layout.anchors.gpuPcieAnchor[2] + gpuLength / 2];
  const parts: Visual3DPart[] = [
    desc(p.mbo!, "motherboard", layout.motherboard, mboProfile, boardSize, [1, boardSize[1] / 2.9, boardSize[2] / 2.45]),
    desc(p.cpu!, "cpu", layout.anchors.cpuSocketAnchor, profile(p.cpu!), [.16, .48, .48]),
    desc(p.ram!, "ram", layout.anchors.ramBankAnchor, profile(p.ram!), [.14, 1.02, .62], [1, 1, 1], Math.round(clamp(p.ram?.metadata.modules, 2, 1, 4))),
    desc(p.gpu!, "gpu", gpuPosition, profile(p.gpu!), [.68, .72, gpuLength], [1, 1, gpuLength / 2.75]),
  ];
  const requestedAio = aioGeometry(p.cooler?.metadata.radiatorMm, p.cooler?.metadata.fans);
  if (p.cooler?.metadata.mode === "aio") {
    const mount = resolveRadiatorMount(layout, requestedAio.radiatorMm); const plane = mount === "top" ? layout.anchors.topRadiatorMount : mount === "front" ? layout.anchors.frontRadiatorMount : layout.anchors.sideRadiatorMount!;
    const representedMm = Math.min(requestedAio.radiatorMm, plane.capacityMm);
    const aio = aioGeometry(representedMm);
    const length = Math.min(aio.lengthMm / 100, (plane.longAxis === "y" ? layout.interior.max[1] - layout.interior.min[1] : layout.interior.max[2] - layout.interior.min[2]) - .18);
    const radiatorSize: Vector3Tuple = mount === "top" ? [aio.widthMm / 100, aio.thicknessMm / 100, length] : mount === "front" ? [aio.widthMm / 100, length, aio.thicknessMm / 100] : [aio.thicknessMm / 100, length, aio.widthMm / 100];
    const cooler = desc(p.cooler!, "aio", plane.center, profile(p.cooler!), radiatorSize, [length / 2.7, aio.widthMm / 126, aio.thicknessMm / 30], aio.fanCount); cooler.mount = mount; cooler.representedRadiatorMm = representedMm; cooler.connectionTarget = layout.anchors.aioBlockAnchor;
    const tubeBase: Vector3Tuple = mount === "top" ? [plane.center[0], plane.center[1] - radiatorSize[1] / 2 - .08, plane.center[2] - radiatorSize[2] * .34] : mount === "front" ? [plane.center[0], plane.center[1] - radiatorSize[1] * .34, plane.center[2] - radiatorSize[2] / 2 - .08] : [plane.center[0] + radiatorSize[0] / 2 + .08, plane.center[1] - radiatorSize[1] * .34, plane.center[2]];
    const block = layout.anchors.aioBlockAnchor;
    const bend: Vector3Tuple = [Math.min(layout.interior.max[0] - .16, Math.max(tubeBase[0], block[0]) + .32), Math.max(layout.interior.min[1] + .16, Math.min(layout.interior.max[1] - .16, (tubeBase[1] + block[1]) / 2)), (tubeBase[2] + block[2]) / 2];
    cooler.tubeEndpoints = [tubeBase, block]; cooler.tubePath = [tubeBase, bend, block]; parts.push(cooler);
  } else parts.push(desc(p.cooler!, "air-cooler", [layout.anchors.cpuSocketAnchor[0] + .52, layout.anchors.cpuSocketAnchor[1], layout.anchors.cpuSocketAnchor[2]], profile(p.cooler!), [1.02, 1.28, .9]));
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase(); const psuScale = psuForm.includes("sfx") ? (psuForm.includes("-l") ? .82 : .72) : 1;
  const psuSize: Vector3Tuple = [Math.min(1.42 * psuScale, layout.interior.max[0] - layout.interior.min[0] - .12), 1.12 * psuScale, 1.48 * psuScale];
  parts.push(desc(p.psu!, "psu", layout.anchors.psuBayAnchor, profile(p.psu!), psuSize, [psuScale, psuScale, psuScale]));
  const storageType = String(p.storage?.metadata.type || "M.2"); const storageKind: Visual3DKind = storageType.includes("3.5") ? "drive-35" : storageType.includes("2.5") ? "drive-25" : "m2";
  const storagePosition = storageKind === "m2" ? layout.anchors.m2Anchors[0] : layout.anchors.sataAnchors[0]; const storageSize: Vector3Tuple = storageKind === "m2" ? [.12, .24, .82] : storageKind === "drive-25" ? [.18, 1, .72] : [.28, 1.35, 1];
  parts.push(desc(p.storage!, storageKind, storagePosition, profile(p.storage!), storageSize, [1, 1, 1], Math.round(clamp(p.storage?.metadata.count, 1, 1, 2))));
  parts.push(desc(p.fan!, "fan", layout.anchors.frontRadiatorMount.center, profile(p.fan!), [.7, 2.2, .12], [1, 1, 1], Math.round(clamp(p.fan?.metadata.count, 2, 1, 3))));
  parts.push(desc(p.rgb!, "rgb", normalized(layout.interior, .07, .5, .55), profile(p.rgb!), [.08, 3.5, .08], [1, 1, 1], Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3))));
  parts.push(desc(p.expansion!, "expansion", [layout.expansionSlots[0], layout.expansionSlots[1], layout.expansionSlots[2] + .75], profile(p.expansion!), [.32, .26, 1.5], [1, 1, 1], Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3))));
  const radius = Math.hypot(...layout.size) / 2; const target: Vector3Tuple = [.05, .05, 0]; const chassis = desc(p.case!, "chassis", [0, 0, 0], caseProfile, layout.size, layout.size);
  return { chassis, parts, layout, focusTarget: target, bounds: layout.shell, camera: { position: [radius * 1.28, radius * .52, radius * 1.42], target, fov: 38, minDistance: radius * 1.08, maxDistance: radius * 3.2 } };
}

export const containsBox = (outer: Box3Tuple, inner: Box3Tuple, epsilon = .001) => outer.min.every((v, i) => inner.min[i] >= v - epsilon) && outer.max.every((v, i) => inner.max[i] <= v + epsilon);
const pointIn = (box: Box3Tuple, point: Vector3Tuple, epsilon = .001) => point.every((v, i) => v >= box.min[i] - epsilon && v <= box.max[i] + epsilon);

/** Assertions shared by tests and development diagnostics for the physical mounting contract. */
export function validateVisual3DScene(scene: Visual3DScene): string[] {
  const errors: string[] = []; const by = (category: VisualCategory) => scene.parts.find(part => part.category === category)!;
  for (const part of scene.parts) if (!containsBox(scene.layout.interior, part.bounds)) errors.push(`${part.category}:outside-interior`);
  const mbo = by("mbo"); for (const category of ["cpu", "ram"] as VisualCategory[]) { const part = by(category); if (!pointIn(mbo.bounds, [mbo.position[0], part.position[1], part.position[2]])) errors.push(`${category}:outside-motherboard`); }
  if (Math.abs(mbo.bounds.min[0] - scene.layout.anchors.motherboardTrayPlane[0]) > .02) errors.push("motherboard:detached-from-tray");
  const storage = by("storage"); if (storage.kind === "m2" && !pointIn(mbo.bounds, [mbo.position[0], storage.position[1], storage.position[2]])) errors.push("m2:outside-motherboard");
  const gpu = by("gpu"); if (Math.abs(gpu.bounds.min[2] - scene.layout.anchors.gpuPcieAnchor[2]) > .01 || Math.abs(gpu.bounds.min[0] - mbo.bounds.max[0]) > .02) errors.push("gpu:detached-from-pcie");
  const psu = by("psu"); if (psu.position[1] > scene.layout.interior.min[1] + (scene.layout.interior.max[1] - scene.layout.interior.min[1]) * .3) errors.push("psu:outside-bay");
  const cooler = by("cooler"); if (cooler.kind === "aio") { const plane = cooler.mount === "top" ? scene.layout.anchors.topRadiatorMount : cooler.mount === "front" ? scene.layout.anchors.frontRadiatorMount : scene.layout.anchors.sideRadiatorMount; if (!plane || cooler.position.join() !== plane.center.join() || (cooler.representedRadiatorMm || 0) > plane.capacityMm) errors.push("aio:radiator-off-mount"); if (cooler.connectionTarget?.join() !== scene.layout.anchors.cpuSocketAnchor.join() || cooler.tubeEndpoints?.[1].join() !== scene.layout.anchors.aioBlockAnchor.join() || !cooler.tubePath?.every(point => pointIn(scene.layout.interior, point))) errors.push("aio:invalid-loop"); }
  return errors;
}
