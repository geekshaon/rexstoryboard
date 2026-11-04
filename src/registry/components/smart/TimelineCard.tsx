import React from 'react';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  CircleDot,
  Check,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  ChevronRight,
  Workflow,
  Sliders,
  Milestone,
  Play
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { TIMELINE_VARIANTS } from '../../componentDefaults';
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

export interface TimelineStepData {
  id: string;
  stepNumber: number | string;
  time?: string;
  tag?: string;
  title: string;
  description?: string;
  status?: 'completed' | 'active' | 'upcoming';
  color?: string;
}

/**
 * Normalizes legacy layout variants to the 5 modern UI reference variants
 */
function normalizeTimelineVariant(v?: string): string {
  if (!v) return 'vertical_spine';
  if (v === 'vertical_cards') return 'zigzag_nodes';
  if (v === 'horizontal_cards') return 'timestamp_chapters';
  return v;
}

export const TimelineCardRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant } = element;
  const activeVariant = normalizeTimelineVariant(layoutVariant);
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
  const itemLineHeight = itemsSub.typography?.lineHeight ?? 1.4;
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

  // Editable item surface & box model
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

  const steps: TimelineStepData[] = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [];
  const showTitle = data.showTitle !== false && Boolean(data.title);
  const activeStepIdx = typeof data.activeStep === 'number' ? data.activeStep - 1 : 1;

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
      {/* 1. Header Title if enabled */}
      {showTitle && (
        <div className="mb-3.5 pb-2 border-b border-white/10 shrink-0 flex items-center justify-between">
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
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            {steps.length} Milestones
          </span>
        </div>
      )}

      {/* 2. Timeline Variants Router */}
      {/* =========================================================================
          VARIANT 1: VERTICAL CONNECTED SPINE (Inspired by Image 1)
          Left vertical connected spine with milestone cards, active glowing border, and status pills
         ========================================================================= */}
      {activeVariant === 'vertical_spine' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {steps.map((step, idx) => {
            const isActive = step.status === 'active' || idx === activeStepIdx;
            const isCompleted = step.status === 'completed' || idx < activeStepIdx;
            const itemColor = step.color || (isActive ? '#06b6d4' : isCompleted ? '#10b981' : themeAccentColor);
            const stepNum = step.stepNumber !== undefined ? step.stepNumber : idx + 1;

            return (
              <div key={step.id || idx} className="flex items-center gap-3.5 relative group">
                {/* Left Spine Node Column */}
                <div className="w-8 shrink-0 flex flex-col items-center justify-center relative">
                  {/* Top connector segment */}
                  {idx > 0 && (
                    <div
                      style={{
                        backgroundColor: isCompleted || isActive ? itemColor : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: (isCompleted || isActive) ? `0 0 8px ${itemColor}80` : undefined
                      }}
                      className="absolute -top-3.5 w-1 h-4 z-0 rounded-full"
                    />
                  )}

                  {/* Circular Step Node */}
                  <div
                    style={{
                      backgroundColor: isActive ? itemColor : isCompleted ? '#10b981' : 'rgba(15, 23, 42, 0.9)',
                      borderColor: isActive ? itemColor : isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                      color: isActive || isCompleted ? '#020617' : '#94a3b8',
                      boxShadow: isActive ? `0 0 14px ${itemColor}` : isCompleted ? '0 0 8px #10b98180' : undefined
                    }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all ${
                      isActive ? 'font-black scale-105' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      toBanglaDigit(stepNum)
                    )}
                  </div>

                  {/* Bottom connector segment */}
                  {idx < steps.length - 1 && (
                    <div
                      style={{
                        backgroundColor: isCompleted ? itemColor : 'rgba(255, 255, 255, 0.1)'
                      }}
                      className="absolute -bottom-3.5 w-1 h-4 z-0 rounded-full"
                    />
                  )}
                </div>

                {/* Right Milestone Card */}
                <div
                  style={{
                    backgroundColor: itemBgColor,
                    borderColor: isActive ? itemColor : itemBorderColor,
                    borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                    borderRadius: `${itemBorderRadius}px`,
                    padding: `${itemPadding}px`,
                    boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemColor}40` : undefined
                  }}
                  className="flex-1 border flex items-center justify-between gap-3 min-w-0 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      style={{
                        color: titleColor,
                        fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                        fontWeight: '700',
                        fontFamily: getFontFamilyCss(itemFontFamily),
                        textAlign: 'left'
                      }}
                      className="leading-snug truncate"
                    >
                      {toBanglaDigit(stepNum)}. {renderHighlightedText(step.title, accentStyle)}
                    </h3>
                    {step.description && (
                      <p
                        style={{
                          color: itemTextColor,
                          fontSize: `${itemFontSize}px`,
                          fontWeight: itemFontWeight,
                          lineHeight: itemLineHeight,
                          fontFamily: getFontFamilyCss(itemFontFamily),
                          textAlign: 'left'
                        }}
                        className="mt-0.5 leading-relaxed opacity-85 truncate"
                      >
                        {renderHighlightedText(step.description, accentStyle)}
                      </p>
                    )}
                  </div>

                  {/* Right Status Pill or Timestamp */}
                  <div className="shrink-0">
                    {isActive ? (
                      <span
                        style={{
                          backgroundColor: itemColor,
                          color: '#020617',
                          boxShadow: `0 0 10px ${itemColor}80`
                        }}
                        className="px-3 py-1 rounded-md text-xs font-mono font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm"
                      >
                        {step.tag || 'ACTIVE'}
                      </span>
                    ) : isCompleted ? (
                      <span className="text-cyan-400 font-mono font-bold text-xs">
                        {step.time || '0.0s'}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-xs">
                        {step.tag || 'Next'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 2: ALTERNATING ZIGZAG TIMELINE (Inspired by Image 2)
          Center spine rail with alternating left/right milestone cards and glowing milestone nodes
         ========================================================================= */}
      {activeVariant === 'zigzag_nodes' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start relative py-2">
          {/* Continuous Center Spine Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 bg-slate-800 rounded-full z-0" />

          {steps.map((step, idx) => {
            const isLeft = idx % 2 === 0;
            const isActive = step.status === 'active' || idx === activeStepIdx;
            const isCompleted = step.status === 'completed' || idx < activeStepIdx;
            const itemColor = step.color || (isActive ? '#10b981' : isCompleted ? '#06b6d4' : themeAccentColor);
            const phaseTag = step.tag || `PHASE ${String(idx + 1).padStart(2, '0')}`;

            return (
              <div key={step.id || idx} className="grid grid-cols-2 gap-6 items-center relative z-10">
                {/* Left Column (Card or Empty) */}
                <div className={isLeft ? 'flex justify-end' : 'invisible'}>
                  {isLeft && (
                    <div
                      style={{
                        backgroundColor: itemBgColor,
                        borderColor: isActive ? itemColor : itemBorderColor,
                        borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                        borderRadius: `${itemBorderRadius}px`,
                        padding: `${itemPadding}px`,
                        boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemColor}40` : undefined
                      }}
                      className="border w-full max-w-sm text-right transition-all"
                    >
                      <span
                        style={{ color: isActive ? itemColor : '#64748b' }}
                        className="text-[11px] font-mono font-bold block mb-1 uppercase tracking-wider"
                      >
                        {isActive ? `${phaseTag} • ACTIVE` : phaseTag}
                      </span>
                      <h3
                        style={{
                          color: titleColor,
                          fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                          fontWeight: '700',
                          fontFamily: getFontFamilyCss(itemFontFamily)
                        }}
                        className="leading-snug truncate"
                      >
                        {renderHighlightedText(step.title, accentStyle)}
                      </h3>
                      {step.description && (
                        <p
                          style={{
                            color: itemTextColor,
                            fontSize: `${itemFontSize}px`,
                            fontWeight: itemFontWeight,
                            lineHeight: itemLineHeight,
                            fontFamily: getFontFamilyCss(itemFontFamily)
                          }}
                          className="mt-0.5 opacity-80 text-xs truncate"
                        >
                          {renderHighlightedText(step.description, accentStyle)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Center Node Marker */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div
                    style={{
                      backgroundColor: isActive ? itemColor : isCompleted ? itemColor : 'rgba(15, 23, 42, 0.9)',
                      borderColor: isActive ? itemColor : 'rgba(255, 255, 255, 0.2)',
                      boxShadow: isActive ? `0 0 16px ${itemColor}` : undefined
                    }}
                    className={`rounded-full border-2 transition-all ${
                      isActive ? 'w-6 h-6 animate-pulse' : 'w-4 h-4'
                    }`}
                  />
                </div>

                {/* Right Column (Card or Empty) */}
                <div className={!isLeft ? 'flex justify-start' : 'invisible'}>
                  {!isLeft && (
                    <div
                      style={{
                        backgroundColor: itemBgColor,
                        borderColor: isActive ? itemColor : itemBorderColor,
                        borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                        borderRadius: `${itemBorderRadius}px`,
                        padding: `${itemPadding}px`,
                        boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemColor}40` : undefined
                      }}
                      className="border w-full max-w-sm text-left transition-all"
                    >
                      <span
                        style={{ color: isActive ? itemColor : '#64748b' }}
                        className="text-[11px] font-mono font-bold block mb-1 uppercase tracking-wider"
                      >
                        {isActive ? `${phaseTag} • ACTIVE` : phaseTag}
                      </span>
                      <h3
                        style={{
                          color: titleColor,
                          fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                          fontWeight: '700',
                          fontFamily: getFontFamilyCss(itemFontFamily)
                        }}
                        className="leading-snug truncate"
                      >
                        {renderHighlightedText(step.title, accentStyle)}
                      </h3>
                      {step.description && (
                        <p
                          style={{
                            color: itemTextColor,
                            fontSize: `${itemFontSize}px`,
                            fontWeight: itemFontWeight,
                            lineHeight: itemLineHeight,
                            fontFamily: getFontFamilyCss(itemFontFamily)
                          }}
                          className="mt-0.5 opacity-80 text-xs truncate"
                        >
                          {renderHighlightedText(step.description, accentStyle)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 3: HORIZONTAL STEPPER PIPELINE (Inspired by Image 3)
          Top glowing progress line with circular step nodes and bottom equal-width phase cards
         ========================================================================= */}
      {activeVariant === 'horizontal_pipeline' && (
        <div className="w-full flex flex-col justify-start gap-4">
          {/* Top Progress Rail with Step Nodes */}
          <div className="relative flex items-center justify-between px-6 pt-2 pb-1">
            {/* Horizontal Track Line */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
            <div
              style={{
                width: `${Math.min(100, (activeStepIdx / Math.max(1, steps.length - 1)) * 100)}%`,
                backgroundColor: themeAccentColor,
                boxShadow: `0 0 10px ${themeAccentColor}`
              }}
              className="absolute left-8 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-300"
            />

            {/* Stepper Nodes */}
            {steps.map((step, idx) => {
              const isActive = step.status === 'active' || idx === activeStepIdx;
              const isCompleted = step.status === 'completed' || idx < activeStepIdx;
              const itemColor = step.color || (isActive ? '#06b6d4' : isCompleted ? '#10b981' : themeAccentColor);
              const numDisplay = toBanglaDigit(String(idx + 1).padStart(2, '0'));

              return (
                <div key={step.id || idx} className="flex-1 flex flex-col items-center relative">
                  <div
                    style={{
                      backgroundColor: isActive ? itemColor : isCompleted ? '#10b981' : 'rgba(15, 23, 42, 0.95)',
                      borderColor: isActive ? itemColor : isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                      color: isActive || isCompleted ? '#020617' : '#64748b',
                      boxShadow: isActive ? `0 0 16px ${itemColor}` : isCompleted ? '0 0 8px #10b98180' : undefined
                    }}
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all ${
                      isActive ? 'scale-110 font-black' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <span>{numDisplay}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Equal-Width Phase Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              gap: `${itemGap}px`
            }}
            className="w-full"
          >
            {steps.map((step, idx) => {
              const isActive = step.status === 'active' || idx === activeStepIdx;
              const itemColor = step.color || (isActive ? '#06b6d4' : themeAccentColor);
              const stepTag = step.tag || `STEP ${String(idx + 1).padStart(2, '0')}`;

              return (
                <div
                  key={step.id || idx}
                  style={{
                    backgroundColor: itemBgColor,
                    borderColor: isActive ? itemColor : itemBorderColor,
                    borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                    borderRadius: `${itemBorderRadius}px`,
                    padding: `${itemPadding}px`,
                    boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemColor}35` : undefined
                  }}
                  className="border flex flex-col justify-start text-center min-w-0 transition-all"
                >
                  <span
                    style={{ color: isActive ? itemColor : '#64748b' }}
                    className="text-[10px] font-mono font-bold block mb-1 uppercase tracking-wider truncate"
                  >
                    {isActive ? `${stepTag} • ACTIVE` : stepTag}
                  </span>
                  <h3
                    style={{
                      color: titleColor,
                      fontSize: `${Math.round(itemFontSize * 1.02)}px`,
                      fontWeight: '700',
                      fontFamily: getFontFamilyCss(itemFontFamily)
                    }}
                    className="leading-snug truncate"
                  >
                    {renderHighlightedText(step.title, accentStyle)}
                  </h3>
                  {step.description && (
                    <p
                      style={{
                        color: itemTextColor,
                        fontSize: `${Math.max(11, itemFontSize - 2)}px`,
                        fontWeight: itemFontWeight,
                        lineHeight: itemLineHeight,
                        fontFamily: getFontFamilyCss(itemFontFamily)
                      }}
                      className="mt-1 opacity-80 leading-relaxed text-[11px] truncate"
                    >
                      {renderHighlightedText(step.description, accentStyle)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 4: HORIZONTAL CHEVRON PROCESS FLOW (Inspired by Image 4)
          Connected sequential chevron arrows flowing left to right with active highlighted stage
         ========================================================================= */}
      {activeVariant === 'chevron_flow' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            gap: `${Math.max(4, itemGap / 2)}px`
          }}
          className="w-full items-stretch"
        >
          {steps.map((step, idx) => {
            const isActive = step.status === 'active' || idx === activeStepIdx;
            const itemColor = step.color || (isActive ? '#06b6d4' : themeAccentColor);
            const stageTag = step.tag || `STAGE ${String(idx + 1).padStart(2, '0')}`;

            return (
              <div
                key={step.id || idx}
                style={{
                  backgroundColor: isActive ? itemColor : itemBgColor,
                  borderColor: isActive ? itemColor : itemBorderColor,
                  borderWidth: `${itemBorderWidth}px`,
                  borderRadius: `${Math.min(8, itemBorderRadius)}px`,
                  padding: `${itemPadding}px`,
                  boxShadow: isActive ? `0 0 18px ${itemColor}60` : undefined,
                  borderLeftWidth: !isActive && idx === 0 ? '4px' : undefined,
                  borderLeftColor: !isActive && idx === 0 ? '#10b981' : undefined
                }}
                className={`border flex flex-col justify-center min-w-0 transition-all relative ${
                  isActive ? 'text-slate-950 font-bold' : ''
                }`}
              >
                <span
                  style={{ color: isActive ? '#020617' : (idx === 0 ? '#10b981' : '#64748b') }}
                  className="text-[10px] font-mono font-black block mb-1 uppercase tracking-wider truncate"
                >
                  {isActive ? `${stageTag} • ACTIVE` : stageTag}
                </span>
                <h3
                  style={{
                    color: isActive ? '#020617' : titleColor,
                    fontSize: `${Math.round(itemFontSize * 1.02)}px`,
                    fontWeight: isActive ? '900' : '700',
                    fontFamily: getFontFamilyCss(itemFontFamily)
                  }}
                  className="leading-snug truncate"
                >
                  {renderHighlightedText(step.title, isActive ? '#020617' : accentStyle)}
                </h3>
                {step.description && (
                  <p
                    style={{
                      color: isActive ? '#0f172a' : itemTextColor,
                      fontSize: `${Math.max(11, itemFontSize - 2)}px`,
                      fontWeight: isActive ? '600' : itemFontWeight,
                      lineHeight: itemLineHeight,
                      fontFamily: getFontFamilyCss(itemFontFamily)
                    }}
                    className="mt-0.5 opacity-90 text-[11px] truncate"
                  >
                    {renderHighlightedText(step.description, isActive ? '#0f172a' : accentStyle)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VARIANT 5: VIDEO CHAPTER & TIMESTAMP SPINE (Inspired by Image 5)
          Video chapters with left timestamp pill (00:25s), connecting dot, and glowing active row
         ========================================================================= */}
      {activeVariant === 'timestamp_chapters' && (
        <div style={{ gap: `${itemGap}px` }} className="flex flex-col justify-start">
          {steps.map((step, idx) => {
            const isActive = step.status === 'active' || idx === activeStepIdx;
            const isCompleted = step.status === 'completed' || idx < activeStepIdx;
            const itemColor = step.color || (isActive ? '#f59e0b' : isCompleted ? '#10b981' : themeAccentColor);
            const timeTag = step.time || (idx === 0 ? '00:00s' : idx === 1 ? '00:25s' : '01:10s');

            return (
              <div key={step.id || idx} className="flex items-center gap-3 w-full transition-all">
                {/* Left Timestamp Pill */}
                <div
                  style={{
                    backgroundColor: isActive ? itemColor : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isActive ? itemColor : (isCompleted ? '#10b98180' : 'rgba(255, 255, 255, 0.1)'),
                    color: isActive ? '#020617' : (isCompleted ? '#10b981' : '#64748b'),
                    boxShadow: isActive ? `0 0 12px ${itemColor}80` : undefined
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs shrink-0 tracking-wider flex items-center gap-1.5 transition-all ${
                    isActive ? 'font-black scale-105' : ''
                  }`}
                >
                  <span>{timeTag}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                </div>

                {/* Connecting Dot Node */}
                <div
                  style={{
                    backgroundColor: isActive ? itemColor : (isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.15)'),
                    boxShadow: isActive ? `0 0 8px ${itemColor}` : isCompleted ? '0 0 6px #10b98180' : undefined
                  }}
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                />

                {/* Right Chapter Card */}
                <div
                  style={{
                    backgroundColor: itemBgColor,
                    borderColor: isActive ? itemColor : itemBorderColor,
                    borderWidth: `${isActive ? Math.max(2, itemBorderWidth) : itemBorderWidth}px`,
                    borderRadius: `${itemBorderRadius}px`,
                    padding: `${itemPadding}px`,
                    boxShadow: isActive && itemGlowIntensity > 0 ? `0 0 ${itemGlowIntensity}px ${itemColor}40` : undefined
                  }}
                  className="flex-1 border flex items-center justify-between min-w-0 transition-all"
                >
                  <span
                    style={{
                      color: titleColor,
                      fontSize: `${Math.round(itemFontSize * 1.05)}px`,
                      fontWeight: isActive ? '800' : '600',
                      fontFamily: getFontFamilyCss(itemFontFamily)
                    }}
                    className="truncate block"
                  >
                    {renderHighlightedText(step.title, accentStyle)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TimelineCardDataInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data } = element;
  const steps: TimelineStepData[] = Array.isArray(data.steps) ? data.steps : [];

  const handleUpdateStep = (index: number, updates: Partial<TimelineStepData>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...updates };
    onChange({ ...data, steps: next });
  };

  const handleAddStep = () => {
    const newNum = steps.length + 1;
    const newStep: TimelineStepData = {
      id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      stepNumber: newNum,
      time: `0${newNum}:00s`,
      tag: `PHASE 0${newNum}`,
      title: `নতুন মাইলস্টোন ${toBanglaDigit(newNum)}`,
      description: 'ধাপের সারসংক্ষেপ ও নির্দেশিকা এখানে লিখুন।',
      status: 'upcoming',
      color: '#06b6d4'
    };
    onChange({ ...data, steps: [...steps, newStep] });
  };

  const handleDuplicateStep = (index: number) => {
    const item = steps[index];
    const copy: TimelineStepData = {
      ...item,
      id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${item.title} (কপি)`
    };
    const next = [...steps];
    next.splice(index + 1, 0, copy);
    onChange({ ...data, steps: next });
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) return;
    const next = steps.filter((_, i) => i !== index);
    onChange({ ...data, steps: next });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const next = [...steps];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange({ ...data, steps: next });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Timeline Title Input & Toggle */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300">Timeline Header</label>
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
            placeholder="টাইমলাইন শিরোনাম (ব্যবহার করুন [ব্র্যাকেট] হাইলাইটের জন্য)"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none text-xs font-mono"
          />
        )}
      </div>

      {/* 2. Active Step Focus Selector */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Step (Current Focus)</span>
          </label>
          <span className="text-[10px] font-mono text-cyan-400">
            Step {data.activeStep || 1}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange({ ...data, activeStep: i + 1 })}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                (data.activeStep || 1) === i + 1
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Spacing & Padding Controls */}
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <label className="font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layout & Spacing Controls</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400 block mb-0.5">Step Gap ({data.itemGap ?? 12}px)</span>
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
            <span className="text-slate-400 block mb-0.5">Card Padding ({data.itemPadding ?? 14}px)</span>
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
      </div>

      {/* 4. Timeline Milestones Manager */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Milestone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Timeline Milestones ({steps.length})</span>
          </label>
          <button
            onClick={handleAddStep}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
          {steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className={`p-2.5 rounded-xl border space-y-2 relative transition-all ${
                step.status === 'active' || (data.activeStep || 1) === idx + 1
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              {/* Step Header: Index, Move & Actions */}
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
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-20 p-0.5 cursor-pointer"
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                  placeholder="ধাপের শিরোনাম..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-semibold"
                />

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateStep(idx)}
                    className="text-slate-500 hover:text-cyan-400 p-1 cursor-pointer"
                    title="Duplicate step"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    disabled={steps.length <= 1}
                    onClick={() => handleDeleteStep(idx)}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 p-1 cursor-pointer"
                    title="Delete step"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Subtitle / Description */}
              <div>
                <textarea
                  rows={2}
                  value={step.description || ''}
                  onChange={(e) => handleUpdateStep(idx, { description: e.target.value })}
                  placeholder="বিস্তারিত বিবরণ (ঐচ্ছিক, ব্যবহার করুন [ব্র্যাকেট] হাইলাইটের জন্য)"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs resize-none"
                />
              </div>

              {/* Properties Grid: Time, Tag, Status, Color */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block mb-0.5">Timestamp / Duration</span>
                  <input
                    type="text"
                    value={step.time || ''}
                    onChange={(e) => handleUpdateStep(idx, { time: e.target.value })}
                    placeholder="যেমন: 0.0s বা 00:25s"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Tag / Phase Label</span>
                  <input
                    type="text"
                    value={step.tag || ''}
                    onChange={(e) => handleUpdateStep(idx, { tag: e.target.value })}
                    placeholder="PHASE 01 / ACTIVE / SENSOR"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block mb-0.5">Status</span>
                  <select
                    value={step.status || ((data.activeStep || 1) === idx + 1 ? 'active' : (data.activeStep || 1) > idx + 1 ? 'completed' : 'upcoming')}
                    onChange={(e) => handleUpdateStep(idx, { status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 font-semibold"
                  >
                    <option value="completed">Completed (✓ Done)</option>
                    <option value="active">Active (Current Focus)</option>
                    <option value="upcoming">Upcoming / Pending</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Accent Color</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    <input
                      type="color"
                      value={step.color && step.color.startsWith('#') ? step.color : '#06b6d4'}
                      onChange={(e) => handleUpdateStep(idx, { color: e.target.value })}
                      className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={step.color || ''}
                      placeholder="Theme"
                      onChange={(e) => handleUpdateStep(idx, { color: e.target.value })}
                      className="w-full bg-transparent text-[10px] font-mono text-slate-300 outline-none truncate"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function timelineCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant } = element;
  const activeVariant = normalizeTimelineVariant(layoutVariant);
  const steps: TimelineStepData[] = Array.isArray(data.steps) ? data.steps : [];

  let md = `### Timeline Process: ${data.title || 'Roadmap & Flow'}\n`;
  md += `- **Variant**: ${activeVariant}\n`;
  md += `- **Active Step**: ${data.activeStep || 1} / ${steps.length}\n\n`;

  steps.forEach((step, idx) => {
    md += `${idx + 1}. **${step.title}**${step.time ? ` [${step.time}]` : ''}${step.status ? ` (${step.status})` : ''}\n`;
    if (step.description) {
      md += `   - ${step.description}\n`;
    }
  });

  return md;
}

export const timelineCardDef: ComponentDefinition = {
  type: 'timeline_card',
  label: 'Process & Roadmap Timeline',
  category: 'Data & Logic',
  tier: 'smart',
  icon: Workflow,
  defaultGeometry: { x: 100, y: 200, width: 920, height: 320, zIndex: 10 },
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
  defaultLayoutVariant: 'vertical_spine',
  layoutVariants: TIMELINE_VARIANTS,
  availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
  defaultData: {
    title: 'প্রসেসিং ও এক্সিকিউশন টাইমলাইন',
    showTitle: true,
    activeStep: 2,
    itemGap: 12,
    itemPadding: 14,
    steps: [
      {
        id: 'st_1',
        stepNumber: 1,
        time: '0.0s',
        tag: 'PHASE 01 • SENSOR',
        title: 'কোড কম্পাইলেশন (Compile)',
        description: 'C++ কোড বাইনারি (.hex) ফাইলে রূপান্তরিত হয়।',
        status: 'completed',
        color: '#10b981'
      },
      {
        id: 'st_2',
        stepNumber: 2,
        time: '00:25s',
        tag: 'PHASE 02 • ACTIVE',
        title: 'ফ্ল্যাশ মেমরিতে আপলোড',
        description: 'UART পোর্ট হয়ে বাইনারি ডেটা মেমরিতে জমা হয়।',
        status: 'active',
        color: '#06b6d4'
      },
      {
        id: 'st_3',
        stepNumber: 3,
        time: '01:10s',
        tag: 'PHASE 03 • ACTUATOR',
        title: 'লুপ এক্সিকিউশন (void loop)',
        description: 'পাওয়ার থাকা পর্যন্ত নির্দেশনাগুলো বারবার চলতে থাকে।',
        status: 'upcoming',
        color: '#f59e0b'
      }
    ]
  },
  CanvasRenderer: TimelineCardRenderer,
  DataInspector: TimelineCardDataInspector,
  specFormatter: timelineCardSpecFormatter
};
