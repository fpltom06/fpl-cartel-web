# Team Sheet Optimizer

## Local startup
From this frontend directory, keep two terminals open:

Terminal 1:
```powershell
.\Start-TeamSheet-Service.ps1
```

Terminal 2:
```powershell
npm run dev
```

Open http://127.0.0.1:5173/team-sheet, enter an FPL Team ID and click Load Team.
If npm is unavailable in this workspace, the existing installed dependencies can run with:
```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173
```

The launcher accepts -ModelDirectory, -Python and -Port. Its default port is 8765; if you change it, update the matching local Vite proxy. On this machine the launcher reuses an existing Python environment with pandas, requests and Streamlit installed. No Python source or workbook is moved into the frontend.

The service runs only on 127.0.0.1. Vite proxies /api to it for dev and preview. This is a local development bridge, not a production backend. Static Netlify deployment still serves Player Projections, but dynamic Team Sheet loading needs a future hosted Python interface.

## Existing implementation inspected and reused
Model directory:
<MODEL_DIRECTORY>

All reusable functions are imported directly from app.py. No optimizer function was copied or translated:
- fetch_entry_history and fetch_entry_picks retrieve public manager history and event picks.
- is_free_hit_chip_name, free_hit_events_from_entry_history, squad_ids_from_picks_data and bank_from_picks_data are used by get_permanent_squad_before_gw.
- get_permanent_squad_before_gw walks back past real Free Hit events and returns permanent squad IDs, bank and the source GW.
- calculate_multi_gw_team_sheets calls calculate_team_sheet and optimize_starting_xi for each individual GW.
- is_valid_starting_xi enforces 11 players, 1 GK and minimum 3 DEF / 2 MID / 1 FWD.
- formation_text supplies the formation. round_table_values is used internally by the original function for its display table.

Existing get_user_squad_from_fpl can fall back to unchecked picks if chip history fails. The web adapter deliberately calls get_permanent_squad_before_gw directly: history failure produces an error, never an unverified Free Hit squad.
Original Streamlit behavior remains unchanged.

Existing get_team_sheet_gameweek_columns was inspected. For the web version, the available range comes directly from projections.json as requested: first available GW, first five, or all. All selected columns are passed to the original Python multi-GW function.

Squad picks are the last published permanent event squad, consistent with the existing Streamlit helper. The source GW is shown beside the match result. Bank comes from that event's entry_history.bank / 10. Player prices and projection scores come from the same exported model rows used by Player Projections; these are display prices, not an invented selling-price calculation.

## New Python adapter
New model-side file: web_team_sheet.py.
- GET /api/health: local service readiness.
- POST /api/team-sheet: body {teamId, mode, modelUpdatedAt}; mode is next, five or all.
- Reads the exact frontend public/data/projections.json specified at startup.
- Groups exported records by Player ID, preserving export player order and original optimizer tie-breaking.
- Checks 15/15 ID matching. Missing players return name, club, position and ID diagnostics; no partial XI is produced.
- Checks exact 2 GK / 5 DEF / 5 MID / 3 FWD squad composition.
- Calls the unchanged calculate_multi_gw_team_sheets with no chips or transfer changes.
- Adds a vice captain (second highest starter, stable tie order), orders GK first then outfield bench descending, and serializes the results.
- Normal captain bonus is counted once; vice captain and bench add no points.
- Returns clean squad-source metadata, bank, diagnostics, weekly pitch players and overall summaries.
- Checks that the browser and service are using the same model export timestamp.
- Restricts requests to local development origins; no permissive CORS, credentials, database or public manager export files.
- Unexpected server exceptions log locally; browser errors do not expose local paths.

There is no automatic file export of manager squads. Requests and responses are transient; only the successful FPL Team ID is stored in browser localStorage under fpl-cartel.team-id. No authentication was added.

## Frontend files
Created:
- src/pages/TeamSheet.tsx
- src/types/teamSheet.ts
- src/services/teamSheet.ts
- src/components/team-sheet/PlayerCard.tsx
- src/components/team-sheet/Pitch.tsx
- src/components/team-sheet/TeamSummary.tsx
- src/components/team-sheet/Overall.tsx
- src/team-sheet.css
- Start-TeamSheet-Service.ps1
- TEAM_SHEET.md

Changed:
- src/main.tsx: activates /team-sheet.
- vite.config.ts: local service proxy for dev and production preview.
- README.md: Team Sheet startup and scope.

New model-side files:
- web_team_sheet.py
- test_web_team_sheet.py

## Team 5406 validation snapshot
- 15 permanent squad players loaded from GW8 for planning GW9.
- 15/15 matched by FPL Player ID.
- Bank: £0.0m. Sum of exported squad prices: £101.8m.
- Formation: 3-5-2.
- Captain: Haaland (ID 411).
- Vice captain: Groß (ID 124).
- Projected XI: 49.54960887717442.
- Captain bonus: 7.591681105990784.
- Projected total: 57.14128998316521 (57.14 displayed).
- Exactly 11 starters, four bench players, one starting GK and one bench GK.
- Exactly one captain and vice captain, both starters and different players.
- All 30 available weeks (GW9–GW38) were calculated independently and checked against exported points.
- This real squad has the same optimal XI across this snapshot. A synthetic regression demonstrates changing weekly selections when the scores warrant a different XI.
- Next 5 GWs uses GW9–GW13; weekly tabs and OVERALL render without reoptimizing when switching tabs.
- No transfers, Bench Boost, Triple Captain or future chip planning.

## Tests and preservation
Relevant existing Python tests passed: test_multi_gw_squad_builder.py and test_gameweek_state.py (9 tests, including Free Hit restoration).
New adapter tests passed (8): delegation to original optimizer, independent weekly selections, legal XI/bench/captain/vice rules, missing-player diagnostics, stale exports, unavailable chip history and invalid inputs.
The existing frontend projection tests pass. npm run build passes.
Protected existing app.py, projections.py, update_excel.py and gameweek_state.py retain identical SHA-256 hashes. No existing Streamlit/model file or projection JSON was changed for this feature.

## Data refresh
Use the existing .\Refresh-Projections.ps1 to refresh projections. Then click website Refresh and reload the team. The Team Sheet service reads the JSON on each load; restarting it after a projection export is not necessary.


## Browser QA completed
Team ID 5406 loaded successfully in the production preview. Next 5 GWs displayed GW9–GW13 and the correct weekly totals in OVERALL. All Remaining GWs displayed all 30 tabs (GW9–GW38). The next-GW pitch showed 11 players, C/VC badges and the four-player bench. A 390px mobile layout had document width 390px, with readable pitch/bench cards and no horizontal page overflow. Reloading pre-populated FPL Team ID 5406 from localStorage. Screenshots are delivered alongside the project.
