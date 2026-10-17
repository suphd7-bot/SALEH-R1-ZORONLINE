import re,sys
s=open('/home/claude/w/code_orig.js').read()
def rep(old,new,n=1):
    global s
    c=s.count(old)
    if c!=n: sys.exit(f'PATCH FAIL ({c} != {n}): {old[:90]!r}')
    s=s.replace(old,new)

# 1 · version guard so old local edits never overwrite the new sheet
rep("let S={done:{},","const DATAVER='2026-10-17';let NEWVER=false;\nlet S={dv:DATAVER,done:{},")
rep("S.manual=s.manual||{};if(s.set)","S.manual=s.manual||{};S.dv=s.dv;S.arch=s.arch;verGuard();if(s.set)")
rep("function loadLocal(){try{","function verGuard(){if(S.dv===DATAVER)return;const has=Object.keys(S.fc||{}).length||Object.keys(S.dpin||{}).length||Object.keys(S.manual||{}).length;if(has){S.arch={date:S.dv||'earlier',fc:S.fc,dpin:S.dpin,manual:S.manual,fclog:S.fclog};S.fc={};S.dpin={};S.manual={};S.fclog=[];S.fcsnap=[];NEWVER=true;}S.dv=DATAVER;}\nfunction loadLocal(){try{")
rep("JSON.stringify(r)!==JSON.stringify(S)){S={done:r.done,","JSON.stringify(r)!==JSON.stringify(S)){if(r.dv!==DATAVER)return;S={dv:r.dv,arch:r.arch,done:r.done,")

# 2 · Habib: September data, Oct-Dec window
rep("Sulaiman Al Habib warehouse and hospitals · Jan–Aug 2026 · '+HP.length+' drugs',`<span>${pill('Overstock '+p0(A.gap/A.si),A.gap/A.si>.25?'warn':'ok')}</span>`","Sulaiman Al Habib warehouse and hospitals · Jan–Sep 2026 · '+HP.length+' drugs · 3 branches',`<span>${pill('Overstock '+p0(A.gap/A.si),A.gap/A.si>.25?'warn':'ok')} <button class=\"btn sec\" data-go=\"branches\">Branches</button></span>`")
rep("'Forecast Sep–Dec','',p0(A.fv/obj)","'Forecast Oct–Dec','',p0(A.fv/obj)")
rep("<div><b>Sell-in</b> is what","<div><b>Sell-in</b> is what")
rep("Sep–Dec forecast ${Mn(A.fv)} vs objective","Oct–Dec forecast ${Mn(A.fv)} vs objective")
rep("svgMonthly(Array.from({length:8},(_,i)=>hsum(HP,p=>p.um26[i]||0)),Array.from({length:12},(_,i)=>i<8?hsum(HP,p=>p.um25[i]||0):null),null,8)","svgMonthly(Array.from({length:9},(_,i)=>hsum(HP,p=>p.um26[i]||0)),Array.from({length:12},(_,i)=>i<9?hsum(HP,p=>p.um25[i]||0):null),null,9)")
rep("g2oct=hsum(g2,p=>p.price*(p.f[1]+p.f[2]+p.f[3]))","g2oct=hsum(g2,p=>p.price*(p.f[0]+p.f[1]+p.f[2]))")
rep("'Your target for Sep–Dec'","'Your target for Oct–Dec'")
rep("'Units 2026 (Jan–Aug)'","'Units 2026 (Jan–Sep)'")
rep("'Forecast units Sep–Dec'","'Forecast units Oct–Dec'")
rep("svgMonthly(Array.from({length:8},(_,i)=>p.um26[i]||0),Array.from({length:12},(_,i)=>i<8?(p.um25[i]||0):null),null,8)","svgMonthly(Array.from({length:9},(_,i)=>p.um26[i]||0),Array.from({length:12},(_,i)=>i<9?(p.um25[i]||0):null),null,9)")
rep("<h3>Forecast Sep–Dec</h3>","<h3>Forecast Oct–Dec</h3>")
rep("['Sep','Oct','Nov','Dec'].map((mm,i)=>`<tr><td>${mm}</td><td>${fmt(p.f[i])}","['Oct','Nov','Dec'].map((mm,i)=>`<tr><td>${mm}</td><td>${fmt(p.f[i])}")
rep("Jan–Aug. In your GIT 2 line","Jan–Sep. In your GIT 2 line")
rep("the Sep–Dec forecast (${Mn(m.hAll.fv)})","the Oct–Dec forecast (${Mn(m.hAll.fv)})")
rep("Habib through Aug · Dallah stock 30 Sep · HQ tracker 4 Oct</div>`","Habib + branches through Sep · Jamjoom stock 4 Oct · Dallah stock 30 Sep · HQ tracker 4 Oct</div>`")
# branch mini-card on Habib 360 + per-drug branch card
rep("  H+=`<div class=\"eyebrow\">Every drug — classification</div>`","  H+=`<div class=\"eyebrow\">Branches</div><div class=\"card scroll\"><table class=\"t\"><tr><th class=\"tl\">Branch</th><th>Units 2026</th><th>Units 2025</th><th>YoY</th><th>Share</th></tr>`+BR.branches.map((b,i)=>{const u26=sum(BR.prods.map(p=>brU(p,i).y26)),u25=sum(BR.prods.map(p=>brU(p,i).y25)),t=sum(BR.branches.map((x,j)=>sum(BR.prods.map(p=>brU(p,j).y26))));return `<tr class=\"row\" data-go=\"branches\" data-do=\"ui\" data-p=\"br.b\" data-v=\"${b.id}\"><td class=\"tl\">${esc(b.n)}</td><td><b>${fmt(u26)}</b></td><td>${fmt(u25)}</td><td class=\"${cls(ypc(u26,u25))}\">${pS(ypc(u26,u25))}</td><td>${p0(u26/t)}</td></tr>`;}).join('')+`</table><button class=\"btn sec block\" data-go=\"branches\">Open branch analysis</button></div>`;\n  H+=`<div class=\"eyebrow\">Every drug — classification</div>`")
rep("  H+=`<div class=\"card\">${noteBox('hp:'+p.code,","  const bp=BR.prods.find(x=>x.code===p.code);\n  if(bp)H+=`<div class=\"card scroll\"><h3>By branch (units, Jan–Sep)</h3><table class=\"t\"><tr><th class=\"tl\">Branch</th><th>2026</th><th>2025</th><th>YoY</th><th>Sep 26</th><th>Share</th></tr>`+BR.branches.map((b,i)=>{const u=brU(bp,i);const tt=sum(BR.branches.map((x,j)=>brU(bp,j).y26));return `<tr><td class=\"tl\">${esc(b.n)}</td><td><b>${fmt(u.y26)}</b></td><td>${fmt(u.y25)}</td><td class=\"${cls(ypc(u.y26,u.y25))}\">${pS(ypc(u.y26,u.y25))}</td><td>${fmt(bp.v[i][17])}</td><td>${tt?p0(u.y26/tt):'—'}</td></tr>`;}).join('')+`</table></div>`;\n  H+=`<div class=\"card\">${noteBox('hp:'+p.code,")

# 3 · navigation
rep("['fedit','Forecast Editor','✏️','Edit all forecast rows in boxes']","['fedit','Forecast Editor','✏️','Edit all forecast rows in boxes'],['changes','What changed','🆕','Previous version vs this update']")
rep("['habib','Al Habib 360','🏨','Sell-in vs sell-out, drugs, doctors']","['habib','Al Habib 360','🏨','Sell-in vs sell-out, drugs, doctors'],['branches','Habib Branches','🏥','Units by branch, drug and doctor'],['zahrat','Zahrat Al Rawdah 360','💊','Pharmacy chain · your line and all Jamjoom']")
rep("['daily','Daily','☑️','Visits and daily box log']","['daily','Daily','☑️','Visits and daily box log'],['stock','Stock & supply','📦','Jamjoom stock vs your Q4 forecast'],['dstock','Dallah stock','🧪','Dallah consumption and stock, 14 Oct']")
rep("['tiering','stakeholders','doctors','docfc','habib','dallah'].includes(r.id)","['tiering','stakeholders','doctors','docfc','habib','dallah','branches','zahrat'].includes(r.id)")
rep("['forecast','ideas'].includes(r.id)","['forecast','ideas','changes'].includes(r.id)")
rep("'docfc','habib','dallah','daily'].includes(r.id)","'docfc','habib','dallah','daily','branches','changes','zahrat','dstock'].includes(r.id)")
rep("assets:'3 documents',sources:'6 files'","assets:'3 documents',sources:'15 files',branches:`${BR.branches.length} branches`,stock:`${stockCheck().filter(x=>x.st==='short'||x.st==='nofile').length} SKUs short`,changes:'Forecast '+pS(ypc(m.alloc.origBoxes,sum(PREV.fcx.map(r=>r[3]+r[4]+r[5]))))")

# 4 · home
rep("Risk-weighted: ${p0(m.wo)}`)}</div>`;\n  H+=scenarioBar();\n","Risk-weighted: ${p0(m.wo)}`)}</div>`;\n  H+=scenarioBar();\n  H+=changesCard(m);\n")

# 5 · sources
i=s.index("const rows=[['25 VS 26 YTD SEP R1 (6 sheets)'");j=s.index("\n",i)
s=s[:i]+"""const rows=[['25 VS 26 YTD SEP R1 · Non Promoted (final September)','10077 sales rows (2025 and 2026) + per-account targets (4875) + monthly targets · 6 lines · 8 rep positions','Through Sep 2026','Lines, Plan, Accounts, Explorer, Catalog'],['Q4 - 26 - Forecast - R1 - Per Item','Q4 forecast by account × product × month with net prices; your rows = Medical rep Saleh (288 combinations, 91973 boxes)','Oct–Dec 2026','Forecast, Place Board, Split, Editor, What changed'],['Jamjoom 4-10-2026','182 items: warehouse, pharmacy and in-transit stock, 30 and 60 day sales','4 Oct 2026','Stock & supply, Data Health'],['Al Habib Dashboard YTD Sep','51 drugs: monthly sell-out units 2026 vs 2025, quarterly analysis','Jan–Sep 2026','Al Habib 360'],['Al Habib Branches 2025-2026 YTD Sales Out','3 branches × 49 drugs × 18 months (units)','Jan–Sep 2025 and 2026','Habib Branches, Al Habib 360'],['Habib Sales Out YTG Plan','51 drugs: net price, Oct–Dec plan, objective 1591000','Oct–Dec 2026 plan','Al Habib 360'],['Dallah drug consumption (6 PDFs)','Consumption and stock for Nakheel, Namar, Pharmacies','Aug–Sep 2026, stock 30 Sep','Dallah 360, Daily, Data Health'],['HQ Tracker Sun–Wed','160 doctors, goals, visits, class, status; 120 planned visits','4 Oct 2026','Doctors, Stakeholders, Daily'],['Dashboard YTD JULY / SEP (Dallah)','Monthly units (Dallah) 2026 vs 2025','Jan–Sep 2026','Dallah 360']];"""+s[j:]
rep("data-do=\"share\">Share view-only link</button></div></div>`;","data-do=\"share\">Share view-only link</button></div></div>`;\n  H+=`<div class=\"card\"><h3>Data version</h3><div class=\"note\">Loaded: ${DATAVER}. Forecast baseline = Q4 R1 per-item file. ${S.arch?'Your earlier edits are archived (restore from What changed).':''}</div></div>`;")

# 6 · actions
rep("data-do=\"ui\" data-p=\"hab.line\"","data-do=\"ui\" data-p=\"hab.line\"",1) if False else None
rep("  ui(el){setPath","  ui(el){setPath") if False else None
rep(" ui(el){setPath(el.dataset.p,el.dataset.v);render(true);},"," ui(el){setPath(el.dataset.p,el.dataset.v);render(true);},\n restorearch(){if(READONLY||!S.arch)return;S.fc=S.arch.fc||{};S.dpin=S.arch.dpin||{};S.manual=S.arch.manual||{};S.fclog=S.arch.fclog||[];S.arch=null;save();toast('Earlier edits restored');render(true);},\n async chcopy(){const m=M(),C=changesCalc(),t=C.tot;const tx=['What changed (forecast version)',`Q4 boxes ${bx(t.ot)} → ${bx(t.nt)} (${pS(ypc(t.nt,t.ot))}), SAR ${Mn(t.ov)} → ${Mn(t.nv)}`,`Outlook ${p0(PREV.o)} → ${p0(m.o)} at ${S.set.real}% realization`,'By drug:'].concat(C.byProd.map(r=>`- ${r.k}: ${bx(r.ot)} → ${bx(r.nt)} (${r.d>0?'+':''}${bx(r.d)})`)).concat(['By account:']).concat(C.byAcc.slice(0,8).map(r=>`- ${accNameById(r.k)}: ${bx(r.ot)} → ${bx(r.nt)} (${r.d>0?'+':''}${bx(r.d)})`)).join('\\n');try{await navigator.clipboard.writeText(tx);toast('Copied ✓');}catch(e){prompt('Copy',tx);}},")

# 7 · forecast editor restore card
rep("<button class=\"btn\" data-go=\"assets\" data-do=\"packgo\">Manager pack</button></span>`);","<button class=\"btn\" data-go=\"assets\" data-do=\"packgo\">Manager pack</button></span>`);\n  if(S.arch&&Object.keys(S.arch.fc||{}).length)H+=`<div class=\"card flat\" style=\"border-color:var(--warn)\"><b>Your earlier edits were set aside</b> because a new forecast sheet was loaded (${Object.keys(S.arch.fc).length} edited rows). <button class=\"btn sec\" data-do=\"restorearch\">Restore them</button> <button class=\"btn sec\" data-go=\"changes\">What changed</button></div>`;")

# 8 · insights, hygiene, actions
rep("  return I;}\n// ---------- data hygiene","""  {const C=changesCalc(),t=C.tot;I.push({theme:'Forecast change',sev:t.nt<t.ot?'warn':'ok',head:`Q4 forecast ${t.nt<t.ot?'cut':'raised'} ${pS(ypc(t.nt,t.ot))} to ${bx(t.nt)} boxes in the latest sheet`,ev:`SAR ${Mn(t.ov)} → ${Mn(t.nv)}. Largest cuts: ${C.byProd.slice(0,3).map(r=>PN(r.k)+' '+r.d).join(' · ')}. Outlook ${p0(PREV.o)} → ${p0(m.o)}.`,so:'A lower forecast makes the remaining gap harder to close; the cuts are concentrated in a few accounts.',act:'Review the account-by-account changes and decide where to rebuild volume.',go:'changes',conf:'High'});}
  {const SC=stockCheck(),sh=SC.filter(x=>x.st==='short'||x.st==='nofile');if(sh.length)I.push({theme:'Supply',sev:'bad',head:`${sh.length} of your SKUs have under one month of warehouse stock against the Q4 forecast`,ev:sh.slice(0,4).map(x=>PN(x.name)+(x.cov!=null?' '+x.cov.toFixed(1)+' mo':' (not in file)')).join(' · '),so:'If this file shows the stock that serves your accounts, the forecast cannot ship without new supply; if not, the scope needs to be confirmed.',act:'Ask supply chain for the Q4 supply plan on these SKUs before the forecast call.',go:'stock',conf:'Medium'});}
  {const C=brCalc(m),b=C.A.slice().sort((x,y)=>y.y26-x.y26)[0];I.push({theme:'Habib branches',sev:'idle',head:`${b.n} is ${p0(b.y26/C.tot26)} of Habib sell-out units (${pS(b.yoy)} vs 2025)`,ev:C.A.map(a=>a.n+' '+fmt(a.y26)+' ('+pS(a.yoy)+')').join(' · '),so:'Branch mix tells you where Habib demand really is; Al Nakhil has doctors in the HQ tracker but no branch sales in the file.',act:'Align doctor visits to the branch that carries the volume; ask Habib for Al Nakhil sales.',go:'branches',conf:'Medium'});}
  return I;}
// ---------- data hygiene""")
rep("  const sc=H.reduce((s,h)=>s+(h.sev==='High'?3:h.sev==='Medium'?2:1)*Math.min(h.n,3),0);","""  {const SC=stockCheck(),sh=SC.filter(x=>x.st==='short'||x.st==='nofile');if(sh.length)H.push({id:'stk',sev:'Medium',t:'Warehouse stock below one month of the Q4 forecast (scope to confirm)',n:sh.length,det:sh.map(x=>PN(x.name)+(x.cov!=null?' ('+x.cov.toFixed(1)+' mo)':' (not in stock file)')).join(' · '),fix:'Confirm with supply chain what the 4 Oct stock file covers and the planned supply for Q4.'});}
  {const C=brCalc(m);if(C.recon.length)H.push({id:'brx',sev:'Low',t:'Branch file differs from the Habib dashboard by more than 5% for some drugs',n:C.recon.length,det:C.recon.slice(0,6).map(r=>PN(r.n)+' '+(r.d>0?'+':'')+fmt(r.d)).join(' · '),fix:'Ask Habib which file is final; the dashboard total is used for sell-out value.'});if(C.noBr.length)H.push({id:'nobr',sev:'Low',t:'Habib doctors with no branch sales data',n:C.noBr.length,det:'Al Nakhil: '+C.noBr.length+' doctors in the HQ tracker, branch sales file has no Al Nakhil',fix:'Request Al Nakhil sales-out from Habib.'});}
  const sc=H.reduce((s,h)=>s+(h.sev==='High'?3:h.sev==='Medium'?2:1)*Math.min(h.n,3),0);""")
rep("n:3,det:'Sales through Sep 2026 · Dallah stock 30 Sep · Habib sell-out through Aug · HQ tracker 4 Oct',fix:'Refresh Habib data for September to align the periods.'","n:1,det:'Sales through Sep 2026 (final) · Habib and branches through Sep · Jamjoom stock 4 Oct · Dallah stock 30 Sep · HQ tracker 4 Oct',fix:'All sources now cover September. Refresh Dallah stock when the October file arrives.'")
rep("  return A.sort((a,b)=>b.impact-a.impact);}","""  {const SC=stockCheck(),sh=SC.filter(x=>x.st==='short'||x.st==='nofile');if(sh.length)A.push({title:`Confirm Q4 supply for ${sh.length} SKUs with under one month of warehouse stock`,why:sh.slice(0,4).map(x=>PN(x.name)+' '+bx(x.q4)+' boxes forecast').join(' · ')+'. Stock file is dated 4 Oct; confirm scope and the planned supply.',impact:sum(sh.map(x=>x.q4*(PRICE_BY_PN[x.pn]||30))),effort:'S',owner:'Supply chain',type:'protect',go:'stock',due:'This week'});}
  return A.sort((a,b)=>b.impact-a.impact);}""")

# 9 · manager update: what changed
rep("  <h4>Risks</h4><ul>${risks.map","  <h4>What changed in this update</h4><ul>${(()=>{const C=changesCalc(),t=C.tot;return `<li>Q4 forecast ${bx(t.ot)} → ${bx(t.nt)} boxes (${pS(ypc(t.nt,t.ot))}); SAR ${Mn(t.ov)} → ${Mn(t.nv)}</li><li>Outlook ${p0(PREV.o)} → ${p0(m.o)} of annual target; YTD sales ${Mn(PREV.team.Saleh)} → ${Mn(T.ytd26)} after final September</li><li>Habib sell-out through September: ${fmt(m.hAll.u26)} units (${pS(m.hAll.yoy)} vs 2025), three branches analysed</li>`;})()}</ul>\n  <h4>Risks</h4><ul>${risks.map")

# 9b · Zahrat Al Rawdah 360 links
rep("""<div class="mt">YTD ${Mn(m.dal.y26)} (${pS(ypc(m.dal.y26,m.dal.y25))}) · Q4 forecast ${Mn(m.dal.fq4.hosp+m.dal.fq4.care)} · ${m.docs.filter(d=>d.o==='Dallah').length} doctors</div></div></div>`;""","""<div class="mt">YTD ${Mn(m.dal.y26)} (${pS(ypc(m.dal.y26,m.dal.y25))}) · Q4 forecast ${Mn(m.dal.fq4.hosp+m.dal.fq4.care)} · ${m.docs.filter(d=>d.o==='Dallah').length} doctors</div></div><div class="card" data-go="zahrat" style="cursor:pointer;border-color:var(--brand2)"><b>💊 Zahrat Al Rawdah 360</b><div class="mt">Pharmacy chain · your line YTD ${Mn((m.acc.find(x=>x.id==='105301120018')||{y26:0}).y26)} · products, lines, supply</div></div></div>`;""")
rep("""links.push('<button class="btn" data-go="dallah">Open Dallah 360</button>');""","""links.push('<button class="btn" data-go="dallah">Open Dallah 360</button>');if(c.id==='105301120018')links.push('<button class="btn" data-go="zahrat">Open Zahrat Al Rawdah 360</button>');""")

# 9c · Dallah stock (3 consumption reports)
rep("""<h3>Stock cover by item (30 Sep)</h3><table class="t"><tr><th>Place</th><th>Item</th><th>Aug</th><th>Sep</th><th>Stock</th><th>Cover (months)</th><th>Oct target</th><th>Status</th></tr>`""","""<h3>Stock cover by item (14 Oct)</h3><table class="t"><tr><th>Place</th><th>Item</th><th>Aug</th><th>Sep</th><th>Stock 30 Sep</th><th>Stock 14 Oct</th><th>Cover (months)</th><th>Oct target</th><th>Status</th></tr>`""")
rep("<td>${fmt(x.stock)}</td><td class=\"${x.cover!=null&&x.cover<1?'dn':''}\">${x.cover??'—'}</td>","<td>${fmt(x.prev)}</td><td><b>${fmt(x.stock)}</b></td><td class=\"${x.cover!=null&&x.cover<1?'dn':''}\">${x.cover??'—'}</td>")
rep("""pill('OK','ok')}</td></tr>`).join('')+'</table></div>';
  const dd=m.docs""","""pill('OK','ok')}</td></tr>`).join('')+'</table><button class="btn sec block" data-go="dstock">Open Dallah stock · full comparison</button></div>';
  const dd=m.docs""")
rep("'Items under 1 month stock',m.day.items.filter(x=>x.st==='low').length?'bad':'ok','as of 30 Sep')","'Items under 1 month stock',m.day.items.filter(x=>x.st==='low').length?'bad':'ok','as of 14 Oct')")

# 9d · alerts + monthly follow-up
rep("lev:{},month:null},fc:{},","lev:{},month:null},al:{},mo:{},fc:{},")
rep("S.manual=s.manual||{};S.dv=s.dv;","S.manual=s.manual||{};S.al=s.al||{};S.mo=s.mo||{};S.dv=s.dv;")
rep("manual:r.manual||{}};render(true);","manual:r.manual||{},al:r.al||{},mo:r.mo||{}};render(true);")
rep("['dstock','Dallah stock','🧪','Dallah consumption and stock, 14 Oct']","['dstock','Dallah stock','🧪','Dallah consumption and stock, 14 Oct'],['alerts','Alerts','🔔','Rules, status, next steps'],['monthly','Monthly follow-up','🗓️','Changes, files due, checklist']")
rep("'daily','branches','changes','zahrat','dstock'].includes(r.id)","'daily','branches','changes','zahrat','dstock','alerts','monthly'].includes(r.id)")
rep(" ui(el){setPath(el.dataset.p,el.dataset.v);render(true);},"," ui(el){setPath(el.dataset.p,el.dataset.v);render(true);},\n alset(el){if(READONLY)return;const k=el.dataset.k,st=el.dataset.s;S.al=S.al||{};if(st==='open')delete S.al[k];else S.al[k]={st,ts:Date.now(),until:st==='snooze'?Date.now()+7*864e5:0};save();render(true);},\n thadj(el){if(READONLY)return;const k=el.dataset.k;S.set.th=S.set.th||{};if(k==='reset'){S.set.th={};}else{const t=alTh(),v=Math.round((t[k]+Number(el.dataset.d))*100)/100;S.set.th[k]=Math.min(Number(el.dataset.max),Math.max(Number(el.dataset.min),v));}_alc=null;save();render(true);},\n mochk(el){if(READONLY)return;const ck=new Date().toISOString().slice(0,7);S.mo=S.mo||{};S.mo[ck]=S.mo[ck]||{};S.mo[ck][el.dataset.k]=!S.mo[ck][el.dataset.k];save();render(true);},\n async mocopy(){try{await navigator.clipboard.writeText(moText(M()));toast('Copied ✓');}catch(e){prompt('Copy',moText(M()));}},\n async alcopy(){const m=M(),L=['Alerts digest · '+DATAVER,''].concat(alOpen(m).map(a=>`[${SEVX[a.sev][0]}] ${a.title} — ${a.act}`));const tx=L.join('\\n');try{await navigator.clipboard.writeText(tx);toast('Copied ✓');}catch(e){prompt('Copy',tx);}},")
rep("branches:`${BR.branches.length} branches`,","branches:`${BR.branches.length} branches`,alerts:`${alCount(m).n} open`,monthly:`data ${DATAVER}`,")
rep("""<button class="hs" data-go="home" title="Position health">""","""<button class="hs" data-go="alerts" title="Open alerts" style="margin-right:6px"><i class="g-${alCount(m).c?'bad':alCount(m).h?'warn':'ok'}">${alCount(m).c+alCount(m).h}</i>Alerts</button><button class="hs" data-go="home" title="Position health">""")
rep("  H+=changesCard(m);","  H+=changesCard(m);H+=alertsCard(m);")

# 10 · new modules before boot
rep("// ---------- boot",open('/home/claude/w/mod_new.js').read()+"\n// ---------- boot")

rep("  return I;}\n// ---------- data hygiene","""  {const C=dnCalc(),w=C.sku.filter(x=>x.q4cov!=null&&x.q4cov<.5&&x.cover!=null&&x.cover<2);if(w.length)I.push({theme:'Dallah supply',sev:'bad',head:`Dallah holds under half of the Q4 forecast for ${w.length} of your SKUs`,ev:w.map(x=>x.k+' stock '+bx(x.stock)+' vs Q4 '+bx(x.q4)+' ('+p0(x.q4cov)+')').join(' · ')+'. Stock as of 14 Oct.',so:'At the current pace these items run out inside Q4 unless Dallah re-orders, and the forecast boxes will not ship.',act:'Ask Dallah purchasing to place orders now and agree the delivery calendar by month.',go:'dstock',conf:'High'});}
  return I;}\n// ---------- data hygiene""")
rep("  return A.sort((a,b)=>b.impact-a.impact);}","""  {const C=dnCalc(),w=C.sku.filter(x=>x.q4cov!=null&&x.q4cov<.5&&x.cover!=null&&x.cover<2);if(w.length)A.push({title:`Get Dallah to re-order ${w.map(x=>x.k).join(', ')}`,why:'Stock on 14 Oct covers '+w.map(x=>x.k+' '+p0(x.q4cov)).join(' · ')+' of the Q4 forecast, and under 2 months at current pace.',impact:sum(w.map(x=>Math.max(x.q4-x.stock,0)*(PRICE_BY_PN[x.k]||30))),effort:'S',owner:'You + Dallah purchasing',type:'protect',go:'dstock',due:'This week'});}
  return A.sort((a,b)=>b.impact-a.impact);}""")

# 11b · headline = actual achievement (closed vs YTD target), outlook kept as secondary
rep("""${ragWord[h.st]} · ${p0(m.o)}</button>""","""${ragWord[h.st]} · ${p0(m.T.ach)} achieved</button>""")
rep("""${kpi(p0(m.o),'Outlook vs target',m.o>=.95?'ok':m.o>=.85?'warn':'bad',`Risk-weighted: ${p0(m.wo)}`)}</div>`;
  H+=scenarioBar();
  H+=changesCard(m);""","""${kpi(p0(T.ach),'Achieved · closed vs YTD target',T.ach>=.8?'ok':T.ach>=.6?'warn':'bad',`${p0(T.ytd26/T.bgFY)} of annual target · outlook ${p0(m.o)}`)}</div>`;
  H+=scenarioBar();
  H+=changesCard(m);""")

# 11 · final text updates
s=s.replace("Dallah stock 30 Sep","Dallah stock 14 Oct").replace("stock date is 30 Sep","stock date is 14 Oct").replace("Refresh Dallah stock when the October file arrives.","Refresh Dallah stock with the next consumption reports.")
rep("['Dashboard YTD JULY / SEP (Dallah)','Monthly units (Dallah) 2026 vs 2025','Jan–Sep 2026','Dallah 360']]","['Dashboard YTD JULY / SEP (Dallah)','Monthly units (Dallah) 2026 vs 2025','Jan–Sep 2026','Dallah 360'],['Dallah Drug Consumption reports (Nakheel, Namar, Pharmacies)','Stock, consumed, received and outstanding per Jamjoom item, 3 places','1 Jul – 14 Oct 2026','Dallah stock, Dallah 360, Data Health']]")

open('/home/claude/w/code.js','w').write(s)
print('patched',len(s))
