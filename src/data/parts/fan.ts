/* Ventiladores — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("fan", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"fan">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"fan">) => { rows.push({ brand, name, price, ...o }); };

ADD("Noctua","NF-A12x25 PWM",32,{size:120,rpm:2000,cfm:60.1,mmH2O:2.34,noise:22.6,conn:"4-pin PWM",rgb:false,watt:1.68,bearing:"SSO2",warranty:6});
ADD("Arctic","P12 PWM PST (5 uds.)",29,{size:120,rpm:1800,cfm:56.3,mmH2O:2.2,noise:22.5,conn:"4-pin PWM + PST",rgb:false,watt:0.96,bearing:"Fluid",warranty:6});
ADD("Lian Li","UNI FAN SL-Infinity 120 (3 uds.)",89,{size:120,rpm:1900,cfm:61.3,mmH2O:2.54,noise:29,conn:"Propietario (controladora)",rgb:true,watt:2.4,bearing:"Rifle",warranty:2});
ADD("be quiet!","Silent Wings 4 140 mm",29,{size:140,rpm:1600,cfm:78.8,mmH2O:1.79,noise:18.9,conn:"4-pin PWM",rgb:false,watt:1.7,bearing:"FDB",warranty:5});

export const FAN_ROWS = rows;
