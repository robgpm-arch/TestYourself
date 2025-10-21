# Emergency: Remove committed service account and rotate credentials

This repository currently contains a committed Firebase service account key (`serviceAccountKey.json`). That is a critical secret. Follow these steps immediately to remediate and re-secure the project.

1) Rotate and revoke the compromised key (GCP/Firebase)
   - Go to the Google Cloud Console -> IAM & Admin -> Service Accounts
   - Find the service account named similar to the exposed client_email (check `serviceAccountKey.json` in your repo) and delete the exposed key(s)
   - Create a new service account key if needed and store it securely outside the repo (use your CI secret store)

2) Purge the secret from git history (locally, coordinate with team)
   - Recommended: use `git filter-repo` (fast and safe). Example:
     - Install: `pip install git-filter-repo`
     - Backup: `git clone --mirror <repo> repo-mirror.git`
     - Run: `git filter-repo --invert-paths --paths serviceAccountKey.json`
     - Force push the rewritten history: `git push --force --all` and `git push --force --tags`
   - Alternative (BFG): `bfg --delete-files serviceAccountKey.json` then run `git reflog expire --expire=now --all && git gc --prune=now --aggressive` and force-push.
   - Inform any collaborators to re-clone after history rewrite.

3) Remove the file and ensure .gitignore blocks future commits
   - Remove the file from working tree: `git rm --cached serviceAccountKey.json` then commit and push.
   - Ensure `.gitignore` contains `serviceAccount*.json` or `*.key.json` (already present in this repo). Commit the `.gitignore` change.

4) Add new key to CI / secret manager
   - Add the new JSON to your CI secrets (GitHub Actions: `Settings -> Secrets -> Actions`) as `FIREBASE_SERVICE_ACCOUNT_TESTYOURSELF_80A10` (or similar - match your workflows)
   - Update any scripts that read local files to instead read process env variables (the backend in this repo already reads `FIREBASE_SERVICE_ACCOUNT` from env in `backend/src/index.ts`)

5) Re-run your secret-scan workflow and confirm no secrets remain in repo or branches.

6) Rotate any other credentials that may have been included (API keys, tokens) if you suspect exposure.

If you want, I can:
- Prepare the exact `git filter-repo` or BFG commands tailored to this repo and a safe push plan.
- Create a GitHub Actions workflow to refuse commits that include common secret filenames.

Helper script

- There is a helper at `scripts/purge-history.sh` that wraps `git filter-repo` usage. Review it locally and run from a safe machine after backing up.
