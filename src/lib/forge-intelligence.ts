import type { CatId } from "@/data/parts/types";
import type { PostLine } from "./compat";
import type { PowerReport } from "./power";

export type ForgeSeverity = "critical" | "warning" | "info" | "success";
export interface ForgeConflict { uid: string; name: string; reason: string; cat: CatId }
export interface ForgeInsight {
  id: string;
  severity: ForgeSeverity;
  label: string;
  title: string;
  detail: string;
  targetCat?: CatId;
  minWatt?: number;
}
export interface ForgeScore {
  total: number;
  label: "LISTO" | "SÓLIDO" | "EN PROGRESO" | "REVISAR";
  core: number;
  compatibility: number;
  post: number;
  power: number;
}
export interface ForgeAnalysisInput {
  selectedCount: number;
  requiredCore: readonly CatId[];
  selectedCategories: ReadonlySet<CatId>;
  conflicts: readonly ForgeConflict[];
  post: readonly PostLine[];
  power: PowerReport;
  psuWatt?: number;
  nextCategory?: CatId;
  categoryLabel: (cat: CatId) => string;
}
export interface ForgeAnalysis { score: ForgeScore | null; insights: ForgeInsight[] }

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function calculateForgeScore(input: ForgeAnalysisInput): ForgeScore | null {
  if (input.selectedCount < 1) return null;
  const completed = input.requiredCore.filter((cat) => input.selectedCategories.has(cat)).length;
  const core = Math.round(35 * completed / Math.max(1, input.requiredCore.length));
  const compatibility = clamp(30 - input.conflicts.length * 12, 0, 30);
  const failures = input.post.filter((line) => line.lvl === "fail").length;
  const warnings = input.post.filter((line) => line.lvl === "warn").length;
  const post = input.post.length ? clamp(20 - failures * 10 - warnings * 4, 0, 20) : 0;
  let power = 0;
  if (input.power.total > 0 && input.psuWatt) {
    const load = input.power.total / input.psuWatt;
    power = input.psuWatt < input.power.target ? (input.psuWatt >= input.power.total ? 7 : 0)
      : load > .85 ? 7 : load > .7 ? 11 : 15;
  }
  const total = Math.round(clamp(core + compatibility + post + power, 0, 100));
  const complete = completed === input.requiredCore.length;
  const label = total >= 90 && complete ? "LISTO" : total >= 75 ? "SÓLIDO" : total >= 50 ? "EN PROGRESO" : "REVISAR";
  return { total, label, core, compatibility, post, power };
}

export function generateForgeInsights(input: ForgeAnalysisInput): ForgeInsight[] {
  const insights: ForgeInsight[] = [];
  for (const conflict of input.conflicts) insights.push({
    id: `conflict-${conflict.uid}`, severity: "critical", label: "Conflicto", title: conflict.name,
    detail: conflict.reason, targetCat: conflict.cat,
  });
  for (const line of input.post.filter((item) => item.lvl === "fail")) insights.push({
    id: `post-fail-${line.id}-${insights.length}`, severity: "critical", label: `POST ${line.code}`,
    title: "Verificación fallida", detail: line.msg,
  });
  if (input.psuWatt && input.power.total > 0 && input.psuWatt < input.power.target) insights.push({
    id: "psu-insufficient", severity: input.psuWatt < input.power.total ? "critical" : "warning",
    label: "Alimentación", title: "Fuente sin margen suficiente",
    detail: `${input.psuWatt} W seleccionados · ${input.power.total} W de carga · objetivo ${Math.round(input.power.target)} W.`,
    targetCat: "psu", minWatt: input.power.rec,
  });
  const missing = input.requiredCore.filter((cat) => !input.selectedCategories.has(cat));
  if (input.selectedCount > 0 && input.nextCategory && missing.includes(input.nextCategory)) insights.push({
    id: `next-${input.nextCategory}`, severity: "info", label: "Siguiente paso",
    title: `Selecciona ${input.categoryLabel(input.nextCategory).toLowerCase()}`,
    detail: "Es el siguiente paso del flujo CORE del montaje.", targetCat: input.nextCategory,
  });
  for (const line of input.post.filter((item) => item.lvl === "warn")) insights.push({
    id: `post-warn-${line.id}-${insights.length}`, severity: "warning", label: `POST ${line.code}`,
    title: "Revisión recomendada", detail: line.msg,
  });
  if (!input.psuWatt && input.power.total > 0) insights.push({
    id: "psu-missing", severity: "warning", label: "Alimentación", title: "Fuente pendiente",
    detail: `El montaje requiere aproximadamente una fuente de ${input.power.rec} W o superior.`,
    targetCat: "psu", minWatt: input.power.rec,
  });
  if (!input.selectedCount && input.nextCategory) insights.push({
    id: "start-build", severity: "info", label: "Siguiente paso", title: `Empieza por ${input.categoryLabel(input.nextCategory)}`,
    detail: "Selecciona el primer componente para iniciar el análisis.", targetCat: input.nextCategory,
  });
  if (!missing.length) insights.push({
    id: "core-complete", severity: "success", label: "Core completo", title: "Núcleo obligatorio instalado",
    detail: "Todas las categorías CORE requeridas tienen al menos un componente.",
  });
  if (input.psuWatt && input.power.total > 0 && input.psuWatt >= input.power.target) insights.push({
    id: "psu-ready", severity: "success", label: "Alimentación", title: "Margen suficiente",
    detail: `${input.psuWatt} W cubren el objetivo de ${Math.round(input.power.target)} W.`,
  });
  return insights;
}

export function analyzeForgeBuild(input: ForgeAnalysisInput): ForgeAnalysis {
  return { score: calculateForgeScore(input), insights: generateForgeInsights(input) };
}
