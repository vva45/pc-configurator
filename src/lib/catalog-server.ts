/* ═══════════════════════════════════════════════════════════════════
   CATÁLOGO EN SERVIDOR
   Con 447 piezas se podía mandar el catálogo entero al navegador; con
   miles, no. Este módulo (solo servidor) resuelve todo lo que antes se
   calculaba en el cliente: filtrado, búsqueda, gate, orden, facetas del
   panel de filtros y paginación. El cliente pide páginas a /api/parts
   y resuelve montajes compartidos en /api/build.
   ═══════════════════════════════════════════════════════════════════ */
import { P } from "@/data/parts";
import { CAT_IDS, type CatId, type Part } from "@/data/parts/types";
import { CAT } from "@/data/categories";
import { gate, type AppBuild, type Picked } from "./compat";
import { FILTERS, matches, type ActiveFilters, type EnumValue } from "./filters";
import { parseBuildTokens } from "./share";

/* ── Reconstrucción de un montaje desde la URL ───────────────────── */
export function resolveBuild(sp: URLSearchParams): AppBuild {
  const build: Record<string, Picked[]> = {};
  let n = 0;
  for (const t of parseBuildTokens(sp)) {
    const part = P.find((p) => p.id === `${t.cat}-${t.idx}`) as Part | undefined;
    if (!part) continue;
    const items = (build[t.cat] ??= []);
    if (items.some((x) => x.id === part.id)) continue;
    if (items.length && !CAT[t.cat].multi) continue;
    items.push({ ...part, qty: t.qty, _uid: `${part.id}-url-${n++}` });
  }
  return build as AppBuild;
}

/* ── Facetas para el panel de filtros ────────────────────────────── */
export type Facet =
  | { k: string; kind: "enum"; values: EnumValue[] }
  | { k: string; kind: "range"; lo: number; hi: number }
  | { k: string; kind: "flag" };

/* Facetas encadenadas: las opciones de cada filtro se calculan sobre el
   catálogo con TODOS los demás filtros aplicados (el propio no, para poder
   ampliar o deshacer la selección). Eligiendo AMD desaparecen los sockets
   y generaciones de Intel, y al revés. */
function facetsFor(cat: CatId, pool: Part[], filters: ActiveFilters): Facet[] {
  const out: Facet[] = [];
  for (const d of FILTERS[cat] || []) {
    const others: ActiveFilters = Object.fromEntries(
      Object.entries(filters).filter(([k]) => k !== d.k));
    const base = Object.keys(others).length ? pool.filter((p) => matches(p, others, cat)) : pool;
    const vals = base
      .map((p) => (p as unknown as Record<string, unknown>)[d.k])
      .filter((v) => v !== undefined);
    if (!vals.length) continue;
    if (d.type === "enum") {
      const uniq = [...new Set(vals.flat().filter((v) => v !== null && v !== ""))].sort((a, b) =>
        typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b))) as EnumValue[];
      if (uniq.length < 2) continue;
      out.push({ k: d.k, kind: "enum", values: uniq });
    } else if (d.type === "range") {
      const nums = vals.filter((v): v is number => typeof v === "number");
      if (nums.length < 2) continue;
      const lo = Math.min(...nums), hi = Math.max(...nums);
      if (lo === hi) continue;
      out.push({ k: d.k, kind: "range", lo, hi });
    } else {
      out.push({ k: d.k, kind: "flag" });
    }
  }
  return out;
}

/* ── Consulta paginada del catálogo ──────────────────────────────── */
export interface CatalogItem { p: Part; blocked: boolean; reason?: string; }
export interface CatalogResponse {
  items: CatalogItem[];
  total: number;      // tras filtros/búsqueda (y sin incompatibles, si se ocultan)
  nCompat: number;
  nBlocked: number;
  poolSize: number;   // piezas de la categoría visibles (según «descatalogadas»)
  hasLegacy: boolean; // ¿existe el interruptor «Mostrar descatalogadas»?
  facets: Facet[];
  page: number;
  pageSize: number;
}

/* ── Búsqueda libre ──────────────────────────────────────────────────
   Por palabras: cada término debe aparecer en alguna parte de la pieza
   (marca, nombre o specs clave), en cualquier orden. La comparación se
   hace sobre texto compactado (minúsculas, sin espacios ni signos), así
   «2tb» encuentra «2 TB» y «sn850x» encuentra «SN850X». Con texto de
   búsqueda se rastrillan también las descatalogadas y piezas de museo,
   aunque el interruptor esté apagado: buscar es querer verlo todo. */
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const FORM_ALIAS: Record<string, string[]> = {
  microatx: ["matx", "uatx", "matx"],
  miniitx: ["mitx"],
  minidtx: ["mdtx"],
  eatx: ["extendedatx"],
  flexatx: ["fatx"],
};
const HAY = new Map<string, string>();
function haystack(p: Part): string {
  const hit = HAY.get(p.id);
  if (hit !== undefined) return hit;
  const o = p as unknown as Record<string, unknown>;
  const bits: string[] = [p.brand, p.name];
  for (const k of ["socket", "chipset", "memType", "form", "vtype", "iface", "gen", "eff", "chip", "family", "nand", "atx", "panel", "type"]) {
    const v = o[k];
    if (typeof v === "string") bits.push(v);
    else if (Array.isArray(v)) bits.push(...v.filter((x): x is string => typeof x === "string"));
  }
  if (typeof o.vram === "number") bits.push(`${o.vram}gb`);
  if (typeof o.capGB === "number") bits.push(o.capGB >= 1000 ? `${o.capGB / 1000}tb` : `${o.capGB}gb`);
  if (p.cat === "psu" && typeof o.watt === "number") bits.push(`${o.watt}w`);
  if (typeof o.size === "number") bits.push(`${o.size}mm`);
  if (typeof o.rpm === "number") bits.push(`${o.rpm}rpm`);
  if (typeof o.speed === "number") bits.push(`${o.speed}mhz`);
  /* palabras sueltas + parejas adyacentes pegadas: «2 TB» aporta «2tb»
     sin pegarse al número anterior («540 2 TB» ↛ «5402tb» a secas) y
     «Ryzen 7 5800X3D» conserva «5800x3d» con frontera limpia */
  const words: string[] = [];
  for (const bit of bits) {
    const w = bit.split(/\s+/).map(compact).filter(Boolean);
    words.push(...w);
    for (let i = 0; i < w.length - 1; i++) words.push(w[i] + w[i + 1]);
  }
  /* Un formato se teclea de mil maneras: «Micro-ATX», «mATX», «m-atx»,
     «uATX». Al compactar quedan cadenas distintas («microatx» no contiene
     «matx»), así que cada forma canónica arrastra sus variantes y la
     búsqueda deja de depender de cómo se escriba. */
  for (const w of [...words]) {
    const alias = FORM_ALIAS[w];
    if (alias) words.push(...alias);
  }
  const hay = words.join("|");
  HAY.set(p.id, hay);
  return hay;
}
/* Frontera numérica: «2tb» no debe colarse dentro de «12tb» ni «850»
   dentro de «1850rpm», pero sí valer en «rtx4070» o tras un espacio. */
const tokenRe = (t: string) => {
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${/^\d/.test(t) ? "(?<!\\d)" : ""}${esc}${/\d$/.test(t) ? "(?!\\d)" : ""}`);
};
function matchesQuery(p: Part, tokens: RegExp[]): boolean {
  const hay = haystack(p);
  return tokens.every((t) => t.test(hay));
}

type SortKey = "rel" | "price" | "priceDesc" | "name";
const SORT_KEYS: Record<SortKey, (x: CatalogItem) => number | string> = {
  price: (x) => x.p.price || 1e9,
  priceDesc: (x) => -(x.p.price || 0),
  name: (x) => x.p.brand + x.p.name,
  rel: (x) => (x.blocked ? 1 : 0),
};

const int = (v: string | null, d: number) => {
  const n = v === null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export function queryCatalog(sp: URLSearchParams): CatalogResponse {
  const cat = (CAT_IDS as readonly string[]).includes(sp.get("cat") || "") ? (sp.get("cat") as CatId) : "cpu";
  const museum = sp.get("museum") === "1";
  const q = (sp.get("q") || "").trim().toLowerCase();
  const sort = (["rel", "price", "priceDesc", "name"].includes(sp.get("sort") || "") ? sp.get("sort") : "rel") as SortKey;
  const showBlocked = sp.get("showBlocked") !== "0";
  const page = Math.max(0, int(sp.get("page"), 0));
  const pageSize = Math.min(96, Math.max(1, int(sp.get("size"), 48)));
  let filters: ActiveFilters = {};
  try { filters = JSON.parse(sp.get("filters") || "{}") as ActiveFilters; } catch { /* filtros ilegibles: sin filtros */ }
  const build = resolveBuild(sp);

  const tokens = q.split(/\s+/).map(compact).filter(Boolean).map(tokenRe);
  const pool = P.filter((p) => p.cat === cat && (tokens.length > 0 || museum || !(p.museum || p.legacy)));
  let r = pool.filter((p) => matches(p, filters, cat));
  if (tokens.length) r = r.filter((p) => matchesQuery(p, tokens));
  let g: CatalogItem[] = r.map((p) => ({ p, ...gate(p, build) }));
  const nCompat = g.filter((x) => !x.blocked).length;
  const nBlocked = g.length - nCompat;
  if (!showBlocked) g = g.filter((x) => !x.blocked);
  g.sort((a, b) => {
    const k = SORT_KEYS[sort];
    const A = k(a), B = k(b);
    return typeof A === "string" ? A.localeCompare(B as string) : A - (B as number);
  });

  return {
    items: g.slice(page * pageSize, page * pageSize + pageSize),
    total: g.length,
    nCompat,
    nBlocked,
    poolSize: pool.length,
    hasLegacy: P.some((p) => p.cat === cat && (p.legacy || p.museum)),
    facets: facetsFor(cat, pool, filters),
    page,
    pageSize,
  };
}
