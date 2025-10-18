import React, { useEffect, useState } from "react";
import { loadTheme, resolveImage } from "./api";
import { composeBackground, cardStyleFromVariant } from "./resolve";
import type { ScreenStyle } from "./types";

interface ScreenLayoutProps {
  screenStyle: ScreenStyle;
  children: React.ReactNode;
  className?: string;
}

export function ScreenLayout({
  screenStyle,
  children,
  className = ""
}: ScreenLayoutProps) {
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const [cardVariantStyle, setCardVariantStyle] = useState<React.CSSProperties>({});
  const [container, setContainer] = useState({
    maxWidth: 1100,
    padding: 24,
    gap: 24
  });

  useEffect(() => {
    (async () => {
      try {
        const themeId = screenStyle.theme ?? "default";
        const theme = await loadTheme(themeId);

        const imageUrl = await resolveImage(theme, screenStyle.bgImage ?? null);
        const gradientCss = screenStyle.gradient ? theme.gradients[screenStyle.gradient] : null;

        setBgStyle(composeBackground({
          gradientCss,
          imageUrl,
          mode: screenStyle.bgMode,
          blend: screenStyle.bgBlend,
          overlay: screenStyle.overlay
        }));

        const variant = theme.cardVariants[screenStyle.cardVariant ?? "elevated"];
        setCardVariantStyle(cardStyleFromVariant(variant, theme.tokens));

        const c = {
          maxWidth: 1100,
          padding: 24,
          gap: 24,
          ...(screenStyle.container ?? {})
        };
        setContainer(c);
      } catch (error) {
        console.error("Failed to load screen design:", error);
        // Fallback to basic styles
        setBgStyle({ background: "#f8fafc" });
        setCardVariantStyle({
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          background: "rgba(255,255,255,.75)",
          backdropFilter: "blur(8px)"
        });
      }
    })();
  }, [screenStyle]);

  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        ...bgStyle
      }}
    >
      <div
        style={{
          maxWidth: container.maxWidth,
          margin: "0 auto",
          padding: container.padding
        }}
      >
        <div
          style={{
            display: "grid",
            gap: container.gap
          }}
        >
          {children}
        </div>
      </div>

      {/* Expose card variant as CSS variables for Tailwind usage */}
      <style>
        {`
          :root {
            --card-radius: ${(cardVariantStyle as any).borderRadius || "16px"};
            --card-shadow: ${(cardVariantStyle as any).boxShadow || "0 10px 30px rgba(0,0,0,.08)"};
            --card-bg: ${(cardVariantStyle as any).background || "rgba(255,255,255,.75)"};
            --card-blur: ${(cardVariantStyle as any).backdropFilter || "blur(8px)"};
          }
        `}
      </style>
    </div>
  );
}