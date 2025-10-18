import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../lib/firebase';
import { User, UserProfile, UserPreferences, UserStats, COLLECTIONS } from '../types/firebase';

export class AuthService {
  // ---------- PUBLIC API ----------

  static async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ user: User | null; firebaseUser: FirebaseUser }> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userData = await this.ensureUserDocument(user);
    await this.updateLastLogin(user.uid); // upsert-safe
    return { user: userData, firebaseUser: user };
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ user: User; firebaseUser: FirebaseUser }> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(user, { displayName });
    const userData = await this.createUserDocument(user, { displayName });
    await sendEmailVerification(user).catch(() => {});
    return { user: userData, firebaseUser: user };
  }

  static async signInWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(auth, googleProvider);
    const userData = await this.ensureUserDocument(user);
    await this.updateLastLogin(user.uid);
    return userData!;
  }

  static async signInWithFacebook(): Promise<User> {
    const { user } = await signInWithPopup(auth, facebookProvider);
    const userData = await this.ensureUserDocument(user);
    await this.updateLastLogin(user.uid);
    return userData!;
  }

  static async signOutUser(): Promise<void> {
    await signOut(auth);
  }

  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  static async sendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    await sendEmailVerification(user);
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  static onAuthStateChange(
    callback: (firebaseUser: FirebaseUser | null, user: User | null) => void
  ): () => void {
    return onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) return callback(null, null);
      try {
        const data = await this.ensureUserDocument(firebaseUser);
        callback(firebaseUser, data);
      } catch (e) {
        console.error('Auth state handler error:', e);
        callback(firebaseUser, null);
      }
    });
  }

  // ---------- USER DOC HELPERS ----------

  /** Create or patch the user document if it doesn't exist. */
  private static async ensureUserDocument(firebaseUser: FirebaseUser): Promise<User | null> {
    const ref = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Keep profile basics in sync without clobbering nested structures
      await setDoc(
        ref,
        {
          email: firebaseUser.email ?? null,
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL ?? null,
          phoneNumber: firebaseUser.phoneNumber ?? null,
          emailVerified: firebaseUser.emailVerified ?? false,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return (await getDoc(ref)).data() as User;
    }
    return await this.createUserDocument(firebaseUser);
  }

  /** Create a fresh user document with defaults (idempotent). */
  private static async createUserDocument(
    firebaseUser: FirebaseUser,
    additionalData: Partial<User> = {}
  ): Promise<User> {
    const now = serverTimestamp();

    const defaultProfile: UserProfile = {
      firstName: additionalData.displayName?.split(' ')[0] || '',
      lastName: additionalData.displayName?.split(' ')[1] || '',
      achievements: [],
      badges: [],
    };

    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        inApp: true,
        reminders: true,
        achievements: true,
        social: true,
      },
      privacy: {
        profileVisibility: 'public',
        showStats: true,
        showProgress: true,
        allowFriendRequests: true,
      },
      gameSettings: {
        soundEffects: true,
        backgroundMusic: true,
        vibration: true,
        autoSubmit: false,
        showHints: true,
      },
    };

    const defaultStats: UserStats = {
      totalQuizzesCompleted: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      accuracy: 0,
      totalTimeSpent: 0,
      streakCurrent: 0,
      streakBest: 0,
      level: 1,
      experiencePoints: 0,
      favoriteSubjects: [],
      averageScore: 0,
    };

    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? null,
      displayName: firebaseUser.displayName || (additionalData as any).displayName || '',
      photoURL: firebaseUser.photoURL ?? null,
      phoneNumber: firebaseUser.phoneNumber ?? null,
      emailVerified: firebaseUser.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      profile: defaultProfile,
      preferences: defaultPreferences,
      stats: defaultStats,
      ...additionalData,
    } as User;

    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData, { merge: true });
    return userData;
  }

  static async getUserData(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? (snap.data() as User) : null;
  }

  /** Upsert-safe last-login update (avoids "No document to update"). */
  static async updateLastLogin(uid: string): Promise<void> {
    await setDoc(
      doc(db, COLLECTIONS.USERS, uid),
      { lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  static async updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    await setDoc(
      doc(db, COLLECTIONS.USERS, uid),
      { profile: profileData, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  static async updateUserPreferences(
    uid: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    await setDoc(
      doc(db, COLLECTIONS.USERS, uid),
      { preferences, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }
}

export default AuthService;
