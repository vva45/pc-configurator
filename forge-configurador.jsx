import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Cpu, CircuitBoard, MemoryStick, MonitorSmartphone, HardDrive, Zap, Box,
  Fan, Wind, Droplet, Cable, Lightbulb, Monitor, Keyboard, Mouse, Headphones,
  Mic, Video, Speaker, Search, X, Check, AlertTriangle, XCircle, ChevronDown,
  ExternalLink, Trash2, Globe, SlidersHorizontal, Layers, Rows3, ShoppingCart, Store, ClipboardList
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   FORGE — Configurador de PC
   Motor de compatibilidad + calculadora de consumo + catálogo filtrable
   ═══════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,300..900&family=IBM+Plex+Mono:wght@400;500;600&family=Inter+Tight:wght@400;500;600;700&display=swap');

:root{
  --board:#08120D;      /* FR-4 oscuro */
  --board-2:#0E1F17;    /* superficie elevada */
  --board-3:#152D22;    /* superficie hover */
  --trace:#1E4534;      /* pistas / bordes */
  --silk:#E6EFE8;       /* serigrafía */
  --silk-dim:#7E9A8A;
  --gold:#D8AE52;       /* contactos ENIG */
  --gold-dim:#8A6E2F;
  --copper:#C1703A;
  --red:#E05A48;
  --amber:#E3A83C;
  --cyan:#4FB9A5;
}
*{box-sizing:border-box}
.fg{
  background:var(--board); color:var(--silk);
  font-family:'Inter Tight',system-ui,sans-serif;
  min-height:100vh; font-size:14px; line-height:1.45;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(216,174,82,.055) 1px, transparent 0);
  background-size:22px 22px;
}
.fg *::-webkit-scrollbar{width:9px;height:9px}
.fg *::-webkit-scrollbar-track{background:var(--board)}
.fg *::-webkit-scrollbar-thumb{background:var(--trace);border-radius:0}
.fg *::-webkit-scrollbar-thumb:hover{background:var(--gold-dim)}

.dsp{font-family:'Archivo',sans-serif;font-variation-settings:'wdth' 118,'wght' 800;
  text-transform:uppercase;letter-spacing:-.01em;line-height:.95}
.mono{font-family:'IBM Plex Mono',monospace;font-variant-ligatures:none}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--silk-dim)}

.panel{background:var(--board-2);border:1px solid var(--trace)}
.hair{border-color:var(--trace)}

/* contactos dorados: la firma visual */
.fingers{display:flex;gap:2px;height:100%;width:9px;flex-shrink:0}
.fingers i{flex:1;background:var(--trace);transition:background .25s}
.fingers.on i{background:var(--gold);box-shadow:0 0 7px rgba(216,174,82,.45)}
.fingers.warn.on i{background:var(--amber);box-shadow:0 0 7px rgba(227,168,60,.4)}
.fingers.bad.on i{background:var(--red);box-shadow:0 0 7px rgba(224,90,72,.4)}

.btn{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;border:1px solid var(--trace);background:transparent;
  color:var(--silk);padding:7px 12px;cursor:pointer;transition:all .16s}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn-gold{background:var(--gold);color:#0A1610;border-color:var(--gold);font-weight:600}
.btn-gold:hover{background:#EFC468;color:#0A1610}
.btn:focus-visible,.chip:focus-visible,input:focus-visible,select:focus-visible,
.slot:focus-visible,.card:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

.chip{font-family:'IBM Plex Mono',monospace;font-size:10.5px;padding:4px 8px;
  border:1px solid var(--trace);background:transparent;color:var(--silk-dim);
  cursor:pointer;transition:all .14s;white-space:nowrap}
.chip:hover{border-color:var(--gold-dim);color:var(--silk)}
.chip.sel{background:var(--gold);color:#0A1610;border-color:var(--gold);font-weight:600}

.card{background:var(--board-2);border:1px solid var(--trace);transition:all .18s;
  cursor:pointer;position:relative;overflow:hidden}
.card:hover{border-color:var(--gold-dim);transform:translateY(-2px)}
.card.blocked{opacity:.34}
.card.blocked:hover{transform:none;border-color:var(--red)}

.slot{display:flex;gap:10px;padding:9px 10px;border:1px solid var(--trace);
  background:var(--board-2);cursor:pointer;transition:all .16s;width:100%;text-align:left}
.slot:hover{border-color:var(--gold-dim);background:var(--board-3)}
.slot.active{border-color:var(--gold)}

input[type=text],input[type=number],select{background:var(--board);border:1px solid var(--trace);
  color:var(--silk);padding:7px 9px;font-family:'IBM Plex Mono',monospace;font-size:12px;width:100%}
input[type=range]{accent-color:var(--gold);width:100%}

.log-ok{color:var(--cyan)} .log-warn{color:var(--amber)} .log-fail{color:var(--red)}
.log-row{display:grid;grid-template-columns:52px 42px 84px 1fr;gap:8px;
  font-family:'IBM Plex Mono',monospace;font-size:11px;padding:3px 0;
  border-bottom:1px solid rgba(30,69,52,.4)}

@keyframes sweep{from{transform:translateX(-100%)}to{transform:translateX(340%)}}
.gauge-sweep{animation:sweep 2.6s ease-in-out infinite}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.fade{animation:fadeUp .22s ease-out both}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
}
.scroll{overflow-y:auto}
.trunc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

/* ── Regiones y tiendas ──────────────────────────────────────────
   Cada patrón de búsqueda está verificado. kind: "tienda" | "comparador"
   ─────────────────────────────────────────────────────────────── */
const S = (id,name,kind,url)=>({id,name,kind,url});
const REGIONS = {
  ES: { label:"España", cur:"€", stores:[
    S("pccom","PcComponentes","tienda",     q=>`https://www.pccomponentes.com/buscar/?query=${q}`),
    S("coolmod","Coolmod","tienda",         q=>`https://www.coolmod.com/busqueda?controller=search&s=${q}`),
    S("ldlc","LDLC España","tienda",        q=>`https://www.ldlc.com/es-es/buscar/${q}/`),
    S("neobyte","Neobyte","tienda",         q=>`https://www.neobyte.es/busqueda?search_query=${q}`),
    S("pcbox","PCBox","tienda",             q=>`https://www.pcbox.com/buscar?q=${q}`),
    S("mediamarkt","MediaMarkt","tienda",   q=>`https://www.mediamarkt.es/es/search.html?query=${q}`),
    S("amzes","Amazon.es","tienda",         q=>`https://www.amazon.es/s?k=${q}`),
    S("geizes","Geizhals","comparador",     q=>`https://geizhals.eu/?fs=${q}`),
  ]},
  EU: { label:"Europa", cur:"€", stores:[
    S("mindf","Mindfactory","tienda",       q=>`https://www.mindfactory.de/search_result.php?search_query=${q}`),
    S("alt","Alternate","tienda",           q=>`https://www.alternate.de/listing.xhtml?q=${q}`),
    S("caseking","Caseking","tienda",       q=>`https://www.caseking.de/search?sSearch=${q}`),
    S("amzde","Amazon.de","tienda",         q=>`https://www.amazon.de/s?k=${q}`),
    S("ldlcfr","LDLC Francia","tienda",     q=>`https://www.ldlc.com/recherche/${q}/`),
    S("geiz","Geizhals","comparador",       q=>`https://geizhals.eu/?fs=${q}`),
  ]},
  UK: { label:"Reino Unido", cur:"£", stores:[
    S("scan","Scan UK","tienda",            q=>`https://www.scan.co.uk/search?q=${q}`),
    S("ocuk","Overclockers UK","tienda",    q=>`https://www.overclockers.co.uk/search?sSearch=${q}`),
    S("amzuk","Amazon.co.uk","tienda",      q=>`https://www.amazon.co.uk/s?k=${q}`),
    S("geizuk","Skinflint","comparador",    q=>`https://skinflint.co.uk/?fs=${q}`),
  ]},
  US: { label:"Estados Unidos", cur:"$", stores:[
    S("newegg","Newegg","tienda",           q=>`https://www.newegg.com/p/pl?d=${q}`),
    S("amzus","Amazon.com","tienda",        q=>`https://www.amazon.com/s?k=${q}`),
    S("microc","Micro Center","tienda",     q=>`https://www.microcenter.com/search/search_results.aspx?Ntt=${q}`),
    S("bh","B&H Photo","tienda",            q=>`https://www.bhphotovideo.com/c/search?q=${q}`),
    S("bestbuy","Best Buy","tienda",        q=>`https://www.bestbuy.com/site/searchpage.jsp?st=${q}`),
  ]},
  AP: { label:"Asia-Pacífico", cur:"$", stores:[
    S("pcase","PCCaseGear (AU)","tienda",   q=>`https://www.pccasegear.com/search?q=${q}`),
    S("scorptec","Scorptec (AU)","tienda",  q=>`https://www.scorptec.com.au/search?keywords=${q}`),
    S("amzjp","Amazon.co.jp","tienda",      q=>`https://www.amazon.co.jp/s?k=${q}`),
    S("shopee","Shopee (SG)","tienda",      q=>`https://shopee.sg/search?keyword=${q}`),
    S("kakaku","Kakaku.com (JP)","comparador", q=>`https://kakaku.com/search_results/${q}/`),
  ]},
  LATAM: { label:"Latinoamérica", cur:"$", stores:[
    S("mlar","MercadoLibre (AR)","tienda",  q=>`https://listado.mercadolibre.com.ar/${q}`),
    S("mlmx","MercadoLibre (MX)","tienda",  q=>`https://listado.mercadolibre.com.mx/${q}`),
    S("amzmx","Amazon.mx","tienda",         q=>`https://www.amazon.com.mx/s?k=${q}`),
    S("kabum","Kabum (BR)","tienda",        q=>`https://www.kabum.com.br/busca/${q}`),
  ]},
};

/* ── Categorías ──────────────────────────────────────────────────── */
const CATS = [
  { id:"cpu",     label:"CPU",              icon:Cpu,              group:"core", req:true },
  { id:"cooler",  label:"Refrigeración CPU",icon:Wind,             group:"core", req:true },
  { id:"mbo",     label:"Placa base",       icon:CircuitBoard,     group:"core", req:true },
  { id:"ram",     label:"Memoria RAM",      icon:MemoryStick,      group:"core", req:true, multi:true },
  { id:"gpu",     label:"Gráfica",          icon:MonitorSmartphone,group:"core" },
  { id:"storage", label:"Almacenamiento",   icon:HardDrive,        group:"core", req:true, multi:true },
  { id:"psu",     label:"Fuente",           icon:Zap,              group:"core", req:true },
  { id:"case",    label:"Caja",             icon:Box,              group:"core", req:true },

  { id:"fan",     label:"Ventiladores",     icon:Fan,        group:"aux", multi:true },
  { id:"hub",     label:"Hub de ventiladores",icon:Layers,   group:"aux" },
  { id:"paste",   label:"Pasta térmica",    icon:Droplet,    group:"aux" },
  { id:"rgb",     label:"Tiras LED / RGB",  icon:Lightbulb,  group:"aux", multi:true },
  { id:"cable",   label:"Cables y gestión", icon:Cable,      group:"aux", multi:true },

  { id:"monitor", label:"Monitor",          icon:Monitor,    group:"periph", multi:true },
  { id:"keyboard",label:"Teclado",          icon:Keyboard,   group:"periph" },
  { id:"mouse",   label:"Ratón",            icon:Mouse,      group:"periph" },
  { id:"pad",     label:"Alfombrilla",      icon:Rows3,      group:"periph" },
  { id:"headset", label:"Auriculares",      icon:Headphones, group:"periph" },
  { id:"mic",     label:"Micrófono",        icon:Mic,        group:"periph" },
  { id:"webcam",  label:"Webcam",           icon:Video,      group:"periph" },
  { id:"speaker", label:"Altavoces",        icon:Speaker,    group:"periph" },
];
const GROUPS = [
  { id:"core",   label:"Componentes",  sub:"Se comprueba compatibilidad" },
  { id:"aux",    label:"Auxiliares",   sub:"Filtrado por caja y placa" },
  { id:"periph", label:"Periféricos",  sub:"Sin restricción de montaje" },
];
const CAT = Object.fromEntries(CATS.map(c=>[c.id,c]));

/* ── Sockets y plataformas ───────────────────────────────────────── */
const PLATFORM = {
  AM5:{ mem:["DDR5"], gen:"Zen 4 / Zen 5" },
  AM4:{ mem:["DDR4"], gen:"Zen 1–3" },
  "AM3+":{ mem:["DDR3"], gen:"Bulldozer / Piledriver" },
  sTR5:{ mem:["DDR5-RDIMM"], gen:"Threadripper 7000" },
  LGA1851:{ mem:["DDR5"], gen:"Core Ultra 200S" },
  LGA1700:{ mem:["DDR4","DDR5"], gen:"12ª–14ª gen" },
  LGA1200:{ mem:["DDR4"], gen:"10ª–11ª gen" },
  LGA1151v2:{ mem:["DDR4"], gen:"8ª–9ª gen" },
  LGA1151:{ mem:["DDR4"], gen:"6ª–7ª gen" },
  LGA1150:{ mem:["DDR3"], gen:"4ª–5ª gen (Haswell)" },
  LGA1155:{ mem:["DDR3"], gen:"2ª–3ª gen (Sandy/Ivy)" },
  "LGA2011-v3":{ mem:["DDR4"], gen:"Haswell-E / Broadwell-E" },
  LGA2066:{ mem:["DDR4"], gen:"Core X (Skylake-X)" },
  LGA775:{ mem:["DDR2"], gen:"Core 2 / Pentium 4" },
  sTRX4:{ mem:["DDR4"], gen:"Threadripper 3000" },
  "FM2+":{ mem:["DDR3"], gen:"APU A-Series" },
  DIP16:{ mem:[], gen:"Histórico" },
};

/* Grupos de socket para los anclajes de disipador */
const I_LGA115X=["LGA1200","LGA1151v2","LGA1151","LGA1150","LGA1155"];
const I_MOD=["LGA1851","LGA1700"];
const I_ALL=[...I_MOD,...I_LGA115X];
const A_MOD=["AM5","AM4"];
const A_ALL=[...A_MOD,"FM2+","AM3+"];
const I_HEDT=["LGA2066","LGA2011-v3"];
const UNIV=[...I_ALL,...A_ALL];
const UNIV_MOD=[...I_MOD,...A_MOD,"LGA1200","LGA1151v2"];

/* ── CATÁLOGO ────────────────────────────────────────────────────────
   Precios = orientativos EUR (referencia de encaje de presupuesto).
   El precio real llega del proveedor de precios (ver PRICE PROVIDER).
   ─────────────────────────────────────────────────────────────────── */
const P = [];
const add = (cat, brand, name, price, s) => P.push({
  id:`${cat}-${P.length}`, cat, brand, name, price, ...s
});

/* ── CPU ─────────────────────────────────────────────────────────── */
// Intel LGA1851 — Arrow Lake
add("cpu","Intel","Core Ultra 9 285K",629,{socket:"LGA1851",family:"Core Ultra 200S",cores:24,pcores:8,ecores:16,threads:24,base:3.7,boost:5.7,l2:40,l3:36,tdp:125,ppt:250,mem:["DDR5"],memMax:6400,igpu:"Arc Xe (4 Xe)",lith:"TSMC N3B",pcie:"5.0 ×20",unlocked:true,cooler:false,year:2024});
add("cpu","Intel","Core Ultra 7 265K",389,{socket:"LGA1851",family:"Core Ultra 200S",cores:20,pcores:8,ecores:12,threads:20,base:3.9,boost:5.5,l2:36,l3:30,tdp:125,ppt:250,mem:["DDR5"],memMax:6400,igpu:"Arc Xe (4 Xe)",lith:"TSMC N3B",pcie:"5.0 ×20",unlocked:true,cooler:false,year:2024});
add("cpu","Intel","Core Ultra 5 245K",259,{socket:"LGA1851",family:"Core Ultra 200S",cores:14,pcores:6,ecores:8,threads:14,base:4.2,boost:5.2,l2:26,l3:24,tdp:125,ppt:159,mem:["DDR5"],memMax:6400,igpu:"Arc Xe (4 Xe)",lith:"TSMC N3B",pcie:"5.0 ×20",unlocked:true,cooler:false,year:2024});
// Intel LGA1700
add("cpu","Intel","Core i9-14900K",479,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:24,pcores:8,ecores:16,threads:32,base:3.2,boost:6.0,l2:32,l3:36,tdp:125,ppt:253,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2023});
add("cpu","Intel","Core i7-14700K",359,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:20,pcores:8,ecores:12,threads:28,base:3.4,boost:5.6,l2:28,l3:33,tdp:125,ppt:253,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2023});
add("cpu","Intel","Core i5-14600K",249,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:14,pcores:6,ecores:8,threads:20,base:3.5,boost:5.3,l2:20,l3:24,tdp:125,ppt:181,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2023});
add("cpu","Intel","Core i5-13400F",159,{socket:"LGA1700",family:"13ª gen (Raptor Lake)",cores:10,pcores:6,ecores:4,threads:16,base:2.5,boost:4.6,l2:9.5,l3:20,tdp:65,ppt:148,mem:["DDR4","DDR5"],memMax:4800,igpu:null,lith:"Intel 7",pcie:"5.0 ×16",unlocked:false,cooler:true,year:2023});
add("cpu","Intel","Core i9-12900K",289,{socket:"LGA1700",family:"12ª gen (Alder Lake)",cores:16,pcores:8,ecores:8,threads:24,base:3.2,boost:5.2,l2:14,l3:30,tdp:125,ppt:241,mem:["DDR4","DDR5"],memMax:4800,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2021});
add("cpu","Intel","Core i3-12100F",89,{socket:"LGA1700",family:"12ª gen (Alder Lake)",cores:4,pcores:4,ecores:0,threads:8,base:3.3,boost:4.3,l2:5,l3:12,tdp:58,ppt:89,mem:["DDR4","DDR5"],memMax:4800,igpu:null,lith:"Intel 7",pcie:"5.0 ×16",unlocked:false,cooler:true,year:2022});
// Intel LGA1200 / 1151 / 1150
add("cpu","Intel","Core i9-11900K",249,{socket:"LGA1200",family:"11ª gen (Rocket Lake)",cores:8,pcores:8,ecores:0,threads:16,base:3.5,boost:5.3,l2:4,l3:16,tdp:125,ppt:251,mem:["DDR4"],memMax:3200,igpu:"UHD 750",lith:"Intel 14nm",pcie:"4.0 ×20",unlocked:true,cooler:false,year:2021});
add("cpu","Intel","Core i5-10400F",99,{socket:"LGA1200",family:"10ª gen (Comet Lake)",cores:6,pcores:6,ecores:0,threads:12,base:2.9,boost:4.3,l2:1.5,l3:12,tdp:65,ppt:65,mem:["DDR4"],memMax:2666,igpu:null,lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2020});
add("cpu","Intel","Core i9-9900K",219,{socket:"LGA1151v2",family:"9ª gen (Coffee Lake-R)",cores:8,pcores:8,ecores:0,threads:16,base:3.6,boost:5.0,l2:2,l3:16,tdp:95,ppt:95,mem:["DDR4"],memMax:2666,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2018});
add("cpu","Intel","Core i7-4790K",79,{socket:"LGA1150",family:"4ª gen (Devil's Canyon)",cores:4,pcores:4,ecores:0,threads:8,base:4.0,boost:4.4,l2:1,l3:8,tdp:88,ppt:88,mem:["DDR3"],memMax:1600,igpu:"HD 4600",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2014});
// Museo
add("cpu","Intel","4004",0,{socket:"DIP16",family:"MCS-4 (1971)",cores:1,threads:1,base:0.00074,boost:0.00074,l3:0,tdp:0.5,ppt:0.5,mem:[],igpu:null,lith:"10 µm PMOS",pcie:"—",museum:true,unlocked:false,cooler:false,year:1971,note:"Primer microprocesador comercial. 2.300 transistores, 4 bits."});
add("cpu","Intel","8086",0,{socket:"DIP16",family:"x86 (1978)",cores:1,threads:1,base:5,boost:10,l3:0,tdp:1.7,ppt:1.7,mem:[],igpu:null,lith:"3 µm HMOS",pcie:"—",museum:true,unlocked:false,cooler:false,year:1978,note:"Origen de la arquitectura x86."});
add("cpu","Intel","Core 2 Quad Q6600",0,{socket:"LGA775",family:"Core 2 (Kentsfield)",cores:4,threads:4,base:2.4,boost:2.4,l2:8,l3:0,tdp:105,ppt:105,mem:["DDR2"],igpu:null,lith:"65 nm",pcie:"1.1 ×16",museum:true,unlocked:false,cooler:true,year:2007});
// AMD AM5
add("cpu","AMD","Ryzen 9 9950X3D",699,{socket:"AM5",family:"Zen 5 (Granite Ridge X3D)",cores:16,threads:32,base:4.3,boost:5.7,l2:16,l3:128,tdp:170,ppt:230,mem:["DDR5"],memMax:5600,igpu:"Radeon 2CU",lith:"TSMC N4P",pcie:"5.0 ×24",unlocked:true,cooler:false,x3d:true,year:2025});
add("cpu","AMD","Ryzen 9 9950X",579,{socket:"AM5",family:"Zen 5 (Granite Ridge)",cores:16,threads:32,base:4.3,boost:5.7,l2:16,l3:64,tdp:170,ppt:230,mem:["DDR5"],memMax:5600,igpu:"Radeon 2CU",lith:"TSMC N4P",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2024});
add("cpu","AMD","Ryzen 7 9800X3D",489,{socket:"AM5",family:"Zen 5 (Granite Ridge X3D)",cores:8,threads:16,base:4.7,boost:5.2,l2:8,l3:96,tdp:120,ppt:162,mem:["DDR5"],memMax:5600,igpu:"Radeon 2CU",lith:"TSMC N4P",pcie:"5.0 ×24",unlocked:true,cooler:false,x3d:true,year:2024});
add("cpu","AMD","Ryzen 7 7800X3D",349,{socket:"AM5",family:"Zen 4 (Raphael X3D)",cores:8,threads:16,base:4.2,boost:5.0,l2:8,l3:96,tdp:120,ppt:162,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:false,cooler:false,x3d:true,year:2023});
add("cpu","AMD","Ryzen 9 7950X",449,{socket:"AM5",family:"Zen 4 (Raphael)",cores:16,threads:32,base:4.5,boost:5.7,l2:16,l3:64,tdp:170,ppt:230,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2022});
add("cpu","AMD","Ryzen 5 9600X",239,{socket:"AM5",family:"Zen 5 (Granite Ridge)",cores:6,threads:12,base:3.9,boost:5.4,l2:6,l3:32,tdp:65,ppt:88,mem:["DDR5"],memMax:5600,igpu:"Radeon 2CU",lith:"TSMC N4P",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2024});
add("cpu","AMD","Ryzen 5 7600",179,{socket:"AM5",family:"Zen 4 (Raphael)",cores:6,threads:12,base:3.8,boost:5.1,l2:6,l3:32,tdp:65,ppt:88,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:true,cooler:true,year:2023});
// AMD AM4
add("cpu","AMD","Ryzen 7 5800X3D",219,{socket:"AM4",family:"Zen 3 (Vermeer X3D)",cores:8,threads:16,base:3.4,boost:4.5,l2:4,l3:96,tdp:105,ppt:142,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:false,cooler:false,x3d:true,year:2022});
add("cpu","AMD","Ryzen 9 5950X",329,{socket:"AM4",family:"Zen 3 (Vermeer)",cores:16,threads:32,base:3.4,boost:4.9,l2:8,l3:64,tdp:105,ppt:142,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:false,year:2020});
add("cpu","AMD","Ryzen 5 5600",109,{socket:"AM4",family:"Zen 3 (Vermeer)",cores:6,threads:12,base:3.5,boost:4.4,l2:3,l3:32,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:true,year:2022});
add("cpu","AMD","Ryzen 5 3600",89,{socket:"AM4",family:"Zen 2 (Matisse)",cores:6,threads:12,base:3.6,boost:4.2,l2:3,l3:32,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:true,year:2019});
// AMD sTR5
add("cpu","AMD","Ryzen Threadripper PRO 7995WX",9999,{socket:"sTR5",family:"Zen 4 (Storm Peak WX)",cores:96,threads:192,base:2.5,boost:5.1,l2:96,l3:384,tdp:350,ppt:350,mem:["DDR5-RDIMM"],memMax:5200,igpu:null,lith:"TSMC N5",pcie:"5.0 ×128",unlocked:true,cooler:false,hedt:true,year:2023});
add("cpu","AMD","Ryzen Threadripper 7980X",4899,{socket:"sTR5",family:"Zen 4 (Storm Peak)",cores:64,threads:128,base:3.2,boost:5.1,l2:64,l3:256,tdp:350,ppt:350,mem:["DDR5-RDIMM"],memMax:5200,igpu:null,lith:"TSMC N5",pcie:"5.0 ×48",unlocked:true,cooler:false,hedt:true,year:2023});
// AMD legacy
add("cpu","AMD","FX-8350",0,{socket:"AM3+",family:"Piledriver",cores:8,threads:8,base:4.0,boost:4.2,l2:8,l3:8,tdp:125,ppt:125,mem:["DDR3"],memMax:1866,igpu:null,lith:"GF 32nm",pcie:"2.0 ×16",unlocked:true,cooler:true,museum:true,year:2012});

/* ── CPU · ampliación ────────────────────────────────────────────── */
const C=(brand,name,price,o)=>add("cpu",brand,name,price,o);
// Intel LGA1155 · 2ª y 3ª generación (DDR3)
C("Intel","Core i7-3770K",0,{socket:"LGA1155",family:"3ª gen (Ivy Bridge)",cores:4,threads:8,base:3.5,boost:3.9,l2:1,l3:8,tdp:77,ppt:77,mem:["DDR3"],memMax:1600,igpu:"HD 4000",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:true,year:2012,legacy:true});
C("Intel","Core i5-3570K",0,{socket:"LGA1155",family:"3ª gen (Ivy Bridge)",cores:4,threads:4,base:3.4,boost:3.8,l2:1,l3:6,tdp:77,ppt:77,mem:["DDR3"],memMax:1600,igpu:"HD 4000",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:true,year:2012,legacy:true});
C("Intel","Core i7-2600K",0,{socket:"LGA1155",family:"2ª gen (Sandy Bridge)",cores:4,threads:8,base:3.4,boost:3.8,l2:1,l3:8,tdp:95,ppt:95,mem:["DDR3"],memMax:1333,igpu:"HD 3000",lith:"Intel 32nm",pcie:"2.0 ×16",unlocked:true,cooler:true,year:2011,legacy:true});
C("Intel","Core i5-2500K",0,{socket:"LGA1155",family:"2ª gen (Sandy Bridge)",cores:4,threads:4,base:3.3,boost:3.7,l2:1,l3:6,tdp:95,ppt:95,mem:["DDR3"],memMax:1333,igpu:"HD 3000",lith:"Intel 32nm",pcie:"2.0 ×16",unlocked:true,cooler:true,year:2011,legacy:true});
C("Intel","Pentium G2020",0,{socket:"LGA1155",family:"Pentium (Ivy Bridge)",cores:2,threads:2,base:2.9,boost:2.9,l2:0.5,l3:3,tdp:55,ppt:55,mem:["DDR3"],memMax:1600,igpu:"HD Graphics",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2013,legacy:true});
C("Intel","Celeron G1610",0,{socket:"LGA1155",family:"Celeron (Ivy Bridge)",cores:2,threads:2,base:2.6,boost:2.6,l2:0.5,l3:2,tdp:55,ppt:55,mem:["DDR3"],memMax:1333,igpu:"HD Graphics",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2013,legacy:true});
// Intel LGA1150 · 4ª y 5ª generación (DDR3)
C("Intel","Core i7-4770K",0,{socket:"LGA1150",family:"4ª gen (Haswell)",cores:4,threads:8,base:3.5,boost:3.9,l2:1,l3:8,tdp:84,ppt:84,mem:["DDR3"],memMax:1600,igpu:"HD 4600",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2013,legacy:true});
C("Intel","Core i5-4690K",0,{socket:"LGA1150",family:"4ª gen (Devil's Canyon)",cores:4,threads:4,base:3.5,boost:3.9,l2:1,l3:6,tdp:88,ppt:88,mem:["DDR3"],memMax:1600,igpu:"HD 4600",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2014,legacy:true});
C("Intel","Core i3-4160",0,{socket:"LGA1150",family:"4ª gen (Haswell)",cores:2,threads:4,base:3.6,boost:3.6,l2:0.5,l3:3,tdp:54,ppt:54,mem:["DDR3"],memMax:1600,igpu:"HD 4400",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2014,legacy:true});
C("Intel","Pentium G3258 Anniversary",0,{socket:"LGA1150",family:"Pentium (Haswell)",cores:2,threads:2,base:3.2,boost:3.2,l2:0.5,l3:3,tdp:53,ppt:53,mem:["DDR3"],memMax:1333,igpu:"HD Graphics",lith:"Intel 22nm",pcie:"3.0 ×16",unlocked:true,cooler:true,year:2014,legacy:true});
// Intel LGA1151 · 6ª y 7ª generación (DDR4)
C("Intel","Core i7-7700K",0,{socket:"LGA1151",family:"7ª gen (Kaby Lake)",cores:4,threads:8,base:4.2,boost:4.5,l2:1,l3:8,tdp:91,ppt:91,mem:["DDR4"],memMax:2400,igpu:"HD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2017,legacy:true});
C("Intel","Core i7-6700K",0,{socket:"LGA1151",family:"6ª gen (Skylake)",cores:4,threads:8,base:4.0,boost:4.2,l2:1,l3:8,tdp:91,ppt:91,mem:["DDR4"],memMax:2133,igpu:"HD 530",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2015,legacy:true});
C("Intel","Core i5-6600K",0,{socket:"LGA1151",family:"6ª gen (Skylake)",cores:4,threads:4,base:3.5,boost:3.9,l2:1,l3:6,tdp:91,ppt:91,mem:["DDR4"],memMax:2133,igpu:"HD 530",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2015,legacy:true});
C("Intel","Core i5-7500",0,{socket:"LGA1151",family:"7ª gen (Kaby Lake)",cores:4,threads:4,base:3.4,boost:3.8,l2:1,l3:6,tdp:65,ppt:65,mem:["DDR4"],memMax:2400,igpu:"HD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
C("Intel","Core i3-7100",0,{socket:"LGA1151",family:"7ª gen (Kaby Lake)",cores:2,threads:4,base:3.9,boost:3.9,l2:0.5,l3:3,tdp:51,ppt:51,mem:["DDR4"],memMax:2400,igpu:"HD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
C("Intel","Pentium G4560",0,{socket:"LGA1151",family:"Pentium (Kaby Lake)",cores:2,threads:4,base:3.5,boost:3.5,l2:0.5,l3:3,tdp:54,ppt:54,mem:["DDR4"],memMax:2400,igpu:"HD 610",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
C("Intel","Celeron G3930",0,{socket:"LGA1151",family:"Celeron (Kaby Lake)",cores:2,threads:2,base:2.9,boost:2.9,l2:0.5,l3:2,tdp:51,ppt:51,mem:["DDR4"],memMax:2133,igpu:"HD 610",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
// Intel LGA1151v2 · 8ª y 9ª generación
C("Intel","Core i7-9700K",0,{socket:"LGA1151v2",family:"9ª gen (Coffee Lake-R)",cores:8,threads:8,base:3.6,boost:4.9,l2:2,l3:12,tdp:95,ppt:95,mem:["DDR4"],memMax:2666,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2018,legacy:true});
C("Intel","Core i5-9600K",0,{socket:"LGA1151v2",family:"9ª gen (Coffee Lake-R)",cores:6,threads:6,base:3.7,boost:4.6,l2:1.5,l3:9,tdp:95,ppt:95,mem:["DDR4"],memMax:2666,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2018,legacy:true});
C("Intel","Core i5-8400",0,{socket:"LGA1151v2",family:"8ª gen (Coffee Lake)",cores:6,threads:6,base:2.8,boost:4.0,l2:1.5,l3:9,tdp:65,ppt:65,mem:["DDR4"],memMax:2666,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
C("Intel","Core i3-8100",0,{socket:"LGA1151v2",family:"8ª gen (Coffee Lake)",cores:4,threads:4,base:3.6,boost:3.6,l2:1,l3:6,tdp:65,ppt:65,mem:["DDR4"],memMax:2400,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2017,legacy:true});
C("Intel","Pentium Gold G5400",0,{socket:"LGA1151v2",family:"Pentium (Coffee Lake)",cores:2,threads:4,base:3.7,boost:3.7,l2:0.5,l3:4,tdp:58,ppt:58,mem:["DDR4"],memMax:2400,igpu:"UHD 610",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2018,legacy:true});
// Intel LGA1200 · 10ª y 11ª generación
C("Intel","Core i9-10900K",0,{socket:"LGA1200",family:"10ª gen (Comet Lake)",cores:10,threads:20,base:3.7,boost:5.3,l2:2.5,l3:20,tdp:125,ppt:250,mem:["DDR4"],memMax:2933,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2020,legacy:true});
C("Intel","Core i7-10700K",0,{socket:"LGA1200",family:"10ª gen (Comet Lake)",cores:8,threads:16,base:3.8,boost:5.1,l2:2,l3:16,tdp:125,ppt:229,mem:["DDR4"],memMax:2933,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:true,cooler:false,year:2020,legacy:true});
C("Intel","Core i5-11600K",0,{socket:"LGA1200",family:"11ª gen (Rocket Lake)",cores:6,threads:12,base:3.9,boost:4.9,l2:3,l3:12,tdp:125,ppt:224,mem:["DDR4"],memMax:3200,igpu:"UHD 750",lith:"Intel 14nm",pcie:"4.0 ×20",unlocked:true,cooler:false,year:2021,legacy:true});
C("Intel","Core i3-10100",0,{socket:"LGA1200",family:"10ª gen (Comet Lake)",cores:4,threads:8,base:3.6,boost:4.3,l2:1,l3:6,tdp:65,ppt:90,mem:["DDR4"],memMax:2666,igpu:"UHD 630",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2020,legacy:true});
C("Intel","Pentium Gold G6400",0,{socket:"LGA1200",family:"Pentium (Comet Lake)",cores:2,threads:4,base:4.0,boost:4.0,l2:0.5,l3:4,tdp:58,ppt:58,mem:["DDR4"],memMax:2666,igpu:"UHD 610",lith:"Intel 14nm",pcie:"3.0 ×16",unlocked:false,cooler:true,year:2020,legacy:true});
// Intel LGA1700 · ampliación
C("Intel","Core i9-14900KS",629,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:24,pcores:8,ecores:16,threads:32,base:3.2,boost:6.2,l2:32,l3:36,tdp:150,ppt:253,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2024});
C("Intel","Core i9-13900K",419,{socket:"LGA1700",family:"13ª gen (Raptor Lake)",cores:24,pcores:8,ecores:16,threads:32,base:3.0,boost:5.8,l2:32,l3:36,tdp:125,ppt:253,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2022});
C("Intel","Core i7-13700K",329,{socket:"LGA1700",family:"13ª gen (Raptor Lake)",cores:16,pcores:8,ecores:8,threads:24,base:3.4,boost:5.4,l2:24,l3:30,tdp:125,ppt:253,mem:["DDR4","DDR5"],memMax:5600,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2022});
C("Intel","Core i5-14400F",179,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:10,pcores:6,ecores:4,threads:16,base:2.5,boost:4.7,l2:9.5,l3:20,tdp:65,ppt:148,mem:["DDR4","DDR5"],memMax:4800,igpu:null,lith:"Intel 7",pcie:"4.0 ×16",unlocked:false,cooler:true,year:2024});
C("Intel","Core i5-12600K",179,{socket:"LGA1700",family:"12ª gen (Alder Lake)",cores:10,pcores:6,ecores:4,threads:16,base:3.7,boost:4.9,l2:9.5,l3:20,tdp:125,ppt:150,mem:["DDR4","DDR5"],memMax:4800,igpu:"UHD 770",lith:"Intel 7",pcie:"5.0 ×16",unlocked:true,cooler:false,year:2021});
C("Intel","Core i5-12400F",119,{socket:"LGA1700",family:"12ª gen (Alder Lake)",cores:6,pcores:6,ecores:0,threads:12,base:2.5,boost:4.4,l2:7.5,l3:18,tdp:65,ppt:117,mem:["DDR4","DDR5"],memMax:4800,igpu:null,lith:"Intel 7",pcie:"5.0 ×16",unlocked:false,cooler:true,year:2022});
C("Intel","Core i3-14100",129,{socket:"LGA1700",family:"14ª gen (Raptor Lake-R)",cores:4,pcores:4,ecores:0,threads:8,base:3.5,boost:4.7,l2:5,l3:12,tdp:60,ppt:110,mem:["DDR4","DDR5"],memMax:4800,igpu:"UHD 730",lith:"Intel 7",pcie:"5.0 ×16",unlocked:false,cooler:true,year:2024});
C("Intel","Pentium Gold G7400",69,{socket:"LGA1700",family:"Pentium (Alder Lake)",cores:2,pcores:2,ecores:0,threads:4,base:3.7,boost:3.7,l2:2.5,l3:6,tdp:46,ppt:46,mem:["DDR4","DDR5"],memMax:3200,igpu:"UHD 710",lith:"Intel 7",pcie:"4.0 ×16",unlocked:false,cooler:true,year:2022});
C("Intel","Core Ultra 5 225F",199,{socket:"LGA1851",family:"Core Ultra 200S",cores:10,pcores:6,ecores:4,threads:10,base:3.3,boost:4.9,l2:22,l3:20,tdp:65,ppt:121,mem:["DDR5"],memMax:6400,igpu:null,lith:"TSMC N3B",pcie:"5.0 ×20",unlocked:false,cooler:true,year:2025});
// Intel HEDT
C("Intel","Core i9-10980XE",0,{socket:"LGA2066",family:"Core X (Cascade Lake-X)",cores:18,threads:36,base:3.0,boost:4.6,l2:18,l3:24.75,tdp:165,ppt:165,mem:["DDR4"],memMax:2933,igpu:null,lith:"Intel 14nm",pcie:"3.0 ×48",unlocked:true,cooler:false,hedt:true,year:2019,legacy:true});
C("Intel","Core i7-5960X",0,{socket:"LGA2011-v3",family:"Haswell-E",cores:8,threads:16,base:3.0,boost:3.5,l2:2,l3:20,tdp:140,ppt:140,mem:["DDR4"],memMax:2133,igpu:null,lith:"Intel 22nm",pcie:"3.0 ×40",unlocked:true,cooler:false,hedt:true,year:2014,legacy:true});
// AMD AM5 · ampliación
C("AMD","Ryzen 9 7950X3D",549,{socket:"AM5",family:"Zen 4 (Raphael X3D)",cores:16,threads:32,base:4.2,boost:5.7,l2:16,l3:128,tdp:120,ppt:162,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:true,cooler:false,x3d:true,year:2023});
C("AMD","Ryzen 9 7900X",329,{socket:"AM5",family:"Zen 4 (Raphael)",cores:12,threads:24,base:4.7,boost:5.6,l2:12,l3:64,tdp:170,ppt:230,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2022});
C("AMD","Ryzen 7 9700X",309,{socket:"AM5",family:"Zen 5 (Granite Ridge)",cores:8,threads:16,base:3.8,boost:5.5,l2:8,l3:32,tdp:65,ppt:88,mem:["DDR5"],memMax:5600,igpu:"Radeon 2CU",lith:"TSMC N4P",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2024});
C("AMD","Ryzen 7 7700X",279,{socket:"AM5",family:"Zen 4 (Raphael)",cores:8,threads:16,base:4.5,boost:5.4,l2:8,l3:32,tdp:105,ppt:142,mem:["DDR5"],memMax:5200,igpu:"Radeon 2CU",lith:"TSMC N5",pcie:"5.0 ×24",unlocked:true,cooler:false,year:2022});
C("AMD","Ryzen 7 8700G",289,{socket:"AM5",family:"Zen 4 APU (Hawk Point)",cores:8,threads:16,base:4.2,boost:5.1,l2:8,l3:16,tdp:65,ppt:88,mem:["DDR5"],memMax:5200,igpu:"Radeon 780M (12CU)",lith:"TSMC N4",pcie:"4.0 ×16",unlocked:true,cooler:true,apu:true,year:2024});
C("AMD","Ryzen 5 8600G",199,{socket:"AM5",family:"Zen 4 APU (Hawk Point)",cores:6,threads:12,base:4.3,boost:5.0,l2:6,l3:16,tdp:65,ppt:88,mem:["DDR5"],memMax:5200,igpu:"Radeon 760M (8CU)",lith:"TSMC N4",pcie:"4.0 ×16",unlocked:true,cooler:true,apu:true,year:2024});
// AMD AM4 · ampliación
C("AMD","Ryzen 9 5900X",279,{socket:"AM4",family:"Zen 3 (Vermeer)",cores:12,threads:24,base:3.7,boost:4.8,l2:6,l3:64,tdp:105,ppt:142,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:false,year:2020});
C("AMD","Ryzen 7 5800X",189,{socket:"AM4",family:"Zen 3 (Vermeer)",cores:8,threads:16,base:3.8,boost:4.7,l2:4,l3:32,tdp:105,ppt:142,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:false,year:2020});
C("AMD","Ryzen 5 5600X",129,{socket:"AM4",family:"Zen 3 (Vermeer)",cores:6,threads:12,base:3.7,boost:4.6,l2:3,l3:32,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:true,year:2020});
C("AMD","Ryzen 5 5500",79,{socket:"AM4",family:"Zen 3 (Cezanne)",cores:6,threads:12,base:3.6,boost:4.2,l2:3,l3:16,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"3.0 ×16",unlocked:true,cooler:true,year:2022});
C("AMD","Ryzen 7 5700G",159,{socket:"AM4",family:"Zen 3 APU (Cezanne)",cores:8,threads:16,base:3.8,boost:4.6,l2:4,l3:16,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:"Radeon Vega 8",lith:"TSMC N7",pcie:"3.0 ×16",unlocked:true,cooler:true,apu:true,year:2021});
C("AMD","Ryzen 5 5600G",119,{socket:"AM4",family:"Zen 3 APU (Cezanne)",cores:6,threads:12,base:3.9,boost:4.4,l2:3,l3:16,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:"Radeon Vega 7",lith:"TSMC N7",pcie:"3.0 ×16",unlocked:true,cooler:true,apu:true,year:2021});
C("AMD","Ryzen 9 3900X",0,{socket:"AM4",family:"Zen 2 (Matisse)",cores:12,threads:24,base:3.8,boost:4.6,l2:6,l3:64,tdp:105,ppt:142,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:true,year:2019,legacy:true});
C("AMD","Ryzen 7 3700X",0,{socket:"AM4",family:"Zen 2 (Matisse)",cores:8,threads:16,base:3.6,boost:4.4,l2:4,l3:32,tdp:65,ppt:88,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×24",unlocked:true,cooler:true,year:2019,legacy:true});
C("AMD","Ryzen 7 2700X",0,{socket:"AM4",family:"Zen+ (Pinnacle Ridge)",cores:8,threads:16,base:3.7,boost:4.3,l2:4,l3:16,tdp:105,ppt:141,mem:["DDR4"],memMax:2933,igpu:null,lith:"GF 12nm",pcie:"3.0 ×24",unlocked:true,cooler:true,year:2018,legacy:true});
C("AMD","Ryzen 5 2600",0,{socket:"AM4",family:"Zen+ (Pinnacle Ridge)",cores:6,threads:12,base:3.4,boost:3.9,l2:3,l3:16,tdp:65,ppt:88,mem:["DDR4"],memMax:2933,igpu:null,lith:"GF 12nm",pcie:"3.0 ×24",unlocked:true,cooler:true,year:2018,legacy:true});
C("AMD","Ryzen 7 1800X",0,{socket:"AM4",family:"Zen (Summit Ridge)",cores:8,threads:16,base:3.6,boost:4.0,l2:4,l3:16,tdp:95,ppt:128,mem:["DDR4"],memMax:2666,igpu:null,lith:"GF 14nm",pcie:"3.0 ×24",unlocked:true,cooler:false,year:2017,legacy:true});
C("AMD","Ryzen 5 1600",0,{socket:"AM4",family:"Zen (Summit Ridge)",cores:6,threads:12,base:3.2,boost:3.6,l2:3,l3:16,tdp:65,ppt:88,mem:["DDR4"],memMax:2666,igpu:null,lith:"GF 14nm",pcie:"3.0 ×24",unlocked:true,cooler:true,year:2017,legacy:true});
C("AMD","Athlon 3000G",0,{socket:"AM4",family:"Zen APU (Picasso)",cores:2,threads:4,base:3.5,boost:3.5,l2:1,l3:4,tdp:35,ppt:35,mem:["DDR4"],memMax:2666,igpu:"Radeon Vega 3",lith:"GF 12nm",pcie:"3.0 ×8",unlocked:true,cooler:true,apu:true,year:2019,legacy:true});
// AMD clásicas y HEDT
C("AMD","FX-6300",0,{socket:"AM3+",family:"Piledriver",cores:6,threads:6,base:3.5,boost:4.1,l2:6,l3:8,tdp:95,ppt:95,mem:["DDR3"],memMax:1866,igpu:null,lith:"GF 32nm",pcie:"2.0 ×16",unlocked:true,cooler:true,year:2012,legacy:true});
C("AMD","A10-7850K",0,{socket:"FM2+",family:"Kaveri APU",cores:4,threads:4,base:3.7,boost:4.0,l2:4,l3:0,tdp:95,ppt:95,mem:["DDR3"],memMax:2133,igpu:"Radeon R7 (8CU)",lith:"GF 28nm",pcie:"3.0 ×16",unlocked:true,cooler:true,apu:true,year:2014,legacy:true});
C("AMD","Athlon X4 860K",0,{socket:"FM2+",family:"Kaveri",cores:4,threads:4,base:3.7,boost:4.0,l2:4,l3:0,tdp:95,ppt:95,mem:["DDR3"],memMax:2133,igpu:null,lith:"GF 28nm",pcie:"3.0 ×16",unlocked:true,cooler:true,year:2014,legacy:true});
C("AMD","Ryzen Threadripper 3970X",0,{socket:"sTRX4",family:"Zen 2 (Castle Peak)",cores:32,threads:64,base:3.7,boost:4.5,l2:16,l3:128,tdp:280,ppt:280,mem:["DDR4"],memMax:3200,igpu:null,lith:"TSMC N7",pcie:"4.0 ×64",unlocked:true,cooler:false,hedt:true,year:2019,legacy:true});

/* ── PLACAS BASE ─────────────────────────────────────────────────── */
add("mbo","ASUS","ROG Strix X870E-E Gaming WiFi",519,{socket:"AM5",chipset:"X870E",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8000,pcie16:["5.0 ×16","4.0 ×4"],m2:5,m2gen5:2,sata:4,usbC:"USB4 ×2 (40 Gb/s)",usbA:"3.2 G2 ×6, 3.2 G1 ×4",tb:true,lan:"5 GbE",wifi:"Wi-Fi 7",audio:"ALC4080",vrm:"18+2+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
add("mbo","ASUS","ROG Strix X670E-E Gaming WiFi",429,{socket:"AM5",chipset:"X670E",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:128,memOC:6400,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:2,sata:6,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×6, 3.2 G1 ×6",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC4080",vrm:"18+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2022});
add("mbo","MSI","MAG B650 Tomahawk WiFi",219,{socket:"AM5",chipset:"B650",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:7200,pcie16:["4.0 ×16","3.0 ×2"],m2:3,m2gen5:1,sata:6,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×4, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC4080",vrm:"14+2+1",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2022});
add("mbo","Gigabyte","B650I AORUS Ultra",249,{socket:"AM5",chipset:"B650",form:"Mini-ITX",memType:"DDR5",dimm:2,memMaxGB:96,memOC:8000,pcie16:["4.0 ×16"],m2:3,m2gen5:1,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×4, 3.2 G1 ×2",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC1220",vrm:"10+2+1",bios_flashback:true,rgbHdr:2,fanHdr:4,year:2023});
add("mbo","ASRock","B850 Pro RS",179,{socket:"AM5",chipset:"B850",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8000,pcie16:["5.0 ×16","4.0 ×4"],m2:3,m2gen5:1,sata:4,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×3, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:null,audio:"ALC897",vrm:"14+2+1",bios_flashback:true,rgbHdr:3,fanHdr:6,year:2025});
add("mbo","MSI","MAG B550 Tomahawk",149,{socket:"AM4",chipset:"B550",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4866,pcie16:["4.0 ×16","3.0 ×4"],m2:2,m2gen5:0,sata:6,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×2, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:null,audio:"ALC1200",vrm:"10+2+1",bios_flashback:true,rgbHdr:4,fanHdr:6,year:2020});
add("mbo","ASUS","TUF Gaming X570-Plus (Wi-Fi)",179,{socket:"AM4",chipset:"X570",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4400,pcie16:["4.0 ×16","4.0 ×4"],m2:2,m2gen5:0,sata:8,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×4, 3.2 G1 ×4",tb:false,lan:"1 GbE",wifi:"Wi-Fi 5",audio:"S1200A",vrm:"12+2",bios_flashback:false,rgbHdr:4,fanHdr:6,year:2019});
add("mbo","ASUS","Pro WS WRX90E-SAGE SE",1349,{socket:"sTR5",chipset:"WRX90",form:"EEB",memType:"DDR5-RDIMM",dimm:8,memMaxGB:2048,memOC:5200,pcie16:["5.0 ×16 ×7"],m2:4,m2gen5:4,sata:4,usbC:"USB4 ×2",usbA:"3.2 G2 ×6",tb:true,lan:"10 GbE ×2",wifi:null,audio:"ALC1220P",vrm:"16+8+4",bios_flashback:true,rgbHdr:2,fanHdr:9,year:2023});
add("mbo","ASUS","ROG Strix Z890-A Gaming WiFi",359,{socket:"LGA1851",chipset:"Z890",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:9200,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:1,sata:4,usbC:"Thunderbolt 4 ×2",usbA:"3.2 G2 ×5, 3.2 G1 ×4",tb:true,lan:"2.5 GbE",wifi:"Wi-Fi 7",audio:"ALC4080",vrm:"16+1+2+1",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
add("mbo","MSI","PRO B860-P WiFi",189,{socket:"LGA1851",chipset:"B860",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8200,pcie16:["5.0 ×16","4.0 ×4"],m2:3,m2gen5:1,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×4, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC897",vrm:"12+1+1",bios_flashback:true,rgbHdr:3,fanHdr:6,year:2025});
add("mbo","ASUS","ROG Strix Z790-A Gaming WiFi II",319,{socket:"LGA1700",chipset:"Z790",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:192,memOC:7800,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:0,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×5, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 7",audio:"ALC4080",vrm:"16+1+2",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2023});
add("mbo","MSI","MAG B760 Tomahawk WiFi DDR4",179,{socket:"LGA1700",chipset:"B760",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["4.0 ×16","3.0 ×4"],m2:3,m2gen5:0,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×3, 3.2 G1 ×4",tb:false,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC4080",vrm:"12+1+1",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2023});
add("mbo","Gigabyte","B660M DS3H DDR4",99,{socket:"LGA1700",chipset:"B660",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["4.0 ×16","3.0 ×4"],m2:2,m2gen5:0,sata:4,usbC:"3.2 G1 ×1",usbA:"3.2 G1 ×4, 2.0 ×4",tb:false,lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"6+2+1",bios_flashback:false,rgbHdr:2,fanHdr:4,year:2022});
add("mbo","ASUS","TUF Gaming B560M-Plus WiFi",119,{socket:"LGA1200",chipset:"B560",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5000,pcie16:["4.0 ×16"],m2:2,m2gen5:0,sata:6,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×2, 3.2 G1 ×4",tb:false,lan:"1 GbE",wifi:"Wi-Fi 6",audio:"S1200A",vrm:"8+1",bios_flashback:false,rgbHdr:3,fanHdr:5,year:2021});
add("mbo","ASUS","Z97-A",0,{socket:"LGA1150",chipset:"Z97",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:3200,pcie16:["3.0 ×16","2.0 ×4"],m2:1,m2gen5:0,sata:6,usbC:null,usbA:"3.0 ×6, 2.0 ×8",tb:false,lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"8",bios_flashback:false,rgbHdr:0,fanHdr:4,museum:true,year:2014});
add("mbo","ASUS","M5A97 R2.0",0,{socket:"AM3+",chipset:"AMD 970",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:2133,pcie16:["2.0 ×16"],m2:0,m2gen5:0,sata:6,usbC:null,usbA:"3.0 ×2, 2.0 ×12",tb:false,lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"6+2",bios_flashback:false,rgbHdr:0,fanHdr:4,museum:true,year:2012});

/* ── PLACAS BASE · ampliación ────────────────────────────────────── */
const M=(brand,name,price,o)=>add("mbo",brand,name,price,{m2gen5:0,tb:false,bios_flashback:false,...o});
// AM5 · serie 600 y 800
M("Gigabyte","X870E AORUS Master",449,{socket:"AM5",chipset:"X870E",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8600,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:2,sata:4,usbC:"USB4 ×2 (40 Gb/s)",usbA:"3.2 G2 ×8",tb:true,lan:"5 GbE",wifi:"Wi-Fi 7",audio:"ALC1220",vrm:"18+2+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
M("MSI","MAG X870 Tomahawk WiFi",329,{socket:"AM5",chipset:"X870",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8400,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:1,sata:4,usbC:"USB4 ×2 (40 Gb/s)",usbA:"3.2 G2 ×5, 3.2 G1 ×4",tb:true,lan:"5 GbE",wifi:"Wi-Fi 7",audio:"ALC4080",vrm:"14+2+1",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
M("Gigabyte","B850 AORUS Elite WiFi7",229,{socket:"AM5",chipset:"B850",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8000,pcie16:["5.0 ×16","4.0 ×4"],m2:3,m2gen5:1,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×4, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 7",audio:"ALC1220",vrm:"14+2+2",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2025});
M("ASRock","B840M-HDV/M.2",109,{socket:"AM5",chipset:"B840",form:"Micro-ATX",memType:"DDR5",dimm:2,memMaxGB:96,memOC:6000,pcie16:["4.0 ×16"],m2:2,sata:4,usbC:"3.2 G1 ×1",usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"6+2+1",rgbHdr:2,fanHdr:4,year:2025});
M("ASUS","ROG Strix B650E-F Gaming WiFi",279,{socket:"AM5",chipset:"B650E",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:128,memOC:6400,pcie16:["5.0 ×16","4.0 ×4"],m2:3,m2gen5:1,sata:4,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×5, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC4080",vrm:"12+2",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2022});
M("Gigabyte","X670 AORUS Elite AX",289,{socket:"AM5",chipset:"X670",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:128,memOC:6666,pcie16:["4.0 ×16","4.0 ×4"],m2:4,sata:6,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×6, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC1220",vrm:"16+2+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2022});
M("ASUS","PRIME A620M-K",79,{socket:"AM5",chipset:"A620",form:"Micro-ATX",memType:"DDR5",dimm:2,memMaxGB:64,memOC:6400,pcie16:["4.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"6+2+1",rgbHdr:1,fanHdr:3,year:2023});
// AM4 · series 300, 400 y 500
M("ASUS","ROG Crosshair VIII Hero (Wi-Fi)",0,{socket:"AM4",chipset:"X570",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4800,pcie16:["4.0 ×16","4.0 ×8"],m2:2,sata:8,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×7, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 5",audio:"S1220",vrm:"14+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2019,legacy:true});
M("Gigabyte","B550 AORUS Elite AX V2",129,{socket:"AM4",chipset:"B550",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4733,pcie16:["4.0 ×16","3.0 ×4"],m2:2,sata:6,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×2, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6",audio:"ALC1200",vrm:"12+2",rgbHdr:4,fanHdr:6,year:2021});
M("ASRock","B550M Pro4",89,{socket:"AM4",chipset:"B550",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4733,pcie16:["4.0 ×16","3.0 ×4"],m2:2,sata:6,usbC:"3.2 G1 ×1",usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC1200",vrm:"8+2",rgbHdr:2,fanHdr:4,year:2020});
M("MSI","B450 TOMAHAWK MAX II",0,{socket:"AM4",chipset:"B450",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4133,pcie16:["3.0 ×16","2.0 ×4"],m2:1,sata:6,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×1, 3.2 G1 ×5",lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"4+2",bios_flashback:true,rgbHdr:2,fanHdr:5,year:2020,legacy:true});
M("ASUS","TUF Gaming X470-Plus",0,{socket:"AM4",chipset:"X470",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:3466,pcie16:["3.0 ×16","2.0 ×4"],m2:2,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×2, 3.1 G1 ×4",lan:"1 GbE",wifi:null,audio:"S1200A",vrm:"10",rgbHdr:2,fanHdr:5,year:2018,legacy:true});
M("Gigabyte","A520M K V2",59,{socket:"AM4",chipset:"A520",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:64,memOC:5100,pcie16:["3.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"5+3",rgbHdr:1,fanHdr:3,year:2021});
M("MSI","B350 TOMAHAWK",0,{socket:"AM4",chipset:"B350",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:3200,pcie16:["3.0 ×16","2.0 ×4"],m2:1,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G1 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"4+2",rgbHdr:1,fanHdr:4,year:2017,legacy:true});
M("ASUS","PRIME X370-PRO",0,{socket:"AM4",chipset:"X370",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:3200,pcie16:["3.0 ×16","3.0 ×8"],m2:1,sata:8,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×1, 3.1 G1 ×8",lan:"1 GbE",wifi:null,audio:"S1220A",vrm:"10",rgbHdr:2,fanHdr:6,year:2017,legacy:true});
M("Gigabyte","GA-A320M-S2H",0,{socket:"AM4",chipset:"A320",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:32,memOC:3200,pcie16:["3.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.1 G1 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"4+2",rgbHdr:1,fanHdr:2,year:2017,legacy:true});
// AMD clásicas y HEDT
M("ASUS","Crosshair V Formula-Z",0,{socket:"AM3+",chipset:"AMD 990FX",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:2133,pcie16:["2.0 ×16","2.0 ×16"],m2:0,sata:8,usbC:null,usbA:"3.0 ×4, 2.0 ×12",lan:"1 GbE",wifi:null,audio:"SupremeFX III",vrm:"8+2",rgbHdr:0,fanHdr:6,year:2012,legacy:true});
M("ASUS","A88X-PRO",0,{socket:"FM2+",chipset:"AMD A88X",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:64,memOC:2400,pcie16:["3.0 ×16","3.0 ×8"],m2:0,sata:8,usbC:null,usbA:"3.0 ×8, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC1150",vrm:"8+2",rgbHdr:0,fanHdr:5,year:2013,legacy:true});
M("ASUS","ROG Strix TRX40-E Gaming",0,{socket:"sTRX4",chipset:"TRX40",form:"E-ATX",memType:"DDR4",dimm:8,memMaxGB:256,memOC:4666,pcie16:["4.0 ×16 ×4"],m2:3,sata:8,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×7",lan:"2.5 GbE",wifi:"Wi-Fi 6",audio:"S1220A",vrm:"16",rgbHdr:4,fanHdr:8,year:2019,legacy:true});
M("ASUS","Pro WS TRX50-SAGE WIFI",949,{socket:"sTR5",chipset:"TRX50",form:"CEB",memType:"DDR5-RDIMM",dimm:4,memMaxGB:1024,memOC:6400,pcie16:["5.0 ×16 ×3"],m2:3,m2gen5:3,sata:4,usbC:"USB4 ×2",usbA:"3.2 G2 ×5",tb:true,lan:"10 GbE",wifi:"Wi-Fi 7",audio:"ALC1220P",vrm:"16+8+4",bios_flashback:true,rgbHdr:2,fanHdr:8,year:2023});
// Intel LGA1851 · serie 800
M("Gigabyte","Z890 AORUS Elite WiFi7",309,{socket:"LGA1851",chipset:"Z890",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:256,memOC:8800,pcie16:["5.0 ×16","4.0 ×4"],m2:4,m2gen5:1,sata:4,usbC:"Thunderbolt 4 ×2",usbA:"3.2 G2 ×5, 3.2 G1 ×4",tb:true,lan:"2.5 GbE",wifi:"Wi-Fi 7",audio:"ALC1220",vrm:"16+1+2",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
M("ASRock","H810M-HDV/M.2",99,{socket:"LGA1851",chipset:"H810",form:"Micro-ATX",memType:"DDR5",dimm:2,memMaxGB:96,memOC:6400,pcie16:["4.0 ×16"],m2:2,sata:4,usbC:"3.2 G1 ×1",usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"6+1+1",rgbHdr:2,fanHdr:4,year:2025});
// Intel LGA1700 · series 600 y 700
M("MSI","MAG Z790 TOMAHAWK MAX WIFI",289,{socket:"LGA1700",chipset:"Z790",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:192,memOC:7800,pcie16:["5.0 ×16","4.0 ×4"],m2:5,sata:6,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×5, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 7",audio:"ALC4080",vrm:"16+1+1",bios_flashback:true,rgbHdr:4,fanHdr:8,year:2024});
M("Gigabyte","H770 Gaming X AX",179,{socket:"LGA1700",chipset:"H770",form:"ATX",memType:"DDR5",dimm:4,memMaxGB:192,memOC:7600,pcie16:["5.0 ×16","4.0 ×4"],m2:4,sata:4,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×3, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC897",vrm:"12+1+1",rgbHdr:4,fanHdr:6,year:2023});
M("ASUS","PRIME B760M-A D4",109,{socket:"LGA1700",chipset:"B760",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["4.0 ×16","3.0 ×4"],m2:2,sata:4,usbC:"3.2 G1 ×1",usbA:"3.2 G2 ×2, 3.2 G1 ×4",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"8+1",rgbHdr:3,fanHdr:5,year:2023});
M("ASUS","ROG STRIX Z690-A Gaming WiFi D4",0,{socket:"LGA1700",chipset:"Z690",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["5.0 ×16","4.0 ×4"],m2:4,sata:6,usbC:"3.2 G2×2 ×1 (20 Gb/s)",usbA:"3.2 G2 ×4, 3.2 G1 ×6",lan:"2.5 GbE",wifi:"Wi-Fi 6",audio:"ALC4080",vrm:"16+1",bios_flashback:true,rgbHdr:4,fanHdr:7,year:2021,legacy:true});
M("MSI","PRO H610M-B DDR4",69,{socket:"LGA1700",chipset:"H610",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:64,memOC:3200,pcie16:["4.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.2 G1 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC897",vrm:"6+1+1",rgbHdr:1,fanHdr:3,year:2022});
M("ASRock","B660M Steel Legend",0,{socket:"LGA1700",chipset:"B660",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5000,pcie16:["4.0 ×16","3.0 ×4"],m2:3,sata:4,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×2, 3.2 G1 ×4",lan:"2.5 GbE",wifi:null,audio:"ALC897",vrm:"13",rgbHdr:3,fanHdr:5,year:2022,legacy:true});
M("Gigabyte","H670 AORUS Elite AX DDR4",0,{socket:"LGA1700",chipset:"H670",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["5.0 ×16","3.0 ×4"],m2:3,sata:6,usbC:"3.2 G2×2 ×1",usbA:"3.2 G2 ×4, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6",audio:"ALC1220",vrm:"16+1+2",rgbHdr:4,fanHdr:6,year:2022,legacy:true});
// Intel LGA1200 · series 400 y 500
M("ASUS","ROG Maximus XIII Hero",0,{socket:"LGA1200",chipset:"Z590",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:5333,pcie16:["4.0 ×16","4.0 ×8"],m2:4,sata:6,usbC:"Thunderbolt 4 ×2",usbA:"3.2 G2 ×6",tb:true,lan:"2.5 GbE",wifi:"Wi-Fi 6E",audio:"ALC4082",vrm:"14+2",rgbHdr:4,fanHdr:8,year:2021,legacy:true});
M("Gigabyte","H510M H",0,{socket:"LGA1200",chipset:"H510",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:64,memOC:3200,pcie16:["4.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.2 G1 ×2, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"6+2",rgbHdr:1,fanHdr:2,year:2021,legacy:true});
M("MSI","MPG Z490 GAMING EDGE WIFI",0,{socket:"LGA1200",chipset:"Z490",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:4800,pcie16:["3.0 ×16","3.0 ×4"],m2:2,sata:6,usbC:"3.2 G2 ×1",usbA:"3.2 G2 ×3, 3.2 G1 ×4",lan:"2.5 GbE",wifi:"Wi-Fi 6",audio:"ALC1200",vrm:"12+1+1",rgbHdr:4,fanHdr:6,year:2020,legacy:true});
M("ASRock","B460M Pro4",0,{socket:"LGA1200",chipset:"B460",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:128,memOC:2933,pcie16:["3.0 ×16","3.0 ×4"],m2:2,sata:6,usbC:"3.2 G1 ×1",usbA:"3.2 G1 ×4, 2.0 ×4",lan:"1 GbE",wifi:null,audio:"ALC1200",vrm:"9",rgbHdr:2,fanHdr:4,year:2020,legacy:true});
M("ASUS","PRIME H410M-E",0,{socket:"LGA1200",chipset:"H410",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:64,memOC:2933,pcie16:["3.0 ×16"],m2:1,sata:4,usbC:null,usbA:"3.2 G1 ×2, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"6+1",rgbHdr:1,fanHdr:2,year:2020,legacy:true});
// Intel LGA1151v2 · serie 300
M("ASUS","ROG STRIX Z390-E GAMING",0,{socket:"LGA1151v2",chipset:"Z390",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:4266,pcie16:["3.0 ×16","3.0 ×8"],m2:2,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×5, 3.1 G1 ×4",lan:"1 GbE",wifi:"Wi-Fi 5",audio:"S1220A",vrm:"12+2",rgbHdr:4,fanHdr:6,year:2018,legacy:true});
M("Gigabyte","Z370 AORUS Gaming 5",0,{socket:"LGA1151v2",chipset:"Z370",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:4133,pcie16:["3.0 ×16","3.0 ×8"],m2:3,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×2, 3.1 G1 ×6",lan:"1 GbE",wifi:null,audio:"ALC1220",vrm:"11",rgbHdr:4,fanHdr:7,year:2017,legacy:true});
M("MSI","B360M PRO-VDH",0,{socket:"LGA1151v2",chipset:"B360",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:2666,pcie16:["3.0 ×16","3.0 ×4"],m2:1,sata:6,usbC:null,usbA:"3.1 G1 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"7",rgbHdr:1,fanHdr:3,year:2018,legacy:true});
M("ASRock","B365M PRO4",0,{socket:"LGA1151v2",chipset:"B365",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:2666,pcie16:["3.0 ×16","3.0 ×4"],m2:2,sata:6,usbC:null,usbA:"3.1 G1 ×6, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"9",rgbHdr:2,fanHdr:4,year:2019,legacy:true});
M("ASUS","PRIME H310M-E",0,{socket:"LGA1151v2",chipset:"H310",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:32,memOC:2666,pcie16:["3.0 ×16"],m2:0,sata:4,usbC:null,usbA:"3.1 G1 ×2, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"5",rgbHdr:0,fanHdr:2,year:2018,legacy:true});
// Intel LGA1151 · series 100 y 200
M("ASUS","MAXIMUS VIII HERO",0,{socket:"LGA1151",chipset:"Z170",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:3733,pcie16:["3.0 ×16","3.0 ×8"],m2:1,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×1, 3.0 ×6",lan:"1 GbE",wifi:null,audio:"S1150",vrm:"8+2",rgbHdr:1,fanHdr:6,year:2015,legacy:true});
M("Gigabyte","GA-Z270-Gaming K3",0,{socket:"LGA1151",chipset:"Z270",form:"ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:3866,pcie16:["3.0 ×16","3.0 ×8"],m2:2,sata:6,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×1, 3.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC1220",vrm:"9",rgbHdr:2,fanHdr:5,year:2017,legacy:true});
M("MSI","B250M PRO-VD",0,{socket:"LGA1151",chipset:"B250",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:32,memOC:2400,pcie16:["3.0 ×16"],m2:1,sata:6,usbC:null,usbA:"3.1 G1 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"5",rgbHdr:0,fanHdr:2,year:2017,legacy:true});
M("ASRock","B150M Pro4",0,{socket:"LGA1151",chipset:"B150",form:"Micro-ATX",memType:"DDR4",dimm:4,memMaxGB:64,memOC:2133,pcie16:["3.0 ×16","3.0 ×4"],m2:1,sata:6,usbC:null,usbA:"3.0 ×6, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"7",rgbHdr:0,fanHdr:4,year:2015,legacy:true});
M("ASUS","H110M-K",0,{socket:"LGA1151",chipset:"H110",form:"Micro-ATX",memType:"DDR4",dimm:2,memMaxGB:32,memOC:2133,pcie16:["3.0 ×16"],m2:0,sata:4,usbC:null,usbA:"3.0 ×2, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"5",rgbHdr:0,fanHdr:2,year:2016,legacy:true});
// Intel LGA1150 y LGA1155 (DDR3)
M("Gigabyte","GA-Z97X-Gaming 5",0,{socket:"LGA1150",chipset:"Z97",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:3100,pcie16:["3.0 ×16","3.0 ×8"],m2:1,sata:6,usbC:null,usbA:"3.0 ×6, 2.0 ×8",lan:"1 GbE",wifi:null,audio:"ALC1150",vrm:"8",rgbHdr:0,fanHdr:5,year:2014,legacy:true});
M("ASUS","H97-PLUS",0,{socket:"LGA1150",chipset:"H97",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:1600,pcie16:["3.0 ×16"],m2:1,sata:6,usbC:null,usbA:"3.0 ×4, 2.0 ×8",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"6",rgbHdr:0,fanHdr:4,year:2014,legacy:true});
M("MSI","Z87-G45 GAMING",0,{socket:"LGA1150",chipset:"Z87",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:3000,pcie16:["3.0 ×16","3.0 ×8"],m2:0,sata:6,usbC:null,usbA:"3.0 ×6, 2.0 ×8",lan:"1 GbE",wifi:null,audio:"ALC1150",vrm:"8",rgbHdr:0,fanHdr:5,year:2013,legacy:true});
M("ASRock","B85M Pro4",0,{socket:"LGA1150",chipset:"B85",form:"Micro-ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:1600,pcie16:["3.0 ×16"],m2:0,sata:6,usbC:null,usbA:"3.0 ×4, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC892",vrm:"6",rgbHdr:0,fanHdr:4,year:2013,legacy:true});
M("ASUS","H81M-K",0,{socket:"LGA1150",chipset:"H81",form:"Micro-ATX",memType:"DDR3",dimm:2,memMaxGB:16,memOC:1600,pcie16:["2.0 ×16"],m2:0,sata:4,usbC:null,usbA:"3.0 ×2, 2.0 ×6",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"4",rgbHdr:0,fanHdr:2,year:2013,legacy:true});
M("ASUS","P8Z77-V LX",0,{socket:"LGA1155",chipset:"Z77",form:"ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:2400,pcie16:["3.0 ×16"],m2:0,sata:6,usbC:null,usbA:"3.0 ×4, 2.0 ×10",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"6",rgbHdr:0,fanHdr:4,year:2012,legacy:true});
M("ASRock","B75 Pro3-M",0,{socket:"LGA1155",chipset:"B75",form:"Micro-ATX",memType:"DDR3",dimm:4,memMaxGB:32,memOC:1600,pcie16:["3.0 ×16"],m2:0,sata:6,usbC:null,usbA:"3.0 ×4, 2.0 ×8",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"5",rgbHdr:0,fanHdr:3,year:2012,legacy:true});
M("ASUS","P8H61-M LE",0,{socket:"LGA1155",chipset:"H61",form:"Micro-ATX",memType:"DDR3",dimm:2,memMaxGB:16,memOC:1333,pcie16:["2.0 ×16"],m2:0,sata:4,usbC:null,usbA:"2.0 ×8",lan:"1 GbE",wifi:null,audio:"ALC887",vrm:"4",rgbHdr:0,fanHdr:2,year:2011,legacy:true});
// Intel HEDT
M("ASUS","X99-A II",0,{socket:"LGA2011-v3",chipset:"X99",form:"ATX",memType:"DDR4",dimm:8,memMaxGB:128,memOC:3333,pcie16:["3.0 ×16","3.0 ×16","3.0 ×8"],m2:1,sata:10,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×1, 3.0 ×8",lan:"1 GbE",wifi:null,audio:"S1220A",vrm:"8",rgbHdr:1,fanHdr:6,year:2016,legacy:true});
M("Gigabyte","X299 AORUS Master",0,{socket:"LGA2066",chipset:"X299",form:"ATX",memType:"DDR4",dimm:8,memMaxGB:256,memOC:4266,pcie16:["3.0 ×16 ×4"],m2:3,sata:8,usbC:"3.1 G2 ×1",usbA:"3.1 G2 ×5, 3.1 G1 ×4",lan:"10 GbE",wifi:"Wi-Fi 5",audio:"ALC1220",vrm:"12+1",rgbHdr:4,fanHdr:8,year:2019,legacy:true});

add("mbo","ASUS","P5Q Deluxe",0,{socket:"LGA775",chipset:"Intel P45",form:"ATX",memType:"DDR2",dimm:4,memMaxGB:16,memOC:1200,pcie16:["2.0 ×16","2.0 ×8"],m2:0,m2gen5:0,sata:8,usbC:null,usbA:"2.0 ×12",tb:false,lan:"1 GbE ×2",wifi:null,audio:"AD2000B",vrm:"16",bios_flashback:false,rgbHdr:0,fanHdr:5,museum:true,year:2008});
add("ram","Corsair","XMS2 8 GB (2×4) DDR2-800 CL5",0,{memType:"DDR2",kit:2,capGB:8,perStick:4,speed:800,cl:5,timings:"5-5-5-18",volt:1.9,profile:"EPP",rgb:false,height:43,watt:8,rank:"2R",die:"Varios",museum:true});

/* ── MEMORIA RAM ─────────────────────────────────────────────────── */
add("ram","G.Skill","Trident Z5 Neo RGB 32 GB (2×16) 6000 CL30",119,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:30,timings:"30-38-38-96",volt:1.35,profile:"EXPO + XMP 3.0",rgb:true,height:44,watt:8,rank:"1R",die:"SK hynix M-die"});
add("ram","Corsair","Vengeance 32 GB (2×16) 6000 CL30",109,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:30,timings:"30-36-36-76",volt:1.4,profile:"EXPO + XMP 3.0",rgb:false,height:34,watt:8,rank:"1R",die:"SK hynix A-die"});
add("ram","Corsair","Dominator Titanium RGB 48 GB (2×24) 7200 CL34",289,{memType:"DDR5",kit:2,capGB:48,perStick:24,speed:7200,cl:34,timings:"34-44-44-96",volt:1.45,profile:"XMP 3.0",rgb:true,height:55,watt:10,rank:"1R",die:"SK hynix M-die"});
add("ram","Kingston","FURY Beast 64 GB (2×32) 5600 CL36",179,{memType:"DDR5",kit:2,capGB:64,perStick:32,speed:5600,cl:36,timings:"36-38-38-80",volt:1.25,profile:"EXPO + XMP 3.0",rgb:false,height:35,watt:11,rank:"2R",die:"Micron"});
add("ram","G.Skill","Flare X5 32 GB (2×16) 6000 CL32",105,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6000,cl:32,timings:"32-38-38-96",volt:1.35,profile:"EXPO",rgb:false,height:33,watt:8,rank:"1R",die:"SK hynix"});
add("ram","G.Skill","Trident Z Neo 32 GB (2×16) 3600 CL16",89,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-19-19-39",volt:1.35,profile:"XMP 2.0",rgb:true,height:44,watt:6,rank:"1R",die:"Samsung B-die"});
add("ram","Corsair","Vengeance LPX 16 GB (2×8) 3200 CL16",39,{memType:"DDR4",kit:2,capGB:16,perStick:8,speed:3200,cl:16,timings:"16-18-18-36",volt:1.35,profile:"XMP 2.0",rgb:false,height:34,watt:5,rank:"1R",die:"Varios"});
add("ram","Kingston","FURY Renegade 32 GB (2×16) 3600 CL16",95,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-20-20-38",volt:1.35,profile:"XMP 2.0",rgb:false,height:40,watt:6,rank:"1R",die:"Varios"});
add("ram","Corsair","Vengeance 16 GB (2×8) 1600 CL9",0,{memType:"DDR3",kit:2,capGB:16,perStick:8,speed:1600,cl:9,timings:"9-9-9-24",volt:1.5,profile:"XMP 1.3",rgb:false,height:43,watt:6,rank:"2R",die:"Varios",museum:true});
add("ram","Kingston","Server Premier 64 GB RDIMM 5600 CL46",329,{memType:"DDR5-RDIMM",kit:1,capGB:64,perStick:64,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC ECC",rgb:false,height:32,watt:12,rank:"2R",die:"ECC registrada"});

/* ── GRÁFICAS ────────────────────────────────────────────────────── */
add("gpu","NVIDIA","GeForce RTX 5090 Founders Edition",1999,{chip:"GB202",vram:32,vtype:"GDDR7",bus:512,tbp:575,len:304,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.41,cuda:21760,year:2025});
add("gpu","ASUS","ROG Astral RTX 5090 OC",2499,{chip:"GB202",vram:32,vtype:"GDDR7",bus:512,tbp:600,len:358,slots:4,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"3× DP 2.1b, 2× HDMI 2.1b",boost:2.58,cuda:21760,year:2025});
add("gpu","NVIDIA","GeForce RTX 5080 Founders Edition",1169,{chip:"GB203",vram:16,vtype:"GDDR7",bus:256,tbp:360,len:304,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (450 W)",hpwr:true,conn8:3,psuMin:850,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.62,cuda:10752,year:2025});
add("gpu","MSI","GeForce RTX 5070 Ti Gaming Trio OC",879,{chip:"GB203",vram:16,vtype:"GDDR7",bus:256,tbp:300,len:337,slots:3,pcie:"5.0 ×16",power:"1× 12V-2×6 (450 W)",hpwr:true,conn8:2,psuMin:750,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.51,cuda:8960,year:2025});
add("gpu","Gigabyte","GeForce RTX 4060 WINDFORCE OC 8G",299,{chip:"AD107",vram:8,vtype:"GDDR6",bus:128,tbp:115,len:192,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"2× DP 1.4a, 2× HDMI 2.1",boost:2.49,cuda:3072,year:2023});
add("gpu","Sapphire","NITRO+ Radeon RX 9070 XT",759,{chip:"Navi 48",vram:16,vtype:"GDDR6",bus:256,tbp:340,len:326,slots:3,pcie:"5.0 ×16",power:"3× 8 pines",conn8:3,psuMin:850,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:3.06,cuda:4096,year:2025});
add("gpu","AMD","Radeon RX 7900 XTX",899,{chip:"Navi 31",vram:24,vtype:"GDDR6",bus:384,tbp:355,len:287,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:800,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.5,cuda:6144,year:2022});
add("gpu","XFX","Speedster SWFT Radeon RX 6600",189,{chip:"Navi 23",vram:8,vtype:"GDDR6",bus:128,tbp:132,len:212,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.49,cuda:1792,year:2021});
add("gpu","Intel","Arc B580 Limited Edition",279,{chip:"BMG-G21",vram:12,vtype:"GDDR6",bus:192,tbp:190,len:272,slots:2,pcie:"4.0 ×8",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.67,cuda:2560,year:2024});

/* ── GRÁFICAS · ampliación ───────────────────────────────────────
   len = tarjeta de referencia o modelo AIB habitual; varía por fabricante.
   conn8/conn6 = cables PCIe necesarios · hpwr = 12V-2×6 / 12VHPWR
   ─────────────────────────────────────────────────────────────── */
const G=(brand,name,price,o)=>add("gpu",brand,name,price,{conn8:0,conn6:0,hpwr:false,seg:"Gaming",...o});
// NVIDIA · entrada y oficina
G("NVIDIA","GeForce GT 710 2 GB",45,{chip:"GK208B",vram:2,vtype:"DDR3",bus:64,tbp:19,len:146,slots:1,pcie:"2.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI 1.4",boost:0.95,cuda:192,year:2014,seg:"Oficina",legacy:true});
G("NVIDIA","GeForce GT 730 2 GB GDDR5",59,{chip:"GK208B",vram:2,vtype:"GDDR5",bus:64,tbp:38,len:150,slots:1,pcie:"2.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI 1.4",boost:0.9,cuda:384,year:2014,seg:"Oficina",legacy:true});
G("NVIDIA","GeForce GT 1030 2 GB GDDR5",79,{chip:"GP108",vram:2,vtype:"GDDR5",bus:64,tbp:30,len:150,slots:1,pcie:"3.0 ×4",power:"Sin conector adicional",psuMin:300,outs:"1× DVI, 1× HDMI 2.0b",boost:1.47,cuda:384,year:2017,seg:"Oficina"});
G("NVIDIA","GeForce GTX 750 Ti 2 GB",0,{chip:"GM107",vram:2,vtype:"GDDR5",bus:128,tbp:60,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× VGA, 1× DVI, 1× HDMI",boost:1.085,cuda:640,year:2014,legacy:true});
// NVIDIA · Maxwell y Pascal
G("NVIDIA","GeForce GTX 960 2 GB",0,{chip:"GM206",vram:2,vtype:"GDDR5",bus:128,tbp:120,len:250,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:400,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.178,cuda:1024,year:2015,legacy:true});
G("NVIDIA","GeForce GTX 970 4 GB",0,{chip:"GM204",vram:4,vtype:"GDDR5",bus:256,tbp:145,len:267,slots:2,pcie:"3.0 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.178,cuda:1664,year:2014,legacy:true});
G("NVIDIA","GeForce GTX 980 Ti 6 GB",0,{chip:"GM200",vram:6,vtype:"GDDR5",bus:384,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.2, 1× DVI, 1× HDMI 2.0",boost:1.075,cuda:2816,year:2015,legacy:true});
G("NVIDIA","GeForce GTX 1050 Ti 4 GB",0,{chip:"GP107",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.392,cuda:768,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1060 6 GB",0,{chip:"GP106",vram:6,vtype:"GDDR5",bus:192,tbp:120,len:250,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:400,outs:"3× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.708,cuda:1280,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1070 8 GB",0,{chip:"GP104",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"3× DP 1.4, 1× DVI, 1× HDMI 2.0",boost:1.683,cuda:1920,year:2016,legacy:true});
G("NVIDIA","GeForce GTX 1080 Ti 11 GB",0,{chip:"GP102",vram:11,vtype:"GDDR5X",bus:352,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.582,cuda:3584,year:2017,legacy:true});
// NVIDIA · Turing
G("NVIDIA","GeForce GTX 1650 4 GB",129,{chip:"TU117",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:145,slots:2,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:300,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.665,cuda:896,year:2019});
G("NVIDIA","GeForce GTX 1660 SUPER 6 GB",179,{chip:"TU116",vram:6,vtype:"GDDR6",bus:192,tbp:125,len:229,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:450,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.785,cuda:1408,year:2019});
G("NVIDIA","GeForce RTX 2060 6 GB",0,{chip:"TU106",vram:6,vtype:"GDDR6",bus:192,tbp:160,len:229,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"1× DP 1.4, 1× HDMI 2.0b",boost:1.68,cuda:1920,year:2019,legacy:true});
G("NVIDIA","GeForce RTX 2070 SUPER 8 GB",0,{chip:"TU104",vram:8,vtype:"GDDR6",bus:256,tbp:215,len:267,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.0b, 1× USB-C",boost:1.77,cuda:2560,year:2019,legacy:true});
G("NVIDIA","GeForce RTX 2080 Ti 11 GB",0,{chip:"TU102",vram:11,vtype:"GDDR6",bus:352,tbp:250,len:267,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.0b, 1× USB-C",boost:1.545,cuda:4352,year:2018,legacy:true});
// NVIDIA · Ampere
G("NVIDIA","GeForce RTX 3050 8 GB",219,{chip:"GA106",vram:8,vtype:"GDDR6",bus:128,tbp:130,len:200,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.777,cuda:2560,year:2022});
G("NVIDIA","GeForce RTX 3060 12 GB",259,{chip:"GA106",vram:12,vtype:"GDDR6",bus:192,tbp:170,len:242,slots:2,pcie:"4.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.777,cuda:3584,year:2021});
G("NVIDIA","GeForce RTX 3060 Ti 8 GB",0,{chip:"GA104",vram:8,vtype:"GDDR6",bus:256,tbp:200,len:242,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:600,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.665,cuda:4864,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3070 8 GB",0,{chip:"GA104",vram:8,vtype:"GDDR6",bus:256,tbp:220,len:242,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.725,cuda:5888,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3080 10 GB",0,{chip:"GA102",vram:10,vtype:"GDDR6X",bus:320,tbp:320,len:285,slots:2,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.71,cuda:8704,year:2020,legacy:true});
G("NVIDIA","GeForce RTX 3090 24 GB",0,{chip:"GA102",vram:24,vtype:"GDDR6X",bus:384,tbp:350,len:313,slots:3,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:1.695,cuda:10496,year:2020,legacy:true});
// NVIDIA · Ada
G("NVIDIA","GeForce RTX 4060 Ti 16 GB",429,{chip:"AD106",vram:16,vtype:"GDDR6",bus:128,tbp:165,len:244,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.54,cuda:4352,year:2023});
G("NVIDIA","GeForce RTX 4070 SUPER 12 GB",599,{chip:"AD104",vram:12,vtype:"GDDR6X",bus:192,tbp:220,len:244,slots:2,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 2× 8 pines)",hpwr:true,conn8:2,psuMin:650,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.475,cuda:7168,year:2024});
G("NVIDIA","GeForce RTX 4070 Ti SUPER 16 GB",799,{chip:"AD103",vram:16,vtype:"GDDR6X",bus:256,tbp:285,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 2× 8 pines)",hpwr:true,conn8:2,psuMin:700,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.61,cuda:8448,year:2024});
G("NVIDIA","GeForce RTX 4080 SUPER 16 GB",1099,{chip:"AD103",vram:16,vtype:"GDDR6X",bus:256,tbp:320,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 3× 8 pines)",hpwr:true,conn8:3,psuMin:750,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.55,cuda:10240,year:2024});
G("NVIDIA","GeForce RTX 4090 24 GB",1799,{chip:"AD102",vram:24,vtype:"GDDR6X",bus:384,tbp:450,len:304,slots:3,pcie:"4.0 ×16",power:"1× 12VHPWR (adaptador 4× 8 pines)",hpwr:true,conn8:4,psuMin:850,outs:"3× DP 1.4a, 1× HDMI 2.1",boost:2.52,cuda:16384,year:2022});
// NVIDIA · Blackwell
G("NVIDIA","GeForce RTX 5060 Ti 16 GB",459,{chip:"GB206",vram:16,vtype:"GDDR7",bus:128,tbp:180,len:244,slots:2,pcie:"5.0 ×8",power:"1× 12V-2×6 (300 W)",hpwr:true,conn8:2,psuMin:600,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.572,cuda:4608,year:2025});
G("NVIDIA","GeForce RTX 5070 12 GB",629,{chip:"GB205",vram:12,vtype:"GDDR7",bus:192,tbp:250,len:242,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (300 W)",hpwr:true,conn8:2,psuMin:650,outs:"3× DP 2.1b, 1× HDMI 2.1b",boost:2.512,cuda:6144,year:2025});
// NVIDIA · profesionales
G("NVIDIA","RTX A2000 12 GB",0,{chip:"GA106",vram:12,vtype:"GDDR6 ECC",bus:192,tbp:70,len:168,slots:2,pcie:"4.0 ×16",power:"Sin conector adicional",psuMin:450,outs:"4× mDP 1.4",boost:1.2,cuda:3328,year:2021,seg:"Profesional",legacy:true});
G("NVIDIA","RTX A4000 16 GB",0,{chip:"GA104",vram:16,vtype:"GDDR6 ECC",bus:256,tbp:140,len:241,slots:1,pcie:"4.0 ×16",power:"1× 6 pines",conn6:1,psuMin:550,outs:"4× DP 1.4",boost:1.56,cuda:6144,year:2021,seg:"Profesional",legacy:true});
G("NVIDIA","RTX 4000 Ada 20 GB",1349,{chip:"AD104",vram:20,vtype:"GDDR6 ECC",bus:160,tbp:130,len:241,slots:1,pcie:"4.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"4× DP 1.4a",boost:2.175,cuda:6144,year:2023,seg:"Profesional"});
G("NVIDIA","RTX 6000 Ada 48 GB",7499,{chip:"AD102",vram:48,vtype:"GDDR6 ECC",bus:384,tbp:300,len:267,slots:2,pcie:"4.0 ×16",power:"1× 12VHPWR",hpwr:true,conn8:2,psuMin:750,outs:"4× DP 1.4a",boost:2.505,cuda:18176,year:2022,seg:"Profesional"});
G("NVIDIA","RTX PRO 6000 Blackwell 96 GB",8999,{chip:"GB202",vram:96,vtype:"GDDR7 ECC",bus:512,tbp:600,len:305,slots:2,pcie:"5.0 ×16",power:"1× 12V-2×6 (600 W)",hpwr:true,conn8:4,psuMin:1000,outs:"4× DP 2.1b",boost:2.617,cuda:24064,year:2025,seg:"Profesional"});
G("NVIDIA","Quadro P2000 5 GB",0,{chip:"GP106",vram:5,vtype:"GDDR5",bus:160,tbp:75,len:200,slots:1,pcie:"3.0 ×16",power:"Sin conector adicional",psuMin:350,outs:"4× DP 1.4",boost:1.48,cuda:1024,year:2017,seg:"Profesional",legacy:true});
// AMD · leyendas HD y R
G("AMD","Radeon HD 4870 1 GB",0,{chip:"RV770",vram:1,vtype:"GDDR5",bus:256,tbp:160,len:241,slots:2,pcie:"2.0 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"2× DVI, 1× S-Video",boost:0.75,cuda:800,year:2008,seg:"Clásica",legacy:true});
G("AMD","Radeon HD 5870 1 GB",0,{chip:"Cypress XT",vram:1,vtype:"GDDR5",bus:256,tbp:188,len:282,slots:2,pcie:"2.1 ×16",power:"2× 6 pines",conn6:2,psuMin:500,outs:"2× DVI, 1× HDMI, 1× DP",boost:0.85,cuda:1600,year:2009,seg:"Clásica",legacy:true});
G("AMD","Radeon HD 7970 GHz Edition 3 GB",0,{chip:"Tahiti XT2",vram:3,vtype:"GDDR5",bus:384,tbp:250,len:275,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"1× DVI, 1× HDMI, 2× mDP",boost:1.05,cuda:2048,year:2012,seg:"Clásica",legacy:true});
G("AMD","Radeon R7 260X 2 GB",0,{chip:"Bonaire XTX",vram:2,vtype:"GDDR5",bus:128,tbp:115,len:213,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:450,outs:"2× DVI, 1× HDMI, 1× DP",boost:1.1,cuda:896,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 280X 3 GB",0,{chip:"Tahiti XTL",vram:3,vtype:"GDDR5",bus:384,tbp:250,len:276,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"2× DVI, 1× HDMI, 2× mDP",boost:1.0,cuda:2048,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 290X 4 GB",0,{chip:"Hawaii XT",vram:4,vtype:"GDDR5",bus:512,tbp:290,len:275,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:750,outs:"2× DVI, 1× HDMI, 1× DP",boost:1.0,cuda:2816,year:2013,seg:"Clásica",legacy:true});
G("AMD","Radeon R9 Fury X 4 GB HBM",0,{chip:"Fiji XT",vram:4,vtype:"HBM",bus:4096,tbp:275,len:198,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.2, 1× HDMI 1.4",boost:1.05,cuda:4096,year:2015,seg:"Clásica",legacy:true});
// AMD · Polaris y Vega
G("AMD","Radeon RX 460 4 GB",0,{chip:"Polaris 11",vram:4,vtype:"GDDR5",bus:128,tbp:75,len:210,slots:2,pcie:"3.0 ×8",power:"Sin conector adicional",psuMin:350,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.2,cuda:896,year:2016,legacy:true});
G("AMD","Radeon RX 470 4 GB",0,{chip:"Polaris 10",vram:4,vtype:"GDDR5",bus:256,tbp:120,len:241,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:450,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.206,cuda:2048,year:2016,legacy:true});
G("AMD","Radeon RX 480 8 GB",0,{chip:"Polaris 10",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:241,slots:2,pcie:"3.0 ×16",power:"1× 6 pines",conn6:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.266,cuda:2304,year:2016,legacy:true});
G("AMD","Radeon RX 550 4 GB",0,{chip:"Polaris 12",vram:4,vtype:"GDDR5",bus:128,tbp:50,len:170,slots:1,pcie:"3.0 ×8",power:"Sin conector adicional",psuMin:300,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.183,cuda:512,year:2017,seg:"Oficina",legacy:true});
G("AMD","Radeon RX 560 4 GB",0,{chip:"Polaris 21",vram:4,vtype:"GDDR5",bus:128,tbp:80,len:210,slots:2,pcie:"3.0 ×8",power:"1× 6 pines",conn6:1,psuMin:400,outs:"1× DVI, 1× HDMI 2.0, 1× DP 1.4",boost:1.275,cuda:1024,year:2017,legacy:true});
G("AMD","Radeon RX 570 8 GB",0,{chip:"Polaris 20",vram:8,vtype:"GDDR5",bus:256,tbp:150,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:450,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.244,cuda:2048,year:2017,legacy:true});
G("AMD","Radeon RX 580 8 GB",0,{chip:"Polaris 20",vram:8,vtype:"GDDR5",bus:256,tbp:185,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines",conn8:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.34,cuda:2304,year:2017,legacy:true});
G("AMD","Radeon RX 590 8 GB",0,{chip:"Polaris 30",vram:8,vtype:"GDDR5",bus:256,tbp:175,len:241,slots:2,pcie:"3.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:500,outs:"1× DVI, 1× HDMI 2.0, 3× DP 1.4",boost:1.545,cuda:2304,year:2018,legacy:true});
G("AMD","Radeon RX Vega 64 8 GB HBM2",0,{chip:"Vega 10 XT",vram:8,vtype:"HBM2",bus:2048,tbp:295,len:281,slots:2,pcie:"3.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 1.4, 1× HDMI 2.0",boost:1.546,cuda:4096,year:2017,legacy:true});
// AMD · RDNA 1 y 2
G("AMD","Radeon RX 5500 XT 8 GB",0,{chip:"Navi 14",vram:8,vtype:"GDDR6",bus:128,tbp:130,len:241,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:450,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.845,cuda:1408,year:2019,legacy:true});
G("AMD","Radeon RX 5700 XT 8 GB",0,{chip:"Navi 10",vram:8,vtype:"GDDR6",bus:256,tbp:225,len:272,slots:2,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:600,outs:"3× DP 1.4, 1× HDMI 2.0b",boost:1.905,cuda:2560,year:2019,legacy:true});
G("AMD","Radeon RX 6400 4 GB",129,{chip:"Navi 24",vram:4,vtype:"GDDR6",bus:64,tbp:53,len:167,slots:1,pcie:"4.0 ×4",power:"Sin conector adicional",psuMin:350,outs:"1× DP 1.4, 1× HDMI 2.1",boost:2.321,cuda:768,year:2022,seg:"Oficina"});
G("AMD","Radeon RX 6500 XT 4 GB",159,{chip:"Navi 24",vram:4,vtype:"GDDR6",bus:64,tbp:107,len:200,slots:2,pcie:"4.0 ×4",power:"1× 6 pines",conn6:1,psuMin:400,outs:"1× DP 1.4, 1× HDMI 2.1",boost:2.815,cuda:1024,year:2022});
G("AMD","Radeon RX 6650 XT 8 GB",0,{chip:"Navi 23",vram:8,vtype:"GDDR6",bus:128,tbp:180,len:241,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:500,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.635,cuda:2048,year:2022,legacy:true});
G("AMD","Radeon RX 6700 XT 12 GB",0,{chip:"Navi 22",vram:12,vtype:"GDDR6",bus:192,tbp:230,len:267,slots:2.5,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 1.4, 1× HDMI 2.1",boost:2.581,cuda:2560,year:2021,legacy:true});
G("AMD","Radeon RX 6800 XT 16 GB",0,{chip:"Navi 21",vram:16,vtype:"GDDR6",bus:256,tbp:300,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"2× DP 1.4, 1× HDMI 2.1, 1× USB-C",boost:2.25,cuda:4608,year:2020,legacy:true});
G("AMD","Radeon RX 6950 XT 16 GB",0,{chip:"Navi 21",vram:16,vtype:"GDDR6",bus:256,tbp:335,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:850,outs:"2× DP 1.4, 1× HDMI 2.1, 1× USB-C",boost:2.31,cuda:5120,year:2022,legacy:true});
// AMD · RDNA 3 y 4
G("AMD","Radeon RX 7600 8 GB",249,{chip:"Navi 33",vram:8,vtype:"GDDR6",bus:128,tbp:165,len:204,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.655,cuda:2048,year:2023});
G("AMD","Radeon RX 7600 XT 16 GB",329,{chip:"Navi 33",vram:16,vtype:"GDDR6",bus:128,tbp:190,len:250,slots:2,pcie:"4.0 ×8",power:"2× 8 pines",conn8:2,psuMin:600,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.755,cuda:2048,year:2024});
G("AMD","Radeon RX 7700 XT 12 GB",399,{chip:"Navi 32",vram:12,vtype:"GDDR6",bus:192,tbp:245,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.544,cuda:3456,year:2023});
G("AMD","Radeon RX 7800 XT 16 GB",489,{chip:"Navi 32",vram:16,vtype:"GDDR6",bus:256,tbp:263,len:267,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.43,cuda:3840,year:2023});
G("AMD","Radeon RX 7900 GRE 16 GB",549,{chip:"Navi 31",vram:16,vtype:"GDDR6",bus:256,tbp:260,len:276,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:700,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.245,cuda:5120,year:2024});
G("AMD","Radeon RX 7900 XT 20 GB",679,{chip:"Navi 31",vram:20,vtype:"GDDR6",bus:320,tbp:315,len:276,slots:2.5,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"2× DP 2.1, 1× HDMI 2.1, 1× USB-C",boost:2.4,cuda:5376,year:2022});
G("AMD","Radeon RX 9060 XT 16 GB",379,{chip:"Navi 44",vram:16,vtype:"GDDR6",bus:128,tbp:160,len:250,slots:2,pcie:"5.0 ×16",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:3.13,cuda:2048,year:2025});
G("AMD","Radeon RX 9070 16 GB",629,{chip:"Navi 48",vram:16,vtype:"GDDR6",bus:256,tbp:220,len:290,slots:2.5,pcie:"5.0 ×16",power:"2× 8 pines",conn8:2,psuMin:650,outs:"3× DP 2.1a, 1× HDMI 2.1b",boost:2.52,cuda:3584,year:2025});
// AMD · profesionales
G("AMD","Radeon Pro W6600 8 GB",0,{chip:"Navi 23",vram:8,vtype:"GDDR6 ECC",bus:128,tbp:100,len:203,slots:1,pcie:"4.0 ×8",power:"1× 6 pines",conn6:1,psuMin:450,outs:"4× DP 1.4",boost:2.58,cuda:1792,year:2021,seg:"Profesional",legacy:true});
G("AMD","Radeon Pro W7900 48 GB",3499,{chip:"Navi 31",vram:48,vtype:"GDDR6 ECC",bus:384,tbp:295,len:267,slots:3,pcie:"4.0 ×16",power:"2× 8 pines",conn8:2,psuMin:750,outs:"3× DP 2.1, 1× mDP 2.1",boost:2.495,cuda:6144,year:2023,seg:"Profesional"});
// Intel Arc
G("Intel","Arc A380 6 GB",129,{chip:"ACM-G11",vram:6,vtype:"GDDR6",bus:96,tbp:75,len:200,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:400,outs:"3× DP 2.0, 1× HDMI 2.0b",boost:2.0,cuda:1024,year:2022,seg:"Oficina"});
G("Intel","Arc A770 16 GB",289,{chip:"ACM-G10",vram:16,vtype:"GDDR6",bus:256,tbp:225,len:280,slots:2,pcie:"4.0 ×16",power:"1× 8 pines + 1× 6 pines",conn8:1,conn6:1,psuMin:650,outs:"3× DP 2.0, 1× HDMI 2.1",boost:2.1,cuda:4096,year:2022});
G("Intel","Arc B570 10 GB",229,{chip:"BMG-G21",vram:10,vtype:"GDDR6",bus:160,tbp:150,len:272,slots:2,pcie:"4.0 ×8",power:"1× 8 pines",conn8:1,psuMin:550,outs:"3× DP 2.1, 1× HDMI 2.1",boost:2.5,cuda:2304,year:2025});

/* ── ALMACENAMIENTO ──────────────────────────────────────────────── */
add("storage","Samsung","990 PRO 2 TB",159,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7450,write:6900,tbw:1200,dram:true,nand:"TLC V-NAND 176L",watt:8.5,heatsink:false});
add("storage","Crucial","T705 2 TB",249,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14500,write:12700,tbw:1200,dram:true,nand:"TLC Micron 232L",watt:11.5,heatsink:true});
add("storage","WD","Black SN850X 1 TB",99,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7300,write:6300,tbw:600,dram:true,nand:"TLC BiCS5",watt:7.5,heatsink:false});
add("storage","Kingston","NV3 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:6000,write:4000,tbw:160,dram:false,nand:"TLC",watt:5,heatsink:false});
add("storage","Samsung","870 EVO 1 TB",79,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:560,write:530,tbw:600,dram:true,nand:"TLC V-NAND",watt:3,heatsink:false});
add("storage","Seagate","BarraCuda 4 TB 3.5\"",89,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:190,write:190,tbw:null,dram:false,nand:"HDD 5400 rpm",watt:8,heatsink:false});
add("storage","Seagate","IronWolf Pro 12 TB",289,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:12000,read:250,write:250,tbw:null,dram:false,nand:"HDD 7200 rpm CMR",watt:10,heatsink:false});

/* ── FUENTES ─────────────────────────────────────────────────────── */
add("psu","Corsair","RM1000x SHIFT",199,{watt:1000,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,molex:4,fan:"140 mm FDB",zero:true,warranty:10});
add("psu","Seasonic","VERTEX GX-1200",229,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,molex:4,fan:"135 mm FDB",zero:true,warranty:12});
add("psu","be quiet!","Pure Power 12 M 750W",109,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,molex:4,fan:"120 mm rifle",zero:false,warranty:10});
add("psu","Corsair","SF750 (2024)",169,{watt:750,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.1",form:"SFX",len:100,modular:"Full",pcie5:1,pcie8:3,eps:1,sata:6,molex:4,fan:"92 mm FDB",zero:true,warranty:10});
add("psu","MSI","MAG A650BN",59,{watt:650,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie5:0,pcie8:2,eps:1,sata:6,molex:3,fan:"120 mm sleeve",zero:false,warranty:5});
add("psu","Corsair","AX1600i",579,{watt:1600,eff:"80+ Titanium",cert:"Cybenetics Titanium",atx:"ATX 2.4",form:"ATX",len:200,modular:"Full",pcie5:0,pcie8:10,eps:2,sata:14,molex:8,fan:"140 mm FDB",zero:true,warranty:10});

/* ── CAJAS ───────────────────────────────────────────────────────── */
add("case","Fractal Design","North",149,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:355,gpuLenRad:300,coolerH:170,psuLen:255,psuForm:["ATX","SFX"],rad:{top:240,front:360,rear:120},fanInc:2,fanMax:7,fanSizes:[120,140],bays35:2,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.0, jack",dims:"447×215×469 mm",vol:45.1,color:"Nogal / negro"});
add("case","Lian Li","O11 Dynamic EVO",179,{form:["E-ATX","ATX","Micro-ATX","Mini-ITX"],gpuLen:426,coolerH:167,psuLen:220,psuForm:["ATX","SFX"],rad:{top:360,side:360,bottom:360},fanInc:0,fanMax:10,fanSizes:[120,140],bays35:4,bays25:4,side:"Cristal templado doble",psuPos:"Trasera",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.0, jack",dims:"465×285×459 mm",vol:60.8,color:"Negro / blanco"});
add("case","NZXT","H5 Flow (2024)",99,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:410,coolerH:165,psuLen:200,psuForm:["ATX","SFX"],rad:{top:240,front:360},fanInc:2,fanMax:7,fanSizes:[120,140],bays35:1,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.2 G2, 1× USB-A 3.2 G1, jack",dims:"460×227×446 mm",vol:46.6,color:"Negro / blanco"});
add("case","Corsair","4000D Airflow",99,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:360,gpuLenRad:300,coolerH:170,psuLen:180,psuForm:["ATX"],rad:{top:280,front:360},fanInc:2,fanMax:6,fanSizes:[120,140],bays35:2,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.1, 1× USB-A 3.0, jack",dims:"453×230×466 mm",vol:48.5,color:"Negro / blanco"});
add("case","Cooler Master","MasterBox NR200P",99,{form:["Mini-ITX"],gpuLen:330,coolerH:155,psuLen:130,psuForm:["SFX","SFX-L"],rad:{top:280,side:240},fanInc:2,fanMax:6,fanSizes:[92,120,140],bays35:1,bays25:3,side:"Cristal templado / panel",psuPos:"Lateral",frontIO:"2× USB-A 3.2 G1, jack",dims:"376×185×292 mm",vol:18.3,color:"Negro / blanco"});
add("case","Fractal Design","Torrent",199,{form:["E-ATX","ATX","Micro-ATX","Mini-ITX"],gpuLen:461,coolerH:188,psuLen:230,psuForm:["ATX","SFX"],rad:{front:420,bottom:360},fanInc:5,fanMax:9,fanSizes:[120,140,180],bays35:2,bays25:4,side:"Cristal templado",psuPos:"Central",frontIO:"1× USB-C 3.1 G2, 2× USB-A 3.0, jack",dims:"544×242×530 mm",vol:69.7,color:"Negro / blanco"});

/* ── REFRIGERACIÓN CPU ───────────────────────────────────────────── */
const ALLSOCK = ["AM5","AM4","LGA1851","LGA1700","LGA1200","LGA1151v2","LGA1150"];
add("cooler","Noctua","NH-D15 G2",149,{type:"Aire (torre doble)",sockets:["AM5","LGA1851","LGA1700"],height:168,tdpRated:260,fans:2,fanSize:140,noise:24.8,fanRaise:33,ramClear:32,rgb:false,watt:3,warranty:6});
add("cooler","Thermalright","Peerless Assassin 120 SE",39,{type:"Aire (torre doble)",sockets:ALLSOCK,height:155,tdpRated:245,fans:2,fanSize:120,noise:25.6,fanRaise:20,ramClear:45,rgb:false,watt:3,warranty:6});
add("cooler","Noctua","NH-L9i-17xx",55,{type:"Aire (low-profile)",sockets:["LGA1700"],height:37,tdpRated:65,fans:1,fanSize:92,noise:23.6,ramClear:60,rgb:false,watt:1.5,warranty:6});
add("cooler","Arctic","Liquid Freezer III 360",89,{type:"AIO 360 mm",sockets:["LGA2066","LGA2011-v3","AM5","AM4","LGA1851","LGA1700"],height:38,radSize:360,tdpRated:350,fans:3,fanSize:120,noise:22.5,ramClear:99,rgb:false,watt:12,warranty:6});
add("cooler","NZXT","Kraken 240 RGB",139,{type:"AIO 240 mm",sockets:["AM5","AM4","LGA1851","LGA1700"],height:30,radSize:240,tdpRated:280,fans:2,fanSize:120,noise:33,ramClear:99,rgb:true,watt:14,warranty:6});
add("cooler","Noctua","NH-U14S TR5-SP6",139,{type:"Aire (torre, HEDT)",sockets:["sTR5"],height:165,tdpRated:350,fans:1,fanSize:140,noise:24.6,ramClear:65,rgb:false,watt:2,warranty:6});
add("cooler","AMD","Wraith Stealth (de serie)",0,{type:"Aire (stock)",sockets:["AM5","AM4"],height:54,tdpRated:65,fans:1,fanSize:80,noise:32,ramClear:99,rgb:false,watt:2,warranty:1,stock:true});

/* ── REFRIGERACIÓN CPU · ampliación ──────────────────────────────── */
const K=(brand,name,price,o)=>add("cooler",brand,name,price,{rgb:false,warranty:2,...o});
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

/* ── FUENTES · ampliación ────────────────────────────────────────── */
const U=(brand,name,price,o)=>add("psu",brand,name,price,{zero:false,warranty:5,pcie5:0,molex:2,...o});
U("Corsair","CX550",59,{watt:550,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:6,fan:"120 mm rifle",warranty:5});
U("Corsair","RM750e (2025)",99,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm rifle",zero:true,warranty:7});
U("Corsair","HX1000i (2023)",249,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:180,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"140 mm FDB",zero:true,warranty:12});
U("Seasonic","FOCUS GX-650 (2024)",99,{watt:650,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:2,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});
U("Seasonic","PRIME TX-850",219,{watt:850,eff:"80+ Titanium",cert:"Cybenetics Titanium",atx:"ATX 3.0",form:"ATX",len:170,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:12});
U("be quiet!","Straight Power 12 1000W",209,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:10});
U("be quiet!","System Power 11 550W",55,{watt:550,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 2.4",form:"ATX",len:150,modular:"No",pcie8:2,eps:1,sata:6,fan:"120 mm rifle",warranty:3});
U("Cooler Master","MWE Gold 750 V2",89,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm HDB",zero:true,warranty:10});
U("Cooler Master","Elite NEX 500W",45,{watt:500,eff:"80+ White",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:1,eps:1,sata:4,fan:"120 mm sleeve",warranty:3});
U("MSI","MPG A850G PCIE5",129,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:9,fan:"135 mm FDB",zero:true,warranty:10});
U("MSI","MAG A750BN PCIE5",79,{watt:750,eff:"80+ Bronze",cert:"Cybenetics Bronze",atx:"ATX 3.0",form:"ATX",len:150,modular:"No",pcie5:1,pcie8:2,eps:1,sata:6,fan:"120 mm sleeve",warranty:5});
U("EVGA","SuperNOVA 850 G7",139,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.52",form:"ATX",len:130,modular:"Full",pcie8:6,eps:2,sata:9,fan:"135 mm FDB",zero:true,warranty:10});
U("Thermaltake","Toughpower GF3 1200W",219,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:160,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"140 mm FDB",zero:true,warranty:10});
U("Gigabyte","UD1000GM PG5",149,{watt:1000,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:12,fan:"120 mm FDB",zero:true,warranty:10});
U("NZXT","C1200 Gold ATX 3.1",179,{watt:1200,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:2,pcie8:6,eps:2,sata:10,fan:"120 mm FDB",zero:true,warranty:10});
U("ASUS","ROG Thor 1000P2 Gaming",349,{watt:1000,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:190,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm axial",zero:true,warranty:10});
U("Antec","NeoECO Gold 650W",79,{watt:650,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.52",form:"ATX",len:140,modular:"Full",pcie8:2,eps:2,sata:6,fan:"120 mm FDB",zero:true,warranty:10});
U("Tempest","PSU 600W 80+ Bronze",49,{watt:600,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:5,fan:"120 mm sleeve",warranty:3});
U("Seasonic","FOCUS SGX-500",99,{watt:500,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.4",form:"SFX-L",len:130,modular:"Full",pcie8:2,eps:1,sata:5,fan:"120 mm FDB",zero:true,warranty:10});
U("Cooler Master","V850 SFX Gold",169,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"SFX",len:100,modular:"Full",pcie5:1,pcie8:4,eps:1,sata:6,fan:"92 mm FDB",zero:true,warranty:10});
U("FSP","Hydro PTM PRO 1200W",229,{watt:1200,eff:"80+ Platinum",cert:"Cybenetics Platinum",atx:"ATX 3.0",form:"ATX",len:170,modular:"Full",pcie5:1,pcie8:6,eps:2,sata:12,fan:"135 mm FDB",zero:true,warranty:10});
U("XPG","Core Reactor II 750W",109,{watt:750,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.0",form:"ATX",len:140,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});
U("Corsair","RM450x",79,{watt:450,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 2.4",form:"ATX",len:160,modular:"Full",pcie8:2,eps:1,sata:8,fan:"135 mm FDB",zero:true,warranty:10});
U("Silverstone","ST45SF-G v2.0",89,{watt:450,eff:"80+ Gold",cert:"—",atx:"ATX 2.4",form:"SFX",len:100,modular:"Full",pcie8:2,eps:1,sata:4,fan:"92 mm",warranty:3});
U("Seasonic","S12III 500",49,{watt:500,eff:"80+ Bronze",cert:"—",atx:"ATX 2.4",form:"ATX",len:140,modular:"No",pcie8:2,eps:1,sata:4,fan:"120 mm sleeve",warranty:5});
U("Chieftec","Polaris 750W",89,{watt:750,eff:"80+ Silver",cert:"Cybenetics Silver",atx:"ATX 2.4",form:"ATX",len:150,modular:"Full",pcie8:4,eps:2,sata:8,fan:"120 mm",warranty:5});
U("Enermax","Revolution D.F. 12 850W",149,{watt:850,eff:"80+ Gold",cert:"Cybenetics Gold",atx:"ATX 3.1",form:"ATX",len:150,modular:"Full",pcie5:1,pcie8:4,eps:2,sata:8,fan:"120 mm FDB",zero:true,warranty:10});

/* ── ALMACENAMIENTO · ampliación ─────────────────────────────────── */
const D=(brand,name,price,o)=>add("storage",brand,name,price,{heatsink:false,dram:true,...o});
// M.2 NVMe · PCIe 5.0
D("Samsung","9100 PRO 2 TB con disipador",259,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14800,write:13400,tbw:1200,nand:"TLC V-NAND",watt:11,heatsink:true,seg:"Doméstico"});
D("Corsair","MP700 PRO 2 TB",219,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:12400,write:11800,tbw:1200,nand:"TLC Micron",watt:10.5,heatsink:false,seg:"Doméstico"});
D("MSI","SPATIUM M580 FROZR 2 TB",239,{iface:"M.2 2280 NVMe",gen:"PCIe 5.0 ×4",capGB:2000,read:14600,write:12700,tbw:1200,nand:"TLC Micron 232L",watt:11.5,heatsink:true,seg:"Doméstico"});
// M.2 NVMe · PCIe 4.0
D("Samsung","990 EVO Plus 1 TB",79,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7150,write:6300,tbw:600,nand:"TLC V-NAND",watt:7,seg:"Doméstico"});
D("Samsung","980 PRO 500 GB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:6900,write:5000,tbw:300,nand:"TLC V-NAND",watt:6.2,seg:"Doméstico"});
D("Samsung","970 EVO Plus 250 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 3.0 ×4",capGB:250,read:3500,write:2300,tbw:150,nand:"TLC V-NAND",watt:5.5,seg:"Doméstico"});
D("WD","Black SN850X 4 TB con disipador",329,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:4000,read:7300,write:6600,tbw:2400,nand:"TLC BiCS5",watt:8.5,heatsink:true,seg:"Doméstico"});
D("WD","Blue SN5000 2 TB",119,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:5500,write:5000,tbw:900,nand:"QLC BiCS6",watt:6,dram:false,seg:"Doméstico"});
D("Crucial","P310 1 TB",69,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7100,write:6000,tbw:220,nand:"QLC Micron",watt:5.5,dram:false,seg:"Doméstico"});
D("Crucial","P3 Plus 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:4700,write:1900,tbw:110,nand:"QLC Micron",watt:5,dram:false,seg:"Doméstico"});
D("Kingston","KC3000 2 TB",149,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7000,write:7000,tbw:1600,nand:"TLC Micron 176L",watt:9.9,seg:"Doméstico"});
D("Kingston","NV3 1 TB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:6000,write:5000,tbw:320,nand:"TLC",watt:5,dram:false,seg:"Doméstico"});
D("Corsair","MP600 PRO LPX 1 TB",89,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7100,write:5800,tbw:700,nand:"TLC Micron",watt:8,heatsink:true,seg:"Doméstico"});
D("Corsair","MP600 CORE XT 2 TB",129,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:5000,write:4400,tbw:450,nand:"QLC",watt:6.5,dram:false,seg:"Doméstico"});
D("PNY","CS2241 1 TB",59,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:5150,write:4900,tbw:500,nand:"TLC",watt:5.5,dram:false,seg:"Doméstico"});
D("PNY","XLR8 CS3140 2 TB con disipador",149,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7500,write:6850,tbw:1400,nand:"TLC",watt:9,heatsink:true,seg:"Doméstico"});
D("SK hynix","Platinum P41 1 TB",99,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:7000,write:6500,tbw:750,nand:"TLC 176L",watt:7.5,seg:"Doméstico"});
D("Kioxia","EXCERIA PLUS G3 1 TB",69,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:1000,read:5000,write:3900,tbw:600,nand:"TLC BiCS5",watt:6,seg:"Doméstico"});
D("Lexar","NM790 4 TB",239,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:4000,read:7400,write:6500,tbw:3000,nand:"TLC YMTC",watt:7,dram:false,seg:"Doméstico"});
D("TeamGroup","MP44L 500 GB",39,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:500,read:4800,write:3200,tbw:300,nand:"TLC",watt:5,dram:false,seg:"Doméstico"});
D("ADATA","LEGEND 800 250 GB",29,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:250,read:3500,write:2200,tbw:150,nand:"TLC",watt:4.5,dram:false,seg:"Doméstico"});
D("Seagate","FireCuda 530R 2 TB con disipador",189,{iface:"M.2 2280 NVMe",gen:"PCIe 4.0 ×4",capGB:2000,read:7400,write:6900,tbw:2550,nand:"TLC Micron 176L",watt:9,heatsink:true,seg:"Doméstico"});
// SSD SATA 2,5"
D("Samsung","870 QVO 4 TB",249,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:560,write:530,tbw:1440,nand:"QLC V-NAND",watt:3,seg:"Doméstico"});
D("Crucial","BX500 500 GB",34,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:500,read:540,write:500,tbw:120,nand:"TLC Micron",watt:2.5,dram:false,seg:"Doméstico"});
D("Crucial","MX500 1 TB",69,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:560,write:510,tbw:360,nand:"TLC Micron",watt:3,seg:"Doméstico"});
D("Kingston","A400 240 GB",22,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:240,read:500,write:350,tbw:80,nand:"TLC",watt:2,dram:false,seg:"Doméstico"});
D("WD","Red SA500 NAS 2 TB",169,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:2000,read:560,write:530,tbw:1300,nand:"TLC",watt:3.5,seg:"NAS"});
D("Kingston","DC600M 1.92 TB",289,{iface:"SATA 2.5\"",gen:"SATA III 6 Gb/s",capGB:1920,read:560,write:530,tbw:3504,nand:"3D TLC",watt:4.5,seg:"Servidor"});
// Discos duros 3,5"
D("WD","Blue 2 TB 7200 rpm",59,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:2000,read:180,write:180,tbw:null,nand:"HDD 7200 rpm CMR",watt:6.5,dram:false,seg:"Doméstico"});
D("WD","Red Plus 8 TB NAS",199,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:8000,read:215,write:215,tbw:null,nand:"HDD 5640 rpm CMR",watt:8.8,dram:false,seg:"NAS"});
D("Seagate","SkyHawk 4 TB videovigilancia",109,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:4000,read:190,write:190,tbw:null,nand:"HDD 5400 rpm CMR",watt:7,dram:false,seg:"Videovigilancia"});
D("Seagate","Exos X20 20 TB",379,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:20000,read:285,write:285,tbw:null,nand:"HDD 7200 rpm CMR",watt:9.4,dram:false,seg:"Servidor"});
D("Toshiba","MG09 18 TB",349,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:18000,read:268,write:268,tbw:null,nand:"HDD 7200 rpm CMR",watt:8.9,dram:false,seg:"Servidor"});
D("Toshiba","P300 1 TB",45,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:1000,read:160,write:160,tbw:null,nand:"HDD 7200 rpm",watt:6,dram:false,seg:"Doméstico"});
D("WD","Purple 6 TB",149,{iface:"SATA 3.5\"",gen:"SATA III 6 Gb/s",capGB:6000,read:175,write:175,tbw:null,nand:"HDD 5400 rpm",watt:5.3,dram:false,seg:"Videovigilancia"});

/* ── MEMORIA RAM · ampliación ────────────────────────────────────── */
const R=(brand,name,price,o)=>add("ram",brand,name,price,{rgb:false,...o});
R("G.Skill","Trident Z5 RGB 32 GB (2×16) 7200 CL34",189,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:7200,cl:34,timings:"34-45-45-115",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:9,rank:"1R",die:"SK hynix M-die"});
R("G.Skill","Ripjaws S5 64 GB (2×32) 6000 CL30",219,{memType:"DDR5",kit:2,capGB:64,perStick:32,speed:6000,cl:30,timings:"30-40-40-96",volt:1.4,profile:"EXPO + XMP 3.0",height:32,watt:11,rank:"2R",die:"SK hynix"});
R("Corsair","Vengeance RGB 96 GB (2×48) 6600 CL32",399,{memType:"DDR5",kit:2,capGB:96,perStick:48,speed:6600,cl:32,timings:"32-39-39-76",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:13,rank:"2R",die:"SK hynix M-die"});
R("Kingston","FURY Renegade RGB 32 GB (2×16) 6400 CL32",159,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:6400,cl:32,timings:"32-39-39-80",volt:1.4,profile:"XMP 3.0",rgb:true,height:44,watt:9,rank:"1R",die:"SK hynix"});
R("Crucial","Pro 32 GB (2×16) 5600 CL46",89,{memType:"DDR5",kit:2,capGB:32,perStick:16,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC",height:31,watt:7,rank:"1R",die:"Micron"});
R("TeamGroup","T-Force Delta RGB 16 GB (2×8) 6000 CL38",69,{memType:"DDR5",kit:2,capGB:16,perStick:8,speed:6000,cl:38,timings:"38-38-38-78",volt:1.25,profile:"XMP 3.0",rgb:true,height:44,watt:6,rank:"1R",die:"SK hynix"});
R("Corsair","Vengeance LPX 32 GB (2×16) 3600 CL18",69,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:18,timings:"18-22-22-42",volt:1.35,profile:"XMP 2.0",height:34,watt:6,rank:"1R",die:"Varios"});
R("Corsair","Vengeance RGB PRO 64 GB (4×16) 3200 CL16",149,{memType:"DDR4",kit:4,capGB:64,perStick:16,speed:3200,cl:16,timings:"16-20-20-38",volt:1.35,profile:"XMP 2.0",rgb:true,height:51,watt:12,rank:"2R",die:"Varios"});
R("G.Skill","Ripjaws V 16 GB (2×8) 3200 CL16",39,{memType:"DDR4",kit:2,capGB:16,perStick:8,speed:3200,cl:16,timings:"16-18-18-38",volt:1.35,profile:"XMP 2.0",height:42,watt:5,rank:"1R",die:"Varios"});
R("Crucial","Ballistix 32 GB (2×16) 3600 CL16",0,{memType:"DDR4",kit:2,capGB:32,perStick:16,speed:3600,cl:16,timings:"16-18-18-38",volt:1.35,profile:"XMP 2.0",height:39,watt:6,rank:"1R",die:"Micron E-die"});
R("Kingston","ValueRAM 16 GB (1×16) 2666 CL19",39,{memType:"DDR4",kit:1,capGB:16,perStick:16,speed:2666,cl:19,timings:"19-19-19",volt:1.2,profile:"JEDEC",height:31,watt:3,rank:"2R",die:"Varios"});
R("G.Skill","Ripjaws X 8 GB (2×4) 1600 CL9",0,{memType:"DDR3",kit:2,capGB:8,perStick:4,speed:1600,cl:9,timings:"9-9-9-24",volt:1.5,profile:"XMP 1.3",height:40,watt:5,rank:"1R",die:"Varios"});
R("Kingston","HyperX Fury 16 GB (2×8) 1866 CL10",0,{memType:"DDR3",kit:2,capGB:16,perStick:8,speed:1866,cl:10,timings:"10-11-10-30",volt:1.5,profile:"XMP 1.3",height:35,watt:6,rank:"2R",die:"Varios"});
R("Crucial","32 GB (2×16) DDR3L 1600 CL11",0,{memType:"DDR3",kit:2,capGB:32,perStick:16,speed:1600,cl:11,timings:"11-11-11-28",volt:1.35,profile:"JEDEC",height:30,watt:6,rank:"2R",die:"Micron"});
R("Kingston","Server Premier 32 GB RDIMM 4800 CL40",189,{memType:"DDR5-RDIMM",kit:1,capGB:32,perStick:32,speed:4800,cl:40,timings:"40-39-39",volt:1.1,profile:"JEDEC ECC",height:32,watt:9,rank:"2R",die:"ECC registrada"});
R("Micron","128 GB RDIMM 5600 CL46",849,{memType:"DDR5-RDIMM",kit:1,capGB:128,perStick:128,speed:5600,cl:46,timings:"46-45-45",volt:1.1,profile:"JEDEC ECC",height:32,watt:15,rank:"4R",die:"ECC registrada"});

/* ── CAJAS · ampliación ──────────────────────────────────────────── */
const B=(brand,name,price,o)=>add("case",brand,name,price,o);
B("Fractal Design","Pop Air RGB",89,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:405,coolerH:170,psuLen:190,psuForm:["ATX","SFX"],rad:{top:280,front:360},fanInc:3,fanMax:7,fanSizes:[120,140],bays35:2,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.1 G2, 2× USB-A 3.0, jack",dims:"455×215×453 mm",vol:44.3,color:"Negro / blanco"});
B("Lian Li","O11 Vision Compact",149,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:375,coolerH:167,psuLen:180,psuForm:["ATX","SFX"],rad:{top:360,side:360,bottom:360},fanInc:0,fanMax:9,fanSizes:[120,140],bays35:2,bays25:3,side:"Cristal templado en tres caras",psuPos:"Trasera",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.0, jack",dims:"446×291×419 mm",vol:54.4,color:"Negro / blanco"});
B("NZXT","H9 Flow (2024)",149,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:435,coolerH:165,psuLen:200,psuForm:["ATX","SFX"],rad:{top:360,side:360,bottom:360},fanInc:3,fanMax:10,fanSizes:[120,140],bays35:1,bays25:4,side:"Cristal templado doble",psuPos:"Trasera",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.2 G1, jack",dims:"466×290×495 mm",vol:66.9,color:"Negro / blanco"});
B("be quiet!","Pure Base 500DX",109,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:369,coolerH:190,psuLen:225,psuForm:["ATX","SFX"],rad:{top:240,front:360},fanInc:3,fanMax:6,fanSizes:[120,140],bays35:2,bays25:5,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.2 G1, jack",dims:"463×232×450 mm",vol:48.3,color:"Negro / blanco"});
B("Cooler Master","MasterBox TD500 Mesh V2",99,{form:["E-ATX","ATX","Micro-ATX","Mini-ITX"],gpuLen:410,coolerH:165,psuLen:180,psuForm:["ATX","SFX"],rad:{top:360,front:360},fanInc:3,fanMax:7,fanSizes:[120,140],bays35:2,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.2 G1, jack",dims:"493×217×468 mm",vol:50.1,color:"Negro / blanco"});
B("Corsair","3500X ARGB",119,{form:["E-ATX","ATX","Micro-ATX","Mini-ITX"],gpuLen:400,coolerH:170,psuLen:220,psuForm:["ATX","SFX"],rad:{top:360,side:360,bottom:280},fanInc:3,fanMax:10,fanSizes:[120,140],bays35:2,bays25:3,side:"Cristal templado doble",psuPos:"Inferior",frontIO:"1× USB-C 3.2 G2, 2× USB-A 3.2 G1, jack",dims:"466×260×472 mm",vol:57.2,color:"Negro / blanco"});
B("Fractal Design","Ridge",139,{form:["Mini-ITX"],gpuLen:325,coolerH:70,psuLen:130,psuForm:["SFX","SFX-L"],rad:{side:240},fanInc:0,fanMax:4,fanSizes:[120],bays35:0,bays25:2,side:"Panel de madera / acero",psuPos:"Lateral",frontIO:"1× USB-C 3.2 G2, 1× USB-A 3.0, jack",dims:"377×123×358 mm",vol:16.6,color:"Nogal / negro"});
B("SSUPD","Meshlicious",119,{form:["Mini-ITX"],gpuLen:336,coolerH:73,psuLen:130,psuForm:["SFX","SFX-L","ATX"],rad:{side:280},fanInc:0,fanMax:4,fanSizes:[120,140],bays35:1,bays25:3,side:"Malla o cristal",psuPos:"Lateral",frontIO:"1× USB-C 3.2 G2, 1× USB-A 3.0, jack",dims:"360×167×245 mm",vol:14.7,color:"Negro / blanco"});
B("Phanteks","Enthoo Pro 2 Server Edition",189,{form:["EEB","CEB","E-ATX","ATX","Micro-ATX","Mini-ITX"],gpuLen:503,coolerH:195,psuLen:255,psuForm:["ATX","SFX"],rad:{top:480,front:420,side:360},fanInc:3,fanMax:14,fanSizes:[120,140],bays35:12,bays25:4,side:"Acero",psuPos:"Inferior (2 fuentes)",frontIO:"1× USB-C 3.2 G2, 4× USB-A 3.0, jack",dims:"580×240×560 mm",vol:78,color:"Negro"});
B("Tempest","Cage",59,{form:["ATX","Micro-ATX","Mini-ITX"],gpuLen:330,coolerH:160,psuLen:180,psuForm:["ATX"],rad:{top:240,front:240},fanInc:4,fanMax:6,fanSizes:[120],bays35:2,bays25:2,side:"Cristal templado",psuPos:"Inferior",frontIO:"2× USB-A 3.0, jack",dims:"420×200×450 mm",vol:37.8,color:"Negro"});

/* ── AUXILIARES ──────────────────────────────────────────────────── */
add("fan","Noctua","NF-A12x25 PWM",32,{size:120,rpm:2000,cfm:60.1,mmH2O:2.34,noise:22.6,conn:"4-pin PWM",rgb:false,watt:1.68,bearing:"SSO2",warranty:6});
add("fan","Arctic","P12 PWM PST (5 uds.)",29,{size:120,rpm:1800,cfm:56.3,mmH2O:2.2,noise:22.5,conn:"4-pin PWM + PST",rgb:false,watt:0.96,bearing:"Fluid",warranty:6});
add("fan","Lian Li","UNI FAN SL-Infinity 120 (3 uds.)",89,{size:120,rpm:1900,cfm:61.3,mmH2O:2.54,noise:29,conn:"Propietario (controladora)",rgb:true,watt:2.4,bearing:"Rifle",warranty:2});
add("fan","be quiet!","Silent Wings 4 140 mm",29,{size:140,rpm:1600,cfm:78.8,mmH2O:1.79,noise:18.9,conn:"4-pin PWM",rgb:false,watt:1.7,bearing:"FDB",warranty:5});
add("hub","Arctic","Case Fan Hub 10-Port PWM",13,{ports:10,pwm:true,power:"SATA",rgb:false,watt:0.5});
add("hub","Corsair","iCUE Commander CORE XT",59,{ports:6,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:6,watt:2});
add("hub","Lian Li","UNI FAN SL-Infinity Controller",25,{ports:4,pwm:true,power:"SATA + USB 2.0",rgb:true,rgbCh:4,watt:1.5});
add("paste","Thermal Grizzly","Kryonaut 1 g",9,{cond:12.5,type:"Cerámica no conductiva",grams:1,elec:false,cure:false,life:"2 años"});
add("paste","Arctic","MX-6 4 g",8,{cond:10.5,type:"Compuesto de carbono",grams:4,elec:false,cure:200,life:"8 años"});
add("paste","Thermal Grizzly","Conductonaut Extreme 1 g",19,{cond:73,type:"Metal líquido",grams:1,elec:true,cure:false,life:"—",warn:"Conductivo: no usar sobre aluminio ni cerca de PCB"});
add("rgb","Corsair","iCUE LS100 Kit 450 mm",69,{len:450,leds:138,type:"ARGB direccionable",conn:"Controladora iCUE",watt:5,adhesive:true});
add("rgb","Phanteks","Neon Digital-RGB LED Strip 400 mm",29,{len:400,leds:60,type:"ARGB 5 V 3-pin",conn:"Cabecera ARGB placa",watt:3,adhesive:true});
add("rgb","Lian Li","Strimer Plus V2 24-pin",49,{len:200,leds:120,type:"ARGB cable ATX",conn:"Controladora L-Connect",watt:4,adhesive:false});
add("cable","CableMod","Pro ModMesh Kit ATX/EPS/PCIe",99,{kind:"Kit de extensores sleeved",pieces:6,len:300,combs:true,color:"Múltiples"});
add("cable","Corsair","Premium 12VHPWR 600 W Type-4",39,{kind:"Cable 12V-2×6 nativo",pieces:1,len:650,combs:true,color:"Negro"});
add("cable","Velcro","Bridas reutilizables 20 uds.",6,{kind:"Gestión de cables",pieces:20,len:200,combs:false,color:"Negro"});
add("cable","Noctua","NA-SEC1 Extensores PWM 30 cm (3 uds.)",8,{kind:"Extensor 4-pin PWM",pieces:3,len:300,combs:false,color:"Negro"});

/* ── PERIFÉRICOS ─────────────────────────────────────────────────── */
add("monitor","LG","UltraGear 27GR95QE-B",799,{size:27,res:"2560×1440",panel:"OLED",hz:240,gtg:0.03,sync:"G-Sync Compatible + FreeSync Premium",hdr:"HDR10",nits:200,ports:"2× HDMI 2.1, 1× DP 1.4, USB hub",curve:null,ratio:"16:9",watt:65,vesa:"100×100"});
add("monitor","Samsung","Odyssey G9 49\" G95C",1099,{size:49,res:"5120×1440",panel:"VA",hz:240,gtg:1,sync:"G-Sync Compatible + FreeSync Premium Pro",hdr:"HDR1000",nits:1000,ports:"1× HDMI 2.1, 2× DP 1.4",curve:"1000R",ratio:"32:9",watt:90,vesa:"100×100"});
add("monitor","Dell","UltraSharp U2723QE",579,{size:27,res:"3840×2160",panel:"IPS Black",hz:60,gtg:5,sync:"—",hdr:"—",nits:400,ports:"1× HDMI 2.0, 1× DP 1.4, USB-C 90 W, RJ45",curve:null,ratio:"16:9",watt:55,vesa:"100×100"});
add("monitor","AOC","24G2SPU/BK",149,{size:24,res:"1920×1080",panel:"IPS",hz:165,gtg:1,sync:"FreeSync Premium",hdr:"—",nits:250,ports:"1× HDMI 2.0, 1× DP 1.2, VGA",curve:null,ratio:"16:9",watt:30,vesa:"100×100"});
add("keyboard","Keychron","Q1 Pro QMK/VIA",199,{layout:"75%",switches:"Gateron Jupiter Banana",hotswap:true,conn:"USB-C + BT 5.1 + 2,4 GHz",kc:"PBT double-shot",case:"Aluminio CNC",rgb:true,rot:1000,watt:2.5});
add("keyboard","Logitech","G915 TKL Lightspeed",199,{layout:"TKL",switches:"GL Tactile low-profile",hotswap:false,conn:"Lightspeed 2,4 GHz + BT",kc:"ABS",case:"Aluminio",rgb:true,rot:1000,watt:2});
add("keyboard","Razer","Huntsman V3 Pro TKL",249,{layout:"TKL",switches:"Analógico óptico gen-2 (Rapid Trigger)",hotswap:false,conn:"USB-C",kc:"PBT double-shot",case:"Aluminio",rgb:true,rot:8000,watt:3});
add("mouse","Logitech","G Pro X Superlight 2 DEX",159,{sensor:"HERO 2",dpi:44000,ips:888,accel:88,weight:60,conn:"Lightspeed 2,4 GHz + USB-C",buttons:6,switches:"LIGHTFORCE híbrido",bat:95,rgb:false,shape:"Ergonómico diestro"});
add("mouse","Razer","Viper V3 Pro",159,{sensor:"Focus Pro 35K gen-2",dpi:35000,ips:750,accel:70,weight:54,conn:"HyperSpeed 2,4 GHz + USB-C",buttons:6,switches:"Óptico gen-3",bat:95,rgb:false,shape:"Simétrico"});
add("mouse","Logitech","MX Master 3S",109,{sensor:"Darkfield 8K",dpi:8000,ips:null,accel:null,weight:141,conn:"Bolt 2,4 GHz + BT",buttons:7,switches:"Silencioso",bat:70,rgb:false,shape:"Ergonómico productividad"});
add("pad","Artisan","Hien Mid XL",65,{w:420,h:330,thick:3,surface:"Tela Hien (rápida)",base:"Caucho",stitch:false,rgb:false,washable:true});
add("pad","Logitech","G840 XL",49,{w:900,h:400,thick:3,surface:"Tela con revestimiento",base:"Caucho",stitch:false,rgb:false,washable:true});
add("pad","Corsair","MM700 RGB Extended",79,{w:930,h:400,thick:4,surface:"Tela microtejida",base:"Caucho antideslizante",stitch:true,rgb:true,washable:false,watt:2.5});
add("headset","Sennheiser","HD 560S + FiiO K5 Pro",319,{type:"Abierto + DAC/amp",drivers:38,imp:120,freq:"6 Hz – 38 kHz",mic:false,conn:"Jack 6,3 mm / USB DAC",wireless:false,anc:false,weight:240,watt:5});
add("headset","SteelSeries","Arctis Nova Pro Wireless",349,{type:"Cerrado circumaural",drivers:40,imp:38,freq:"10 Hz – 40 kHz",mic:true,conn:"2,4 GHz + BT + USB-C",wireless:true,anc:true,weight:337,bat:44,watt:3});
add("headset","HyperX","Cloud III",99,{type:"Cerrado circumaural",drivers:53,imp:64,freq:"10 Hz – 21 kHz",mic:true,conn:"USB-C / jack 3,5 mm",wireless:false,anc:false,weight:320,watt:1});
add("mic","Shure","MV7+",299,{type:"Dinámico cardioide",conn:"USB-C + XLR",rate:"48 kHz / 24 bit",arm:false,shock:false,watt:2.5});
add("mic","Elgato","Wave:3",149,{type:"Condensador cardioide",conn:"USB-C",rate:"96 kHz / 24 bit",arm:false,shock:false,watt:2.5});
add("webcam","Elgato","Facecam MK.2",149,{res:"1080p60",sensor:"Sony STARVIS 2",fov:"77°/82°/90°",af:true,mic:false,conn:"USB-C",watt:2.5});
add("webcam","Logitech","MX Brio 4K",229,{res:"4K30 / 1080p60",sensor:"Sony 8,5 MP",fov:"65°/78°/90°",af:true,mic:true,conn:"USB-C",watt:2.5});
add("speaker","Edifier","MR4",119,{type:"Monitores activos 2.0",power:42,drivers:"4\" + 1\" tweeter",conn:"TRS, RCA, AUX",sub:false,bt:false,watt:42});
add("speaker","Logitech","Z407",99,{type:"2.1 con subwoofer",power:40,drivers:"Satélites + sub 4\"",conn:"BT, USB, 3,5 mm",sub:true,bt:true,watt:40});

/* ═══════════════════════════════════════════════════════════════════
   MOTOR DE COMPATIBILIDAD
   gate()   → bloquea piezas incompatibles en el catálogo (tiempo real)
   runPost()→ informe completo tipo POST para el montaje actual
   ═══════════════════════════════════════════════════════════════════ */
const one = (b,c)=> Array.isArray(b[c]) ? b[c][0] : b[c];
const list = (b,c)=> Array.isArray(b[c]) ? b[c] : (b[c]?[b[c]]:[]);
const maxRad = cs => cs?.rad ? Math.max(...Object.values(cs.rad)) : 0;
const radFits = (cs,size) => cs?.rad ? Object.values(cs.rad).some(v=>v>=size) : false;

function gate(part, b){
  const no = r => ({ blocked:true, reason:r });
  const cpu=one(b,"cpu"), mbo=one(b,"mbo"), cs=one(b,"case"),
        cool=one(b,"cooler"), gpu=one(b,"gpu"), psu=one(b,"psu");
  const rams=list(b,"ram");

  switch(part.cat){
    case "cpu":
      if(mbo && part.socket!==mbo.socket) return no(`Socket ${part.socket} ≠ ${mbo.socket} de la placa`);
      if(!mbo && rams[0] && part.mem?.length && !part.mem.includes(rams[0].memType))
        return no(`No soporta ${rams[0].memType}`);
      if(cool && !cool.sockets?.includes(part.socket)) return no(`El disipador no cubre ${part.socket}`);
      break;
    case "mbo":
      if(cpu && part.socket!==cpu.socket) return no(`Socket ${part.socket} ≠ ${cpu.socket} de la CPU`);
      if(rams[0] && part.memType!==rams[0].memType) return no(`Placa ${part.memType}, RAM ${rams[0].memType}`);
      if(cs && !cs.form.includes(part.form)) return no(`${part.form} no cabe en ${cs.name}`);
      if(cool && !cool.sockets?.includes(part.socket)) return no(`El disipador no cubre ${part.socket}`);
      break;
    case "ram":{
      const ref = mbo?.memType || (cpu?.mem?.length===1 ? cpu.mem[0] : null);
      if(ref && part.memType!==ref) return no(`${part.memType} ≠ ${ref} del sistema`);
      if(cpu && cpu.mem?.length && !cpu.mem.includes(part.memType)) return no(`La CPU no soporta ${part.memType}`);
      if(mbo){
        const used = rams.reduce((a,r)=>a+r.kit*(r.qty||1),0);
        if(used + part.kit > mbo.dimm) return no(`Sin slots libres (${mbo.dimm} DIMM)`);
      }
      if(cool && !cool.radSize){
        const over = part.height - cool.ramClear;
        if(over > (cool.fanRaise||0))
          return no(`${part.height} mm de alto; el ${cool.name} deja ${cool.ramClear} mm`);
        if(over > 0 && cs && cool.height + over > cs.coolerH)
          return no(`Subiendo el ventilador el disipador llega a ${cool.height+over} mm y no cabe`);
      }
      break;
    }
    case "cooler":{
      const sock = cpu?.socket || mbo?.socket;
      if(sock && !part.sockets?.includes(sock)) return no(`No compatible con ${sock}`);
      if(cs){
        if(part.radSize && !radFits(cs,part.radSize)) return no(`Radiador ${part.radSize} mm no cabe (máx ${maxRad(cs)} mm)`);
        if(!part.radSize && part.height>cs.coolerH) return no(`${part.height} mm > ${cs.coolerH} mm de la caja`);
      }
      if(cpu && part.tdpRated < (cpu.ppt||cpu.tdp)) return no(`${part.tdpRated} W < ${cpu.ppt||cpu.tdp} W de la CPU`);
      if(rams[0] && !part.radSize){
        const over = rams[0].height - part.ramClear;
        if(over > (part.fanRaise||0))
          return no(`Choca con la RAM (${rams[0].height} mm > ${part.ramClear} mm libres)`);
        if(over > 0 && cs && part.height + over > cs.coolerH)
          return no(`Con la RAM alta subiría a ${part.height+over} mm y la caja da ${cs.coolerH} mm`);
      }
      break;
    }
    case "gpu":
      if(cs && part.len>cs.gpuLen) return no(`${part.len} mm > ${cs.gpuLen} mm de la caja`);
      break;
    case "psu":
      if(cs && !cs.psuForm.includes(part.form)) return no(`Formato ${part.form} no admitido por la caja`);
      if(cs && part.len>cs.psuLen) return no(`${part.len} mm > ${cs.psuLen} mm de la caja`);
      if(gpu && part.watt < gpu.psuMin) return no(`${part.watt} W < ${gpu.psuMin} W mínimos de la gráfica`);
      break;
    case "case":
      if(mbo && !part.form.includes(mbo.form)) return no(`No admite ${mbo.form}`);
      if(gpu && gpu.len>part.gpuLen) return no(`Gráfica de ${gpu.len} mm > ${part.gpuLen} mm`);
      if(cool){
        if(cool.radSize && !radFits(part,cool.radSize)) return no(`Sin sitio para radiador de ${cool.radSize} mm`);
        if(!cool.radSize && cool.height>part.coolerH) return no(`Disipador de ${cool.height} mm > ${part.coolerH} mm`);
      }
      if(psu && (!part.psuForm.includes(psu.form) || psu.len>part.psuLen)) return no(`No admite la fuente elegida`);
      break;
    case "storage":
      if(mbo){
        if(part.iface.startsWith("M.2") && mbo.m2===0) return no("La placa no tiene ranuras M.2");
        if(part.iface.startsWith("SATA") && mbo.sata===0) return no("La placa no tiene puertos SATA");
      }
      break;
    case "fan":
      if(cs && !cs.fanSizes.includes(part.size)) return no(`La caja no admite ${part.size} mm`);
      break;
    default: break;
  }
  return { blocked:false };
}

const POST_CODES = {
  SOCKET:"0x01", CPU_MEM:"0x02", MEM_TYPE:"0x03", MEM_SLOTS:"0x04", MEM_SPEED:"0x05",
  MEM_CAP:"0x06", COOL_SOCK:"0x10", COOL_TDP:"0x11", COOL_HEIGHT:"0x12", COOL_RAM:"0x13",
  RAD_FIT:"0x14", GPU_LEN:"0x20", GPU_PWR:"0x21", MBO_FORM:"0x30", PSU_FORM:"0x31",
  PSU_LEN:"0x32", PSU_LOAD:"0x33", PSU_CONN:"0x34", M2_SLOTS:"0x40", SATA_PORTS:"0x41",
  FAN_FIT:"0x50", FAN_HDR:"0x51", RGB_HDR:"0x52", MISC:"0xFF",
};

function runPost(b, power){
  const L=[]; const push=(lvl,id,msg)=>L.push({lvl,code:POST_CODES[id]||"0x??",id,msg});
  const cpu=one(b,"cpu"), mbo=one(b,"mbo"), cs=one(b,"case"), cool=one(b,"cooler"),
        gpu=one(b,"gpu"), psu=one(b,"psu");
  const rams=list(b,"ram"), st=list(b,"storage"), fans=list(b,"fan"),
        rgbs=list(b,"rgb"), hub=one(b,"hub");

  if(cpu&&mbo) cpu.socket===mbo.socket
    ? push("ok","SOCKET",`${cpu.socket} ←→ ${cpu.socket}`)
    : push("fail","SOCKET",`CPU ${cpu.socket} contra placa ${mbo.socket}`);
  if(cpu&&mbo&&cpu.mem?.length) cpu.mem.includes(mbo.memType)
    ? push("ok","CPU_MEM",`La CPU soporta ${mbo.memType}`)
    : push("fail","CPU_MEM",`La CPU no soporta ${mbo.memType}`);

  if(rams.length&&mbo){
    const bad = rams.filter(r=>r.memType!==mbo.memType);
    bad.length ? push("fail","MEM_TYPE",`${bad.length} módulo(s) ${bad[0].memType} en placa ${mbo.memType}`)
               : push("ok","MEM_TYPE",`${mbo.memType} ←→ ${mbo.memType}`);
    const sticks = rams.reduce((a,r)=>a+r.kit*(r.qty||1),0);
    sticks<=mbo.dimm ? push("ok","MEM_SLOTS",`${sticks}/${mbo.dimm} DIMM ocupados`)
                     : push("fail","MEM_SLOTS",`${sticks} módulos para ${mbo.dimm} slots`);
    const cap = rams.reduce((a,r)=>a+r.capGB*(r.qty||1),0);
    cap<=mbo.memMaxGB ? push("ok","MEM_CAP",`${cap} GB / ${mbo.memMaxGB} GB máximos`)
                      : push("fail","MEM_CAP",`${cap} GB supera el máximo de ${mbo.memMaxGB} GB`);
    const fastest = Math.max(...rams.map(r=>r.speed));
    if(fastest>mbo.memOC) push("warn","MEM_SPEED",`${fastest} MT/s por encima del OC validado (${mbo.memOC})`);
    else if(cpu?.memMax && fastest>cpu.memMax) push("warn","MEM_SPEED",`${fastest} MT/s exige perfil ${rams[0].profile}; JEDEC de la CPU: ${cpu.memMax}`);
    else push("ok","MEM_SPEED",`${fastest} MT/s dentro de especificación`);
    if(sticks===4 && rams[0].memType==="DDR5")
      push("warn","MEM_SPEED","4 módulos DDR5: es habitual bajar frecuencia para estabilizar");
  }

  if(cool){
    const sock=cpu?.socket||mbo?.socket;
    if(sock) cool.sockets?.includes(sock) ? push("ok","COOL_SOCK",`Anclaje ${sock} incluido`)
                                          : push("fail","COOL_SOCK",`Sin anclaje para ${sock}`);
    if(cpu){
      const need=cpu.ppt||cpu.tdp;
      cool.tdpRated>=need ? push("ok","COOL_TDP",`${cool.tdpRated} W ≥ ${need} W de disipación`)
                          : push("fail","COOL_TDP",`${cool.tdpRated} W para una CPU de ${need} W`);
      if(cool.tdpRated>=need && cool.tdpRated<need*1.2)
        push("warn","COOL_TDP","Margen térmico justo: espera throttling en carga sostenida");
    }
    if(cs){
      if(cool.radSize) radFits(cs,cool.radSize)
        ? push("ok","RAD_FIT",`Radiador ${cool.radSize} mm alojado`)
        : push("fail","RAD_FIT",`Radiador ${cool.radSize} mm; la caja admite ${maxRad(cs)} mm`);
      else cool.height<=cs.coolerH
        ? push("ok","COOL_HEIGHT",`${cool.height} mm / ${cs.coolerH} mm libres`)
        : push("fail","COOL_HEIGHT",`${cool.height} mm > ${cs.coolerH} mm`);
    }
    if(rams[0]&&!cool.radSize){
      const over=rams[0].height-cool.ramClear;
      if(over<=0) push("ok","COOL_RAM",`RAM de ${rams[0].height} mm bajo el disipador`);
      else if(over<=(cool.fanRaise||0))
        push("warn","COOL_RAM",`RAM de ${rams[0].height} mm: hay que subir el ventilador ${over} mm, el disipador pasa a ${cool.height+over} mm`);
      else push("fail","COOL_RAM",`RAM de ${rams[0].height} mm; solo ${cool.ramClear} mm libres`);
    }
  }

  if(gpu&&cs){
    if(gpu.len>cs.gpuLen) push("fail","GPU_LEN",`${gpu.len} mm > ${cs.gpuLen} mm`);
    else if(cs.gpuLenRad && cool?.radSize>=240 && gpu.len>cs.gpuLenRad)
      push("warn","GPU_LEN",`Cabe (${gpu.len}/${cs.gpuLen} mm), pero con el radiador delante el límite baja a ${cs.gpuLenRad} mm: móntalo arriba`);
    else push("ok","GPU_LEN",`${gpu.len} mm / ${cs.gpuLen} mm`);
  }
  if(mbo&&cs) cs.form.includes(mbo.form) ? push("ok","MBO_FORM",`${mbo.form} en ${cs.name}`)
                                         : push("fail","MBO_FORM",`${cs.name} no admite ${mbo.form}`);
  if(psu&&cs){
    cs.psuForm.includes(psu.form) ? push("ok","PSU_FORM",`Formato ${psu.form} admitido`)
                                  : push("fail","PSU_FORM",`La caja no admite ${psu.form}`);
    psu.len<=cs.psuLen ? push("ok","PSU_LEN",`${psu.len} mm / ${cs.psuLen} mm`)
                       : push("fail","PSU_LEN",`Fuente de ${psu.len} mm; caben ${cs.psuLen} mm`);
  }
  if(psu){
    const load=power.total, pct=Math.round(load/psu.watt*100);
    if(load>psu.watt) push("fail","PSU_LOAD",`${load} W estimados sobre una fuente de ${psu.watt} W`);
    else if(pct>85) push("warn","PSU_LOAD",`${pct}% de carga: sin margen para picos ni ampliaciones`);
    else push("ok","PSU_LOAD",`${load} W → ${pct}% de ${psu.watt} W`);
    if(gpu){
      if(psu.watt<gpu.psuMin) push("fail","PSU_LOAD",`El fabricante pide ${gpu.psuMin} W mínimos`);
      if(gpu.hpwr){
        psu.pcie5>0 ? push("ok","PSU_CONN","Conector 12V-2×6 nativo disponible")
                    : push("warn","PSU_CONN","Sin 12V-2×6 nativo: usarás el adaptador de la gráfica");
        if(psu.atx==="ATX 2.4") push("warn","PSU_CONN","Fuente pre-ATX 3.0: sin tolerancia de picos definida");
      } else if((gpu.conn8||0)+(gpu.conn6||0)===0){
        push("ok","PSU_CONN","La gráfica se alimenta por la ranura PCIe, sin cable extra");
      } else {
        const need=(gpu.conn8||0)+(gpu.conn6||0);
        const have=psu.pcie8||0;
        have>=need ? push("ok","PSU_CONN",`${gpu.power} · la fuente ofrece ${have} cable(s) PCIe`)
                   : push("fail","PSU_CONN",`La gráfica pide ${gpu.power} y la fuente da ${have} cable(s) PCIe`);
      }
    }
  }
  if(mbo&&st.length){
    const m2=st.filter(s=>s.iface.startsWith("M.2")).length;
    const sata=st.filter(s=>s.iface.startsWith("SATA")).length;
    if(m2) m2<=mbo.m2 ? push("ok","M2_SLOTS",`${m2}/${mbo.m2} ranuras M.2`)
                      : push("fail","M2_SLOTS",`${m2} unidades M.2 para ${mbo.m2} ranuras`);
    if(sata) sata<=mbo.sata ? push("ok","SATA_PORTS",`${sata}/${mbo.sata} puertos SATA`)
                            : push("fail","SATA_PORTS",`${sata} unidades SATA para ${mbo.sata} puertos`);
    if(m2>=3 && mbo.sata<=4) push("warn","SATA_PORTS","Muchas M.2 pobladas: en esta placa suelen deshabilitar puertos SATA");
    const g5=st.filter(s=>s.gen.includes("5.0")).length;
    if(g5>(mbo.m2gen5||0)) push("warn","M2_SLOTS",`${g5} SSD PCIe 5.0 pero solo ${mbo.m2gen5||0} ranura(s) Gen5: irán a Gen4`);
  }
  if(cs&&fans.length){
    const q=fans.reduce((a,f)=>a+(f.qty||1),0);
    const bad=fans.filter(f=>!cs.fanSizes.includes(f.size));
    bad.length ? push("fail","FAN_FIT",`Ventilador de ${bad[0].size} mm no admitido`)
               : push("ok","FAN_FIT",`${q} ventilador(es) sobre ${cs.fanMax} posiciones`);
    if(q>cs.fanMax) push("fail","FAN_FIT",`${q} ventiladores para ${cs.fanMax} posiciones`);
  }
  if(mbo&&fans.length){
    const q=fans.reduce((a,f)=>a+(f.qty||1),0)+(cool?.fans||0);
    if(q>mbo.fanHdr && !hub) push("warn","FAN_HDR",`${q} ventiladores contra ${mbo.fanHdr} cabeceras: añade un hub`);
    else if(hub) push("ok","FAN_HDR",`Hub de ${hub.ports} puertos cubre ${q} ventiladores`);
    else push("ok","FAN_HDR",`${q}/${mbo.fanHdr} cabeceras de ventilador`);
  }
  if(mbo&&rgbs.length){
    const needsCtl=rgbs.filter(r=>r.conn.includes("Controladora")).length;
    if(needsCtl && !hub?.rgb) push("warn","RGB_HDR",`${needsCtl} tira(s) exigen controladora propietaria`);
    else if(rgbs.length>mbo.rgbHdr && !hub?.rgb) push("warn","RGB_HDR",`${rgbs.length} tiras para ${mbo.rgbHdr} cabeceras ARGB`);
    else push("ok","RGB_HDR",`Iluminación con cabeceras suficientes`);
  }
  if(cpu&&!gpu&&!cpu.igpu) push("fail","MISC","La CPU no lleva gráfica integrada: hace falta una tarjeta");
  if(cpu?.museum) push("warn","MISC","Pieza histórica: catalogada como referencia, no para montar");
  if(cpu?.unlocked===false && mbo?.chipset?.match(/^(Z|X)/)) push("warn","MISC","CPU con multiplicador bloqueado sobre chipset de overclock");
  if(cpu?.x3d && cool && cool.tdpRated<200) push("warn","MISC","Los X3D son sensibles a la temperatura: recomendable más disipación");

  return L;
}

/* ── CONSUMO ─────────────────────────────────────────────────────── */
const PSU_SIZES=[400,450,500,550,600,650,700,750,850,1000,1200,1300,1600,2000];
function calcPower(b){
  const cpu=one(b,"cpu"), gpu=one(b,"gpu"), mbo=one(b,"mbo"), cool=one(b,"cooler");
  const rams=list(b,"ram"), st=list(b,"storage"), fans=list(b,"fan"), rgbs=list(b,"rgb");
  const d={};
  d.CPU = cpu ? (cpu.ppt||cpu.tdp||0) : 0;
  d.GPU = gpu ? gpu.tbp : 0;
  d.Placa = mbo ? (/^(X8|X6|Z8|Z7|WRX)/.test(mbo.chipset)?50:35) : 0;
  d.RAM = rams.reduce((a,r)=>a+r.watt*(r.qty||1),0);
  d.Discos = st.reduce((a,s)=>a+s.watt*(s.qty||1),0);
  d.Refrigeración = (cool?.watt||0) + fans.reduce((a,f)=>a+f.watt*(f.qty||1),0);
  d.Iluminación = rgbs.reduce((a,r)=>a+r.watt*(r.qty||1),0) + (one(b,"hub")?.watt||0);
  d.USB = ["keyboard","mouse","headset","mic","webcam"].reduce((a,c)=>a+(list(b,c).length?2.5:0),0);
  // total = todo a su límite a la vez (peor caso sostenido, no consumo típico)
  const total = Math.round(Object.values(d).reduce((a,v)=>a+v,0));
  const gaming = Math.round(total*0.8);              // carga real en juego
  // Pico transitorio: las gráficas modernas superan su TBP durante microsegundos
  const spike = gpu ? Math.round(total + gpu.tbp*0.5) : total;
  // 25 % de margen sobre el peor caso, y nunca por debajo del mínimo del fabricante
  const target = Math.max(total>0?Math.ceil(total*1.25):0, gpu?.psuMin||0);
  const rec = PSU_SIZES.find(s=>s>=target) || 2000;
  // Consumo de escritorio: va al enchufe, no a la fuente
  const desk = [...list(b,"monitor"),...list(b,"speaker")].reduce((a,p)=>a+(p.watt||0)*(p.qty||1),0);
  return { detail:d, total, gaming, spike, rec, desk, target };
}

/* ═══════════════════════════════════════════════════════════════════
   FILTROS — declarativos por categoría
   enum=chips · range=deslizador · bool=sí/no · has=tiene/no tiene
   ═══════════════════════════════════════════════════════════════════ */
const F = (k,label,type,unit)=>({k,label,type,unit});
const FILTERS = {
  cpu:[F("brand","Marca","enum"),F("socket","Socket","enum"),F("family","Generación","enum"),
    F("cores","Núcleos","range"),F("threads","Hilos","range"),F("boost","Turbo","range","GHz"),
    F("base","Frecuencia base","range","GHz"),F("l3","Caché L3","range","MB"),F("tdp","TDP","range","W"),
    F("ppt","Consumo máx.","range","W"),F("lith","Litografía","enum"),F("year","Año","range"),
    F("unlocked","Multiplicador libre","bool"),F("x3d","3D V-Cache","bool"),
    F("cooler","Disipador incluido","bool"),F("igpu","Gráfica integrada","has"),F("apu","APU","bool"),F("hedt","HEDT","bool")],
  mbo:[F("brand","Marca","enum"),F("socket","Socket","enum"),F("chipset","Chipset","enum"),
    F("form","Formato","enum"),F("memType","Tipo de memoria","enum"),F("dimm","Slots DIMM","range"),
    F("memMaxGB","RAM máxima","range","GB"),F("memOC","Memoria OC máx.","range","MT/s"),
    F("m2","Ranuras M.2","range"),F("m2gen5","M.2 PCIe 5.0","range"),F("sata","Puertos SATA","range"),
    F("lan","Red cableada","enum"),F("wifi","Wi-Fi","enum"),F("audio","Códec de audio","enum"),
    F("usbC","USB-C trasero","enum"),F("fanHdr","Cabeceras ventilador","range"),
    F("rgbHdr","Cabeceras ARGB","range"),F("tb","Thunderbolt / USB4","bool"),
    F("bios_flashback","BIOS Flashback","bool")],
  ram:[F("brand","Marca","enum"),F("memType","Tecnología","enum"),F("capGB","Capacidad total","range","GB"),
    F("perStick","Por módulo","range","GB"),F("kit","Módulos del kit","range"),
    F("speed","Frecuencia","range","MT/s"),F("cl","Latencia CL","range"),F("volt","Voltaje","range","V"),
    F("profile","Perfil","enum"),F("height","Altura","range","mm"),F("rank","Rango","enum"),
    F("die","Die","enum"),F("rgb","RGB","bool")],
  gpu:[F("brand","Marca","enum"),F("chip","GPU","enum"),F("vram","VRAM","range","GB"),
    F("vtype","Tipo de VRAM","enum"),F("bus","Bus","range","bit"),F("tbp","Consumo","range","W"),
    F("len","Longitud","range","mm"),F("slots","Slots","range"),F("pcie","Interfaz","enum"),
    F("psuMin","Fuente mínima","range","W"),F("boost","Boost","range","GHz"),F("year","Año","range"),F("seg","Segmento","enum"),F("hpwr","Conector 12V-2×6","bool")],
  storage:[F("brand","Marca","enum"),F("iface","Interfaz","enum"),F("gen","Bus","enum"),
    F("capGB","Capacidad","range","GB"),F("read","Lectura","range","MB/s"),F("write","Escritura","range","MB/s"),
    F("tbw","Resistencia","range","TBW"),F("nand","Memoria","enum"),F("seg","Uso","enum"),F("watt","Consumo","range","W"),
    F("dram","Caché DRAM","bool"),F("heatsink","Disipador incluido","bool")],
  psu:[F("brand","Marca","enum"),F("watt","Potencia","range","W"),F("eff","Certificación","enum"),
    F("atx","Norma ATX","enum"),F("form","Formato","enum"),F("len","Profundidad","range","mm"),
    F("modular","Modularidad","enum"),F("pcie5","Conectores 12V-2×6","range"),
    F("pcie8","Conectores PCIe 8p","range"),F("eps","Conectores EPS","range"),F("sata","Conectores SATA","range"),
    F("warranty","Garantía","range","años"),F("cert","Certificación Cybenetics","enum"),F("zero","Modo semi-fanless","bool")],
  case:[F("brand","Marca","enum"),F("gpuLen","Gráfica máx.","range","mm"),F("gpuLenRad","Gráfica con radiador frontal","range","mm"),F("coolerH","Disipador máx.","range","mm"),
    F("psuLen","Fuente máx.","range","mm"),F("fanMax","Ventiladores máx.","range"),
    F("fanInc","Ventiladores incluidos","range"),F("bays35","Bahías 3,5\"","range"),
    F("bays25","Bahías 2,5\"","range"),F("vol","Volumen","range","L"),F("side","Lateral","enum"),
    F("psuPos","Posición de la fuente","enum"),F("color","Color","enum"),F("frontIO","Panel frontal","enum")],
  cooler:[F("brand","Marca","enum"),F("type","Tipo","enum"),F("height","Altura","range","mm"),
    F("radSize","Radiador","range","mm"),F("tdpRated","Disipación","range","W"),
    F("fans","Ventiladores","range"),F("fanSize","Tamaño ventilador","range","mm"),
    F("noise","Ruido máx.","range","dBA"),F("ramClear","Espacio para RAM","range","mm"),F("fanRaise","Margen subiendo el ventilador","range","mm"),
    F("warranty","Garantía","range","años"),F("rgb","RGB","bool"),F("stock","De serie con la CPU","bool")],
  fan:[F("brand","Marca","enum"),F("size","Tamaño","range","mm"),F("rpm","RPM máx.","range"),
    F("cfm","Caudal","range","CFM"),F("mmH2O","Presión estática","range","mmH₂O"),
    F("noise","Ruido","range","dBA"),F("conn","Conector","enum"),F("bearing","Rodamiento","enum"),
    F("rgb","RGB","bool")],
  hub:[F("brand","Marca","enum"),F("ports","Puertos","range"),F("power","Alimentación","enum"),
    F("pwm","Control PWM","bool"),F("rgb","Canales RGB","bool")],
  paste:[F("brand","Marca","enum"),F("cond","Conductividad","range","W/mK"),F("type","Composición","enum"),
    F("grams","Cantidad","range","g"),F("elec","Conductivo eléctricamente","bool")],
  rgb:[F("brand","Marca","enum"),F("len","Longitud","range","mm"),F("leds","LEDs","range"),
    F("type","Tecnología","enum"),F("conn","Conexión","enum"),F("adhesive","Adhesivo","bool")],
  cable:[F("brand","Marca","enum"),F("kind","Tipo","enum"),F("pieces","Unidades","range"),
    F("len","Longitud","range","mm"),F("color","Color","enum"),F("combs","Peines incluidos","bool")],
  monitor:[F("brand","Marca","enum"),F("size","Diagonal","range","\""),F("res","Resolución","enum"),
    F("panel","Panel","enum"),F("hz","Refresco","range","Hz"),F("gtg","Respuesta","range","ms"),
    F("sync","Sincronización","enum"),F("hdr","HDR","enum"),F("nits","Brillo","range","nits"),
    F("ratio","Relación","enum"),F("curve","Curvatura","has"),F("watt","Consumo","range","W")],
  keyboard:[F("brand","Marca","enum"),F("layout","Formato","enum"),F("switches","Interruptores","enum"),
    F("conn","Conexión","enum"),F("kc","Teclas","enum"),F("case","Chasis","enum"),
    F("rot","Tasa de sondeo","range","Hz"),F("hotswap","Hot-swap","bool"),F("rgb","RGB","bool")],
  mouse:[F("brand","Marca","enum"),F("sensor","Sensor","enum"),F("dpi","DPI máx.","range"),
    F("weight","Peso","range","g"),F("buttons","Botones","range"),F("conn","Conexión","enum"),
    F("shape","Forma","enum"),F("bat","Autonomía","range","h"),F("rgb","RGB","bool")],
  pad:[F("brand","Marca","enum"),F("w","Ancho","range","mm"),F("h","Alto","range","mm"),
    F("thick","Grosor","range","mm"),F("surface","Superficie","enum"),F("base","Base","enum"),
    F("stitch","Bordes cosidos","bool"),F("rgb","RGB","bool"),F("washable","Lavable","bool")],
  headset:[F("brand","Marca","enum"),F("type","Tipo","enum"),F("drivers","Transductores","range","mm"),
    F("imp","Impedancia","range","Ω"),F("weight","Peso","range","g"),F("conn","Conexión","enum"),
    F("wireless","Inalámbrico","bool"),F("anc","Cancelación activa","bool"),F("mic","Micrófono","bool")],
  mic:[F("brand","Marca","enum"),F("type","Cápsula","enum"),F("conn","Conexión","enum"),
    F("rate","Muestreo","enum"),F("arm","Brazo incluido","bool")],
  webcam:[F("brand","Marca","enum"),F("res","Resolución","enum"),F("sensor","Sensor","enum"),
    F("fov","Campo de visión","enum"),F("af","Autoenfoque","bool"),F("mic","Micrófono","bool")],
  speaker:[F("brand","Marca","enum"),F("type","Configuración","enum"),F("power","Potencia","range","W"),
    F("conn","Conexión","enum"),F("sub","Subwoofer","bool"),F("bt","Bluetooth","bool")],
};

/* ── Resumen corto para las tarjetas ─────────────────────────────── */
const KEYSPECS = {
  cpu:p=>[`${p.cores}C/${p.threads}T`,`${p.boost} GHz`,`${p.l3} MB L3`,`${p.ppt||p.tdp} W`,p.socket],
  mbo:p=>[p.socket,p.chipset,p.form,p.memType,`${p.m2}× M.2`],
  ram:p=>[p.memType,`${p.capGB} GB (${p.kit}×${p.perStick})`,`${p.speed} MT/s`,`CL${p.cl}`,p.profile],
  gpu:p=>[`${p.vram} GB ${p.vtype}`,`${p.tbp} W`,`${p.len} mm`,`${p.slots} slots`],
  storage:p=>[p.iface.split(" ")[0],`${p.capGB>=1000?p.capGB/1000+" TB":p.capGB+" GB"}`,`${p.read} MB/s`,p.gen],
  psu:p=>[`${p.watt} W`,p.eff,p.form,p.atx,`${p.len} mm`],
  case:p=>[p.form[0],`GPU ${p.gpuLen} mm`,`Aire ${p.coolerH} mm`,`${p.vol} L`],
  cooler:p=>[p.type,p.radSize?`${p.radSize} mm`:`${p.height} mm`,`${p.tdpRated} W`,`${p.noise} dBA`],
  fan:p=>[`${p.size} mm`,`${p.rpm} rpm`,`${p.cfm} CFM`,`${p.noise} dBA`],
  hub:p=>[`${p.ports} puertos`,p.power,p.rgb?"ARGB":"Solo PWM"],
  paste:p=>[`${p.cond} W/mK`,p.type,`${p.grams} g`],
  rgb:p=>[`${p.len} mm`,`${p.leds} LED`,p.type],
  cable:p=>[p.kind,`${p.pieces} uds.`,p.color],
  monitor:p=>[`${p.size}"`,p.res,p.panel,`${p.hz} Hz`,`${p.gtg} ms`],
  keyboard:p=>[p.layout,p.switches,p.conn.split(" +")[0]],
  mouse:p=>[`${p.weight} g`,`${p.dpi} DPI`,p.conn.split(" +")[0]],
  pad:p=>[`${p.w}×${p.h} mm`,p.surface],
  headset:p=>[p.type,`${p.drivers} mm`,p.wireless?"Inalámbrico":"Cableado"],
  mic:p=>[p.type,p.conn,p.rate],
  webcam:p=>[p.res,p.fov],
  speaker:p=>[p.type,`${p.power} W`],
};

/* ═══════════════════════════════════════════════════════════════════
   DÓNDE COMPRAR
   Enlace directo al buscador de cada tienda con el modelo exacto.
   Sin precios ni stock: eso exigiría feeds de afiliación (ver README).
   ═══════════════════════════════════════════════════════════════════ */
const searchTerm = p => encodeURIComponent(
  `${p.brand} ${p.name}`.replace(/\s*\(.*?\)\s*/g," ").replace(/\s+/g," ").trim());
const storesFor = (part, region) =>
  REGIONS[region].stores.map(s=>({ ...s, url:s.url(searchTerm(part)) }));

/* ═══════════════════════════════════════════════════════════════════
   UI
   ═══════════════════════════════════════════════════════════════════ */
const hash = s => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); };
const eur = n => n==null ? "—" : n===0 ? "s/p" : new Intl.NumberFormat("es-ES",{maximumFractionDigits:0}).format(n);

/* Contactos dorados: indicador de estado de cada ranura */
function Fingers({ on, tone="" }){
  return <div className={`fingers ${on?"on":""} ${tone}`} aria-hidden="true">
    {[0,1,2,3].map(i=><i key={i}/>)}
  </div>;
}

/* Arte generativo de PCB, distinto por pieza (sin fotos de terceros) */
function PartArt({ part, h=88 }){
  const Icon = CAT[part.cat].icon;
  const s = hash(part.brand+part.name);
  const traces = Array.from({length:6},(_,i)=>{
    const y = 8 + ((s>>(i*3))%9)*10;
    const x = 6 + ((s>>(i*2))%5)*14;
    const w = 20 + ((s>>i)%6)*12;
    return <g key={i}>
      <path d={`M${x} ${y} h${w} l10 10 h${16+((s>>i)%20)}`} fill="none"
        stroke="#1E4534" strokeWidth="1.4"/>
      <circle cx={x} cy={y} r="2.1" fill="#1E4534"/>
    </g>;
  });
  return (
    <div style={{height:h,position:"relative",background:"#0B1A13",overflow:"hidden"}}>
      <svg width="100%" height="100%" viewBox="0 0 220 100" preserveAspectRatio="xMidYMid slice">{traces}</svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon size={h>70?30:22} color="var(--gold)" strokeWidth={1.3} opacity={.9}/>
      </div>
      <div className="mono" style={{position:"absolute",left:8,top:7,fontSize:9.5,
        letterSpacing:".13em",color:"var(--gold-dim)",textTransform:"uppercase"}}>{part.brand}</div>
    </div>
  );
}

/* Medidor de carga de la fuente: la firma del configurador */
function PowerGauge({ power, psu, compact }){
  const cap = psu?.watt || power.rec || 850;
  const pct = Math.min(100, (power.total/cap)*100);
  const spikePct = Math.min(100,(power.spike/cap)*100);
  const tone = pct>85?"var(--red)":pct>70?"var(--amber)":"var(--gold)";
  return (
    <div style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
        <span className="eyebrow" title="Todos los componentes a su límite a la vez">Peor caso</span>
        <span className="mono" style={{fontSize:compact?13:16,color:tone,fontWeight:600}}>
          {power.total} W <span style={{color:"var(--silk-dim)",fontSize:11}}>/ {cap} W</span>
        </span>
      </div>
      <div style={{position:"relative",height:compact?9:14,background:"#0A1610",
        border:"1px solid var(--trace)",overflow:"hidden"}}>
        {/* zona segura 0–60 % */}
        <div style={{position:"absolute",left:"60%",top:0,bottom:0,width:1,background:"rgba(216,174,82,.35)"}}/>
        <div style={{position:"absolute",left:"85%",top:0,bottom:0,width:1,background:"rgba(224,90,72,.5)"}}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${spikePct}%`,
          background:"rgba(224,90,72,.16)"}} title="Pico transitorio"/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:tone,
          transition:"width .4s cubic-bezier(.2,.8,.2,1)"}}/>
        {!psu && power.total>0 &&
          <div className="gauge-sweep" style={{position:"absolute",top:0,bottom:0,width:"18%",
            background:"linear-gradient(90deg,transparent,rgba(216,174,82,.22),transparent)"}}/>}
      </div>
      {!compact && (
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span className="mono" style={{fontSize:10,color:"var(--silk-dim)"}}>
            En juego ≈ {power.gaming} W · pico {power.spike} W
          </span>
          <span className="mono" style={{fontSize:10,color:"var(--silk-dim)"}}>
            Recomendada: <b style={{color:"var(--gold)"}}>{power.rec} W</b>
          </span>
        </div>
      )}
    </div>
  );
}

/* Informe POST */
function PostLog({ log }){
  const ico = l => l==="ok"?<Check size={11}/>:l==="warn"?<AlertTriangle size={11}/>:<XCircle size={11}/>;
  const tag = l => l==="ok"?"[ OK ]":l==="warn"?"[WARN]":"[FALLO]";
  return (
    <div>
      {log.length===0 && (
        <div className="mono" style={{fontSize:11,color:"var(--silk-dim)",padding:"14px 0",lineHeight:1.7}}>
          Sin comprobaciones todavía.<br/>Elige una CPU o una placa base y el informe empieza a rellenarse.
        </div>
      )}
      {log.map((r,i)=>(
        <div key={i} className={`log-row fade log-${r.lvl}`} style={{animationDelay:`${i*18}ms`}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}>{ico(r.lvl)}{tag(r.lvl).slice(0,6)}</span>
          <span style={{color:"var(--silk-dim)"}}>{r.code}</span>
          <span style={{color:"var(--silk)",opacity:.85}}>{r.id}</span>
          <span style={{color:"var(--silk-dim)"}}>{r.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* Panel de filtros */
function FilterPanel({ cat, pool, filters, setFilters, onClear }){
  const defs = FILTERS[cat] || [];
  const [open,setOpen] = useState(()=>new Set(defs.slice(0,4).map(d=>d.k)));
  useEffect(()=>{ setOpen(new Set((FILTERS[cat]||[]).slice(0,4).map(d=>d.k))); },[cat]);
  const toggle=k=>setOpen(s=>{const n=new Set(s); n.has(k)?n.delete(k):n.add(k); return n;});
  const set=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const active = Object.values(filters).filter(v=>v!==undefined&&v!==null&&!(Array.isArray(v)&&!v.length)).length;

  return (
    <div className="panel scroll" style={{padding:"12px 12px 20px",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span className="eyebrow" style={{display:"flex",alignItems:"center",gap:6}}>
          <SlidersHorizontal size={11}/> Filtros {active>0&&`· ${active}`}
        </span>
        {active>0 && <button className="btn" style={{padding:"3px 7px",fontSize:10}} onClick={onClear}>Limpiar</button>}
      </div>

      {defs.map(d=>{
        const vals = pool.map(p=>p[d.k]).filter(v=>v!==undefined);
        if(!vals.length) return null;
        const isOpen = open.has(d.k);
        let body=null;

        if(d.type==="enum"){
          const uniq=[...new Set(vals.flat().filter(v=>v!==null&&v!==""))].sort((a,b)=>
            typeof a==="number"?a-b:String(a).localeCompare(String(b)));
          if(uniq.length<2) return null;
          const sel=filters[d.k]||[];
          body=<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {uniq.map(v=><button key={String(v)} className={`chip ${sel.includes(v)?"sel":""}`}
              onClick={()=>set(d.k, sel.includes(v)?sel.filter(x=>x!==v):[...sel,v])}>{String(v)}</button>)}
          </div>;
        }
        else if(d.type==="range"){
          const nums=vals.filter(v=>typeof v==="number");
          if(nums.length<2) return null;
          const lo=Math.min(...nums), hi=Math.max(...nums);
          if(lo===hi) return null;
          const cur=filters[d.k]||[lo,hi];
          body=<div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input type="number" value={cur[0]} min={lo} max={hi} aria-label={`${d.label} mínimo`}
                onChange={e=>set(d.k,[Number(e.target.value),cur[1]])}/>
              <span className="mono" style={{color:"var(--silk-dim)",fontSize:11}}>–</span>
              <input type="number" value={cur[1]} min={lo} max={hi} aria-label={`${d.label} máximo`}
                onChange={e=>set(d.k,[cur[0],Number(e.target.value)])}/>
            </div>
            <input type="range" min={lo} max={hi} value={cur[0]} aria-label={`${d.label} mínimo`}
              step={(hi-lo)/100<1?0.1:1} style={{marginTop:5}}
              onChange={e=>set(d.k,[Number(e.target.value),cur[1]])}/>
            <div className="mono" style={{fontSize:9.5,color:"var(--silk-dim)",display:"flex",justifyContent:"space-between"}}>
              <span>{lo}{d.unit||""}</span><span>{hi}{d.unit||""}</span>
            </div>
          </div>;
        }
        else { // bool | has
          const v=filters[d.k];
          body=<div style={{display:"flex",gap:4}}>
            {[["si","Sí"],["no","No"]].map(([k,lab])=>
              <button key={k} className={`chip ${v===k?"sel":""}`}
                onClick={()=>set(d.k, v===k?undefined:k)}>{lab}</button>)}
          </div>;
        }

        return (
          <div key={d.k} style={{borderTop:"1px solid var(--trace)",padding:"8px 0"}}>
            <button onClick={()=>toggle(d.k)} style={{all:"unset",cursor:"pointer",width:"100%",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span className="mono" style={{fontSize:11,letterSpacing:".04em"}}>{d.label}</span>
              <ChevronDown size={13} color="var(--silk-dim)"
                style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform .18s"}}/>
            </button>
            {isOpen && <div style={{marginTop:8}}>{body}</div>}
          </div>
        );
      })}
    </div>
  );
}

function matches(p, filters, cat){
  for(const [k,v] of Object.entries(filters)){
    if(v===undefined||v===null) continue;
    const def=(FILTERS[cat]||[]).find(d=>d.k===k); if(!def) continue;
    const pv=p[k];
    if(def.type==="enum"){
      if(!v.length) continue;
      const arr=Array.isArray(pv)?pv:[pv];
      if(!arr.some(x=>v.includes(x))) return false;
    } else if(def.type==="range"){
      if(typeof pv!=="number") return false;
      if(pv<v[0]||pv>v[1]) return false;
    } else if(def.type==="bool"){
      const truthy=!!pv;
      if((v==="si")!==truthy) return false;
    } else if(def.type==="has"){
      const has=pv!==null&&pv!==undefined&&pv!=="";
      if((v==="si")!==has) return false;
    }
  }
  return true;
}

/* Hoja de tiendas de una pieza */
function StoreSheet({ part, region, onClose }){
  const stores = storesFor(part, region);
  const R = REGIONS[region];
  const shops = stores.filter(s=>s.kind==="tienda");
  const comps = stores.filter(s=>s.kind==="comparador");
  const Row = s => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
      style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"11px 12px",border:"1px solid var(--trace)",marginBottom:6,
        textDecoration:"none",color:"var(--silk)"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--trace)"}>
      <span style={{fontWeight:600,fontSize:13}}>{s.name}</span>
      <ExternalLink size={12} color="var(--gold)"/>
    </a>
  );
  return (
    <div role="dialog" aria-modal="true" aria-label="Dónde comprar" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(4,10,7,.82)",zIndex:60,
        display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="panel fade" onClick={e=>e.stopPropagation()}
        style={{width:"min(560px,100%)",maxHeight:"86vh",overflow:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
          padding:14,borderBottom:"1px solid var(--trace)"}}>
          <div>
            <div className="eyebrow">Dónde comprar · {R.label}</div>
            <div className="dsp" style={{fontSize:19,marginTop:5}}>{part.brand} {part.name}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13}/></button>
        </div>
        <div style={{padding:14}}>
          <div className="eyebrow" style={{marginBottom:7}}>Tiendas</div>
          {shops.map(Row)}
          {comps.length>0 && <>
            <div className="eyebrow" style={{margin:"14px 0 7px"}}>Comparadores de precio</div>
            {comps.map(Row)}
          </>}
          <div className="mono" style={{fontSize:10,color:"var(--silk-dim)",marginTop:12,lineHeight:1.6}}>
            Cada enlace abre el buscador de la tienda con «{decodeURIComponent(searchTerm(part))}».
            Cambia la región arriba para ver otro mercado.
          </div>
        </div>
      </div>
    </div>
  );
}

/* Lista de compra del montaje completo */
function ShoppingList({ build, region, total, onClose }){
  const R = REGIONS[region];
  const [store,setStore] = useState("all");
  const [copied,setCopied] = useState(false);
  const ta = useRef(null);
  const items = CATS.flatMap(c=>(build[c.id]||[]).map(p=>({...p,_cat:c.label})));

  const text = [
    `Montaje — ${new Date().toLocaleDateString("es-ES")}`,
    ...items.map(p=>`${p._cat}: ${p.brand} ${p.name}${(p.qty||1)>1?` ×${p.qty}`:""}`),
    `Total orientativo: ${eur(total)} ${R.cur}`,
  ].join("\n");

  const copy = async ()=>{
    try{ await navigator.clipboard.writeText(text); }
    catch{ ta.current?.select(); document.execCommand?.("copy"); }
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Lista de compra" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(4,10,7,.82)",zIndex:60,
        display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="panel fade" onClick={e=>e.stopPropagation()}
        style={{width:"min(760px,100%)",maxHeight:"88vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
          padding:14,borderBottom:"1px solid var(--trace)"}}>
          <div>
            <div className="eyebrow">Lista de compra · {R.label}</div>
            <div className="dsp" style={{fontSize:19,marginTop:5}}>
              {items.length} pieza{items.length!==1?"s":""} · {eur(total)} {R.cur}
            </div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13}/></button>
        </div>

        <div style={{padding:"10px 14px",borderBottom:"1px solid var(--trace)",
          display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <span className="eyebrow" style={{marginRight:3}}>Tienda</span>
          <button className={`chip ${store==="all"?"sel":""}`} onClick={()=>setStore("all")}>Todas</button>
          {R.stores.map(s=>
            <button key={s.id} className={`chip ${store===s.id?"sel":""}`}
              onClick={()=>setStore(s.id)}>{s.name}</button>)}
        </div>

        <div className="scroll" style={{padding:14,flex:1,minHeight:0}}>
          {items.length===0 && (
            <div style={{textAlign:"center",padding:24,color:"var(--silk-dim)"}}>
              El montaje está vacío. Elige piezas y vuelve aquí.
            </div>
          )}
          {items.map(p=>{
            const ss = storesFor(p, region);
            const only = store==="all" ? null : ss.find(x=>x.id===store);
            return (
              <div key={p._uid} style={{borderBottom:"1px solid var(--trace)",padding:"9px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"baseline"}}>
                  <div style={{minWidth:0}}>
                    <span className="eyebrow">{p._cat}</span>
                    <div style={{fontSize:13,fontWeight:600,marginTop:1}}>
                      {p.brand} {p.name}{(p.qty||1)>1 && <span className="mono"
                        style={{color:"var(--gold)",fontSize:11}}> ×{p.qty}</span>}
                    </div>
                  </div>
                  <span className="mono" style={{fontSize:12,color:"var(--silk-dim)",whiteSpace:"nowrap"}}>
                    {p.price?`${eur(p.price*(p.qty||1))} ${R.cur}`:"—"}
                  </span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:7}}>
                  {(only?[only]:ss).map(s=>
                    <a key={s.id} className="chip" href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,
                        color:s.kind==="comparador"?"var(--copper)":undefined}}>
                      {s.name}<ExternalLink size={9}/>
                    </a>)}
                </div>
              </div>
            );
          })}
        </div>

        {items.length>0 && (
          <div style={{padding:14,borderTop:"1px solid var(--trace)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span className="eyebrow">Copiar el montaje</span>
              <button className="btn btn-gold" onClick={copy}>{copied?"Copiado":"Copiar"}</button>
            </div>
            <textarea ref={ta} readOnly value={text} rows={4} aria-label="Montaje en texto"
              style={{width:"100%",background:"var(--board)",border:"1px solid var(--trace)",
                color:"var(--silk-dim)",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,
                padding:"8px 9px",resize:"vertical"}}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* Descripción del sistema en una línea, como la escribirías en un foro */
function oneLiner(b){
  const cpu=one(b,"cpu"), gpu=one(b,"gpu"); const rams=list(b,"ram"), st=list(b,"storage");
  const bits=[];
  if(cpu) bits.push(`${cpu.brand==="AMD"?"":""}${cpu.name}`);
  if(gpu) bits.push(gpu.name.replace(/^(GeForce|Radeon)\s+/,"").replace(/\s+(Founders Edition|Limited Edition)$/,""));
  const cap=rams.reduce((a,r)=>a+r.capGB*(r.qty||1),0);
  if(cap) bits.push(`${cap} GB ${rams[0].memType}-${Math.max(...rams.map(r=>r.speed))}`);
  const tb=st.reduce((a,x)=>a+x.capGB*(x.qty||1),0);
  if(tb) bits.push(tb>=1000?`${+(tb/1000).toFixed(1)} TB`:`${tb} GB`);
  return bits.join(" · ") || "Torre sin configurar";
}

/* Resumen de la torre */
function BuildSummary({ build, region, onClose, onShop }){
  const [aux,setAux] = useState(false);
  const R = REGIONS[region];
  const groups = aux ? ["core","aux"] : ["core"];
  const cats = CATS.filter(c=>groups.includes(c.group));
  const tower = Object.fromEntries(Object.entries(build)
    .filter(([k])=>groups.includes(CAT[k].group)));
  const power = calcPower(tower);
  const post  = runPost(tower, power);
  const fails = post.filter(l=>l.lvl==="fail").length;
  const warns = post.filter(l=>l.lvl==="warn").length;
  const rows  = cats.flatMap(c=>(build[c.id]||[]).map(p=>({...p,_cat:c})));
  const totalTower = rows.reduce((a,p)=>a+(p.price||0)*(p.qty||1),0);
  const rest = Object.entries(build).filter(([k])=>!groups.includes(CAT[k].group))
    .flatMap(([,v])=>v).reduce((a,p)=>a+(p.price||0)*(p.qty||1),0);
  const missing = CATS.filter(c=>c.group==="core"&&c.req&&!(build[c.id]||[]).length);

  const cpu=one(tower,"cpu"), gpu=one(tower,"gpu");
  const rams=list(tower,"ram"), st=list(tower,"storage");
  const tiles=[
    cpu && [`${cpu.cores}C / ${cpu.threads}T`,"Procesador"],
    rams.length && [`${rams.reduce((a,r)=>a+r.capGB*(r.qty||1),0)} GB`,
      `${rams[0].memType} ${Math.max(...rams.map(r=>r.speed))}`],
    gpu && [`${gpu.vram} GB`, gpu.vtype],
    st.length && [(()=>{const t=st.reduce((a,x)=>a+x.capGB*(x.qty||1),0);
      return t>=1000?`${+(t/1000).toFixed(1)} TB`:`${t} GB`;})(),"Almacenamiento"],
    power.total>0 && [`${power.total} W`,"Peor caso"],
  ].filter(Boolean);

  const text=[
    oneLiner(tower),"",
    ...rows.map(p=>`${p._cat.label.padEnd(18)} ${p.brand} ${p.name}${(p.qty||1)>1?` ×${p.qty}`:""}`),
    "",
    `Consumo   peor caso ${power.total} W · en juego ${power.gaming} W · fuente sugerida ${power.rec} W`,
    `Total     ${eur(totalTower)} ${R.cur} (orientativo, ${R.label})`,
  ].join("\n");

  const [copied,setCopied]=useState(false);
  const ta=useRef(null);
  const copy=async()=>{ try{ await navigator.clipboard.writeText(text); }
    catch{ ta.current?.select(); document.execCommand?.("copy"); }
    setCopied(true); setTimeout(()=>setCopied(false),1800); };

  return (
    <div role="dialog" aria-modal="true" aria-label="Resumen de la torre" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(4,10,7,.86)",zIndex:60,
        display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="panel fade" onClick={e=>e.stopPropagation()}
        style={{width:"min(720px,100%)",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>

        <div style={{padding:"16px 16px 14px",borderBottom:"1px solid var(--trace)",
          display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div style={{minWidth:0}}>
            <div className="eyebrow">Resumen de la torre</div>
            <div className="dsp" style={{fontSize:22,marginTop:6,lineHeight:1.1}}>{oneLiner(tower)}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar"><X size={13}/></button>
        </div>

        {tiles.length>0 && (
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(tiles.length,5)},1fr)`,
            borderBottom:"1px solid var(--trace)"}}>
            {tiles.map(([v,l],i)=>(
              <div key={i} style={{padding:"11px 10px",textAlign:"center",
                borderRight:i<tiles.length-1?"1px solid var(--trace)":"none"}}>
                <div className="mono" style={{fontSize:15,color:"var(--gold)",fontWeight:600}}>{v}</div>
                <div className="eyebrow" style={{fontSize:8.5,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {missing.length>0 && (
          <div className="mono" style={{fontSize:11,color:"var(--amber)",padding:"9px 16px",
            borderBottom:"1px solid var(--trace)",lineHeight:1.5}}>
            Falta por elegir: {missing.map(m=>m.label[0].toLowerCase()+m.label.slice(1)).join(", ")}.
          </div>
        )}
        {fails>0 && (
          <div className="mono" style={{fontSize:11,color:"var(--red)",padding:"9px 16px",
            borderBottom:"1px solid var(--trace)",lineHeight:1.5}}>
            {fails} incompatibilidad{fails>1?"es":""} sin resolver. Revisa el informe POST antes de comprar.
          </div>
        )}

        <div className="scroll" style={{flex:1,minHeight:0,padding:"6px 16px"}}>
          {rows.length===0 ? (
            <div style={{padding:"30px 0",textAlign:"center",color:"var(--silk-dim)"}}>
              Todavía no hay nada montado.
            </div>
          ) : rows.map(p=>(
            <div key={p._uid} style={{display:"flex",gap:10,alignItems:"flex-start",
              padding:"9px 0",borderBottom:"1px solid rgba(30,69,52,.45)"}}>
              <Fingers on tone=""/>
              <div style={{flex:1,minWidth:0}}>
                <div className="eyebrow">{p._cat.label}</div>
                <div style={{fontSize:13.5,fontWeight:600,marginTop:1}}>
                  {p.brand} {p.name}
                  {(p.qty||1)>1 && <span className="mono" style={{color:"var(--gold)",fontSize:11}}> ×{p.qty}</span>}
                </div>
                <div className="mono" style={{fontSize:10,color:"var(--silk-dim)",marginTop:3}}>
                  {((KEYSPECS[p.cat]||(()=>[]))(p)).filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="mono" style={{fontSize:12.5,whiteSpace:"nowrap",
                color:p.price?"var(--silk)":"var(--silk-dim)"}}>
                {p.price?`${eur(p.price*(p.qty||1))} ${R.cur}`:"—"}
              </span>
            </div>
          ))}
        </div>

        <div style={{borderTop:"1px solid var(--trace)",padding:"12px 16px"}}>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",marginBottom:10}}>
            <input type="checkbox" checked={aux} onChange={e=>setAux(e.target.checked)}
              style={{accentColor:"var(--gold)",width:"auto"}}/>
            <span className="mono" style={{fontSize:11,color:"var(--silk-dim)"}}>
              Incluir auxiliares del interior (ventiladores, RGB, pasta, cables)
            </span>
          </label>

          <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-end"}}>
            <div className="mono" style={{fontSize:10.5,color:"var(--silk-dim)",lineHeight:1.7}}>
              Consumo {power.total} W peor caso · {power.gaming} W en juego<br/>
              Fuente sugerida <b style={{color:"var(--gold)"}}>{power.rec} W</b> ·{" "}
              <span style={{color:fails?"var(--red)":warns?"var(--amber)":"var(--cyan)"}}>
                POST {fails?`${fails} fallo${fails>1?"s":""}`:warns?`${warns} aviso${warns>1?"s":""}`:"correcto"}
              </span>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="eyebrow" style={{fontSize:8.5}}>Total de la torre</div>
              <div className="mono" style={{fontSize:21,color:"var(--gold)",fontWeight:600,lineHeight:1.1}}>
                {eur(totalTower)} {R.cur}
              </div>
              {rest>0 && <div className="mono" style={{fontSize:9.5,color:"var(--silk-dim)",marginTop:2}}>
                + {eur(rest)} {R.cur} fuera de la torre
              </div>}
            </div>
          </div>

          <div style={{display:"flex",gap:6,marginTop:12}}>
            <button className="btn" style={{flex:1}} onClick={copy}>{copied?"Copiado":"Copiar resumen"}</button>
            <button className="btn btn-gold" style={{flex:1,display:"flex",alignItems:"center",
              justifyContent:"center",gap:6}} onClick={()=>{onClose();onShop();}}>
              <Store size={12}/> Dónde comprar
            </button>
          </div>
          <textarea ref={ta} readOnly value={text} aria-hidden="true" tabIndex={-1}
            style={{position:"absolute",left:-9999,width:1,height:1,opacity:0}}/>
        </div>
      </div>
    </div>
  );
}

/* Tarjeta de pieza */
function PartCard({ part, blocked, reason, chosen, onPick, onBuy, cur }){
  const specs = (KEYSPECS[part.cat]||(()=>[]))(part);
  return (
    <div className={`card ${blocked?"blocked":""}`} tabIndex={0} role="button"
      aria-disabled={blocked} title={blocked?reason:undefined}
      onClick={()=>!blocked&&onPick(part)}
      onKeyDown={e=>{if((e.key==="Enter"||e.key===" ")&&!blocked){e.preventDefault();onPick(part);}}}
      style={chosen?{borderColor:"var(--gold)"}:undefined}>
      <PartArt part={part}/>
      {(part.museum||part.legacy) && <div className="mono" style={{position:"absolute",right:7,top:7,fontSize:9,
        letterSpacing:".1em",color:"var(--copper)",border:"1px solid var(--copper)",padding:"1px 5px"}}>
        {part.museum?"MUSEO":"DESCAT."}</div>}
      {chosen && <div style={{position:"absolute",right:7,top:7,background:"var(--gold)",
        color:"#0A1610",borderRadius:"50%",width:19,height:19,display:"grid",placeItems:"center"}}><Check size={12}/></div>}
      <div style={{padding:"9px 10px"}}>
        <div style={{fontWeight:600,fontSize:13,lineHeight:1.25,minHeight:32}}>{part.name}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,margin:"7px 0 9px"}}>
          {specs.filter(Boolean).map((s,i)=>
            <span key={i} className="mono" style={{fontSize:9.5,color:"var(--silk-dim)",
              border:"1px solid var(--trace)",padding:"1.5px 5px"}}>{s}</span>)}
        </div>
        {blocked ? (
          <div className="mono" style={{fontSize:10,color:"var(--red)",display:"flex",gap:5,
            alignItems:"flex-start",lineHeight:1.4}}><XCircle size={11} style={{flexShrink:0,marginTop:1}}/>{reason}</div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
            <span className="mono" style={{fontSize:13,color:"var(--gold)",fontWeight:600}}>
              {part.price?`${eur(part.price)} ${cur}`:"—"}
            </span>
            <button className="btn" style={{padding:"4px 8px",fontSize:9.5}}
              onClick={e=>{e.stopPropagation();onBuy(part);}}>Dónde comprar</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Fila de la lista de montaje */
function Slot({ cat, items, active, onOpen, onRemove, onQty, cur, conflicts }){
  const Icon = cat.icon;
  const filled = items.length>0;
  const bad = items.some(i=>conflicts?.has(i._uid));
  return (
    <div style={{marginBottom:5}}>
      <button className={`slot ${active?"active":""}`} onClick={()=>onOpen(cat.id)}>
        <Fingers on={filled} tone={bad?"bad":""}/>
        <Icon size={15} color={filled?"var(--gold)":"var(--silk-dim)"} style={{flexShrink:0,marginTop:1}}/>
        <span style={{flex:1,minWidth:0}}>
          <span className="eyebrow" style={{display:"block"}}>{cat.label}{cat.req&&!filled?" ·  requerido":""}</span>
          <span className="trunc" style={{display:"block",fontSize:12.5,marginTop:2,
            color:filled?"var(--silk)":"var(--silk-dim)"}}>
            {filled ? items.map(i=>i.name).join(" + ") : "Sin elegir"}
          </span>
        </span>
        {filled && <span className="mono" style={{fontSize:11,color:"var(--gold)",whiteSpace:"nowrap"}}>
          {eur(items.reduce((a,i)=>a+(i.price||0)*(i.qty||1),0))} {cur}
        </span>}
      </button>
      {filled && cat.multi && items.map(i=>(
        <div key={i._uid} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px 3px 32px"}}>
          <span className="mono trunc" style={{fontSize:10,color:"var(--silk-dim)",flex:1}}>{i.brand} {i.name}</span>
          <button className="btn" style={{padding:"1px 6px",fontSize:11}} onClick={()=>onQty(cat.id,i._uid,-1)} aria-label="Menos">–</button>
          <span className="mono" style={{fontSize:11,minWidth:14,textAlign:"center"}}>{i.qty||1}</span>
          <button className="btn" style={{padding:"1px 6px",fontSize:11}} onClick={()=>onQty(cat.id,i._uid,1)} aria-label="Más">+</button>
          <button className="btn" style={{padding:"1px 5px"}} onClick={()=>onRemove(cat.id,i._uid)} aria-label="Quitar"><Trash2 size={10}/></button>
        </div>
      ))}
      {filled && !cat.multi && (
        <div style={{display:"flex",justifyContent:"flex-end",padding:"2px 8px 0"}}>
          <button className="btn" style={{padding:"1px 6px",fontSize:9.5}}
            onClick={()=>onRemove(cat.id,items[0]._uid)}>Quitar</button>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [region,setRegion] = useState("ES");
  const [build,setBuild] = useState({});
  const [cat,setCat] = useState("cpu");
  const [q,setQ] = useState("");
  const [sort,setSort] = useState("rel");
  const [filters,setFilters] = useState({});
  const [showBlocked,setShowBlocked] = useState(true);
  const [museum,setMuseum] = useState(false);
  const [buy,setBuy] = useState(null);
  const [shopping,setShopping] = useState(false);
  const [summary,setSummary] = useState(false);
  const [tab,setTab] = useState("build");     // móvil
  const [showFilters,setShowFilters] = useState(false);

  const pending = useRef(null);
  useEffect(()=>{ setFilters(pending.current||{}); pending.current=null; setQ(""); },[cat]);

  const cur = REGIONS[region].cur;
  const power = useMemo(()=>calcPower(build),[build]);
  const log = useMemo(()=>runPost(build,power),[build,power]);
  const fails = log.filter(l=>l.lvl==="fail").length;
  const warns = log.filter(l=>l.lvl==="warn").length;
  const total = useMemo(()=>Object.values(build).flat()
    .reduce((a,p)=>a+(p.price||0)*(p.qty||1),0),[build]);

  const pool = useMemo(()=>P.filter(p=>p.cat===cat && (museum||!(p.museum||p.legacy))),[cat,museum]);
  const shown = useMemo(()=>{
    let r = pool.filter(p=>matches(p,filters,cat));
    if(q.trim()){ const t=q.toLowerCase();
      r=r.filter(p=>(p.brand+" "+p.name).toLowerCase().includes(t)); }
    r = r.map(p=>({p,...gate(p,build)}));
    if(!showBlocked) r=r.filter(x=>!x.blocked);
    const key = { price:x=>x.p.price||1e9, priceDesc:x=>-(x.p.price||0),
      name:x=>x.p.brand+x.p.name, rel:x=>(x.blocked?1:0) };
    r.sort((a,b)=>{ const k=key[sort]||key.rel; const A=k(a),B=k(b);
      return typeof A==="string"?A.localeCompare(B):A-B; });
    return r;
  },[pool,filters,q,build,showBlocked,sort,cat]);

  function pick(part){
    const c=CAT[part.cat]; const item={...part,_uid:`${part.id}-${Date.now()}`,qty:1};
    setBuild(b=>{
      if(c.multi){ const cur=b[part.cat]||[];
        const dup=cur.find(x=>x.id===part.id);
        if(dup) return {...b,[part.cat]:cur.map(x=>x.id===part.id?{...x,qty:(x.qty||1)+1}:x)};
        return {...b,[part.cat]:[...cur,item]}; }
      return {...b,[part.cat]:[item]};
    });
    const order=CATS.filter(x=>x.group==="core").map(x=>x.id);
    const i=order.indexOf(part.cat);
    if(i>=0&&i<order.length-1&&!c.multi) setCat(order[i+1]);
  }
  const remove=(c,uid)=>setBuild(b=>{ const n=(b[c]||[]).filter(x=>x._uid!==uid);
    const o={...b}; n.length?o[c]=n:delete o[c]; return o; });
  const qty=(c,uid,d)=>setBuild(b=>({...b,[c]:(b[c]||[]).map(x=>
    x._uid===uid?{...x,qty:Math.max(1,(x.qty||1)+d)}:x)}));

  // ¿qué pieza concreta rompe el montaje? -> contactos en rojo en su ranura
  const conflicts = useMemo(()=>{
    const set=new Set();
    for(const [c,arr] of Object.entries(build))
      for(const it of (arr||[])){
        const rest={...build,[c]:(build[c]||[]).filter(x=>x._uid!==it._uid)};
        if(!rest[c]?.length) delete rest[c];
        if(gate(it,rest).blocked) set.add(it._uid);
      }
    return set;
  },[build]);

  const Bar = (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
      borderBottom:"1px solid var(--trace)",background:"var(--board-2)",position:"sticky",top:0,zIndex:30,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:26,height:26,border:"1px solid var(--gold)",display:"grid",placeItems:"center"}}>
          <CircuitBoard size={14} color="var(--gold)"/>
        </div>
        <div>
          <div className="dsp" style={{fontSize:17,letterSpacing:".02em"}}>Forge</div>
          <div className="eyebrow" style={{fontSize:8.5,marginTop:-2}}>Configurador de PC</div>
        </div>
      </div>
      <div style={{flex:1}}/>
      <label style={{display:"flex",alignItems:"center",gap:6}}>
        <Globe size={13} color="var(--silk-dim)"/>
        <select value={region} onChange={e=>setRegion(e.target.value)} aria-label="Región"
          style={{width:"auto",minWidth:150}}>
          {Object.entries(REGIONS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </label>
      <div style={{minWidth:190,display:"none"}} className="wide-gauge"/>
      <button className="btn btn-gold" disabled={!Object.keys(build).length}
        onClick={()=>setShopping(true)}
        style={{display:"flex",alignItems:"center",gap:6,
          opacity:Object.keys(build).length?1:.35,
          cursor:Object.keys(build).length?"pointer":"not-allowed"}}>
        <ShoppingCart size={12}/> Dónde comprar
      </button>
      <div style={{textAlign:"right"}}>
        <div className="eyebrow" style={{fontSize:8.5}}>Total del montaje</div>
        <div className="mono" style={{fontSize:17,color:"var(--gold)",fontWeight:600,lineHeight:1.1}}>
          {eur(total)} {cur}
        </div>
      </div>
    </div>
  );

  const BuildPane = (
    <div className="scroll" style={{padding:12,height:"100%"}}>
      {GROUPS.map(g=>(
        <div key={g.id} style={{marginBottom:16}}>
          <div style={{marginBottom:7}}>
            <div className="eyebrow" style={{color:"var(--gold-dim)"}}>{g.label}</div>
            <div className="mono" style={{fontSize:9.5,color:"var(--silk-dim)"}}>{g.sub}</div>
          </div>
          {CATS.filter(c=>c.group===g.id).map(c=>(
            <Slot key={c.id} cat={c} items={build[c.id]||[]} active={cat===c.id} conflicts={conflicts}
              onOpen={id=>{setCat(id);setTab("catalog");}} onRemove={remove} onQty={qty} cur={cur}/>
          ))}
          {g.id==="core" && (()=>{
            const done=CATS.filter(c=>c.group==="core"&&c.req)
              .filter(c=>(build[c.id]||[]).length).length;
            const need=CATS.filter(c=>c.group==="core"&&c.req).length;
            return (
              <button className={done?"btn btn-gold":"btn"} onClick={()=>setSummary(true)}
                disabled={!done} style={{width:"100%",marginTop:8,display:"flex",
                  alignItems:"center",justifyContent:"center",gap:7,padding:"9px 12px",
                  opacity:done?1:.4,cursor:done?"pointer":"not-allowed"}}>
                <ClipboardList size={13}/> Resumen de la torre
                <span className="mono" style={{fontSize:10,opacity:.75}}>{done}/{need}</span>
              </button>
            );
          })()}
        </div>
      ))}
    </div>
  );

  const StatusPane = (
    <div className="scroll" style={{padding:12,height:"100%"}}>
      <PowerGauge power={power} psu={one(build,"psu")}/>

      {power.total>0 && (
        <div style={{marginTop:12,border:"1px solid var(--trace)",padding:"9px 10px"}}>
          <div className="eyebrow" style={{marginBottom:6}}>Reparto del consumo</div>
          {Object.entries(power.detail).filter(([,v])=>v>0).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
              <span className="mono" style={{fontSize:10,width:82,color:"var(--silk-dim)"}}>{k}</span>
              <div style={{flex:1,height:5,background:"#0A1610"}}>
                <div style={{height:"100%",width:`${(v/power.total)*100}%`,background:"var(--gold-dim)"}}/>
              </div>
              <span className="mono" style={{fontSize:10,width:38,textAlign:"right"}}>{Math.round(v)} W</span>
            </div>
          ))}
          {power.desk>0 && (
            <div className="mono" style={{fontSize:9.5,color:"var(--silk-dim)",marginTop:7,
              borderTop:"1px solid var(--trace)",paddingTop:6,lineHeight:1.5}}>
              + {power.desk} W de monitores y altavoces. Van al enchufe, no a la fuente: no cuentan para dimensionarla.
            </div>
          )}
        </div>
      )}

      {!one(build,"psu") && power.total>0 && (
        <button className="btn btn-gold" style={{width:"100%",marginTop:10}}
          onClick={()=>{ const f={watt:[power.rec,2000]};
            if(cat==="psu") setFilters(f); else pending.current=f;
            setCat("psu"); setTab("catalog"); }}>
          Ver fuentes de {power.rec} W o más
        </button>
      )}

      <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8}}>
        <span className="eyebrow">POST · verificación</span>
        <div style={{flex:1,height:1,background:"var(--trace)"}}/>
        <span className="mono" style={{fontSize:10,color:fails?"var(--red)":warns?"var(--amber)":"var(--cyan)"}}>
          {fails?`${fails} fallo${fails>1?"s":""}`:warns?`${warns} aviso${warns>1?"s":""}`:"todo correcto"}
        </span>
      </div>
      <div style={{marginTop:8}}><PostLog log={log}/></div>

      {Object.keys(build).length>0 && (
        <div style={{display:"flex",gap:6,marginTop:14}}>
          <button className="btn btn-gold" style={{flex:1,display:"flex",alignItems:"center",
            justifyContent:"center",gap:6}} onClick={()=>setShopping(true)}>
            <Store size={12}/> Lista de compra
          </button>
          <button className="btn" onClick={()=>setBuild({})}>Vaciar</button>
        </div>
      )}
    </div>
  );

  const CatalogPane = (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* barra de categoría */}
      <div style={{padding:"10px 12px",borderBottom:"1px solid var(--trace)"}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:7,marginBottom:9}}>
          {CATS.map(c=>{
            const n=(build[c.id]||[]).length;
            return <button key={c.id} className={`chip ${cat===c.id?"sel":""}`} onClick={()=>setCat(c.id)}>
              {c.label}{n>0&&` ·${n}`}
            </button>;
          })}
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"1 1 180px",minWidth:150}}>
            <Search size={13} color="var(--silk-dim)"
              style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)"}}/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)}
              placeholder={`Buscar en ${CAT[cat].label.toLowerCase()}…`}
              style={{paddingLeft:26}} aria-label="Buscar"/>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Ordenar"
            style={{width:"auto",minWidth:130}}>
            <option value="rel">Compatibles primero</option>
            <option value="price">Precio ascendente</option>
            <option value="priceDesc">Precio descendente</option>
            <option value="name">Nombre</option>
          </select>
          <button className={`chip ${showBlocked?"":"sel"}`} onClick={()=>setShowBlocked(v=>!v)}>
            {showBlocked?"Ocultar incompatibles":"Mostrando solo compatibles"}
          </button>
          {pool.some(p=>p.legacy||p.museum)||P.some(p=>p.cat===cat&&(p.legacy||p.museum)) ? (
            <button className={`chip ${museum?"sel":""}`} onClick={()=>setMuseum(v=>!v)}>
              {museum?"Ocultar descatalogadas":"Mostrar descatalogadas"}
            </button>
          ):null}
          <button className="chip filt-toggle" onClick={()=>setShowFilters(v=>!v)}>
            <SlidersHorizontal size={10} style={{display:"inline",verticalAlign:"-1px"}}/> Filtros
          </button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        <div className={`filt-col ${showFilters?"open":""}`}
          style={{width:224,flexShrink:0,borderRight:"1px solid var(--trace)"}}>
          <FilterPanel cat={cat} pool={pool} filters={filters} setFilters={setFilters}
            onClear={()=>setFilters({})}/>
        </div>
        <div className="scroll" style={{flex:1,padding:12}}>
          <div className="mono" style={{fontSize:10.5,color:"var(--silk-dim)",marginBottom:9}}>
            {shown.filter(x=>!x.blocked).length} compatibles
            {shown.filter(x=>x.blocked).length>0 && ` · ${shown.filter(x=>x.blocked).length} descartadas`}
            {" · "}{pool.length} en catálogo
          </div>
          {shown.length===0 ? (
            <div className="panel" style={{padding:24,textAlign:"center"}}>
              <div className="dsp" style={{fontSize:15,marginBottom:6}}>Nada encaja</div>
              <div style={{fontSize:12.5,color:"var(--silk-dim)",marginBottom:12}}>
                Los filtros dejan fuera todo el catálogo de {CAT[cat].label.toLowerCase()}.
              </div>
              <button className="btn btn-gold" onClick={()=>{setFilters({});setQ("");}}>Quitar filtros</button>
            </div>
          ) : (
            <div style={{display:"grid",gap:9,
              gridTemplateColumns:"repeat(auto-fill,minmax(196px,1fr))"}}>
              {shown.map(({p,blocked,reason})=>
                <PartCard key={p.id} part={p} blocked={blocked} reason={reason} cur={cur}
                  chosen={(build[p.cat]||[]).some(x=>x.id===p.id)}
                  onPick={pick} onBuy={setBuy}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fg">
      <style>{CSS}{`
        .layout{display:grid;grid-template-columns:288px 1fr 320px;height:calc(100vh - 58px)}
        .mtabs{display:none}
        .filt-col{display:block}
        @media(max-width:1180px){ .layout{grid-template-columns:264px 1fr} .col-status{display:none} }
        @media(max-width:900px){
          .layout{display:block;height:auto}
          .col-build,.col-catalog,.col-status{display:none;height:auto}
          .col-build.on,.col-catalog.on,.col-status.on{display:block}
          .mtabs{display:flex;position:sticky;top:57px;z-index:25;background:var(--board-2);
            border-bottom:1px solid var(--trace)}
          .mtabs button{flex:1;padding:10px 4px}
          .filt-col{display:none;width:100%!important;border-right:none!important;
            border-bottom:1px solid var(--trace)}
          .filt-col.open{display:block}
        }
        @media(min-width:901px){ .filt-toggle{display:none} }
      `}</style>

      {Bar}

      <div className="mtabs">
        {[["build","Montaje"],["catalog","Catálogo"],["status","Consumo y POST"]].map(([k,l])=>
          <button key={k} className={`chip ${tab===k?"sel":""}`} style={{border:"none"}}
            onClick={()=>setTab(k)}>{l}{k==="status"&&fails>0?` (${fails})`:""}</button>)}
      </div>

      <div className="layout">
        <div className={`col-build ${tab==="build"?"on":""}`}
          style={{borderRight:"1px solid var(--trace)",minHeight:0}}>{BuildPane}</div>
        <div className={`col-catalog ${tab==="catalog"?"on":""}`} style={{minHeight:0}}>{CatalogPane}</div>
        <div className={`col-status ${tab==="status"?"on":""}`}
          style={{borderLeft:"1px solid var(--trace)",minHeight:0}}>{StatusPane}</div>
      </div>

      {buy && <StoreSheet part={buy} region={region} onClose={()=>setBuy(null)}/>}
      {shopping && <ShoppingList build={build} region={region} total={total}
        onClose={()=>setShopping(false)}/>}
      {summary && <BuildSummary build={build} region={region}
        onClose={()=>setSummary(false)} onShop={()=>setShopping(true)}/>}
    </div>
  );
}
