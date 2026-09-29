import { CAT, CATS } from "@/data/categories";
import type { CatId, Part } from "@/data/parts/types";
import { gate, list, one, runPost, type AppBuild, type Picked } from "./compat";
import { calcPower } from "./power";
import { keyspecsFor } from "./filters";
import { REGIONS, type RegionId } from "./regions";

export type DossierSpec = [label: string, value: string];
const yes = (value: boolean) => value ? "Sí" : "No";
const capacity = (gb: number) => gb >= 1000 ? `${Number((gb / 1000).toFixed(2))} TB` : `${gb} GB`;

/** A curated public specification sheet: never serialize raw catalog objects. */
export function dossierSpecs(p: Part): DossierSpec[] {
  switch (p.cat) {
    case "cpu": return [["Socket", p.socket], ["Núcleos / hilos", `${p.cores} / ${p.threads}`], ["Frecuencia base / boost", `${p.base} / ${p.boost} GHz`], ["Caché L3", `${p.l3} MB`], ["TDP / límite de potencia", `${p.tdp} / ${p.ppt} W`], ["Memoria admitida", p.mem.join(" · ")], ["Gráficos integrados", p.igpu || "Sin gráficos integrados"], ["Disipador incluido", yes(p.cooler)]];
    case "mbo": return [["Socket / chipset", `${p.socket} · ${p.chipset}`], ["Formato", p.form], ["Memoria", `${p.dimm} ranuras ${p.memType} · hasta ${p.memMaxGB} GB`], ["Ranuras PCIe x16", p.pcie16.join(" · ") || "No indicadas"], ["Almacenamiento", `${p.m2} M.2 · ${p.sata} SATA`], ["Ethernet", p.lan], ["Wi-Fi", p.wifi || "No incluido"], ["USB-A", p.usbA], ["USB-C", p.usbC || "No incluido"], ["Thunderbolt", yes(p.tb)], ["Audio", p.audio], ["Conectores internos", `${p.fanHdr} ventilador · ${p.rgbHdr} RGB`], ["BIOS Flashback", yes(p.bios_flashback)]];
    case "ram": return [["Capacidad por kit", `${p.capGB} GB (${p.kit} × ${p.perStick} GB)`], ["Tipo", p.memType], ["Velocidad nominal", `${p.speed} MT/s`], ["Latencia", `CL${p.cl} · ${p.timings}`], ["Perfil", p.profile], ["Voltaje", `${p.volt} V`], ["Altura", `${p.height} mm`], ["Iluminación RGB", yes(p.rgb)]];
    case "gpu": return [["Chip gráfico", p.chip], ["Memoria de vídeo", `${p.vram} GB ${p.vtype}`], ["Bus de memoria", `${p.bus} bits`], ["Interfaz", p.pcie], ["Longitud / grosor", `${p.len} mm · ${p.slots} ranuras`], ["Potencia de placa", `${p.tbp} W`], ["Alimentación", p.power], ["Fuente mínima declarada", `${p.psuMin} W`], ["Salidas de vídeo", p.outs]];
    case "storage": return [["Capacidad por unidad", capacity(p.capGB)], ["Interfaz", p.iface], ["Generación / tipo", p.gen], ["Lectura / escritura declaradas", `${p.read} / ${p.write} MB/s`], ["Memoria DRAM", yes(p.dram)], ["NAND / tecnología", p.nand], ...(p.tbw === null ? [] : [["Resistencia", `${p.tbw} TBW`] as DossierSpec]), ["Disipador incluido", yes(p.heatsink)]];
    case "psu": return [["Potencia", `${p.watt} W`], ["Certificación", `${p.eff} · ${p.cert}`], ["Estándar", p.atx], ["Formato / longitud", `${p.form} · ${p.len} mm`], ["Cableado", p.modular], ["Conectores PCIe", `${p.pcie8} de 8 pines · ${p.pcie5} PCIe 5`], ["Conectores EPS / SATA", `${p.eps} / ${p.sata}`], ["Garantía declarada", `${p.warranty} años`]];
    case "case": return [["Dimensiones declaradas", p.dims], ["Volumen", `${p.vol} L`], ["Placas admitidas", p.form.join(" · ")], ["Longitud máxima GPU", `${p.gpuLen} mm`], ["Altura máxima disipador", `${p.coolerH} mm`], ["Fuente", `${p.psuForm.join(" / ")} · máximo ${p.psuLen} mm`], ["Radiadores por posición", Object.entries(p.rad).map(([position, size]) => `${position}: ${size} mm`).join(" · ") || "No indicados"], ["Ventiladores incluidos / máximo", `${p.fanInc} / ${p.fanMax}`], ["Bahías 2,5 / 3,5 pulgadas", `${p.bays25} / ${p.bays35}`], ["Panel lateral", p.side], ["Conectividad frontal", p.frontIO]];
    case "cooler": return [["Tipo", p.type], ["Sockets", p.sockets.join(" · ")], ...(p.radSize ? [["Radiador nominal", `${p.radSize} mm`] as DossierSpec] : [["Altura", `${p.height} mm`] as DossierSpec, ["Espacio para RAM", `${p.ramClear} mm`] as DossierSpec]), ["Ventiladores", `${p.fans} × ${p.fanSize} mm`], ["Capacidad térmica declarada", `${p.tdpRated} W`], ["Ruido declarado", `${p.noise} dBA`], ["Iluminación RGB", yes(p.rgb)]];
    case "fan": return [["Diámetro", `${p.size} mm`], ["Velocidad máxima", `${p.rpm} rpm`], ["Caudal / presión", `${p.cfm} CFM · ${p.mmH2O} mmH₂O`], ["Ruido declarado", `${p.noise} dBA`], ["Conector", p.conn], ["Rodamiento", p.bearing], ["Iluminación RGB", yes(p.rgb)]];
    case "hub": return [["Puertos", String(p.ports)], ["Control PWM", yes(p.pwm)], ["Alimentación", p.power], ["Iluminación RGB", yes(p.rgb)]];
    case "paste": return [["Tipo", p.type], ["Conductividad declarada", `${p.cond} W/mK`], ["Cantidad", `${p.grams} g`], ["Conductora eléctrica", yes(p.elec)], ["Vida declarada", p.life], ...(p.warn ? [["Observación", p.warn] as DossierSpec] : [])];
    case "rgb": return [["Tipo", p.type], ["Longitud", `${p.len} mm`], ["LED", String(p.leds)], ["Conector", p.conn], ["Potencia", `${p.watt} W`]];
    case "cable": return [["Tipo", p.kind], ["Piezas por juego", String(p.pieces)], ["Longitud", `${p.len} mm`], ["Color", p.color], ["Peines incluidos", yes(p.combs)]];
    case "soundcard": return [["Chip", p.chip], ["Canales", p.channels], ["Relación señal / ruido", `${p.snr} dB`], ["Interfaz", p.iface], ["Salidas", p.outs]];
    case "netwired": return [["Chip", p.chip], ["Velocidad", p.speed], ["Puertos", String(p.ports)], ["Interfaz", p.iface]];
    case "netwireless": return [["Wi-Fi", p.wifi], ["Bluetooth", p.bt || "No incluido"], ["Velocidad declarada", p.speed], ["Antenas", String(p.antennas)], ["Interfaz", p.iface]];
    case "monitor": return [["Pantalla", `${p.size} pulgadas · ${p.panel}`], ["Resolución", p.res], ["Frecuencia", `${p.hz} Hz`], ["Tiempo GtG declarado", `${p.gtg} ms`], ["Sincronización", p.sync], ["HDR", p.hdr], ["Conectores", p.ports], ["VESA", p.vesa]];
    case "keyboard": return [["Distribución", p.layout], ["Interruptores", p.switches], ["Conexión", p.conn], ["Interruptores intercambiables", yes(p.hotswap)], ["Iluminación RGB", yes(p.rgb)]];
    case "mouse": return [["Sensor", p.sensor], ["Resolución", `${p.dpi} DPI`], ["Peso", `${p.weight} g`], ["Conexión", p.conn], ["Botones", String(p.buttons)], ["Forma", p.shape]];
    case "pad": return [["Dimensiones", `${p.w} × ${p.h} × ${p.thick} mm`], ["Superficie", p.surface], ["Base", p.base], ["Lavable", yes(p.washable)]];
    case "headset": return [["Tipo", p.type], ["Transductores", `${p.drivers} mm`], ["Respuesta de frecuencia", p.freq], ["Conexión", p.conn], ["Micrófono", yes(p.mic)], ["Cancelación activa", yes(p.anc)], ["Peso", `${p.weight} g`]];
    case "mic": return [["Tipo", p.type], ["Conexión", p.conn], ["Muestreo", p.rate], ["Brazo incluido", yes(p.arm)], ["Soporte antivibración", yes(p.shock)]];
    case "webcam": return [["Resolución", p.res], ["Sensor", p.sensor], ["Campo de visión", p.fov], ["Enfoque automático", yes(p.af)], ["Micrófono", yes(p.mic)], ["Conexión", p.conn]];
    case "speaker": return [["Tipo", p.type], ["Potencia de audio", `${p.power} W`], ["Transductores", p.drivers], ["Conexión", p.conn], ["Subwoofer", yes(p.sub)], ["Bluetooth", yes(p.bt)]];
  }
}

export function dossierDescription(p: Part): string {
  switch (p.cat) {
    case "cpu": return `Procesador ${p.socket} de ${p.cores} núcleos y ${p.threads} hilos. Ejecuta el sistema, las aplicaciones y la lógica de los juegos.${p.igpu ? ` Incorpora gráficos ${p.igpu}.` : " Necesita una gráfica dedicada para ofrecer imagen."}`;
    case "gpu": return `Gráfica ${p.chip} con ${p.vram} GB de memoria ${p.vtype}. Se encarga del renderizado de juegos, vídeo y aplicaciones 3D. Ocupa ${p.slots} ranuras y mide ${p.len} mm de largo.`;
    case "mbo": return `Placa ${p.form} con chipset ${p.chipset} y socket ${p.socket}. Conecta el procesador, la memoria y las ampliaciones; dispone de ${p.dimm} ranuras ${p.memType} y ${p.m2} conexiones M.2.`;
    case "ram": return `Kit de ${p.capGB} GB repartidos en ${p.kit} módulo${p.kit === 1 ? "" : "s"}. Mantiene los datos de las aplicaciones en uso. Sus ${p.speed} MT/s son la velocidad nominal del kit; el funcionamiento depende de la plataforma y del perfil configurado.`;
    case "storage": return `Unidad de ${capacity(p.capGB)} con interfaz ${p.iface} para el sistema, aplicaciones y archivos. Las velocidades declaradas no equivalen al rendimiento de todas las tareas.`;
    case "case": return `Chasis de ${p.vol} litros con panel ${p.side.toLowerCase()}. Define el espacio de montaje y admite placas ${p.form.join(", ")}. Los límites de espacio deben revisarse junto a la refrigeración elegida.`;
    case "cooler": return p.radSize ? `Refrigeración líquida con radiador nominal de ${p.radSize} mm y ${p.fans} ventiladores. Transfiere el calor del procesador al radiador, que requiere un anclaje compatible en la caja.` : `Disipador por aire de ${p.height} mm de altura. Transfiere el calor del procesador al flujo de aire de la caja; su espacio para RAM declarado es de ${p.ramClear} mm.`;
    case "psu": return `Fuente de ${p.watt} W en formato ${p.form} que alimenta los componentes del equipo. Su potencia, longitud y conectores se contrastan con la configuración seleccionada.`;
    case "fan": return `Ventilador de ${p.size} mm para gestionar el flujo de aire. Requiere una posición compatible en la caja y conexión ${p.conn}.`;
    case "monitor": return `Monitor de ${p.size} pulgadas, resolución ${p.res} y hasta ${p.hz} Hz. La señal disponible depende de las salidas de vídeo y del cable utilizado.`;
    default: return `${CAT[p.cat].label} para completar tu equipo. Las especificaciones siguientes corresponden al modelo seleccionado en el catálogo.`;
  }
}

export function createBuildDossier(build: AppBuild) {
  const rows = CATS.flatMap((category) => ((build[category.id] || []) as Picked[]).map((part) => {
    const rest = { ...build, [category.id]: ((build[category.id] || []) as Picked[]).filter((item) => item._uid !== part._uid) } as AppBuild;
    return { part, category, specs: dossierSpecs(part), description: dossierDescription(part), conflict: gate(part, rest) };
  }));
  const cpu = one(build, "cpu"), gpu = one(build, "gpu"), board = one(build, "mbo"), chassis = one(build, "case"), psu = one(build, "psu");
  const ram = list(build, "ram"), storage = list(build, "storage");
  const power = calcPower(build), post = runPost(build, power);
  const required = CATS.filter((c) => c.req), missing = required.filter((c) => !build[c.id]?.length);
  const ramGB = ram.reduce((sum, p) => sum + p.capGB * (p.qty || 1), 0);
  const storageGB = storage.reduce((sum, p) => sum + p.capGB * (p.qty || 1), 0);
  const metrics: { label: string; value: string; detail: string; category: CatId }[] = [
    { label: "Procesador", value: cpu ? `${cpu.cores} núcleos / ${cpu.threads} hilos` : "Por elegir", detail: cpu ? `${cpu.socket} · hasta ${cpu.boost} GHz` : "El centro de tu equipo", category: "cpu" },
    { label: "Gráficos", value: gpu ? `${gpu.vram} GB ${gpu.vtype}` : cpu?.igpu ? "Integrados" : "Sin gráfica", detail: gpu?.chip || cpu?.igpu || "Añade una GPU si la necesitas", category: "gpu" },
    { label: "Memoria", value: ram.length ? `${ramGB} GB` : "Por elegir", detail: ram.length ? `${[...new Set(ram.map((p) => p.memType))].join(" / ")} · ${ram.reduce((sum, p) => sum + p.kit * (p.qty || 1), 0)} módulos` : "Capacidad para tus aplicaciones", category: "ram" },
    { label: "Almacenamiento", value: storage.length ? capacity(storageGB) : "Por elegir", detail: storage.length ? `${storage.reduce((sum, p) => sum + (p.qty || 1), 0)} unidades · capacidad nominal` : "Sistema, juegos y archivos", category: "storage" },
    { label: "Formato", value: board?.form || "Por elegir", detail: chassis ? `${chassis.vol} L · ${chassis.dims}` : "Elige placa y caja", category: "case" },
    { label: "Alimentación", value: psu ? `${psu.watt} W` : "Por elegir", detail: psu ? `${psu.form} · ${psu.eff}` : "Fuente de alimentación", category: "psu" },
  ];
  const connectivity: DossierSpec[] = [
    ["Ethernet", [board?.lan, ...list(build, "netwired").map((p) => `${p.speed} (${p.ports} puertos)`)].filter(Boolean).join(" + ") || "Sin datos; elige una placa o adaptador"],
    ["Wi-Fi", [board?.wifi, ...list(build, "netwireless").map((p) => p.wifi)].filter(Boolean).join(" + ") || (board ? "No incluido en la selección" : "Pendiente de placa o adaptador")],
    ["USB de la placa", board ? [board.usbA, board.usbC].filter(Boolean).join(" · ") || "No indicado" : "Pendiente de placa"],
    ["Conexiones frontales", chassis?.frontIO || "Pendiente de caja"],
    ["Vídeo de la gráfica", gpu?.outs || (cpu?.igpu ? "Consultar las salidas de la placa base" : "Sin gráfica dedicada seleccionada")],
  ];
  return { rows, metrics, connectivity, power, post, missing, required, psu, total: rows.reduce((sum, { part }) => sum + part.price * (part.qty || 1), 0), unknownPrices: rows.filter(({ part }) => !part.price).length };
}

export function dossierText(build: AppBuild, region: RegionId): string {
  const d = createBuildDossier(build);
  const money = (value: number) => `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value)} ${REGIONS[region].cur}`;
  return ["NEXUS × FORGE — Ficha técnica", `Región: ${REGIONS[region].label}`, "",
    d.rows.length ? `Selección: ${d.rows.length} referencias` : "Configuración vacía",
    d.missing.length ? `Pendiente: ${d.missing.map((c) => c.label).join(", ")}` : "Componentes esenciales seleccionados", "",
    ...d.rows.flatMap(({ part, category, description, specs }) => [
      `${category.label} — ${part.brand} ${part.name}${part.qty > 1 ? ` × ${part.qty}` : ""}`,
      keyspecsFor(part).join(" · "), description, ...specs.map(([label, value]) => `  ${label}: ${value}`),
      `  Referencia de precio: ${part.price ? money(part.price * (part.qty || 1)) : "Sin precio"}`, "",
    ]),
    "CONECTIVIDAD", ...d.connectivity.map(([label, value]) => `${label}: ${value}`), "",
    ...(d.power.total ? ["ESTIMACIÓN DE POTENCIA", `Juego: ${d.power.gaming} W · máximo sostenido: ${d.power.total} W · pico: ${d.power.spike} W`, `Fuente sugerida para la selección actual: ${d.power.rec} W`] : ["Potencia pendiente de componentes"]), "",
    "COMPATIBILIDAD", ...(d.post.length ? d.post.map((line) => `${line.lvl === "ok" ? "Correcto" : line.lvl === "warn" ? "Aviso" : "Conflicto"}: ${line.msg}`) : ["Sin comprobaciones todavía"]),
    ...d.rows.filter((row) => row.conflict.blocked).map(({ part, conflict }) => `${part.name}: ${conflict.reason}`), "",
    `Total orientativo: ${money(d.total)}${d.unknownPrices ? ` · ${d.unknownPrices} referencias sin precio` : ""}`,
    "Precios de referencia del catálogo, sujetos a disponibilidad. No son una oferta ni una cotización actualizada.",
    "La representación 3D es orientativa. Confirma las dimensiones, anclajes y conexiones en la ficha del fabricante antes de comprar.",
  ].join("\n");
}
