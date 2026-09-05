# Revisión del configurador visual — 2026-09-05

Estado: candidato para Preview y revisión; no publicado en producción.
Base: GitHub main `49081ffc93acb684a216c9697b59c0e957201966`.
Rama: `codex/cinematic-configurator`.

## Resultado

La experiencia Personalizar presenta el montaje 3D en el centro sobre un fondo negro con iluminación violeta, las categorías en un lateral sin paneles y las opciones en tarjetas compactas debajo. El nombre de la caja encabeza la página. El selector de componente incluye una descripción a la izquierda y búsqueda/filtros desplegables; las tarjetas conservan los nombres, precios, enlaces de compra, etiquetas de descatalogados y bloqueo por incompatibilidad. En móvil las categorías forman una barra horizontal. La experiencia Técnico conserva los paneles de montaje, catálogo, consumo y POST y comparte la selección con la vista Visual.

El visor admite rotación, zoom, separación de piezas, apertura del lateral, vista ampliada y esquema SVG. Los controles se agrupan en una columna de iconos; el inspector aparece al solicitar detalles o pulsar una pieza. El encuadre y la iluminación de estudio dan protagonismo al PC sin alterar las geometrías ni los puntos de montaje. La ampliación mantiene un único canvas WebGL, ofrece cierre con Escape y devuelve el foco al botón de apertura. Los equipos sin WebGL2 conservan el esquema. El catálogo completo continúa en el servidor.

La geometría 3D conserva el largo de las GPU y radiadores y la altura de los disipadores aunque excedan el interior estimado. Las advertencias visuales explicitan que son estimaciones. Los ventiladores respetan los diámetros y cantidades seleccionados; las GPU sin conectores externos no reciben un cable PCIe inventado.

Se corrigió la restauración de enlaces bajo React Strict Mode y se evita mostrar piezas de la categoría anterior durante una nueva consulta. Los nombres comerciales y datos del catálogo no se han sustituido.

## Validación

- `npm run verify`: typecheck, lint y motor; **4.649 comprobaciones correctas, 0 fallos**.
- Auditoría del catálogo: **16.458 piezas, 0 incidencias**.
- Pruebas geométricas: GPU sobredimensionada, disipadores altos, radiadores de 120/240/280/360/420/480 mm, mezcla de ventiladores de 120/140 mm y GPU sin alimentación externa.
- `npm run build`: compilación de producción correcta.
- Navegador: montaje completo, progresión automática y manual, restauración de URL, cambio Visual/Técnico, consumo y POST, esquema/3D, apertura del lateral, ampliación y Escape.
- Filtros de fabricante y bloqueo de incompatibles comprobados en el catálogo.
- Adaptación visual revisada a 360, 390, 430, 1024 y 1440 px, sin desbordamiento horizontal del documento.
- Un único canvas al ampliar el visor; sin errores de consola en las interacciones finales.

Montaje de prueba:
`/?cpu=19&cooler=3&mbo=2&ram=1&gpu=3&storage=0&psu=0&case=1`.

## Límites y trabajo posterior

Esta revisión acerca la composición a la referencia del usuario; la escena todavía utiliza geometría procedural aproximada. No es un modelo CAD exacto de cada producto. Las dimensiones disponibles en el catálogo se conservan en los ejes corregidos; otros volúmenes, conectores y puntos de montaje dependen de perfiles de referencia y de inferencias por formato. Faltan datos específicos y recursos 3D para reproducir fielmente cada fabricante.

El almacenamiento 3D existente no representa exhaustivamente todas las combinaciones mixtas de M.2 y SATA ni todas las cantidades. La posición de cada ranura tampoco está documentada por modelo. Esta limitación requiere una revisión posterior de datos y representación; la vista técnica mantiene la selección completa.

Las comprobaciones de compatibilidad se apoyan en los datos existentes. Una validación interna del catálogo no confirma por sí sola cada especificación contra su fabricante.

El módulo de tres juegos, ajustes y FPS queda para la fase posterior solicitada por el usuario. No se han introducido cifras de rendimiento sin una base verificable.

## Revisión y despliegue

Revisar la Preview antes de integrar la rama. La producción permanece en main hasta la aprobación del usuario, conforme a AGENTS.md.

## Revisión tras la segunda referencia

El usuario indicó que la primera propuesta seguía demasiado cerca de la interfaz anterior. Se rehízo la composición de Personalizar con tarjetas de menor tamaño, fondo violeta, navegación discreta y detalles desplegables. Se mantiene el mismo PR para revisar el resultado antes de publicar en main.

Se repitieron verify y build correctamente. En navegador se comprobaron búsqueda y selección de CPU con progresión automática, continuación manual desde RAM, acceso a los 24 tipos de componentes, conservación del montaje en Vista técnica y ampliación con un solo canvas. La geometría exacta por fabricante y los FPS siguen pendientes; no se han introducido imágenes genéricas que sustituyan al hardware elegido.
