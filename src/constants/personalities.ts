export type PerformanceTier = 'low' | 'average' | 'high';

export interface PersonalityAsset {
  gif: string;
  audio: string;
  headline: string;
  subcopy: string;
}

export interface MotivationPersonality {
  id: string;
  name: string;
  title: string;
  description: string;
  traits: string[];
  previewGif: string;
  tiers: Record<PerformanceTier, PersonalityAsset>;
}

export const motivationPersonalities: MotivationPersonality[] = [
  {
    id: 'apj-abdul-kalam',
    name: 'Dr. A.P.J. Abdul Kalam',
    title: 'Visionary Scientist',
    description: 'Inspires with calm encouragement and big-picture thinking.',
    traits: ['Inspires resilience', 'Focus on learning', 'Uplifting tone'],
    previewGif: '/assets/personalities/apj/preview.gif',
    tiers: {
      low: {
        gif: '/assets/personalities/apj/low.gif',
        audio: '/assets/personalities/apj/low.mp3',
        headline: 'Every challenge is a new lesson.',
        subcopy: 'Let us take this as fuel for the next launch, my friend.'
      },
      average: {
        gif: '/assets/personalities/apj/average.gif',
        audio: '/assets/personalities/apj/average.mp3',
        headline: 'You are travelling steadily toward success.',
        subcopy: 'Small consistent progress builds great missions.'
      },
      high: {
        gif: '/assets/personalities/apj/high.gif',
        audio: '/assets/personalities/apj/high.mp3',
        headline: 'Mission accomplished with brilliance!',
        subcopy: 'Your dedication is rocket fuel—keep soaring higher.'
      }
    }
  },
  {
    id: 'virat-kohli',
    name: 'Virat Kohli',
    title: 'Champion Cricketer',
    description: 'Fiery motivation with high-energy celebration vibes.',
    traits: ['High energy', 'Competitive spirit', 'Power-packed pep talks'],
    previewGif: '/assets/personalities/kohli/preview.gif',
    tiers: {
      low: {
        gif: '/assets/personalities/kohli/low.gif',
        audio: '/assets/personalities/kohli/low.mp3',
        headline: 'Heads up, champ!',
        subcopy: 'We bounce back harder. Next quiz is ours!'
      },
      average: {
        gif: '/assets/personalities/kohli/average.gif',
        audio: '/assets/personalities/kohli/average.mp3',
        headline: 'Solid knock in the middle overs!',
        subcopy: 'Couple more boundary shots and we win big.'
      },
      high: {
        gif: '/assets/personalities/kohli/high.gif',
        audio: '/assets/personalities/kohli/high.mp3',
        headline: 'What a match-winning performance!',
        subcopy: 'Take a bow, legend. This is champion mindset.'
      }
    }
  },
  {
    id: 'dora-the-explorer',
    name: 'Dora the Explorer',
    title: 'Curious Adventurer',
    description: 'Adorable cheerleader for younger learners and playful souls.',
    traits: ['Playful encouragement', 'Interactive tone', 'Child-friendly energy'],
    previewGif: '/assets/personalities/dora/preview.gif',
    tiers: {
      low: {
        gif: '/assets/personalities/dora/low.gif',
        audio: '/assets/personalities/dora/low.mp3',
        headline: 'We can try again, ¡vámonos!',
        subcopy: 'Let’s pack our backpack and explore one more time!'
      },
      average: {
        gif: '/assets/personalities/dora/average.gif',
        audio: '/assets/personalities/dora/average.mp3',
        headline: 'You did it, explorer! 🧭',
        subcopy: 'High five! Ready for the next adventure?'
      },
      high: {
        gif: '/assets/personalities/dora/high.gif',
        audio: '/assets/personalities/dora/high.mp3',
        headline: 'Fantástico! You found every clue!',
        subcopy: 'Boots and I are so proud of you. Let’s celebrate!'
      }
    }
  }
];

export const PERSONALITY_STORAGE_KEY = 'preferred_motivation_personality';
