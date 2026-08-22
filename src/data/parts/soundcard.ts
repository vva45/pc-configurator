/* Tarjetas de sonido — categoría añadida tras la migración (Expansión y red). */
import type { Row, SpecOf } from "./types";

const rows: Row<"soundcard">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"soundcard">) => { rows.push({ brand, name, price, ...o }); };

ADD("Creative", "Sound Blaster AE-9", 349, { chip: "Sound Core3D + ESS ES9038", channels: "5.1", snr: 129, iface: "PCIe ×1", outs: "Jack 6,3 mm, RCA, óptico, módulo ACM", watt: 10, year: 2019 });
ADD("Creative", "Sound Blaster AE-5 Plus", 129, { chip: "Sound Core3D + ESS SABRE32", channels: "5.1", snr: 122, iface: "PCIe ×1", outs: "3,5 mm ×4, óptico, RGB", watt: 8, year: 2020 });
ADD("Creative", "Sound Blaster Audigy FX V2", 54, { chip: "CA0132", channels: "5.1", snr: 120, iface: "PCIe ×1", outs: "3,5 mm ×4, micro", watt: 5, year: 2021 });
ADD("ASUS", "Xonar SE", 39, { chip: "C-Media 6620A + Realtek S1220A", channels: "5.1", snr: 116, iface: "PCIe ×1", outs: "3,5 mm ×3, óptico", watt: 5, year: 2018 });

export const SOUNDCARD_ROWS = rows;
