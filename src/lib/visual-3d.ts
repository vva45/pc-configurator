import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";
import { aioGeometry, createVisualHardwareProfile, type VisualHardwareProfile } from "@/lib/visual-hardware-profile";

export type Vector3Tuple = [number, number, number];
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Visual3DPart { id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState; position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple; instances: number; metadata: VisualPart["metadata"]; profile: VisualHardwareProfile; }
export interface Visual3DScene { chassis: Visual3DPart; parts: Visual3DPart[]; focusTarget: Vector3Tuple; bounds: { min: Vector3Tuple; max: Vector3Tuple }; camera: { position: Vector3Tuple; target: Vector3Tuple; minDistance: number; maxDistance: number }; }

const clamp = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : fallback));
const formScale = (form: unknown): Vector3Tuple => { const value = String(form || "ATX").toLowerCase(); if (value.includes("mini") || value.includes("itx")) return [.68, .68, .82]; if (value.includes("micro") || value.includes("matx")) return [.84, .82, .9]; if (value.includes("e-atx") || value.includes("eatx")) return [1.08, 1.08, 1]; return [1, 1, 1]; };
function descriptor(part: VisualPart, kind: Visual3DKind, position: Vector3Tuple, profile: VisualHardwareProfile, scale: Vector3Tuple = [1, 1, 1], instances = 1): Visual3DPart { return { id: part.category, kind, category: part.category, source: part, state: part.state, position, rotation: [0, 0, 0], scale, instances, metadata: part.metadata, profile }; }

/** Pure VisualBuildModel → proportional, catalog-aware scene. One scene unit is 100 mm. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts;
  const caseProfile = createVisualHardwareProfile(p.case!);
  const dimensions = caseProfile.dimensions || { height: 480, width: 220, depth: 440 };
  const caseScale: Vector3Tuple = [dimensions.width / 100, dimensions.height / 100, dimensions.depth / 100];
  const half = caseScale.map((v) => v / 2) as Vector3Tuple;
  const mboProfile = createVisualHardwareProfile(p.mbo!);
  const profile = (part: VisualPart) => createVisualHardwareProfile(part, mboProfile);
  const chassis = descriptor(p.case!, "chassis", [0, 0, 0], caseProfile, caseScale);
  const x = -half[0] * .08;
  const backZ = -half[2] + .24;
  const parts: Visual3DPart[] = [
    descriptor(p.mbo!, "motherboard", [x, .25, backZ], mboProfile, formScale(p.mbo?.metadata.form)),
    descriptor(p.cpu!, "cpu", [x - .18, .82, backZ + .14], profile(p.cpu!), [.48, .48, .12]),
    descriptor(p.ram!, "ram", [x + .58, .72, backZ + .2], profile(p.ram!), [1, 1, 1], Math.round(clamp(p.ram?.metadata.modules, 2, 1, 4))),
    descriptor(p.gpu!, "gpu", [x, -.62, backZ + .42], profile(p.gpu!), [clamp(p.gpu?.metadata.lengthMm, 280, 170, 420) / 280, 1, 1]),
  ];
  const coolerMode = p.cooler?.metadata.mode === "aio" ? "aio" : "air-cooler";
  const aio = aioGeometry(p.cooler?.metadata.radiatorMm, p.cooler?.metadata.fans);
  const coolerScale: Vector3Tuple = coolerMode === "aio" ? [aio.lengthMm / 240, aio.widthMm / 126, aio.thicknessMm / 30] : [1, clamp(p.cooler?.metadata.heightMm, 155, 70, 190) / 155, 1];
  parts.push(descriptor(p.cooler!, coolerMode, coolerMode === "aio" ? [0, half[1] - .34, -.15] : [x - .18, .92, backZ + .62], profile(p.cooler!), coolerScale, coolerMode === "aio" ? aio.fanCount : 1));
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase();
  const psuScale = psuForm.includes("sfx") ? (psuForm.includes("-l") ? .82 : .72) : 1;
  parts.push(descriptor(p.psu!, "psu", [half[0] - .78, -half[1] + .7, -.15], profile(p.psu!), [psuScale, psuScale, psuScale]));
  const storageType = String(p.storage?.metadata.type || "M.2");
  const storageKind: Visual3DKind = storageType.includes("3.5") ? "drive-35" : storageType.includes("2.5") ? "drive-25" : "m2";
  parts.push(descriptor(p.storage!, storageKind, [x + .66, -.02, backZ + .2], profile(p.storage!), [1, 1, 1], Math.round(clamp(p.storage?.metadata.count, 1, 1, storageKind === "m2" ? 4 : 3))));
  parts.push(descriptor(p.fan!, "fan", [half[0] - .32, .15, .25], profile(p.fan!), [1, 1, 1], Math.round(clamp(p.fan?.metadata.count, 2, 1, 5))));
  parts.push(descriptor(p.rgb!, "rgb", [-half[0] + .18, 0, .45], profile(p.rgb!), [1, 1, 1], Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3))));
  parts.push(descriptor(p.expansion!, "expansion", [x, -1.13, backZ + .36], profile(p.expansion!), [1, 1, 1], Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3))));
  const radius = Math.hypot(...half);
  return { chassis, parts, focusTarget: [0, 0, 0], bounds: { min: [-half[0], -half[1], -half[2]], max: half }, camera: { position: [radius * 1.4, radius * .8, radius * 1.55], target: [0, 0, 0], minDistance: radius * 1.05, maxDistance: radius * 4 } };
}
