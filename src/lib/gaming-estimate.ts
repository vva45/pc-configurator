import { CATS } from "@/data/categories";
import { CPU_GAME_INDICES, GPU_GAME_INDICES, type GamingGame } from "@/data/games";
import type { CatId, PartOf } from "@/data/parts/types";
import { gate, one, runPost, type AppBuild, type Build, type Picked } from "./compat";
import { calcPower } from "./power";

export const GAMING_RESOLUTIONS = [
  { id: "1080", label: "1080p", dimensions: "1920 × 1080", factor: 1 },
  { id: "1440", label: "1440p", dimensions: "2560 × 1440", factor: 0.7 },
  { id: "2160", label: "4K", dimensions: "3840 × 2160", factor: 0.4 },
] as const;
export type GamingResolution = (typeof GAMING_RESOLUTIONS)[number]["id"];
export type GamingQuality = "Ultra" | "Alto" | "Medio";
export interface GamingHardware {
  status: "ready" | "missing" | "unknown" | "conflict";
  message: string;
  missingComponents: string[];
  cpuName?: string;
  gpuName?: string;
  cpuIndex?: number;
  gpuIndex?: number;
}
export interface FpsRange { low: number; high: number; specific: boolean; cap?: number; }
export function fpsTone(value: number): "red" | "amber" | "green" {
  return value <= 35 ? "red" : value <= 75 ? "amber" : "green";
}

/** Punctuation and vendor names can differ; model suffixes must remain exact. */
export function cpuGamingKey(name: string): string {
  return name.toLowerCase().replace(/\b(?:amd|intel)\b/g, "").replace(/[^a-z0-9]/g, "");
}

/** Match a desktop family, never a shared silicon ID (e.g. GB203) or a nearby model. */
export function gpuGamingKey(part: Pick<PartOf<"gpu">, "name" | "vram">): string | undefined {
  const name = part.name.toUpperCase();
  if (/\b(?:LAPTOP|MOBILE|MAX[ -]?Q|OEM|ANNIVERSARY|50TH)\b/.test(name)) return;
  const matches = name.match(/\b(?:RTX|GTX|RX)\s*\d{3,4}(?:\s*(?:XTX|SUPER|TI|XT|GRE|D))*\b|\bARC\s*[AB]\d{3}\b/g);
  if (matches?.length !== 1 || !Number.isFinite(part.vram) || part.vram <= 0) return;
  const family = matches[0];
  const tail = name.slice(name.indexOf(family) + family.length).trim();
  // Never fall back to the base family when a suffix is unrecognized.
  // Unknown leading tails stay unavailable until they can be reviewed.
  const knownProductTail = /^(?:FOUNDERS|OC|GAMING|WINDFORCE|LIMITED|STEEL|CHALLENGER|PHOTON|INDEX|ICRAFT|MILESTONE|TITAN|GUARDIAN|LUMI|ODYSSEY|MECH|THICC|PHANTOM|ITX|RAW|MASTER|BLACK|ELITE|VAPOR-X|WHITE|TAICHI|ATLANTIS|AERO|XTREME|AMP|KINGPIN|TRINITY|SUPRIM|GAMEROCK|ICHILL|XLR8|SOLID|EAGLE|SE|ULTRA|CORE|AQUA|MAGNETIC|LOW)\b/;
  const memoryTail = tail.match(/^(\d+)\s*G(?:B)?\b/);
  const isMemoryTail = memoryTail && Number(memoryTail[1]) === part.vram;
  if (tail && !knownProductTail.test(tail) && !isMemoryTail) return;
  return `${family.replace(/\s/g, "")}|${part.vram}`;
}

function positiveIndex(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Only the selected build is inspected; no client-side import of the hardware catalog. */
export function getGamingHardware(build: AppBuild): GamingHardware {
  const cpu = one(build, "cpu"), gpu = one(build, "gpu");
  const missingComponents = CATS.filter((category) => category.req && !build[category.id]?.length).map((category) => category.label);
  const base = { missingComponents, cpuName: cpu ? `${cpu.brand} ${cpu.name}` : undefined, gpuName: gpu ? `${gpu.brand} ${gpu.name}` : undefined };
  if (!cpu || !gpu) return { ...base, status: "missing", message: "Elige un procesador y una gráfica dedicada para explorar los juegos. Las gráficas integradas no tienen perfil de simulación." };

  const failure = runPost(build, calcPower(build)).find((line) => line.lvl === "fail");
  if (failure) return { ...base, status: "conflict", message: `Resuelve la incompatibilidad antes de simular: ${failure.msg}.` };
  for (const [category, items] of Object.entries(build) as [CatId, Picked[] | undefined][]) {
    for (const item of items ?? []) {
      const rest = { ...build, [category]: items?.filter((candidate) => candidate._uid !== item._uid) } as Build;
      const result = gate(item, rest);
      if (result.blocked) return { ...base, status: "conflict", message: `Resuelve la incompatibilidad antes de simular: ${result.reason ?? item.name}.` };
    }
  }

  const cpuIndex = CPU_GAME_INDICES[cpuGamingKey(`${cpu.brand} ${cpu.name}`)];
  const gpuKey = gpuGamingKey(gpu);
  const gpuIndex = gpuKey ? GPU_GAME_INDICES[gpuKey] : undefined;
  if (!positiveIndex(cpuIndex) || !positiveIndex(gpuIndex)) {
    const unknown = [!positiveIndex(cpuIndex) && "procesador", !positiveIndex(gpuIndex) && "gráfica"].filter(Boolean).join(" y ");
    return { ...base, status: "unknown", message: `No disponible: no hay un perfil inequívoco para tu ${unknown}. Conservamos el modelo elegido sin sustituirlo por otro.` };
  }
  return { ...base, status: "ready", cpuIndex, gpuIndex, message: missingComponents.length ? `Montaje incompleto: falta ${missingComponents.join(", ")}. Los rangos solo simulan la pareja CPU + GPU.` : "Pareja CPU + GPU identificada. La simulación no valida los requisitos de cada juego." };
}

/**
 * NEXUS editorial model, not measured performance. A smooth minimum combines CPU
 * and GPU limits; genre-only profiles use a wider interval. Unknown hardware has
 * no default index. Resolution/quality multipliers are illustrative, not calibrated.
 */
export function estimateGamingFps(game: GamingGame, hardware: GamingHardware, resolution: GamingResolution, quality: GamingQuality): FpsRange | null {
  if (hardware.status !== "ready" || !positiveIndex(hardware.cpuIndex) || !positiveIndex(hardware.gpuIndex)) return null;
  const resolutionProfile = GAMING_RESOLUTIONS.find((item) => item.id === resolution);
  const qualityGain = { Ultra: 1, Alto: 1.22, Medio: 1.55 }[quality];
  if (!resolutionProfile || !positiveIndex(qualityGain) || !positiveIndex(game.profile.cpu) || !positiveIndex(game.profile.gpu)) return null;
  const gpuLimit = game.profile.gpu * hardware.gpuIndex * resolutionProfile.factor * qualityGain;
  const cpuLimit = game.profile.cpu * hardware.cpuIndex * (quality === "Medio" ? 1.08 : 1);
  const center = Math.pow(Math.pow(gpuLimit, -4) + Math.pow(cpuLimit, -4), -0.25);
  const spread = game.profile.specific ? 0.17 : 0.27;
  const cap = game.profile.cap ?? Number.POSITIVE_INFINITY;
  return {
    low: Math.max(1, Math.min(cap, Math.round(center * (1 - spread)))),
    high: Math.max(1, Math.min(cap, Math.round(center * (1 + spread)))),
    specific: game.profile.specific,
    cap: game.profile.cap,
  };
}

