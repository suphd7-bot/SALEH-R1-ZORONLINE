# Sales HQ (new) — source
- `core.js`: turns the Excel sheets into the database (same code runs in the browser Update center and in Node).
- `build.js`: reads the source workbooks and writes db_core.json. `assemble.js`: writes hq/index.html (inlines SheetJS, data, app).
- Dallah (PDF consumption reports) and Al Habib data come from `legacy.json` and are refreshed by Claude.
- Workflow: user drops new sheets in the Update tab (preview) or sends them to Claude, who rebuilds and publishes hq/index.html.
