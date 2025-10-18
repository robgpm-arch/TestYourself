import * as React from 'react';
import { getStorage, listAll, ref, getDownloadURL } from 'firebase/storage';
import { FALLBACK_THUMBNAILS } from '@/admin/shared/options';

type Opt = { id: string; name: string; url: string };

export function ThumbnailSelect({
  value,
  onChange,
  storagePath = 'assets/thumbnails',
}: {
  value: string;
  onChange: (url: string) => void;
  storagePath?: string;
}) {
  const [opts, setOpts] = React.useState<Opt[]>(FALLBACK_THUMBNAILS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const st = getStorage();
        const folder = ref(st, storagePath);
        const all = await listAll(folder);
        const urls: Opt[] = await Promise.all(
          all.items.map(async item => {
            const url = await getDownloadURL(item);
            return { id: item.name, name: item.name, url };
          })
        );
        if (urls.length) setOpts([...urls, ...FALLBACK_THUMBNAILS]);
      } catch {
        // no storage items or no permission – keep fallbacks only
      } finally {
        setLoading(false);
      }
    })();
  }, [storagePath]);

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Thumbnail</label>
      <div className="flex items-center gap-3">
        <select
          className="border rounded px-3 py-2 flex-1"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">{loading ? 'Loading…' : 'Select a thumbnail'}</option>
          {opts.map(o => (
            <option key={o.id} value={o.url}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="w-16 h-10 rounded overflow-hidden border bg-slate-50 flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">preview</span>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Storage path: <code>{storagePath}</code>. Add JPG/PNG files there to auto-appear.
      </div>
    </div>
  );
}
