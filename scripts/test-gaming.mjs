import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const bundled = await build({
  stdin: { contents: 'export * from "./src/lib/gaming-estimate"; export * from "./src/data/games"; export {CPU_ROWS} from "./src/data/parts/cpu"; export {GPU_ROWS} from "./src/data/parts/gpu"; export {MBO_ROWS} from "./src/data/parts/mbo";', resolveDir: root, loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false, tsconfig: path.join(root, "tsconfig.json"), logLevel: "warning",
});
await mkdir(path.join(root, ".test-build"), { recursive: true });
const target = path.join(root, ".test-build", "gaming.cjs");
await writeFile(target, bundled.outputFiles[0].contents);
const { GAMES, CPU_GAME_INDICES, GPU_GAME_INDICES, cpuGamingKey, gpuGamingKey, fpsTone, getGamingHardware, estimateGamingFps, CPU_ROWS, GPU_ROWS, MBO_ROWS } = createRequire(import.meta.url)(target);
let checked = 0;
function check(name, task) { task(); checked++; console.log(`OK ${name}`); }
function selected(category, row) { assert.ok(row, `Missing ${category} fixture`); return { ...row, cat: category, id: category + "-test", _uid: category + "-test", qty: 1 }; }
const cpu = selected("cpu", CPU_ROWS.find((part) => part.name === "Ryzen 5 7600"));
const gpu = selected("gpu", GPU_ROWS.find((part) => /RTX 5080 Founders/.test(part.name)));
const pair = { cpu: [cpu], gpu: [gpu] };
const known = getGamingHardware(pair);
const cyberpunk = GAMES.find((game) => game.id === "1091500");
const simulate = (state, resolution = "1440", quality = "Alto", game = cyberpunk) => estimateGamingFps(game, state, resolution, quality);

check("NEXUS library includes 117 unique games and positive editorial profiles", () => {
  assert.equal(GAMES.length, 117); assert.equal(new Set(GAMES.map((game) => game.id)).size, GAMES.length);
  assert.ok(GAMES.every((game) => game.name && game.profile.cpu > 0 && game.profile.gpu > 0));
  assert.ok(GAMES.some((game) => !game.profile.specific));
});
check("Compact hardware indices are finite and positive", () => assert.ok([...Object.values(CPU_GAME_INDICES), ...Object.values(GPU_GAME_INDICES)].every((index) => Number.isFinite(index) && index > 0)));
check("CPU normalization preserves model suffixes", () => { assert.equal(cpuGamingKey("Intel Core i7-14700K"), cpuGamingKey("Core i7 14700K")); assert.notEqual(cpuGamingKey("Ryzen 5 7600"), cpuGamingKey("Ryzen 5 7600X")); });
check("X3D2 never inherits the X3D processor index", () => {
  assert.notEqual(cpuGamingKey("Ryzen 9 9950X3D2"), cpuGamingKey("Ryzen 9 9950X3D"));
  assert.equal(CPU_GAME_INDICES[cpuGamingKey("Ryzen 9 9950X3D2")], undefined);
  assert.equal(getGamingHardware({ ...pair, cpu: [{ ...cpu, name: "Ryzen 9 9950X3D2" }] }).status, "unknown");
  assert.ok(CPU_GAME_INDICES[cpuGamingKey("AMD Ryzen 9 9950X3D2 Dual Edition")] > 0);
});
check("FPS tone boundary values follow the NEXUS thresholds", () => {
  for (const value of [0, 1, 35]) assert.equal(fpsTone(value), "red");
  for (const value of [36, 75]) assert.equal(fpsTone(value), "amber");
  for (const value of [76, 240]) assert.equal(fpsTone(value), "green");
});
check("Unknown GPU suffixes cannot fall back to a known base model", () => {
  for (const name of ["RTX 5080 Ti2", "RTX 4070 SUPER2", "RTX 5080 M", "RTX 5090 D2", "RTX 5080 FUTURE"]) {
    assert.equal(gpuGamingKey({ name, vram: 16 }), undefined, name);
    const state = getGamingHardware({ ...pair, gpu: [{ ...gpu, name }] });
    assert.equal(state.status, "unknown"); assert.equal(simulate(state), null);
  }
});
check("GPU matching preserves Ti SUPER, XTX and VRAM", () => {
  assert.equal(gpuGamingKey({ name: "MSI RTX 4070 Ti SUPER Gaming", vram: 16 }), "RTX4070TISUPER|16");
  assert.equal(gpuGamingKey({ name: "AMD Radeon RX 7900 XTX", vram: 24 }), "RX7900XTX|24");
  assert.notEqual(gpuGamingKey({ name: "RTX 4060 Ti", vram: 8 }), gpuGamingKey({ name: "RTX 4060 Ti", vram: 16 }));
});
check("Mobile/OEM and silicon-only GPU descriptions are never matched", () => { for (const name of ["RTX 5080 Laptop", "RTX 5080 OEM", "GB203", "RTX 5080M", "RTX 5080 / RTX 5090"]) assert.equal(gpuGamingKey({ name, vram: 16 }), undefined); });
check("Ambiguous NEXUS family/VRAM profiles stay unavailable", () => { assert.equal(GPU_GAME_INDICES["RX5700XT|8"], undefined); assert.equal(GPU_GAME_INDICES["RTX3060TI|8"], undefined); });
check("Known CPU + GPU simulate while clearly marking incomplete assembly", () => { assert.equal(known.status, "ready"); assert.ok(known.missingComponents.length > 0); assert.match(known.message, /incompleto/); assert.ok(simulate(known).low > 0); });
check("Empty assembly and missing dedicated GPU have no FPS", () => { for (const assembly of [{}, { cpu: [cpu] }, { gpu: [gpu] }]) { const result = getGamingHardware(assembly); assert.equal(result.status, "missing"); assert.equal(simulate(result), null); } });
check("Unknown CPU never silently receives a baseline", () => { const result = getGamingHardware({ ...pair, cpu: [{ ...cpu, name: "Ryzen 5 7600 FUTURE" }] }); assert.equal(result.status, "unknown"); assert.equal(simulate(result), null); });
check("Unknown VRAM variant never inherits another card's index", () => { const result = getGamingHardware({ ...pair, gpu: [{ ...gpu, vram: 999 }] }); assert.equal(result.status, "unknown"); assert.equal(simulate(result), null); });
check("Unknown GPU family is not inferred from its shared silicon", () => { const result = getGamingHardware({ ...pair, gpu: [{ ...gpu, name: "Experimental GB203" }] }); assert.equal(result.status, "unknown"); assert.equal(simulate(result), null); });
check("A real socket conflict suppresses all FPS", () => { const mbo = selected("mbo", MBO_ROWS.find((part) => part.socket === "LGA1700")); const result = getGamingHardware({ ...pair, mbo: [mbo] }); assert.equal(result.status, "conflict"); assert.equal(simulate(result), null); });
check("All titles respond monotonically to resolution and quality", () => {
  for (const game of GAMES) {
    const fhd = simulate(known, "1080", "Ultra", game), qhd = simulate(known, "1440", "Ultra", game), uhd = simulate(known, "2160", "Ultra", game);
    assert.ok(fhd.low >= qhd.low && qhd.low >= uhd.low, game.name);
    assert.ok(fhd.high >= qhd.high && qhd.high >= uhd.high, game.name);
    const medium = simulate(known, "1440", "Medio", game), high = simulate(known, "1440", "Alto", game);
    assert.ok(medium.low >= high.low && high.low >= qhd.low, game.name);
    assert.ok(medium.high >= high.high && high.high >= qhd.high, game.name);
  }
});
check("Stronger CPU and GPU indices improve or maintain uncapped results", () => {
  const baseline = simulate(known), cpuUpgrade = simulate({ ...known, cpuIndex: known.cpuIndex * 2 }), gpuUpgrade = simulate({ ...known, gpuIndex: known.gpuIndex * 2 });
  assert.ok(cpuUpgrade.high >= baseline.high); assert.ok(gpuUpgrade.high >= baseline.high);
});
check("Game profile caps remain respected for very fast hardware", () => {
  const result = simulate({ ...known, cpuIndex: 50, gpuIndex: 50 }, "1080", "Medio", GAMES.find((game) => game.id === "1245620")); assert.equal(result.low, 60); assert.equal(result.high, 60);
});
check("Specific and genre profiles retain their visible provenance", () => { assert.equal(simulate(known).specific, true); assert.equal(simulate(known, "1440", "Alto", GAMES.find((game) => !game.profile.specific)).specific, false); });
check("Invalid runtime values fail closed", () => { assert.equal(simulate({ ...known, cpuIndex: Number.NaN }), null); assert.equal(simulate({ ...known, gpuIndex: 0 }), null); assert.equal(simulate(known, "unknown"), null); assert.equal(simulate(known, "1440", "unknown"), null); });
console.log(`Gaming simulation: ${checked} checks passed.`);

