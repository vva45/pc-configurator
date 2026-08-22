/* Genera .test-build/t.cjs, el paquete CJS que consumen test-motor.cjs y
   audit-catalogo.cjs. Dos modos:
   - "src"    → desde los módulos de src/ (vía src/test-exports.ts)
   - "legacy" → desde forge-configurador.jsx (el fichero monolítico original)
   Sin argumento usa src/ si existe test-exports.ts; si no, el monolito. */
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mode = process.argv[2] ?? "auto";
const srcEntry = path.join(root, "src", "test-exports.ts");
const useSrc = mode === "src" || (mode === "auto" && existsSync(srcEntry));
if (mode === "src" && !existsSync(srcEntry)) {
  console.error("No existe src/test-exports.ts");
  process.exit(1);
}

const legacyStdin = () => ({
  stdin: {
    contents:
      readFileSync(path.join(root, "forge-configurador.jsx"), "utf8") +
      "\nexport const __t={P,gate,runPost,calcPower,CATS,CAT,GROUPS,FILTERS,KEYSPECS,PLATFORM,REGIONS,storesFor,searchTerm};\n",
    resolveDir: root,
    loader: "jsx",
    sourcefile: "forge-configurador.jsx",
  },
});

await build({
  ...(useSrc ? { entryPoints: [srcEntry] } : legacyStdin()),
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  outfile: path.join(root, ".test-build", "t.cjs"),
  logLevel: "warning",
});
console.log(`t.cjs generado desde ${useSrc ? "src/ (modular)" : "forge-configurador.jsx (monolito)"}`);
