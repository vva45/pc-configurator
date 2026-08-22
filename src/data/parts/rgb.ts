/* Tiras LED / RGB — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("rgb", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"rgb">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"rgb">) => { rows.push({ brand, name, price, ...o }); };

ADD("Corsair","iCUE LS100 Kit 450 mm",69,{len:450,leds:138,type:"ARGB direccionable",conn:"Controladora iCUE",watt:5,adhesive:true});
ADD("Phanteks","Neon Digital-RGB LED Strip 400 mm",29,{len:400,leds:60,type:"ARGB 5 V 3-pin",conn:"Cabecera ARGB placa",watt:3,adhesive:true});
ADD("Lian Li","Strimer Plus V2 24-pin",49,{len:200,leds:120,type:"ARGB cable ATX",conn:"Controladora L-Connect",watt:4,adhesive:false});

export const RGB_ROWS = rows;
