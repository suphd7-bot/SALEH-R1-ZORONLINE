# Sales HQ · GIT 2 · update playbook

Live site: https://suphd7-bot.github.io/SALEH-R1-ZORONLINE/ (file `index.html`, branch `main`).
`index.html` is generated. Never edit it by hand: change the sources below and rebuild.

## Pieces
- `pre.html` HTML + CSS. `code_orig.js` original app code. `mod_new.js` newer modules (Branches, Stock, Changes, Zahrat 360, Dallah stock, Alerts, Monthly).
- `patch.py` applies replacements to `code_orig.js` and inserts `mod_new.js` → `code.js`. A replacement that does not match exactly once stops the build.
- `parts_current.json` = all embedded data of the live build: D2 (Dallah items, docs, visits, monthly consumption), SALES, HAB (cube + Habib), HDOC, TERR, FCX (forecast rows), BR (branches), JJ (Jamjoom stock), PREV (previous version), DN (Dallah consumption reports), HIST (monthly snapshots).
- `assemble.py` pre.html + data consts + code.js → `/mnt/user-data/outputs/index_new.html`.
- Working directory used so far: `/home/claude/w` (copy this folder there; paths are hard-coded).

## Monthly update (user says "update the dashboard" and sends files)
1. Read every file. Compare with `parts_current.json`; report anything that does not reconcile before building.
2. Rebuild only the blocks the new files cover:
   - Sales 25 vs 26 YTD xlsx → `mk_all.py` (SALES, HAB cube, Habib). `canon_maps.json` keeps product and customer names stable by Productid / customer id.
   - Q4 forecast per-item xlsx → FCX (`mk_fcx` in `mk_sales.py`). Keep old rows as PREV so "What changed" works.
   - Al Habib dashboard + branches xlsx → HAB.habib, BR.
   - Jamjoom stock xlsx → JJ (`map` links SKU names to item codes).
   - Dallah Drug Consumption PDFs (Nakheel, Namar, Pharmacies) → `dal_parse.py` then `mk_dal.py` (DN and D2.items). Report units: injections are ampoules, boxes of 5, so divide by 5 for Zoron 4/8 injection.
   - HQ tracker → HDOC, TERR, D2.docs/vis.
3. Set `PREV` to the previous build's values, bump `DATAVER` in `patch.py` (old local edits are archived and restorable), update `SRCS` dates in `mod_new.js` (period end of each file), and the Sources rows and freshness text in `patch.py`.
4. `python3 patch.py && python3 mk_hist.py` (adds a snapshot to HIST with the alert keys) `&& python3 assemble.py`.
5. Test: all routes at 1366 and 390 px, no NaN / undefined / comma numbers / horizontal scroll.
6. Copy `index_new.html` to the repo as `index.html`, commit, push to `main`, wait for Pages, check the live file contains the new code.

## Rules that hold
- Numbers are plain: no commas, no K/M. Chat replies in Arabic; the app is English.
- Forecast is in boxes; SAR only as a secondary figure.
- Alerts have stable keys (`sup:wh:<sku>`, `fc:ratio:<account id>` …). Keep the key format so Acknowledged/Done status survives updates.
- Before publishing, say what changed and which points need the user's confirmation.

## Open points (confirm with Saleh)
- Meaning of the Habib objective 1591000 (sell-in or net of overstock).
- Scope of the Jamjoom stock file.
- Zoron 2MG/ML 4ML injection mapped to "Zoron 8 Inj" (assumption).
- Indirect (pharmacy/warehouse) doctor allocation; Clinic → Ri'aya link.
- Dallah consumption report vs the monthly consumption file differ by about 5–10% for some products.
