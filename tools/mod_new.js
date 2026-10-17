// =====================================================================
// v17 Oct 2026 · NEW MODULES: Branches, Stock, Changes
// =====================================================================
const BRI=BR.branches;
const brU=(p,b)=>({y26:sum(p.v[b].slice(9,18)),y25:sum(p.v[b].slice(0,9))});
const BRSITE={ghadeer:'Al Ghadeer',hammra:'Al Hamra',sweedie:'Al Sweedy'};
function brCalc(m){
  const hbp={};HP.forEach(p=>{hbp[p.code]=p;});
  const A=BRI.map((b,i)=>{
    const mo26=Array.from({length:9},(_,k)=>sum(BR.prods.map(p=>p.v[i][9+k])));
    const mo25=Array.from({length:9},(_,k)=>sum(BR.prods.map(p=>p.v[i][k])));
    const y26=sum(mo26),y25=sum(mo25);
    const top=BR.prods.map(p=>({n:p.n,code:p.code,u:brU(p,i).y26,u5:brU(p,i).y25})).sort((x,y)=>y.u-x.u);
    const docs=m.docs.filter(d=>d.o==='Habib'&&d.s===BRSITE[b.id]);
    const goal=sum(docs.map(d=>d.goal)),act=sum(docs.map(d=>d.act));
    const Acl=docs.filter(d=>d.c==='A');
    const val26=sum(BR.prods.map(p=>{const h=hbp[p.code];return h?brU(p,i).y26*h.price:0;}));
    return {...b,i,mo26,mo25,y26,y25,yoy:ypc(y26,y25),top,docs:docs.length,goal,act,A:Acl.length,As:Acl.filter(d=>d.act>0).length,boxes:sum(docs.map(d=>d.fcT)),val26,last3:sum(mo26.slice(6,9)),prev3:sum(mo26.slice(3,6))};});
  const tot26=sum(A.map(a=>a.y26)),tot25=sum(A.map(a=>a.y25));
  const recon=BR.prods.map(p=>{const h=hbp[p.code];const bs=sum(BRI.map((b,i)=>brU(p,i).y26));const hs=h?sum(h.um26):0;return {n:p.n,code:p.code,bs,hs,d:bs-hs,rel:hs>0?(bs-hs)/hs:(bs>0?1:0)};}).filter(x=>Math.abs(x.d)>20&&Math.abs(x.rel)>.05).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
  const noBr=m.docs.filter(d=>d.o==='Habib'&&!Object.values(BRSITE).includes(d.s));
  return {A,tot26,tot25,recon,noBr,hbp,hTot:sum(HP.map(p=>sum(p.um26)))};}
UI.br={b:'all',q:'',line:'all',sort:'y26'};
ROUTES.branches=function(){
  const m=M(),F=UI.br,C=brCalc(m),A=C.A;
  const sel=F.b==='all'?null:A.find(a=>a.id===F.b);
  let H=pageHead('Al Habib branches','Sell-out units by branch · Jan–Sep 2026 vs Jan–Sep 2025 · '+BR.prods.length+' drugs · from the branch sales-out file',`<span>${pill(p0(C.tot26/C.hTot)+' of Habib dashboard units',Math.abs(C.tot26/C.hTot-1)<.02?'ok':'warn')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(fmt(C.tot26),'Units 2026 (Jan–Sep)',C.tot26>=C.tot25?'ok':'warn',pS(ypc(C.tot26,C.tot25))+' vs '+fmt(C.tot25))}${kpi(fmt(sum(A.map(a=>a.mo26[8]))),'Units in September','',pS(ypc(sum(A.map(a=>a.mo26[8])),sum(A.map(a=>a.mo25[8]))))+' vs Sep 2025')}${kpi(A.slice().sort((x,y)=>y.y26-x.y26)[0].n,'Largest branch','',p0(A.slice().sort((x,y)=>y.y26-x.y26)[0].y26/C.tot26)+' of units')}${kpi(String(C.noBr.length),'Doctors with no branch sales data',C.noBr.length?'warn':'ok','Al Nakhil has doctors but no branch sales in the file')}</div>`;
  H+=`<div class="grid g3" style="margin-bottom:12px">`+A.map(a=>`<div class="card" style="margin:0;cursor:pointer" data-do="ui" data-p="br.b" data-v="${a.id}"><h3>${esc(a.n)} <span class="tag">${esc(a.ar)}</span></h3>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:baseline"><b style="font-size:24px">${fmt(a.y26)}</b><span class="mt">units · ${pS(a.yoy)} vs ${fmt(a.y25)}</span></div>
    ${svgMonthly(a.mo26,a.mo25,null,9,{h:110})}
    <div class="note">Share of Habib units: <b>${p0(a.y26/C.tot26)}</b> · last 3 months ${fmt(a.last3)} vs ${fmt(a.prev3)} before (${pS(ypc(a.last3,a.prev3))})</div>
    <div class="mt" style="font-size:12px;margin-top:6px">Top: ${a.top.slice(0,3).map(t=>esc(PN(t.n))+' '+fmt(t.u)).join(' · ')}</div>
    <div class="mt" style="font-size:12px;margin-top:4px">Doctors ${a.docs} · HQ ${a.act}/${a.goal} (${p0(a.goal?a.act/a.goal:0)}) · Class A seen ${a.As}/${a.A} · Q4 boxes ${bx(a.boxes)}</div></div>`).join('')+`</div>`;
  H+=`<div class="eyebrow">Drug × branch</div>`+chipsRow([['all','All branches'],...A.map(a=>[a.id,a.n])],F.b,'br.b');
  const lines=[...new Set(BR.prods.map(p=>(C.hbp[p.code]||{}).line).filter(Boolean))];
  H+=chipsRow([['all','All lines'],...lines.map(l=>[l,l])],F.line,'br.line')+searchBox('brq','br.q','Search drug');
  let list=BR.prods.map(p=>{const h=C.hbp[p.code];const per=BRI.map((b,i)=>brU(p,i));const y26=sum(per.map(x=>x.y26)),y25=sum(per.map(x=>x.y25));const mo=BRI.map((b,i)=>p.v[i].slice(9,18));
    return {p,h,per,y26,y25,line:h?h.line:'—',sep26:sum(BRI.map((b,i)=>p.v[i][17])),sep25:sum(BRI.map((b,i)=>p.v[i][8]))};})
    .filter(x=>(F.line==='all'||x.line===F.line)&&(!F.q||x.p.n.toLowerCase().includes(F.q.toLowerCase())));
  if(sel){list=list.map(x=>({...x,y26:x.per[sel.i].y26,y25:x.per[sel.i].y25,sep26:x.p.v[sel.i][17],sep25:x.p.v[sel.i][8]}));}
  list=list.filter(x=>x.y26!==0||x.y25!==0).sort((x,y)=>y.y26-x.y26);
  if(!sel){
    H+=`<div class="card scroll"><table class="t"><tr><th class="tl">Drug</th><th>Line</th>${A.map(a=>`<th>${esc(a.n.replace('Al-','').replace(' Hospital','').replace(' Polyclinic',''))}</th>`).join('')}<th>2026</th><th>2025</th><th>YoY</th><th>Leads at</th></tr>`+list.map(x=>{const lead=x.per.map((v,i)=>({i,u:v.y26})).sort((p,q)=>q.u-p.u)[0];return `<tr class="row" data-go="habib/${esc(x.p.code||'')}"><td class="tl">${esc(PN(x.p.n))}</td><td>${esc(x.line)}</td>${x.per.map(v=>`<td>${fmt(v.y26)}</td>`).join('')}<td><b>${fmt(x.y26)}</b></td><td>${fmt(x.y25)}</td><td class="${cls(ypc(x.y26,x.y25))}">${pS(ypc(x.y26,x.y25))}</td><td>${x.y26>0?esc(A[lead.i].n.replace('Al-','').replace(' Hospital','').replace(' Polyclinic',''))+' '+p0(lead.u/x.y26):'—'}</td></tr>`;}).join('')+`<tr class="hl"><td class="tl"><b>Total</b></td><td></td>${A.map(a=>`<td><b>${fmt(a.y26)}</b></td>`).join('')}<td><b>${fmt(C.tot26)}</b></td><td><b>${fmt(C.tot25)}</b></td><td class="${cls(ypc(C.tot26,C.tot25))}"><b>${pS(ypc(C.tot26,C.tot25))}</b></td><td></td></tr></table><div class="note">Units are boxes sold out by the branch pharmacy. Tap a drug for its full Habib page.</div></div>`;
  }else{
    const t26=sum(list.map(x=>x.y26));
    H+=`<div class="card scroll"><h3>${esc(sel.n)}</h3><table class="t"><tr><th class="tl">Drug</th><th>Line</th><th>2026</th><th>2025</th><th>YoY</th><th>Sep 26</th><th>Sep 25</th><th>Share of branch</th><th>Share of drug</th></tr>`+list.map(x=>{const tot=sum(x.per.map(v=>v.y26));return `<tr class="row" data-go="habib/${esc(x.p.code||'')}"><td class="tl">${esc(PN(x.p.n))}</td><td>${esc(x.line)}</td><td><b>${fmt(x.y26)}</b></td><td>${fmt(x.y25)}</td><td class="${cls(ypc(x.y26,x.y25))}">${pS(ypc(x.y26,x.y25))}</td><td>${fmt(x.sep26)}</td><td>${fmt(x.sep25)}</td><td>${p0(t26?x.y26/t26:0)}</td><td>${tot>0?p0(x.y26/tot):'—'}</td></tr>`;}).join('')+`</table></div>`;
    const mv=list.map(x=>({x,d:x.y26-x.y25})).filter(z=>z.d!==0).sort((p,q)=>q.d-p.d);
    const mr=z=>`<div class="row" data-go="habib/${esc(z.x.p.code||'')}" style="cursor:pointer"><div class="l"><b>${esc(PN(z.x.p.n))}</b><span>${fmt(z.x.y26)} vs ${fmt(z.x.y25)}</span></div><b class="${cls(z.d)}">${z.d>0?'+':''}${fmt(z.d)}</b></div>`;
    H+=`<div class="col2"><div class="card"><h3>Growing at ${esc(sel.n)}</h3>${mv.slice(0,5).map(mr).join('')}</div><div class="card"><h3>Declining at ${esc(sel.n)}</h3>${mv.slice(-5).reverse().map(mr).join('')}</div></div>`;
  }
  H+=`<div class="eyebrow">Branches and doctors</div><div class="card scroll"><table class="t"><tr><th class="tl">Branch</th><th>Units 2026</th><th>YoY</th><th>Doctors</th><th>HQ visits</th><th>%</th><th>Class A seen</th><th>Q4 boxes (split)</th><th>Units per doctor</th></tr>`+A.map(a=>`<tr class="row" data-go="doctors" data-do="ui" data-p="docs.org" data-v="Habib"><td class="tl">${esc(a.n)}</td><td>${fmt(a.y26)}</td><td class="${cls(a.yoy)}">${pS(a.yoy)}</td><td>${a.docs}</td><td>${a.act}/${a.goal}</td><td class="${a.goal&&a.act/a.goal>=.8?'up':a.goal&&a.act/a.goal<.5?'dn':''}">${p0(a.goal?a.act/a.goal:0)}</td><td class="${a.As<a.A?'dn':''}">${a.As}/${a.A}</td><td>${bx(a.boxes)}</td><td>${a.docs?fmt(a.y26/a.docs):'—'}</td></tr>`).join('')+(C.noBr.length?`<tr><td class="tl">Al Nakhil (no sales file)</td><td>—</td><td></td><td>${C.noBr.length}</td><td>${sum(C.noBr.map(d=>d.act))}/${sum(C.noBr.map(d=>d.goal))}</td><td></td><td>${C.noBr.filter(d=>d.c==='A'&&d.act>0).length}/${C.noBr.filter(d=>d.c==='A').length}</td><td>${bx(sum(C.noBr.map(d=>d.fcT)))}</td><td>—</td></tr>`:'')+`</table><div class="note">Branch sales come from the sales-out file; doctors and visits come from the HQ tracker. Units per doctor shows where prescribing effort is thin.</div></div>`;
  H+=`<div class="card"><h3>Does the branch file match the Habib dashboard?</h3><div class="ins"><i>${C.recon.length?'!':'✓'}</i><div>Branch total <b>${fmt(C.tot26)}</b> units vs Habib dashboard <b>${fmt(C.hTot)}</b> (${pS(ypc(C.tot26,C.hTot))}). ${C.recon.length?C.recon.length+' drugs differ by more than 5%: '+C.recon.slice(0,6).map(r=>esc(PN(r.n))+' '+(r.d>0?'+':'')+fmt(r.d)).join(' · ')+'.':'Every drug ties within 5%.'}</div></div></div>`;
  H+=`<div class="card"><h3>Branch plan</h3>${noteBox('br:act','Actions by branch','1) Sweedy: …  2) Hamra: …  3) Ghadeer: …')}${noteBox('br:risk','Risks','')}</div>`;
  return H;};
// ---------- STOCK (Jamjoom snapshot, 4 Oct 2026)
const JJI={};JJ.rows.forEach(r=>{JJI[r.c]=r;});
function stockCheck(){
  const byPN={};FX.rows.forEach(r=>{const q=sum(r.e||fxEff(r));byPN[r.pn]=(byPN[r.pn]||0)+q;});
  const used=new Set();
  const out=Object.keys(JJ.map).map(nm=>{const pn=PN(nm);used.add(pn);const it=JJI[JJ.map[nm]];const q4=byPN[pn]||0,mo=q4/3;const cov=mo>0?it.wh/mo:null,covT=mo>0?it.tot/mo:null;
    return {name:nm,pn,it,q4,mo,cov,covT,st:mo<=0?'none':cov<1?'short':cov<2?'tight':'ok'};});
  Object.keys(byPN).filter(pn=>!used.has(pn)&&byPN[pn]>0).forEach(pn=>out.push({name:pn,pn,it:null,q4:byPN[pn],mo:byPN[pn]/3,cov:null,covT:null,st:'nofile'}));
  return out;}
const jjDays=r=>r.s30>0?r.tot/(r.s30/30):null;
function jjStatus(r){if(r.wh<=0&&r.s30>0)return ['Out at warehouse','bad'];const d=jjDays(r);if(d!=null&&d<15)return ['Critical <15 days','bad'];if(d!=null&&d<30)return ['Low <30 days','warn'];if(d!=null&&d>180&&r.tot>300)return ['Overstock','warn'];if(r.s30===0&&r.tot>0)return ['No movement','idle'];return ['OK','ok'];}
UI.jj={scope:'all',mfg:'all',q:'',sort:'cover'};
ROUTES.stock=function(){
  const m=M(),F=UI.jj,SC=stockCheck();
  const rows=JJ.rows.map(r=>({...r,days:jjDays(r),stt:jjStatus(r)}));
  const bad=rows.filter(r=>r.stt[1]==='bad'),warn=rows.filter(r=>r.stt[1]==='warn');
  const shortN=SC.filter(x=>x.st==='short'||x.st==='nofile').length;
  let H=pageHead('Stock & supply','Jamjoom stock snapshot · '+JJ.date.split('-').reverse().join('/')+' · warehouse, pharmacy stock, in transit and 30/60-day sales',`<span>${pill(shortN+' of your SKUs short',shortN?'bad':'ok')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(rows.length),'Items in the file','',rows.filter(r=>r.m==='JAMJOOM').length+' core · '+rows.filter(r=>r.m!=='JAMJOOM').length+' Optha/CNS')}${kpi(String(bad.length),'Items critical or out at warehouse',bad.length?'bad':'ok','sales in last 30 days but little or no stock')}${kpi(String(warn.length),'Low or overstocked items',warn.length?'warn':'ok','under 30 days or over 180 days')}${kpi(String(SC.filter(x=>x.st==='short').length),'Your SKUs: warehouse < 1 month of Q4 forecast',SC.some(x=>x.st==='short')?'bad':'ok','compared with the Q4 boxes in your forecast')}</div>`;
  H+=`<div class="card scroll"><h3>Your line: Q4 forecast vs stock on hand</h3><table class="t"><tr><th class="tl">SKU</th><th>Q4 forecast (boxes)</th><th>Per month</th><th>Warehouse</th><th>Pharmacies</th><th>Total stock</th><th>Sold last 30 days</th><th>Warehouse cover (months of forecast)</th><th>Status</th></tr>`+SC.map(x=>`<tr><td class="tl">${esc(PN(x.name))}</td><td><b>${bx(x.q4)}</b></td><td>${bx(x.mo)}</td><td>${x.it?fmt(x.it.wh):'—'}</td><td>${x.it?fmt(x.it.rt):'—'}</td><td>${x.it?fmt(x.it.tot):'—'}</td><td>${x.it?fmt(x.it.s30):'—'}</td><td class="${x.st==='short'?'dn':''}">${x.cov==null?'—':x.cov.toFixed(1)}</td><td>${x.st==='short'?pill('Short','bad'):x.st==='tight'?pill('Tight','warn'):x.st==='ok'?pill('OK','ok'):x.st==='nofile'?pill('Not in stock file','warn'):pill('No Q4 forecast','idle')}</td></tr>`).join('')+`</table><div class="note"><b>How to read this.</b> Warehouse cover = warehouse stock ÷ (Q4 forecast boxes ÷ 3). Under 1 month means the forecast cannot ship from today's stock without new supply. <b>Check the scope</b> with supply chain: this file looks like the Jamjoom warehouse + pharmacy network, so confirm that hospital and distributor orders ship from the same stock and what production or purchase orders are already planned.</div></div>`;
  H+=`<div class="eyebrow">Every item in the file</div>`+chipsRow([['all','All items'],['mine','Your line (GIT 2)'],['region','Brands in your region'],['alerts','Alerts only']],F.scope,'jj.scope')+chipsRow([['all','All makers'],['JAMJOOM','Jamjoom'],['JAMJOOM OPTHA','Optha'],['JAMJOOM CNS','CNS']],F.mfg,'jj.mfg')+chipsRow([['cover','Lowest cover first'],['wh','Warehouse'],['s30','Sales 30d'],['tot','Total stock']],F.sort,'jj.sort')+searchBox('jjq','jj.q','Search item');
  let L=rows.filter(r=>(F.mfg==='all'||r.m===F.mfg)&&(F.scope==='all'||(F.scope==='mine'&&r.l==='GIT 2')||(F.scope==='region'&&r.l)||(F.scope==='alerts'&&r.stt[1]!=='ok'&&r.stt[1]!=='idle'))&&(!F.q||r.d.toLowerCase().includes(F.q.toLowerCase())));
  const srt={cover:(a,b)=>(a.days==null?9999:a.days)-(b.days==null?9999:b.days),wh:(a,b)=>b.wh-a.wh,s30:(a,b)=>b.s30-a.s30,tot:(a,b)=>b.tot-a.tot}[F.sort];
  L=L.sort(srt);
  H+=`<div class="card scroll"><table class="t"><tr><th class="tl">Item</th><th>Brand line</th><th>Price</th><th>Warehouse</th><th>Pharm.</th><th>Transit</th><th>Total</th><th>30 d</th><th>60 d</th><th>Days of stock</th><th>Status</th></tr>`+L.slice(0,250).map(r=>`<tr class="${r.l==='GIT 2'?'hl':''}"><td class="tl">${esc(r.d)}</td><td>${esc(r.l||(r.m==='JAMJOOM'?'Other':r.m.replace('JAMJOOM ','')))}</td><td>${r.p}</td><td>${fmt(r.wh)}</td><td>${fmt(r.ph)}</td><td>${fmt(r.tr)}</td><td><b>${fmt(r.tot)}</b></td><td>${fmt(r.s30)}</td><td>${fmt(r.s60)}</td><td class="${r.days!=null&&r.days<30?'dn':''}">${r.days==null?'—':fmt(r.days)}</td><td>${pill(r.stt[0],r.stt[1])}</td></tr>`).join('')+`</table><div class="note">${L.length} items shown. Days of stock = total stock ÷ (sales in last 30 days ÷ 30). Prices as listed in the file.</div></div>`;
  H+=`<div class="card"><h3>Supply plan</h3>${noteBox('stk:act','Actions with supply chain','1) Confirm Q4 supply plan for Zoron, Maxim, Meva  2) Escalate critical items  3) …')}${noteBox('stk:risk','Risks','')}</div>`;
  return H;};
// ---------- CHANGES (previous version vs current)
function changesCalc(){
  const key=(a,pn)=>a+'|'+pn;
  const old={};PREV.fcx.forEach(r=>{const pn=PN(r[1]);const k=key(r[0],pn);const o=old[k]=old[k]||{a:r[0],pn,e:[0,0,0],price:r[2]};for(let i=0;i<3;i++)o.e[i]+=r[3+i];});
  const nw={};FX.rows.forEach(r=>{const k=key(r.a,r.pn);const o=nw[k]=nw[k]||{a:r.a,pn:r.pn,e:[0,0,0],price:r.price};for(let i=0;i<3;i++)o.e[i]+=r.o[i];});
  const rows=[...new Set([...Object.keys(old),...Object.keys(nw)])].map(k=>{const o=old[k]||{e:[0,0,0],price:0},n=nw[k]||{e:[0,0,0],price:0};const a=(old[k]||nw[k]).a,pn=(old[k]||nw[k]).pn;
    return {a,pn,o:o.e.map(Math.round),n:n.e.map(Math.round),ot:Math.round(sum(o.e)),nt:Math.round(sum(n.e)),ov:sum(o.e)*o.price,nv:sum(n.e)*n.price};}).map(r=>({...r,d:r.nt-r.ot,dv:r.nv-r.ov}));
  const ch=rows.filter(r=>r.d!==0);
  const by=(f)=>{const g={};ch.forEach(r=>{const k=f(r);const o=g[k]=g[k]||{k,ot:0,nt:0,ov:0,nv:0};o.ot+=r.ot;o.nt+=r.nt;o.ov+=r.ov;o.nv+=r.nv;});return Object.values(g).map(o=>({...o,d:o.nt-o.ot,dv:o.nv-o.ov})).sort((x,y)=>x.d-y.d);};
  const tot={ot:sum(rows.map(r=>r.ot)),nt:sum(rows.map(r=>r.nt)),ov:sum(rows.map(r=>r.ov)),nv:sum(rows.map(r=>r.nv)),mo:[0,1,2].map(i=>({o:sum(rows.map(r=>r.o[i])),n:sum(rows.map(r=>r.n[i]))}))};
  return {rows,ch,tot,byAcc:by(r=>r.a),byProd:by(r=>r.pn)};}
function changesCard(m){
  const C=changesCalc(),T=m.T,t=C.tot;
  const sal=SALES.team.find(r=>r.rep==='Saleh');const sepNow=sal.m26[8],sepOld=PREV.sep.Saleh;
  return `<div class="card"><h3>What changed in this update</h3>
   <div class="ins"><i>1</i><div><b>Q4 forecast</b> moved from <b>${bx(t.ot)}</b> to <b>${bx(t.nt)}</b> boxes (${pS(ypc(t.nt,t.ot))}); value from ${Mn(t.ov)} to ${Mn(t.nv)} (${pS(ypc(t.nv,t.ov))}). October ${bx(t.mo[0].o)}→${bx(t.mo[0].n)}, November ${bx(t.mo[1].o)}→${bx(t.mo[1].n)}, December ${bx(t.mo[2].o)}→${bx(t.mo[2].n)}.</div></div>
   <div class="ins"><i>2</i><div><b>Your sales</b> YTD moved from ${Mn(PREV.team.Saleh)} to <b>${Mn(T.ytd26)}</b> after the final September close (September ${Mn(sepOld)}→${Mn(sepNow)}). Outlook on paper ${p0(PREV.o)}→<b>${p0(m.o)}</b> at ${S.set.real}% realization.</div></div>
   <div class="ins"><i>3</i><div><b>Al Habib</b> now runs through September: sell-out ${fmt(PREV.habib.u)}→${fmt(m.hAll.u26)} units, branch split added (3 branches), forecast window is Oct–Dec.</div></div>
   <div class="ins"><i>4</i><div><b>Stock</b> snapshot of 4 October added: see Stock &amp; supply.</div></div>
   <button class="btn sec" data-go="changes">Open account-by-account changes</button></div>`;}
ROUTES.changes=function(){
  const m=M(),C=changesCalc(),t=C.tot;
  let H=pageHead('What changed','Previous forecast version vs the Q4 R1 per-item file you just sent, and the effect on your outlook',`<span class="noprint"><button class="btn sec" data-do="chcopy">Copy summary</button></span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(bx(t.nt),'Q4 boxes now',t.nt>=t.ot?'ok':'warn',pS(ypc(t.nt,t.ot))+' vs '+bx(t.ot))}${kpi(Mn(t.nv),'Q4 value now (SAR)',t.nv>=t.ov?'ok':'warn',pS(ypc(t.nv,t.ov))+' vs '+Mn(t.ov))}${kpi(p0(m.o),'Outlook vs annual target',m.o>=.95?'ok':m.o>=.85?'warn':'bad','was '+p0(PREV.o))}${kpi(Mn(m.T.ytd26),'YTD sales (Jan–Sep)','',(m.T.ytd26>=PREV.team.Saleh?'+':'−')+Mn(Math.abs(m.T.ytd26-PREV.team.Saleh))+' after final September')}</div>`;
  H+=changesCard(m);
  H+=`<div class="col2"><div class="card scroll"><h3>By month (boxes)</h3><table class="t"><tr><th class="tl">Month</th><th>Before</th><th>Now</th><th>Change</th></tr>`+['October','November','December'].map((n,i)=>`<tr><td class="tl">${n}</td><td>${bx(t.mo[i].o)}</td><td>${bx(t.mo[i].n)}</td><td class="${cls(t.mo[i].n-t.mo[i].o)}">${t.mo[i].n-t.mo[i].o>0?'+':''}${bx(t.mo[i].n-t.mo[i].o)}</td></tr>`).join('')+`<tr class="hl"><td class="tl"><b>Total</b></td><td><b>${bx(t.ot)}</b></td><td><b>${bx(t.nt)}</b></td><td class="${cls(t.nt-t.ot)}"><b>${t.nt-t.ot>0?'+':''}${bx(t.nt-t.ot)}</b></td></tr></table></div>
   <div class="card scroll"><h3>By drug (boxes)</h3><table class="t"><tr><th class="tl">Drug</th><th>Before</th><th>Now</th><th>Change</th><th>SAR</th></tr>`+C.byProd.map(r=>`<tr><td class="tl">${esc(r.k)}</td><td>${bx(r.ot)}</td><td>${bx(r.nt)}</td><td class="${cls(r.d)}">${r.d>0?'+':''}${bx(r.d)}</td><td class="${cls(r.dv)}">${r.dv>0?'+':'−'}${Mn(Math.abs(r.dv))}</td></tr>`).join('')+`</table></div></div>`;
  H+=`<div class="card scroll"><h3>By account (boxes)</h3><table class="t"><tr><th class="tl">Account</th><th>Before</th><th>Now</th><th>Change</th><th>%</th><th>SAR</th></tr>`+C.byAcc.map(r=>`<tr class="row" data-go="board/${esc(r.k)}"><td class="tl"><bdi>${esc(accNameById(r.k))}</bdi></td><td>${bx(r.ot)}</td><td>${bx(r.nt)}</td><td class="${cls(r.d)}">${r.d>0?'+':''}${bx(r.d)}</td><td class="${cls(r.d)}">${r.ot?pS(r.d/r.ot):'new'}</td><td class="${cls(r.dv)}">${r.dv>0?'+':'−'}${Mn(Math.abs(r.dv))}</td></tr>`).join('')+`</table><div class="note">Only accounts whose forecast changed are listed. Tap one to open its place board.</div></div>`;
  H+=`<div class="card scroll"><h3>Every changed row (account × drug)</h3><table class="t"><tr><th class="tl">Account</th><th class="tl">Drug</th><th>Oct</th><th>Nov</th><th>Dec</th><th>Before</th><th>Now</th><th>Change</th></tr>`+C.ch.sort((x,y)=>x.d-y.d).map(r=>`<tr><td class="tl"><bdi>${esc(accNameById(r.a))}</bdi></td><td class="tl">${esc(r.pn)}</td><td>${bx(r.n[0])}</td><td>${bx(r.n[1])}</td><td>${bx(r.n[2])}</td><td>${bx(r.ot)}</td><td>${bx(r.nt)}</td><td class="${cls(r.d)}">${r.d>0?'+':''}${bx(r.d)}</td></tr>`).join('')+`</table></div>`;
  if(S.arch&&Object.keys(S.arch.fc||{}).length)H+=`<div class="card flat" style="border-color:var(--warn)"><b>Your earlier edits were set aside</b><div class="note">${Object.keys(S.arch.fc).length} forecast rows you edited on the previous version were archived so they do not overwrite the new sheet.</div><button class="btn sec" data-do="restorearch">Restore my earlier edits</button></div>`;
  return H;};

// =====================================================================
// ZAHRAT AL RAWDAH 360 (pharmacy chain · sell-in from the all-rep cube)
// =====================================================================
const ZID='105301120018';
function zahratCalc(m){
  const ci=HAB.dims.c.findIndex(c=>c[0]===ZID);
  const rows=HAB.cube.filter(r=>r[0]===ci);
  const P={},Ln={};
  rows.forEach(r=>{const pd=HAB.dims.p[r[1]],rep=HAB.dims.r[r[2]],k=PN(pd[1]);
    const o=P[k]=P[k]||{n:k,line:pd[3],mine:false,y26:0,y25:0,q4:0,bY:0,bQ:0,rep:{}};
    o.y26+=r[3];o.y25+=r[4];o.q4+=r[5];o.bY+=r[7];o.bQ+=r[9];if(rep==='Saleh')o.mine=true;o.rep[rep]=(o.rep[rep]||0)+Math.abs(r[3])+Math.abs(r[4]);
    const l=Ln[pd[3]]=Ln[pd[3]]||{n:pd[3],y26:0,y25:0,q4:0,bY:0,bQ:0};l.y26+=r[3];l.y25+=r[4];l.q4+=r[5];l.bY+=r[7];l.bQ+=r[9];});
  const prods=Object.values(P).map(o=>({...o,own:Object.entries(o.rep).sort((a,b)=>b[1]-a[1])[0][0]}));
  const lines=Object.values(Ln).sort((a,b)=>b.y26-a.y26);
  const T={y26:sum(prods.map(p=>p.y26)),y25:sum(prods.map(p=>p.y25)),q4:sum(prods.map(p=>p.q4)),bY:sum(prods.map(p=>p.bY)),bQ:sum(prods.map(p=>p.bQ))};
  return {c:m.acc.find(x=>x.id===ZID),prods,lines,T};}
ROUTES.zahrat=function(){
  const m=M(),Z=zahratCalc(m),c=Z.c,T=Z.T;
  if(!c)return pageHead('Zahrat Al Rawdah 360','')+`<div class="card">Account not found in the current data.</div>`;
  const mine=Z.prods.filter(p=>p.mine).sort((a,b)=>b.y26-a.y26),mineT={y26:sum(mine.map(p=>p.y26)),y25:sum(mine.map(p=>p.y25)),q4:sum(mine.map(p=>p.q4))};
  const out=c.y26+c.fc*m.real;
  let H=pageHead('Zahrat Al Rawdah 360','Pharmacy chain · '+esc(c.sub)+' · sell-in from Jamjoom. Your line and the whole Jamjoom portfolio in this account.',`<span>${pill(TIERN[c.tier][0]+' · score '+Math.round(c.score),TIERN[c.tier][1])}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(Mn(c.y26),'Your line · YTD Sep',c.yoy!=null&&c.yoy<-.1?'bad':'ok',`${pS(c.yoy)} vs ${Mn(c.y25)} · ${c.ach==null?'no target':p0(c.ach)+' of '+Mn(c.ytT)}`)}${kpi(Mn(T.y26),'All Jamjoom · YTD Sep',T.y26>=T.y25?'ok':'warn',`${pS(ypc(T.y26,T.y25))} vs ${Mn(T.y25)} · target ${Mn(T.bY)}`)}${kpi(Mn(c.q425),'Your line · Q4 2025 actual','',`all lines ${Mn(T.q4)}`)}${kpi(c.fc>0?Mn(c.fc):'0','Your Q4 forecast (SAR)',c.fc>0?'ok':'bad',c.fc>0?`${bx(c.fbT)} boxes`:'Nothing in the Q4 R1 sheet')}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Your line by month (SAR)</h3>${svgMonthly(c.m26,c.m25,c.tm,9,{fc:[0,0,0,0,0,0,0,0,0,...c.fcm]})}${legend(true)}</div><div class="card"><h3>Read-out</h3>`;
  const neg=c.m26.slice(0,9).map((v,i)=>[v,i]).filter(x=>x[0]<0).map(x=>['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'][x[1]]+' '+Mn(x[0]));
  const dn=mine.filter(p=>p.y25>1000&&p.y26<p.y25).sort((a,b)=>(a.y26-a.y25)-(b.y26-b.y25));
  const R=[];
  R.push(`Your line sold <b>${Mn(c.y26)}</b> Jan–Sep, <b>${pS(c.yoy)}</b> versus ${Mn(c.y25)} last year; it is <b>${p0(mineT.y26/Math.max(T.y26,1))}</b> of everything Jamjoom sells here.`);
  if(neg.length)R.push(`Negative months (credit notes or returns): <b>${neg.join(' · ')}</b>. Ask the account what was returned and why.`);
  if(dn.length)R.push(`Largest falls in your products: ${dn.slice(0,3).map(p=>esc(p.n)+' '+Mn(p.y26-p.y25)).join(' · ')}.`);
  R.push(c.fc>0?`Q4 forecast ${Mn(c.fc)} (${bx(c.fbT)} boxes) against ${Mn(c.q425)} sold in Q4 2025${c.q425>0&&c.fc>c.q425*1.5?` — <b>${(c.fc/c.q425).toFixed(1)}×</b> last Q4 while YTD is ${pS(c.yoy)}. Confirm it is a real order before counting on it.`:'.'}`:`<b>No Q4 forecast</b> for this account in the latest sheet. In Q4 2025 your line sold ${Mn(c.q425)} here (${mine.filter(p=>p.q4>0).sort((a,b)=>b.q4-a.q4).slice(0,3).map(p=>esc(p.n)+' '+Mn(p.q4)).join(' · ')}). Decide whether to rebuild a Q4 order.`);
  R.push(`Whole account: ${Mn(T.y26)} YTD (${pS(ypc(T.y26,T.y25))}); biggest drops are ${Z.prods.filter(p=>p.y25>5000).sort((a,b)=>(a.y26-a.y25)-(b.y26-b.y25)).slice(0,3).map(p=>esc(p.n)+' '+Mn(p.y26-p.y25)).join(' · ')}.`);
  H+=R.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')+`</div></div>`;
  H+=`<div class="card scroll"><h3>Your products in this account (SAR)</h3><table class="t"><tr><th class="tl">Product</th><th>YTD 2026</th><th>YTD 2025</th><th>YoY</th><th>Q4 2025</th><th>Share</th></tr>`+mine.map(p=>`<tr><td class="tl">${esc(p.n)}</td><td>${Mn(p.y26)}</td><td>${Mn(p.y25)}</td><td class="${cls(ypc(p.y26,p.y25))}">${pS(ypc(p.y26,p.y25))}</td><td>${Mn(p.q4)}</td><td>${p0(p.y26/Math.max(mineT.y26,1))}</td></tr>`).join('')+`<tr><td class="tl"><b>Total</b></td><td><b>${Mn(mineT.y26)}</b></td><td><b>${Mn(mineT.y25)}</b></td><td class="${cls(ypc(mineT.y26,mineT.y25))}"><b>${pS(ypc(mineT.y26,mineT.y25))}</b></td><td><b>${Mn(mineT.q4)}</b></td><td></td></tr></table></div>`;
  H+=`<div class="card scroll"><h3>Whole Jamjoom portfolio by line (SAR)</h3><table class="t"><tr><th class="tl">Line</th><th>YTD 2026</th><th>YTD 2025</th><th>YoY</th><th>Target YTD</th><th>Achieved</th><th>Q4 2025</th></tr>`+Z.lines.map(l=>`<tr><td class="tl">${esc(l.n)}</td><td>${Mn(l.y26)}</td><td>${Mn(l.y25)}</td><td class="${cls(ypc(l.y26,l.y25))}">${pS(ypc(l.y26,l.y25))}</td><td>${Mn(l.bY)}</td><td>${l.bY>0?p0(l.y26/l.bY):'—'}</td><td>${Mn(l.q4)}</td></tr>`).join('')+`</table></div>`;
  H+=`<div class="card scroll"><h3>Top products across all lines (SAR)</h3><table class="t"><tr><th class="tl">Product</th><th class="tl">Line</th><th class="tl">Rep</th><th>YTD 2026</th><th>YTD 2025</th><th>YoY</th><th>Q4 2025</th></tr>`+[...Z.prods].sort((a,b)=>Math.max(b.y26,b.y25)-Math.max(a.y26,a.y25)).slice(0,15).map(p=>`<tr><td class="tl">${esc(p.n)}</td><td class="tl">${esc(p.line)}</td><td class="tl">${esc(RN[p.own]||p.own)}</td><td>${Mn(p.y26)}</td><td>${Mn(p.y25)}</td><td class="${cls(ypc(p.y26,p.y25))}">${pS(ypc(p.y26,p.y25))}</td><td>${Mn(p.q4)}</td></tr>`).join('')+`</table></div>`;
  let SC=[];try{SC=stockCheck().filter(x=>mine.some(p=>p.n===x.pn));}catch(e){}
  if(SC.length)H+=`<div class="card scroll"><h3>Supply for the products this account buys</h3><table class="t"><tr><th class="tl">Item</th><th>Warehouse stock</th><th>Q4 forecast (boxes)</th><th>Cover (months)</th></tr>`+SC.map(x=>`<tr><td class="tl">${esc(PN(x.name))}</td><td>${x.it?fmt(x.it.wh):'—'}</td><td>${bx(x.q4)}</td><td class="${x.st==='short'?'dn':''}">${x.cov==null?'not in file':x.cov.toFixed(1)}</td></tr>`).join('')+`</table><div class="note">Cover is against the total Q4 forecast of all your accounts, not this account alone.</div></div>`;
  H+=`<div class="card"><h3>Zahrat Al Rawdah plan</h3>${noteLine('plan:ZAHRAT:goal','Your Q4 goal (SAR)',c.fc>0?Mn(c.fc)+' per forecast':'No forecast yet')}${noteBox('plan:ZAHRAT:act','Actions (who / what / when)','1) Meet purchasing about Q4  2) Clear the returns  3) …')}${noteBox('plan:ZAHRAT:risk','Risks and competitors','')}${noteBox('plan:ZAHRAT:ppl','Contacts (purchasing, pharmacy manager)','')}</div>`;
  H+=`<div class="chips"><button class="btn" data-go="account/${ZID}">Open account page</button><button class="btn sec" data-go="fedit">Forecast Editor</button><button class="btn sec" data-do="asset" data-a="account:${ZID}">Create account one-pager</button></div>`;
  return H;};

// =====================================================================
// DALLAH STOCK · 3 consumption reports (Nakheel, Namar, Pharmacies) · 1 Jul → 14 Oct 2026
// =====================================================================
const DNM=105/30.4;               // months covered by the report (1 Jul → 14 Oct)
const DNB={Nakheel:'Dallah Nakheel',Namar:'Dallah Namar',Pharmacies:'Dallah Pharmacies'};
const DNC=['Nakheel','Namar','Pharmacies'];
function dnCalc(){
  const by={};
  DNC.forEach(bu=>DN.rows[bu].forEach(r=>{const o=by[r[0]]=by[r[0]]||{code:r[0],desc:r[1],unit:r[2],cost:r[10],bu:{},cur:0,cons:0,recv:0,out:0,ordq:0};
    o.bu[bu]={cur:r[3],store:r[4],aziz:r[5],phr:r[6],cons:r[7],recv:r[8],out:r[9],ordq:r[11]};o.cur+=r[3];o.cons+=r[7];o.recv+=r[8];o.out+=r[9];o.ordq+=r[11];if(r[10]>o.cost)o.cost=r[10];}));
  const all=Object.values(by).map(o=>{const rate=o.cons/DNM;return {...o,rate,cover:rate>0?o.cur/rate:null,val:o.cur*o.cost,cv:o.cons*o.cost,st:o.cur<=0&&o.cons>0?'out':rate>0&&o.cur/rate<1?'low':rate>0&&o.cur/rate>12?'over':o.cons<=0&&o.cur>0?'idle':'ok'};});
  const mine=D2.items.map(x=>{const rate=x.cons/DNM;return {...x,rate,cp:rate>0?x.stock/rate:null,d:x.stock-x.prev,st:x.cover!=null&&x.cover<1?'low':x.cover!=null&&x.cover>6?'over':'ok'};});
  // per SKU roll-up against the Dallah Q4 forecast
  const q4={};FX.rows.filter(r=>r.a==='105301310003'||r.a==='435040').forEach(r=>{q4[r.pn]=(q4[r.pn]||0)+sum(r.e||fxEff(r));});
  const sku=Object.keys(DN.map).map(k=>{const it=mine.filter(x=>x.item===k);const stock=sum(it.map(x=>x.stock)),prev=sum(it.map(x=>x.prev)),cons=sum(it.map(x=>x.cons)),recv=sum(it.map(x=>x.recv)),out=sum(it.map(x=>x.outst)),f=DN.fac[k]||1;
    const extra=DNC.map(bu=>{const r=(by[DN.map[k]]||{bu:{}}).bu[bu];return r&&!it.some(x=>x.place===bu)?{bu,cur:r.cur/f,cons:r.cons/f,recv:r.recv/f,out:r.out/f}:null;}).filter(Boolean);
    const st2=stock+sum(extra.map(e=>e.cur)),cn2=cons+sum(extra.map(e=>e.cons)),rc2=recv+sum(extra.map(e=>e.recv)),ou2=out+sum(extra.map(e=>e.out));const rate=cn2/DNM;
    return {k,stock:st2,prev,cons:cn2,recv:rc2,out:ou2,rate,cover:rate>0?st2/rate:null,q4:q4[k]||0,q4cov:q4[k]>0?st2/q4[k]:null,extra};});
  // reconciliation with the monthly consumption file (Jul–Sep) per product
  const nz=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
  const rec=D2.annual.prods.map(p=>{const key=nz(p.n);const hit=all.find(a=>nz(a.desc).startsWith(key)||key.startsWith(nz(a.desc).slice(0,key.length)));if(!hit)return null;const oldQ3=sum(p.m26.slice(6,9));return {n:p.n,code:hit.code,oldQ3,now:hit.cons,oct:hit.cons-oldQ3,cat:p.cat};}).filter(Boolean);
  return {all,mine,sku,rec,tot:{cur:sum(all.map(a=>a.cur)),val:sum(all.map(a=>a.val)),cons:sum(all.map(a=>a.cons)),cv:sum(all.map(a=>a.cv)),out:sum(all.map(a=>a.out)),n:all.length}};}
UI.dn={bu:'all',q:'',f:'all',sort:'cover',all:'n'};
ROUTES.dstock=function(){
  const m=M(),F=UI.dn,C=dnCalc(),T=C.tot;
  const low0=D2.items.filter(x=>x.prev/x.target<1).length,low1=C.mine.filter(x=>x.st==='low').length;
  let H=pageHead('Dallah stock · 14 Oct','Drug consumption reports for Dallah Nakheel, Namar and Pharmacies · supplier Jamjoom · 1 Jul → 14 Oct 2026, compared with the 30 Sep stock and the monthly consumption file.',`<span>${pill(low1+' of your '+C.mine.length+' items under 1 month',low1?'bad':'ok')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(low1),'Your items under 1 month of Oct target',low1>low0?'bad':low1?'warn':'ok',`was ${low0} on 30 Sep`)}${kpi(fmt(sum(C.mine.map(x=>x.stock))),'Your 8 SKUs · stock now (boxes)','',`${pS(ypc(sum(C.mine.map(x=>x.stock)),sum(C.mine.map(x=>x.prev))))} vs 30 Sep ${fmt(sum(C.mine.map(x=>x.prev)))}`)}${kpi(fmt(T.val),'Jamjoom stock at Dallah (SAR, avg cost)','',`${T.n} items · consumed ${fmt(T.cv)} SAR in 3.5 months`)}${kpi(String(C.all.filter(a=>a.out>0).length),'Items with open orders','',`${fmt(T.out)} units outstanding`)}</div>`;
  // A · your SKUs
  H+=`<div class="card scroll"><h3>Your items · 30 Sep → 14 Oct</h3><table class="t"><tr><th class="tl">Place</th><th class="tl">Item</th><th>Stock 30 Sep</th><th>Stock 14 Oct</th><th>Change</th><th>Consumed 1 Jul–14 Oct</th><th>Per month</th><th>Received</th><th>Open order</th><th>Oct target</th><th>Cover vs target</th><th>Cover at pace</th><th>System order</th></tr>`+[...C.mine].sort((a,b)=>(a.cover??99)-(b.cover??99)).map(x=>`<tr><td class="tl">${x.place}</td><td class="tl">${esc(x.item)}</td><td>${fmt(x.prev)}</td><td><b>${fmt(x.stock)}</b></td><td class="${x.d<0?'dn':x.d>0?'up':''}">${x.d>0?'+':''}${fmt(x.d)}</td><td>${fmt(x.cons)}</td><td>${fmt(x.rate)}</td><td>${fmt(x.recv)}</td><td>${x.outst?fmt(x.outst):'—'}</td><td>${fmt(x.target)}</td><td class="${x.st==='low'?'dn':''}">${x.cover==null?'—':x.cover.toFixed(1)} ${x.st==='low'?pill('Low','bad'):x.st==='over'?pill('Over','warn'):''}</td><td>${x.cp==null?'—':x.cp.toFixed(1)}</td><td>${x.ordq>0?fmt(x.ordq):'—'}</td></tr>`).join('')+`</table><div class="note">Boxes. Injections (Zoron 4 and 8) are reported by Dallah in ampoules; they are divided by 5 here to match your boxes. Cover vs target = stock ÷ the October target in the plan; cover at pace = stock ÷ average monthly consumption since 1 Jul. System order is the quantity Dallah's system suggests.</div></div>`;
  // B · SKU roll-up vs Q4 forecast
  H+=`<div class="card scroll"><h3>Each SKU across Dallah vs your Q4 forecast</h3><table class="t"><tr><th class="tl">SKU</th><th>Stock now</th><th>30 Sep</th><th>Per month</th><th>Cover at pace</th><th>Received since 1 Jul</th><th>Open order</th><th>Q4 forecast (boxes)</th><th>Stock ÷ Q4</th></tr>`+C.sku.map(s=>`<tr><td class="tl"><b>${esc(s.k)}</b>${s.extra.length?`<div class="mt" style="font-size:11px">also ${s.extra.map(e=>e.bu+' '+fmt(e.cur)).join(', ')} not in the Oct plan</div>`:''}</td><td><b>${fmt(s.stock)}</b></td><td>${fmt(s.prev)}${s.extra.length?'*':''}</td><td>${fmt(s.rate)}</td><td class="${s.cover!=null&&s.cover<1?'dn':''}">${s.cover==null?'—':s.cover.toFixed(1)+' mo'}</td><td>${fmt(s.recv)}</td><td>${s.out?fmt(s.out):'—'}</td><td>${s.q4?fmt(s.q4):'—'}</td><td class="${s.q4cov!=null&&s.q4cov<.5?'dn':''}">${s.q4cov==null?'—':s.q4cov>5?'>500%':p0(s.q4cov)}</td></tr>`).join('')+`</table><div class="note">* 30 Sep stock covers only the places in the October plan. Q4 forecast = your Dallah Hospital and Ri'aya forecast in the editor (boxes). Stock ÷ Q4 below 50% means Dallah must re-order during the quarter or the forecast will not ship.</div></div>`;
  // C · reconciliation
  const rc=C.rec.filter(r=>C.mine.some(x=>DN.map[x.item]===r.code)||r.cat==='Promotion').sort((a,b)=>Math.abs(b.oldQ3)-Math.abs(a.oldQ3)).slice(0,14);
  H+=`<div class="card scroll"><h3>Check against the monthly consumption file</h3><table class="t"><tr><th class="tl">Product</th><th>Jul–Sep (monthly file)</th><th>1 Jul–14 Oct (new report)</th><th>Implied 1–14 Oct</th><th>Read</th></tr>`+rc.map(r=>`<tr><td class="tl">${esc(r.n)}</td><td>${fmt(r.oldQ3)}</td><td>${fmt(r.now)}</td><td class="${r.oct<0?'dn':''}">${r.oct>0?'+':''}${fmt(r.oct)}</td><td>${r.oct<-Math.max(10,r.oldQ3*.05)?pill('New report lower','warn'):r.oct>=0?pill('Consistent','ok'):pill('≈ match','ok')}</td></tr>`).join('')+`</table><div class="note">The new report should equal Jul–Sep plus the first two weeks of October. Where it is lower, the two Dallah files count a slightly different set of locations or returns; treat those products' consumption as ±5–10%.</div></div>`;
  // D · alerts
  const out=C.all.filter(a=>a.st==='out').sort((a,b)=>b.cv-a.cv).slice(0,8),low=C.all.filter(a=>a.st==='low'&&a.cur>0).sort((a,b)=>b.cv-a.cv).slice(0,8),ovr=C.all.filter(a=>a.st==='over').sort((a,b)=>b.val-a.val).slice(0,8),ord=C.all.filter(a=>a.out>0).sort((a,b)=>b.out*b.cost-a.out*a.cost).slice(0,8);
  const lst=(L,fn)=>L.length?L.map(a=>`<div class="ins"><i>•</i><div>${esc(a.desc.slice(0,48))} <span class="mt">${fn(a)}</span></div></div>`).join(''):'<div class="note">None.</div>';
  H+=`<div class="col2"><div class="card"><h3>Out of stock but still consumed</h3>${lst(out,a=>`consumed ${fmt(a.cons)} since 1 Jul`)}</div><div class="card"><h3>Under 1 month at current pace</h3>${lst(low,a=>`stock ${fmt(a.cur)} · ${a.cover.toFixed(1)} mo`)}</div></div>`;
  H+=`<div class="col2"><div class="card"><h3>Overstocked (over 12 months)</h3>${lst(ovr,a=>`stock ${fmt(a.cur)} · ${fmt(a.val)} SAR`)}</div><div class="card"><h3>Largest open orders</h3>${lst(ord,a=>`${fmt(a.out)} outstanding · ${fmt(a.out*a.cost)} SAR`)}</div></div>`;
  // E · full portfolio
  const bu=F.bu,q=F.q.toLowerCase();
  let L=C.all.map(a=>bu==='all'?a:{...a,...(a.bu[bu]?{cur:a.bu[bu].cur,cons:a.bu[bu].cons,recv:a.bu[bu].recv,out:a.bu[bu].out,rate:a.bu[bu].cons/DNM,cover:a.bu[bu].cons>0?a.bu[bu].cur/(a.bu[bu].cons/DNM):null,val:a.bu[bu].cur*a.cost}:{cur:0,cons:0,recv:0,out:0,rate:0,cover:null,val:0})}).filter(a=>(a.cur||a.cons||a.recv||a.out)&&(!q||(a.desc+a.code).toLowerCase().includes(q))&&(F.f==='all'||(F.f==='low'&&a.cover!=null&&a.cover<1)||(F.f==='out'&&a.cur<=0&&a.cons>0)||(F.f==='over'&&a.cover!=null&&a.cover>12)||(F.f==='po'&&a.out>0)));
  L.sort((a,b)=>F.sort==='val'?b.val-a.val:F.sort==='cons'?b.cons-a.cons:(a.cover??999)-(b.cover??999));
  const shown=F.all==='y'?L:L.slice(0,40);
  H+=`<div class="eyebrow">Whole Jamjoom range at Dallah</div>`+chipsRow([['all','All three'],['Nakheel','Nakheel'],['Namar','Namar'],['Pharmacies','Pharmacies']],bu,'dn.bu')+chipsRow([['all','All items'],['low','Under 1 month'],['out','Out of stock'],['over','Over 12 months'],['po','Open orders']],F.f,'dn.f')+chipsRow([['cover','Sort: cover'],['val','Sort: stock value'],['cons','Sort: consumption']],F.sort,'dn.sort')+searchBox('dq','dn.q','Search item or code');
  H+=`<div class="note">${L.length} items · ${bu==='all'?'all three places':DNB[bu]}</div><div class="card scroll"><table class="t"><tr><th class="tl">Item</th><th>Stock</th><th>Consumed</th><th>Per month</th><th>Cover (mo)</th><th>Received</th><th>Open</th><th>Stock value</th></tr>`+shown.map(a=>`<tr><td class="tl">${esc(a.desc.slice(0,52))}<div class="mt" style="font-size:11px">${esc(a.code)}</div></td><td>${fmt(a.cur)}</td><td>${fmt(a.cons)}</td><td>${fmt(a.rate)}</td><td class="${a.cover!=null&&a.cover<1?'dn':''}">${a.cover==null?'—':a.cover.toFixed(1)}</td><td>${a.recv?fmt(a.recv):'—'}</td><td>${a.out?fmt(a.out):'—'}</td><td>${fmt(a.val)}</td></tr>`).join('')+`</table>${L.length>40?`<div class="chips" style="margin-top:8px"><button class="btn sec" data-do="ui" data-p="dn.all" data-v="${F.all==='y'?'n':'y'}">${F.all==='y'?'Show top 40':'Show all '+L.length}</button></div>`:''}</div>`;
  H+=`<div class="card"><h3>Dallah supply plan</h3>${noteBox('plan:DSTOCK:act','Actions with Dallah pharmacy and purchasing','1) Re-order the low items  2) Confirm open orders  3) …')}</div>`;
  return H;};

// =====================================================================
// ALERTS + MONTHLY FOLLOW-UP
// =====================================================================
const AL_DEF={cov:1,yoy:25,fcx:1.5,sq4:50,hab:25,br:20};
const alTh=()=>({...AL_DEF,...((S.set&&S.set.th)||{})});
const SEVX={critical:['Critical','bad',0],high:['High','bad',1],medium:['Medium','warn',2],info:['Info','info',3]};
const ALCAT={target:'Target',supply:'Supply',forecast:'Forecast',sales:'Sales',habib:'Al Habib',dallah:'Dallah',cover:'Coverage',data:'Data freshness'};
// data sources: period end of the data, expected refresh cadence (days)
const SRCS=[
 {id:'sales',n:'Sales file · 25 vs 26 YTD, per rep and account',end:'2026-09-30',cad:31,req:'Right after month-end close',use:'Plan, Accounts, Tiering, Explorer'},
 {id:'fc',n:'Q4 forecast · per item',end:'2026-10-17',cad:31,req:'Whenever the forecast is revised',use:'Forecast, Split, Editor, What changed'},
 {id:'hab',n:'Al Habib dashboard · YTD',end:'2026-09-30',cad:31,req:'Month-end',use:'Al Habib 360'},
 {id:'br',n:'Al Habib branches · sales out',end:'2026-09-30',cad:31,req:'Month-end',use:'Habib Branches'},
 {id:'jj',n:'Jamjoom stock file',end:'2026-10-04',cad:30,req:'Every month, mid-month',use:'Stock & supply'},
 {id:'dal',n:'Dallah consumption reports (Nakheel, Namar, Pharmacies)',end:'2026-10-14',cad:30,req:'Every month, mid-month',use:'Dallah stock, Dallah 360'},
 {id:'hq',n:'HQ tracker · visits and goals',end:'2026-10-04',cad:30,req:'Every month',use:'Doctors, Stakeholders, Daily'}];
const dayMs=864e5;
const srcAge=s=>Math.floor((Date.now()-new Date(s.end+'T00:00:00').getTime())/dayMs);
const srcNext=s=>new Date(new Date(s.end+'T00:00:00').getTime()+s.cad*dayMs);
const srcSt=s=>{const a=srcAge(s);return a>s.cad?['Overdue','bad']:a>s.cad-7?['Due soon','warn']:['Fresh','ok'];};
const dFmt=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const prevSnap=()=>{const L=HIST.filter(h=>h.d<DATAVER);return L.length?L[L.length-1]:null;};
let _alc=null;
function alertsCalc(m){
  const th=alTh(),key=JSON.stringify(th);if(_alc&&_alc.m===m&&_alc.k===key)return _alc.v;
  const A=[];const add=(k,cat,sev,title,detail,act,go,owner,impact)=>A.push({key:k,cat,sev,title,detail,act,go,owner:owner||'You',impact:impact||0});
  const T=m.T;
  // target
  if(m.o<.95)add('tgt:outlook','target',m.o<.85?'critical':'high',`Closing at ${p0(m.o)} of the annual target`,`Gap to target ${Mn(T.gap)}; Q4 would need ${(T.gap/Math.max(T.q425,1)).toFixed(1)}× last Q4 (${Mn(T.q425)}). Health score ${Math.round(m.health.score)}.`,'Open Plan to Achieve, pick levers that close the gap.','plan','You + Manager',T.gap);
  // forecast version change
  try{const C=changesCalc(),t=C.tot;if(t.nt<t.ot*.9)add('fc:cut','forecast','high',`Q4 forecast cut ${pS(ypc(t.nt,t.ot))} in the latest sheet`,`Boxes ${bx(t.ot)} → ${bx(t.nt)}, SAR ${Mn(t.ov)} → ${Mn(t.nv)}. Largest cuts: ${C.byProd.slice(0,3).map(r=>PN(r.k)+' '+r.d).join(' · ')}.`,'Review account-by-account changes and rebuild volume where possible.','changes','You',t.ov-t.nv);}catch(e){}
  m.acc.forEach(c=>{
    if(c.fc>=50000&&c.q425>0&&c.fc>c.q425*th.fcx)add('fc:ratio:'+c.id,'forecast',c.fc>c.q425*3?'high':'medium',`${String(c.n).trim()} forecast is ${(c.fc/c.q425).toFixed(1)}× its Q4-25`,`Forecast ${Mn(c.fc)} vs ${Mn(c.q425)} sold in Q4 2025; YTD is ${pS(c.yoy)}.`,'Confirm it is a real, scheduled order before counting on it.','account/'+c.id,'You',c.fc-c.q425);
    if(c.fc>=50000&&c.q425<=0)add('fc:new:'+c.id,'forecast','medium',`${String(c.n).trim()} has a ${Mn(c.fc)} forecast with no Q4-25 history`,'No sales in Q4 last year to support it.','Ask the account for a confirmed PO or lower the forecast.','account/'+c.id,'You',c.fc);
    if(c.q425>=30000&&c.fc<=0)add('fc:none:'+c.id,'forecast','medium',`${String(c.n).trim()} has no Q4 forecast`,`It bought ${Mn(c.q425)} in Q4 2025.`,'Decide whether to rebuild a Q4 order.','account/'+c.id,'You',c.q425);
    if(c.y25>=30000&&c.yoy!=null&&c.yoy<-th.yoy/100)add('sales:yoy:'+c.id,'sales',(c.y25-c.y26)>100000?'high':'medium',`${String(c.n).trim()} is ${pS(c.yoy)} vs 2025`,`YTD ${Mn(c.y26)} vs ${Mn(c.y25)}.`,'Visit the buyer, find out what moved, rebuild the order plan.','account/'+c.id,'You',c.y25-c.y26);
    const ng=c.m26.slice(6,9).filter(v=>v<-1000);if(ng.length)add('sales:neg:'+c.id,'sales','medium',`${String(c.n).trim()}: credit notes or returns in Jul–Sep`,`Negative months total ${Mn(sum(ng))}.`,'Ask the account what was returned and why.','account/'+c.id,'You',Math.abs(sum(ng)));
  });
  // supply · Jamjoom warehouse
  try{stockCheck().forEach(x=>{if(x.st==='short')add('sup:wh:'+x.pn,'supply',x.cov<.5?'critical':'high',`${PN(x.name)}: warehouse stock covers ${x.cov.toFixed(1)} months of the Q4 forecast`,`Forecast ${bx(x.q4)} boxes in Q4, about ${bx(x.mo)} per month; warehouse holds ${x.it?fmt(x.it.wh):'—'}.`,'Ask supply chain for the Q4 supply plan on this SKU.','stock','Supply chain',x.q4*(PRICE_BY_PN[x.pn]||30));else if(x.st==='nofile')add('sup:nofile:'+x.pn,'supply','medium',`${PN(x.name)} is in your forecast but not in the stock file`,`${bx(x.q4)} boxes forecast.`,'Confirm the item code and stock with supply chain.','stock','Supply chain',x.q4*(PRICE_BY_PN[x.pn]||30));});}catch(e){}
  // supply · Dallah
  try{const C=dnCalc();
    C.sku.forEach(s=>{if(s.q4cov!=null&&s.q4cov<th.sq4/100&&s.cover!=null&&s.cover<2)add('dal:q4:'+s.k,'dallah',s.cover<1.2?'critical':'high',`Dallah holds ${p0(s.q4cov)} of the Q4 forecast for ${s.k}`,`Stock ${bx(s.stock)} boxes vs Q4 forecast ${bx(s.q4)}; pace ${bx(s.rate)} per month (${s.cover.toFixed(1)} months).`,'Ask Dallah purchasing to order now and agree a monthly delivery calendar.','dstock','You + Dallah',Math.max(s.q4-s.stock,0)*(PRICE_BY_PN[s.k]||30));
      if(s.cover!=null&&s.cover>12&&s.stock>200)add('dal:over:'+s.k,'dallah','info',`${s.k} is overstocked at Dallah (${s.cover.toFixed(0)} months)`,`Stock ${bx(s.stock)} boxes vs pace ${bx(s.rate)} per month.`,'Do not push new orders; look for a transfer or promotion.','dstock','You',0);});
    C.mine.forEach(x=>{if(x.cover!=null&&x.cover<th.cov)add('dal:low:'+x.place+':'+x.item,'dallah','high',`${x.place} · ${x.item}: ${x.cover.toFixed(1)} months vs the October target`,`Stock ${bx(x.stock)} (was ${bx(x.prev)} on 30 Sep), target ${bx(x.target)}${x.outst?`, open order ${bx(x.outst)}`:''}.`,'Ask the pharmacy to order or transfer stock.','dstock','You + Dallah',x.target*(PRICE_BY_PN[x.item]||30));});
    C.mine.forEach(x=>{if(x.outst>0)add('dal:po:'+x.place+':'+x.item,'dallah','medium',`${x.place} · ${x.item}: open order of ${bx(x.outst)} boxes`,'Delivery date not in the report.','Confirm delivery date with Jamjoom supply.','dstock','Supply chain',x.outst*(PRICE_BY_PN[x.item]||30));});
    const oos=C.all.filter(a=>a.st==='out').length;if(oos)add('dal:oos','dallah','info',`${oos} Jamjoom items at Dallah are out of stock but still consumed`,'Other reps\' products as well as yours.','Share the list with the supply team.','dstock','Manager',0);
  }catch(e){}
  // Al Habib
  const h=m.hAll;if(h.si>0&&h.gap/h.si>th.hab/100)add('hab:overstock','habib',h.gap/h.si>.4?'critical':'high',`Habib overstock is ${p0(h.gap/h.si)} of sell-in`,`Sell-in ${Mn(h.si)} vs sell-out ${Mn(h.so)}: ${Mn(h.gap)} more bought than consumed. Your Oct–Dec plan is ${Mn(h.fv)}.`,'Agree an order calendar by product and confirm what the objective means.','habib','You + Manager',h.gap);
  try{const obj=HAB.habib.m.obj;if(obj>0&&h.fv/obj<.9)add('hab:obj','habib','high',`Habib Oct–Dec plan is ${p0(h.fv/obj)} of the ${Mn(obj)} objective`,`Plan ${Mn(h.fv)}. If overstock is deducted it is only ${p0((h.fv-h.gap)/obj)}.`,'Confirm the definition of the objective with your manager.','habib','Manager',obj-h.fv);}catch(e){}
  try{const C=brCalc(m);C.A.forEach(b=>{if(b.prev3>0&&b.last3<b.prev3*(1-th.br/100))add('br:'+b.id,'habib','medium',`${b.n} sell-out fell ${pS(ypc(b.last3,b.prev3))} in the last 3 months`,`Jul–Sep ${fmt(b.last3)} units vs Apr–Jun ${fmt(b.prev3)}.`,'Check the branch pharmacy for stock-outs or competitor moves.','branches','You',0);});
    if(C.noBr.length)add('br:nodata','habib','info',`${[...new Set(C.noBr.map(d=>d.s))].join(', ')} has no branch sales data`,`${C.noBr.length} doctors at sites outside the three branches.`,'Ask Habib for the missing branch file.','branches','You',0);}catch(e){}
  // coverage
  const za=m.docs.filter(d=>d.c==='A'&&d.goal>0&&d.act===0);if(za.length)add('cov:A','cover','medium',`${za.length} Class A doctors have no HQ visit this cycle`,za.slice(0,4).map(d=>d.n).join(' · ')+(za.length>4?' …':''),'Put them in the next visit plan.','doctors','You',0);
  if(m.terr&&m.terr.goal>0&&m.terr.act/m.terr.goal<.7)add('cov:hq','cover','medium',`HQ visit attainment is ${p0(m.terr.act/m.terr.goal)}`,`${m.terr.act} of ${m.terr.goal} visits done.`,'Re-plan remaining days around Tier 1 and Class A.','daily','You',0);
  // data freshness
  SRCS.forEach(s=>{const a=srcAge(s),st=srcSt(s);if(st[0]==='Overdue')add('data:'+s.id,'data',a>s.cad*1.5?'high':'medium',`${s.n} is ${a} days old`,`Data ends ${dFmt(new Date(s.end+'T00:00:00'))}; refresh expected every ${s.cad} days.`,'Send the updated file in the chat.','monthly','You',0);});
  const order={critical:0,high:1,medium:2,info:3};A.sort((a,b)=>order[a.sev]-order[b.sev]||b.impact-a.impact);
  _alc={m,k:key,v:A};return A;}
function alStatus(a){const r=S.al&&S.al[a.key];if(!r)return 'open';if(r.st==='snooze')return r.until>Date.now()?'snooze':'open';return r.st;}
const alOpen=m=>alertsCalc(m).filter(a=>alStatus(a)==='open');
const alCount=m=>{const o=alOpen(m);return {c:o.filter(a=>a.sev==='critical').length,h:o.filter(a=>a.sev==='high').length,m:o.filter(a=>a.sev==='medium').length,i:o.filter(a=>a.sev==='info').length,n:o.length};};
function snapNow(){const m=M(),C=changesCalc(),n=alCount(m),all=alertsCalc(m);
  return {d:DATAVER,label:'Q4 R1 forecast, sales through Sep, Dallah 14 Oct',o:+m.o.toFixed(4),h:+m.health.score.toFixed(1),ytd:Math.round(m.T.ytd26),fcSar:Math.round(C.tot.nv),fcBox:Math.round(C.tot.nt),hSo:Math.round(m.hAll.so),hSi:Math.round(m.hAll.si),hGap:Math.round(m.hAll.gap),low:m.day.items.filter(x=>x.cover!=null&&x.cover<1).length,crit:n.c,high:n.h,med:n.m,keys:all.map(a=>a.key)};}
const SEVP=a=>pill(SEVX[a.sev][0],SEVX[a.sev][1]);
function alertCard(a,m,prevKeys){
  const st=alStatus(a),isNew=prevKeys&&!prevKeys.includes(a.key);
  return `<div class="card" style="border-left:4px solid var(--${a.sev==='info'?'brand2':a.sev==='medium'?'warn':'bad'})"><div class="row" style="border:0;padding:0"><div class="l"><b>${a.title}</b><span>${ALCAT[a.cat]} · ${esc(a.owner)}</span></div><div style="text-align:right">${SEVP(a)} ${isNew?pill('New','info'):''} ${st!=='open'?pill(st==='ack'?'Acknowledged':st==='done'?'Done':'Snoozed','idle'):''}</div></div>
  <div class="mt" style="margin:6px 0">${a.detail}</div><div class="ins" style="margin:6px 0"><i>→</i><div>${a.act}</div></div>
  <div class="chips">${READONLY?'':`<button class="btn sec" data-do="alset" data-k="${esc(a.key)}" data-s="ack">Acknowledge</button><button class="btn sec" data-do="alset" data-k="${esc(a.key)}" data-s="done">Done</button><button class="btn sec" data-do="alset" data-k="${esc(a.key)}" data-s="snooze">Snooze 7 days</button>${st!=='open'?`<button class="btn sec" data-do="alset" data-k="${esc(a.key)}" data-s="open">Reopen</button>`:''}`}<button class="btn" data-go="${a.go}">Open</button></div>${noteLine('al:'+a.key,'Note','What did you do or agree?')}</div>`;}
UI.al={cat:'all',sev:'all',st:'open'};
ROUTES.alerts=function(){
  const m=M(),F=UI.al,A=alertsCalc(m),n=alCount(m),ps=prevSnap(),pk=ps&&ps.keys||null;
  let H=pageHead('Alerts','Rules run on every update. Each alert has a severity, an owner, a next step and a status that stays with it from month to month.',`<span>${pill(n.c+n.h+' need action',n.c?'bad':n.h?'warn':'ok')}</span>`);
  const done=A.filter(a=>alStatus(a)==='done').length,ack=A.filter(a=>alStatus(a)==='ack').length,snz=A.filter(a=>alStatus(a)==='snooze').length;
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(String(n.c),'Critical',n.c?'bad':'ok','act this week')}${kpi(String(n.h),'High',n.h?'warn':'ok','act this month')}${kpi(String(n.m+n.i),'Medium and info','','watch')}${kpi(done+ack+snz+'','Handled','ok',`${done} done · ${ack} acknowledged · ${snz} snoozed`)}</div>`;
  H+=chipsRow([['all','All areas'],...Object.keys(ALCAT).filter(k=>A.some(a=>a.cat===k)).map(k=>[k,ALCAT[k]+' '+A.filter(a=>a.cat===k).length])],F.cat,'al.cat')+chipsRow([['all','Any severity'],['critical','Critical'],['high','High'],['medium','Medium'],['info','Info']],F.sev,'al.sev')+chipsRow([['open','Open'],['handled','Handled'],['all','All']],F.st,'al.st');
  const L=A.filter(a=>(F.cat==='all'||a.cat===F.cat)&&(F.sev==='all'||a.sev===F.sev)&&(F.st==='all'||(F.st==='open'?alStatus(a)==='open':alStatus(a)!=='open')));
  H+=`<div class="note">${L.length} alerts${pk?` · compared with the update of ${ps.d}`:''}</div>`+(L.length?L.map(a=>alertCard(a,m,pk)).join(''):`<div class="card">Nothing here. ${F.st==='open'?'All open alerts are handled.':''}</div>`);
  if(pk){const gone=pk.filter(k=>!A.some(a=>a.key===k));H+=`<div class="card"><h3>Cleared since the last update</h3>${gone.length?`<div class="note">${gone.length} alerts from ${esc(ps.d)} no longer trigger.</div>`:'<div class="note">None cleared.</div>'}</div>`;}
  const t=alTh();
  H+=`<div class="card"><h3>Alert thresholds</h3><div class="note">Change a threshold and the alerts recalculate.</div>`+[['cov','Low cover (months)',1,.5,3,.5],['yoy','Account decline vs last year (%)',25,10,60,5],['fcx','Forecast vs last Q4 (×)',1.5,1,4,.5],['sq4','Dallah stock ÷ Q4 forecast (%)',50,20,100,10],['hab','Habib overstock (% of sell-in)',25,10,50,5],['br','Branch fall, last 3 months (%)',20,10,50,5]].map(r=>`<div class="row"><div class="l"><b>${r[1]}</b></div><div style="text-align:right"><button class="btn sec" data-do="thadj" data-k="${r[0]}" data-d="${-r[5]}" data-min="${r[3]}" data-max="${r[4]}">−</button> <b style="display:inline-block;min-width:44px;text-align:center">${t[r[0]]}</b> <button class="btn sec" data-do="thadj" data-k="${r[0]}" data-d="${r[5]}" data-min="${r[3]}" data-max="${r[4]}">+</button></div></div>`).join('')+`<div class="chips" style="margin-top:8px"><button class="btn sec" data-do="alcopy">Copy alerts digest</button><button class="btn sec" data-do="thadj" data-k="reset">Reset thresholds</button></div></div>`;
  return H;};
function alertsCard(m){const A=alOpen(m),n=alCount(m);if(!A.length)return `<div class="card flat"><b>🔔 Alerts</b><div class="mt">No open alerts.</div></div>`;
  return `<div class="card" style="border-color:${n.c?'var(--bad)':'var(--warn)'}"><div class="row" style="border:0;padding:0"><div class="l"><b>🔔 ${n.c} critical · ${n.h} high · ${n.m+n.i} other open alerts</b><span>Highest first</span></div><button class="btn" data-go="alerts">Open alerts</button></div>${A.slice(0,4).map(a=>`<div class="ins" style="cursor:pointer" data-go="alerts"><i>${a.sev==='critical'?'🔴':a.sev==='high'?'🟠':'🟡'}</i><div>${a.title}</div></div>`).join('')}</div>`;}
// ---------- monthly follow-up
const MO_CHECK=[['alerts','Review every critical and high alert and set its status','alerts'],['target','Check the outlook and the realization % used in the plan','plan'],['fc','Compare the forecast with what the accounts really ordered','forecast'],['habib','Reconcile Habib sell-in against sell-out and confirm the objective','habib'],['dallah','Check Dallah and Jamjoom stock cover for Zoron, Maxim and Meva','dstock'],['cov','Check HQ visit coverage for Tier 1 and Class A doctors','doctors'],['mgr','Send the monthly report to your manager','monthly'],['files','Send the next month\'s files to Claude','monthly']];
function moText(m){const ps=prevSnap(),n=alCount(m),T=m.T,C=changesCalc(),A=alOpen(m).filter(a=>a.sev==='critical'||a.sev==='high').slice(0,6);
  const L=[`Monthly follow-up · data of ${DATAVER}`,'',`Position: closing at ${p0(m.o)} of the ${Mn(T.bgFY)} annual target (health ${Math.round(m.health.score)}/100). YTD ${Mn(T.ytd26)}, ${pS(T.yoy)} vs 2025; gap ${Mn(T.gap)}.`,`Q4 forecast: ${bx(C.tot.nt)} boxes, SAR ${Mn(C.tot.nv)}.`];
  if(ps)L.push(`Since ${ps.d}: outlook ${p0(ps.o)} → ${p0(m.o)}, forecast SAR ${Mn(ps.fcSar)} → ${Mn(C.tot.nv)}, Habib overstock ${Mn(ps.hGap)} → ${Mn(m.hAll.gap)}.`);
  L.push('',`Open alerts: ${n.c} critical, ${n.h} high, ${n.m+n.i} other.`);A.forEach(a=>L.push(`- ${a.title}. Next: ${a.act}`));
  L.push('',`Data: ${SRCS.map(s=>s.n.split(' · ')[0]+' to '+dFmt(new Date(s.end+'T00:00:00'))).join('; ')}.`);return L.join('\n');}
ROUTES.monthly=function(){
  const m=M(),ps=prevSnap(),n=alCount(m),T=m.T,C=changesCalc(),now=snapNow();
  const ck=new Date().toISOString().slice(0,7),chk=(S.mo&&S.mo[ck])||{},doneN=MO_CHECK.filter(c=>chk[c[0]]).length;
  const od=SRCS.filter(s=>srcSt(s)[0]==='Overdue').length,nx=SRCS.map(s=>srcNext(s)).sort((a,b)=>a-b)[0];
  let H=pageHead('Monthly follow-up','What changed since the last update, which files are due, and the month-end checklist. Send the new files in the chat and the dashboard, alerts and this page refresh together.',`<span>${pill(od?od+' sources overdue':'Sources fresh',od?'bad':'ok')}</span>`);
  H+=`<div class="grid g4" style="margin-bottom:12px">${kpi(DATAVER,'Data version','',ps?'previous '+ps.d:'first snapshot')}${kpi(dFmt(nx),'Next file due',nx<Date.now()?'bad':'ok','earliest of all sources')}${kpi(String(n.c+n.h),'Critical and high alerts open',n.c?'bad':n.h?'warn':'ok',`${n.c} critical · ${n.h} high`)}${kpi(doneN+'/'+MO_CHECK.length,'Month-end checklist '+ck,doneN===MO_CHECK.length?'ok':'warn','ticked this month')}</div>`;
  // comparison
  const rows=[['Outlook vs annual target',p0(ps&&ps.o),p0(now.o),ps?(now.o-ps.o)*100:null,'pt',1],['Health score',ps?String(Math.round(ps.h)):'—',String(Math.round(now.h)),ps?now.h-ps.h:null,'',1],['YTD sales (your line)',ps?Mn(ps.ytd):'—',Mn(now.ytd),ps?now.ytd-ps.ytd:null,'',1],['Q4 forecast (SAR)',ps?Mn(ps.fcSar):'—',Mn(now.fcSar),ps?now.fcSar-ps.fcSar:null,'',1],['Q4 forecast (boxes)',ps?bx(ps.fcBox):'—',bx(now.fcBox),ps?now.fcBox-ps.fcBox:null,'',1],['Habib sell-out (SAR)',ps?Mn(ps.hSo):'—',Mn(now.hSo),ps?now.hSo-ps.hSo:null,'',1],['Habib overstock (SAR)',ps?Mn(ps.hGap):'—',Mn(now.hGap),ps?now.hGap-ps.hGap:null,'',-1],['Dallah items under 1 month',ps&&ps.low!=null?String(ps.low):'—',String(now.low),ps&&ps.low!=null?now.low-ps.low:null,'',-1],['Critical alerts',ps&&ps.crit!=null?String(ps.crit):'—',String(now.crit),ps&&ps.crit!=null?now.crit-ps.crit:null,'',-1],['High alerts',ps&&ps.high!=null?String(ps.high):'—',String(now.high),ps&&ps.high!=null?now.high-ps.high:null,'',-1]];
  H+=`<div class="card scroll"><h3>Since the previous update${ps?' · '+esc(ps.d):''}</h3><table class="t"><tr><th class="tl">Measure</th><th>Previous</th><th>Now</th><th>Change</th></tr>`+rows.map(r=>{const d=r[3],good=d==null||Math.abs(d)<.0001?'':(d*r[5]>0?'up':'dn');return `<tr><td class="tl">${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td class="${good}">${d==null?'—':(d>0?'+':d<0?'−':'')+(r[4]==='pt'?Math.abs(d).toFixed(1)+' pt':fmt(Math.abs(d)))}</td></tr>`;}).join('')+`</table><div class="note">${ps?'':'This is the first snapshot. '}The last row of the trend below is live.</div></div>`;
  // trend
  const TR=[...HIST.filter(h=>h.d!==DATAVER),{...now,live:true}];
  H+=`<div class="card scroll"><h3>Trend by update</h3><table class="t"><tr><th class="tl">Update</th><th>Outlook</th><th>Health</th><th>YTD (your line)</th><th>Q4 forecast (SAR)</th><th>Habib overstock</th><th>Critical</th><th>High</th></tr>`+TR.map(h=>`<tr><td class="tl">${esc(h.d)}${h.live?' (live)':''}<div class="mt" style="font-size:11px">${esc(h.label||'')}</div></td><td>${p0(h.o)}</td><td>${Math.round(h.h)}</td><td>${Mn(h.ytd)}</td><td>${Mn(h.fcSar)}</td><td>${Mn(h.hGap)}</td><td>${h.crit??'—'}</td><td>${h.high??'—'}</td></tr>`).join('')+`</table></div>`;
  // sources
  H+=`<div class="card scroll"><h3>Files and when the next one is due</h3><table class="t"><tr><th class="tl">File</th><th>Data ends</th><th>Age</th><th>Next due</th><th>Status</th><th class="tl">Send</th></tr>`+SRCS.map(s=>{const st=srcSt(s);return `<tr><td class="tl" style="white-space:normal;min-width:220px"><b>${s.n}</b><div class="mt" style="font-size:11px">${s.use}</div></td><td>${dFmt(new Date(s.end+'T00:00:00'))}</td><td>${srcAge(s)} d</td><td>${dFmt(srcNext(s))}</td><td>${pill(st[0],st[1])}</td><td class="tl" style="white-space:normal">${s.req}</td></tr>`;}).join('')+`</table><div class="note">Age counts from the end of the period in the file. A file turns "Due soon" a week before its next date and "Overdue" after it; overdue files also raise a Data freshness alert.</div></div>`;
  // checklist
  H+=`<div class="card"><h3>Month-end checklist · ${ck}</h3>${hbar(doneN/MO_CHECK.length,doneN===MO_CHECK.length?'ok':'')}`+MO_CHECK.map(c=>`<div class="act"><button class="tick" data-do="mochk" data-k="${c[0]}" style="flex:0 0 36px;height:36px;border-radius:10px;${chk[c[0]]?'background:var(--ok);border-color:var(--ok);color:#fff':''}">${chk[c[0]]?'✓':''}</button><div class="l" style="flex:1"><b>${c[1]}</b></div><button class="btn sec" data-go="${c[2]}">Open</button></div>`).join('')+`</div>`;
  // how to update
  H+=`<div class="card"><h3>How each monthly update works</h3>${['Send the new files in the chat with the words “update the dashboard” (the file names can stay as they are).','Claude reads each file, checks the numbers against the previous version, and flags anything that does not reconcile.','Claude rebuilds and publishes the page. Alerts re-evaluate: new ones are tagged New, cleared ones are listed, and your Acknowledged / Done notes stay with the alert.','A snapshot of the key numbers is added to the trend above, so each month is compared with the last.','You tick the checklist and send the monthly report to your manager.'].map((x,i)=>`<div class="ins"><i>${i+1}</i><div>${x}</div></div>`).join('')}</div>`;
  H+=`<div class="card"><h3>Monthly report for your manager</h3><pre id="moText" style="white-space:pre-wrap;font:13.5px/1.6 Inter,system-ui;margin:0">${esc(moText(m))}</pre><div class="chips" style="margin-top:10px"><button class="btn" data-do="mocopy">Copy report</button><button class="btn sec" data-do="alcopy">Copy alerts digest</button></div></div>`;
  return H;};

// =====================================================================
// CONSUMPTION · my drugs · day / week / month
// =====================================================================
const CSK=[
 ['Zoron 4 Tab',/^ZORON 4 MG TAB/i,/^zoron 4 mg\/tablet/i,1,"ZORON 4Mg Tablet 10's"],
 ['Zoron 4 Inj',/^ZORON 4 MG\/2ML/i,/^zoron 4 mg\/2 ml/i,5,null],
 ['Zoron 8 Tab',/^ZORON 8 MG TAB/i,/^zoron 8 mg\/tablet/i,1,"ZORON 8Mg Tablet 10's"],
 ['Zoron 8 Inj',/^ZORON 8 MG\/4ML/i,/^zoron 8 mg\/4 ml/i,5,"ZORON Injection 8Mg/2ml 5's"],
 ['Meva SR 200',/^MEVA 200/i,/^meva sr 200/i,1,'MEVA 200 MG F.C. TABS X 30'],
 ['Meva 135',/^MEVA 135/i,/^meva 135/i,1,'MEVA 135 MG F.C. TABS X 30'],
 ['Maxim 5s',/^MAXIM 400 MG TAB 5/i,/^maxim 400 mg tablet, 5/i,1,'MAXIM 400MG TAB 1X5'],
 ['Maxim 7s',/^MAXIM 400 MG TAB 7/i,/^maxim 400 mg tablet, 7/i,1,'MAXIM 400MG TAB 1x7']];
const CSD={day:30.4,week:30.4/7,month:1};           // months → period divisor
const CSN={day:'per day',week:'per week',month:'per month'};
const csq=(acc,pn)=>sum(FX.rows.filter(r=>acc.includes(r.a)&&r.pn===pn).map(r=>sum(r.e||fxEff(r))));
function csCalc(m){
  const dc=dnCalc(),D=['105301310003','435040'],H=['105301120009'],all=[...new Set(FX.rows.map(r=>r.a))];
  return CSK.map(k=>{
    const pn=k[0],sk=dc.sku.find(s=>s.k===pn),hp=HP.find(x=>k[1].test(x.name)),an=D2.annual.prods.find(p=>k[2].test(p.n)),jj=k[4]&&JJ.map[k[4]]?JJI[JJ.map[k[4]]]:null,f=k[3];
    const dm26=an?an.m26.map(v=>v/f):[],dm25=an?an.m25.map(v=>v/f):[],hm26=hp?hp.um26:[],hm25=hp?hp.um25:[];
    const tr=a=>a.length>=9?{l3:sum(a.slice(6,9))/3,p3:sum(a.slice(3,6))/3}:null;
    return {pn,dm26,dm25,hm26,hm25,dTr:tr(dm26),hTr:tr(hm26),dRate:sk?sk.rate:0,hRate:hm26.length?sum(hm26.slice(6,9))/3:0,jRate:jj?jj.s30:0,jj,
      q4d:csq(D,pn)/3,q4h:csq(H,pn)/3,q4a:csq(all,pn)/3,dStock:sk?sk.stock:null,dCover:sk?sk.cover:null,hasH:!!hp,hasJ:!!jj};});}
const csV=v=>v==null||!isFinite(v)?'—':v>=100?fmt(v):String(Math.round(v*10)/10);
const csR=(a,b)=>b>0?a/b:null;
const csPill=r=>r==null?'':r>1.5?pill('Forecast '+r.toFixed(1)+'×','warn'):r<.7?pill('Forecast '+r.toFixed(1)+'×','info'):pill('In line','ok');
const csArrow=t=>!t||t.p3<=0?'—':(()=>{const y=t.l3/t.p3-1;return `<span class="${y<-.1?'dn':y>.1?'up':''}">${y>.1?'▲':y<-.1?'▼':'►'} ${pS(y)}</span>`;})();
UI.cs={p:'month',d:'Zoron 4 Tab'};
ROUTES.consume=function(){
  const m=M(),F=UI.cs,dv=CSD[F.p],nm=CSN[F.p],C=csCalc(m),T=m.T,mode=F.p;
  const dl=Math.max(1,Math.ceil((new Date('2026-12-31T23:59:59')-new Date())/864e5)),per=mode==='day'?1:mode==='week'?7:30.4;
  const pace=T.ytd26/273,need=T.gap/dl,q4=T.fcQ4/92;
  let H=pageHead('Consumption · my drugs','How much each of your 8 drugs is really consumed at Dallah and Al Habib and sold by Jamjoom, by day, week and month, against what the Q4 forecast needs.');
  H+=chipsRow([['day','Per day'],['week','Per week'],['month','Per month']],F.p,'cs.p');
  H+=`<div class="card"><h3>Your sales rhythm (SAR ${nm})</h3><div class="grid g4" style="margin-bottom:8px">${kpi(fmt(pace*per),'Average so far','','Jan–Sep, 273 days')}${kpi(fmt(need*per),'Needed to reach the annual target',need>pace*2?'bad':'warn',dl+' days left in the year')}${kpi(fmt(q4*per),'Q4 forecast gives','','Oct–Dec at 100%')}${kpi((need/Math.max(pace,1)).toFixed(1)+'×','Pace needed vs pace so far',need/Math.max(pace,1)>2?'bad':'warn','')}</div><div class="note">Average so far = YTD sales ÷ 273 days. Needed = gap to the annual target ÷ days left. Days and weeks are averages of the monthly numbers: the files hold monthly data, not daily.</div></div>`;
  H+=`<div class="card scroll"><h3>What each channel consumes and what the forecast needs (boxes ${nm})</h3><table class="t"><tr><th class="tl">Drug</th><th>Dallah consumes</th><th>Dallah forecast</th><th>Forecast vs consumption</th><th>Habib sells out</th><th>Habib forecast</th><th>Forecast vs sell-out</th><th>Jamjoom file sales (30 d)</th><th>Your whole Q4 forecast</th></tr>`+C.map(c=>{const rd=csR(c.q4d,c.dRate),rh=csR(c.q4h,c.hRate);return `<tr class="row" data-do="ui" data-p="cs.d" data-v="${esc(c.pn)}" style="cursor:pointer"><td class="tl"><b>${c.pn}</b></td><td>${csV(c.dRate/dv)}</td><td>${csV(c.q4d/dv)}</td><td>${csPill(rd)}</td><td>${c.hasH?csV(c.hRate/dv):'—'}</td><td>${c.hasH?csV(c.q4h/dv):'—'}</td><td>${c.hasH?csPill(rh):''}</td><td>${c.hasJ?csV(c.jRate/dv):'—'}</td><td>${csV(c.q4a/dv)}</td></tr>`;}).join('')+`</table><div class="note">Dallah consumes = average since 1 July (3 places, to 14 Oct). Habib = average July–September sell-out. Jamjoom sold = last 30 days of sales in the Jamjoom stock file; its scope is not confirmed (Dallah alone consumes more than it shows for some drugs), so use it as a trend, not as total sales. Forecast vs consumption above 1.5× means the plan asks for more than the account uses, so it builds stock; below 0.7× means the plan is lighter than real use. Tap a row for the monthly picture.</div></div>`;
  const c=C.find(x=>x.pn===F.d)||C[0];
  H+=chipsRow(C.map(x=>[x.pn,x.pn]),c.pn,'cs.d');
  const pad=a=>[...a,...Array(Math.max(0,12-a.length)).fill(0)].slice(0,12);
  const dd=c.dRate>0?c.dStock/(c.dRate/30.4):null,jd=c.hasJ?jjDays(c.jj):null;
  const read=[];
  read.push(`Dallah uses about <b>${csV(c.dRate/30.4)}</b> boxes a day (${csV(c.dRate/(30.4/7))} a week, ${csV(c.dRate)} a month). Your Q4 forecast there is ${csV(c.q4d/30.4)} a day${csR(c.q4d,c.dRate)?`, which is ${csR(c.q4d,c.dRate).toFixed(1)}× the real use`:''}.`);
  if(dd!=null)read.push(`Stock at Dallah is ${fmt(c.dStock)} boxes, which lasts <b>${fmt(dd)} days</b> at the current pace${dd<45?' — re-order now':dd>365?' — far more than needed':''}.`);
  if(c.hasH)read.push(`Habib sells out ${csV(c.hRate/30.4)} a day; the plan for Habib is ${csV(c.q4h/30.4)} a day (${csR(c.q4h,c.hRate)?csR(c.q4h,c.hRate).toFixed(1)+'×':'—'}).`);
  if(c.hasJ)read.push(`Jamjoom sold ${fmt(c.jRate)} boxes in the last 30 days (${csV(c.jRate/30)} a day) with ${fmt(c.jj.tot)} boxes in stock: ${jd!=null?fmt(jd)+' days':'—'} of cover.`);else read.push('This item is not in the Jamjoom stock file.');
  const tr=c.dTr&&c.dTr.p3>0?`Dallah last 3 months ${csArrow(c.dTr)} vs the 3 before`:'';
  H+=`<div class="card"><h3>${c.pn} · the picture</h3>${read.map(x=>`<div class="ins"><i>•</i><div>${x}</div></div>`).join('')}${tr?`<div class="note">${tr}${c.hTr?` · Habib ${csArrow(c.hTr)}`:''}</div>`:''}</div>`;
  H+=`<div class="col2"><div class="card"><h3>Dallah consumption by month (boxes)</h3>${c.dm26.length?svgMonthly(pad(c.dm26),pad(c.dm25),null,9):'<div class="note">No data.</div>'}${legend()}<div class="note">2025 line stops in July: the file holds 7 months of 2025.</div></div><div class="card"><h3>Habib sell-out by month (units)</h3>${c.hasH?svgMonthly(pad(c.hm26),pad(c.hm25),null,9):'<div class="note">Not sold at Habib.</div>'}${legend()}</div></div>`;
  const mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  H+=`<div class="card scroll"><h3>Month by month · 2026</h3><table class="t"><tr><th class="tl">${c.pn}</th>${mn.map(x=>`<th>${x}</th>`).join('')}<th>Last 3 vs before</th></tr><tr><td class="tl">Dallah boxes</td>${mn.map((x,i)=>`<td>${c.dm26[i]!=null?csV(c.dm26[i]):'—'}</td>`).join('')}<td>${csArrow(c.dTr)}</td></tr><tr><td class="tl">Dallah 2025</td>${mn.map((x,i)=>`<td>${c.dm25[i]!=null?csV(c.dm25[i]):'—'}</td>`).join('')}<td></td></tr><tr><td class="tl">Habib units</td>${mn.map((x,i)=>`<td>${c.hm26[i]!=null?csV(c.hm26[i]):'—'}</td>`).join('')}<td>${csArrow(c.hTr)}</td></tr><tr><td class="tl">Habib 2025</td>${mn.map((x,i)=>`<td>${c.hm25[i]!=null?csV(c.hm25[i]):'—'}</td>`).join('')}<td></td></tr></table></div>`;
  H+=`<div class="card"><h3>Consumption plan</h3>${noteBox('plan:CONS:act','What I will do about consumption (who / what / when)','1) Ask Dallah to re-order Zoron 4  2) Hold Maxim and Meva SR orders  3) …')}</div>`;
  return H;};
