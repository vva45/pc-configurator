# FORGE — Configurador de PC

Motor de compatibilidad, cálculo de consumo, filtros por especificación y capa de compra por
región. **447 piezas** con specs verificadas, desde el Intel 4004 hasta el Threadripper PRO 7995WX.

---

## 1. Qué funciona ya y qué necesita backend

| Pedido | Estado |
|---|---|
| Compatibilidad estricta (socket, DDR, formato, cotas, conectores) | ✅ Funciona |
| Nunca mostrar piezas incoherentes | ✅ `gate()` bloquea en tiempo real |
| Consumo total + recomendación de fuente | ✅ Funciona |
| Filtros por todas las especificaciones | ✅ Declarativos en `FILTERS` |
| Selector de región | ✅ 6 regiones, 32 tiendas |
| Dónde comprar (por pieza y del montaje entero) | ✅ Enlaces verificados al buscador de cada tienda |
| Resumen de la torre, sin periféricos ni extras | ✅ Ficha del sistema con consumo, POST y total |
| Precio y stock dentro de la app | ⛔ Fuera de alcance por decisión — punto 3 |
| Catálogo completo (todas las CPU desde 1971) | ⚠️ Problema de datos, no de código — punto 4 |
| Fotos de producto | ⚠️ Con licencia: se usa arte PCB generativo — punto 5 |

Los precios que ves en las tarjetas son **orientativos**, sirven para encajar presupuesto.
No son ofertas y no se actualizan.

---

## 2. Pasarlo a Next.js

El artefacto es un solo fichero para poder verlo. Para el proyecto real:

```
app/
  layout.tsx
  page.tsx                 → <Configurator />
components/configurator/
  Configurator.tsx         → export default App
  BuildList.tsx  Catalog.tsx  FilterPanel.tsx
  PowerGauge.tsx  PostLog.tsx  StoreSheet.tsx  ShoppingList.tsx  BuildSummary.tsx  PartCard.tsx
lib/
  compat.ts                → gate, runPost, POST_CODES
  power.ts                 → calcPower, PSU_SIZES
  filters.ts               → FILTERS, KEYSPECS, matches
  regions.ts               → REGIONS, storesFor, searchTerm
data/
  parts/cpu.json  mbo.json  ram.json  gpu.json  …
```

Corta por los comentarios `═══` del fichero: cada bloque es un módulo.
El CSS pasa a `globals.css` (las variables `--board`, `--gold`… tal cual).

Dos cambios al mover:
- `useState` del montaje → guardar en URL (`?cpu=…&mbo=…`) para compartir builds. Es la
  función que más se usa en PCPartPicker y sale casi gratis con `useSearchParams`.
- Los `data/*.json` se cargan en servidor y se sirven paginados; con 5.000 SKU no puedes
  mandar el catálogo entero al cliente.

---

## 3. Dónde comprar

Cada pieza enlaza al buscador de cada tienda con su modelo exacto. Dos accesos:

- **Por pieza** — botón «Dónde comprar» en la tarjeta. Separa tiendas de comparadores.
- **Del montaje entero** — botón en la barra superior y en el panel de montaje. Lista todas
  las piezas con sus enlaces, permite filtrar por una sola tienda para comprarlo todo en el
  mismo sitio, y da el montaje en texto para copiar.

### Tiendas por región

| Región | Tiendas |
|---|---|
| España | PcComponentes, Coolmod, LDLC España, Neobyte, PCBox, MediaMarkt, Amazon.es + Geizhals |
| Europa | Mindfactory, Alternate, Caseking, Amazon.de, LDLC Francia + Geizhals |
| Reino Unido | Scan, Overclockers UK, Amazon.co.uk + Skinflint |
| Estados Unidos | Newegg, Amazon, Micro Center, B&H Photo, Best Buy |
| Asia-Pacífico | PCCaseGear, Scorptec, Amazon.co.jp, Shopee + Kakaku.com |
| Latinoamérica | MercadoLibre AR y MX, Amazon.mx, Kabum |

Todos los patrones de búsqueda están comprobados con petición real. Los que no pude
confirmar quedaron fuera en vez de meterlos a ciegas: un enlace roto es peor que una tienda
de menos. Para añadir una, una línea en `REGIONS`:

```js
S("id","Nombre","tienda", q => `https://tienda.com/buscar?q=${q}`)
```

`kind` acepta `"tienda"` o `"comparador"`; los comparadores se listan aparte.

### Si algún día quieres los precios dentro

La pieza que falta es un **EAN por producto**. Sin él no puedes casar la misma pieza en cinco
tiendas y tendrás que comparar por texto, que falla. Añade `ean` al esquema ahora aunque no
lo uses todavía; retrofitearlo con 5.000 SKU es un infierno.

Con el EAN puesto, la vía para España es **Awin**: PcComponentes y buena parte del retail
europeo están ahí y dan datafeed diario con precio, stock y deeplink de afiliado. Un cron
descarga el feed, hace `upsert` por EAN en Postgres, y `storesFor()` pasa a leer de tu base
en vez de generar el enlace de búsqueda. Para Amazon, la Product Advertising API 5.0 (gratis,
pero exige 3 ventas cualificadas como afiliado antes de darte las claves).

Scraping directo no: Cloudflare, condiciones de uso explícitas y proxies rotatorios.## 3.bis Resumen de la torre

Botón al final del grupo **Componentes**, en el panel de montaje. Abre una ficha del sistema
con solo las ocho piezas que forman la máquina: CPU, refrigeración, placa, RAM, gráfica,
almacenamiento, fuente y caja. Monitores, teclados, ratones y demás quedan fuera.

Qué muestra:
- El sistema descrito en una línea, tal y como lo escribirías en un foro
  (`Ryzen 7 9800X3D · RTX 5070 Ti · 32 GB DDR5-6000 · 6 TB`)
- Cinco cifras de cabecera: núcleos/hilos, RAM, VRAM, almacenamiento y consumo
- Cada pieza con sus specs clave y su precio
- Consumo peor caso / en juego, fuente sugerida y estado del POST **recalculados solo con
  la torre** — el gasto USB de los periféricos no cuenta
- Total de la torre, y aparte lo que queda fuera de ella
- Aviso de lo que falta por elegir y de las incompatibilidades sin resolver
- Botón de copiar (texto plano listo para pegar) y salto directo a Dónde comprar

Hay una casilla para **incluir los auxiliares del interior** (ventiladores, RGB, pasta,
cables). Va desactivada por defecto porque pediste solo la torre, pero físicamente están
dentro y a veces querrás contarlos. Al marcarla se recalcula todo, consumo incluido.

## 4. El catálogo

447 piezas. Reparto:

| Categoría | Nº | Cobertura |
|---|---|---|
| CPU | 91 | Intel LGA1155→LGA1851 (2ª a 14ª gen + Core Ultra 200S) con Celeron, Pentium e i3/i5/i7/i9 · AMD FX, FM2+, Ryzen 1000–9000, APU G, Threadripper 3000/7000 · HEDT LGA2011-v3 y LGA2066 |
| Placa base | 71 | Todos los chipsets AM4 (A320→X570), AM5 (A620→X870E), Intel serie 6 a 800, TRX40/TRX50/WRX90, X99, X299, 990FX, A88X |
| Gráfica | 81 | GT 710→GT 1030, GTX 750 Ti→1080 Ti, RTX 2000/3000/4000/5000, HD 4870→7970, R7/R9, RX 400/500/Vega/5000/6000/7000/9000 XT y no-XT, Arc, y profesionales Quadro / RTX A / RTX Ada / Radeon Pro |
| Refrigeración | 47 | Aire y AIO 120/240/280/360/420 de Noctua, be quiet!, Corsair, Cooler Master, DeepCool, Arctic, Thermalright, NZXT, Lian Li, MSI, ASUS, Thermaltake, EK, Scythe, Endorfy, ID-COOLING, SilverStone, Tempest + los de serie |
| Almacenamiento | 42 | M.2 de 250 GB a 4 TB (PCIe 3.0/4.0/5.0, con y sin disipador), SSD SATA 2,5", HDD 3,5" domésticos, NAS, videovigilancia y servidor |
| Fuente | 33 | 450 W a 1600 W · White, Bronze, Silver, Gold, Platinum, Titanium · modulares y no modulares · ATX, SFX y SFX-L |
| Memoria | 27 | DDR2, DDR3, DDR4, DDR5 y DDR5 RDIMM ECC |
| Caja | 16 | Mini-ITX a EEB, incluido chasis de servidor |
| Auxiliares y periféricos | 39 | Ventiladores, hubs, pasta, RGB, cables, monitores, teclados, ratones, alfombrillas, auriculares, micros, webcams y altavoces |

129 piezas van marcadas como **descatalogadas** o **museo** y se ocultan por defecto. El
interruptor «Mostrar descatalogadas» las saca en cualquier categoría que las tenga. Es lo que
mantiene el catálogo usable para alguien que monta hoy sin borrar la historia del PC.

### Ampliarlo más

El objetivo completo son unas 5.000-8.000 referencias. De dónde sacarlas, en orden de limpieza
legal:
- **Fichas del fabricante** — Intel ARK y AMD tienen ficha por producto con todos los campos.
  La fuente más fiable y la que deberías usar de base.
- **Wikipedia** (`Lista de microprocesadores Intel` / `AMD`) — CC BY-SA, tablas ya
  estructuradas, perfectas para el histórico. Citando la fuente.
- **Datafeeds de afiliación** — al integrar Awin ya te llegan marca, modelo, EAN y atributos.
- **PCPartPicker: no.** Sus condiciones prohíben el rastreo.

El esquema está en los objetos que pasa `add()`. Para añadir una CPU basta con respetar
`socket`, `mem[]` y `ppt`, y el motor la trata igual que a las demás. Hay ayudantes por
categoría (`C` CPU, `M` placa, `G` gráfica, `K` refrigeración, `U` fuente, `D` disco,
`R` memoria, `B` caja) que rellenan los valores por defecto.

**Ojo con esto:** cada gráfica nueva necesita `conn8`, `conn6` y `hpwr` además del texto de
`power`. Si te saltas los numéricos, el motor no puede comprobar los cables de la fuente. Es
justo el fallo que la auditoría me pilló al ampliar el catálogo.

## 5. Imágenes

No puedo incluir fotos de producto: son de los fabricantes y las tiendas. Lo que hay es arte
PCB generativo, determinista por pieza (`PartArt`). Para producción tienes dos vías limpias:
las imágenes vienen en los datafeeds de afiliación con derecho de uso, o las descargas de las
salas de prensa de cada fabricante. Añade `img` a cada pieza y cambia `PartArt` por `<img>`.

---

## 6. Comprobaciones que hace el motor

28 códigos POST. Los que suelen faltar en otros configuradores:

- `0x13` choque entre altura de RAM y disipador de aire
- `0x14` radiador contra posiciones reales de la caja
- `0x20` **longitud de gráfica recortada por radiador frontal**
- `0x34` conector 12V-2×6 nativo vs adaptador, y fuentes pre-ATX 3.0 con picos
- `0x40` SSD PCIe 5.0 en placa con una sola ranura Gen5
- `0x41` puertos SATA que se deshabilitan al poblar las M.2
- `0x51` cabeceras de ventilador insuficientes → sugiere hub
- `0x05` cuatro módulos DDR5 y la bajada de frecuencia que conlleva
- `0x13` RAM alta bajo torre de aire: distingue entre **no cabe** y **sube el ventilador
  N mm**, y comprueba si la altura resultante sigue entrando en la caja

**Cobertura de pruebas:** 4.421 aserciones en verde (`test.cjs`), incluyendo todos los cruces
Intel/AMD, DDR3/4/5, formatos de caja, cotas y los 1.280 enlaces de tienda.

Además hay una **auditoría de catálogo** (`audit.cjs`) que comprueba, para las 447 piezas:
que cada socket tenga placas, memoria y disipadores; que cada CPU se pueda montar de extremo
a extremo hasta la fuente sin un solo fallo POST; que las gráficas declaren conectores
coherentes con su consumo; y quince cruces que nunca deben colarse. Pásala después de tocar
los datos — me encontró cuatro errores reales al triplicar el catálogo.

---

## 7. Limitaciones conocidas

- El consumo es el **peor caso** (todo al límite a la vez), más conservador que PCPartPicker.
  Se muestran también la carga en juego (~80 %) y el pico transitorio.
- No modela carriles PCIe compartidos entre M.2 y ranuras de expansión más allá de un aviso.
- No comprueba compatibilidad de BIOS por versión. Importa de verdad en AM4 (un Ryzen 5000
  en una B450 de 2018) y en AM5 (Ryzen 9000 en B650 de stock antiguo). Haría falta un campo
  `minBios` por combinación placa+CPU.
- Las cotas de gráfica son las del modelo de referencia o del AIB más común; entre fabricantes
  varían hasta 60 mm en la misma GPU.
- Los precios del catálogo son orientativos para encajar presupuesto, no ofertas.
- Las tiendas abren una búsqueda, no la ficha del producto: eso exigiría el EAN o el SKU
  de cada tienda. En la práctica el buscador acierta a la primera con el modelo completo.
