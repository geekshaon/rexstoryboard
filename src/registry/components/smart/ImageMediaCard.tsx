import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Cpu,
  Layers,
  Sparkles,
  Maximize2,
  ExternalLink,
  Tag,
  Radio,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Split,
  Crosshair,
  GalleryHorizontal,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { SceneElement, FontFamilyType } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { IMAGE_MEDIA_VARIANTS } from '../../componentDefaults';
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

/**
 * High-precision vector SVG schematics used as fallbacks when no external image URL is provided.
 */
export const CircuitSchematicSvg: React.FC<{ accentColor?: string; className?: string }> = ({
  accentColor = '#06b6d4',
  className = 'w-full h-full'
}) => (
  <svg
    viewBox="0 0 600 320"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Grid Backdrop Pattern */}
    <defs>
      <pattern id="circuitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
      </pattern>
      <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuitGrid)" />

    {/* Connecting Circuit Traces */}
    <path
      d="M 60 160 H 180 M 180 120 H 220 M 180 200 H 220 M 380 120 H 460 V 90 H 520 M 380 160 H 530 M 380 200 H 480 V 230 H 520"
      stroke={accentColor}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Clock Crystal Resonator (Left) */}
    <g transform="translate(60, 140)">
      <rect x="0" y="0" width="70" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="35" y="24" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        16.0 MHz
      </text>
    </g>

    {/* Microcontroller IC Package (Center) */}
    <g transform="translate(220, 70)">
      {/* IC Body */}
      <rect x="0" y="0" width="160" height="180" rx="10" fill="url(#chipGrad)" stroke={accentColor} strokeWidth="2" />
      {/* IC Orientation Notch */}
      <circle cx="80" cy="14" r="5" fill="#0b0f19" stroke={accentColor} strokeWidth="1.5" />
      {/* IC Label */}
      <text x="80" y="80" fill="#f8fafc" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        ATmega328P
      </text>
      <text x="80" y="100" fill={accentColor} fontSize="10" fontFamily="monospace" textAnchor="middle">
        8-BIT AVR RISC
      </text>
      <text x="80" y="125" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
        32KB FLASH • 2KB SRAM
      </text>

      {/* IC Pins (Left side) */}
      {[25, 50, 75, 100, 125, 150].map((y, i) => (
        <g key={`lpin-${i}`}>
          <rect x="-14" y={y} width="14" height="6" rx="2" fill="#94a3b8" />
          <circle cx="-16" cy={y + 3} r="2" fill={accentColor} />
        </g>
      ))}

      {/* IC Pins (Right side) */}
      {[25, 50, 75, 100, 125, 150].map((y, i) => (
        <g key={`rpin-${i}`}>
          <rect x="160" y={y} width="14" height="6" rx="2" fill="#94a3b8" />
          <circle cx="176" cy={y + 3} r="2" fill="#10b981" />
        </g>
      ))}
    </g>

    {/* Right Peripheral Modules */}
    {/* Module 1: LED Indicator */}
    <g transform="translate(520, 75)">
      <circle cx="15" cy="15" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
      <circle cx="15" cy="15" r="6" fill="#34d399" />
      <text x="35" y="19" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
        STATUS D13
      </text>
    </g>

    {/* Module 2: UART Bus */}
    <g transform="translate(530, 145)">
      <rect x="0" y="0" width="55" height="28" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="27" y="18" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        UART RX
      </text>
    </g>

    {/* Module 3: VCC 5V */}
    <g transform="translate(520, 215)">
      <rect x="0" y="0" width="60" height="28" rx="6" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
      <text x="30" y="18" fill="#ec4899" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        +5.0V VCC
      </text>
    </g>
  </svg>
);

export const WaveComparisonSvg: React.FC<{ isAfter?: boolean; className?: string }> = ({
  isAfter = false,
  className = 'w-full h-full'
}) => (
  <svg viewBox="0 0 300 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.4)" rx="8" />
    <line x1="20" y1="80" x2="280" y2="80" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
    {isAfter ? (
      /* Clean Quantized Digital Square Wave */
      <path
        d="M 20 120 H 60 V 40 H 120 V 120 H 180 V 40 H 240 V 120 H 280"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      /* Noisy Analog Input Sine Wave */
      <path
        d="M 20 80 Q 40 25, 60 75 T 100 85 T 140 30 T 180 135 T 220 70 T 260 90 T 280 80"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    )}
  </svg>
);

export interface PinItem {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  label: string;
  detail: string;
  color?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  badge?: string;
  active?: boolean;
}

export const ImageMediaRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'diagram_frame_card' } = element;
  const containerStyle = resolveElementStyles(element);

  const titleSub = getSubPartStyle(element, 'title');
  const bodySub = getSubPartStyle(element, 'body');
  const badgeSub = getSubPartStyle(element, 'badge');
  const accentSub = getSubPartStyle(element, 'accent');

  // Title styling
  const titleColor = titleSub.textColor || titleSub.typography?.textColor || element.typography.textColor || '#f8fafc';
  const titleFontSize = titleSub.typography?.fontSize ?? 18;
  const titleFontWeight = titleSub.typography?.fontWeight ?? '700';
  const titleLineHeight = titleSub.typography?.lineHeight ?? 1.3;
  const titleTextAlign = (titleSub.typography?.textAlign || element.typography.textAlign || 'left') as 'left' | 'center' | 'right';
  const titleFontFamily = (titleSub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

  // Body / Caption styling
  const bodyColor = bodySub.textColor || bodySub.typography?.textColor || '#94a3b8';
  const bodyFontSize = bodySub.typography?.fontSize ?? Math.max(12, Math.round(titleFontSize * 0.75));
  const bodyFontFamily = (bodySub.typography?.fontFamily || element.typography.fontFamily) as FontFamilyType;

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
  const showCaption = data.showCaption !== false && Boolean(data.caption);
  const showBadge = data.showBadge !== false && Boolean(data.badge);
  const imageUrl = data.imageUrl?.trim();
  const fit = data.fit || 'contain';

  // Before/after data
  const beforeAfter = data.beforeAfter || {
    beforeTitle: 'অ্যানালগ ইনপুট সংকেত',
    afterTitle: 'ডিজিটাল আউটপুট পালস',
    beforeBadge: 'ANALOG (NOISY)',
    afterBadge: 'DIGITAL (FILTERED)',
    beforeUrl: '',
    afterUrl: ''
  };

  // Pins data
  const pins: PinItem[] = Array.isArray(data.pins) && data.pins.length > 0
    ? data.pins
    : [
        { id: 'pin_1', x: 28, y: 35, label: 'PIN 01', detail: 'Reset (PC6) • Active Low', color: '#f43f5e' },
        { id: 'pin_2', x: 50, y: 62, label: 'PIN 07', detail: 'VCC (+5.0V DC Input)', color: '#10b981' },
        { id: 'pin_3', x: 74, y: 40, label: 'PIN 13', detail: 'SCK / Digital Pin 13 (LED)', color: '#06b6d4' }
      ];

  const [activePinId, setActivePinId] = useState<string>(pins[0]?.id || 'pin_1');
  const activePin = pins.find((p) => p.id === activePinId) || pins[0];

  // Gallery items
  const gallery: GalleryItem[] = Array.isArray(data.gallery) && data.gallery.length > 0
    ? data.gallery
    : [
        { id: 'gal_1', title: 'টপ-ভিউ পিনআউট', badge: 'VIEW 01', active: true },
        { id: 'gal_2', title: 'লজিক ইন্টারনাল', badge: 'VIEW 02', active: false },
        { id: 'gal_3', title: 'পিসিবি লেআউট', badge: 'VIEW 03', active: false }
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
      className="w-full h-full relative"
    >
      {/* =========================================================================
          VARIANT 1: TECHNICAL SCHEMATIC FRAME (Hardware Bezel Frame)
         ========================================================================= */}
      {layoutVariant === 'diagram_frame_card' && (
        <div className="flex flex-col h-full gap-2.5">
          {/* Top Chassis Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="font-bold tracking-tight truncate"
              >
                {renderHighlightedText(data.title || 'সার্কিট স্কিম্যাটিক ও সংযোগ ডায়াগ্রাম', accentStyle)}
              </span>
            </div>

            {showBadge && (
              <span
                style={{
                  backgroundColor: badgeBg,
                  color: badgeTextColor,
                  borderColor: badgeBorderColor,
                  borderRadius: `${badgeBorderRadius}px`
                }}
                className="px-2.5 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
              >
                {data.badge}
              </span>
            )}
          </div>

          {/* Media Viewport Canvas */}
          <div className="relative flex-1 min-h-[160px] rounded-xl bg-slate-950/80 border border-slate-800/90 overflow-hidden flex items-center justify-center p-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Schematic"
                style={{ objectFit: fit }}
                className="w-full h-full rounded-lg"
              />
            ) : (
              <CircuitSchematicSvg accentColor={themeAccentColor} />
            )}
          </div>

          {/* Bottom Caption & Technical Footer */}
          {showCaption && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 shrink-0">
              <p style={{ fontFamily: getFontFamilyCss(bodyFontFamily), color: bodyColor }} className="truncate">
                {renderHighlightedText(data.caption, accentStyle)}
              </p>
              <span className="font-mono text-cyan-400/80 text-[10px] shrink-0 ml-2">
                16MHz • 5.0V DC • AVR RISC
              </span>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VARIANT 2: SIDE-BY-SIDE COMPARE (Before vs After Split Media)
         ========================================================================= */}
      {layoutVariant === 'side_by_side_compare' && (
        <div className="flex flex-col h-full gap-2.5">
          {/* Header Title */}
          {showTitle && (
            <div className="flex items-center justify-between shrink-0">
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
              {showBadge && (
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeTextColor,
                    borderColor: badgeBorderColor,
                    borderRadius: `${badgeBorderRadius}px`
                  }}
                  className="px-2 py-0.5 border text-[10px] font-mono font-bold uppercase"
                >
                  {data.badge}
                </span>
              )}
            </div>
          )}

          {/* Split Two-Column Viewport */}
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-[150px] relative items-center">
            {/* Left: Before */}
            <div className="h-full rounded-xl bg-slate-950/80 border border-slate-800/90 p-2.5 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {beforeAfter.beforeTitle}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300">
                  {beforeAfter.beforeBadge}
                </span>
              </div>
              <div className="flex-1 min-h-[100px] flex items-center justify-center rounded-lg overflow-hidden bg-slate-900/50">
                {beforeAfter.beforeUrl ? (
                  <img src={beforeAfter.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <WaveComparisonSvg isAfter={false} />
                )}
              </div>
            </div>

            {/* Center VS Indicator Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-slate-900 border border-cyan-400 text-cyan-300 flex items-center justify-center text-[10px] font-black shadow-lg">
              VS
            </div>

            {/* Right: After */}
            <div className="h-full rounded-xl bg-slate-950/80 border border-cyan-500/40 p-2.5 flex flex-col justify-between overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <span className="text-xs font-bold text-cyan-200 truncate">
                  {beforeAfter.afterTitle}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300">
                  {beforeAfter.afterBadge}
                </span>
              </div>
              <div className="flex-1 min-h-[100px] flex items-center justify-center rounded-lg overflow-hidden bg-slate-900/50">
                {beforeAfter.afterUrl ? (
                  <img src={beforeAfter.afterUrl} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <WaveComparisonSvg isAfter={true} />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Caption */}
          {showCaption && (
            <p
              style={{ fontFamily: getFontFamilyCss(bodyFontFamily), color: bodyColor }}
              className="text-xs text-center text-slate-400 shrink-0 truncate"
            >
              {renderHighlightedText(data.caption, accentStyle)}
            </p>
          )}
        </div>
      )}

      {/* =========================================================================
          VARIANT 3: CAPTIONED GLASS BENTO (Modern Floating Media Bento)
         ========================================================================= */}
      {layoutVariant === 'captioned_glass_card' && (
        <div className="relative w-full h-full rounded-xl overflow-hidden flex flex-col justify-end">
          {/* Background Media */}
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Media Preview"
                style={{ objectFit: fit }}
                className="w-full h-full"
              />
            ) : (
              <CircuitSchematicSvg accentColor={themeAccentColor} className="w-full h-full opacity-70" />
            )}
          </div>

          {/* Top-Right Badge Pill */}
          {showBadge && (
            <div className="absolute top-3 right-3 z-10">
              <span
                style={{
                  backgroundColor: badgeBg,
                  color: badgeTextColor,
                  borderColor: badgeBorderColor,
                  borderRadius: `${badgeBorderRadius}px`
                }}
                className="px-2.5 py-1 border text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-md"
              >
                {data.badge}
              </span>
            </div>
          )}

          {/* Bottom Floating Glass Caption Panel */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent backdrop-blur-sm border-t border-white/10 space-y-1">
            {showTitle && (
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
            )}
            {showCaption && (
              <p
                style={{
                  color: bodyColor,
                  fontSize: `${bodyFontSize}px`,
                  fontFamily: getFontFamilyCss(bodyFontFamily)
                }}
                className="leading-snug opacity-90 truncate"
              >
                {renderHighlightedText(data.caption, accentStyle)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIANT 4: CALLOUT SPOTLIGHT CARD (Pinpoint Target Markers)
         ========================================================================= */}
      {layoutVariant === 'callout_spotlight_card' && (
        <div className="flex flex-col h-full gap-2.5">
          {/* Header Title */}
          {showTitle && (
            <div className="flex items-center justify-between shrink-0">
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                {pins.length} TARGET PINS
              </span>
            </div>
          )}

          {/* Interactive Media Pinpoint Canvas */}
          <div className="relative flex-1 min-h-[170px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Target Canvas" className="w-full h-full object-contain" />
            ) : (
              <CircuitSchematicSvg accentColor={themeAccentColor} />
            )}

            {/* Glowing Target Pins Overlaid */}
            {pins.map((pin) => {
              const isActive = pin.id === activePinId;
              const pinColor = pin.color || themeAccentColor;
              return (
                <div
                  key={pin.id}
                  onClick={() => setActivePinId(pin.id)}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Glowing pulse ring */}
                    <span
                      style={{ backgroundColor: pinColor }}
                      className={`absolute w-6 h-6 rounded-full opacity-40 ${isActive ? 'animate-ping' : 'group-hover:scale-125'}`}
                    />
                    {/* Core pin circle */}
                    <div
                      style={{
                        backgroundColor: pinColor,
                        borderColor: '#ffffff'
                      }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-lg text-[9px] font-black text-slate-950"
                    >
                      •
                    </div>
                  </div>
                  {/* Floating Pin Label Tooltip */}
                  <div
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: pinColor
                    }}
                    className={`absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded border text-[10px] font-mono font-bold whitespace-nowrap shadow-md transition-all ${
                      isActive ? 'opacity-100 text-cyan-300' : 'opacity-70 text-slate-300'
                    }`}
                  >
                    {pin.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Callout Annotation Strip */}
          {activePin && (
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ backgroundColor: activePin.color || themeAccentColor }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-950 shrink-0"
                >
                  {activePin.label}
                </span>
                <span className="text-slate-200 font-semibold truncate">
                  {activePin.detail}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">
                ACTIVE PIN
              </span>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VARIANT 5: GALLERY STRIP (3-Thumbnail Media Strip)
         ========================================================================= */}
      {layoutVariant === 'gallery_strip_card' && (
        <div className="flex flex-col h-full gap-2.5">
          {/* Top Title Bar */}
          {showTitle && (
            <div className="flex items-center justify-between shrink-0">
              <h3
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontWeight,
                  fontFamily: getFontFamilyCss(titleFontFamily),
                  textAlign: titleTextAlign
                }}
                className="tracking-tight truncate"
              >
                {renderHighlightedText(data.title, accentStyle)}
              </h3>
              {showBadge && (
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeTextColor,
                    borderColor: badgeBorderColor,
                    borderRadius: `${badgeBorderRadius}px`
                  }}
                  className="px-2 py-0.5 border text-[10px] font-mono font-bold uppercase"
                >
                  {data.badge}
                </span>
              )}
            </div>
          )}

          {/* 3-Thumbnail Row */}
          <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[140px]">
            {gallery.map((item, idx) => {
              const isActive = Boolean(item.active);
              return (
                <div
                  key={item.id || idx}
                  style={{
                    borderColor: isActive ? themeAccentColor : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isActive && themeAccentGlow > 0 ? `0 0 12px ${hexToRgba(themeAccentColor, 0.35)}` : 'none'
                  }}
                  className="h-full rounded-xl bg-slate-950/80 border p-2 flex flex-col justify-between overflow-hidden transition-all"
                >
                  {/* Thumbnail Preview Box */}
                  <div className="flex-1 min-h-[70px] rounded-lg bg-slate-900/60 flex items-center justify-center overflow-hidden relative">
                    <CircuitSchematicSvg accentColor={isActive ? themeAccentColor : '#64748b'} className="w-full h-full scale-110" />
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400 text-[8px] font-mono font-bold text-cyan-300">
                        CURRENT
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Label */}
                  <div className="pt-2 text-center shrink-0">
                    <span className="text-[11px] font-bold text-slate-200 block truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      {item.badge || `VIEW 0${idx + 1}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Caption */}
          {showCaption && (
            <p
              style={{ fontFamily: getFontFamilyCss(bodyFontFamily), color: bodyColor }}
              className="text-xs text-center text-slate-400 shrink-0 truncate"
            >
              {renderHighlightedText(data.caption, accentStyle)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const ImageMediaDataInspector: React.FC<{
  element: SceneElement;
  onChange: (patch: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const { data, layoutVariant = 'diagram_frame_card' } = element;

  const beforeAfter = data.beforeAfter || {
    beforeTitle: 'অ্যানালগ ইনপুট সংকেত',
    afterTitle: 'ডিজিটাল আউটপুট পালস',
    beforeBadge: 'ANALOG (NOISY)',
    afterBadge: 'DIGITAL (FILTERED)',
    beforeUrl: '',
    afterUrl: ''
  };

  const pins: PinItem[] = Array.isArray(data.pins) ? data.pins : [];
  const gallery: GalleryItem[] = Array.isArray(data.gallery) ? data.gallery : [];

  const handleAddPin = () => {
    const newPin: PinItem = {
      id: `pin_${Date.now()}`,
      x: 50,
      y: 50,
      label: `PIN 0${pins.length + 1}`,
      detail: 'কাস্টম সার্কিট সিগন্যাল পিন',
      color: '#06b6d4'
    };
    onChange({ pins: [...pins, newPin] });
  };

  const handleUpdatePin = (index: number, patch: Partial<PinItem>) => {
    const updated = pins.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange({ pins: updated });
  };

  const handleRemovePin = (index: number) => {
    onChange({ pins: pins.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-slate-400">Media Title (supports [highlight])</label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              id="img-title-cb"
              checked={data.showTitle !== false}
              onChange={(e) => onChange({ showTitle: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500"
            />
            <label htmlFor="img-title-cb" className="cursor-pointer">
              Show
            </label>
          </div>
        </div>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="মাইক্রোকন্ট্রোলার [পিন ডায়াগ্রাম] ও সংযোগ"
          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
        />
      </div>

      {/* Caption Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-slate-400">Caption / Explanatory Description</label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              id="img-cap-cb"
              checked={data.showCaption !== false}
              onChange={(e) => onChange({ showCaption: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500"
            />
            <label htmlFor="img-cap-cb" className="cursor-pointer">
              Show
            </label>
          </div>
        </div>
        <textarea
          rows={2}
          value={data.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="UART সিরিয়াল ইন্টারফেস ও পাওয়ার পিনের সঠিক বিন্যাস..."
          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none resize-none focus:border-cyan-500"
        />
      </div>

      {/* Image URL & Fit */}
      <div>
        <label className="text-slate-400 block mb-1">
          Image URL (leave empty for built-in SVG vector schematic)
        </label>
        <input
          type="text"
          value={data.imageUrl || ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://... or uploaded image path"
          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-[11px] outline-none focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-slate-400 block mb-1">Object Fit</label>
          <select
            value={data.fit || 'contain'}
            onChange={(e) => onChange({ fit: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
          >
            <option value="contain">Contain (Keep Ratio)</option>
            <option value="cover">Cover (Fill Viewport)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Status Badge</label>
          <input
            type="text"
            value={data.badge || ''}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="FIG 04 • SCHEMATIC"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono outline-none"
          />
        </div>
      </div>

      {/* Side-by-Side Compare Controls */}
      {layoutVariant === 'side_by_side_compare' && (
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-cyan-400">Before / After Labels & Badges</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Left / Before Title</label>
              <input
                type="text"
                value={beforeAfter.beforeTitle}
                onChange={(e) =>
                  onChange({ beforeAfter: { ...beforeAfter, beforeTitle: e.target.value } })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Left Badge</label>
              <input
                type="text"
                value={beforeAfter.beforeBadge}
                onChange={(e) =>
                  onChange({ beforeAfter: { ...beforeAfter, beforeBadge: e.target.value } })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Right / After Title</label>
              <input
                type="text"
                value={beforeAfter.afterTitle}
                onChange={(e) =>
                  onChange({ beforeAfter: { ...beforeAfter, afterTitle: e.target.value } })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Right Badge</label>
              <input
                type="text"
                value={beforeAfter.afterBadge}
                onChange={(e) =>
                  onChange({ beforeAfter: { ...beforeAfter, afterBadge: e.target.value } })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Target Pins Controls */}
      {layoutVariant === 'callout_spotlight_card' && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">Target Pins ({pins.length})</span>
            <button
              onClick={handleAddPin}
              className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] flex items-center gap-1 hover:bg-cyan-900 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Pin</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {pins.map((pin, idx) => (
              <div key={pin.id || idx} className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <input
                    type="text"
                    value={pin.label}
                    onChange={(e) => handleUpdatePin(idx, { label: e.target.value })}
                    className="w-20 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-cyan-300"
                  />
                  <input
                    type="text"
                    value={pin.detail}
                    onChange={(e) => handleUpdatePin(idx, { detail: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200"
                  />
                  <input
                    type="color"
                    value={pin.color || '#06b6d4'}
                    onChange={(e) => handleUpdatePin(idx, { color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                  />
                  <button
                    onClick={() => handleRemovePin(idx)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>X: {pin.x}%</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={pin.x}
                    onChange={(e) => handleUpdatePin(idx, { x: Number(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span>Y: {pin.y}%</span>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    value={pin.y}
                    onChange={(e) => handleUpdatePin(idx, { y: Number(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function imageMediaCardSpecFormatter(element: SceneElement): string {
  const { data, layoutVariant = 'diagram_frame_card' } = element;
  let md = `### Image & Media Card: ${data.title || 'Schematic Media'}\n`;
  md += `- **Variant**: ${layoutVariant}\n`;
  if (data.imageUrl) md += `- **Image URL**: ${data.imageUrl}\n`;
  if (data.badge) md += `- **Badge**: ${data.badge}\n`;
  if (data.caption) md += `- **Caption**: ${data.caption}\n`;
  return md;
}

export const imageMediaCardDef: ComponentDefinition = {
  type: 'image_media_card',
  label: 'Image & Media Showcase Card',
  category: 'Diagrams',
  tier: 'smart',
  icon: ImageIcon,
  defaultGeometry: { x: 120, y: 160, width: 840, height: 440, zIndex: 10 },
  defaultStyle: {
    bgMode: 'solid',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    bgOpacity: 0.9,
    backdropBlur: 8,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    padding: 20,
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
  defaultLayoutVariant: 'diagram_frame_card',
  layoutVariants: IMAGE_MEDIA_VARIANTS,
  availableSubParts: ['container', 'title', 'body', 'badge', 'accent'],
  defaultData: {
    title: 'মাইক্রোকন্ট্রোলার [পিন ডায়াগ্রাম] ও পেরিফেরাল সংযোগ',
    caption: 'UART সিরিয়াল ইন্টারফেস ও পাওয়ার পিনের সঠিক বিন্যাস নির্দেশিত হয়েছে।',
    badge: 'FIG 04 • SCHEMATIC',
    showTitle: true,
    showCaption: true,
    showBadge: true,
    imageUrl: '',
    fallbackType: 'circuit_schematic',
    aspectRatio: '16:9',
    fit: 'contain',
    beforeAfter: {
      beforeTitle: 'অ্যানালগ ইনপুট সংকেত',
      afterTitle: 'ডিজিটাল আউটপুট পালস',
      beforeBadge: 'ANALOG (NOISY)',
      afterBadge: 'DIGITAL (FILTERED)',
      beforeUrl: '',
      afterUrl: ''
    },
    pins: [
      { id: 'pin_1', x: 28, y: 35, label: 'PIN 01', detail: 'Reset (PC6) • Active Low', color: '#f43f5e' },
      { id: 'pin_2', x: 50, y: 62, label: 'PIN 07', detail: 'VCC (+5.0V DC Input)', color: '#10b981' },
      { id: 'pin_3', x: 74, y: 40, label: 'PIN 13', detail: 'SCK / Digital Pin 13 (LED)', color: '#06b6d4' }
    ],
    gallery: [
      { id: 'gal_1', title: 'টপ-ভিউ পিনআউট', badge: 'VIEW 01', active: true },
      { id: 'gal_2', title: 'লজিক ইন্টারনাল', badge: 'VIEW 02', active: false },
      { id: 'gal_3', title: 'পিসিবি লেআউট', badge: 'VIEW 03', active: false }
    ]
  },
  CanvasRenderer: ImageMediaRenderer,
  DataInspector: ImageMediaDataInspector,
  specFormatter: imageMediaCardSpecFormatter
};

