# Catálogo de gráficas

Estado de las **6370 filas** de `src/data/parts/gpu.ts`, de las que 1839 están
a la venta y el resto quedan tras «Mostrar descatalogadas».

| marca | a la venta |
|---|---|
| NVIDIA | 1646 |
| AMD | 128 |
| Intel Arc | 65 |

## Intel Arc: de 4 tarjetas a 65

El catálogo tenía cuatro filas Arc con el nombre del chip por nombre de
producto (`Arc A770 16 GB`). Ahora están las trece GPU de la familia —A310,
A380, A580, A750, A770 de 8 y 16 GB, B570, B580 y las cinco Arc Pro— con las
tarjetas reales de cada ensamblador.

La ficha eléctrica y de memoria (VRAM, bus, consumo, PCIe, reloj base,
salidas) es la que publica Intel para cada GPU; el largo y las ranuras salen
de la ficha del disipador de cada ensamblador. **El reloj solo sube donde el
fabricante publica el suyo** —las seis tarjetas con OC declarado—: estimar el
resto habría sido inventarlo.

La fuente recomendada es la de Intel donde la da (600 W para A750 y A770) y,
en el resto, los mismos tramos por consumo que ya usaba el catálogo.

### Seis productos del listado no existen

Se buscaron uno a uno y no aparecen en ninguna parte, así que no se han
añadido:

- **ASUS Arc A770 16 GB y Arc A310** — ASUS nunca hizo tarjetas Arc.
- **ONIX Arc A310, A380, A580, A750 y A770** — ONIX entró con Battlemage; sus
  modelos LUMI y ODYSSEY son B570 y B580, no Alchemist.
- **Intel Arc B570 Limited Edition** — del B570 no hubo edición de Intel, solo
  de ensambladores.
- **Intel Arc A770 8 GB** — la Limited Edition salió únicamente con 16 GB.
- **Intel Arc Pro B60** — la vende Sparkle, ASRock y MAXSUN; Intel no.

Dos filas venían con el nombre del chip en vez del suyo (`ASRock · Arc A770
8GB`) y se han puesto los nombres comerciales reales, que además son los que
encuentra el buscador. Y el listado daba 8 GB a la Arc Pro A50, que lleva 6.

Alchemist sigue en tienda, así que **no** va marcada como descatalogada.

## AMD: 204 tarjetas más

Del segundo listado —RX 400, 500, 6000, 7000 y 9000, 591 tarjetas— ya estaban
278 y entraron 204. La ficha de las 35 GPU que ya figuraban se tomó de sus
propias filas, verificadas antes; las seis que no estaban se buscaron aparte:
RX 6700, RX 6300, RX 560 de 2 GB, RX 9070 GRE, RX 9060 y RX 9050.

El largo y las ranuras salen de la mediana de esa misma familia de disipador
de esa misma marca, ya medida en el catálogo, así que **ninguna fila nueva
lleva una cota inventada**. Las marcas que revenden la placa de referencia con
su pegatina —AMD, Club 3D, VisionTek— llevan la cota de la referencia.

Quedaron fuera 109:

- **108 de Yeston, Dataland, BIOSTAR, VASTARMOR, Diamond Multimedia y
  GeCube.** Ninguna publica las cotas de sus productos, así que habrían
  entrado todas con la misma medida de clase: el mismo defecto que se limpió
  del catálogo de cajas.
- **El ASRock RX 9060**, porque AMD solo vende ese chip a fabricantes de
  equipos. La ficha de referencia sí está.

### 189 tarjetas con conectores que no daban su consumo

Un R9 290X de 315 W no se alimenta con un 8 y un 6 pines, que suman 300 con
los 75 de la ranura. Cada una subió al menor conector que sí la alimenta, y
la sección 7 de la auditoría pasa a comprobarlo **también en las
descatalogadas**: los vatios que da un conector no dependen de que la tarjeta
siga a la venta.

118 de ellas están marcadas como descatalogadas: toda la serie RX 5000 y la
gama media-alta de RX 6000 (6600 XT a 6900 XT). No es un descuido, es el mismo
criterio que sigue NVIDIA en el catálogo: **se marca lo que ya no se fabrica**.
Por eso conviven la RX 6600 a la venta y la RX 6700 XT oculta, igual que la
RTX 3050 a la venta y la RTX 3070 oculta. Las descatalogadas se siguen
encontrando al buscarlas y se pueden seleccionar.

## Unidades que se confunden al auditar

`boost` va en **GHz** (2.67 = 2670 MHz) y `psuMin` es la fuente para el equipo
entero, no para la tarjeta. La sección 7 de `audit-catalogo.cjs` lo comprueba,
junto con el bus, el consumo y que los conectores den los vatios que pide la
tarjeta: la ranura 75 W, cada 8 pines 150 W, cada 6 pines 75 W.
