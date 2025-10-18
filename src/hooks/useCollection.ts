import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCollection(path: string, order?: [string, 'asc' | 'desc']) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, path);
    const q = order ? query(ref, orderBy(order[0], order[1])) : ref;
    const unsub = onSnapshot(q, snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [path, order?.[0], order?.[1]]);

  return { docs, loading };
}
