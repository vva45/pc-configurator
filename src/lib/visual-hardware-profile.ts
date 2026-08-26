import type { Part } from "@/data/parts/types";
import type { VisualCategory, VisualPart } from "@/lib/visual-build";

export type CaseStyle = "STANDARD_TOWER" | "COMPACT_TOWER" | "WIDE_DUAL_CHAMBER" | "AQUARIUM" | "MINI_TOWER" | "OPEN_FRAME" | "HTPC" | "GENERIC";
export interface CaseDimensions { height: number; width: number; depth: number; }
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
}

const DARK = "#171b1a";
const GRAPHITE = "#303533";
const LIGHT = "#e4e7e3";
const LIGHT_GREY = "#b9bfbb";
const GOLD = "#dfb85e";
const NVIDIA = "#76b900";
const AMD = "#ed1c24";
const joined = (part?: Pick<VisualPart, "name" | "metadata">) => `${part?.name || ""} ${Object.values(part?.metadata || {}).join(" ")}`.toUpperCase();

/** Catalog dimensions are stored as H × W × D. Separators and an optional mm suffix are tolerated. */
export function parseCaseDimensions(value: unknown): CaseDimensions | undefined {
  if (typeof value !== "string") return undefined;
  const numbers = value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!numbers || numbers.length < 3 || numbers.slice(0, 3).some((n) => n < 80 || n > 1000)) return undefined;
  const [height, width, depth] = numbers;
  return { height, width, depth };
}

export function inferCaseStyle(part?: Pick<VisualPart, "name" | "metadata">, dimensions = parseCaseDimensions(part?.metadata.dimensions)): CaseStyle {
  const value = joined(part);
  if (/OPEN[ -]?FRAME|CORE P[13579]|CONQUER|CAGE CHASSIS/.test(value)) return "OPEN_FRAME";
  if (/\bHTPC\b|RIDGE|DESKTOP|CONSOLE/.test(value)) return "HTPC";
  if (/O11|DUAL[ -]?CHAMBER|6500X|H9 FLOW|GT502/.test(value)) return "WIDE_DUAL_CHAMBER";
  if (/AQUARIUM|VISION|FISHTANK|PANORAM/.test(value) || /DOBLE|TRES CARAS/.test(value)) return "AQUARIUM";
  if (/MINI[ -]?ITX|NR200|MESHLICIOUS|2000D/.test(value) || (dimensions && dimensions.height < 390 && dimensions.width < 210)) return "MINI_TOWER";
  if (/COMPACT|MATX|MICRO[ -]?ATX|AP20[12]|A3-MATX/.test(value) || (dimensions && dimensions.height < 440)) return "COMPACT_TOWER";
  return dimensions ? "STANDARD_TOWER" : "GENERIC";
}

export function gpuFamilyLabel(part: Pick<Part, "brand" | "name">): { label: string; vendor: "nvidia" | "amd" | "generic" } {
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
  return { label: "GPU", vendor: "generic" };
}

/** One deterministic appearance resolver shared by the SVG and WebGL renderers. */
export function createVisualHardwareProfile(part: VisualPart, motherboard?: VisualHardwareProfile): VisualHardwareProfile {
  const value = joined(part);
  const light = /\b(WHITE|BLANCO|SNOW|ICE|AERO|SILVER|STEEL LEGEND)\b/.test(value);
  const base = { category: part.category, secondaryColor: GRAPHITE, accentColor: GOLD, material: "polymer" as const, metalness: .25, roughness: .48, isLight: false, label: part.name || part.label };
  switch (part.category) {
    case "case": {
      const dimensions = parseCaseDimensions(part.metadata.dimensions);
      const caseLight = /\b(WHITE|BLANCO|SNOW)\b/.test(value) && !/NEGRO\s*\/\s*BLANCO/.test(value);
      return { ...base, primaryColor: caseLight ? LIGHT : "#29312e", secondaryColor: caseLight ? LIGHT_GREY : "#46504b", material: "metal", metalness: .72, roughness: .36, dimensions, style: inferCaseStyle(part, dimensions), isLight: caseLight };
    }
    case "mbo": return { ...base, primaryColor: light ? "#d8dcd8" : "#171b1a", secondaryColor: light ? "#8f9792" : "#505653", material: "pcb", metalness: .35, roughness: .42, isLight: light };
    case "cpu": return { ...base, primaryColor: "#c6cbc7", secondaryColor: "#313633", material: "metal", metalness: .9, roughness: .22, isLight: true };
    case "ram": { const ramLight = /\b(WHITE|BLANCO|SNOW)\b/.test(value); return { ...base, primaryColor: ramLight ? (motherboard?.isLight ? "#aeb5b1" : LIGHT) : "#171a19", secondaryColor: ramLight ? "#858d88" : GRAPHITE, material: "metal", metalness: .55, roughness: .35, isLight: ramLight }; }
    case "gpu": { const vendor = String(part.metadata.vendor || "generic"); return { ...base, family: String(part.metadata.family || "GPU"), primaryColor: "#202423", secondaryColor: "#4a504d", accentColor: vendor === "nvidia" ? NVIDIA : vendor === "amd" ? AMD : GOLD, material: "polymer", metalness: .55, roughness: .38, isLight: false }; }
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
