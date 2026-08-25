# Catálogo de procesadores

Estado de los **683 procesadores** de `src/data/parts/cpu.ts`, con atención
especial a los cuatro sockets Intel que se revisaron a fondo en agosto de
2026: LGA1155, LGA1150, LGA1151 y LGA1151v2 (246 modelos entre los cuatro).

## El fallo que traían: heredar los datos del hermano mayor

Al ampliar el catálogo, las variantes con sufijo se rellenaron copiando la
ficha del modelo sin sufijo. La T y la S no son el mismo procesador más
barato: son chips con otras frecuencias, otro consumo y a veces otro número
de núcleos.

Ejemplos de lo que había:

| modelo | figuraba | es |
|---|---|---|
| Core i5-4570T | 4 núcleos | **2 núcleos** |
| Core i5-4460T | 2.5 / 3.6 GHz | **1.9 / 2.7 GHz** |
| Core i7-4790T | 2.8 GHz, 35 W | **2.7 GHz, 45 W** |
| Core i5-6400 | 3.2 / 3.6 GHz | **2.7 / 3.3 GHz** |
| Celeron G465 | 2 núcleos a 2.4 GHz | **1 núcleo a 1.9 GHz** |

Y cuatro patrones que se repetían en toda una familia:

- **Los i5 e i7 «T» de Haswell son de 45 W**, no de 35. Solo los i3, Pentium
  y Celeron con T bajan a 35.
- **Los Celeron de Sandy Bridge son de 65 W**, no de 35.
- **La velocidad de memoria iba una marcha por encima** en toda la gama baja:
  Pentium y Celeron de Sandy Bridge se quedan en DDR3-1066, los Haswell
  G32xx en DDR3-1333, y la gama baja de Coffee Lake en DDR4-2400. El
  catálogo les daba la de los i5 y superiores.
- **Cincuenta y ocho modelos estaban fechados un año tarde**: casi todo
  Haswell salió en 2013 y la 9ª generación en 2019.

Se retiró el **Pentium G850T**, que no existe: los Pentium de bajo consumo de
Sandy Bridge fueron el G620T, el G630T y el G640T.

## Tres cosas que se comprueban sin buscar nada

Están en la sección 2 de `audit-catalogo.cjs` y habrían cazado casi todo lo
anterior sin gastar una sola búsqueda:

1. **El turbo nunca baja de la base.**
2. **Los hilos son los núcleos o el doble** (salvo en los híbridos con
   núcleos P y E, que se saltan la regla).
3. **La L2 son 256 KB por núcleo** de Sandy Bridge a Coffee Lake. Un i7-9700
   de ocho núcleos no puede llevar 1 MB: lleva 2.

Y una cuarta, que depende del modelo: **Pentium, Celeron y Core i3 de 4ª a
8ª generación no llevan Turbo Boost**, así que su turbo es su frecuencia
base. El i3 lo gana en la 9ª (9100, 9300, 9320, 9350K).

## Cómo se verificó

Dos documentalistas leyeron cada ficha por separado, sin ver el trabajo del
otro, y solo entró lo que coincidía. De 300 discrepancias que propuso la
primera auditoría, **la verificación independiente descartó 230**: sin ese
segundo par de ojos se habrían colado.

Dos avisos para quien repita el trabajo:

**Buscar, no abrir.** El proxy de salida bloquea `ark.intel.com`,
`intel.com` y `techpowerup.com`. La primera tanda de verificadores se gastó
entera intentando abrirlos y no confirmó nada. Los resultados de la
**búsqueda web** sí traen los datos de la ficha.

**Una ficha entera por modelo, no campo a campo.** Verificar «el TDP del
i5-4690T» por separado del resto lleva a leer la ficha de otra variante.
Pedir la ficha completa de un modelo cuesta lo mismo y sale bien.

## Cómo se escriben los nombres

Como Intel: `Core i7-4790K`, sin espacio tras el guion. Llegó a haber 275
filas con `Core i7- 920`, y al compactarlas el buscador dejaba el número
pegado al `i7`, donde la frontera numérica ya no entra: teclear «4790k» no
encontraba nada. El buscador guarda ahora también sueltos los trozos que
separa un signo, y la sección 9 de la auditoría vigila las dos cosas.
