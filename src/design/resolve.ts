import type { ThemeDoc, ScreenStyle, CardVariant } from './types';

// Very small whitelist so style injection stays safe
const SAFE_KEYS = new Set([
  'width',
  'height',
  'maxWidth',
  'padding',
  'gap',
  'margin',
  'borderRadius',
  'boxShadow',
  'background',
  'color',
  'fontSize',
  'fontWeight',
]);

export function expandTokens(value: string, tokens: Record<string, string>): string {
  // Allows var(token.name) usage from theme
  return value.replace(/var\(([^)]+)\)/g, (_, key) => tokens[key.trim()] ?? '');
}

export function composeBackground({
  gradientCss,
  imageUrl,
  mode = 'cover',
  blend = 'normal',
  overlay,
}: {
  gradientCss?: string | null;
  imageUrl?: string | null;
  mode?: 'cover' | 'contain';
  blend?: string;
  overlay?: string | null;
}): React.CSSProperties {
  const layers: string[] = [];
  if (gradientCss) layers.push(gradientCss);
  if (imageUrl) layers.push(`url("${imageUrl}")`);

  const background = layers.join(', ');
  const style: React.CSSProperties = {
    background,
    backgroundSize: layers.length > 1 ? `${mode}, ${mode}` : mode,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundBlendMode: blend as any,
  };

  if (overlay) {
    style.boxShadow = `inset 0 0 0 100vmax ${overlay}`;
  }

  return style;
}

export function cardStyleFromVariant(
  variant: CardVariant | undefined,
  tokens: Record<string, string>
): React.CSSProperties {
  if (!variant) return {};

  const radius = expandTokens(variant.radius ?? '', tokens);
  const shadow = expandTokens(variant.shadow ?? '', tokens);
  const bg = expandTokens(variant.bg ?? '', tokens);
  const blur = expandTokens(variant.backdropBlur ?? '0px', tokens);

  return {
    borderRadius: radius,
    boxShadow: shadow,
    background: bg,
    backdropFilter: `blur(${blur})`,
  } as React.CSSProperties;
}

export function sanitizeCss(css: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(css)) {
    if (SAFE_KEYS.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
