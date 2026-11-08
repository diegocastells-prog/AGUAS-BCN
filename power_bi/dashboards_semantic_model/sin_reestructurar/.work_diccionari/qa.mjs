import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const d=JSON.parse(await fs.readFile('.work_diccionari/workbook_data_plain.json','utf8'));
const w=await SpreadsheetFile.importXlsx(await FileBlob.load('outputs/diccionari_aguas_bcn_20261028/Diccionari_visuals_AiguesBarcelona_corregit.xlsx'));
const s=d.sheets.find(s=>s.name==='Sheet');const vr=s.rows.findIndex(r=>r[10]==='0340360c8f6559b282ce')+2;
const dax=d.sheets.find(s=>s.name==='DAX');const dr=dax.rows.findIndex(r=>r[1]==='volum_consumit_global_acum_12m')+2;
const cr=s.rows.findIndex(r=>r[10]==='21816ec0a678c2c81f25')+2;
const ar=s.rows.findIndex(r=>r[10]==='459d429c7c10668d2e5a')+2;
for(const [name,sheet,range] of [['llenguatge_balanc','Sheet','E1:G3'],['llenguatge_taula','Sheet',`E${vr}:G${vr}`],['llenguatge_cabal','Sheet',`E${cr}:G${cr}`],['llenguatge_anr','Sheet',`E${ar}:G${ar}`],['glossari','Guia','A18:B25']]){
 const b=await w.render({sheetName:sheet,range,scale:1,format:'png'});
 await fs.writeFile(`.work_diccionari/qa_${name}.png`,new Uint8Array(await b.arrayBuffer()));
 console.log(name,range);
}
process.exit(0);
