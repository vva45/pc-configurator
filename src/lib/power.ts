/* ═══════════════════════════════════════════════════════════════════
   CONSUMO — peor caso sostenido, carga en juego, pico transitorio y
   recomendación de fuente. Extraído sin cambios del monolito.
   ═══════════════════════════════════════════════════════════════════ */
import { list, one, type Build } from "./compat";
import type { CatId } from "@/data/parts/types";

export const PSU_SIZES = [400, 450, 500, 550, 600, 650, 700, 750, 850, 1000, 1200, 1300, 1600, 2000];

export interface PowerReport {
  detail: Record<string, number>;
  total: number;
  gaming: number;
  spike: number;
  rec: number;
  desk: number;
  target: number;
}

const USB_CATS: CatId[] = ["keyboard", "mouse", "headset", "mic", "webcam"];

export function calcPower(b: Build): PowerReport {
  const cpu = one(b, "cpu"), gpu = one(b, "gpu"), mbo = one(b, "mbo"), cool = one(b, "cooler");
  const rams = list(b, "ram"), st = list(b, "storage"), fans = list(b, "fan"), rgbs = list(b, "rgb");
  const d: Record<string, number> = {};
  d.CPU = cpu ? (cpu.ppt || cpu.tdp || 0) : 0;
  d.GPU = gpu ? gpu.tbp : 0;
  d.Placa = mbo ? (/^(X8|X6|Z8|Z7|WRX)/.test(mbo.chipset) ? 50 : 35) : 0;
  d.RAM = rams.reduce((a, r) => a + r.watt * (r.qty || 1), 0);
  d.Discos = st.reduce((a, s) => a + s.watt * (s.qty || 1), 0);
  d.Refrigeración = (cool?.watt || 0) + fans.reduce((a, f) => a + f.watt * (f.qty || 1), 0);
  d.Iluminación = rgbs.reduce((a, r) => a + r.watt * (r.qty || 1), 0) + (one(b, "hub")?.watt || 0);
  d.USB = USB_CATS.reduce((a, c) => a + (list(b, c).length ? 2.5 : 0), 0);
  // total = todo a su límite a la vez (peor caso sostenido, no consumo típico)
  const total = Math.round(Object.values(d).reduce((a, v) => a + v, 0));
  const gaming = Math.round(total * 0.8);              // carga real en juego
  // Pico transitorio: las gráficas modernas superan su TBP durante microsegundos
  const spike = gpu ? Math.round(total + gpu.tbp * 0.5) : total;
  // 25 % de margen sobre el peor caso, y nunca por debajo del mínimo del fabricante
  const target = Math.max(total > 0 ? Math.ceil(total * 1.25) : 0, gpu?.psuMin || 0);
  const rec = PSU_SIZES.find((s) => s >= target) || 2000;
  // Consumo de escritorio: va al enchufe, no a la fuente
  const desk = [...list(b, "monitor"), ...list(b, "speaker")].reduce((a, p) => a + (p.watt || 0) * (p.qty || 1), 0);
  return { detail: d, total, gaming, spike, rec, desk, target };
}
