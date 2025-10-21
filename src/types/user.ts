export interface UserStats {
  level?: number;
  experiencePoints?: number;
  streakCurrent?: number;
  totalQuizzesCompleted?: number;
  accuracy?: number;
  totalTimeSpent?: number; // in seconds
}

export interface LastQuizSnapshot {
  scorePercentage?: number;
  totalQuestions?: number;
  correctCount?: number;
  timeSpent?: number;
  timestamp?: any;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string;
  tagline?: string;
  stats?: UserStats;
  coins?: number;
  selectedCourse?: string;
  selectedSubject?: string;
  lastQuiz?: LastQuizSnapshot;
  credentials?: { hasPassword?: boolean };
}
