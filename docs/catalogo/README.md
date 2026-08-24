# Catálogo de cajas

Estado de las **528 cajas** de `src/data/parts/case.ts` y lo único que queda
por cerrar.

## Cómo se llegó aquí

La primera expansión de cajas se hizo sin buscar fichas: rellenaba todo con
una «cota de clase» según el tipo de torre. El resultado fue que **187 cajas
compartían exactamente las mismas medidas, gráfica máxima y altura de
disipador**, y el configurador las trataba como el mismo chasis: respondía
«cabe» o «no cabe» sobre números que nadie había verificado.

Eso se corrigió buscando las fichas modelo a modelo:

- **170 se rehicieron con especificaciones reales.**
- **17 se borraron** porque su ficha no aparece publicada en ninguna parte.
- Al aplicarlas se descartaron cinco datos imposibles que colaron las
  búsquedas: gráficas de 604 y 538 mm, un disipador de 260 mm y dos
  radiadores montados en una cara donde no caben.

Hoy **ninguna caja tiene todas sus cotas inventadas**, y las firmas de
especificaciones distintas pasaron del 61 % al 86 %.

Se retiraron además cinco entradas que eran el mismo producto que otra fila
(`FRAME 5000 RS`, `iCUE LINK 9000D RGB AIRFLOW`, `5000T`, `The Tower 300
Bumblebee` y `Performance 1`), y las filas `FRAME 4000D` / `FRAME 4000D RGB`
se renombraron a sus nombres reales `FRAME 4000D RS` / `RS ARGB` con ficha
verificada.

## Lo único que queda: 84 medidas

Esas 84 cajas tienen **gráfica máxima, altura de disipador y radiadores
reales** —los campos con los que el motor decide la compatibilidad—, pero sus
dimensiones son la estimación por tipo de torre, y de ahí sale también el
volumen en litros que muestra la ficha. Es un dato informativo, no decide
ningún montaje.

Están listadas en [`medidas-que-faltan.txt`](./medidas-que-faltan.txt), una
por línea, para rellenar a mano:

```
Thermaltake|The Tower 600|489×299×634
```

Se acepta `x` o `×`, con o sin `mm`, con coma o punto decimal. Las que se
dejen vacías conservan su estimación. Después:

```bash
node scripts/aplicar-medidas.mjs --dry   # ver qué cambiaría
node scripts/aplicar-medidas.mjs         # aplicarlo
npm run verify
```

El script recalcula el volumen y **aborta sin escribir** si una medida no
cuadra con la ficha (una gráfica más larga que el chasis, un disipador más
alto que el ancho): es preferible corregir la línea a colar la contradicción.

## Si algún día se vuelve a buscar en lote

Dos cosas que costaron caras:

**No más de 4-5 agentes buscando a la vez.** Un intento con **76 agentes en
paralelo** devolvió «sin ficha» para 78 de 79 modelos, entre ellos el Corsair
7000D AIRFLOW, el NZXT H7 Flow y el ASUS ProArt PA602, que tienen ficha
pública evidente. No faltaban los datos: **el buscador estaba saturado y
devolvía vacío**, y los agentes lo leían como que el producto no existe.
Repetido con 4 agentes se recuperaron 63 de esos 79. Ante una racha de
«notfound» en marcas conocidas, comprobar un par a mano antes de dar nada por
perdido.

**Volcar los resultados cada pocos modelos, no al final.** Una tanda que
guardaba solo al terminar perdió unas 60 búsquedas cuando se alcanzó el
límite de uso a mitad de trabajo. Lo acumulado en el contexto de un agente no
se puede recuperar.

## Aviso sobre el acceso a la red

`www.pccomponentes.com` no es accesible desde este entorno: el proxy de salida
lo bloquea, igual que los lectores intermedios y archive.org. Las webs de
fabricante tampoco responden a peticiones directas. La única vía que funciona
es la **búsqueda web**, cuyos resultados sí traen los datos de las fichas.
