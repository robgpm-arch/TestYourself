export type CardVariant = {
  radius: string;
  shadow: string;
  bg: string;
  backdropBlur: string;
};

export type ThemeDoc = {
  id: string;
  name: string;
  tokens: Record<string, string>;
  gradients: Record<string, string>;
  cardVariants: Record<string, CardVariant>;
  images: Record<string, string>; // logicalName -> storagePath
};

export type ScreenStyle = {
  theme?: string;
  gradient?: string | null;
  bgImage?: string | null;
  bgMode?: 'cover' | 'contain';
  bgBlend?: 'normal' | 'overlay' | 'multiply' | 'screen';
  overlay?: string | null;
  cardVariant?: string;
  container?: { maxWidth?: number; padding?: number; gap?: number };
};

export type ComponentStyle = {
  cardVariant?: string;
  gradient?: string | null;
  bgImage?: string | null;
  className?: string;
  css?: Record<string, string>; // whitelisted CSS properties
};
