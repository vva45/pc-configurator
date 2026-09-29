import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve(".test-build/ethernet.cjs");
const bundle = await build({
  stdin: { contents: 'export { ethernetPortCount } from "./src/lib/ethernet-ports"; export { MBO_ROWS } from "./src/data/parts/mbo";', resolveDir: process.cwd(), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false,
  tsconfig: path.resolve("tsconfig.json"), outfile: output, logLevel: "warning",
});
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, bundle.outputFiles[0].contents);
const { ethernetPortCount, MBO_ROWS } = createRequire(import.meta.url)(output);

// Expected physical counts for every LAN description currently in the catalog.
const catalogCases = new Map([
  ["5 GbE", 1],
  ["2.5 GbE", 1],
  ["1 GbE", 1],
  ["10 GbE ×2", 2],
  ["10 GbE", 1],
  ["1 GbE ×2", 2],
  ["2.5 GbE (doble puerto)", 2],
  ["1 GbE (Realtek)", 1],
  ["5 GbE + 2.5 GbE", 2],
  ["2.5 GbE (5 GbE en algunos modelos MSI de esta gama)", 1],
  ["2.5 GbE (x2)", 2],
  ["Gigabit Ethernet (1 GbE, no 2.5GbE)", 1],
  ["10 GbE (Marvell AQtion) + 2.5 GbE (Intel)", 2],
  ["1 GbE (Intel I219-V)", 1],
  ["2.5 GbE (Intel)", 1],
  ["2.5 GbE (Realtek 8125)", 1],
  ["1 GbE (Intel, en ASUS Prime H510M-A) / GbE Realtek (Gigabyte H510M H)", 1],
  ["10 GbE + 2.5 GbE (Intel)", 2],
  ["1 GbE (Realtek RTL8111H)", 1],
]);
for (const [description, expected] of catalogCases) {
  assert.equal(ethernetPortCount(description), expected, description);
}
const actualFormats = new Set(MBO_ROWS.map((part) => part.lan));
for (const description of actualFormats) {
  assert.ok(catalogCases.has(description), `Add an expected count for catalog LAN: ${description}`);
}

const edgeCases = [
  [undefined, 0], [null, 0], [false, 0], [0, 0], [[], 0], [{}, 0],
  ["", 0], ["  ", 0], ["sin", 0], ["Sin LAN", 0], ["none", 0],
  ["NONE", 0], ["no", 0], ["No disponible", 0], ["—", 0], ["–", 0], ["-", 0], ["N/A", 0],
  [" 2.5 GbE ", 1], ["Ethernet", 1], ["2.5 GbE x4", 4],
  ["2.5 GbE ×0", 0], ["2.5 GbE (x0)", 0], ["10 GbE ×2 (RJ45)", 2],
  ["1 GbE ×1, 10 GbE ×2", 3], ["1 GbE ×2 + 10 GbE ×3", 5],
  ["1 GbE ×0 + 10 GbE", 1], ["1 GbE + 10 GbE ×0", 1], ["1 GbE ×0 + 10 GbE ×0", 0],
  ["2.5 GbE (x2) + 10 GbE", 3], ["2.5 GbE (doble puerto) + 10 GbE ×0", 2],
  ["Dual 2.5 GbE", 2], ["2.5 GbE (dual)", 2], ["2.5 GbE (dual-port)", 2],
  ["Dual 2.5 GbE ×0", 0], ["2.5 GbE (dual) ×1", 1],
  ["2.5 GbE (5 GbE + 10 GbE en otros modelos)", 1],
  ["2.5 GbE (x2 en algunos modelos)", 1], ["2.5 GbE (dual en otros modelos)", 1],
  ["1 GbE / 2.5 GbE", 1], ["1 GbE ×2 / 2.5 GbE ×4", 2],
  ["1 GbE ×0 / 2.5 GbE ×4", 0], ["1 GbE + none", 1], ["N/A + 1 GbE", 1],
  ["10 GbE ×99 + 1 GbE", 24],
];
for (const [description, expected] of edgeCases) {
  assert.equal(ethernetPortCount(description), expected, String(description));
}
console.log(`Ethernet: ${catalogCases.size} formatos del catálogo y ${edgeCases.length} casos de cantidades, notas, alternativas y datos ausentes comprobados.`);
