/* ═══════════════════════════════════════════════════════════════════
   MONTAJE EN LA URL
   Serializa el build en query params (?cpu=0&ram=2x2,5&case=3…) para
   compartir una configuración por enlace. El valor de cada parámetro es
   el índice de la pieza dentro de su categoría (el id es `cat-índice`),
   con `xN` si hay más de una unidad, y comas entre piezas.
   ═══════════════════════════════════════════════════════════════════ */
import { CAT_IDS, type CatId, type Part } from "@/data/parts/types";
import { P } from "@/data/parts";
import { CAT } from "@/data/categories";
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

/** query params -> build. Ignora piezas desconocidas o mal formadas.
    En categorías sin multi solo cuenta la primera pieza. */
export function buildFromParams(sp: URLSearchParams): AppBuild {
  const build: Record<string, Picked[]> = {};
  let n = 0;
  for (const cat of CAT_IDS) {
    const raw = sp.get(cat);
    if (!raw) continue;
    const items: Picked[] = [];
    for (const token of raw.split(",")) {
      const m = token.trim().match(/^(\d+)(?:x(\d+))?$/);
      if (!m) continue;
      const part = P.find((p) => p.id === `${cat}-${m[1]}`) as Part | undefined;
      if (!part) continue;
      if (items.some((x) => x.id === part.id)) continue;
      const qty = Math.max(1, Math.min(99, m[2] ? parseInt(m[2], 10) : 1));
      items.push({ ...part, qty, _uid: `${part.id}-url-${n++}` });
      if (!CAT[cat as CatId].multi) break;
    }
    if (items.length) build[cat] = items;
  }
  return build as AppBuild;
}
