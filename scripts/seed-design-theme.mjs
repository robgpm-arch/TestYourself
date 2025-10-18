import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config (use your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAdf9ABK0vfFN9jYtuKIaP9_HAxnxrFppc",
  authDomain: "testyourself-80a10.firebaseapp.com",
  projectId: "testyourself-80a10",
  storageBucket: "testyourself-80a10.firebasestorage.app",
  messagingSenderId: "1029386064107",
  appId: "1:1029386064107:web:4ea1d501506efa6886aeae",
  measurementId: "G-FK6HG0RNR3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultTheme = {
  tokens: {
    "radius.xs": "8px",
    "radius.md": "16px",
    "radius.lg": "24px",
    "shadow.card": "0 10px 30px rgba(0,0,0,.08)",
    "spacing.card.p": "24px",
    "color.text": "#0f172a",
    "color.muted": "#475569"
  },
  gradients: {
    "blueGlass": "linear-gradient(135deg, #9bd2ff 0%, #adc8ff 50%, #e3e8ff 100%)",
    "sunset": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    "ocean": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "forest": "linear-gradient(135deg, #134e5e 0%, #71b280 100%)"
  },
  cardVariants: {
    "elevated": {
      "radius": "var(radius.lg)",
      "shadow": "var(shadow.card)",
      "bg": "rgba(255,255,255,.75)",
      "backdropBlur": "8px"
    },
    "flat": {
      "radius": "var(radius.md)",
      "shadow": "none",
      "bg": "#ffffff",
      "backdropBlur": "0px"
    },
    "glass": {
      "radius": "var(radius.lg)",
      "shadow": "var(shadow.card)",
      "bg": "rgba(255,255,255,.1)",
      "backdropBlur": "12px"
    }
  },
  images: {
    // Add your uploaded assets here
    // "mathWave": "assets/backgrounds/math-wave.jpg",
    // "dots": "assets/overlays/dots.png"
  }
};

async function seedDefaultTheme() {
  try {
    console.log('Seeding default theme...');
    await setDoc(doc(db, 'themes', 'default'), defaultTheme);
    console.log('✅ Default theme seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed theme:', error);
  }
}

seedDefaultTheme();