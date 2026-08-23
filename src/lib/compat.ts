/* ═══════════════════════════════════════════════════════════════════
   MOTOR DE COMPATIBILIDAD
   gate()   → bloquea piezas incompatibles en el catálogo (tiempo real)
   runPost()→ informe completo tipo POST para el montaje actual
   Extraído sin cambios de comportamiento de forge-configurador.jsx.
   ═══════════════════════════════════════════════════════════════════ */
import type { CatId, CatMap, MemType, Part, PartOf, Socket } from "@/data/parts/types";

/* ── Sockets y plataformas ───────────────────────────────────────── */
export interface Platform { mem: MemType[]; gen: string; }
export const PLATFORM: Record<Socket, Platform> = {
  AM5: { mem: ["DDR5"], gen: "Zen 4 / Zen 5" },
  AM4: { mem: ["DDR4"], gen: "Zen 1–3" },
  "AM3+": { mem: ["DDR3"], gen: "Bulldozer / Piledriver" },
  sTR5: { mem: ["DDR5-RDIMM"], gen: "Threadripper 7000" },
  LGA1851: { mem: ["DDR5"], gen: "Core Ultra 200S" },
  LGA1700: { mem: ["DDR4", "DDR5"], gen: "12ª–14ª gen" },
  LGA1200: { mem: ["DDR4"], gen: "10ª–11ª gen" },
  LGA1151v2: { mem: ["DDR4"], gen: "8ª–9ª gen" },
  LGA1151: { mem: ["DDR4"], gen: "6ª–7ª gen" },
  LGA1150: { mem: ["DDR3"], gen: "4ª–5ª gen (Haswell)" },
  LGA1155: { mem: ["DDR3"], gen: "2ª–3ª gen (Sandy/Ivy)" },
  "LGA2011-v3": { mem: ["DDR4"], gen: "Haswell-E / Broadwell-E" },
  LGA2066: { mem: ["DDR4"], gen: "Core X (Skylake-X)" },
  LGA775: { mem: ["DDR2"], gen: "Core 2 / Pentium 4" },
  LGA1366: { mem: ["DDR3"], gen: "1ª gen (Nehalem/Westmere)" },
  LGA1156: { mem: ["DDR3"], gen: "1ª gen (Lynnfield/Clarkdale)" },
  LGA2011: { mem: ["DDR3"], gen: "HEDT (Sandy/Ivy Bridge-E)" },
  sTRX4: { mem: ["DDR4"], gen: "Threadripper 3000" },
  "FM2+": { mem: ["DDR3"], gen: "APU A-Series" },
  DIP16: { mem: [], gen: "Histórico" },
};

/* Grupos de socket para los anclajes de disipador */
export const I_LGA115X: Socket[] = ["LGA1200", "LGA1151v2", "LGA1151", "LGA1150", "LGA1155"];
export const I_MOD: Socket[] = ["LGA1851", "LGA1700"];
export const I_ALL: Socket[] = [...I_MOD, ...I_LGA115X];
export const A_MOD: Socket[] = ["AM5", "AM4"];
export const A_ALL: Socket[] = [...A_MOD, "FM2+", "AM3+"];
export const I_HEDT: Socket[] = ["LGA2066", "LGA2011-v3"];
export const UNIV: Socket[] = [...I_ALL, ...A_ALL];
export const UNIV_MOD: Socket[] = [...I_MOD, ...A_MOD, "LGA1200", "LGA1151v2"];

/* ── El montaje ──────────────────────────────────────────────────── */
/* El motor admite pieza suelta o lista por categoría (los tests usan ambas).
   La app siempre guarda listas de piezas elegidas (Picked). */
export type BuildItem<P extends Part = Part> = P & { qty?: number; _uid?: string };
export type Build = { [K in CatId]?: BuildItem<CatMap[K]> | BuildItem<CatMap[K]>[] };
export type Picked<P extends Part = Part> = P & { qty: number; _uid: string };
export type AppBuild = { [K in CatId]?: Picked<CatMap[K]>[] };

export const one = <K extends CatId>(b: Build, c: K): BuildItem<CatMap[K]> | undefined => {
  // TS no estrecha Build[K] con un K genérico: la aserción fija el tipo por categoría.
  const v = b[c] as unknown as BuildItem<CatMap[K]> | BuildItem<CatMap[K]>[] | undefined;
  return Array.isArray(v) ? v[0] : v;
};
export const list = <K extends CatId>(b: Build, c: K): BuildItem<CatMap[K]>[] => {
  const v = b[c] as unknown as BuildItem<CatMap[K]> | BuildItem<CatMap[K]>[] | undefined;
  return Array.isArray(v) ? v : v ? [v] : [];
};
export const maxRad = (cs: PartOf<"case"> | undefined): number =>
  cs?.rad ? Math.max(...Object.values(cs.rad)) : 0;
export const radFits = (cs: PartOf<"case"> | undefined, size: number): boolean =>
  cs?.rad ? Object.values(cs.rad).some((v) => v >= size) : false;

export interface GateResult { blocked: boolean; reason?: string; }

export function gate(part: Part, b: Build): GateResult {
  const no = (r: string): GateResult => ({ blocked: true, reason: r });
  const cpu = one(b, "cpu"), mbo = one(b, "mbo"), cs = one(b, "case"),
        cool = one(b, "cooler"), gpu = one(b, "gpu"), psu = one(b, "psu");
  const rams = list(b, "ram");

  switch (part.cat) {
    case "cpu":
      if (mbo && part.socket !== mbo.socket) return no(`Socket ${part.socket} ≠ ${mbo.socket} de la placa`);
      if (!mbo && rams[0] && part.mem?.length && !part.mem.includes(rams[0].memType))
        return no(`No soporta ${rams[0].memType}`);
      if (cool && !cool.sockets?.includes(part.socket)) return no(`El disipador no cubre ${part.socket}`);
      break;
    case "mbo":
      if (cpu && part.socket !== cpu.socket) return no(`Socket ${part.socket} ≠ ${cpu.socket} de la CPU`);
      if (rams[0] && part.memType !== rams[0].memType) return no(`Placa ${part.memType}, RAM ${rams[0].memType}`);
      if (cs && !cs.form.includes(part.form)) return no(`${part.form} no cabe en ${cs.name}`);
      if (cool && !cool.sockets?.includes(part.socket)) return no(`El disipador no cubre ${part.socket}`);
      break;
    case "ram": {
      const ref = mbo?.memType || (cpu?.mem?.length === 1 ? cpu.mem[0] : null);
      if (ref && part.memType !== ref) return no(`${part.memType} ≠ ${ref} del sistema`);
      if (cpu && cpu.mem?.length && !cpu.mem.includes(part.memType)) return no(`La CPU no soporta ${part.memType}`);
      if (mbo) {
        const used = rams.reduce((a, r) => a + r.kit * (r.qty || 1), 0);
        if (used + part.kit > mbo.dimm) return no(`Sin slots libres (${mbo.dimm} DIMM)`);
      }
      if (cool && !cool.radSize) {
        const over = part.height - cool.ramClear;
        if (over > (cool.fanRaise || 0))
          return no(`${part.height} mm de alto; el ${cool.name} deja ${cool.ramClear} mm`);
        if (over > 0 && cs && cool.height + over > cs.coolerH)
          return no(`Subiendo el ventilador el disipador llega a ${cool.height + over} mm y no cabe`);
      }
      break;
    }
    case "cooler": {
      const sock = cpu?.socket || mbo?.socket;
      if (sock && !part.sockets?.includes(sock)) return no(`No compatible con ${sock}`);
      if (cs) {
        if (part.radSize && !radFits(cs, part.radSize)) return no(`Radiador ${part.radSize} mm no cabe (máx ${maxRad(cs)} mm)`);
        if (!part.radSize && part.height > cs.coolerH) return no(`${part.height} mm > ${cs.coolerH} mm de la caja`);
      }
      if (cpu && part.tdpRated < (cpu.ppt || cpu.tdp)) return no(`${part.tdpRated} W < ${cpu.ppt || cpu.tdp} W de la CPU`);
      if (rams[0] && !part.radSize) {
        const over = rams[0].height - part.ramClear;
        if (over > (part.fanRaise || 0))
          return no(`Choca con la RAM (${rams[0].height} mm > ${part.ramClear} mm libres)`);
        if (over > 0 && cs && part.height + over > cs.coolerH)
          return no(`Con la RAM alta subiría a ${part.height + over} mm y la caja da ${cs.coolerH} mm`);
      }
      break;
    }
    case "gpu":
      if (cs && part.len > cs.gpuLen) return no(`${part.len} mm > ${cs.gpuLen} mm de la caja`);
      break;
    case "psu":
      if (cs && !cs.psuForm.includes(part.form)) return no(`Formato ${part.form} no admitido por la caja`);
      if (cs && part.len > cs.psuLen) return no(`${part.len} mm > ${cs.psuLen} mm de la caja`);
      if (gpu && part.watt < gpu.psuMin) return no(`${part.watt} W < ${gpu.psuMin} W mínimos de la gráfica`);
      break;
    case "case":
      if (mbo && !part.form.includes(mbo.form)) return no(`No admite ${mbo.form}`);
      if (gpu && gpu.len > part.gpuLen) return no(`Gráfica de ${gpu.len} mm > ${part.gpuLen} mm`);
      if (cool) {
        if (cool.radSize && !radFits(part, cool.radSize)) return no(`Sin sitio para radiador de ${cool.radSize} mm`);
        if (!cool.radSize && cool.height > part.coolerH) return no(`Disipador de ${cool.height} mm > ${part.coolerH} mm`);
      }
      if (psu && (!part.psuForm.includes(psu.form) || psu.len > part.psuLen)) return no(`No admite la fuente elegida`);
      break;
    case "storage":
      if (mbo) {
        if (part.iface.startsWith("M.2") && mbo.m2 === 0) return no("La placa no tiene ranuras M.2");
        if (part.iface.startsWith("SATA") && mbo.sata === 0) return no("La placa no tiene puertos SATA");
      }
      break;
    case "fan":
      if (cs && !cs.fanSizes.includes(part.size)) return no(`La caja no admite ${part.size} mm`);
      break;
    default: break;
  }
  return { blocked: false };
}

export const POST_CODES = {
  SOCKET: "0x01", CPU_MEM: "0x02", MEM_TYPE: "0x03", MEM_SLOTS: "0x04", MEM_SPEED: "0x05",
  MEM_CAP: "0x06", COOL_SOCK: "0x10", COOL_TDP: "0x11", COOL_HEIGHT: "0x12", COOL_RAM: "0x13",
  RAD_FIT: "0x14", GPU_LEN: "0x20", GPU_PWR: "0x21", MBO_FORM: "0x30", PSU_FORM: "0x31",
  PSU_LEN: "0x32", PSU_LOAD: "0x33", PSU_CONN: "0x34", M2_SLOTS: "0x40", SATA_PORTS: "0x41",
  FAN_FIT: "0x50", FAN_HDR: "0x51", RGB_HDR: "0x52", MISC: "0xFF",
} as const;

export type PostId = keyof typeof POST_CODES;
export type PostLevel = "ok" | "warn" | "fail";
export interface PostLine { lvl: PostLevel; code: string; id: PostId; msg: string; }

export function runPost(b: Build, power: { total: number }): PostLine[] {
  const L: PostLine[] = [];
  const push = (lvl: PostLevel, id: PostId, msg: string) =>
    L.push({ lvl, code: POST_CODES[id] || "0x??", id, msg });
  const cpu = one(b, "cpu"), mbo = one(b, "mbo"), cs = one(b, "case"), cool = one(b, "cooler"),
        gpu = one(b, "gpu"), psu = one(b, "psu");
  const rams = list(b, "ram"), st = list(b, "storage"), fans = list(b, "fan"),
        rgbs = list(b, "rgb"), hub = one(b, "hub");

  if (cpu && mbo) {
    if (cpu.socket === mbo.socket) push("ok", "SOCKET", `${cpu.socket} ←→ ${cpu.socket}`);
    else push("fail", "SOCKET", `CPU ${cpu.socket} contra placa ${mbo.socket}`);
  }
  if (cpu && mbo && cpu.mem?.length) {
    if (cpu.mem.includes(mbo.memType)) push("ok", "CPU_MEM", `La CPU soporta ${mbo.memType}`);
    else push("fail", "CPU_MEM", `La CPU no soporta ${mbo.memType}`);
  }

  if (rams.length && mbo) {
    const bad = rams.filter((r) => r.memType !== mbo.memType);
    if (bad.length) push("fail", "MEM_TYPE", `${bad.length} módulo(s) ${bad[0].memType} en placa ${mbo.memType}`);
    else push("ok", "MEM_TYPE", `${mbo.memType} ←→ ${mbo.memType}`);
    const sticks = rams.reduce((a, r) => a + r.kit * (r.qty || 1), 0);
    if (sticks <= mbo.dimm) push("ok", "MEM_SLOTS", `${sticks}/${mbo.dimm} DIMM ocupados`);
    else push("fail", "MEM_SLOTS", `${sticks} módulos para ${mbo.dimm} slots`);
    const cap = rams.reduce((a, r) => a + r.capGB * (r.qty || 1), 0);
    if (cap <= mbo.memMaxGB) push("ok", "MEM_CAP", `${cap} GB / ${mbo.memMaxGB} GB máximos`);
    else push("fail", "MEM_CAP", `${cap} GB supera el máximo de ${mbo.memMaxGB} GB`);
    const fastest = Math.max(...rams.map((r) => r.speed));
    if (fastest > mbo.memOC) push("warn", "MEM_SPEED", `${fastest} MT/s por encima del OC validado (${mbo.memOC})`);
    else if (cpu?.memMax && fastest > cpu.memMax) push("warn", "MEM_SPEED", `${fastest} MT/s exige perfil ${rams[0].profile}; JEDEC de la CPU: ${cpu.memMax}`);
    else push("ok", "MEM_SPEED", `${fastest} MT/s dentro de especificación`);
    if (sticks === 4 && rams[0].memType === "DDR5")
      push("warn", "MEM_SPEED", "4 módulos DDR5: es habitual bajar frecuencia para estabilizar");
  }

  if (cool) {
    const sock = cpu?.socket || mbo?.socket;
    if (sock) {
      if (cool.sockets?.includes(sock)) push("ok", "COOL_SOCK", `Anclaje ${sock} incluido`);
      else push("fail", "COOL_SOCK", `Sin anclaje para ${sock}`);
    }
    if (cpu) {
      const need = cpu.ppt || cpu.tdp;
      if (cool.tdpRated >= need) push("ok", "COOL_TDP", `${cool.tdpRated} W ≥ ${need} W de disipación`);
      else push("fail", "COOL_TDP", `${cool.tdpRated} W para una CPU de ${need} W`);
      if (cool.tdpRated >= need && cool.tdpRated < need * 1.2)
        push("warn", "COOL_TDP", "Margen térmico justo: espera throttling en carga sostenida");
    }
    if (cs) {
      if (cool.radSize) {
        if (radFits(cs, cool.radSize)) push("ok", "RAD_FIT", `Radiador ${cool.radSize} mm alojado`);
        else push("fail", "RAD_FIT", `Radiador ${cool.radSize} mm; la caja admite ${maxRad(cs)} mm`);
      } else if (cool.height <= cs.coolerH) push("ok", "COOL_HEIGHT", `${cool.height} mm / ${cs.coolerH} mm libres`);
      else push("fail", "COOL_HEIGHT", `${cool.height} mm > ${cs.coolerH} mm`);
    }
    if (rams[0] && !cool.radSize) {
      const over = rams[0].height - cool.ramClear;
      if (over <= 0) push("ok", "COOL_RAM", `RAM de ${rams[0].height} mm bajo el disipador`);
      else if (over <= (cool.fanRaise || 0))
        push("warn", "COOL_RAM", `RAM de ${rams[0].height} mm: hay que subir el ventilador ${over} mm, el disipador pasa a ${cool.height + over} mm`);
      else push("fail", "COOL_RAM", `RAM de ${rams[0].height} mm; solo ${cool.ramClear} mm libres`);
    }
  }

  if (gpu && cs) {
    if (gpu.len > cs.gpuLen) push("fail", "GPU_LEN", `${gpu.len} mm > ${cs.gpuLen} mm`);
    else if (cs.gpuLenRad && (cool?.radSize ?? 0) >= 240 && gpu.len > cs.gpuLenRad)
      push("warn", "GPU_LEN", `Cabe (${gpu.len}/${cs.gpuLen} mm), pero con el radiador delante el límite baja a ${cs.gpuLenRad} mm: móntalo arriba`);
    else push("ok", "GPU_LEN", `${gpu.len} mm / ${cs.gpuLen} mm`);
  }
  if (mbo && cs) {
    if (cs.form.includes(mbo.form)) push("ok", "MBO_FORM", `${mbo.form} en ${cs.name}`);
    else push("fail", "MBO_FORM", `${cs.name} no admite ${mbo.form}`);
  }
  if (psu && cs) {
    if (cs.psuForm.includes(psu.form)) push("ok", "PSU_FORM", `Formato ${psu.form} admitido`);
    else push("fail", "PSU_FORM", `La caja no admite ${psu.form}`);
    if (psu.len <= cs.psuLen) push("ok", "PSU_LEN", `${psu.len} mm / ${cs.psuLen} mm`);
    else push("fail", "PSU_LEN", `Fuente de ${psu.len} mm; caben ${cs.psuLen} mm`);
  }
  if (psu) {
    const load = power.total, pct = Math.round((load / psu.watt) * 100);
    if (load > psu.watt) push("fail", "PSU_LOAD", `${load} W estimados sobre una fuente de ${psu.watt} W`);
    else if (pct > 85) push("warn", "PSU_LOAD", `${pct}% de carga: sin margen para picos ni ampliaciones`);
    else push("ok", "PSU_LOAD", `${load} W → ${pct}% de ${psu.watt} W`);
    if (gpu) {
      if (psu.watt < gpu.psuMin) push("fail", "PSU_LOAD", `El fabricante pide ${gpu.psuMin} W mínimos`);
      if (gpu.hpwr) {
        if (psu.pcie5 > 0) push("ok", "PSU_CONN", "Conector 12V-2×6 nativo disponible");
        else push("warn", "PSU_CONN", "Sin 12V-2×6 nativo: usarás el adaptador de la gráfica");
        if (psu.atx === "ATX 2.4") push("warn", "PSU_CONN", "Fuente pre-ATX 3.0: sin tolerancia de picos definida");
      } else if ((gpu.conn8 || 0) + (gpu.conn6 || 0) === 0) {
        push("ok", "PSU_CONN", "La gráfica se alimenta por la ranura PCIe, sin cable extra");
      } else {
        const need = (gpu.conn8 || 0) + (gpu.conn6 || 0);
        const have = psu.pcie8 || 0;
        if (have >= need) push("ok", "PSU_CONN", `${gpu.power} · la fuente ofrece ${have} cable(s) PCIe`);
        else push("fail", "PSU_CONN", `La gráfica pide ${gpu.power} y la fuente da ${have} cable(s) PCIe`);
      }
    }
  }
  if (mbo && st.length) {
    const m2 = st.filter((s) => s.iface.startsWith("M.2")).length;
    const sata = st.filter((s) => s.iface.startsWith("SATA")).length;
    if (m2) {
      if (m2 <= mbo.m2) push("ok", "M2_SLOTS", `${m2}/${mbo.m2} ranuras M.2`);
      else push("fail", "M2_SLOTS", `${m2} unidades M.2 para ${mbo.m2} ranuras`);
    }
    if (sata) {
      if (sata <= mbo.sata) push("ok", "SATA_PORTS", `${sata}/${mbo.sata} puertos SATA`);
      else push("fail", "SATA_PORTS", `${sata} unidades SATA para ${mbo.sata} puertos`);
    }
    if (m2 >= 3 && mbo.sata <= 4) push("warn", "SATA_PORTS", "Muchas M.2 pobladas: en esta placa suelen deshabilitar puertos SATA");
    const g5 = st.filter((s) => s.gen.includes("5.0")).length;
    if (g5 > (mbo.m2gen5 || 0)) push("warn", "M2_SLOTS", `${g5} SSD PCIe 5.0 pero solo ${mbo.m2gen5 || 0} ranura(s) Gen5: irán a Gen4`);
  }
  if (cs && fans.length) {
    const q = fans.reduce((a, f) => a + (f.qty || 1), 0);
    const bad = fans.filter((f) => !cs.fanSizes.includes(f.size));
    if (bad.length) push("fail", "FAN_FIT", `Ventilador de ${bad[0].size} mm no admitido`);
    else push("ok", "FAN_FIT", `${q} ventilador(es) sobre ${cs.fanMax} posiciones`);
    if (q > cs.fanMax) push("fail", "FAN_FIT", `${q} ventiladores para ${cs.fanMax} posiciones`);
  }
  if (mbo && fans.length) {
    const q = fans.reduce((a, f) => a + (f.qty || 1), 0) + (cool?.fans || 0);
    if (q > mbo.fanHdr && !hub) push("warn", "FAN_HDR", `${q} ventiladores contra ${mbo.fanHdr} cabeceras: añade un hub`);
    else if (hub) push("ok", "FAN_HDR", `Hub de ${hub.ports} puertos cubre ${q} ventiladores`);
    else push("ok", "FAN_HDR", `${q}/${mbo.fanHdr} cabeceras de ventilador`);
  }
  if (mbo && rgbs.length) {
    const needsCtl = rgbs.filter((r) => r.conn.includes("Controladora")).length;
    if (needsCtl && !hub?.rgb) push("warn", "RGB_HDR", `${needsCtl} tira(s) exigen controladora propietaria`);
    else if (rgbs.length > mbo.rgbHdr && !hub?.rgb) push("warn", "RGB_HDR", `${rgbs.length} tiras para ${mbo.rgbHdr} cabeceras ARGB`);
    else push("ok", "RGB_HDR", `Iluminación con cabeceras suficientes`);
  }
  if (cpu && !gpu && !cpu.igpu) push("fail", "MISC", "La CPU no lleva gráfica integrada: hace falta una tarjeta");
  if (cpu?.museum) push("warn", "MISC", "Pieza histórica: catalogada como referencia, no para montar");
  if (cpu?.unlocked === false && mbo?.chipset?.match(/^(Z|X)/)) push("warn", "MISC", "CPU con multiplicador bloqueado sobre chipset de overclock");
  if (cpu?.x3d && cool && cool.tdpRated < 200) push("warn", "MISC", "Los X3D son sensibles a la temperatura: recomendable más disipación");

  return L;
}
