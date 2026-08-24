/* Añade un lote de cajas a src/data/parts/case.ts a partir de dos ficheros:

     node scripts/gen-cajas-lote.mjs docs/catalogo/cajas-pendientes.txt specs.jsonl [specs2.jsonl …]

   1) LISTADO  «marca|modelo|precio|colores», una caja por línea. El precio es
      el normal de la ficha de tienda (PVPR o el más alto), nunca el de oferta.
   2) SPECS    JSON Lines, una ficha por caja, con las claves que se hayan
      podido verificar (ver docs/catalogo/README.md). Las que falten se
      rellenan con la cota de clase por tipo de torre.

   Solo se emiten las cajas que aparecen en AMBOS ficheros: sin ficha de specs
   la caja se deja pendiente en vez de inventarle números. Lo que ya está en
   case.ts se salta, así que el script es idempotente y se puede ejecutar
   varias veces mientras llegan fichas nuevas.

   Se ejecuta desde la raíz del repo. Aborta sin tocar nada si detecta datos
   mal formados: es preferible arreglar la ficha a colar una fila inválida. */
import { readFileSync, writeFileSync } from "node:fs";

const [listPath, ...specPaths] = process.argv.slice(2);
if (!listPath || !specPaths.length) {
  console.error("uso: node scripts/gen-cajas-lote.mjs <listado.txt> <specs.jsonl…>");
  process.exit(1);
}

const FILE = "src/data/parts/case.ts";
const src = readFileSync(FILE, "utf8");
const norm = (s) => s.toLowerCase().replace(/\+/g, "plus").replace(/[^a-z0-9]/g, "");
const key = (b, m) => norm(b) + "|" + norm(m);

/* Los nombres ya guardados pueden llevar el sufijo «(con fuente …)», así que
   se indexan también sin él: si no, la caja se reañadiría duplicada. */
const existing = new Set();
for (const m of src.matchAll(/ADD\("([^"]+)","([^"]+)"/g)) {
  existing.add(key(m[1], m[2]));
  existing.add(key(m[1], m[2].replace(/\s*\(con fuente [^)]*\)\s*$/, "")));
}

const fail = (msg) => { console.error("✗ " + msg); process.exit(1); };

const SPEC = new Map();
for (const p of specPaths)
  for (const [i, line] of readFileSync(p, "utf8").split("\n").entries()) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    let o;
    try { o = JSON.parse(t); } catch { fail(`${p}:${i + 1} no es JSON válido`); }
    if (o.notfound || !o.b) continue;
    if (!o.m) fail(`${p}:${i + 1} ficha sin modelo («m»)`);
    SPEC.set(key(o.b, o.m), o);
  }

/* Cotas de clase por tipo de torre. Se usan SOLO para los campos que la
   búsqueda no devolvió; nunca sustituyen a un dato verificado. */
const T = {
  EATX: { form: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"], gpu: 420, cool: 175, psu: 220, rad: { front: 360, top: 360, rear: 140 }, fmax: 10, b35: 3, b25: 3, dims: "500×240×500 mm", vol: 60 },
  ATX: { form: ["ATX", "Micro-ATX", "Mini-ITX"], gpu: 380, cool: 165, psu: 200, rad: { front: 360, top: 280, rear: 120 }, fmax: 8, b35: 2, b25: 2, dims: "450×215×460 mm", vol: 44 },
  mATX: { form: ["Micro-ATX", "Mini-ITX"], gpu: 330, cool: 160, psu: 180, rad: { front: 240, top: 240 }, fmax: 6, b35: 1, b25: 2, dims: "400×210×410 mm", vol: 34 },
  ITX: { form: ["Mini-ITX"], gpu: 300, cool: 130, psu: 150, rad: { side: 240 }, fmax: 4, b35: 0, b25: 2, dims: "330×180×300 mm", vol: 18 },
};
const axes = (dims) => (dims.match(/(\d+)[×x](\d+)[×x](\d+)/) || []).slice(1).map(Number);

const lines = [];
const skipped = [];
const nospec = [];
for (const [i, line] of readFileSync(listPath, "utf8").split("\n").entries()) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const parts = t.split("|");
  if (parts.length !== 4 || parts.some((x) => !x.trim()))
    fail(`${listPath}:${i + 1} debe tener 4 campos no vacíos «marca|modelo|precio|colores»: ${t}`);
  const [brand, model, priceTxt, color] = parts.map((x) => x.trim());
  const price = Number(priceTxt.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) fail(`${listPath}:${i + 1} precio inválido: ${priceTxt}`);

  const k = key(brand, model);
  if (existing.has(k)) { skipped.push(`${brand} ${model}`); continue; }
  const s = SPEC.get(k);
  if (!s) { nospec.push(`${brand}|${model}|${priceTxt}|${color}`); continue; }
  existing.add(k);

  if (s.form && !T[s.form]) fail(`${brand} ${model}: «form» debe ser EATX, ATX, mATX o ITX (llegó «${s.form}»)`);
  const c = T[s.form] || T.ATX;
  const dims = s.dims ?? c.dims;
  const gpuLen = s.gpu ?? c.gpu;
  const ax = axes(dims);
  /* Una gráfica no puede ser más larga que la arista mayor del chasis: cuando
     pasa es que el dato de dimensiones o el de GPU está mal, no que la caja
     sea rara. Mejor pararse que colar la contradicción en el catálogo. */
  if (ax.length === 3 && gpuLen > Math.max(...ax))
    fail(`${brand} ${model}: gpuLen ${gpuLen} mm no cabe en dims ${dims}`);

  const glass = s.glass !== false;
  const inc = s.finc ?? (glass ? 3 : 1);
  const psuForm = s.sfx || s.form === "ITX" ? ["SFX", "SFX-L"] : ["ATX", "SFX"];
  const io = (s.io || (s.usbc ? "2× USB-A 3.0, 1× USB-C" : "2× USB-A 3.0")).replace(/,\s*jack\s*$/i, "") + ", jack";
  const name = s.psuInc ? `${model} (con fuente ${s.psuInc})` : model;
  const vol = s.vol ?? (ax.length === 3 ? +(ax[0] * ax[1] * ax[2] / 1e6).toFixed(1) : c.vol);

  lines.push(
    `ADD(${JSON.stringify(brand)},${JSON.stringify(name)},${price},{form:${JSON.stringify(c.form)},` +
    `gpuLen:${gpuLen},coolerH:${s.cool ?? c.cool},psuLen:${s.psu ?? c.psu},psuForm:${JSON.stringify(psuForm)},` +
    `rad:${JSON.stringify(s.rad || c.rad)},fanInc:${inc},fanMax:${Math.max(s.fmax ?? c.fmax, inc)},fanSizes:[120,140],` +
    `bays35:${s.b35 ?? c.b35},bays25:${s.b25 ?? c.b25},side:${JSON.stringify(glass ? "Cristal templado" : "Acero")},` +
    `psuPos:"Inferior",frontIO:${JSON.stringify(io)},dims:${JSON.stringify(dims)},vol:${vol},` +
    `color:${JSON.stringify(color)}});`
  );
}

if (lines.length) {
  const header = `
/* ── Cajas del listado de PcComponentes (petición del usuario, ago 2026) ──
   Precio = el normal de la ficha (PVPR o el más alto), nunca el de oferta.
   Formato, cotas de GPU/disipador/fuente, radiadores, ventiladores, bahías,
   E/S, dimensiones y volumen buscados modelo a modelo; donde el fabricante
   no publica un dato se usa la cota de clase por tipo de torre. */
`;
  const anchor = "\nexport const CASE_ROWS";
  if (!src.includes(anchor)) fail(`no encuentro «export const CASE_ROWS» en ${FILE}`);
  /* Reemplazo con función: si no, un «$» en una marca o en la E/S se
     interpretaría como patrón de sustitución y corrompería el fichero. */
  writeFileSync(FILE, src.replace(anchor, () => `${header}${lines.join("\n")}\n${anchor}`));
}
/* El listado solo se reescribe si la inserción ha ido bien: cualquier fallo
   anterior aborta el proceso y deja los pendientes intactos. */
writeFileSync(listPath, nospec.length ? nospec.join("\n") + "\n" : "");
console.log(`añadidas: ${lines.length} · ya estaban: ${skipped.length} · siguen pendientes: ${nospec.length}`);
console.log(`«${listPath}» reescrito solo con las que siguen pendientes.`);
