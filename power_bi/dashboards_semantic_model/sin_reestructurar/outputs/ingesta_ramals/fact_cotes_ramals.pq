let
    Origen = Excel.Workbook(File.Contents("C:\Users\ralopez\Downloads\RAMALS 2024.xlsx"), null, true),
    Nombres = {"055BAR", "070BBE", "070FLL", "070LLO", "100BES", "100BLL", "100ESF-100CDE", "100LLO", "130BAR", "130SCG", "140LLO", "176BAR", "200BAR-200BLL", "300BAR", "Begues", "Cerdanyola", "Montcada", "Montgat", "Pallejà", "Papiol", "Torrelles"},
    Hojas = Table.SelectRows(Origen, each [Kind] = "Sheet" and List.Contains(Nombres, [Item])),
    Verificadas = if Table.RowCount(Hojas) = 21 then Hojas else error "Faltan pestañas del archivo RAMALS 2024.",
    Preparadas = Table.AddColumn(Verificadas, "Filas", each
        let
            Hoja = [Item],
            Cabeceras = Table.PromoteHeaders([Data], [PromoteAllScalars=true]),
            Columnas = Table.SelectColumns(Cabeceras, {"nº de nudo", "X", "Y", "Z(m)", "Sector", "Nombre"}),
            ConOrigen = Table.AddColumn(Columnas, "hoja_origen", each Hoja, type text)
        in ConOrigen),
    Unidas = Table.Combine(Preparadas[Filas]),
    ConNudo = Table.SelectRows(Unidas, each [#"nº de nudo"] <> null and Text.Trim(Text.From([#"nº de nudo"])) <> ""),
    Renombradas = Table.RenameColumns(ConNudo, {{"nº de nudo", "nudo_id"}, {"Z(m)", "z_m"}, {"Sector", "sector_original"}, {"Nombre", "nombre"}}),
    Tipos = Table.TransformColumnTypes(Renombradas, {{"nudo_id", type text}, {"X", type number}, {"Y", type number}, {"z_m", type number}, {"sector_original", type text}, {"nombre", type text}}, "es-ES"),
    ConSector = Table.AddColumn(Tipos, "sector_id", each
        let
            Texto = if [sector_original] = null then "" else Text.Trim([sector_original]),
            SoloDigitos = Texto <> "" and Text.Select(Texto, {"0".."9"}) = Texto
        in if SoloDigitos then Int64.From(Number.FromText(Texto, "en-US")) else null, Int64.Type),
    ConEstado = Table.AddColumn(ConSector, "estado_sector", each
        if [sector_original] = null or Text.Trim([sector_original]) = "" then "Sin sector"
        else if [sector_id] = null then "Pendiente de correspondencia"
        else "Codigo numerico; validar en dimension", type text)
in
    ConEstado