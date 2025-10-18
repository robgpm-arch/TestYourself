import { getStorage, ref, listAll, getMetadata } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import app from '../../config/firebase';

const db = (await import('../../config/firebase')).db;

type AssetItem = { name: string; path: string; contentType?: string; bytes?: number };

export async function indexAssets(
  prefixes = ['assets/backgrounds', 'assets/overlays', 'assets/icons']
) {
  const storage = getStorage(app);
  const all: AssetItem[] = [];

  for (const p of prefixes) {
    const r = ref(storage, p);
    const res = await listAll(r);
    for (const f of res.items) {
      const meta = await getMetadata(f).catch(() => undefined);
      all.push({
        name: f.name.replace(/\.[^.]+$/, ''),
        path: f.fullPath,
        contentType: meta?.contentType,
        bytes: meta?.size,
      });
    }
  }

  // Save a manifest so Admin can show/search without listing every time
  await setDoc(
    doc(db, 'assets_manifest', 'default'),
    { items: all, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return all.length;
}

export function listenAssetManifest(cb: (items: any[]) => void) {
  const ref = doc(db, 'assets_manifest', 'default');
  return onSnapshot(ref, snap => {
    const items = snap.data()?.items ?? [];
    cb(items);
  });
}
