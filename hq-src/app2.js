/* ===== Sales HQ · app part 2: Overview, Lines, Areas, Forecast, Doctors, My line ===== */
const PAGES = {};
const YL = () => `Jan–${MN[YP - 1]}`;
const repOpts = () => [['all', 'All reps']].concat(DIM.reps.map(r => [r.n, r.n]));
const lineOpts = () => [['all', 'All lines']].concat(DIM.lines.map(l => [l, l]));
function pageHead(t, s, right) { return `<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-end"><div><h1>${t}</h1><p class="sub">${s || ''}</p></div><div class="noprint">${right || ''}</div></div>`; }
const mineTog = () => `<button class="chip ${UI.mineFirst ? 'on mine' : ''}" data-do="minetog">⭐ My line first</button>`;
function repLabel(r) { return r === ME.rep ? `<b>${esc(r)}</b> ${pill('me', 'me')}` : esc(r); }

/* ---------- shared row builders ---------- */
function drugRows(fl) {
  const g = {};
  filtF(fl).forEach(x => { const k = x.r + '|' + x.p; const o = g[k] = g[k] || { r: x.r, p: x.p, ln: x.ln, y26: 0, y25: 0, q425: 0, tY: 0, tF: 0, q4b: 0 }; o.y26 += x.y26; o.y25 += x.y25; o.q425 += x.q425; });
  budOf(fl).forEach(b => { const k = b.r + '|' + b.p; const o = g[k] = g[k] || { r: b.r, p: b.p, ln: b.ln, y26: 0, y25: 0, q425: 0, tY: 0, tF: 0, q4b: 0 }; o.tY += b.tY; o.tF += b.fy; o.q4b += b.q4; });
  const fcm = {}; FC.forEach(x => { const k = x.rep + '|' + x.pid; (fcm[k] = fcm[k] || { u: 0, v: 0 }); fcm[k].u += x.uT; fcm[k].v += x.vT; });
  const fbm = {}; FB.forEach(x => fbm[x.rep + '|' + x.pid] = x.bT);
  const q = (fl.q || '').toLowerCase();
  return Object.values(g).map(o => {
    const pid = DIM.prods[o.p].id, rn = repName(o.r), f = fcm[rn + '|' + pid] || { u: 0, v: 0 };
    return Object.assign(o, { _k: o.r + '|' + o.p, pid, rep: rn, line: DIM.lines[o.ln], name: prodName(pid), grp: pgrp(pid), cat: pcat(pid), ach: div(o.y26, o.tY), yoy: o.y25 > 0 ? o.y26 / o.y25 - 1 : null, fu: f.u, fv: f.v, fb: fbm[rn + '|' + pid] || 0, mine: rn === ME.rep, out: div(o.y26 + f.v, o.tF) });
  }).filter(o => (o.y26 || o.y25 || o.tF || o.fv) && (!q || (o.name + ' ' + o.rep + ' ' + o.grp).toLowerCase().includes(q)));
}
function acctRows(fl) {
  const g = {};
  filtF(fl).forEach(x => { const k = x.c + '|' + x.r; const o = g[k] = g[k] || { c: x.c, r: x.r, y26: 0, y25: 0, tY: 0, tF: 0, q425: 0 }; o.y26 += x.y26; o.y25 += x.y25; o.tY += x.tY; o.tF += x.tF; o.q425 += x.q425; });
  const fcm = {}; FC.forEach(x => { const k = x.cid + '|' + x.rep; (fcm[k] = fcm[k] || { u: 0, v: 0 }); fcm[k].u += x.uT; fcm[k].v += x.vT; });
  const q = (fl.q || '').toLowerCase(); const rt = {}; Object.values(g).forEach(o => rt[o.r] = (rt[o.r] || 0) + o.y26);
  return Object.values(g).map(o => { const cd = DIM.custs[o.c], rn = repName(o.r), f = fcm[cd.id + '|' + rn] || { u: 0, v: 0 };
    return Object.assign(o, { _k: o.c + '|' + o.r, cid: cd.id, name: cd.n, nat: cd.nat, sub: cd.sub, st: cd.st, rep: rn, ach: div(o.y26, o.tY), yoy: o.y25 > 0 ? o.y26 / o.y25 - 1 : null, fu: f.u, fv: f.v, share: div(o.y26, rt[o.r]), mine: rn === ME.rep }); })
    .filter(o => (o.y26 || o.y25 || o.tF || o.fv) && (!q || (o.name + ' ' + o.rep).toLowerCase().includes(q)));
}
const COL = {
  rep: { k: 'rep', l: 'Rep', tl: 1, h: r => repLabel(r.rep), v: r => r.rep },
  line: { k: 'line', l: 'Line', tl: 1, h: r => esc(r.line), v: r => r.line },
  name: { k: 'name', l: 'Drug', tl: 1, h: r => `<b>${esc(r.name)}</b>`, v: r => r.name, w: 1 },
  y26: { k: 'y26', l: `Sales ${YL()}`, h: r => fmt(r.y26), v: r => r.y26 },
  tY: { k: 'tY', l: `Target ${YL()}`, h: r => fmt(r.tY), v: r => r.tY },
  ach: { k: 'ach', l: 'Achieved', h: r => achCell(r.ach), v: r => r.ach },
  gap: { k: 'gap', l: 'Gap to target', h: r => r.tY ? `<span class="${r.y26 - r.tY >= 0 ? 'up' : 'dn'}">${sgn(r.y26 - r.tY)}</span>` : '—', v: r => r.tY ? r.y26 - r.tY : null },
  y25: { k: 'y25', l: `Same period 2025`, h: r => fmt(r.y25), v: r => r.y25 },
  yoy: { k: 'yoy', l: 'YoY', h: r => yoyCell(r.yoy), v: r => r.yoy },
  tF: { k: 'tF', l: 'Full-year target', h: r => fmt(r.tF), v: r => r.tF },
  q425: { k: 'q425', l: 'Q4 2025 actual', h: r => fmt(r.q425), v: r => r.q425 },
  fv: { k: 'fv', l: 'Q4 forecast (SAR)', h: r => fmt(r.fv), v: r => r.fv },
  out: { k: 'out', l: 'Year outlook', h: r => achCell(r.out), v: r => r.out }
};
function totalRow(rows, extra) { const t = { _tot: 1, name: 'Total', rep: '', line: '', y26: sum(rows.map(r => r.y26)), y25: sum(rows.map(r => r.y25)), tY: sum(rows.map(r => r.tY)), tF: sum(rows.map(r => r.tF)), q425: sum(rows.map(r => r.q425)), fv: sum(rows.map(r => r.fv || 0)), fu: sum(rows.map(r => r.fu || 0)) }; t.ach = div(t.y26, t.tY); t.yoy = t.y25 > 0 ? t.y26 / t.y25 - 1 : null; t.out = div(t.y26 + t.fv, t.tF); return Object.assign(t, extra || {}); }

/* ---------- OVERVIEW ---------- */
PAGES.home = function () {
  const me = totals({ rep: ME.rep }), mf = fcTotals({ rep: ME.rep }), all = totals({}), af = fcTotals({});
  let H = pageHead('Overview', `Riyadh R1 · sales ${YL()} 2026 · forecast Oct–Dec · everything below updates when you load new sheets`);
  const need = me.tF - me.y26, perMonth = need / (12 - YP), out = me.y26 + mf.v;
  H += `<div class="card mine"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h2>⭐ ${ME.label} · ${ME.rep}</h2><button class="btn sec sm" data-go="mine">Open my line</button></div>
  <div class="grid g5">${kpi(fmt(me.y26), `Sales ${YL()}`, `${pcs(me.yoy)} vs 2025`, 'mine')}${kpi(pc(me.ach), 'of YTD target', `target ${fmt(me.tY)}`, 'mine')}${kpi(fmt(mf.v), 'Q4 forecast (SAR)', `${pc(div(mf.v, mf.bud))} of Q4 budget`, 'mine')}${kpi(pc(div(out, me.tF)), 'Year outlook', `YTD + forecast vs ${fmt(me.tF)}`, 'mine')}${kpi(fmt(Math.max(0, need)), 'Still to sell this year', `${fmt(Math.max(0, perMonth))} a month for ${12 - YP} months`, 'mine')}</div></div>`;
  H += `<div class="grid g4" style="margin-bottom:12px">${kpi(fmt(all.y26), `Region sales ${YL()}`, `${pcs(all.yoy)} vs 2025`)}${kpi(pc(all.ach), 'Region vs YTD target', `target ${fmt(all.tY)}`)}${kpi(fmt(af.v), 'Region Q4 forecast', `${pc(div(af.v, af.bud))} of budget`)}${kpi(fmt(all.tF), 'Region full-year target')}</div>`;
  const lr = DIM.lines.map(l => { const t = totals({ line: l }), f = fcTotals({ line: l }); return { _k: l, line: l, rep: DIM.reps.filter(r => r.line === l).map(r => r.n).join(', '), y26: t.y26, y25: t.y25, tY: t.tY, tF: t.tF, q425: t.q425, ach: t.ach, yoy: t.yoy, fv: f.v, out: div(t.y26 + f.v, t.tF), mine: l === ME.line, share: div(t.y26, all.y26) }; }).filter(r => r.y26 || r.tF);
  H += `<div class="card"><h2>Lines</h2>${table('t_lines_home', [Object.assign({}, COL.line, { h: r => r.mine ? `<b>${esc(r.line)}</b> ${pill('my line', 'me')}` : esc(r.line) }), { k: 'rep', l: 'Reps', tl: 1, v: r => r.rep, w: 1 }, COL.y26, COL.tY, COL.ach, COL.gap, COL.y25, COL.yoy, { k: 'share', l: 'Share of region', h: r => pc(r.share), v: r => r.share }, COL.tF, COL.fv, COL.out], lr.concat([totalRow(lr, { line: 'Region', rep: '' })]), { sort: 'y26', title: 'Lines' })}</div>`;
  const rr = DIM.reps.map(r => { const t = totals({ rep: r.n }), f = fcTotals({ rep: r.n }); return { _k: r.n, rep: r.n, line: r.line, y26: t.y26, y25: t.y25, tY: t.tY, tF: t.tF, q425: t.q425, ach: t.ach, yoy: t.yoy, fv: f.v, out: div(t.y26 + f.v, t.tF), mine: r.n === ME.rep }; }).filter(r => r.y26 || r.tF);
  H += `<div class="card"><h2>Reps</h2>${table('t_reps_home', [COL.rep, COL.line, COL.y26, COL.tY, COL.ach, COL.gap, COL.yoy, COL.tF, COL.fv, COL.out], rr.concat([totalRow(rr, { rep: 'Region' })]), { sort: 'y26', title: 'Reps' })}</div>`;
  const sel = UI.homeLine || 'all'; UI.homeLine = sel; const tt = totals({ line: sel });
  H += `<div class="card"><h2>Monthly trend</h2>${chips([['all', 'All lines']].concat(DIM.lines.map(l => [l, l])), sel, 'homeLine', ME.line)}${svgMonthly([{ n: '2025', v: tt.b.map(v => v || null), c: '#94a3b8' }, { n: 'Target', v: tt.tm.map(v => v || null), c: '#d97706', dash: 1 }, { n: '2026', v: tt.a.map((v, i) => i < YP ? v : null), c: 'var(--brand)', bar: 1 }])}</div>`;
  return H;
};

/* ---------- LINES ---------- */
PAGES.lines = function () {
  const U = UI.lines; const fl = { line: U.line, rep: U.rep, cat: U.cat, q: U.q };
  let H = pageHead('Lines', 'Every line, rep and drug with sales, target and achievement. Filter by line, rep or category.', mineTog());
  H += `<div class="lab">Line</div>${chips(lineOpts(), U.line, 'lines.line', ME.line)}<div class="lab">Rep</div>${chips(repOpts(), U.rep, 'lines.rep', ME.rep)}<div class="lab">Category</div>${chips([['all', 'All'], ['GIT', 'GIT'], ['General', 'General'], ['Pain and Inflammation', 'Pain']], U.cat, 'lines.cat')}<div class="chips">${search('lines.q', 'Search drug or rep')}</div>`;
  const rows = drugRows(fl), t = totals(fl), f = fcTotals({ line: U.line, rep: U.rep });
  H += `<div class="grid g5" style="margin-bottom:12px">${kpi(fmt(t.y26), `Sales ${YL()}`, `${pcs(t.yoy)} vs 2025`)}${kpi(fmt(t.tY), 'YTD target')}${kpi(pc(t.ach), 'Achieved', `gap ${sgn(t.y26 - t.tY)}`)}${kpi(fmt(t.tF), 'Full-year target')}${kpi(fmt(f.v), 'Q4 forecast', `${pc(div(f.v, f.bud))} of Q4 budget`)}</div>`;
  H += chips([['prod', 'By drug × rep'], ['rep', 'By rep'], ['line', 'By line']], U.by, 'lines.by');
  if (U.by === 'prod') {
    H += `<div class="card"><h2>Drugs by rep</h2>${table('t_drugs', [COL.name, COL.rep, COL.line, COL.y26, COL.tY, COL.ach, COL.gap, COL.y25, COL.yoy, COL.tF, { k: 'pf', l: '% of full year', h: r => pc(div(r.y26, r.tF)), v: r => div(r.y26, r.tF) }, COL.q425, COL.fv, COL.out], rows.concat([totalRow(rows)]), { sort: 'y26', click: 'drug', title: 'Drugs by rep' })}<div class="note">Tap a row to see the accounts behind it. Targets are the company rep × drug targets. Year outlook = sales ${YL()} plus the Q4 forecast, against the full-year target.</div></div>`;
  } else {
    const key = U.by === 'rep' ? 'rep' : 'line', g = {};
    rows.forEach(r => { const o = g[r[key]] = g[r[key]] || { _k: r[key], rep: r.rep, line: r.line, name: r[key], y26: 0, y25: 0, tY: 0, tF: 0, q425: 0, fv: 0, drugs: 0, mine: false }; ['y26', 'y25', 'tY', 'tF', 'q425', 'fv'].forEach(k => o[k] += r[k]); o.drugs++; o.mine = o.mine || (key === 'rep' ? r.rep === ME.rep : r.line === ME.line); if (key === 'line') o.rep = ''; if (key === 'rep') o.line = r.line; });
    const rr = Object.values(g).map(o => Object.assign(o, { ach: div(o.y26, o.tY), yoy: o.y25 > 0 ? o.y26 / o.y25 - 1 : null, out: div(o.y26 + o.fv, o.tF) }));
    H += `<div class="card"><h2>${U.by === 'rep' ? 'Reps' : 'Lines'}</h2>${table('t_grp', [U.by === 'rep' ? COL.rep : COL.line, U.by === 'rep' ? COL.line : { k: 'dr', l: 'Reps', tl: 1, h: r => esc(DIM.reps.filter(x => x.line === r.name).map(x => x.n).join(', ')), v: r => r.name }, { k: 'drugs', l: 'Drugs', h: r => r.drugs, v: r => r.drugs }, COL.y26, COL.tY, COL.ach, COL.gap, COL.y25, COL.yoy, COL.tF, COL.q425, COL.fv, COL.out], rr.concat([totalRow(rr)]), { sort: 'y26', title: 'Group' })}</div>`;
  }
  return H;
};
function drugModal(k) {
  const [r, p] = k.split('|').map(Number); const rows = F.filter(x => x.r === r && x.p === p).sort((a, b) => b.y26 - a.y26);
  const a = monthsOf(rows, 'a'), b = monthsOf(rows, 'b'); const bd = BUD.find(x => x.r === r && x.p === p);
  const tot = { y26: sum(rows.map(x => x.y26)), tY: bd ? bd.tY : 0 };
  modal(`${esc(prodName(DIM.prods[p].id))} · ${esc(repName(r))}`, `<div class="grid g4" style="margin-bottom:10px">${kpi(fmt(tot.y26), `Sales ${YL()}`)}${kpi(fmt(tot.tY), 'YTD target')}${kpi(pc(div(tot.y26, tot.tY)), 'Achieved')}${kpi(rows.length, 'Accounts')}</div>${svgMonthly([{ n: '2025', v: b.map(v => v || null), c: '#94a3b8' }, bd ? { n: 'Target', v: bd.t.map(v => v || null), c: '#d97706', dash: 1 } : { n: '', v: [], c: '#fff' }, { n: '2026', v: a.map((v, i) => i < YP ? v : null), c: 'var(--brand)', bar: 1 }])}` +
    table('t_drug_acc', [{ k: 'name', l: 'Account', tl: 1, h: r => esc(DIM.custs[r.c].n), v: r => DIM.custs[r.c].n }, { k: 'nat', l: 'Type', tl: 1, h: r => esc(DIM.custs[r.c].nat), v: r => DIM.custs[r.c].nat }, { k: 'y26', l: `Sales ${YL()}`, h: r => fmt(r.y26), v: r => r.y26 }, { k: 'tY', l: 'Target', h: r => fmt(r.tY), v: r => r.tY }, { k: 'ach', l: 'Achieved', h: r => achCell(div(r.y26, r.tY)), v: r => div(r.y26, r.tY) }, { k: 'y25', l: '2025', h: r => fmt(r.y25), v: r => r.y25 }, { k: 'yoy', l: 'YoY', h: r => yoyCell(r.y25 > 0 ? r.y26 / r.y25 - 1 : null), v: r => r.y25 > 0 ? r.y26 / r.y25 - 1 : null }], rows, { sort: 'y26', noMine: 1, title: 'Drug accounts' }));
}

/* ---------- AREAS ---------- */
PAGES.areas = function () {
  const U = UI.areas; const fl = { rep: U.rep, nat: U.nat, line: U.line, q: U.q };
  const reps = DIM.reps.filter(r => F.some(x => x.r === repIx[r.n] && x.y26 !== 0)).map(r => [r.n, r.n]);
  let H = pageHead('Areas · accounts by rep', 'Each rep\'s accounts with sales, target and achievement. Tap an account for its drugs and months.', mineTog());
  H += `<div class="lab">Rep</div>${chips([['all', 'All reps']].concat(reps), U.rep, 'areas.rep', ME.rep)}<div class="lab">Customer type</div>${chips([['all', 'All'], ['1 - PVT', 'Private'], ['2 - CHAIN', 'Chains'], ['3 - SUBAGENT', 'Sub-agents']], U.nat, 'areas.nat')}<div class="chips">${search('areas.q', 'Search account')}</div>`;
  const rows = acctRows(fl), tot = totalRow(rows, { name: 'Total' });
  H += `<div class="grid g4" style="margin-bottom:12px">${kpi(rows.length, 'Accounts')}${kpi(fmt(tot.y26), `Sales ${YL()}`, `${pcs(tot.yoy)} vs 2025`)}${kpi(pc(tot.ach), 'of account targets', `target ${fmt(tot.tY)}`)}${kpi(fmt(tot.fv), 'Q4 forecast (SAR)')}</div>`;
  // rep x customer type matrix
  const nats = [['1 - PVT', 'Private'], ['2 - CHAIN', 'Chains'], ['3 - SUBAGENT', 'Sub-agents']];
  const mx = DIM.reps.map(r => { const rs = F.filter(x => x.r === repIx[r.n]); if (!rs.some(x => x.y26)) return null; const o = { _k: r.n, rep: r.n, mine: r.n === ME.rep, tot: sum(rs.map(x => x.y26)), acc: new Set(rs.filter(x => x.y26).map(x => x.c)).size }; nats.forEach(n => o[n[0]] = sum(rs.filter(x => DIM.custs[x.c].nat === n[0]).map(x => x.y26))); return o; }).filter(Boolean);
  H += `<div class="card"><h2>Rep × customer type</h2>${table('t_repnat', [COL.rep, { k: 'acc', l: 'Active accounts', h: r => r.acc, v: r => r.acc }].concat(nats.map(n => ({ k: n[0], l: n[1], h: r => fmt(r[n[0]]) + ` <span class="mut">${pc(div(r[n[0]], r.tot))}</span>`, v: r => r[n[0]] }))).concat([{ k: 'tot', l: `Total ${YL()}`, h: r => `<b>${fmt(r.tot)}</b>`, v: r => r.tot }]), mx, { sort: 'tot', title: 'Rep by type' })}</div>`;
  H += `<div class="card"><h2>Accounts</h2>${table('t_accts', [{ k: 'name', l: 'Account', tl: 1, h: r => `<bdi><b>${esc(r.name)}</b></bdi>`, v: r => r.name, w: 1 }, COL.rep, { k: 'nat', l: 'Type', tl: 1, h: r => esc(r.nat), v: r => r.nat }, COL.y26, COL.tY, COL.ach, COL.gap, COL.y25, COL.yoy, { k: 'share', l: 'Share of rep', h: r => pc(r.share), v: r => r.share }, COL.tF, COL.fv], rows.concat([tot]), { sort: 'y26', click: 'acct', title: 'Accounts', limit: 300 })}</div>`;
  return H;
};
function acctModal(k) {
  const [c, r] = k.split('|').map(Number); const rows = F.filter(x => x.c === c && x.r === r).sort((a, b) => b.y26 - a.y26); const a = monthsOf(rows, 'a'), b = monthsOf(rows, 'b'), t = monthsOf(rows, 't');
  const fcr = FC.filter(x => x.cid === DIM.custs[c].id && x.rep === repName(r));
  modal(`<bdi>${esc(DIM.custs[c].n)}</bdi> · ${esc(repName(r))}`, `<div class="grid g4" style="margin-bottom:10px">${kpi(fmt(sum(a, 0, YP)), `Sales ${YL()}`, `${pcs(sum(b, 0, YP) > 0 ? sum(a, 0, YP) / sum(b, 0, YP) - 1 : null)} vs 2025`)}${kpi(fmt(sum(t, 0, YP)), 'YTD target')}${kpi(pc(div(sum(a, 0, YP), sum(t, 0, YP))), 'Achieved')}${kpi(fmt(sum(fcr.map(x => x.vT))), 'Q4 forecast (SAR)', fmt(sum(fcr.map(x => x.uT))) + ' boxes')}</div>${svgMonthly([{ n: '2025', v: b.map(v => v || null), c: '#94a3b8' }, { n: 'Target', v: t.map(v => v || null), c: '#d97706', dash: 1 }, { n: '2026', v: a.map((v, i) => i < YP ? v : null), c: 'var(--brand)', bar: 1 }])}` +
    table('t_acct_drugs', [{ k: 'n', l: 'Drug', tl: 1, h: x => `<b>${esc(prodName(DIM.prods[x.p].id))}</b>`, v: x => prodName(DIM.prods[x.p].id), w: 1 }, { k: 'y26', l: `Sales ${YL()}`, h: x => fmt(x.y26), v: x => x.y26 }, { k: 'tY', l: 'Target', h: x => fmt(x.tY), v: x => x.tY }, { k: 'ach', l: 'Achieved', h: x => achCell(div(x.y26, x.tY)), v: x => div(x.y26, x.tY) }, { k: 'y25', l: '2025', h: x => fmt(x.y25), v: x => x.y25 }, { k: 'yoy', l: 'YoY', h: x => yoyCell(x.y25 > 0 ? x.y26 / x.y25 - 1 : null), v: x => x.y25 > 0 ? x.y26 / x.y25 - 1 : null }, { k: 'fc', l: 'Q4 forecast (boxes)', h: x => fmt(sum(fcr.filter(f => f.pid === DIM.prods[x.p].id).map(f => f.uT))), v: x => sum(fcr.filter(f => f.pid === DIM.prods[x.p].id).map(f => f.uT)) }], rows, { sort: 'y26', noMine: 1, title: 'Account drugs' }));
}

/* ---------- FORECAST ---------- */
PAGES.forecast = function () {
  const U = UI.fc; const fl = { rep: U.rep, line: U.line };
  const q = (U.q || '').toLowerCase();
  let H = pageHead('Forecast · Q4', 'Forecast per drug and per rep from the Q4 per-item file, against the Q4 budget, last Q4 and the year target.', mineTog());
  H += `<div class="lab">Line</div>${chips(lineOpts(), U.line, 'fc.line', ME.line)}<div class="lab">Rep</div>${chips(repOpts(), U.rep, 'fc.rep', ME.rep)}<div class="chips">${search('fc.q', 'Search drug or account')}</div>`;
  const rows = FC.filter(x => (U.rep === 'all' || x.rep === U.rep) && (U.line === 'all' || lineOfRep(x.rep) === U.line) && (!q || (prodName(x.pid) + ' ' + custName(x.cid) + ' ' + x.rep).toLowerCase().includes(q)));
  const T = fcTotals(fl), t = totals({ rep: U.rep, line: U.line });
  const q425 = t.q425, bud = T.bud;
  H += `<div class="grid g5" style="margin-bottom:12px">${kpi(fmt(sum(rows.map(r => r.uT))), 'Q4 forecast (boxes)', MN.slice(9).map((m, i) => `${m} ${fmt(sum(rows.map(r => r.u[i])))}`).join(' · '))}${kpi(fmt(sum(rows.map(r => r.vT))), 'Q4 forecast (SAR)')}${kpi(fmt(bud), 'Q4 budget (SAR)', pc(div(sum(rows.map(r => r.vT)), bud)) + ' forecast vs budget')}${kpi(fmt(q425), 'Q4 2025 actual (SAR)', 'forecast is ' + (q425 > 0 ? (sum(rows.map(r => r.vT)) / q425).toFixed(1) + '×' : '—'))}${kpi(pc(div(t.y26 + sum(rows.map(r => r.vT)), t.tF)), 'Year outlook', `YTD ${fmt(t.y26)} + forecast vs ${fmt(t.tF)}`)}</div>`;
  H += chips([['prod', 'By drug × rep'], ['rep', 'By rep'], ['acct', 'By account']], U.view, 'fc.view');
  const q4a = {}; F.forEach(x => { const k = x.r + '|' + DIM.prods[x.p].id; q4a[k] = (q4a[k] || 0) + x.q425; });
  const fbm = {}; FB.forEach(x => fbm[x.rep + '|' + x.pid] = x.bT);
  if (U.view === 'prod') {
    const g = {}; rows.forEach(x => { const k = x.rep + '|' + x.pid; const o = g[k] = g[k] || { _k: k, rep: x.rep, pid: x.pid, name: prodName(x.pid), line: lineOfRep(x.rep), u: [0, 0, 0], v: 0, accts: 0, mine: x.rep === ME.rep }; x.u.forEach((v, i) => o.u[i] += v); o.v += x.vT; o.accts++; });
    const rr = Object.values(g).map(o => Object.assign(o, { uT: sum(o.u), bud: fbm[o.rep + '|' + o.pid] || 0, q425: q4a[repIx[o.rep] + '|' + o.pid] || 0 })).map(o => Object.assign(o, { vb: div(o.v, o.bud), vl: o.q425 > 0 ? o.v / o.q425 : null }));
    const tot = { _tot: 1, name: 'Total', rep: '', line: '', u: [0, 1, 2].map(i => sum(rr.map(r => r.u[i]))), uT: sum(rr.map(r => r.uT)), v: sum(rr.map(r => r.v)), bud: sum(rr.map(r => r.bud)), q425: sum(rr.map(r => r.q425)), accts: '' }; tot.vb = div(tot.v, tot.bud); tot.vl = tot.q425 > 0 ? tot.v / tot.q425 : null;
    H += `<div class="card"><h2>Forecast by drug and rep</h2>${table('t_fc_prod', [COL.name, COL.rep, COL.line].concat([0, 1, 2].map(i => ({ k: 'u' + i, l: MN[9 + i] + ' boxes', h: r => fmt(r.u[i]), v: r => r.u[i] }))).concat([{ k: 'uT', l: 'Q4 boxes', h: r => `<b>${fmt(r.uT)}</b>`, v: r => r.uT }, { k: 'v', l: 'Q4 SAR', h: r => `<b>${fmt(r.v)}</b>`, v: r => r.v }, { k: 'bud', l: 'Q4 budget SAR', h: r => fmt(r.bud), v: r => r.bud }, { k: 'vb', l: 'Forecast vs budget', h: r => r.vb == null ? '—' : `<span class="${r.vb >= 1 ? 'up' : r.vb >= .8 ? 'warn' : 'dn'}">${pc(r.vb)}</span>`, v: r => r.vb }, { k: 'q425', l: 'Q4 2025 actual SAR', h: r => fmt(r.q425), v: r => r.q425 }, { k: 'vl', l: 'vs last Q4', h: r => r.vl == null ? '—' : r.vl.toFixed(1) + '×', v: r => r.vl }, { k: 'accts', l: 'Accounts', h: r => r.accts, v: r => r.accts }]), rr.concat([tot]), { sort: 'v', title: 'Forecast by drug and rep' })}</div>`;
  } else if (U.view === 'rep') {
    const g = {}; rows.forEach(x => { const o = g[x.rep] = g[x.rep] || { _k: x.rep, rep: x.rep, line: lineOfRep(x.rep), uT: 0, v: 0, drugs: new Set(), accts: new Set(), mine: x.rep === ME.rep }; o.uT += x.uT; o.v += x.vT; o.drugs.add(x.pid); o.accts.add(x.cid); });
    const rr = Object.values(g).map(o => { const t2 = totals({ rep: o.rep }), b2 = sum(FB.filter(x => x.rep === o.rep).map(x => x.bT)); return Object.assign(o, { drugs: o.drugs.size, accts: o.accts.size, y26: t2.y26, tF: t2.tF, bud: b2, vb: div(o.v, b2), out: div(t2.y26 + o.v, t2.tF), need: Math.max(0, t2.tF - t2.y26), cover: div(o.v, Math.max(0, t2.tF - t2.y26)) }); });
    H += `<div class="card"><h2>Forecast by rep — does it close the year?</h2>${table('t_fc_rep', [COL.rep, COL.line, { k: 'y26', l: `Sales ${YL()}`, h: r => fmt(r.y26), v: r => r.y26 }, { k: 'tF', l: 'Full-year target', h: r => fmt(r.tF), v: r => r.tF }, { k: 'need', l: 'Still to sell', h: r => fmt(r.need), v: r => r.need }, { k: 'uT', l: 'Q4 boxes', h: r => fmt(r.uT), v: r => r.uT }, { k: 'v', l: 'Q4 forecast SAR', h: r => `<b>${fmt(r.v)}</b>`, v: r => r.v }, { k: 'cover', l: 'Forecast ÷ still to sell', h: r => r.cover == null ? '—' : `<span class="${r.cover >= 1 ? 'up' : r.cover >= .8 ? 'warn' : 'dn'}">${pc(r.cover)}</span>`, v: r => r.cover }, { k: 'bud', l: 'Q4 budget SAR', h: r => fmt(r.bud), v: r => r.bud }, { k: 'vb', l: 'vs Q4 budget', h: r => pc(r.vb), v: r => r.vb }, { k: 'out', l: 'Year outlook', h: r => achCell(r.out), v: r => r.out }, { k: 'drugs', l: 'Drugs', h: r => r.drugs, v: r => r.drugs }, { k: 'accts', l: 'Accounts', h: r => r.accts, v: r => r.accts }], rr, { sort: 'v', title: 'Forecast by rep' })}<div class="note">Year outlook = sales ${YL()} + Q4 forecast value, against the full-year target. "Forecast ÷ still to sell" shows how much of the remaining gap the forecast covers.</div></div>`;
  } else {
    const st = {}; (DB.fstat || []).forEach(s => st[s.id] = s);
    const g = {}; rows.forEach(x => { const k = x.cid + '|' + x.rep; const o = g[k] = g[k] || { _k: k, cid: x.cid, name: custName(x.cid), rep: x.rep, u: [0, 0, 0], v: 0, drugs: 0, mine: x.rep === ME.rep }; x.u.forEach((v, i) => o.u[i] += v); o.v += x.vT; o.drugs++; });
    const rr = Object.values(g).map(o => Object.assign(o, { uT: sum(o.u), s: st[o.cid] }));
    H += `<div class="card"><h2>Forecast by account</h2>${table('t_fc_acct', [{ k: 'name', l: 'Account', tl: 1, h: r => `<bdi><b>${esc(r.name)}</b></bdi>`, v: r => r.name, w: 1 }, COL.rep].concat([0, 1, 2].map(i => ({ k: 'u' + i, l: MN[9 + i], h: r => fmt(r.u[i]), v: r => r.u[i] }))).concat([{ k: 'uT', l: 'Q4 boxes', h: r => `<b>${fmt(r.uT)}</b>`, v: r => r.uT }, { k: 'v', l: 'Q4 SAR', h: r => fmt(r.v), v: r => r.v }, { k: 'drugs', l: 'Drugs', h: r => r.drugs, v: r => r.drugs }, { k: 's', l: 'Status in file', tl: 1, h: r => r.s ? `${r.s.st === 'NO' ? pill('NO', 'bad') : r.s.st === 'OK' ? pill('OK', 'ok') : ''} ${/payment/i.test(r.s.txt) ? pill('Payment issue', 'warn') : ''} ${r.s.amt ? '<b>' + fmt(r.s.amt) + '</b> ' : ''}${esc(r.s.txt && !/^payment issue$/i.test(r.s.txt) ? r.s.txt : '')}` : '<span class="mut">—</span>', v: r => r.s ? r.s.st : '', w: 1 }]), rr, { sort: 'v', click: 'fcacct', title: 'Forecast by account', limit: 300 })}<div class="note">Status comes from the status table that sits beside the pivot in the forecast file (OK / NO, payment issues, expected amounts).</div></div>`;
  }
  return H;
};
function fcAcctModal(k) {
  const [cid, rep] = k.split('|'); const rows = FC.filter(x => x.cid === cid && x.rep === rep);
  modal(`<bdi>${esc(custName(cid))}</bdi> · ${esc(rep)}`, table('t_fc_acct_d', [{ k: 'n', l: 'Drug', tl: 1, h: x => `<b>${esc(prodName(x.pid))}</b>`, v: x => prodName(x.pid), w: 1 }].concat([0, 1, 2].map(i => ({ k: 'u' + i, l: MN[9 + i], h: x => fmt(x.u[i]), v: x => x.u[i] }))).concat([{ k: 'uT', l: 'Q4 boxes', h: x => fmt(x.uT), v: x => x.uT }, { k: 'pr', l: 'Net price', h: x => x.pr ? x.pr.toFixed(2) : '—', v: x => x.pr }, { k: 'vT', l: 'Q4 SAR', h: x => fmt(x.vT), v: x => x.vT }]), rows, { sort: 'vT', noMine: 1, title: 'Account forecast' }));
}

/* ---------- DOCTORS ---------- */
PAGES.doctors = function () {
  const D = DB.docs || [], U = UI.doc; const q = (U.q || '').toLowerCase();
  const hs = [...new Set(D.map(d => d.h))];
  let H = pageHead('Doctors', `${D.length} doctors in territory ${esc((D[0] || {}).t || '')} (${ME.rep}) split by place, class and specialty. Other reps' doctor lists are not in the files yet.`);
  if (!D.length) return H + `<div class="card empty">No HQ tracker loaded. Drop the HQ tracker file in Update.</div>`;
  const rows = D.filter(d => (U.h === 'all' || d.h === U.h) && (U.cls === 'all' || d.cls === U.cls) && (U.st === 'all' || d.st === U.st) && (U.sp === 'all' || d.sp === U.sp) && (!q || (d.d + ' ' + d.h + ' ' + d.sp).toLowerCase().includes(q)));
  const tot = { n: rows.length, g: sum(rows.map(d => d.g)), a: sum(rows.map(d => d.a)), A: rows.filter(d => d.cls === 'A').length, unseen: rows.filter(d => d.a === 0).length, aUnseen: rows.filter(d => d.cls === 'A' && d.a === 0).length };
  H += `<div class="grid g5" style="margin-bottom:12px">${kpi(tot.n, 'Doctors', `${tot.A} class A`)}${kpi(fmt(tot.g), 'HQ goal (visits)')}${kpi(fmt(tot.a), 'Visits done', pc(div(tot.a, tot.g)) + ' attained')}${kpi(fmt(Math.max(0, tot.g - tot.a)), 'Visits remaining')}${kpi(tot.aUnseen, 'Class A not visited', `${tot.unseen} doctors with no visit`, tot.aUnseen ? 'mine' : '')}</div>`;
  H += `<div class="lab">Place</div>${chips([['all', 'All places']].concat(hs.map(h => [h, h])), U.h, 'doc.h')}<div class="lab">Class</div>${chips([['all', 'All'], ['A', 'A'], ['B', 'B'], ['C', 'C']], U.cls, 'doc.cls')}<div class="lab">Status</div>${chips([['all', 'All']].concat([...new Set(D.map(d => d.st))].map(s => [s, s])), U.st, 'doc.st')}<div class="chips">${search('doc.q', 'Search doctor, place or specialty')}</div>`;
  const hg = {}; D.filter(d => (U.cls === 'all' || d.cls === U.cls)).forEach(d => { const o = hg[d.h] = hg[d.h] || { _k: d.h, h: d.h, n: 0, A: 0, B: 0, g: 0, a: 0, seen: 0 }; o.n++; if (d.cls === 'A') o.A++; if (d.cls === 'B') o.B++; o.g += d.g; o.a += d.a; if (d.a > 0) o.seen++; });
  const hr = Object.values(hg).map(o => Object.assign(o, { att: div(o.a, o.g), rem: Math.max(0, o.g - o.a), cov: div(o.seen, o.n) }));
  H += `<div class="card"><h2>By place</h2>${table('t_docplace', [{ k: 'h', l: 'Place', tl: 1, h: r => `<b>${esc(r.h)}</b>`, v: r => r.h, w: 1 }, { k: 'n', l: 'Doctors', h: r => r.n, v: r => r.n }, { k: 'A', l: 'Class A', h: r => r.A, v: r => r.A }, { k: 'B', l: 'Class B', h: r => r.B, v: r => r.B }, { k: 'g', l: 'HQ goal', h: r => r.g, v: r => r.g }, { k: 'a', l: 'Done', h: r => r.a, v: r => r.a }, { k: 'att', l: 'Attained', h: r => achCell(r.att), v: r => r.att }, { k: 'rem', l: 'Remaining', h: r => r.rem, v: r => r.rem }, { k: 'cov', l: 'Doctors seen', h: r => pc(r.cov), v: r => r.cov }], hr.concat([{ _tot: 1, h: 'Total', n: sum(hr.map(r => r.n)), A: sum(hr.map(r => r.A)), B: sum(hr.map(r => r.B)), g: sum(hr.map(r => r.g)), a: sum(hr.map(r => r.a)), att: div(sum(hr.map(r => r.a)), sum(hr.map(r => r.g))), rem: sum(hr.map(r => r.rem)), cov: div(sum(hr.map(r => r.seen)), sum(hr.map(r => r.n))) }]), { sort: 'g', noMine: 1, click: 'docplace', title: 'Doctors by place' })}<div class="note">Tap a place to filter the doctor list.</div></div>`;
  const sp = {}; rows.forEach(d => { const o = sp[d.sp || '—'] = sp[d.sp || '—'] || { n: 0, g: 0, a: 0 }; o.n++; o.g += d.g; o.a += d.a; });
  H += `<div class="row2"><div class="card"><h2>By specialty</h2>${hbars(Object.keys(sp).sort((a, b) => sp[b].n - sp[a].n).slice(0, 12).map(k => ({ n: k, v: sp[k].n })), v => v + ' dr')}</div><div class="card"><h2>Class split</h2>${hbars(['A', 'B', 'C'].map(c => ({ n: 'Class ' + c, v: rows.filter(d => d.cls === c).length })).filter(x => x.v), v => v + ' dr')}<div class="note">Visits attained by class: ${['A', 'B', 'C'].map(c => { const r = rows.filter(d => d.cls === c); return r.length ? `${c} ${pc(div(sum(r.map(d => d.a)), sum(r.map(d => d.g))))}` : ''; }).filter(Boolean).join(' · ')}</div></div></div>`;
  H += `<div class="card"><h2>Doctor list (${rows.length})</h2>${table('t_docs', [{ k: 'd', l: 'Doctor', tl: 1, h: r => `<b>${esc(r.d)}</b>`, v: r => r.d }, { k: 'h', l: 'Place', tl: 1, h: r => esc(r.h), v: r => r.h, w: 1 }, { k: 'sp', l: 'Specialty', tl: 1, h: r => esc(r.sp), v: r => r.sp }, { k: 'cls', l: 'Class', h: r => pill(r.cls || '—', r.cls === 'A' ? 'bad' : r.cls === 'B' ? 'warn' : 'mut'), v: r => r.cls }, { k: 'g', l: 'Goal', h: r => r.g, v: r => r.g }, { k: 'a', l: 'Done', h: r => r.a, v: r => r.a }, { k: 'rem', l: 'Left', h: r => `<b class="${r.g - r.a > 0 ? 'dn' : 'up'}">${Math.max(0, r.g - r.a)}</b>`, v: r => r.g - r.a }, { k: 'st', l: 'Status', tl: 1, h: r => pill(r.st, r.st === 'Not visited' ? 'bad' : r.st === 'Remaining' ? 'warn' : 'ok'), v: r => r.st }, { k: 'pr', l: 'Priority', tl: 1, h: r => esc(r.pr), v: r => r.pr }, { k: 'days', l: 'Planned days', tl: 1, h: r => esc(r.days), v: r => r.days, w: 1 }], rows, { sort: 'rem', noMine: 1, title: 'Doctors', limit: 300 })}</div>`;
  return H;
};

/* ---------- MY LINE ---------- */
PAGES.mine = function () {
  const rep = ME.rep, t = totals({ rep }), f = fcTotals({ rep });
  const drugs = drugRows({ rep }).filter(r => r.y26 || r.tF || r.fv);
  const accts = acctRows({ rep });
  let H = pageHead(`⭐ ${ME.label}`, `${ME.rep} · everything about your line in one page, with the points that need action.`, `<button class="btn sec sm" onclick="window.print()">Print</button>`);
  const need = Math.max(0, t.tF - t.y26), out = t.y26 + f.v;
  H += `<div class="grid g5" style="margin-bottom:12px">${kpi(fmt(t.y26), `Sales ${YL()}`, `${pcs(t.yoy)} vs 2025`, 'mine')}${kpi(pc(t.ach), 'of YTD target', `${sgn(t.y26 - t.tY)} vs ${fmt(t.tY)}`, 'mine')}${kpi(fmt(need), 'Still to sell', `${fmt(need / (12 - YP))} a month`, 'mine')}${kpi(fmt(f.v), 'Q4 forecast', `${fmt(f.u)} boxes · ${pc(div(f.v, f.bud))} of budget`, 'mine')}${kpi(pc(div(out, t.tF)), 'Year outlook', `closes ${sgn(out - t.tF)} vs target`, 'mine')}</div>`;
  // highlights
  const hl = [];
  const beh = drugs.filter(r => r.tY > 0 && r.ach != null && r.ach < .8).sort((a, b) => (a.y26 - a.tY) - (b.y26 - b.tY)).slice(0, 3);
  if (beh.length) hl.push(['bad', `Furthest behind target: ${beh.map(r => `<b>${esc(r.name)}</b> ${pc(r.ach)} (${sgn(r.y26 - r.tY)})`).join(', ')}.`]);
  const ahead = drugs.filter(r => r.ach != null && r.ach >= 1 && r.tY > 0).sort((a, b) => (b.y26 - b.tY) - (a.y26 - a.tY)).slice(0, 3);
  if (ahead.length) hl.push(['ok', `Ahead of target: ${ahead.map(r => `<b>${esc(r.name)}</b> ${pc(r.ach)}`).join(', ')}.`]);
  const dn = accts.filter(a => a.y25 > 0 && a.y26 < a.y25 * .7).sort((a, b) => (a.y26 - a.y25) - (b.y26 - b.y25)).slice(0, 3);
  if (dn.length) hl.push(['warn', `Accounts falling vs 2025: ${dn.map(a => `<bdi><b>${esc(a.name)}</b></bdi> ${sgn(a.y26 - a.y25)}`).join(', ')}.`]);
  hl.push([out >= t.tF ? 'ok' : 'bad', `Sales ${YL()} plus the Q4 forecast reach <b>${pc(div(out, t.tF))}</b> of the full-year target (${fmt(out)} vs ${fmt(t.tF)}). The forecast covers ${pc(div(f.v, need))} of what is still to sell.`]);
  const dc = (DB.docs || []).filter(d => d.cls === 'A' && d.a === 0); if (dc.length) hl.push(['warn', `${dc.length} class A doctors have no visit yet. Most of them are in ${esc(topKey(dc, 'h'))}.`]);
  const sk = stockFlags(); if (sk.length) hl.push(['bad', `Stock: ${sk.slice(0, 4).map(s => `<b>${esc(s.n)}</b> ${esc(s.msg)}`).join(', ')}.`]);
  H += `<div class="card"><h2>Highlights</h2>${hl.map(h => `<div class="hl ${h[0]}">${h[1]}</div>`).join('')}</div>`;
  H += `<div class="card"><h2>My drugs</h2>${table('t_my_drugs', [COL.name, COL.y26, COL.tY, COL.ach, COL.gap, COL.y25, COL.yoy, COL.tF, COL.q425, COL.fv, COL.out], drugs.concat([totalRow(drugs)]), { sort: 'y26', click: 'drug', noMine: 1, title: 'My drugs' })}</div>`;
  H += `<div class="card"><h2>My top accounts</h2>${table('t_my_accts', [{ k: 'name', l: 'Account', tl: 1, h: r => `<bdi><b>${esc(r.name)}</b></bdi>`, v: r => r.name, w: 1 }, { k: 'nat', l: 'Type', tl: 1, h: r => esc(r.nat), v: r => r.nat }, COL.y26, COL.tY, COL.ach, COL.y25, COL.yoy, { k: 'share', l: 'Share', h: r => pc(r.share), v: r => r.share }, COL.fv], accts, { sort: 'y26', click: 'acct', noMine: 1, limit: 25, title: 'My accounts' })}</div>`;
  const D = DB.docs || [];
  if (D.length) { const hg = {}; D.forEach(d => { const o = hg[d.h] = hg[d.h] || { h: d.h, n: 0, g: 0, a: 0, Au: 0 }; o.n++; o.g += d.g; o.a += d.a; if (d.cls === 'A' && d.a === 0) o.Au++; }); const hr = Object.values(hg).map(o => Object.assign(o, { att: div(o.a, o.g) }));
    H += `<div class="card"><h2>My doctors by place</h2>${table('t_my_docs', [{ k: 'h', l: 'Place', tl: 1, h: r => `<b>${esc(r.h)}</b>`, v: r => r.h, w: 1 }, { k: 'n', l: 'Doctors', h: r => r.n, v: r => r.n }, { k: 'g', l: 'Goal', h: r => r.g, v: r => r.g }, { k: 'a', l: 'Done', h: r => r.a, v: r => r.a }, { k: 'att', l: 'Attained', h: r => achCell(r.att), v: r => r.att }, { k: 'Au', l: 'Class A unseen', h: r => `<b class="${r.Au ? 'dn' : ''}">${r.Au}</b>`, v: r => r.Au }], hr, { sort: 'g', noMine: 1, title: 'My doctors' })}</div>`; }
  H += `<div class="card"><h2>Stock position of my drugs</h2>${stockMineTable()}</div>`;
  return H;
};
function topKey(arr, k) { const c = {}; arr.forEach(x => c[x[k]] = (c[x[k]] || 0) + 1); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; }
