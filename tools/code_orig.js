
HDOC.vis.forEach(v=>D2.vis.push({d:v.d,k:v.k}));
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum=(a,i,j)=>a.slice(i==null?0:i,j==null?a.length:j).reduce((s,v)=>s+(Number(v)||0),0);
const fmt=n=>String(Math.round(n||0));
const Mn=v=>{v=Number(v)||0;const r=Math.round(Math.abs(v));return (v<0?'−':'')+r;};
const bx=n=>String(Math.round(n||0));
const ypc=(a,b)=>b>0?a/b-1:null;
const pS=v=>v==null?'—':(v>=0?'+':'−')+Math.abs(Math.round(v*100))+'%';
const p0=v=>v==null||!isFinite(v)?'—':Math.round(v*100)+'%';
const cls=v=>v==null?'':v>=0?'up':'dn';
const ach=(a,b)=>b>0?a/b:null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const MS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pad=n=>String(n).padStart(2,'0');
const dk=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TODAY=dk(new Date());
const dayLabel=k=>{const [y,m,d]=k.split('-').map(Number);const dt=new Date(y,m-1,d);return {n:DOW[dt.getDay()],d:d+' '+MS[m-1],long:DOW[dt.getDay()]+' '+d+' '+MS[m-1]};};
const RN={Saleh:'Saleh (you)',Dhai:'Dhai',Abdullah:'Abdullah',Razan:'Razan','Vacant Prima':'Vacant · Prima','Vacant Non-Promoted':'Vacant · Non-Promoted','Vacant Ciproxen':'Vacant · Ciproxen','Vacant Azi-Once':'Vacant · Azi-Once'};
const PN=n=>{n=String(n);const m=[[/ZORON 4.*Tablet|ZORON 4 MG TAB/i,'Zoron 4 Tab'],[/ZORON 8.*Tablet|ZORON 8 MG TAB/i,'Zoron 8 Tab'],[/ZORON Injection 4|ZORON 4 MG\/2ML/i,'Zoron 4 Inj'],[/ZORON Injection 8|ZORON 8 MG\/4ML/i,'Zoron 8 Inj'],[/MAXIM.*1X5|MAXIM 400 MG TAB 5/i,'Maxim 5s'],[/MAXIM.*1x7|MAXIM 400 MG TAB 7/i,'Maxim 7s'],[/MEVA 135/i,'Meva 135'],[/MEVA 200|MEVA SR/i,'Meva SR 200'],[/PALONOSETRON/i,'Palonosetron'],[/EMEDIUS/i,'Emedius']];for(const x of m)if(x[0].test(n))return x[1];return n.replace(/(\d),(\d{3})/g,'$1$2').replace(/\s+/g,' ').slice(0,28);};
// ---------- state
let S={done:{},log:{},notes:{},set:{real:100,w:{size:30,mom:15,opp:35,strat:20},lev:{},month:null},fc:{},fclog:[],fcsnap:[],dpin:{},manual:{}};
let READONLY=false,SHAREDATE='';
let UI={ex:{dim:'line',f:{},q:''},hab:{line:'all',q:''},docs:{org:'all',site:'all',cls:'all',st:'all',q:''},acc:{f:'all',q:'',sort:'score'},cat:{line:'all',q:''},day:{mode:'visits'},stk:{org:'all'},fc:{bk:'all'},lev:{},tier:{},plan:{tab:'overview'}};
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
function encState(){const dn=[];D2.vis.forEach((v,i)=>{if(S.done[v.d+'|'+v.k])dn.push(i);});const lg={};for(const d in S.log){const a=[];for(const i in S.log[d])a.push(+i,S.log[d][i]);if(a.length)lg[d]=a;}return b64e(JSON.stringify({t:TODAY,dn,lg,set:S.set,fc:S.fc,dpin:S.dpin}));}
function decState(s){const o=JSON.parse(b64d(s));const st={done:{},log:{},notes:{},set:o.set||S.set,fc:o.fc||{},fclog:[],fcsnap:[],dpin:o.dpin||{}};(o.dn||[]).forEach(i=>{const v=D2.vis[i];if(v)st.done[v.d+'|'+v.k]=1;});for(const d in (o.lg||{})){const a=o.lg[d];st.log[d]={};for(let j=0;j<a.length;j+=2)st.log[d][a[j]]=a[j+1];}return {st,t:o.t};}
let docRef=null,saveT=null;
function toast(m){const t=$('#toast');t.textContent=m||'Saved ✓';t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1300);}
function loadLocal(){try{const s=JSON.parse(localStorage.getItem('sales_hq_v2')||localStorage.getItem('dallah_state')||'null');if(s&&s.done&&s.log){S.done=s.done;S.log=s.log;S.notes=s.notes||{};S.fc=s.fc||{};S.fclog=s.fclog||[];S.fcsnap=s.fcsnap||[];S.dpin=s.dpin||{};S.manual=s.manual||{};if(s.set)S.set={...S.set,...s.set,w:{...S.set.w,...(s.set.w||{})},lev:s.set.lev||{}};}}catch(e){}}
function save(){if(READONLY)return;try{localStorage.setItem('sales_hq_v2',JSON.stringify(S));}catch(e){}clearTimeout(saveT);saveT=setTimeout(async()=>{if(docRef){try{await docRef.set(S);toast('Saved ✓');}catch(e){toast('Saved on this device');}}else toast('Saved on this device');},450);}
async function initDb(){if(READONLY||typeof claude==='undefined')return;try{const db=await claude.use('db');if(!db)return;docRef=db.doc('state/main');docRef.onSnapshot(s=>{if(s.exists){const r=s.data();if(r&&r.done&&r.log&&JSON.stringify(r)!==JSON.stringify(S)){S={done:r.done,log:r.log,notes:r.notes||{},set:{...S.set,...(r.set||{})},fc:r.fc||{},fclog:r.fclog||[],fcsnap:r.fcsnap||[],dpin:r.dpin||{},manual:r.manual||{}};render(true);}}},()=>{});}catch(e){docRef=null;}}
// ---------- months / days
const MONTHS=[{k:'2026-10',n:'October',i:0},{k:'2026-11',n:'November',i:1},{k:'2026-12',n:'December',i:2}];
function monthDays(k){const [y,m]=k.split('-').map(Number);const a=[];for(let d=new Date(y,m-1,1);d.getMonth()===m-1;d.setDate(d.getDate()+1)){if(d.getDay()<=4&&!(k==='2026-10'&&d.getDate()<4))a.push(dk(d));}return a;}
const curMonth=()=>S.set.month||(MONTHS.find(x=>TODAY.startsWith(x.k))||(TODAY>'2026-12'?MONTHS[2]:MONTHS[0])).k;
const pickDay=l=>l.includes(TODAY)?TODAY:(l.find(x=>x>=TODAY)||l[l.length-1]);
// ---------- charts
function svgMonthly(m26,m25,b26,n26,opt){opt=opt||{};const W=360,H=opt.h||165,pl=6,pb=22,pt=10,n=12,bw=(W-pl*2)/n;n26=n26==null?9:n26;
  const vals=[...m26.slice(0,n26),...(m25||[]),...(b26||[])].filter(v=>v!=null&&isFinite(v));const mx=Math.max(...vals,1)*1.1;const y=v=>pt+(H-pt-pb)*(1-Math.max(v,0)/mx);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" role="img">`;
  for(let i=0;i<n;i++){const x=pl+i*bw+bw*.15,w=bw*.7;
    if(i<n26&&m26[i]!=null)s+=`<rect x="${x}" y="${y(m26[i])}" width="${w}" height="${Math.max(0,H-pb-y(m26[i]))}" rx="3" fill="var(--brand2)"/>`;
    if(m25&&m25[i]>0)s+=`<line x1="${x-1}" x2="${x+w+1}" y1="${y(m25[i])}" y2="${y(m25[i])}" stroke="var(--warn)" stroke-width="2.5"/>`;
    if(b26&&b26[i]>0)s+=`<line x1="${x-1}" x2="${x+w+1}" y1="${y(b26[i])}" y2="${y(b26[i])}" stroke="var(--ok)" stroke-width="2" stroke-dasharray="3 2"/>`;
    if(opt.fc&&opt.fc[i]>0)s+=`<rect x="${x}" y="${y(opt.fc[i])}" width="${w}" height="${Math.max(0,H-pb-y(opt.fc[i]))}" rx="3" fill="var(--acc)" opacity=".45"/>`;
    s+=`<text x="${pl+i*bw+bw/2}" y="${H-7}" text-anchor="middle" font-size="9.5" fill="var(--mute)">${MS[i]}</text>`;}
  return s+'</svg>';}
const legend=(fc)=>`<div class="note"><span class="dot" style="background:var(--brand2)"></span>2026 actual <span class="dot" style="background:var(--warn);margin-left:8px"></span>2025 <span class="dot" style="background:var(--ok);margin-left:8px"></span>Target${fc?'<span class="dot" style="background:var(--acc);margin-left:8px"></span>Forecast':''}</div>`;
function ring(pct,size,label,sub){size=size||130;const r=size/2-11,c=2*Math.PI*r,p=clamp(pct,0,1);const col=pct>=.75?'#4ade80':pct>=.55?'#fbbf24':'#f87171';
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="11"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="${sub?'48%':'54%'}" text-anchor="middle" fill="#fff" font-size="${size*.27}" font-weight="800">${label}</text>${sub?`<text x="50%" y="66%" text-anchor="middle" fill="#fff" opacity=".8" font-size="${size*.1}">${sub}</text>`:''}</svg>`;}
function bridgeSvg(segs,target){const W=360,H=100,tot=Math.max(sum(segs.map(s=>s[1])),target)*1.06;const x=v=>6+(W-12)*v/tot;let c=0,s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">`;
  segs.forEach(g=>{const w=Math.max(0,x(c+g[1])-x(c));s+=`<rect x="${x(c)}" y="26" width="${w}" height="30" fill="${g[2]}"/>`;if(w>40)s+=`<text x="${x(c)+w/2}" y="46" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">${Mn(g[1])}</text>`;c+=g[1];});
  s+=`<line x1="${x(target)}" x2="${x(target)}" y1="14" y2="64" stroke="var(--bad)" stroke-width="2.5"/><text x="${x(target)}" y="10" text-anchor="middle" font-size="10" fill="var(--bad)" font-weight="700">Target ${Mn(target)}</text>`;
  let lx=6;segs.forEach(g=>{s+=`<rect x="${lx}" y="78" width="9" height="9" fill="${g[2]}"/><text x="${lx+12}" y="86" font-size="10" fill="var(--mute)">${g[0]}</text>`;lx+=80;});return s+'</svg>';}
function scatterSvg(pts,opt){const W=360,H=300,L=34,B=30,T=14,R=10;const sx=v=>L+(W-L-R)*v,sy=v=>T+(H-T-B)*(1-v);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">`;
  s+=`<rect x="${sx(0)}" y="${sy(1)}" width="${sx(.5)-sx(0)}" height="${sy(.5)-sy(1)}" fill="var(--badbg)" opacity=".5"/><rect x="${sx(.5)}" y="${sy(1)}" width="${sx(1)-sx(.5)}" height="${sy(.5)-sy(1)}" fill="var(--okbg)" opacity=".6"/>`;
  s+=`<line x1="${sx(.5)}" x2="${sx(.5)}" y1="${sy(1)}" y2="${sy(0)}" stroke="var(--line)"/><line x1="${sx(0)}" x2="${sx(1)}" y1="${sy(.5)}" y2="${sy(.5)}" stroke="var(--line)"/>`;
  s+=`<text x="${sx(.02)}" y="${sy(.97)}" font-size="9.5" fill="var(--bad)" font-weight="700">${opt.q1}</text><text x="${sx(.98)}" y="${sy(.97)}" text-anchor="end" font-size="9.5" fill="var(--ok)" font-weight="700">${opt.q2}</text><text x="${sx(.02)}" y="${sy(.03)}" font-size="9.5" fill="var(--mute)">${opt.q3}</text><text x="${sx(.98)}" y="${sy(.03)}" text-anchor="end" font-size="9.5" fill="var(--mute)">${opt.q4}</text>`;
  pts.forEach(p=>{s+=`<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${p.r||5}" fill="${p.c||'var(--brand2)'}" opacity=".75" ${p.go?`data-go="${esc(p.go)}" style="cursor:pointer"`:''}><title>${esc(p.t||'')}</title></circle>`;});
  s+=`<text x="${W/2}" y="${H-6}" text-anchor="middle" font-size="10" fill="var(--mute)">${opt.xl}</text><text x="10" y="${H/2}" font-size="10" fill="var(--mute)" transform="rotate(-90 10 ${H/2})" text-anchor="middle">${opt.yl}</text>`;
  return s+'</svg>';}
const hbar=(pct,c)=>`<div class="bar ${c||''}"><i style="width:${clamp(pct*100,0,100)}%"></i></div>`;
const RAG=v=>v>=75?'ok':v>=55?'warn':'bad';
const ragWord={ok:'On track',warn:'Watch',bad:'At risk'};
const pill=(t,c)=>`<span class="pill p-${c}">${t}</span>`;
function bucket(c){if(c.fc<=0)return null;if(c.q425<=0)return 'new';const r=c.fc/c.q425;return r<=1?'commit':r<=1.5?'best':'stretch';}
const BK={commit:['Commit','ok'],best:['Best case','warn'],stretch:['Stretch','bad'],new:['No history','idle']};
const BKW={commit:.95,best:.8,stretch:.5,new:.3};

// ---------- model
let MODEL=null;const M=()=>MODEL||(MODEL=build());
const PRICE_BY_PN={};Object.keys(SALES.price).forEach(k=>PRICE_BY_PN[PN(k)]=SALES.price[k].net_w);
const HP=HAB.habib.prods;
const hsum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
function hAgg(list){const u26=hsum(list,p=>sum(p.um26)),u25=hsum(list,p=>sum(p.um25));return {n:list.length,u26,u25,yoy:ypc(u26,u25),so:hsum(list,p=>p.so),si:hsum(list,p=>p.si),gap:hsum(list,p=>p.si-p.so),fv:hsum(list,p=>p.fv),fu:hsum(list,p=>p.fu)};}
function lineCalc(L){const y=sum(L.m26,0,9),y25=sum(L.m25,0,9),b=sum(L.b26,0,9),fb=sum(L.b26),q425=sum(L.m25,9,12);return {L,y,y25,b,fb,q425,need:Math.max(fb-y,0),ach:ach(y,b),yoy:ypc(y,y25),mult:q425>0?Math.max(fb-y,0)/q425:null};}
function dallahCalc(){const D=SALES.dallah;const keys=['hosp','care','cp','nmr'];const m26=Array(12).fill(0),m25=Array(12).fill(0);keys.forEach(k=>{D[k].m26.forEach((v,i)=>m26[i]+=v);D[k].m25.forEach((v,i)=>m25[i]+=v);});
  return {m26,m25,y26:sum(m26,0,9),y25:sum(m25,0,9),ents:keys.map(k=>({k,y26:sum(D[k].m26,0,9),y25:sum(D[k].m25,0,9)})),fq4:{hosp:sum(SALES.fdal.hosp),care:sum(SALES.fdal.care)}};}
function dayCalc(){ // Dallah daily boxes for selected month
  const mk=curMonth(),days=monthDays(mk),n=days.length,mi=MONTHS.find(x=>x.k===mk).i;
  const items=D2.items.map((it,i)=>{let a=0;for(const d of days)a+=Number((S.log[d]||{})[i]||0);return {...it,i,target:it.t[mi],actual:a};});
  const dData=days.filter(d=>Object.values(S.log[d]||{}).some(v=>Number(v)>0)).length;
  const target=sum(items.map(x=>x.target)),actual=sum(items.map(x=>x.actual));
  items.forEach(x=>{x.proj=(dData>0&&x.target>0)?x.actual/dData*n/x.target:null;x.st=(x.cover!=null&&x.cover<1)?'low':(x.proj==null?'idle':(x.proj<.85?'behind':'ok'));});
  const proj=dData>0?actual/dData*n/target:null,need=(n-dData)>0?Math.max(target-actual,0)/(n-dData):null;
  const mv=D2.vis.filter(v=>v.d.startsWith(mk));
  return {mk,days,n,mi,items,dData,target,actual,proj,need,vTot:mv.length,vDone:mv.filter(v=>S.done[v.d+'|'+v.k]).length};}

// ---------- editable forecast layer (boxes)
const FX={rows:FCX.rows.map(r=>({a:r[0],p:r[1],pn:PN(r[1]),price:r[2],o:[r[3],r[4],r[5]]}))};
const fxKey=r=>r.a+'|'+r.pn;
const fxEff=r=>{const e=S.fc&&S.fc[fxKey(r)];return e?e.map(x=>Math.max(0,Math.round(Number(x)||0))):r.o.map(x=>Math.round(x));};
const ACCI={};SALES.cust.forEach(c=>{ACCI[c.id]=c;});
D2.items.forEach(it=>{it.t0=it.t.slice();});
function applyFx(){
  const by={};FX.rows.forEach(r=>{r.e=fxEff(r);r.tot=sum(r.e);r.o0=sum(r.o.map(Math.round));(by[r.a]=by[r.a]||[]).push(r);});
  SALES.cust.forEach(c=>{const rs=by[c.id]||[];c.fb=[0,0,0];c.fcm=[0,0,0];const fp=[];
    rs.forEach(r=>{for(let i=0;i<3;i++){c.fb[i]+=r.e[i];c.fcm[i]+=r.e[i]*r.price;}if(r.tot>0)fp.push([r.p,r.e[0]*r.price,r.e[1]*r.price,r.e[2]*r.price,r.tot,r.e]);});
    c.fc=sum(c.fcm);c.fbT=sum(c.fb);c.fb0=sum(rs.map(r=>r.o0));c.fprods=fp.sort((a,b)=>sum(b.slice(1,4))-sum(a.slice(1,4)));});
  SALES.prods.forEach(p=>{const nm=PN(p.p);const rs=FX.rows.filter(r=>r.pn===nm);p.fc=[0,1,2].map(i=>sum(rs.map(r=>r.e[i]*r.price)));p.fu=[0,1,2].map(i=>sum(rs.map(r=>r.e[i])));});
  SALES.fdal.hosp=(ACCI['105301310003']||{fcm:[0,0,0]}).fcm.slice();SALES.fdal.care=(ACCI['435040']||{fcm:[0,0,0]}).fcm.slice();
  D2.items.forEach(it=>{const acc=it.place==='Pharmacies'?'435040':'105301310003';const r=FX.rows.find(x=>x.a===acc&&x.pn===it.item);
    it.t=it.t0.map((v,i)=>{if(!r)return v;const o=Math.round(r.o[i]);return o>0?Math.round(v*r.e[i]/o):v;});it.target=it.t[0];});}
const GROUPS=[
 {id:'dallah',acc:['105301310003'],name:'Dallah Hospital',f:d=>d.o==='Dallah'&&/DALLAH HOSPITAL/i.test(d.h)},
 {id:'riaya',acc:['435040'],name:"Ri'aya Dallah (split to Dallah Clinics doctors — assumption)",f:d=>/Dallah Clinics/i.test(d.h)},
 {id:'habib',acc:['105301120009'],name:'Al Habib',f:d=>d.o==='Habib'},
 {id:'fakeeh',acc:['369033'],name:'Fakeeh Hospital',f:d=>/FAKEEH/i.test(d.h)},
 {id:'rabia',acc:['105301310023'],name:'Rabia Hospital',f:d=>/RABIA/i.test(d.h)},
 {id:'hamadi',acc:['105301310001'],name:'Al Hamaday Hospital',f:d=>/AL HAMADAY/i.test(d.h)},
 {id:'osra',acc:['105301310008'],name:'Al Osra Hospital',f:d=>/AL OSRA/i.test(d.h)}];
const WIDX={'Zoron 4 Tab':0,'Zoron 8 Tab':1,'Zoron 4 Inj':2,'Zoron 8 Inj':3,'Maxim 5s':4,'Maxim 7s':5,'Meva SR 200':6,'Meva 135':6};
const DOCP=['Zoron 4 Tab','Zoron 8 Tab','Zoron 4 Inj','Zoron 8 Inj','Maxim 5s','Maxim 7s','Meva SR 200','Meva 135'];
function splitInt(total,w){const s=sum(w);if(!(total>0)||!(s>0))return w.map(()=>0);const raw=w.map(x=>total*x/s),fl=raw.map(Math.floor);let rem=Math.round(total)-sum(fl);const ord=raw.map((x,i)=>[x-fl[i],i]).sort((a,b)=>b[0]-a[0]);for(let k=0;k<rem;k++)fl[ord[k%ord.length][1]]++;return fl;}
function docWeight(d,pn){const wt=(TERR.W[d.sp]||TERR.W.GP)[WIDX[pn]];return (wt||0)*(d.c==='A'?2:1);}
function pinOf(r,d){const v=S.dpin&&S.dpin[r.a+'|'+r.pn+'|'+d.id];return v==null||v===''?null:Math.max(0,Math.round(Number(v)||0));}
function allocRow(r,docs,Bm,manual){
  const B=Bm||r.e;const pins=docs.map(d=>pinOf(r,d));
  const pinM=pins.map(p=>p==null?null:(r.tot>0?splitInt(p,r.e):[0,0,0]));
  if(manual){const parts=docs.map((d,j)=>({d,e:pinM[j]?pinM[j].slice():[0,0,0],pin:pins[j]}));const over=[0,0,0],rem=[0,0,0];for(let i=0;i<3;i++){const s=sum(parts.map(x=>x.e[i]));rem[i]=B[i]-s;if(rem[i]<0)over[i]=-rem[i];}return {parts,over,rem};}
  const parts=docs.map((d,j)=>({d,e:[0,0,0],pin:pins[j]}));const over=[0,0,0];
  for(let i=0;i<3;i++){
    const pinSum=sum(pinM.map(x=>x?x[i]:0));let rem=B[i]-pinSum;if(rem<0){over[i]=-rem;rem=0;}
    const idx=docs.map((d,j)=>j).filter(j=>pins[j]==null);
    let w=idx.map(j=>docWeight(docs[j],r.pn));if(!(sum(w)>0))w=idx.map(j=>docs[j].c==='A'?2:1);
    const a=idx.length?splitInt(rem,w):[];idx.forEach((j,k)=>{parts[j].e[i]=a[k];});
    pins.forEach((p,j)=>{if(p!=null)parts[j].e[i]=pinM[j][i];});}
  return {parts,over,rem:[0,0,0]};}
function allocate(m){
  m.docs.forEach(d=>{d.fcx={};d.fcxI={};d.fcm=[0,0,0];d.fcT=0;d.fcV=0;d.fcD=0;d.fcI=0;d.grp=null;d.byPlace={};});
  const groups=[],places=[],used=new Set();
  const addPart=(d,r,e,ind)=>{const tgt=ind?d.fcxI:d.fcx;const f=tgt[r.pn]=tgt[r.pn]||[0,0,0];const bp=d.byPlace[r.a]=d.byPlace[r.a]||{ind:!!ind,rows:{}};const g=bp.rows[r.pn]=bp.rows[r.pn]||[0,0,0];for(let i=0;i<3;i++){f[i]+=e[i];g[i]+=e[i];d.fcm[i]+=e[i];}const s=sum(e);d.fcT+=s;d.fcV+=s*r.price;if(ind)d.fcI+=s;else d.fcD+=s;};
  GROUPS.forEach(g=>{
    const docs=m.docs.filter(g.f);docs.forEach(d=>{d.grp=g.id;});
    const rows=FX.rows.filter(r=>g.acc.includes(r.a)&&r.tot>0&&WIDX[r.pn]!=null);
    let tot=0,totV=0;const prow=[];
    rows.forEach(r=>{let parts=[],over=[0,0,0],rem=[0,0,0];
      if(!docs.length){prow.push({r,parts:[],over:[0,0,0],rem:[0,0,0]});return;}
      if(g.id==='dallah'){const nak=docs.filter(d=>/nakheel/i.test(d.h)),nym=docs.filter(d=>!/nakheel/i.test(d.h));
        const tn=(D2.items.find(x=>x.place==='Nakheel'&&x.item===r.pn)||{t0:[0,0,0]}).t0,tm=(D2.items.find(x=>x.place==='Namar'&&x.item===r.pn)||{t0:[0,0,0]}).t0;
        const bn=[0,0,0],bm=[0,0,0];for(let i=0;i<3;i++){const s=splitInt(r.e[i],[tn[i]+tm[i]>0?tn[i]:nak.length,tn[i]+tm[i]>0?tm[i]:nym.length]);bn[i]=s[0];bm[i]=s[1];}
        const mn=!!(S.manual&&S.manual[r.a]);const A1=allocRow(r,nak,bn,mn),A2=allocRow(r,nym,bm,mn);parts=[...A1.parts,...A2.parts];over=[0,1,2].map(i=>A1.over[i]+A2.over[i]);rem=[0,1,2].map(i=>A1.rem[i]+A2.rem[i]);}
      else{const A=allocRow(r,docs,null,!!(S.manual&&S.manual[r.a]));parts=A.parts;over=A.over;rem=A.rem;}
      parts.forEach(p=>{addPart(p.d,r,p.e,false);tot+=sum(p.e);totV+=sum(p.e)*r.price;});
      prow.push({r,parts,over,rem});});
    g.acc.forEach(a=>used.add(a));
    groups.push({...g,docs,rows,boxes:sum(rows.map(r=>r.tot)),alloc:tot,value:totV});
    g.acc.forEach(a=>places.push({acc:a,name:accNameById(a),direct:true,group:g.id,docs,prow,boxes:sum(rows.map(r=>r.tot)),orig:sum(FX.rows.filter(x=>x.a===a).map(x=>x.o0))}));});
  const chAccs=[...new Set(FX.rows.filter(r=>!used.has(r.a)&&(r.tot>0||r.o0>0)).map(r=>r.a))];
  chAccs.forEach(a=>{const rows=FX.rows.filter(r=>r.a===a&&r.tot>0&&WIDX[r.pn]!=null);const prow=[];
    rows.forEach(r=>{const A=allocRow(r,m.docs,null,!!(S.manual&&S.manual[r.a]));A.parts.forEach(p=>addPart(p.d,r,p.e,true));prow.push({r,parts:A.parts,over:A.over,rem:A.rem});});
    places.push({acc:a,name:accNameById(a),direct:false,group:'indirect',docs:m.docs,prow,boxes:sum(rows.map(r=>r.tot)),orig:sum(FX.rows.filter(x=>x.a===a).map(x=>x.o0))});});
  const ch=FX.rows.filter(r=>!used.has(r.a)&&r.tot>0);
  m.alloc={groups,places:places.sort((x,y)=>y.boxes-x.boxes),channel:ch,channelBoxes:sum(ch.map(r=>r.tot)),totalBoxes:sum(FX.rows.map(r=>r.tot)),origBoxes:sum(FX.rows.map(r=>r.o0)),directBoxes:sum(groups.map(g=>g.alloc)),indirectBoxes:sum(ch.filter(r=>WIDX[r.pn]!=null).map(r=>r.tot))};}
function build(){
  applyFx();
  const real=S.set.real/100;
  const SA=SALES.team.find(x=>x.rep==='Saleh');
  const T={m26:SA.m26,m25:SA.m25,b26:SA.b26,ytd26:sum(SA.m26,0,9),ytd25:sum(SA.m25,0,9),bgY:sum(SA.b26,0,9),bgFY:sum(SA.b26),bgQ4:sum(SA.b26,9,12),q425:sum(SA.m25,9,12),fy25:sum(SA.m25)};
  T.fcQ4=SALES.prods.reduce((s,p)=>s+sum(p.fc),0);T.ach=T.bgY?T.ytd26/T.bgY:0;T.yoy=ypc(T.ytd26,T.ytd25);T.gap=T.bgFY-T.ytd26;T.uplift=T.q425>0?T.fcQ4/T.q425:null;
  const acc=SALES.cust.map(c=>{const ytT=sum(c.tm,0,9),fyT=sum(c.tm),q4T=sum(c.tm,9,12);return Object.assign({},c,{ytT,fyT,q4T,ach:ach(c.y26,ytT),yoy:ypc(c.y26,c.y25),bk:bucket(c),share:T.ytd26>0?Math.max(c.y26,0)/T.ytd26:0});});
  const bk={commit:0,best:0,stretch:0,new:0},bkm={commit:[0,0,0],best:[0,0,0],stretch:[0,0,0],new:[0,0,0]};
  acc.forEach(c=>{if(c.bk){bk[c.bk]+=c.fc;c.fcm.forEach((v,i)=>bkm[c.bk][i]+=v);}});
  const bkB={commit:0,best:0,stretch:0,new:0},bkmB={commit:[0,0,0],best:[0,0,0],stretch:[0,0,0],new:[0,0,0]};
  acc.forEach(c=>{if(c.bk){bkB[c.bk]+=c.fbT;c.fb.forEach((v,i)=>bkmB[c.bk][i]+=v);}});
  const weighted=Object.keys(bk).reduce((s,k)=>s+bk[k]*BKW[k],0);
  const out=T.ytd26+T.fcQ4*real,o=out/T.bgFY,left=Math.max(T.bgFY-out,0);
  const wOut=T.ytd26+weighted,wo=wOut/T.bgFY;
  const P=SALES.prods.map(p=>({p:p.p,name:PN(p.p),y:sum(p.m26,0,9),y25:sum(p.m25,0,9),yt:sum(p.b26,0,9),fb:sum(p.b26),fc:sum(p.fc),q4b:sum(p.b26,9,12),q425:sum(p.m25,9,12),fcm:p.fc,b26:p.b26,m26:p.m26,m25:p.m25})).filter(p=>Math.abs(p.y)+p.fb+p.fc>0).sort((a,b)=>b.fb-a.fb);
  P.forEach(p=>{p.out=p.y+p.fc*real;p.o=p.fb>0?p.out/p.fb:null;p.gapOut=Math.max(p.fb-p.out,0);});
  const hAll=hAgg(HP),hid=HAB.habib.id,hAcc=acc.find(c=>c.id===hid);
  const hG2=HP.filter(p=>p.line==='GIT 2');const hg2gap=hsum(hG2,p=>p.si-p.so);
  const day=dayCalc();
  const lines=SALES.lines.map(lineCalc).sort((a,b)=>b.fb-a.fb);
  const reps=SALES.team.map(r=>{const y=sum(r.m26,0,9),l=sum(r.m25,0,9),b=sum(r.b26,0,9),fy=sum(r.b26);return {rep:r.rep,y,l,b,fy,ach:ach(y,b),yoy:ypc(y,l),need:Math.max(fy-y,0),m26:r.m26,m25:r.m25,b26:r.b26};}).filter(r=>r.fy>0||r.y!==0).sort((a,b)=>b.y-a.y);
  const m={real,T,acc,bk,bkm,bkB,bkmB,weighted,wOut,wo,out,o,left,P,hAll,hAcc,hid,hg2gap,day,lines,reps};
  tierAccounts(m);
  m.dal=dallahCalc();
  // doctors
  docsAlloc(m);
  m.terr={goal:sum(TERR.hosp.map(h=>h.goal)),act:sum(TERR.hosp.map(h=>h.act))};
  m.health=buildHealth(m);
  const lazy=(k,f)=>{let v,done=false;Object.defineProperty(m,k,{get(){if(!done){v=f();done=true;}return v;},enumerable:true,configurable:true});};
  lazy('levers',()=>buildLevers(m));lazy('actions',()=>buildActions(m));lazy('insights',()=>buildInsights(m));lazy('hygiene',()=>buildHygiene(m));
  return m;}
let DOCCACHE={k:null,docs:null,alloc:null};
function docsAlloc(m){const k=JSON.stringify([S.fc,S.dpin,S.manual,Object.keys(S.done).join(',')]);if(DOCCACHE.k===k){m.docs=DOCCACHE.docs;m.alloc=DOCCACHE.alloc;return;}m.docs=buildDocs();allocate(m);DOCCACHE={k,docs:m.docs,alloc:m.alloc};}
// ---------- tiering
function tierAccounts(m){
  const w=S.set.w,W=w.size+w.mom+w.opp+w.strat||1;const acc=m.acc;
  const mxS=Math.max(...acc.map(c=>Math.max(c.y26,c.fc,0)),1),mxO=Math.max(...acc.map(c=>Math.max(c.fc,c.q4T)),1);
  acc.forEach(c=>{
    c.sSize=100*Math.sqrt(Math.max(c.y26,c.fc,0)/mxS);
    c.sMom=c.y25<=0?(c.y26>0?80:30):clamp(50+(c.yoy||0)*50,0,100);
    c.sOpp=100*Math.sqrt(Math.max(c.fc,c.q4T)/mxO);
    c.sStrat=({'HOSPITALS':100,'MEDIUM CAHIN':65,'BIG CHAIN PHARMACIES':75,'POLYCLINIC':60,'SUBAGENT':45}[c.sub]||40);
    c.score=(c.sSize*w.size+c.sMom*w.mom+c.sOpp*w.opp+c.sStrat*w.strat)/W;
    c.tier=c.score>=62?1:c.score>=45?2:c.score>=28?3:4;
    c.flags=[];
    if(c.q4T>0&&c.fc<c.q4T*.7)c.flags.push('Forecast below Q4 target');
    if(c.bk==='stretch'||c.bk==='new')c.flags.push('Forecast not proven');
    if(c.yoy!=null&&c.yoy<-.3&&c.y25>20000)c.flags.push('Declining vs 2025');
    if(c.id===m.hid&&m.hAll.gap/m.hAll.si>.25)c.flags.push('Overstock at customer');
  });
}
const TIERN={1:['Tier 1','ok','Visit/contact weekly · own the relationship'],2:['Tier 2','info','Every 2 weeks · protect and grow'],3:['Tier 3','warn','Monthly · efficient coverage'],4:['Tier 4','idle','Reactive · low-cost channel']};
// ---------- doctors (territory)
function buildDocs(){
  const dallahBoxes={};D2.docs.forEach(d=>{dallahBoxes[d.n.toUpperCase()]=d;});
  const habBy={};HDOC.docs.forEach(d=>{habBy[d.n.toUpperCase()]=d;});
  return TERR.docs.map(d=>{
    const key=(d.o==='Habib'?'HAB|':'')+d.n;
    const wt=TERR.W[d.sp]||TERR.W.GP,rel=(wt.reduce((a,b)=>a+b,0)||0)/7,inf=rel*0.55+(d.c==='A'?0.45:0.12);
    const hd=d.o==='Habib'?habBy[d.n.toUpperCase()]:null,dd=d.o==='Dallah'?dallahBoxes[d.n.toUpperCase()]:null;
    const o={...d,inf,infN:Math.min(inf,1),eng:d.goal>0?d.act/d.goal:0,dal:dd||null};
    const visKey=d.o==='Habib'?'HAB|'+d.n:(dd?dd.h+'|'+dd.n:null);
    o.vkey=visKey;o.planned=visKey?D2.vis.filter(v=>v.k===visKey).length:0;o.seen=visKey?D2.vis.filter(v=>v.k===visKey&&S.done[v.d+'|'+v.k]).length:0;
    o.id=d.o+'|'+d.n;o.priority=o.infN*(1-Math.min(o.eng,1));
    return o;});}
// ---------- health
function buildHealth(m){
  const T=m.T;
  const outlook=clamp((m.o-.6)/.4,0,1)*100;
  const fqual=T.fcQ4>0?clamp((m.bk.commit+m.bk.best)/T.fcQ4,0,1)*100:50;
  const topShare=Math.max(...m.acc.map(c=>c.share));
  const conc=clamp(100-((topShare-.15)/.4)*100,0,100);
  const cover=clamp(m.terr.act/m.terr.goal/.9,0,1)*100;
  const low=m.day.items.filter(x=>x.st==='low').length,ov=m.hAll.si>0?m.hAll.gap/m.hAll.si:0;
  const supply=clamp(100-low*9-ov*80,0,100);
  const comp=[
    {k:'Target outlook',v:outlook,w:.4,txt:`Closing at ${p0(m.o)} of annual target at ${S.set.real}% forecast realization`},
    {k:'Forecast quality',v:fqual,w:.2,txt:`${p0(fqual/100)} of Q4 forecast is backed by last year's run-rate`},
    {k:'Concentration',v:conc,w:.1,txt:`Top account = ${p0(topShare)} of YTD sales`},
    {k:'Customer coverage',v:cover,w:.15,txt:`HQ visits ${m.terr.act}/${m.terr.goal} (${p0(m.terr.act/m.terr.goal)})`},
    {k:'Supply & stock',v:supply,w:.15,txt:`${low} Dallah items under 1 month cover · Habib overstock ${p0(ov)}`}];
  const score=sum(comp.map(c=>c.v*c.w));
  const st=RAG(score);
  const worst=[...comp].sort((a,b)=>a.v-b.v)[0];
  return {score,st,comp,worst};}
// ---------- levers & actions
function buildLevers(m){
  const L=[];const T=m.T;
  m.acc.filter(c=>(c.bk==='stretch'||c.bk==='new')&&c.fc>=120000).sort((a,b)=>b.fc-a.fc).forEach(c=>L.push({id:'p'+c.id,type:'protect',title:`Lock in the Q4 order: ${c.n.trim()}`,amt:c.fc,prob:.7,effort:'M',owner:'You + customer',acc:c.id,how:c.q425>0?`Forecast is ${(c.fc/c.q425).toFixed(1)}× its Q4-2025 sales. Get a written order plan with dates and quantities.`:`No 2026 history and no Q4-2025 sales. Get a written commitment (PO or schedule) before counting on it.`}));
  if(m.hAll.gap>0){const hf=m.hAcc?m.hAcc.fc:0;L.push({id:'p-hab',type:'protect',title:'Reconcile Habib overstock before pushing new orders',amt:Math.min(hf,m.hg2gap),prob:.6,effort:'S',owner:'You + Habib pharmacy',acc:m.hid,how:`Sell-in exceeds Sell-out by ${Mn(m.hAll.gap)} (${p0(m.hAll.gap/m.hAll.si)}). Agree order timing against actual consumption so the ${Mn(hf)} Q4 forecast is not cut.`});}
  const low=m.day.items.filter(x=>x.st==='low');
  if(low.length){const v=sum(low.map(x=>x.target*(PRICE_BY_PN[x.item]||30)));L.push({id:'p-sup',type:'protect',title:`Fix supply: ${low.length} Dallah items under 1 month of cover`,amt:v,prob:.8,effort:'S',owner:'Supply chain',how:'Ask supply to confirm shipments for: '+low.map(x=>x.place+' '+x.item).join(', ')+'. A stock-out loses a month of sales.'});}
  m.acc.filter(c=>c.q4T>0&&c.fc<c.q4T*.8&&c.fyT>100000).sort((a,b)=>(b.q4T-b.fc)-(a.q4T-a.fc)).slice(0,6).forEach(c=>L.push({id:'g'+c.id,type:'grow',title:`Close the forecast gap at ${c.n.trim()}`,amt:c.q4T-c.fc,prob:.25,effort:c.q4T-c.fc>300000?'L':'M',owner:'You',acc:c.id,how:`Account target for Q4 is ${Mn(c.q4T)} but forecast is ${Mn(c.fc)}. Identify the missing items/branches and agree extra volume.`}));
  m.P.filter(p=>p.fb>0&&p.o!=null&&p.o<.8).sort((a,b)=>b.gapOut-a.gapOut).slice(0,3).forEach(p=>L.push({id:'gp'+p.name,type:'grow',title:`Push ${p.name} — outlook ${p0(p.o)} of its target`,amt:p.gapOut,prob:.2,effort:'M',owner:'You',how:`YTD ${Mn(p.y)} + forecast ${Mn(p.fc*m.real)} reaches ${p0(p.o)} of its ${Mn(p.fb)} annual target. Focus detailing and contract volume here.`}));
  const dr=Math.max(1-m.real,.3);L.forEach(l=>{l.ev=l.type==='grow'?l.amt*l.prob:l.amt*dr*l.prob;l.sel=!!S.set.lev[l.id];});
  return L;}
function buildActions(m){
  const A=[];
  m.levers.forEach(l=>{A.push({title:l.title,why:l.how,impact:l.amt,effort:l.effort,owner:l.owner,type:l.type,go:l.acc?'account/'+l.acc:(l.id==='p-sup'?'daily':'plan'),due:l.type==='protect'?'This week':'This month'});});
  const A_unseen=m.docs.filter(d=>d.o==='Habib'&&d.c==='A'&&d.act===0).map(d=>({...d,value:d.fcV}));
  if(A_unseen.length)A.push({title:`Visit ${A_unseen.length} Class A Habib doctors with zero visits this cycle`,why:'Al Hamra has the weakest HQ coverage. Their share of the Q4 forecast is '+bx(sum(A_unseen.map(d=>d.fcT)))+' boxes.',impact:sum(A_unseen.map(d=>d.value||0)),effort:'S',owner:'You',type:'coverage',go:'doctors',due:'This week'});
  const dA=m.docs.filter(d=>d.o==='Dallah'&&d.c==='A'&&d.act===0).length;
  if(dA)A.push({title:`${dA} Class A Dallah doctors have no HQ visit yet`,why:'Dallah hospital is behind its Q4 account target. Visit the highest-influence prescribers first (Stakeholders → Priority list).',impact:0,effort:'M',owner:'You',type:'coverage',go:'stakeholders',due:'This week'});
  A.push({title:'Confirm what the Habib 1591000 objective means',why:`If it is required sell-in, the Sep–Dec forecast (${Mn(m.hAll.fv)}) covers ${p0(m.hAll.fv/HAB.habib.m.obj)}. If the ${Mn(m.hAll.gap)} overstock is deducted, only ${p0((m.hAll.fv-m.hAll.gap)/HAB.habib.m.obj)}.`,impact:m.hAll.gap,effort:'S',owner:'Manager',type:'clarify',go:'habib',due:'Today'});
  return A.sort((a,b)=>b.impact-a.impact);}
// ---------- insights (synthesis)
function buildInsights(m){
  const I=[],T=m.T;
  const top=[...m.acc].sort((a,b)=>b.y26-a.y26)[0],top3=sum([...m.acc].sort((a,b)=>b.y26-a.y26).slice(0,3).map(c=>Math.max(c.y26,0)))/Math.max(T.ytd26,1);
  I.push({theme:'Concentration',sev:top.share>.35?'bad':'warn',head:`${top.n.trim()} is ${p0(top.share)} of your sales; top 3 accounts = ${p0(top3)}`,ev:`${top.n.trim()}: ${Mn(top.y26)} YTD (${pS(top.yoy)} vs 2025) and ${Mn(top.fc)} of Q4 forecast.`,so:'One buying decision can move your year. Protect these accounts first and build a second leg.',act:'Account plan + exec sponsor for the top 3; keep Tier 1 cadence weekly.',go:'account/'+top.id,conf:'High'});
  I.push({theme:'Overstock',sev:m.hAll.gap/m.hAll.si>.25?'bad':'warn',head:`Habib bought ${Mn(m.hAll.gap)} more than it consumed (${p0(m.hAll.gap/m.hAll.si)} of sell-in)`,ev:`Sell-in ${Mn(m.hAll.si)} vs sell-out ${Mn(m.hAll.so)} Jan–Aug. In your GIT 2 line the gap is ${Mn(m.hg2gap)}.`,so:'The warehouse can skip orders until stock clears, which puts the Habib part of your Q4 forecast at risk.',act:'Agree order calendar by product with Habib; confirm which objective definition applies.',go:'habib',conf:'High'});
  const strongQ4=T.uplift;I.push({theme:'Forecast realism',sev:strongQ4>1.3?'warn':'ok',head:`Q4 forecast is ${strongQ4.toFixed(1)}× Q4-2025 sales and ${(T.fcQ4/T.bgQ4).toFixed(1)}× the Q4 budget`,ev:`Commit ${Mn(m.bk.commit)} · Best case ${Mn(m.bk.best)} · Stretch ${Mn(m.bk.stretch)} · No history ${Mn(m.bk.new)}. Risk-weighted forecast ${Mn(m.weighted)}.`,so:`On a risk-weighted basis the year closes at ${p0(m.wo)} of target, not ${p0(m.T.ytd26/m.T.bgFY+T.fcQ4/m.T.bgFY)}.`,act:'Convert Stretch/No-history accounts into dated orders; otherwise haircut them.',go:'forecast',conf:'Medium'});
  const gr=m.P.filter(p=>p.y25>0).map(p=>({p,y:ypc(p.y,p.y25)})).sort((a,b)=>b.y-a.y);
  if(gr.length>2)I.push({theme:'Product mix',sev:'warn',head:`${gr[0].p.name} ${pS(gr[0].y)} vs ${gr[gr.length-1].p.name} ${pS(gr[gr.length-1].y)}`,ev:`Winners and losers vs 2025 (YTD Sep). Zoron remains ${p0(sum(m.P.filter(p=>/Zoron/.test(p.name)).map(p=>p.y))/Math.max(T.ytd26,1))} of sales.`,so:'Growth is narrow. Decline is concentrated in tablets sold through large buyers.',act:'Diagnose the weakest product account-by-account (price, stock, competitor).',go:'explorer',conf:'Medium'});
  const lowP=m.P.filter(p=>p.fb>0&&p.o<.8);
  if(lowP.length)I.push({theme:'Target gap',sev:'bad',head:`${lowP.length} products close below 80% of target even with the forecast`,ev:lowP.slice(0,4).map(p=>p.name+' '+p0(p.o)).join(' · '),so:'These are structural shortfalls, not timing.',act:'Raise contract volume or reallocate effort; flag to management early.',go:'plan',conf:'Medium'});
  const deepd=m.acc.filter(c=>c.disc!=null&&c.disc>=.6&&c.fc>50000);
  if(deepd.length)I.push({theme:'Pricing',sev:'warn',head:`${deepd.length} forecast accounts carry 60%+ discount off list`,ev:deepd.slice(0,3).map(c=>c.n.trim().slice(0,22)+' '+p0(c.disc)).join(' · '),so:'Volume is being bought with price. Check margin and precedent for other buyers.',act:'Review discount ladder by account type with the manager.',go:'accounts',conf:'Medium'});
  const q4s=T.q425/Math.max(T.fy25,1);I.push({theme:'Seasonality',sev:'idle',head:`Q4 delivered ${p0(q4s)} of 2025 sales`,ev:`Q4-2025 ${Mn(T.q425)} vs full-year 2025 ${Mn(T.fy25)}. Q4 budget is ${Mn(T.bgQ4)}.`,so:'Q4 is naturally heavy (hospital tenders and year-end buying), so a back-loaded year is plausible.',act:'Pre-position stock and confirm tender calendars in October.',go:'plan',conf:'Medium'});
  const dh=m.acc.find(c=>/مستشفي دله/.test(c.n));if(dh)I.push({theme:'Hospital gap',sev:'bad',head:`Dallah Hospital: forecast ${Mn(dh.fc)} vs Q4 target ${Mn(dh.q4T)}`,ev:`YTD ${Mn(dh.y26)} vs ${Mn(dh.y25)} in 2025 (${pS(dh.yoy)}).`,so:'The largest account target is under-covered by the forecast.',act:'Visit plan on high-influence prescribers + stock availability.',go:'account/'+dh.id,conf:'High'});
  return I;}
// ---------- data hygiene
function buildHygiene(m){
  const H=[];
  const neg=SALES.team.filter(r=>r.m26.slice(0,9).some(v=>v<0));
  if(neg.length)H.push({id:'neg',sev:'High',t:'Negative monthly sales (returns/credit notes)',n:neg.length,det:neg.map(r=>(RN[r.rep]||r.rep)+': '+r.m26.map((v,i)=>v<0?MS[i]+' '+Mn(v):null).filter(Boolean).join(', ')).join(' · '),fix:'Confirm returns vs data error; exclude one-offs before judging attainment.'});
  const nohist=m.acc.filter(c=>c.fc>0&&c.y26<=0);
  if(nohist.length)H.push({id:'nohist',sev:'High',t:'Forecast accounts with zero 2026 sales',n:nohist.length,det:nohist.map(c=>c.n.trim().slice(0,28)+' ('+Mn(c.fc)+')').join(' · '),fix:'Get a written order plan or remove from Commit.'});
  const cold=m.acc.filter(c=>c.fyT>150000&&c.y26<=0&&c.fc<=0);
  if(cold.length)H.push({id:'cold',sev:'Medium',t:'Accounts with a target but no sales and no forecast',n:cold.length,det:cold.map(c=>c.n.trim().slice(0,28)+' ('+Mn(c.fyT)+')').join(' · '),fix:'Decide: activate, re-assign target, or drop.'});
  const zd=m.acc.filter(c=>c.fc>50000&&c.disc===0);
  if(zd.length)H.push({id:'zd',sev:'Medium',t:'Forecast priced at list (0% discount)',n:zd.length,det:zd.map(c=>c.n.trim().slice(0,28)).join(' · '),fix:'Check whether the net price in the forecast file is complete.'});
  const nof=m.P.filter(p=>p.fb>0&&p.fc===0);
  if(nof.length)H.push({id:'nof',sev:'Medium',t:'Products with a target but no Q4 forecast',n:nof.length,det:nof.map(p=>p.name).join(' · '),fix:'Add forecast or acknowledge a gap.'});
  const nob=m.P.filter(p=>p.fb===0&&p.fc>0);
  if(nob.length)H.push({id:'nob',sev:'Low',t:'Forecast products without a budget',n:nob.length,det:nob.map(p=>p.name).join(' · '),fix:'Add budget line or reclassify.'});
  const hneg=HP.filter(p=>p.si<p.so&&p.so-p.si>1000);
  if(hneg.length)H.push({id:'hneg',sev:'Medium',t:'Habib: consumption above sell-in (possible other channel)',n:hneg.length,det:hneg.map(p=>PN(p.name)+' ('+Mn(p.so-p.si)+')').join(' · '),fix:'Confirm whether Habib sources these products elsewhere.'});
  const lowc=m.day.items.filter(x=>x.st==='low');
  if(lowc.length)H.push({id:'low',sev:'High',t:'Dallah items below 1 month of cover',n:lowc.length,det:lowc.map(x=>x.place+' '+x.item+' ('+x.cover+' mo)').join(' · '),fix:'Raise supply alert; stock date is 30 Sep.'});
  const unm=HP.filter(p=>!(p.d26&&p.d26.length)&&sum(p.um26)>0);
  H.push({id:'map',sev:'Low',t:'Product-name matching between Habib and Dallah files is approximate',n:unm.length,det:unm.slice(0,8).map(p=>PN(p.name)).join(' · '),fix:'Maintain a code mapping table.'});
  const un=m.docs.filter(d=>d.c==='A'&&d.act===0);
  if(un.length)H.push({id:'unv',sev:'Medium',t:'Class A doctors with no HQ visit',n:un.length,det:un.slice(0,10).map(d=>d.n+' ('+d.s+')').join(' · '),fix:'Schedule in this week\'s plan.'});
  H.push({id:'age',sev:'Low',t:'Data freshness',n:3,det:'Sales through Sep 2026 · Dallah stock 30 Sep · Habib sell-out through Aug · HQ tracker 4 Oct',fix:'Refresh Habib data for September to align the periods.'});
  H.push({id:'obj',sev:'Medium',t:'Habib objective definition is not stated in the file',n:1,det:'Objective 1591000 vs forecast '+Mn(m.hAll.fv)+' and overstock '+Mn(m.hAll.gap),fix:'Confirm whether it is sell-in required or net of overstock.'});
  const sc=H.reduce((s,h)=>s+(h.sev==='High'?3:h.sev==='Medium'?2:1)*Math.min(h.n,3),0);
  return {list:H,score:clamp(100-sc*2.2,0,100)};}

// ---------- router + chrome
const ROUTES={};
const NAV=[
 {g:'Overview',items:[['home','Home','🏠','Your position and next actions'],['menu','All sections','🧭','Pick anything']]},
 {g:'Plan & Forecast',items:[['plan','Plan to Achieve','🎯','Close the year: gap, scenarios, products'],['forecast','Forecast','📈','Commit / Best / Stretch in boxes'],['split','Split: Drug·Place·Doctor','🔀','Filter the whole split by drug, place, doctor'],['board','Place Board','🧩','Every place with its doctors, editable'],['fedit','Forecast Editor','✏️','Edit all forecast rows in boxes'],['ideas','Ideas Lab','💡','Levers to close the gap']]},
 {g:'Accounts & People',items:[['accounts','Accounts','🏢','Tiering, health and plans'],['tiering','Account Tiering','🏷️','Where to spend your time'],['stakeholders','Stakeholders','🕸️','Influence vs engagement map'],['doctors','Doctors','🩺','All 160 territory doctors'],['docfc','Doctor Forecast','📦','Forecast boxes split by doctor'],['habib','Al Habib 360','🏨','Sell-in vs sell-out, drugs, doctors'],['dallah','Dallah 360','🏥','Hospital, entities, doctors']]},
 {g:'Analyze',items:[['explorer','Explorer','🔎','Slice sales by any dimension'],['catalog','Catalog','🗂️','Every drug: line, rep, sales'],['lines','Lines & Team','👥','Lines, reps, team ranking'],['compete','Competitive','⚔️','Line positioning and field notes'],['insights','Insights','🧠','Synthesized findings']]},
 {g:'Operate',items:[['daily','Daily','☑️','Visits and daily box log'],['health','Data Health','🩻','Data audit and fix list']]},
 {g:'Reports',items:[['assets','Assets','📄','One-pagers, manager update, scripts'],['sources','Sources & Backup','⚙️','Files, freshness, backup']]}];
const FLAT=NAV.flatMap(g=>g.items.map(i=>({id:i[0],t:i[1],i:i[2],d:i[3],g:g.g})));
const BN=[['home','Home','🏠'],['plan','Plan','🎯'],['accounts','Accounts','🏢'],['daily','Daily','☑️'],['menu','Menu','🧭']];
function parse(){const h=location.hash.replace(/^#\/?/,'');const p=h.split('/').map(x=>{try{return decodeURIComponent(x)}catch(e){return x}});return {id:p[0]||'home',a:p.slice(1)};}
function go(path){const n='#/'+path.split('/').map(encodeURIComponent).join('/');if(location.hash===n)render();else location.hash=n;}
function crumbsFor(r){const f=FLAT.find(x=>x.id===r.id);const c=[['home','Home']];if(r.id!=='home'){if(f&&f.g!=='Overview')c.push([null,f.g]);c.push([r.a.length?r.id:null,f?f.t:r.id]);if(r.a.length){let nm=r.a[0];if((r.id==='board'||r.id==='account')&&ACCI[nm])nm=String(ACCI[nm].n).trim();if(r.id==='doctor'){const x=nm.split('|');nm=x[x.length-1];}c.push([null,nm.length>30?nm.slice(0,30)+'…':nm]);}}return c;}
function renderChrome(r){
  const m=M(),h=m.health;
  $('#top').innerHTML=`<div class="logo">📊</div><div class="ttl"><b>Sales HQ · GIT 2</b><span>Riyadh · ${READONLY?'View-only snapshot · '+SHAREDATE:'Today '+dayLabel(TODAY).long}</span></div>
   <button class="hs" data-go="home" title="Position health"><i class="g-${h.st}">${Math.round(h.score)}</i>${ragWord[h.st]} · ${p0(m.o)}</button>
   <button class="ibtn" data-do="pal" aria-label="Search">🔍<span class="dsk" style="display:none">Search</span></button>
   <button class="ibtn" data-do="theme" aria-label="Theme">🌓</button>`;
  const sb=NAV.map(g=>`<div class="sb-g">${g.g}</div>`+g.items.filter(i=>i[0]!=='menu'||g.g==='Overview').map(i=>`<button class="sb-i ${i[0]===r.id?'on':''}" data-go="${i[0]}"><span class="ic">${i[2]}</span>${i[1]}</button>`).join('')).join('');
  $('#side').innerHTML=`<div class="sb-brand"><div class="logo">📊</div><div><b>Sales HQ</b><span>GIT 2 · Riyadh · FY2026</span></div></div><div class="sb-search" data-do="pal">🔍 Search anything<kbd>Ctrl K</kbd></div>${sb}<div class="sb-ft">Sales through Sep 2026 · Habib through Aug · Dallah stock 30 Sep · HQ tracker 4 Oct</div>`;
  $('#bnav').innerHTML=BN.map(b=>`<button class="${(b[0]===r.id||(b[0]==='accounts'&&['tiering','stakeholders','doctors','docfc','habib','dallah'].includes(r.id))||(b[0]==='plan'&&['forecast','ideas'].includes(r.id))||(b[0]==='menu'&&!['home','plan','forecast','split','board','fedit','ideas','accounts','tiering','stakeholders','doctors','docfc','habib','dallah','daily'].includes(r.id)))?'on':''}" data-go="${b[0]}"><b>${b[2]}</b>${b[1]}</button>`).join('');
  $('#crumbs').innerHTML=r.id==='home'?'':crumbsFor(r).map((c,i,a)=>c[0]&&i<a.length-1?`<a data-go="${c[0]}">${esc(c[1])}</a>`:`<span>${esc(c[1])}</span>`).join(' <span>›</span> ');
}
function render(keep){
  MODEL=null;const r=parse();const R=ROUTES[r.id]||ROUTES.home;
  const y=window.scrollY;
  $('#view').innerHTML=(READONLY?`<div class="card" style="background:var(--warnbg)"><b>View-only snapshot</b> from ${esc(SHAREDATE)}. <button class="btn sec" data-do="adopt" style="margin-left:8px">Use this data as mine</button></div>`:'')+R(r.a);
  renderChrome(r);document.title=(FLAT.find(f=>f.id===r.id)||{t:'Home'}).t+' · Sales HQ';
  const f=window.__focus;if(f){const el=document.getElementById(f.id);if(el){el.focus();try{el.setSelectionRange(f.p,f.p);}catch(e){}}window.__focus=null;}
  window.scrollTo(0,keep?y:0);}
window.addEventListener('hashchange',()=>render());
// ---------- ui helpers
function pageHead(t,p,right){return `<div class="pagehead" style="display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap"><div><h1>${t}</h1>${p?`<p>${p}</p>`:''}</div>${right||''}</div>`;}
const kpi=(v,l,c,s)=>`<div class="kpi ${c||''}"><b>${v}</b><span>${l}</span>${s?`<small>${s}</small>`:''}</div>`;
const noteBox=(k,l,ph)=>`<div class="lab">${l}</div><textarea class="tx" data-note="${esc(k)}" placeholder="${esc(ph||'')}" ${READONLY?'disabled':''}>${esc(S.notes[k]||'')}</textarea>`;
const noteLine=(k,l,ph)=>`<div class="lab">${l}</div><input class="tx" data-note="${esc(k)}" placeholder="${esc(ph||'')}" value="${esc(S.notes[k]||'')}" ${READONLY?'disabled':''}>`;
const noteSel=(k,l,opts)=>`<div class="lab">${l}</div><select class="tx" data-note="${esc(k)}" ${READONLY?'disabled':''}>${opts.map(o=>`<option ${S.notes[k]===o?'selected':''}>${o}</option>`).join('')}</select>`;
const chipsRow=(arr,cur,path)=>`<div class="chips">${arr.map(a=>`<button class="chip ${cur===a[0]?'on':''}" data-do="ui" data-p="${path}" data-v="${esc(a[0])}">${esc(a[1])}</button>`).join('')}</div>`;
const tabs2=(arr,cur,path)=>`<div class="tabs2">${arr.map(a=>`<button class="${cur===a[0]?'on':''}" data-do="ui" data-p="${path}" data-v="${esc(a[0])}">${esc(a[1])}</button>`).join('')}</div>`;
const searchBox=(id,path,ph)=>{const v=path.split('.').reduce((o,k)=>o&&o[k],UI)||'';return `<input class="search" id="${id}" data-live="${path}" placeholder="${esc(ph)}" value="${esc(v)}">`;};
function setPath(path,v){const p=path.split('.');let o=UI;for(let i=0;i<p.length-1;i++)o=o[p[i]]=o[p[i]]||{};o[p[p.length-1]]=v;}
function getPath(path){return path.split('.').reduce((o,k)=>o&&o[k],UI);}
const scenarioBar=()=>`<div class="card flat" style="padding:10px 14px"><div class="lab" style="margin:0 0 4px">Scenario: share of Q4 forecast that actually lands</div><div class="chips" style="margin:4px 0 0">${[100,90,80,70,60].map(v=>`<button class="chip ${S.set.real===v?'on':''}" data-do="real" data-v="${v}">${v}%</button>`).join('')}</div></div>`;
// ---------- HOME
ROUTES.home=function(){
  const m=M(),T=m.T,h=m.health;
  const sev=h.st;const headline={ok:'You are on track to close the year.',warn:'You can close the year, but only if the Q4 forecast is protected.',bad:'The year is at risk — act on the top items below.'}[sev];
  const sub=`On paper you close at <b>${p0(m.o)}</b> of the ${Mn(T.bgFY)} target (${S.set.real}% forecast realization). You need <b>${Mn(T.gap)}</b> in Q4 — ${T.q425>0?(T.gap/T.q425).toFixed(1)+'× last Q4':''}. Weakest area: <b>${h.worst.k}</b>.`;
  let H=`<div class="hero"><div class="ringw">${ring(h.score/100,138,Math.round(h.score),'health score')}</div><div><div style="font-size:12px;letter-spacing:.9px;text-transform:uppercase;opacity:.75">Your position · FY2026</div><h2>${headline}</h2><p>${sub}</p><div class="ind">${h.comp.map(c=>`<div><b><span>${c.k}</span><span>${Math.round(c.v)}</span></b><div class="bar" title="${esc(c.txt)}"><i style="width:${c.v}%"></i></div><span style="opacity:.75">${esc(c.txt)}</span></div>`).join('')}</div></div>
   <div style="display:flex;flex-direction:column;gap:8px;min-width:170px"><button class="btn" style="background:#fff;color:#0b2240" data-go="plan">Open the plan</button><button class="btn" style="background:rgba(255,255,255,.16)" data-go="ideas">Find levers</button><button class="btn" style="background:rgba(255,255,255,.16)" data-go="assets">Manager update</button></div></div>`;
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(T.ytd26),'YTD sales (Jan–Sep)',T.ach>=.8?'ok':T.ach>=.6?'warn':'bad',`${p0(T.ach)} of YTD target · <span class="${cls(T.yoy)}">${pS(T.yoy)}</span> vs 2025`)}${kpi(Mn(T.bgFY),'Annual target','',`Gap to close ${Mn(T.gap)}`)}${kpi(bx(m.alloc.totalBoxes*m.real)+' boxes','Q4 forecast ('+S.set.real+'%)',m.o>=.95?'ok':'warn',`SAR ${Mn(T.fcQ4*m.real)} · covers ${p0(T.fcQ4*m.real/T.gap)} of the gap`)}${kpi(p0(m.o),'Outlook vs target',m.o>=.95?'ok':m.o>=.85?'warn':'bad',`Risk-weighted: ${p0(m.wo)}`)}</div>`;
  H+=scenarioBar();
  H+=`<div class="eyebrow">Next best actions</div><div class="card">${m.actions.slice(0,6).map((a,i)=>`<div class="act" data-go="${a.go}" style="cursor:pointer"><div class="n">${i+1}</div><div class="b"><b>${esc(a.title)}</b><span>${esc(a.why)}</span><div style="margin-top:4px">${pill(a.type==='protect'?'Protect':a.type==='grow'?'Grow':a.type==='coverage'?'Coverage':'Clarify',a.type==='protect'?'warn':a.type==='grow'?'info':'idle')} <span class="tag">Effort ${a.effort}</span><span class="tag">${esc(a.owner)}</span><span class="tag">${esc(a.due)}</span></div></div><div class="r">${a.impact>0?Mn(a.impact):'—'}<div class="mt" style="font-size:11px;font-weight:500">${a.impact>0?'at stake':''}</div></div></div>`).join('')}<button class="btn sec block" data-go="ideas">See all levers and build a plan</button></div>`;
  H+=`<div class="eyebrow">Go anywhere</div>`+launcher(m);
  H+=`<div class="eyebrow">Trajectory</div><div class="col2"><div class="card"><h3>Monthly: 2026 vs 2025 vs target (SAR)</h3>${svgMonthly(T.m26,T.m25,T.b26,9,{fc:[0,0,0,0,0,0,0,0,0,...m.bkAll||[]]})}${legend()}</div><div class="card"><h3>Path to target</h3>${bridgeSvg([['YTD',T.ytd26,'#1d6fb8'],['Commit',m.bk.commit*m.real,'#16a34a'],['Best',m.bk.best*m.real,'#d97706'],['Stretch+new',(m.bk.stretch+m.bk.new)*m.real,'#dc2626']],T.bgFY)}<div class="note">YTD actual + forecast by confidence level (at ${S.set.real}% realization). Red line = annual target.</div></div></div>`;
  const watch=m.acc.filter(c=>c.flags.length&&c.tier<=2).slice(0,5);
  if(watch.length)H+=`<div class="eyebrow">Accounts needing attention</div><div class="card">${watch.map(c=>`<div class="row" data-go="account/${c.id}" style="cursor:pointer"><div class="l"><b><bdi>${esc(c.n.trim())}</bdi></b><span>${c.flags.join(' · ')}</span></div>${pill('Tier '+c.tier,TIERN[c.tier][1])}<b>${Mn(c.fc)}</b></div>`).join('')}</div>`;
  return H;};
function launcher(m){
  const stats={plan:`Outlook ${p0(m.o)}`,forecast:`${bx(m.alloc.totalBoxes)} boxes`,board:`${m.alloc.places.length} places`,split:`${bx(m.alloc.totalBoxes)} boxes`,fedit:`${S.fclog.length} edits`,docfc:`${sum(m.docs.map(d=>d.fcT))} boxes split`,ideas:`${m.levers.length} levers`,accounts:`${m.acc.length} accounts`,tiering:`${m.acc.filter(c=>c.tier===1).length} Tier 1`,stakeholders:`${m.docs.filter(d=>d.c==='A'&&d.act===0).length} A unseen`,doctors:`${m.docs.length} doctors`,habib:`Gap ${Mn(m.hAll.gap)}`,dallah:`${Mn(m.dal.y26)} YTD`,explorer:'7 dimensions',catalog:`${SALES.lines.length} lines`,lines:`${m.reps.length} reps`,compete:'3 molecules',insights:`${m.insights.length} findings`,daily:`${m.day.vDone}/${m.day.vTot} visits`,health:`${m.hygiene.list.filter(x=>x.sev==='High').length} high`,assets:'3 documents',sources:'6 files'};
  return NAV.filter(g=>g.g!=='Overview').map(g=>`<div class="lab" style="margin:10px 2px 6px">${g.g}</div><div class="tiles">${g.items.map(i=>`<button class="tile" data-go="${i[0]}"><div class="bd">${i[2]}</div><b>${i[1]}</b><span>${i[3]}</span><span class="m">${stats[i[0]]||''}</span></button>`).join('')}</div>`).join('');}
ROUTES.menu=function(){return pageHead('All sections','Everything in one place. Tap a tile or press Ctrl+K to search.')+launcher(M());};

// ---------- PLAN
ROUTES.plan=function(){
  const m=M(),T=m.T,tab=UI.plan.tab;
  let H=pageHead('Plan to Achieve','The path from today to the FY2026 target: gap, forecast coverage, products, accounts and months.',`<span>${pill(ragWord[RAG(m.o*100>=95?80:m.o*100>=85?60:30)]+' · '+p0(m.o),m.o>=.95?'ok':m.o>=.85?'warn':'bad')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(T.bgFY),'Annual target')}${kpi(Mn(T.ytd26),'Achieved YTD',T.ytd26/T.bgFY>.5?'ok':'warn',p0(T.ytd26/T.bgFY)+' of annual')}${kpi(Mn(T.gap),'Needed in Q4',m.T.gap/T.q425>1.5?'bad':'warn',(T.gap/T.q425).toFixed(1)+'× Q4 2025 ('+Mn(T.q425)+')')}${kpi(Mn(m.left),'Gap after forecast (SAR)',m.left<=0?'ok':'bad',`Forecast ${bx(m.alloc.totalBoxes*m.real)} boxes = SAR ${Mn(T.fcQ4*m.real)} at ${S.set.real}%`)}</div>`+scenarioBar();
  H+=tabs2([['overview','Overview'],['products','By product'],['accounts','By account'],['months','By month']],tab,'plan.tab');
  if(tab==='overview'){
    H+=`<div class="col2"><div class="card"><h3>Bridge to target</h3>${bridgeSvg([['YTD',T.ytd26,'#1d6fb8'],['Commit',m.bk.commit*m.real,'#16a34a'],['Best',m.bk.best*m.real,'#d97706'],['Stretch+new',(m.bk.stretch+m.bk.new)*m.real,'#dc2626']],T.bgFY)}<div class="note">Commit = forecast ≤ Q4-2025 sales · Best = up to 1.5× · Stretch = above 1.5× · No history = no Q4-2025 sales.</div></div>
    <div class="card"><h3>What must be true</h3>`;
    const need=[];
    need.push(`Q4 sales of <b>${Mn(T.gap)}</b> — ${(T.gap/T.q425).toFixed(1)}× Q4 2025 and ${(T.gap/T.bgQ4).toFixed(1)}× the Q4 budget (gap built up in Q1–Q3).`);
    need.push(`Your forecast (${Mn(T.fcQ4)}) covers <b>${p0(T.fcQ4*m.real/T.gap)}</b> of that at ${S.set.real}% realization. Risk-weighted it covers ${p0(m.weighted/T.gap)}.`);
    const lp=m.P.filter(p=>p.fb>0&&p.o<.8)[0];if(lp)need.push(`Weakest product: <b>${esc(lp.name)}</b> closes at ${p0(lp.o)} of its target even with forecast.`);
    const sh=[...m.acc].filter(c=>c.q4T>0).sort((a,b)=>(a.fc-a.q4T)-(b.fc-b.q4T))[0];if(sh&&sh.fc<sh.q4T)need.push(`Largest forecast shortfall vs account target: <b><bdi>${esc(sh.n.trim())}</bdi></b> (${Mn(sh.fc-sh.q4T)}).`);
    need.push(`Supply: ${m.day.items.filter(x=>x.st==='low').length} Dallah items have under 1 month of stock; Habib has ${Mn(m.hAll.gap)} overstock.`);
    H+=need.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')+`<button class="btn sec block" data-go="ideas">Build the plan in Ideas Lab</button></div></div>`;
    H+=`<div class="card"><h3>Closing-the-year notes (yours)</h3>${noteBox('plan:close:act','Weekly actions (who/what/when)','1) …')}${noteBox('plan:close:risk','Risks and what you need from management','')}${noteLine('plan:close:ask','Your specific ask to the manager','e.g. lock the Fakeeh order before 15 Oct')}</div>`;
  }
  if(tab==='products'){
    H+=`<div class="card scroll"><table class="t"><tr><th>Product</th><th>YTD</th><th>YTD target</th><th>% target</th><th>Q4 forecast</th><th>Annual target</th><th>Outlook</th><th>Gap</th></tr>`+m.P.map(p=>`<tr><td>${esc(p.name)}</td><td>${Mn(p.y)}</td><td>${Mn(p.yt)}</td><td class="${p.yt>0&&p.y/p.yt>=.8?'up':p.yt>0&&p.y/p.yt<.5?'dn':''}">${p0(ach(p.y,p.yt))}</td><td>${Mn(p.fc*m.real)}</td><td>${Mn(p.fb)}</td><td class="${p.o==null?'':p.o>=.95?'up':p.o<.8?'dn':''}">${p0(p.o)}</td><td>${Mn(p.gapOut)}</td></tr>`).join('')+`</table><div class="note">Outlook = (YTD + forecast × realization) ÷ annual target. SAR.</div></div>`;
  }
  if(tab==='accounts'){
    const A=m.acc.filter(c=>c.fyT>0||c.fc>0).map(c=>({c,o:c.fyT>0?(c.y26+c.fc*m.real)/c.fyT:null})).sort((a,b)=>b.c.fyT-a.c.fyT).slice(0,18);
    H+=`<div class="card scroll"><table class="t"><tr><th>Account</th><th>YTD</th><th>% YTD target</th><th>Q4 target</th><th>Q4 forecast</th><th>Year outlook</th></tr>`+A.map(a=>`<tr class="row" data-go="account/${a.c.id}"><td><bdi>${esc(a.c.n.trim())}</bdi></td><td>${Mn(a.c.y26)}</td><td class="${a.c.ach>=.9?'up':a.c.ach!=null&&a.c.ach<.6?'dn':''}">${p0(a.c.ach)}</td><td>${Mn(a.c.q4T)}</td><td class="${a.c.fc>=a.c.q4T?'up':'dn'}">${Mn(a.c.fc*m.real)}</td><td class="${a.o==null?'':a.o>=.95?'up':a.o<.7?'dn':''}">${p0(a.o)}</td></tr>`).join('')+`</table><div class="note">Targets from "26 – Target Per Account". Tap a row for the account plan.</div></div>`;
  }
  if(tab==='months'){
    const mo=[0,1,2].map(i=>({m:MS[9+i],b:T.b26[9+i],a25:T.m25[9+i],fc:SALES.prods.reduce((s,p)=>s+p.fc[i],0)*m.real}));
    H+=`<div class="col2"><div class="card"><h3>Q4 by month</h3><table class="t"><tr><th>Month</th><th>Budget</th><th>2025</th><th>Forecast</th><th>÷ budget</th></tr>`+mo.map(x=>`<tr><td>${x.m}</td><td>${Mn(x.b)}</td><td>${Mn(x.a25)}</td><td>${Mn(x.fc)}</td><td class="${x.fc>=x.b?'up':'dn'}">${p0(x.fc/x.b)}</td></tr>`).join('')+`<tr class="hl"><td><b>Q4</b></td><td><b>${Mn(T.bgQ4)}</b></td><td><b>${Mn(T.q425)}</b></td><td><b>${Mn(T.fcQ4*m.real)}</b></td><td><b>${p0(T.fcQ4*m.real/T.bgQ4)}</b></td></tr></table></div><div class="card"><h3>Full-year view</h3>${svgMonthly(T.m26,T.m25,T.b26,9,{fc:[0,0,0,0,0,0,0,0,0,...mo.map(x=>x.fc)]})}${legend(true)}</div></div>`;
  }
  return H;};
// ---------- FORECAST
function forecastText(m){
  const T=m.T,L=[];
  L.push(`FORECAST UPDATE — GIT 2 (Zoron · Maxim · Meva) — ${dayLabel(TODAY).long}`);L.push('');
  L.push(`Position: ${ragWord[m.health.st]} (health ${Math.round(m.health.score)}/100). YTD ${Mn(T.ytd26)} = ${p0(T.ach)} of YTD target, ${pS(T.yoy)} vs 2025. Annual target ${Mn(T.bgFY)}; gap ${Mn(T.gap)}.`);L.push('');
  L.push(`Q4 forecast: ${bx(m.alloc.totalBoxes)} boxes = SAR ${Mn(T.fcQ4)} (${(T.fcQ4/T.bgQ4).toFixed(1)}× Q4 budget, ${T.uplift?T.uplift.toFixed(1):'—'}× Q4 2025). ${S.fclog.length?'Edited from '+bx(m.alloc.origBoxes)+' boxes ('+S.fclog.length+' changes).':''}`);
  L.push(`- Boxes: Commit ${bx(m.bkB.commit)} · Best case ${bx(m.bkB.best)} · Stretch ${bx(m.bkB.stretch)} · No history ${bx(m.bkB.new)}`);
  L.push(`- Risk-weighted: ${Mn(m.weighted)} → year closes at ${p0(m.wo)} of target. Full forecast: ${p0((T.ytd26+T.fcQ4)/T.bgFY)}. At ${S.set.real}% realization: ${p0(m.o)}.`);L.push('');
  L.push('What is closing (Commit/Best case, top accounts):');m.acc.filter(c=>c.bk==='commit'||c.bk==='best').sort((a,b)=>b.fc-a.fc).slice(0,5).forEach(c=>L.push(`- ${c.n.trim()}: ${bx(c.fbT)} boxes (SAR ${Mn(c.fc)}; Q4-25 SAR ${Mn(c.q425)})`));L.push('');
  L.push('At risk (needs confirmed orders):');m.acc.filter(c=>c.bk==='stretch'||c.bk==='new').sort((a,b)=>b.fc-a.fc).slice(0,5).forEach(c=>L.push(`- ${c.n.trim()}: ${bx(c.fbT)} boxes (SAR ${Mn(c.fc)}) — ${c.q425>0?(c.fc/c.q425).toFixed(1)+'× its Q4-25':'no prior sales'}`));L.push('');
  L.push(`Supply/stock: ${m.day.items.filter(x=>x.st==='low').length} Dallah items under 1 month cover. Habib sell-in exceeds sell-out by ${Mn(m.hAll.gap)}.`);L.push('');
  L.push('Asks:');m.actions.filter(a=>a.type!=='coverage').slice(0,3).forEach(a=>L.push(`- ${a.title}`));
  return L.join('\n');}
ROUTES.forecast=function(){
  const m=M(),T=m.T,f=UI.fc.bk,tb=m.alloc.totalBoxes;
  let H=pageHead('Forecast (boxes)','Your Q4 forecast in boxes by account, month and confidence level. Edit any number in the Forecast Editor — everything else updates.',`<span class="noprint"><button class="btn" data-go="fedit">Edit forecast</button> <button class="btn sec" data-go="docfc">Split by doctor</button></span>`);
  const edited=S.fclog.length>0;
  if(edited)H+=`<div class="card flat" style="background:var(--warnbg)">Forecast edited: <b>${bx(tb)}</b> boxes now vs <b>${bx(m.alloc.origBoxes)}</b> original (${tb-m.alloc.origBoxes>=0?'+':''}${bx(tb-m.alloc.origBoxes)}). ${S.fclog.length} changes logged.</div>`;
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(tb),'Total Q4 forecast (boxes)','',`SAR ${Mn(T.fcQ4)} · ${(T.fcQ4/T.bgQ4).toFixed(1)}× budget`)}${kpi(bx(m.bkB.commit),'Commit (boxes)','ok',`SAR ${Mn(m.bk.commit)} · ${p0(m.bk.commit/T.fcQ4)}`)}${kpi(bx(m.bkB.best),'Best case (boxes)','warn',`SAR ${Mn(m.bk.best)} · ${p0(m.bk.best/T.fcQ4)}`)}${kpi(bx(m.bkB.stretch+m.bkB.new),'Stretch + no history (boxes)','bad',`SAR ${Mn(m.bk.stretch+m.bk.new)} · ${p0((m.bk.stretch+m.bk.new)/T.fcQ4)}`)}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Risk-weighted forecast</h3><div style="font-size:28px;font-weight:800">${bx(['commit','best','stretch','new'].reduce((s,k)=>s+m.bkB[k]*BKW[k],0))} boxes <span class="mt" style="font-size:14px;font-weight:500">SAR ${Mn(m.weighted)} → year at ${p0(m.wo)}</span></div><table class="t" style="margin-top:8px"><tr><th>Category</th><th>Boxes</th><th>Weight</th><th>Weighted boxes</th></tr>`+['commit','best','stretch','new'].map(k=>`<tr><td>${pill(BK[k][0],BK[k][1])}</td><td>${bx(m.bkB[k])}</td><td>${p0(BKW[k])}</td><td>${bx(m.bkB[k]*BKW[k])}</td></tr>`).join('')+`</table><div class="note">Weights are a judgment (95/80/50/30%).</div></div>
  <div class="card"><h3>By month and category (boxes)</h3>`+[0,1,2].map(i=>{const tot=['commit','best','stretch','new'].reduce((s,k)=>s+m.bkmB[k][i],0);return `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between"><b>${MS[9+i]}</b><span>${bx(tot)} boxes</span></div><div style="display:flex;height:12px;border-radius:8px;overflow:hidden;background:var(--idle)">${['commit','best','stretch','new'].map(k=>`<i style="width:${tot?m.bkmB[k][i]/tot*100:0}%;background:${{commit:'var(--ok)',best:'var(--warn)',stretch:'var(--bad)',new:'#94a3b8'}[k]}"></i>`).join('')}</div></div>`;}).join('')+`<div class="note"><span class="dot" style="background:var(--ok)"></span>Commit <span class="dot" style="background:var(--warn)"></span>Best <span class="dot" style="background:var(--bad)"></span>Stretch <span class="dot" style="background:#94a3b8"></span>No history</div></div></div>`;
  const byp={};FX.rows.forEach(r=>{const o=byp[r.pn]=byp[r.pn]||{n:r.pn,e:[0,0,0],o:0,v:0};r.e.forEach((u,i)=>o.e[i]+=u);o.o+=r.o0;o.v+=sum(r.e)*r.price;});
  H+=`<div class="card scroll"><h3>By product (boxes)</h3><table class="t"><tr><th>Product</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th><th>Original</th><th>Change</th><th>SAR</th></tr>`+Object.values(byp).filter(o=>sum(o.e)>0||o.o>0).sort((a,b)=>sum(b.e)-sum(a.e)).map(o=>`<tr><td>${esc(o.n)}</td><td>${bx(o.e[0])}</td><td>${bx(o.e[1])}</td><td>${bx(o.e[2])}</td><td><b>${bx(sum(o.e))}</b></td><td>${bx(o.o)}</td><td class="${sum(o.e)-o.o>0?'up':sum(o.e)-o.o<0?'dn':''}">${sum(o.e)-o.o===0?'—':(sum(o.e)-o.o>0?'+':'')+bx(sum(o.e)-o.o)}</td><td>${Mn(o.v)}</td></tr>`).join('')+`<tr class="hl"><td><b>Total</b></td><td><b>${bx(sum(Object.values(byp).map(o=>o.e[0])))}</b></td><td><b>${bx(sum(Object.values(byp).map(o=>o.e[1])))}</b></td><td><b>${bx(sum(Object.values(byp).map(o=>o.e[2])))}</b></td><td><b>${bx(tb)}</b></td><td><b>${bx(m.alloc.origBoxes)}</b></td><td></td><td><b>${Mn(T.fcQ4)}</b></td></tr></table></div>`;
  H+=chipsRow([['all','All'],['commit','Commit'],['best','Best case'],['stretch','Stretch'],['new','No history']],f,'fc.bk');
  const rows=m.acc.filter(c=>c.bk&&(f==='all'||c.bk===f)).sort((a,b)=>b.fbT-a.fbT);
  const act={commit:'Keep cadence; confirm order dates.',best:'Confirm PO dates and stock.',stretch:'Needs customer-confirmed volume or haircut ~50%.',new:'Get written commitment or haircut ~70%.'};
  H+=`<div class="card scroll"><table class="t"><tr><th>Account</th><th>Category</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th><th>Original</th><th>SAR</th><th>Next step</th></tr>`+rows.map(c=>`<tr class="row" data-go="account/${c.id}"><td><bdi>${esc(c.n.trim())}</bdi></td><td>${pill(BK[c.bk][0],BK[c.bk][1])}</td><td>${bx(c.fb[0])}</td><td>${bx(c.fb[1])}</td><td>${bx(c.fb[2])}</td><td><b>${bx(c.fbT)}</b></td><td>${bx(c.fb0)}</td><td>${Mn(c.fc)}</td><td style="white-space:normal;min-width:180px">${act[c.bk]}</td></tr>`).join('')+'</table></div>';
  const txt=forecastText(m);
  H+=`<div class="eyebrow">Forecast call narrative</div><div class="card"><pre id="fcText" style="white-space:pre-wrap;font:13.5px/1.6 Inter,system-ui;margin:0">${esc(txt)}</pre><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn" data-do="copy" data-t="fcText">Copy narrative</button><button class="btn sec" data-go="assets">Open manager pack</button></div></div>`;
  return H;};
// ---------- IDEAS LAB
ROUTES.ideas=function(){
  const m=M(),T=m.T;const L=m.levers;
  const base=T.ytd26+T.fcQ4*m.real;
  const selG=L.filter(l=>l.type==='grow'&&l.sel),selP=L.filter(l=>l.type==='protect'&&l.sel);
  const add=sum(L.filter(l=>l.sel).map(l=>l.ev));const withL=base+add;
  let H=pageHead('Ideas Lab','Concrete levers to close the gap — each with impact, probability, effort and owner. Select the ones you commit to and watch the outlook move.');
  H+=scenarioBar();
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(p0(base/T.bgFY),'Outlook today',base>=T.bgFY*.95?'ok':'warn',`at ${S.set.real}% realization`)}${kpi(p0(withL/T.bgFY),'With selected levers',withL>=T.bgFY*.95?'ok':'warn',`+${Mn(add)} expected`)}${kpi(Mn(Math.max(T.bgFY-withL,0)),'Gap still open',withL>=T.bgFY?'ok':'bad')}${kpi(String(selG.length+selP.length)+'/'+L.length,'Levers selected','')}</div>`;
  const pts=L.map(l=>({x:({S:.18,M:.5,L:.82}[l.effort]),y:clamp(Math.sqrt(l.ev/Math.max(...L.map(z=>z.ev),1)),.04,.97),r:clamp(4+Math.sqrt(l.amt)/90,5,13),c:l.type==='protect'?'var(--warn)':'var(--brand2)',t:l.title+' · EV '+Mn(l.ev)}));
  H+=`<div class="col2"><div class="card"><h3>Impact vs effort</h3>${scatterSvg(pts.map(p=>({...p,x:p.x,y:p.y})),{q1:'High impact · low effort',q2:'High impact · high effort',q3:'Quick wins',q4:'Reconsider',xl:'Effort (S → L)',yl:'Expected value'})}<div class="note"><span class="dot" style="background:var(--warn)"></span>Protect <span class="dot" style="background:var(--brand2)"></span>Grow. Bubble size = amount at stake.</div></div>
  <div class="card"><h3>How to read the levers</h3><div class="ins"><i>🛡️</i><div><b>Protect</b> — forecast you already count on but that could fall away (unproven account, overstock, stock-out). Value = amount × downside risk (at least 30%) × probability you secure it.</div></div><div class="ins"><i>🚀</i><div><b>Grow</b> — upside above the forecast (account target not yet covered, weak products). Counted at its probability.</div></div><div class="ins"><i>⚖️</i><div>Expected value = amount × probability. Probabilities are starting assumptions — change them as you learn.</div></div></div></div>`;
  const row=l=>`<div class="act"><button class="tick ${l.sel?'':''}" data-do="lev" data-id="${esc(l.id)}" style="flex:0 0 36px;height:36px;border-radius:10px;${l.sel?'background:var(--ok);border-color:var(--ok);color:#fff':''}">${l.sel?'✓':''}</button><div class="b"><b>${esc(l.title)}</b><span>${esc(l.how)}</span><div style="margin-top:4px"><span class="tag">Effort ${l.effort}</span><span class="tag">${esc(l.owner)}</span><span class="tag">P ${p0(l.prob)}</span>${l.acc?`<a data-go="account/${l.acc}" style="color:var(--brand2);cursor:pointer;font-size:12.5px">Open account →</a>`:''}</div></div><div class="r">${Mn(l.amt)}<div class="mt" style="font-size:11px;font-weight:500">EV ${Mn(l.ev)}</div></div></div>`;
  H+=`<div class="eyebrow">Protect — secure what is already in the forecast</div><div class="card">${L.filter(l=>l.type==='protect').map(row).join('')||'Nothing to protect.'}</div>`;
  H+=`<div class="eyebrow">Grow — add volume above the forecast</div><div class="card">${L.filter(l=>l.type==='grow').map(row).join('')||'No growth levers computed.'}</div>`;
  H+=`<div class="eyebrow">Brainstorm prompts</div><div class="card">${[
   ['Where can one visit unlock volume?','Look at Tier 1 accounts with high forecast and low coverage (Stakeholders → Priority list).'],
   ['Which buyer decisions are calendar-driven?','Hospital tenders, formulary committees and warehouse ordering cycles. Put dates on them.'],
   ['What would the manager have to approve to make Stretch real?','Price, stock allocation, samples, a joint visit.'],
   ['Which product has a competitor weakness today?','Use the Competitive notes to log what doctors say.'],
   ['Which account could replace a weak one?','Cold accounts with targets (Data Health → "Accounts with a target but no sales").']].map(x=>`<div class="ins"><i>💭</i><div><b>${x[0]}</b><div class="mt">${x[1]}</div></div></div>`).join('')}${noteBox('ideas:own','Your own ideas','Write ideas here — they stay on your device')}</div>`;
  return H;};

// ---------- ACCOUNTS
const acctName=c=>`<bdi>${esc(String(c.n).trim())}</bdi>`;
ROUTES.accounts=function(){
  const m=M(),f=UI.acc.f;let H=pageHead('Accounts','Every account with its tier, health and plan. Hospital groups Al Habib and Dallah have dedicated 360 pages.');
  H+=`<div class="grid g2"><div class="card" data-go="habib" style="cursor:pointer;border-color:var(--brand2)"><b>🏨 Al Habib 360</b><div class="mt">Sell-in ${Mn(m.hAll.si)} vs sell-out ${Mn(m.hAll.so)} · overstock ${Mn(m.hAll.gap)} · ${m.docs.filter(d=>d.o==='Habib').length} doctors</div></div><div class="card" data-go="dallah" style="cursor:pointer;border-color:var(--brand2)"><b>🏥 Dallah 360</b><div class="mt">YTD ${Mn(m.dal.y26)} (${pS(ypc(m.dal.y26,m.dal.y25))}) · Q4 forecast ${Mn(m.dal.fq4.hosp+m.dal.fq4.care)} · ${m.docs.filter(d=>d.o==='Dallah').length} doctors</div></div></div>`;
  H+=chipsRow([['all','All'],['t1','Tier 1'],['t2','Tier 2'],['attn','Needs attention'],['down','Declining'],['hosp','Hospitals']],f,'acc.f')+searchBox('aq','acc.q','Search accounts');
  let L=m.acc.filter(c=>(f==='all'||(f==='t1'&&c.tier===1)||(f==='t2'&&c.tier===2)||(f==='attn'&&c.flags.length)||(f==='down'&&c.yoy!=null&&c.yoy<-.2)||(f==='hosp'&&c.sub==='HOSPITALS'))&&(!UI.acc.q||c.n.toLowerCase().includes(UI.acc.q.toLowerCase()))).sort((a,b)=>b.score-a.score);
  H+=`<div class="note">${L.length} accounts · sorted by tier score</div>`;
  H+=L.map(c=>`<div class="card" data-go="account/${c.id}" style="cursor:pointer"><div class="row" style="border:0;padding:0"><div class="l"><b>${acctName(c)}</b><span>${esc(c.sub)}${c.flags.length?' · ⚠ '+esc(c.flags[0]):''}</span></div>${pill(TIERN[c.tier][0],TIERN[c.tier][1])}<div style="text-align:right;min-width:78px"><b>${Mn(c.y26)}</b><div class="${cls(c.yoy)}" style="font-size:12px">${pS(c.yoy)}</div></div></div><div class="chips" style="margin:8px 0 0"><span class="tag">${c.ach==null?'No target':'Achieved '+p0(c.ach)}</span><span class="tag">Q4 forecast ${bx(c.fbT)} boxes</span>${c.bk?pill(BK[c.bk][0],BK[c.bk][1]):''}</div></div>`).join('');
  return H;};
ROUTES.account=function(a){
  const m=M(),c=m.acc.find(x=>x.id===a[0]);if(!c)return pageHead('Account not found','')+`<div class="card"><button class="btn" data-go="accounts">Back to accounts</button></div>`;
  const out=c.y26+c.fc*m.real;
  let H=pageHead(esc(c.n.trim()),`${esc(c.sub)} · ${esc(c.nat)}`,`<span>${pill(TIERN[c.tier][0]+' · score '+Math.round(c.score),TIERN[c.tier][1])}</span>`);
  const links=[];if(c.id===m.hid)links.push('<button class="btn" data-go="habib">Open Al Habib 360</button>');if(/مستشفي دله|رعاية دله/.test(c.n))links.push('<button class="btn" data-go="dallah">Open Dallah 360</button>');
  if(links.length)H+=`<div class="chips">${links.join('')}</div>`;
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(c.y26),'YTD 2026',c.ach>=.8?'ok':c.ach!=null&&c.ach<.6?'bad':'warn',`${c.ach==null?'No target':p0(c.ach)+' of '+Mn(c.ytT)}`)}${kpi(pS(c.yoy),'vs 2025 YTD','',`2025: ${Mn(c.y25)}`)}${kpi(bx(c.fbT*m.real)+' boxes','Q4 forecast (boxes)','',`SAR ${Mn(c.fc*m.real)} · target SAR ${Mn(c.q4T)}`)}${kpi(c.fyT>0?p0(out/c.fyT):'—','Year outlook',c.fyT>0&&out/c.fyT>=.95?'ok':'warn',`Annual target ${Mn(c.fyT)}`)}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Monthly vs target</h3>${svgMonthly(c.m26,c.m25,c.tm,9,{fc:[0,0,0,0,0,0,0,0,0,...c.fcm]})}${legend(true)}</div><div class="card"><h3>Account read-out</h3>`;
  const rows=[];
  rows.push(`Share of your YTD sales: <b>${p0(c.share)}</b> · share of Q4 forecast: <b>${p0(c.fc/Math.max(m.T.fcQ4,1))}</b>.`);
  rows.push(`Q4-2025 actual ${Mn(c.q425)} · Q4 target ${Mn(c.q4T)} · forecast ${Mn(c.fc)} ${c.bk?pill(BK[c.bk][0],BK[c.bk][1]):''}`);
  rows.push(`Discount vs list in forecast: <b>${c.disc==null?'—':p0(c.disc)}</b>.`);
  c.flags.forEach(f=>rows.push('⚠️ '+esc(f)+'.'));
  if(c.q4T>0&&c.fc<c.q4T*.8)rows.push(`Forecast is ${Mn(c.q4T-c.fc)} below the Q4 account target — find the missing items or branches.`);
  if(c.q4T>0&&c.fc>c.q4T*1.5)rows.push(`Forecast is ${(c.fc/c.q4T).toFixed(1)}× its Q4 target — confirm it is a real order.`);
  H+=rows.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')+`</div></div>`;
  H+=`<div class="col2"><div class="card"><h3>Tier scorecard</h3>${[['Size',c.sSize],['Momentum',c.sMom],['Opportunity',c.sOpp],['Strategic fit',c.sStrat]].map(x=>`<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${x[0]}</span><b>${Math.round(x[1])}</b></div>${hbar(x[1]/100)}</div>`).join('')}<div class="note">${TIERN[c.tier][2]}. Change weights in Account Tiering.</div></div>`;
  if(c.prods.length)H+=`<div class="card scroll"><h3>Sales by product (YTD)</h3><table class="t"><tr><th>Product</th><th>2026</th><th>2025</th><th>YoY</th></tr>`+c.prods.slice(0,9).map(p=>`<tr><td>${esc(PN(p[0]))}</td><td>${Mn(p[1])}</td><td>${Mn(p[2])}</td><td class="${cls(ypc(p[1],p[2]))}">${pS(ypc(p[1],p[2]))}</td></tr>`).join('')+'</table></div>';
  H+='</div>';
  if(c.fprods.length)H+=`<div class="card scroll"><h3>Q4 forecast by product (boxes)</h3><table class="t"><tr><th>Product</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th><th>SAR</th></tr>`+c.fprods.slice(0,9).map(p=>`<tr><td>${esc(PN(p[0]))}</td><td>${bx(p[5][0])}</td><td>${bx(p[5][1])}</td><td>${bx(p[5][2])}</td><td><b>${bx(p[4])}</b></td><td>${Mn(p[1]+p[2]+p[3])}</td></tr>`).join('')+`<tr class="hl"><td><b>Total</b></td><td><b>${bx(c.fb[0])}</b></td><td><b>${bx(c.fb[1])}</b></td><td><b>${bx(c.fb[2])}</b></td><td><b>${bx(c.fbT)}</b></td><td><b>${Mn(c.fc)}</b></td></tr></table><button class="btn sec block" data-do="fxacc" data-id="${c.id}">Edit this account's forecast</button></div>`;
  H+=`<div class="card"><h3>Account plan</h3>${noteLine('plan:'+c.id+':goal','Your Q4 goal (SAR)',Mn(c.fc)+' per forecast')}${noteBox('plan:'+c.id+':act','Actions (who / what / when)','1) … 2) … 3) …')}${noteBox('plan:'+c.id+':risk','Risks and competitors','')}${noteLine('plan:'+c.id+':next','Next meeting','')}</div>`;
  H+=`<div class="card"><h3>Buying-committee map</h3><div class="note">Who decides? Fill what you know — it feeds the stakeholder view.</div><div class="grid g2">${['Decision maker','Pharmacy / purchasing','Clinical champion','Blocker / skeptic'].map((r,i)=>`<div>${noteLine('acc:'+c.id+':stk'+i,r,'Name · role')}</div>`).join('')}</div></div>`;
  H+=`<div class="chips"><button class="btn sec" data-do="asset" data-a="account:${c.id}">Create account one-pager</button></div>`;
  return H;};
// ---------- TIERING
ROUTES.tiering=function(){
  const m=M(),w=S.set.w;let H=pageHead('Account Tiering','Score every account on size, momentum, opportunity and strategic fit, then set the visit cadence. Change the weights to match your judgment.');
  H+=`<div class="card"><h3>Scoring weights</h3><div class="grid g4">${[['size','Size (YTD/forecast)'],['mom','Momentum (YoY)'],['opp','Opportunity (Q4 potential)'],['strat','Strategic fit (type)']].map(x=>`<div><div class="lab">${x[1]}: <b>${w[x[0]]}</b></div><input type="range" min="0" max="60" value="${w[x[0]]}" data-do="w" data-k="${x[0]}"></div>`).join('')}</div><div class="note">Tier 1 ≥ 62 · Tier 2 ≥ 45 · Tier 3 ≥ 28 · else Tier 4. Opportunity = max(Q4 forecast, Q4 target).</div></div>`;
  H+=`<div class="grid g4" style="margin-bottom:12px">${[1,2,3,4].map(t=>{const L=m.acc.filter(c=>c.tier===t);return kpi(String(L.length),TIERN[t][0],TIERN[t][1],`${Mn(sum(L.map(c=>Math.max(c.y26,0))))} YTD · ${p0(sum(L.map(c=>Math.max(c.y26,0)))/Math.max(m.T.ytd26,1))}`);}).join('')}</div>`;
  H+=`<div class="card"><h3>Recommended cadence</h3>${[1,2,3,4].map(t=>`<div class="row"><div class="l"><b>${TIERN[t][0]}</b><span>${TIERN[t][2]}</span></div>${pill(m.acc.filter(c=>c.tier===t).length+' accounts',TIERN[t][1])}</div>`).join('')}<div class="note">Rule of thumb: spend ~60% of your time on Tier 1, 25% on Tier 2, the rest on Tier 3–4.</div></div>`;
  H+=`<div class="card scroll"><table class="t"><tr><th>Account</th><th>Tier</th><th>Score</th><th>Size</th><th>Mom.</th><th>Opp.</th><th>Fit</th><th>YTD</th><th>Q4 fcst</th><th>Flags</th></tr>`+[...m.acc].sort((a,b)=>b.score-a.score).map(c=>`<tr class="row" data-go="account/${c.id}"><td>${acctName(c)}</td><td>${pill(String(c.tier),TIERN[c.tier][1])}</td><td><b>${Math.round(c.score)}</b></td><td>${Math.round(c.sSize)}</td><td>${Math.round(c.sMom)}</td><td>${Math.round(c.sOpp)}</td><td>${Math.round(c.sStrat)}</td><td>${Mn(c.y26)}</td><td>${Mn(c.fc)}</td><td style="white-space:normal;min-width:160px">${esc(c.flags.join(' · '))}</td></tr>`).join('')+`</table></div>`;
  return H;};
// ---------- STAKEHOLDERS
ROUTES.stakeholders=function(){
  const m=M(),o=UI.stk.org;let H=pageHead('Stakeholder Map','Influence vs engagement for every doctor in your territory. The top-left quadrant — high influence, low engagement — is where your next visits belong.');
  H+=chipsRow([['all','All'],['Dallah','Dallah'],['Habib','Al Habib'],['Other','Other hospitals']],o,'stk.org');
  const D=m.docs.filter(d=>o==='all'||d.o===o);
  const jit=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))%1000;return (h/1000-.5)*.06;};const pts=D.map(d=>({x:clamp(d.eng+jit(d.n),0,1),y:clamp(d.infN+jit(d.n+'y'),0,1),r:d.c==='A'?5.5:3.8,c:d.c==='A'?'var(--warn)':'var(--brand2)',t:`${d.n} · ${d.sp} · Class ${d.c} · visits ${d.act}/${d.goal}`,go:'doctor/'+d.id}));
  const q1=D.filter(d=>d.infN>=.5&&d.eng<.5);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(D.length),'Doctors')}${kpi(String(D.filter(d=>d.c==='A').length),'Class A')}${kpi(String(q1.length),'High influence · low engagement',q1.length?'bad':'ok')}${kpi(p0(sum(D.map(d=>d.act))/Math.max(sum(D.map(d=>d.goal)),1)),'HQ visit attainment')}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Influence × engagement</h3>${scatterSvg(pts,{q1:'Prioritize',q2:'Deepen',q3:'Light touch',q4:'Maintain',xl:'Engagement (visits done ÷ goal)',yl:'Influence'})}<div class="note"><span class="dot" style="background:var(--warn)"></span>Class A <span class="dot" style="background:var(--brand2)"></span>Class B. Influence = specialty relevance to Zoron/Maxim/Meva × class. Tap a dot.</div></div>
  <div class="card"><h3>Priority list</h3>${[...D].sort((a,b)=>b.priority-a.priority).slice(0,10).map(d=>`<div class="row" data-go="doctor/${esc(d.id)}" style="cursor:pointer"><div class="l"><b>${esc(d.n)} <span class="badge ${d.c}">${d.c}</span></b><span>${esc(d.s)} · ${esc(d.sp)} · visits ${d.act}/${d.goal}</span></div><div style="text-align:right"><b>${Math.round(d.infN*100)}</b><div class="mt" style="font-size:11px">influence</div></div></div>`).join('')}</div></div>`;
  const sites={};D.forEach(d=>{const k=d.o+' · '+d.s;const s=sites[k]=sites[k]||{n:k,docs:0,A:0,Aseen:0,goal:0,act:0};s.docs++;s.goal+=d.goal;s.act+=d.act;if(d.c==='A'){s.A++;if(d.act>0)s.Aseen++;}});
  H+=`<div class="card scroll"><h3>Coverage by site</h3><table class="t"><tr><th>Site</th><th>Doctors</th><th>Visits</th><th>%</th><th>Class A seen</th></tr>`+Object.values(sites).sort((a,b)=>b.goal-a.goal).map(s=>`<tr><td>${esc(s.n)}</td><td>${s.docs}</td><td>${s.act}/${s.goal}</td><td class="${s.act/s.goal>=.8?'up':s.act/s.goal<.5?'dn':''}">${p0(s.act/s.goal)}</td><td class="${s.A&&s.Aseen<s.A?'dn':''}">${s.Aseen}/${s.A}</td></tr>`).join('')+'</table></div>';
  H+=`<div class="eyebrow">Decision roles — fill in what you know</div><div class="grid g2">`+['Dallah','Al Habib'].map(org=>`<div class="card"><h3>${org}</h3>${['Pharmacy director','Purchasing manager','P&T committee chair','ER head','Medicine head','Warehouse / stores'].map((r,i)=>`<div class="lab">${r}</div><div style="display:flex;gap:6px"><input class="tx" style="flex:2" data-note="role:${org}:${i}:name" placeholder="Name" value="${esc(S.notes['role:'+org+':'+i+':name']||'')}" ${READONLY?'disabled':''}><select class="tx" style="flex:1" data-note="role:${org}:${i}:st" ${READONLY?'disabled':''}>${['—','Champion','Supporter','Neutral','Skeptic','Blocker'].map(o=>`<option ${S.notes['role:'+org+':'+i+':st']===o?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')}</div>`).join('')+'</div>';
  return H;};
// ---------- DOCTORS
ROUTES.doctors=function(){
  const m=M(),F=UI.docs;let H=pageHead('Doctors','All 160 doctors in your HQ tracker: goals, visits, class and their share of the Q4 forecast in boxes.');
  const sites=['all',...new Set(m.docs.filter(d=>F.org==='all'||d.o===F.org).map(d=>d.s))];
  H+=chipsRow([['all','All'],['Dallah','Dallah'],['Habib','Al Habib'],['Other','Other']],F.org,'docs.org')+chipsRow(sites.map(s=>[s,s==='all'?'All sites':s]),F.site,'docs.site')+chipsRow([['all','Any class'],['A','Class A'],['B','Class B']],F.cls,'docs.cls')+chipsRow([['all','Any status'],['Not visited','Not visited'],['Remaining','Remaining'],['Completed','Completed']],F.st,'docs.st')+searchBox('dq','docs.q','Search doctor or specialty');
  const L=m.docs.filter(d=>(F.org==='all'||d.o===F.org)&&(F.site==='all'||d.s===F.site)&&(F.cls==='all'||d.c===F.cls)&&(F.st==='all'||d.st===F.st)&&(!F.q||(d.n+d.sp).toLowerCase().includes(F.q.toLowerCase()))).sort((a,b)=>b.priority-a.priority);
  H+=`<div class="note">${L.length} doctors · sorted by priority (influence × low engagement)</div><div class="card scroll"><table class="t"><tr><th class="tl">Doctor</th><th class="tl">Site</th><th class="tl">Specialty</th><th>Class</th><th>Visits</th><th>Status</th><th>Priority</th><th>Planned</th><th>Q4 boxes</th></tr>`+L.slice(0,200).map(d=>`<tr class="row" data-go="doctor/${esc(d.id)}"><td class="tl">${esc(d.n)}</td><td class="tl">${esc(d.o+' · '+d.s)}</td><td class="tl">${esc(d.sp)}</td><td><span class="badge ${d.c}">${d.c}</span></td><td>${d.act}/${d.goal}</td><td class="${d.st==='Completed'?'up':d.st==='Not visited'?'dn':''}">${d.st}</td><td>${Math.round(d.priority*100)}</td><td>${d.planned||'—'}</td><td>${d.fcT?bx(d.fcT):'—'}</td></tr>`).join('')+'</table></div>';
  return H;};
ROUTES.doctor=function(a){
  const m=M(),d=m.docs.find(x=>x.id===a[0]);if(!d)return pageHead('Doctor not found','')+`<div class="card"><button class="btn" data-go="doctors">Back</button></div>`;
  let H=pageHead(esc(d.n),`${esc(d.o)} · ${esc(d.s)} · ${esc(d.sp)}`,`<span class="badge ${d.c}" style="font-size:14px;padding:3px 10px">Class ${d.c}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(d.act+'/'+d.goal,'HQ visits',d.act>=d.goal?'ok':d.act===0?'bad':'warn',d.st)}${kpi(String(d.rem),'Remaining')}${kpi(Math.round(d.infN*100)+'','Influence score','',`${d.sp} · class ${d.c}`)}${kpi(d.fcT?bx(d.fcT)+' boxes':'—','Q4 forecast share (boxes)','',d.fcT?bx(d.fcD)+' direct + '+bx(d.fcI)+' indirect':'')}</div>`;
  H+=`<div class="card"><h3>Visit plan</h3><div class="mt">Planned days: ${esc(d.days||'—')} · Priority ${esc(d.prio)} · ${d.vpc} VPC · LCF ${d.lcf} · RCF ${d.rcf}</div>`+(d.vkey?D2.vis.filter(v=>v.k===d.vkey).map(v=>`<div class="row"><button class="tick" data-do="tick" data-k="${esc(v.d+'|'+v.k)}" style="${S.done[v.d+'|'+v.k]?'background:var(--ok);border-color:var(--ok);color:#fff':''}">${S.done[v.d+'|'+v.k]?'✓':''}</button><div class="l"><b>${dayLabel(v.d).long}</b></div></div>`).join(''):'<div class="note">No visit scheduled this week.</div>')+'</div>';
  if(d.fcT){const ks=[...new Set([...Object.keys(d.fcx),...Object.keys(d.fcxI)])].filter(k=>sum(d.fcx[k]||[0])+sum(d.fcxI[k]||[0])>0);
    H+=`<div class="card scroll"><h3>Q4 forecast share — boxes by product and month</h3><table class="t"><tr><th>Product</th><th>Direct</th><th>Indirect</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 total</th></tr>`+ks.map(k=>{const D=d.fcx[k]||[0,0,0],I=d.fcxI[k]||[0,0,0];return `<tr><td>${esc(k)}</td><td>${bx(sum(D))}</td><td>${bx(sum(I))}</td><td>${bx(D[0]+I[0])}</td><td>${bx(D[1]+I[1])}</td><td>${bx(D[2]+I[2])}</td><td><b>${bx(sum(D)+sum(I))}</b></td></tr>`;}).join('')+`<tr class="hl"><td><b>Total</b></td><td><b>${bx(d.fcD)}</b></td><td><b>${bx(d.fcI)}</b></td><td><b>${bx(d.fcm[0])}</b></td><td><b>${bx(d.fcm[1])}</b></td><td><b>${bx(d.fcm[2])}</b></td><td><b>${bx(d.fcT)}</b></td></tr></table><div class="note">Direct = the doctor's own hospital. Indirect = share of pharmacy/warehouse forecast. Both are allocations by specialty relevance and class (A = 2× B), not prescription data.</div></div>`;
    const pl=Object.entries(d.byPlace).map(([a,o])=>({a,ind:o.ind,t:sum(Object.values(o.rows).map(x=>sum(x)))})).sort((x,y)=>y.t-x.t);
    H+=`<div class="card scroll"><h3>Where these boxes come from</h3><table class="t"><tr><th>Place</th><th>Type</th><th>Boxes</th></tr>`+pl.slice(0,25).map(x=>`<tr class="row" data-go="board/${x.a}"><td><bdi>${esc(accNameById(x.a))}</bdi></td><td>${x.ind?'Indirect':'Direct'}</td><td><b>${bx(x.t)}</b></td></tr>`).join('')+`</table></div>`;}
  if(d.dal)H+=`<div class="card"><h3>Previous Dallah October box ask (before split)</h3><div class="chips">${['Z4','Z8','I4','I8','M5','M7','MV'].map((c,i)=>d.dal.m[i]?`<span class="tag">${c} ${d.dal.m[i]}</span>`:'').join('')}</div></div>`;
  H+=`<div class="card">${noteBox('doc:'+d.id,'Your notes','What does the doctor prescribe? Objections? Next step?')}</div>`;
  return H;};

// ---------- HABIB 360
ROUTES.habib=function(a){
  const m=M();if(a[0])return habibProd(a[0],m);
  const A=m.hAll,obj=HAB.habib.m.obj,F=UI.hab;
  const lines=[...new Set(HP.map(p=>p.line))];const L=lines.map(l=>({l,...hAgg(HP.filter(p=>p.line===l))})).sort((x,y)=>y.si-x.si);
  const LR={'GIT 1':'Abdullah','GIT 2':'Saleh','General 1':'Razan','General 2':'Dhai','Non-Promoted':'Vacant Non-Promoted','Pain & Antiinflamtory':'Vacant Prima'};
  let H=pageHead('Al Habib 360','Sulaiman Al Habib warehouse and hospitals · Jan–Aug 2026 · '+HP.length+' drugs',`<span>${pill('Overstock '+p0(A.gap/A.si),A.gap/A.si>.25?'warn':'ok')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(A.si),'Sell-in (our sales)','',`from the sales file`)}${kpi(Mn(A.so),'Sell-out (consumption)','',`units × net price`)}${kpi(Mn(A.gap),'Gap (overstock)','bad',p0(A.gap/A.si)+' of sell-in')}${kpi(fmt(A.u26),'Units 2026',A.yoy>0?'ok':'warn',pS(A.yoy)+' vs 2025')}${kpi(Mn(A.fv),'Forecast Sep–Dec','',p0(A.fv/obj)+' of '+Mn(obj)+' objective')}${kpi(Mn(m.hg2gap),'Overstock in GIT 2','warn','your line')}${kpi(String(m.docs.filter(d=>d.o==='Habib').length),'Doctors','',`${p0(sum(m.docs.filter(d=>d.o==='Habib').map(d=>d.act))/sum(m.docs.filter(d=>d.o==='Habib').map(d=>d.goal)))} HQ attainment`)}${kpi(m.hAcc?bx(m.hAcc.fbT)+' boxes':'—','Your Q4 forecast (boxes)','',m.hAcc?'SAR '+Mn(m.hAcc.fc)+' · '+p0(m.hAcc.fc/m.T.fcQ4)+' of total':'')}</div>`;
  H+=`<div class="card"><h3>How to read this</h3><div class="ins"><i>1</i><div><b>Sell-in</b> is what Jamjoom sold to the Habib warehouse. <b>Sell-out</b> is what Habib actually consumed (units × net price).</div></div><div class="ins"><i>2</i><div>The gap of ${Mn(A.gap)} means the warehouse bought more than it used — future orders can slow until stock clears.</div></div><div class="ins"><i>3</i><div>Sep–Dec forecast ${Mn(A.fv)} vs objective ${Mn(obj)} (${p0(A.fv/obj)}). <b>Two readings:</b> if the forecast is the required sell-in it covers the objective; if the overstock is deducted it is ${Mn(A.fv-A.gap)} (${p0((A.fv-A.gap)/obj)}). Confirm which applies.</div></div></div>`;
  H+=`<div class="col2"><div class="card"><h3>Monthly units: 2026 vs 2025 (sell-out)</h3>${svgMonthly(Array.from({length:8},(_,i)=>hsum(HP,p=>p.um26[i]||0)),Array.from({length:12},(_,i)=>i<8?hsum(HP,p=>p.um25[i]||0):null),null,8)}${legend()}</div>
  <div class="card scroll"><h3>By line and rep</h3><table class="t"><tr><th>Line</th><th>Rep</th><th>Sell-in</th><th>Sell-out</th><th>Gap</th><th>Units YoY</th><th>Forecast</th></tr>`+L.map(x=>`<tr class="row ${x.l==='GIT 2'?'hl':''}" data-do="ui" data-p="hab.line" data-v="${esc(x.l)}"><td>${esc(x.l)}${x.l==='GIT 2'?' ⭐':''}</td><td>${esc(RN[LR[x.l]]||'—')}</td><td>${Mn(x.si)}</td><td>${Mn(x.so)}</td><td class="${x.gap>.25*x.si?'dn':''}">${Mn(x.gap)}</td><td class="${cls(x.yoy)}">${pS(x.yoy)}</td><td>${Mn(x.fv)}</td></tr>`).join('')+`<tr class="hl"><td><b>Total</b></td><td></td><td><b>${Mn(A.si)}</b></td><td><b>${Mn(A.so)}</b></td><td><b>${Mn(A.gap)}</b></td><td class="${cls(A.yoy)}"><b>${pS(A.yoy)}</b></td><td><b>${Mn(A.fv)}</b></td></tr></table></div></div>`;
  const g2=HP.filter(p=>p.line==='GIT 2'),g2oct=hsum(g2,p=>p.price*(p.f[1]+p.f[2]+p.f[3]));
  H+=`<div class="card"><h3>Cross-check with your forecast file</h3><div class="ins"><i>🔗</i><div>Habib plan for Oct–Dec in GIT 2: <b>${Mn(g2oct)}</b> · your Q4 forecast for this account: <b>${m.hAcc?Mn(m.hAcc.fc):'—'}</b> (${m.hAcc?bx(m.hAcc.fbT):'—'} boxes). ${m.hAcc&&Math.abs(g2oct/m.hAcc.fc-1)<.15?'They agree within 15%.':'They differ — reconcile before the call.'}</div></div></div>`;
  H+=`<div class="eyebrow">Every drug — classification</div>`+chipsRow([['all','All'],...lines.map(l=>[l,l])],F.line,'hab.line')+searchBox('hq','hab.q','Search drug');
  const list=HP.filter(p=>(F.line==='all'||p.line===F.line)&&(!F.q||p.name.toLowerCase().includes(F.q.toLowerCase()))).sort((x,y)=>y.si-x.si);
  H+=`<div class="card scroll"><table class="t"><tr><th>Drug</th><th>Line</th><th>Brand</th><th>Class</th><th>Rep</th><th>Units</th><th>YoY</th><th>Sell-out</th><th>Sell-in</th><th>Gap</th><th>Fcst</th></tr>`+list.map(p=>{const u=sum(p.um26),b=sum(p.um25),gp=p.si-p.so;return `<tr class="row" data-go="habib/${esc(p.code)}"><td>${esc(PN(p.name))}</td><td>${esc(p.line)}</td><td>${esc(p.brand)}</td><td>${esc(p.cat||'—')}</td><td>${esc((p.reps.map(r=>RN[r]||r)[0])||'—')}</td><td>${fmt(u)}</td><td class="${cls(ypc(u,b))}">${pS(ypc(u,b))}</td><td>${Mn(p.so)}</td><td>${Mn(p.si)}</td><td class="${gp>.4*Math.max(p.si,1)&&gp>2000?'dn':''}">${Mn(gp)}</td><td>${p.fv?Mn(p.fv):'—'}</td></tr>`;}).join('')+'</table><div class="note">Tap a drug for monthly units, price and forecast. Gap = sell-in − sell-out (red when >40% and material).</div></div>';
  const hd=m.docs.filter(d=>d.o==='Habib');const sites={};hd.forEach(d=>{const s=sites[d.s]=sites[d.s]||{n:d.s,c:0,g:0,a:0,A:0,As:0,v:0};s.c++;s.g+=d.goal;s.a+=d.act;s.v+=d.fcT||0;if(d.c==='A'){s.A++;if(d.act)s.As++;}});
  H+=`<div class="eyebrow">Doctors</div><div class="card scroll"><table class="t"><tr><th>Branch</th><th>Doctors</th><th>HQ visits</th><th>%</th><th>Class A seen</th><th>Q4 boxes</th></tr>`+Object.values(sites).map(s=>`<tr class="row" data-go="doctors" data-do="ui" data-p="docs.org" data-v="Habib"><td>${esc(s.n)}</td><td>${s.c}</td><td>${s.a}/${s.g}</td><td class="${s.a/s.g>=.8?'up':s.a/s.g<.5?'dn':''}">${p0(s.a/s.g)}</td><td class="${s.As<s.A?'dn':''}">${s.As}/${s.A}</td><td>${bx(s.v)}</td></tr>`).join('')+`</table><button class="btn sec block" data-do="goDocs" data-org="Habib">Open Habib doctors list</button></div>`;
  const mv=HP.map(p=>({p,d:sum(p.um26)-sum(p.um25)})).filter(x=>x.d!==0).sort((x,y)=>y.d-x.d);
  const mr=x=>`<div class="row" data-go="habib/${esc(x.p.code)}" style="cursor:pointer"><div class="l"><b>${esc(PN(x.p.name))}</b><span>${esc(x.p.line)} · ${fmt(sum(x.p.um26))} vs ${fmt(sum(x.p.um25))}</span></div><b class="${cls(x.d)}">${x.d>0?'+':''}${fmt(x.d)}</b></div>`;
  H+=`<div class="col2"><div class="card"><h3>Biggest unit growth</h3>${mv.slice(0,5).map(mr).join('')}</div><div class="card"><h3>Biggest unit decline</h3>${mv.slice(-5).reverse().map(mr).join('')}</div></div>`;
  H+=`<div class="card"><h3>Habib plan</h3>${noteLine('hab:goal','Your target for Sep–Dec','Objective: '+Mn(obj))}${noteBox('hab:act','Actions','1) Agree order calendar vs consumption  2) …')}${noteBox('hab:risk','Risks','')}</div>`;
  return H;};
function habibProd(code,m){
  const p=HP.find(x=>x.code===code);if(!p)return pageHead('Not found','')+`<div class="card"><button class="btn" data-go="habib">Back</button></div>`;
  const u=sum(p.um26),b=sum(p.um25),gp=p.si-p.so;
  let H=pageHead(esc(p.name),`Code ${esc(p.code)} · ${esc(p.line)} · ${esc(p.brand)}`,`<span>${(p.reps.map(r=>`<span class="tag">${esc(RN[r]||r)}</span>`).join(''))}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(fmt(u),'Units 2026 (Jan–Aug)','',`${pS(ypc(u,b))} vs ${fmt(b)}`)}${kpi(String(p.price),'Net price (SAR)')}${kpi(Mn(p.so),'Sell-out')}${kpi(Mn(p.si),'Sell-in')}${kpi(Mn(gp),'Gap',gp>.4*Math.max(p.si,1)&&gp>2000?'bad':'')}${kpi(p.fu?fmt(p.fu):'—','Forecast units Sep–Dec','',p.fv?Mn(p.fv):'')}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Monthly units (sell-out)</h3>${svgMonthly(Array.from({length:8},(_,i)=>p.um26[i]||0),Array.from({length:12},(_,i)=>i<8?(p.um25[i]||0):null),null,8)}${legend()}</div><div class="card"><h3>Monthly sell-in (SAR)</h3>${svgMonthly(p.si26,p.si25,null,9)}${legend()}</div></div>`;
  H+=`<div class="card"><h3>Forecast Sep–Dec</h3>${p.fu?`<table class="t"><tr><th>Month</th><th>Units</th><th>Value</th></tr>`+['Sep','Oct','Nov','Dec'].map((mm,i)=>`<tr><td>${mm}</td><td>${fmt(p.f[i])}</td><td>${Mn(p.f[i]*p.price)}</td></tr>`).join('')+`<tr class="hl"><td><b>Total</b></td><td><b>${fmt(p.fu)}</b></td><td><b>${Mn(p.fv)}</b></td></tr></table>`:'<div class="note">No forecast for this drug.</div>'}</div>`;
  const ins=[];if(gp>.4*Math.max(p.si,1)&&gp>2000)ins.push('Sell-in is far above consumption — do not push new orders until stock clears.');if(ypc(u,b)!=null&&ypc(u,b)<-.2)ins.push('Consumption is down more than 20% — ask whether a competitor or a prescribing change explains it.');if(ypc(u,b)!=null&&ypc(u,b)>.2)ins.push('Strong growth — confirm stock and consider raising the forecast.');if(!p.fu&&u>0)ins.push('There is consumption but no forecast — decide whether to add it.');
  if(ins.length)H+=`<div class="card">${ins.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')}</div>`;
  if(p.d26&&p.d26.length)H+=`<div class="card"><h3>Same drug in Dallah</h3><div class="mt">Jan–Sep 2026: ${fmt(sum(p.d26))} units</div></div>`;
  H+=`<div class="card">${noteBox('hp:'+p.code,'Your notes on this drug','Competitor, reason for change, Habib request')}</div><button class="btn sec" data-go="habib">‹ All Habib drugs</button>`;
  return H;}
// ---------- DALLAH 360
ROUTES.dallah=function(){
  const m=M(),D=m.dal,S2=SALES.dallah,yy=ypc(D.y26,D.y25);
  const names={hosp:'Dallah Hospital',care:'Ri\'aya Dallah Medical',cp:'CP · Dallah Health Services',nmr:'Dallah Namar (entity)'};
  let H=pageHead('Dallah 360','Dallah hospital group: three entities, every product, stock position and doctors.');
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(D.y26),'Team sales YTD (Jan–Sep)','',`${pS(yy)} vs ${Mn(D.y25)}`)}${kpi(bx((ACCI['105301310003']||{fbT:0}).fbT+(ACCI['435040']||{fbT:0}).fbT)+' boxes','Your Q4 forecast (boxes)','',`SAR ${Mn(m.dal.fq4.hosp+m.dal.fq4.care)} · ${p0((m.dal.fq4.hosp+m.dal.fq4.care)/m.T.fcQ4)} of total`)}${kpi(String(m.day.items.filter(x=>x.st==='low').length),'Items under 1 month stock',m.day.items.filter(x=>x.st==='low').length?'bad':'ok','as of 30 Sep')}${kpi(String(m.docs.filter(d=>d.o==='Dallah').length),'Doctors','',`${p0(sum(m.docs.filter(d=>d.o==='Dallah').map(d=>d.act))/sum(m.docs.filter(d=>d.o==='Dallah').map(d=>d.goal)))} HQ attainment`)}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Team sales by month (SAR)</h3>${svgMonthly(D.m26,D.m25,null,9)}${legend()}</div><div class="card"><h3>Entities</h3>${D.ents.filter(e=>e.y26||e.y25).map(e=>`<div class="row"><div class="l"><b>${names[e.k]}</b></div><div style="text-align:right"><b>${Mn(e.y26)}</b> <span class="mt">vs ${Mn(e.y25)}</span> <span class="${cls(ypc(e.y26,e.y25))}">${pS(ypc(e.y26,e.y25))}</span></div></div>`).join('')}</div></div>`;
  const sh=Object.entries(S2.share26).sort((a,b)=>b[1]-a[1]),tot=sum(sh.map(x=>Math.max(x[1],0)));
  H+=`<div class="col2"><div class="card"><h3>Who sells in Dallah (2026)</h3>${sh.map(x=>`<div class="row"><div class="l"><b>${RN[x[0]]||x[0]}</b>${hbar(Math.max(x[1],0)/tot)}</div><div style="text-align:right"><b>${Mn(x[1])}</b><div class="mt" style="font-size:11px">${p0(Math.max(x[1],0)/tot)}</div></div></div>`).join('')}</div>
  <div class="card scroll"><h3>Top products in Dallah Hospital</h3><table class="t"><tr><th>Product</th><th>2026</th><th>2025</th><th>YoY</th></tr>`+S2.hosp.byprod.slice(0,9).map(p=>`<tr><td>${esc(PN(p[0]))}</td><td>${Mn(p[1])}</td><td>${Mn(p[2])}</td><td class="${cls(ypc(p[1],p[2]))}">${pS(ypc(p[1],p[2]))}</td></tr>`).join('')+'</table></div></div>';
  H+=`<div class="card scroll"><h3>Stock cover by item (30 Sep)</h3><table class="t"><tr><th>Place</th><th>Item</th><th>Aug</th><th>Sep</th><th>Stock</th><th>Cover (months)</th><th>Oct target</th><th>Status</th></tr>`+[...D2.items].sort((a,b)=>(a.cover??99)-(b.cover??99)).map(x=>`<tr><td>${x.place}</td><td>${x.item}</td><td>${fmt(x.aug)}</td><td>${fmt(x.sep)}</td><td>${fmt(x.stock)}</td><td class="${x.cover!=null&&x.cover<1?'dn':''}">${x.cover??'—'}</td><td>${fmt(x.target)}</td><td>${x.cover!=null&&x.cover<1?pill('Low','bad'):x.cover!=null&&x.cover>6?pill('Overstock','warn'):pill('OK','ok')}</td></tr>`).join('')+'</table></div>';
  const dd=m.docs.filter(d=>d.o==='Dallah');const sites={};dd.forEach(d=>{const s=sites[d.s]=sites[d.s]||{n:d.s,c:0,g:0,a:0,A:0,As:0};s.c++;s.g+=d.goal;s.a+=d.act;if(d.c==='A'){s.A++;if(d.act)s.As++;}});
  H+=`<div class="card scroll"><h3>Doctors by site</h3><table class="t"><tr><th>Site</th><th>Doctors</th><th>HQ visits</th><th>%</th><th>Class A seen</th></tr>`+Object.values(sites).map(s=>`<tr><td>${esc(s.n)}</td><td>${s.c}</td><td>${s.a}/${s.g}</td><td class="${s.a/s.g>=.8?'up':s.a/s.g<.5?'dn':''}">${p0(s.a/s.g)}</td><td class="${s.As<s.A?'dn':''}">${s.As}/${s.A}</td></tr>`).join('')+`</table><button class="btn sec block" data-do="goDocs" data-org="Dallah">Open Dallah doctors list</button></div>`;
  H+=`<div class="card"><h3>Dallah plan</h3>${noteLine('plan:DALLAH:goal','Your Q4 goal (SAR)',Mn(m.dal.fq4.hosp+m.dal.fq4.care)+' per forecast')}${noteBox('plan:DALLAH:act','Actions','1) Stock for Zoron 4 Tab  2) Visit key doctors  3) …')}${noteBox('plan:DALLAH:risk','Risks and competitors','')}</div>`;
  return H;};
// ---------- EXPLORER
const DIMS=[['line','Line'],['rep','Rep'],['brand','Brand'],['prod','Drug'],['cust','Customer'],['sub','Customer type'],['st','Strategic class']];
const DX=HAB.dims;
function dv(r,d){const P=DX.p[r[1]],C=DX.c[r[0]];switch(d){case 'line':return P[3];case 'rep':return RN[DX.r[r[2]]]||DX.r[r[2]];case 'brand':return P[2];case 'prod':return PN(P[1]);case 'cust':return String(C[1]).trim();case 'sub':return C[2];case 'st':return P[5];}return '';}
function expData(){const e=UI.ex;const rows=HAB.cube.filter(r=>Object.entries(e.f).every(([d,v])=>dv(r,d)===v));const g={};rows.forEach(r=>{const k=dv(r,e.dim);const o=g[k]=g[k]||{n:k,y26:0,y25:0,q4:0,bY:0,bF:0};o.y26+=r[3];o.y25+=r[4];o.q4+=r[5];o.bY+=r[7];o.bF+=r[8];});
  const list=Object.values(g).filter(o=>!e.q||o.n.toLowerCase().includes(e.q.toLowerCase())).sort((a,b)=>b.y26-a.y26);
  const tot=list.reduce((s,o)=>({y26:s.y26+o.y26,y25:s.y25+o.y25,q4:s.q4+o.q4,bY:s.bY+o.bY,bF:s.bF+o.bF}),{y26:0,y25:0,q4:0,bY:0,bF:0});return {list,tot};}
ROUTES.explorer=function(){
  const e=UI.ex,{list,tot}=expData(),dn=DIMS.find(d=>d[0]===e.dim)[1];
  let H=pageHead('Explorer','Slice YTD sales (SAR, Jan–Sep) by any dimension, then tap a row to drill down. Data covers the whole team.');
  H+=`<div class="lab">Group by</div><div class="chips">${DIMS.map(d=>`<button class="chip ${e.dim===d[0]?'on':''}" data-do="xdim" data-v="${d[0]}">${d[1]}</button>`).join('')}</div>`;
  const fl=Object.entries(e.f);if(fl.length)H+=`<div class="chips">${fl.map(([d,v])=>`<button class="chip on" data-do="xrm" data-v="${d}">${DIMS.find(x=>x[0]===d)[1]}: ${esc(v)} ✕</button>`).join('')}<button class="chip" data-do="xrm" data-v="*">Clear all</button></div>`;
  H+=searchBox('xq','ex.q','Search '+dn.toLowerCase());
  H+=`<div class="grid g3" style="margin-bottom:12px">${kpi(Mn(tot.y26),'YTD 2026')}${kpi(pS(ypc(tot.y26,tot.y25)),'vs '+Mn(tot.y25))}${kpi(tot.bY>0?p0(tot.y26/tot.bY):'—','of account targets',tot.bY>0&&tot.y26/tot.bY>=.8?'ok':'warn',Mn(tot.bY))}</div>`;
  const mx=Math.max(...list.map(o=>Math.max(o.y26,0)),1);
  H+=`<div class="card scroll"><table class="t"><tr><th>${dn}</th><th>YTD 2026</th><th></th><th>YoY</th><th>% target</th><th>Q4 2025</th><th>Share</th></tr>`+list.slice(0,80).map(o=>`<tr class="row" data-do="xdrill" data-v="${esc(o.n)}"><td>${esc(o.n.slice(0,34))}</td><td>${Mn(o.y26)}</td><td style="min-width:70px">${hbar(Math.max(o.y26,0)/mx)}</td><td class="${cls(ypc(o.y26,o.y25))}">${pS(ypc(o.y26,o.y25))}</td><td class="${o.bY>0&&o.y26/o.bY>=.8?'up':o.bY>0&&o.y26/o.bY<.5?'dn':''}">${o.bY>0?p0(o.y26/o.bY):'—'}</td><td>${Mn(o.q4)}</td><td>${tot.y26>0?p0(Math.max(o.y26,0)/tot.y26):'—'}</td></tr>`).join('')+`<tr class="hl"><td><b>Total</b></td><td><b>${Mn(tot.y26)}</b></td><td></td><td class="${cls(ypc(tot.y26,tot.y25))}"><b>${pS(ypc(tot.y26,tot.y25))}</b></td><td><b>${tot.bY>0?p0(tot.y26/tot.bY):'—'}</b></td><td><b>${Mn(tot.q4)}</b></td><td></td></tr></table><div class="note">${list.length} rows · % target = achieved ÷ account targets to Sep.</div><button class="btn sec block" data-do="xcopy">Copy table for Excel</button></div>`;
  return H;};
// ---------- CATALOG
ROUTES.catalog=function(){
  const m=M(),F=UI.cat,cube=HAB.cube,P=DX.p;
  const per=P.map((p,i)=>{const rs=cube.filter(r=>r[1]===i);const y26=sum(rs.map(r=>r[3])),y25=sum(rs.map(r=>r[4])),bY=sum(rs.map(r=>r[7])),bF=sum(rs.map(r=>r[8]));const reps=[...new Set(rs.filter(r=>r[3]!==0||r[7]>0).map(r=>RN[DX.r[r[2]]]||DX.r[r[2]]))];const places=new Set(rs.filter(r=>r[3]>0).map(r=>r[0])).size;const hb=HP.find(x=>x.code===p[0]);return {id:p[0],n:p[1],b:p[2],l:p[3],st:p[5],y26,y25,bY,bF,reps,places,hb};}).filter(x=>x.y26!==0||x.y25!==0||x.bF>0);
  const lines=['all',...new Set(per.map(x=>x.l))];
  let H=pageHead('Catalog','Every drug with its line, brand, class, owning rep, sales, targets, number of customers and Habib consumption.');
  H+=searchBox('cq','cat.q','Search drug or brand')+chipsRow(lines.map(l=>[l,l==='all'?'All lines':l]),F.line,'cat.line');
  const f=per.filter(x=>(F.line==='all'||x.l===F.line)&&(!F.q||(x.n+x.b).toLowerCase().includes(F.q.toLowerCase())));
  const by={};f.forEach(x=>{(by[x.l]=by[x.l]||[]).push(x);});
  Object.entries(by).sort((a,b)=>sum(b[1].map(x=>x.y26))-sum(a[1].map(x=>x.y26))).forEach(([l,arr])=>{H+=`<div class="eyebrow">${esc(l)} · ${Mn(sum(arr.map(x=>x.y26)))} · ${arr.length} drugs</div><div class="card scroll"><table class="t"><tr><th>Drug</th><th>Brand</th><th>Class</th><th>Rep</th><th>YTD</th><th>YoY</th><th>% target</th><th>Customers</th><th>Habib units</th></tr>`+arr.sort((a,b)=>b.y26-a.y26).map(x=>`<tr><td>${esc(PN(x.n))}</td><td>${esc(x.b)}</td><td>${esc(x.st)}</td><td>${esc(x.reps.slice(0,2).join(' · ')||'—')}</td><td>${Mn(x.y26)}</td><td class="${cls(ypc(x.y26,x.y25))}">${pS(ypc(x.y26,x.y25))}</td><td>${x.bY>0?p0(x.y26/x.bY):'—'}</td><td>${x.places}</td><td>${x.hb?`<a data-go="habib/${esc(x.hb.code)}" style="cursor:pointer;color:var(--brand2)">${fmt(sum(x.hb.um26))}</a>`:'—'}</td></tr>`).join('')+'</table></div>';});
  if(!f.length)H+='<div class="card">No results</div>';return H;};
// ---------- LINES & TEAM
ROUTES.lines=function(a){
  const m=M();const R=m.lines;
  if(a[0]){const r=R.find(x=>x.L.line===a[0]);if(r)return lineDetail(r);}
  const tot=R.reduce((s,r)=>({y:s.y+r.y,y25:s.y25+r.y25,b:s.b+r.b,fb:s.fb+r.fb}),{y:0,y25:0,b:0,fb:0});
  let H=pageHead('Lines & Team','Six lines and eight rep positions. Your line (GIT 2) is highlighted.');
  H+=`<div class="grid g3" style="margin-bottom:12px">${kpi(Mn(tot.y),'All lines YTD')}${kpi(p0(tot.y/tot.b),'of YTD target',tot.y/tot.b>=.8?'ok':'warn')}${kpi(pS(ypc(tot.y,tot.y25)),'vs 2025',ypc(tot.y,tot.y25)>=0?'ok':'bad')}</div>`;
  H+=`<div class="card scroll"><h3>Lines</h3><table class="t"><tr><th>Line</th><th>Rep(s)</th><th>YTD</th><th>% target</th><th>YoY</th><th>Annual target</th><th>Needed in Q4</th></tr>`+R.map(r=>`<tr class="row ${r.L.line==='GIT 2'?'hl':''}" data-go="lines/${esc(r.L.line)}"><td>${esc(r.L.line)}${r.L.line==='GIT 2'?' ⭐':''}</td><td>${r.L.reps.map(x=>RN[x]||x).join(', ')}</td><td>${Mn(r.y)}</td><td class="${r.ach>=.8?'up':r.ach<.6?'dn':''}">${p0(r.ach)}</td><td class="${cls(r.yoy)}">${pS(r.yoy)}</td><td>${Mn(r.fb)}</td><td>${Mn(r.need)}</td></tr>`).join('')+'</table></div>';
  H+=`<div class="card scroll"><h3>Team ranking</h3><table class="t"><tr><th>Rep</th><th>YTD</th><th>% target</th><th>YoY</th><th>Needed in Q4</th></tr>`+m.reps.map((r,i)=>`<tr class="${r.rep==='Saleh'?'hl':''}"><td>${i+1}. ${RN[r.rep]||r.rep}</td><td>${Mn(r.y)}</td><td class="${r.ach>=.8?'up':r.ach<.6?'dn':''}">${p0(r.ach)}</td><td class="${cls(r.yoy)}">${pS(r.yoy)}</td><td>${Mn(r.need)}</td></tr>`).join('')+`</table><div class="note">Team forecast for other reps is not in the files provided (only your line has a Q4 forecast).</div></div>`;
  return H;};
function lineDetail(r){
  const L=r.L;let H=pageHead(esc(L.line),L.reps.map(x=>RN[x]||x).join(' · '));
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(r.y),'YTD 2026')}${kpi(p0(r.ach),'of '+Mn(r.b),r.ach>=.8?'ok':'warn')}${kpi(pS(r.yoy),'vs '+Mn(r.y25))}${kpi(Mn(r.need),'Needed in Q4','',r.mult?r.mult.toFixed(1)+'× Q4 2025':'')}</div><div class="card">${svgMonthly(L.m26,L.m25,L.b26,9)}${legend()}</div>`;
  H+=`<div class="card scroll"><h3>By brand</h3><table class="t"><tr><th>Brand</th><th>YTD</th><th>% target</th><th>YoY</th><th>Annual target</th></tr>`+L.groups.filter(g=>Math.abs(g.y26)+g.fb>0).map(g=>`<tr><td>${esc(g.g)}</td><td>${Mn(g.y26)}</td><td class="${ach(g.y26,g.b)>=.8?'up':ach(g.y26,g.b)<.6?'dn':''}">${p0(ach(g.y26,g.b))}</td><td class="${cls(ypc(g.y26,g.y25))}">${pS(ypc(g.y26,g.y25))}</td><td>${Mn(g.fb)}</td></tr>`).join('')+'</table></div>';
  H+=`<div class="col2"><div class="card"><h3>Customer type</h3>${L.nat.filter(n=>n[1]||n[2]).map(n=>`<div class="row"><div class="l"><b>${esc(n[0])}</b></div><div style="text-align:right"><b>${Mn(n[1])}</b> <span class="mt">vs ${Mn(n[2])}</span> <span class="${cls(ypc(n[1],n[2]))}">${pS(ypc(n[1],n[2]))}</span></div></div>`).join('')}</div><div class="card"><h3>Strategic class</h3>${L.strat.map(s=>`<div class="row"><div class="l"><b>${esc(s[0])}</b></div><b>${Mn(s[1])}</b></div>`).join('')}</div></div><button class="btn sec" data-go="lines">‹ All lines</button>`;
  return H;}

// ---------- DAILY
const CODES=['Z4','Z8','I4','I8','M5','M7','MV'],HCODES=['Z4','Z8','I4','I8','M5','M7','MV','M135'];const PCODE={'Zoron 4 Tab':'Z4','Zoron 8 Tab':'Z8','Zoron 4 Inj':'I4','Zoron 8 Inj':'I8','Maxim 5s':'M5','Maxim 7s':'M7','Meva SR 200':'MV','Meva 135':'M135'};
ROUTES.daily=function(){
  const m=M(),d=m.day,mode=UI.day.mode;
  let H=pageHead('Daily','Today\'s visits, the end-of-day box log and the Dallah daily sales pace.');
  H+=tabs2([['visits','Visits'],['log','Log boxes'],['boxes','Box pace']],mode,'day.mode');
  H+=`<div class="chips">${MONTHS.map(x=>`<button class="chip ${d.mk===x.k?'on':''}" data-do="month" data-v="${x.k}">${x.n}</button>`).join('')}</div>`;
  if(mode==='visits'){
    const vd=[...new Set(D2.vis.filter(v=>v.d.startsWith(d.mk)).map(v=>v.d))].sort();
    if(!vd.length)return H+`<div class="card">No visit list for this month yet. Send the monthly HQ file and the list will appear here.</div>`;
    const sel=vd.includes(UI.day.sel)?UI.day.sel:pickDay(vd);
    const list=D2.vis.filter(v=>v.d===sel);const done=list.filter(v=>S.done[v.d+'|'+v.k]).length;
    H+=`<div class="chips">${vd.map(x=>`<button class="chip ${x===sel?'on':''}" data-do="ui" data-p="day.sel" data-v="${x}">${dayLabel(x).n} ${dayLabel(x).d}</button>`).join('')}</div><div class="card"><b>${done} of ${list.length}</b> visits done · ${dayLabel(sel).long}${hbar(list.length?done/list.length:0,'ok')}</div>`;
    H+=list.map(v=>{const dn=S.done[v.d+'|'+v.k];let nm,meta,ch,cl='';
      const dd=m.docs.find(x=>x.vkey===v.k);
      if(v.k.startsWith('HAB|')){const hd=HDOC.docs.find(x=>'HAB|'+x.n===v.k);if(!hd)return '';nm=hd.n;cl=hd.c;meta=`Al Habib · ${hd.h} · ${hd.sp} · HQ ${hd.act}/${hd.goal}`;}
      else{const dc=D2.docs.find(x=>x.h+'|'+x.n===v.k);if(!dc)return '';nm=dc.n;cl=dc.c;meta=`Dallah · ${dc.h} · ${dc.s}`;}
      ch=dd&&dd.fcT?Object.keys(dd.fcx).filter(k=>sum(dd.fcx[k])>0).map(k=>`<span class="tag">${PCODE[k]||k} ${bx(sum(dd.fcx[k])/3)}/mo</span>`).join(''):'';
      return `<div class="card visit ${dn?'done':''}"><button class="tick" data-do="tick" data-k="${esc(v.d+'|'+v.k)}">✓</button><div style="flex:1"><div class="nm"><b><bdi>${esc(nm)}</bdi></b> <span class="badge ${cl}">${cl}</span></div><div class="mt" style="font-size:13px">${esc(meta)}</div><div class="chips" style="margin:6px 0 0">${ch||'<span class="mt">No specific ask</span>'}</div></div></div>`;}).join('');
    H+=`<div class="note">Chips show the doctor's share of the Q4 forecast in boxes per month (from the Forecast Editor). Z = Zoron tab · I = injection · M = Maxim · MV = Meva SR · M135 = Meva 135.</div>`;
  }
  if(mode==='log'){
    const sel=d.days.includes(UI.day.logd)?UI.day.logd:pickDay(d.days),lg=S.log[sel]||{};const filled=d.items.filter(x=>Number(lg[x.i])>0).length;
    H+=`<div class="chips">${d.days.map(x=>`<button class="chip ${x===sel?'on':''}" data-do="ui" data-p="day.logd" data-v="${x}">${dayLabel(x).n} ${dayLabel(x).d}</button>`).join('')}</div><div class="card"><b>${filled}/${d.items.length}</b> items logged for ${dayLabel(sel).long}</div><div class="card">${d.items.map(x=>`<div class="row"><div class="l"><b>${esc(x.place)} · ${esc(x.item)}</b><span>Daily target ${(x.target/d.n).toFixed(1)}</span></div><div style="display:flex;gap:6px;align-items:center"><button class="btn sec" data-do="step" data-d="${sel}" data-i="${x.i}" data-s="-1" style="padding:8px 13px">−</button><input class="tx" style="width:64px;text-align:center;margin:0" type="number" inputmode="decimal" min="0" data-do="setlog" data-d="${sel}" data-i="${x.i}" value="${lg[x.i]!=null?lg[x.i]:''}" placeholder="0" ${READONLY?'disabled':''}><button class="btn sec" data-do="step" data-d="${sel}" data-i="${x.i}" data-s="1" style="padding:8px 13px">+</button></div></div>`).join('')}</div>`;
  }
  if(mode==='boxes'){
    const low=d.items.filter(x=>x.st==='low').length,beh=d.items.filter(x=>x.st==='behind').length;
    H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(fmt(d.target),'Month target (boxes)')}${kpi(fmt(d.actual),'Logged so far','',p0(d.target?d.actual/d.target:0)+' of target')}${kpi(d.proj==null?'—':p0(d.proj),'Projected month-end',d.proj>=.95?'ok':d.proj!=null&&d.proj<.8?'bad':'warn')}${kpi(d.need==null?'—':fmt(d.need),'Needed per day','',d.dData+' of '+d.n+' days logged')}${kpi(String(low),'Items under 1 month stock',low?'bad':'ok')}${kpi(String(beh),'Items behind pace',beh?'warn':'ok')}</div>`;
    H+=`<div class="grid g3">${['Nakheel','Namar','Pharmacies'].map(p=>{const it=d.items.filter(x=>x.place===p);const t=sum(it.map(x=>x.target)),a=sum(it.map(x=>x.actual));return `<div class="card"><b>${p}</b><div class="mt">${fmt(a)} / ${fmt(t)} boxes</div>${hbar(t?a/t:0)}</div>`;}).join('')}</div>`;
    H+=`<div class="card scroll"><table class="t"><tr><th>Item</th><th>Target</th><th>Actual</th><th>Projected</th><th>Cover (mo)</th><th>Status</th></tr>`+d.items.map(x=>`<tr><td>${esc(x.place)} · ${esc(x.item)}</td><td>${fmt(x.target)}</td><td>${fmt(x.actual)}</td><td>${x.proj==null?'—':p0(x.proj)}</td><td class="${x.cover!=null&&x.cover<1?'dn':''}">${x.cover??'—'}</td><td>${x.st==='low'?pill('Stock low','bad'):x.st==='behind'?pill('Behind','warn'):x.st==='ok'?pill('OK','ok'):pill('Not started','idle')}</td></tr>`).join('')+'</table></div>';
  }
  return H;};
// ---------- COMPETITIVE
const LINESX=[{k:'Zoron',re:/Zoron/i,mol:'Ondansetron (antiemetic)',ref:'Zofran (originator) + local generics',use:'ER · surgery · obstetrics · internal medicine'},{k:'Maxim',re:/Maxim/i,mol:'Moxifloxacin (antibiotic)',ref:'Avelox (Bayer) + generics',use:'ENT · chest · internal medicine'},{k:'Meva',re:/Meva/i,mol:'Mebeverine (IBS)',ref:'Duspatalin + generics',use:'GI · internal medicine · family medicine'}];
ROUTES.compete=function(){
  const m=M();let H=pageHead('Competitive','Where each line stands, where it is losing, and a place to log what you hear in the field.');
  H+=`<div class="card flat" style="background:var(--warnbg)"><b>Note:</b> your files contain no market-share data. Competitor names below are general references; add field evidence in the note boxes, or send an IQVIA/market report and I will build share and price-index views.</div>`;
  LINESX.forEach(L=>{
    const P=m.P.filter(p=>L.re.test(p.name));const y=sum(P.map(p=>p.y)),y25=sum(P.map(p=>p.y25)),yt=sum(P.map(p=>p.yt)),fc=sum(P.map(p=>p.fc));
    const pr=Object.entries(SALES.price).filter(x=>L.re.test(PN(x[0])));
    const weak=P.filter(p=>p.y25>0).map(p=>({p,y:ypc(p.y,p.y25)})).sort((a,b)=>a.y-b.y);
    H+=`<div class="eyebrow">${L.k} · ${L.mol}</div><div class="card"><div class="grid g4">${kpi(Mn(y),'YTD 2026')}${kpi(pS(ypc(y,y25)),'vs '+Mn(y25),ypc(y,y25)>=0?'ok':'bad')}${kpi(p0(ach(y,yt)),'of YTD target')}${kpi(Mn(fc),'Q4 forecast')}</div>`;
    H+=`<div class="scroll"><table class="t"><tr><th>Product</th><th>YTD</th><th>YoY</th><th>% target</th><th>List price</th><th>Net price</th><th>Discount</th></tr>`+P.map(p=>{const pp=SALES.price[Object.keys(SALES.price).find(k=>PN(k)===p.name)]||null;return `<tr><td>${esc(p.name)}</td><td>${Mn(p.y)}</td><td class="${cls(ypc(p.y,p.y25))}">${pS(ypc(p.y,p.y25))}</td><td>${p0(ach(p.y,p.yt))}</td><td>${pp?pp.list:'—'}</td><td>${pp?pp.net_w:'—'}</td><td>${pp?p0(1-pp.net_w/pp.list):'—'}</td></tr>`;}).join('')+'</table></div>';
    const b=[];if(weak.length&&weak[0].y<-.2)b.push(`⚠️ Loss signal: ${weak[0].p.name} ${pS(weak[0].y)} — is it price, stock or a competitor?`);if(weak.length&&weak[weak.length-1].y>.2)b.push(`✅ Strength: ${weak[weak.length-1].p.name} ${pS(weak[weak.length-1].y)} — invest here.`);b.push(`Reference competitor: ${L.ref} (general reference — verify in the field). Typical prescribers: ${L.use}.`);
    H+=b.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')+noteBox('comp:'+L.k,'Field notes: competitor, reason, doctor response','What are doctors and pharmacies telling you?')+'</div>';});
  H+=`<div class="eyebrow">Accounts losing the most</div><div class="card">${m.acc.filter(c=>c.y25>0).map(c=>({c,d:c.y26-c.y25})).sort((a,b)=>a.d-b.d).slice(0,6).map(x=>`<div class="row" data-go="account/${x.c.id}" style="cursor:pointer"><div class="l"><b>${acctName(x.c)}</b><span>${Mn(x.c.y26)} vs ${Mn(x.c.y25)}</span></div><b class="dn">${Mn(x.d)}</b></div>`).join('')}</div>`;
  return H;};
// ---------- INSIGHTS
ROUTES.insights=function(){
  const m=M();let H=pageHead('Insights','Findings synthesized from all your files: what the data says, why it matters, and what to do. Ranked by severity.');
  const order={bad:0,warn:1,ok:2,idle:3};const L=[...m.insights].sort((a,b)=>order[a.sev]-order[b.sev]);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(L.length),'Findings')}${kpi(String(L.filter(x=>x.sev==='bad').length),'High severity','bad')}${kpi(String(L.filter(x=>x.sev==='warn').length),'Watch','warn')}${kpi([...new Set(L.map(x=>x.theme))].length+'','Themes')}</div>`;
  H+=L.map(x=>`<div class="card"><div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">${pill(x.theme,x.sev==='bad'?'bad':x.sev==='warn'?'warn':'info')}<span class="tag">Confidence: ${x.conf}</span></div><b style="font-size:16px">${esc(x.head)}</b><div class="ins" style="margin-top:6px"><i>📊</i><div><b>Evidence.</b> ${esc(x.ev)}</div></div><div class="ins"><i>💡</i><div><b>So what.</b> ${esc(x.so)}</div></div><div class="ins"><i>➡️</i><div><b>Do.</b> ${esc(x.act)}</div></div><button class="btn sec" data-go="${esc(x.go)}">Open</button></div>`).join('');
  return H;};
// ---------- DATA HEALTH
ROUTES.health=function(){
  const m=M(),HY=m.hygiene;let H=pageHead('Data Health','An audit of your files and forecast: what is missing, inconsistent or risky, with a fix for each. Tick items as you resolve them.');
  const open=HY.list.filter(h=>S.notes['hyg:'+h.id]!=='1');
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(Math.round(HY.score)),'Data health score',RAG(HY.score))}${kpi(String(open.filter(h=>h.sev==='High').length),'High severity open','bad')}${kpi(String(open.filter(h=>h.sev==='Medium').length),'Medium open','warn')}${kpi(String(HY.list.length-open.length),'Resolved','ok')}</div>`;
  H+=['High','Medium','Low'].map(sv=>{const L=HY.list.filter(h=>h.sev===sv);if(!L.length)return '';return `<div class="eyebrow">${sv} severity</div><div class="card">${L.map(h=>`<div class="act"><button class="tick" data-do="hyg" data-id="${h.id}" style="flex:0 0 34px;height:34px;${S.notes['hyg:'+h.id]==='1'?'background:var(--ok);border-color:var(--ok);color:#fff':''}">${S.notes['hyg:'+h.id]==='1'?'✓':''}</button><div class="b"><b>${esc(h.t)} <span class="tag">${h.n}</span></b><span>${esc(h.det)}</span><div style="margin-top:4px"><b style="font-size:13px">Fix:</b> <span>${esc(h.fix)}</span></div></div></div>`).join('')}</div>`;}).join('');
  return H;};
// ---------- ASSETS
function assetManager(m){
  const T=m.T,h=m.health;
  const risks=m.actions.filter(a=>a.type==='protect').slice(0,4),asks=m.actions.slice(0,3);
  return {html:`<div class="paper"><h2>Manager Update — GIT 2 (Zoron · Maxim · Meva)</h2><div class="mt" style="color:#667">${dayLabel(TODAY).long} · Riyadh · Prepared by Saleh Al-Shahri</div>
  <h4>Position</h4><p><b>${ragWord[h.st]}</b> — health ${Math.round(h.score)}/100. Closing at <b>${p0(m.o)}</b> of the ${Mn(T.bgFY)} annual target at ${S.set.real}% forecast realization; risk-weighted ${p0(m.wo)}.</p>
  <div class="k"><div><b>${Mn(T.ytd26)}</b><span>YTD (Jan–Sep) · ${p0(T.ach)} of target</span></div><div><b>${pS(T.yoy)}</b><span>vs 2025 YTD</span></div><div><b>${Mn(T.gap)}</b><span>needed in Q4</span></div><div><b>${bx(m.alloc.totalBoxes)}</b><span>Q4 forecast (boxes) · SAR ${Mn(T.fcQ4)}</span></div></div>
  <h4>Forecast quality</h4><table><tr><th>Category</th><th>Boxes</th><th>SAR</th><th>Share</th></tr>${['commit','best','stretch','new'].map(k=>`<tr><td>${BK[k][0]}</td><td>${bx(m.bkB[k])}</td><td>${Mn(m.bk[k])}</td><td>${p0(m.bk[k]/T.fcQ4)}</td></tr>`).join('')}</table>
  <h4>Risks</h4><ul>${risks.map(a=>`<li>${esc(a.title)} — ${Mn(a.impact)} at stake</li>`).join('')}<li>Habib overstock: sell-in exceeds sell-out by ${Mn(m.hAll.gap)}</li></ul>
  <h4>Where we stand by line / product</h4><table><tr><th>Product</th><th>YTD</th><th>% target</th><th>Outlook</th></tr>${m.P.slice(0,8).map(p=>`<tr><td>${esc(p.name)}</td><td>${Mn(p.y)}</td><td>${p0(ach(p.y,p.yt))}</td><td>${p0(p.o)}</td></tr>`).join('')}</table>
  <h4>Asks</h4><ul>${asks.map(a=>`<li>${esc(a.title)} (owner: ${esc(a.owner)})</li>`).join('')}</ul></div>`,
  text:`MANAGER UPDATE — ${dayLabel(TODAY).long}\nPosition: ${ragWord[h.st]} (health ${Math.round(h.score)}). YTD ${Mn(T.ytd26)} = ${p0(T.ach)} of YTD target, ${pS(T.yoy)} vs 2025. Needed in Q4: ${Mn(T.gap)}. Forecast ${bx(m.alloc.totalBoxes)} boxes = SAR ${Mn(T.fcQ4)} (risk-weighted SAR ${Mn(m.weighted)}) → year at ${p0(m.o)} (${p0(m.wo)} risk-weighted).\nRisks:\n${risks.map(a=>'- '+a.title+' ('+Mn(a.impact)+')').join('\n')}\n- Habib overstock ${Mn(m.hAll.gap)}\nAsks:\n${asks.map(a=>'- '+a.title).join('\n')}`};}
function assetAccount(m,id){
  const c=m.acc.find(x=>x.id===id)||m.acc[0];const out=c.y26+c.fc;
  return {html:`<div class="paper"><h2>${esc(c.n.trim())}</h2><div style="color:#667">${esc(c.sub)} · ${TIERN[c.tier][0]} · Account one-pager · ${dayLabel(TODAY).long}</div>
  <div class="k"><div><b>${Mn(c.y26)}</b><span>YTD 2026 (${c.ach==null?'no target':p0(c.ach)+' of target'})</span></div><div><b>${pS(c.yoy)}</b><span>vs 2025 (${Mn(c.y25)})</span></div><div><b>${bx(c.fbT)}</b><span>Q4 forecast boxes (SAR ${Mn(c.fc)}; target ${Mn(c.q4T)})</span></div><div><b>${c.fyT>0?p0(out/c.fyT):'—'}</b><span>year outlook (${Mn(c.fyT)})</span></div></div>
  <h4>Q4 forecast by product (boxes)</h4><table><tr><th>Product</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th></tr>${c.fprods.slice(0,8).map(p=>`<tr><td>${esc(PN(p[0]))}</td><td>${bx(p[5][0])}</td><td>${bx(p[5][1])}</td><td>${bx(p[5][2])}</td><td><b>${bx(p[4])}</b></td></tr>`).join('')||'<tr><td colspan="5">No forecast</td></tr>'}</table>
  <h4>Read-out</h4><ul><li>Share of my YTD sales ${p0(c.share)}; ${c.bk?BK[c.bk][0]+' forecast ('+Mn(c.q425)+' Q4-2025)':'no forecast'}.</li>${c.flags.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
  <h4>Plan</h4><ul><li>Goal: ${esc(S.notes['plan:'+c.id+':goal']||'—')}</li><li>Actions: ${esc(S.notes['plan:'+c.id+':act']||'—')}</li><li>Risks: ${esc(S.notes['plan:'+c.id+':risk']||'—')}</li><li>Next meeting: ${esc(S.notes['plan:'+c.id+':next']||'—')}</li></ul></div>`,
  text:`${c.n.trim()} — ${TIERN[c.tier][0]}\nYTD ${Mn(c.y26)} (${pS(c.yoy)} vs 2025). Q4 forecast ${Mn(c.fc)} vs target ${Mn(c.q4T)}.`};}
ROUTES.assets=function(){
  const m=M(),A=UI.asset||{t:'pack',acc:M().acc[0].id};UI.asset=A;
  let H=pageHead('Assets','Ready-made documents from your data. Preview, copy the text, or print / save as PDF.',`<span class="noprint"><button class="btn" data-do="print">Print / PDF</button></span>`);
  H+=`<div class="noprint">`+tabs2([['pack','Forecast pack (boxes)'],['manager','Manager update'],['account','Account one-pager'],['forecast','Forecast script']],A.t,'asset.t');
  if(A.t==='account')H+=`<select class="tx" data-do="assetAcc">${m.acc.map(c=>`<option value="${c.id}" ${c.id===A.acc?'selected':''}>${esc(c.n.trim())}</option>`).join('')}</select>`;
  H+='</div>';
  let a;if(A.t==='pack')a=assetPack(m);else if(A.t==='manager')a=assetManager(m);else if(A.t==='account')a=assetAccount(m,A.acc);else a={html:`<div class="paper"><h2>Forecast call script</h2><pre style="white-space:pre-wrap;font:13.5px/1.6 Inter,system-ui">${esc(forecastText(m))}</pre></div>`,text:forecastText(m)};
  H+=a.html+`<div class="noprint" style="text-align:center"><button class="btn" data-do="copyText" data-t="${esc(a.text)}">Copy summary text</button></div>`;
  return H;};
// ---------- SOURCES
ROUTES.sources=function(){
  const rows=[['25 VS 26 YTD SEP R1 (6 sheets)','9745 sales rows + per-account targets (4875) + per-product monthly targets · 6 lines · 8 rep positions','Through Sep 2026','Lines, Plan, Accounts, Explorer'],['FORECAST Q4 R1 ZORON LINE','Q4 forecast for your line by account × product × month with net prices','Oct–Dec 2026','Forecast, Plan, Ideas'],['Dallah drug consumption (6 PDFs)','Consumption and stock for Nakheel, Namar, Pharmacies','Aug–Sep 2026, stock 30 Sep','Dallah 360, Daily, Data Health'],['HQ Tracker Sun–Wed','160 doctors, goals, visits, class, status; 120 planned visits','4 Oct 2026','Doctors, Stakeholders, Daily'],['Habib Sales Out YTG Plan','51 drugs: consumption, net price, system sales, Sep–Dec forecast, objective 1591000','Through Aug 2026','Al Habib 360'],['Al Habib Dashboard YTD AUG','Monthly units 2026 vs 2025 for 43 drugs','Jan–Aug 2026','Al Habib 360'],['Dashboard YTD JULY / SEP (Dallah)','Monthly units (Dallah) 2026 vs 2025','Jan–Sep 2026','Dallah 360']];
  let H=pageHead('Sources & Backup','Where every number comes from, how fresh it is, and how to back up your notes and logs.');
  H+=`<div class="card scroll"><table class="t"><tr><th>File</th><th>Contents</th><th>Period</th><th>Used in</th></tr>`+rows.map(r=>`<tr><td><b>${r[0]}</b></td><td style="white-space:normal;min-width:240px">${r[1]}</td><td>${r[2]}</td><td style="white-space:normal">${r[3]}</td></tr>`).join('')+'</table></div>';
  H+=`<div class="card"><h3>How updates work</h3><div class="ins"><i>1</i><div>Send the new file (sales, forecast, HQ tracker, consumption).</div></div><div class="ins"><i>2</i><div>I rebuild <b>index.html</b> and publish it to the same link.</div></div><div class="ins"><i>3</i><div>Your notes, ticks and logs stay on your device (or sync if your Claude storage is connected).</div></div></div>`;
  H+=`<div class="card"><h3>Backup your notes, visits and logs</h3><div class="note">Copy this text somewhere safe. Paste it back on another device to restore.</div><textarea class="tx" id="bk" style="direction:ltr;min-height:90px"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-do="bkexp">Export</button><button class="btn sec" data-do="bkimp">Import from text</button><button class="btn sec" data-do="share">Share view-only link</button></div></div>`;
  return H;};

// ---------- FORECAST EDITOR (boxes)
UI.fx={acc:'all',prod:'all',q:'',zero:false};
UI.dfc={g:'all',q:''};
const accNameById=id=>String((ACCI[id]||{n:id}).n).trim();
function fxLogPush(k,i,a,b,kind){S.fclog.unshift({t:new Date().toISOString(),k,m:i,a,b,kind:kind||'edit'});if(S.fclog.length>400)S.fclog.length=400;}
function fxSet(key,i,val){const r=FX.rows.find(x=>fxKey(x)===key);if(!r)return;const cur=fxEff(r);const nv=Math.max(0,Math.round(Number(val)||0));if(cur[i]===nv)return;const e=cur.slice();e[i]=nv;fxLogPush(key,i,cur[i],nv);const o=r.o.map(Math.round);if(e.every((x,k)=>x===o[k]))delete S.fc[key];else S.fc[key]=e;save();}
function fxScaleRows(rows,f,label){rows.forEach(r=>{const cur=fxEff(r);const e=cur.map(x=>Math.round(x*f));if(e.some((x,k)=>x!==cur[k])){fxLogPush(fxKey(r),-1,sum(cur),sum(e),label||'scale');const o=r.o.map(Math.round);if(e.every((x,k)=>x===o[k]))delete S.fc[fxKey(r)];else S.fc[fxKey(r)]=e;}});save();}
const fxTime=t=>{const d=new Date(t);return d.getDate()+' '+MS[d.getMonth()]+' '+pad(d.getHours())+':'+pad(d.getMinutes());};
ROUTES.fedit=function(){
  const m=M(),F=UI.fx,T=m.T;
  const prods=[...new Set(FX.rows.filter(r=>r.o0>0||r.tot>0).map(r=>r.pn))];
  const accs=SALES.cust.filter(c=>FX.rows.some(r=>r.a===c.id&&(r.o0>0||r.tot>0))).sort((a,b)=>b.fbT-a.fbT);
  const rows=FX.rows.filter(r=>(F.acc==='all'||r.a===F.acc)&&(F.prod==='all'||r.pn===F.prod)&&(F.zero||r.tot>0||r.o0>0)&&(!F.q||(accNameById(r.a)+' '+r.pn).toLowerCase().includes(F.q.toLowerCase()))).sort((a,b)=>b.tot-a.tot);
  const tb=m.alloc.totalBoxes,ob=m.alloc.origBoxes;
  let H=pageHead('Forecast Editor','Edit your Q4 forecast in boxes by account, product and month. Every change is logged, and the whole dashboard (outlook, buckets, doctor split, daily targets) updates immediately.',`<span class="noprint"><button class="btn" data-go="board">Place Board</button> <button class="btn" data-go="assets" data-do="packgo">Manager pack</button></span>`);
  H+=`<div class="card flat" style="border-color:var(--brand2)"><b>Source: your forecast sheet</b> ("Q4 – Months", Medical rep = Saleh). ${FX.rows.filter(r=>r.o0>0).length} account × drug rows · ${bx(ob)} boxes loaded exactly as in the sheet. <button class="btn sec" data-go="split" style="margin-left:8px">See the split by drug · place · doctor</button></div><div class="grid g4" style="margin-bottom:12px">${kpi(bx(tb),'Forecast now (boxes)',tb>=ob?'ok':'warn',`SAR ${Mn(T.fcQ4)}`)}${kpi(bx(ob),'Original forecast (boxes)','',`SAR ${Mn(sum(FX.rows.map(r=>r.o0*r.price)))}`)}${kpi((tb-ob>0?'+':'')+bx(tb-ob),'Change (boxes)',tb-ob===0?'':tb-ob>0?'ok':'bad',`SAR ${(T.fcQ4-sum(FX.rows.map(r=>r.o0*r.price)))>=0?'+':''}${Mn(T.fcQ4-sum(FX.rows.map(r=>r.o0*r.price)))}`)}${kpi(String(S.fclog.length),'Changes logged','',S.fclog.length?'Last: '+fxTime(S.fclog[0].t):'No edits yet')}${kpi(p0(m.o),'Year outlook now',m.o>=.95?'ok':'warn',`Risk-weighted ${p0(m.wo)}`)}</div>`;
  H+=`<div class="card"><h3>Quick tools</h3><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn sec" data-do="fxhair">Haircut Stretch ×0.5 and No-history ×0.3</button><span style="display:inline-flex;gap:6px;align-items:center"><input class="tx" id="fxpct" type="number" value="100" style="width:90px;margin:0" min="0"><button class="btn sec" data-do="fxscale">Scale shown rows by %</button></span><button class="btn ghost" data-do="fxresetall">Reset all to original</button></div><div class="note">"Scale shown rows" applies to the rows currently visible below (use the filters first).</div></div>`;
  H+=`<div class="card"><div class="grid g3"><div><div class="lab">Account</div><select class="tx" data-do="fxfilter" data-k="acc"><option value="all">All accounts</option>${accs.map(c=>`<option value="${c.id}" ${F.acc===c.id?'selected':''}>${esc(c.n.trim())} — ${bx(c.fbT)}</option>`).join('')}</select></div><div><div class="lab">Product</div><select class="tx" data-do="fxfilter" data-k="prod"><option value="all">All products</option>${prods.map(p=>`<option ${F.prod===p?'selected':''}>${p}</option>`).join('')}</select></div><div><div class="lab">Search</div><input class="tx" id="fxq" data-live="fx.q" placeholder="account or product" value="${esc(F.q)}"></div></div><label style="font-size:13px"><input type="checkbox" data-do="fxzero" ${F.zero?'checked':''}> Show rows that have no forecast yet (so you can add boxes)</label></div>`;
  H+=`<div class="card scroll"><table class="t"><tr><th>Account</th><th>Product</th><th>Price (SAR/box)</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th><th>Original</th><th>Change</th><th>SAR</th><th></th></tr>`+rows.slice(0,150).map(r=>{const o=r.o0,t=r.tot;return `<tr><td><bdi>${esc(accNameById(r.a).slice(0,26))}</bdi></td><td>${esc(r.pn)}</td><td>${(+r.price).toFixed(2)}</td>`+[0,1,2].map(i=>`<td><input class="tx" style="width:84px;margin:0;text-align:right;${r.e[i]!==Math.round(r.o[i])?'border-color:var(--warn);background:var(--warnbg)':''}" type="number" inputmode="numeric" min="0" step="1" data-fxk="${esc(fxKey(r))}" data-fxi="${i}" value="${r.e[i]}" ${READONLY?'disabled':''}></td>`).join('')+`<td><b>${bx(t)}</b></td><td class="mt">${bx(o)}</td><td class="${t-o>0?'up':t-o<0?'dn':''}">${t===o?'—':(t-o>0?'+':'')+bx(t-o)}</td><td>${Mn(t*r.price)}</td><td>${t!==o?`<button class="btn ghost" style="padding:4px 9px;font-size:12px" data-do="fxreset" data-k="${esc(fxKey(r))}">Reset</button>`:''}</td></tr>`;}).join('')+`<tr class="hl"><td colspan="3"><b>Shown rows</b></td>${[0,1,2].map(i=>`<td><b>${bx(sum(rows.map(r=>r.e[i])))}</b></td>`).join('')}<td><b>${bx(sum(rows.map(r=>r.tot)))}</b></td><td>${bx(sum(rows.map(r=>r.o0)))}</td><td></td><td><b>${Mn(sum(rows.map(r=>r.tot*r.price)))}</b></td><td></td></tr></table><div class="note">${rows.length} rows${rows.length>150?' (first 150 shown — use the filters)':''}. Type a number and press Enter or leave the field. Edited cells are highlighted. Whole boxes only.</div><button class="btn sec block" data-do="fxcopy">Copy table for Excel / WhatsApp</button></div>`;
  H+=`<div class="eyebrow">Versions (show your manager how it evolved)</div><div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="tx" id="fxv" placeholder="Version name, e.g. After Habib call" style="flex:1;margin:0"><button class="btn" data-do="fxsnap">Save version</button></div>`+(S.fcsnap.length?S.fcsnap.map((s,i)=>`<div class="row"><div class="l"><b>${esc(s.name)}</b><span>${fxTime(s.t)} · ${bx(s.boxes)} boxes · SAR ${Mn(s.sar)} · ${s.edits} changes</span></div><button class="btn ghost" data-do="fxrestore" data-i="${i}" style="padding:6px 12px">Restore</button></div>`).join(''):'<div class="note">No saved versions yet.</div>')+`</div>`;
  H+=`<div class="eyebrow">Change log</div><div class="card scroll">`+(S.fclog.length?`<table class="t"><tr><th>When</th><th>Account · Product</th><th>Month</th><th>From</th><th>To</th></tr>`+S.fclog.slice(0,40).map(l=>{const [a,pn]=String(l.k).split('|');return `<tr><td>${fxTime(l.t)}</td><td><bdi>${esc(accNameById(a).slice(0,26))}</bdi> · ${esc(pn||'')}</td><td>${l.m>=0?MS[9+l.m]:'All (Q4)'}</td><td>${bx(l.a)}</td><td>${bx(l.b)}</td></tr>`;}).join('')+'</table>':'<div class="note">No edits yet. Every change you make is recorded here with its time.</div>')+`</div>`;
  return H;};
// ---------- MANAGER PACK (boxes)
function assetPack(m){
  const A=m.alloc,T=m.T;const edits=S.fclog.length;
  const byAcc=SALES.cust.filter(c=>c.fbT>0||c.fb0>0).sort((a,b)=>b.fbT-a.fbT);
  const byp={};FX.rows.forEach(r=>{const o=byp[r.pn]=byp[r.pn]||{e:[0,0,0],o:0,v:0};r.e.forEach((u,i)=>o.e[i]+=u);o.o+=r.o0;o.v+=r.tot*r.price;});
  const grp=A.groups.filter(g=>g.boxes>0);
  const html=`<div class="paper"><h2>Q4 Forecast Pack — boxes</h2><div style="color:#667">GIT 2 (Zoron · Maxim · Meva) · Riyadh · ${dayLabel(TODAY).long} · Prepared by Saleh Al-Shahri</div>
  <div class="k"><div><b>${bx(A.totalBoxes)}</b><span>Q4 forecast (boxes)</span></div><div><b>${Mn(T.fcQ4)}</b><span>Q4 value (SAR)</span></div><div><b>${bx(A.origBoxes)}</b><span>original upload (boxes)</span></div><div><b>${edits}</b><span>edits made${edits?' · last '+fxTime(S.fclog[0].t):''}</span></div></div>
  <h4>How the boxes reach doctors</h4><p style="font-size:13px">${bx(A.directBoxes)} boxes go directly to the doctors of their hospital; ${bx(A.indirectBoxes)} boxes sell through pharmacies and warehouses and are spread across all ${m.docs.length} territory doctors as an indirect allocation.</p><h4>By month</h4><table><tr><th></th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th></tr><tr><td>Boxes</td>${[0,1,2].map(i=>`<td>${bx(sum(byAcc.map(c=>c.fb[i])))}</td>`).join('')}<td><b>${bx(A.totalBoxes)}</b></td></tr><tr><td>SAR</td>${[0,1,2].map(i=>`<td>${Mn(sum(byAcc.map(c=>c.fcm[i])))}</td>`).join('')}<td><b>${Mn(T.fcQ4)}</b></td></tr></table>
  <h4>By product</h4><table><tr><th>Product</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th><th>Original</th><th>SAR</th></tr>${Object.entries(byp).filter(x=>sum(x[1].e)>0||x[1].o>0).sort((a,b)=>sum(b[1].e)-sum(a[1].e)).map(([k,o])=>`<tr><td>${esc(k)}</td><td>${bx(o.e[0])}</td><td>${bx(o.e[1])}</td><td>${bx(o.e[2])}</td><td><b>${bx(sum(o.e))}</b></td><td>${bx(o.o)}</td><td>${Mn(o.v)}</td></tr>`).join('')}</table>
  <h4>By account</h4><table><tr><th>Account</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th><th>Original</th><th>SAR</th></tr>${byAcc.map(c=>`<tr><td>${esc(c.n.trim())}</td><td>${bx(c.fb[0])}</td><td>${bx(c.fb[1])}</td><td>${bx(c.fb[2])}</td><td><b>${bx(c.fbT)}</b></td><td>${bx(c.fb0)}</td><td>${Mn(c.fc)}</td></tr>`).join('')}</table>
  ${grp.map(g=>{const used=DOCP.filter(p=>g.docs.some(d=>(d.fcx[p]||[]).some(x=>x>0)));return `<h4>Doctor split — ${esc(g.name.replace(/ \(.*/,''))} (${bx(g.alloc)} boxes)</h4><table><tr><th>Doctor</th><th>Spec.</th><th>Cl.</th>${used.map(p=>`<th>${p.replace('Zoron','Z').replace('Maxim','M').replace('Meva','Mv')}</th>`).join('')}<th>Q4</th></tr>${[...g.docs].sort((a,b)=>b.fcT-a.fcT).filter(d=>d.fcT>0).map(d=>`<tr><td>${esc(d.n)}</td><td>${esc(d.sp)}</td><td>${d.c}</td>${used.map(p=>`<td>${bx(sum(d.fcx[p]||[0]))}</td>`).join('')}<td><b>${bx(d.fcT)}</b></td></tr>`).join('')}</table>`;}).join('')}
  ${edits?`<h4>Edit trail (${edits} changes)</h4><table><tr><th>When</th><th>Account · Product</th><th>Month</th><th>From</th><th>To</th></tr>${S.fclog.slice(0,30).map(l=>{const [a,pn]=String(l.k).split('|');return `<tr><td>${fxTime(l.t)}</td><td>${esc(accNameById(a).slice(0,28))} · ${esc(pn||'')}</td><td>${l.m>=0?MS[9+l.m]:'Q4'}</td><td>${bx(l.a)}</td><td>${bx(l.b)}</td></tr>`;}).join('')}</table>`:''}
  ${S.fcsnap.length?`<h4>Saved versions</h4><ul>${S.fcsnap.map(s=>`<li>${esc(s.name)} — ${fxTime(s.t)} — ${bx(s.boxes)} boxes</li>`).join('')}</ul>`:''}
  <div style="margin-top:12px;font-size:12px;color:#667">Method: forecast boxes per account × product × month from the Q4 forecast file, adjusted by the rep. Doctor split = allocation by specialty relevance and class (A = 2× B); it guides visit priorities and is not prescription data.</div></div>`;
  const text=`Q4 FORECAST PACK (boxes) — ${dayLabel(TODAY).long}\nTotal ${bx(A.totalBoxes)} boxes (original ${bx(A.origBoxes)}; ${edits} edits) = SAR ${Mn(T.fcQ4)}\nOct ${bx(sum(byAcc.map(c=>c.fb[0])))} · Nov ${bx(sum(byAcc.map(c=>c.fb[1])))} · Dec ${bx(sum(byAcc.map(c=>c.fb[2])))}\n`+Object.entries(byp).filter(x=>sum(x[1].e)>0).sort((a,b)=>sum(b[1].e)-sum(a[1].e)).map(([k,o])=>`- ${k}: ${bx(sum(o.e))} boxes`).join('\n')+'\nTop accounts:\n'+byAcc.slice(0,8).map(c=>`- ${c.n.trim()}: ${bx(c.fbT)} boxes`).join('\n');
  return {html,text};}

// ---------- PLACE BOARD: each place (account) exactly as in the sheet, with its doctors
UI.bd={f:'all',q:'',dq:'',dgrp:'all'};
ROUTES.board=function(a){
  const m=M(),A=m.alloc;
  if(a[0])return boardPlace(a[0],m);
  const F=UI.bd;
  let H=pageHead('Place Board','Every place from your forecast sheet with its exact boxes, and under each place the doctors who share those boxes. Open a place to edit its numbers and each doctor\'s share.',`<span class="noprint"><button class="btn sec" data-go="fedit">All rows editor</button> <button class="btn sec" data-go="docfc">Doctor totals</button></span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(A.totalBoxes),'Total forecast (boxes)','',`${A.places.length} places`)}${kpi(bx(A.directBoxes),'Direct to doctors (hospitals)','ok',p0(A.directBoxes/A.totalBoxes))}${kpi(bx(A.indirectBoxes),'Indirect (pharmacy / warehouse)','warn',p0(A.indirectBoxes/A.totalBoxes)+' split across all doctors')}${kpi(String(Object.keys(S.dpin).length),'Doctor numbers you set','',Object.keys(S.dpin).length?'pinned by you':'automatic split')}</div>`;
  H+=chipsRow([['all','All places'],['direct','Hospitals (direct)'],['indirect','Pharmacy / warehouse'],['edited','Edited']],F.f,'bd.f')+searchBox('bq','bd.q','Search place');
  const L=A.places.filter(p=>(F.f==='all'||(F.f==='direct'&&p.direct)||(F.f==='indirect'&&!p.direct)||(F.f==='edited'&&p.boxes!==p.orig))&&(!F.q||p.name.toLowerCase().includes(F.q.toLowerCase())));
  H+=`<div class="note">${L.length} places · tap to open</div>`+L.map(p=>{const c=ACCI[p.acc]||{};const nd=p.direct?p.docs.length:m.docs.length;
    return `<div class="card" data-go="board/${p.acc}" style="cursor:pointer"><div class="row" style="border:0;padding:0"><div class="l"><b><bdi>${esc(p.name)}</bdi></b><span>${p.direct?'Hospital · '+nd+' doctors share this directly':'Pharmacy / warehouse · split across all '+nd+' territory doctors (indirect)'}</span></div><div style="text-align:right"><b style="font-size:18px">${bx(p.boxes)}</b><div class="${p.boxes>p.orig?'up':p.boxes<p.orig?'dn':'mt'}" style="font-size:12px">${p.boxes===p.orig?'as in sheet':(p.boxes>p.orig?'+':'')+bx(p.boxes-p.orig)+' vs sheet'}</div></div></div><div class="chips" style="margin:8px 0 0">${p.prow.slice(0,6).map(x=>`<span class="tag">${esc(x.r.pn)} ${bx(x.r.tot)}</span>`).join('')}</div></div>`;}).join('');
  return H;};
function boardPlace(id,m){
  const p=m.alloc.places.find(x=>x.acc===id);const c=ACCI[id];
  if(!p||!c)return pageHead('Place not found','')+`<div class="card"><button class="btn" data-go="board">Back</button></div>`;
  const rowsAll=FX.rows.filter(r=>r.a===id&&(r.tot>0||r.o0>0)).sort((a,b)=>b.tot-a.tot);
  let H=pageHead(esc(p.name),p.direct?`Hospital forecast shared directly by ${p.docs.length} doctors`:'Pharmacy / warehouse forecast — split indirectly across all territory doctors',`<span class="noprint"><button class="btn sec" data-go="board">‹ All places</button> <button class="btn sec" data-go="account/${id}">Account page</button></span>`);
  const tb=sum(rowsAll.map(r=>r.tot)),ob=sum(rowsAll.map(r=>r.o0));
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(tb),'Q4 boxes (this place)',tb>=ob?'ok':'warn',`SAR ${Mn(sum(rowsAll.map(r=>r.tot*r.price)))}`)}${kpi(bx(ob),'As in your sheet')}${kpi(['Oct','Nov','Dec'].map((x,i)=>x+' '+bx(sum(rowsAll.map(r=>r.e[i])))).join(' · '),'By month','')}${kpi(String(p.direct?p.docs.length:m.docs.length),p.direct?'Doctors sharing':'Doctors in the pool')}</div>`;
  // place numbers
  H+=`<div class="eyebrow">1 · Forecast for this place (edit — same rows as your sheet)</div><div class="card scroll"><table class="t"><tr><th>Product</th><th>Price</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th><th>Sheet</th><th>Change</th></tr>`+rowsAll.map(r=>`<tr><td>${esc(r.pn)}</td><td>${(+r.price).toFixed(2)}</td>`+[0,1,2].map(i=>`<td><input class="tx" style="width:84px;margin:0;text-align:right;${r.e[i]!==Math.round(r.o[i])?'border-color:var(--warn);background:var(--warnbg)':''}" type="number" inputmode="numeric" min="0" step="1" data-fxk="${esc(fxKey(r))}" data-fxi="${i}" value="${r.e[i]}" ${READONLY?'disabled':''}></td>`).join('')+`<td><b>${bx(r.tot)}</b></td><td class="mt">${bx(r.o0)}</td><td class="${r.tot>r.o0?'up':r.tot<r.o0?'dn':''}">${r.tot===r.o0?'—':(r.tot>r.o0?'+':'')+bx(r.tot-r.o0)}</td></tr>`).join('')+`<tr class="hl"><td colspan="2"><b>Total</b></td>${[0,1,2].map(i=>`<td><b>${bx(sum(rowsAll.map(r=>r.e[i])))}</b></td>`).join('')}<td><b>${bx(tb)}</b></td><td>${bx(ob)}</td><td></td></tr></table></div>`;
  // doctors split
  const prow=p.prow;const prods=prow.map(x=>x.r.pn);
  const docs=p.direct?p.docs:[...m.docs];
  const q=UI.bd.dq.toLowerCase();
  const cellOf=(d,pn)=>{const x=prow.find(y=>y.r.pn===pn);if(!x)return null;const part=x.parts.find(z=>z.d.id===d.id);return part?{v:sum(part.e),pin:part.pin,r:x.r}:null;};
  let list=docs.map(d=>({d,t:sum(prods.map(pn=>(cellOf(d,pn)||{v:0}).v))})).filter(x=>(!q||(x.d.n+x.d.sp+x.d.s).toLowerCase().includes(q))).sort((a,b)=>b.t-a.t);
  const total=list.length;const shown=p.direct?list:list.slice(0,50);
  const manual=!!S.manual[id];
  const asg=prow.map(x=>({pn:x.r.pn,tot:x.r.tot,a:sum(x.parts.map(z=>sum(z.e)))}));
  const TT=sum(asg.map(x=>x.tot)),AA=sum(asg.map(x=>x.a)),RR=TT-AA;
  H+=`<div class="eyebrow">2 · Split across doctors (boxes, Q4 by product)</div>`;
  H+=`<div class="stickybar"><div class="sb2"><div><b>${bx(TT)}</b><span>PLACE TOTAL (boxes)</span></div><div><b>${bx(AA)}</b><span>Assigned to doctors</span></div><div><b style="color:var(--${RR===0?'ok':RR>0?'warn':'bad'})">${bx(Math.abs(RR))}</b><span>${RR===0?'Balanced ✓':RR>0?'Remaining to assign':'Over-assigned'}</span></div><div style="flex:1;min-width:200px">${asg.map(x=>`<span class="tag" style="background:var(--${x.tot===x.a?'okbg':x.a<x.tot?'warnbg':'badbg'});color:var(--${x.tot===x.a?'ok':x.a<x.tot?'warn':'bad'})">${esc(x.pn)}: ${bx(x.a)}/${bx(x.tot)}</span>`).join('')}</div></div></div>`;
  H+=`<div class="card"><div class="note" style="margin:0 0 8px">${manual?'<b>Manual mode:</b> every number is yours. The bar above shows how many boxes of the place total are still unassigned (or over-assigned). Make each product reach its total.':(p.direct?'These doctors share the place\'s boxes. ':'This place sells through a pharmacy/warehouse, so its boxes are spread across every territory doctor by specialty and class. ')+'Type a number to <b>pin</b> a doctor\'s share; the other doctors automatically share what is left, so the total always equals the place.'}</div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input class="tx" id="bdq" data-live="bd.dq" placeholder="Search doctor / specialty / site" value="${esc(UI.bd.dq)}" style="flex:1;min-width:200px;margin:0"><button class="btn ${manual?'':'sec'}" data-do="manualtoggle" data-id="${id}">${manual?'✓ Manual mode (tap to go back to auto)':'Switch to manual split'}</button>${manual?`<button class="btn sec" data-do="fillrem" data-id="${id}">Auto-fill what is left</button>`:''}<button class="btn ghost" data-do="resplit" data-id="${id}">Re-split automatically</button></div></div>`;
  H+=`<div class="card scroll"><table class="t"><tr><th>Doctor</th><th>Spec.</th><th>Class</th>${prods.map(pn=>`<th>${pn}</th>`).join('')}<th>Oct</th><th>Nov</th><th>Dec</th><th>Q4</th></tr>`+shown.map(({d,t})=>{const mo=[0,1,2].map(i=>sum(prow.map(x=>{const z=x.parts.find(y=>y.d.id===d.id);return z?z.e[i]:0;})));return `<tr><td><a data-go="doctor/${esc(d.id)}" style="cursor:pointer;color:var(--brand2)">${esc(d.n)}</a><div class="mt" style="font-size:11px">${esc(d.s)}</div></td><td>${esc(d.sp)}</td><td><span class="badge ${d.c}">${d.c}</span></td>${prods.map(pn=>{const z=cellOf(d,pn);if(!z)return '<td>—</td>';return `<td><input class="tx" style="width:70px;margin:0;text-align:right;${z.pin!=null?'border-color:var(--brand2);background:var(--chip)':''}" type="number" inputmode="numeric" min="0" step="1" data-dpk="${esc(z.r.a+'|'+pn+'|'+d.id)}" value="${z.v}" ${READONLY?'disabled':''}></td>`;}).join('')}<td>${bx(mo[0])}</td><td>${bx(mo[1])}</td><td>${bx(mo[2])}</td><td><b>${bx(t)}</b></td></tr>`;}).join('')+`<tr class="hl"><td colspan="3"><b>All doctors</b></td>${prods.map(pn=>`<td><b>${bx(sum(docs.map(d=>(cellOf(d,pn)||{v:0}).v)))}</b></td>`).join('')}${[0,1,2].map(i=>`<td><b>${bx(sum(prow.map(x=>sum(x.parts.map(z=>z.e[i])))))}</b></td>`).join('')}<td><b>${bx(sum(docs.map(d=>sum(prods.map(pn=>(cellOf(d,pn)||{v:0}).v)))))}</b></td></tr><tr><td colspan="3"><b>Place total (sheet)</b></td>${prods.map(pn=>`<td>${bx(prow.find(x=>x.r.pn===pn).r.tot)}</td>`).join('')}${[0,1,2].map(i=>`<td>${bx(sum(prow.map(x=>x.r.e[i])))}</td>`).join('')}<td><b>${bx(tb)}</b></td></tr><tr><td colspan="3"><b>Remaining to assign</b></td>${prods.map(pn=>{const x=prow.find(y=>y.r.pn===pn);const rm=x.r.tot-sum(x.parts.map(z=>sum(z.e)));return `<td class="${rm===0?'up':rm>0?'':'dn'}"><b>${rm===0?'✓':bx(rm)}</b></td>`;}).join('')}<td></td><td></td><td></td><td class="${RR===0?'up':'dn'}"><b>${RR===0?'✓':bx(RR)}</b></td></tr></table><div class="note">${p.direct?'':'Showing the top 50 of '+total+' doctors (use search to find others). '}Blue cells are numbers you pinned. Months follow this place's monthly profile for each product.</div></div>`;
  H+=`<div class="card">${noteBox('board:'+id,'Notes on this place','Who orders? Next order date? Any change to agree with the customer?')}</div>`;
  return H;}
// ---------- DOCTOR TOTALS (direct + indirect)
ROUTES.docfc=function(){
  const m=M(),A=m.alloc;const F=UI.dfc;
  let H=pageHead('Doctor Forecast (boxes)','Each doctor\'s share of your forecast: direct boxes from their hospital plus indirect boxes from pharmacies and warehouses. Totals reconcile to the sheet.',`<span class="noprint"><button class="btn sec" data-go="board">Place Board</button> <button class="btn sec" data-go="fedit">Edit forecast</button></span>`);
  const tot=sum(m.docs.map(d=>d.fcT)),dir=sum(m.docs.map(d=>d.fcD)),ind=sum(m.docs.map(d=>d.fcI));
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(A.totalBoxes),'Forecast in your sheet (boxes)')}${kpi(bx(tot),'Split across doctors',tot===A.totalBoxes-(A.totalBoxes-A.directBoxes-A.indirectBoxes)?'ok':'',`${bx(dir)} direct + ${bx(ind)} indirect`)}${kpi(bx(A.totalBoxes-tot),'Not yet assigned to doctors',A.totalBoxes-tot===0?'ok':'warn',A.totalBoxes-tot===0?'all boxes assigned':'open a place in Place Board')}${kpi(String(m.docs.filter(d=>d.fcT>0).length),'Doctors with boxes')}</div>`;
  const groups=[['all','All doctors'],...A.groups.filter(g=>g.boxes>0).map(g=>[g.id,g.name.replace(/ \(.*/,'')]),['none','Indirect only']];
  H+=chipsRow(groups,F.g==='dallah'&&!F.set?'all':F.g,'dfc.g')+searchBox('dq2','dfc.q','Search doctor, specialty or site');
  const L=m.docs.filter(d=>(F.g==='all'||F.g==='none'&&!d.grp||d.grp===F.g)&&(!F.q||(d.n+d.sp+d.s).toLowerCase().includes(F.q.toLowerCase()))).sort((a,b)=>b.fcT-a.fcT);
  H+=`<div class="note">${L.length} doctors</div><div class="card scroll"><table class="t"><tr><th class="tl">Doctor</th><th class="tl">Site</th><th class="tl">Specialty</th><th>Class</th><th>Direct</th><th>Indirect</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 total</th><th>SAR</th></tr>`+L.slice(0,200).map(d=>`<tr class="row" data-go="doctor/${esc(d.id)}"><td class="tl">${esc(d.n)}</td><td class="tl">${esc(d.o+' · '+d.s)}</td><td class="tl">${esc(d.sp)}</td><td><span class="badge ${d.c}">${d.c}</span></td><td>${bx(d.fcD)}</td><td>${bx(d.fcI)}</td><td>${bx(d.fcm[0])}</td><td>${bx(d.fcm[1])}</td><td>${bx(d.fcm[2])}</td><td><b>${bx(d.fcT)}</b></td><td>${Mn(d.fcV)}</td></tr>`).join('')+`<tr class="hl"><td colspan="4"><b>Total shown</b></td><td><b>${bx(sum(L.map(d=>d.fcD)))}</b></td><td><b>${bx(sum(L.map(d=>d.fcI)))}</b></td><td><b>${bx(sum(L.map(d=>d.fcm[0])))}</b></td><td><b>${bx(sum(L.map(d=>d.fcm[1])))}</b></td><td><b>${bx(sum(L.map(d=>d.fcm[2])))}</b></td><td><b>${bx(sum(L.map(d=>d.fcT)))}</b></td><td>${Mn(sum(L.map(d=>d.fcV)))}</td></tr></table><div class="note"><b>Direct</b> = boxes of the doctor's own hospital. <b>Indirect</b> = a share of pharmacy and warehouse forecast, spread by specialty relevance and class (A = 2× B). Open a place in the Place Board to pin or change any doctor's number.</div></div>`;
  return H;};

// ---------- SPLIT: forecast by drug · place · doctor, with filters
UI.sp={place:'all',drug:'all',doc:'',site:'all',type:'all',cls:'all',group:'flat'};
function splitRows(m){
  const A=m.alloc;if(A._flat)return A._flat;const rows=[];
  A.places.forEach(p=>p.prow.forEach(x=>x.parts.forEach(z=>{const q=sum(z.e);if(q<=0&&z.pin==null)return;rows.push({a:p.acc,pl:p.name,dir:p.direct,site:z.d.o+' · '+z.d.s,drug:x.r.pn,doc:z.d.n,id:z.d.id,c:z.d.c,sp:z.d.sp,e:z.e,q,pin:z.pin,price:x.r.price,key:x.r.a+'|'+x.r.pn+'|'+z.d.id});})));
  A._flat=rows;return rows;}
function splitFilter(rows,F){return rows.filter(r=>(F.place==='all'||r.a===F.place)&&(F.drug==='all'||r.drug===F.drug)&&(F.type==='all'||(F.type==='direct')===r.dir)&&(F.site==='all'||r.site===F.site)&&(F.cls==='all'||r.c===F.cls)&&(!F.doc||(r.doc+' '+r.sp).toLowerCase().includes(F.doc.toLowerCase())));}
const spKey={drug:r=>r.drug,place:r=>r.pl,doctor:r=>r.doc+' · '+r.sp+' · '+r.site,site:r=>r.site};
ROUTES.split=function(){
  const m=M(),F=UI.sp,all=splitRows(m);
  const L=splitFilter(all,F);
  const drugs=DOCP.filter(d=>all.some(r=>r.drug===d));
  const sites=[...new Set(all.map(r=>r.site))].sort();
  const places=m.alloc.places;
  let H=pageHead('Split: Drug · Place · Doctor','Your whole forecast from the sheet, split to doctors. Pick any combination of filters — the totals, months and sheet check update instantly.',`<span class="noprint"><button class="btn sec" data-go="board">Place Board</button> <button class="btn sec" data-go="fedit">Edit sheet rows</button></span>`);
  // sheet check
  const sheetRows=FX.rows.filter(r=>(F.place==='all'||r.a===F.place)&&(F.drug==='all'||r.pn===F.drug)&&(F.type==='all'||((places.find(p=>p.acc===r.a)||{}).direct?'direct':'indirect')===F.type));
  const sheetQ=sum(sheetRows.map(r=>r.tot)),filtQ=sum(L.map(r=>r.q));
  const partial=F.site!=='all'||F.cls!=='all'||!!F.doc;
  H+=`<div class="card flat" style="border-color:var(--brand2)"><b>Sheet check</b> · Your forecast sheet (Q4 – Months) has <b>${FX.rows.filter(r=>r.o0>0).length}</b> account × drug rows = <b>${bx(m.alloc.origBoxes)}</b> boxes. On the page now: <b>${bx(m.alloc.totalBoxes)}</b> boxes${m.alloc.totalBoxes===m.alloc.origBoxes?' — identical to the sheet.':' (edited: '+(m.alloc.totalBoxes-m.alloc.origBoxes>0?'+':'')+bx(m.alloc.totalBoxes-m.alloc.origBoxes)+').'}<br><span class="mt">For this filter: sheet ${bx(sheetQ)} boxes · assigned to doctors ${bx(filtQ)} boxes ${partial?'(doctor/site/class filter active, so this is a part of the sheet)':(sheetQ===filtQ?'<b class="up">✓ matches</b>':'<b class="dn">difference '+bx(sheetQ-filtQ)+'</b>')}</span></div>`;
  // filters
  H+=`<div class="stickybar" style="top:calc(env(safe-area-inset-top,0px) + 58px)"><div class="grid g4" style="gap:8px"><div><div class="lab">Place</div><select class="tx" style="margin:0" data-do="spf" data-k="place"><option value="all">All places</option>${places.map(p=>`<option value="${p.acc}" ${F.place===p.acc?'selected':''}>${esc(p.name.slice(0,34))} — ${bx(p.boxes)}</option>`).join('')}</select></div><div><div class="lab">Drug</div><select class="tx" style="margin:0" data-do="spf" data-k="drug"><option value="all">All drugs</option>${drugs.map(d=>`<option ${F.drug===d?'selected':''}>${d}</option>`).join('')}</select></div><div><div class="lab">Doctor / specialty</div><input class="tx" id="spd" style="margin:0" data-live="sp.doc" placeholder="type a name" value="${esc(F.doc)}"></div><div><div class="lab">Site (branch)</div><select class="tx" style="margin:0" data-do="spf" data-k="site"><option value="all">All sites</option>${sites.map(s=>`<option ${F.site===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div></div><div class="chips" style="margin:8px 0 0">${[['all','Direct + indirect'],['direct','Direct (hospitals)'],['indirect','Indirect (pharmacy/warehouse)']].map(x=>`<button class="chip ${F.type===x[0]?'on':''}" data-do="ui" data-p="sp.type" data-v="${x[0]}">${x[1]}</button>`).join('')}${[['all','Any class'],['A','Class A'],['B','Class B']].map(x=>`<button class="chip ${F.cls===x[0]?'on':''}" data-do="ui" data-p="sp.cls" data-v="${x[0]}">${x[1]}</button>`).join('')}<button class="chip" data-do="spreset">Clear filters</button></div></div>`;
  // totals
  const t=[0,1,2].map(i=>sum(L.map(r=>r.e[i])));
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(filtQ),'Boxes in this view',filtQ?'ok':'',`${L.length} rows · ${new Set(L.map(r=>r.id)).size} doctors`)}${kpi(bx(t[0]),'October')}${kpi(bx(t[1]),'November')}${kpi(bx(t[2]),'December','',`SAR ${Mn(sum(L.map(r=>r.q*r.price)))}`)}</div>`;
  H+=`<div class="lab">Group the table by</div><div class="chips">${[['flat','Every row'],['drug','Drug'],['place','Place'],['doctor','Doctor'],['site','Site']].map(x=>`<button class="chip ${F.group===x[0]?'on':''}" data-do="ui" data-p="sp.group" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  if(F.group==='flat'){
    const show=L.slice().sort((a,b)=>b.q-a.q).slice(0,250);const canEdit=F.place!=='all'&&!READONLY;
    H+=`<div class="card scroll"><table class="t"><tr><th class="tl">Place</th><th class="tl">Drug</th><th class="tl">Doctor</th><th class="tl">Site</th><th>Class</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th></tr>`+show.map(r=>`<tr><td class="tl"><bdi>${esc(r.pl.slice(0,22))}</bdi></td><td class="tl">${esc(r.drug)}</td><td class="tl"><a data-go="doctor/${esc(r.id)}" style="cursor:pointer;color:var(--brand2)">${esc(r.doc)}</a></td><td class="tl">${esc(r.site)}</td><td><span class="badge ${r.c}">${r.c}</span></td><td>${bx(r.e[0])}</td><td>${bx(r.e[1])}</td><td>${bx(r.e[2])}</td><td>${canEdit?`<input class="tx" style="width:76px;margin:0;text-align:right;${r.pin!=null?'border-color:var(--brand2);background:var(--chip)':''}" type="number" inputmode="numeric" min="0" step="1" data-dpk="${esc(r.key)}" value="${r.q}">`:`<b>${bx(r.q)}</b>`}</td></tr>`).join('')+`<tr class="hl"><td class="tl" colspan="5"><b>Total of all ${L.length} rows in this view</b></td><td><b>${bx(t[0])}</b></td><td><b>${bx(t[1])}</b></td><td><b>${bx(t[2])}</b></td><td><b>${bx(filtQ)}</b></td></tr></table><div class="note">${L.length>250?'Showing the 250 largest rows of '+L.length+'. ':''}${canEdit?'Blue cells are numbers you pinned — edit a doctor\'s Q4 boxes here (other doctors of that place/drug rebalance automatically, or use manual mode in the Place Board).':'Choose one place above to edit doctor numbers right in this table.'}</div><button class="btn sec block" data-do="spcopy">Copy all ${L.length} rows for Excel</button></div>`;
  }else{
    const g={};L.forEach(r=>{const k=spKey[F.group](r);const o=g[k]=g[k]||{k,q:0,e:[0,0,0],n:0,v:0,ids:new Set()};o.q+=r.q;o.v+=r.q*r.price;r.e.forEach((u,i)=>o.e[i]+=u);o.n++;o.ids.add(r.id);});
    const G=Object.values(g).sort((a,b)=>b.q-a.q);const dn={drug:'Drug',place:'Place',doctor:'Doctor',site:'Site'}[F.group];
    H+=`<div class="card scroll"><table class="t"><tr><th class="tl">${dn}</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Q4 boxes</th><th>Share</th><th>SAR</th></tr>`+G.slice(0,200).map(o=>`<tr class="row" data-do="spdrill" data-v="${esc(o.k)}"><td class="tl">${esc(o.k)}</td><td>${bx(o.e[0])}</td><td>${bx(o.e[1])}</td><td>${bx(o.e[2])}</td><td><b>${bx(o.q)}</b></td><td>${p0(filtQ?o.q/filtQ:0)}</td><td>${Mn(o.v)}</td></tr>`).join('')+`<tr class="hl"><td class="tl"><b>Total</b></td><td><b>${bx(t[0])}</b></td><td><b>${bx(t[1])}</b></td><td><b>${bx(t[2])}</b></td><td><b>${bx(filtQ)}</b></td><td></td><td><b>${Mn(sum(L.map(r=>r.q*r.price)))}</b></td></tr></table><div class="note">${G.length} groups. Tap a row to filter on it and see what is inside.</div></div>`;
  }
  return H;};

// ---------- actions
const ACT={
 ui(el){setPath(el.dataset.p,el.dataset.v);render(true);},
 real(el){S.set.real=+el.dataset.v;save();render(true);},
 lev(el){const id=el.dataset.id;if(READONLY)return toast('View-only');S.set.lev[id]=!S.set.lev[id];save();render(true);},
 tick(el){if(READONLY)return toast('View-only');const k=el.dataset.k;if(S.done[k])delete S.done[k];else S.done[k]=1;save();render(true);},
 step(el){if(READONLY)return toast('View-only');const d=el.dataset.d,i=el.dataset.i,s=+el.dataset.s;S.log[d]=S.log[d]||{};const v=Math.max(0,Number(S.log[d][i]||0)+s);if(v>0)S.log[d][i]=v;else delete S.log[d][i];save();render(true);},
 month(el){S.set.month=el.dataset.v;UI.day.sel=null;UI.day.logd=null;save();render(true);},
 xdim(el){UI.ex.dim=el.dataset.v;UI.ex.q='';render(true);},
 xrm(el){if(el.dataset.v==='*')UI.ex.f={};else delete UI.ex.f[el.dataset.v];render(true);},
 xdrill(el){const e=UI.ex;e.f[e.dim]=el.dataset.v;const nx={line:'brand',brand:'prod',prod:'cust',rep:'prod',cust:'prod',sub:'cust',st:'prod'};const used=Object.keys(e.f);let n=nx[e.dim];if(used.includes(n))n=DIMS.map(d=>d[0]).find(d=>!used.includes(d))||e.dim;e.dim=n;e.q='';render();},
 async xcopy(){const {list}=expData(),dn=DIMS.find(d=>d[0]===UI.ex.dim)[1];const tsv=[[dn,'YTD2026','YTD2025','Q4_2025','Target_YTD'].join('\t'),...list.map(o=>[o.n,o.y26,o.y25,o.q4,o.bY].join('\t'))].join('\n');try{await navigator.clipboard.writeText(tsv);toast('Copied ✓');}catch(e){prompt('Copy',tsv);}},
 async copy(el){const t=document.getElementById(el.dataset.t).innerText;try{await navigator.clipboard.writeText(t);toast('Copied ✓');}catch(e){prompt('Copy',t);}},
 async copyText(el){try{await navigator.clipboard.writeText(el.dataset.t);toast('Copied ✓');}catch(e){prompt('Copy',el.dataset.t);}},
 print(){window.print();},
 spf(el){UI.sp[el.dataset.k]=el.value;render(true);},
 spreset(){UI.sp={place:'all',drug:'all',doc:'',site:'all',type:'all',cls:'all',group:UI.sp.group};render(true);},
 spdrill(el){const F=UI.sp,v=el.dataset.v,g=F.group;if(g==='drug')F.drug=v;else if(g==='place'){const p=M().alloc.places.find(x=>x.name===v);if(p)F.place=p.acc;}else if(g==='site')F.site=v;else if(g==='doctor'){F.doc=v.split(' · ')[0];}F.group='flat';render();window.scrollTo(0,0);},
 async spcopy(){const m=M();const L=splitFilter(splitRows(m),UI.sp).sort((a,b)=>b.q-a.q).slice(0,6000);const tsv=['Place\tDrug\tDoctor\tSite\tClass\tOct\tNov\tDec\tQ4_boxes'].concat(L.map(r=>[r.pl,r.drug,r.doc,r.site,r.c,r.e[0],r.e[1],r.e[2],r.q].join('\t'))).join('\n');try{await navigator.clipboard.writeText(tsv);toast('Copied '+L.length+' rows ✓');}catch(e){prompt('Copy',tsv.slice(0,5000));}},
 manualtoggle(el){if(READONLY)return toast('View-only');const id=el.dataset.id;const p=M().alloc.places.find(x=>x.acc===id);if(!p)return;if(S.manual[id]){delete S.manual[id];toast('Auto-balance on');}else{p.prow.forEach(x=>x.parts.forEach(z=>{S.dpin[x.r.a+'|'+x.r.pn+'|'+z.d.id]=sum(z.e);}));S.manual[id]=true;toast('Manual mode — you assign every box');}save();render(true);},
 fillrem(el){if(READONLY)return;const id=el.dataset.id;const p=M().alloc.places.find(x=>x.acc===id);if(!p)return;let n=0;p.prow.forEach(x=>{const rem=x.r.tot-sum(x.parts.map(z=>sum(z.e)));if(rem>0){let w=x.parts.map(z=>docWeight(z.d,x.r.pn));if(!(sum(w)>0))w=x.parts.map(z=>z.d.c==='A'?2:1);const a=splitInt(rem,w);x.parts.forEach((z,j)=>{S.dpin[x.r.a+'|'+x.r.pn+'|'+z.d.id]=sum(z.e)+a[j];});n+=rem;}});save();render(true);toast(n?'Filled '+n+' boxes':'Nothing left');},
 resplit(el){if(READONLY)return toast('View-only');const id=el.dataset.id;let n=0;Object.keys(S.dpin).forEach(k=>{if(k.startsWith(id+'|')){delete S.dpin[k];n++;}});delete S.manual[id];save();render(true);toast(n?'Pins cleared ✓':'Already automatic');},
 packgo(){UI.asset={t:'pack',acc:M().acc[0].id};},
 fxacc(el){UI.fx.acc=el.dataset.id;UI.fx.prod='all';go('fedit');},
 fxfilter(el){UI.fx[el.dataset.k]=el.value;render(true);},
 fxzero(el){UI.fx.zero=el.checked;render(true);},
 fxreset(el){if(READONLY)return toast('View-only');const k=el.dataset.k;const r=FX.rows.find(x=>fxKey(x)===k);if(r){fxLogPush(k,-1,sum(fxEff(r)),sum(r.o.map(Math.round)),'reset');delete S.fc[k];save();render(true);}},
 fxresetall(){if(READONLY)return toast('View-only');if(!confirm('Reset every forecast cell to the original upload?'))return;fxLogPush('ALL|ALL',-1,M().alloc.totalBoxes,M().alloc.origBoxes,'reset');S.fc={};save();render(true);},
 fxhair(){if(READONLY)return toast('View-only');const m=M();const bkOf={};m.acc.forEach(c=>{bkOf[c.id]=c.bk;});FX.rows.forEach(r=>{const k=bkOf[r.a];if(k==='stretch'||k==='new')fxScaleRows([r],k==='stretch'?.5:.3,'haircut');});render(true);toast('Haircut applied ✓');},
 fxscale(){if(READONLY)return toast('View-only');const f=(Number(document.getElementById('fxpct').value)||100)/100;const F=UI.fx;const rows=FX.rows.filter(r=>(F.acc==='all'||r.a===F.acc)&&(F.prod==='all'||r.pn===F.prod)&&(F.zero||r.tot>0||r.o0>0)&&(!F.q||(accNameById(r.a)+' '+r.pn).toLowerCase().includes(F.q.toLowerCase())));fxScaleRows(rows,f,'scale');render(true);toast('Scaled '+rows.length+' rows ✓');},
 fxsnap(){if(READONLY)return toast('View-only');const m=M();const name=(document.getElementById('fxv').value||'Version '+(S.fcsnap.length+1)).trim();S.fcsnap.unshift({t:new Date().toISOString(),name,boxes:m.alloc.totalBoxes,sar:m.T.fcQ4,edits:S.fclog.length,fc:JSON.parse(JSON.stringify(S.fc))});if(S.fcsnap.length>20)S.fcsnap.length=20;save();render(true);toast('Version saved ✓');},
 fxrestore(el){if(READONLY)return;const s=S.fcsnap[+el.dataset.i];if(!s)return;if(!confirm('Restore "'+s.name+'"?'))return;fxLogPush('ALL|ALL',-1,M().alloc.totalBoxes,s.boxes,'restore');S.fc=JSON.parse(JSON.stringify(s.fc));save();render(true);},
 async fxcopy(){const m=M();const F=UI.fx;const tsv=['Account\tProduct\tOct\tNov\tDec\tQ4_boxes\tOriginal\tSAR'].concat(FX.rows.filter(r=>r.tot>0||r.o0>0).sort((a,b)=>b.tot-a.tot).map(r=>[accNameById(r.a),r.pn,r.e[0],r.e[1],r.e[2],r.tot,r.o0,Math.round(r.tot*r.price)].join('\t'))).join('\n');try{await navigator.clipboard.writeText(tsv);toast('Copied ✓');}catch(e){prompt('Copy',tsv);}},
 goDocs(el){UI.docs.org=el.dataset.org;UI.docs.site='all';go('doctors');},
 asset(el){const a=el.dataset.a.split(':');UI.asset={t:'account',acc:a[1]};go('assets');},
 assetAcc(el){UI.asset.acc=el.value;render(true);},
 hyg(el){if(READONLY)return toast('View-only');S.notes['hyg:'+el.dataset.id]=S.notes['hyg:'+el.dataset.id]==='1'?'':'1';save();render(true);},
 theme(){const r=document.documentElement;const d=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark';try{localStorage.setItem('hq_theme',r.dataset.theme);}catch(e){}},
 pal(){openPal();},
 adopt(){READONLY=false;history.replaceState(null,'',location.pathname+location.hash);save();initDb();render(true);},
 bkexp(){$('#bk').value=JSON.stringify(S);toast('Exported ✓');},
 bkimp(){try{const o=JSON.parse($('#bk').value);if(o&&o.done&&o.log){S={done:o.done,log:o.log,notes:o.notes||{},set:{...S.set,...(o.set||{})},fc:o.fc||{},fclog:o.fclog||[],fcsnap:o.fcsnap||[],dpin:o.dpin||{},manual:o.manual||{}};save();render(true);toast('Imported ✓');}else toast('Invalid text');}catch(e){toast('Invalid text');}},
 async share(){const u=location.href.split('#')[0].split('?')[0]+'?s='+encState();try{if(navigator.share){await navigator.share({title:'Sales HQ',url:u});return;}}catch(e){}try{await navigator.clipboard.writeText(u);toast('Link copied ✓');}catch(e){prompt('Copy link',u);}}
};
document.addEventListener('click',e=>{
  if(e.target.closest('#pal .box')&&!e.target.closest('[data-pi]'))return;
  const pi=e.target.closest('[data-pi]');if(pi){closePal();go(pi.dataset.pi);return;}
  if(e.target.id==='pal'){closePal();return;}
  const g=e.target.closest('[data-go]');
  const a=e.target.closest('[data-do]');
  if(a&&a.dataset.do&&['INPUT','SELECT'].includes(a.tagName))return;
  if(e.target.closest('[data-fxk]')||e.target.closest('[data-dpk]'))return;
  if(a&&ACT[a.dataset.do]){if(g&&g.contains(a)&&g!==a){}ACT[a.dataset.do](a,e);if(!(g&&g===a)){return;}}
  if(g){e.preventDefault();go(g.dataset.go);}
});
document.addEventListener('change',e=>{
  const n=e.target.closest('[data-note]');if(n){if(READONLY){toast('View-only');return;}S.notes[n.dataset.note]=n.value;save();return;}
  const dpk=e.target.closest('[data-dpk]');if(dpk){if(READONLY){toast('View-only');return;}const k=dpk.dataset.dpk;const v=dpk.value;const acc0=k.split('|')[0];if(v===''&&!S.manual[acc0]){delete S.dpin[k];}else S.dpin[k]=Math.max(0,Math.round(Number(v)||0));save();render(true);return;}
  const fxi=e.target.closest('[data-fxk]');if(fxi){if(READONLY){toast('View-only');return;}fxSet(fxi.dataset.fxk,+fxi.dataset.fxi,fxi.value);render(true);return;}
  const w=e.target.closest('[data-do=w]');if(w){S.set.w[w.dataset.k]=+w.value;save();render(true);return;}
  const sl=e.target.closest('select[data-do]');if(sl&&ACT[sl.dataset.do]){ACT[sl.dataset.do](sl);return;}
  const cb=e.target.closest('input[type=checkbox][data-do]');if(cb&&ACT[cb.dataset.do]){ACT[cb.dataset.do](cb);return;}
  const sl2=e.target.closest('[data-do=setlog]');if(sl2){if(READONLY){toast('View-only');return;}const d=sl2.dataset.d,i=sl2.dataset.i,v=sl2.value===''?0:Number(sl2.value);S.log[d]=S.log[d]||{};if(v>0)S.log[d][i]=Math.round(v*10)/10;else delete S.log[d][i];save();render(true);}
});
document.addEventListener('input',e=>{const l=e.target.closest('[data-live]');if(!l)return;setPath(l.dataset.live,l.value);window.__focus={id:l.id,p:l.selectionStart};render(true);});
// ---------- palette
let PALI=[],PALS=0;
function palItems(q){q=(q||'').toLowerCase().trim();const m=M();const it=[];
  FLAT.forEach(f=>it.push({t:f.t,s:f.g,i:f.i,go:f.id}));
  m.acc.forEach(c=>it.push({t:String(c.n).trim(),s:'Account',i:'🏢',go:'account/'+c.id}));
  m.docs.forEach(d=>it.push({t:d.n,s:d.o+' · '+d.sp,i:'🩺',go:'doctor/'+d.id}));
  HP.forEach(p=>it.push({t:PN(p.name),s:'Habib drug · '+p.line,i:'💊',go:'habib/'+p.code}));
  return (q?it.filter(x=>(x.t+' '+x.s).toLowerCase().includes(q)):it.slice(0,10)).slice(0,30);}
function palRender(){const q=$('#pal input')?$('#pal input').value:'';PALI=palItems(q);PALS=0;$('#pal .res').innerHTML=PALI.map((x,i)=>`<div class="it ${i===PALS?'sel':''}" data-pi="${esc(x.go)}"><span>${x.i}</span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div>`).join('')||'<div class="it">No results</div>';}
function openPal(){const p=$('#pal');p.hidden=false;p.innerHTML='<div class="box"><input placeholder="Search sections, accounts, doctors, drugs…" autocomplete="off"><div class="res"></div></div>';palRender();const i=$('#pal input');i.focus();i.addEventListener('input',palRender);i.addEventListener('keydown',e=>{if(e.key==='Escape')closePal();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();PALS=clamp(PALS+(e.key==='ArrowDown'?1:-1),0,PALI.length-1);[...document.querySelectorAll('#pal .it')].forEach((el,k)=>el.classList.toggle('sel',k===PALS));}if(e.key==='Enter'&&PALI[PALS]){closePal();go(PALI[PALS].go);}});}
function closePal(){$('#pal').hidden=true;$('#pal').innerHTML='';}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal();}else if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes((document.activeElement||{}).tagName)){e.preventDefault();openPal();}else if(e.key==='Escape')closePal();});
// ---------- boot
(function(){try{const t=localStorage.getItem('hq_theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}
  loadLocal();
  const q=new URLSearchParams(location.search).get('s');if(q){try{const r=decState(q);S=r.st;READONLY=true;SHAREDATE=r.t;}catch(e){}}
  render();initDb();})();


</script>
</body>
</html>
