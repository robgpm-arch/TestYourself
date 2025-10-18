import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const STORAGE_BASE_URL = 'https://storage.youware.me';

interface Env {
  DB: D1Database;
  STORAGE_API_TOKEN?: string;
  PROJECT_ID?: string;
  UPLOADS_BUCKET?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
}

type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'OPTIONS'] }));

let firebaseAdminApp: App | null = null;

const getFirebaseAdmin = (env: Env) => {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT secret is not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  firebaseAdminApp = initializeApp({
    credential: cert(serviceAccount)
  });

  return firebaseAdminApp;
};

const jsonResponse = (data: JsonValue, status = 200) =>
  new Response(JSON.stringify({ success: status < 400, data }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const errorResponse = (message: string, status = 400) =>
  new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const sanitizeFilename = (name: string) => {
  const trimmed = name.trim().toLowerCase();
  const replaced = trimmed.replace(/[^a-z0-9_.-]+/g, '-');
  return replaced.replace(/-{2,}/g, '-').replace(/^-|-$/g, '') || 'file';
};

const buildFileKey = (userId: string, filename: string) => {
  const safeName = sanitizeFilename(filename);
  const timestamp = Date.now();
  const random = crypto.randomUUID().split('-')[0];
  return `uploads/${userId}/${timestamp}-${random}-${safeName}`;
};

const withAuth = (
  handler: (
    c: Hono.Context<{ Bindings: Env }> ,
    user: { id: string; isLogin: boolean; token?: string; isAdmin: boolean }
  ) => Promise<Response> | Response
) => {
  return async (c: Hono.Context<{ Bindings: Env }>) => {
    const userId = c.req.header('X-Encrypted-Yw-ID');
    const isLogin = c.req.header('X-Is-Login') === '1';
    const authHeader = c.req.header('Authorization');
    if (!userId) {
      return errorResponse('Missing user identity header', 401);
    }

    let isAdmin = false;
    let token: string | undefined;

    if (isLogin && authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
      try {
        const app = getFirebaseAdmin(c.env);
        const decoded = await getAuth(app).verifyIdToken(token, true);
        isAdmin = decoded.admin === true;
      } catch (err) {
        console.error('Failed to verify token for admin check', err);
      }
    }

    return handler(c, { id: userId, isLogin, token, isAdmin });
  };
};

app.post(
  '/api/admin/claims',
  withAuth(async (c, user) => {
    if (!user.isLogin) {
      return errorResponse('Authentication required', 401);
    }

    if (!user.isAdmin) {
      return errorResponse('Admin privileges required', 403);
    }

    const { uid, isAdmin } = await c.req.json<{ uid?: string; isAdmin?: boolean }>().catch(() => ({}) as any);
    if (!uid || typeof isAdmin !== 'boolean') {
      return errorResponse('uid (string) and isAdmin (boolean) are required', 400);
    }

    try {
      const app = getFirebaseAdmin(c.env);
      await getAuth(app).setCustomUserClaims(uid, { admin: isAdmin });
      return jsonResponse({ uid, admin: isAdmin });
    } catch (error: any) {
      console.error('Failed to set admin claim', error);
      return errorResponse(error?.message ?? 'Failed to set admin claim', 500);
    }
  })
);

const callStorage = async (
  env: Env,
  path: string,
  body: Record<string, unknown>
): Promise<any> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (env.STORAGE_API_TOKEN) {
    headers.Authorization = `Bearer ${env.STORAGE_API_TOKEN}`;
  }
  if (env.PROJECT_ID) {
    headers['X-Project-Id'] = env.PROJECT_ID;
  }

  const response = await fetch(`${STORAGE_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Storage API error (${response.status}): ${text}`);
  }

  return response.json();
};

app.post(
  '/api/uploads/presign',
  withAuth(async (c, user) => {
    if (!user.isLogin) {
      return errorResponse('Authentication required', 401);
    }

    const env = c.env;
    const { filename, contentType, cacheControl } = await c.req.json<{
      filename?: string;
      contentType?: string;
      cacheControl?: string;
    }>().catch(() => ({}) as any);

    if (!filename) {
      return errorResponse('filename is required');
    }

    const fileKey = buildFileKey(user.id, filename);

    await env.DB.prepare(
      `INSERT INTO user_files (owner_id, file_key, file_name, content_type)
       VALUES (?, ?, ?, ?)`
    ).bind(user.id, fileKey, filename, contentType ?? null).run();

    const uploadRequest: Record<string, unknown> = {
      key: fileKey,
      contentType,
      cacheControl
    };

    const result = await callStorage(env, '/presign/upload', uploadRequest);

    return jsonResponse({
      fileKey,
      uploadUrl: result.url,
      requiredHeaders: result.requiredHeaders ?? {},
      expiresAt: result.expiresAt
    });
  })
);

app.post(
  '/api/uploads/complete',
  withAuth(async (c, user) => {
    if (!user.isLogin) {
      return errorResponse('Authentication required', 401);
    }

    const env = c.env;
    const { fileKey, size, metadata } = await c.req.json<{
      fileKey?: string;
      size?: number;
      metadata?: Record<string, unknown>;
    }>().catch(() => ({}) as any);

    if (!fileKey) {
      return errorResponse('fileKey is required');
    }

    const stmt = await env.DB.prepare(
      `UPDATE user_files
       SET status = 'uploaded', size = COALESCE(?, size), metadata = COALESCE(?, metadata),
           updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       WHERE file_key = ? AND owner_id = ?`
    ).bind(size ?? null, metadata ? JSON.stringify(metadata) : null, fileKey, user.id).run();

    if (!stmt.success || stmt.changes === 0) {
      return errorResponse('file not found or not owned by user', 404);
    }

    return jsonResponse({ fileKey, status: 'uploaded' });
  })
);

app.post(
  '/api/uploads/from-url',
  withAuth(async (c, user) => {
    if (!user.isLogin) {
      return errorResponse('Authentication required', 401);
    }

    const env = c.env;
    const { sourceUrl, filename, contentType } = await c.req.json<{
      sourceUrl?: string;
      filename?: string;
      contentType?: string;
    }>().catch(() => ({}) as any);

    if (!sourceUrl || !filename) {
      return errorResponse('sourceUrl and filename are required');
    }

    const fileKey = buildFileKey(user.id, filename);

    const result = await callStorage(env, '/upload/from-url', {
      url: sourceUrl,
      key: fileKey,
      contentType
    });

    await env.DB.prepare(
      `INSERT INTO user_files (owner_id, file_key, file_name, content_type, size, status)
       VALUES (?, ?, ?, ?, ?, 'uploaded')`
    ).bind(user.id, fileKey, filename, contentType ?? null, result.size ?? null).run();

    return jsonResponse({ fileKey, size: result.size ?? null, uploadedAt: result.uploaded_at });
  })
);

app.post(
  '/api/uploads/download',
  withAuth(async (c, user) => {
    if (!user.isLogin) {
      return errorResponse('Authentication required', 401);
    }

    const env = c.env;
    const { fileKey } = await c.req.json<{ fileKey?: string }>().catch(() => ({}) as any);

    if (!fileKey) {
      return errorResponse('fileKey is required');
    }

    const file = await env.DB.prepare(
      `SELECT id, status FROM user_files WHERE file_key = ? AND owner_id = ?`
    ).bind(fileKey, user.id).first();

    if (!file) {
      return errorResponse('file not found or not owned by user', 404);
    }

    if (file.status !== 'uploaded') {
      return errorResponse('file is not ready for download', 409);
    }

    const result = await callStorage(env, '/presign/download', { key: fileKey });

    await env.DB.prepare(
      `UPDATE user_files
       SET download_count = download_count + 1,
           updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       WHERE id = ?`
    ).bind(file.id).run();

    return jsonResponse({ downloadUrl: result.url, expiresAt: result.expiresAt });
  })
);

app.get(
  '/api/uploads/list',
  withAuth(async (c, user) => {
    const env = c.env;
    const limit = Math.min(Number(c.req.query('limit') ?? 50), 100);

    const { results } = await env.DB.prepare(
      `SELECT file_key as fileKey, file_name as fileName, content_type as contentType,
              size, status, download_count as downloadCount, created_at as createdAt,
              updated_at as updatedAt
       FROM user_files
       WHERE owner_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(user.id, limit).all();

    return jsonResponse(results ?? []);
  })
);

app.get('/health', (c) => jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
