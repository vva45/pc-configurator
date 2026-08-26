import type { VisualBuildModel, VisualCategory, VisualPart, VisualState } from "@/lib/visual-build";

export type Vector3Tuple = [number, number, number];
export type Visual3DKind = "chassis" | "motherboard" | "cpu" | "ram" | "gpu" | "air-cooler" | "aio" | "psu" | "m2" | "drive-25" | "drive-35" | "fan" | "rgb" | "expansion";
export interface Visual3DPart { id: string; kind: Visual3DKind; category: VisualCategory; source: VisualPart; state: VisualState; position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple; instances: number; metadata: VisualPart["metadata"]; }
export interface Visual3DScene { chassis: Visual3DPart; parts: Visual3DPart[]; focusTarget: Vector3Tuple; bounds: { min: Vector3Tuple; max: Vector3Tuple }; camera: { position: Vector3Tuple; target: Vector3Tuple; minDistance: number; maxDistance: number }; }

const clamp = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : fallback));
const formScale = (form: unknown): Vector3Tuple => { const value = String(form || "ATX").toLowerCase(); if (value.includes("mini") || value.includes("itx")) return [.68, .68, .82]; if (value.includes("micro") || value.includes("matx")) return [.84, .82, .9]; if (value.includes("e-atx") || value.includes("eatx")) return [1.08, 1.08, 1]; return [1, 1, 1]; };
function descriptor(part: VisualPart, kind: Visual3DKind, position: Vector3Tuple, scale: Vector3Tuple = [1, 1, 1], instances = 1): Visual3DPart { return { id: part.category, kind, category: part.category, source: part, state: part.state, position, rotation: [0, 0, 0], scale, instances, metadata: part.metadata }; }

/** Pure, deterministic VisualBuildModel → scene-layout boundary. One scene unit is roughly 100 mm. */
export function createVisual3DScene(model: VisualBuildModel): Visual3DScene {
  const p = model.parts;
  const chassis = descriptor(p.case!, "chassis", [0, 0, 0], [3.9, 4.8, 2.15]);
  const parts: Visual3DPart[] = [
    descriptor(p.mbo!, "motherboard", [-.35, .35, -.78], formScale(p.mbo?.metadata.form)),
    descriptor(p.cpu!, "cpu", [-.48, .92, -.64], [.48, .48, .12]),
    descriptor(p.ram!, "ram", [.28, .8, -.58], [1, 1, 1], Math.round(clamp(p.ram?.metadata.modules, 2, 1, 4))),
    descriptor(p.gpu!, "gpu", [-.35, -.48, -.38], [clamp(p.gpu?.metadata.lengthMm, 280, 170, 360) / 280, 1, 1]),
  ];
  const coolerMode = p.cooler?.metadata.mode === "aio" ? "aio" : "air-cooler";
  const coolerScale: Vector3Tuple = coolerMode === "aio" ? [clamp(p.cooler?.metadata.radiatorMm, 240, 120, 420) / 240, 1, 1] : [1, clamp(p.cooler?.metadata.heightMm, 155, 70, 190) / 155, 1];
  parts.push(descriptor(p.cooler!, coolerMode, coolerMode === "aio" ? [0, 1.78, -.05] : [-.48, 1.02, -.2], coolerScale));
  const psuForm = String(p.psu?.metadata.form || "ATX").toLowerCase();
  const psuScale = psuForm.includes("sfx") ? (psuForm.includes("-l") ? .82 : .72) : 1;
  parts.push(descriptor(p.psu!, "psu", [.82, -1.72, -.15], [psuScale, psuScale, psuScale]));
  const storageType = String(p.storage?.metadata.type || "M.2");
  const storageKind: Visual3DKind = storageType.includes("3.5") ? "drive-35" : storageType.includes("2.5") ? "drive-25" : "m2";
  parts.push(descriptor(p.storage!, storageKind, [.7, .05, -.54], [1, 1, 1], Math.round(clamp(p.storage?.metadata.count, 1, 1, 4))));
  parts.push(descriptor(p.fan!, "fan", [1.38, .25, .52], [1, 1, 1], Math.round(clamp(p.fan?.metadata.count, 2, 1, 5))));
  parts.push(descriptor(p.rgb!, "rgb", [-1.62, 0, .52], [1, 1, 1], Math.round(clamp(p.rgb?.metadata.count, 1, 1, 3))));
  parts.push(descriptor(p.expansion!, "expansion", [-.28, -1.05, -.45], [1, 1, 1], Math.round(clamp(p.expansion?.metadata.count, 1, 1, 3))));
  return { chassis, parts, focusTarget: [0, 0, 0], bounds: { min: [-2, -2.4, -1.1], max: [2, 2.4, 1.1] }, camera: { position: [6.5, 4.2, 7.5], target: [0, 0, 0], minDistance: 6.5, maxDistance: 14 } };
}
