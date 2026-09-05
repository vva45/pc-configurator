/* Genera .test-build/t.cjs, el paquete CJS que consumen test-motor.cjs y
   audit-catalogo.cjs, a partir de los módulos de src/ (vía src/test-exports.ts).
   Así las dos suites prueban exactamente el código que sirve la app. */
import { build } from "esbuild";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const root = process.cwd();

const result = await build({
  write: false,
  entryPoints: [path.join(root, "src", "test-exports.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  tsconfig: path.join(root, "tsconfig.json"),
  outfile: path.join(root, ".test-build", "t.cjs"),
  logLevel: "warning",
});
// Node writes the bundle so Windows file access is handled by the same runtime as the tests.
await mkdir(path.join(root, ".test-build"), { recursive: true });
await writeFile(path.join(root, ".test-build", "t.cjs"), result.outputFiles[0].contents);
console.log("t.cjs generado desde src/");
