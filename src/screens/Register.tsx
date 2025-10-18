import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginSignup from '../pages/LoginSignup';

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

export default function Register() {
  const navigate = useNavigate();

  return (
    <LoginSignup
      initialTab="register"
      onSuccess={async () => {
        await routeAfterUserAuth(navigate);
      }}
      onSkip={() => {
        navigate('/');
      }}
    />
  );
}