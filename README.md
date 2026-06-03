# Device Monitoring Portal (React PWA)

A fully responsive, rich-aesthetic Progressive Web App (PWA) built using React, TypeScript, Vite, Chart.js, and Leaflet. Designed to map solar panels, network control units (NCUs), and tracker status metrics under various weather conditions.

## Key Features
- **PWA Capabilities**: Offline asset caching, service worker auto-update, and fully installable on mobile & desktop with custom SVG vector logo app icon.
- **Dynamic visualizer**: Interactive Sun & Panel Angle visualizer (animated SVG) displaying panel alignment vs sun coordinates.
- **Map Integration**: Dynamic global maps using Leaflet to track projects geographically and review individual TCU/NCU status overlays.
- **Comprehensive Operations**:
  - **Dashboard**: Core system statistics KPIs, alarms grids, and power generation curves.
  - **Projects console**: Search, filter, and detail views for each solar farm.
  - **Battery Console**: state of charge (SoC) timelines, temperature histograms, health donuts, and high-fidelity battery telemetry popups.
  - **Analytics Console**: Gantt timelines showing tracking status intervals, wind speeds, and vector directions.
  - **Weather Center**: Weekly solar forecasts, irradiance measurements, and wind safety levels.
  - **Alarms System**: Console log to filter, review, and acknowledge faults.
  - **Reports & Admin**: DAS CSV reporting engines and team rosters.

## Decoupled Mock Architecture
All data schemas and operational states are completely isolated in `src/data/mockData.ts` and managed globally in `src/context/AppContext.tsx`. Swapping this mock database for active REST or GraphQL API streams can be completed by updating the data actions within the App Context without editing individual components.

---

## Local Setup & Development

First, ensure you have Node.js installed on your machine.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch local hot-reload dev server:
   ```bash
   npm run dev
   ```
3. Compile production-ready bundle:
   ```bash
   npm run build
   ```

---

## Vercel Deployment

Deploying directly to Vercel is set up out-of-the-box. The repository contains `vercel.json` to handle client-side routing fallback for Single Page Apps (SPAs).

### Option 1: Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy directly from repository root:
   ```bash
   vercel
   ```

### Option 2: GitHub Integration
1. Push this folder to your GitHub repository.
2. Link the repository to your Vercel Dashboard project.
3. Vercel will automatically detect Vite, configure the build command (`npm run build`), target directory (`dist`), and deploy on every push!
