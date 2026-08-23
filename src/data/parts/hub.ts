/* Hubs de ventiladores — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("hub", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"hub">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"hub">) => { rows.push({ brand, name, price, ...o }); };

ADD("Arctic","Case Fan Hub 10-Port PWM",13,{ports:10,pwm:true,power:"SATA",rgb:false,watt:0.5});
ADD("Corsair","iCUE Commander CORE XT",59,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:6,watt:2});
ADD("Lian Li","UNI FAN SL-Infinity Controller",25,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:4,watt:1.5});

/* ── Expansión de hubs y controladoras (petición del usuario, ago 2026). ── */
ADD("Corsair","COMMANDER PRO",69,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:2});
ADD("Corsair","Lighting Node CORE",39,{ports:6,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:6});
ADD("Corsair","Lighting Node PRO",49,{ports:2,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:2});
ADD("Corsair","Lighting Node CORE XT",44,{ports:6,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:6});
ADD("Corsair","RGB LED Hub",19,{ports:6,pwm:false,power:"SATA",rgb:true,watt:2,rgbCh:6});
ADD("Lian Li","UNI HUB TL",29,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("Lian Li","UNI HUB",25,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("Lian Li","L-Connect 3 Controller",27,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("NZXT","RGB & Fan Controller",49,{ports:3,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:3});
ADD("NZXT","RGB Controller",29,{ports:3,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:3});
ADD("NZXT","Fan Controller",39,{ports:3,pwm:true,power:"SATA + USB 2.0",rgb:false,watt:0.5});
ADD("Phanteks","Universal Fan Controller",35,{ports:8,pwm:true,power:"SATA + USB 2.0",rgb:false,watt:0.5});
ADD("Phanteks","D-RGB Controller",25,{ports:2,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:2});
ADD("be quiet!","Light Wings Controller",29,{ports:6,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:6});
ADD("Thermaltake","TT Sync Controller",29,{ports:9,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:9});
ADD("Thermaltake","Commander FP",15,{ports:10,pwm:true,power:"SATA",rgb:false,watt:0.5});
ADD("Cooler Master","MasterFan ARGB/PWM Hub",25,{ports:6,pwm:true,power:"SATA",rgb:true,watt:2,rgbCh:6});
ADD("Cooler Master","ARGB LED Controller",22,{ports:4,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("Arctic","Case Fan Hub Mini",10,{ports:6,pwm:true,power:"SATA",rgb:false,watt:0.5});
ADD("SilverStone","CPF04",15,{ports:8,pwm:true,power:"SATA",rgb:false,watt:0.5});
ADD("SilverStone","LSB02",22,{ports:8,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:8});
ADD("MSI","MAG MAX F12A controller",25,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:6});
ADD("Gigabyte","RGB Fusion 2.0 Controller",25,{ports:4,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("ASUS","ROG Aura Terminal",69,{ports:4,pwm:false,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:4});
ADD("ASUS","TUF Gaming ARGB Fan Controller",35,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,watt:2,rgbCh:6});

export const HUB_ROWS = rows;
