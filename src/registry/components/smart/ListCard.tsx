import React from 'react';
import {
  ListOrdered,
  CheckCircle2,
  Sparkles,
  Zap,
  Brain,
  Plug,
  Clock,
  Cpu,
  Database,
  Code2,
  Terminal,
  Check,
  AlertCircle,
  Activity,
  ShieldCheck,
  Layers,
  Sliders,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { LIST_VARIANTS } from '../../componentDefaults';
import { resolveElementStyles, getSubPartStyle, getFontFamilyCss, toBanglaDigit, hexToRgba } from '../../styleUtils';
import { useStudioStore } from '../../../store/studioStore';

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

export interface ListItemData {
  id: string;
  title: string;
  description?: string;
  number?: string; // e.g. "০১", "01", "1", "LAW #01"
  tag?: string; // e.g. "SPEAKING NOW", "FOCUS", "LAW #01", "DONE"
  value?: string; // e.g. "1 · 1 = 1", "5.0 Volts DC", "78% (25 KB / 32 KB)", "✓ Done"
  status?: 'active' | 'done' | 'normal' | 'pending';
  icon?: string; // 'cpu' | 'zap' | 'plug' | 'timer' | 'brain' | 'code' | 'terminal' | 'database' | 'sparkles' | 'check' | 'alert'
  progress?: number; // 0 to 100 for progress bar
  color?: string; // Custom accent color for this specific item
}

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  zap: Zap,
  plug: Plug,
  clock: Clock,
  timer: Clock,
  brain: Brain,
  code: Code2,
  terminal: Terminal,
  database: Database,
  sparkles: Sparkles,
  check: CheckCircle2,
  alert: AlertCircle,
  activity: Activity,
  shield: ShieldCheck,
  layers: Layers
};

export function renderItemIcon(iconName?: string, className: string = 'w-5 h-5') {
  const IconComp = (iconName && ICON_MAP[iconName.toLowerCase()]) || Zap;
  return <IconComp className={className} />;
}

/**
 * Normalizes legacy layout variants to the 5 modern UI reference variants
 */
function normalizeVariant(v?: string): string {
  if (!v) return 'voiceover_focus';
  if (v === 'numbered_steps' || v === 'checklist_status') return 'voiceover_focus';
  if (v === 'bullet_minimal') return 'accent_bar_cards';
  if (v === 'split_badge_pills') return 'datasheet_specs';
  if (v === 'icon_cards') return 'bento_grid_cards';
  return v;
}

export const ListCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant } = element;
  const activeVariant = normalizeVariant(layoutVariant);
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const itemsSub = getSubPartStyle(element, 'items');
  const accentSub = getSubPartStyle(element, 'accent');

  // Title styling
  const titleColor = titleSub.textColor || titleSub.typography?.textColor || element.typography.textColor || '#f8fafc';
  const titleFontSize = titleSub.typography?.fontSize ?? 22;
  const titleFontWeight = titleSub.typography?.fontWeight ?? '700';
  const titleLineHeight = titleSub.typography?.lineHeight ?? 1.3;
  const titleTextAlign = (titleSub.typography?.textAlign || element.typography.textAlign || 'left') as 'left' | 'center' | 'right';
  const titleFontFamily = (titleSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

  // Item typography
  const itemTextColor = itemsSub.textColor || itemsSub.typography?.textColor || '#cbd5e1';
  const itemFontSize = itemsSub.typography?.fontSize ?? Math.max(14, Math.round(titleFontSize * 0.72));
  const itemFontWeight = itemsSub.typography?.fontWeight ?? '500';
  const itemLineHeight = itemsSub.typography?.lineHeight ?? 1.45;
  const itemTextAlign = (itemsSub.typography?.textAlign || 'left') as 'left' | 'center' | 'right';
  const itemFontFamily = (itemsSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

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

  // Editable item list surface, padding, margin & gap
  const itemBgColor = itemsSub.bgColor
    ? (itemsSub.bgColor === 'transparent' ? 'transparent' : hexToRgba(itemsSub.bgColor, itemsSub.bgOpacity ?? 0.65))
    : 'rgba(15, 23, 42, 0.65)';
  const itemPadding = itemsSub.padding ?? data.itemPadding ?? 14;
  const itemGap = itemsSub.gap ?? itemsSub.margin ?? data.itemGap ?? 12;
  const itemBorderWidth = itemsSub.borderWidth ?? 1;
  const itemBorderColor = itemsSub.borderColor || 'rgba(255, 255, 255, 0.08)';
  const itemBorderRadius = itemsSub.borderRadius ?? 14;
  const itemGlowIntensity = itemsSub.glowIntensity ?? 16;
  const itemGlowColor = itemsSub.glowColor || themeAccentColor;

  const items: ListItemData[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];
  const showTitle = data.showTitle !== false && Boolean(data.title);
  const gridCols = data.gridCols || 2;

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
      {/* 1. Header Bar / Title (Used by Variants 1, 2, 4, 5) */}
      {showTitle && activeVariant !== 'datasheet_specs' && (
        <div className="mb-3.5 pb-2 border-b border-white/10 shrink-0">
          <h2
            style={{
              color: titleColor,
              fontSize: `${titleFontSize}px`,
              fontWeight: titleFontWeight,
              lineHeight: titleLineHeight,
              textAlign: titleTextAlign,
              fontFamily: getFontFamilyCss(titleFontFamily)
            }}
            className="tracking-tight"
          >
            {renderHighlightedText(data.title || '', accentStyle)}
          </h2>
        </div>
      )}

      {/* 2. Technical Datasheet Header Banner (Variant 3) */}
      {activeVariant === 'datasheet_specs' && (
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cyan-500/20 shrink-0">
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            {data.title || 'DATASHEET SPECIFICATIONS'}
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>{data.headerTag || '• VERIFIED'}</span>
          </span>
        </div>
      )}

      {/* 3. Items Rendering Router */}
      {/* =========================================================================
          VARIANT 1: VOICEOVER FOCUS CARDS (Inspired by Image 1)
          Active card highlights with solid number container, glowing border, and SPEAKING NOW pill
         ========================================================================= */}
      {activeVariant === 'voiceover_focus' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {items.map((item, index) => {
            const isActive = item.status === 'active';
            const isDone = item.status === 'done';
            const numText = item.number || toBanglaDigit(String(index + 1).padStart(2, '0'));
            const itemColor = item.color || themeAccentColor;

            return (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: itemBgColor,
                  borderColor: isActive ? itemColor : itemBorderColor,
                  borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                  borderRadius: `${itemBorderRadius}px`,
                  padding: `${itemPadding}px`,
                  boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemGlowColor}45` : undefined
                }}
                className="border flex items-center justify-between gap-3.5 transition-all"
              >
                {/* Left: Number Container Box */}
                <div
                  style={{
                    backgroundColor: isActive ? itemColor : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isActive ? itemColor : 'rgba(255, 255, 255, 0.12)',
                    color: isActive ? '#020617' : '#94a3b8',
                    fontFamily: getFontFamilyCss(itemFontFamily)
                  }}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 font-bold text-base transition-all ${
                    isActive ? 'font-black shadow-md' : 'font-semibold'
                  }`}
                >
                  {numText}
                </div>

                {/* Middle: Title & Description */}
                <div className="flex-1 min-w-0">
                  <h3
                    style={{
                      color: titleColor,
                      fontSize: `${Math.round(itemFontSize * 1.08)}px`,
                      fontWeight: '700',
                      fontFamily: getFontFamilyCss(itemFontFamily),
                      textAlign: itemTextAlign
                    }}
                    className="leading-snug truncate"
                  >
                    {renderHighlightedText(item.title, accentStyle)}
                  </h3>
                  {item.description && (
                    <p
                      style={{
                        color: itemTextColor,
                        fontSize: `${itemFontSize}px`,
                        fontWeight: itemFontWeight,
                        lineHeight: itemLineHeight,
                        fontFamily: getFontFamilyCss(itemFontFamily),
                        textAlign: itemTextAlign
                      }}
                      className="mt-0.5 leading-relaxed opacity-85 truncate"
                    >
                      {renderHighlightedText(item.description, accentStyle)}
                    </p>
                  )}
                </div>

                {/* Right: Status Pill Badge */}
                <div className="shrink-0">
                  {isActive ? (
                    <span
                      style={{
                        backgroundColor: itemColor,
                        color: '#020617',
                        boxShadow: `0 0 10px ${itemColor}80`
                      }}
                      className="px-3.5 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm"
                    >
                      {item.value || item.tag || 'SPEAKING NOW'}
                    </span>
                  ) : isDone ? (
                    <span className="text-emerald-400 font-mono font-semibold text-xs flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{item.value || 'Done'}</span>
                    </span>
                  ) : item.value || item.tag ? (
                    <span className="text-slate-400 font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {item.value || item.tag}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 2: LEFT ACCENT BAR CARDS (Inspired by Image 2)
          Sleek card with colored vertical left strip, law/prefix tag, title, and right equation/value badge
         ========================================================================= */}
      {activeVariant === 'accent_bar_cards' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {items.map((item, index) => {
            const defaultColors = ['#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];
            const itemColor = item.color || defaultColors[index % defaultColors.length];
            const prefixTag = item.tag || item.number || `LAW #${String(index + 1).padStart(2, '0')}`;

            return (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: itemBgColor,
                  borderColor: itemBorderColor,
                  borderWidth: `${itemBorderWidth}px`,
                  borderRadius: `${itemBorderRadius}px`,
                  padding: `${itemPadding}px`,
                  borderLeftWidth: '5px',
                  borderLeftColor: itemColor
                }}
                className="border flex items-center justify-between gap-4 transition-all"
              >
                {/* Left: Tag + Title + Subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span
                      style={{ color: itemColor }}
                      className="font-mono font-black text-xs tracking-wider shrink-0 uppercase"
                    >
                      {prefixTag}
                    </span>
                    <span
                      style={{
                        color: titleColor,
                        fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                        fontWeight: '700',
                        fontFamily: getFontFamilyCss(itemFontFamily),
                        textAlign: itemTextAlign
                      }}
                      className="font-bold leading-tight truncate"
                    >
                      {renderHighlightedText(item.title, accentStyle)}
                    </span>
                  </div>
                  {item.description && (
                    <p
                      style={{
                        color: itemTextColor,
                        fontSize: `${itemFontSize}px`,
                        fontWeight: itemFontWeight,
                        lineHeight: itemLineHeight,
                        fontFamily: getFontFamilyCss(itemFontFamily),
                        textAlign: itemTextAlign
                      }}
                      className="mt-1 leading-relaxed opacity-85 truncate"
                    >
                      {renderHighlightedText(item.description, accentStyle)}
                    </p>
                  )}
                </div>

                {/* Right: Value / Equation Outline Box */}
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    borderColor: `${itemColor}80`,
                    color: itemColor
                  }}
                  className="px-3.5 py-1.5 rounded-lg border font-mono font-bold text-xs shrink-0 tracking-wide shadow-sm"
                >
                  {item.value || (index === 0 ? '1 · 1 = 1' : index === 1 ? '1 · 0 = 0' : 'Y = A · B')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 3: TECHNICAL DATASHEET SPECS (Inspired by Image 3)
          Datasheet table with header summary, active highlighted key-value rows
         ========================================================================= */}
      {activeVariant === 'datasheet_specs' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {items.map((item, index) => {
            const isActive = item.status === 'active';
            const itemColor = item.color || themeAccentColor;

            return (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: isActive ? `${itemColor}15` : itemBgColor,
                  borderColor: isActive ? itemColor : itemBorderColor,
                  borderWidth: `${isActive ? Math.max(1.5, itemBorderWidth) : itemBorderWidth}px`,
                  borderRadius: `${itemBorderRadius}px`,
                  padding: `${itemPadding}px`,
                  boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemGlowColor}30` : undefined
                }}
                className="border flex items-center justify-between gap-3 transition-all"
              >
                {/* Left: Specification Key */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    style={{
                      color: isActive ? itemColor : titleColor,
                      fontSize: `${itemFontSize}px`,
                      fontWeight: isActive ? '700' : '600',
                      fontFamily: getFontFamilyCss(itemFontFamily)
                    }}
                    className="truncate leading-normal"
                  >
                    {renderHighlightedText(item.title, accentStyle)}
                  </span>
                  {item.description && (
                    <span className="text-[11px] text-slate-500 font-mono hidden md:inline truncate">
                      ({item.description})
                    </span>
                  )}
                </div>

                {/* Right: Technical Value Badge */}
                <div
                  style={{
                    backgroundColor: isActive ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isActive ? itemColor : 'rgba(255, 255, 255, 0.1)',
                    color: isActive ? itemColor : (item.color || '#38bdf8')
                  }}
                  className="px-3.5 py-1 rounded-lg border font-mono font-bold text-xs shrink-0 tracking-wide text-right"
                >
                  {item.value || (index === 0 ? '5.0 Volts DC' : index === 1 ? '16 MHz Crystal' : '14 Pins')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 4: BENTO FEATURE GRID 2-COLUMN (Inspired by Image 4)
          Modern 2x2 grid cards with top icon container, step number/focus tag, and glowing active card
         ========================================================================= */}
      {activeVariant === 'bento_grid_cards' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap: `${itemGap}px`
          }}
          className="w-full"
        >
          {items.map((item, index) => {
            const isActive = item.status === 'active';
            const itemColor = item.color || (isActive ? '#c084fc' : themeAccentColor);
            const numText = item.number || String(index + 1).padStart(2, '0');

            return (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: itemBgColor,
                  borderColor: isActive ? itemColor : itemBorderColor,
                  borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                  borderRadius: `${itemBorderRadius}px`,
                  padding: `${itemPadding}px`,
                  boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity * 1.5}px ${itemColor}40` : undefined
                }}
                className="border flex flex-col justify-between transition-all relative overflow-hidden"
              >
                {/* Top Row: Icon Container on Left, Tag/Number on Right */}
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    style={{
                      backgroundColor: isActive ? `${itemColor}25` : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isActive ? `${itemColor}60` : 'rgba(255, 255, 255, 0.12)',
                      color: itemColor
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner"
                  >
                    {renderItemIcon(item.icon, 'w-5 h-5')}
                  </div>

                  <span
                    style={{
                      color: isActive ? itemColor : '#64748b',
                      fontFamily: getFontFamilyCss(itemFontFamily)
                    }}
                    className="text-xs font-mono font-bold tracking-wider uppercase"
                  >
                    {isActive ? `${numText} • ${item.tag || 'FOCUS'}` : numText}
                  </span>
                </div>

                {/* Content: Title & Description */}
                <div>
                  <h3
                    style={{
                      color: titleColor,
                      fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                      fontWeight: '700',
                      fontFamily: getFontFamilyCss(itemFontFamily),
                      textAlign: itemTextAlign
                    }}
                    className="leading-snug truncate"
                  >
                    {renderHighlightedText(item.title, accentStyle)}
                  </h3>
                  {item.description && (
                    <p
                      style={{
                        color: itemTextColor,
                        fontSize: `${itemFontSize}px`,
                        fontWeight: itemFontWeight,
                        lineHeight: itemLineHeight,
                        fontFamily: getFontFamilyCss(itemFontFamily),
                        textAlign: itemTextAlign
                      }}
                      className="mt-1 leading-relaxed opacity-80 text-xs truncate"
                    >
                      {renderHighlightedText(item.description, accentStyle)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 5: PROGRESS & STAT BARS (Inspired by Image 5)
          Performance metrics list with numbered title, percentage stat, and glowing progress fill bar
         ========================================================================= */}
      {activeVariant === 'progress_bars' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {items.map((item, index) => {
            const defaultColors = ['#06b6d4', '#10b981', '#f97316', '#a855f7', '#ec4899'];
            const itemColor = item.color || defaultColors[index % defaultColors.length];
            const pct = Math.min(100, Math.max(0, item.progress ?? (index === 0 ? 78 : index === 1 ? 42 : 92)));
            const prefix = item.number || `${toBanglaDigit(index + 1)}.`;

            return (
              <div
                key={item.id || index}
                style={{
                  backgroundColor: itemBgColor,
                  borderColor: itemBorderColor,
                  borderWidth: `${itemBorderWidth}px`,
                  borderRadius: `${itemBorderRadius}px`,
                  padding: `${itemPadding}px`
                }}
                className="border flex flex-col justify-start transition-all"
              >
                {/* Top Row: Title on Left, Metric Stat on Right */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span
                    style={{
                      color: titleColor,
                      fontSize: `${itemFontSize}px`,
                      fontWeight: '700',
                      fontFamily: getFontFamilyCss(itemFontFamily),
                      textAlign: itemTextAlign
                    }}
                    className="truncate leading-tight font-semibold"
                  >
                    {prefix} {renderHighlightedText(item.title, accentStyle)}
                  </span>
                  <span
                    style={{ color: itemColor }}
                    className="font-mono font-bold text-xs shrink-0 tracking-wide"
                  >
                    {item.value || `${pct}%`}
                  </span>
                </div>

                {/* Bottom Row: Sleek Glowing Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/5">
                  <div
                    style={{
                      width: `${pct}%`,
                      backgroundColor: itemColor,
                      boxShadow: `0 0 10px ${itemColor}90`
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ListCardDataInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data, layoutVariant } = element;
  const activeVariant = normalizeVariant(layoutVariant);
  const setElementLayoutVariant = useStudioStore((s) => s.setElementLayoutVariant);

  const items: ListItemData[] = Array.isArray(data.items) ? data.items : [];

  const handleUpdateItem = (index: number, updates: Partial<ListItemData>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onChange({ ...data, items: next });
  };

  const handleAddItem = () => {
    const newIdx = items.length + 1;
    const newItem: ListItemData = {
      id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      number: toBanglaDigit(String(newIdx).padStart(2, '0')),
      title: `নতুন উপাদান ${toBanglaDigit(newIdx)}`,
      description: 'প্রয়োজনীয় সারসংক্ষেপ বা গুরুত্বপূর্ণ বিবরণ এখানে লিখুন।',
      tag: 'PENDING',
      value: `ধাপ ০${newIdx}`,
      status: 'normal',
      icon: 'zap',
      progress: 60,
      color: '#06b6d4'
    };
    onChange({ ...data, items: [...items, newItem] });
  };

  const handleDuplicateItem = (index: number) => {
    const item = items[index];
    const copy: ListItemData = {
      ...item,
      id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${item.title} (কপি)`
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange({ ...data, items: next });
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const next = items.filter((_, i) => i !== index);
    onChange({ ...data, items: next });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange({ ...data, items: next });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. List Header Title & Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300">Header Title & Tag</label>
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
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="প্রধান শিরোনাম (ব্যবহার করুন [ব্র্যাকেট] হাইলাইটের জন্য)"
              className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none text-xs"
            />
            <input
              type="text"
              value={data.headerTag || ''}
              onChange={(e) => onChange({ ...data, headerTag: e.target.value })}
              placeholder="ট্যাগ: • VERIFIED"
              className="col-span-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-300 outline-none text-xs font-mono"
            />
          </div>
        )}
      </div>

      {/* 3. Direct Layout Settings (Item Spacing & Grid Columns) */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <label className="font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layout & Spacing Controls</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400 block mb-0.5">Item Gap ({data.itemGap ?? 12}px)</span>
            <input
              type="range"
              min="4"
              max="32"
              value={data.itemGap ?? 12}
              onChange={(e) => onChange({ ...data, itemGap: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Item Padding ({data.itemPadding ?? 14}px)</span>
            <input
              type="range"
              min="6"
              max="32"
              value={data.itemPadding ?? 14}
              onChange={(e) => onChange({ ...data, itemPadding: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>
        </div>

        {activeVariant === 'bento_grid_cards' && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grid Columns</span>
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => onChange({ ...data, gridCols: cols })}
                  className={`w-7 py-1 rounded text-center font-mono cursor-pointer transition-all ${
                    (data.gridCols || 2) === cols
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. List Items Manager (All properties editable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>List Items ({items.length})</span>
          </label>
          <button
            onClick={handleAddItem}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-2.5 rounded-xl border space-y-2 relative transition-all ${
                item.status === 'active'
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              {/* Item Top Bar: Index, Title, Move & Action Buttons */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold w-5">
                    #{idx + 1}
                  </span>
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-20 p-0.5 cursor-pointer"
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-20 p-0.5 cursor-pointer"
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                  placeholder="আইটেমের শিরোনাম..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-semibold"
                />

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateItem(idx)}
                    className="text-slate-500 hover:text-cyan-400 p-1 cursor-pointer"
                    title="Duplicate item"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    disabled={items.length <= 1}
                    onClick={() => handleDeleteItem(idx)}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 p-1 cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Subtitle / Description Textarea */}
              <div>
                <textarea
                  rows={2}
                  value={item.description || ''}
                  onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                  placeholder="বিস্তারিত বিবরণ (ঐচ্ছিক, ব্যবহার করুন [ব্র্যাকেট] হাইলাইটের জন্য)"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs resize-none"
                />
              </div>

              {/* Grid of Item Properties: Number, Tag, Value, Status */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {/* Number / Prefix */}
                <div>
                  <span className="text-slate-500 block mb-0.5">Number / Prefix</span>
                  <input
                    type="text"
                    value={item.number || ''}
                    onChange={(e) => handleUpdateItem(idx, { number: e.target.value })}
                    placeholder="০১ / 01 / LAW #01"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono"
                  />
                </div>

                {/* Right Value / Equation Badge */}
                <div>
                  <span className="text-slate-500 block mb-0.5">Value / Equation Badge</span>
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => handleUpdateItem(idx, { value: e.target.value })}
                    placeholder="1 · 1 = 1 বা 5.0 Volts"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                {/* Status Focus Selector */}
                <div>
                  <span className="text-slate-500 block mb-0.5">Status / State</span>
                  <select
                    value={item.status || 'normal'}
                    onChange={(e) => handleUpdateItem(idx, { status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 font-semibold"
                  >
                    <option value="normal">Normal / Idle</option>
                    <option value="active">Active (Focus / Speak)</option>
                    <option value="done">Completed (✓ Done)</option>
                  </select>
                </div>

                {/* Icon Selector */}
                <div>
                  <span className="text-slate-500 block mb-0.5">Icon</span>
                  <select
                    value={item.icon || 'zap'}
                    onChange={(e) => handleUpdateItem(idx, { icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
                  >
                    <option value="zap">⚡ Lightning (Zap)</option>
                    <option value="brain">🧠 Brain</option>
                    <option value="plug">🔌 Plug</option>
                    <option value="timer">⏱️ Timer / Clock</option>
                    <option value="cpu">💻 CPU</option>
                    <option value="database">💾 Database</option>
                    <option value="code">⌨️ Code</option>
                    <option value="terminal">🖥️ Terminal</option>
                    <option value="sparkles">✨ Sparkles</option>
                    <option value="check">✓ Checkmark</option>
                  </select>
                </div>

                {/* Custom Color Per Item */}
                <div>
                  <span className="text-slate-500 block mb-0.5">Accent Color</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    <input
                      type="color"
                      value={item.color && item.color.startsWith('#') ? item.color : '#06b6d4'}
                      onChange={(e) => handleUpdateItem(idx, { color: e.target.value })}
                      className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={item.color || ''}
                      placeholder="Theme"
                      onChange={(e) => handleUpdateItem(idx, { color: e.target.value })}
                      className="w-full bg-transparent text-[10px] font-mono text-slate-300 outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Slider (when in progress mode or custom stat) */}
              <div className="pt-1 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Progress Bar Fill</span>
                  <span className="font-mono text-cyan-400">{item.progress ?? 75}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.progress ?? 75}
                  onChange={(e) => handleUpdateItem(idx, { progress: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function listCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant } = element;
  const activeVariant = normalizeVariant(layoutVariant);
  const items: ListItemData[] = Array.isArray(data.items) ? data.items : [];

  let md = `### List Block: ${data.title || 'Feature & Content List'}\n`;
  md += `- **Variant**: ${activeVariant}\n`;
  md += `- **Item Count**: ${items.length}\n\n`;

  items.forEach((item, idx) => {
    md += `${idx + 1}. **${item.title}**${item.number ? ` [${item.number}]` : ''}${item.value ? ` (Value: ${item.value})` : ''}${item.status ? ` - Status: ${item.status}` : ''}\n`;
    if (item.description) {
      md += `   - ${item.description}\n`;
    }
  });

  return md;
}

export const listCardDef: ComponentDefinition = {
  type: 'list_card',
  label: 'Feature & Content List',
  category: 'Data & Logic',
  tier: 'smart',
  icon: ListOrdered,
  defaultGeometry: { x: 120, y: 220, width: 880, height: 280, zIndex: 10 },
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
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 1.3,
    textAlign: 'left',
    textColor: '#f8fafc',
    highlightColor: '#38bdf8'
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
  defaultLayoutVariant: 'voiceover_focus',
  layoutVariants: LIST_VARIANTS,
  availableSubParts: ['container', 'title', 'items', 'accent'],
  defaultData: {
    title: 'সেন্ট্রাল প্রসেসিং আর্কিটেকচার',
    showTitle: true,
    headerTag: '• VERIFIED',
    itemGap: 12,
    itemPadding: 14,
    gridCols: 2,
    items: [
      {
        id: 'li_1',
        number: '০১',
        tag: 'LAW #01',
        status: 'done',
        title: 'সেন্ট্রাল প্রসেসিং ইউনিট (CPU)',
        description: 'সকল গাণিতিক ও লজিক্যাল নির্দেশনা প্রসেস করে',
        value: '✓ Done',
        icon: 'cpu',
        progress: 100,
        color: '#10b981'
      },
      {
        id: 'li_2',
        number: '০২',
        tag: 'SPEAKING NOW',
        status: 'active',
        title: 'মেমরি ইউনিট (RAM & Flash)',
        description: 'প্রোগ্রাম কোড এবং অস্থায়ী ডেটা সংরক্ষণ করে রাখে',
        value: 'SPEAKING NOW',
        icon: 'zap',
        progress: 78,
        color: '#06b6d4'
      },
      {
        id: 'li_3',
        number: '০৩',
        tag: 'LAW #03',
        status: 'normal',
        title: 'ইনপুট/আউটপুট পোর্ট (GPIO Pins)',
        description: 'বাইরের সেন্সর ও মোটরের সাথে সংযোগ স্থাপন করে',
        value: '14 Pins',
        icon: 'plug',
        progress: 42,
        color: '#f59e0b'
      }
    ]
  },
  CanvasRenderer: ListCardRenderer,
  DataInspector: ListCardDataInspector,
  specFormatter: listCardSpecFormatter
};
