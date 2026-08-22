/* Refrigeración CPU — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("cooler", …) original, sin valores por defecto;
   K replica el ayudante original con sus defaults. */
import type { Row, SpecOf, WithDefaults, Socket } from "./types";
import { I_MOD, A_MOD, UNIV } from "@/lib/compat";

const rows: Row<"cooler">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"cooler">) => { rows.push({ brand, name, price, ...o }); };
const K = (brand: string, name: string, price: number, o: WithDefaults<SpecOf<"cooler">, "rgb" | "warranty">) =>
  ADD(brand, name, price, { rgb: false, warranty: 2, ...o });

const ALLSOCK: Socket[] = ["AM5","AM4","LGA1851","LGA1700","LGA1200","LGA1151v2","LGA1150"];
ADD("Noctua","NH-D15 G2",149,{type:"Aire (torre doble)",sockets:["AM5","LGA1851","LGA1700"],height:168,tdpRated:260,fans:2,fanSize:140,noise:24.8,fanRaise:33,ramClear:32,rgb:false,watt:3,warranty:6});
ADD("Thermalright","Peerless Assassin 120 SE",39,{type:"Aire (torre doble)",sockets:ALLSOCK,height:155,tdpRated:245,fans:2,fanSize:120,noise:25.6,fanRaise:20,ramClear:45,rgb:false,watt:3,warranty:6});
ADD("Noctua","NH-L9i-17xx",55,{type:"Aire (low-profile)",sockets:["LGA1700"],height:37,tdpRated:65,fans:1,fanSize:92,noise:23.6,ramClear:60,rgb:false,watt:1.5,warranty:6});
ADD("Arctic","Liquid Freezer III 360",89,{type:"AIO 360 mm",sockets:["LGA2066","LGA2011-v3","AM5","AM4","LGA1851","LGA1700"],height:38,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:22.5,ramClear:99,rgb:false,watt:12,warranty:6});
ADD("NZXT","Kraken 240 RGB",139,{type:"AIO 240 mm",sockets:["AM5","AM4","LGA1851","LGA1700"],height:30,radSize:240,tdpRated:280,fans:2,fanSize:120,noise:33,ramClear:99,rgb:true,watt:14,warranty:6});
ADD("Noctua","NH-U14S TR5-SP6",139,{type:"Aire (torre, HEDT)",sockets:["sTR5"],height:165,tdpRated:350,fans:1,fanSize:140,noise:24.6,ramClear:65,rgb:false,watt:2,warranty:6});
ADD("AMD","Wraith Stealth (de serie)",0,{type:"Aire (stock)",sockets:["AM5","AM4"],height:54,tdpRated:65,fans:1,fanSize:80,noise:32,ramClear:99,rgb:false,watt:2,warranty:1,stock:true});

// Aire · torres altas
K("Noctua","NH-D15 chromax.black",119,{type:"Aire (torre doble)",sockets:["LGA2066","LGA2011-v3",...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:165,tdpRated:250,fans:2,fanSize:140,noise:24.6,fanRaise:33,ramClear:32,watt:3,warranty:6});
K("be quiet!","Dark Rock Pro 5",109,{type:"Aire (torre doble)",sockets:["LGA2066",...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:163,tdpRated:270,fans:2,fanSize:135,noise:25.4,fanRaise:25,ramClear:40,watt:3,warranty:3});
K("be quiet!","Dark Rock 4",79,{type:"Aire (torre)",sockets:UNIV,height:159,tdpRated:200,fans:1,fanSize:135,noise:21.4,fanRaise:25,ramClear:40,watt:2,warranty:3});
K("DeepCool","AK620 Digital",69,{type:"Aire (torre doble)",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:160,tdpRated:260,fans:2,fanSize:120,noise:28,fanRaise:22,ramClear:43,watt:4,warranty:5});
K("DeepCool","AK400",29,{type:"Aire (torre)",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:155,tdpRated:220,fans:1,fanSize:120,noise:29,fanRaise:18,ramClear:47,watt:2,warranty:3});
K("Thermalright","Phantom Spirit 120 SE",42,{type:"Aire (torre doble)",sockets:UNIV,height:157,tdpRated:245,fans:2,fanSize:120,noise:25.6,fanRaise:20,ramClear:45,watt:3,warranty:6});
K("Cooler Master","Hyper 212 Black Edition",39,{type:"Aire (torre)",sockets:UNIV,height:159,tdpRated:150,fans:1,fanSize:120,noise:26,fanRaise:25,ramClear:35,watt:2,warranty:2});
K("Cooler Master","MasterAir MA824 Stealth",99,{type:"Aire (torre doble)",sockets:["LGA2066","LGA2011-v3","LGA2066","LGA2011-v3",...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:167,tdpRated:280,fans:2,fanSize:135,noise:28,fanRaise:28,ramClear:37,watt:4,warranty:5});
K("Arctic","Freezer 36 CO",29,{type:"Aire (torre)",sockets:["AM5","AM4",...I_MOD,"LGA1200"],height:159,tdpRated:220,fans:2,fanSize:120,noise:26,fanRaise:15,ramClear:48,watt:2.4,warranty:6});
K("Scythe","Mugen 6",59,{type:"Aire (torre)",sockets:UNIV,height:154,tdpRated:220,fans:1,fanSize:120,noise:24.9,fanRaise:15,ramClear:48,watt:2,warranty:2});
K("Endorfy","Fera 5",29,{type:"Aire (torre)",sockets:UNIV,height:155,tdpRated:180,fans:1,fanSize:120,noise:25.6,fanRaise:15,ramClear:45,watt:2,warranty:6});
K("ID-COOLING","SE-224-XTS",25,{type:"Aire (torre)",sockets:UNIV,height:154,tdpRated:180,fans:1,fanSize:120,noise:28,fanRaise:18,ramClear:42,watt:2,warranty:3});
K("Tempest","Cooler 4Pipes",19,{type:"Aire (torre)",sockets:[...A_MOD,"LGA1700","LGA1200","LGA1151v2","LGA1155"],height:150,tdpRated:130,fans:1,fanSize:120,noise:28,ramClear:45,watt:2,warranty:2});
K("Corsair","A115",99,{type:"Aire (torre doble)",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:170,tdpRated:270,fans:2,fanSize:140,noise:31,fanRaise:30,ramClear:31,watt:4,warranty:5});
// Aire · bajo perfil e ITX
K("Noctua","NH-L12S",65,{type:"Aire (low-profile)",sockets:UNIV,height:70,tdpRated:95,fans:1,fanSize:120,noise:23.9,ramClear:48,watt:1.5,warranty:6});
K("Noctua","NH-L9a-AM5",55,{type:"Aire (low-profile)",sockets:["AM5"],height:37,tdpRated:65,fans:1,fanSize:92,noise:23.6,ramClear:60,watt:1.5,warranty:6});
K("Thermalright","AXP90-X47",25,{type:"Aire (low-profile)",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:47,tdpRated:100,fans:1,fanSize:92,noise:26,ramClear:55,watt:1.5,warranty:6});
K("Intel","Laminar RM1 (de serie)",0,{type:"Aire (stock)",sockets:["LGA1700"],height:47,tdpRated:65,fans:1,fanSize:92,noise:30,ramClear:99,watt:2,warranty:1,stock:true});
K("AMD","Wraith Prism (de serie)",0,{type:"Aire (stock)",sockets:["AM4"],height:75,tdpRated:105,fans:1,fanSize:90,noise:39,ramClear:99,watt:3,rgb:true,warranty:1,stock:true});
K("Intel","Cooler de caja LGA115x",0,{type:"Aire (stock)",sockets:["LGA1200","LGA1151v2","LGA1151","LGA1150","LGA1155","LGA775"],height:40,tdpRated:65,fans:1,fanSize:80,noise:33,ramClear:99,watt:2,warranty:1,stock:true});
// Kits AIO · refrigeración líquida cerrada
K("Corsair","iCUE LINK TITAN 360 RX RGB",219,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:27,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:36,ramClear:99,watt:18,rgb:true,warranty:5});
K("Corsair","H100i ELITE CAPELLIX XT",139,{type:"AIO 240 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:240,tdpRated:280,fans:2,fanSize:120,noise:36,ramClear:99,watt:14,rgb:true,warranty:5});
K("Arctic","Liquid Freezer III Pro 420",119,{type:"AIO 420 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:38,radSize:420,tdpRated:400,fans:3,fanSize:140,noise:23,ramClear:99,watt:14,warranty:6});
K("Arctic","Liquid Freezer III 240",69,{type:"AIO 240 mm",sockets:["LGA2066","LGA2011-v3",...A_MOD,...I_MOD,"LGA1200"],height:38,radSize:240,tdpRated:280,fans:2,fanSize:120,noise:22.5,ramClear:99,watt:9,warranty:6});
K("DeepCool","LS720 SE",99,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:360,tdpRated:330,fans:3,fanSize:120,noise:32.9,ramClear:99,watt:16,rgb:true,warranty:5});
K("DeepCool","LE500 MARRS",59,{type:"AIO 240 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:240,tdpRated:220,fans:2,fanSize:120,noise:30,ramClear:99,watt:10,warranty:3});
K("NZXT","Kraken Elite 360 RGB",279,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:30,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:38,ramClear:99,watt:20,rgb:true,warranty:6});
K("Cooler Master","MasterLiquid 360L Core ARGB",99,{type:"AIO 360 mm",sockets:["LGA2066",...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:360,tdpRated:300,fans:3,fanSize:120,noise:30,ramClear:99,watt:15,rgb:true,warranty:2});
K("Cooler Master","MasterLiquid ML120L Core",49,{type:"AIO 120 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:120,tdpRated:150,fans:1,fanSize:120,noise:30,ramClear:99,watt:7,rgb:true,warranty:2});
K("be quiet!","Pure Loop 2 FX 280",129,{type:"AIO 280 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:280,tdpRated:300,fans:2,fanSize:140,noise:25.5,ramClear:99,watt:11,rgb:true,warranty:3});
K("be quiet!","Silent Loop 3 360",179,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:30,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:24.5,ramClear:99,watt:14,rgb:true,warranty:5});
K("Lian Li","Galahad II Trinity 360",159,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:27,radSize:360,tdpRated:330,fans:3,fanSize:120,noise:33,ramClear:99,watt:17,rgb:true,warranty:5});
K("MSI","MAG CORELIQUID E360",119,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:360,tdpRated:320,fans:3,fanSize:120,noise:33,ramClear:99,watt:15,rgb:true,warranty:3});
K("ASUS","ROG RYUJIN III 360 ARGB",359,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:30,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:36.6,ramClear:99,watt:22,rgb:true,warranty:6});
K("Thermaltake","TH360 V2 ARGB Sync",119,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:27,radSize:360,tdpRated:300,fans:3,fanSize:120,noise:29.6,ramClear:99,watt:15,rgb:true,warranty:3});
K("EK","Nucleus AIO CR360 Lux D-RGB",189,{type:"AIO 360 mm",sockets:[...A_MOD,...I_MOD,"LGA1200"],height:27,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:34,ramClear:99,watt:16,rgb:true,warranty:5});
K("Tempest","Liquid Cooler 240",59,{type:"AIO 240 mm",sockets:[...A_MOD,"LGA1700","LGA1200","LGA1151v2"],height:27,radSize:240,tdpRated:220,fans:2,fanSize:120,noise:31,ramClear:99,watt:10,rgb:true,warranty:2});
K("Noctua","NH-U12A chromax.black",119,{type:"Aire (torre)",sockets:[...A_MOD,...I_MOD,"LGA1200","LGA1151v2"],height:158,tdpRated:200,fans:2,fanSize:120,noise:22.6,fanRaise:20,ramClear:45,watt:3,warranty:6});
K("SilverStone","XE360-SP5 (HEDT)",219,{type:"AIO 360 mm",sockets:["sTR5","sTRX4"],height:30,radSize:360,tdpRated:400,fans:3,fanSize:120,noise:36,ramClear:99,watt:18,warranty:3});
K("Noctua","NH-U14S TR4-SP3",99,{type:"Aire (torre, HEDT)",sockets:["sTRX4"],height:165,tdpRated:280,fans:1,fanSize:140,noise:24.6,ramClear:65,watt:2,warranty:6});

export const COOLER_ROWS = rows;
