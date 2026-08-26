import type { CatId, Part } from "@/data/parts/types";
import type { AppBuild, Picked } from "@/lib/compat";

export type VisualState = "empty" | "installed" | "conflict" | "warning" | "next";
export type VisualCategory = "case" | "mbo" | "cpu" | "ram" | "gpu" | "cooler" | "storage" | "psu" | "fan" | "rgb" | "expansion";

export interface VisualPart {
  category: VisualCategory;
  sourceCategory: CatId;
  label: string;
  name?: string;
  state: VisualState;
  reason?: string;
  quantity: number;
  metadata: Record<string, string | number | boolean | undefined>;
}

export interface VisualBuildModel {
  parts: Partial<Record<VisualCategory, VisualPart>>;
  installedCount: number;
  isEmpty: boolean;
  nextCategory?: CatId;
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
    case "case": return { form: Array.isArray(p.form) ? p.form.join(" / ") : undefined, dimensions: text(p.dims), volumeL: number(p.vol) };
    case "mbo": return { form: text(p.form), dimmSlots: number(p.dimm) };
    case "cpu": return { socket: text(p.socket), cores: number(p.cores) };
    case "ram": return { modules: Math.min(8, selected.reduce((sum, item) => sum + (number(values(item).kit) || 1) * (item.qty || 1), 0)), capacityGB: selected.reduce((sum, item) => sum + (number(values(item).capGB) || 0) * (item.qty || 1), 0), type: text(p.memType) };
    case "gpu": return { lengthMm: number(p.len), slots: number(p.slots), vramGB: number(p.vram) };
    case "cooler": { const radiatorMm = number(p.radSize); return { mode: radiatorMm || /aio|liquid|líquid/i.test(text(p.type) || "") ? "aio" : "air", heightMm: number(p.height), radiatorMm }; }
    case "storage": return { type: storageType(part), count: Math.min(8, selected.reduce((sum, item) => sum + (item.qty || 1), 0)), capacityGB: selected.reduce((sum, item) => sum + (number(values(item).capGB) || 0) * (item.qty || 1), 0) };
    case "psu": return { form: text(p.form), watt: number(p.watt), lengthMm: number(p.len) };
    case "fan": return { count: Math.min(12, selected.reduce((sum, item) => sum + (item.qty || 1), 0)), sizeMm: number(p.size) };
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
    const reason = sources.map((id) => conflictByCat.get(id)).find(Boolean) || sources.map((id) => warningByCat.get(id)).find(Boolean);
    const state: VisualState = conflictByCat.has(source) ? "conflict"
      : warningByCat.has(source) ? "warning"
      : selected.length ? "installed"
      : options.nextCategory === source ? "next" : "empty";
    parts[category] = {
      category, sourceCategory: source, label: LABELS[category], state, reason,
      name: selected.length ? selected.map((part) => `${part.brand} ${part.name}`).join(" · ") : undefined,
      quantity: selected.reduce((sum, item) => sum + (item.qty || 1), 0),
      metadata: selected.length ? metadata(category, selected) : {},
    };
  }
  const installedCount = Object.values(parts).filter((part) => part?.state !== "empty" && part?.state !== "next").length;
  return { parts, installedCount, isEmpty: installedCount === 0, nextCategory: options.nextCategory || undefined };
}
