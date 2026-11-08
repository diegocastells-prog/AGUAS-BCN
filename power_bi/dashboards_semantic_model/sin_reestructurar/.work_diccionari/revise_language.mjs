import fs from 'node:fs/promises';
import {Workbook,FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const path='outputs/diccionari_aguas_bcn_20261028/Diccionari_visuals_AiguesBarcelona_corregit.xlsx';
const before=JSON.parse(await fs.readFile('.work_diccionari/workbook_data.json','utf8'));
const data=JSON.parse(await fs.readFile('.work_diccionari/workbook_data_plain.json','utf8'));
await fs.copyFile(path,'.work_diccionari/previous_delivery.xlsx');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const spec=data.sheets[0], sh=wb.worksheets.getItem('Sheet');
sh.getRange(`E2:G${spec.rows.length+1}`).values=spec.rows.map(r=>r.slice(4,7));
for(let i=0;i<spec.rows.length;i++)if(spec.rows[i][1]!==before.sheets[0].rows[i][1])sh.getRange(`B${i+2}`).values=[[spec.rows[i][1]]];
const layout=[];
for(let ri=0;ri<spec.rows.length;ri++){
 let lines=1;
 for(let ci=0;ci<spec.rows[ri].length;ci++){
  const cap=Math.max(7,Math.floor(spec.widths[ci]*.92));
  lines=Math.max(lines,String(spec.rows[ri][ci]??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/cap)),0));
 }
 const height=Math.max(32,Math.ceil(lines*15.5+10));
 if(height>409)throw new Error(`Row ${ri+2} too tall: ${height}`);
 sh.getRange(`A${ri+2}:M${ri+2}`).format.rowHeight=height;
 layout.push(height);
}
const guide=data.sheets.find(s=>s.name==='Guia');
const oldGuide=before.sheets.find(s=>s.name==='Guia');
const gs=wb.worksheets.getItem('Guia');
for(let i=0;i<oldGuide.rows.length;i++)if(JSON.stringify(guide.rows[i])!==JSON.stringify(oldGuide.rows[i]))gs.getRange(`A${i+2}:B${i+2}`).values=[guide.rows[i]];
gs.tables.items[0].rows.add(null,guide.rows.slice(oldGuide.rows.length));
gs.getRange(`A${oldGuide.rows.length+2}:B${guide.rows.length+1}`).format={font:{name:'Calibri',size:11,color:'#20252B'},wrapText:true,verticalAlignment:'top',rowHeight:60};
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Sheet!E2:G3',include:'values,formulas',tableMaxRows:2,tableMaxCols:3,tableMaxCellChars:1200,maxChars:3000})).ndjson);
const xlsx=await SpreadsheetFile.exportXlsx(wb);await xlsx.save(path);
const samples=[['balanc','E1:G3'],['tecnic_traduit',null],['cabal',null],['taula',null]];
const ids=['','1db84162e6528156cbac','21816ec0a678c2c81f25','e9ced9ea862d1805572e'];
for(let i=0;i<samples.length;i++){
 const [name,fixed]=samples[i];const row=spec.rows.findIndex(r=>r[10]===ids[i])+2;
 const range=fixed??`E${row}:G${row}`;
 const blob=await wb.render({sheetName:'Sheet',range,scale:1,format:'png'});
 await fs.writeFile(`.work_diccionari/language_${name}.png`,new Uint8Array(await blob.arrayBuffer()));
}
const gb=await wb.render({sheetName:'Guia',range:'A18:B25',scale:1,format:'png'});
await fs.writeFile('.work_diccionari/language_glossari.png',new Uint8Array(await gb.arrayBuffer()));
await fs.writeFile('.work_diccionari/language_layout.json',JSON.stringify({rows:layout.length,maxRowHeight:Math.max(...layout)}));
console.log('Saved revised workbook; 363 descriptions rewritten and glossary added.');
process.exit(0);
