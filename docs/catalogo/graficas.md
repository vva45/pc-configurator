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

## AMD: el listado ya estaba

De las 233 tarjetas Radeon del listado, **232 ya estaban en el catálogo con el
mismo nombre**; la restante era la Sapphire NITRO+ RX 9070 XT, que ya figura
sin el sufijo «16GB». No había nada que añadir.

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
