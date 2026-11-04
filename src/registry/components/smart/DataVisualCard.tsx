import React from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Binary,
  Activity,
  Layers,
  Sparkles,
  Radio,
  Sliders,
  Check,
  Plus,
  Trash2,
  Table
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { DATA_VISUAL_VARIANTS } from '../../componentDefaults';
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

export const DataVisualCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'sparkline_area_chart' } = element;
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

  // Item styling
  const itemTextColor = itemsSub.textColor || itemsSub.typography?.textColor || '#cbd5e1';
  const itemFontSize = itemsSub.typography?.fontSize ?? Math.max(12, Math.round(titleFontSize * 0.72));
  const itemFontWeight = itemsSub.typography?.fontWeight ?? '500';
  const itemFontFamily = (itemsSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

  // Badge styling
  const badgeBg = badgeSub.bgColor || 'rgba(16, 185, 129, 0.15)';
  const badgeTextColor = badgeSub.textColor || '#10b981';
  const badgeBorderColor = badgeSub.borderColor || 'rgba(16, 185, 129, 0.3)';

  // Accent styling
  const themeAccentColor =
    accentSub.textColor ||
    accentSub.typography?.highlightColor ||
    element.typography.highlightColor ||
    '#10b981';

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
  const showBadge = data.showBadge !== false && Boolean(data.headerTag);

  // Data sets
  const chartPoints = Array.isArray(data.chartPoints) && data.chartPoints.length > 0
    ? data.chartPoints
    : [
        { label: 'T0', value: 20 },
        { label: 'T1', value: 45 },
        { label: 'T2', value: 85 },
        { label: 'T3', value: 65 },
        { label: 'T4', value: 98 },
        { label: 'T5', value: 72 }
      ];

  const barItems = Array.isArray(data.barItems) && data.barItems.length > 0
    ? data.barItems
    : [
        { label: 'Arduino Uno', value: 16, unit: 'MHz', color: '#06b6d4' },
        { label: 'ESP32 Dual', value: 240, unit: 'MHz', color: '#10b981', active: true },
        { label: 'STM32 Cortex', value: 72, unit: 'MHz', color: '#f59e0b' },
        { label: 'RP2040 Pico', value: 133, unit: 'MHz', color: '#8b5cf6' }
      ];

  const truthTable = data.truthTable || {
    headers: ['Input A', 'Input B', 'Output (A · B)'],
    rows: [
      ['0', '0', '0'],
      ['0', '1', '0'],
      ['1', '0', '0'],
      ['1', '1', '1']
    ],
    activeRow: 3
  };

  const donutSegments = Array.isArray(data.donutSegments) && data.donutSegments.length > 0
    ? data.donutSegments
    : [
        { label: 'অ্যাপ কোড', percent: 65, color: '#06b6d4' },
        { label: 'এসআরএএম', percent: 25, color: '#10b981' },
        { label: 'বুটলোডার', percent: 10, color: '#f59e0b' }
      ];

  const waveSignal = data.waveSignal || {
    frequency: '16 MHz',
    duty: '50%',
    voltage: '5.0V',
    bits: '10101100'
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
      className="w-full h-full relative justify-between gap-3"
    >
      {/* 1. Header Bar with Title & Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 shrink-0">
        <div className="min-w-0">
          {showTitle && (
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
          )}
          {data.subtitle && (
            <p
              style={{
                color: itemTextColor,
                fontSize: `${itemFontSize}px`,
                fontFamily: getFontFamilyCss(itemFontFamily)
              }}
              className="opacity-80 truncate text-xs mt-0.5"
            >
              {renderHighlightedText(data.subtitle, accentStyle)}
            </p>
          )}
        </div>

        {showBadge && (
          <span
            style={{
              backgroundColor: badgeBg,
              color: badgeTextColor,
              borderColor: badgeBorderColor
            }}
            className="px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold shrink-0 flex items-center gap-1"
          >
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{data.headerTag}</span>
          </span>
        )}
      </div>

      {/* 2. Visual Layout Variant Switcher */}
      {/* =========================================================================
          VARIANT 1: GLOWING AREA SPLINE CHART
         ========================================================================= */}
      {layoutVariant === 'sparkline_area_chart' && (
        <div className="flex-1 w-full flex flex-col justify-end relative min-h-[140px] pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="500" y2="110" stroke="rgba(255,255,255,0.12)" />

            {/* Area Path */}
            <path
              d="M 0 110 L 0 90 Q 100 60 200 20 T 400 10 L 500 40 L 500 110 Z"
              fill="url(#area-gradient)"
            />

            {/* Stroke Line */}
            <path
              d="M 0 90 Q 100 60 200 20 T 400 10 L 500 40"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }}
            />

            {/* Peak Beacon Point */}
            <circle cx="400" cy="10" r="5" fill="#06b6d4" className="animate-ping" opacity="0.7" />
            <circle cx="400" cy="10" r="4" fill="#f8fafc" stroke="#06b6d4" strokeWidth="2" />
          </svg>

          {/* Bottom X-Axis Markers */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 shrink-0">
            {chartPoints.map((pt: any, i: number) => (
              <span key={i}>{pt.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 2: COLUMN & BAR COMPARISON
         ========================================================================= */}
      {layoutVariant === 'bar_comparison_chart' && (
        <div className="flex-1 w-full flex items-end justify-around gap-3 pt-6 pb-1">
          {barItems.map((bar: any, idx: number) => {
            const maxVal = Math.max(...barItems.map((b: any) => b.value), 240);
            const heightPct = Math.round((bar.value / maxVal) * 100);
            const isHighest = bar.active || bar.value === maxVal;
            const barColor = bar.color || (isHighest ? '#10b981' : '#06b6d4');

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end max-w-[100px]">
                {/* Floating Value Tag */}
                <span
                  style={{ color: barColor }}
                  className="font-mono font-bold text-xs mb-1.5"
                >
                  {toBanglaDigit(bar.value)} <span className="text-[9px] text-slate-500">{bar.unit}</span>
                </span>

                {/* Vertical Bar Column */}
                <div className="w-full bg-slate-900/80 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-28 border border-white/5">
                  <div
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                      boxShadow: isHighest ? `0 0 14px ${barColor}80` : undefined
                    }}
                    className="w-full rounded-t-lg transition-all duration-300"
                  />
                </div>

                {/* Bottom Label */}
                <span className="text-[10px] text-slate-300 font-medium truncate mt-1.5 text-center max-w-full">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 3: LOGIC TRUTH TABLE MATRIX
         ========================================================================= */}
      {layoutVariant === 'truth_table_matrix' && (
        <div className="w-full my-auto overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-cyan-400">
                {truthTable.headers.map((h: string, i: number) => (
                  <th key={i} className="py-1.5 px-3 font-bold text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {truthTable.rows.map((row: string[], rIdx: number) => {
                const isActive = rIdx === (truthTable.activeRow ?? 3);
                return (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-800/50 transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 text-cyan-200 font-black shadow-inner'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="py-1.5 px-3 text-center font-mono">
                        <span
                          className={`inline-block w-6 py-0.5 rounded text-center ${
                            cell === '1'
                              ? isActive ? 'bg-cyan-400 text-slate-950 font-black shadow-sm' : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {cell}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          VARIANT 4: SEGMENTED DONUT BREAKDOWN
         ========================================================================= */}
      {layoutVariant === 'donut_distribution_chart' && (
        <div className="flex items-center justify-between gap-6 my-auto">
          {/* Left SVG Donut */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#06b6d4"
                strokeWidth="12"
                strokeDasharray="238.7"
                strokeDashoffset="83.5"
                fill="transparent"
                style={{ filter: 'drop-shadow(0 0 6px #06b6d480)' }}
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray="238.7"
                strokeDashoffset="179"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono font-bold text-white text-base">32 KB</span>
              <span className="text-[9px] font-mono text-cyan-400">FLASH</span>
            </div>
          </div>

          {/* Right Legend Pills */}
          <div className="flex-1 space-y-2">
            {donutSegments.map((seg: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: seg.color }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  <span className="text-slate-300 font-sans">{seg.label}</span>
                </div>
                <span style={{ color: seg.color }} className="font-bold">
                  {toBanglaDigit(seg.percent)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 5: OSCILLOSCOPE SIGNAL WAVEFORM
         ========================================================================= */}
      {layoutVariant === 'wave_signal_scope' && (
        <div className="w-full my-auto flex flex-col gap-2">
          {/* Signal Scope Box */}
          <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b15_1px,transparent_1px),linear-gradient(to_bottom,#064e3b15_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* Waveform SVG */}
            <svg className="w-full h-16 relative z-10 overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
              <path
                d="M 0 50 L 50 50 L 50 10 L 100 10 L 100 50 L 150 50 L 150 10 L 200 10 L 200 50 L 250 50 L 250 10 L 300 10 L 300 10 L 350 10 L 350 50 L 400 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}
              />
            </svg>

            {/* Readouts Row */}
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-1 relative z-10 border-t border-emerald-500/20">
              <span>{waveSignal.voltage || '5.0V'} HIGH</span>
              <span>FREQ: {waveSignal.frequency || '16 MHz'}</span>
              <span>DUTY: {waveSignal.duty || '50%'}</span>
              <span>BITS: {waveSignal.bits || '10101100'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DataVisualCardDataInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data } = element;
  const barItems = Array.isArray(data.barItems) ? data.barItems : [];

  const handleUpdateBar = (idx: number, patch: Record<string, any>) => {
    const next = [...barItems];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, barItems: next });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Header & Title Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300">Chart Headline</label>
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
            placeholder="চার্ট শিরোনাম..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none text-xs"
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            placeholder="সাবটেক্সট..."
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs"
          />
          <input
            type="text"
            value={data.headerTag || ''}
            onChange={(e) => onChange({ ...data, headerTag: e.target.value })}
            placeholder="ট্যাগ: • LIVE BENCHMARK"
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs font-mono"
          />
        </div>
      </div>

      {/* 2. Bar Chart Data Items */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <label className="font-bold text-slate-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bar Comparison Series ({barItems.length})</span>
        </label>
        <div className="space-y-1.5">
          {barItems.map((bar: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <input
                type="text"
                value={bar.label || ''}
                onChange={(e) => handleUpdateBar(i, { label: e.target.value })}
                placeholder="Label"
                className="bg-transparent text-slate-300 text-[11px] outline-none"
              />
              <input
                type="number"
                value={bar.value || 0}
                onChange={(e) => handleUpdateBar(i, { value: Number(e.target.value) })}
                className="bg-transparent text-slate-200 text-[11px] font-mono font-bold outline-none text-center"
              />
              <input
                type="text"
                value={bar.unit || ''}
                onChange={(e) => handleUpdateBar(i, { unit: e.target.value })}
                placeholder="Unit"
                className="bg-transparent text-slate-400 text-[11px] font-mono outline-none text-center"
              />
              <input
                type="color"
                value={bar.color || '#06b6d4'}
                onChange={(e) => handleUpdateBar(i, { color: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent justify-self-end"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function dataVisualCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant = 'sparkline_area_chart' } = element;
  let md = `### Data Visualization Block: ${data.title || 'Chart Visual'}\n`;
  md += `- **Variant**: ${layoutVariant}\n`;
  if (data.headerTag) md += `- **Tag**: ${data.headerTag}\n`;
  if (data.subtitle) md += `- **Description**: ${data.subtitle}\n`;
  return md;
}

export const dataVisualCardDef: ComponentDefinition = {
  type: 'data_visual_card',
  label: 'Data Visual & Charts Card',
  category: 'Data & Logic',
  tier: 'smart',
  icon: BarChart3,
  defaultGeometry: { x: 120, y: 200, width: 720, height: 340, zIndex: 10 },
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
  defaultLayoutVariant: 'sparkline_area_chart',
  layoutVariants: DATA_VISUAL_VARIANTS,
  availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
  defaultData: {
    title: 'মাইক্রোকন্ট্রোলার পারফরম্যান্স বিশ্লেষণ',
    subtitle: 'বিভিন্ন আর্কিটেকচারের প্রসেসিং স্পিড ও এক্সিকিউশন টাইম',
    headerTag: '• LIVE BENCHMARK',
    activeItemIndex: 1,
    chartPoints: [
      { label: 'T0', value: 20 },
      { label: 'T1', value: 45 },
      { label: 'T2', value: 85 },
      { label: 'T3', value: 65 },
      { label: 'T4', value: 98 },
      { label: 'T5', value: 72 }
    ],
    barItems: [
      { label: 'Arduino Uno', value: 16, unit: 'MHz', color: '#06b6d4' },
      { label: 'ESP32 Dual', value: 240, unit: 'MHz', color: '#10b981', active: true },
      { label: 'STM32 Cortex', value: 72, unit: 'MHz', color: '#f59e0b' },
      { label: 'RP2040 Pico', value: 133, unit: 'MHz', color: '#8b5cf6' }
    ],
    truthTable: {
      headers: ['Input A', 'Input B', 'Output (A · B)'],
      rows: [
        ['0', '0', '0'],
        ['0', '1', '0'],
        ['1', '0', '0'],
        ['1', '1', '1']
      ],
      activeRow: 3
    },
    donutSegments: [
      { label: 'অ্যাপ কোড', percent: 65, color: '#06b6d4' },
      { label: 'এসআরএএম', percent: 25, color: '#10b981' },
      { label: 'বুটলোডার', percent: 10, color: '#f59e0b' }
    ],
    waveSignal: {
      frequency: '16 MHz',
      duty: '50%',
      voltage: '5.0V',
      bits: '10101100'
    }
  },
  CanvasRenderer: DataVisualCardRenderer,
  DataInspector: DataVisualCardDataInspector,
  specFormatter: dataVisualCardSpecFormatter
};

