export type BulletStyle = 'number_bn' | 'number_en' | 'check' | 'arrow' | 'dot' | 'step_badge';

export interface BoxModelValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked: boolean;
}

export interface CornerRadiusValues {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  linked: boolean;
}

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  autoHeight?: boolean; // Whether vertical height should auto-fit content
  paddingBox?: BoxModelValues;
  marginBox?: BoxModelValues;
}

export interface ElementStyle {
  bgMode: 'solid' | 'gradient' | 'transparent';
  bgColor: string;
  gradientColor2?: string;
  gradientAngle?: number;
  bgOpacity: number;
  backdropBlur: number;
  borderWidth: number;
  borderWidths?: BoxModelValues; // 4-way individual border widths
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor: string;
  borderRadius: number;
  padding: number;
  glowColor: string;
  glowIntensity: number;
  verticalAlign?: 'top' | 'center' | 'bottom';
  horizontalAlign?: 'left' | 'center' | 'right';
}

export type FontFamilyType = 'Kalpurush' | 'Hind Siliguri' | 'Noto Sans Bengali' | 'Inter' | 'JetBrains Mono';

export interface Typography {
  fontFamily: FontFamilyType;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  highlightColor?: string;
  highlightGlow?: number; // 0 to 32px glow intensity (0 = disabled/clean text)
}

export type EntranceAnimation = 
  | 'fadeIn' 
  | 'slideUp' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'scaleSpring' 
  | 'drawSvgStroke' 
  | 'typewriter';

export type EmphasisAnimation = 'none' | 'pulseGlow' | 'borderBeam' | 'float';

export interface AnimationChoreography {
  stepOrder: number;
  startAtSecond?: number; // Voiceover timestamp lock in seconds
  syncWithVoice?: boolean; // Default true: automatically synchronized with voiceover cues
  entrance: EntranceAnimation;
  duration: number; // in seconds
  delay: number; // in seconds
  easing: 'spring' | 'easeOut' | 'linear';
  stagger?: number; // for lists/tables in seconds
  emphasis: EmphasisAnimation;
  aiNote?: string; // Remotion / Manim custom instruction
}

export type SubPartTarget = 
  | 'container'
  | 'badge'
  | 'title'
  | 'body'
  | 'items'
  | 'accent';

export interface SubPartStyle {
  typography?: Partial<Typography>;
  bgColor?: string;
  bgOpacity?: number;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderWidths?: BoxModelValues;
  borderRadius?: number;
  padding?: number;
  paddingBox?: BoxModelValues;
  margin?: number;
  gap?: number;
  glowColor?: string;
  glowIntensity?: number;
}

export interface LayoutVariantOption {
  id: string;
  label: string;
  description?: string;
}

export interface SceneElement {
  id: string;
  type: string;
  layoutVariant?: string; // Structural layout variant (e.g. 'standard_stack', 'numbered_chapter', etc.)
  parentId?: string; // If nested inside a container_box
  containerSlot?: number; // Order index within parent container
  containerSizing?: 'auto' | '100%' | 'flex-1' | 'fixed'; // Sizing mode inside flex/grid
  geometry: Geometry;
  style: ElementStyle;
  typography: Typography;
  animation: AnimationChoreography;
  comments?: string; // Production review notes & comments for this element
  data: Record<string, any>;
  subStyles?: Partial<Record<SubPartTarget, SubPartStyle>>; // Granular sub-part styles (Elementor-style)
  cornerRadius?: CornerRadiusValues; // 4-corner independent border radius
}

export type SafeGuardPreset = 'broadcast' | 'youtube_video' | 'shorts_tiktok' | 'minimal' | 'custom';

export interface SafeGuardSettings {
  enabled: boolean;
  showGuides: boolean;
  top: number;
  right: number;
  bottom: number;
  left: number;
  snapToSafeGuard?: boolean;
  preset?: SafeGuardPreset;
}

export interface MasterHeader {
  enabled: boolean;
  maintainSafeGuard?: boolean; // When true (default), card is strictly positioned inside the Safe Guard margins
  layoutMode?: 'banner' | 'floating'; // banner = full-bleed edge-to-edge, floating = floating rounded card with margins
  height: number;
  paddingX?: number;
  borderRadius?: number;
  borderWidth?: number;
  title: string;
  titleFontSize?: number;
  showSubtitle?: boolean;
  subtitle: string;
  showBadge?: boolean;
  badge: string;
  bgColor: string;
  borderColor: string;
  blur: number;
  textColor: string;
  badgeBg: string;
  badgeTextColor: string;
}

export interface MasterFooter {
  enabled: boolean;
  maintainSafeGuard?: boolean; // When true (default), card is strictly positioned inside the Safe Guard margins
  layoutMode?: 'banner' | 'floating'; // banner = full-bleed edge-to-edge, floating = floating rounded card with margins
  height: number;
  paddingX?: number;
  borderRadius?: number;
  borderWidth?: number;
  note: string;
  noteFontSize?: number;
  showProgress?: boolean;
  progress: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  noteColor: string;
}

export type GridType = 'line' | 'dot' | 'isometric';

export type AspectRatioType = '16:9' | '9:16' | '1:1';

export type BgPresetType =
  | 'blueprint'
  | 'slate'
  | 'deep_space'
  | 'cyber_neon'
  | 'mesh_gradient'
  | 'aurora_mesh'
  | 'light_studio'
  | 'ivory_paper'
  | 'custom';

export interface SceneTheme {
  bgPreset: BgPresetType;
  customBgColor: string;
  gradientColor2?: string;
  gradientAngle?: number;
  gridEnabled: boolean;
  gridType: GridType;
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  safeGuard?: SafeGuardSettings;
}

export interface Scene {
  id: string;
  name: string;
  aspectRatio?: AspectRatioType; // '16:9' landscape (default), '9:16' vertical, or '1:1' square
  aspectRatioLayouts?: Partial<Record<AspectRatioType, Record<string, Geometry>>>; // Cache layouts across aspect ratios for non-destructive switching
  duration: number; // in seconds
  autoDuration?: boolean; // if true, duration automatically tracks voiceover audio / word pacing
  narrationScript: string;
  sceneComments?: string; // Scene-level director notes & production comments
  theme: SceneTheme;
  masterHeader: MasterHeader;
  masterFooter: MasterFooter;
  elements: SceneElement[];
}

export function getSceneDimensions(aspectRatio?: AspectRatioType): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '16:9':
    default:
      return { width: 1920, height: 1080 };
  }
}

export interface SavedPreset {
  id: string;
  name: string;
  componentType: string;
  layoutVariant?: string;
  subStyles?: Partial<Record<SubPartTarget, SubPartStyle>>;
  cornerRadius?: CornerRadiusValues;
  geometry: Partial<Geometry>;
  style: ElementStyle;
  typography: Typography;
  animation: AnimationChoreography;
  data: Record<string, any>;
  createdAt: string;
}

export interface ProjectData {
  title: string;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  activeSceneId: string;
  scenes: Scene[];
  savedPresets: SavedPreset[];
}
