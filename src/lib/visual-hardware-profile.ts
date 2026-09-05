import type { Part } from "@/data/parts/types";
import type { VisualCategory, VisualPart } from "@/lib/visual-build";

export type CaseStyle = "STANDARD_TOWER" | "COMPACT_TOWER" | "WIDE_DUAL_CHAMBER" | "AQUARIUM" | "MINI_TOWER" | "OPEN_FRAME" | "HTPC" | "GENERIC";
export interface CaseDimensions { height: number; width: number; depth: number; }
export type CasePanelMaterial = "glass" | "mesh" | "solid";
export interface CaseFeatures {
  sidePanel?: string;
  psuPosition?: string;
  gpuClearanceMm?: number;
  radiatorMounts?: Partial<Record<"top" | "front" | "side" | "bottom" | "rear", number>>;
  fanSizes?: number[];
  fanIncluded?: number;
  coolerClearanceMm?: number;
  color?: string;
  forms?: string;   // formatos de placa que admite, tal como los lista el catálogo
  panels: { window: CasePanelMaterial; front: CasePanelMaterial; rear: "solid" };
}
export interface VisualHardwareProfile {
  category: VisualCategory;
  family?: string;
  style?: CaseStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  material: "metal" | "pcb" | "polymer" | "glass" | "rubber";
  metalness: number;
  roughness: number;
  dimensions?: CaseDimensions;
  isLight: boolean;
  label: string;
  caseFeatures?: CaseFeatures;
}

const DARK = "#171b1a";
const GRAPHITE = "#303533";
const LIGHT = "#e4e7e3";
const LIGHT_GREY = "#b9bfbb";
const GOLD = "#dfb85e";
const NVIDIA = "#76b900";
const AMD = "#ed1c24";
const INTEL = "#1F8FE5";
const joined = (part?: Pick<VisualPart, "name" | "metadata">) => `${part?.name || ""} ${Object.values(part?.metadata || {}).join(" ")}`.toUpperCase();

/** El catálogo guarda las dimensiones como largo × ancho × alto (fondo, ancho, altura),
    que es como las publican los fabricantes. Se toleran separadores y el sufijo «mm». */
export function parseCaseDimensions(value: unknown): CaseDimensions | undefined {
  if (typeof value !== "string") return undefined;
  const numbers = value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!numbers || numbers.length < 3 || numbers.slice(0, 3).some((n) => n < 80 || n > 1000)) return undefined;
  const [depth, width, height] = numbers;
  return { height, width, depth };
}

export function inferCaseStyle(part?: Pick<VisualPart, "name" | "metadata">, dimensions = parseCaseDimensions(part?.metadata.dimensions)): CaseStyle {
  const value = joined(part);
  if (/OPEN[ -]?FRAME|CORE P[13579]|CONQUER|CAGE CHASSIS/.test(value)) return "OPEN_FRAME";
  if (/\bHTPC\b|RIDGE|DESKTOP|CONSOLE/.test(value)) return "HTPC";
  if (/O11|DUAL[ -]?CHAMBER|6500X|H9 FLOW|GT502/.test(value)) return "WIDE_DUAL_CHAMBER";
  if (/AQUARIUM|VISION|FISHTANK|PANORAM/.test(value) || /DOBLE|TRES CARAS/.test(value)) return "AQUARIUM";
  /* «Micro-ATX» aparece en la lista de formatos que admite casi cualquier torre:
     el tamaño se lee del nombre y de las medidas, no de esa lista. */
  const name = (part?.name || "").toUpperCase();
  if (/MINI[ -]?ITX|NR200|MESHLICIOUS|2000D/.test(name) || (dimensions && dimensions.height < 390 && dimensions.width < 210)) return "MINI_TOWER";
  if (/COMPACT|MATX|MICRO[ -]?ATX|AP20[12]|A3-MATX/.test(name) || (dimensions && dimensions.height < 440)) return "COMPACT_TOWER";
  return dimensions ? "STANDARD_TOWER" : "GENERIC";
}

/** Derives visible panels from the catalog's per-case enclosure description. */
export function inferCasePanels(part: Pick<VisualPart, "name" | "metadata">, style: CaseStyle): CaseFeatures["panels"] {
  const description = String(part.metadata.sidePanel || "").toUpperCase();
  const name = (part.name || "").toUpperCase();
  const window = /CRISTAL|GLASS/.test(description) ? "glass" : /MALLA|MESH/.test(description) ? "mesh" : "solid";
  const panoramic = style === "AQUARIUM" || style === "WIDE_DUAL_CHAMBER" || /DOBLE|TRES CARAS/.test(description);
  const airflowFront = /AIRFLOW|MESH|TORRENT|500DX|LANCOOL|POP AIR|MESHIFY|AP20[12]|FLOW|NR200P?\b|TERRA|NORTH XL/.test(name);
  return { window, front: panoramic ? "glass" : airflowFront ? "mesh" : "solid", rear: "solid" };
}

export function gpuFamilyLabel(part: Pick<Part, "brand" | "name">): { label: string; vendor: "nvidia" | "amd" | "intel" | "generic" } {
  const value = `${part.brand} ${part.name}`.toUpperCase();
  if (/NVIDIA|GEFORCE|\bRTX\b|\bGTX\b/.test(value)) {
    const family = /\bRTX\b/.test(value) ? "RTX" : /\bGTX\b/.test(value) ? "GTX" : /\bGT\b/.test(value) ? "GT" : "GPU";
    return { label: `NVIDIA ${family}`, vendor: "nvidia" };
  }
  if (/AMD|RADEON|\bRX\b/.test(value)) {
    const number = value.match(/\bRX\s*([4-9]\d{2,3})/i)?.[1] || "";
    const series = number.length === 4 ? `${number[0]}000` : number.length === 3 ? `${number[0]}00` : "";
    return { label: series ? `${number.length === 4 ? "RADEON" : "AMD"} RX${series}` : "AMD GPU", vendor: "amd" };
  }
  if (/\bARC\b|INTEL/.test(value)) return { label: "INTEL ARC", vendor: "intel" };
  return { label: "GPU", vendor: "generic" };
}

/** Modelo corto para rotular una gráfica: «RX 9070 XT», «RTX 4070 Ti SUPER», «Arc B580».
    Sale del nombre del catálogo; si no se reconoce, no se inventa nada. */
export function gpuModelLabel(name?: string): string | undefined {
  const m = (name || "").match(/\b(RTX|GTX|GT|RX|ARC)\s*([A-Z]?\d{3,4})(?:\s*(XTX|XT|GRE|TI\s*SUPER|TI|SUPER))?\b/i);
  if (!m) return undefined;
  const family = m[1].toUpperCase() === "ARC" ? "Arc" : m[1].toUpperCase();
  const suffix = m[3] ? " " + m[3].replace(/\s+/g, " ").replace(/^ti/i, "Ti").replace(/super/i, "SUPER").replace(/^(xtx|xt|gre)$/i, (x) => x.toUpperCase()) : "";
  return `${family} ${m[2].toUpperCase()}${suffix}`;
}

/** One deterministic appearance resolver shared by the SVG and WebGL renderers. */
export function createVisualHardwareProfile(part: VisualPart, motherboard?: VisualHardwareProfile): VisualHardwareProfile {
  const value = joined(part);
  const light = /\b(WHITE|BLANCO|SNOW|ICE|AERO|SILVER|STEEL LEGEND)\b/.test(value);
  const base = { category: part.category, secondaryColor: GRAPHITE, accentColor: GOLD, material: "polymer" as const, metalness: .25, roughness: .48, isLight: false, label: part.name || part.label };
  switch (part.category) {
    case "case": {
      const dimensions = parseCaseDimensions(part.metadata.dimensions);
      const style = inferCaseStyle(part, dimensions);
      const caseLight = /\b(WHITE|BLANCO|SNOW)\b/.test(value) && !/NEGRO\s*\/\s*BLANCO/.test(value);
      let radiatorMounts: CaseFeatures["radiatorMounts"];
      if (part.metadata.radiatorMounts) {
        try { radiatorMounts = JSON.parse(String(part.metadata.radiatorMounts)); } catch { radiatorMounts = undefined; }
      }
      return { ...base, primaryColor: caseLight ? LIGHT : "#29312e", secondaryColor: caseLight ? LIGHT_GREY : "#46504b", material: "metal", metalness: .72, roughness: .36, dimensions, style, isLight: caseLight, caseFeatures: { sidePanel: String(part.metadata.sidePanel || ""), psuPosition: String(part.metadata.psuPosition || ""), gpuClearanceMm: typeof part.metadata.gpuClearanceMm === "number" ? part.metadata.gpuClearanceMm : undefined, radiatorMounts, fanSizes: (() => { try { const v = JSON.parse(String(part.metadata.fanSizes || "[]")); return Array.isArray(v) ? v.filter((n): n is number => typeof n === "number") : undefined; } catch { return undefined; } })(), fanIncluded: typeof part.metadata.fanIncluded === "number" ? part.metadata.fanIncluded : undefined, coolerClearanceMm: typeof part.metadata.coolerClearanceMm === "number" ? part.metadata.coolerClearanceMm : undefined, color: typeof part.metadata.color === "string" ? part.metadata.color : undefined, forms: typeof part.metadata.form === "string" ? part.metadata.form : undefined, panels: inferCasePanels(part, style) } };
    }
    case "mbo": return { ...base, primaryColor: light ? "#d8dcd8" : "#171b1a", secondaryColor: light ? "#8f9792" : "#505653", material: "pcb", metalness: .35, roughness: .42, isLight: light };
    case "cpu": return { ...base, primaryColor: "#c6cbc7", secondaryColor: "#313633", material: "metal", metalness: .9, roughness: .22, isLight: true };
    case "ram": { const ramLight = /\b(WHITE|BLANCO|SNOW)\b/.test(value); return { ...base, primaryColor: ramLight ? (motherboard?.isLight ? "#aeb5b1" : LIGHT) : "#171a19", secondaryColor: ramLight ? "#858d88" : GRAPHITE, material: "metal", metalness: .55, roughness: .35, isLight: ramLight }; }
    case "gpu": { const vendor = String(part.metadata.vendor || "generic"); return { ...base, family: String(part.metadata.family || "GPU"), primaryColor: "#202423", secondaryColor: "#4a504d", accentColor: vendor === "nvidia" ? NVIDIA : vendor === "amd" ? AMD : vendor === "intel" ? INTEL : GOLD, material: "polymer", metalness: .55, roughness: .38, isLight: false }; }
    case "storage": return { ...base, primaryColor: "#303634", secondaryColor: GOLD, accentColor: GOLD, material: "pcb", metalness: .4, roughness: .42, isLight: false };
    case "psu": return { ...base, primaryColor: light ? LIGHT : DARK, secondaryColor: light ? LIGHT_GREY : GRAPHITE, material: "metal", metalness: .72, roughness: .34, isLight: light };
    case "cooler": return { ...base, primaryColor: "#202423", secondaryColor: "#090b0a", material: "metal", metalness: .68, roughness: .34, isLight: false };
    default: return { ...base, primaryColor: DARK };
  }
}

export function aioGeometry(radiatorMm: unknown, declaredFans?: unknown) {
  void declaredFans;
  const size = typeof radiatorMm === "number" && Number.isFinite(radiatorMm) ? Math.min(420, Math.max(120, radiatorMm)) : 240;
  const fanSize = size === 280 || size === 420 ? 140 : 120;
  const canonicalFans = Math.max(1, Math.round(size / fanSize));
  // Radiator size is the physical source of truth; catalog fan fields can
  // describe included spare/push-pull fans rather than one populated face.
  const fanCount = canonicalFans;
  return { radiatorMm: size, fanSizeMm: fanSize, fanCount, widthMm: fanSize + 6, lengthMm: fanSize * fanCount + 12, thicknessMm: 30 };
}
