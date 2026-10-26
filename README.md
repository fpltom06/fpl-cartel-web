# FPL Cartel Web

React, TypeScript, Vite and Tailwind frontend for the separate Python FPL model.

## Install and run
Node.js 22+ with npm:
```sh
npm install
npm run dev
```
Open the local URL Vite prints. Local development uses a loopback proxy to the separate Python service.

## Build the static test
```sh
npm run build
npm run audit:build
npm test
npm run preview
```
Netlify build command: npm run build. Publish directory: dist.
public/_redirects is copied into dist/_redirects for SPA routes and the informational unavailable-API response.
No deployment has been performed. See [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md).

Default production builds support Dashboard and real Player Projections. Team Sheet and Transfers display a hosted-service-required notice. Local development retains their complete behavior. A later build enables personalized routes when VITE_API_BASE_URL points to an actual HTTPS FastAPI service. This is a public feature flag, not a secret and not a backend by itself.

## Local model configuration
Python source, Excel files and Python environments remain outside this repository.
The PowerShell launchers accept -ModelDirectory and -Python. They can also read FPL_MODEL_DIR or ignored .local/settings.json.

Example local settings (fill with your own paths, never commit):
```json
{
  "ModelDirectory": "<absolute model directory>",
  "ServicePython": "<Python executable with model dependencies>",
  "RefreshPython": "<Python executable with model dependencies>",
  "ExtraPythonPath": "<optional additional dependency directory>"
}
```
This machine's existing configuration has been preserved in the ignored settings file. Existing commands remain:
```powershell
.\Start-TeamSheet-Service.ps1
.\Refresh-Projections.ps1
```
Keep the service terminal open for local Team Sheet and Transfers. Use -ExportOnly with the refresh script to sync already-updated Excel output. Neither script runs on Netlify.

## Refresh workflow
Existing Python updater → saved Live Projections → clean exports/web/projections.json → frontend public/data/projections.json → review/commit/push when authorized → Netlify rebuild/redeploy.

The website Refresh button only reloads the currently deployed JSON. It never runs Python or updates a hosted deployment. No scheduled refresh is configured.

## Data and privacy
The browser receives projection output: player ID/name/club/position/price, fixtures, gameweeks, points and minutes factor, plus schema/update timestamps. Projection export validation and the UI use Player ID. Next 5 GWs totals use the first five available gameweeks.

Only dist is a deployment payload. It includes no Excel, Python, .env files, credentials or local settings. package.json private=true prevents npm publication; it does not make a Netlify site private. Git repository visibility and Netlify visitor protection are separate settings.

A static site must be protected through verified Netlify private project visibility or supported password/team protection before sharing. A secret/unlisted URL and robots directives are not access control.

## Repositories and checks
This folder has its own local Git repository on main, with no commits or remote added during preparation. .gitignore excludes dependencies, dist, environment files, workbooks, credentials, local Python environments and personal configuration.

Feature implementation details: [INTEGRATION.md](INTEGRATION.md), [TEAM_SHEET.md](TEAM_SHEET.md), [TRANSFERS.md](TRANSFERS.md). Their local paths were replaced with portable placeholders. Existing model and optimizer rules remain unchanged.



## FastAPI connection (current local interface)
Start the separate sibling fpl-cartel-api project with .\Start-Api.ps1 or uvicorn app.main:app --reload. Then run npm run dev here. The ignored .env.development.local sets VITE_API_BASE_URL=http://127.0.0.1:8000 for local development only. Restart Vite after changing environment files. The shared Team ID, existing UI and Player Projections remain unchanged; response adapters map the canonical FastAPI fields to the existing pitch/results.
Production builds with no API URL still show hosted-service-required notices. To enable them later, configure VITE_API_BASE_URL at build time and allow that exact frontend origin in API CORS. No API host or Netlify deployment has been created.
The original 8765 launchers and model adapters remain available for legacy use; current React personalized requests use FastAPI.

## Render + Netlify deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete manual sequence and environment settings. No external deployment or push has been performed. See [DATA_VERSION.json](DATA_VERSION.json) for the packaged snapshot identity.
