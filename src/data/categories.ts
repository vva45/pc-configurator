/* ── Categorías del configurador ─────────────────────────────────── */
import {
  Cpu, MemoryStick, HardDrive, Zap, Fan, Cable, Monitor, Keyboard, Mouse,
  Headphones, Mic, Video, Speaker, Wifi,
} from "lucide-react";
import {
  CaseIcon, CoolerIcon, GpuIcon, HubIcon, MboIcon, NetWiredIcon,
  PadIcon, PasteIcon, RgbIcon, SoundCardIcon,
  type PartIconProps,
} from "@/components/configurator/icons";
import type { ComponentType } from "react";
import type { CatId } from "./parts/types";

export type GroupId = "core" | "aux" | "expansion" | "periph";
export type CategoryIcon = ComponentType<PartIconProps>;
export interface Category {
  id: CatId; label: string; icon: CategoryIcon; group: GroupId;
  req?: boolean; multi?: boolean;
}
export interface Group { id: GroupId; label: string; sub: string; }

export const CATS: Category[] = [
  { id: "cpu",     label: "CPU",               icon: Cpu,        group: "core", req: true },
  { id: "cooler",  label: "Refrigeración CPU", icon: CoolerIcon, group: "core", req: true },
  { id: "mbo",     label: "Placa base",        icon: MboIcon,    group: "core", req: true },
  { id: "ram",     label: "Memoria RAM",       icon: MemoryStick, group: "core", req: true, multi: true },
  { id: "gpu",     label: "Gráfica",           icon: GpuIcon,    group: "core" },
  { id: "storage", label: "Almacenamiento",    icon: HardDrive,  group: "core", req: true, multi: true },
  { id: "psu",     label: "Fuente",            icon: Zap,        group: "core", req: true },
  { id: "case",    label: "Caja",              icon: CaseIcon,   group: "core", req: true },

  { id: "fan",     label: "Ventiladores",        icon: Fan,       group: "aux", multi: true },
  { id: "hub",     label: "Hub de ventiladores", icon: HubIcon,   group: "aux" },
  { id: "paste",   label: "Pasta térmica",       icon: PasteIcon, group: "aux" },
  { id: "rgb",     label: "Tiras LED / RGB",     icon: RgbIcon,   group: "aux", multi: true },
  { id: "cable",   label: "Cables y gestión",    icon: Cable,     group: "aux", multi: true },

  { id: "soundcard",   label: "Tarjeta de sonido", icon: SoundCardIcon,   group: "expansion", multi: true },
  { id: "netwired",    label: "Red por cable",     icon: NetWiredIcon,    group: "expansion", multi: true },
  { id: "netwireless", label: "Red inalámbrica",   icon: Wifi,            group: "expansion", multi: true },

  { id: "monitor",  label: "Monitor",     icon: Monitor,    group: "periph", multi: true },
  { id: "keyboard", label: "Teclado",     icon: Keyboard,   group: "periph" },
  { id: "mouse",    label: "Ratón",       icon: Mouse,      group: "periph" },
  { id: "pad",      label: "Alfombrilla", icon: PadIcon,    group: "periph" },
  { id: "headset",  label: "Auriculares", icon: Headphones, group: "periph" },
  { id: "mic",      label: "Micrófono",   icon: Mic,        group: "periph" },
  { id: "webcam",   label: "Webcam",      icon: Video,      group: "periph" },
  { id: "speaker",  label: "Altavoces",   icon: Speaker,    group: "periph" },
];

export const GROUPS: Group[] = [
  { id: "core",      label: "Componentes",    sub: "Se comprueba compatibilidad" },
  { id: "aux",       label: "Auxiliares",     sub: "Filtrado por caja y placa" },
  { id: "expansion", label: "Expansión y red", sub: "Tarjetas de sonido y adaptadores de red" },
  { id: "periph",    label: "Periféricos",    sub: "Sin restricción de montaje" },
];

export const CAT = Object.fromEntries(CATS.map((c) => [c.id, c])) as Record<CatId, Category>;
