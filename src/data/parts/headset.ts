/* Auriculares — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("headset", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"headset">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"headset">) => { rows.push({ brand, name, price, ...o }); };

ADD("Sennheiser","HD 560S + FiiO K5 Pro",319,{type:"Abierto + DAC/amp",drivers:38,imp:120,freq:"6 Hz – 38 kHz",mic:false,conn:"Jack 6,3 mm / USB DAC",wireless:false,anc:false,weight:240,watt:5});
ADD("SteelSeries","Arctis Nova Pro Wireless",349,{type:"Cerrado circumaural",drivers:40,imp:38,freq:"10 Hz – 40 kHz",mic:true,conn:"2,4 GHz + BT + USB-C",wireless:true,anc:true,weight:337,bat:44,watt:3});
ADD("HyperX","Cloud III",99,{type:"Cerrado circumaural",drivers:53,imp:64,freq:"10 Hz – 21 kHz",mic:true,conn:"USB-C / jack 3,5 mm",wireless:false,anc:false,weight:320,watt:1});

export const HEADSET_ROWS = rows;
