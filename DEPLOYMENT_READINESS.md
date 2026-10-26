> Current deployment preparation: see [DEPLOYMENT.md](DEPLOYMENT.md) and [DEPLOYMENT_VALIDATION.md](DEPLOYMENT_VALIDATION.md). Earlier findings below are retained as historical local validation.

# Netlify deployment readiness audit

Audit date: 26 October 2026.
Status: PREPARED LOCALLY — NOT DEPLOYED. No Git commit, remote, push, Netlify project, hosting change or account-access change was made.

## Direct answers
1. Player Projections is ready for a static Netlify test, using the exact bundled JSON snapshot.
2. FPL Team ID lookup is not hosted-ready. It currently calls the local Python service, which then calls FPL.
3. Team Sheet is not hosted-ready. Its optimization executes Python.
4. Transfers is not hosted-ready. Search and updated-XI calculation execute Python.
5. Squad lookup, chip-history/Free Hit restoration, bank retrieval, Team Sheet, transfer search and updated previews require Python.
6. Per-user requests read projection JSON from a file on the Python host. Model refreshing also reads local Excel. PowerShell launchers and their ignored machine settings are local-only.
7. Required FPL endpoints responded, but their responses did not allow a hosted cross-origin browser to read them. No rate-limit guarantee was established.
8. A small hosted Python API must reuse existing rules, fetch/cache manager data and consume the clean projection snapshot. It does not need Excel or the model updater in per-user requests.
9. npm run build passed. The seven existing frontend data tests passed.
10. dist is ready for a projections-only static test, not the full interactive application.
11. This folder now has its own Git repository on main. Prospective files were reviewed and sensitive/local files are ignored. No files were committed or pushed.
12. Recommended first test: after explicit approval, deploy the static snapshot behind verified Netlify private visitor access and test projections from another device. Host Python first if the first test must include team/transfer calculations.

## Feature-by-feature architecture
A = React/browser. B = static JSON. C = FPL HTTP API. D = Python execution. E = local files. F = other local-only mechanism.

| Feature | Current execution | Evidence | Static Netlify outcome |
|---|---|---|---|
| Dashboard | A + B | Dashboard.tsx and shared ProjectionProvider | Works with the deployed projection snapshot; cards linking to optimizers show the hosted-service notice |
| Player Projections | A + B | services/projections.ts fetches /data/projections.json | Works: gameweeks, filters, search, sorting, summary cards, first-five totals |
| Website Refresh button | A + B | Layout.tsx calls provider refresh; fetch cache is no-store | Reloads deployed JSON only; does not recalculate the model |
| Generate fresh projections | C + D + E + F | Refresh-Projections.ps1 → existing update_excel.py → saved workbook → export_web_projections.py | Cannot run from the hosted browser. Remains a local workflow followed by rebuild/redeploy |
| Remember FPL Team ID | A + F | fpl-cartel.team-id in localStorage | Storage is per device/browser/origin. Existing localhost values do not automatically appear on a new Netlify origin or phone |
| FPL Team ID lookup | A → local /api → D → C | services/teamSheet.ts, services/transfers.ts, web_team_sheet.py | Unavailable without hosted Python; no browser-direct FPL call exists |
| Permanent squad/Free Hit restoration | D + C | app.py/get_permanent_squad_before_gw reads chip history and walks back past Free Hit picks | Unavailable without hosted Python; no rule was changed |
| Money in Bank | D + C; override input A | bank_from_picks_data; transfer bank override passed to Python | Retrieval unavailable; input alone cannot retrieve or optimize a squad |
| Team Sheet | A rendering + D calculation + E JSON input | calculate_multi_gw_team_sheets and original XI engine | Route loads an honest unavailable notice; no hosted computation |
| Transfer Optimizer | A controls + D search + E JSON input | web_transfers.py reuses original eligibility/scoring helpers | Route loads an honest unavailable notice; no hosted computation |
| Updated Team preview | D weekly XI calculation + A shared pitch | /api/transfers/preview; Pitch/TeamSummary components | Unavailable without hosted Python |
| Discord account/other future tools | A placeholders | Existing ComingSoon/account notice | Remain placeholders; no authentication or payments added |

C in the table is called by Python, not directly by React. No browser feature calls the FPL domain directly.

## Concrete blockers and file boundaries
- vite.config.ts proxies /api to a loopback service for dev/preview. Vite proxy settings do not become Netlify runtime infrastructure.
- web_transfers.py/web_team_sheet.py bind only to loopback and permit only HTTP local development origins. They need a proper HTTPS hosted deployment and an exact allowed-origin/private-access design.
- Start-TeamSheet-Service.ps1 launches a Python environment. A static visitor cannot execute it.
- Refresh-Projections.ps1 invokes local Python; the original updater reads Desktop Excel workbooks and uses the existing model modules. These are not Netlify browser capabilities.
- The Python adapter imports app.py, so Streamlit and the existing pandas/requests/model dependency graph remain server dependencies even though no Streamlit UI server is needed for API requests.
- app.py and update_excel.py retain their original machine-specific workbook paths. These were inspected but not changed. They are outside this frontend repository and dist.
- The model-side exports/web/projections.json is local-only until copied into frontend public/data. Only the copied frontend asset is built.
- Per-user calculations read that JSON; they do not need to read the Excel workbook during each request.
- An HTTPS website cannot use an HTTP loopback API on the author's computer. Loopback refers to each visitor's own device, and browser mixed-content/private-network restrictions are an additional obstacle. This is not solved by publishing Vite config.
- No Netlify Function, hosted Python service, remote API proxy, jobs service, deployment token or production API URL currently exists.

## Production source and build scans
First-party src contains no Windows user paths, file URLs, localhost or loopback API endpoints. Its fetches use same-origin /data/projections.json and /api paths.
The production bundle contains two React Router dummy http://localhost URL bases used for URL parsing. They are dependency internals, not fetch endpoints or a dependency on a local server; vendor code was not rewritten.
Dev-only loopback proxy configuration stays in vite.config.ts and does not enter the shipped browser code.

Machine-specific launcher defaults were moved into ignored .local/settings.json. Both existing launcher commands still use this machine's configuration. Tracked launchers accept explicit parameters or FPL_MODEL_DIR on other machines. Personal paths were removed from repository documentation.

The new default production runtime policy:
- src/services/runtime.ts enables the model API in development only.
- Production /team-sheet and /transfers show HostedToolUnavailable.
- A future VITE_API_BASE_URL=<hosted HTTPS API base> build is an explicit public opt-in after a hosted API exists. The flag is neither a secret nor a backend, and enabling it alone will not make hosted tools work.
- Local development behavior remains available without setting the flag.
- No optimizer, projection, price, Free Hit or transfer rule was changed.

## FPL API / CORS findings
One conservative GET probe per endpoint was made with an Origin header representing a Netlify test site. All four returned HTTP 200 application/json, with no Access-Control-Allow-Origin header:
- https://fantasy.premierleague.com/api/bootstrap-static/
- https://fantasy.premierleague.com/api/fixtures/
- https://fantasy.premierleague.com/api/entry/5406/history/
- https://fantasy.premierleague.com/api/entry/5406/event/8/picks/

These responses can be consumed server-side but cannot be assumed readable from a cross-origin browser. A browser no-cors fetch would return an opaque response and would not provide usable JSON.
No Retry-After or rate-limit headers were returned in these samples. This does not establish unlimited use, a documented quota, endpoint stability or an SLA. No stress test was performed.
Required server behavior later: input validation, short-lived caches for shared/manager data, bounded concurrency, timeouts, respectful 429 handling/backoff and clear upstream failure responses. The existing fail-closed chip-history behavior should remain.

## Smallest appropriate hosted architecture
Keep the local model refresh separate:
Python model + Excel → clean snapshot → Netlify static projection asset.

Add one HTTPS Python API that reuses existing app.py/web adapter functions for:
- manager history and picks retrieval;
- permanent squad restoration and bank;
- per-GW Team Sheet;
- bounded transfer search;
- updated team preview.

Give that service the same versioned JSON snapshot as the frontend. Retain timestamp/version mismatch checks. Install its actual Python dependencies. Do not expose model directories, Excel, private configuration or source to visitors.
Use a narrowly configured frontend/API connection and private API access controls; protecting the frontend alone does not automatically protect a separate API domain.

A naive synchronous Netlify proxy is not sufficient for all workloads: Netlify documents a 26-second proxy timeout. Some multi-GW calculations can exceed it. Use a direct HTTPS API connection with exact-origin CORS and suitable timeouts, or return a job ID promptly and poll for long results. No jobs/database/API layer was implemented in this audit.
Reference: [Netlify rewrites and proxies](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).

## Static data and deployment artifact
Build command: npm run build.
Publish directory: dist.
Node version configured in netlify.toml: 22. package.json supports Node >=22. The local build was executed with the available Node runtime; the actual Netlify build remains untested until approved deployment.

dist contains only:
- index.html
- assets/index-*.js
- assets/index-*.css
- data/projections.json
- _redirects
- api-unavailable.json (informational unavailable-API response; not a backend)

Projection snapshot: 669 unique players, 20,070 rows, GW9–GW38, 3,160,464 bytes. It is byte-identical to public/data/projections.json.
Allowed row fields: playerId, name, club, position, price, gameweek, fixture, projectedPoints, minutesFactor.
Envelope fields: schemaVersion, modelUpdatedAt, exportedAt, projections.
No Excel, formulas, Python source, secrets, API keys, .env files or local settings are present in dist.

scripts/audit-build.mjs checks the deployment file allowlist, JSON field allowlist, source/output byte parity, local path/credential markers, first-party browser source and routing/build settings. Run npm run audit:build after any future build.
This is a focused artifact audit, not a guarantee that arbitrary future source/config changes cannot introduce a secret.

## Routing
public/_redirects is copied by Vite into dist/_redirects:
```text
/api/* /api-unavailable.json 200!
/* /index.html 200
```
The API guard is an informational static JSON document with an application-level MODEL_API_UNAVAILABLE code and HTTP 200 rewrite. It does not execute API calls, and normal static-build UI does not call it.
The final SPA fallback covers /, /projections, /team-sheet and /transfers. Existing assets are served as files. This matches Netlify's documented SPA rewrite format.
Local production browser checks passed for projections and both unavailable-tool routes, including direct refreshes. Local HTTP checks return 200 for all four route shells. Netlify's actual CDN behavior has not been claimed tested because no deployment occurred.
Reference: [Netlify SPA rewrite behavior](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps).

## Git readiness and privacy
An independent local .git was initialized on main inside fpl-cartel-web. There are no commits, configured remote or pushes from this task.
.gitignore excludes node_modules, dist, .netlify, .env variants, credential/key files, workbooks, local Python environments, caches, logs and .local.
Ignored machine settings were checked to resolve to existing paths; launcher syntax passed. The original model directory and workbooks remain outside this repository.
The clean public projection snapshot is intentionally eligible for Git and deployment. It is your model output: a publicly accessible site would make its JSON downloadable, regardless of hiding table rows in the UI.

A private Git repository does not make Netlify visitor access private. package.json private=true is only an npm publishing safeguard.
On current credit-based plans, Netlify Private project visibility enforces Netlify login; Free/Personal restrict private viewing to the owner, and Pro permits additional members. Shared-password protection is plan-dependent. The account/plan was not inspected, so no available protection mode or current privacy state is asserted.
Before any approved deployment, verify private visibility for the intended project and both production/previews in the Netlify dashboard. Do not rely on a hard-to-guess URL or robots.txt.
References: [Netlify project visibility](https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/), [Netlify password protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).

## Exact next recommended step — requires your later approval
Approve a projections-only private Netlify test, with the explicit understanding that hosted optimizer pages show unavailable notices.
Then:
1. Confirm the account's private visitor-access controls and configure the project as private before uploading.
2. Publish only the prepared dist contents, or connect this standalone repository after separately authorizing its commit/push. Repository-root base directory; npm run build; publish dist.
3. On another device, sign in through Netlify's protection and test Dashboard, Player Projections, filters/sorting, current snapshot, refresh and direct route reloads. Verify unauthenticated access is denied, including /data/projections.json.
4. Keep the Python updater local; review/sync JSON and rebuild/redeploy when the model changes.
5. Build the hosted Python API as the next phase if live manager tools must be tested remotely.

No automatic scheduled update, Discord authentication, payment feature, backend migration or model-rule change was made.


