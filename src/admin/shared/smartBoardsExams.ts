import { getDb } from '@/lib/firebaseClient';
import { collection, getDocs, orderBy, query, where, limit } from 'firebase/firestore';

type AnyDoc = { id: string; [k: string]: any };

async function tryQueries(
  coll: string,
  medium: string,
  nameKeys = ['name', 'title', 'label']
): Promise<AnyDoc[]> {
  const db = await getDb();
  const ref = collection(db, coll);

  // For exams, always include fallback since they're typically not medium-specific
  const alwaysIncludeFallback = coll === 'exams';

  // Try common schema patterns in order (fast failover)
  const candidates = [
    query(ref, where('medium', '==', medium)),
    query(ref, where('mediumId', '==', medium)),
    query(ref, where('language', '==', medium)),
    query(ref, where('medium_code', '==', medium)),
    // array-contains variants
    query(ref, where('mediums', 'array-contains', medium)),
    query(ref, where('languages', 'array-contains', medium)),
  ];

  // Add fallback for exams or when medium is empty
  if (alwaysIncludeFallback || !medium) {
    candidates.push(query(ref, limit(100)));
  }

  for (const q of candidates) {
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }) as AnyDoc);
        // prefer server field "order", otherwise alpha by name/title/label
        rows.sort((a, b) => {
          const ao = (a as any).order ?? 999999,
            bo = (b as any).order ?? 999999;
          if (ao !== bo) return ao - bo;
          const an = (nameKeys.map(k => (a as any)[k]).find(Boolean) ?? '').toString();
          const bn = (nameKeys.map(k => (b as any)[k]).find(Boolean) ?? '').toString();
          return an.localeCompare(bn);
        });
        return rows;
      }
    } catch (err) {
      // ignore and try next pattern
      console.warn(`[smart] ${coll} query failed`, err);
    }
  }
  return [];
}

export async function loadBoardsForMedium(medium: string) {
  return medium ? tryQueries('boards', medium) : [];
}

export async function loadExamsForMedium(medium: string) {
  // Exams are typically not medium-specific, so always include fallback
  return tryQueries('exams', medium);
}
