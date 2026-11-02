import React from 'react';
import { MessageSquareText, Sparkles, Quote, CheckCircle2 } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss } from '../../styleUtils';
import { useStudioStore } from '../../../store/studioStore';

/**
 * Helper to render text with optional bracket highlight syntax
 */
function renderHighlightedText(text: string, highlightColor: string): React.ReactNode {
  if (!text) return null;
  const hasBrackets = /\[(.*?)\]|\{(.*?)\}/.test(text);
  if (!hasBrackets) return text;

  const parts = text.split(/(\[.*?\]|\{.*?\})/g);
  return parts.map((part, idx) => {
    if ((part.startsWith('[') && part.endsWith(']')) || (part.startsWith('{') && part.endsWith('}'))) {
      const content = part.slice(1, -1);
      return (
        <span
          key={idx}
          className="font-bold inline-block"
          style={{ color: highlightColor }}
        >
          {content}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export const SubtitleCaptionRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'callout_quote' } = element;
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const bodySub = getSubPartStyle(element, 'body');
  const badgeSub = getSubPartStyle(element, 'badge');
  const accentSub = getSubPartStyle(element, 'accent');

  // Accent color
  const accentColor =
    accentSub.textColor ||
    accentSub.typography?.highlightColor ||
    (data.accentColor as string | undefined) ||
    '#38bdf8';

  // Title styling
  const titleColor =
    titleSub.textColor ||
    titleSub.typography?.textColor ||
    element.typography.textColor ||
    '#f8fafc';
  const titleFontFamily = titleSub.typography?.fontFamily || element.typography.fontFamily;
  const titleFontSize = titleSub.typography?.fontSize ?? element.typography.fontSize ?? 22;
  const titleFontWeight = titleSub.typography?.fontWeight || element.typography.fontWeight || '700';
  const titleLineHeight = titleSub.typography?.lineHeight ?? element.typography.lineHeight ?? 1.3;
  const textAlign = titleSub.typography?.textAlign || element.typography.textAlign || 'left';

  // Body styling
  const bodyColor =
    bodySub.textColor ||
    bodySub.typography?.textColor ||
    '#cbd5e1';
  const bodyFontFamily = bodySub.typography?.fontFamily || titleFontFamily;
  const bodyFontSize =
    bodySub.typography?.fontSize ?? Math.max(14, Math.round(titleFontSize * 0.75));
  const bodyFontWeight = bodySub.typography?.fontWeight || '400';
  const bodyLineHeight = bodySub.typography?.lineHeight ?? 1.5;

  // Badge styling
  const badgeBg =
    badgeSub.bgColor ||
    (data.badgeBg as string | undefined) ||
    `${accentColor}20`;
  const badgeTextColor =
    badgeSub.textColor ||
    (data.badgeTextColor as string | undefined) ||
    accentColor;

  const showTitle = data.showTitle !== false && Boolean(data.title);
  const showBadge = data.showBadge !== false && Boolean(data.badge);

  // Variant specifics
  const isCallout = layoutVariant === 'callout_quote';
  const isPill = layoutVariant === 'caption_pill';
  const isTakeaway = layoutVariant === 'key_takeaway';

  return (
    <div
      className={`w-full h-full flex flex-col justify-center select-none transition-all duration-150 relative ${
        isCallout ? 'border-l-4' : ''
      }`}
      style={{
        ...containerStyle,
        borderLeftColor: isCallout ? accentColor : containerStyle.borderColor,
        textAlign
      }}
    >
      {/* 1. Header Row (Pill or Icon Badge) */}
      {(isPill || isTakeaway) && showBadge && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border"
            style={{
              backgroundColor: badgeBg,
              color: badgeTextColor,
              borderColor: `${badgeTextColor}40`
            }}
          >
            {isTakeaway ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            <span>{data.badge}</span>
          </span>
        </div>
      )}

      {/* 2. Main Title / Subtitle Headline */}
      {showTitle && (
        <div className="flex items-center gap-2 mb-1.5">
          {isCallout && <Quote className="w-4 h-4 shrink-0 opacity-70" style={{ color: accentColor }} />}
          <h2
            className="font-bold tracking-tight select-none"
            style={{
              fontFamily: getFontFamilyCss(titleFontFamily),
              fontSize: `${titleFontSize}px`,
              fontWeight: titleFontWeight,
              lineHeight: titleLineHeight,
              color: titleColor
            }}
          >
            {renderHighlightedText(data.title || '', accentColor)}
          </h2>
        </div>
      )}

      {/* 3. Description / Caption Body */}
      {data.body && (
        <p
          className="select-none leading-relaxed opacity-95"
          style={{
            fontFamily: getFontFamilyCss(bodyFontFamily),
            fontSize: `${bodyFontSize}px`,
            fontWeight: bodyFontWeight,
            lineHeight: bodyLineHeight,
            color: bodyColor,
            whiteSpace: 'pre-wrap'
          }}
        >
          {renderHighlightedText(data.body, accentColor)}
        </p>
      )}
    </div>
  );
};

export const SubtitleCaptionInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;
  const updateElementTypography = useStudioStore((s) => s.updateElementTypography);
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);

  const titleSub = element.subStyles?.title;
  const activeAlign = titleSub?.typography?.textAlign || element.typography.textAlign || 'left';

  const handleAlignChange = (al: 'left' | 'center' | 'right') => {
    updateElementTypography(element.id, { textAlign: al });
    if (element.subStyles?.title?.typography) {
      updateElementSubStyle(element.id, 'title', {
        typography: { ...element.subStyles.title.typography, textAlign: al }
      });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Title / Headline */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showTitle !== false}
              onChange={(e) => onChange({ showTitle: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Subtitle / Section Headline</span>
          </label>
        </div>

        {data.showTitle !== false && (
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. অ্যান্ড গেটের মূল বৈশিষ্ট্য"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
          />
        )}
      </div>

      {/* 2. Body Description Text */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
          <span>Caption / Body Explanation</span>
          <span className="text-[10px] text-cyan-400 font-normal">Supports [brackets]</span>
        </label>
        <textarea
          rows={3}
          value={data.body || ''}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="e.g. ইনপুটের সব কয়টি সিগন্যাল যখন [১ (High)] হবে, শুধুমাত্র তখনই আউটপুট ১ হবে।"
          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-normal leading-relaxed resize-none"
        />
      </div>

      {/* 3. Badge Tag (Active for pill/takeaway) */}
      <div className="space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showBadge !== false}
              onChange={(e) => onChange({ showBadge: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Badge / Category Tag</span>
          </label>
        </div>

        {data.showBadge !== false && (
          <input
            type="text"
            value={data.badge || ''}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="e.g. সংজ্ঞা ও কার্যপ্রণালী or KEY TAKEAWAY"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        )}
      </div>

      {/* 4. Accent Color & Alignment */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Highlight / Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.accentColor || '#38bdf8'}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={data.accentColor || '#38bdf8'}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 uppercase"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Quick Alignment</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            {(['left', 'center', 'right'] as const).map((al) => (
              <button
                key={al}
                type="button"
                onClick={() => handleAlignChange(al)}
                className={`py-1 rounded text-xs capitalize flex items-center justify-center cursor-pointer ${
                  activeAlign === al
                    ? 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {al}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const subtitleCaptionDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.subtitle_caption,
  type: 'subtitle_caption',
  label: 'Subtitle & Caption Card',
  category: 'Text',
  tier: 'smart',
  icon: MessageSquareText,
  CanvasRenderer: SubtitleCaptionRenderer,
  DataInspector: SubtitleCaptionInspector,
  specFormatter: (el) => `
- **Subtitle & Caption Card: "${el.data.title || el.data.badge || 'Caption'}"**
  - Variant: \`${el.layoutVariant || 'callout_quote'}\`
  - Body: "${(el.data.body || '').slice(0, 60)}..."`
};
