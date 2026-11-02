import React from 'react';
import { PanelBottom } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss } from '../../styleUtils';

export const FooterCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'floating_pill' } = element;
  const containerStyle = resolveElementStyles(element);

  const bodySub = getSubPartStyle(element, 'body');
  const badgeSub = getSubPartStyle(element, 'badge');

  // Note typography & color
  const noteColor =
    bodySub.textColor ||
    bodySub.typography?.textColor ||
    (data.noteColor as string | undefined) ||
    '#38bdf8';
  const noteFontFamily = bodySub.typography?.fontFamily || element.typography.fontFamily;
  const noteFontSize = bodySub.typography?.fontSize ?? element.typography.fontSize ?? 16;
  const noteFontWeight = bodySub.typography?.fontWeight || element.typography.fontWeight || '500';

  // Progress tag styling
  const progressColor =
    badgeSub.textColor ||
    badgeSub.typography?.textColor ||
    element.typography.textColor ||
    '#94a3b8';
  const progressBg = badgeSub.bgColor || 'rgba(15, 23, 42, 0.8)';
  const progressBorder = badgeSub.borderColor || 'rgba(51, 65, 85, 0.7)';

  const isBottomBar = layoutVariant === 'bottom_bar';
  const isProgressBar = layoutVariant === 'progress_bar';
  const showProgress = data.showProgress !== false && Boolean(data.progress);
  const progressPercent = typeof data.progressPercent === 'number' ? data.progressPercent : 40;

  return (
    <div
      className={`w-full h-full flex flex-col justify-center select-none transition-all duration-150 ${
        isBottomBar ? 'border-t' : 'shadow-xl'
      }`}
      style={{
        ...containerStyle,
        borderRadius: isBottomBar ? '0px' : containerStyle.borderRadius
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: Footer Note / Formula / Copyright */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
          <span
            className="truncate select-none font-medium"
            style={{
              fontFamily: getFontFamilyCss(noteFontFamily),
              fontSize: `${noteFontSize}px`,
              fontWeight: noteFontWeight,
              color: noteColor
            }}
          >
            {data.note || 'পাদটীকা বা প্রয়োজনীয় নোট'}
          </span>
        </div>

        {/* Right: Progress Pill Tag */}
        {showProgress && (
          <div className="shrink-0 flex items-center gap-2">
            <span
              className="text-xs font-mono tracking-wider uppercase px-2.5 py-1 rounded border"
              style={{
                color: progressColor,
                backgroundColor: progressBg,
                borderColor: progressBorder
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

