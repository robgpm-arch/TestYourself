export type FlowStage =
  | 'splash'
  | 'register'
  | 'login'
  | 'mediumPicker'
  | 'boardExamSelector'
  | 'subjectSelector'
  | 'onboardingtutorials';

export const flowPathFor = (stage: FlowStage): string => {
  switch (stage) {
    case 'splash':
      return '/';
    case 'register':
      // Existing app uses '/register'
      return '/register';
    case 'login':
      // Existing app uses '/login'
      return '/login';
    case 'mediumPicker':
      return '/flow/mediumPicker';
    case 'boardExamSelector':
      return '/flow/boardExamSelector';
    case 'subjectSelector':
      return '/flow/subjectSelector';
    case 'onboardingtutorials':
      // Alias route already present
      return '/onboardingtutorials';
    default:
      return '/';
  }
};

export const stageFromPath = (pathname: string): FlowStage | null => {
  if (pathname.startsWith('/flow/')) {
    const seg = pathname.split('/')[2];
    return ['mediumPicker', 'boardExamSelector', 'subjectSelector'].includes(seg)
      ? (seg as FlowStage)
      : null;
  }
  if (pathname === '/register') return 'register';
  if (pathname === '/login') return 'login';
  if (pathname === '/onboardingtutorials' || pathname === '/onboarding') return 'onboardingtutorials';
  if (pathname === '/' || pathname === '/splash') return 'splash';
  return null;
};

