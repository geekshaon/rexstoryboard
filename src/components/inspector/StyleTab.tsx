import React, { useState } from 'react';
import {
  Link,
  Unlink,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Moon
} from 'lucide-react';
import {
  SceneElement,
  SubPartTarget,
  FontFamilyType,
  CornerRadiusValues,
  BoxModelValues,
  Typography
} from '../../types/studio';
import { ComponentDefinition } from '../../registry/componentRegistry';
import { useStudioStore } from '../../store/studioStore';
import { THEME_COLOR_PRESETS } from '../../utils/themePalettes';

interface StyleTabProps {
  element: SceneElement;
  def: ComponentDefinition | null;
}

export const StyleTab: React.FC<StyleTabProps> = ({ element, def }) => {
  const [activeSubPart, setActiveSubPart] = useState<SubPartTarget>('container');
  const [presetFilter, setPresetFilter] = useState<'all' | 'light' | 'dark'>('all');

  const updateElementStyle = useStudioStore((s) => s.updateElementStyle);
  const updateElementBorderWidths = useStudioStore((s) => s.updateElementBorderWidths);
  const updateElementPaddingBox = useStudioStore((s) => s.updateElementPaddingBox);
  const updateElementTypography = useStudioStore((s) => s.updateElementTypography);
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);
  const clearElementSubStyle = useStudioStore((s) => s.clearElementSubStyle);
  const updateElementCornerRadius = useStudioStore((s) => s.updateElementCornerRadius);
  const applyThemePresetToElement = useStudioStore((s) => s.applyThemePresetToElement);

  const cornerRadius: CornerRadiusValues = element.cornerRadius || {
    topLeft: element.style.borderRadius ?? 16,
    topRight: element.style.borderRadius ?? 16,
    bottomRight: element.style.borderRadius ?? 16,
    bottomLeft: element.style.borderRadius ?? 16,
    linked: true
  };

  const paddingBox: BoxModelValues = element.geometry.paddingBox || {
    top: element.style.padding ?? 20,
    right: element.style.padding ?? 20,
    bottom: element.style.padding ?? 20,
    left: element.style.padding ?? 20,
    linked: true
  };

  const borderWidths: BoxModelValues = element.style.borderWidths || {
    top: element.style.borderWidth ?? 1,
    right: element.style.borderWidth ?? 1,
    bottom: element.style.borderWidth ?? 1,
    left: element.style.borderWidth ?? 1,
    linked: true
  };

  const labelMap: Record<SubPartTarget, string> = {
    container: 'Box / Frame',
    badge: 'Badge Pill',
    title: 'Headline / Title',
    body: 'Body Text',
    items: 'Items / Cells',
    accent: 'Highlight Accent'
  };

  const safeActiveSubPart: SubPartTarget =
    def?.availableSubParts && def.availableSubParts.includes(activeSubPart)
      ? activeSubPart
      : 'container';

  const isTargetingSubPart = safeActiveSubPart !== 'container';
  const currentSubStyle = (isTargetingSubPart && element.subStyles ? element.subStyles[safeActiveSubPart] : undefined) || {};
  const hasSubPartCustomStyle = isTargetingSubPart && Boolean(element.subStyles?.[safeActiveSubPart] && Object.keys(element.subStyles[safeActiveSubPart]!).length > 0);

  const titleSub = element.subStyles?.title || {};
  const effectiveTypo = isTargetingSubPart
    ? currentSubStyle.typography || {}
    : {
        fontFamily: titleSub.typography?.fontFamily || element.typography.fontFamily,
        fontSize: titleSub.typography?.fontSize ?? element.typography.fontSize,
        fontWeight: titleSub.typography?.fontWeight || element.typography.fontWeight,
        lineHeight: titleSub.typography?.lineHeight ?? element.typography.lineHeight,
        textColor: titleSub.textColor || titleSub.typography?.textColor || element.typography.textColor,
        highlightColor: titleSub.typography?.highlightColor || element.typography.highlightColor,
        highlightGlow: titleSub.typography?.highlightGlow ?? element.typography.highlightGlow,
        textAlign: titleSub.typography?.textAlign || element.typography.textAlign,
      };

  const currentFontFamily = (isTargetingSubPart
    ? (currentSubStyle.typography?.fontFamily || element.typography.fontFamily)
    : effectiveTypo.fontFamily) as FontFamilyType;

  const currentFontSize = isTargetingSubPart
    ? (currentSubStyle.typography?.fontSize ?? element.typography.fontSize)
    : (effectiveTypo.fontSize ?? 48);

  const currentFontWeight = isTargetingSubPart
    ? (currentSubStyle.typography?.fontWeight || element.typography.fontWeight || '700')
    : (effectiveTypo.fontWeight || '700');

  const currentLineHeight = isTargetingSubPart
    ? (currentSubStyle.typography?.lineHeight ?? element.typography.lineHeight ?? 1.3)
    : (effectiveTypo.lineHeight ?? 1.3);

  const currentTextColor = isTargetingSubPart
    ? (currentSubStyle.textColor || currentSubStyle.typography?.textColor || element.typography.textColor)
    : (effectiveTypo.textColor || '#0f172a');

  const currentHighlightColor = isTargetingSubPart
    ? (currentSubStyle.typography?.highlightColor || element.typography.highlightColor || '#38bdf8')
    : (effectiveTypo.highlightColor || '#38bdf8');

  const currentHighlightGlow = isTargetingSubPart
    ? (currentSubStyle.typography?.highlightGlow ?? element.typography.highlightGlow ?? 16)
    : (effectiveTypo.highlightGlow ?? 16);

  const currentTextAlign = isTargetingSubPart
    ? (currentSubStyle.typography?.textAlign || element.typography.textAlign || 'center')
    : (effectiveTypo.textAlign || 'center');

  const updateTypographyProp = (propName: keyof Typography, val: any) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, [propName]: val }
      });
    } else {
      updateElementTypography(element.id, { [propName]: val });
      if (element.subStyles?.title?.typography && (propName in element.subStyles.title.typography)) {
        updateElementSubStyle(element.id, 'title', {
          typography: { ...element.subStyles.title.typography, [propName]: val }
        });
      }
    }
  };

  const updateTextColor = (val: string) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        textColor: val,
        typography: { ...currentSubStyle.typography, textColor: val }
      });
    } else {
      updateElementTypography(element.id, { textColor: val });
      if (element.subStyles?.title) {
        updateElementSubStyle(element.id, 'title', {
          textColor: val,
          typography: { ...element.subStyles.title.typography, textColor: val }
        });
      }
    }
  };

  const updateHighlightColor = (val: string) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, highlightColor: val }
      });
    } else {
      updateElementTypography(element.id, { highlightColor: val });
      if (element.subStyles?.title?.typography) {
        updateElementSubStyle(element.id, 'title', {
          typography: { ...element.subStyles.title.typography, highlightColor: val }
        });
      }
    }
  };

  const updateHighlightGlow = (val: number) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, highlightGlow: val }
      });
    } else {
      updateElementTypography(element.id, { highlightGlow: val });
      if (element.subStyles?.title?.typography) {
        updateElementSubStyle(element.id, 'title', {
          typography: { ...element.subStyles.title.typography, highlightGlow: val }
        });
      }
    }
  };

  const updateTextAlign = (val: 'left' | 'center' | 'right') => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, textAlign: val }
      });
    } else {
      updateElementTypography(element.id, { textAlign: val });
      if (element.subStyles?.title?.typography) {
        updateElementSubStyle(element.id, 'title', {
          typography: { ...element.subStyles.title.typography, textAlign: val }
        });
      }
    }
  };

  const currentBgColor = isTargetingSubPart ? (currentSubStyle.bgColor || element.style.bgColor) : element.style.bgColor;
  const currentBorderColor = isTargetingSubPart ? (currentSubStyle.borderColor || element.style.borderColor) : element.style.borderColor;
  const currentBorderWidth = isTargetingSubPart ? (currentSubStyle.borderWidth ?? element.style.borderWidth) : element.style.borderWidth;
  const currentGlowIntensity = isTargetingSubPart ? (currentSubStyle.glowIntensity ?? element.style.glowIntensity) : element.style.glowIntensity;

  const filteredPresets = THEME_COLOR_PRESETS.filter((p) => {
    if (presetFilter === 'light') return p.isLight;
    if (presetFilter === 'dark') return !p.isLight;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-Part Target Selector */}
      {def?.availableSubParts && def.availableSubParts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 block">Sub-Part Target</label>
            {hasSubPartCustomStyle && (
              <button
                onClick={() => clearElementSubStyle(element.id, safeActiveSubPart)}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
                title={`Reset custom ${safeActiveSubPart} override`}
              >
                Reset {safeActiveSubPart}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {def.availableSubParts.map((part) => {
              const isPartActive = safeActiveSubPart === part;
              const isCustomized = Boolean(element.subStyles?.[part] && Object.keys(element.subStyles[part]!).length > 0);
              return (
                <button
                  key={part}
                  onClick={() => setActiveSubPart(part)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isPartActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{labelMap[part] || part}</span>
                  {isCustomized && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-part scope indicator — shows when editing a sub-part override */}
          {isTargetingSubPart && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px]">
              <span className="text-amber-300 font-semibold">
                Styling: <span className="text-amber-200 font-bold">{labelMap[safeActiveSubPart] || safeActiveSubPart}</span> override
              </span>
              {hasSubPartCustomStyle && (
                <button
                  onClick={() => clearElementSubStyle(element.id, safeActiveSubPart)}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Typography Controls */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">
            Typography ({safeActiveSubPart === 'container' ? 'Global' : safeActiveSubPart})
          </label>
          <span className="text-[10px] font-mono text-cyan-400">
            {currentFontSize}px
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Font Family</label>
            <select
              value={currentFontFamily}
              onChange={(e) => updateTypographyProp('fontFamily', e.target.value as FontFamilyType)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
            >
              <option value="Kalpurush">Kalpurush (Bangla Standard)</option>
              <option value="Hind Siliguri">Hind Siliguri (Modern Bangla)</option>
              <option value="Noto Sans Bengali">Noto Sans Bengali</option>
              <option value="Inter">Inter (Latin UI)</option>
              <option value="JetBrains Mono">JetBrains Mono (Code/Math)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Font Weight</label>
            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
              {(['400', '500', '600', '700', '800'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => updateTypographyProp('fontWeight', w)}
                  className={`py-1 rounded font-mono cursor-pointer transition-all ${currentFontWeight === w ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  style={{ fontWeight: w }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Line Height</span>
              <span className="font-mono text-cyan-400">
                {currentLineHeight}×
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={currentLineHeight}
              onChange={(e) => updateTypographyProp('lineHeight', Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Font Size (px)</label>
            <input
              type="range"
              min="12"
              max="120"
              value={currentFontSize}
              onChange={(e) => updateTypographyProp('fontSize', Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Text Color</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                <input
                  type="color"
                  value={currentTextColor}
                  onChange={(e) => updateTextColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={currentTextColor}
                  onChange={(e) => updateTextColor(e.target.value)}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Highlight Color</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                <input
                  type="color"
                  value={currentHighlightColor}
                  onChange={(e) => updateHighlightColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={currentHighlightColor}
                  onChange={(e) => updateHighlightColor(e.target.value)}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Highlight Text Glow */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Highlight Glow</span>
              <span className="font-mono text-cyan-400">
                {currentHighlightGlow === 0 ? 'Off (Clean Text)' : `${currentHighlightGlow}px`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
              value={currentHighlightGlow}
              onChange={(e) => updateHighlightGlow(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Alignment</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
              {(['left', 'center', 'right'] as const).map((al) => (
                <button
                  key={al}
                  onClick={() => updateTextAlign(al)}
                  className={`py-1 rounded text-xs capitalize flex items-center justify-center cursor-pointer ${
                    currentTextAlign === al
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Surface & Background — only for container sub-part (text sub-parts have no background layer) */}
      {safeActiveSubPart === 'container' && (
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-300 block">
            Surface & Background (Global)
          </label>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Background Mode</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                {(['solid', 'gradient', 'transparent'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => updateElementStyle(element.id, { bgMode: m })}
                    className={`py-1 rounded text-center capitalize cursor-pointer text-[11px] ${
                      element.style.bgMode === m
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Primary BG</span>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                  <input
                    type="color"
                    value={currentBgColor}
                    onChange={(e) => updateElementStyle(element.id, { bgColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-slate-300">{currentBgColor}</span>
                </div>
              </div>
              {element.style.bgMode === 'gradient' && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Secondary BG</span>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                    <input
                      type="color"
                      value={element.style.gradientColor2 || '#1e293b'}
                      onChange={(e) => updateElementStyle(element.id, { gradientColor2: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{element.style.gradientColor2 || '#1e293b'}</span>
                  </div>
                </div>
              )}
            </div>

            {element.style.bgMode === 'gradient' && (
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Gradient Angle</span>
                  <span className="font-mono text-cyan-400">{element.style.gradientAngle ?? 135}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={element.style.gradientAngle ?? 135}
                  onChange={(e) => updateElementStyle(element.id, { gradientAngle: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>BG Opacity</span>
                <span className="font-mono text-cyan-400">{Math.round((element.style.bgOpacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={element.style.bgOpacity ?? 1}
                onChange={(e) => updateElementStyle(element.id, { bgOpacity: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Backdrop Glass Blur</span>
                <span className="font-mono text-cyan-400">{element.style.backdropBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={element.style.backdropBlur}
                onChange={(e) => updateElementStyle(element.id, { backdropBlur: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Box Model — Padding & Border Presets */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300">Box Model (Padding & Quick Presets)</label>

        {/* Padding 4-Way */}
        {!isTargetingSubPart && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-cyan-400 font-semibold">Padding (px)</span>
              <button
                onClick={() => updateElementPaddingBox(element.id, { ...paddingBox, linked: !paddingBox.linked })}
                className={`p-1 rounded cursor-pointer ${
                  paddingBox.linked ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                }`}
                title={paddingBox.linked ? 'Unlink Padding' : 'Link Padding'}
              >
                {paddingBox.linked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <span className="text-slate-500 block mb-0.5 capitalize">{side.slice(0, 1).toUpperCase() + side.slice(1, 3)}</span>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={paddingBox[side]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (paddingBox.linked) {
                        updateElementPaddingBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                      } else {
                        updateElementPaddingBox(element.id, { ...paddingBox, [side]: val });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Border Presets */}
        <div>
          <span className="text-[9px] text-slate-500 block mb-1 font-mono">QUICK BORDER PRESETS</span>
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: 'Full Box', t: 2, r: 2, b: 2, l: 2, cls: 'text-slate-300' },
              { label: 'Left Bar', t: 0, r: 0, b: 0, l: 6, cls: 'text-cyan-400' },
              { label: 'Btm Line', t: 0, r: 0, b: 3, l: 0, cls: 'text-amber-400' },
              { label: 'None', t: 0, r: 0, b: 0, l: 0, cls: 'text-slate-500' }
            ].map(({ label, t, r, b, l, cls }) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  updateElementBorderWidths(element.id, {
                    top: t,
                    right: r,
                    bottom: b,
                    left: l,
                    linked: t === r && r === b && b === l
                  })
                }
                className={`px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono truncate cursor-pointer ${cls}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Corner Independent Border Radius */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">4-Corner Border Radius</label>
          <button
            onClick={() => {
              const nextLinked = !cornerRadius.linked;
              updateElementCornerRadius(element.id, { ...cornerRadius, linked: nextLinked });
            }}
            className={`p-1 rounded cursor-pointer ${
              cornerRadius.linked ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
            }`}
            title={cornerRadius.linked ? 'Unlink Corners' : 'Link Corners'}
          >
            {cornerRadius.linked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
          <div>
            <span className="text-slate-500 block mb-0.5">TL</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.topLeft}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (cornerRadius.linked) {
                  updateElementCornerRadius(element.id, {
                    topLeft: val,
                    topRight: val,
                    bottomRight: val,
                    bottomLeft: val,
                    linked: true
                  });
                } else {
                  updateElementCornerRadius(element.id, { ...cornerRadius, topLeft: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">TR</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.topRight}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, topRight: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">BR</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.bottomRight}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, bottomRight: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">BL</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.bottomLeft}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, bottomLeft: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4-Way Individual Border Control & Neon Glow */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">
            Border & Neon Glow ({safeActiveSubPart === 'container' ? 'Global' : safeActiveSubPart})
          </label>
          <button
            type="button"
            onClick={() => {
              updateElementBorderWidths(element.id, {
                ...borderWidths,
                linked: !borderWidths.linked
              });
            }}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              borderWidths.linked
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
            title={borderWidths.linked ? 'Unlink to set individual border sides' : 'Link all sides together'}
          >
            {borderWidths.linked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 4-Sided Border Width Inputs */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block font-mono">
            {borderWidths.linked ? 'Linked Border Width (px)' : 'Individual Sides (Top, Right, Bottom, Left)'}
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
            <div>
              <span className="text-[9px] text-slate-500 block mb-0.5">TOP</span>
              <input
                type="number"
                min="0"
                max="24"
                value={borderWidths.top}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  if (borderWidths.linked) {
                    updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementBorderWidths(element.id, { ...borderWidths, top: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block mb-0.5">RIGHT</span>
              <input
                type="number"
                min="0"
                max="24"
                value={borderWidths.right}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  if (borderWidths.linked) {
                    updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementBorderWidths(element.id, { ...borderWidths, right: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block mb-0.5">BOTTOM</span>
              <input
                type="number"
                min="0"
                max="24"
                value={borderWidths.bottom}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  if (borderWidths.linked) {
                    updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementBorderWidths(element.id, { ...borderWidths, bottom: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block mb-0.5">LEFT</span>
              <input
                type="number"
                min="0"
                max="24"
                value={borderWidths.left}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  if (borderWidths.linked) {
                    updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementBorderWidths(element.id, { ...borderWidths, left: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Border Color & Style */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Border Style</span>
            <select
              value={element.style.borderStyle || 'solid'}
              onChange={(e) => {
                updateElementStyle(element.id, {
                  borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none'
                });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Border Color</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={currentBorderColor.startsWith('#') ? currentBorderColor : '#38bdf8'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isTargetingSubPart) {
                    updateElementSubStyle(element.id, safeActiveSubPart, { borderColor: val });
                  } else {
                    updateElementStyle(element.id, { borderColor: val });
                  }
                }}
                className="w-7 h-7 rounded bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={currentBorderColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isTargetingSubPart) {
                    updateElementSubStyle(element.id, safeActiveSubPart, { borderColor: val });
                  } else {
                    updateElementStyle(element.id, { borderColor: val });
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] truncate"
              />
            </div>
          </div>
        </div>

        {/* Glow Intensity */}
        <div className="pt-1 border-t border-slate-800/60">
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Glow Intensity</span>
            <span className="font-mono text-cyan-400">{currentGlowIntensity}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={currentGlowIntensity}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isTargetingSubPart) {
                updateElementSubStyle(element.id, safeActiveSubPart, { glowIntensity: val });
              } else {
                updateElementStyle(element.id, { glowIntensity: val });
              }
            }}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* 1-Click Theme Presets (Light & Dark with Instant Filtering) */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Theme Presets ({filteredPresets.length})</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setPresetFilter('all')}
              className={`px-1.5 py-0.5 rounded font-mono cursor-pointer transition-all ${
                presetFilter === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setPresetFilter('light')}
              className={`px-1.5 py-0.5 rounded font-mono cursor-pointer flex items-center gap-0.5 transition-all ${
                presetFilter === 'light' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400'
              }`}
            >
              <Sun className="w-2.5 h-2.5 text-amber-400" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setPresetFilter('dark')}
              className={`px-1.5 py-0.5 rounded font-mono cursor-pointer flex items-center gap-0.5 transition-all ${
                presetFilter === 'dark' ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400'
              }`}
            >
              <Moon className="w-2.5 h-2.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyThemePresetToElement(element.id, preset.id)}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 flex items-center gap-2 text-left cursor-pointer transition-all group"
            >
              {/* Dual Swatch (Card Surface + Highlight Accent) */}
              <div
                className="w-5 h-5 rounded-md shrink-0 border border-white/20 flex items-center justify-center shadow-inner overflow-hidden"
                style={{ backgroundColor: preset.cardBg }}
              >
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.highlightText }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-slate-200 block truncate leading-tight group-hover:text-cyan-300">
                  {preset.label}
                </span>
                <span className="text-[9px] font-mono text-slate-500 block truncate">
                  {preset.isLight ? '☀️ Light' : '🌙 Dark'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

