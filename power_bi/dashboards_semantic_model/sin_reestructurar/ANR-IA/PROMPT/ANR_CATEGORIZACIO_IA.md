# Prompt: categorización de fraudes, averías y subcontaje

Actúa como analista senior de redes de agua.

Consulta DIRECTAMENTE el semantic model publicado `sm_aguas_bcn` mediante su motor de consultas autenticado. No uses valores copiados de visuales y no inventes datos.

## Objetivo

Detectar sectores que requieren revisión por posibles fugas, fraude, averías o subcontaje durante enero, febrero y marzo de 2026. Los resultados son hipótesis operativas y nunca confirmaciones de fraude.

## Filtros

- Año: 2026.
- Meses: enero, febrero y marzo.
- Sin filtro de gerencia.
- Sin filtro de sector.

## Tablas certificadas

Usa exclusivamente:

- `dim_dades_sectors`
- `dim_calendario`
- `fact_volum_cons_lliur`
- `fact_bossa`
- `fact_perimetre_comptadors`
- `fact_cabals_mínims`

Solo usa tablas adicionales de fraude o averías si existe una relación válida con sector y fecha. Los datos certificados del modelo están validados con negocio.

## Datos de salida

Devuelve una fila por sector y mes con estas columnas, en este orden:

1. `sector_id`
2. `sector`
3. `gerencia`
4. `año`
5. `mes`
6. `data`
7. `agua_lliurada_hm3`
8. `agua_consumida_hm3`
9. `ANR_hm3`
10. `RTH`
11. `Qmin`
12. `contadores_con_problemas`
13. `contadores_subcontaje`
14. `num_points`
15. `prioridad_numero`
16. `tipo_retroalimentacion`
17. `recomendacion`

`data` debe contener el primer día del mes de la fila, en formato ISO `YYYY-MM-01` (por ejemplo, `2026-01-01` para enero de 2026).

El formato debe ser equivalente a:

```text
3001;Can Paulet;Llobregat Sud;2026;Gener;2026-01-01;0,016455;0,005576;0,010879;0,3389;1,76;7;621;0;Prioridad alta;Revisar posibles fugas, subcontaje y estado de contadores. Validar primero la calidad del dato.
3003;Can Ruti;Besòs;2026;Gener;2026-01-01;0,014395;0,012858;0,001537;0,8932;2,44;5;130;0;Revisión preventiva;El rendimiento es favorable, pero conviene revisar los contadores con incidencias.
3260;Mas Blau;NA;2026;Gener;2026-01-01;NA;NA;NA;NA;NA;NA;NA;0;Calidad de datos;Comprobar por qué num_points es cero y validar que las medidas respondan al filtro mensual.
```

## Reglas de cálculo

- `agua_lliurada_hm3` = `volum_lliurat_distribucion_mensual`.
- `agua_consumida_hm3` = `volum_consumit_distribucion_mensual`.
- `ANR_hm3` = agua entregada - agua consumida.
- `RTH` = agua consumida / agua entregada, expresado como decimal entre 0 y 1.
- ANR más cercano a 0 es mejor.
- RTH más cercano a 1 es mejor.
- No declares fraude confirmado por ANR alto, RTH bajo o categoría ANR.
- No confundas BLANK, cero, dato imputado y dato real.
- No clasifiques ningún registro como `Calidad de datos` ni cuestiones relaciones, medidas, filtros o fechas.
- `num_points` se debe mostrar como dato informativo y no debe utilizarse para invalidar ni reclasificar el registro.
- Si agua consumida > agua entregada o RTH está fuera de 0-1, descríbelo como señal operativa a revisar, sin atribuirlo a un problema de calidad del dato.
- Comprueba que los filtros mensuales cambian los resultados.

## Tipos de retroalimentación

- `Prioridad alta`: RTH < 0,85 y ANR positivo, con volúmenes disponibles.
- `Revisión preventiva`: RTH >= 0,85 y existen contadores con problemas o subcontaje.
- `Posible avería`: existe un aviso de avería relacionado válidamente con el sector y el mes.
- `Posible fraude`: existen señales certificadas de fraude relacionadas con sector y fecha; nunca lo confirmes solo por ANR/RTH.
- `Revisión operativa`: faltan datos para priorizar; conserva `NA` y recomienda completar la revisión del sector.
- `prioridad_numero`: entero de 1 a 4, donde 1 = `Prioridad alta`, 2 = `Revisión preventiva`, 3 = `Posible avería` o `Posible fraude`, 4 = `Revisión operativa`. Debe reflejar la severidad operativa y mantenerse alineado con `tipo_retroalimentacion`.

## Recomendaciones

- `Prioridad alta`: `Revisar posibles fugas, subcontaje y estado de contadores mediante contraste operativo en el sector.`
- `Revisión preventiva`: `El rendimiento es favorable, pero conviene revisar los contadores con incidencias.`
- `Posible avería`: `Contrastar el aviso de avería, la fecha de reparación y la evolución posterior del RTH.`
- `Posible fraude`: `Enviar a revisión especializada; no confirmar fraude sin inspección y evidencia independiente.`
- `Revisión operativa`: `Completar el contraste operativo del sector con los datos disponibles y revisar la evolución mensual.`
- `prioridad_numero`: campo numérico que debe coincidir con la escala de severidad: 1 = máxima prioridad, 4 = menor prioridad. Debe usarse para ordenar visualmente la atención operativa.

# Semantic Model: 
- Conectarse a: https://app.fabric.microsoft.com/groups/me/modeling/49b468c2-7608-4a98-ba12-f773b2c93e13/tmdlView?experience=fabric-developer


## Formato de valores

- Separador CSV: `;`.
- Codificación: UTF-8.
- `data`: fecha ISO `YYYY-MM-01`.
- Volúmenes y ANR: decimal con 6 posiciones cuando exista.
- RTH: decimal con 4 posiciones, por ejemplo `0,3389`.
- Qmin: decimal con 2 posiciones.
- Contadores y `num_points`: enteros.
- Valores ausentes: `NA`.

## Entrega

1. Devuelve una vista previa de 5 filas.
2. Genera exactamente el número de ejemplos solicitado; si no se indica, genera 80.
3. Guarda el archivo en:
   `ANR-IA/OUTPUT/anr_categorizacio.csv`.
4. El nombre de entrega debe ser exactamente `anr_categorizacio.csv`.
5. Verifica la cabecera y el número de filas.
6. Indica qué columnas son certificadas y cuáles son no certificadas.
7. Indica la ruta absoluta del archivo generado.

No presentes datos inventados como datos reales. Si la consulta directa al modelo no está disponible, detente y explica la limitación.
