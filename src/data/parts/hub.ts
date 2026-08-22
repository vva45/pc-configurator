/* Hubs de ventiladores — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("hub", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"hub">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"hub">) => { rows.push({ brand, name, price, ...o }); };

ADD("Arctic","Case Fan Hub 10-Port PWM",13,{ports:10,pwm:true,power:"SATA",rgb:false,watt:0.5});
ADD("Corsair","iCUE Commander CORE XT",59,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:6,watt:2});
ADD("Lian Li","UNI FAN SL-Infinity Controller",25,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:4,watt:1.5});

export const HUB_ROWS = rows;
