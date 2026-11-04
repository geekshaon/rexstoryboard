import React from 'react';
import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Check,
  MousePointerClick
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { BUTTON_PILL_VARIANTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss, toBanglaDigit, hexToRgba } from '../../styleUtils';

interface AccentStyle {
  color: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: FontFamilyType;
  lineHeight?: number;
  glow?: number;
  bgColor?: string;
  borderRadius?: number;
}

/**
 * Parses bracketed text [highlight] or {accent} and wraps in glowing accent span
 */
function renderHighlightedText(text: string, accentStyle: AccentStyle | string): React.ReactNode {
  if (!text) return null;
  const hasBrackets = /\[(.*?)\]|\{(.*?)\}/.test(text);
  if (!hasBrackets) return text;

  const styleObj: AccentStyle =
    typeof accentStyle === 'string'
      ? { color: accentStyle }
      : accentStyle;

  const isPill = Boolean(styleObj.bgColor);
  const glowShadow = (styleObj.glow ?? 0) > 0 ? `0 0 ${styleObj.glow}px ${styleObj.color}80` : 'none';

  const spanStyle: React.CSSProperties = {
    color: styleObj.color,
    fontSize: styleObj.fontSize ? `${styleObj.fontSize}px` : undefined,
    fontWeight: styleObj.fontWeight || '700',
    fontFamily: styleObj.fontFamily ? getFontFamilyCss(styleObj.fontFamily) : undefined,
    textShadow: glowShadow,
    backgroundColor: styleObj.bgColor || undefined,
    borderRadius: styleObj.borderRadius !== undefined ? `${styleObj.borderRadius}px` : (isPill ? '6px' : undefined),
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

export const PILL_VARIANT_TITLES: Record<string, string> = {
  live_pulse_pill: 'P1. live_pulse_pill',
  split_key_value_pill: 'P2. split_key_value_pill',
  chapter_index_pill: 'P3. chapter_index_pill',
  hardware_pin_pill: 'P4. hardware_pin_pill',
  delta_trend_pill: 'P5. delta_trend_pill',
  cyber_bracket_pill: 'P6. cyber_bracket_pill',
  keycap_shortcut_pill: 'P7. keycap_shortcut_pill',
  formula_variable_pill: 'P8. formula_variable_pill',
  warning_alert_pill: 'P9. warning_alert_pill',
  step_progress_pill: 'P10. step_progress_pill',
  code_syntax_pill: 'P11. code_syntax_pill',
  versus_battle_pill: 'P12. versus_battle_pill',
  all_pills_showcase: 'Pills Showcase Grid (All 12)'
};

/**
 * Normalized variant helper ensuring backwards compatibility
 */
function normalizePillVariant(v?: string): string {
  if (!v) return 'live_pulse_pill';
  if (v === 'primary_cta_pill') return 'live_pulse_pill';
  if (v === 'dual_action_split') return 'split_key_value_pill';
  if (v === 'icon_chip_pill') return 'hardware_pin_pill';
  if (v === 'badge_group_pills') return 'all_pills_showcase';
  if (v === 'download_link_capsule') return 'keycap_shortcut_pill';
  return v;
}

export const ButtonPillRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant } = element;
  const activeVariant = normalizePillVariant(layoutVariant);
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const itemsSub = getSubPartStyle(element, 'items');
  const badgeSub = getSubPartStyle(element, 'badge');
  const accentSub = getSubPartStyle(element, 'accent');

  // Title / Pill text typography
  const titleColor = titleSub.textColor || titleSub.typography?.textColor || element.typography.textColor || '#ffffff';
  const titleFontSize = titleSub.typography?.fontSize ?? 15;
  const titleFontWeight = titleSub.typography?.fontWeight ?? '700';
  const titleFontFamily = (titleSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

  // Items styling
  const itemBorderRadius = itemsSub.borderRadius ?? 999;
  const itemBgColor = itemsSub.bgColor || 'rgba(15, 23, 42, 0.85)';
  const itemGlowIntensity = itemsSub.glowIntensity ?? 14;

  // Badge styling
  const badgeBg = badgeSub.bgColor || '#06b6d4';
  const badgeTextColor = badgeSub.textColor || '#0b0f19';
  const badgeBorderColor = badgeSub.borderColor || 'rgba(56, 189, 248, 0.4)';

  // Accent styling
  const themeAccentColor =
    accentSub.textColor ||
    accentSub.typography?.highlightColor ||
    element.typography.highlightColor ||
    '#06b6d4';
  const themeAccentGlow = accentSub.typography?.highlightGlow ?? accentSub.glowIntensity ?? 14;

  const accentStyle: AccentStyle = {
    color: themeAccentColor,
    fontSize: accentSub.typography?.fontSize,
    fontWeight: accentSub.typography?.fontWeight,
    fontFamily: accentSub.typography?.fontFamily as FontFamilyType | undefined,
    glow: themeAccentGlow,
    bgColor: accentSub.bgColor,
    borderRadius: accentSub.borderRadius
  };

  const showPillLabel = data.showPillLabel !== false;
  const displayLabel = data.pillLabel || PILL_VARIANT_TITLES[activeVariant] || 'Status Pill';

  // Specific Pill Data Fallbacks
  const liveText = data.liveText || 'সিগন্যাল সক্রিয় (HIGH)';
  const liveColor = data.liveColor || '#10b981';

  const splitKey = data.splitKey || 'ভোল্টেজ (VCC)';
  const splitValue = data.splitValue || '+5.0V DC';
  const splitValueBg = data.splitValueBg || '#06b6d4';

  const chapterNumber = data.chapterNumber !== undefined ? String(data.chapterNumber) : '০৩';
  const chapterTitle = data.chapterTitle || 'পর্ব ০৩ : লজিক গেট';
  const chapterBadgeColor = data.chapterBadgeColor || '#38bdf8';

  const pinNumber = data.pinNumber || 'PIN 13';
  const pinName = data.pinName || 'SCK / LED';
  const pinBadgeColor = data.pinBadgeColor || '#f59e0b';

  const deltaValue = data.deltaValue || '+84.5%';
  const deltaLabel = data.deltaLabel || 'গতি বৃদ্ধি';
  const deltaDirection = data.deltaDirection || 'up';

  const bracketText = data.bracketText || 'CLOCK: 16MHz';
  const bracketColor = data.bracketColor || '#06b6d4';

  const key1 = data.key1 || 'Ctrl';
  const key2 = data.key2 || 'M';
  const keySeparator = data.keySeparator || '+';
  const key2Color = data.key2Color || '#06b6d4';

  const formulaSymbol = data.formulaSymbol || 'R';
  const formulaName = data.formulaName || 'রোধ';
  const formulaUnit = data.formulaUnit || '(Ω)';
  const formulaBadgeColor = data.formulaBadgeColor || '#f59e0b';

  const warningBadge = data.warningBadge || 'সতর্কতা';
  const warningMessage = data.warningMessage || 'শর্ট সার্কিট ঝুঁকি!';
  const warningColor = data.warningColor || '#f43f5e';

  const currentStep = Number(data.currentStep ?? 2);
  const totalSteps = Number(data.totalSteps ?? 4);
  const stepPrefix = data.stepPrefix || 'STEP';

  const codeFunction = data.codeFunction || 'digitalWrite';
  const codeArg1 = data.codeArg1 || '13';
  const codeArg2 = data.codeArg2 || 'HIGH';

  const versusLeft = data.versusLeft || 'অ্যানালগ';
  const versusBadge = data.versusBadge || 'VS';
  const versusRight = data.versusRight || 'ডিজিটাল';

  // Render individual pill nodes (reusable for single or all-showcase grid)
  const renderPillItem = (variantKey: string) => {
    switch (variantKey) {
      // -----------------------------------------------------------------------
      // P1. LIVE PULSE PILL
      // -----------------------------------------------------------------------
      case 'live_pulse_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 78, 59, 0.25)',
              borderColor: liveColor,
              boxShadow: `0 0 16px ${hexToRgba(liveColor, 0.35)}`
            }}
            className="inline-flex items-center gap-2.5 px-4 py-2 border select-none transition-all"
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span
                style={{ backgroundColor: liveColor }}
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              />
              <span
                style={{ backgroundColor: liveColor }}
                className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-[0_0_8px_#34d399]"
              />
            </span>
            <span
              style={{
                color: titleColor,
                fontSize: `${titleFontSize}px`,
                fontWeight: titleFontWeight,
                fontFamily: getFontFamilyCss(titleFontFamily)
              }}
              className="tracking-wide"
            >
              {renderHighlightedText(liveText, accentStyle)}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P2. SPLIT KEY-VALUE PILL
      // -----------------------------------------------------------------------
      case 'split_key_value_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: hexToRgba(splitValueBg, 0.5)
            }}
            className="inline-flex items-stretch border bg-slate-950 overflow-hidden select-none shadow-md"
          >
            <div className="flex items-center px-4 py-1.5 bg-slate-950">
              <span
                style={{
                  color: '#e2e8f0',
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 600,
                  fontFamily: getFontFamilyCss(titleFontFamily)
                }}
              >
                {splitKey}
              </span>
            </div>
            <div
              style={{
                backgroundColor: splitValueBg,
                color: '#0b0f19'
              }}
              className="flex items-center px-4 py-1.5 font-mono font-black text-sm tracking-tight"
            >
              <span>{splitValue}</span>
            </div>
          </div>
        );

      // -----------------------------------------------------------------------
      // P3. CHAPTER INDEX PILL
      // -----------------------------------------------------------------------
      case 'chapter_index_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)'
            }}
            className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 border select-none"
          >
            <div
              style={{
                backgroundColor: chapterBadgeColor,
                color: '#0b0f19'
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm"
            >
              <span>{chapterNumber}</span>
            </div>
            <span
              style={{
                color: titleColor,
                fontSize: `${titleFontSize}px`,
                fontWeight: titleFontWeight,
                fontFamily: getFontFamilyCss(titleFontFamily)
              }}
              className="tracking-tight"
            >
              {renderHighlightedText(chapterTitle, accentStyle)}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P4. HARDWARE PIN PILL
      // -----------------------------------------------------------------------
      case 'hardware_pin_pill':
        return (
          <div
            style={{
              borderRadius: '8px',
              borderColor: hexToRgba(pinBadgeColor, 0.4),
              backgroundColor: 'rgba(15, 23, 42, 0.9)'
            }}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 border select-none shadow-sm"
          >
            <span
              style={{
                backgroundColor: pinBadgeColor,
                color: '#0b0f19'
              }}
              className="px-2 py-0.5 rounded text-xs font-mono font-black tracking-wide"
            >
              {pinNumber}
            </span>
            <span
              style={{
                color: '#f8fafc',
                fontSize: `${titleFontSize}px`,
                fontWeight: 700
              }}
              className="font-mono"
            >
              {pinName}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P5. DELTA TREND PILL
      // -----------------------------------------------------------------------
      case 'delta_trend_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: '#10b981',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.2)'
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 border text-emerald-400 font-mono font-bold select-none text-sm"
          >
            <span>{deltaDirection === 'down' ? '▼' : '▲'}</span>
            <span>{deltaValue}</span>
            <span
              style={{
                fontFamily: getFontFamilyCss(titleFontFamily)
              }}
              className="font-sans font-semibold text-emerald-300 ml-1"
            >
              {deltaLabel}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P6. CYBER BRACKET PILL
      // -----------------------------------------------------------------------
      case 'cyber_bracket_pill':
        return (
          <div className="inline-flex items-center gap-3 select-none px-2 py-1">
            <span
              style={{ color: bracketColor }}
              className="font-mono font-bold text-xl leading-none"
            >
              |
            </span>
            <span
              style={{ color: bracketColor }}
              className="font-mono font-bold tracking-wider text-sm"
            >
              [ {bracketText} ]
            </span>
            <span
              style={{ color: bracketColor }}
              className="font-mono font-bold text-xl leading-none"
            >
              |
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P7. KEYCAP SHORTCUT PILL
      // -----------------------------------------------------------------------
      case 'keycap_shortcut_pill':
        return (
          <div className="inline-flex items-center gap-2 select-none">
            {/* Keycap 1 */}
            <div className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 border-b-3 border-b-slate-950 shadow-md font-mono text-xs font-bold text-slate-200">
              {key1}
            </div>

            <span className="text-slate-400 font-bold font-mono text-xs">
              {keySeparator}
            </span>

            {/* Keycap 2 */}
            <div
              style={{
                backgroundColor: key2Color,
                borderColor: hexToRgba(key2Color, 0.8),
                borderBottomColor: '#0e7490'
              }}
              className="px-3 py-1 rounded-md border border-b-3 shadow-md font-mono text-xs font-black text-slate-950"
            >
              {key2}
            </div>
          </div>
        );

      // -----------------------------------------------------------------------
      // P8. FORMULA VARIABLE PILL
      // -----------------------------------------------------------------------
      case 'formula_variable_pill':
        return (
          <div
            style={{
              borderRadius: '12px',
              borderColor: hexToRgba(formulaBadgeColor, 0.5),
              backgroundColor: 'rgba(15, 23, 42, 0.85)'
            }}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 border select-none shadow-sm"
          >
            <div
              style={{
                backgroundColor: formulaBadgeColor,
                color: '#0b0f19'
              }}
              className="w-6 h-6 rounded flex items-center justify-center font-serif font-black italic text-sm shadow-sm"
            >
              {formulaSymbol}
            </div>
            <span
              style={{
                color: '#fef08a',
                fontSize: `${titleFontSize}px`,
                fontWeight: titleFontWeight,
                fontFamily: getFontFamilyCss(titleFontFamily)
              }}
              className="font-bold"
            >
              {formulaName} {formulaUnit}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P9. WARNING ALERT PILL
      // -----------------------------------------------------------------------
      case 'warning_alert_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: warningColor,
              backgroundColor: 'rgba(69, 10, 10, 0.45)',
              boxShadow: `0 0 18px ${hexToRgba(warningColor, 0.4)}`
            }}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 border select-none"
          >
            <div
              style={{ backgroundColor: warningColor }}
              className="px-2.5 py-0.5 rounded-full flex items-center gap-1 text-white font-bold text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>{warningBadge}</span>
            </div>
            <span
              style={{
                color: '#ffe4e6',
                fontSize: `${titleFontSize}px`,
                fontWeight: titleFontWeight,
                fontFamily: getFontFamilyCss(titleFontFamily)
              }}
              className="tracking-tight pr-1"
            >
              {renderHighlightedText(warningMessage, accentStyle)}
            </span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P10. STEP PROGRESS PILL
      // -----------------------------------------------------------------------
      case 'step_progress_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(15, 23, 42, 0.9)'
            }}
            className="inline-flex items-center gap-3 px-4 py-2 border select-none"
          >
            <span className="font-mono font-bold text-cyan-400 text-xs tracking-wider">
              {stepPrefix} {toBanglaDigit(currentStep)}/{toBanglaDigit(totalSteps)}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => {
                const isDone = i < currentStep;
                return (
                  <span
                    key={i}
                    style={{
                      backgroundColor: isDone ? '#22d3ee' : '#334155',
                      boxShadow: isDone ? '0 0 6px #22d3ee' : 'none'
                    }}
                    className="w-3.5 h-1.5 rounded-full transition-all"
                  />
                );
              })}
            </div>
          </div>
        );

      // -----------------------------------------------------------------------
      // P11. CODE SYNTAX PILL
      // -----------------------------------------------------------------------
      case 'code_syntax_pill':
        return (
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-bold shadow-inner select-none tracking-tight">
            <span className="text-purple-400 font-black">{codeFunction}</span>
            <span className="text-slate-400">&nbsp;( </span>
            <span className="text-amber-400 font-black">{codeArg1}</span>
            <span className="text-slate-400">&nbsp;, </span>
            <span className="text-emerald-400 font-black">{codeArg2}</span>
            <span className="text-slate-400">&nbsp;);</span>
          </div>
        );

      // -----------------------------------------------------------------------
      // P12. VERSUS BATTLE PILL
      // -----------------------------------------------------------------------
      case 'versus_battle_pill':
        return (
          <div
            style={{
              borderRadius: '9999px',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)'
            }}
            className="inline-flex items-center gap-1.5 p-1 border select-none shadow-md"
          >
            {/* Left Pill */}
            <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs">
              {versusLeft}
            </div>

            {/* Center VS Circle */}
            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shrink-0 shadow-sm">
              {versusBadge}
            </div>

            {/* Right Pill */}
            <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
              {versusRight}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        ...containerStyle,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      className="w-full h-full relative"
    >
      {/* =========================================================================
          VIEW A: ALL PILLS SHOWCASE GRID (Complete 12-pill reference)
         ========================================================================= */}
      {activeVariant === 'all_pills_showcase' ? (
        <div className="grid grid-cols-2 gap-3.5 my-auto w-full">
          {Object.keys(PILL_VARIANT_TITLES)
            .filter((k) => k !== 'all_pills_showcase')
            .map((k) => (
              <div
                key={k}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-start gap-2"
              >
                <span className="font-mono text-[11px] text-cyan-400 font-semibold tracking-wide">
                  {PILL_VARIANT_TITLES[k]}
                </span>
                <div className="pt-0.5">{renderPillItem(k)}</div>
              </div>
            ))}
        </div>
      ) : (
        /* =======================================================================
           VIEW B: SINGLE SELECTED PILL (P1 to P12)
           ======================================================================= */
        <div className="flex flex-col items-center justify-center my-auto w-full gap-2 text-center">
          {showPillLabel && (
            <span
              style={{
                fontFamily: 'monospace',
                color: themeAccentColor
              }}
              className="text-[11px] font-semibold tracking-wide"
            >
              {displayLabel}
            </span>
          )}
          <div className="flex items-center justify-center">
            {renderPillItem(activeVariant)}
          </div>
        </div>
      )}
    </div>
  );
};

export const ButtonPillDataInspector: React.FC<{
  element: SceneElement;
  onChange: (patch: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data, layoutVariant } = element;
  const activeVariant = normalizePillVariant(layoutVariant);

  return (
    <div className="space-y-3 text-xs">
      {/* Header Label Toggle */}
      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-slate-400 font-bold">Pill Variant Tag / Label</label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              id="pill-lbl-cb"
              checked={data.showPillLabel !== false}
              onChange={(e) => onChange({ showPillLabel: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500"
            />
            <label htmlFor="pill-lbl-cb" className="cursor-pointer">
              Show
            </label>
          </div>
        </div>
        {data.showPillLabel !== false && (
          <input
            type="text"
            value={data.pillLabel || ''}
            onChange={(e) => onChange({ pillLabel: e.target.value })}
            placeholder={PILL_VARIANT_TITLES[activeVariant] || 'Pill Title'}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs outline-none focus:border-cyan-500"
          />
        )}
      </div>

      {/* P1. LIVE PULSE CONTROLS */}
      {activeVariant === 'live_pulse_pill' && (
        <div className="space-y-2">
          <div>
            <label className="text-slate-400 block mb-1">Live Status Text</label>
            <input
              type="text"
              value={data.liveText || 'সিগন্যাল সক্রিয় (HIGH)'}
              onChange={(e) => onChange({ liveText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Pulse Beacon Color</label>
            <input
              type="color"
              value={data.liveColor || '#10b981'}
              onChange={(e) => onChange({ liveColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P2. SPLIT KEY-VALUE CONTROLS */}
      {activeVariant === 'split_key_value_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Left Label / Key</label>
              <input
                type="text"
                value={data.splitKey || 'ভোল্টেজ (VCC)'}
                onChange={(e) => onChange({ splitKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Right Value</label>
              <input
                type="text"
                value={data.splitValue || '+5.0V DC'}
                onChange={(e) => onChange({ splitValue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono font-bold outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Right Value Background</label>
            <input
              type="color"
              value={data.splitValueBg || '#06b6d4'}
              onChange={(e) => onChange({ splitValueBg: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P3. CHAPTER INDEX CONTROLS */}
      {activeVariant === 'chapter_index_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Number</label>
              <input
                type="text"
                value={data.chapterNumber !== undefined ? data.chapterNumber : '০৩'}
                onChange={(e) => onChange({ chapterNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Chapter Title</label>
              <input
                type="text"
                value={data.chapterTitle || 'পর্ব ০৩ : লজিক গেট'}
                onChange={(e) => onChange({ chapterTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Circle Badge Color</label>
            <input
              type="color"
              value={data.chapterBadgeColor || '#38bdf8'}
              onChange={(e) => onChange({ chapterBadgeColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P4. HARDWARE PIN CONTROLS */}
      {activeVariant === 'hardware_pin_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Pin Tag</label>
              <input
                type="text"
                value={data.pinNumber || 'PIN 13'}
                onChange={(e) => onChange({ pinNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Pin Function</label>
              <input
                type="text"
                value={data.pinName || 'SCK / LED'}
                onChange={(e) => onChange({ pinName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Pin Tag Color</label>
            <input
              type="color"
              value={data.pinBadgeColor || '#f59e0b'}
              onChange={(e) => onChange({ pinBadgeColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P5. DELTA TREND CONTROLS */}
      {activeVariant === 'delta_trend_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Delta Value</label>
              <input
                type="text"
                value={data.deltaValue || '+84.5%'}
                onChange={(e) => onChange({ deltaValue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Trend Label</label>
              <input
                type="text"
                value={data.deltaLabel || 'গতি বৃদ্ধি'}
                onChange={(e) => onChange({ deltaLabel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Indicator Arrow</label>
            <select
              value={data.deltaDirection || 'up'}
              onChange={(e) => onChange({ deltaDirection: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            >
              <option value="up">▲ Upward Trend</option>
              <option value="down">▼ Downward Trend</option>
            </select>
          </div>
        </div>
      )}

      {/* P6. CYBER BRACKET CONTROLS */}
      {activeVariant === 'cyber_bracket_pill' && (
        <div className="space-y-2">
          <div>
            <label className="text-slate-400 block mb-1">Bracket Inner Text</label>
            <input
              type="text"
              value={data.bracketText || 'CLOCK: 16MHz'}
              onChange={(e) => onChange({ bracketText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono font-bold"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Bracket & Text Color</label>
            <input
              type="color"
              value={data.bracketColor || '#06b6d4'}
              onChange={(e) => onChange({ bracketColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P7. KEYCAP SHORTCUT CONTROLS */}
      {activeVariant === 'keycap_shortcut_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Key 1</label>
              <input
                type="text"
                value={data.key1 || 'Ctrl'}
                onChange={(e) => onChange({ key1: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Separator</label>
              <input
                type="text"
                value={data.keySeparator || '+'}
                onChange={(e) => onChange({ keySeparator: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Key 2</label>
              <input
                type="text"
                value={data.key2 || 'M'}
                onChange={(e) => onChange({ key2: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Key 2 Keycap Color</label>
            <input
              type="color"
              value={data.key2Color || '#06b6d4'}
              onChange={(e) => onChange({ key2Color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P8. FORMULA VARIABLE CONTROLS */}
      {activeVariant === 'formula_variable_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Symbol</label>
              <input
                type="text"
                value={data.formulaSymbol || 'R'}
                onChange={(e) => onChange({ formulaSymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-serif italic text-center font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                value={data.formulaName || 'রোধ'}
                onChange={(e) => onChange({ formulaName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Unit</label>
              <input
                type="text"
                value={data.formulaUnit || '(Ω)'}
                onChange={(e) => onChange({ formulaUnit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Symbol Badge Color</label>
            <input
              type="color"
              value={data.formulaBadgeColor || '#f59e0b'}
              onChange={(e) => onChange({ formulaBadgeColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P9. WARNING ALERT CONTROLS */}
      {activeVariant === 'warning_alert_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Alert Tag</label>
              <input
                type="text"
                value={data.warningBadge || 'সতর্কতা'}
                onChange={(e) => onChange({ warningBadge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Alert Message</label>
              <input
                type="text"
                value={data.warningMessage || 'শর্ট সার্কিট ঝুঁকি!'}
                onChange={(e) => onChange({ warningMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-bold"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-400">Danger Color</label>
            <input
              type="color"
              value={data.warningColor || '#f43f5e'}
              onChange={(e) => onChange({ warningColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* P10. STEP PROGRESS CONTROLS */}
      {activeVariant === 'step_progress_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Prefix</label>
              <input
                type="text"
                value={data.stepPrefix || 'STEP'}
                onChange={(e) => onChange({ stepPrefix: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Current</label>
              <input
                type="number"
                min="1"
                max={data.totalSteps || 4}
                value={data.currentStep ?? 2}
                onChange={(e) => onChange({ currentStep: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Total</label>
              <input
                type="number"
                min="1"
                max="10"
                value={data.totalSteps ?? 4}
                onChange={(e) => onChange({ totalSteps: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-center font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* P11. CODE SYNTAX CONTROLS */}
      {activeVariant === 'code_syntax_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Function</label>
              <input
                type="text"
                value={data.codeFunction || 'digitalWrite'}
                onChange={(e) => onChange({ codeFunction: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-purple-400 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Arg 1</label>
              <input
                type="text"
                value={data.codeArg1 || '13'}
                onChange={(e) => onChange({ codeArg1: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-400 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Arg 2</label>
              <input
                type="text"
                value={data.codeArg2 || 'HIGH'}
                onChange={(e) => onChange({ codeArg2: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* P12. VERSUS BATTLE CONTROLS */}
      {activeVariant === 'versus_battle_pill' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Left Item</label>
              <input
                type="text"
                value={data.versusLeft || 'অ্যানালগ'}
                onChange={(e) => onChange({ versusLeft: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Center</label>
              <input
                type="text"
                value={data.versusBadge || 'VS'}
                onChange={(e) => onChange({ versusBadge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-400 font-mono text-center font-black"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Right Item</label>
              <input
                type="text"
                value={data.versusRight || 'ডিজিটাল'}
                onChange={(e) => onChange({ versusRight: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-bold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function buttonPillCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant } = element;
  const activeVariant = normalizePillVariant(layoutVariant);
  let md = `### Pill & Status Badge: ${PILL_VARIANT_TITLES[activeVariant] || activeVariant}\n`;
  md += `- **Variant**: ${activeVariant}\n`;
  if (data.liveText) md += `- **Live Text**: ${data.liveText}\n`;
  if (data.splitKey) md += `- **Key-Value**: ${data.splitKey} = ${data.splitValue}\n`;
  if (data.chapterTitle) md += `- **Chapter**: [${data.chapterNumber}] ${data.chapterTitle}\n`;
  if (data.pinNumber) md += `- **Hardware Pin**: ${data.pinNumber} (${data.pinName})\n`;
  if (data.deltaValue) md += `- **Delta**: ${data.deltaValue} ${data.deltaLabel || ''}\n`;
  return md;
}

export const buttonPillCardDef: ComponentDefinition = {
  type: 'button_pill_card',
  label: 'Cyber Pills & Status Badges',
  category: 'Callouts',
  tier: 'smart',
  icon: MousePointerClick,
  defaultGeometry: { x: 240, y: 320, width: 440, height: 130, zIndex: 10 },
  defaultStyle: {
    bgMode: 'solid',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    bgOpacity: 0.9,
    backdropBlur: 8,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    padding: 16,
    glowColor: '#38bdf8',
    glowIntensity: 6
  },
  defaultTypography: {
    fontFamily: 'Kalpurush',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 1.3,
    textAlign: 'left',
    textColor: '#f8fafc',
    highlightColor: '#10b981'
  },
  defaultAnimation: {
    stepOrder: 1,
    startAtSecond: 0,
    entrance: 'fadeIn',
    duration: 0.8,
    delay: 0,
    easing: 'spring',
    emphasis: 'none'
  },
  defaultLayoutVariant: 'live_pulse_pill',
  layoutVariants: BUTTON_PILL_VARIANTS,
  availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
  defaultData: {
    showPillLabel: true,
    pillLabel: '',

    // P1. Live pulse
    liveText: 'সিগন্যাল সক্রিয় (HIGH)',
    liveColor: '#10b981',

    // P2. Split key-value
    splitKey: 'ভোল্টেজ (VCC)',
    splitValue: '+5.0V DC',
    splitValueBg: '#06b6d4',

    // P3. Chapter index
    chapterNumber: '০৩',
    chapterTitle: 'পর্ব ০৩ : লজিক গেট',
    chapterBadgeColor: '#38bdf8',

    // P4. Hardware pin
    pinNumber: 'PIN 13',
    pinName: 'SCK / LED',
    pinBadgeColor: '#f59e0b',

    // P5. Delta trend
    deltaValue: '+84.5%',
    deltaLabel: 'গতি বৃদ্ধি',
    deltaDirection: 'up',

    // P6. Cyber bracket
    bracketText: 'CLOCK: 16MHz',
    bracketColor: '#06b6d4',

    // P7. Keycaps
    key1: 'Ctrl',
    key2: 'M',
    keySeparator: '+',
    key2Color: '#06b6d4',

    // P8. Formula variable
    formulaSymbol: 'R',
    formulaName: 'রোধ',
    formulaUnit: '(Ω)',
    formulaBadgeColor: '#f59e0b',

    // P9. Warning alert
    warningBadge: 'সতর্কতা',
    warningMessage: 'শর্ট সার্কিট ঝুঁকি!',
    warningColor: '#f43f5e',

    // P10. Step progress
    currentStep: 2,
    totalSteps: 4,
    stepPrefix: 'STEP',

    // P11. Code syntax
    codeFunction: 'digitalWrite',
    codeArg1: '13',
    codeArg2: 'HIGH',

    // P12. Versus battle
    versusLeft: 'অ্যানালগ',
    versusBadge: 'VS',
    versusRight: 'ডিজিটাল'
  },
  CanvasRenderer: ButtonPillRenderer,
  DataInspector: ButtonPillDataInspector,
  specFormatter: buttonPillCardSpecFormatter
};
