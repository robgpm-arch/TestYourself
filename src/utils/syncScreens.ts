import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../config/firebase';
import { SCREENS_REGISTRY } from '../config/screensRegistry';
import { SUBJECTS_REGISTRY } from '../config/subjectsRegistry';
import { CHAPTERS_REGISTRY } from '../config/chaptersRegistry';
import { QUIZ_SETS_REGISTRY } from '../config/quizSetsRegistry';
import { LEADERBOARDS_REGISTRY } from '../config/leaderboardsRegistry';
const functions = getFunctions(app);

const registrySyncCallable = httpsCallable(functions, 'registrySync');

export async function syncScreensToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['screens'] });
}

export async function syncBoardsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['boards'] });
}

export async function syncMediumsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['mediums'] });
}

export async function syncCoursesToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['courses'] });
}

export async function syncSubjectsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['subjects'] });
}

export async function syncChaptersToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['chapters'] });
}

export async function syncQuizSetsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['quiz_sets'] });
}

export async function syncLeaderboardsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['leaderboard_configs'] });
}

export async function syncExamsToFirestore(currentUserId?: string) {
  await registrySyncCallable({ entities: ['exams'] });
}
