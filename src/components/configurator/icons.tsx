/* Iconos propios de categoría, dibujados en el mismo lenguaje que lucide
   (trazo 2 sobre viewBox 24) pero más pegados al producto real: ventilador
   de torre, placa base, gráfica de tres ventiladores con sus contactos PCIe,
   caja de PC, hub USB, jeringa de pasta sobre el chip, tira LED, alfombrilla
   y las tarjetas de expansión. Aceptan las mismas props que un icono lucide
   (size, color, strokeWidth, opacity…). */
import type { CSSProperties, ReactNode } from "react";

export interface PartIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

const make = (name: string, children: ReactNode) => {
  const Icon = ({ size = 24, color = "currentColor", strokeWidth = 2, ...rest }: PartIconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
};

/* Disipador de torre: marco con ventilador y base con heatpipes */
export const CoolerIcon = make("CoolerIcon", <>
  <rect x="4" y="2.5" width="16" height="15" rx="2" />
  <circle cx="12" cy="10" r="5.2" />
  <circle cx="12" cy="10" r="1.1" />
  <path d="M12 5 C13.8 6.2 14 8 13 9.2" />
  <path d="M17 10 C15.8 11.8 14 12 12.8 11" />
  <path d="M12 15 C10.2 13.8 10 12 11 10.8" />
  <path d="M7 10 C8.2 8.2 10 8 11.2 9" />
  <path d="M10 17.5 v1.7" />
  <path d="M14 17.5 v1.7" />
  <path d="M8.5 21 h7" />
</>);

/* Placa base: socket, slots de RAM, ranura PCIe y algún componente */
export const MboIcon = make("MboIcon", <>
  <rect x="3" y="3" width="18" height="18" rx="1.5" />
  <rect x="6.5" y="6.5" width="6" height="6" />
  <path d="M16.2 5.5 v8" />
  <path d="M18.6 5.5 v8" />
  <path d="M5.5 17.2 h9" />
  <circle cx="17.8" cy="17.8" r="0.9" />
  <path d="M9.5 12.5 v2 h3" />
</>);

/* Gráfica: chapa, tres ventiladores y contactos PCIe */
export const GpuIcon = make("GpuIcon", <>
  <path d="M3 4 v16" />
  <path d="M3 6.5 h1.5" />
  <path d="M3 13.5 h1.5" />
  <rect x="4.5" y="5.5" width="17" height="10.5" rx="1" />
  <circle cx="8.7" cy="10.75" r="2.15" />
  <circle cx="13.1" cy="10.75" r="2.15" />
  <circle cx="17.5" cy="10.75" r="2.15" />
  <path d="M7.5 16 v2 h6.5 v-2" />
  <path d="M16 16 v1.4 h2.5 v-1.4" />
</>);

/* Caja: torre con panel frontal, botón y rejilla */
export const CaseIcon = make("CaseIcon", <>
  <rect x="5.5" y="2.5" width="13" height="19" rx="1.5" />
  <path d="M15.5 2.5 v19" />
  <circle cx="17" cy="5.5" r="0.8" />
  <path d="M16.2 8.5 h1.6" />
  <path d="M16.2 10.3 h1.6" />
  <path d="M8.2 16.4 h4.6" />
  <path d="M8.2 18.4 h4.6" />
</>);

/* Hub USB: cable con conector y cuerpo con puertos */
export const HubIcon = make("HubIcon", <>
  <rect x="8.5" y="4.4" width="5.2" height="3.6" rx="0.8" />
  <path d="M13.7 5.7 h2.2 v1.2 h-2.2" />
  <path d="M8.5 6.9 C3.4 7.6 3.4 15.4 7 16" />
  <rect x="7" y="12.5" width="14" height="7" rx="1.8" />
  <rect x="9.6" y="14.5" width="2.2" height="3" />
  <rect x="13.3" y="14.5" width="2.2" height="3" />
  <rect x="17" y="14.5" width="2.2" height="3" />
</>);

/* Pasta térmica: jeringa sobre el chip */
export const PasteIcon = make("PasteIcon", <>
  <rect x="3.5" y="12" width="8.5" height="8.5" rx="1" />
  <path d="M5.7 12 v-1.6" />
  <path d="M8 12 v-1.6" />
  <path d="M10.3 12 v-1.6" />
  <path d="M5.6 16.4 q1 -1 2 0 t2 0" />
  <path d="M14 12 L18 8 L21 11 L17 15 Z" />
  <path d="M14 12 L11.2 14.6" />
  <path d="M19.5 9.5 l2.6 -2.6" />
  <path d="M20.9 5.7 l2.4 2.4" />
</>);

/* Tira LED: cinta en S con los LED cuadrados */
export const RgbIcon = make("RgbIcon", <>
  <path d="M3 6.5 H16.5 A4.5 4.5 0 0 1 16.5 15.5 H3" />
  <rect x="5.2" y="4.9" width="3.2" height="3.2" />
  <rect x="10.8" y="4.9" width="3.2" height="3.2" />
  <rect x="6" y="13.9" width="3.2" height="3.2" />
  <rect x="11.6" y="13.9" width="3.2" height="3.2" />
</>);

/* Alfombrilla con el ratón encima */
export const PadIcon = make("PadIcon", <>
  <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
  <rect x="13.8" y="9.3" width="4.6" height="6.4" rx="2.3" />
  <path d="M16.1 9.3 v1.8" />
  <path d="M16.1 8.2 c0 -1 1.2 -0.8 1 -2" />
</>);

/* Tarjeta de sonido: jacks en la chapa y contactos PCIe */
export const SoundCardIcon = make("SoundCardIcon", <>
  <path d="M21 4.5 v13" />
  <path d="M19 6.5 h2" />
  <path d="M19 15 h2" />
  <rect x="3.5" y="5.5" width="15" height="11" rx="1" />
  <circle cx="7.5" cy="11" r="1.6" />
  <circle cx="12" cy="11" r="1.6" />
  <rect x="15" y="7.5" width="2.4" height="2.4" />
  <path d="M6.5 16.5 v2 h5.5 v-2" />
</>);

/* Adaptador de red con cable: puerto RJ45 en la tarjeta */
export const NetWiredIcon = make("NetWiredIcon", <>
  <path d="M21 4.5 v13" />
  <rect x="3.5" y="6" width="15" height="10" rx="1" />
  <rect x="6.5" y="9" width="5" height="4.5" />
  <path d="M8 13.5 h2" />
  <path d="M8.2 9 v-1.4" />
  <path d="M9.8 9 v-1.4" />
  <rect x="13.8" y="8.6" width="2.8" height="2.8" />
  <path d="M6.5 16 v2 h5.5 v-2" />
</>);

/* Adaptador inalámbrico: tarjeta con dos antenas */
export const NetWirelessIcon = make("NetWirelessIcon", <>
  <rect x="3.5" y="11" width="15" height="7" rx="1" />
  <path d="M7 11 V5.2" />
  <circle cx="7" cy="4.2" r="1" />
  <path d="M14.5 11 V5.2" />
  <circle cx="14.5" cy="4.2" r="1" />
  <rect x="9.2" y="13.2" width="3.4" height="2.6" />
  <path d="M21 9.5 v9.5" />
  <path d="M6.5 18 v1.6 h6 v-1.6" />
</>);
