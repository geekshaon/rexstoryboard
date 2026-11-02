import React from 'react';
import { Type, Sparkles } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss } from '../../styleUtils';
import { useStudioStore } from '../../../store/studioStore';

/**
 * Helper to parse and render text with specific words highlighted.
 * Supports:
 * 1. Inline bracket syntax: "Hello [world]" or "Hello {world}"
 * 2. Explicit word match list from data.highlightWords: "world, hello"
 */
function renderHighlightedText(
  text: string,
  highlightWords: string | undefined,
  highlightColor: string,
  highlightGlow: number = 16
): React.ReactNode {
  if (!text) return 'প্রধান শিরোনাম';

  const glowShadow = highlightGlow > 0 ? `0 0 ${highlightGlow}px ${highlightColor}80` : 'none';

  // 1. Bracket syntax: [word] or {word}
  const hasBrackets = /\[(.*?)\]|\{(.*?)\}/.test(text);
  if (hasBrackets) {
    const parts = text.split(/(\[.*?\]|\{.*?\})/g);
    return parts.map((part, idx) => {
      if ((part.startsWith('[') && part.endsWith(']')) || (part.startsWith('{') && part.endsWith('}'))) {
        const content = part.slice(1, -1);
        return (
          <span
            key={idx}
            className="font-extrabold transition-all duration-150 inline-block"
            style={{
              color: highlightColor,
              textShadow: glowShadow
            }}
          >
            {content}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }

  // 2. Specific words defined in inspector
  if (highlightWords && highlightWords.trim()) {
    const targets = highlightWords
      .split(/[,|]/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (targets.length > 0) {
      const escaped = targets.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, idx) => {
        const isMatch = targets.some((t) => t.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <span
              key={idx}
              className="font-extrabold transition-all duration-150 inline-block"
              style={{
                color: highlightColor,
                textShadow: glowShadow
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    }
  }

  return text;
}

export const HeroTextRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, typography } = element;
  const containerStyle = resolveElementStyles(element);
  const titleSub = getSubPartStyle(element, 'title');
  const bodySub = getSubPartStyle(element, 'body');

  // Highlight color resolution — single source: typography.highlightColor
  // data.highlightColor kept as legacy read-only fallback for old saved scenes
  const highlightColor =
    titleSub.typography?.highlightColor ||
    typography.highlightColor ||
    (data.highlightColor as string | undefined) ||
    '#38bdf8';

  const highlightGlow =
    titleSub.typography?.highlightGlow ??
    typography.highlightGlow ??
    (typeof data.highlightGlow === 'number' ? data.highlightGlow : 16);

  const titleColor =
    titleSub.textColor ||
    titleSub.typography?.textColor ||
    typography.textColor ||
    '#f8fafc';

  const effectiveFontFamily = titleSub.typography?.fontFamily || typography.fontFamily;
  const effectiveFontSize = titleSub.typography?.fontSize ?? typography.fontSize;
  const effectiveFontWeight = titleSub.typography?.fontWeight || typography.fontWeight;
  const effectiveLineHeight = titleSub.typography?.lineHeight ?? typography.lineHeight ?? 1.3;
  const effectiveTextAlign = titleSub.typography?.textAlign || typography.textAlign || 'center';

  // Subtitle styling resolution
  const hasSubtitle =
    element.layoutVariant === 'title_with_subtitle' ||
    (data.subtitle && data.showSubtitle !== false);

  const subtitleColor =
    bodySub.textColor ||
    bodySub.typography?.textColor ||
    '#cbd5e1';

  const subtitleFontSize =
    bodySub.typography?.fontSize ??
    Math.max(14, Math.round(effectiveFontSize * 0.45));

  const subtitleFontWeight = bodySub.typography?.fontWeight || '400';
  const subtitleLineHeight = bodySub.typography?.lineHeight ?? 1.4;
  const subtitleFontFamily = bodySub.typography?.fontFamily || effectiveFontFamily;

  return (
    <div
      className="w-full h-full flex flex-col justify-center transition-all duration-150"
      style={{
        ...containerStyle,
        textAlign: effectiveTextAlign
      }}
    >
      <h1
        className="font-bold tracking-tight leading-tight select-none w-full"
        style={{
          fontFamily: getFontFamilyCss(effectiveFontFamily),
          fontSize: `${effectiveFontSize}px`,
          fontWeight: effectiveFontWeight,
          lineHeight: effectiveLineHeight,
          color: titleColor,
          textAlign: effectiveTextAlign
        }}
      >
        {renderHighlightedText(data.text || '', data.highlightWords, highlightColor, highlightGlow)}
      </h1>

      {hasSubtitle && (
        <p
          className="mt-3 select-none w-full opacity-90 transition-all duration-150"
          style={{
            fontFamily: getFontFamilyCss(subtitleFontFamily),
            fontSize: `${subtitleFontSize}px`,
            fontWeight: subtitleFontWeight,
            lineHeight: subtitleLineHeight,
            color: subtitleColor,
            textAlign: effectiveTextAlign
          }}
        >
          {renderHighlightedText(
            data.subtitle || 'বিষয়বস্তুর বিস্তারিত বিবরণ বা প্রয়োজনীয় সাবটেক্সট এখানে প্রদর্শন করা হবে',
            undefined,
            highlightColor,
            0
          )}
        </p>
      )}
    </div>
  );
};

export const HeroTextInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;
  const typography = element.typography;

  const updateElementTypography = useStudioStore((s) => s.updateElementTypography);
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);

  const titleSub = element.subStyles?.title;
  const activeHighlightColor = titleSub?.typography?.highlightColor || typography.highlightColor || '#38bdf8';
  const activeHighlightGlow = titleSub?.typography?.highlightGlow ?? typography.highlightGlow ?? 16;
  const activeTextAlign = titleSub?.typography?.textAlign || typography.textAlign || 'center';

  const handleHighlightColorChange = (color: string) => {
    updateElementTypography(element.id, { highlightColor: color });
    if (element.subStyles?.title?.typography) {
      updateElementSubStyle(element.id, 'title', {
        typography: { ...element.subStyles.title.typography, highlightColor: color }
      });
    }
  };

  const handleHighlightGlowChange = (glow: number) => {
    updateElementTypography(element.id, { highlightGlow: glow });
    if (element.subStyles?.title?.typography) {
      updateElementSubStyle(element.id, 'title', {
        typography: { ...element.subStyles.title.typography, highlightGlow: glow }
      });
    }
  };

  const handleTextAlignChange = (al: 'left' | 'center' | 'right') => {
    updateElementTypography(element.id, { textAlign: al });
    if (element.subStyles?.title?.typography) {
      updateElementSubStyle(element.id, 'title', {
        typography: { ...element.subStyles.title.typography, textAlign: al }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Heading Text */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
          <span>Main Title Text</span>
          <span className="text-[10px] text-cyan-400 font-normal">Supports [brackets]</span>
        </label>
        <textarea
          rows={3}
          value={data.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="e.g. ডিজিটাল ইলেকট্রনিক্স ও [অ্যান্ড গেট]"
          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none font-medium leading-relaxed"
        />
        <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300/90 leading-tight">
          💡 <span className="font-semibold">Tip:</span> Wrap words inside <code className="px-1 py-0.5 rounded bg-cyan-900/60 font-mono text-cyan-200">[brackets]</code> or list them below to colorize with your highlight accent.
        </div>
      </div>

      {/* 2. Subtitle / Subtext (active for title_with_subtitle variant or when populated) */}
      {(element.layoutVariant === 'title_with_subtitle' || data.subtitle !== undefined) && (
        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
            <span>Subtitle / Subtext</span>
            <span className="text-[10px] text-cyan-400 font-normal">Secondary description</span>
          </label>
          <textarea
            rows={2}
            value={data.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="e.g. বিষয়বস্তুর বিস্তারিত বিবরণ বা প্রয়োজনীয় সাবটেক্সট এখানে লিখুন..."
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-normal leading-relaxed"
          />
        </div>
      )}

      {/* 2. Specific Words Highlight & Color */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Word-Specific Highlight Accent</span>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Specific Word(s) to Highlight</label>
          <input
            type="text"
            value={data.highlightWords || ''}
            onChange={(e) => onChange({ highlightWords: e.target.value })}
            placeholder="e.g. অ্যান্ড গেট, লজিক (comma separated)"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Highlight Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeHighlightColor}
              onChange={(e) => handleHighlightColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={activeHighlightColor}
              onChange={(e) => handleHighlightColorChange(e.target.value)}
              placeholder="#38bdf8"
              className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 uppercase"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Highlight Text Glow</span>
            <span className="text-cyan-400 font-mono">
              {activeHighlightGlow === 0 ? 'Off (Clean Text)' : `${activeHighlightGlow}px`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={activeHighlightGlow}
            onChange={(e) => handleHighlightGlowChange(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Quick Alignment</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            {(['left', 'center', 'right'] as const).map((al) => (
              <button
                key={al}
                type="button"
                onClick={() => handleTextAlignChange(al)}
                className={`py-1 rounded text-xs capitalize flex items-center justify-center cursor-pointer ${
                  activeTextAlign === al
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

export const heroTextDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.hero_text,
  type: 'hero_text',
  label: 'Hero Header Block',
  category: 'Text',
  tier: 'smart',
  icon: Type,
  CanvasRenderer: HeroTextRenderer,
  DataInspector: HeroTextInspector,
  specFormatter: (el) => `
- **Hero Header Block: "${el.data.text || 'Heading'}"**
  - Variant: \`${el.layoutVariant || 'simple_title_block'}\`${el.data.subtitle ? `\n  - Subtitle: "${el.data.subtitle}"` : ''}
  - Highlight Accent: \`${el.data.highlightWords || 'None'}\``
};
