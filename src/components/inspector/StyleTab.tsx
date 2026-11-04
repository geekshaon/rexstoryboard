import React, { useState } from 'react';
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
import { SubPartSelector } from './style/SubPartSelector';
import { SUBPART_LABELS, getSubPartSupport } from './style/styleTabUtils';
import { CardGeometrySection } from './style/CardGeometrySection';
import { TypographySection } from './style/TypographySection';
import { AccentSection } from './style/AccentSection';
import { BadgeSection } from './style/BadgeSection';
import { ItemsSection } from './style/ItemsSection';
import { SurfaceSection } from './style/SurfaceSection';
import { BoxModelSection } from './style/BoxModelSection';
import { BorderSection } from './style/BorderSection';
import { ThemePresetsSection } from './style/ThemePresetsSection';

interface StyleTabProps {
  element: SceneElement;
  def: ComponentDefinition | null;
}

export const StyleTab: React.FC<StyleTabProps> = ({ element, def }) => {
  const [activeSubPart, setActiveSubPart] = useState<SubPartTarget>('container');

  const updateElementTypography = useStudioStore((s) => s.updateElementTypography);
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);
  const clearElementSubStyle = useStudioStore((s) => s.clearElementSubStyle);

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

  const safeActiveSubPart: SubPartTarget =
    def?.availableSubParts && def.availableSubParts.includes(activeSubPart)
      ? activeSubPart
      : 'container';

  const isTargetingSubPart = safeActiveSubPart !== 'container';
  const currentSubStyle = (isTargetingSubPart && element.subStyles ? element.subStyles[safeActiveSubPart] : undefined) || {};
  const currentPartSupport = getSubPartSupport(element, safeActiveSubPart);

  // Typography resolution:
  // When targeting sub-part, read from that sub-part with fallback to global element typography.
  // When targeting container, strictly read from global element typography.
  const currentFontFamily = (
    isTargetingSubPart
      ? (currentSubStyle.typography?.fontFamily || element.typography.fontFamily)
      : element.typography.fontFamily
  ) as FontFamilyType;

  const currentFontSize = isTargetingSubPart
    ? (currentSubStyle.typography?.fontSize ?? element.typography.fontSize)
    : element.typography.fontSize;

  const currentFontWeight = isTargetingSubPart
    ? (currentSubStyle.typography?.fontWeight || element.typography.fontWeight || '700')
    : (element.typography.fontWeight || '700');

  const currentLineHeight = isTargetingSubPart
    ? (currentSubStyle.typography?.lineHeight ?? element.typography.lineHeight ?? 1.3)
    : (element.typography.lineHeight ?? 1.3);

  const currentTextColor = isTargetingSubPart
    ? (currentSubStyle.textColor || currentSubStyle.typography?.textColor || element.typography.textColor)
    : element.typography.textColor;

  const currentHighlightColor = isTargetingSubPart
    ? (currentSubStyle.typography?.highlightColor || currentSubStyle.textColor || element.typography.highlightColor || '#38bdf8')
    : (element.typography.highlightColor || '#38bdf8');

  const currentHighlightGlow = isTargetingSubPart
    ? (currentSubStyle.typography?.highlightGlow ?? currentSubStyle.glowIntensity ?? element.typography.highlightGlow ?? 16)
    : (element.typography.highlightGlow ?? 16);

  const currentTextAlign = isTargetingSubPart
    ? (currentSubStyle.typography?.textAlign || element.typography.textAlign || 'center')
    : (element.typography.textAlign || 'center');

  // Independent Typography updates (Decoupled: container edits do NOT mutate child subStyles!)
  const updateTypographyProp = (propName: keyof Typography, val: any) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, [propName]: val }
      });
    } else {
      updateElementTypography(element.id, { [propName]: val });
    }
  };

  const updateTextColor = (val: string) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        textColor: val,
        typography: {
          ...currentSubStyle.typography,
          textColor: val,
          ...(safeActiveSubPart === 'accent' ? { highlightColor: val } : {})
        }
      });
    } else {
      updateElementTypography(element.id, { textColor: val });
    }
  };

  const updateHighlightColor = (val: string) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        ...(safeActiveSubPart === 'accent' ? { textColor: val } : {}),
        typography: {
          ...currentSubStyle.typography,
          highlightColor: val,
          ...(safeActiveSubPart === 'accent' ? { textColor: val } : {})
        }
      });
    } else {
      updateElementTypography(element.id, { highlightColor: val });
    }
  };

  const updateHighlightGlow = (val: number) => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        glowIntensity: val,
        typography: { ...currentSubStyle.typography, highlightGlow: val }
      });
    } else {
      updateElementTypography(element.id, { highlightGlow: val });
    }
  };

  const updateTextAlign = (val: 'left' | 'center' | 'right') => {
    if (isTargetingSubPart) {
      updateElementSubStyle(element.id, safeActiveSubPart, {
        typography: { ...currentSubStyle.typography, textAlign: val }
      });
    } else {
      updateElementTypography(element.id, { textAlign: val });
    }
  };

  const currentBgColor = isTargetingSubPart ? (currentSubStyle.bgColor || element.style.bgColor) : element.style.bgColor;
  const currentBorderColor = isTargetingSubPart ? (currentSubStyle.borderColor || element.style.borderColor) : element.style.borderColor;
  const currentGlowIntensity = isTargetingSubPart ? (currentSubStyle.glowIntensity ?? element.style.glowIntensity) : element.style.glowIntensity;

  const currentLabel = safeActiveSubPart === 'body' && element.type === 'footer_card'
    ? 'Footer Note'
    : SUBPART_LABELS[safeActiveSubPart] || safeActiveSubPart;

  return (
    <div className="space-y-4">
      {/* 1. Sub-Part Target Selector */}
      <SubPartSelector
        element={element}
        def={def}
        activeSubPart={safeActiveSubPart}
        onSelectSubPart={setActiveSubPart}
        onClearSubStyle={(part) => clearElementSubStyle(element.id, part)}
      />

      {/* 2. Container (Box / Frame) Position, Dimensions & Content Flow Alignment */}
      {safeActiveSubPart === 'container' && (
        <CardGeometrySection element={element} />
      )}

      {/* Notice for Sub-Parts: Dimensions & Box background belong to container */}
      {isTargetingSubPart && (
        <div className="px-2.5 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
          ℹ️ Card Position, Dimensions, Canvas Alignment and Frame Padding belong to <strong className="text-slate-200">Box / Frame</strong>.
        </div>
      )}

      {/* 3. Typography Controls (Shown for Container, Title, Body when supported) */}
      {currentPartSupport.supported && safeActiveSubPart !== 'badge' && safeActiveSubPart !== 'accent' && (
        <TypographySection
          safeActiveSubPart={safeActiveSubPart}
          label={currentLabel}
          currentFontSize={currentFontSize}
          currentFontFamily={currentFontFamily}
          currentFontWeight={currentFontWeight}
          currentLineHeight={currentLineHeight}
          currentTextColor={currentTextColor}
          currentHighlightColor={currentHighlightColor}
          currentHighlightGlow={currentHighlightGlow}
          currentTextAlign={currentTextAlign}
          onUpdateTypographyProp={updateTypographyProp}
          onUpdateTextColor={updateTextColor}
          onUpdateHighlightColor={updateHighlightColor}
          onUpdateHighlightGlow={updateHighlightGlow}
          onUpdateTextAlign={updateTextAlign}
          onGoToAccentTab={() => setActiveSubPart('accent')}
        />
      )}

      {/* 4. Highlight Accent Dedicated Controls (When safeActiveSubPart === 'accent') */}
      {safeActiveSubPart === 'accent' && currentPartSupport.supported && (
        <AccentSection
          element={element}
          currentHighlightColor={currentHighlightColor}
          currentFontWeight={currentFontWeight}
          currentHighlightGlow={currentHighlightGlow}
          currentSubStyle={currentSubStyle}
          onUpdateHighlightColor={updateHighlightColor}
          onUpdateHighlightGlow={updateHighlightGlow}
          onUpdateTypographyProp={updateTypographyProp}
        />
      )}

      {/* 5. Badge Pill Dedicated Surface, Border & Typography Controls */}
      {safeActiveSubPart === 'badge' && currentPartSupport.supported && (
        <BadgeSection
          element={element}
          currentSubStyle={currentSubStyle}
        />
      )}

      {/* 5b. Items / Cells Dedicated Surface, Box Model, Borders & Spacing Controls */}
      {safeActiveSubPart === 'items' && currentPartSupport.supported && (
        <ItemsSection
          element={element}
          currentSubStyle={currentSubStyle}
        />
      )}

      {/* 6. Surface & Background — only for container sub-part */}
      {safeActiveSubPart === 'container' && (
        <SurfaceSection
          element={element}
          currentBgColor={currentBgColor}
        />
      )}

      {/* 7. Box Model — Padding & Border Presets (Container only) */}
      {safeActiveSubPart === 'container' && (
        <BoxModelSection
          element={element}
          paddingBox={paddingBox}
          cornerRadius={cornerRadius}
        />
      )}

      {/* 8. 4-Way Individual Border Control & Neon Glow (Container only) */}
      {safeActiveSubPart === 'container' && (
        <BorderSection
          element={element}
          borderWidths={borderWidths}
          currentBorderColor={currentBorderColor}
          currentGlowIntensity={currentGlowIntensity}
        />
      )}

      {/* 9. 1-Click Theme Presets (Container only) */}
      {safeActiveSubPart === 'container' && (
        <ThemePresetsSection element={element} />
      )}
    </div>
  );
};
