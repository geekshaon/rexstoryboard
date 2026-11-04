import {
  SceneElement,
  ElementStyle,
  Typography,
  AnimationChoreography,
  SubPartTarget,
  SubPartStyle,
  FontFamilyType
} from '../types/studio';

export const BASE_STYLE: ElementStyle = {
  bgMode: 'solid',
  bgColor: '#0f172a',
  gradientColor2: '#1e293b',
  gradientAngle: 135,
  bgOpacity: 0.9,
  backdropBlur: 8,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(56, 189, 248, 0.3)',
  borderRadius: 16,
  padding: 20,
  glowColor: '#38bdf8',
  glowIntensity: 0,
  verticalAlign: 'center',
  horizontalAlign: 'center'
};

export const BASE_TYPOGRAPHY: Typography = {
  fontFamily: 'Kalpurush',
  fontSize: 22,
  fontWeight: '500',
  lineHeight: 1.4,
  textAlign: 'left',
  textColor: '#f8fafc',
  highlightColor: '#38bdf8'
};

export const BASE_ANIMATION: AnimationChoreography = {
  stepOrder: 1,
  entrance: 'fadeIn',
  duration: 0.8,
  delay: 0,
  easing: 'spring',
  emphasis: 'none'
};

export function getFontFamilyCss(family: FontFamilyType): string {
  switch (family) {
    case 'Kalpurush':
      return "'Kalpurush', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
    case 'Hind Siliguri':
      return "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
    case 'Noto Sans Bengali':
      return "'Noto Sans Bengali', sans-serif";
    case 'Inter':
      return "'Inter', sans-serif";
    case 'JetBrains Mono':
      return "'JetBrains Mono', monospace";
    default:
      return "'Kalpurush', sans-serif";
  }
}

/**
 * Converts any hex or rgb color string to rgba format with the specified opacity.
 * Handles #RGB, #RRGGBB, #RRGGBBAA, rgb(...), rgba(...).
 */
export function hexToRgba(color: string, opacity: number): string {
  if (!color || color === 'transparent') return 'transparent';
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  if (clampedOpacity === 0) return 'transparent';

  const cleanColor = color.trim();

  // Already rgba? Replace alpha channel
  if (cleanColor.startsWith('rgba(')) {
    const parts = cleanColor.slice(5, -1).split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${clampedOpacity})`;
    }
  }

  // rgb(...)
  if (cleanColor.startsWith('rgb(')) {
    const parts = cleanColor.slice(4, -1).split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${clampedOpacity})`;
    }
  }

  // Hex (#RGB or #RRGGBB)
  if (cleanColor.startsWith('#')) {
    let hex = cleanColor.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
    }
  }

  return cleanColor;
}

export function resolveElementStyles(element: SceneElement) {
  // Merge container subStyle override if present
  const containerSub = element.subStyles?.container || {};
  const style = {
    ...element.style,
    ...containerSub
  };
  const { cornerRadius, geometry } = element;

  let borderRadiusStyle = `${style.borderRadius ?? 16}px`;
  if (cornerRadius) {
    if (cornerRadius.linked) {
      borderRadiusStyle = `${cornerRadius.topLeft}px`;
    } else {
      borderRadiusStyle = `${cornerRadius.topLeft}px ${cornerRadius.topRight}px ${cornerRadius.bottomRight}px ${cornerRadius.bottomLeft}px`;
    }
  }

  let paddingStyle = `${style.padding ?? 20}px`;
  if (geometry.paddingBox) {
    const pb = geometry.paddingBox;
    paddingStyle = `${pb.top}px ${pb.right}px ${pb.bottom}px ${pb.left}px`;
  }

  let marginStyle: string | undefined = undefined;
  if (geometry.marginBox) {
    const mb = geometry.marginBox;
    marginStyle = `${mb.top}px ${mb.right}px ${mb.bottom}px ${mb.left}px`;
  }

  // Comprehensive Background & Opacity Resolution
  const opacity = style.bgOpacity !== undefined ? style.bgOpacity : 1.0;
  const isTransparent = style.bgMode === 'transparent' || opacity === 0;

  let background = 'transparent';
  let backgroundColor = 'transparent';

  if (!isTransparent) {
    if (style.bgMode === 'gradient') {
      const color1 = hexToRgba(style.bgColor || '#0f172a', opacity);
      const color2 = hexToRgba(style.gradientColor2 || '#1e293b', opacity);
      background = `linear-gradient(${style.gradientAngle ?? 135}deg, ${color1}, ${color2})`;
      backgroundColor = color1;
    } else {
      // Solid mode
      const solidColor = hexToRgba(style.bgColor || '#0f172a', opacity);
      background = solidColor;
      backgroundColor = solidColor;
    }
  }

  let borderTopWidth = `${style.borderWidth ?? 1}px`;
  let borderRightWidth = `${style.borderWidth ?? 1}px`;
  let borderBottomWidth = `${style.borderWidth ?? 1}px`;
  let borderLeftWidth = `${style.borderWidth ?? 1}px`;

  if (style.borderWidths) {
    const bw = style.borderWidths;
    if (bw.linked) {
      borderTopWidth = `${bw.top}px`;
      borderRightWidth = `${bw.top}px`;
      borderBottomWidth = `${bw.top}px`;
      borderLeftWidth = `${bw.top}px`;
    } else {
      borderTopWidth = `${bw.top}px`;
      borderRightWidth = `${bw.right}px`;
      borderBottomWidth = `${bw.bottom}px`;
      borderLeftWidth = `${bw.left}px`;
    }
  }

  let boxShadow = 'none';
  if (style.glowIntensity > 0) {
    boxShadow = `0 0 ${style.glowIntensity * 2}px ${style.glowColor || '#38bdf8'}`;
  }

  // CRITICAL: When transparent, NEVER apply backdropFilter blur! A blur filter on transparent backgrounds
  // renders an opaque frosted glass rectangle over the canvas, destroying transparency.
  const effectiveBackdropFilter =
    !isTransparent && (style.backdropBlur ?? 0) > 0
      ? `blur(${style.backdropBlur}px)`
      : undefined;

  return {
    background,
    backgroundColor,
    backdropFilter: effectiveBackdropFilter,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderStyle: style.borderStyle || 'solid',
    borderColor: style.borderColor || 'rgba(56, 189, 248, 0.3)',
    borderRadius: borderRadiusStyle,
    padding: paddingStyle,
    margin: marginStyle,
    boxShadow
  };
}

export function getSubPartStyle(element: SceneElement, target: SubPartTarget): SubPartStyle {
  return element.subStyles?.[target] || {};
}

// Convert numbers to Bangla digits
export function toBanglaDigit(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[+w]);
}
