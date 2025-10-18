import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

export default function DebugAuth() {
  const [state, setState] = useState<any>({ loading: true });
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return setState({ loading: false, user: null });
      const token = await getIdTokenResult(u, true); // force refresh to pick up claims
      setState({
        loading: false,
        uid: u.uid,
        email: u.email,
        claims: token.claims,
      });
    });
    return () => unsub();
  }, []);
  return <pre style={{ padding: 16 }}>{JSON.stringify(state, null, 2)}</pre>;
}
