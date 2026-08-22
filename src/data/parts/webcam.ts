/* Webcams — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("webcam", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"webcam">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"webcam">) => { rows.push({ brand, name, price, ...o }); };

ADD("Elgato","Facecam MK.2",149,{res:"1080p60",sensor:"Sony STARVIS 2",fov:"77°/82°/90°",af:true,mic:false,conn:"USB-C",watt:2.5});
ADD("Logitech","MX Brio 4K",229,{res:"4K30 / 1080p60",sensor:"Sony 8,5 MP",fov:"65°/78°/90°",af:true,mic:true,conn:"USB-C",watt:2.5});

export const WEBCAM_ROWS = rows;
