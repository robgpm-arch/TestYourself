#!/usr/bin/env bash
set -euo pipefail

# Zero-key GitHub Actions deploy setup using Workload Identity Federation.
# Run this in Google Cloud Shell or any environment with gcloud authenticated
# to your Firebase/GCP project.

# --- CONFIG ---
# REQUIRED: set your project id and GitHub owner name (user or org)
GCP_PROJECT_ID="testyourself-80a10"
GITHUB_OWNER="<YOUR_GITHUB_USER_OR_ORG>"   # e.g., robgpm-arch
GITHUB_REPO="TestYourself"

# OPTIONAL: names for resources
SA_NAME="github-deployer"
POOL_ID="github-pool"
PROVIDER_ID="github-provider"

echo "Using project: $GCP_PROJECT_ID"
gcloud config set project "$GCP_PROJECT_ID" 1>/dev/null

# Discover project number (used in principalSet URI)
PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')
echo "Project number: $PROJECT_NUMBER"

SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

echo "\n[1/5] Creating service account: $SA_EMAIL"
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions Deployer" \
  --project="$GCP_PROJECT_ID" || true

echo "\n[2/5] Granting least-privilege roles"
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/firebasehosting.admin" 1>/dev/null || true
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudfunctions.admin" 1>/dev/null || true
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudrun.admin" 1>/dev/null || true
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/serviceaccount.user" 1>/dev/null || true

echo "(Optional) Add Artifact Registry Writer and Eventarc Admin if using Gen-2/Eventarc"
# Uncomment if needed:
# gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.writer"
# gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$SA_EMAIL" --role="roles/eventarc.admin"

echo "\n[3/5] Creating Workload Identity Pool + Provider"
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$GCP_PROJECT_ID" --location=global \
  --display-name="GitHub pool" 1>/dev/null || true

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$GCP_PROJECT_ID" --location=global \
  --workload-identity-pool="$POOL_ID" \
  --display-name="GitHub OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" 1>/dev/null || true

PROVIDER_RESOURCE="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"

echo "\n[4/5] Allowing repo to impersonate service account via WIF"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$GITHUB_OWNER/$GITHUB_REPO" 1>/dev/null || true

echo "\n[5/5] Summary"
cat <<EOF
Service Account:   $SA_EMAIL
WIF Pool:          $POOL_ID (global)
WIF Provider:      $PROVIDER_ID
Provider Resource: $PROVIDER_RESOURCE
Repo Bound:        $GITHUB_OWNER/$GITHUB_REPO

Next steps:
- Ensure .github/workflows/deploy.yml and preview.yml use:
  workload_identity_provider: $PROVIDER_RESOURCE
  service_account: $SA_EMAIL
- Push to main/master for deploys, open PRs for preview channels.
EOF

