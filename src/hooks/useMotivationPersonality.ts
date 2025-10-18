import { useCallback, useEffect, useMemo, useState } from 'react';
import { motivationPersonalities, MotivationPersonality, PERSONALITY_STORAGE_KEY } from '../constants/personalities';

const defaultPersonality = motivationPersonalities[0];

type UseMotivationPersonalityReturn = {
  personalities: MotivationPersonality[];
  selectedPersonality: MotivationPersonality;
  selectPersonality: (id: string) => void;
};

export const useMotivationPersonality = (): UseMotivationPersonalityReturn => {
  const [personalityId, setPersonalityId] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return defaultPersonality.id;
    }
    return localStorage.getItem(PERSONALITY_STORAGE_KEY) ?? defaultPersonality.id;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(PERSONALITY_STORAGE_KEY, personalityId);
  }, [personalityId]);

  const selectPersonality = useCallback((id: string) => {
    setPersonalityId(id);
  }, []);

  const selectedPersonality = useMemo(() => {
    return motivationPersonalities.find((personality) => personality.id === personalityId) ?? defaultPersonality;
  }, [personalityId]);

  return {
    personalities: motivationPersonalities,
    selectedPersonality,
    selectPersonality
  };
};

export default useMotivationPersonality;
