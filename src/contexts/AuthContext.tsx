import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User as FirebaseUser,
  onIdTokenChanged,
  signOut,
  getIdToken,
} from 'firebase/auth';
import AuthService from '../services/authService';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User as AppUser, COLLECTIONS } from '../types/firebase';

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  token: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_ENDPOINT = 'https://backend.youware.com/api/admin/claims';

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Safe console logging to prevent SDK crashes
  useEffect(() => {
    const safeConsole = () => {
      const methods = ['log', 'info', 'warn', 'error', 'debug'];
      for (const method of methods) {
        try {
          const fn = (console as any)[method];
          if (typeof fn !== 'function') {
            (console as any)[method] = console.log ? console.log.bind(console) : () => {};
          } else {
            (console as any)[method] = fn.bind(console);
          }
        } catch {
          (console as any)[method] = () => {};
        }
      }
    };
    safeConsole();
  }, []);

  // Force token refresh when user becomes admin
  useEffect(() => {
    if (isAdmin && firebaseUser) {
      (async () => {
        try {
          await firebaseUser.getIdToken(true); // Force refresh
          const tokenResult = await firebaseUser.getIdTokenResult();
          console.log('[Admin Token Refreshed] Claims:', tokenResult.claims);
        } catch (error) {
          console.error('Failed to refresh admin token:', error);
        }
      })();
    }
  }, [isAdmin, firebaseUser]);

  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }
    return null;
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setUser(null);
      setFirebaseUser(null);
      setToken(null);
      setIsAdmin(false);
      return;
    }

    setFirebaseUser(currentUser);
    const idToken = await getIdToken(currentUser, true);
    setToken(idToken);

    const data = await fetchUserData(currentUser.uid);
    setUser(data);
    const adminClaim = (await currentUser.getIdTokenResult())?.claims?.admin;
    setIsAdmin(Boolean(adminClaim));
  };

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (nextUser) => {
      setLoading(true);
      if (!nextUser) {
        setFirebaseUser(null);
        setToken(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setFirebaseUser(nextUser);
      const idToken = await nextUser.getIdToken();
      setToken(idToken);
      const data = await fetchUserData(nextUser.uid);
      setUser(data);
      const adminClaim = (await nextUser.getIdTokenResult())?.claims?.admin;
      setIsAdmin(Boolean(adminClaim));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setToken(null);
    setIsAdmin(false);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    firebaseUser,
    loading,
    isAdmin,
    token,
    refreshUser,
    logout,
  }), [user, firebaseUser, loading, isAdmin, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
