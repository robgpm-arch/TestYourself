# Development notes

Run the local secret checker before committing to avoid accidentally committing service account keys.

Local quick checks:

```bash
node scripts/purge-secret-check.js
```

If it reports forbidden files, remove them and follow `SECURITY_REMOVAL.md` to rotate keys and purge history.

CI: This repository includes a workflow that runs a project-level secret scan (see `.github/workflows/ci.yml`).
