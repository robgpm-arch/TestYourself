import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Quiz,
  QuizAttempt,
  CreateQuizAttempt,
  User,
  StudyMaterial,
  LeaderboardEntry,
  AppNotification,
  PaymentRecord,
  Badge,
  COLLECTIONS,
  ApiResponse
} from '../types/firebase';

export class DatabaseService {
  /**
   * QUIZ OPERATIONS
   */
  
  // Create a new quiz
  static async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const quizData = {
        ...quiz,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attempts: 0,
        averageScore: 0,
        rating: 0,
        reviews: 0
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.QUIZZES), quizData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  // Get quiz by ID
  static async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const quizDoc = await getDoc(doc(db, COLLECTIONS.QUIZZES, quizId));
      if (quizDoc.exists()) {
        return { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      }
      return null;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  }

  // Get quizzes with filters
  static async getQuizzes(
    filters: {
      subject?: string;
      grade?: number;
      difficulty?: string;
      isPublic?: boolean;
      limit?: number;
    } = {}
  ): Promise<Quiz[]> {
    try {
      let q = query(collection(db, COLLECTIONS.QUIZZES));

      // Apply filters
      if (filters.subject) {
        q = query(q, where('subject', '==', filters.subject));
      }
      if (filters.grade) {
        q = query(q, where('grade', '==', filters.grade));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', filters.isPublic));
      }

      // Order and limit
      q = query(q, orderBy('createdAt', 'desc'));
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quiz));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  }

  // Update quiz
  static async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.QUIZZES, quizId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  // Delete quiz
  static async deleteQuiz(quizId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.QUIZZES, quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  /**
   * QUIZ ATTEMPT OPERATIONS
   */

  // Start a quiz attempt
  static async startQuizAttempt(
    userId: string,
    quizId: string
  ): Promise<string> {
    try {
      const attemptData: Omit<CreateQuizAttempt, 'id'> = {
        quizId,
        userId,
        startTime: serverTimestamp(),
        duration: 0,
        score: 0,
        percentage: 0,
        passed: false,
        answers: [],
        status: 'in-progress',
        reviewMode: false
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.QUIZ_ATTEMPTS), attemptData);
      
      // Increment quiz attempts count
      await updateDoc(doc(db, COLLECTIONS.QUIZZES, quizId), {
        attempts: increment(1)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  // Complete quiz attempt
  static async completeQuizAttempt(
    attemptId: string,
    score: number,
    percentage: number,
    passed: boolean,
    answers: any[],
    duration: number
  ): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.QUIZ_ATTEMPTS, attemptId), {
        endTime: serverTimestamp(),
        score,
        percentage,
        passed,
        answers,
        duration,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error completing quiz attempt:', error);
      throw error;
    }
  }

  // Get user's quiz attempts
  static async getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.QUIZ_ATTEMPTS),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      );

      if (quizId) {
        q = query(q, where('quizId', '==', quizId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt));
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
  }

  /**
   * USER OPERATIONS
   */

  // Update user stats after quiz completion
  static async updateUserStats(
    userId: string,
    quizResult: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      timeSpent: number;
      subject: string;
    }
  ): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const currentStats = userData.stats;

        const newTotalQuestions = currentStats.totalQuestionsAnswered + quizResult.totalQuestions;
        const newCorrectAnswers = currentStats.correctAnswers + quizResult.correctAnswers;
        const newAccuracy = (newCorrectAnswers / newTotalQuestions) * 100;

        await updateDoc(userRef, {
          'stats.totalQuizzesCompleted': increment(1),
          'stats.totalQuestionsAnswered': increment(quizResult.totalQuestions),
          'stats.correctAnswers': increment(quizResult.correctAnswers),
          'stats.accuracy': newAccuracy,
          'stats.totalTimeSpent': increment(quizResult.timeSpent),
          'stats.experiencePoints': increment(quizResult.score),
          updatedAt: serverTimestamp()
        });

        // Update favorite subjects
        if (!currentStats.favoriteSubjects.includes(quizResult.subject)) {
          await updateDoc(userRef, {
            'stats.favoriteSubjects': arrayUnion(quizResult.subject)
          });
        }
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * LEADERBOARD OPERATIONS
   */

  // Get leaderboard entries
  static async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
    subject?: string,
    limitCount: number = 10
  ): Promise<LeaderboardEntry[]> {
    try {
      let q = query(collection(db, COLLECTIONS.LEADERBOARDS));

      if (period !== 'all-time') {
        q = query(q, where('period', '==', period));
      }
      if (subject) {
        q = query(q, where('subject', '==', subject));
      }

      q = query(q, orderBy('score', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        rank: index + 1
      } as LeaderboardEntry));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * STUDY MATERIALS OPERATIONS
   */

  // Get study materials
  static async getStudyMaterials(filters: {
    subject?: string;
    grade?: number;
    type?: string;
    isPremium?: boolean;
    limit?: number;
  } = {}): Promise<StudyMaterial[]> {
    try {
      let q = query(collection(db, COLLECTIONS.STUDY_MATERIALS));

      if (filters.subject) {
        q = query(q, where('subject', '==', filters.subject));
      }
      if (filters.grade) {
        q = query(q, where('grade', '==', filters.grade));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.isPremium !== undefined) {
        q = query(q, where('isPremium', '==', filters.isPremium));
      }

      q = query(q, where('isPublic', '==', true), orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudyMaterial));
    } catch (error) {
      console.error('Error fetching study materials:', error);
      return [];
    }
  }

  /**
   * NOTIFICATIONS OPERATIONS
   */

  // Create notification
  static async createNotification(notification: Omit<AppNotification, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notification,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<AppNotification[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * REAL-TIME SUBSCRIPTIONS
   */

  // Subscribe to quiz attempts for real-time updates
  static subscribeToQuizAttempts(
    userId: string,
    callback: (attempts: QuizAttempt[]) => void
  ): Unsubscribe {
    // Only set up listener if we have a valid userId
    if (!userId) {
      console.warn('subscribeToQuizAttempts called without userId');
      return () => {}; // Return no-op unsubscribe
    }

    const q = query(
      collection(db, COLLECTIONS.QUIZ_ATTEMPTS),
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt));
      callback(attempts);
    }, (error) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for quiz attempts subscription:', error);
        callback([]); // Return empty array on permission error
      } else {
        console.error('Error in quiz attempts subscription:', error);
        throw error;
      }
    });
  }

  // Subscribe to user notifications
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: AppNotification[]) => void
  ): Unsubscribe {
    // Only set up listener if we have a valid userId
    if (!userId) {
      console.warn('subscribeToNotifications called without userId');
      return () => {}; // Return no-op unsubscribe
    }

    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
      callback(notifications);
    }, (error) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for notifications subscription:', error);
        callback([]); // Return empty array on permission error
      } else {
        console.error('Error in notifications subscription:', error);
        throw error;
      }
    });
  }

  /**
   * UTILITY METHODS
   */

  // Batch operations helper
  static async batchOperation(operations: Array<() => Promise<any>>): Promise<any[]> {
    try {
      const results = await Promise.allSettled(operations.map(op => op()));
      return results.map((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Batch operation ${index} failed:`, result.reason);
          return null;
        }
        return result.value;
      });
    } catch (error) {
      console.error('Batch operation error:', error);
      throw error;
    }
  }

  // Generic document subscription
  static subscribeToDocument<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): Unsubscribe {
    return onSnapshot(doc(db, collectionName, docId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T);
      } else {
        callback(null);
      }
    });
  }
}

export default DatabaseService;