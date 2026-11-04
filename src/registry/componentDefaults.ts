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

export const LIST_VARIANTS: LayoutVariantDef[] = [
  { id: 'voiceover_focus', label: 'Voiceover Focus Cards', description: 'Active speaker highlight card with solid number badge, glowing active border, and status badge' },
  { id: 'accent_bar_cards', label: 'Left Accent Bar Cards', description: 'Sleek cards with colored vertical left strip, law/prefix tag, title, and right equation/value badge' },
  { id: 'datasheet_specs', label: 'Technical Datasheet Specs', description: 'Datasheet table with header summary, verified badge, and active highlighted key-value rows' },
  { id: 'bento_grid_cards', label: 'Bento Feature Grid (2-Column)', description: 'Modern 2x2 grid cards with top icon container, step number / focus tag, and glowing active card' },
  { id: 'progress_bars', label: 'Progress & Stat Bars', description: 'Performance metrics list with numbered title, percentage stat, and glowing progress fill bar' }
];

export const TIMELINE_VARIANTS: LayoutVariantDef[] = [
  { id: 'vertical_spine', label: 'Vertical Connected Spine', description: 'Left vertical connected spine with milestone cards, active glowing border, and status pills' },
  { id: 'zigzag_nodes', label: 'Alternating Zigzag Timeline', description: 'Center spine rail with alternating left/right milestone cards and glowing milestone nodes' },
  { id: 'horizontal_pipeline', label: 'Horizontal Step Pipeline', description: 'Top glowing progress line with circular step nodes and bottom equal-width phase cards' },
  { id: 'chevron_flow', label: 'Chevron Process Flow', description: 'Connected sequential chevron arrows flowing left to right with active highlighted stage' },
  { id: 'timestamp_chapters', label: 'Video Chapter & Timestamp Spine', description: 'Video chapters with left timestamp pill (00:25s), connecting dot, and glowing active row' }
];

export const NUMBER_CARD_VARIANTS: LayoutVariantDef[] = [
  { id: 'kpi_hero_metric', label: 'Giant Hero Metric', description: 'Large bold number with category tag, trend pill, and contextual subtext' },
  { id: 'radial_gauge_card', label: 'Circular Ring & Donut Gauge', description: 'SVG circular ring gauge with glowing percentage stroke and center readout' },
  { id: 'comparison_delta_card', label: 'Benchmark Delta Comparison', description: 'Before vs After comparison with delta leap badge' },
  { id: 'multi_stat_grid', label: '3-in-1 Compact Metric Trio', description: 'Three micro-metric columns inside one unified glass card' },
  { id: 'countdown_ticker_card', label: 'Digital Cyber Ticker', description: 'Monospaced cyber segment ticker with live beacon dot' }
];

export const DATA_VISUAL_VARIANTS: LayoutVariantDef[] = [
  { id: 'sparkline_area_chart', label: 'Glowing Area Spline Chart', description: 'SVG smooth curved spline area chart with gradient fill and peak badge' },
  { id: 'bar_comparison_chart', label: 'Column & Bar Comparison', description: 'Modern rounded vertical bars with individual neon colors and floating values' },
  { id: 'truth_table_matrix', label: 'Logic Truth Table Matrix', description: 'Digital logic truth table with binary badges and active highlighted row' },
  { id: 'donut_distribution_chart', label: 'Segmented Donut Breakdown', description: 'SVG donut chart with segmented colorful slices and legend pills' },
  { id: 'wave_signal_scope', label: 'Oscilloscope Signal Waveform', description: 'Digital clock/PWM square pulse waveform with voltage and timing readouts' }
];

export const BUTTON_PILL_VARIANTS: LayoutVariantDef[] = [
  { id: 'live_pulse_pill', label: 'P1. Live Pulse Pill', description: 'Emerald glowing pill with animated live pulse dot and status label' },
  { id: 'split_key_value_pill', label: 'P2. Split Key-Value Pill', description: 'Two-tone split pill with dark parameter label and bright solid cyan value' },
  { id: 'chapter_index_pill', label: 'P3. Chapter Index Pill', description: 'Episode/chapter pill with circular number badge and topic title' },
  { id: 'hardware_pin_pill', label: 'P4. Hardware Pin Pill', description: 'Embedded hardware pill with amber PIN tag and pin function label' },
  { id: 'delta_trend_pill', label: 'P5. Delta Trend Pill', description: 'Performance delta pill with upward indicator and percentage leap' },
  { id: 'cyber_bracket_pill', label: 'P6. Cyber Bracket Pill', description: 'Tech monospaced capsule with prominent vertical cyan bracket borders' },
  { id: 'keycap_shortcut_pill', label: 'P7. Keycap Shortcut Pill', description: 'Tactile 3D keyboard keycaps with Ctrl, Shift, Alt, or custom hotkeys' },
  { id: 'formula_variable_pill', label: 'P8. Formula Variable Pill', description: 'Physics & engineering formula pill with math symbol badge and unit' },
  { id: 'warning_alert_pill', label: 'P9. Warning Alert Pill', description: 'Neon red warning capsule with alert beacon and danger message' },
  { id: 'step_progress_pill', label: 'P10. Step Progress Pill', description: 'Multi-stage progress pill with step counter and glowing segmented bar dots' },
  { id: 'code_syntax_pill', label: 'P11. Code Syntax Pill', description: 'Dark syntax-highlighted code pill for function calls and pin macros' },
  { id: 'versus_battle_pill', label: 'P12. Versus Battle Pill', description: 'Dual comparison pill with central round VS badge separating opposing concepts' },
  { id: 'all_pills_showcase', label: 'Pills Showcase Grid (All 12)', description: 'Complete 12-pill reference showcase arranged in responsive cards' }
];

export const IMAGE_MEDIA_VARIANTS: LayoutVariantDef[] = [
  { id: 'diagram_frame_card', label: 'Technical Schematic Frame', description: 'Hardware bezel frame with live status beacon, vector circuit fallback, and technical specs footer' },
  { id: 'side_by_side_compare', label: 'Before vs After Split Compare', description: 'Dual comparison viewports with neon center divider and comparative signal fallbacks' },
  { id: 'captioned_glass_card', label: 'Captioned Floating Media Bento', description: 'Full-bleed rounded media showcase with glass gradient caption overlay' },
  { id: 'callout_spotlight_card', label: 'Media Pinpoint & Spotlight Card', description: 'Media canvas with glowing callout target pins and detailed annotation card' },
  { id: 'gallery_strip_card', label: '3-Thumbnail Media Strip', description: 'Three-column media preview filmstrip with active frame highlighting' }
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
    availableSubParts: ['container', 'title', 'body', 'badge', 'accent'],
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
    availableSubParts: ['container', 'body', 'badge', 'accent'],
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

  list_card: {
    type: 'list_card',
    label: 'Feature & Content List',
    category: 'Data & Logic',
    tier: 'smart',
    defaultLayoutVariant: 'voiceover_focus',
    layoutVariants: LIST_VARIANTS,
    availableSubParts: ['container', 'title', 'items', 'accent'],
    defaultGeometry: { x: 120, y: 220, width: 880, height: 280, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 22,
      fontWeight: '700',
      highlightColor: '#38bdf8'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
    }
  },

  timeline_card: {
    type: 'timeline_card',
    label: 'Process & Roadmap Timeline',
    category: 'Data & Logic',
    tier: 'smart',
    defaultLayoutVariant: 'vertical_spine',
    layoutVariants: TIMELINE_VARIANTS,
    availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
    defaultGeometry: { x: 100, y: 200, width: 920, height: 320, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 22,
      fontWeight: '700',
      highlightColor: '#38bdf8'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
    }
  },

  number_card: {
    type: 'number_card',
    label: 'KPI & Metric Number Card',
    category: 'Data & Logic',
    tier: 'smart',
    defaultLayoutVariant: 'kpi_hero_metric',
    layoutVariants: NUMBER_CARD_VARIANTS,
    availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
    defaultGeometry: { x: 140, y: 220, width: 480, height: 260, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 20,
      fontWeight: '700',
      highlightColor: '#06b6d4'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
    }
  },

  data_visual_card: {
    type: 'data_visual_card',
    label: 'Data Visual & Charts Card',
    category: 'Data & Logic',
    tier: 'smart',
    defaultLayoutVariant: 'sparkline_area_chart',
    layoutVariants: DATA_VISUAL_VARIANTS,
    availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
    defaultGeometry: { x: 120, y: 200, width: 720, height: 340, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 20,
      fontWeight: '700',
      highlightColor: '#10b981'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
    }
  },

  button_pill_card: {
    type: 'button_pill_card',
    label: 'Cyber Pills & Status Badges',
    category: 'Callouts',
    tier: 'smart',
    defaultLayoutVariant: 'live_pulse_pill',
    layoutVariants: BUTTON_PILL_VARIANTS,
    availableSubParts: ['container', 'title', 'items', 'badge', 'accent'],
    defaultGeometry: { x: 240, y: 320, width: 440, height: 130, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 16,
      fontWeight: '700',
      highlightColor: '#10b981'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
    }
  },

  image_media_card: {
    type: 'image_media_card',
    label: 'Image & Media Showcase Card',
    category: 'Diagrams',
    tier: 'smart',
    defaultLayoutVariant: 'diagram_frame_card',
    layoutVariants: IMAGE_MEDIA_VARIANTS,
    availableSubParts: ['container', 'title', 'body', 'badge', 'accent'],
    defaultGeometry: { x: 120, y: 160, width: 840, height: 440, zIndex: 10 },
    defaultStyle: {
      ...BASE_STYLE,
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
      ...BASE_TYPOGRAPHY,
      fontSize: 20,
      fontWeight: '700',
      highlightColor: '#10b981'
    },
    defaultAnimation: { ...BASE_ANIMATION, entrance: 'fadeIn' },
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
