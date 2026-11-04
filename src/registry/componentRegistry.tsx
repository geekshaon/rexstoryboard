import { ComponentDefinition, LayoutVariantDef } from './types';
import { registerComponentLookup } from './componentLookup';
import { heroTextDef } from './components/smart/HeroText';
import { headerCardDef } from './components/smart/HeaderCard';
import { footerCardDef } from './components/smart/FooterCard';
import { subtitleCaptionDef } from './components/smart/SubtitleCaption';
import { listCardDef } from './components/smart/ListCard';
import { timelineCardDef } from './components/smart/TimelineCard';
import { numberCardDef } from './components/smart/NumberCard';
import { dataVisualCardDef } from './components/smart/DataVisualCard';
import { buttonPillCardDef } from './components/smart/ButtonPillCard';
import { imageMediaCardDef } from './components/smart/ImageMediaCard';
import { containerBoxDef } from './components/containers/ContainerBox';
import { basicTextDef } from './components/atomic/BasicText';
import { basicBadgeDef } from './components/atomic/BasicBadge';
import { basicDividerDef } from './components/atomic/BasicDivider';

// Re-export types and styling helpers for backwards compatibility
export type { LayoutVariantDef, ComponentDefinition };
export {
  BASE_STYLE,
  BASE_TYPOGRAPHY,
  BASE_ANIMATION,
  getFontFamilyCss,
  resolveElementStyles,
  getSubPartStyle,
  toBanglaDigit
} from './styleUtils';

// Primary list of components registered in the studio
const PRIMARY_DEFINITIONS: ComponentDefinition[] = [
  heroTextDef,
  headerCardDef,
  footerCardDef,
  subtitleCaptionDef,
  listCardDef,
  timelineCardDef,
  numberCardDef,
  dataVisualCardDef,
  buttonPillCardDef,
  imageMediaCardDef,
  containerBoxDef,
  basicTextDef,
  basicBadgeDef,
  basicDividerDef
];

// Registry dictionary for fast O(1) lookup by element type
export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  hero_text: heroTextDef,
  header_card: headerCardDef,
  footer_card: footerCardDef,
  subtitle_caption: subtitleCaptionDef,
  list_card: listCardDef,
  timeline_card: timelineCardDef,
  number_card: numberCardDef,
  data_visual_card: dataVisualCardDef,
  button_pill_card: buttonPillCardDef,
  image_media_card: imageMediaCardDef,
  container_box: containerBoxDef,
  basic_text: basicTextDef,
  basic_badge: basicBadgeDef,
  basic_divider: basicDividerDef,

  // ─── Legacy compatibility aliases ────────────────────────────────────────────
  // Old scene types saved to IndexedDB before cleanup (2026-11-02).
  // These are read-only fallbacks: they render as HeroText so old scenes don't
  // crash. Do NOT add new components here — register in PRIMARY_DEFINITIONS.
  concept_card: heroTextDef,
  dynamic_list: heroTextDef,
  code_formula: heroTextDef,
  svg_diagram: heroTextDef,
  truth_table: heroTextDef,
  callout_pointer: heroTextDef,
  step_flow: heroTextDef,
  code_runner: heroTextDef,
  logic_gate: heroTextDef
};

export function getComponentDefinition(type: string): ComponentDefinition {
  return COMPONENT_REGISTRY[type] || COMPONENT_REGISTRY.hero_text;
}

registerComponentLookup(getComponentDefinition);

export function getAllComponentDefinitions(): ComponentDefinition[] {
  return PRIMARY_DEFINITIONS;
}
