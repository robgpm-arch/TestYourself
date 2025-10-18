export interface PresignResponse {
  fileKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface CompleteUploadPayload {
  fileKey: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

const BACKEND_BASE_URL = 'https://backend.youware.com';

async function requestPresignedUpload(filename: string, contentType?: string) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType })
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload URL: ${await response.text()}`);
  }

  return (await response.json()).data as PresignResponse;
}

async function markUploadComplete(payload: CompleteUploadPayload) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/uploads/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to mark upload complete: ${await response.text()}`);
  }

  return response.json();
}

async function getDownloadUrl(fileKey: string) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/uploads/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey })
  });

  if (!response.ok) {
    throw new Error(`Failed to get download URL: ${await response.text()}`);
  }

  const result = await response.json();
  return result.data.downloadUrl as string;
}

async function uploadToPresignedUrl(
  file: File,
  uploadUrl: string,
  requiredHeaders: Record<string, string>,
  onProgress?: (progress: number) => void
) {
  const controller = new AbortController();
  const signal = controller.signal;

  const totalBytes = file.size;

  const xhr = new XMLHttpRequest();
  const progressPromise = new Promise<void>((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        const progress = (event.loaded / totalBytes) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.onabort = () => reject(new Error('Upload aborted'));
  });

  xhr.open('PUT', uploadUrl, true);
  Object.entries(requiredHeaders ?? {}).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });

  xhr.send(file);

  await progressPromise;

  return { controller };
}

export async function uploadFile(
  file: File,
  options?: { contentType?: string; metadata?: Record<string, unknown>; onProgress?: (progress: number) => void }
) {
  const presign = await requestPresignedUpload(file.name, options?.contentType ?? file.type);

  await uploadToPresignedUrl(file, presign.uploadUrl, presign.requiredHeaders, options?.onProgress);

  await markUploadComplete({
    fileKey: presign.fileKey,
    size: file.size,
    metadata: options?.metadata
  });

  return {
    fileKey: presign.fileKey,
    expiresAt: presign.expiresAt
  };
}

export async function uploadFromUrl(sourceUrl: string, filename: string, contentType?: string) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/uploads/from-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceUrl, filename, contentType })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload from URL: ${await response.text()}`);
  }

  return response.json();
}

export async function fetchDownloadUrl(fileKey: string) {
  return getDownloadUrl(fileKey);
}

export async function listUploads(limit = 50) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/uploads/list?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to list uploads: ${await response.text()}`);
  }
  const result = await response.json();
  return result.data as Array<Record<string, unknown>>;
}
