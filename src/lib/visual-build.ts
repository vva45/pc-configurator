import type { CatId, Part } from "@/data/parts/types";
import type { AppBuild, Picked } from "@/lib/compat";
import { aioGeometry, gpuFamilyLabel, gpuModelLabel } from "@/lib/visual-hardware-profile";
export { gpuFamilyLabel } from "@/lib/visual-hardware-profile";

export type VisualState = "empty" | "installed" | "conflict" | "warning" | "next";
export type VisualCategory = "case" | "mbo" | "cpu" | "ram" | "gpu" | "cooler" | "storage" | "psu" | "fan" | "rgb" | "expansion";

export interface VisualPart {
  category: VisualCategory;
  sourceCategory: CatId;
  label: string;
  name?: string;
  state: VisualState;
  reason?: string;
  brand?: string;   // marca y modelo de la primera pieza elegida, para rotular el 3D
  model?: string;
  quantity: number;
  metadata: Record<string, string | number | boolean | undefined>;
}

export interface VisualBuildModel {
  parts: Partial<Record<VisualCategory, VisualPart>>;
  installedCount: number;
  isEmpty: boolean;
  nextCategory?: CatId;
}

export function visualCapacityLabel(capacityGB: number): string {
  if (capacityGB >= 900) return `${Math.max(1, Math.round(capacityGB / 1000))} TB`;
  return `${Math.round(capacityGB)} GB`;
}

export interface VisualBuildOptions {
  conflicts?: Array<{ cat: CatId; reason: string }>;
  warnings?: Array<{ cat: CatId; reason: string }>;
  nextCategory?: CatId | null;
}

const LABELS: Record<VisualCategory, string> = {
  case: "Case", mbo: "Motherboard", cpu: "CPU", ram: "RAM", gpu: "GPU",
  cooler: "Cooling", storage: "Storage", psu: "PSU", fan: "Fans", rgb: "RGB", expansion: "Expansion",
};

const VISUAL_CATEGORIES: Array<[VisualCategory, CatId[]]> = [
  ["case", ["case"]], ["mbo", ["mbo"]], ["cpu", ["cpu"]], ["ram", ["ram"]],
  ["gpu", ["gpu"]], ["cooler", ["cooler"]], ["storage", ["storage"]],
  ["psu", ["psu"]], ["fan", ["fan"]], ["rgb", ["rgb"]],
  ["expansion", ["soundcard", "netwired", "netwireless"]],
];

const INSPECTOR_ORDER: VisualCategory[] = [
  "case", "mbo", "cpu", "ram", "storage", "expansion", "gpu", "psu", "fan", "rgb", "cooler",
];

/** Selects a deterministic, useful inspector target without coupling a renderer to build internals. */
export function getInitialVisualPart(model: VisualBuildModel): VisualPart {
  const available = INSPECTOR_ORDER.flatMap((category) => model.parts[category] ? [model.parts[category]] : []);
  for (const state of ["conflict", "warning", "next", "installed"] satisfies VisualState[]) {
    const match = available.find((part) => part.state === state);
    if (match) return match;
  }
  return model.parts.mbo || model.parts.case || available[0]!;
}

const values = (part: Part): Record<string, unknown> => part as unknown as Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : undefined;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

function storageType(part: Part): string {
  const iface = `${text(values(part).iface) || ""} ${text(values(part).gen) || ""}`.toLowerCase();
  if (/m\.2|nvme|pcie/.test(iface)) return "M.2";
  if (/hdd|3\.5/.test(iface) || number(values(part).read) && number(values(part).read)! < 400) return '3.5" HDD';
  return '2.5" SSD';
}

function metadata(category: VisualCategory, selected: Picked[]): VisualPart["metadata"] {
  const part = selected[0] as Part;
  const p = values(part);
  switch (category) {
    case "case": return {
      form: Array.isArray(p.form) ? p.form.join(" / ") : undefined,
      dimensions: text(p.dims), volumeL: number(p.vol), gpuClearanceMm: number(p.gpuLen),
      psuPosition: text(p.psuPos), sidePanel: text(p.side),
      radiatorMounts: p.rad && typeof p.rad === "object" ? JSON.stringify(p.rad) : undefined,
      fanSizes: Array.isArray(p.fanSizes) ? JSON.stringify(p.fanSizes) : undefined, fanIncluded: number(p.fanInc),
      coolerClearanceMm: number(p.coolerH), color: text(p.color),
    };
    case "mbo": return { form: text(p.form), dimmSlots: number(p.dimm) };
    case "cpu": return { socket: text(p.socket), cores: number(p.cores) };
    case "ram": return { modules: Math.min(8, selected.reduce((sum, item) => sum + (number(values(item).kit) || 1) * (item.qty || 1), 0)), capacityGB: selected.reduce((sum, item) => sum + (number(values(item).capGB) || 0) * (item.qty || 1), 0), type: text(p.memType), heightMm: number(p.height), rgb: Boolean(p.rgb) };
    case "gpu": { const family = gpuFamilyLabel(part); return { lengthMm: number(p.len), slots: number(p.slots), vramGB: number(p.vram), conn8: number(p.conn8) || 0, conn6: number(p.conn6) || 0, hpwr: Boolean(p.hpwr), family: family.label, vendor: family.vendor, chip: gpuModelLabel(part.name) || text(p.chip) }; }
    case "cooler": { const radiatorMm = number(p.radSize); const aio = aioGeometry(radiatorMm, number(p.fans)); return { mode: radiatorMm || /aio|liquid|líquid/i.test(text(p.type) || "") ? "aio" : "air", type: text(p.type), heightMm: number(p.height), radiatorMm, fans: radiatorMm ? aio.fanCount : number(p.fans) || 1, fanSizeMm: radiatorMm ? aio.fanSizeMm : number(p.fanSize), radiatorWidthMm: radiatorMm ? aio.widthMm : undefined, radiatorLengthMm: radiatorMm ? aio.lengthMm : undefined, radiatorThicknessMm: radiatorMm ? aio.thicknessMm : undefined }; }
    case "storage": { const drives = selected.flatMap((item) => Array.from({ length: item.qty || 1 }, () => ({ type: storageType(item), capacity: visualCapacityLabel(number(values(item).capGB) || 0) }))); return { type: storageType(part), count: Math.min(8, drives.length), capacityGB: selected.reduce((sum, item) => sum + (number(values(item).capGB) || 0) * (item.qty || 1), 0), drives: JSON.stringify(drives.slice(0, 8)) }; }
    case "psu": return { form: text(p.form), watt: number(p.watt), lengthMm: number(p.len) };
    case "fan": return { count: Math.min(12, selected.reduce((sum, item) => sum + (item.qty || 1), 0)), sizeMm: number(p.size), sizesMm: JSON.stringify(selected.flatMap((item) => Array.from({ length: item.qty || 1 }, () => number(values(item).size) || 120)).slice(0, 12)) };
    case "rgb": return { count: Math.min(6, selected.reduce((sum, item) => sum + (item.qty || 1), 0)) };
    case "expansion": return { count: Math.min(6, selected.reduce((sum, item) => sum + (item.qty || 1), 0)) };
  }
}

/** Pure BUILD → VISUAL MODEL boundary. SVG today and a Phase 5 renderer can consume the same normalized model. */
export function createVisualBuildModel(build: AppBuild, options: VisualBuildOptions = {}): VisualBuildModel {
  const parts: VisualBuildModel["parts"] = {};
  const conflictByCat = new Map(options.conflicts?.map((item) => [item.cat, item.reason]));
  const warningByCat = new Map(options.warnings?.map((item) => [item.cat, item.reason]));

  for (const [category, sources] of VISUAL_CATEGORIES) {
    const source = sources.find((id) => ((build[id] || []) as Picked[]).length) || sources[0];
    const selected = sources.flatMap((id) => (build[id] || []) as Picked[]);
    const conflictSource = sources.find((id) => conflictByCat.has(id));
    const warningSource = sources.find((id) => warningByCat.has(id));
    const reason = conflictSource ? conflictByCat.get(conflictSource) : warningSource ? warningByCat.get(warningSource) : undefined;
    const state: VisualState = conflictSource ? "conflict"
      : warningSource ? "warning"
      : selected.length ? "installed"
      : options.nextCategory === source ? "next" : "empty";
    parts[category] = {
      category, sourceCategory: source, label: LABELS[category], state, reason,
      name: selected.length ? selected.map((part) => `${part.brand} ${part.name}`).join(" · ") : undefined,
      brand: selected[0]?.brand, model: selected[0]?.name,
      quantity: selected.reduce((sum, item) => sum + (item.qty || 1), 0),
      metadata: selected.length ? metadata(category, selected) : {},
    };
  }
  const installedCount = Object.values(parts).filter((part) => part?.state !== "empty" && part?.state !== "next").length;
  return { parts, installedCount, isEmpty: installedCount === 0, nextCategory: options.nextCategory || undefined };
}
