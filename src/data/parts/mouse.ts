/* Ratones — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("mouse", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"mouse">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"mouse">) => { rows.push({ brand, name, price, ...o }); };

ADD("Logitech","G Pro X Superlight 2 DEX",159,{sensor:"HERO 2",dpi:44000,ips:888,accel:88,weight:60,conn:"Lightspeed 2,4 GHz + USB-C",buttons:6,switches:"LIGHTFORCE híbrido",bat:95,rgb:false,shape:"Ergonómico diestro"});
ADD("Razer","Viper V3 Pro",159,{sensor:"Focus Pro 35K gen-2",dpi:35000,ips:750,accel:70,weight:54,conn:"HyperSpeed 2,4 GHz + USB-C",buttons:6,switches:"Óptico gen-3",bat:95,rgb:false,shape:"Simétrico"});
ADD("Logitech","MX Master 3S",109,{sensor:"Darkfield 8K",dpi:8000,ips:null,accel:null,weight:141,conn:"Bolt 2,4 GHz + BT",buttons:7,switches:"Silencioso",bat:70,rgb:false,shape:"Ergonómico productividad"});

export const MOUSE_ROWS = rows;
