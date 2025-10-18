export type EmojiOpt = { id: string; name: string; char: string };
export type ColorOpt = { id: string; name: string; hex: string };

export const EMOJI_OPTIONS: EmojiOpt[] = [
  { id: 'blue-book', name: 'Blue Book', char: '📘' },
  { id: 'green-book', name: 'Green Book', char: '📗' },
  { id: 'orange-book', name: 'Orange Book', char: '📙' },
  { id: 'books', name: 'Books', char: '📚' },
  { id: 'pencil', name: 'Pencil', char: '✏️' },
  { id: 'memo', name: 'Memo', char: '📝' },
  { id: 'microscope', name: 'Microscope', char: '🔬' },
  { id: 'test-tube', name: 'Test Tube', char: '🧪' },
  { id: 'atom', name: 'Atom', char: '⚛️' },
  { id: 'abacus', name: 'Abacus', char: '🧮' },
  { id: 'pi', name: 'Pi', char: '𝛑' },
  { id: 'telescope', name: 'Telescope', char: '🔭' },
  { id: 'globe', name: 'Globe', char: '🌐' },
  { id: 'dna', name: 'DNA', char: '🧬' },
  { id: 'brain', name: 'Brain', char: '🧠' },
  { id: 'light-bulb', name: 'Light Bulb', char: '💡' },
  { id: 'calendar', name: 'Calendar', char: '📅' },
  { id: 'stopwatch', name: 'Stopwatch', char: '⏱️' },
  { id: 'trophy', name: 'Trophy', char: '🏆' },
  { id: 'medal', name: 'Medal', char: '🏅' },
  { id: 'star', name: 'Star', char: '⭐' },
  { id: 'rocket', name: 'Rocket', char: '🚀' },
  { id: 'lab-coat', name: 'Lab Coat', char: '🥼' },
  { id: 'graduation-cap', name: 'Graduation Cap', char: '🎓' },
  { id: 'paint-palette', name: 'Paint Palette', char: '🎨' },
  { id: 'music-notes', name: 'Music Notes', char: '🎶' },
];

export const COLOR_PALETTE: ColorOpt[] = [
  { id: 'blue-600', name: 'Blue 600', hex: '#2563eb' },
  { id: 'indigo-600', name: 'Indigo 600', hex: '#4f46e5' },
  { id: 'violet-600', name: 'Violet 600', hex: '#7c3aed' },
  { id: 'fuchsia-600', name: 'Fuchsia 600', hex: '#c026d3' },
  { id: 'rose-600', name: 'Rose 600', hex: '#e11d48' },
  { id: 'orange-600', name: 'Orange 600', hex: '#ea580c' },
  { id: 'amber-500', name: 'Amber 500', hex: '#f59e0b' },
  { id: 'emerald-600', name: 'Emerald 600', hex: '#059669' },
  { id: 'teal-600', name: 'Teal 600', hex: '#0d9488' },
  { id: 'cyan-600', name: 'Cyan 600', hex: '#0891b2' },
  { id: 'slate-700', name: 'Slate 700', hex: '#334155' },
  { id: 'neutral-800', name: 'Neutral 800', hex: '#262626' },
];

export const LEVEL_OPTIONS = [
  { id: 'foundation', name: 'Foundation' },
  { id: 'basic', name: 'Basic' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
  { id: 'expert', name: 'Expert' },
];

export const FALLBACK_THUMBNAILS = [
  { id: 'ty-purple', name: 'TY Purple', url: '/icon-512.png' },
  {
    id: 'gradient-1',
    name: 'Blue Gradient',
    url: 'https://images.unsplash.com/photo-1520975922071-6a6c36f7a3aa?w=1200',
  },
  {
    id: 'gradient-2',
    name: 'Indigo Gradient',
    url: 'https://images.unsplash.com/photo-1517810316800-3d53e3d7aa1c?w=1200',
  },
  {
    id: 'pattern-1',
    name: 'Abstract Pattern',
    url: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200',
  },
];
