# Transfer Optimizer

This local web feature reuses Python rules in the existing model. It does not modify or replace the Streamlit implementation.

## Run
From this frontend folder, use the same service launcher as Team Sheet:
```powershell
.\Start-TeamSheet-Service.ps1
```
Keep it running. In another terminal run npm run dev and open /transfers.
The launcher now starts web_transfers.py, which serves both the existing /api/team-sheet endpoint and the new transfer endpoints on 127.0.0.1:8765. Restart an older service once after upgrading. On this machine the agent has left the combined service running.
No production backend or deployment was created.

## Existing Python inspection and reuse
All existing functions are in app.py under:
<MODEL_DIRECTORY>

- get_permanent_squad_before_gw, fetch_entry_history, fetch_entry_picks, bank_from_picks_data: same permanent event picks, chip-history-based Free Hit restoration and bank as Team Sheet.
- get_valid_buy_options and club_rule_allows_transfer: same-position replacements, current ownership, exclusions, affordability and maximum three players per club.
- add_transfer_upgrade_scores and get_projection_score: incoming/outgoing horizon projections and gain.
- calculate_transfer_projection_total: inspected; the adapter serializes equivalent per-transfer differences using the original scoring helper.
- render_manual_transfer_simulation: inspected for sequential bank updates, No transfer behavior, exclusions of sold/bought IDs and prevention of circular transfers. Its interactive Streamlit UI is not executed.
- build_fpl_id_transfer_suggestions: inspected but not used because it filters Games Played >=5 and its name-only result does not preserve the required complete ID-based pool.
- calculate_multi_gw_team_sheets, calculate_team_sheet, optimize_starting_xi: original weekly XI/captain engine for both original and updated teams.
- web_team_sheet.load_projection_frame and display_player: reused clean projection input and player serialization.

Existing Streamlit uses model Price for outgoing and incoming players. No purchase-history/half-profit selling-price helper exists in the inspected flow. This feature preserves that model-price convention and labels bank and spend in £m.

## Search semantics and limits
One-transfer search checks all legal positive upgrades. For two/three transfers, a bounded sequential beam retains 10 states, shortlists the top 24 affordable candidates per seller by selected-horizon score, and expands the top three valid positive upgrades per seller. The original Python validation/scoring functions still decide eligibility and gain. This is a practical extension of the interactive sequential transfer flow, not a claimed exhaustive global solver.

The transfer count is a maximum: returning fewer moves or rolling is allowed. Existing positive-upgrade behavior is preserved; this search does not pursue initially negative steps to fund another move. Each intermediate squad must be legal and affordable, consistent with the existing sequential helper.
The adapter guards an empty candidate pool before invoking the original helper because the installed pandas version can otherwise drop columns in an empty apply filter. No existing helper was edited.

Original owned IDs can never be bought, even if sold earlier. Bought players cannot be sold again. Each outgoing/incoming ID appears once. Positions stay 2 GK / 5 DEF / 5 MID / 3 FWD; maximum three players per club and non-negative bank are checked by existing rules at each step.
Bans apply only to IN players. Bank may be manually overridden. Settings changes clear old results.

Roll is a zero-gain, zero-cost candidate, even when a hit is selected. A manual hit of 0/4/8/12 is charged once to any non-empty batch. Recommendations are ranked by transfer net gain and include roll among up to ten options.

## Two explicitly labeled gain measures
Transfer Gross Gain = sum(IN projections) - sum(OUT projections), across the selected horizon. Transfer Net Gain = that difference - the manually chosen hit. This is the original model's transfer upgrade score basis and is used to rank recommendations.
Original/Updated XI Total instead sums independently optimized weekly starting XIs plus one captain bonus each week. XI Gross Gain = Updated XI Total - Original XI Total. XI Net Gain subtracts the selected hit once.
The two gains can differ because bench players and captain choices affect XI totals. React displays these distinct measures and does not calculate transfers or optimize lineups.

## New interface
New model-side files: web_transfers.py and test_web_transfers.py.
No manager squad files are published into public/. Only clean JSON responses are returned:
- POST /api/transfers/load: teamId, modelUpdatedAt. Returns the same Team Sheet metadata and 15/15 diagnostics.
- POST /api/transfers/optimize: teamId, mode (next/five/all), modelUpdatedAt, count (0–3), bank (number or null), hit (0/4/8/12), excludedIds.
- POST /api/transfers/preview: same inputs plus moves [{outId,inId}]. Revalidates each move server-side, then returns original/updated XI totals and the standard Team Sheet pitch data.
Existing /api/team-sheet and /api/health continue to work. Requests are loopback-only through Vite's existing proxy; remote origins are rejected. This is a local development bridge.

## Frontend files
Created:
- src/pages/Transfers.tsx
- src/types/transfers.ts
- src/services/transfers.ts
- src/components/team-sheet/ExcludePlayers.tsx
- src/components/team-sheet/TransferRecommendation.tsx
- src/transfers.css
- TRANSFERS.md

Changed:
- src/main.tsx: activates /transfers.
- Start-TeamSheet-Service.ps1: launches the combined service.
- README.md: feature/startup documentation.

Pitch, PlayerCard and TeamSummary from Team Sheet are reused unchanged. The existing fpl-cartel.team-id localStorage key is reused. No new ID store, authentication, database, future chip planning or transfer scheduling was added.

## Validation
The delivered report below records real Team 5406 searches and checks. Synthetic regression tests cover No Transfer winning, hits, manual bank, banned players, duplicate/owned/wrong-position moves, legal 1/2/3 batches and captain reconciliation.
Existing Team Sheet/Free Hit/gameweek tests are also run. Protected model sources app.py, projections.py, update_excel.py and gameweek_state.py retain identical SHA-256 hashes.



## Delivered real-data results
Team ID 5406: 15/15 matched, API bank £0.0m. Horizon GW9–GW13. Manual bank override £0.4m was separately verified; banned ID 388 appeared in no incoming recommendation.
- Up to 1 transfers: Calafiori → Guéhi. Gross transfer gain 24.43; 4-point hit; net 20.43; net spend £0.0m; bank after £0.0m.
- Up to 2 transfers: João Pedro → McBurnie; Calafiori → Gabriel. Gross transfer gain 51.64; 4-point hit; net 47.64; net spend £-0.5m; bank after £0.5m.
- Up to 3 transfers: João Pedro → McBurnie; Calafiori → Gabriel; Thomas → Justin. Gross transfer gain 69.28; 4-point hit; net 65.28; net spend £0.0m; bank after £0.0m.

All ten returned recommendations for each of 1/2/3 transfers were independently checked for 15 unique players, same-position replacements, budget, club limits, no owned/duplicate/circular incoming IDs, per-week differences and gross/net reconciliation. Each best batch produced five legal preview XIs with one GK, four bench players, one captain and one vice captain. Captain bonus and hit accounting reconciled.

27 Python tests passed (10 transfer tests, eight existing web Team Sheet tests and nine existing multi-GW/Free Hit/gameweek tests). Seven frontend projection tests and npm run build passed. No Transfer winning was tested with non-positive upgrades and a hit that outweighs the upgrade; roll is never charged a hit.

Browser QA: Team 5406 pre-populated from the existing shared Team ID store; 15/15 loaded and API bank displayed £0.0m. One-transfer Next 5 search with a four-point hit rendered correct ranked metrics and updated pitch. Selecting the second option changed the XI to 4-4-2; GW10 switched its scores. Searchable Guéhi exclusion added/removed successfully. Mobile viewport 390px had document width 375px with its scrollbar, and no horizontal page overflow. The final service remains running on port 8765; the temporary production-preview server is separate from the user's existing development server.
Zero-transfer browser QA passed: current optimized 3-5-2 team displayed, no transfer recommendation table, GW9 total 57.14 with captain bonus counted once.
