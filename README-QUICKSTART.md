# TestYourself Quickstart Checklist

Use this checklist to bootstrap a new TestYourself environment across Web and mobile targets.

## 1. Repository & Tooling
- [ ] Clone the repo and install Node.js 18 or newer.
- [ ] Run `npm install` at the project root to install web dependencies.
- [ ] Install the Capacitor CLI globally if you plan to build native shells: `npm install -g @capacitor/cli`.
- [ ] (Optional) Prepare Android Studio and Xcode if targeting native builds.

## 2. Environment Variables
- [ ] Copy `.env.example` to `.env` (and `.env.local` if needed).
- [ ] Fill in `VITE_FIREBASE_*` values from your Firebase project.
- [ ] Add any required service keys (notification, analytics, etc.) while keeping secrets out of version control.

## 3. Firebase Configuration
- [ ] Replace `android/app/google-services.json` with your Firebase Android config.
- [ ] For iOS builds, add the matching `GoogleService-Info.plist` once the iOS platform is generated.
- [ ] Verify Firestore rules (`firestore.rules`) restrict write access to admin users.
- [ ] Confirm indexes in `firestore.indexes.json` cover catalog queries (medium → board → course → ...).

## 4. Backend Worker (Youware Backend)
- [ ] Ensure the Youware Backend MCP tool is enabled for the project.
- [ ] Review `backend/README.md` for deployment prerequisites.
- [ ] Install backend dependencies: `cd backend && npm install`.
- [ ] Set Worker secrets: `wrangler secret put STORAGE_API_TOKEN`.
- [ ] Deploy the Worker (`npm run deploy`) so `/api/uploads/*` endpoints are available.
- [ ] Verify the D1 schema via Youware Backend (table: `user_files`).

## 5. Web Application Build
- [ ] Run `npm run build` to confirm the production bundle succeeds.
- [ ] Optionally run `npm run dev` for local development.
- [ ] After changes, always re-run `npm run build` to keep the release pipeline green.

## 6. Mobile (Capacitor) Sync
- [ ] Generate icons & splash assets: `npm run icons:generate`.
- [ ] Add platforms if missing (`npx cap add android`, `npx cap add ios`).
- [ ] Sync the web build: `npm run build && npx cap sync`.
- [ ] Open native projects for device testing (`npm run cap:android`, `npm run cap:ios`).

## 7. Admin & Content Operations
- [ ] Authenticate as an admin user before visiting `/admin` routes.
- [ ] Seed catalog data through the Admin Dashboard (mediums → boards → courses → subjects → chapters → quiz sets).
- [ ] Upload assets via `/admin/files`; confirm uploads land in R2 and appear in the `user_files` table.

## 8. QA & Launch Readiness
- [ ] Smoke-test primary user flows (quiz taking, leaderboard, profile, payments if enabled).
- [ ] Validate push notifications configuration using `README-PUSH-NOTIFICATIONS.md` as reference.
- [ ] Update Play Store assets under `playstore-assets/` before submission.
- [ ] Document any launch blockers or follow-ups in the project tracker.

Keep this checklist up to date as tooling or infrastructure evolves.
