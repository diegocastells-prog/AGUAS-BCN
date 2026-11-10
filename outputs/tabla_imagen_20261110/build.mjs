import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';
const raw = [
'15.604.707|12.902.213|153.894|13.056.107|164.172|9.386|13.229.664|84,78%|85,80%|2.375.043|26.415.811|84,00%|31.875|377.532|160.018.486|0,44%|0,23%|0,39%',
'14.321.448|11.900.194|120.768|12.020.962|166.477|8.765|12.196.204|85,16%|85,78%|2.125.244|26.490.047|85,50%|28.425|375.264|160.215.561|1,38%|1,76%|1,95%',
'15.833.964|13.278.590|114.748|13.393.338|204.097|4.817|13.602.252|85,91%|85,75%|2.231.712|26.617.835|85,65%|31.277|371.254|160.595.605|2,53%|2,56%|3,34%',
'15.407.844|12.989.340|159.523|13.148.863|154.376|11.522|13.314.761|86,42%|85,75%|2.093.082|26.730.332|86,25%|31.209|370.405|161.232.251|4,89%|5,10%|5,12%',
'16.407.697|13.828.494|158.113|13.986.607|169.052|3.171|14.158.830|86,29%|85,68%|2.248.867|26.964.839|86,75%|31.320|369.489|161.659.823|3,00%|3,18%|4,21%',
'16.452.762|13.813.255|161.499|13.974.754|200.464|23.969|14.199.187|86,30%|85,65%|2.253.575|27.077.117|86,75%|30.600|368.302|161.967.261|1,87%|2,05%|2,63%',
'17.158.055|14.441.989|176.751|14.618.740|215.151|7.827|14.841.718|86,50%|85,65%|2.316.337|27.182.344|86,50%|30.324|367.992|162.590.582|4,30%|4,41%|4,44%',
'15.326.161|12.833.309|156.679|12.989.988|176.714|13.796|13.180.498|86,00%|85,65%|2.145.662|27.256.545|86,00%|30.346|368.655|163.086.011|3,71%|3,70%|3,71%',
'16.239.191|13.628.981|145.000|13.773.981|183.232|8.511|13.965.704|86,00%|85,73%|2.273.487|27.169.275|86,00%|30.316|370.002|163.607.758|4,10%|4,18%|2,87%'
];
const data=raw.map(row=>row.split('|').map(v=>v.endsWith('%')?Number(v.slice(0,-1).replace(',','.'))/100:Number(v.replaceAll('.',''))));
const wb=Workbook.create(); const s=wb.worksheets.add('Datos 2026'); s.showGridLines=false;
s.getRange('A1:S1').merge(); s.getRange('A1').values=[['2026 — Datos de la imagen']];
s.getRange('A2:S2').merge(); s.getRange('A2').values=[['Fuente: imagen facilitada. Encabezados provisionales: no aparecen en la imagen.']];
s.getRange('A4:S4').values=[['Mes',...Array.from({length:18},(_,i)=>`Columna ${i+1}`)]];
const months=['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','des'];
const rows=months.map((m,i)=>[`${m}-26`,...(data[i]??Array(18).fill(null))]);
rows[9][12]=.86; rows[10][12]=.855; rows[11][12]=.845;
s.getRange('A5:S16').values=rows;
// Only the third numeric column plus the second reproduces the fourth exactly in every populated row.
if(!data.every(r=>r[1]+r[2]===r[3])) throw Error('Source relation mismatch');
for(let r=5;r<=13;r++) s.getRange(`E${r}`).formulas=[[`=SUM(C${r}:D${r})`]];
s.getRange('A1:S16').format.font={name:'Arial',size:10};
s.getRange('A1:S16').format.rowHeight=21;
s.getRange('A1:S16').format.columnWidth=14;
s.getRange('A1:S16').format.verticalAlignment='center';
s.getRange('A1').format.font={size:14,bold:true};
s.getRange('A2').format.font={size:10,color:'#666666'};
s.getRange('A4:S4').format={fill:'#E7E6E6',font:{bold:true},horizontalAlignment:'center',rowHeight:25};
s.getRange('B5:S16').setNumberFormat('#,##0');
for(const col of ['I','J','M','Q','R','S']) s.getRange(`${col}5:${col}16`).setNumberFormat('0.00%');
s.getRange('B5:S16').format.horizontalAlignment='right';
s.getRange('A5:A16').format.horizontalAlignment='center';
for(const range of ['C11:L13','N11:O13']) s.getRange(range).format.fill='#FFCC99';
for(const range of ['B14:L14','N14:O14','S5:S16']) s.getRange(range).format.fill='#FFFF00';
s.getRange('M5:M16').format.font.color='#FF0000';
s.getRange('C11:C13').format.font.color='#FF0000';
s.getRange('A4:S16').format.borders={preset:'all',style:'thin',color:'#D9D9D9'};
for(const col of ['A','B','C','D','E','F','G','H','J','L','M','O']) s.getRange(`${col}4:${col}16`).format.borders={right:{style:'thin',color:'#000000'}};
s.freezePanes.freezeColumns(1);
wb.recalculate();
console.log((await wb.inspect({kind:'region',sheetId:s.name,range:'A5:F7',maxChars:1200,tableMaxCols:6})).ndjson);
const out='outputs/tabla_imagen_20261110';
await (await SpreadsheetFile.exportXlsx(wb)).save(`${out}/Tabla_2026.xlsx`);
const preview=await wb.render({sheetName:s.name,range:'A1:S16',scale:1,format:'png'});
await fs.writeFile(`${out}/preview.png`,new Uint8Array(await preview.arrayBuffer()));
console.log('Saved Tabla_2026.xlsx');
