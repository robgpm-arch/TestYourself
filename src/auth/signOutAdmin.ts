import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const LOCAL_KEYS_TO_CLEAR = [
  'demo_authenticated',
  'test_show_login',
  'onboarding_completed',
  'medium_selected',
  'board_exam_selected',
  'class_course_selected',
  'subject_selected',
  'redirectAfterAuth',
  'lastRoute',
];

export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } finally {
    // Hard-reset any client flags that might redirect you back into the consumer app
    for (const k of LOCAL_KEYS_TO_CLEAR) localStorage.removeItem(k);
    sessionStorage.clear(); // optional, if you used it for redirects
  }
}
