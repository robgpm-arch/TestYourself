import { NavigateFunction } from 'react-router-dom';

export const navigateAfterAuth = async (navigate: NavigateFunction) => {
  navigate('/onboarding', { replace: true });
};