import type { VisualPart } from "@/lib/visual-build";
import { CAT } from "@/data/categories";

export const visualStateLabel = { empty: "Por elegir", next: "Elige esta pieza", installed: "Instalado", warning: "Aviso", conflict: "Conflicto" };
export const visualPartLabel = (part: VisualPart) => CAT[part.sourceCategory].label;

export function visualPartDetails(part: VisualPart): string {
  const m = part.metadata;
  const value = (key: string, unit = "") => typeof m[key] === "number" || typeof m[key] === "string" ? `${m[key]}${unit}` : "";
  const join = (...items: string[]) => items.filter(Boolean).join(" · ");
  switch (part.category) {
    case "case": return join(value("dimensions"), value("volumeL", " L"), value("sidePanel"));
    case "mbo": return join(value("form"), value("dimmSlots", " ranuras RAM"));
    case "cpu": return join(value("socket"), value("cores", " núcleos"));
    case "gpu": return join(value("lengthMm", " mm de largo"), value("slots", " ranuras"));
    case "ram": return join(value("modules", " módulos"), value("heightMm", " mm de alto"));
    case "cooler": return m.mode === "aio" ? join("Refrigeración líquida", value("radiatorMm", " mm")) : join("Refrigeración por aire", value("heightMm", " mm de alto"));
    case "psu": return join(value("form"), value("watt", " W"));
    case "fan": return join(value("count", " ventiladores"), value("sizeMm", " mm"));
    case "storage": return value("count", " unidades");
    default: return part.quantity > 0 ? `${part.quantity} unidades` : "";
  }
}
