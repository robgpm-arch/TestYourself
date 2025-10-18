export interface LeaderboardData {
  id: string;
  title: string;
  description: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  subject?: string;
  metric: 'score' | 'streak' | 'accuracy' | 'time';
  limit?: number;
  active: boolean;
  order: number;
}

export const LEADERBOARDS_REGISTRY: LeaderboardData[] = [
  // Overall leaderboards
  {
    id: 'overall-weekly-score',
    title: 'Weekly Champions',
    description: 'Top performers this week by total score',
    period: 'weekly',
    metric: 'score',
    limit: 10,
    active: true,
    order: 1,
  },
  {
    id: 'overall-monthly-score',
    title: 'Monthly Masters',
    description: 'Top performers this month by total score',
    period: 'monthly',
    metric: 'score',
    limit: 10,
    active: true,
    order: 2,
  },
  {
    id: 'overall-all-time-score',
    title: 'All-Time Legends',
    description: 'Greatest performers of all time by total score',
    period: 'all-time',
    metric: 'score',
    limit: 25,
    active: true,
    order: 3,
  },
  // Streak leaderboards
  {
    id: 'streak-weekly',
    title: 'Weekly Streak Masters',
    description: 'Longest quiz streaks this week',
    period: 'weekly',
    metric: 'streak',
    limit: 10,
    active: true,
    order: 4,
  },
  {
    id: 'streak-all-time',
    title: 'Streak Legends',
    description: 'Longest quiz streaks ever achieved',
    period: 'all-time',
    metric: 'streak',
    limit: 25,
    active: true,
    order: 5,
  },
  // Accuracy leaderboards
  {
    id: 'accuracy-weekly',
    title: 'Weekly Accuracy Kings',
    description: 'Most accurate quiz takers this week',
    period: 'weekly',
    metric: 'accuracy',
    limit: 10,
    active: true,
    order: 6,
  },
  {
    id: 'accuracy-monthly',
    title: 'Monthly Precision Experts',
    description: 'Most accurate quiz takers this month',
    period: 'monthly',
    metric: 'accuracy',
    limit: 10,
    active: true,
    order: 7,
  },
  // Subject-specific leaderboards
  {
    id: 'algebra-weekly',
    title: 'Algebra Weekly Champions',
    description: 'Top algebra performers this week',
    period: 'weekly',
    subject: 'algebra',
    metric: 'score',
    limit: 10,
    active: true,
    order: 8,
  },
  {
    id: 'physics-weekly',
    title: 'Physics Weekly Champions',
    description: 'Top physics performers this week',
    period: 'weekly',
    subject: 'physics',
    metric: 'score',
    limit: 10,
    active: true,
    order: 9,
  },
  {
    id: 'biology-weekly',
    title: 'Biology Weekly Champions',
    description: 'Top biology performers this week',
    period: 'weekly',
    subject: 'biology',
    metric: 'score',
    limit: 10,
    active: true,
    order: 10,
  },
];
