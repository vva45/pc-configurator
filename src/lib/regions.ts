/* ═══════════════════════════════════════════════════════════════════
   DÓNDE COMPRAR
   Enlace directo al buscador de cada tienda con el modelo exacto.
   Sin precios ni stock: eso exigiría feeds de afiliación (ver README).
   Cada patrón de búsqueda está verificado. kind: "tienda" | "comparador"
   ═══════════════════════════════════════════════════════════════════ */

export type StoreKind = "tienda" | "comparador";
export interface Store { id: string; name: string; kind: StoreKind; url: (q: string) => string; }
export type ResolvedStore = Omit<Store, "url"> & { url: string };
export interface Region { label: string; cur: string; stores: Store[]; }
export type RegionId = "ES" | "EU" | "UK" | "US" | "AP" | "LATAM";

const S = (id: string, name: string, kind: StoreKind, url: (q: string) => string): Store => ({ id, name, kind, url });

export const REGIONS: Record<RegionId, Region> = {
  ES: { label: "España", cur: "€", stores: [
    S("pccom", "PcComponentes", "tienda",     (q) => `https://www.pccomponentes.com/buscar/?query=${q}`),
    S("coolmod", "Coolmod", "tienda",         (q) => `https://www.coolmod.com/busqueda?controller=search&s=${q}`),
    S("ldlc", "LDLC España", "tienda",        (q) => `https://www.ldlc.com/es-es/buscar/${q}/`),
    S("neobyte", "Neobyte", "tienda",         (q) => `https://www.neobyte.es/busqueda?search_query=${q}`),
    S("pcbox", "PCBox", "tienda",             (q) => `https://www.pcbox.com/buscar?q=${q}`),
    S("mediamarkt", "MediaMarkt", "tienda",   (q) => `https://www.mediamarkt.es/es/search.html?query=${q}`),
    S("amzes", "Amazon.es", "tienda",         (q) => `https://www.amazon.es/s?k=${q}`),
    S("geizes", "Geizhals", "comparador",     (q) => `https://geizhals.eu/?fs=${q}`),
  ]},
  EU: { label: "Europa", cur: "€", stores: [
    S("mindf", "Mindfactory", "tienda",       (q) => `https://www.mindfactory.de/search_result.php?search_query=${q}`),
    S("alt", "Alternate", "tienda",           (q) => `https://www.alternate.de/listing.xhtml?q=${q}`),
    S("caseking", "Caseking", "tienda",       (q) => `https://www.caseking.de/search?sSearch=${q}`),
    S("amzde", "Amazon.de", "tienda",         (q) => `https://www.amazon.de/s?k=${q}`),
    S("ldlcfr", "LDLC Francia", "tienda",     (q) => `https://www.ldlc.com/recherche/${q}/`),
    S("geiz", "Geizhals", "comparador",       (q) => `https://geizhals.eu/?fs=${q}`),
  ]},
  UK: { label: "Reino Unido", cur: "£", stores: [
    S("scan", "Scan UK", "tienda",            (q) => `https://www.scan.co.uk/search?q=${q}`),
    S("ocuk", "Overclockers UK", "tienda",    (q) => `https://www.overclockers.co.uk/search?sSearch=${q}`),
    S("amzuk", "Amazon.co.uk", "tienda",      (q) => `https://www.amazon.co.uk/s?k=${q}`),
    S("geizuk", "Skinflint", "comparador",    (q) => `https://skinflint.co.uk/?fs=${q}`),
  ]},
  US: { label: "Estados Unidos", cur: "$", stores: [
    S("newegg", "Newegg", "tienda",           (q) => `https://www.newegg.com/p/pl?d=${q}`),
    S("amzus", "Amazon.com", "tienda",        (q) => `https://www.amazon.com/s?k=${q}`),
    S("microc", "Micro Center", "tienda",     (q) => `https://www.microcenter.com/search/search_results.aspx?Ntt=${q}`),
    S("bh", "B&H Photo", "tienda",            (q) => `https://www.bhphotovideo.com/c/search?q=${q}`),
    S("bestbuy", "Best Buy", "tienda",        (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`),
  ]},
  AP: { label: "Asia-Pacífico", cur: "$", stores: [
    S("pcase", "PCCaseGear (AU)", "tienda",   (q) => `https://www.pccasegear.com/search?q=${q}`),
    S("scorptec", "Scorptec (AU)", "tienda",  (q) => `https://www.scorptec.com.au/search?keywords=${q}`),
    S("amzjp", "Amazon.co.jp", "tienda",      (q) => `https://www.amazon.co.jp/s?k=${q}`),
    S("shopee", "Shopee (SG)", "tienda",      (q) => `https://shopee.sg/search?keyword=${q}`),
    S("kakaku", "Kakaku.com (JP)", "comparador", (q) => `https://kakaku.com/search_results/${q}/`),
  ]},
  LATAM: { label: "Latinoamérica", cur: "$", stores: [
    S("mlar", "MercadoLibre (AR)", "tienda",  (q) => `https://listado.mercadolibre.com.ar/${q}`),
    S("mlmx", "MercadoLibre (MX)", "tienda",  (q) => `https://listado.mercadolibre.com.mx/${q}`),
    S("amzmx", "Amazon.mx", "tienda",         (q) => `https://www.amazon.com.mx/s?k=${q}`),
    S("kabum", "Kabum (BR)", "tienda",        (q) => `https://www.kabum.com.br/busca/${q}`),
  ]},
};

export const searchTerm = (p: { brand: string; name: string }): string => encodeURIComponent(
  `${p.brand} ${p.name}`.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim());

export const storesFor = (part: { brand: string; name: string }, region: RegionId): ResolvedStore[] =>
  REGIONS[region].stores.map((s) => ({ ...s, url: s.url(searchTerm(part)) }));
