export type FlowKey = 'onboarding' | 'quiz' | 'profile';

export const FALLBACK_FLOWS: Record<FlowKey, string[]> = {
  onboarding: [
    '/onboarding/medium',
    '/onboarding/board-or-exam',
    '/onboarding/course',
    '/onboarding/subject',
    '/onboarding/ready',
  ],
  quiz: ['/quiz/instructions', '/quiz/play', '/quiz/results'],
  profile: ['/profile', '/settings'],
};
