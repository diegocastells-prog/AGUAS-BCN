import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const data=JSON.parse(await fs.readFile(process.argv[2]??'.work_diccionari/workbook_data.json','utf8'));
const outputDir='outputs/diccionari_aguas_bcn_20261028';
await fs.mkdir(outputDir,{recursive:true});
const wb=Workbook.create();
function col(n){let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
const layout=[];
for(const [idx,spec] of data.sheets.entries()){
 const sh=wb.worksheets.add(spec.name);
 const matrix=[spec.headers,...spec.rows].map(r=>r.map(x=>typeof x==='string'&&x.startsWith('=')?"'"+x:x));
 const last=col(spec.headers.length);const end=matrix.length;
 sh.getRange(`A1:${last}${end}`).values=matrix;
 sh.showGridLines=false;
 const all=sh.getRange(`A1:${last}${end}`);
 all.format.font={name:'Calibri',size:11,color:'#20252B'};
 all.format.wrapText=true;all.format.verticalAlignment='top';
 for(let i=0;i<spec.widths.length;i++)sh.getRange(`${col(i+1)}1:${col(i+1)}${end}`).format.columnWidth=spec.widths[i];
 const t=sh.tables.add(`A1:${last}${end}`,true,idx===0?'Tabla1':`Diccionari_${idx}`);
 t.style='TableStyleLight1';t.showFilterButton=true;
 sh.getRange(`A1:${last}1`).format={fill:'#E4E7EB',font:{name:'Calibri',size:11,bold:true,color:'#172B4D'},wrapText:true,verticalAlignment:'center',horizontalAlignment:'center',rowHeight:34};
 sh.freezePanes.freezeRows(1);
 // Estimate wrapped lines from the longest word and explicit line breaks. Large DAX blocks are split upstream.
 const tall=[];
 for(let ri=1;ri<matrix.length;ri++){
  let lines=1;
  for(let ci=0;ci<matrix[ri].length;ci++){
   const val=String(matrix[ri][ci]??'');const cap=Math.max(7,Math.floor(spec.widths[ci]*0.92));
   const count=val.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/cap)),0);
   lines=Math.max(lines,count);
  }
  const height=Math.max(32,Math.ceil(lines*15.5+10));
  if(height>409)tall.push({row:ri+1,height});
  sh.getRange(`A${ri+1}:${last}${ri+1}`).format.rowHeight=Math.min(409,height);
 }
 if(spec.name==='Sheet')sh.tabColor='#17365D';
 if(spec.name==='Guia')sh.tabColor='#7F8C8D';
 const incidentCol=spec.headers.indexOf('Incidències');
 if(incidentCol>=0)sh.getRange(`${col(incidentCol+1)}2:${col(incidentCol+1)}${end}`).conditionalFormats.add('notContainsBlanks',{format:{fill:'#FFF2CC',font:{color:'#7F6000'}}});
 for(let ci=0;ci<spec.headers.length;ci++)if(['Ordre','Files antigues','Part','Parts totals','Visuals analítics','Selectors','Suport i navegació','Objectes totals'].includes(spec.headers[ci]))sh.getRange(`${col(ci+1)}2:${col(ci+1)}${end}`).setNumberFormat('0');
 layout.push({sheet:spec.name,rows:spec.rows.length,tall});
 console.log('Built',spec.name,spec.rows.length,'rows',tall.length,'oversized');
}
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Sheet!A1:F3',include:'values,formulas',tableMaxRows:3,tableMaxCols:6,maxChars:1800})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1000})).ndjson);
await fs.writeFile('.work_diccionari/layout.json',JSON.stringify(layout,null,2));
const xlsx=await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(`${outputDir}/Diccionari_visuals_AiguesBarcelona_corregit.xlsx`);
console.log('EXPORTED');
// Render a representative opening range from every sheet, avoiding an unusable whole-sheet panorama.
for(const spec of data.sheets){
 const last=col(Math.min(spec.headers.length,spec.name==='Sheet'?6:spec.name==='Mesures'?3:spec.name==='DAX'?5:spec.name==='Controls'?5:spec.name==='Períodes'?3:spec.headers.length));
 const blob=await wb.render({sheetName:spec.name,range:`A1:${last}${spec.name==='Guia'?6:4}`,scale:1,format:'png'});
 await fs.writeFile(`.work_diccionari/preview_${spec.name}.png`,new Uint8Array(await blob.arrayBuffer()));
 console.log('RENDERED',spec.name);
}
console.log('DONE');
process.exit(0);
