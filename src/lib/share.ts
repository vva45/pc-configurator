/* ═══════════════════════════════════════════════════════════════════
   MONTAJE EN LA URL — parte compartida cliente/servidor
   Serializa el build en query params (?cpu=0&ram=2x2,5&case=3…): el valor
   es el índice de la pieza dentro de su categoría (el id es `cat-índice`),
   con `xN` si hay más de una unidad y comas entre piezas.
   Este módulo NO importa el catálogo: el cliente lo usa sin cargar las
   piezas. La resolución de índices a piezas vive en catalog-server.ts.
   ═══════════════════════════════════════════════════════════════════ */
import { CAT_IDS, type CatId } from "@/data/parts/types";
import type { AppBuild, Picked } from "./compat";

/** build -> query params, en el orden estable de CAT_IDS */
export function buildToParams(build: AppBuild): URLSearchParams {
  const sp = new URLSearchParams();
  for (const cat of CAT_IDS) {
    const items = (build[cat] || []) as Picked[];
    if (!items.length) continue;
    const value = items
      .map((i) => {
        const idx = i.id.startsWith(`${cat}-`) ? i.id.slice(cat.length + 1) : null;
        if (idx === null || !/^\d+$/.test(idx)) return null;
        const qty = i.qty || 1;
        return qty > 1 ? `${idx}x${qty}` : idx;
      })
      .filter((v): v is string => v !== null)
      .join(",");
    if (value) sp.set(cat, value);
  }
  return sp;
}

export interface BuildToken { cat: CatId; idx: number; qty: number; }

/** query params -> tokens {cat, idx, qty}. Ignora lo mal formado. */
export function parseBuildTokens(sp: URLSearchParams): BuildToken[] {
  const out: BuildToken[] = [];
  for (const cat of CAT_IDS) {
    const raw = sp.get(cat);
    if (!raw) continue;
    for (const token of raw.split(",")) {
      const m = token.trim().match(/^(\d+)(?:x(\d+))?$/);
      if (!m) continue;
      const qty = Math.max(1, Math.min(99, m[2] ? parseInt(m[2], 10) : 1));
      out.push({ cat, idx: parseInt(m[1], 10), qty });
    }
  }
  return out;
}

/** ¿Llevan estos params un montaje serializado? */
export const hasBuildParams = (sp: URLSearchParams): boolean =>
  CAT_IDS.some((c) => sp.has(c));
