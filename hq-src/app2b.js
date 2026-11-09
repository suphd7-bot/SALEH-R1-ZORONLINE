/* ===== Sales HQ · Sales Review + Follow-up (flat table, month-range filters) ===== */
const RVK = ['group', 'account', 'branch', 'line', 'rep', 'cat', 'product', 'measure', 'atype'];
let RV = null;
function rvData() {
  if (RV) return RV;
  const src = DB.rv || (typeof DB_EMBED !== 'undefined' ? DB_EMBED.rv : null); if (!src) return (RV = { rows: [], dims: {} });
  const d = src.dims;
  RV = { dims: d, rows: src.rows.map(a => { const o = { _i: 0 }; RVK.forEach((k, i) => o[k] = d[k][a[i]]); o.y25 = a[9]; o.y26 = a[10]; o.thru = a[11]; o.tgt = a[12]; o.stock = a[13]; o.fcU = a[14]; o.fcS = a[15]; o.fcT = a[16]; o.note = a[17]; return o; }) };
  return RV;
}
UI.rv = { m: 'Sell-in (SAR)', group: 'All', account: 'All', branch: 'All', line: 'All', rep: 'All', cat: 'All', product: 'All', f: 8, t: 9, by: 'account' };
UI.fu = { m: 'Sell-in (SAR)', group: 'All', account: 'All', line: 'All', rep: 'All', pri: 'all', f: 8, t: 9, q: '', saleh: false };
const FU_KEY = 'hq_followup_v1'; let FUS = {}; try { FUS = JSON.parse(localStorage.getItem(FU_KEY) || '{}'); } catch (e) { }
const rvSave = () => { try { localStorage.setItem(FU_KEY, JSON.stringify(FUS)); } catch (e) { } };
const rvOK = (r, f, skip) => RVK.every(k => k === 'atype' || k === skip || !f[k] || f[k] === 'All' || r[k] === f[k]);
function rvSel(label, k, st, opts) {
  return `<label class="fl"><span>${label}</span><select data-rv="${st}.${k}">${opts.map(o => `<option value="${esc(o)}" ${String(st === 'rv' ? UI.rv[k] : UI.fu[k]) === String(o) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function rvMonthSel(label, k, st) {
  const cur = (st === 'rv' ? UI.rv : UI.fu)[k];
  return `<label class="fl"><span>${label}</span><select data-rv="${st}.${k}" data-num="1">${MN.slice(0, 10).map((m, i) => `<option value="${i}" ${cur === i ? 'selected' : ''}>${m}</option>`).join('')}</select></label>`;
}
/* options narrowed by the other filters */
function rvOpts(st, k, f) { const s = new Set(); rvData().rows.forEach(r => { if (r.measure === f.m && rvOK(r, f, k)) s.add(r[k]); }); return ['All'].concat([...s].sort((a, b) => String(a).localeCompare(String(b)))); }
/* metrics of one source row for the chosen month range */
function rvMet(r, f, t) {
  const o = { p25: 0, p26: 0, pa: 0, pn: 0, y25: null, y26: null, yd: 0, yb: 0, sd: null, sb: 0, od: null, ob: 0, tg: 0, yt: 0 };
  for (let m = f; m <= t; m++) { const a = r.y25[m], b = r.y26[m]; if (b != null) o.pa += b; if (a != null && b != null) { o.p25 += a; o.p26 += b; o.pn++; } }
  const th = r.thru, A = r.y25.slice(0, th).filter(x => x != null), B = r.y26.slice(0, th).filter(x => x != null);
  if (A.length && B.length) { const sa = A.reduce((x, y) => x + y, 0), sb = B.reduce((x, y) => x + y, 0); o.yd = sb - sa; o.yb = sa; o.y25 = sa; o.y26 = sb; }
  else if (B.length) o.y26 = B.reduce((x, y) => x + y, 0);
  [[8, 'sd', 'sb'], [9, 'od', 'ob']].forEach(([m, d, b]) => { const a = r.y25[m], c = r.y26[m]; if (a != null && c != null) { o[d] = c - a; o[b] = a; } });
  if (r.tgt > 0) { o.tg = r.tgt; o.yt = B.reduce((x, y) => x + y, 0); }
  return o;
}
function rvAgg(rows, f, t) {
  const g = { p25: 0, p26: 0, pa: 0, pn: 0, y25: 0, y26: 0, yd: 0, yb: 0, sd: 0, sb: 0, od: 0, ob: 0, tg: 0, yt: 0, st: null, n: 0 };
  rows.forEach(r => { const m = rvMet(r, f, t); ['p25', 'p26', 'pa', 'pn', 'yd', 'yb', 'sd', 'sb', 'od', 'ob', 'tg', 'yt'].forEach(k => g[k] += m[k] || 0); g.y25 += m.y25 || 0; g.y26 += m.y26 || 0; if (typeof r.stock === 'number') g.st = (g.st || 0) + r.stock; g.n++; });
  g.pg = g.p25 > 0 ? g.p26 / g.p25 - 1 : null; g.yg = g.yb > 0 ? g.yd / g.yb : null; g.sg = g.sb > 0 ? g.sd / g.sb : null; g.og = g.ob > 0 ? g.od / g.ob : null; g.ach = g.tg > 0 ? g.yt / g.tg : null;
  return g;
}
function rvUnit(m) { return m.startsWith('Sell-in') ? 'SAR' : 'units'; }
const rvPeriod = (f, t) => f === t ? MN[f] : MN[f] + '–' + MN[t];
function rvFix(st) { if (st.f > st.t) { const x = st.f; st.f = st.t; st.t = x; } }

PAGES.review = function () {
  const st = UI.rv; rvFix(st); const D = rvData(), f = st.f, t = st.t, P = rvPeriod(f, t), U = rvUnit(st.m);
  const rows = D.rows.filter(r => r.measure === st.m && rvOK(r, st));
  const A = rvAgg(rows, f, t);
  const by = { account: 'account', product: 'product', rep: 'rep', line: 'line', branch: 'branch', group: 'group', cat: 'cat' }; const key = by[st.by] || 'account';
  const groups = {}; rows.forEach(r => { const k = key === 'branch' ? r.account + ' · ' + r.branch : r[key]; (groups[k] = groups[k] || []).push(r); });
  const trs = Object.keys(groups).map(k => { const g = rvAgg(groups[k], f, t); g.name = k; g.mine = groups[k].some(r => r.rep === ME.rep); g.rep = [...new Set(groups[k].map(r => r.rep))].join(', '); return g; });
  const cols = [{ k: 'name', l: { account: 'Account', product: 'Product', rep: 'Rep', line: 'Line', branch: 'Account · branch', group: 'Group', cat: 'Category' }[st.by], tl: 1, w: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name },
    { k: 'p25', l: `${P} 2025`, h: r => fmt(r.p25), v: r => r.p25 }, { k: 'p26', l: `${P} 2026`, h: r => fmt(r.p26), v: r => r.p26 },
    { k: 'pd', l: 'Δ', h: r => r.pn ? `<span class="${r.p26 - r.p25 >= 0 ? 'up' : 'dn'}">${sgn(r.p26 - r.p25)}</span>` : '—', v: r => r.pn ? r.p26 - r.p25 : null },
    { k: 'pg', l: 'Growth %', h: r => yoyCell(r.pg), v: r => r.pg },
    { k: 'pa', l: `${P} 2026 (all)`, h: r => fmt(r.pa), v: r => r.pa },
    { k: 'y25', l: 'YTD 2025', h: r => fmt(r.y25), v: r => r.y25 }, { k: 'y26', l: 'YTD 2026', h: r => fmt(r.y26), v: r => r.y26 }, { k: 'yg', l: 'YTD %', h: r => yoyCell(r.yg), v: r => r.yg },
    { k: 'sg', l: 'Sep %', h: r => yoyCell(r.sg), v: r => r.sg }, { k: 'og', l: 'Oct %', h: r => yoyCell(r.og), v: r => r.og }]
    .concat(st.m.startsWith('Sell-in') ? [{ k: 'tg', l: 'Target (accounts)', h: r => fmt(r.tg), v: r => r.tg }, { k: 'ach', l: 'Ach %', h: r => achCell(r.ach), v: r => r.ach }] : [{ k: 'st', l: 'Stock at account', h: r => fmt(r.st), v: r => r.st }]);
  const mo = [0, 1].map(y => { const a = new Array(12).fill(null); for (let m = 0; m < 10; m++) { let s = 0, c = 0; rows.forEach(r => { const v = (y ? r.y26 : r.y25)[m]; if (v != null) { s += v; c++; } }); if (c) a[m] = s; } return a; });
  const mTbl = `<div class="scroll"><table class="t"><tr><th class="tl"></th>${MN.slice(0, 10).map((m, i) => `<th style="${i >= f && i <= t ? 'background:#fff3c4' : ''}">${m}</th>`).join('')}</tr>
    <tr><td class="tl">2025</td>${mo[0].slice(0, 10).map(v => `<td>${fmt(v)}</td>`).join('')}</tr><tr><td class="tl">2026</td>${mo[1].slice(0, 10).map(v => `<td>${fmt(v)}</td>`).join('')}</tr>
    <tr><td class="tl">Growth</td>${mo[0].slice(0, 10).map((v, i) => `<td>${v > 0 && mo[1][i] != null ? yoyCell(mo[1][i] / v - 1) : '—'}</td>`).join('')}</tr></table></div>`;
  const gaps = rows.filter(r => r.note).length;
  const sel = `<div class="flt">${rvSel('Measure', 'm', 'rv', ['Sell-in (SAR)', 'Sell-out (units)'])}${rvSel('Group', 'group', 'rv', rvOpts('rv', 'group', st))}${rvSel('Account', 'account', 'rv', rvOpts('rv', 'account', st))}${rvSel('Branch', 'branch', 'rv', rvOpts('rv', 'branch', st))}${rvSel('Line', 'line', 'rv', rvOpts('rv', 'line', st))}${rvSel('Rep', 'rep', 'rv', rvOpts('rv', 'rep', st))}${rvSel('Category', 'cat', 'rv', rvOpts('rv', 'cat', st))}${rvSel('Product', 'product', 'rv', rvOpts('rv', 'product', st))}${rvMonthSel('From month', 'f', 'rv')}${rvMonthSel('To month', 't', 'rv')}</div>`;
  return pageHead('Sales Review', `Every account, branch, rep and product in one place. Pick any month or two months: ${P} 2026 is compared with the same months of 2025. Measure first: sell-in is SAR, sell-out is units.`, `<button class="btn sec sm" data-rvreset="rv">Reset filters</button>`) + sel +
    `<div class="kpis">${kpi(fmt(A.p25), `${P} 2025`, U)}${kpi(fmt(A.p26), `${P} 2026`, U)}${kpi(pcs(A.pg), 'Growth', A.pn ? `${sgn(A.p26 - A.p25)} ${U}` : 'no comparable months', A.pg >= 0 ? 'ok' : 'bad')}${kpi(fmt(A.pa), `${P} 2026 all data`, 'incl. accounts without 2025')}${kpi(pcs(A.yg), 'YTD growth', `${fmt(A.y26)} vs ${fmt(A.y25)}`)}${st.m.startsWith('Sell-in') ? kpi(pc(A.ach), 'Achievement', 'account targets') : kpi(fmt(A.st), 'Stock at account', 'where reported')}</div>
    <div class="card"><h3>Month by month · ${rows.length} rows</h3>${svgMonthly([{ n: '2025', v: mo[0], c: '#9aa6b8', bar: 1 }, { n: '2026', v: mo[1], c: '#0b5fff' }])}${mTbl}</div>
    <div class="card"><h3>Detail</h3><div class="chips">${[['account', 'By account'], ['branch', 'By branch'], ['product', 'By product'], ['rep', 'By rep'], ['line', 'By line'], ['group', 'By group'], ['cat', 'By category']].map(o => `<button class="chip ${st.by === o[0] ? 'on' : ''}" data-do="set" data-p="rv.by" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>${table('t_rv', cols, trs, { sort: 'p26', title: 'Sales review ' + P, limit: 600 })}
    <div class="note">Growth compares only months where both years have data, so a missing month never shows as a fake drop. ${gaps ? gaps + ' rows here have known data gaps (Dallah Aug and 2025 Aug–Oct, Zahrat 2025, Habib stock).' : ''}</div></div>`;
};

/* ---------- Follow-up ---------- */
function fuFlags(c, f, t) {
  const rows = c.rows, A = rvAgg(rows, f, t), fl = [], act = [];
  let cover = null;
  if (typeof A.st === 'number') { const av = rows.reduce((s, r) => s + (r.y26[8] || 0) + (r.y26[9] || 0), 0) / 2; if (av > 0) cover = A.st / av; }
  const noForecast = rows.some(r => r.fcS === 'NO' || /payment/i.test(r.fcT || ''));
  if (A.pg != null && A.pg < -.05) { fl.push('Decline'); act.push('Visit and find the cause of the decline.'); }
  if (A.ach != null && A.ach < .85) { fl.push('Behind target'); act.push('Push to close the target gap.'); }
  if (cover != null && cover < 1) { fl.push('Low cover'); act.push('Check supply and reorder.'); }
  if (cover != null && cover > 3) { fl.push('High stock'); act.push('Drive sell-out, slow replenishment.'); }
  if (A.p25 > 0 && A.pa === 0) { fl.push('Zero sales vs last year'); act.push('Reactivate the account.'); }
  if (noForecast) { fl.push('Forecast/payment issue'); act.push('Clear the payment / forecast status.'); }
  const n = fl.length; return { A, fl, act, cover, n, pri: n >= 3 ? 1 : n === 2 ? 2 : n === 1 ? 3 : 4, fcU: rows.reduce((s, r) => s + (r.fcU || 0), 0), fcS: (rows.find(r => r.fcS) || {}).fcS, fcT: (rows.find(r => r.fcT) || {}).fcT };
}
PAGES.followup = function () {
  const st = UI.fu; rvFix(st); const D = rvData(), f = st.f, t = st.t, P = rvPeriod(f, t);
  const sub = D.rows.filter(r => r.measure === st.m && rvOK(r, st));
  const m = {}; sub.forEach(r => { const k = [r.group, r.account, r.branch, r.rep].join('|'); (m[k] = m[k] || { k, group: r.group, account: r.account, branch: r.branch, rep: r.rep, rows: [] }).rows.push(r); });
  const q = st.q.toLowerCase();
  let list = Object.values(m).map(c => Object.assign(c, fuFlags(c, f, t))).filter(c => (st.pri === 'all' || String(c.pri) === st.pri) && (!st.saleh || c.rep === 'Saleh') && (!q || (c.account + ' ' + c.branch + ' ' + c.rep).toLowerCase().includes(q)));
  list.forEach(c => c.mine = c.rep === ME.rep);
  const cnt = [1, 2, 3, 4].map(p => Object.values(m).filter(c => c.pri === p).length);
  const PL = { 1: 'High', 2: 'Medium', 3: 'Watch', 4: 'OK' };
  const trk = c => FUS[st.m + '|' + c.k] || {};
  const cols = [{ k: 'pri', l: 'Priority', h: r => `<span class="pill ${r.pri === 1 ? 'bad' : r.pri === 2 ? 'warn' : r.pri === 3 ? '' : 'ok'}">${PL[r.pri]}</span>`, v: r => r.pri },
    { k: 'account', l: 'Account', tl: 1, w: 1, h: r => `<b>${esc(r.account)}</b>`, v: r => r.account }, { k: 'branch', l: 'Branch', tl: 1, h: r => esc(r.branch), v: r => r.branch }, { k: 'rep', l: 'Rep', tl: 1, h: r => repLabel(r.rep), v: r => r.rep },
    { k: 'p25', l: `${P} 2025`, h: r => fmt(r.A.p25), v: r => r.A.p25 }, { k: 'p26', l: `${P} 2026`, h: r => fmt(r.A.p26), v: r => r.A.p26 }, { k: 'pg', l: 'Growth %', h: r => yoyCell(r.A.pg), v: r => r.A.pg },
    { k: 'yg', l: 'YTD %', h: r => yoyCell(r.A.yg), v: r => r.A.yg }, { k: 'ach', l: 'Ach %', h: r => achCell(r.A.ach), v: r => r.A.ach }, { k: 'st', l: 'Stock', h: r => fmt(r.A.st), v: r => r.A.st }, { k: 'cv', l: 'Cover (mo)', h: r => r.cover == null ? '—' : r.cover.toFixed(1), v: r => r.cover },
    { k: 'fc', l: 'Q4 forecast (units)', h: r => r.fcU ? fmt(r.fcU) : '—', v: r => r.fcU }, { k: 'fs', l: 'Forecast status', h: r => r.fcS ? `<span class="pill ${r.fcS === 'NO' ? 'bad' : r.fcS === 'OK' ? 'ok' : ''}" title="${esc(r.fcT)}">${esc(r.fcS)}</span>` : '—', v: r => r.fcS },
    { k: 'fl', l: 'Flags / action', tl: 1, w: 1, h: r => r.n ? `<b>${esc(r.fl.join('; '))}</b><br><span class="mut">${esc(r.act.join(' '))}</span>` : '<span class="mut">—</span>', v: r => r.fl.join('; ') },
    { k: 'ow', l: 'Owner', tl: 1, h: r => `<input class="q fu" data-fu="${esc(st.m + '|' + r.k)}" data-f="o" value="${esc(trk(r).o || '')}" placeholder="Owner" style="width:90px">`, v: r => trk(r).o || '' },
    { k: 'ds', l: 'Status', tl: 1, h: r => `<select class="fu" data-fu="${esc(st.m + '|' + r.k)}" data-f="s">${['', 'Open', 'In progress', 'Done', 'Blocked'].map(o => `<option ${trk(r).s === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`, v: r => trk(r).s || '' },
    { k: 'cm', l: 'Comments', tl: 1, h: r => `<input class="q fu" data-fu="${esc(st.m + '|' + r.k)}" data-f="c" value="${esc(trk(r).c || '')}" placeholder="Comment" style="width:170px">`, v: r => trk(r).c || '' }];
  const sel = `<div class="flt">${rvSel('Measure', 'm', 'fu', ['Sell-in (SAR)', 'Sell-out (units)'])}${rvSel('Group', 'group', 'fu', rvOpts('fu', 'group', st))}${rvSel('Account', 'account', 'fu', rvOpts('fu', 'account', st))}${rvSel('Line', 'line', 'fu', rvOpts('fu', 'line', st))}${rvSel('Rep', 'rep', 'fu', rvOpts('fu', 'rep', st))}${rvMonthSel('From month', 'f', 'fu')}${rvMonthSel('To month', 't', 'fu')}</div>`;
  return pageHead('Follow-up', `One row per account, branch and rep for ${P} 2026 vs 2025. Priority = number of red flags (decline over 5%, behind target, low cover, high stock, zero sales vs last year, forecast/payment issue). Owner, status and comments are saved in this browser only.`, `<button class="btn sec sm" data-rvreset="fu">Reset filters</button>`) + sel +
    `<div class="chips">${[['all', `All ${Object.keys(m).length}`], ['1', `High ${cnt[0]}`], ['2', `Medium ${cnt[1]}`], ['3', `Watch ${cnt[2]}`], ['4', `OK ${cnt[3]}`]].map(o => `<button class="chip ${st.pri === o[0] ? 'on' : ''}" data-do="set" data-p="fu.pri" data-v="${o[0]}">${o[1]}</button>`).join('')}<button class="chip ${st.saleh ? 'on mine' : ''}" data-do="set" data-p="fu.saleh" data-v="${st.saleh ? '' : '1'}">⭐ Saleh only</button>${search('fu.q', 'Search account, branch, rep')}</div>
    <div class="card">${table('t_fu', cols, list, { sort: 'pri', dir: 1, title: 'Follow-up ' + P, limit: 500, noMine: 1 })}<div class="note">The Q4 forecast column shows the forecast file totals (Nov–Dec) for sell-in accounts. Flags use the months you picked; cover = stock ÷ average of Sep and Oct sales.</div></div>`;
};
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.rv) { const [s, k] = el.dataset.rv.split('.'); const o = s === 'rv' ? UI.rv : UI.fu; o[k] = el.dataset.num ? Number(el.value) : el.value; if (k === 'm') { ['group', 'account', 'branch', 'line', 'rep', 'cat', 'product'].forEach(x => { if (x in o) o[x] = 'All'; }); } render(); }
  else if (el.dataset && el.dataset.fu) { const e0 = FUS[el.dataset.fu] = FUS[el.dataset.fu] || {}; e0[el.dataset.f] = el.value; rvSave(); }
});
document.addEventListener('click', e => { const b = e.target.closest('[data-rvreset]'); if (!b) return; const k = b.dataset.rvreset; Object.keys(UI[k]).forEach(x => { if (['group', 'account', 'branch', 'line', 'rep', 'cat', 'product'].includes(x)) UI[k][x] = 'All'; }); render(); });
