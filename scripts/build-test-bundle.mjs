/* Genera .test-build/t.cjs, el paquete CJS que consumen test-motor.cjs y
   audit-catalogo.cjs, a partir de los módulos de src/ (vía src/test-exports.ts).
   Así las dos suites prueban exactamente el código que sirve la app. */
import { build } from "esbuild";
import path from "node:path";

const root = process.cwd();

await build({
  entryPoints: [path.join(root, "src", "test-exports.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  tsconfig: path.join(root, "tsconfig.json"),
  outfile: path.join(root, ".test-build", "t.cjs"),
  logLevel: "warning",
});
console.log("t.cjs generado desde src/");
