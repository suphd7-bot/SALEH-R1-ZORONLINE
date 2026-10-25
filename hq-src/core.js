/* Sales HQ core: turns the Excel sheets into one compact database. Runs in Node (build) and in the browser (Update Center). */
(function (root) {
  'use strict';
  const N = x => { const v = Number(x); return isFinite(v) ? v : 0; };
  const R = x => Math.round(N(x));
  const S = x => (x == null ? '' : String(x).trim());
  const lc = x => S(x).toLowerCase();

  function sheetRows(XLSX, wb, name, opt) { return XLSX.utils.sheet_to_json(wb.Sheets[name], Object.assign({ defval: null, raw: true }, opt || {})); }
  function headerOf(XLSX, wb, name) {
    const a = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null, range: 0 });
    return a;
  }
  function has(cols, list) { const set = {}; cols.forEach(c => set[lc(c)] = 1); return list.every(c => set[lc(c)]); }

  /* ---------- detect which sheets in a workbook are which kind ---------- */
  function detect(XLSX, wb) {
    const found = [];
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name]; if (!ws || !ws['!ref']) return;
      const grid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
      for (let i = 0; i < Math.min(grid.length, 8); i++) {
        const cols = (grid[i] || []).map(S);
        if (has(cols, ['Year', 'Period', 'New Custid', 'MED_REP_NAME', 'Productid', 'NET Value'])) {
          const isTarget = /target/i.test(name) && !/month/i.test(name);
          const isMonth = /target per month/i.test(name);
          found.push({ kind: isMonth ? 'targetMonth' : isTarget ? 'targets' : 'sales', sheet: name, hdr: i });
          return;
        }
        if (has(cols, ['Period_ID', 'Forecast Units', 'Product'])) { found.push({ kind: 'forecast', sheet: name, hdr: i }); return; }
        if (has(cols, ['ITEM CODE', 'WH TOTAL', 'Total SOH'])) { found.push({ kind: 'jjstock', sheet: name, hdr: i }); return; }
        if (has(cols, ['Territory', 'HQ Goal', 'Actual', 'Potentiality'])) { found.push({ kind: 'tracker', sheet: name, hdr: i }); return; }
      }
    });
    return found;
  }
  function table(XLSX, wb, d) {
    const grid = XLSX.utils.sheet_to_json(wb.Sheets[d.sheet], { header: 1, defval: null, blankrows: false });
    const cols = grid[d.hdr].map(S); const out = [];
    for (let i = d.hdr + 1; i < grid.length; i++) { const r = grid[i]; const o = {}; let any = false; cols.forEach((c, j) => { if (c) { o[c] = r[j]; if (r[j] != null) any = true; } }); if (any) out.push(o); }
    return out;
  }

  /* ---------- names ---------- */
  function repShort(full) {
    const f = S(full);
    if (/non[\s-]*promot/i.test(f)) return 'Non-Promoted';
    if (/vac+ant/i.test(f)) { const m = f.replace(/vac+ant/i, '').replace(/-?\s*R1/i, '').trim(); return 'Vacant ' + m.replace(/\s+/g, ' ').replace(/Azi Once/i, 'Azi-Once'); }
    const t = f.split(/\s+/)[0] || f; if (/^dh?ai$/i.test(t)) return 'Dhai'; return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }
  function modal(map) { let b = null, n = -1; for (const k in map) if (map[k] > n) { n = map[k]; b = k; } return b; }
  function bump(o, k) { o[k] = (o[k] || 0) + 1; }

  /* ---------- sales + targets ---------- */
  function buildSales(sRows, tRows) {
    const reps = [], repIx = {}, prods = [], prodIx = {}, custs = [], custIx = {}, lines = [], lineIx = {};
    const repNames = {}, prodNames = {}, custNames = {}, repLine = {}, prodMeta = {}, custMeta = {};
    const fact = {}, bud = {};
    let ytdP = 0;
    function ixOf(arr, ix, k) { if (ix[k] == null) { ix[k] = arr.length; arr.push(k); } return ix[k]; }
    const all = sRows.map(r => ({ r, kind: 's' })).concat((tRows || []).map(r => ({ r, kind: 't' })));
    all.forEach(({ r, kind }) => {
      const cid = S(r['New Custid']), pid = S(r.Productid), repf = S(r.MED_REP_NAME), yr = N(r.Year), per = N(r.Period);
      if (!pid || !repf || !per) return;
      const rk = repShort(repf); ixOf(reps, repIx, rk); (repNames[rk] = repNames[rk] || {})[repf] = 1;
      const ln = S(r.Line) || 'Other'; ixOf(lines, lineIx, ln); (repLine[rk] = repLine[rk] || {}); bump(repLine[rk], ln);
      const pn = S(r.Product); (prodNames[pid] = prodNames[pid] || {}); bump(prodNames[pid], pn);
      prodMeta[pid] = { g: S(r['PRODUCT - GROUP']), cat: S(r.Category), st: S(r['2026 Strategic']) };
      ixOf(prods, prodIx, pid);
      const p = prodIx[pid], rp = repIx[rk];
      if (cid === 'Budget') {
        const k = rp + '|' + p; const o = bud[k] = bud[k] || { r: rp, p, t: new Array(12).fill(0), fy: 0, ln: lineIx[ln] };
        o.t[per - 1] += N(r.BUDGET); const fy = N(r['Full Year Buget']); if (fy) o.fy = fy; return;
      }
      ixOf(custs, custIx, cid); (custNames[cid] = custNames[cid] || {}); bump(custNames[cid], S(r['Customer Name']));
      custMeta[cid] = { nat: S(r.NATURE), sub: S(r['SUB - NATURE']), st: S(r['2026 Strategic']), stt: S(r['2026 Strategic Type']) };
      const c = custIx[cid]; const k = c + '|' + p + '|' + rp;
      const o = fact[k] = fact[k] || { c, p, r: rp, a: new Array(12).fill(0), b: new Array(12).fill(0), t: new Array(12).fill(0), ln: lineIx[ln] };
      if (kind === 't') { o.t[per - 1] += N(r.BUDGET); }
      else {
        const v = N(r['NET Value']);
        if (yr === 2026) { o.a[per - 1] += v; if (r['NET Value'] != null && per > ytdP) ytdP = per; }
        else if (yr === 2025) o.b[per - 1] += v;
      }
    });
    const rr = a => a.map(R);
    return {
      dims: {
        reps: reps.map(k => ({ n: k, full: modal(repNames[k]), line: modal(repLine[k]) })),
        lines,
        prods: prods.map(k => ({ id: k, n: modal(prodNames[k]), g: prodMeta[k].g, cat: prodMeta[k].cat })),
        custs: custs.map(k => ({ id: k, n: modal(custNames[k]), nat: custMeta[k].nat, sub: custMeta[k].sub, st: custMeta[k].st }))
      },
      f: Object.values(fact).map(o => [o.c, o.p, o.r, o.ln, rr(o.a), rr(o.b), rr(o.t)]).filter(x => x[4].some(v => v) || x[5].some(v => v) || x[6].some(v => v)),
      bud: Object.values(bud).map(o => [o.r, o.p, o.ln, rr(o.t), R(o.t.reduce((a, b) => a + b, 0))]),
      ytd: ytdP
    };
  }

  /* ---------- forecast (string keys so it survives a sales refresh) ---------- */
  function buildForecast(rows) {
    const f = {}, fb = {}, pn = {}, cn = {};
    rows.forEach(r => {
      const per = N(r.Period_ID); if (per < 10 || per > 12) return;
      const rk = repShort(r['Medical rep name'] || ''); const pid = S(r.Productid); pn[pid] = S(r.Product);
      const nat = S(r.Nature);
      if (/budget/i.test(nat) || S(r['Cust - ID']) === 'Budget - 26') {
        const k = rk + '|' + pid; const o = fb[k] = fb[k] || [rk, pid, [0, 0, 0]]; o[2][per - 10] += N(r.BUDGET); return;
      }
      const cid = S(r['Cust - ID']); cn[cid] = S(r['Cust Name']);
      const k = cid + '|' + pid + '|' + rk; const o = f[k] = f[k] || { c: cid, p: pid, r: rk, u: [0, 0, 0], v: [0, 0, 0], pr: 0, nat };
      o.u[per - 10] += N(r['Forecast Units']); o.v[per - 10] += N(r['Net Value']); const pr = N(r['NET - Price']); if (pr) o.pr = pr;
    });
    return {
      f: Object.values(f).filter(o => o.u.some(x => x) || o.v.some(x => x)).map(o => [o.c, o.p, o.r, o.u.map(R), o.v.map(R), Math.round(o.pr * 100) / 100, o.nat]),
      fb: Object.values(fb).map(o => [o[0], o[1], o[2].map(R)]), pn, cn
    };
  }

  /* ---------- doctors (HQ tracker) ---------- */
  function buildTracker(rows) {
    return rows.filter(r => S(r['Account: Account Name'])).map(r => ({
      t: S(r.Territory), h: S(r['Account: Ultimate Parent Name']), d: S(r['Account: Account Name']), g: N(r['HQ Goal']), a: N(r.Actual),
      vpc: N(r.VPC), lcf: N(r.LCF), rcf: N(r.RCF), cls: S(r.Potentiality), sp: S(r.Specialty), pr: S(r.Priority), st: S(r.Status), emp: S(r.Employee), days: S(r['Planned Days'])
    }));
  }

  /* ---------- Jamjoom stock ---------- */
  function buildJJ(rows) {
    return rows.filter(r => r['ITEM CODE'] != null && S(r.DESCRIPTION)).map(r => ({
      c: S(r['ITEM CODE']), d: S(r.DESCRIPTION).replace(/\s+/g, ' '), p: N(r.PRICE), wh: R(r['WH TOTAL']), ph: R(r['PH SOH']), tr: R(r['Stock in Transit']),
      rt: R(r['Consolidated Retail SOH']), tot: R(r['Total SOH']), s30: R(r['Sales last 30 days']), s60: R(r['Sales last 60 days']), m: S(r.Mfg_Name)
    }));
  }

  /* ---------- match a product to a Jamjoom stock item ---------- */
  const ALIAS = { CIPROXIN: 'CIPROXEN' };
  const OVR = [[/CAPSULES-TP/i, null], [/ZORON\s*INJECTION\s*4/i, null], [/ZORON\s*INJECTION\s*8/i, '88463']];
  function sig(name) {
    const u = S(name).toUpperCase().replace(/[’`]/g, "'");
    let brand = (u.replace(/^W-|^JP /, '').match(/[A-Z]+(?:\s?-\s?[A-Z]+)?/) || [''])[0].replace(/[\s-]/g, '');
    brand = ALIAS[brand] || brand;
    const nums = (u.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    return { brand, nums, u };
  }
  /* returns {it, exact} or null. exact = every number in the product name appears in the stock item name */
  function matchJJ(prodName, jj) {
    for (const [re, code] of OVR) if (re.test(prodName)) { if (!code) return null; const it = jj.find(x => x.c === code); return it ? { it, exact: true } : null; }
    const a = sig(prodName); if (!a.brand) return null;
    let best = null, bs = 0, bex = false;
    const same = jj.filter(it => sig(it.d).brand === a.brand);
    same.forEach(it => {
      const b = sig(it.d); let s = 1; const bn = b.nums;
      const overlap = a.nums.filter(n => bn.indexOf(n) >= 0).length; s += overlap * 2;
      const an = a.nums.filter(n => n !== 1); const strength = an[0];
      if (strength != null && bn.indexOf(strength) < 0 && !/SYR|SUSP|ML|GM/.test(a.u)) return;
      const miss = an.filter(n => bn.indexOf(n) < 0).length; const ex = an.length > 0 && miss <= 1; if (ex) s += 3;
      if (/INJ|AMP|VIAL/.test(a.u) !== /INJ|AMP|VIAL/.test(b.u)) s -= 3;
      if (/SUSP|SYR|SOL|CREAM|GEL/.test(a.u) !== /SUSP|SYR|SOL|CREAM|GEL/.test(b.u)) s -= 3;
      if (s > bs) { bs = s; best = it; bex = ex; }
    });
    if (!a.nums.length && same.length === 1) return { it: same[0], exact: true };
    return bs >= 3 ? { it: best, exact: bex } : null;
  }

  const api = { detect, table, buildSales, buildForecast, buildTracker, buildJJ, matchJJ, repShort, sheetRows, N, R, S };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HQCORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
