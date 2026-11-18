# Contrato de adaptación

Referencia: C:/Users/ralopez/Downloads/Google Docs template - Long version.docx
SHA-256: 71a8652001dbf0fb46d3509b05cfded4c15b8eb402acfb42f60bda394540e810
Referencia renderizada mediante Word: template.pdf, 6 páginas. render_docx.py no funciona por ausencia de LibreOffice; se usa Word y PDFium para la revisión.

Cuatro secciones A4 vertical, 11909 × 16834 twips, márgenes 1440 twips. Distancia de cabecera 1417.32 y pie 566.93 twips. Primera página con logo y dibujo rosa. Resto con banda rosa y pie Devoteam, campo PAGE. Conservar todos los encabezados, pies, imágenes, estilos, numeración y relaciones exactamente.

Montserrat 10.5 pt, gris 3c3c3a; cuerpo justificado, interlineado 1.15, separación posterior 10 pt. Title 40 pt gris; Subtitle 20 pt rosa f8485e. Heading1 13 pt negrita rosa; Heading2 11 pt Montserrat SemiBold rosa; Heading3 11 pt Montserrat Medium gris. Mantener estilos originales. Para tablas reproducir cabecera fddade y bordes rosa de la tabla de muestra; ancho del área útil 9029 twips, distribución según los campos de cada tabla. Filas expandibles y encabezado repetido. Listas clonan los párrafos de muestra.

Slots de word/document.xml (índices de hijos body basados en cero): 0–2 dibujos/espacio de portada preservar; 3 y 4 título sustituir por Manual de / traspaso a TI; 6 subtítulo sustituir por Aguas de Barcelona; 7–15 espacio de portada reutilizable para metadatos sin ampliar portada; 16 salto página preservar; 17 Summary sustituir por Índice; 18 espacio; 19–21 índice sustituir por 13 entradas con campos PAGEREF. La sección de 21 se conserva al final del nuevo índice. 22–47 texto y tabla de ejemplo reemplazables por patrones clonados con el contenido íntegro del manual. Conservar las dos secciones intermedias, colocándolas antes del capítulo 6 y antes del cierre corporativo. 48 tabla About Devoteam conservar; 49 párrafo final y 50 sectPr conservar.

Contenido: manual HTML entregado en el Escritorio, correspondiente al Word ya generado. Reproducir párrafos, tablas y listas sin modificar palabras ni cifras. Título desglosado en portada. Metadatos y estado al inicio del cuerpo. La tabla corporativa About Devoteam se conserva literalmente como contenido de plantilla, sin presentarla como una afirmación verificada por el asistente.

Preservación: package_inventory.json contiene tamaños y hashes de cada parte. Solo document.xml y settings.xml editables. Se añaden marcadores a títulos para el índice; campos PAGEREF nativos, cachés obtenidas desde Word y updateFields=true. No reconstruir partes opacas. El documento final debe mantener cuatro secciones y geometría igual a la referencia. Contenido extenso puede crear páginas adicionales dentro de cada sección. Inspeccionar todas las páginas, portada, índice, tablas y cierre corporativo. Verificar integridad del texto y cada fila frente al HTML, y ausencia de Lorem ipsum y placeholders.
