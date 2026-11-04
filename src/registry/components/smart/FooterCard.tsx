import React from 'react';
import { PanelBottom } from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss } from '../../styleUtils';

interface AccentStyle {
  color: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: FontFamilyType;
  lineHeight?: number;
  glow?: number;
  bgColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Helper to parse and render text with specific words highlighted.
 */
function renderHighlightedText(text: string | undefined, accentStyle: AccentStyle): React.ReactNode {
  if (!text) return null;
  const hasBrackets = /\[(.*?)\]|\{(.*?)\}/.test(text);
  if (!hasBrackets) return text;

  const isPill = Boolean(accentStyle.bgColor);
  const glowShadow = (accentStyle.glow ?? 0) > 0 ? `0 0 ${accentStyle.glow}px ${accentStyle.color}80` : 'none';

  const spanStyle: React.CSSProperties = {
    color: accentStyle.color,
    fontSize: accentStyle.fontSize ? `${accentStyle.fontSize}px` : undefined,
    fontWeight: accentStyle.fontWeight || '700',
    fontFamily: accentStyle.fontFamily ? getFontFamilyCss(accentStyle.fontFamily) : undefined,
    lineHeight: isPill ? accentStyle.lineHeight : undefined,
    textShadow: glowShadow,
    backgroundColor: accentStyle.bgColor || undefined,
    borderRadius: accentStyle.borderRadius !== undefined ? `${accentStyle.borderRadius}px` : (isPill ? '6px' : undefined),
    border: (accentStyle.borderColor && accentStyle.borderWidth) ? `${accentStyle.borderWidth}px solid ${accentStyle.borderColor}` : undefined,
    padding: isPill ? '2px 8px' : undefined,
    display: isPill ? 'inline-block' : 'inline',
    transition: 'all 0.15s ease'
  };

  const parts = text.split(/(\[.*?\]|\{.*?\})/g);
  return parts.map((part, idx) => {
    if ((part.startsWith('[') && part.endsWith(']')) || (part.startsWith('{') && part.endsWith('}'))) {
      const content = part.slice(1, -1);
      return (
        <span key={idx} style={spanStyle}>
          {content}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export const FooterCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'floating_pill', style } = element;
  const containerStyle = resolveElementStyles(element);

  const bodySub = getSubPartStyle(element, 'body');
  const badgeSub = getSubPartStyle(element, 'badge');
  const accentSub = getSubPartStyle(element, 'accent');

  // Accent styling resolution
  const accentColor =
    accentSub.textColor ||
    accentSub.typography?.highlightColor ||
    accentSub.typography?.textColor ||
    (data.noteColor as string | undefined) ||
    '#38bdf8';

  const accentGlow =
    accentSub.typography?.highlightGlow ??
    accentSub.glowIntensity ??
    0;

  const accentStyle: AccentStyle = {
    color: accentColor,
    fontSize: accentSub.typography?.fontSize,
    fontWeight: accentSub.typography?.fontWeight,
    fontFamily: accentSub.typography?.fontFamily as FontFamilyType | undefined,
    lineHeight: accentSub.typography?.lineHeight,
    glow: accentGlow,
    bgColor: accentSub.bgColor,
    borderRadius: accentSub.borderRadius,
    borderColor: accentSub.borderColor,
    borderWidth: accentSub.borderWidth
  };

  // Note typography & color
  const noteColor =
    bodySub.textColor ||
    bodySub.typography?.textColor ||
    (data.noteColor as string | undefined) ||
    '#38bdf8';
  const noteFontFamily = bodySub.typography?.fontFamily || element.typography.fontFamily;
  const noteFontSize = bodySub.typography?.fontSize ?? element.typography.fontSize ?? 16;
  const noteFontWeight = bodySub.typography?.fontWeight || element.typography.fontWeight || '500';
  const noteTextAlign = bodySub.typography?.textAlign || element.typography.textAlign || 'left';

  // Progress tag styling
  const progressColor =
    badgeSub.textColor ||
    badgeSub.typography?.textColor ||
    element.typography.textColor ||
    '#94a3b8';
  const progressBg = badgeSub.bgColor || 'rgba(15, 23, 42, 0.8)';
  const progressBorder = badgeSub.borderColor || 'rgba(51, 65, 85, 0.7)';
  const progressBorderWidth = badgeSub.borderWidth ?? 1;
  const progressBorderRadius = badgeSub.borderRadius ?? 6;
  const progressFontSize = badgeSub.typography?.fontSize ?? 12;
  const progressFontWeight = badgeSub.typography?.fontWeight || '600';

  const isBottomBar = layoutVariant === 'bottom_bar';
  const isProgressBar = layoutVariant === 'progress_bar';
  const showProgress = data.showProgress !== false && Boolean(data.progress);
  const progressPercent = typeof data.progressPercent === 'number' ? data.progressPercent : 40;

  // Content Flow Alignment
  const verticalAlign = style.verticalAlign || 'center';
  const justifyClass =
    verticalAlign === 'top'
      ? 'justify-start'
      : verticalAlign === 'bottom'
      ? 'justify-end'
      : 'justify-center';

  return (
    <div
      className={`w-full h-full flex flex-col ${justifyClass} select-none transition-all duration-150 ${
        isBottomBar ? 'border-t' : 'shadow-xl'
      }`}
      style={{
        ...containerStyle,
        borderRadius: isBottomBar ? '0px' : containerStyle.borderRadius,
        borderTopWidth: isBottomBar ? `${Math.max(1, parseInt(containerStyle.borderTopWidth || '1', 10))}px` : containerStyle.borderTopWidth
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: Footer Note / Formula / Copyright */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
          <span
            className="truncate select-none w-full"
            style={{
              fontFamily: getFontFamilyCss(noteFontFamily),
              fontSize: `${noteFontSize}px`,
              fontWeight: noteFontWeight,
              color: noteColor,
              textAlign: noteTextAlign
            }}
          >
            {renderHighlightedText(data.note || 'পাদটীকা বা প্রয়োজনীয় নোট', accentStyle)}
          </span>
        </div>

        {/* Right: Progress Pill Tag */}
        {showProgress && (
          <div className="shrink-0 flex items-center gap-2">
            <span
              className="font-mono tracking-wider uppercase inline-flex items-center"
              style={{
                fontSize: `${progressFontSize}px`,
                fontWeight: progressFontWeight,
                color: progressColor,
                backgroundColor: progressBg,
                borderColor: progressBorder,
                borderWidth: `${progressBorderWidth}px`,
                borderStyle: 'solid',
                borderRadius: `${progressBorderRadius}px`,
                padding: '4px 10px'
              }}
            >
              {data.progress}
            </span>
          </div>
        )}
      </div>

      {/* Optional Progress Bar Line for progress_bar variant */}
      {isProgressBar && (
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(5, Math.min(100, progressPercent))}%`,
              backgroundColor: noteColor
            }}
          />
        </div>
      )}
    </div>
  );
};

export const FooterCardInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;

  return (
    <div className="space-y-3.5">
      {/* 1. Footer Note Text */}
      <div className="space-y-1">
        <label className="text-xs font-mono text-slate-300 font-semibold block">
          Footer Note / Formula / Topic
        </label>
        <textarea
          rows={2}
          value={data.note || ''}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="e.g. বুলিয়ান সমীকরণ: Y = A · B (Y সমান A অ্যান্ড B)"
          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium resize-none"
        />
      </div>

      {/* 2. Note Accent Color */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Note Accent Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.noteColor || '#38bdf8'}
            onChange={(e) => onChange({ noteColor: e.target.value })}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={data.noteColor || '#38bdf8'}
            onChange={(e) => onChange({ noteColor: e.target.value })}
            className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 uppercase"
          />
        </div>
      </div>

      {/* 3. Progress / Step Counter Tag */}
      <div className="space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showProgress !== false}
              onChange={(e) => onChange({ showProgress: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Show Progress / Page Tag</span>
          </label>
        </div>

        {data.showProgress !== false && (
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Progress Label</label>
            <input
              type="text"
              value={data.progress || ''}
              onChange={(e) => onChange({ progress: e.target.value })}
              placeholder="e.g. ধাপ ০১ / ০৪ or SCENE 1"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        )}

        {/* Progress % for progress_bar layout variant */}
        {element.layoutVariant === 'progress_bar' && (
          <div className="pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Progress Percentage</span>
              <span className="text-cyan-400 font-mono">{data.progressPercent ?? 40}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={data.progressPercent ?? 40}
              onChange={(e) => onChange({ progressPercent: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const footerCardDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.footer_card,
  type: 'footer_card',
  label: 'Footer Card',
  category: 'Text',
  tier: 'smart',
  icon: PanelBottom,
  CanvasRenderer: FooterCardRenderer,
  DataInspector: FooterCardInspector,
  specFormatter: (el) => `
- **Footer Card: "${el.data.note || 'Footer Note'}"**
  - Variant: \`${el.layoutVariant || 'floating_pill'}\`
  - Progress: "${el.data.progress || 'None'}"`
};

