#!/usr/bin/env bash
# Helper: purge a file from git history using git-filter-repo
# IMPORTANT: This rewrites history. Coordinate with your team.

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo not found. Install with: pip install git-filter-repo" >&2
  exit 2
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-remove-from-history>" >&2
  echo "Example: $0 serviceAccountKey.json" >&2
  exit 2
fi

TARGET="$1"

echo "Creating mirror backup..."
git clone --mirror . repo-mirror.git || { echo "mirror clone failed"; exit 1; }
cd repo-mirror.git || exit 1

echo "Purging ${TARGET} from history..."
git filter-repo --invert-paths --paths "${TARGET}" || { echo "git-filter-repo failed"; exit 1; }

echo "The history has been rewritten in the mirror at repo-mirror.git."
echo "REVIEW the mirror before pushing to remote. To push the rewritten history to origin, run the following from inside repo-mirror.git:"
echo "  git remote -v"
echo "  # Verify remotes and then run:"
echo "  git push --force --all origin"
echo "  git push --force --tags origin"
echo "After pushing, inform collaborators to re-clone the repository."
