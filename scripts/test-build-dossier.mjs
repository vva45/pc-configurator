import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve(".test-build/dossier.cjs");
const bundle = await build({
  stdin: { contents: 'export * from "./src/lib/build-dossier"; export { P } from "./src/data/parts";', resolveDir: process.cwd(), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", jsx: "automatic", write: false,
  tsconfig: path.resolve("tsconfig.json"), outfile: output, logLevel: "warning",
});
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, bundle.outputFiles[0].contents);
const { createBuildDossier, dossierText, dossierSpecs, dossierDescription, P } = createRequire(import.meta.url)(output);
const pick = (id, qty = 1) => {
  const part = P.find((p) => p.id === id);
  assert.ok(part, `Fixture ${id} exists`);
  return { ...part, qty, _uid: `private-uid-${id}` };
};

const empty = createBuildDossier({});
assert.equal(empty.rows.length, 0);
assert.equal(empty.missing.length, 7);
assert.equal(empty.power.total, 0);
assert.equal(empty.post.length, 0);
assert.match(dossierText({}, "ES"), /Configuración vacía/);
assert.doesNotMatch(dossierText({}, "ES"), /Fuente sugerida.*400 W/);

const selection = { cpu: [pick("cpu-19")], ram: [pick("ram-1", 2), pick("ram-0")], storage: [pick("storage-0", 3)], monitor: [pick("monitor-0", 2)] };
const doubleSsd = createBuildDossier({ storage: [pick("storage-0", 2)], mbo: [{ ...pick("mbo-0"), m2: 2 }] });
assert.equal(doubleSsd.metrics.find((m) => m.category === "storage").value, "4 TB");
assert.ok(doubleSsd.post.some((line) => line.id === "M2_SLOTS" && line.msg.startsWith("2 de 2")));
assert.equal(doubleSsd.rows.find((row) => row.category.id === "storage").conflict.blocked, false);
const excessSsd = createBuildDossier({ storage: [pick("storage-0", 3)], mbo: [{ ...pick("mbo-0"), m2: 2 }] });
assert.equal(excessSsd.rows.find((row) => row.category.id === "storage").conflict.blocked, true);
assert.ok(excessSsd.post.some((line) => line.id === "M2_SLOTS" && line.lvl === "fail"));
const before = JSON.stringify(selection);
const sheet = createBuildDossier(selection);
assert.equal(sheet.metrics.find((m) => m.category === "ram").value, `${selection.ram.reduce((n, p) => n + p.capGB * p.qty, 0)} GB`);
assert.equal(sheet.metrics.find((m) => m.category === "storage").value, "6 TB");
assert.equal(sheet.metrics.find((m) => m.category === "storage").detail, "3 unidades · capacidad nominal");
assert.equal(sheet.total, Object.values(selection).flat().reduce((n, p) => n + p.price * p.qty, 0));
assert.ok(sheet.rows.some((row) => row.category.group === "periph"));
assert.equal(JSON.stringify(selection), before, "Dossier must not mutate selected components");
const exported = dossierText(selection, "ES");
assert.match(exported, /Samsung 990 PRO 2 TB × 3/);
assert.doesNotMatch(exported, /private-uid|_uid|\[object Object\]|undefined|NaN/);
assert.match(exported, /EUR|€/);
assert.match(exported, /Pendiente:/);

const incompatible = createBuildDossier({ cpu: [pick("cpu-19")], mbo: [pick(P.find((p) => p.cat === "mbo" && p.socket !== pick("cpu-19").socket).id)] });
assert.ok(incompatible.rows.some((row) => row.conflict.blocked));
assert.ok(incompatible.post.some((line) => line.lvl === "fail"));
const unpriced = createBuildDossier({ cpu: [{ ...pick("cpu-19"), price: 0 }] });
assert.equal(unpriced.unknownPrices, 1);
assert.match(dossierText({ cpu: [{ ...pick("cpu-19"), price: 0 }] }, "ES"), /Sin precio/);

for (const part of P) {
  const specs = dossierSpecs(part);
  assert.ok(specs.length > 0, `Specs missing: ${part.id}`);
  for (const [label, value] of specs) {
    assert.equal(typeof label, "string", part.id);
    assert.equal(typeof value, "string", `${part.id}: ${label}`);
    assert.doesNotMatch(value, /undefined|NaN|\[object Object\]/, `${part.id}: ${label}`);
  }
  assert.ok(dossierDescription(part).length > 30, part.id);
}
console.log(`Ficha técnica: estados vacío e incompleto, cantidades, precios, conflictos, exportación y ${P.length} referencias comprobados.`);

