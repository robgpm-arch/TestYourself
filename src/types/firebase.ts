import { Timestamp } from 'firebase/firestore';

// User-related types
export interface UserRoles {
  admin?: boolean;
  editor?: boolean;
  moderator?: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  subscription?: UserSubscription;
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  roles?: UserRoles;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Timestamp;
  grade?: number;
  school?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  achievements: string[];
  badges: Badge[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  gameSettings: GameSettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  reminders: boolean;
  achievements: boolean;
  social: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showStats: boolean;
  showProgress: boolean;
  allowFriendRequests: boolean;
}

export interface GameSettings {
  soundEffects: boolean;
  backgroundMusic: boolean;
  vibration: boolean;
  autoSubmit: boolean;
  showHints: boolean;
}

export interface AdminAuditMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface VisibilityConfig {
  enabled: boolean;
  isVisible?: boolean; // for backward compatibility
  order: number;
  tags?: string[];
}

export interface AppScreen extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  name: string;
  path: string;
  description?: string;
  category?: string;
  roles?: string[];
}

export interface LeaderboardConfig extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  title: string;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  subject?: string;
  metric?: 'score' | 'streak' | 'accuracy' | 'time';
  limit?: number;
}

// Catalog Management Types
export interface CatalogMedium extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  name: string;
  description?: string;
  code?: string; // e.g. en, hi, te
}

export interface CatalogBoard extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  mediumId: string; // parent Medium
  name: string;
  description?: string;
  region?: string;
  code?: string;
}

export interface CatalogExam extends AdminAuditMetadata, VisibilityConfig {
  id?: string;
  code: string;
  name: string;
  title?: string;
  description?: string;
  mediumId?: string; // parent Medium (lets you scope exams per medium)
}

export interface CatalogCourse extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  mediumId: string;
  // Exactly one of:
  boardId?: string;
  examId?: string;

  name: string;
  description?: string;
  level?: string;
  slug?: string;
  thumbnail?: string;
}

export interface CatalogSubject extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  courseId: string; // parent Course
  // mirror for filtering (optional but speeds UI)
  mediumId: string;
  boardId?: string;
  examId?: string;

  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CatalogChapter extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  subjectId: string; // parent Subject
  // denormalized for filtering
  boardId?: string;
  examId?: string;
  name: string;
  description?: string;
  chapterNumber?: number;
  durationMinutes?: number;
  prerequisites?: string[];
}

export interface CatalogQuizSetAutoRunConfig {
  enabled: boolean;
  readCorrectAnswer?: boolean;
  readExplanation?: boolean;
  delaySeconds?: number;
  voice?: string;
  subscriberOnly?: boolean;
}

export interface CatalogQuizSet extends AdminAuditMetadata, VisibilityConfig {
  id: string;
  chapterId: string; // parent Chapter
  // denormalized for filtering
  boardId?: string;
  examId?: string;
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  totalQuestions?: number;
  durationMinutes?: number;
  tags?: string[];
  publishedAt?: Timestamp;
  autoRunConfig?: CatalogQuizSetAutoRunConfig;
}

export interface UserStats {
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeSpent: number; // in seconds
  streakCurrent: number;
  streakBest: number;
  level: number;
  experiencePoints: number;
  favoriteSubjects: string[];
  averageScore: number;
}

// Subscription-related types
export interface UserSubscription {
  type: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Timestamp;
  endDate?: Timestamp;
  autoRenew: boolean;
  paymentMethod?: string;
  priceId?: string;
}

// Quiz-related types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'numerical';
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attempts: number;
  averageScore: number;
  rating: number;
  reviews: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'numerical';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number | boolean;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  media?: Media;
  hints?: string[];
}

export interface Media {
  type: 'image' | 'video' | 'audio';
  url: string;
  caption?: string;
  alt?: string;
}

// Quiz attempt and results
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number; // in seconds
  score: number;
  percentage: number;
  passed: boolean;
  answers: UserAnswer[];
  status: 'in-progress' | 'completed' | 'abandoned' | 'timed-out';
  reviewMode: boolean;
}

// For creating quiz attempts (allows serverTimestamp)
export interface CreateQuizAttempt {
  quizId: string;
  userId: string;
  startTime: any; // Allow FieldValue from serverTimestamp()
  duration: number;
  score: number;
  percentage: number;
  passed: boolean;
  answers: UserAnswer[];
  status: 'in-progress' | 'completed' | 'abandoned' | 'timed-out';
  reviewMode: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string | number | boolean;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  hintsUsed: number;
}

// Leaderboard and social features
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  subject?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Timestamp;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: 'quiz_completion' | 'streak' | 'accuracy' | 'time' | 'subject_mastery';
  target: number;
  subject?: string;
}

// Payment and subscription types
export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'one-time' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

// Content and study materials
export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'notes' | 'video' | 'document' | 'audio';
  subject: string;
  grade: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content?: string; // for notes
  fileUrl?: string; // for documents, videos, audio
  thumbnail?: string;
  duration?: number; // for video/audio in seconds
  tags: string[];
  isPublic: boolean;
  isPremium: boolean;
  createdBy: string;
  createdAt: Timestamp;
  views: number;
  likes: number;
  bookmarks: number;
}

// Notification types
export interface AppNotification {
  id: string;
  userId: string;
  type: 'achievement' | 'reminder' | 'social' | 'system' | 'quiz_result';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
  expiresAt?: Timestamp;
}

// Error handling
export interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: FirebaseError;
  message?: string;
}

// Collection names (for type safety with Firestore)
export const COLLECTIONS = {
  USERS: 'users',
  QUIZZES: 'quizzes',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  LEADERBOARDS: 'leaderboards',
  STUDY_MATERIALS: 'study_materials',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  BADGES: 'badges',
  FEEDBACK: 'feedback',
  MEDIUMS: 'mediums',
  BOARDS: 'boards',
  COURSES: 'courses',
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
  QUIZ_SETS: 'quiz_sets',
  SCREENS: 'screens',
  LEADERBOARD_CONFIGS: 'leaderboard_configs',
  EXAMS: 'exams',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
