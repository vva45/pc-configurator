/* ═══════════════════════════════════════════════════════════════════
   FILTROS — declarativos por categoría
   enum=chips · range=deslizador · bool=sí/no · has=tiene/no tiene
   KEYSPECS: resumen corto para las tarjetas. matches(): aplica filtros.
   ═══════════════════════════════════════════════════════════════════ */
import type { CatId, CatMap, Part } from "@/data/parts/types";

export type FilterType = "enum" | "range" | "bool" | "has";
export interface FilterDef { k: string; label: string; type: FilterType; unit?: string; }

const F = (k: string, label: string, type: FilterType, unit?: string): FilterDef => ({ k, label, type, unit });

export const FILTERS: Record<CatId, FilterDef[]> = {
  cpu: [F("brand", "Marca", "enum"), F("socket", "Socket", "enum"), F("family", "Generación", "enum"),
    F("cores", "Núcleos", "range"), F("threads", "Hilos", "range"), F("boost", "Turbo", "range", "GHz"),
    F("base", "Frecuencia base", "range", "GHz"), F("l3", "Caché L3", "range", "MB"), F("tdp", "TDP", "range", "W"),
    F("ppt", "Consumo máx.", "range", "W"), F("lith", "Litografía", "enum"), F("year", "Año", "range"),
    F("unlocked", "Multiplicador libre", "bool"), F("x3d", "3D V-Cache", "bool"),
    F("cooler", "Disipador incluido", "bool"), F("igpu", "Gráfica integrada", "has"), F("apu", "APU", "bool"), F("hedt", "HEDT", "bool")],
  mbo: [F("brand", "Marca", "enum"), F("socket", "Socket", "enum"), F("chipset", "Chipset", "enum"),
    F("form", "Formato", "enum"), F("memType", "Tipo de memoria", "enum"), F("dimm", "Slots DIMM", "range"),
    F("memMaxGB", "RAM máxima", "range", "GB"), F("memOC", "Memoria OC máx.", "range", "MT/s"),
    F("m2", "Ranuras M.2", "range"), F("m2gen5", "M.2 PCIe 5.0", "range"), F("sata", "Puertos SATA", "range"),
    F("lan", "Red cableada", "enum"), F("wifi", "Wi-Fi", "enum"), F("audio", "Códec de audio", "enum"),
    F("usbC", "USB-C trasero", "enum"), F("fanHdr", "Cabeceras ventilador", "range"),
    F("rgbHdr", "Cabeceras ARGB", "range"), F("tb", "Thunderbolt / USB4", "bool"),
    F("bios_flashback", "BIOS Flashback", "bool")],
  ram: [F("brand", "Marca", "enum"), F("memType", "Tecnología", "enum"), F("capGB", "Capacidad total", "range", "GB"),
    F("perStick", "Por módulo", "range", "GB"), F("kit", "Módulos del kit", "range"),
    F("speed", "Frecuencia", "range", "MT/s"), F("cl", "Latencia CL", "range"), F("volt", "Voltaje", "range", "V"),
    F("profile", "Perfil", "enum"), F("height", "Altura", "range", "mm"), F("rank", "Rango", "enum"),
    F("die", "Die", "enum"), F("rgb", "RGB", "bool")],
  gpu: [F("brand", "Marca", "enum"), F("chip", "GPU", "enum"), F("vram", "VRAM", "range", "GB"),
    F("vtype", "Tipo de VRAM", "enum"), F("bus", "Bus", "range", "bit"), F("tbp", "Consumo", "range", "W"),
    F("len", "Longitud", "range", "mm"), F("slots", "Slots", "range"), F("pcie", "Interfaz", "enum"),
    F("psuMin", "Fuente mínima", "range", "W"), F("boost", "Boost", "range", "GHz"), F("year", "Año", "range"), F("seg", "Segmento", "enum"), F("hpwr", "Conector 12V-2×6", "bool")],
  storage: [F("brand", "Marca", "enum"), F("iface", "Interfaz", "enum"), F("gen", "Bus", "enum"),
    F("capGB", "Capacidad", "range", "GB"), F("read", "Lectura", "range", "MB/s"), F("write", "Escritura", "range", "MB/s"),
    F("tbw", "Resistencia", "range", "TBW"), F("nand", "Memoria", "enum"), F("seg", "Uso", "enum"), F("watt", "Consumo", "range", "W"),
    F("dram", "Caché DRAM", "bool"), F("heatsink", "Disipador incluido", "bool")],
  psu: [F("brand", "Marca", "enum"), F("watt", "Potencia", "range", "W"), F("eff", "Certificación", "enum"),
    F("atx", "Norma ATX", "enum"), F("form", "Formato", "enum"), F("len", "Profundidad", "range", "mm"),
    F("modular", "Modularidad", "enum"), F("pcie5", "Conectores 12V-2×6", "range"),
    F("pcie8", "Conectores PCIe 8p", "range"), F("eps", "Conectores EPS", "range"), F("sata", "Conectores SATA", "range"),
    F("warranty", "Garantía", "range", "años"), F("cert", "Certificación Cybenetics", "enum"), F("zero", "Modo semi-fanless", "bool")],
  case: [F("brand", "Marca", "enum"), F("gpuLen", "Gráfica máx.", "range", "mm"), F("gpuLenRad", "Gráfica con radiador frontal", "range", "mm"), F("coolerH", "Disipador máx.", "range", "mm"),
    F("psuLen", "Fuente máx.", "range", "mm"), F("fanMax", "Ventiladores máx.", "range"),
    F("fanInc", "Ventiladores incluidos", "range"), F("bays35", "Bahías 3,5\"", "range"),
    F("bays25", "Bahías 2,5\"", "range"), F("vol", "Volumen", "range", "L"), F("side", "Lateral", "enum"),
    F("psuPos", "Posición de la fuente", "enum"), F("color", "Color", "enum"), F("frontIO", "Panel frontal", "enum")],
  cooler: [F("brand", "Marca", "enum"), F("type", "Tipo", "enum"), F("height", "Altura", "range", "mm"),
    F("radSize", "Radiador", "range", "mm"), F("tdpRated", "Disipación", "range", "W"),
    F("fans", "Ventiladores", "range"), F("fanSize", "Tamaño ventilador", "range", "mm"),
    F("noise", "Ruido máx.", "range", "dBA"), F("ramClear", "Espacio para RAM", "range", "mm"), F("fanRaise", "Margen subiendo el ventilador", "range", "mm"),
    F("warranty", "Garantía", "range", "años"), F("rgb", "RGB", "bool"), F("stock", "De serie con la CPU", "bool")],
  fan: [F("brand", "Marca", "enum"), F("size", "Tamaño", "range", "mm"), F("rpm", "RPM máx.", "range"),
    F("cfm", "Caudal", "range", "CFM"), F("mmH2O", "Presión estática", "range", "mmH₂O"),
    F("noise", "Ruido", "range", "dBA"), F("conn", "Conector", "enum"), F("bearing", "Rodamiento", "enum"),
    F("rgb", "RGB", "bool")],
  hub: [F("brand", "Marca", "enum"), F("ports", "Puertos", "range"), F("power", "Alimentación", "enum"),
    F("pwm", "Control PWM", "bool"), F("rgb", "Canales RGB", "bool")],
  paste: [F("brand", "Marca", "enum"), F("cond", "Conductividad", "range", "W/mK"), F("type", "Composición", "enum"),
    F("grams", "Cantidad", "range", "g"), F("elec", "Conductivo eléctricamente", "bool")],
  rgb: [F("brand", "Marca", "enum"), F("len", "Longitud", "range", "mm"), F("leds", "LEDs", "range"),
    F("type", "Tecnología", "enum"), F("conn", "Conexión", "enum"), F("adhesive", "Adhesivo", "bool")],
  cable: [F("brand", "Marca", "enum"), F("kind", "Tipo", "enum"), F("pieces", "Unidades", "range"),
    F("len", "Longitud", "range", "mm"), F("color", "Color", "enum"), F("combs", "Peines incluidos", "bool")],
  monitor: [F("brand", "Marca", "enum"), F("size", "Diagonal", "range", "\""), F("res", "Resolución", "enum"),
    F("panel", "Panel", "enum"), F("hz", "Refresco", "range", "Hz"), F("gtg", "Respuesta", "range", "ms"),
    F("sync", "Sincronización", "enum"), F("hdr", "HDR", "enum"), F("nits", "Brillo", "range", "nits"),
    F("ratio", "Relación", "enum"), F("curve", "Curvatura", "has"), F("watt", "Consumo", "range", "W")],
  keyboard: [F("brand", "Marca", "enum"), F("layout", "Formato", "enum"), F("switches", "Interruptores", "enum"),
    F("conn", "Conexión", "enum"), F("kc", "Teclas", "enum"), F("case", "Chasis", "enum"),
    F("rot", "Tasa de sondeo", "range", "Hz"), F("hotswap", "Hot-swap", "bool"), F("rgb", "RGB", "bool")],
  mouse: [F("brand", "Marca", "enum"), F("sensor", "Sensor", "enum"), F("dpi", "DPI máx.", "range"),
    F("weight", "Peso", "range", "g"), F("buttons", "Botones", "range"), F("conn", "Conexión", "enum"),
    F("shape", "Forma", "enum"), F("bat", "Autonomía", "range", "h"), F("rgb", "RGB", "bool")],
  pad: [F("brand", "Marca", "enum"), F("w", "Ancho", "range", "mm"), F("h", "Alto", "range", "mm"),
    F("thick", "Grosor", "range", "mm"), F("surface", "Superficie", "enum"), F("base", "Base", "enum"),
    F("stitch", "Bordes cosidos", "bool"), F("rgb", "RGB", "bool"), F("washable", "Lavable", "bool")],
  headset: [F("brand", "Marca", "enum"), F("type", "Tipo", "enum"), F("drivers", "Transductores", "range", "mm"),
    F("imp", "Impedancia", "range", "Ω"), F("weight", "Peso", "range", "g"), F("conn", "Conexión", "enum"),
    F("wireless", "Inalámbrico", "bool"), F("anc", "Cancelación activa", "bool"), F("mic", "Micrófono", "bool")],
  mic: [F("brand", "Marca", "enum"), F("type", "Cápsula", "enum"), F("conn", "Conexión", "enum"),
    F("rate", "Muestreo", "enum"), F("arm", "Brazo incluido", "bool")],
  webcam: [F("brand", "Marca", "enum"), F("res", "Resolución", "enum"), F("sensor", "Sensor", "enum"),
    F("fov", "Campo de visión", "enum"), F("af", "Autoenfoque", "bool"), F("mic", "Micrófono", "bool")],
  speaker: [F("brand", "Marca", "enum"), F("type", "Configuración", "enum"), F("power", "Potencia", "range", "W"),
    F("conn", "Conexión", "enum"), F("sub", "Subwoofer", "bool"), F("bt", "Bluetooth", "bool")],
};

/* ── Resumen corto para las tarjetas ─────────────────────────────── */
type KeySpecEntry = string | number | false | null | undefined;
export const KEYSPECS: { [K in CatId]: (p: CatMap[K]) => KeySpecEntry[] } = {
  cpu: (p) => [`${p.cores}C/${p.threads}T`, `${p.boost} GHz`, `${p.l3} MB L3`, `${p.ppt || p.tdp} W`, p.socket],
  mbo: (p) => [p.socket, p.chipset, p.form, p.memType, `${p.m2}× M.2`],
  ram: (p) => [p.memType, `${p.capGB} GB (${p.kit}×${p.perStick})`, `${p.speed} MT/s`, `CL${p.cl}`, p.profile],
  gpu: (p) => [`${p.vram} GB ${p.vtype}`, `${p.tbp} W`, `${p.len} mm`, `${p.slots} slots`],
  storage: (p) => [p.iface.split(" ")[0], `${p.capGB >= 1000 ? p.capGB / 1000 + " TB" : p.capGB + " GB"}`, `${p.read} MB/s`, p.gen],
  psu: (p) => [`${p.watt} W`, p.eff, p.form, p.atx, `${p.len} mm`],
  case: (p) => [p.form[0], `GPU ${p.gpuLen} mm`, `Aire ${p.coolerH} mm`, `${p.vol} L`],
  cooler: (p) => [p.type, p.radSize ? `${p.radSize} mm` : `${p.height} mm`, `${p.tdpRated} W`, `${p.noise} dBA`],
  fan: (p) => [`${p.size} mm`, `${p.rpm} rpm`, `${p.cfm} CFM`, `${p.noise} dBA`],
  hub: (p) => [`${p.ports} puertos`, p.power, p.rgb ? "ARGB" : "Solo PWM"],
  paste: (p) => [`${p.cond} W/mK`, p.type, `${p.grams} g`],
  rgb: (p) => [`${p.len} mm`, `${p.leds} LED`, p.type],
  cable: (p) => [p.kind, `${p.pieces} uds.`, p.color],
  monitor: (p) => [`${p.size}"`, p.res, p.panel, `${p.hz} Hz`, `${p.gtg} ms`],
  keyboard: (p) => [p.layout, p.switches, p.conn.split(" +")[0]],
  mouse: (p) => [`${p.weight} g`, `${p.dpi} DPI`, p.conn.split(" +")[0]],
  pad: (p) => [`${p.w}×${p.h} mm`, p.surface],
  headset: (p) => [p.type, `${p.drivers} mm`, p.wireless ? "Inalámbrico" : "Cableado"],
  mic: (p) => [p.type, p.conn, p.rate],
  webcam: (p) => [p.res, p.fov],
  speaker: (p) => [p.type, `${p.power} W`],
};

/* KEYSPECS[p.cat](p) con la unión correlada: TS no la resuelve solo. */
export function keyspecsFor(p: Part): Array<string | number> {
  const fn = KEYSPECS[p.cat] as (x: Part) => KeySpecEntry[];
  return fn(p).filter((s): s is string | number => Boolean(s));
}

export type EnumValue = string | number;
export type FilterValue = EnumValue[] | [number, number] | "si" | "no";
export type ActiveFilters = Partial<Record<string, FilterValue>>;

export function matches(p: Part, filters: ActiveFilters, cat: CatId): boolean {
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue;
    const def = (FILTERS[cat] || []).find((d) => d.k === k);
    if (!def) continue;
    const pv = (p as unknown as Record<string, unknown>)[k];
    if (def.type === "enum") {
      const sel = v as EnumValue[];
      if (!sel.length) continue;
      const arr = Array.isArray(pv) ? pv : [pv];
      if (!arr.some((x) => sel.includes(x as EnumValue))) return false;
    } else if (def.type === "range") {
      if (typeof pv !== "number") return false;
      const r = v as [number, number];
      if (pv < r[0] || pv > r[1]) return false;
    } else if (def.type === "bool") {
      const truthy = !!pv;
      if ((v === "si") !== truthy) return false;
    } else if (def.type === "has") {
      const has = pv !== null && pv !== undefined && pv !== "";
      if ((v === "si") !== has) return false;
    }
  }
  return true;
}
