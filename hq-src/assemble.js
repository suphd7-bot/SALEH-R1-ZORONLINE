const fs=require('fs');
const core=JSON.parse(fs.readFileSync('db_core.json','utf8')),leg=JSON.parse(fs.readFileSync('legacy.json','utf8'));
const fm=fs.readFileSync('/home/claude/w/mod_fst.js','utf8').match(/const FST=(\[.*?\]);/s);
const fstat=JSON.parse(fm[1]).map(o=>({id:o.id,st:o.st,amt:o.amt,txt:o.txt}));
const now=Date.now();
const DB={meta:{updated:now,built:new Date(now).toISOString(),src:{
 sales:{file:'25 VS 26 YTD - SEP - R1 - Non Promoted.xlsx',at:now,label:'to Sep'},forecast:{file:'Q4 - 26 - Forecast - R1 - Per Item.xlsx',at:now,label:'Q4'},
 tracker:{file:'HQ_Tracker_Sun-Wed_120.xlsx',at:now,label:''},jjstock:{file:'Jamjoom_4-10-2026.xlsx',at:now,label:'4 Oct 2026'},fstatus:{file:'Q4 - 26 - Forecast - R1 - Per Item (1).xlsx',at:now,label:'25 Oct'}}},
 sales:core.sales,fc:core.fc,docs:core.docs,jj:core.jj,fstat,habib:leg.habib,dalM:leg.dalM,dal:leg.dal,hist:[]};
fs.writeFileSync('db.json',JSON.stringify(DB));
const esc=s=>s.replace(/<\/script/gi,'<\\/script');
const lib=esc(fs.readFileSync('node_modules/xlsx/dist/xlsx.full.min.js','utf8'));
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sales HQ · R1 Riyadh</title><meta name="description" content="Sales, forecast, doctors and stock dashboard for R1 Riyadh"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230b5fff'/%3E%3Cpath d='M7 22l6-7 5 4 7-10' stroke='%23fff' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"><style>${fs.readFileSync('app.css','utf8')}</style></head><body><header class="top"><div class="in"><div class="brand" onclick="location.hash='#/home'">Sales HQ<small>R1 Riyadh</small></div><nav id="nav"></nav><div id="fresh"></div></div></header><main id="app"></main>
<script>${lib}</script>
<script>${esc(fs.readFileSync('core.js','utf8'))}</script>
<script>const DB_EMBED=${esc(JSON.stringify(DB))};</script>
<script>${esc(fs.readFileSync('app1.js','utf8')+'\n'+fs.readFileSync('app2.js','utf8')+'\n'+fs.readFileSync('app3.js','utf8'))}</script></body></html>`;
fs.mkdirSync('/mnt/user-data/outputs/hq',{recursive:true});fs.writeFileSync('/mnt/user-data/outputs/hq/index.html',html);
console.log('size',html.length,'db',JSON.stringify(DB).length,'fstat',fstat.length);
