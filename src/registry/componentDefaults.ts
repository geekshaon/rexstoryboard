import {
  Geometry,
  ElementStyle,
  Typography,
  AnimationChoreography,
  SubPartTarget
} from '../types/studio';
import { BASE_STYLE, BASE_TYPOGRAPHY, BASE_ANIMATION } from './styleUtils';

export interface LayoutVariantDef {
  id: string;
  label: string;
  description: string;
}

export interface ComponentDefaultMeta {
  type: string;
  label: string;
  category: 'Text' | 'Data & Logic' | 'Diagrams' | 'Callouts' | 'Containers' | 'Atomic';
  tier: 'smart' | 'atomic';
  defaultGeometry: Geometry;
  defaultStyle: ElementStyle;
  defaultTypography: Typography;
  defaultAnimation: AnimationChoreography;
  defaultData: Record<string, any>;
  defaultLayoutVariant?: string;
  layoutVariants?: LayoutVariantDef[];
  availableSubParts?: SubPartTarget[];
}

export const HERO_VARIANTS: LayoutVariantDef[] = [
  { id: 'simple_title_block', label: 'Simple Hero Title', description: 'Clean headline with custom border and word-specific highlight color' },
  { id: 'title_with_subtitle', label: 'Title with Subtext', description: 'Hero headline paired with secondary explanatory subtitle' }
];

export const HEADER_VARIANTS: LayoutVariantDef[] = [
  { id: 'floating_pill', label: 'Floating Pill Header', description: 'Modern rounded floating card with title, subtitle, and badge' },
  { id: 'top_bar', label: 'Top Banner Bar', description: 'Edge-to-edge header banner with crisp bottom border' },
  { id: 'minimal_headline', label: 'Minimal Topic Header', description: 'Clean compact header for minimal slide layouts' }
];

export const FOOTER_VARIANTS: LayoutVariantDef[] = [
  { id: 'floating_pill', label: 'Floating Pill Footer', description: 'Modern floating capsule with topic note and progress counter' },
  { id: 'bottom_bar', label: 'Bottom Banner Bar', description: 'Edge-to-edge footer bar with crisp top border' },
  { id: 'progress_bar', label: 'Progress Tracker Footer', description: 'Footer card with visual accent progress indicator line' }
];

export const SUBTITLE_VARIANTS: LayoutVariantDef[] = [
  { id: 'callout_quote', label: 'Callout & Quote Card', description: 'Stylized card with thick accent left bar, quote icon, and body text' },
  { id: 'caption_pill', label: 'Pill Badge Caption', description: 'Accent category pill tag above title and body explanation' },
  { id: 'standard_subtitle', label: 'Standard Subtitle Block', description: 'Clean subtitle block with headline and body paragraph' },
  { id: 'key_takeaway', label: 'Key Takeaway Card', description: 'High-emphasis takeaway card with glowing border and bullet point' }
];

export const CONTAINER_VARIANTS: LayoutVariantDef[] = [
  { id: 'flex_row', label: 'Flex Row', description: 'Horizontal auto-layout flow' },
  { id: 'flex_column', label: 'Flex Column', description: 'Vertical auto-layout stack' },
  { id: 'grid_2col', label: '2-Column Grid', description: 'Equal two-column grid structure' },
  { id: 'grid_3col', label: '3-Column Grid', description: 'Equal three-column grid structure' }
];

export const COMPONENT_DEFAULTS: Record<string, ComponentDefaultMeta> = {
  hero_text: {
    type: 'hero_text',
    label: 'Hero Header Block',
    category: 'Text',
    tier: 'smart',
    defaultLayoutVariant: 'simple_title_block',
    layoutVariants: HERO_VARIANTS,
    availableSubParts: ['container', 'title', 'body', 'accent'],
    defaultGeometry: { x: 140, y: 160, width: 840, height: 160, zIndex: 10 },
    defaultStyle: { ...BASE_STYLE, borderWidth: 2, borderColor: 'rgba(56, 189, 248, 0.4)', padding: 24, borderRadius: 16 },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 38, fontWeight: '700', highlightColor: '#38bdf8' },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      text: 'ডিজিটাল ইলেকট্রনিক্স ও [অ্যান্ড গেট] ফান্ডামেন্টালস',
      subtitle: 'বিষয়বস্তুর বিস্তারিত বিবরণ বা প্রয়োজনীয় সাবটেক্সট এখানে প্রদর্শন করা হবে',
      highlightWords: 'অ্যান্ড গেট'
    }
  },

  header_card: {
    type: 'header_card',
    label: 'Header Card',
    category: 'Text',
    tier: 'smart',
    defaultLayoutVariant: 'floating_pill',
    layoutVariants: HEADER_VARIANTS,
    availableSubParts: ['container', 'title', 'body', 'badge'],
    defaultGeometry: { x: 80, y: 40, width: 920, height: 72, zIndex: 20 },
    defaultStyle: {
      ...BASE_STYLE,
      bgColor: 'rgba(15, 23, 42, 0.85)',
      backdropBlur: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.25)',
      padding: 18
    },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 22, fontWeight: '700' },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      title: 'ডিজিটাল ইলেকট্রনিক্স',
      subtitle: 'পর্ব ০৩ : লজিক গেটের প্রাথমিক ধারণা ও বিশ্লেষণ',
      badge: 'ল্যাব ভেরিফিকেশন',
      showSubtitle: true,
      showBadge: true,
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeTextColor: '#38bdf8'
    }
  },

  footer_card: {
    type: 'footer_card',
    label: 'Footer Card',
    category: 'Text',
    tier: 'smart',
    defaultLayoutVariant: 'floating_pill',
    layoutVariants: FOOTER_VARIANTS,
    availableSubParts: ['container', 'body', 'badge'],
    defaultGeometry: { x: 80, y: 960, width: 920, height: 60, zIndex: 20 },
    defaultStyle: {
      ...BASE_STYLE,
      bgColor: 'rgba(15, 23, 42, 0.85)',
      backdropBlur: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.25)',
      padding: 16
    },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 16, textColor: '#38bdf8' },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      note: 'বুলিয়ান সমীকরণ: Y = A · B (Y সমান A অ্যান্ড B)',
      progress: 'ধাপ ০১ / ০৪',
      showProgress: true,
      noteColor: '#38bdf8',
      progressPercent: 25
    }
  },

  subtitle_caption: {
    type: 'subtitle_caption',
    label: 'Subtitle & Caption Card',
    category: 'Text',
    tier: 'smart',
    defaultLayoutVariant: 'callout_quote',
    layoutVariants: SUBTITLE_VARIANTS,
    availableSubParts: ['container', 'title', 'body', 'badge', 'accent'],
    defaultGeometry: { x: 140, y: 350, width: 800, height: 160, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
      bgColor: 'rgba(15, 23, 42, 0.75)',
      backdropBlur: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.3)',
      padding: 22
    },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 22, fontWeight: '700' },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      title: 'অ্যান্ড গেটের মূল বৈশিষ্ট্য',
      body: 'ইনপুটের সব কয়টি সিগন্যাল যখন ১ (High) হবে, শুধুমাত্র তখনই আউটপুট ১ হবে। অন্যথায় সর্বদা ০ পাওয়া যাবে।',
      badge: 'সংজ্ঞা ও কার্যপ্রণালী',
      accentColor: '#38bdf8',
      showBadge: true,
      showTitle: true
    }
  },

  container_box: {
    type: 'container_box',
    label: 'Layout Container (Flex/Grid)',
    category: 'Containers',
    tier: 'atomic',
    defaultLayoutVariant: 'flex_row',
    layoutVariants: CONTAINER_VARIANTS,
    availableSubParts: ['container'],
    defaultGeometry: { x: 200, y: 200, width: 700, height: 350, zIndex: 5 },
    defaultStyle: { ...BASE_STYLE, padding: 20, bgOpacity: 0.6 },
    defaultTypography: { ...BASE_TYPOGRAPHY },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      gap: 16,
      childIds: []
    }
  },

  basic_text: {
    type: 'basic_text',
    label: 'Basic Text Block',
    category: 'Atomic',
    tier: 'atomic',
    defaultLayoutVariant: 'standard',
    availableSubParts: ['container'],
    defaultGeometry: { x: 300, y: 300, width: 360, height: 80, zIndex: 10 },
    defaultStyle: { ...BASE_STYLE, bgMode: 'transparent', borderWidth: 0, padding: 12 },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 24 },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {
      text: 'একটি সাধারণ টেক্সট বা সাবটাইটেল ব্লক'
    }
  },

  basic_badge: {
    type: 'basic_badge',
    label: 'Basic Status Tag',
    category: 'Atomic',
    tier: 'atomic',
    defaultLayoutVariant: 'standard',
    availableSubParts: ['container'],
    defaultGeometry: { x: 300, y: 300, width: 160, height: 48, zIndex: 10 },
    defaultStyle: { ...BASE_STYLE, padding: 8, borderRadius: 999 },
    defaultTypography: { ...BASE_TYPOGRAPHY, fontSize: 14 },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'scaleSpring' },
    defaultData: {
      text: 'STATUS: ACTIVE'
    }
  },

  basic_divider: {
    type: 'basic_divider',
    label: 'Basic Divider Line',
    category: 'Atomic',
    tier: 'atomic',
    defaultLayoutVariant: 'standard',
    availableSubParts: ['container'],
    defaultGeometry: { x: 300, y: 300, width: 400, height: 24, zIndex: 10 },
    defaultStyle: { ...BASE_STYLE, bgMode: 'transparent', borderWidth: 0, padding: 0, glowIntensity: 6 },
    defaultTypography: { ...BASE_TYPOGRAPHY },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
    defaultData: {}
  }
};

export function getComponentDefaults(type: string): ComponentDefaultMeta {
  return COMPONENT_DEFAULTS[type] || COMPONENT_DEFAULTS.hero_text;
}
