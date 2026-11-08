import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const w=await SpreadsheetFile.importXlsx(await FileBlob.load('C:/Users/ralopez/Desktop/Diccionari_visuals_AiguesBarcelona.xlsx'));
console.log((await w.inspect({kind:'workbook,sheet,table',maxChars:2500,tableMaxRows:3,tableMaxCols:7})).ndjson);
const b=await w.render({sheetName:'Sheet',range:'A1:G5',scale:1,format:'png'});
await fs.writeFile('.work_diccionari/original.png',new Uint8Array(await b.arrayBuffer()));
