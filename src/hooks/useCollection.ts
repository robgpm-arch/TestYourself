import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDb } from '../lib/firebaseClient';

export function useCollection(path: string, order?: [string, 'asc' | 'desc']) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        const db = await getDb();
        const ref = collection(db, path);
        const q = order ? query(ref, orderBy(order[0], order[1])) : ref;
        unsub = onSnapshot(q, snap => {
          setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      } catch (e) {
        console.error('useCollection subscribe failed', e);
        setLoading(false);
        setDocs([]);
      }
    })();
    return () => unsub?.();
  }, [path, order?.[0], order?.[1]]);

  return { docs, loading };
}
