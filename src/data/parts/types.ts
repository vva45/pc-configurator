/* Tipos del catálogo. Derivados del esquema real de las 447 piezas del
   monolito (volcado en runtime): un campo es opcional únicamente si alguna
   pieza de su categoría no lo declara. */

export const CAT_IDS = [
  "cpu", "cooler", "mbo", "ram", "gpu", "storage", "psu", "case",
  "fan", "hub", "paste", "rgb", "cable",
  "soundcard", "netwired", "netwireless",
  "monitor", "keyboard", "mouse", "pad", "headset", "mic", "webcam", "speaker",
] as const;
export type CatId = (typeof CAT_IDS)[number];

export type MemType = "DDR2" | "DDR3" | "DDR4" | "DDR5" | "DDR5-RDIMM";
export type Socket =
  | "AM5" | "AM4" | "AM3+" | "FM2+" | "sTR5" | "sTRX4"
  | "LGA1851" | "LGA1700" | "LGA1200" | "LGA1151v2" | "LGA1151"
  | "LGA1150" | "LGA1155" | "LGA775" | "LGA2011-v3" | "LGA2066" | "DIP16";
export type FormFactor = "EEB" | "CEB" | "E-ATX" | "ATX" | "Micro-ATX" | "Mini-ITX";
export type PsuForm = "ATX" | "SFX" | "SFX-L";

/* Relaja los campos K de T: el ayudante de la categoría los rellena con un
   valor por defecto, así que el literal puede omitirlos. */
export type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface CpuSpec {
  socket: Socket; family: string; cores: number; pcores?: number; ecores?: number;
  threads: number; base: number; boost: number; l2?: number; l3: number;
  tdp: number; ppt: number; mem: MemType[]; memMax?: number; igpu: string | null;
  lith: string; pcie: string; unlocked: boolean; cooler: boolean; year: number;
  x3d?: boolean; hedt?: boolean; apu?: boolean; note?: string;
}

export interface MboSpec {
  socket: Socket; chipset: string; form: FormFactor; memType: MemType; dimm: number;
  memMaxGB: number; memOC: number; pcie16: string[]; m2: number; m2gen5: number;
  sata: number; usbC: string | null; usbA: string; tb: boolean; lan: string;
  wifi: string | null; audio: string; vrm: string; bios_flashback: boolean;
  rgbHdr: number; fanHdr: number; year: number;
}

export interface RamSpec {
  memType: MemType; kit: number; capGB: number; perStick: number; speed: number;
  cl: number; timings: string; volt: number; profile: string; rgb: boolean;
  height: number; watt: number; rank: string; die: string;
}

export interface GpuSpec {
  chip: string; vram: number; vtype: string; bus: number; tbp: number; len: number;
  slots: number; pcie: string; power: string; conn8: number; conn6?: number;
  hpwr?: boolean; psuMin: number; outs: string; boost: number; cuda: number;
  year: number; seg?: string;
}

export interface StorageSpec {
  iface: string; gen: string; capGB: number; read: number; write: number;
  tbw: number | null; dram: boolean; nand: string; watt: number; heatsink: boolean;
  seg?: string;
}

export interface PsuSpec {
  watt: number; eff: string; cert: string; atx: string; form: PsuForm; len: number;
  modular: string; pcie5: number; pcie8: number; eps: number; sata: number;
  molex: number; fan: string; zero: boolean; warranty: number;
}

export interface CaseSpec {
  form: FormFactor[]; gpuLen: number; gpuLenRad?: number; coolerH: number;
  psuLen: number; psuForm: PsuForm[]; rad: Record<string, number>;
  fanInc: number; fanMax: number; fanSizes: number[]; bays35: number; bays25: number;
  side: string; psuPos: string; frontIO: string; dims: string; vol: number; color: string;
}

export interface CoolerSpec {
  type: string; sockets: Socket[]; height: number; tdpRated: number; fans: number;
  fanSize: number; noise: number; fanRaise?: number; ramClear: number; rgb: boolean;
  watt: number; warranty: number; radSize?: number; stock?: boolean;
}

export interface FanSpec {
  size: number; rpm: number; cfm: number; mmH2O: number; noise: number; conn: string;
  rgb: boolean; watt: number; bearing: string; warranty: number;
}
export interface HubSpec {
  ports: number; pwm: boolean; power: string; rgb: boolean; watt: number; rgbCh?: number;
}
export interface PasteSpec {
  cond: number; type: string; grams: number; elec: boolean; cure: boolean | number;
  life: string; warn?: string;
}
export interface RgbSpec {
  len: number; leds: number; type: string; conn: string; watt: number; adhesive: boolean;
}
export interface CableSpec {
  kind: string; pieces: number; len: number; combs: boolean; color: string;
}
export interface SoundcardSpec {
  chip: string; channels: string; snr: number; iface: string; outs: string;
  watt: number; year: number;
}
export interface NetwiredSpec {
  chip: string; speed: string; ports: number; iface: string; watt: number; year: number;
}
export interface NetwirelessSpec {
  wifi: string; bt: string | null; speed: string; antennas: number; iface: string;
  watt: number; year: number;
}
export interface MonitorSpec {
  size: number; res: string; panel: string; hz: number; gtg: number; sync: string;
  hdr: string; nits: number; ports: string; curve: string | null; ratio: string;
  watt: number; vesa: string;
}
export interface KeyboardSpec {
  layout: string; switches: string; hotswap: boolean; conn: string; kc: string;
  case: string; rgb: boolean; rot: number; watt: number;
}
export interface MouseSpec {
  sensor: string; dpi: number; ips: number | null; accel: number | null; weight: number;
  conn: string; buttons: number; switches: string; bat: number; rgb: boolean; shape: string;
}
export interface PadSpec {
  w: number; h: number; thick: number; surface: string; base: string; stitch: boolean;
  rgb: boolean; washable: boolean; watt?: number;
}
export interface HeadsetSpec {
  type: string; drivers: number; imp: number; freq: string; mic: boolean; conn: string;
  wireless: boolean; anc: boolean; weight: number; watt: number; bat?: number;
}
export interface MicSpec {
  type: string; conn: string; rate: string; arm: boolean; shock: boolean; watt: number;
}
export interface WebcamSpec {
  res: string; sensor: string; fov: string; af: boolean; mic: boolean; conn: string; watt: number;
}
export interface SpeakerSpec {
  type: string; power: number; drivers: string; conn: string; sub: boolean; bt: boolean; watt: number;
}

export interface SpecMap {
  cpu: CpuSpec; cooler: CoolerSpec; mbo: MboSpec; ram: RamSpec; gpu: GpuSpec;
  storage: StorageSpec; psu: PsuSpec; case: CaseSpec; fan: FanSpec; hub: HubSpec;
  paste: PasteSpec; rgb: RgbSpec; cable: CableSpec;
  soundcard: SoundcardSpec; netwired: NetwiredSpec; netwireless: NetwirelessSpec;
  monitor: MonitorSpec;
  keyboard: KeyboardSpec; mouse: MouseSpec; pad: PadSpec; headset: HeadsetSpec;
  mic: MicSpec; webcam: WebcamSpec; speaker: SpeakerSpec;
}

/* museum/legacy pueden aparecer en cualquier categoría (piezas descatalogadas
   o de museo, ocultas por defecto en el catálogo). */
export type SpecOf<K extends CatId> = SpecMap[K] & { museum?: boolean; legacy?: boolean };

/* ean: código de barras del producto. Hoy va vacío; es la clave para casar
   la misma pieza entre tiendas cuando lleguen los datafeeds (ver README §3).
   Retrofitearlo con miles de SKU sería un infierno: por eso ya está en el
   esquema. */
export type Row<K extends CatId> = {
  brand: string; name: string; price: number; ean?: string;
} & SpecOf<K>;

export type PartOf<K extends CatId> = { id: string; cat: K } & Row<K>;
export type CatMap = { [K in CatId]: PartOf<K> };
export type Part = CatMap[CatId];
