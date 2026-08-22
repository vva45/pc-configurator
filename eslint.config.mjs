import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Suites de test heredadas del monolito: son scripts CJS de Node y no se
    // reescriben para contentar al lint (regla del proyecto: los tests no se
    // tocan para que pasen).
    "test-motor.cjs",
    "audit-catalogo.cjs",
    ".test-build/**",
  ]),
]);

export default eslintConfig;
