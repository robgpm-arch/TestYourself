# Purge plan: remove committed service account from git history

This document contains exact commands and a safe plan to remove `serviceAccountKey.json` from your repository history. DO NOT run these commands without a local backup and coordination with your team. This will rewrite history and requires force-push.

Preferred: git-filter-repo (recommended)

1) Install git-filter-repo
   - pip install --user git-filter-repo

2) Create a mirror backup
   - git clone --mirror https://github.com/<owner>/<repo>.git repo-mirror.git
   - cd repo-mirror.git

3) Run filter-repo to remove the file
   - git filter-repo --invert-paths --paths serviceAccountKey.json

4) Inspect the mirror
   - git log --stat --all | git grep -n "serviceAccountKey.json" || true

5) If satisfied, push rewritten history (manual step)
   - git remote add origin https://github.com/<owner>/<repo>.git
   - git push --force --all origin
   - git push --force --tags origin

6) Notify collaborators to re-clone the repository.

Alternative: BFG Repo-Cleaner (simpler)

1) Download BFG jar from https://rtyley.github.io/bfg-repo-cleaner/
2) Create a mirror: git clone --mirror <repo> repo-mirror.git
3) Run: java -jar bfg.jar --delete-files serviceAccountKey.json repo-mirror.git
4) cd repo-mirror.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
5) Inspect and push (same as above)

Post-purge steps (must do):
- Rotate the service account key in GCP and reissue new credentials.
- Replace any scripts that read local files with env-based secrets (CI secrets). The backend already supports `FIREBASE_SERVICE_ACCOUNT` env.
- Re-run secret-scan and CI.
