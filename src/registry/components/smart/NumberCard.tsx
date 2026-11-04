import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Zap,
  Sparkles,
  Clock,
  Sliders,
  BarChart3,
  Layers,
  Hash,
  ArrowRight,
  Radio
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { NUMBER_CARD_VARIANTS } from '../../componentDefaults';
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

export const NumberCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'kpi_hero_metric' } = element;
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const itemsSub = getSubPartStyle(element, 'items');
  const badgeSub = getSubPartStyle(element, 'badge');
  const accentSub = getSubPartStyle(element, 'accent');

  // Title styling
  const titleColor = titleSub.textColor || titleSub.typography?.textColor || element.typography.textColor || '#f8fafc';
  const titleFontSize = titleSub.typography?.fontSize ?? 18;
  const titleFontWeight = titleSub.typography?.fontWeight ?? '700';
  const titleLineHeight = titleSub.typography?.lineHeight ?? 1.3;
  const titleTextAlign = (titleSub.typography?.textAlign || element.typography.textAlign || 'left') as 'left' | 'center' | 'right';
  const titleFontFamily = (titleSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

  // Number / Items typography
  const numberColor = itemsSub.textColor || itemsSub.typography?.textColor || '#06b6d4';
  const numberFontSize = itemsSub.typography?.fontSize ?? 48;
  const numberFontWeight = itemsSub.typography?.fontWeight ?? '900';
  const numberFontFamily = (itemsSub.typography?.fontFamily || 'Inter') as FontFamilyType;
  const numberGlow = itemsSub.glowIntensity ?? 14;

  // Badge styling
  const badgeBg = badgeSub.bgColor || 'rgba(16, 185, 129, 0.15)';
  const badgeTextColor = badgeSub.textColor || '#10b981';
  const badgeBorderColor = badgeSub.borderColor || 'rgba(16, 185, 129, 0.3)';
  const badgeBorderRadius = badgeSub.borderRadius ?? 999;

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

  const showTitle = data.showTitle !== false && Boolean(data.title);
  const showBadge = data.showBadge !== false && Boolean(data.badge);
  const metricValue = data.value !== undefined ? String(data.value) : '98.4';
  const prefix = data.prefix || '';
  const suffix = data.suffix || '';
  const trend = data.trend || 'up'; // 'up' | 'down' | 'neutral'
  const gaugePercent = Math.min(100, Math.max(0, Number(data.gaugePercent ?? 78)));

  const trioStats = Array.isArray(data.trioStats) && data.trioStats.length > 0
    ? data.trioStats
    : [
        { label: 'ক্লক স্পিড', value: '16', unit: 'MHz' },
        { label: 'ডিজিটাল পিন', value: '14', unit: 'Pins' },
        { label: 'ফ্ল্যাশ মেমরি', value: '32', unit: 'KB' }
      ];

  return (
    <div
      style={{
        ...containerStyle,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      className="w-full h-full relative justify-between"
    >
      {/* =========================================================================
          VARIANT 1: GIANT HERO METRIC (KPI Card)
         ========================================================================= */}
      {layoutVariant === 'kpi_hero_metric' && (
        <div className="flex flex-col justify-between h-full gap-2">
          {/* Top Row: Title / Category on Left, Trend Badge on Right */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            {showTitle ? (
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  lineHeight: titleLineHeight,
                  textAlign: titleTextAlign,
                  fontFamily: getFontFamilyCss(titleFontFamily)
                }}
                className="tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
            ) : <div />}

            {showBadge && (
              <span
                style={{
                  backgroundColor: badgeBg,
                  color: badgeTextColor,
                  borderColor: badgeBorderColor,
                  borderRadius: `${badgeBorderRadius}px`
                }}
                className="px-2.5 py-0.5 border text-xs font-mono font-bold flex items-center gap-1 shrink-0"
              >
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                {trend === 'neutral' && <Activity className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{data.badge}</span>
              </span>
            )}
          </div>

          {/* Middle: Giant Hero Metric Number */}
          <div className="my-auto py-1">
            <div className="flex items-baseline gap-1">
              {prefix && (
                <span
                  style={{ color: numberColor, fontSize: `${Math.round(numberFontSize * 0.55)}px` }}
                  className="font-mono font-bold opacity-80"
                >
                  {prefix}
                </span>
              )}
              <span
                style={{
                  color: numberColor,
                  fontSize: `${numberFontSize}px`,
                  fontWeight: numberFontWeight,
                  fontFamily: getFontFamilyCss(numberFontFamily),
                  textShadow: numberGlow > 0 ? `0 0 ${numberGlow}px ${numberColor}80` : 'none'
                }}
                className="leading-none tracking-tight font-black"
              >
                {toBanglaDigit(metricValue)}
              </span>
              {suffix && (
                <span
                  style={{ color: numberColor, fontSize: `${Math.round(numberFontSize * 0.5)}px` }}
                  className="font-mono font-bold opacity-80 ml-1"
                >
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {/* Bottom: Subtitle / Context Note */}
          {data.subtitle && (
            <p
              style={{
                color: '#94a3b8',
                fontSize: `${Math.max(12, Math.round(titleFontSize * 0.72))}px`,
                fontFamily: getFontFamilyCss(titleFontFamily),
                textAlign: titleTextAlign
              }}
              className="leading-relaxed opacity-90 truncate"
            >
              {renderHighlightedText(data.subtitle, accentStyle)}
            </p>
          )}
        </div>
      )}

      {/* =========================================================================
          VARIANT 2: RADIAL GAUGE CARD (Circular Arc Gauge)
         ========================================================================= */}
      {layoutVariant === 'radial_gauge_card' && (
        <div className="flex items-center justify-between gap-4 h-full">
          {/* Left: Circular SVG Gauge */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={numberColor}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * gaugePercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: numberGlow > 0 ? `drop-shadow(0 0 6px ${numberColor})` : undefined,
                  transition: 'stroke-dashoffset 0.5s ease'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                style={{ color: numberColor, fontFamily: getFontFamilyCss(numberFontFamily) }}
                className="font-mono font-black text-xl leading-none"
              >
                {toBanglaDigit(gaugePercent)}%
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">GAUGE</span>
            </div>
          </div>

          {/* Right: Info, Title & Badge */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
            <div className="space-y-1">
              {showBadge && (
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeTextColor,
                    borderColor: badgeBorderColor,
                    borderRadius: `${badgeBorderRadius}px`
                  }}
                  className="px-2 py-0.5 border text-[10px] font-mono font-bold inline-flex items-center gap-1"
                >
                  <Gauge className="w-3 h-3" />
                  <span>{data.badge || 'OPTIMAL'}</span>
                </span>
              )}
              {showTitle && (
                <h3
                  style={{
                    color: titleColor,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: titleFontWeight,
                    fontFamily: getFontFamilyCss(titleFontFamily),
                    textAlign: titleTextAlign
                  }}
                  className="font-bold leading-tight truncate"
                >
                  {renderHighlightedText(data.title, accentStyle)}
                </h3>
              )}
            </div>

            {data.subtitle && (
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: `${Math.max(12, Math.round(titleFontSize * 0.72))}px`,
                  fontFamily: getFontFamilyCss(titleFontFamily)
                }}
                className="opacity-90 leading-relaxed text-xs truncate"
              >
                {renderHighlightedText(data.subtitle, accentStyle)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 3: BENCHMARK DELTA COMPARISON (Before vs After)
         ========================================================================= */}
      {layoutVariant === 'comparison_delta_card' && (
        <div className="flex flex-col justify-between h-full gap-2">
          {/* Header Title */}
          {showTitle && (
            <h3
              style={{
                color: titleColor,
                fontSize: `${titleFontSize}px`,
                fontWeight: titleFontWeight,
                fontFamily: getFontFamilyCss(titleFontFamily),
                textAlign: titleTextAlign
              }}
              className="tracking-tight truncate shrink-0"
            >
              {renderHighlightedText(data.title, accentStyle)}
            </h3>
          )}

          {/* Center Comparison Leap */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-around gap-2 my-auto">
            {/* Before */}
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">BEFORE</span>
              <span className="font-mono text-slate-400 text-lg line-through font-bold">
                {data.previousValue || '65.2%'}
              </span>
            </div>

            {/* Arrow Leap */}
            <div className="flex items-center justify-center text-cyan-400">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* After (Hero) */}
            <div className="text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-0.5">AFTER</span>
              <span
                style={{
                  color: numberColor,
                  textShadow: numberGlow > 0 ? `0 0 ${numberGlow}px ${numberColor}80` : 'none'
                }}
                className="font-mono text-2xl font-black"
              >
                {toBanglaDigit(metricValue)}{suffix}
              </span>
            </div>
          </div>

          {/* Bottom Delta Badge */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.3)'
              }}
              className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.deltaText || '⚡ ১.৫x পারফরম্যান্স বৃদ্ধি'}</span>
            </span>

            {data.subtitle && (
              <span className="text-xs text-slate-400 truncate text-right">
                {renderHighlightedText(data.subtitle, accentStyle)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 4: MULTI-STAT GRID (3-in-1 Compact Metric Trio)
         ========================================================================= */}
      {layoutVariant === 'multi_stat_grid' && (
        <div className="flex flex-col justify-between h-full gap-2.5">
          {showTitle && (
            <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="font-bold truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
              {showBadge && (
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeTextColor,
                    borderColor: badgeBorderColor
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                >
                  {data.badge}
                </span>
              )}
            </div>
          )}

          {/* 3 Columns Trio */}
          <div className="grid grid-cols-3 gap-2 my-auto divide-x divide-slate-800">
            {trioStats.slice(0, 3).map((st: any, i: number) => (
              <div key={i} className={`flex flex-col justify-center text-center ${i > 0 ? 'pl-2' : ''}`}>
                <span className="text-[11px] font-semibold text-slate-400 truncate mb-1">
                  {st.label}
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    style={{
                      color: i === 0 ? '#06b6d4' : i === 1 ? '#10b981' : '#f59e0b',
                      fontSize: `${Math.round(numberFontSize * 0.72)}px`,
                      fontFamily: getFontFamilyCss(numberFontFamily)
                    }}
                    className="font-mono font-black leading-none"
                  >
                    {toBanglaDigit(st.value)}
                  </span>
                  {st.unit && (
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      {st.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {data.subtitle && (
            <p className="text-xs text-slate-400 truncate text-center opacity-85 shrink-0 pt-1 border-t border-white/5">
              {renderHighlightedText(data.subtitle, accentStyle)}
            </p>
          )}
        </div>
      )}

      {/* =========================================================================
          VARIANT 5: DIGITAL CYBER TICKER
         ========================================================================= */}
      {layoutVariant === 'countdown_ticker_card' && (
        <div className="flex flex-col justify-between h-full gap-2">
          {/* Header Row */}
          <div className="flex items-center justify-between shrink-0">
            {showTitle && (
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="font-bold tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
            )}
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5 font-bold">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>LIVE TICKER</span>
            </span>
          </div>

          {/* Monospaced Ticker Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center my-auto shadow-inner">
            <span
              style={{
                color: numberColor,
                fontSize: `${Math.round(numberFontSize * 0.85)}px`,
                textShadow: `0 0 12px ${numberColor}80`
              }}
              className="font-mono font-black tracking-widest leading-none"
            >
              {data.tickerText || `${toBanglaDigit(metricValue)} ${suffix || 'SEC'}`}
            </span>
          </div>

          {data.subtitle && (
            <p className="text-xs text-slate-400 truncate opacity-85 shrink-0">
              {renderHighlightedText(data.subtitle, accentStyle)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const NumberCardDataInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data } = element;
  const trioStats = Array.isArray(data.trioStats) ? data.trioStats : [];

  const handleUpdateTrio = (idx: number, patch: Record<string, string>) => {
    const next = [...trioStats];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, trioStats: next });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Header & Title Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300">Metric Headline</label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={data.showTitle !== false}
              onChange={(e) => onChange({ ...data, showTitle: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500"
            />
            <span>Show Title</span>
          </label>
        </div>
        {data.showTitle !== false && (
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="মেট্রিক শিরোনাম (যেমন: সিস্টেম পারফরম্যান্স)"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none text-xs"
          />
        )}
        <textarea
          rows={2}
          value={data.subtitle || ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="সাবটেক্সট বা প্রাসঙ্গিক বিবরণ (ব্যবহার করুন [ব্র্যাকেট] হাইলাইটের জন্য)"
          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs resize-none"
        />
      </div>

      {/* 2. Primary Number & Unit Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
        <label className="font-bold text-slate-300 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span>Metric Value & Units</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Prefix</span>
            <input
              type="text"
              value={data.prefix || ''}
              onChange={(e) => onChange({ ...data, prefix: e.target.value })}
              placeholder="যেমন: +, $"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Value</span>
            <input
              type="text"
              value={data.value !== undefined ? String(data.value) : '98.4'}
              onChange={(e) => onChange({ ...data, value: e.target.value })}
              placeholder="98.4"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Suffix / Unit</span>
            <input
              type="text"
              value={data.suffix || ''}
              onChange={(e) => onChange({ ...data, suffix: e.target.value })}
              placeholder="%, MHz, ms"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Trend Indicator & Badge Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300">Trend & Badge Pill</label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={data.showBadge !== false}
              onChange={(e) => onChange({ ...data, showBadge: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500"
            />
            <span>Show Badge</span>
          </label>
        </div>
        {data.showBadge !== false && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Badge Text</span>
              <input
                type="text"
                value={data.badge || ''}
                onChange={(e) => onChange({ ...data, badge: e.target.value })}
                placeholder="যেমন: ↑ ১২.৮% বৃদ্ধি"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Trend Direction</span>
              <select
                value={data.trend || 'up'}
                onChange={(e) => onChange({ ...data, trend: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-semibold"
              >
                <option value="up">Positive (↑ Green)</option>
                <option value="down">Negative (↓ Red)</option>
                <option value="neutral">Neutral (⚡ Cyan)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Gauge & Benchmark Comparison Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <label className="font-bold text-slate-300 block text-xs">Specialized Parameters</label>
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Radial Gauge Fill</span>
              <span className="font-mono text-cyan-400">{data.gaugePercent ?? 78}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={data.gaugePercent ?? 78}
              onChange={(e) => onChange({ ...data, gaugePercent: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block mb-0.5">Previous Value (Before)</span>
              <input
                type="text"
                value={data.previousValue || ''}
                onChange={(e) => onChange({ ...data, previousValue: e.target.value })}
                placeholder="65.2%"
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Delta Leap Text</span>
              <input
                type="text"
                value={data.deltaText || ''}
                onChange={(e) => onChange({ ...data, deltaText: e.target.value })}
                placeholder="⚡ ১.৫x পারফরম্যান্স"
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Trio Stats Editor */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <label className="font-bold text-slate-300 block text-xs">Multi-Stat Trio (3 Columns)</label>
        <div className="space-y-1.5">
          {trioStats.map((st: any, i: number) => (
            <div key={i} className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <input
                type="text"
                value={st.label || ''}
                onChange={(e) => handleUpdateTrio(i, { label: e.target.value })}
                placeholder="Label"
                className="bg-transparent text-slate-300 text-[11px] outline-none"
              />
              <input
                type="text"
                value={st.value || ''}
                onChange={(e) => handleUpdateTrio(i, { value: e.target.value })}
                placeholder="Value"
                className="bg-transparent text-slate-200 text-[11px] font-mono font-bold outline-none text-center"
              />
              <input
                type="text"
                value={st.unit || ''}
                onChange={(e) => handleUpdateTrio(i, { unit: e.target.value })}
                placeholder="Unit"
                className="bg-transparent text-slate-400 text-[11px] font-mono outline-none text-right"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function numberCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant = 'kpi_hero_metric' } = element;
  let md = `### Number Metric Block: ${data.title || 'KPI Metric'}\n`;
  md += `- **Variant**: ${layoutVariant}\n`;
  md += `- **Value**: ${data.prefix || ''}${data.value !== undefined ? data.value : '98.4'}${data.suffix || ''}\n`;
  if (data.badge) md += `- **Badge / Trend**: ${data.badge}\n`;
  if (data.subtitle) md += `- **Note**: ${data.subtitle}\n`;
  return md;
}

export const numberCardDef: ComponentDefinition = {
  type: 'number_card',
  label: 'KPI & Metric Number Card',
  category: 'Data & Logic',
  tier: 'smart',
  icon: Hash,
  defaultGeometry: { x: 140, y: 220, width: 480, height: 260, zIndex: 10 },
  defaultStyle: {
    bgMode: 'solid',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    bgOpacity: 0.9,
    backdropBlur: 8,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    padding: 24,
    glowColor: '#38bdf8',
    glowIntensity: 6
  },
  defaultTypography: {
    fontFamily: 'Kalpurush',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 1.3,
    textAlign: 'left',
    textColor: '#f8fafc',
    highlightColor: '#06b6d4'
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
  defaultLayoutVariant: 'kpi_hero_metric',
  layoutVariants: NUMBER_CARD_VARIANTS,
  availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
  defaultData: {
    value: '98.4',
    suffix: '%',
    prefix: '',
    title: 'সিস্টেম অ্যাকুরেসি ও নির্ভরযোগ্যতা',
    subtitle: 'আগের সংস্করণের তুলনায় [৩৫% দ্রুততর] রেসপন্স রেট',
    badge: '↑ ১২.৮% বৃদ্ধি',
    trend: 'up',
    gaugePercent: 78,
    previousValue: '65.2%',
    deltaText: '⚡ ১.৫x পারফরম্যান্স বৃদ্ধি',
    trioStats: [
      { label: 'ক্লক স্পিড', value: '16', unit: 'MHz' },
      { label: 'ডিজিটাল পিন', value: '14', unit: 'Pins' },
      { label: 'ফ্ল্যাশ মেমরি', value: '32', unit: 'KB' }
    ]
  },
  CanvasRenderer: NumberCardRenderer,
  DataInspector: NumberCardDataInspector,
  specFormatter: numberCardSpecFormatter
};

