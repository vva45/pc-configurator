/* Adaptadores de red con cable — categoría añadida tras la migración. */
import type { Row, SpecOf } from "./types";

const rows: Row<"netwired">[] = [];
const ADD = (brand: string, name: string, price: number, o: SpecOf<"netwired">) => { rows.push({ brand, name, price, ...o }); };

ADD("TP-Link", "TX401 10 GbE", 119, { chip: "Marvell AQtion AQC107", speed: "10 GbE", ports: 1, iface: "PCIe ×4", watt: 13, year: 2020 });
ADD("ASUS", "XG-C100C V2 10 GbE", 129, { chip: "Marvell AQtion AQC113C", speed: "10 GbE", ports: 1, iface: "PCIe ×4", watt: 13, year: 2021 });
ADD("Intel", "X550-T2 10 GbE", 329, { chip: "Intel X550", speed: "10 GbE", ports: 2, iface: "PCIe ×4", watt: 11, year: 2015 });
ADD("TP-Link", "TX201 2.5 GbE", 25, { chip: "Realtek RTL8125B", speed: "2.5 GbE", ports: 1, iface: "PCIe ×1", watt: 3, year: 2022 });
ADD("TP-Link", "TG-3468 Gigabit", 15, { chip: "Realtek RTL8168B", speed: "1 GbE", ports: 1, iface: "PCIe ×1", watt: 2, year: 2012 });
ADD("TP-Link", "UE306 USB 3.0 Gigabit", 19, { chip: "Realtek RTL8153", speed: "1 GbE", ports: 1, iface: "USB 3.0", watt: 2, year: 2020 });

export const NETWIRED_ROWS = rows;
