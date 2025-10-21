This file documents safe, repeatable steps to build and deploy the site to Firebase Hosting (testyourself.app) and to set up GitHub Actions deploys.

PRE-REQS
- You must have a Firebase project configured for testyourself.app and you must be a project owner or owner of the billing account if functions are used.
- Install Node.js (LTS) and npm, and the Firebase CLI (npm i -g firebase-tools).
- Ensure the compromised `serviceAccountKey.json` has been revoked/rotated before adding service-account-based credentials anywhere.

OPTION A — Manual deploy using Firebase CLI (fast, one-off)
1) Build locally:

```powershell
npm ci
npm run build
```

2) Log in and generate a short-lived token (for CI use you'll create an ephemeral token):

```powershell
# Opens a browser to authenticate and prints a token
firebase login:ci
```

Copy the printed token. Keep it secret.

3) Deploy using the token (or login interactively):

```powershell
# Using token (CI-style):
setx FIREBASE_TOKEN "<PASTE_TOKEN>" /M
# Or run interactive login:
# firebase login

# Deploy hosting (and functions if needed):
firebase deploy --only hosting
# or for hosting+functions:
# firebase deploy --only hosting,functions
```

OPTION B – GitHub Actions deploy (Service Account JSON)
1) Create a CI token locally (run `firebase login:ci`) and save the token securely.
2) In GitHub, go to your repository Settings -> Secrets -> Actions and add:
   - FIREBASE_SERVICE_ACCOUNT = the raw JSON for a Google Cloud service account key with deploy permissions (see below)
   - (Optional) CF_API_TOKEN if you also use Cloudflare for DNS/Workers
3) The workflow `.github/workflows/deploy.yml` is configured to authenticate with the service account using `google-github-actions/auth` and then run `firebase deploy --only hosting,functions --project testyourself-80a10`.
4) Push to the deploy branch (e.g., `main` or `production`) or open a PR depending on workflow gating. The Action will run the build and deploy steps.

Service account setup
- In Google Cloud Console, create a service account (e.g., `gh-actions-deployer@testyourself-80a10.iam.gserviceaccount.com`).
- Grant roles needed to deploy:
  - Firebase Hosting Admin
  - Cloud Functions Admin
  - Cloud Run Admin
  - Service Account User
  - Artifact Registry Writer (or Admin)
  - Eventarc Admin
  - (Optional) Firebase Admin for convenience in cross‑service operations
- Create a JSON key and paste the raw JSON into GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT`.

Notes & safety
- Do NOT commit service account JSON into the repo. If a service account was leaked, rotate/revoke the key immediately in the GCP console and follow `SECURITY_REMOVAL.md`.
- For functions: if your `functions/` directory uses a service account key for local emulation, replace with Application Default Credentials or configure CI to use the Firebase token + GCP service connection.
- After adding secrets to GitHub, test the workflow on a protected branch and then merge to `main`.

If you'd like, I can:
- Run the local build and produce a deploy token for you to paste into GitHub (I cannot generate tokens on your behalf).
- Configure `deploy.yml` to target your Firebase project ID and hosting site name if you provide them.
- Walk through revoking the compromised service account step-by-step.

OPTION C – GitHub Actions deploy (Workload Identity Federation, zero-key) — Recommended
1) Create a dedicated deployer service account in your Firebase project (GCP):
   - Email: `github-deployer@testyourself-80a10.iam.gserviceaccount.com`
   - Roles (least privilege): Firebase Hosting Admin, Cloud Functions Admin, Cloud Run Admin, Service Account User. Add Artifact Registry Writer and Eventarc Admin if deploying Gen-2/Eventarc functions.
2) Create a Workload Identity Pool + Provider (OIDC for GitHub Actions):
   - Pool: `github-pool` (location: global)
   - Provider: `github-provider` with issuer `https://token.actions.githubusercontent.com`
   - Attribute mapping includes `attribute.repository=assertion.repository`.
3) Allow your repo to impersonate the service account:
   - Grant `roles/iam.workloadIdentityUser` to principal set: `principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/attribute.repository/<GITHUB_OWNER>/TestYourself`
4) The workflows are already configured:
   - `.github/workflows/deploy.yml` deploys Hosting + Functions on push to `main`/`master` using WIF.
   - `.github/workflows/preview.yml` creates Hosting preview channels for pull requests (expires in 7 days).
   - Replace `<PROJECT_NUMBER>` with your project number if different. Current config uses `1029386064107` derived from your Firebase App ID.
5) No secrets/keys are required in GitHub — OIDC/WIF handles short‑lived credentials securely.

Finishing Steps (copy–paste)
1) Fill the `GCP_WIF_PROVIDER` secret

```
gcloud projects describe testyourself-80a10 --format='value(projectNumber)'
# -> e.g. 123456789012

# Provider string to place in GitHub → Settings → Secrets and variables → Actions:
# projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

2) Bind your repo to the deployer SA

```
PROJECT=testyourself-80a10
PN=$(gcloud projects describe $PROJECT --format='value(projectNumber)')

gcloud iam service-accounts add-iam-policy-binding \
  github-deployer@$PROJECT.iam.gserviceaccount.com \
  --role='roles/iam.workloadIdentityUser' \
  --member="principalSet://iam.googleapis.com/projects/$PN/locations/global/workloadIdentityPools/github-pool/attribute.repository/<GH_ORG_OR_USER>/TestYourself"
```

Roles (least‑privilege):
- roles/firebasehosting.admin
- roles/cloudfunctions.admin
- roles/cloudrun.admin
- roles/serviceaccount.user
Add `roles/artifactregistry.writer` and `roles/eventarc.admin` only if needed for Gen‑2/Eventarc.

Validate pipeline
- Push a trivial commit to `main` → should build and deploy hosting + functions.
- Open a PR → should post a Preview URL comment and show in logs.

Rollback tips

```
firebase hosting:versions:list --project testyourself-80a10
firebase hosting:rollback <VERSION_ID> --project testyourself-80a10
```
