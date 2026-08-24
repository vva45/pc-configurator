# Traspaso: cajas pendientes de añadir al catálogo

Este directorio existe para que **una sesión nueva pueda terminar el trabajo sin
más contexto que lo que hay aquí**. Todo lo necesario está en el repo: no queda
nada en ficheros temporales.

## Estado

El usuario pegó un listado de la categoría de cajas de PcComponentes con **516
productos** (nombre + precios + valoraciones; las valoraciones, opiniones y
plazos de entrega se ignoran por completo). De ahí:

- **385 cajas ya están añadidas** y desplegadas (`src/data/parts/case.ts`,
  bloques con la cabecera «Cajas del listado de PcComponentes»): 205 de la
  primera tanda y **180 de la segunda**.
- **126 cajas siguen pendientes**, listadas en
  [`cajas-pendientes.txt`](./cajas-pendientes.txt).

Se quedan fuera las que no se han podido verificar antes de que la sesión
agote su **presupuesto de búsquedas web**, y no se inventan datos para
rellenar el hueco. Ese presupuesto **se renueva en cada sesión nueva**: ese es
el único motivo por el que hay que abrir otra.

## Qué hay que hacer

Para cada caja de `cajas-pendientes.txt`: buscar sus especificaciones reales,
escribirlas en un fichero JSONL y ejecutar el generador. Las que no se consigan
verificar se quedan en el fichero de pendientes para el siguiente lote.

### 1. El listado de pendientes

`cajas-pendientes.txt`, una caja por línea:

```
marca|modelo|precio|colores
Corsair|FRAME 5000D RS|144.90|Negro
Thermaltake|The Tower 600|272.41|Multicolor
```

El **precio ya está extraído del listado de la tienda** y es el que hay que
usar: el precio normal de la ficha (el PVPR, o el más alto de los que aparecen
si no había PVPR), **nunca el de oferta**. No hay que volver a buscarlo.

Los colores también salen del listado. Cada modelo es **una sola entrada**
aunque la tienda lo venda en negro y en blanco: las variantes de color van
juntas en el campo `color`.

### 2. El fichero de especificaciones (JSONL)

Una línea JSON por caja. **Solo se ponen las claves que se hayan podido
verificar**; las que falten las rellena el generador con la cota de clase
según el tipo de torre. `b` y `m` tienen que coincidir con la marca y el
modelo del listado (el emparejamiento normaliza mayúsculas y signos, pero no
adivina nombres distintos).

```jsonl
{"b":"Corsair","m":"FRAME 5000D RS","form":"ATX","gpu":400,"cool":170,"psu":220,"rad":{"front":360,"top":360,"rear":140},"finc":3,"fmax":10,"b35":2,"b25":4,"glass":true,"usbc":true,"io":"2× USB-A 3.2, 1× USB-C","dims":"512×240×505 mm","vol":62.0}
{"b":"Thermaltake","m":"The Tower 600","notfound":true}
```

| Clave | Significado |
|---|---|
| `b`, `m` | Marca y modelo, exactamente como en el listado |
| `form` | `"EATX"`, `"ATX"`, `"mATX"` o `"ITX"` — la placa **más grande** que admite |
| `gpu` | Longitud máxima de gráfica, mm |
| `cool` | Altura máxima de disipador de CPU, mm |
| `psu` | Longitud máxima de fuente, mm |
| `rad` | Radiadores por posición: `{"front":360,"top":280,"rear":120,"side":360,"bottom":360}` |
| `finc` | Ventiladores **incluidos** |
| `fmax` | Ventiladores máximos |
| `b35`, `b25` | Bahías de 3,5" y de 2,5" |
| `glass` | `true` si lleva lateral de cristal templado, `false` si es acero ciego |
| `usbc` | `true` si la E/S frontal tiene USB-C (solo se usa si falta `io`) |
| `io` | E/S frontal literal, sin el jack (se añade solo) |
| `dims` | `"largo×ancho×alto mm"` |
| `vol` | Volumen en litros |
| `sfx` | `true` si solo admite fuentes SFX/SFX-L |
| `psuInc` | Si se vende con fuente: `"500 W"` → el modelo se guarda como `Modelo (con fuente 500 W)` |
| `notfound` | `true` si no se ha encontrado nada fiable: la caja se salta y **sigue pendiente** |

**Regla que no se salta nunca: no se inventan números.** Si el fabricante no
publica un dato, se omite la clave y el generador pone la cota de clase, que
queda documentada como tal en la cabecera del bloque. Si no se encuentra nada
del modelo, `notfound: true`.

### 3. Generar las filas

```bash
node scripts/gen-cajas-lote.mjs docs/catalogo/cajas-pendientes.txt /ruta/specs.jsonl
```

El script:

- añade a `src/data/parts/case.ts` solo las cajas que están **a la vez** en el
  listado y en el JSONL;
- se salta lo que ya existe en `case.ts`, así que es idempotente y se puede
  ejecutar varias veces mientras van llegando fichas;
- **reescribe `cajas-pendientes.txt` dejando solo las que siguen pendientes**,
  de modo que el fichero es siempre el estado real de lo que falta.

Acepta varios JSONL de golpe si se ha repartido la búsqueda entre subagentes.

### 4. Verificar

Desde la **raíz del repo** (en bash el directorio de trabajo se reinicia entre
comandos, así que no vale hacer `cd` en un comando compuesto):

```bash
npm ci          # solo en un contenedor recién creado, si no existe node_modules
npm run verify  # tsc + eslint + test-motor.cjs + audit-catalogo.cjs
npm run build   # build de producción de Next.js
```

`npm run verify` tiene que terminar con `0 FALLOS` y `CATÁLOGO ÍNTEGRO — 0
problemas`. Como los tests buscan las piezas por la primera coincidencia de
nombre, añadir filas al final del fichero es seguro.

### 5. Commitear y desplegar

El trabajo se desarrolla en `main-ipcxbk` y se lleva a `main`, que es la rama
que despliega Vercel:

```bash
git add -A && git commit   # mensaje en español, describiendo el lote
git push -u origin main-ipcxbk
git checkout main && git merge --ff-only main-ipcxbk && git push origin main
git checkout main-ipcxbk
```

## Cómo repartir la búsqueda

Quedan 126 modelos y una sesión tiene unas 200 búsquedas web. Lo que funcionó
bien:

- Lanzar varios subagentes en paralelo, cada uno con un bloque de marcas, y
  pedirles que devuelvan **solo el JSONL** con el esquema de arriba.
- Darles 1-2 búsquedas por modelo como máximo y decirles explícitamente que
  omitan las claves que no encuentren y que **no inventen números**.
- Repartir por marca, no por número de modelos: las webs de fabricante tienen
  tablas de especificaciones completas y una búsqueda suele resolver el modelo
  entero.
- El presupuesto de búsquedas es **de la sesión entera y compartido entre
  todos los subagentes**: en cuanto se agota, el resto devuelve vacío. Conviene
  empezar por las marcas con más modelos pendientes.

**Exigir a cada subagente que vuelque su JSONL cada 3 modelos, no al final.**
En la segunda tanda se alcanzó el límite de uso del modelo a mitad de trabajo
y los seis agentes que guardaban solo al terminar **perdieron todo lo buscado**
(unas 60 búsquedas tiradas); los que ya habían escrito el fichero conservaron
su lote entero. El trabajo perdido no se puede recuperar del transcript: los
agentes acumulan las fichas en su contexto, no en el texto.

Conviene también **validar el JSONL antes de generar**, porque los agentes
cometen errores de lectura que el generador no ve: valores fuera de rango (un
«630 mm de GPU» o «18 bahías» leídos de la columna equivocada), dimensiones con
decimales, y radiadores que no caben en el plano donde dicen montarse. La
comprobación útil es que un radiador de N mm necesita N+30 mm de arista en su
plano, y que `gpu` nunca supere la arista mayor del chasis.

Reparto pendiente por marca (las 15 con más peso):

| Marca | Pendientes | Marca | Pendientes |
|---|---|---|---|
| Mars Gaming | 16 | Chieftec | 5 |
| Fractal Design | 10 | XYZ | 4 |
| Inter-Tech | 9 | InWin | 4 |
| Darkflash | 7 | Approx | 3 |
| CoolBox | 7 | Silentware | 3 |
| Raijintek | 7 | Adata | 3 |
| TooQ | 5 | Gigabyte | 2 |
| Aerocool | 5 | resto | ~36 |

## Duplicados ya resueltos (no volver a buscarlos)

La segunda tanda confirmó por búsqueda estos casos y **ya los ha retirado del
listado de pendientes**:

- `Corsair|FRAME 5000 RS` y `FRAME 5000 RS ARGB` — no existe una gama «FRAME
  5000» sin la «D». La primera era la `FRAME 5000D RS` que ya estaba en el
  listado; la segunda se ha **renombrado** a `Corsair|FRAME 5000D RS ARGB` y
  sigue pendiente, conservando su precio.
- `Corsair|iCUE LINK 9000D RGB AIRFLOW` = `9000D RGB AIRFLOW`, ya en `case.ts`.
- `Corsair|5000T` = `iCUE 5000T RGB`, añadida en esta tanda.
- `Thermaltake|The Tower 300 Bumblebee` — edición de color de `The Tower 300`,
  añadida en esta tanda.
- `Antec|Performance 1` = `Performance 1 FT`, ya en `case.ts`.

También se ha resuelto el nombre equivocado que señalaba la tanda anterior: las
filas `FRAME 4000D` y `FRAME 4000D RGB` **se han reemplazado** por
`FRAME 4000D RS` y `FRAME 4000D RS ARGB`, con ficha verificada (490×239×486 mm,
E-ATX, 430 mm de gráfica) en lugar de las cotas de clase que llevaban.

En cambio, **sí son productos distintos** y se han añadido por separado, contra
lo que se sospechaba: `DeepCool CL660` / `CL6600` (el segundo lleva una AIO de
360 de fábrica), `ASUS TUF Gaming GT502 PLUS` / `GT502 HORIZON TG ARGB` frente
al `GT502`, y `ASUS ROG Strix Helios II GX601S` frente al `ROG Strix Helios`.

## Repasos que dejó la tanda anterior

Una auditoría de las 205 filas añadidas encontró esto. Ya está corregido lo que
era claramente erróneo (Mars Gaming MC-MIRAGE tenía los ejes de `dims`
cambiados de orden y un radiador frontal imposible; MC-3TCORELCDM y GameMax
CLAW 360 declaraban una gráfica más larga que la propia caja; la Jonsbo N2,
un cubo de 222 mm, declaraba un radiador de 240). Lo que queda:

**31 filas se quedaron con la cota de clase en casi todos los campos**, porque
la búsqueda no devolvió ficha del fabricante. Comparten specs byte a byte, así
que hoy el configurador las trata como el mismo chasis. Conviene rehacerlas
con datos reales, empezando por `gpuLen`, `coolerH` y `rad`, que son los que
deciden la compatibilidad:

> Tempest Ironvale ARGB Mesh · Xigmatek META EN45066 · Xigmatek Aqua V EN45813
> · Inter-Tech CXC2 · Thermalright A70 VISION · APNX V2 · APNX V2-F · APNX V1 ·
> APNX V1-W · APNX C1-R · Tryx FLOVA F50 · Zalman Z10 DUO · Zalman P30 V2 ·
> Sharkoon REV300 · Sharkoon REV300 RGB · Sharkoon TK5M RGB · Sharkoon Pure
> Steel RGB · Sharkoon RGB Flow · Sharkoon V1000 RGB · Sharkoon Rebel C50 RGB ·
> Aerocool Skyline ARGB · Aerocool P500C Evo · Aerocool D501A · Kolink Unity
> Code X · Gigabyte C400 GLASS · SilverStone Lucid LD05 · Cougar Purity ·
> Cougar AirFace Pro RGB · Cougar DuoFace Pro RGB · Montech KING 15 PRO ·
> HAVN BF 360 Flow

Regla al rehacerlas: cuando un dato no esté publicado, **redondear `gpuLen` y
`coolerH` a la baja**, nunca al alza — así la incertidumbre nunca produce un
«cabe» falso en el configurador.

**Entradas del listado de pendientes que hay que mirar antes de añadirlas**,
porque pueden ser el mismo producto que algo ya cargado o una variante de
color en vez de un modelo:

- `Gigabyte|AORUS C300 GLASS RGB` — puede ser el SKU `GB-AC300G`, ya cargado.
- `Alurin|Work` y `Darkflash|Tech` — nombres de familia sin modelo concreto.
- `Mars Gaming|MC-MESHPRO` / `MC-NOVA` / `MC-3T` — en `case.ts` hay `MCM`,
  `MC-NOVAM` y `MC-3TCORELCD(M)`; comprobar si son el mismo chasis.
- `Darkflash|DS900WS` y `DS900G` — ya están `DS900` y `DS900WD`.
- `Aerocool|P500C` — ya está `P500C Evo`.
- `Raijintek|Paean` / `Paean Premium` y `Ophion` / `Ophion 7L` — parejas del
  mismo chasis con equipamiento distinto; una búsqueda resuelve las dos.

## Repasos que deja esta tanda

**70 de las 180 filas nuevas llevan las dimensiones de la cota de clase**,
porque la búsqueda confirmó el resto de la ficha pero no las medidas. Su
`vol` es también el de clase. No comparten specs byte a byte como las 31 de
la tanda anterior —casi todas tienen `gpuLen`, `coolerH` o `rad` reales—, así
que el configurador sí las distingue, pero el volumen que muestran es
orientativo. Las más flojas, con solo dos o tres datos reales, son
`Corsair 4500X LX-R RGB` / `4500X RS-R ARGB`, `Corsair AIR 5400 RS-R ARGB` /
`AIR 5400 LX-R RGB`, `Thermaltake H350 TG RGB` / `H330 TG`,
`Cooler Master MasterFrame 360 Stage LCD` / `Stage Mirror`,
`Antec FLUX PRO`, `SilverStone RM46-502-I`, `MSI MAG FORGE 112R` y
`MSI PRO SHIELD M100P`.

Cuatro modelos se quedaron pendientes **a propósito** pese a tener búsqueda:
`Antec Performance 1 M`, `DeepCool CK560`, `be quiet! Light Base 600 DX` y
`Pure Base 501 DX` solo devolvieron un dato cada uno, y una fila con un único
campo real es indistinguible de una inventada.

Datos que la búsqueda devolvió mal y se han descartado, por si reaparecen:
la `Thermaltake AX700` / `AX700 TG` con «630 mm de gráfica» y «18 bahías»
(columnas cruzadas en la fuente), y la `Lian Li A3 Wood` con un radiador
frontal de 360 en un chasis de 322 mm de alto.

**Precios que conviene contrastar.** Vienen del listado tal cual, pero algunos
salen de vendedores del marketplace y están muy por encima del PVPR real. Las
Mars Gaming y Darkflash con precios de gama alta siguen pendientes, así que
todavía se pueden corregir al añadirlas. En cambio **ya están cargadas con el
precio del listado**, y habría que revisarlas a mano, las de Fractal Design
(`Meshify 2 Compact RGB` a 341 €, `Meshify 2 Lite` a 301 €, `Torrent Compact`
a 330 €, `Node 202` a 385 €, `Terra` a 400 €) y la `be quiet! Pure Base 500` a
306 €, que de PVPR ronda los 90 €.

## Prompt para arrancar la sesión nueva

Basta con pegar esto:

> Lee `docs/catalogo/README.md` y continúa el trabajo: añade al catálogo las
> cajas que quedan en `docs/catalogo/cajas-pendientes.txt`. Busca las
> especificaciones reales de cada modelo, no inventes ninguna, y usa el precio
> que ya viene en el listado. Cuando se agote el presupuesto de búsquedas,
> añade lo que hayas verificado, deja el resto en el fichero de pendientes,
> verifica, commitea en `main-ipcxbk` y fusiona a `main`.

## Aviso sobre el acceso a la red

`www.pccomponentes.com` **no es accesible** desde este entorno: el proxy de
salida lo bloquea, igual que los lectores intermedios y archive.org. Las webs
de fabricante tampoco responden a peticiones directas. La única vía que
funciona es la **búsqueda web**, cuyos resultados sí traen los datos de las
fichas. Por eso el listado de productos lo pega el usuario a mano.
