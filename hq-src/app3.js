/* ===== Sales HQ · app part 3: Stock (rebuilt), Update center, Ideas, router ===== */
const CFG = { crit: 30, low: 60, over: 180 };
const MYDRUGS = { 'Zoron 4 Tab': /ZORON 4Mg Tablet/i, 'Zoron 4 Inj': /ZORON Injection 4Mg/i, 'Zoron 8 Tab': /ZORON 8Mg Tablet/i, 'Zoron 8 Inj': /ZORON Injection 8Mg/i, 'Meva SR 200': /MEVA 200/i, 'Meva 135': /MEVA 135/i, 'Maxim 5s': /MAXIM.*1X5/i, 'Maxim 7s': /MAXIM.*1x7/i };
const DALLAH_IDS = ['105301310003', '435040'];

/* ---------- stock calculations ---------- */
function myPids() { const s = new Set(); BUD.filter(b => b.r === repIx[ME.rep]).forEach(b => s.add(DIM.prods[b.p].id)); F.filter(x => x.r === repIx[ME.rep]).forEach(x => s.add(DIM.prods[x.p].id)); FC.filter(x => x.rep === ME.rep).forEach(x => s.add(x.pid)); return s; }
function fcByPid() { const o = {}; FC.forEach(x => { const e = o[x.pid] = o[x.pid] || { u: [0, 0, 0], v: 0, dal: 0 }; x.u.forEach((u, i) => e.u[i] += u); e.v += x.vT; if (DALLAH_IDS.indexOf(x.cid) >= 0) e.dal += x.uT; }); return o; }
function jjStat(it) {
  const d = it.s30 / 30; const cov = d > 0 ? it.tot / d : null;
  let st = 'ok', lab = 'OK';
  if (it.tot <= 0) { st = 'bad'; lab = 'Empty'; } else if (cov == null) { st = 'mut'; lab = 'No sales'; } else if (cov < CFG.crit) { st = 'bad'; lab = 'Critical'; } else if (cov < CFG.low) { st = 'warn'; lab = 'Low'; } else if (cov > CFG.over) { st = 'warn'; lab = 'Over'; }
  const prev = it.s60 - it.s30; const trend = prev > 0 ? it.s30 / prev - 1 : null;
  return { d, cov, st, lab, trend };
}
function jjRows() {
  const jj = DB.jj || [], fc = fcByPid(), mine = myPids(), byCode = {};
  Object.keys(JJM).forEach(pid => { const c = JJM[pid].it.c; (byCode[c] = byCode[c] || []).push(pid); });
  return jj.map(it => {
    const s = jjStat(it), pids = byCode[it.c] || [], f = pids.reduce((a, p) => { const e = fc[p]; if (e) { a.u += sum(e.u); a.v += e.v; } return a; }, { u: 0, v: 0 });
    const isMine = pids.some(p => mine.has(p)) || /^(ZORON|MEVA|MAXIM)/i.test(it.d);
    const owners = [...new Set(pids.flatMap(p => BUD.filter(b => DIM.prods[b.p].id === p).map(b => repName(b.r))))];
    return Object.assign({ _k: it.c, mine: isMine, name: it.d, owners: owners.join(', '), pids, exact: pids.every(p => JJM[p].exact), fu: f.u, fv: f.v, short: f.u > 0 ? it.wh - f.u : null, mcov: f.u > 0 ? it.wh / (f.u / 3) : null, plan: it.s30 > 0 && f.u > 0 ? (f.u / 3) / it.s30 : null, s }, it);
  });
}
function stockFlags() {
  const out = [], fc = fcByPid();
  const rows = jjRows().filter(r => r.mine && r.pids.length);
  rows.forEach(r => { if (r.s.st === 'bad' && r.tot > 0) out.push({ n: r.name, msg: `${Math.round(r.s.cov)} days of cover at Jamjoom` }); if (r.fu > 0 && r.wh < r.fu) out.push({ n: r.name, msg: `warehouse ${fmt(r.wh)} < Q4 forecast ${fmt(r.fu)}` }); });
  dalRows().filter(r => r.mine && r.cover != null && r.cover < 1).forEach(r => out.push({ n: r.name + ' @Dallah', msg: `${r.cover.toFixed(1)} months of cover` }));
  return out;
}
function dalMonths() { const d = DB.dal; if (!d) return 3; return Math.max(.5, (new Date(d.date) - new Date(d.from)) / 864e5 / 30.4); }
function dalRows() {
  const d = DB.dal; if (!d || !d.rows) return []; const fc = fcByPid(), months = dalMonths();
  const brands = new Set((DB.jj || []).map(i => sigBrand(i.d))); const inv = {}; Object.keys(d.map || {}).forEach(n => inv[d.map[n]] = n);
  const pidOf = {}; Object.keys(MYDRUGS).forEach(n => { const p = Object.keys(fc).find(k => MYDRUGS[n].test(prodName(k))); if (p) pidOf[n] = p; });
  const g = {};
  Object.keys(d.rows).forEach(loc => d.rows[loc].forEach(r => {
    const code = r[0], desc = r[1], mn = inv[code]; if (!mn && !brands.has(sigBrand(desc))) return;
    const f = mn && d.fac && d.fac[mn] ? d.fac[mn] : 1;
    const o = g[code] = g[code] || { _k: code, code, name: mn || desc.split(',')[0].slice(0, 60), item: mn || '', stock: { Nakheel: 0, Namar: 0, Pharmacies: 0 }, cons: 0, recv: 0, outst: 0, ordq: 0, mine: !!mn };
    o.stock[loc] += (r[3] || 0) / f; o.cons += (r[7] || 0) / f; o.recv += (r[8] || 0) / f; o.outst += (r[9] || 0) / f; o.ordq += (r[11] || 0) / f;
  }));
  const prev = {}; (DB.dalM || []).forEach(x => { const e = prev[x.item] = prev[x.item] || { stock: 0, target: 0 }; e.stock += x.prev || 0; e.target += x.target || 0; });
  return Object.values(g).map(o => { const tot = sum(Object.values(o.stock)), pm = o.cons / months, cov = pm > 0 ? tot / pm : null, fq = o.item && pidOf[o.item] ? fc[pidOf[o.item]].dal : null, pv = o.item ? prev[o.item] : null;
    return Object.assign(o, { tot, pm, cover: cov, fq, pv: pv ? pv.stock : null, target: pv ? pv.target : null, qcov: fq > 0 ? tot / fq : null, gap: fq != null ? tot - fq : null }); }).filter(o => o.tot || o.cons || o.recv);
}
function sigBrand(n) { return C.matchJJ ? (String(n).toUpperCase().replace(/^W-|^JP /, '').match(/[A-Z]+(?:\s?-\s?[A-Z]+)?/) || [''])[0].replace(/[\s-]/g, '') : ''; }
function habRows() {
  const H = DB.habib; if (!H) return []; const mine = myPids();
  return H.prods.map(p => { const u = p.um26 || [], l3 = sum(u, 6, 9), p3 = sum(u, 3, 6), avg = sum(u) / Math.max(1, u.filter(x => x != null).length), build = (p.si || 0) - (p.so || 0), bu = p.price > 0 ? build / p.price : null, mc = avg > 0 && bu != null ? bu / avg : null;
    return { _k: p.code, code: p.code, name: p.name, line: p.line, rep: (p.reps || []).join(', '), si: p.si, so: p.so, build, bu, avg, l3, p3, tr: p3 > 0 ? l3 / p3 - 1 : null, mc, mine: mine.has(p.code) || (p.reps || []).indexOf(ME.rep) >= 0 }; }).filter(r => r.si || r.so || r.avg);
}
function stockMineTable() {
  const dr = dalRows().filter(r => r.mine), hr = habRows().filter(r => r.mine), fc = fcByPid(), jr = jjRows(); const rows = [];
  [...myPids()].forEach(pid => {
    const u = fc[pid] ? sum(fc[pid].u) : 0; const sales = F.some(x => DIM.prods[x.p].id === pid && x.r === repIx[ME.rep] && x.y26 > 0); if (!u && !sales) return;
    const nm = prodName(pid), m = JJM[pid], it = m && jr.find(x => x.c === m.it.c), dn = Object.keys(MYDRUGS).find(n => MYDRUGS[n].test(nm)), d = dn && dr.find(x => x.item === dn), h = hr.find(x => x.code === pid);
    rows.push({ _k: pid, name: nm, mine: true, has: !!it, wh: it ? it.wh : null, tot: it ? it.tot : null, cov: it ? it.s.cov : null, st: it ? it.s : { st: '' }, fu: u, dal: d ? d.tot : null, dcov: d ? d.cover : null, hb: h ? h.mc : null });
  });
  return table('t_stock_mine', [{ k: 'name', l: 'Drug', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 }, { k: 'wh', l: 'Jamjoom warehouse', h: r => r.has ? fmt(r.wh) : '<span class="mut">no stock item</span>', v: r => r.wh }, { k: 'tot', l: 'Jamjoom total', h: r => r.has ? fmt(r.tot) : '—', v: r => r.tot }, { k: 'cov', l: 'Cover (days)', h: r => r.cov == null ? '—' : `<b class="${r.st.st === 'bad' ? 'dn' : r.st.st === 'warn' ? 'warn' : ''}">${Math.round(r.cov)}</b>`, v: r => r.cov }, { k: 'fu', l: 'Q4 forecast (all reps)', h: r => fmt(r.fu), v: r => r.fu }, { k: 'sh', l: 'Warehouse vs forecast', h: r => r.fu && r.has ? `<span class="${r.wh - r.fu >= 0 ? 'up' : 'dn'}">${sgn(r.wh - r.fu)}</span>` : '—', v: r => r.fu && r.has ? r.wh - r.fu : null }, { k: 'dal', l: 'Dallah stock', h: r => r.dal == null ? '—' : fmt(r.dal), v: r => r.dal }, { k: 'dcov', l: 'Dallah cover (months)', h: r => r.dcov == null ? '—' : `<b class="${r.dcov < 1 ? 'dn' : ''}">${r.dcov.toFixed(1)}</b>`, v: r => r.dcov }, { k: 'hb', l: 'Habib channel build (months)', h: r => r.hb == null ? '—' : r.hb.toFixed(1), v: r => r.hb }], rows, { sort: 'cov', dir: 1, noMine: 1, title: 'My stock' }) + `<div class="note">Warehouse = Jamjoom warehouse; total includes pharmacies and transit. Cover = total stock ÷ last-30-day sales per day. Dallah in boxes (injections ÷ 5). Habib build = sell-in minus sell-out expressed in months of sell-out.</div>`;
}

/* ---------- STOCK page ---------- */
PAGES.stock = function () {
  const U = UI.stock; const upd = (DB.meta.src || {});
  let H = pageHead('Stock & supply', 'Jamjoom warehouse, Dallah and Al Habib stock against sales pace and the Q4 forecast. Refresh it by dropping the Jamjoom stock file in Update.', mineTog());
  H += `<div class="chips noprint">${[['over', 'Overview'], ['jj', 'Jamjoom'], ['sup', 'Supply vs forecast'], ['dal', 'Dallah'], ['hab', 'Al Habib']].map(t => `<button class="chip ${U.tab === t[0] ? 'on' : ''}" data-do="set" data-p="stock.tab" data-v="${t[0]}">${t[1]}</button>`).join('')}<span class="badge">Jamjoom file: ${esc((upd.jjstock || {}).label || 'embedded')}</span> <span class="badge">Dallah to ${esc((DB.dal || {}).date || '—')}</span></div>`;
  const jr = jjRows();
  if (U.tab === 'over') {
    const m = jr.filter(r => r.mine && r.pids.length), f = stockFlags();
    H += `<div class="grid g5" style="margin-bottom:12px">${kpi(jr.length, 'Jamjoom items')}${kpi(jr.filter(r => r.s.st === 'bad' && r.tot > 0).length, 'Critical (<' + CFG.crit + ' days)', 'all items', jr.some(r => r.s.st === 'bad') ? 'mine' : '')}${kpi(m.filter(r => r.s.st === 'bad').length, 'Critical · my drugs', '', m.some(r => r.s.st === 'bad') ? 'mine' : '')}${kpi(jr.filter(r => r.fu > 0 && r.wh < r.fu).length, 'Warehouse < Q4 forecast', 'all lines')}${kpi(f.length, 'Alerts on my drugs')}</div>`;
    H += `<div class="card mine"><h2>⭐ My drugs — stock position</h2>${stockMineTable()}</div>`;
    if (f.length) H += `<div class="card"><h2>Watchlist</h2>${f.map(x => `<div class="hl bad"><b>${esc(x.n)}</b> — ${esc(x.msg)}</div>`).join('')}</div>`;
    const t = jr.filter(r => r.fu > 0 && r.wh < r.fu).sort((a, b) => a.short - b.short).slice(0, 12);
    H += `<div class="card"><h2>Biggest supply gaps vs Q4 forecast (all lines)</h2>${t.length ? table('t_gap', [{ k: 'name', l: 'Item', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 }, { k: 'owners', l: 'Rep', tl: 1, h: r => esc(r.owners), v: r => r.owners }, { k: 'wh', l: 'Warehouse', h: r => fmt(r.wh), v: r => r.wh }, { k: 'fu', l: 'Q4 forecast', h: r => fmt(r.fu), v: r => r.fu }, { k: 'short', l: 'Short by', h: r => `<b class="dn">${fmt(-r.short)}</b>`, v: r => r.short }], t, { sort: 'short', dir: 1, noMine: 1, title: 'Supply gaps' }) : '<div class="empty">No gaps</div>'}</div>`;
  } else if (U.tab === 'jj') {
    const q = (U.q || '').toLowerCase(); let rows = jr.filter(r => (!U.mine || r.mine) && (U.st === 'all' || r.s.lab === U.st) && (!q || r.name.toLowerCase().includes(q)));
    H += `<div class="chips"><button class="chip ${U.mine ? 'on mine' : ''}" data-do="set" data-p="stock.mine" data-v="${U.mine ? '' : '1'}">⭐ Only my drugs</button>${['all', 'Critical', 'Low', 'OK', 'Over', 'Empty'].map(s => `<button class="chip ${U.st === s ? 'on' : ''}" data-do="set" data-p="stock.st" data-v="${s}">${s === 'all' ? 'All status' : s}</button>`).join('')}${search('stock.q', 'Search item')}</div>`;
    H += `<div class="card">${table('t_jj', [{ k: 'name', l: 'Item', tl: 1, h: r => `<b>${esc(r.name)}</b>${r.pids.length && !r.exact ? ' <span class="mut" title="approximate match">≈</span>' : ''}`, v: r => r.name, w: 1 }, { k: 'owners', l: 'Rep', tl: 1, h: r => esc(r.owners) || '<span class="mut">—</span>', v: r => r.owners }, { k: 'wh', l: 'Warehouse', h: r => fmt(r.wh), v: r => r.wh }, { k: 'ph', l: 'Pharmacies', h: r => fmt(r.ph), v: r => r.ph }, { k: 'tr', l: 'Transit', h: r => fmt(r.tr), v: r => r.tr }, { k: 'tot', l: 'Total', h: r => `<b>${fmt(r.tot)}</b>`, v: r => r.tot }, { k: 's30', l: 'Sold 30 d', h: r => fmt(r.s30), v: r => r.s30 }, { k: 'tn', l: 'vs previous 30 d', h: r => yoyCell(r.s.trend), v: r => r.s.trend }, { k: 'd', l: 'Per day', h: r => r.s.d.toFixed(1), v: r => r.s.d }, { k: 'cov', l: 'Cover (days)', h: r => r.s.cov == null ? '—' : `<b>${Math.round(r.s.cov)}</b>`, v: r => r.s.cov }, { k: 'st', l: 'Status', h: r => pill(r.s.lab, r.s.st), v: r => r.s.cov }, { k: 'fu', l: 'Q4 forecast', h: r => r.fu ? fmt(r.fu) : '—', v: r => r.fu }, { k: 'sh', l: 'Warehouse vs forecast', h: r => r.short == null ? '—' : `<span class="${r.short >= 0 ? 'up' : 'dn'}">${sgn(r.short)}</span>`, v: r => r.short }], rows, { sort: 'cov', dir: 1, title: 'Jamjoom stock', limit: 250 })}<div class="note">Cover = total stock ÷ (last 30 days sales ÷ 30). Critical under ${CFG.crit} days, Low under ${CFG.low}, Over above ${CFG.over} (change in Update → Settings). ≈ means the stock item was matched to the product by name and the pack may differ.</div></div>`;
  } else if (U.tab === 'sup') {
    const q = (U.q || '').toLowerCase(); const rows = jr.filter(r => r.fu > 0 && (!U.mine || r.mine) && (!q || r.name.toLowerCase().includes(q)));
    H += `<div class="chips"><button class="chip ${U.mine ? 'on mine' : ''}" data-do="set" data-p="stock.mine" data-v="${U.mine ? '' : '1'}">⭐ Only my drugs</button>${search('stock.q', 'Search item')}</div>`;
    H += `<div class="card"><h2>Can we ship the Q4 forecast?</h2>${table('t_sup', [{ k: 'name', l: 'Item', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 }, { k: 'owners', l: 'Rep', tl: 1, h: r => esc(r.owners), v: r => r.owners }, { k: 'fu', l: 'Q4 forecast', h: r => fmt(r.fu), v: r => r.fu }, { k: 'pm', l: 'Forecast a month', h: r => fmt(r.fu / 3), v: r => r.fu }, { k: 's30', l: 'Sold last 30 d', h: r => fmt(r.s30), v: r => r.s30 }, { k: 'plan', l: 'Forecast pace vs sales pace', h: r => r.plan == null ? '—' : `<span class="${r.plan > 2 ? 'dn' : r.plan > 1.3 ? 'warn' : ''}">${r.plan.toFixed(1)}×</span>`, v: r => r.plan }, { k: 'wh', l: 'Warehouse', h: r => fmt(r.wh), v: r => r.wh }, { k: 'tot', l: 'Total stock', h: r => fmt(r.tot), v: r => r.tot }, { k: 'sh', l: 'Warehouse vs forecast', h: r => `<span class="${r.short >= 0 ? 'up' : 'dn'}">${sgn(r.short)}</span>`, v: r => r.short }, { k: 'mc', l: 'Forecast months covered', h: r => r.mcov.toFixed(1), v: r => r.mcov }, { k: 'x', l: 'Verdict', h: r => r.short < 0 ? pill('Short', 'bad') : r.wh < r.fu * 1.5 ? pill('Tight', 'warn') : pill('OK', 'ok'), v: r => r.short }], rows, { sort: 'sh', dir: 1, title: 'Supply vs forecast' })}<div class="note">Forecast pace vs sales pace compares the monthly forecast with the last 30 days of Jamjoom sales: a high number means the plan asks for far more than the market has been taking. Warehouse vs forecast = Jamjoom warehouse stock minus the full Q4 forecast (all reps); production or imports in the pipeline are not in the file.</div></div>`;
  } else if (U.tab === 'dal') {
    const rows = dalRows().filter(r => !U.mine || r.mine); const mo = dalMonths();
    H += `<div class="chips"><button class="chip ${U.mine ? 'on mine' : ''}" data-do="set" data-p="stock.mine" data-v="${U.mine ? '' : '1'}">⭐ Only my drugs</button><span class="badge">${esc((DB.dal || {}).from)} → ${esc((DB.dal || {}).date)} (${mo.toFixed(1)} months)</span></div>`;
    H += `<div class="card">${rows.length ? table('t_dal', [{ k: 'name', l: 'Item', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 }, { k: 'nk', l: 'Nakheel', h: r => fmt(r.stock.Nakheel), v: r => r.stock.Nakheel }, { k: 'nm', l: 'Namar', h: r => fmt(r.stock.Namar), v: r => r.stock.Namar }, { k: 'ph', l: 'Pharmacies', h: r => fmt(r.stock.Pharmacies), v: r => r.stock.Pharmacies }, { k: 'tot', l: 'Stock now', h: r => `<b>${fmt(r.tot)}</b>`, v: r => r.tot }, { k: 'pv', l: 'Stock 30 Sep', h: r => r.pv == null ? '—' : fmt(r.pv), v: r => r.pv }, { k: 'cons', l: 'Consumed', h: r => fmt(r.cons), v: r => r.cons }, { k: 'pm', l: 'Per month', h: r => fmt(r.pm), v: r => r.pm }, { k: 'cover', l: 'Cover (months)', h: r => r.cover == null ? '—' : `<b class="${r.cover < 1 ? 'dn' : ''}">${r.cover.toFixed(1)}</b>`, v: r => r.cover }, { k: 'recv', l: 'Received', h: r => fmt(r.recv), v: r => r.recv }, { k: 'outst', l: 'Open order', h: r => r.outst ? fmt(r.outst) : '—', v: r => r.outst }, { k: 'fq', l: 'Q4 forecast', h: r => r.fq == null ? '—' : fmt(r.fq), v: r => r.fq }, { k: 'gap', l: 'Stock vs forecast', h: r => r.gap == null ? '—' : `<span class="${r.gap >= 0 ? 'up' : 'dn'}">${sgn(r.gap)}</span>`, v: r => r.gap }], rows, { sort: 'cover', dir: 1, title: 'Dallah stock' }) : '<div class="empty">No Dallah data</div>'}<div class="note">From the three Dallah consumption reports (Nakheel, Namar, Pharmacies). Injections are counted in ampoules by Dallah and shown here in boxes of 5. Dallah PDF reports are loaded through Claude: send them and the data is refreshed here.</div></div>`;
  } else {
    const rows = habRows().filter(r => !U.mine || r.mine);
    H += `<div class="chips"><button class="chip ${U.mine ? 'on mine' : ''}" data-do="set" data-p="stock.mine" data-v="${U.mine ? '' : '1'}">⭐ Only my drugs</button></div>`;
    H += `<div class="card">${table('t_hab', [{ k: 'name', l: 'Drug', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 }, { k: 'rep', l: 'Rep', tl: 1, h: r => esc(r.rep), v: r => r.rep }, { k: 'si', l: 'Sell-in (SAR)', h: r => fmt(r.si), v: r => r.si }, { k: 'so', l: 'Sell-out (SAR)', h: r => fmt(r.so), v: r => r.so }, { k: 'build', l: 'Stock built at Habib (SAR)', h: r => `<span class="${r.build > 0 ? 'warn' : 'up'}">${sgn(r.build)}</span>`, v: r => r.build }, { k: 'bu', l: 'Built (units)', h: r => r.bu == null ? '—' : fmt(r.bu), v: r => r.bu }, { k: 'avg', l: 'Sell-out a month', h: r => fmt(r.avg), v: r => r.avg }, { k: 'tr', l: 'Last 3 vs before', h: r => yoyCell(r.tr), v: r => r.tr }, { k: 'mc', l: 'Months of stock built', h: r => r.mc == null ? '—' : `<b class="${r.mc > 3 ? 'warn' : ''}">${r.mc.toFixed(1)}</b>`, v: r => r.mc }], rows, { sort: 'build', title: 'Habib stock' })}<div class="note">Al Habib stock is estimated: what Jamjoom sold in (sell-in) minus what the pharmacies sold out, from the Habib sell-in and sell-out files. A positive build means stock is accumulating at Habib. Habib files are loaded through Claude.</div></div>`;
  }
  return H;
};

/* ---------- UPDATE CENTER ---------- */
const KIND_LABEL = { sales: 'Sales (YTD by account / drug / rep)', targets: 'Targets per account', forecast: 'Q4 forecast per item', tracker: 'HQ tracker (doctors)', jjstock: 'Jamjoom stock', fstatus: 'Forecast status table' };
async function handleFiles(files) {
  UI.upd.found = UI.upd.found.filter(x => x.keep); const notes = [];
  for (const f of files) {
    const name = f.name;
    if (/\.pdf$/i.test(name) || /Dallah.*(Consumption|Dashboard)|PR-REP|Habib|Branches/i.test(name)) { notes.push(`${name}: Dallah and Habib files are processed by Claude (they use a different layout). Send them in the chat and the data is refreshed for you.`); continue; }
    if (/\.json$/i.test(name)) { try { const j = JSON.parse(await f.text()); if (j && j.sales && j.meta) { UI.upd.found.push({ kind: 'dbjson', file: name, summary: `Complete data file · built ${new Date(j.meta.updated).toLocaleString()}`, apply: () => { DB = j; } }); } else notes.push(`${name}: not a Sales HQ data file.`); } catch (e) { notes.push(`${name}: cannot read.`); } continue; }
    try {
      const buf = await f.arrayBuffer(); const wb = XLSX.read(buf, { type: 'array', cellDates: true }); const det = C.detect(XLSX, wb);
      if (!det.length) { notes.push(`${name}: no known sheet found (sales, targets, forecast, HQ tracker, Jamjoom stock).`); continue; }
      const salesD = det.find(d => d.kind === 'sales'), tgtD = det.find(d => d.kind === 'targets');
      det.forEach(d => {
        if (d.kind === 'targetMonth') return; if (d.kind === 'targets' && salesD) return;
        const rows = C.table(XLSX, wb, d);
        if (d.kind === 'sales') {
          const t = tgtD ? C.table(XLSX, wb, tgtD) : []; const S = C.buildSales(rows, t); const old = totalsOf(DB.sales); const nu = totalsOf(S);
          UI.upd.found.push({ kind: 'sales', file: name, summary: `${rows.length.toLocaleString()} sales rows · ${t.length.toLocaleString()} target rows · months to ${MN[S.ytd - 1] || '—'} · region sales ${fmt(nu.y)} (was ${fmt(old.y)}) · my rep ${fmt(nu.me)} (was ${fmt(old.me)})${tgtD ? '' : ' · no targets sheet in this file: account targets will be empty'}`, apply: () => { DB.sales = S; setSrc('sales', name, `to ${MN[S.ytd - 1]}`); } });
        } else if (d.kind === 'forecast') {
          const fcn = C.buildForecast(rows); const nu = sum(fcn.f.map(r => r[4].reduce((a, b) => a + b, 0)));
          UI.upd.found.push({ kind: 'forecast', file: name, summary: `${fcn.f.length.toLocaleString()} forecast lines · Q4 value ${fmt(nu)} (was ${fmt(sum(FC.map(x => x.vT)))})`, apply: () => { const keep = DB.fc && DB.fc.status; DB.fc = fcn; setSrc('forecast', name, 'Q4'); } });
        } else if (d.kind === 'tracker') {
          const docs = C.buildTracker(rows); UI.upd.found.push({ kind: 'tracker', file: name, summary: `${docs.length} doctors · visits ${sum(docs.map(x => x.a))} of goal ${sum(docs.map(x => x.g))} (was ${sum((DB.docs || []).map(x => x.a))} of ${sum((DB.docs || []).map(x => x.g))})`, apply: () => { DB.docs = docs; setSrc('tracker', name, ''); } });
        } else if (d.kind === 'jjstock') {
          const jj = C.buildJJ(rows); UI.upd.found.push({ kind: 'jjstock', file: name, summary: `${jj.length} items · total stock ${fmt(sum(jj.map(x => x.tot)))} (was ${fmt(sum((DB.jj || []).map(x => x.tot)))})`, apply: () => { DB.jj = jj; const m = name.match(/(\d{1,2}[-_.]\d{1,2}[-_.]\d{4})/); setSrc('jjstock', name, m ? m[1] : ''); } });
        }
      });
      // forecast status pivot (Sheet1 with STATUS column)
      const st = detectStatus(wb); if (st && st.length) UI.upd.found.push({ kind: 'fstatus', file: name, summary: `${st.length} account statuses (OK / NO / payment issue)`, apply: () => { DB.fstat = st; setSrc('fstatus', name, ''); } });
    } catch (e) { notes.push(`${name}: could not be read (${e.message}).`); }
  }
  UI.upd.notes = notes; render();
}
function totalsOf(S) { let y = 0, me = 0; const mi = S.dims.reps.findIndex(r => r.n === ME.rep); S.f.forEach(r => { const v = sum(r[4], 0, S.ytd || 9); y += v; if (r[2] === mi) me += v; }); return { y, me }; }
function detectStatus(wb) {
  const out = []; wb.SheetNames.forEach(n => { const g = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: null, blankrows: false }); const hi = g.findIndex(r => r && r.map(x => String(x || '').toUpperCase()).indexOf('STATUS') >= 0 && r.map(x => String(x || '')).indexOf('Row Labels') >= 0); if (hi < 0) return;
    const cn = {}; Object.keys((DB.fc && DB.fc.cn) || {}).forEach(k => cn[DB.fc.cn[k]] = k); DIM.custs.forEach(c => cn[c.n] = c.id);
    const hdr = g[hi].map(x => String(x || '').toUpperCase()); const si = hdr.indexOf('STATUS');
    for (let i = hi + 1; i < g.length; i++) { const r = g[i]; const id = cn[String(r[0] || '').trim()]; if (!id) continue; const vals = r.slice(si + 1, si + 4).filter(x => x != null); out.push({ id, st: String(r[si] || '').trim(), amt: (vals.find(x => typeof x === 'number') || null), txt: vals.filter(x => typeof x !== 'number').map(x => String(x).trim()).join(' · ') }); } });
  return out;
}
function setSrc(k, file, label) { DB.meta.src = DB.meta.src || {}; DB.meta.src[k] = { file, at: Date.now(), label: label || '' }; }
function applyPending() {
  const p = UI.upd.found.filter(x => x.apply); if (!p.length) return;
  const before = snap(); p.forEach(x => x.apply()); DB.meta.updated = Date.now(); DB.hist = DB.hist || []; DB.hist.push(Object.assign(snapNow(), { files: p.map(x => x.file).join(', '), before }));
  prep(); const ok = saveLocal(); UI.upd.found = []; UI.upd.notes = [ok ? 'Applied. The data is saved in this browser. To publish it for your manager, download the data file below and send it to Claude.' : 'Applied for this session, but the browser could not save it (storage full). Download the data file to keep it.']; render(); toast('Data updated');
}
function snapNow() { const t = totals({}), m = totals({ rep: ME.rep }), f = fcTotals({ rep: ME.rep }); return { at: Date.now(), region: Math.round(t.y26), regionT: Math.round(t.tY), mine: Math.round(m.y26), mineT: Math.round(m.tY), fc: Math.round(f.v), stockItems: (DB.jj || []).length }; }
function snap() { try { return snapNow(); } catch (e) { return null; } }
function dl(name, text, type) { const b = new Blob([text], { type: type || 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); }
PAGES.update = function () {
  const src = DB.meta.src || {}; const U = UI.upd;
  let H = pageHead('Update center', 'Drop the new sheets here. The dashboard detects what each file is, shows what will change, and rebuilds every page.');
  H += `<div class="card"><div class="drop" id="drop" data-do="pick"><b>Drop Excel files here</b> or click to choose<div class="note">Sales YTD workbook (with the target sheet) · Q4 forecast per item · HQ tracker · Jamjoom stock. Several files at once are fine.</div></div><input type="file" id="fileIn" multiple accept=".xlsx,.xls,.csv,.json" style="display:none"></div>`;
  if (U.notes && U.notes.length) H += U.notes.map(n => `<div class="hl">${esc(n)}</div>`).join('');
  if (U.found.length) H += `<div class="card"><h2>Ready to apply</h2>${U.found.map(x => `<div class="hl ok"><b>${esc(KIND_LABEL[x.kind] || x.kind)}</b> · ${esc(x.file)}<br>${esc(x.summary)}</div>`).join('')}<div class="chips"><button class="btn" data-do="apply">Apply ${U.found.length} update${U.found.length > 1 ? 's' : ''}</button><button class="btn sec" data-do="clearfound">Cancel</button></div></div>`;
  H += `<div class="card"><h2>Current data</h2>${table('t_src', [{ k: 'l', l: 'Source', tl: 1, h: r => `<b>${esc(r.l)}</b>`, v: r => r.l }, { k: 'f', l: 'File', tl: 1, h: r => esc(r.f), v: r => r.f, w: 1 }, { k: 'c', l: 'Covers', tl: 1, h: r => esc(r.c), v: r => r.c, w: 1 }, { k: 'a', l: 'Loaded', tl: 1, h: r => esc(r.a), v: r => r.a }], ['sales', 'forecast', 'tracker', 'jjstock', 'fstatus'].map(k => ({ _k: k, l: KIND_LABEL[k], f: (src[k] || {}).file || 'embedded', c: k === 'sales' ? `${YL()} 2026 · ${F.length.toLocaleString()} account lines` : k === 'forecast' ? `Oct–Dec · ${FC.length.toLocaleString()} lines` : k === 'tracker' ? `${(DB.docs || []).length} doctors` : k === 'jjstock' ? `${(DB.jj || []).length} items` : `${(DB.fstat || []).length} accounts`, a: (src[k] || {}).at ? new Date(src[k].at).toLocaleString() : 'with the published version' })), { noMine: 1, title: 'Sources' })}<div class="note">Dallah (consumption PDFs) and Al Habib files are processed by Claude. ${LOCAL ? '<b>This browser holds newer data than the published version.</b>' : 'You are seeing the published version.'}</div></div>`;
  H += `<div class="card"><h2>Publish, back up, reset</h2><div class="chips"><button class="btn" data-do="export">Download data file (hq-data.json)</button><button class="btn sec" data-do="pickjson">Load a data file</button><button class="btn sec" data-do="reset">Reset to published version</button></div><div class="note">Updating here changes only this browser. To publish for your manager: download the data file and send it to Claude, who rebuilds the shared link. The data file also works as a backup.</div><input type="file" id="jsonIn" accept=".json" style="display:none"></div>`;
  H += `<div class="card"><h2>Settings</h2><div class="grid g4">${[['crit', 'Critical stock under (days)'], ['low', 'Low stock under (days)'], ['over', 'Overstock above (days)']].map(s => `<label class="lab">${s[1]}<br><input class="q" type="number" min="1" value="${CFG[s[0]]}" data-cfg="${s[0]}" style="min-width:0;width:100%"></label>`).join('')}<label class="lab">My rep<br><select class="q" data-me="rep" style="min-width:0;width:100%">${DIM.reps.map(r => `<option ${r.n === ME.rep ? 'selected' : ''}>${esc(r.n)}</option>`).join('')}</select></label></div><div class="note">"My rep" decides which rows are highlighted ⭐ across the dashboard.</div></div>`;
  const h = (DB.hist || []).slice().reverse();
  H += `<div class="card"><h2>Update history</h2>${h.length ? table('t_hist', [{ k: 'at', l: 'When', tl: 1, h: r => new Date(r.at).toLocaleString(), v: r => r.at }, { k: 'files', l: 'Files', tl: 1, h: r => esc(r.files || ''), v: r => r.files, w: 1 }, { k: 'region', l: 'Region sales', h: r => fmt(r.region), v: r => r.region }, { k: 'mine', l: 'My sales', h: r => fmt(r.mine), v: r => r.mine }, { k: 'dm', l: 'My change', h: r => r.before ? `<span class="${r.mine >= r.before.mine ? 'up' : 'dn'}">${sgn(r.mine - r.before.mine)}</span>` : '—', v: r => r.before ? r.mine - r.before.mine : null }, { k: 'fc', l: 'My Q4 forecast', h: r => fmt(r.fc), v: r => r.fc }], h, { noMine: 1, title: 'History' }) : '<div class="empty">No updates yet in this browser.</div>'}</div>`;
  return H;
};

/* ---------- IDEAS ---------- */
PAGES.ideas = function () {
  const I = [['Movement since last update', 'A page that compares this load with the previous one: which accounts, drugs and reps moved, and what changed in the forecast.', 'High', 'Small'],
  ['Target scenarios', 'Pick a drug and a monthly pace and see where the year closes. Shows the pace you need per drug to reach the full-year target.', 'High', 'Medium'],
  ['Manager view', 'One-page read-only summary with the five numbers a manager asks for, ready to print or send as PDF.', 'High', 'Small'],
  ['Visit-to-sales link', 'Join doctor visits with the sales of their hospital to see whether visit effort follows the drugs that matter.', 'Medium', 'Medium'],
  ['Reorder suggestions', 'From cover, sales pace and lead time, propose the quantity and date to ask Dallah and the warehouse for each drug.', 'High', 'Medium'],
  ['Account watchlist', 'Pin accounts and get an alert when their sales fall below a threshold after any update.', 'Medium', 'Small'],
  ['Competitor and market share', 'Add market data per drug (if you have IQVIA or similar) and show share by account type.', 'Medium', 'Large'],
  ['Installable app + weekly auto-refresh', 'Make the dashboard installable on the phone and pull the latest published data automatically.', 'Medium', 'Small']];
  return pageHead('Suggestions', 'Ideas to take the dashboard further. Tell Claude which ones to build.') + `<div class="card">${table('t_ideas', [{ k: 'a', l: 'Idea', tl: 1, h: r => `<b>${esc(r.a)}</b>`, v: r => r.a }, { k: 'b', l: 'What it gives you', tl: 1, h: r => esc(r.b), v: r => r.b, w: 1 }, { k: 'c', l: 'Value', h: r => pill(r.c, r.c === 'High' ? 'ok' : 'warn'), v: r => r.c }, { k: 'd', l: 'Effort', h: r => esc(r.d), v: r => r.d }], I.map(x => ({ a: x[0], b: x[1], c: x[2], d: x[3] })), { noMine: 1, title: 'Ideas' })}</div>`;
};

/* ---------- ROUTER, EVENTS, BOOT ---------- */
const NAV = [['home', 'Overview'], ['mine', '⭐ My line'], ['lines', 'Lines'], ['areas', 'Areas'], ['forecast', 'Forecast'], ['doctors', 'Doctors'], ['stock', 'Stock'], ['update', 'Update'], ['ideas', 'Ideas']];
function route() { return (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'home'; }
function render() {
  const r = route(), pg = PAGES[r] || PAGES.home; const y = window.scrollY; const fo = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.in : null; const caret = fo ? document.activeElement.selectionStart : 0;
  const src = DB.meta.src || {};
  $('#nav').innerHTML = NAV.map(n => `<a href="#/${n[0]}" class="${n[0] === r ? 'on' : ''} ${n[0] === 'mine' ? 'me' : ''}">${n[1]}</a>`).join('');
  $('#fresh').innerHTML = `<span class="badge">Sales ${YL()}</span> ${LOCAL ? '<span class="badge warn">Local data</span>' : ''}`;
  $('#app').innerHTML = pg();
  if (r === 'update') bindUpdate();
  if (fo) { const el = document.querySelector(`[data-in="${fo}"]`); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) { } } } else window.scrollTo(0, y);
}
function bindUpdate() {
  const d = $('#drop'), fi = $('#fileIn'); if (!d) return;
  d.addEventListener('dragover', e => { e.preventDefault(); d.classList.add('on'); }); d.addEventListener('dragleave', () => d.classList.remove('on'));
  d.addEventListener('drop', e => { e.preventDefault(); d.classList.remove('on'); handleFiles([...e.dataTransfer.files]); });
  fi.addEventListener('change', e => handleFiles([...e.target.files]));
  const ji = $('#jsonIn'); ji.addEventListener('change', e => handleFiles([...e.target.files]));
  document.querySelectorAll('[data-cfg]').forEach(el => el.addEventListener('change', e => { CFG[el.dataset.cfg] = Math.max(1, Number(el.value) || 1); saveCfg(); toast('Saved'); }));
  document.querySelectorAll('[data-me]').forEach(el => el.addEventListener('change', e => { ME.rep = el.value; ME.line = lineOfRep(el.value) || ME.line; ME.label = 'My line · ' + ME.line; saveCfg(); render(); toast('Highlight changed to ' + ME.rep); }));
}
function saveCfg() { try { localStorage.setItem('hq_cfg_v1', JSON.stringify({ CFG, me: { rep: ME.rep, line: ME.line } })); } catch (e) { } }
function loadCfg() { try { const c = JSON.parse(localStorage.getItem('hq_cfg_v1') || 'null'); if (c) { Object.assign(CFG, c.CFG || {}); if (c.me) { ME.rep = c.me.rep; ME.line = c.me.line; ME.label = 'My line · ' + ME.line; } } } catch (e) { } }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-do],[data-go]'); if (!el) return;
  if (el.dataset.go) { location.hash = '#/' + el.dataset.go; return; }
  const a = el.dataset.do, k = el.dataset.k;
  if (a === 'set') { setPath(el.dataset.p, el.dataset.v); render(); }
  else if (a === 'sort') { const id = el.dataset.t, c = el.dataset.k; const s = UI.sort[id]; UI.sort[id] = s && s.k === c ? { k: c, d: -s.d } : { k: c, d: -1 }; render(); }
  else if (a === 'csv') csvOf(el.dataset.t);
  else if (a === 'minetog') { UI.mineFirst = !UI.mineFirst; render(); }
  else if (a === 'drug') drugModal(k); else if (a === 'acct') acctModal(k); else if (a === 'fcacct') fcAcctModal(k);
  else if (a === 'docplace') { UI.doc.h = UI.doc.h === k ? 'all' : k; render(); }
  else if (a === 'close') { const m = el.closest('.modal'); if (m) m.remove(); }
  else if (a === 'pick') { $('#fileIn').click(); }
  else if (a === 'pickjson') { $('#jsonIn').click(); }
  else if (a === 'apply') applyPending();
  else if (a === 'clearfound') { UI.upd.found = []; UI.upd.notes = []; render(); }
  else if (a === 'export') { dl('hq-data.json', JSON.stringify(DB)); toast('Data file downloaded'); }
  else if (a === 'reset') { if (confirm('Remove the data saved in this browser and go back to the published version?')) { try { localStorage.removeItem(STORE); } catch (e) { } loadDB(); render(); toast('Back to published data'); } }
});
document.addEventListener('input', e => { const p = e.target.dataset && e.target.dataset.in; if (p) { setPath(p, e.target.value); clearTimeout(window.__t); window.__t = setTimeout(render, 180); } });
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
loadCfg(); loadDB(); setTitle(); render();
window.__hq = { PAGES, get DB() { return DB; } };
