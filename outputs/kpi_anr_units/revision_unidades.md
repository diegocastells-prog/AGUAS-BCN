# Revisión de KPI ANR i cabal mínim

> Actualización posterior: por indicación expresa del usuario se conserva el valor mensual 12,56 de ANR/día y su título existente. La escala numérica de esa tarjeta es miles de m³/día y se mantiene igual en todos sus períodos y comparativos, aunque el título siga diciendo m³/día. Esta decisión sustituye las recomendaciones anteriores de este documento sobre mostrar m³/día sin escala. Se preservan las cuatro medidas mensuales actuales y los objetivos.
>
> Cambios de esta actualización en `_medidas.tmdl`: ANR/día de doce meses pasa a `DIVIDE([anr_acum_12m], 365 * 1000)`; acumulado y comparación del año anterior usan `[anr_mensual] * 1000` dividido entre los días de la ventana. El ratio por suministro de doce meses usa `DIVIDE` sin cambiar su conversión correcta a litros. Se elimina la segunda división por 1.000 de kilómetros en YTD/LYTD. La comparación mensual anterior por km reutiliza la medida mensual actual para que Diff no reste valores con escalas distintas. Diff conserva la resta absoluta. No se modifican títulos, archivos de visuales, objetivos ni las cuatro medidas mensuales.
>
> Validación de esta actualización: parser TMDL correcto (50 tablas), `git diff --check` correcto, y comprobación de que las expresiones mensuales, los objetivos y las restas Diff permanecen intactos. Pendiente ejecutar y revisar los resultados en el modelo de Power BI que alimenta el informe. Las conclusiones históricas que siguen deben leerse con esta actualización.

Fecha: 13/11/2026. Informe: `Aguas de Barcelona 4.Report`, página `32a69b6a4b9ecc1986d0`.

## Resultado y alcance

Se corrigieron conversiones DAX, denominadores, formatos y el selector de gerencia en los archivos del proyecto. Se conservan los 365 días para doce meses. No se modificaron hojas de cálculo, datos del cliente, consultas Power Query, relaciones ni los volúmenes base. QMin conserva su cálculo y su escala: su unidad física sigue pendiente de confirmación en el origen.

El informe usa `datasetReference.byConnection` hacia un modelo publicado. Las medidas corregidas están en `sm_aguas_bcn.SemanticModel`; abrir únicamente el informe conectado al servicio no aplica esos cambios DAX. Es necesario probar/publicar el modelo corregido en el entorno correspondiente, o conectar una copia del informe al modelo local. No se ha publicado ni cambiado la conexión existente.

## Correspondencia exacta entre tarjetas y medidas

Las tarjetas enlazan directamente con medidas de `_switchs`; no utilizan un parámetro de campos. El selector `dummy_slicer_periodo[Periodo]` determina la rama de cada `SWITCH`.

| Tarjeta | Campo Indicator | Campo Goal | Unidad del indicador y su referencia |
|---|---|---|---|
| ANR (m³/dia) | `_switchs[kpi_anr_dia_m3_switch]` | `_switchs[kpi_anr_dia_m3_switch_1m]` | m³/día |
| ANR (l/esc/dia) | `_switchs[kpi_anr_l_esc_dia_switch]` | `_medidas[Objectiu_Anual]`, indicador `ANR l/esc/dia` | litros/acometida/día; objetivo mostrado 265,35 |
| ANR (m³/km/dia) | `_switchs[kpi_anr_m3_km_dia_switch]` | `_medidas[Objectiu_Anual]`, indicador `ANR m3/km/dia` | m³/km/día; objetivo mostrado 15,21 |
| ANR (l/subm/dia) | `_switchs[kpi_anr_l_subm_dia_switch]` | `_medidas[Objectiu_Anual]`, indicador `ANR l/subm/dia` | litros/suministro/día; objetivo mostrado 30,86 |

Los importes de objetivo anteriores son los comunicados por el usuario, no constantes añadidas al código: siguen procediendo de `fact_objectius` para el año y DOP seleccionados.

| Familia | Mensual | 12 Mesos | Acumulat | Diff |
|---|---|---|---|---|
| m³/día | `anr_dia_m3_mensual` | `anr_dia_m3_acum_12m` | `anr_dia_m3_ytd` | `anr_dia_m3_diff` |
| l/acometida/día | `anr_l_esc_dia_mensual` | `anr_l_esc_dia_acum_12m` | `anr_l_esc_dia_ytd` | `anr_l_esc_dia_diff` |
| m³/km/día | `anr_m3_km_dia_mensual` | `anr_m3_km_dia_mitjana_12m` | `anr_m3_km_dia_ytd` | `anr_m3_km_dia_diff` |
| l/suministro/día | `anr_l_subm_dia_mensual` | `anr_l_subm_dia_mitjana_12m` | `anr_l_subm_dia_ytd` | `anr_l_subm_dia_diff` |

El comparativo de m³/día usa `anr_dia_m3_mensual_smly` en Mensual (mismo mes del año anterior), `anr_dia_m3_acum_12m_1m` en 12 Mesos (ventana de doce meses desplazada un mes), `anr_dia_m3_lytd` en Acumulat y `_cero_acumulat` en Diff. Se mantienen esas referencias temporales y sus unidades compatibles.

`Diff` es la diferencia absoluta entre el indicador mensual y el mismo mes del año anterior, en la misma unidad física; no divide por el valor anterior ni multiplica por 100. En los tres ratios, Goal continúa siendo el objetivo anual original también en Diff: es una referencia de nivel, no un objetivo específico de variación. Se deja esa distinción explícita y no se sustituye el objetivo por cero ni por una diferencia calculada.

En esta revisión adicional se recorrieron 38 medidas definidas alcanzables desde los cuatro indicadores y el comparativo de m³/día. Las conversiones correctas ya estaban presentes en los archivos locales, por lo que no se aplicó una segunda reducción de escala.

## Unidades, evidencia y correcciones

| Indicador | Unidad de entrada comprobada en el proyecto/contexto | Salida | Corrección |
|---|---|---|---|
| ANR/día, 12 meses | `anr_acum_12m`: m³ | m³/día | `DIVIDE([anr_acum_12m], 365)`. Se elimina el ×1.000.000 sobrante. |
| ANR por acometida, 12 meses | m³ y número medio de acometidas | litros/acometida/día | `DIVIDE([anr_acum_12m] * 1000, [escomeses_12m_mitjana] * 365)`. Antes usaba ×1.000.000.000. |
| ANR por km, 12 meses | m³ y km medios | m³/km/día | La conversión original ya era correcta; se corrigen el ámbito de gerencia y el cierre/agrupación de la media de inventario. |
| ANR por suministro, 12 meses | m³ y número medio de suministros | litros/suministro/día | `DIVIDE([anr_acum_12m] * 1000, [subministraments_12m_mitjana] * 365)`. Se elimina el ×1.000.000 sobrante y la división directa. |
| QMin | `fact_cabals_mínims[q_min]`, sin unidad física declarada | La misma unidad del origen, todavía desconocida | No se añade ninguna conversión ni etiqueta física supuesta. Se fija únicamente el formato numérico sin abreviación y a dos decimales. |

Evidencia revisada:

- `expressions.tmdl`: `fact_volum_consumit` toma «Volums Consumits» y `fact_volum_lliurat` toma «Lliurats Corregits», ambas de «Indicadors Sectorització 2026». Despivotan, cambian tipos y limpian filas; no convierten hm³ a m³ ni m³ a litros. `fact_volum_cons_lliur` combina las tablas sin escalarlas. La unidad m³ se apoya también en el valor de referencia facilitado para Barcelona Nord: 4.661.577 m³.
- `anr_acum_12m` suma volumen entregado menos consumido sobre `DATESINPERIOD(..., -12, MONTH)` sin divisor de escala. Se conserva íntegra su definición, incluida la ventana de disponibilidad existente.
- `anr_mensual` remite a `anr_dist_mensual`, que divide los volúmenes entre 1.000.000: su salida es hm³. Los factores ×1.000.000 para m³ y ×1.000.000.000 para litros son correctos cuando la base es esta medida mensual; no se eliminaron indiscriminadamente.
- `fact_inventari_xarxa_distribucion` procede de «Inventari xarxa» de «Indicadors ANR 2026». Su último paso M divide `xarxa` entre 1.000. Se conserva esta conversión de origen a km, coherente con los 894,65225 km aportados. Se elimina la segunda división entre 1.000 en DAX. No se pudieron volver a leer las cabeceras del libro original para contrastar independientemente la etiqueta de metros.
- `fact_objectius` importa «ANR m3/km/dia», «ANR l/esc/dia» y «ANR l/subm/dia» con sus valores, sin conversiones. `Objectiu_Anual` selecciona el valor por año, indicador y DOP, también sin escalado. No se ajustan los objetivos 265,35, 15,21 y 30,86 mediante factores.
- QMin procede de la hoja «Cabals Mínims» de «Indicadors Sectorització 2026». Power Query descarta las dos primeras filas, promueve cabeceras, despivota las fechas a `q_min` y asigna tipo numérico, sin conversión. `q_min_mensual` suma caudales; `q_min_12_mesos_mitjana` promedia la medida mensual sobre la ventana de doce meses. El código no permite decidir si la unidad original es l/s, m³/h u otra.

Los tres libros fuente consultados mediante la conexión de Google Sheets devolvieron HTTP 403 (cuenta sin permiso). No se accedió a sus datos ni se intentó modificar ningún libro. La evidencia de unidades disponible es el código local y las referencias suministradas por el usuario, no una nueva lectura del Excel.

## Gerencia, granularidad y tiempo

El selector `09453a405e8dc9d31b24` pasa de `dim_dades_sectors[gerencia]` a `dim_gerencia[gerencia]`, manteniendo Barcelona Nord como selección guardada y las cinco opciones de distribución.

Las relaciones activas permiten estos recorridos:

- `dim_gerencia` → `fact_inventari_xarxa_distribucion`.
- `dim_gerencia` → `dim_dades_sectors` → `fact_volum_cons_lliur` y `fact_cabals_mínims`.
- `dim_calendario[Date]` → las tres tablas de hechos.

La dirección original no permitía que un filtro en la dimensión de sectores volviera hacia la dimensión de gerencia para filtrar el inventario. No se hicieron bidireccionales las relaciones.

Las medias de doce meses ahora usan `MAX(dim_calendario[Date])`, el mismo cierre que el numerador, y promedian sumas mensuales del inventario de las gerencias seleccionadas. Antes se promediaban filas de distintas gerencias y se utilizaba el máximo de fecha de inventario (normalmente el día 1); acometidas además dependía de `TODAY()`. Esto podía producir ventanas distintas o medias que no representaban el total seleccionado.

El inventario no tiene detalle por sector. Por ello, el selector de sector ya no filtra las tres tarjetas normalizadas ni su gráfico combinado; continúa filtrando ANR absoluto y QMin. Se configura con cuatro interacciones `NoFilter` en la página. Los marcadores existentes suprimen datos (`suppressData: true`) y no se modifican.

`DOP_Objectiu_Seleccionada` prioriza la dimensión compartida de gerencia y conserva la dimensión de sectores como alternativa para otros informes. Los objetivos anuales mantienen su lógica. No se inventa un objetivo agregado para múltiples gerencias.

## Cambios justificados en otros períodos

- **Mensual ANR/día:** faltaba convertir hm³ a m³. Se añade ×1.000.000 manteniendo el número de días del mes y el `DIVIDE` existente. La comparación mensual del año anterior ya convertía correctamente; se elimina su formato de porcentaje.
- **Mensual por km y comparación anterior:** `l_km_mensual` dividía entre 1.000 unos valores ya convertidos a km en Power Query. Se retira esa división; sus dependientes reciben km reales.
- **Acumulat y comparación anterior por km:** se retira la misma segunda división entre 1.000 en sus denominadores.
- **Acumulat ANR/día y comparación anterior:** antes evaluaban la medida mensual dentro de una ventana de varios meses, por lo que el divisor era el número de días del último mes. Ahora se divide el volumen acumulado en m³ entre los días de la ventana correspondiente. Se conservan las fechas de inicio/fin existentes; no se impone 365 fuera de doce meses. También se conserva la condición preexistente del YTD actual basada en `TODAY()` y disponibilidad de `fact_aigua_no_registrada`; revisar esa política temporal sería otro cambio.
- **Inventario YTD/LYTD de los tres ratios:** se promedian los totales por mes, en vez de las filas de distintas gerencias, conservando sus ventanas y días. Para una sola gerencia con una fila por mes el criterio de media es equivalente.
- **Diff:** conserva su resta actual menos anterior en unidades absolutas, sin convertirla a porcentaje.

## Formato y visuales

Las cinco tarjetas KPI usan `indicatorDisplayUnits = 1` (ninguna abreviación) y `indicatorPrecision = 2`. Las proyecciones de indicador y objetivo usan `#,0.00`. Los dos gráficos de evolución usan unidades sin abreviación y dos decimales en ejes/etiquetas. Se corrigen los títulos a «ANR (m³/dia)» y «ANR (m³/km/dia)».

Se retiran formatos de porcentaje que estaban aplicados a magnitudes absolutas. QMin no recibe una unidad inventada. El formato de objetivos se aplica en estos visuales, sin alterar el formato compartido de `Objectiu_Anual` para indicadores ajenos a esta página.

Las cuatro tarjetas ANR ahora fijan explícitamente `status.direction = 'Negative'`: menor que su referencia es favorable. Se conserva el campo Goal y sus filtros originales. El tema del informe no sobrescribe colores de estado KPI; conserva los colores semánticos nativos. La presentación efectiva de colores e iconos requiere comprobación visual en Desktop.

Se retiraron las condiciones de filtro `indicador > 0` de las tres tarjetas de ratios. Esas condiciones ocultaban ceros y diferencias negativas, aunque una reducción del ANR debe seguir siendo visible. Las expresiones DAX de Diff no se modificaron y se mantienen los filtros de indicador objetivo y DOP.

Referencia técnica sobre unidades automáticas frente a formato numérico: [Microsoft Learn: formatos personalizados de Power BI](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-custom-format-strings).

## Archivos modificados

Raíz de los archivos del informe/modelo: `power_bi/dashboards_semantic_model/sin_reestructurar/`.

| Archivo o ruta relativa | Cambio |
|---|---|
| `sm_aguas_bcn.SemanticModel/definition/tables/_medidas.tmdl` | Conversiones, medias de inventario, divisores diarios, formatos y selección de DOP. |
| `sm_aguas_bcn.SemanticModel/definition/tables/_switchs.tmdl` | Formato numérico explícito de `kpi_anr_dia_m3_switch`, `kpi_anr_dia_m3_switch_1m` y `kpi_anr_l_subm_dia_switch_1m`. |
| `sm_aguas_bcn.SemanticModel/definition/tables/fact_inventari_xarxa_distribucion.tmdl` | Las tres medidas alternativas `ANR_l_esc_dia`, `ANR_l_subm_dia` y `ANR_m3_km_dia` remiten a las medidas corregidas, con `DIVIDE` a través de ellas y formato numérico. La partición M permanece intacta. |
| `Aguas de Barcelona 4.Report/definition/pages/32a69b6a4b9ecc1986d0/page.json` | Interacciones de sector coherentes con el nivel de detalle disponible. |
| `.../visuals/09453a405e8dc9d31b24/visual.json` | Selector de gerencia. |
| `.../visuals/9b6dc84421e306000ee5/visual.json` | KPI ANR/día. |
| `.../visuals/459d429c7c10668d2e5a/visual.json` | KPI por acometida. |
| `.../visuals/fc67e94f3654dd004a94/visual.json` | KPI por km. |
| `.../visuals/a7de3611d20856901010/visual.json` | KPI por suministro. |
| `.../visuals/21816ec0a678c2c81f25/visual.json` | KPI QMin: solo formato. |
| `.../visuals/1db84162e6528156cbac/visual.json` | Gráfico combinado de ratios. |
| `.../visuals/6ec93e2cb015eb9150ec/visual.json` | Evolución QMin: solo formato. |

Medidas con cambios de expresión en `_medidas.tmdl`:

- `anr_dia_m3_mensual`, `anr_dia_m3_acum_12m`, `anr_l_esc_dia_acum_12m`, `anr_l_subm_dia_mitjana_12m`.
- `l_km_mensual`, `escomeses_12m_mitjana`, `subministraments_12m_mitjana`, `l_km_12m_mitjana`.
- `anr_dia_m3_ytd`, `anr_dia_m3_lytd`.
- `anr_l_esc_dia_ytd`, `anr_l_esc_dia_lytd`, `anr_l_subm_dia_ytd`, `anr_l_subm_dia_lytd`, `anr_m3_km_dia_ytd`, `anr_m3_km_dia_lytd`.
- `DOP_Objectiu_Seleccionada`.

Además se normaliza el formato de las medidas de estas cuatro familias (mensual, comparación mensual, acumulado, comparación acumulada y diferencia) que tenían porcentaje o formato general. `anr_m3_km_dia_mitjana_12m` conserva su expresión correcta y recibe las correcciones de sus dependencias.

## Validación realizada

- Deserialización correcta del modelo completo: 50 tablas mediante `Microsoft.AnalysisServices.Tabular.TmdlSerializer`, usando la biblioteca instalada con Power BI Desktop.
- Lectura JSON correcta de los 1.508 archivos de definición del informe, incluida la página modificada.
- `git diff --check` sin errores.
- Comprobación de que `anr_acum_12m`, `anr_mensual`, `anr_dist_mensual`, `Objectiu_Anual`, `q_min_mensual`, `q_min_12_mesos_mitjana` y la partición M de inventario permanecen iguales a las definiciones previas.
- Comparación contra Git, normalizando únicamente los saltos de línea: `fact_objectius.tmdl`, `dim_indicador_objectiu.tmdl` y la definición de `Objectiu_Anual` permanecen intactos. No se cambiaron los valores, unidades ni escala de los objetivos. También se comprobó que añadir la dirección favorable y retirar filtros positivos no cambia las proyecciones Goal ni sus filtros de DOP/indicador.
- Ocho comprobaciones aritméticas independientes: conversiones m³/litros, mensual desde hm³, divisor diario acumulado y suma por gerencias antes de promediar. No equivalen a ejecutar DAX con datos reales.
- Referencia Barcelona Nord: `4.668.312 / (894,65225 × 365) = 14,295941... → 14,30`; `4.661.577 / (894,65225 × 365) = 14,275316... → 14,28`.

## Validación pendiente en Power BI

1. Cargar las definiciones corregidas en el modelo de prueba y ejecutar `validacion_kpi_anr.dax`. No se ha ejecutado DAX contra un motor con datos ni refrescado/publicado el modelo.
2. Confirmar junio de 2026 / Barcelona Nord: ANR 4.661.577 m³, longitud media 894,65225 km y ratio 14,28. Son referencias proporcionadas por el usuario, no valores reconsultados al servicio durante esta revisión.
3. Revisar que cada gerencia tenga doce meses completos y una fila de inventario por mes; comprobar claves sin correspondencia, filas agregadas y periodos sin datos. Las medias usan los meses presentes, sin rellenar meses faltantes ni inventar inventario. La consulta de cobertura está incluida.
4. Probar cada gerencia y selección múltiple; verificar que el objetivo corresponda a año/indicador/DOP. Revalidar los objetivos 265,35, 15,21 y 30,86 en el origen cuando haya acceso.
5. Confirmar la unidad física de QMin en «Cabals Mínims» o documentación de origen. Después podrá añadirse esa unidad al título; no puede deducirse de 302,80.
6. Comprobar visualmente ausencia de «mill.» y de porcentajes, dos decimales, espacio disponible, paneles/marcadores y selección de período. Verificar también los dependientes de `l_km_mensual` en otras páginas, pues la medida compartida ahora devuelve km correctos.
7. En esta página, comprobar que el sector modifica ANR absoluto y QMin pero no los ratios con inventario por gerencia. Los filtros externos o de nivel de informe por sector deberán respetar esa misma limitación de granularidad; las interacciones configuradas se refieren al selector de esta página.

## Discrepancias de datos separadas de las unidades

La diferencia cliente–Power BI de **6.735 m³** produce **0,0206248 m³/km/día** de diferencia: explica 14,30 frente a 14,28. No se han añadido constantes ni factores correctores.

Los valores observados 12.302,05 mill., 347,29 mill. y 49,26 mill. contienen el exceso de escala de un millón. Manteniendo exactamente numerador, denominador y contexto, corregir solo la conversión produciría 12.302,05 m³/día, 347,29 l/acometida/día y 49,26 l/suministro/día. **No son resultados finales certificados**: la corrección adicional de gerencia, ventana y media de inventario puede cambiar los valores.

En la segunda observación del usuario aparecen 12.302.052.054,79; 240.034.575,89; 13,74 y 27.851.075,31. Son compatibles con las conversiones antiguas: manteniendo idéntico contexto y denominadores, las fórmulas corregidas darían respectivamente 12.302,05 m³/día; 240,03 l/acometida/día; 13,74 m³/km/día y 27,85 l/suministro/día. Esta es una comprobación dimensional condicionada, no una ejecución sobre datos reales. Con los objetivos indicados, 240,03 < 265,35; 13,74 < 15,21 y 27,85 < 30,86 serían favorables. Debe verificarse qué versión del modelo publicado está usando el informe.

Queda pendiente conciliar los datos de volumen con el Excel y revisar cobertura/calidad del inventario. El Power Query actual también reemplaza determinados vacíos/errores de volumen por cero, convierte volúmenes a entero y elimina duplicados; no se atribuye la discrepancia a ninguno de esos pasos sin comparar las filas originales.
