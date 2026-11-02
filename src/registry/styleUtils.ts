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
  glowIntensity: 0
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

export function resolveElementStyles(element: SceneElement) {
  const { style, cornerRadius, geometry } = element;

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

  let background = style.bgColor;
  if (style.bgMode === 'gradient') {
    background = `linear-gradient(${style.gradientAngle ?? 135}deg, ${style.bgColor}, ${style.gradientColor2 || '#1e293b'})`;
  } else if (style.bgMode === 'transparent') {
    background = 'transparent';
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

  return {
    background,
    backdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
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

