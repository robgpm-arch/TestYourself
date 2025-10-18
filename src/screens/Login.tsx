import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bindActiveDevice } from '@/lib/sessionBinding';
import LoginSignup from '../pages/LoginSignup';
import { navigateAfterAuth } from '@/utils/onboardingRouter';

// Import the helper function
async function routeAfterUserAuth(navigate: (path: string, options?: any) => void) {
  const { getAuth } = await import('firebase/auth');
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../lib/firebase');

  const user = getAuth().currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, 'users', user.uid));
  const onboarded = snap.exists() && snap.data()?.onboarded === true;

  navigate(onboarded ? '/profile' : '/onboarding', { replace: true });
}

export default function Login() {
  const navigate = useNavigate();

  // Keep auto-redirects OFF while on this screen
  useEffect(() => {
    localStorage.setItem('auth_intent', 'login');
    return () => {
      if (localStorage.getItem('auth_intent') === 'login') {
        localStorage.removeItem('auth_intent');
      }
    };
  }, []);

  return (
    <LoginSignup
      initialTab="login"
      onSuccess={async () => {
        await bindActiveDevice().catch(() => {});
        // clear the lock before redirecting
        localStorage.removeItem('auth_intent');
        await navigateAfterAuth(navigate);
      }}
      onSkip={() => {
        navigate('/');
      }}
    />
  );
}
