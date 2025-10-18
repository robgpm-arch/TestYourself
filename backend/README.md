# TestYourself Backend Worker

This Worker provides secure file upload and download integration using Youware Backend and Cloudflare R2. It exposes endpoints that generate presigned URLs so clients can upload files directly to storage without proxying through the Worker.

## Endpoints

- `POST /api/uploads/presign`: Request a presigned upload URL for a file. Body requires `filename` and optional `contentType`, `cacheControl`.
- `POST /api/uploads/complete`: Notify the backend that the upload has finished. Body requires `fileKey`, optional `size`, `metadata`.
- `POST /api/uploads/from-url`: Upload an external file by URL directly to storage.
- `POST /api/uploads/download`: Obtain a presigned download URL for a stored file.
- `GET /api/uploads/list`: List uploads owned by the current user.
- `GET /health`: Health check.

## Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure Wrangler secrets/vars

```bash
wrangler secret put STORAGE_API_TOKEN
```

`wrangler.toml` already includes project vars (`PROJECT_ID`, `UPLOADS_BUCKET`).

3. Deploy Worker

```bash
npm run deploy
```

Or test locally:

```bash
npm run dev
```

## Database

The Worker uses Cloudflare D1 with the `user_files` table defined in `schema.sql`. Run the migrations commands via Youware Backend SQL execution to ensure the schema exists.
