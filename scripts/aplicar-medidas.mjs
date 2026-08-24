/* Aplica a src/data/parts/case.ts las medidas rellenadas a mano en
   docs/catalogo/medidas-que-faltan.txt:

     node scripts/aplicar-medidas.mjs [--dry]

   El fichero lleva una línea «marca|modelo|largo×ancho×alto» por caja; las
   que se dejen vacías se ignoran y conservan la estimación que tenían. El
   volumen se recalcula a partir de las medidas, que es de donde salía.

   Aborta sin tocar nada si una medida es imposible: más vale corregir la
   línea que colar una contradicción en el catálogo. */
import { readFileSync, writeFileSync } from "node:fs";

const LISTA = "docs/catalogo/medidas-que-faltan.txt";
const FILE = "src/data/parts/case.ts";
const dry = process.argv.includes("--dry");

const norm = (s) => s.toLowerCase().replace(/\+/g, "plus").replace(/[^a-z0-9]/g, "");
const fail = (m) => { console.error("✗ " + m); process.exit(1); };

/* Las medidas se aceptan con «x» o «×», con coma o punto decimal y con o sin
   el «mm» al final: se teclean a mano y no conviene ser quisquilloso. */
const medidas = new Map();
for (const [i, linea] of readFileSync(LISTA, "utf8").split("\n").entries()) {
  const t = linea.trim();
  if (!t || t.startsWith("#")) continue;
  const partes = t.split("|");
  if (partes.length !== 3) fail(`${LISTA}:${i + 1} debe tener «marca|modelo|medidas»: ${t}`);
  const [marca, modelo, cruda] = partes.map((x) => x.trim());
  if (!cruda) continue;
  const m = cruda.replace(/mm\.?$/i, "").replace(/,/g, ".").trim()
    .match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)$/i);
  if (!m) fail(`${LISTA}:${i + 1} no entiendo «${cruda}» (esperaba algo como 453×230×466)`);
  const ejes = m.slice(1).map((x) => Math.round(Number(x)));
  if (ejes.some((v) => v < 100 || v > 900))
    fail(`${LISTA}:${i + 1} ${marca} ${modelo}: ${ejes.join("×")} mm no parece una caja de PC`);
  medidas.set(norm(marca) + "|" + norm(modelo), { ejes, marca, modelo });
}

let src = readFileSync(FILE, "utf8");
const puestas = [], sinFila = [];
for (const [clave, { ejes, marca, modelo }] of medidas) {
  const re = new RegExp(`ADD\\("([^"]+)","([^"]+)",[\\d.]+,\\{[^\\n]*?\\}\\);`, "g");
  let hecho = false;
  src = src.replace(re, (fila, b, m) => {
    if (hecho || norm(b) + "|" + norm(m) !== clave) return fila;
    const dims = ejes.join("×") + " mm";
    const vol = +(ejes[0] * ejes[1] * ejes[2] / 1e6).toFixed(1);
    /* La gráfica no puede ser más larga que la arista mayor del chasis. */
    const gpu = Number((fila.match(/gpuLen:(\d+)/) || [])[1]);
    if (gpu && gpu > Math.max(...ejes))
      fail(`${marca} ${modelo}: la gráfica de ${gpu} mm no cabe en ${dims}`);
    const cool = Number((fila.match(/coolerH:(\d+)/) || [])[1]);
    if (cool && cool > Math.min(...ejes))
      fail(`${marca} ${modelo}: el disipador de ${cool} mm no cabe en ${dims}`);
    hecho = true;
    const antes = (fila.match(/dims:"([^"]+)"/) || [])[1];
    puestas.push(`${marca} ${modelo}: ${antes} → ${dims} · ${vol} L`);
    return fila.replace(/dims:"[^"]+"/, `dims:${JSON.stringify(dims)}`)
               .replace(/vol:[\d.]+/, `vol:${vol}`);
  });
  if (!hecho) sinFila.push(`${marca} ${modelo}`);
}

if (sinFila.length) {
  console.log(`\nNO ENCONTRADAS en ${FILE} (${sinFila.length}) — ¿cambió el nombre?`);
  for (const s of sinFila) console.log("  ? " + s);
}
if (!dry) writeFileSync(FILE, src);
console.log(`\nmedidas aplicadas: ${puestas.length}${dry ? "  (simulacro, sin escribir)" : ""}`);
for (const p of puestas) console.log("  ✓ " + p);
