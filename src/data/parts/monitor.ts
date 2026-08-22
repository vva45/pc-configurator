/* Monitores — datos extraídos línea a línea de forge-configurador.jsx (fase 1).
   ADD replica el add("monitor", …) original, sin valores por defecto. */
import type { Row, SpecOf } from "./types";

const rows: Row<"monitor">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"monitor">) => { rows.push({ brand, name, price, ...o }); };

ADD("LG","UltraGear 27GR95QE-B",799,{size:27,res:"2560×1440",panel:"OLED",hz:240,gtg:0.03,sync:"G-Sync Compatible + FreeSync Premium",hdr:"HDR10",nits:200,ports:"2× HDMI 2.1, 1× DP 1.4, USB hub",curve:null,ratio:"16:9",watt:65,vesa:"100×100"});
ADD("Samsung","Odyssey G9 49\" G95C",1099,{size:49,res:"5120×1440",panel:"VA",hz:240,gtg:1,sync:"G-Sync Compatible + FreeSync Premium Pro",hdr:"HDR1000",nits:1000,ports:"1× HDMI 2.1, 2× DP 1.4",curve:"1000R",ratio:"32:9",watt:90,vesa:"100×100"});
ADD("Dell","UltraSharp U2723QE",579,{size:27,res:"3840×2160",panel:"IPS Black",hz:60,gtg:5,sync:"—",hdr:"—",nits:400,ports:"1× HDMI 2.0, 1× DP 1.4, USB-C 90 W, RJ45",curve:null,ratio:"16:9",watt:55,vesa:"100×100"});
ADD("AOC","24G2SPU/BK",149,{size:24,res:"1920×1080",panel:"IPS",hz:165,gtg:1,sync:"FreeSync Premium",hdr:"—",nits:250,ports:"1× HDMI 2.0, 1× DP 1.2, VGA",curve:null,ratio:"16:9",watt:30,vesa:"100×100"});

export const MONITOR_ROWS = rows;
