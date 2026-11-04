import {
  ProjectData,
  Scene,
  ElementStyle,
  Typography,
  AnimationChoreography
} from '../types/studio';

export const BASE_STYLE_COPY: ElementStyle = {
  bgMode: 'solid',
  bgColor: '#0f172a',
  bgOpacity: 0.9,
  backdropBlur: 8,
  borderWidth: 1.5,
  borderStyle: 'solid',
  borderColor: 'rgba(56, 189, 248, 0.4)',
  borderRadius: 16,
  padding: 24,
  glowColor: '#38bdf8',
  glowIntensity: 8,
  verticalAlign: 'center',
  horizontalAlign: 'center'
};

export const BASE_TYPO_COPY: Typography = {
  fontFamily: 'Kalpurush',
  fontSize: 22,
  fontWeight: '500',
  lineHeight: 1.4,
  textAlign: 'left',
  textColor: '#f8fafc'
};

export const BASE_ANIM_COPY: AnimationChoreography = {
  stepOrder: 1,
  startAtSecond: 0,
  entrance: 'fadeIn',
  duration: 0.8,
  delay: 0,
  easing: 'spring',
  stagger: 0.15,
  emphasis: 'none'
};

// Initial Demo Scene: AND Gate in Bangla
export const DEFAULT_DEMO_SCENE: Scene = {
  id: 'scene_and_gate_demo',
  name: 'ডিজিটাল লজিক গেট (AND Gate)',
  aspectRatio: '16:9',
  duration: 15,
  autoDuration: true,
  narrationScript: `ডিজিটাল ইলেকট্রনিক্সের তৃতীয় পর্বে সবাইকে স্বাগতম। আজকে আমরা জানব অ্যান্ড গেট (AND Gate) সম্পর্কে। 
অ্যান্ড গেট এমন একটি মৌলিক লজিক সার্কিট যার সবগুলো ইনপুট এক বা সত্য হলেই আউটপুট সত্য হয়। 
স্ক্রিনে এর লজিক সিম্বল, সত্যক সারণি এবং বুলিয়ান সমীকরণ লক্ষ্য করুন।`,
  theme: {
    bgPreset: 'blueprint',
    customBgColor: '#0d1117',
    gridEnabled: true,
    gridType: 'line',
    gridSize: 20,
    gridColor: 'rgba(56, 189, 248, 0.12)',
    gridOpacity: 0.15,
    safeGuard: {
      enabled: true,
      showGuides: true,
      top: 60,
      right: 80,
      bottom: 80,
      left: 80,
      snapToSafeGuard: true,
      preset: 'youtube_video'
    }
  },
  masterHeader: {
    enabled: false,
    maintainSafeGuard: true,
    layoutMode: 'floating',
    height: 80,
    paddingX: 32,
    borderRadius: 16,
    borderWidth: 1,
    title: 'ডিজিটাল ইলেকট্রনিক্স',
    titleFontSize: 24,
    showSubtitle: true,
    subtitle: 'পর্ব ০৩ : লজিক গেটের প্রাথমিক ধারণা ও বিশ্লেষণ',
    showBadge: true,
    badge: 'ল্যাব ভেরিফিকেশন',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    blur: 12,
    textColor: '#f8fafc',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeTextColor: '#38bdf8'
  },
  masterFooter: {
    enabled: false,
    maintainSafeGuard: true,
    layoutMode: 'floating',
    height: 60,
    paddingX: 32,
    borderRadius: 16,
    borderWidth: 1,
    note: 'বুলিয়ান সমীকরণ: Y = A · B (Y সমান A অ্যান্ড B)',
    noteFontSize: 16,
    showProgress: true,
    progress: 'ধাপ ০১ / ০৪',
    bgColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    textColor: '#94a3b8',
    noteColor: '#38bdf8'
  },
  elements: [
    {
      id: 'elem_header_demo',
      type: 'header_card',
      layoutVariant: 'floating_pill',
      geometry: { x: 80, y: 50, width: 920, height: 72, zIndex: 15 },
      style: {
        bgMode: 'solid',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        bgOpacity: 0.9,
        backdropBlur: 12,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderRadius: 16,
        padding: 18,
        glowColor: '#38bdf8',
        glowIntensity: 0
      },
      typography: {
        fontFamily: 'Kalpurush',
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 1.3,
        textAlign: 'left',
        textColor: '#f8fafc',
        highlightColor: '#38bdf8'
      },
      animation: {
        stepOrder: 1,
        startAtSecond: 0,
        entrance: 'fadeIn',
        duration: 0.8,
        delay: 0,
        easing: 'spring',
        emphasis: 'none'
      },
      data: {
        title: 'ডিজিটাল ইলেকট্রনিক্স',
        subtitle: 'পর্ব ০৩ : লজিক গেটের প্রাথমিক ধারণা ও বিশ্লেষণ',
        badge: 'ল্যাব ভেরিফিকেশন',
        showSubtitle: true,
        showBadge: true,
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        badgeTextColor: '#38bdf8'
      }
    },
    {
      id: 'elem_hero_header',
      type: 'hero_text',
      layoutVariant: 'title_with_subtitle',
      geometry: { x: 80, y: 150, width: 920, height: 180, zIndex: 10 },
      style: {
        bgMode: 'solid',
        bgColor: '#0f172a',
        bgOpacity: 0.9,
        backdropBlur: 8,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        borderRadius: 16,
        padding: 24,
        glowColor: '#38bdf8',
        glowIntensity: 10
      },
      typography: {
        fontFamily: 'Kalpurush',
        fontSize: 38,
        fontWeight: '700',
        lineHeight: 1.3,
        textAlign: 'left',
        textColor: '#f8fafc',
        highlightColor: '#38bdf8'
      },
      animation: {
        stepOrder: 1,
        startAtSecond: 0,
        entrance: 'fadeIn',
        duration: 1.0,
        delay: 0,
        easing: 'spring',
        emphasis: 'none'
      },
      data: {
        text: 'ডিজিটাল ইলেকট্রনিক্স ও [অ্যান্ড গেট] ফান্ডামেন্টালস',
        subtitle: 'দ্বিমুখী সত্যতা যাচাই এবং বুলিয়ান লজিক অপারেশনের সম্পূর্ণ সারসংক্ষেপ',
        highlightWords: 'অ্যান্ড গেট'
      }
    },
    {
      id: 'elem_footer_demo',
      type: 'footer_card',
      layoutVariant: 'floating_pill',
      geometry: { x: 80, y: 960, width: 920, height: 60, zIndex: 15 },
      style: {
        bgMode: 'solid',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        bgOpacity: 0.9,
        backdropBlur: 12,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderRadius: 16,
        padding: 16,
        glowColor: '#38bdf8',
        glowIntensity: 0
      },
      typography: {
        fontFamily: 'Kalpurush',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 1.4,
        textAlign: 'left',
        textColor: '#94a3b8',
        highlightColor: '#38bdf8'
      },
      animation: {
        stepOrder: 1,
        startAtSecond: 0,
        entrance: 'fadeIn',
        duration: 0.8,
        delay: 0,
        easing: 'spring',
        emphasis: 'none'
      },
      data: {
        note: 'বুলিয়ান সমীকরণ: Y = A · B (Y সমান A অ্যান্ড B)',
        progress: 'ধাপ ০১ / ০৪',
        showProgress: true,
        noteColor: '#38bdf8',
        progressPercent: 25
      }
    }
  ]
};

export const INITIAL_PROJECT: ProjectData = {
  title: 'ডিজিটাল লজিক গেট মাস্টারক্লাস',
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  activeSceneId: 'scene_and_gate_demo',
  scenes: [DEFAULT_DEMO_SCENE],
  savedPresets: []
};

export interface SceneTemplateDefinition {
  name: string;
  elements: Scene['elements'];
}

export const EDUCATIONAL_TEMPLATES: Record<string, SceneTemplateDefinition> = {
  hardware_anatomy: {
    name: 'Hardware Anatomy Layout',
    elements: [
      {
        id: 'elem_hw_hero',
        type: 'hero_text',
        layoutVariant: 'simple_title_block',
        geometry: { x: 120, y: 160, width: 840, height: 160, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, borderColor: 'rgba(34, 211, 238, 0.4)' },
        typography: { ...BASE_TYPO_COPY, fontSize: 36, fontWeight: '700' },
        animation: { ...BASE_ANIM_COPY, stepOrder: 1, startAtSecond: 0, entrance: 'fadeIn' },
        data: {
          text: 'হার্ডওয়্যার আর্কিটেকচার ও [পিনআউট] অ্যানাটমি',
          highlightWords: 'পিনআউট',
          highlightColor: '#22d3ee'
        }
      },
      {
        id: 'elem_hw_badge',
        type: 'basic_badge',
        geometry: { x: 120, y: 340, width: 220, height: 48, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, padding: 8, borderRadius: 999 },
        typography: { ...BASE_TYPO_COPY, fontSize: 13 },
        animation: { ...BASE_ANIM_COPY, stepOrder: 2, startAtSecond: 1.5, entrance: 'scaleSpring' },
        data: { text: 'ATmega328P // 16 MHz' }
      },
      {
        id: 'elem_hw_text',
        type: 'basic_text',
        geometry: { x: 120, y: 410, width: 840, height: 140, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, padding: 18 },
        typography: { ...BASE_TYPO_COPY, fontSize: 20 },
        animation: { ...BASE_ANIM_COPY, stepOrder: 3, startAtSecond: 3.0, entrance: 'slideUp' },
        data: {
          text: '১৪টি ডিজিটাল I/O পিন (যার মধ্যে ৬টিতে PWM সাপোর্ট) এবং ৬টি অ্যানালগ ইনপুট পিন (১০-বিট ADC)।'
        }
      }
    ]
  },
  concept_comparison: {
    name: 'Concept Comparison Layout',
    elements: [
      {
        id: 'elem_comp_hero',
        type: 'hero_text',
        layoutVariant: 'simple_title_block',
        geometry: { x: 120, y: 160, width: 840, height: 160, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, borderColor: 'rgba(168, 85, 247, 0.4)' },
        typography: { ...BASE_TYPO_COPY, fontSize: 36, fontWeight: '700' },
        animation: { ...BASE_ANIM_COPY, stepOrder: 1, startAtSecond: 0, entrance: 'fadeIn' },
        data: {
          text: 'কম্বিনেশনাল বনাম [সিকোয়েনশিয়াল] লজিক সার্কিট',
          highlightWords: 'সিকোয়েনশিয়াল',
          highlightColor: '#a855f7'
        }
      },
      {
        id: 'elem_comp_box',
        type: 'container_box',
        layoutVariant: 'grid_2col',
        geometry: { x: 120, y: 340, width: 900, height: 320, zIndex: 5 },
        style: { ...BASE_STYLE_COPY, padding: 20, bgOpacity: 0.6 },
        typography: { ...BASE_TYPO_COPY },
        animation: { ...BASE_ANIM_COPY, stepOrder: 2, startAtSecond: 2.0, entrance: 'fadeIn' },
        data: { gap: 16, childIds: ['elem_comp_sub1', 'elem_comp_sub2'] }
      },
      {
        id: 'elem_comp_sub1',
        type: 'basic_text',
        parentId: 'elem_comp_box',
        geometry: { x: 140, y: 360, width: 410, height: 260, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, padding: 18, borderColor: 'rgba(56, 189, 248, 0.3)' },
        typography: { ...BASE_TYPO_COPY, fontSize: 20 },
        animation: { ...BASE_ANIM_COPY, stepOrder: 3, startAtSecond: 3.5, entrance: 'slideLeft' },
        data: {
          text: 'কম্বিনেশনাল সার্কিট: আউটপুট কেবল বর্তমান ইনপুটের ওপর নির্ভর করে। কোনো মেমোরি এলিমেন্ট থাকে না।'
        }
      },
      {
        id: 'elem_comp_sub2',
        type: 'basic_text',
        parentId: 'elem_comp_box',
        geometry: { x: 570, y: 360, width: 410, height: 260, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, padding: 18, borderColor: 'rgba(168, 85, 247, 0.3)' },
        typography: { ...BASE_TYPO_COPY, fontSize: 20 },
        animation: { ...BASE_ANIM_COPY, stepOrder: 4, startAtSecond: 5.0, entrance: 'slideRight' },
        data: {
          text: 'সিকোয়েনশিয়াল সার্কিট: আউটপুট বর্তমান ইনপুট ও পূর্ববর্তী স্টেট উভয়ের ওপর নির্ভর করে।'
        }
      }
    ]
  },
  code_walkthrough: {
    name: 'Code Walkthrough Layout',
    elements: [
      {
        id: 'elem_cw_hero',
        type: 'hero_text',
        layoutVariant: 'simple_title_block',
        geometry: { x: 120, y: 160, width: 840, height: 160, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, borderColor: 'rgba(56, 189, 248, 0.4)' },
        typography: { ...BASE_TYPO_COPY, fontSize: 36, fontWeight: '700' },
        animation: { ...BASE_ANIM_COPY, stepOrder: 1, startAtSecond: 0, entrance: 'fadeIn' },
        data: {
          text: 'অবজেক্ট ওরিয়েন্টেড ডিজাইন ও [লজিক সিমুলেশন]',
          highlightWords: 'লজিক সিমুলেশন',
          highlightColor: '#38bdf8'
        }
      },
      {
        id: 'elem_cw_text',
        type: 'basic_text',
        geometry: { x: 120, y: 340, width: 840, height: 200, zIndex: 10 },
        style: { ...BASE_STYLE_COPY, padding: 20 },
        typography: { ...BASE_TYPO_COPY, fontFamily: 'JetBrains Mono', fontSize: 18 },
        animation: { ...BASE_ANIM_COPY, stepOrder: 2, startAtSecond: 2.0, entrance: 'fadeIn' },
        data: {
          text: 'class LogicGate:\n    def __init__(self, label):\n        self.label = label\n        self.output = None'
        }
      }
    ]
  }
};

