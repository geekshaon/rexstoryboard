import React from 'react';
import { PanelTop, Sparkles } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss } from '../../styleUtils';

export const HeaderCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'floating_pill' } = element;
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const bodySub = getSubPartStyle(element, 'body');
  const badgeSub = getSubPartStyle(element, 'badge');

  // Title styling
  const titleColor =
    titleSub.textColor ||
    titleSub.typography?.textColor ||
    element.typography.textColor ||
    '#f8fafc';
  const titleFontFamily = titleSub.typography?.fontFamily || element.typography.fontFamily;
  const titleFontSize = titleSub.typography?.fontSize ?? element.typography.fontSize ?? 22;
  const titleFontWeight = titleSub.typography?.fontWeight || element.typography.fontWeight || '700';

  // Subtitle styling
  const subtitleColor =
    bodySub.textColor ||
    bodySub.typography?.textColor ||
    '#94a3b8';
  const subtitleFontFamily = bodySub.typography?.fontFamily || titleFontFamily;
  const subtitleFontSize =
    bodySub.typography?.fontSize ?? Math.max(13, Math.round(titleFontSize * 0.65));

  // Badge styling
  const badgeBg =
    badgeSub.bgColor ||
    (data.badgeBg as string | undefined) ||
    'rgba(56, 189, 248, 0.15)';
  const badgeTextColor =
    badgeSub.textColor ||
    (data.badgeTextColor as string | undefined) ||
    '#38bdf8';
  const badgeBorderColor =
    badgeSub.borderColor ||
    `${badgeTextColor}40`;

  const showSubtitle = data.showSubtitle !== false && Boolean(data.subtitle);
  const showBadge = data.showBadge !== false && Boolean(data.badge) && layoutVariant !== 'minimal_headline';

  // Specific layout adjustments
  const isTopBar = layoutVariant === 'top_bar';

  return (
    <div
      className={`w-full h-full flex items-center justify-between select-none transition-all duration-150 ${
        isTopBar ? 'border-b' : 'shadow-xl'
      }`}
      style={{
        ...containerStyle,
        borderRadius: isTopBar ? '0px' : containerStyle.borderRadius
      }}
    >
      {/* Left Column: Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        <span
          className="font-bold tracking-tight shrink-0 truncate"
          style={{
            fontFamily: getFontFamilyCss(titleFontFamily),
            fontSize: `${titleFontSize}px`,
            fontWeight: titleFontWeight,
            color: titleColor
          }}
        >
          {data.title || 'প্রধান শিরোনাম'}
        </span>

        {showSubtitle && (
          <>
            <span className="text-slate-600 font-light select-none text-sm shrink-0">|</span>
            <span
              className="font-normal truncate opacity-90"
              style={{
                fontFamily: getFontFamilyCss(subtitleFontFamily),
                fontSize: `${subtitleFontSize}px`,
                color: subtitleColor
              }}
            >
              {data.subtitle}
            </span>
          </>
        )}
      </div>

      {/* Right Column: Status / Badge */}
      {showBadge && (
        <div className="shrink-0">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border"
            style={{
              backgroundColor: badgeBg,
              color: badgeTextColor,
              borderColor: badgeBorderColor
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{data.badge}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export const HeaderCardInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;

  return (
    <div className="space-y-3.5">
      {/* 1. Header Title */}
      <div className="space-y-1">
        <label className="text-xs font-mono text-slate-300 font-semibold block">
          Header Title / Module
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. ডিজিটাল ইলেকট্রনিক্স"
          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
        />
      </div>

      {/* 2. Subtitle / Chapter Note */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showSubtitle !== false}
              onChange={(e) => onChange({ showSubtitle: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Show Subtitle / Topic</span>
          </label>
        </div>

        {data.showSubtitle !== false && (
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="e.g. পর্ব ০৩ : লজিক গেটের প্রাথমিক ধারণা"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        )}
      </div>

      {/* 3. Badge Tag */}
      <div className="space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showBadge !== false}
              onChange={(e) => onChange({ showBadge: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Show Status Badge</span>
          </label>
        </div>

        {data.showBadge !== false && (
          <>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Badge Text</label>
              <input
                type="text"
                value={data.badge || ''}
                onChange={(e) => onChange({ badge: e.target.value })}
                placeholder="e.g. ল্যাব ভেরিফিকেশন or PART 1"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Badge Accent Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={data.badgeTextColor || '#38bdf8'}
                    onChange={(e) =>
                      onChange({
                        badgeTextColor: e.target.value,
                        badgeBg: `${e.target.value}20`
                      })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                  />
                  <span className="text-[10px] font-mono text-slate-400 uppercase truncate">
                    {data.badgeTextColor || '#38bdf8'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const headerCardDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.header_card,
  type: 'header_card',
  label: 'Header Card',
  category: 'Text',
  tier: 'smart',
  icon: PanelTop,
  CanvasRenderer: HeaderCardRenderer,
  DataInspector: HeaderCardInspector,
  specFormatter: (el) => `
- **Header Card: "${el.data.title || 'Header'}"**
  - Variant: \`${el.layoutVariant || 'floating_pill'}\`
  - Subtitle: "${el.data.subtitle || 'None'}"
  - Badge: "${el.data.badge || 'None'}"`
};

