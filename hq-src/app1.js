/* ===== Sales HQ · app part 1: data, helpers, tables, charts ===== */
const C = HQCORE;
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NFm = new Intl.NumberFormat('en-US');
const fmt = n => (n == null || !isFinite(n)) ? '—' : NFm.format(Math.round(n));
const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n));
const pc = n => (n == null || !isFinite(n)) ? '—' : Math.round(n * 100) + '%';
const pcs = n => (n == null || !isFinite(n)) ? '—' : (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n * 100)) + '%';
const sum = (a, i, j) => { let s = 0; for (let k = i == null ? 0 : i; k < (j == null ? a.length : j); k++) s += a[k] || 0; return s; };
const div = (a, b) => b > 0 ? a / b : null;
const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ME = { rep: 'Saleh', line: 'GIT 2', label: 'My line · GIT 2' };
const STORE = 'sales_hq_db_v3';
let DB = null, LOCAL = false;

/* ---------- load: embedded database, or a newer one saved in this browser ---------- */
function loadDB() {
  DB = JSON.parse(JSON.stringify(DB_EMBED)); LOCAL = false;
  try {
    const s = localStorage.getItem(STORE);
    if (s) { const L = JSON.parse(s); if (L && L.meta && L.meta.updated > DB.meta.updated) { DB = L; LOCAL = true; } }
  } catch (e) { }
  prep();
}
function saveLocal() { try { localStorage.setItem(STORE, JSON.stringify(DB)); LOCAL = true; return true; } catch (e) { return false; } }

/* ---------- indexes and derived rows ---------- */
let YP = 9, DIM, F = [], BUD = [], FC = [], FB = [], repIx = {}, prodIx = {}, custIx = {}, PM = {}, JJM = {};
function prep() {
  const S = DB.sales; DIM = S.dims; YP = S.ytd || 9;
  repIx = {}; DIM.reps.forEach((r, i) => repIx[r.n] = i);
  prodIx = {}; DIM.prods.forEach((p, i) => prodIx[p.id] = i);
  custIx = {}; DIM.custs.forEach((c, i) => custIx[c.id] = i);
  F = S.f.map(r => ({ c: r[0], p: r[1], r: r[2], ln: r[3], a: r[4], b: r[5], t: r[6], y26: sum(r[4], 0, YP), y25: sum(r[5], 0, YP), tY: sum(r[6], 0, YP), tF: sum(r[6]), q425: sum(r[5], 9, 12), fy25: sum(r[5]) }));
  BUD = S.bud.map(r => ({ r: r[0], p: r[1], ln: r[2], t: r[3], fy: r[4] || sum(r[3]), tY: sum(r[3], 0, YP), q4: sum(r[3], 9, 12) }));
  FC = (DB.fc && DB.fc.f || []).map(r => ({ cid: r[0], pid: r[1], rep: r[2], u: r[3], v: r[4], pr: r[5], nat: r[6], uT: sum(r[3]), vT: sum(r[4]) }));
  FB = (DB.fc && DB.fc.fb || []).map(r => ({ rep: r[0], pid: r[1], b: r[2], bT: sum(r[2]) }));
  PM = {}; DIM.prods.forEach(p => PM[p.id] = p);
  // Jamjoom stock mapping
  JJM = {}; const jj = DB.jj || [];
  const names = {}; DIM.prods.forEach(p => names[p.id] = p.n); if (DB.fc && DB.fc.pn) Object.keys(DB.fc.pn).forEach(k => { if (!names[k]) names[k] = DB.fc.pn[k]; });
  Object.keys(names).forEach(pid => { const m = C.matchJJ(names[pid], jj); if (m) JJM[pid] = m; });
}
const repName = i => DIM.reps[i] ? DIM.reps[i].n : '?';
const prodName = pid => (PM[pid] && PM[pid].n) || (DB.fc && DB.fc.pn && DB.fc.pn[pid]) || pid;
const custName = cid => { const i = custIx[cid]; return i != null ? DIM.custs[i].n : ((DB.fc && DB.fc.cn && DB.fc.cn[cid]) || cid); };
const lineOfRep = r => (DIM.reps[repIx[r]] || {}).line || '';
const isMineRep = r => r === ME.rep;
const isMineLine = l => l === ME.line;
const pcat = pid => (PM[pid] && PM[pid].cat) || '';
const pgrp = pid => (PM[pid] && PM[pid].g) || '';

/* ---------- UI state ---------- */
const UI = { mineFirst: true, lines: { line: 'all', rep: 'all', cat: 'all', q: '', by: 'prod' }, areas: { rep: 'all', nat: 'all', q: '', line: 'all' },
  fc: { rep: 'all', line: 'all', q: '', view: 'prod' }, doc: { h: 'all', cls: 'all', st: 'all', q: '', sp: 'all' }, stock: { tab: 'over', q: '', mine: true, st: 'all' }, sort: {}, upd: { found: [], log: [] } };
const TBL = {};

/* ---------- small html helpers ---------- */
const pill = (t, k) => `<span class="pill ${k || ''}">${esc(t)}</span>`;
const achK = a => a == null ? '' : a >= 1 ? 'ok' : a >= .8 ? 'warn' : 'bad';
const achCell = a => a == null ? '<span class="mut">—</span>' : `<b class="${a >= 1 ? 'up' : a >= .8 ? 'warn' : 'dn'}">${pc(a)}</b><span class="bar"><i style="width:${Math.min(100, a * 100)}%;background:var(--${a >= 1 ? 'ok' : a >= .8 ? 'warn' : 'bad'})"></i></span>`;
const yoyCell = y => y == null ? '<span class="mut">—</span>' : `<span class="${y >= 0 ? 'up' : 'dn'}">${pcs(y)}</span>`;
const kpi = (v, l, sub, cls) => `<div class="kpi ${cls || ''}"><span>${l}</span><b>${v}</b>${sub ? `<i>${sub}</i>` : ''}</div>`;
function chips(list, cur, path, mineKey) {
  return `<div class="chips">${list.map(o => `<button class="chip ${cur === o[0] ? 'on' : ''} ${mineKey && o[0] === mineKey ? 'mine' : ''}" data-do="set" data-p="${path}" data-v="${esc(o[0])}">${esc(o[1])}${mineKey && o[0] === mineKey ? ' ⭐' : ''}</button>`).join('')}</div>`;
}
function setPath(path, v) { const ks = path.split('.'); let o = UI; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }
function search(path, ph) { const ks = path.split('.'); let o = UI; ks.forEach(k => o = o[k]); return `<input class="q" data-in="${path}" placeholder="${ph}" value="${esc(o)}">`; }

/* ---------- sortable tables ---------- */
/* cols: {k,l,h(row)->html,v(row)->value,tl:bool}; rows may carry .mine and ._grp, ._tot */
function table(id, cols, rows, opt) {
  opt = opt || {}; const st = UI.sort[id] || (opt.sort ? { k: opt.sort, d: opt.dir || -1 } : null);
  let rs = rows.slice();
  const norm = rs.filter(r => !r._tot && !r._grp), tots = rs.filter(r => r._tot);
  if (st) { const c = cols.find(c => c.k === st.k); if (c) { const f = c.v || (r => r[c.k]); norm.sort((a, b) => { const x = f(a), y = f(b); const nx = x == null || x !== x, ny = y == null || y !== y; if (nx && ny) return 0; if (nx) return 1; if (ny) return -1; return (typeof x === 'string' ? x.localeCompare(y) : x - y) * st.d; }); } }
  if (UI.mineFirst && !opt.noMine) norm.sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0));
  const lim = opt.limit || 400; const shown = norm.slice(0, lim);
  TBL[id] = { cols, rows: norm.concat(tots), title: opt.title || id };
  let h = `<div class="scroll"><table class="t" data-t="${id}"><tr>${cols.map(c => `<th class="${c.tl ? 'tl' : ''}" data-do="sort" data-t="${id}" data-k="${c.k}">${esc(c.l)}${st && st.k === c.k ? `<span class="ar"> ${st.d < 0 ? '▼' : '▲'}</span>` : ''}</th>`).join('')}</tr>`;
  shown.forEach(r => { h += `<tr class="${r.mine ? 'mine' : ''} ${opt.click ? 'row' : ''}" ${opt.click && r._k != null ? `data-do="${opt.click}" data-k="${esc(r._k)}" style="cursor:pointer"` : ''}>${cols.map(c => `<td class="${c.tl ? 'tl' : ''} ${c.w ? 'wrap' : ''}">${c.h ? c.h(r) : esc(r[c.k])}</td>`).join('')}</tr>`; });
  tots.forEach(r => { h += `<tr class="tot">${cols.map(c => `<td class="${c.tl ? 'tl' : ''}">${c.h ? c.h(r) : esc(r[c.k])}</td>`).join('')}</tr>`; });
  h += `</table></div>`;
  if (norm.length > lim) h += `<div class="note">Showing the first ${lim} of ${norm.length} rows. Use the filters or export to see all.</div>`;
  if (!norm.length) h += `<div class="empty">No rows for this filter</div>`;
  h += `<div class="noprint" style="margin-top:8px"><button class="btn sec sm" data-do="csv" data-t="${id}">Export CSV</button></div>`;
  return h;
}
function csvOf(id) {
  const T = TBL[id]; if (!T) return; const tx = h => String(h == null ? '' : h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  const lines = [T.cols.map(c => q(c.l)).join(',')].concat(T.rows.map(r => T.cols.map(c => { const v = c.v ? c.v(r) : null; return q(typeof v === 'number' && isFinite(v) && !c.h ? v : tx(c.h ? c.h(r) : r[c.k])); }).join(',')));
  const b = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (T.title || id).replace(/\W+/g, '_') + '.csv'; a.click();
}

/* ---------- SVG charts ---------- */
function svgMonthly(series, o) {
  o = o || {}; const W = 640, H = 200, L = 46, B = 24, T = 10, Rr = 8, n = 12;
  const mx = Math.max(1, ...series.flatMap(s => s.v.filter(x => x != null))) * 1.1;
  const x = i => L + (W - L - Rr) * (i + .5) / n, y = v => T + (H - T - B) * (1 - v / mx);
  let s = `<svg class="svg" viewBox="0 0 ${W} ${H}" width="100%" role="img">`;
  for (let k = 0; k <= 4; k++) { const v = mx * k / 4; s += `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 4}" y="${y(v) + 3}" text-anchor="end">${v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : Math.round(v)}</text>`; }
  MN.forEach((m, i) => s += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${m}</text>`);
  series.forEach(se => {
    if (se.bar) { se.v.forEach((v, i) => { if (v == null) return; s += `<rect x="${x(i) - 9}" y="${y(v)}" width="18" height="${H - B - y(v)}" rx="3" fill="${se.c}" opacity=".85"/>`; }); }
    else { const pts = se.v.map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean); if (pts.length) { s += `<polyline fill="none" stroke="${se.c}" stroke-width="2.4" ${se.dash ? 'stroke-dasharray="5 4"' : ''} points="${pts.map(p => p.join(',')).join(' ')}"/>`; pts.forEach(p => s += `<circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${se.c}"/>`); } }
  });
  s += `</svg><div class="legend">${series.map(se => `<i style="background:${se.c}"></i>${esc(se.n)}`).join('')}</div>`; return s;
}
function hbars(items, fmtv) {
  const mx = Math.max(1, ...items.map(i => i.v)); return items.map(i => `<div style="display:flex;align-items:center;gap:8px;margin:5px 0"><div style="width:130px;font-size:12px;${i.mine ? 'font-weight:800' : ''}">${esc(i.n)}${i.mine ? ' ⭐' : ''}</div><div style="flex:1;background:var(--line);border-radius:6px;height:12px"><div style="width:${Math.max(2, i.v / mx * 100)}%;height:100%;border-radius:6px;background:${i.c || 'var(--brand)'}"></div></div><div style="width:92px;text-align:right;font-size:12px"><b>${(fmtv || fmt)(i.v)}</b></div></div>`).join('');
}

/* ---------- aggregation ---------- */
function filtF(fl) {
  fl = fl || {}; return F.filter(x => (!fl.line || fl.line === 'all' || DIM.lines[x.ln] === fl.line) && (!fl.rep || fl.rep === 'all' || repName(x.r) === fl.rep) && (!fl.cat || fl.cat === 'all' || pcat(DIM.prods[x.p].id) === fl.cat) && (!fl.nat || fl.nat === 'all' || DIM.custs[x.c].nat === fl.nat));
}
function monthsOf(rows, key) { const o = new Array(12).fill(0); rows.forEach(r => r[key].forEach((v, i) => o[i] += v)); return o; }
const budOf = (fl) => BUD.filter(x => (!fl.line || fl.line === 'all' || DIM.lines[x.ln] === fl.line) && (!fl.rep || fl.rep === 'all' || repName(x.r) === fl.rep) && (!fl.cat || fl.cat === 'all' || pcat(DIM.prods[x.p].id) === fl.cat));
function totals(fl) {
  const rows = filtF(fl), bd = budOf(fl);
  const a = monthsOf(rows, 'a'), b = monthsOf(rows, 'b');
  const y26 = sum(a, 0, YP), y25 = sum(b, 0, YP);
  const tY = sum(bd.map(x => x.tY)), tF = sum(bd.map(x => x.fy)), q4b = sum(bd.map(x => x.q4));
  const tm = new Array(12).fill(0); bd.forEach(x => x.t.forEach((v, i) => tm[i] += v));
  return { a, b, tm, y26, y25, tY, tF, q4b, ach: div(y26, tY), yoy: y25 > 0 ? y26 / y25 - 1 : null, q425: sum(b, 9, 12), fy25: sum(b) };
}
/* forecast totals for a rep / line / all (SAR and units) */
function fcTotals(fl) {
  fl = fl || {}; const rows = FC.filter(x => (!fl.rep || fl.rep === 'all' || x.rep === fl.rep) && (!fl.line || fl.line === 'all' || lineOfRep(x.rep) === fl.line));
  const fb = FB.filter(x => (!fl.rep || fl.rep === 'all' || x.rep === fl.rep) && (!fl.line || fl.line === 'all' || lineOfRep(x.rep) === fl.line));
  return { u: sum(rows.map(r => r.uT)), v: sum(rows.map(r => r.vT)), um: [0, 1, 2].map(i => sum(rows.map(r => r.u[i]))), vm: [0, 1, 2].map(i => sum(rows.map(r => r.v[i]))), bud: sum(fb.map(x => x.bT)) };
}
const outlook = (t, f) => (t.y26 + f.v);
function setTitle() { document.title = 'Sales HQ · R1 Riyadh'; }
function toast(m) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 2800); }
function modal(title, body) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box"><div class="hd"><h2>${title}</h2><button class="btn sec sm" data-do="close">Close</button></div>${body}</div>`; m.addEventListener('click', e => { if (e.target === m) m.remove(); }); document.body.appendChild(m); }
