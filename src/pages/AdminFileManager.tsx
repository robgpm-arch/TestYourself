import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { uploadFile, listUploads, fetchDownloadUrl } from '../services/storageService';

interface UploadItem {
  fileKey: string;
  fileName: string;
  contentType?: string;
  size?: number;
  status: string;
  downloadCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface UploadProgressState {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(2)} ${units[exponent]}`;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const AdminFileManager: React.FC = () => {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressState, setProgressState] = useState<UploadProgressState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter(
      file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.fileKey.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listUploads(100);
      setFiles(
        result.map(item => ({
          fileKey: String(item.fileKey ?? ''),
          fileName: String(item.fileName ?? item.fileKey ?? ''),
          contentType: item.contentType as string | undefined,
          size: typeof item.size === 'number' ? item.size : undefined,
          status: String(item.status ?? 'unknown'),
          downloadCount: typeof item.downloadCount === 'number' ? item.downloadCount : 0,
          createdAt: String(item.createdAt ?? ''),
          updatedAt: item.updatedAt as string | undefined,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load uploads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setProgressState(null);
  };

  const uploadSelectedFile = async () => {
    if (!selectedFile) return;
    setProgressState({
      fileName: selectedFile.name,
      progress: 0,
      status: 'uploading',
    });

    try {
      await uploadFile(selectedFile, {
        onProgress: progress => {
          setProgressState(prev =>
            prev && prev.status === 'uploading' ? { ...prev, progress } : prev
          );
        },
      });

      setProgressState(prev => (prev ? { ...prev, progress: 100, status: 'complete' } : prev));

      setSelectedFile(null);
      setIsRefreshing(true);
      await loadFiles();
    } catch (err) {
      console.error(err);
      setProgressState(prev =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: err instanceof Error ? err.message : 'Upload failed',
            }
          : prev
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadFile = async (fileKey: string) => {
    try {
      const url = await fetchDownloadUrl(fileKey);
      window.open(url, '_blank');
      setIsRefreshing(true);
      await loadFiles();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch download URL');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <section className="bg-slate-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="space-y-2">
            <span className="text-sm uppercase tracking-[0.35em] text-blue-300/80">
              Admin Storage
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold">File Management Workspace</h1>
            <p className="text-slate-200/80 max-w-3xl">
              Upload JSON, videos, audio, text, and PDF resources securely via pre-signed URLs.
              Files are served from Youware storage with full audit trails in D1.
            </p>
          </div>

          <Card variant="gradient" className="bg-white text-slate-900">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Select a file to upload
                </label>
                <Input type="file" onChange={handleFileChange} fullWidth />
                {selectedFile && (
                  <div className="text-sm text-slate-600">
                    <div>
                      <strong>Name:</strong> {selectedFile.name}
                    </div>
                    <div>
                      <strong>Type:</strong> {selectedFile.type || '—'}
                    </div>
                    <div>
                      <strong>Size:</strong> {formatSize(selectedFile.size)}
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="large"
                  disabled={!selectedFile || progressState?.status === 'uploading'}
                  onClick={uploadSelectedFile}
                >
                  {progressState?.status === 'uploading' ? 'Uploading…' : 'Upload File'}
                </Button>
                {progressState && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">
                      {progressState.fileName}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progressState.status === 'error'
                            ? 'bg-red-500'
                            : progressState.status === 'complete'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progressState.progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">
                      {progressState.status === 'error' && progressState.error
                        ? progressState.error
                        : progressState.status === 'complete'
                          ? 'Upload complete'
                          : `${progressState.progress.toFixed(0)}%`}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Search files</label>
                <Input
                  placeholder="Filter by name or key…"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  fullWidth
                />
                <p className="text-sm text-slate-500">
                  Filter results to quickly locate content before generating fresh download links.
                  Every download increments usage metadata.
                </p>
                <Button
                  variant="outline"
                  onClick={() => loadFiles()}
                  disabled={isLoading || isRefreshing}
                >
                  {isLoading || isRefreshing ? 'Refreshing…' : 'Refresh List'}
                </Button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Uploaded Files</h2>
              <p className="text-sm text-slate-600">
                {filteredFiles.length} items • sorted by created date
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-slate-500 py-10">Loading uploads…</div>
          ) : filteredFiles.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-600">
                No files available yet. Upload a resource to begin building your library.
              </p>
            </Card>
          ) : (
            <ResponsiveGrid cols={{ default: 1, md: 2, xl: 3 }} gap={5}>
              {filteredFiles.map(file => (
                <Card key={file.fileKey} variant="elevated" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg font-semibold text-slate-900 truncate"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {file.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div>
                      <strong>Key:</strong>{' '}
                      <span className="break-words text-slate-500">{file.fileKey}</span>
                    </div>
                    <div>
                      <strong>Type:</strong> {file.contentType ?? '—'}
                    </div>
                    <div>
                      <strong>Size:</strong> {formatSize(file.size)}
                    </div>
                    <div>
                      <strong>Downloads:</strong> {file.downloadCount}
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(file.createdAt)}
                    </div>
                    <div>
                      <strong>Updated:</strong> {formatDate(file.updatedAt)}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" onClick={() => downloadFile(file.fileKey)}>
                      Get Download URL
                    </Button>
                  </div>
                </Card>
              ))}
            </ResponsiveGrid>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AdminFileManager;
