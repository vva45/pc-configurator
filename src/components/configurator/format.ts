/* Utilidades de presentación compartidas por los componentes. */
import { list, one, type Build } from "@/lib/compat";

export const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const eur = (n: number | null | undefined): string =>
  n == null ? "—" : n === 0 ? "s/p" : new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);

/* Descripción del sistema en una línea, como la escribirías en un foro */
export function oneLiner(b: Build): string {
  const cpu = one(b, "cpu"), gpu = one(b, "gpu");
  const rams = list(b, "ram"), st = list(b, "storage");
  const bits: string[] = [];
  if (cpu) bits.push(cpu.name);
  if (gpu) bits.push(gpu.name.replace(/^(GeForce|Radeon)\s+/, "").replace(/\s+(Founders Edition|Limited Edition)$/, ""));
  const cap = rams.reduce((a, r) => a + r.capGB * (r.qty || 1), 0);
  if (cap) bits.push(`${cap} GB ${rams[0].memType}-${Math.max(...rams.map((r) => r.speed))}`);
  const tb = st.reduce((a, x) => a + x.capGB * (x.qty || 1), 0);
  if (tb) bits.push(tb >= 1000 ? `${+(tb / 1000).toFixed(1)} TB` : `${tb} GB`);
  return bits.join(" · ") || "Torre sin configurar";
}
