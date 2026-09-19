# Prompt: distribución con ANR/RTH inferior al 80%

Actúa como analista senior de redes de agua.

Consulta DIRECTAMENTE el semantic model publicado `sm_aguas_bcn` mediante su motor de consultas autenticado. No uses valores copiados de visuales y no inventes datos.

## Objetivo

Mostrar los sectores y meses de distribución cuyo rendimiento `RTH` sea inferior al 80% (`RTH < 0,80`), junto con su ANR y las medidas necesarias para retroalimentar el informe Power BI.

## Filtros

- Año: 2026.
- Meses: enero, febrero y marzo.
- Sin filtro de gerencia.
- Sin filtro de sector.
- Aplicar el filtro después de calcular `RTH = agua consumida / agua entregada`.
- No interpretar `ANR < 80%` como una unidad de volumen: el 80% corresponde al umbral de RTH o rendimiento.

## Tablas certificadas

Usa exclusivamente:

- `dim_dades_sectors`
- `dim_calendario`
- `fact_volum_cons_lliur`
- `fact_bossa`
- `fact_perimetre_comptadors`
- `fact_cabals_mínims`

## Datos de salida específicos de ANR

Este prompt tiene un esquema distinto de `ANR_CATEGORIZACIO_IA.md`.
Devuelve una fila por sector y mes con estas columnas, exactamente en este orden:

1. `sector_id`
2. `sector`
3. `gerencia`
4. `anyo`
5. `mes`
6. `data`
7. `aigua_lliurada_m3`
8. `aigua_consumida_m3`
9. `ANR_porcentaje`
10. `ANR_m3`
11. `peso_ANR_total_porcentaje`
12. `ranking_peso_ANR`
13. `contadores_con_poblemas`
14. `num_points`
15. `prioridad_numero`
16. `tipo_retroalimentacion`
17. `recomendacion`

`data` debe contener el primer día del mes de la fila, en formato ISO `YYYY-MM-01` (por ejemplo, `2026-01-01` para enero de 2026).

## Reglas de cálculo

- `aigua_lliurada_m3` = `volum_lliurat_distribucion_mensual * 1000000`.
- `aigua_consumida_m3` = `volum_consumit_distribucion_mensual * 1000000`.
- `ANR_porcentaje` = `(agua entregada - agua consumida) / agua entregada * 100`.
- `ANR_m3` = `aigua_lliurada_m3 - aigua_consumida_m3`.
- `peso_ANR_total_porcentaje` = `ANR_m3 / suma del ANR_m3 de todas las filas seleccionadas * 100`.
- `ranking_peso_ANR` ordena de mayor a menor el `peso_ANR_total_porcentaje`; el rango 1 corresponde al mayor peso.
- `RTH` = agua consumida / agua entregada, expresado como decimal entre 0 y 1.
- Devuelve solamente filas con `RTH < 0,80`.
- No incluyas `RTH`, `Qmin`, `categoria_anr` ni `contadores_subcontaje` en este CSV.
- Si falta agua entregada o consumida, conserva `NA` en las columnas calculadas.
- No declares fraude confirmado por un RTH bajo o un ANR alto.
- Los datos del modelo están validados con negocio. No clasifiques ningún registro como `Calidad de datos` ni cuestiones relaciones, medidas, filtros o fechas.
- `num_points` se debe mostrar como dato informativo y no debe utilizarse para invalidar ni reclasificar el registro.

## Matriz de priorización operativa

Define `contadores_con_poblemas` vacío como 0 para la evaluación. Usa los valores sin redondear:

- `Prioridad crítica`: `ANR_m3 >= 10000` y (`peso_ANR_total_porcentaje >= 5` o `contadores_con_poblemas >= 20`), o `peso_ANR_total_porcentaje >= 10`.
- `Prioridad alta`: no es crítica y se cumple al menos una condición: `ANR_porcentaje >= 40`, `peso_ANR_total_porcentaje >= 3` o `contadores_con_poblemas >= 10`.
- `Revisión de contadores`: no es crítica ni alta y `contadores_con_poblemas > 0`.
- `Seguimiento operativo`: no se cumple ninguna condición anterior.

La prioridad debe considerar conjuntamente el volumen perdido (`ANR_m3`), la proporción de pérdida (`ANR_porcentaje`), la contribución al ANR total (`peso_ANR_total_porcentaje`) y la incidencia de contadores. No uses un único indicador de forma aislada.

Cada recomendación debe incluir una explicación cuantificada con este sentido:
`Este sector representa el X,XX% del ANR total. Es una señal problemática porque el ANR es de Y,YY m3 (Z,ZZ%) y cuanto más cercano a 0 sea el ANR, mejor.`
Sustituye `X,XX`, `Y,YY` y `Z,ZZ` por los valores de la fila.

## Tipos de retroalimentación

- `Prioridad alta`: RTH < 0,80, ANR positivo y datos de volumen disponibles.
- `Revisión operativa`: faltan datos suficientes para calcular el RTH, pero el registro debe conservarse.
- `prioridad_numero`: entero de 1 a 4, donde 1 = prioridad crítica, 2 = prioridad alta, 3 = revisión de contadores, 4 = seguimiento operativo. Debe estar alineado con la categoría de prioridad y debe usarse para ordenar visualmente la severidad.

## Recomendaciones

- `Prioridad crítica`: `Actuar con prioridad máxima: localizar el origen del ANR, revisar fugas y subcontaje, e inspeccionar los contadores con problemas.`
- `Prioridad alta`: `Programar revisión prioritaria de fugas y subcontaje, contrastando el ANR porcentual, su peso en el total y los contadores con problemas.`
- `Revisión de contadores`: `Revisar y diagnosticar los contadores con problemas; después contrastar la evolución del ANR del sector.`
- `Seguimiento operativo`: `Mantener seguimiento mensual del ANR y revisar el sector si aumenta su peso sobre el ANR total.`
- `prioridad_numero`: campo numérico que representa la severidad: 1 = Prioridad crítica, 2 = Prioridad alta, 3 = Revisión de contadores, 4 = Seguimiento operativo. Debe mantenerse coherente con `tipo_retroalimentacion`.
- Añade siempre al final de la recomendación: `Este sector representa el X,XX% del ANR total. Es una señal problemática porque el ANR es de Y,YY m3 (Z,ZZ%) y cuanto más cercano a 0 sea el ANR, mejor.`
- `Revisión operativa`: `Revisar el sector cuando estén disponibles los volúmenes y completar el contraste operativo correspondiente.`

# Semantic Model: 
- Conectarse a: https://app.fabric.microsoft.com/groups/me/modeling/49b468c2-7608-4a98-ba12-f773b2c93e13/tmdlView?experience=fabric-developer

## Formato de valores

- Separador visual: tabulador o `;`.
- `data`: fecha ISO `YYYY-MM-01`.
- Volúmenes en m3: decimal con 2 posiciones.
- `ANR_porcentaje`: porcentaje numérico con 2 posiciones, sin símbolo `%`.
- `ANR_m3`: volumen en m3 con 2 posiciones.
- `peso_ANR_total_porcentaje`: porcentaje numérico con 2 posiciones, sin símbolo `%`.
- `ranking_peso_ANR`: entero.
- `contadores_con_problemas` y `num_points`: enteros.
- Valores ausentes: `NA`.

## Entrega

1. Muestra una vista previa de 5 filas.
2. Exporta un CSV UTF-8 con separador `;` y la cabecera exacta del esquema ANR.
3. Verifica que todas las filas cumplen `RTH < 0,80`.
4. Ordena el CSV por `ranking_peso_ANR` ascendente para mostrar primero los sectores con mayor contribución al ANR total.
5. Comprueba que enero, febrero y marzo cambian realmente el resultado.
6. Guarda el archivo en:
   `ANR-IA/OUTPUT/anr_ia.csv`
7. El nombre de entrega debe ser exactamente `anr_ia.csv`.
8. Indica la ruta absoluta del CSV generado y el ANR total del período.

No presentes datos inventados como datos reales. Si no puedes consultar directamente el modelo, detente y explica la limitación.
