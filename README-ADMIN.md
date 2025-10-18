# Admin Operations Guide

This document describes how administrators configure TestYourself content, manage feature flags, and deliver downloadable resources across the web and Android apps.

## 1. Access Requirements

- **Admin authentication**: Admin flows rely on Firebase Auth. Ensure your admin account is flagged with the proper custom claims before visiting `/admin` routes.
- **Youware Backend**: File uploads, download links, and storage metadata require the deployed Cloudflare Worker in `backend/`. Confirm `STORAGE_API_TOKEN` and other environment variables from `backend/README.md` are configured.
- **Firestore security rules**: The admin catalog pages assume Firestore rules restrict mutations to admin roles only. Review `firestore.rules` before enabling production writes.

## 2. Admin Surface Overview

| Area | Route | Purpose |
| --- | --- | --- |
| Admin Panel | `/admin` | Launchpad that links to each catalog workspace, quick actions, and storage manager. |
| Admin Dashboard | `/admin/dashboard` | Real-time Firestore workspace with per-collection tabs, cascading filters, and CRUD tooling. |
| File Manager | `/admin/files` | Upload JSON, media, and document assets via presigned URLs backed by Youware storage and D1 metadata. |

Use the Admin Panel buttons to jump directly into the dashboard or storage manager.

## 3. Catalog Management (Admin Dashboard)

The dashboard (`src/pages/AdminDashboard.tsx`) streams collection data through `AdminCatalogService`. All changes are persisted to Firestore with audit metadata (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`).

### 3.1 Tab Structure & Prerequisites

Tabs map to Firestore collections defined in `src/types/firebase.ts`:

- **Mediums → Boards → Courses → Subjects → Chapters → Quiz Sets** follow a hierarchical dependency. Each child tab requires at least one parent entity before new records can be created.
- **App Screens** and **Leaderboards** are independent but offer optional subject filtering.

If prerequisites are not met, the dashboard presents guidance instead of the creation form.

### 3.2 Filters & Context

- Filter controls appear above the results grid and cascade: selecting a medium narrows boards, which narrows courses, and so on.
- Use **Clear Filters** to reset context before switching between unrelated catalogs.

### 3.3 CRUD Workflow

1. **Create / Edit**: Click **Add** or **Edit** to open the modal form. Field configs (labels, helper text, validation) are defined in the dashboard file, so updates only require editing `getFormFields`.
2. **Duplicate**: Copies the item (appends “(Copy)” to the name) and increments `order` for quick variations.
3. **Visibility Toggle**: `Visible` / `Hidden` buttons flip the `isVisible` flag without removing the record.
4. **Delete**: Permanently removes the document after confirmation. Ensure dependent child documents are handled before deletion.

### 3.4 Audit & Ordering

- Default ordering value is `1000`. Lower numbers surface earlier in the UI.
- All writes include timestamps and admin IDs using `serverTimestamp()` via `AdminCatalogService`.

### 3.5 Catalog Service Reference

`src/services/adminCatalogService.ts` encapsulates Firestore access:

- `subscribeToCollection` handles live snapshots and gracefully falls back to an empty list on errors.
- `createItem`, `updateItem`, `deleteItem`, `duplicateItem`, `toggleVisibility` wrap Firestore mutations and inject audit metadata.
- `buildRelationshipConstraint` helps compose custom filtered queries if more advanced views are required later.

## 4. File Management Workflow

The File Manager (`src/pages/AdminFileManager.tsx`) integrates with `src/services/storageService.ts` and the Youware Backend Worker.

### 4.1 Uploading Files

1. Choose a file (JSON, PDF, image, audio, video, etc.). Details are displayed for verification.
2. Click **Upload File**. Progress updates come from the raw `XMLHttpRequest` upload events.
3. On success the list refreshes, showing new metadata and status.

### 4.2 Listing & Searching

- `listUploads()` fetches the latest records (default limit 100) sorted by creation date.
- The search box filters by `fileName` or `fileKey` on the client for quick discovery.
- Each card shows size, MIME type, download count, and timestamps.

### 4.3 Download Links

- **Get Download URL** requests a short-lived presigned link from `/api/uploads/download` and opens it in a new tab.
- Every retrieval increments `download_count` in D1 so you can monitor asset usage.

### 4.4 Backend Storage Pipeline

The Worker (`backend/src/index.ts`) exposes:

- `POST /api/uploads/presign` → returns R2 presigned PUT URL plus required headers.
- `POST /api/uploads/complete` → records the finalized upload in `user_files`.
- `POST /api/uploads/from-url` → server-side ingest for remote assets.
- `POST /api/uploads/download` → returns presigned GET URL and logs the access.
- `GET /api/uploads/list` → paginated listing for the admin UI.

D1 table definition (`backend/schema.sql`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK | Auto-increment row ID. |
| `owner_id` | TEXT | Admin user ID (from request headers). |
| `file_key` | TEXT | Unique storage key returned by presign endpoint. |
| `file_name` | TEXT | Original filename. |
| `content_type` | TEXT | MIME type; optional. |
| `size` | INTEGER | File size in bytes. |
| `status` | TEXT | Workflow status (`pending`, `uploaded`, etc.). |
| `download_count` | INTEGER | Incremented whenever a presigned download URL is issued. |
| `metadata` | TEXT | JSON blob for auxiliary info. |
| `created_at` / `updated_at` | TEXT | ISO timestamps maintained by the worker. |

## 5. Operational Checklist

- After modifying admin UI code, run `npm run build` to verify production readiness.
- For backend changes, redeploy the worker with `npm run build && npx wrangler deploy` (see `backend/README.md`).
- Review Firestore indexes (`firestore.indexes.json`) if you introduce new query patterns.
- Keep `firebase.rules` aligned with the catalog schema so only admins mutate protected collections.

## 6. Troubleshooting Tips

- **Missing data**: Ensure the Firebase project is configured and AdminCatalogService subscriptions are not blocked by security rules.
- **Upload failures**: Check network panel for the presign request; the backend requires valid auth headers and `STORAGE_API_TOKEN`.
- **Download URL errors**: Tokens expire quickly—fetch a new link via **Get Download URL** whenever needed.
- **Filters show empty lists**: Reset filters via **Clear Filters** to rule out mismatched parent selections.

Refer back to this guide when onboarding new admins or expanding the catalog tooling.
