import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import {
  ProjectData,
  Scene,
  SceneElement,
  Geometry,
  ElementStyle,
  Typography,
  AnimationChoreography,
  SceneTheme,
  MasterHeader,
  MasterFooter,
  SafeGuardSettings,
  SavedPreset,
  AspectRatioType,
  getSceneDimensions,
  BoxModelValues,
  CornerRadiusValues,
  SubPartTarget,
  SubPartStyle
} from '../types/studio';
import { getComponentDefaults } from '../registry/componentDefaults';
import { resolveThemePalette, THEME_COLOR_PRESETS } from '../utils/themePalettes';
import { syncSceneElementsWithVoiceover, computeVoiceoverCues } from '../utils/voiceSync';

const DB_STORAGE_KEY = 'vsss_project_state_v1';

let saveDbTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSaveToDb = (project: ProjectData) => {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  if (saveDbTimer) clearTimeout(saveDbTimer);
  saveDbTimer = setTimeout(async () => {
    try {
      await idbSet(DB_STORAGE_KEY, JSON.parse(JSON.stringify(project)));
    } catch (err) {
      console.warn('Failed to persist to IndexedDB:', err);
    }
  }, 400);
};

// Initial Demo Scene: AND Gate in Bangla
const DEFAULT_DEMO_SCENE: Scene = {
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

interface StudioState {
  project: ProjectData;
  selectedElementId: string | null;
  zoomScale: number;
  panOffset: { x: number; y: number };
  isAutoFit: boolean;
  isPreviewMode: boolean;
  snapGrid: 20 | 10 | 0; // 20px default confirmed
  history: ProjectData[];
  historyIndex: number;
  isInitialized: boolean;

  // Panel visibility states
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isBottomBarOpen: boolean;

  // Actions
  initialize: () => Promise<void>;
  saveToIndexedDb: () => Promise<void>;
  recordHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomBar: () => void;

  setProjectTitle: (title: string) => void;
  setZoomScale: (scale: number, isAutoFit?: boolean) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetPan: () => void;
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setSnapGrid: (snap: 20 | 10 | 0) => void;
  setSelectedElementId: (id: string | null) => void;

  // Scene management
  setActiveScene: (id: string) => void;
  addScene: (name?: string, aspectRatio?: AspectRatioType) => void;
  duplicateScene: (id: string) => void;
  deleteScene: (id: string) => void;
  updateSceneAspectRatio: (id: string, ratio: AspectRatioType) => void;
  updateSceneDuration: (id: string, duration: number, manualOverride?: boolean) => void;
  toggleSceneAutoDuration: (id: string, enabled: boolean) => void;
  updateSceneNarration: (id: string, script: string) => void;
  updateSceneComments: (id: string, comments: string) => void;
  updateSceneSafeGuard: (id: string, safeGuard: Partial<SafeGuardSettings>) => void;
  fitElementsToSafeGuard: (sceneId: string) => void;
  updateSceneTheme: (id: string, theme: Partial<SceneTheme>, syncElements?: boolean) => void;
  applyThemeColorsToAllElements: (sceneId: string) => void;
  applyColorPresetToScene: (sceneId: string, presetId: string) => void;
  syncSceneElementsWithVoice: (sceneId: string, forceAll?: boolean) => void;
  updateMasterHeader: (id: string, header: Partial<MasterHeader>) => void;
  updateMasterFooter: (id: string, footer: Partial<MasterFooter>) => void;
  applyThemeToAllScenes: (theme: SceneTheme, header: MasterHeader, footer: MasterFooter) => void;

  // Element management
  addElement: (type: string, customData?: Record<string, any>, geometryOverride?: Partial<Geometry>) => void;
  updateElementGeometry: (id: string, geom: Partial<Geometry>) => void;
  autoFitElementHeight: (id: string, measuredHeight?: number) => void;
  updateElementStyle: (id: string, style: Partial<ElementStyle>) => void;
  updateElementTypography: (id: string, typo: Partial<Typography>) => void;
  updateElementAnimation: (id: string, anim: Partial<AnimationChoreography>) => void;
  updateElementComments: (id: string, comments: string) => void;
  updateElementData: (id: string, data: Record<string, any>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignElement: (id: string, align: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  setElementLayoutVariant: (id: string, variant: string) => void;
  updateElementSubStyle: (id: string, target: SubPartTarget, style: Partial<SubPartStyle>) => void;
  clearElementSubStyle: (id: string, target: SubPartTarget) => void;
  updateElementPaddingBox: (id: string, padding: BoxModelValues) => void;
  updateElementBorderWidths: (id: string, borderWidths: BoxModelValues) => void;
  updateElementMarginBox: (id: string, margin: BoxModelValues) => void;
  updateElementCornerRadius: (id: string, radius: CornerRadiusValues) => void;
  nestElementInContainer: (elementId: string, containerId: string) => void;
  detachElementFromContainer: (elementId: string) => void;
  reorderContainerChildren: (containerId: string, newOrder: string[]) => void;
  applyThemePresetToElement: (id: string, presetKey: string) => void;

  // Presets & Templates
  saveElementAsPreset: (id: string, name: string) => void;
  applyPreset: (preset: SavedPreset) => void;
  deletePreset: (presetId: string) => void;
  applyTemplate: (templateId: string) => void;

  // Export / Import
  exportProjectJson: () => string;
  importProjectJson: (json: string) => boolean;
}

export const useStudioStore = create<StudioState>()(
  immer((set, get) => ({
    project: INITIAL_PROJECT,
    selectedElementId: 'elem_hero_header',
    zoomScale: 0.65,
    panOffset: { x: 0, y: 0 },
    isAutoFit: true,
    isPreviewMode: false,
    snapGrid: 20,
    history: [INITIAL_PROJECT],
    historyIndex: 0,
    isInitialized: false,

    isLeftSidebarOpen: true,
    isRightSidebarOpen: true,
    isBottomBarOpen: true,

    initialize: async () => {
      try {
        const saved = (await idbGet(DB_STORAGE_KEY)) as ProjectData | undefined;
        if (saved && saved.scenes && saved.scenes.length > 0) {
          saved.scenes.forEach((sc) => {
            // Migrate legacy fixed masterHeader to first-class header_card component
            if (sc.masterHeader && sc.masterHeader.enabled) {
              const hasHeaderCard = sc.elements.some((e) => e.type === 'header_card');
              if (!hasHeaderCard) {
                sc.elements.unshift({
                  id: `elem_header_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  type: 'header_card',
                  layoutVariant: sc.masterHeader.layoutMode === 'banner' ? 'top_bar' : 'floating_pill',
                  geometry: {
                    x: 80,
                    y: 50,
                    width: 920,
                    height: sc.masterHeader.height || 72,
                    zIndex: 15
                  },
                  style: {
                    bgMode: 'solid',
                    bgColor: sc.masterHeader.bgColor || 'rgba(15, 23, 42, 0.85)',
                    bgOpacity: 0.9,
                    backdropBlur: sc.masterHeader.blur ?? 12,
                    borderWidth: sc.masterHeader.borderWidth ?? 1,
                    borderStyle: 'solid',
                    borderColor: sc.masterHeader.borderColor || 'rgba(56, 189, 248, 0.25)',
                    borderRadius: sc.masterHeader.borderRadius ?? 16,
                    padding: 18,
                    glowColor: '#38bdf8',
                    glowIntensity: 0
                  },
                  typography: {
                    fontFamily: 'Kalpurush',
                    fontSize: sc.masterHeader.titleFontSize ?? 22,
                    fontWeight: '700',
                    lineHeight: 1.3,
                    textAlign: 'left',
                    textColor: sc.masterHeader.textColor || '#f8fafc',
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
                    title: sc.masterHeader.title || 'প্রধান শিরোনাম',
                    subtitle: sc.masterHeader.subtitle || '',
                    badge: sc.masterHeader.badge || '',
                    showSubtitle: sc.masterHeader.showSubtitle !== false,
                    showBadge: sc.masterHeader.showBadge !== false,
                    badgeBg: sc.masterHeader.badgeBg || 'rgba(56, 189, 248, 0.15)',
                    badgeTextColor: sc.masterHeader.badgeTextColor || '#38bdf8'
                  }
                });
              }
              sc.masterHeader.enabled = false;
            }

            // Migrate legacy fixed masterFooter to first-class footer_card component
            if (sc.masterFooter && sc.masterFooter.enabled) {
              const hasFooterCard = sc.elements.some((e) => e.type === 'footer_card');
              if (!hasFooterCard) {
                sc.elements.push({
                  id: `elem_footer_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  type: 'footer_card',
                  layoutVariant: sc.masterFooter.layoutMode === 'banner' ? 'bottom_bar' : 'floating_pill',
                  geometry: {
                    x: 80,
                    y: 960,
                    width: 920,
                    height: sc.masterFooter.height || 60,
                    zIndex: 15
                  },
                  style: {
                    bgMode: 'solid',
                    bgColor: sc.masterFooter.bgColor || 'rgba(15, 23, 42, 0.85)',
                    bgOpacity: 0.9,
                    backdropBlur: 12,
                    borderWidth: sc.masterFooter.borderWidth ?? 1,
                    borderStyle: 'solid',
                    borderColor: sc.masterFooter.borderColor || 'rgba(56, 189, 248, 0.25)',
                    borderRadius: sc.masterFooter.borderRadius ?? 16,
                    padding: 16,
                    glowColor: '#38bdf8',
                    glowIntensity: 0
                  },
                  typography: {
                    fontFamily: 'Kalpurush',
                    fontSize: sc.masterFooter.noteFontSize ?? 16,
                    fontWeight: '500',
                    lineHeight: 1.4,
                    textAlign: 'left',
                    textColor: sc.masterFooter.textColor || '#94a3b8',
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
                    note: sc.masterFooter.note || '',
                    progress: sc.masterFooter.progress || '',
                    showProgress: sc.masterFooter.showProgress !== false,
                    noteColor: sc.masterFooter.noteColor || '#38bdf8',
                    progressPercent: 25
                  }
                });
              }
              sc.masterFooter.enabled = false;
            }

            if (!sc.theme.safeGuard) {
              sc.theme.safeGuard = {
                enabled: true,
                showGuides: true,
                top: 60,
                right: 80,
                bottom: 80,
                left: 80,
                snapToSafeGuard: true,
                preset: 'youtube_video'
              };
            }
          });
          set((state) => {
            state.project = saved;
            state.history = [saved];
            state.historyIndex = 0;
            state.selectedElementId = saved.scenes[0]?.elements[0]?.id || null;
            state.isInitialized = true;
          });
          return;
        }
      } catch (err) {
        console.warn('Could not load from IndexedDB, using default project.', err);
      }
      set((state) => {
        state.isInitialized = true;
      });
    },

    saveToIndexedDb: async () => {
      debouncedSaveToDb(get().project);
    },

    recordHistory: () => {
      const current = JSON.parse(JSON.stringify(get().project));
      set((state) => {
        // Drop future history if after undo
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(current);
        if (newHistory.length > 30) newHistory.shift();
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
      get().saveToIndexedDb();
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        const previousState = JSON.parse(JSON.stringify(history[nextIndex]));
        set((state) => {
          state.project = previousState;
          state.historyIndex = nextIndex;
        });
        get().saveToIndexedDb();
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const nextState = JSON.parse(JSON.stringify(history[nextIndex]));
        set((state) => {
          state.project = nextState;
          state.historyIndex = nextIndex;
        });
        get().saveToIndexedDb();
      }
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    toggleLeftSidebar: () => {
      set((state) => {
        state.isLeftSidebarOpen = !state.isLeftSidebarOpen;
      });
    },

    toggleRightSidebar: () => {
      set((state) => {
        state.isRightSidebarOpen = !state.isRightSidebarOpen;
      });
    },

    toggleBottomBar: () => {
      set((state) => {
        state.isBottomBarOpen = !state.isBottomBarOpen;
      });
    },

    setProjectTitle: (title: string) => {
      set((state) => {
        state.project.title = title;
      });
      get().recordHistory();
    },

    setZoomScale: (scale: number, isAutoFit = false) => {
      set((state) => {
        state.zoomScale = Math.max(0.15, Math.min(2.5, scale));
        state.isAutoFit = isAutoFit;
        if (isAutoFit) {
          state.panOffset = { x: 0, y: 0 };
        }
      });
    },

    setPanOffset: (offset) => {
      set((state) => {
        if (typeof offset === 'function') {
          state.panOffset = offset(state.panOffset);
        } else {
          state.panOffset = offset;
        }
      });
    },

    resetPan: () => {
      set((state) => {
        state.panOffset = { x: 0, y: 0 };
      });
    },

    setPreviewMode: (enabled: boolean) => {
      set((state) => {
        state.isPreviewMode = enabled;
        if (enabled) {
          state.selectedElementId = null;
        }
      });
    },

    togglePreviewMode: () => {
      set((state) => {
        state.isPreviewMode = !state.isPreviewMode;
        if (state.isPreviewMode) {
          state.selectedElementId = null;
        }
      });
    },

    zoomIn: () => {
      set((state) => {
        state.zoomScale = Math.min(2.5, Math.round((state.zoomScale + 0.1) * 10) / 10);
        state.isAutoFit = false;
      });
    },

    zoomOut: () => {
      set((state) => {
        state.zoomScale = Math.max(0.15, Math.round((state.zoomScale - 0.1) * 10) / 10);
        state.isAutoFit = false;
      });
    },

    setSnapGrid: (snap: 20 | 10 | 0) => {
      set((state) => {
        state.snapGrid = snap;
      });
    },

    setSelectedElementId: (id: string | null) => {
      set((state) => {
        state.selectedElementId = id;
      });
    },

    // Scene actions
    setActiveScene: (id: string) => {
      set((state) => {
        state.project.activeSceneId = id;
        const scene = state.project.scenes.find((s) => s.id === id);
        state.selectedElementId = scene?.elements[0]?.id || null;
      });
    },

    addScene: (name, aspectRatio = '16:9') => {
      const newId = `scene_${Date.now()}`;
      const newScene: Scene = {
        id: newId,
        name: name || `দৃশ্য ০${get().project.scenes.length + 1}`,
        aspectRatio,
        duration: 15,
        autoDuration: true,
        narrationScript: '',
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
          title: get().project.title,
          titleFontSize: 24,
          showSubtitle: true,
          subtitle: 'পরবর্তী দৃশ্য বিশ্লেষণ',
          showBadge: true,
          badge: 'নোট',
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
          note: 'পরবর্তী অংশ...',
          noteFontSize: 16,
          showProgress: true,
          progress: `ধাপ ০${get().project.scenes.length + 1}`,
          bgColor: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          textColor: '#94a3b8',
          noteColor: '#38bdf8'
        },
        elements: []
      };

      set((state) => {
        state.project.scenes.push(newScene);
        state.project.activeSceneId = newId;
        state.selectedElementId = null;
      });
      get().recordHistory();
    },

    duplicateScene: (id) => {
      const scene = get().project.scenes.find((s) => s.id === id);
      if (!scene) return;

      const duplicated: Scene = JSON.parse(JSON.stringify(scene));
      duplicated.id = `scene_${Date.now()}`;
      duplicated.name = `${scene.name} (কপি)`;
      duplicated.elements.forEach((el) => {
        el.id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      });

      set((state) => {
        state.project.scenes.push(duplicated);
        state.project.activeSceneId = duplicated.id;
        state.selectedElementId = duplicated.elements[0]?.id || null;
      });
      get().recordHistory();
    },

    deleteScene: (id) => {
      const scenes = get().project.scenes;
      if (scenes.length <= 1) return; // Keep at least 1 scene

      set((state) => {
        state.project.scenes = state.project.scenes.filter((s) => s.id !== id);
        if (state.project.activeSceneId === id) {
          state.project.activeSceneId = state.project.scenes[0].id;
          state.selectedElementId = state.project.scenes[0]?.elements[0]?.id || null;
        }
      });
      get().recordHistory();
    },

    updateSceneAspectRatio: (id, newRatio) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (!scene) return;
        const oldRatio = scene.aspectRatio || '16:9';
        if (oldRatio === newRatio) return;

        if (!scene.aspectRatioLayouts) {
          scene.aspectRatioLayouts = {};
        }

        // 1. Snapshot current layout for oldRatio so it can be restored perfectly if user made a mistake or switches back
        const currentSnapshot: Record<string, Geometry> = {};
        scene.elements.forEach((el) => {
          currentSnapshot[el.id] = { ...el.geometry };
        });
        scene.aspectRatioLayouts[oldRatio] = currentSnapshot;

        scene.aspectRatio = newRatio;
        const { width: newW, height: newH } = getSceneDimensions(newRatio);
        const { width: oldW, height: oldH } = getSceneDimensions(oldRatio);

        // 2. If user already had a saved layout for this target ratio, restore it with 100% precision!
        const cachedLayout = scene.aspectRatioLayouts[newRatio];
        if (cachedLayout && Object.keys(cachedLayout).length > 0) {
          scene.elements.forEach((el) => {
            if (cachedLayout[el.id]) {
              el.geometry = { ...cachedLayout[el.id] };
            }
          });
          return;
        }

        // 3. Otherwise, smart non-destructive repositioning & containment:
        const sg = scene.theme.safeGuard?.enabled && scene.theme.safeGuard
          ? scene.theme.safeGuard
          : { top: 60, right: 60, bottom: 60, left: 60 };
        const topMargin = scene.masterHeader.enabled ? Math.max(sg.top, scene.masterHeader.height + 24) : sg.top;
        const bottomMargin = scene.masterFooter.enabled ? Math.max(sg.bottom, scene.masterFooter.height + 24) : sg.bottom;
        const availableW = newW - sg.left - sg.right;
        const availableH = newH - topMargin - bottomMargin;

        if (newRatio === '9:16') {
          // Converting Landscape (1920x1080) to Vertical (1080x1920) for Shorts / Mobile
          // Stack elements vertically in reading order so they fit cleanly
          const sorted = [...scene.elements].sort((a, b) => (a.geometry.y - b.geometry.y) || (a.geometry.x - b.geometry.x));
          const count = sorted.length;
          const targetW = Math.min(availableW, 940);
          const startX = Math.round((newW - targetW) / 2);
          const gap = 24;
          const targetH = Math.min(420, Math.max(160, Math.floor((availableH - (count - 1) * gap) / Math.max(1, count))));

          sorted.forEach((sortedEl, index) => {
            const el = scene.elements.find((e) => e.id === sortedEl.id);
            if (!el) return;
            el.geometry.width = targetW;
            el.geometry.height = Math.min(el.geometry.height, targetH);
            el.geometry.x = startX;
            el.geometry.y = topMargin + index * (targetH + gap);
          });
        } else if (newRatio === '16:9' && oldRatio === '9:16') {
          // Converting Vertical (1080x1920) to Landscape (1920x1080)
          const sorted = [...scene.elements].sort((a, b) => a.geometry.y - b.geometry.y);
          if (sorted.length >= 2) {
            const colW = Math.round((availableW - 40) / 2);
            const rowCount = Math.ceil(sorted.length / 2);
            const rowH = Math.min(420, Math.max(200, Math.floor((availableH - (rowCount - 1) * 30) / rowCount)));
            sorted.forEach((sortedEl, index) => {
              const el = scene.elements.find((e) => e.id === sortedEl.id);
              if (!el) return;
              const col = index % 2;
              const row = Math.floor(index / 2);
              el.geometry.width = colW;
              el.geometry.height = rowH;
              el.geometry.x = sg.left + col * (colW + 40);
              el.geometry.y = topMargin + row * (rowH + 30);
            });
          } else {
            sorted.forEach((sortedEl) => {
              const el = scene.elements.find((e) => e.id === sortedEl.id);
              if (!el) return;
              el.geometry.width = Math.min(940, availableW);
              el.geometry.height = Math.min(520, availableH);
              el.geometry.x = Math.round((newW - el.geometry.width) / 2);
              el.geometry.y = topMargin + 20;
            });
          }
        } else {
          // General Proportional Scaling
          const scaleX = newW / oldW;
          const scaleY = newH / oldH;
          scene.elements.forEach((el) => {
            const scaledW = Math.round(el.geometry.width * scaleX);
            const scaledH = Math.round(el.geometry.height * scaleY);
            const finalW = Math.min(availableW, Math.max(240, scaledW));
            const finalH = Math.min(availableH, Math.max(120, scaledH));
            const scaledX = Math.round(el.geometry.x * scaleX);
            const scaledY = Math.round(el.geometry.y * scaleY);
            const finalX = Math.max(sg.left, Math.min(newW - sg.right - finalW, scaledX));
            const finalY = Math.max(topMargin, Math.min(newH - bottomMargin - finalH, scaledY));

            el.geometry.width = finalW;
            el.geometry.height = finalH;
            el.geometry.x = finalX;
            el.geometry.y = finalY;
          });
        }
      });
      get().recordHistory();
    },

    updateSceneDuration: (id, duration, manualOverride = true) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (scene) {
          scene.duration = Math.max(1, duration);
          if (manualOverride) {
            scene.autoDuration = false;
          }
        }
      });
      get().recordHistory();
    },

    toggleSceneAutoDuration: (id, enabled) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (!scene) return;
        scene.autoDuration = enabled;
        if (enabled) {
          const wordCount = (scene.narrationScript || '').trim().split(/\s+/).filter(Boolean).length;
          scene.duration = Math.max(5, Math.ceil(wordCount / 2.2) + 2);
        }
      });
      get().recordHistory();
    },

    updateSceneNarration: (id, script) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (scene) {
          scene.narrationScript = script;
          if (scene.autoDuration) {
            const wordCount = (script || '').trim().split(/\s+/).filter(Boolean).length;
            scene.duration = Math.max(5, Math.ceil(wordCount / 2.2) + 2);
          }
        }
      });
      get().recordHistory();
    },

    updateSceneComments: (id, comments) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (scene) scene.sceneComments = comments;
      });
      get().recordHistory();
    },

    updateSceneSafeGuard: (id, safeGuardUpdates) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (!scene) return;
        if (!scene.theme.safeGuard) {
          scene.theme.safeGuard = {
            enabled: true,
            showGuides: true,
            top: 60,
            right: 80,
            bottom: 80,
            left: 80,
            preset: 'youtube_video'
          };
        }
        Object.assign(scene.theme.safeGuard, safeGuardUpdates);
      });
      get().recordHistory();
    },

    fitElementsToSafeGuard: (sceneId) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return;
        const dims = getSceneDimensions(scene.aspectRatio);
        const sg = scene.theme.safeGuard || { top: 60, right: 80, bottom: 80, left: 80 };

        // When header is maintained inside safe guard, it occupies sg.top to sg.top + height
        const headerMaintain = scene.masterHeader.enabled && (scene.masterHeader.maintainSafeGuard !== false);
        const headerTopOffset = headerMaintain
          ? sg.top + scene.masterHeader.height + 20
          : (scene.masterHeader.enabled ? scene.masterHeader.height + 20 : sg.top);

        // When footer is maintained inside safe guard, it occupies bottom: sg.bottom with height
        const footerMaintain = scene.masterFooter.enabled && (scene.masterFooter.maintainSafeGuard !== false);
        const footerBottomOffset = footerMaintain
          ? sg.bottom + scene.masterFooter.height + 20
          : (scene.masterFooter.enabled ? scene.masterFooter.height + 20 : sg.bottom);

        const minX = sg.left;
        const maxX = dims.width - sg.right;
        const minY = headerTopOffset;
        const maxY = dims.height - footerBottomOffset;
        const availW = Math.max(200, maxX - minX);
        const availH = Math.max(200, maxY - minY);

        scene.elements.forEach((el) => {
          if (el.type === 'header_card') {
            el.geometry.x = sg.left;
            el.geometry.y = sg.top;
            el.geometry.width = availW;
            return;
          }
          if (el.type === 'footer_card') {
            el.geometry.x = sg.left;
            el.geometry.y = Math.max(0, dims.height - sg.bottom - el.geometry.height);
            el.geometry.width = availW;
            return;
          }

          if (el.geometry.width > availW) el.geometry.width = availW;
          if (el.geometry.height > availH) el.geometry.height = availH;
          if (el.geometry.x < minX) el.geometry.x = minX;
          if (el.geometry.x + el.geometry.width > maxX) el.geometry.x = Math.max(minX, maxX - el.geometry.width);
          if (el.geometry.y < minY) el.geometry.y = minY;
          if (el.geometry.y + el.geometry.height > maxY) el.geometry.y = Math.max(minY, maxY - el.geometry.height);
        });
      });
      get().recordHistory();
    },

    updateSceneTheme: (id, themeUpdates, syncElements = true) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (!scene) return;
        Object.assign(scene.theme, themeUpdates);

        if (syncElements) {
          const palette = resolveThemePalette(scene.theme);
          // 1. Update all elements in the scene
          scene.elements.forEach((el) => {
            el.style.bgColor = palette.cardBg;
            el.style.borderColor = palette.cardBorder;
            el.style.glowColor = palette.cardGlow;
            el.style.bgOpacity = palette.cardBgOpacity;
            el.style.glowIntensity = palette.cardGlowIntensity;
            el.typography.textColor = palette.primaryText;
            el.typography.highlightColor = palette.highlightText;

            if (el.type === 'header_card') {
              el.style.bgColor = palette.headerBg;
              el.style.borderColor = palette.headerBorder;
              el.typography.textColor = palette.headerText;
              if (el.data) {
                el.data.badgeBg = palette.badgeBg;
                el.data.badgeTextColor = palette.badgeText;
              }
            } else if (el.type === 'footer_card') {
              el.style.bgColor = palette.footerBg;
              el.style.borderColor = palette.footerBorder;
              el.typography.textColor = palette.footerText;
              if (el.data) {
                el.data.noteColor = palette.footerNote;
              }
            } else if (el.type === 'subtitle_caption') {
              if (el.data) {
                el.data.accentColor = palette.highlightText;
              }
            }
          });

          // 2. Update master header and footer
          scene.masterHeader.bgColor = palette.headerBg;
          scene.masterHeader.borderColor = palette.headerBorder;
          scene.masterHeader.textColor = palette.headerText;
          scene.masterHeader.badgeBg = palette.badgeBg;
          scene.masterHeader.badgeTextColor = palette.badgeText;

          scene.masterFooter.bgColor = palette.footerBg;
          scene.masterFooter.borderColor = palette.footerBorder;
          scene.masterFooter.textColor = palette.footerText;
          scene.masterFooter.noteColor = palette.footerNote;
        }
      });
      get().recordHistory();
    },

    applyThemeColorsToAllElements: (sceneId: string) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return;
        const palette = resolveThemePalette(scene.theme);

        scene.elements.forEach((el) => {
          el.style.bgColor = palette.cardBg;
          el.style.borderColor = palette.cardBorder;
          el.style.glowColor = palette.cardGlow;
          el.style.bgOpacity = palette.cardBgOpacity;
          el.style.glowIntensity = palette.cardGlowIntensity;
          el.typography.textColor = palette.primaryText;
          el.typography.highlightColor = palette.highlightText;

          if (el.type === 'header_card') {
            el.style.bgColor = palette.headerBg;
            el.style.borderColor = palette.headerBorder;
            el.typography.textColor = palette.headerText;
            if (el.data) {
              el.data.badgeBg = palette.badgeBg;
              el.data.badgeTextColor = palette.badgeText;
            }
          } else if (el.type === 'footer_card') {
            el.style.bgColor = palette.footerBg;
            el.style.borderColor = palette.footerBorder;
            el.typography.textColor = palette.footerText;
            if (el.data) {
              el.data.noteColor = palette.footerNote;
            }
          } else if (el.type === 'subtitle_caption') {
            if (el.data) {
              el.data.accentColor = palette.highlightText;
            }
          }
        });

        scene.masterHeader.bgColor = palette.headerBg;
        scene.masterHeader.borderColor = palette.headerBorder;
        scene.masterHeader.textColor = palette.headerText;
        scene.masterHeader.badgeBg = palette.badgeBg;
        scene.masterHeader.badgeTextColor = palette.badgeText;

        scene.masterFooter.bgColor = palette.footerBg;
        scene.masterFooter.borderColor = palette.footerBorder;
        scene.masterFooter.textColor = palette.footerText;
        scene.masterFooter.noteColor = palette.footerNote;
      });
      get().recordHistory();
    },

    applyColorPresetToScene: (sceneId: string, presetId: string) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return;
        const preset = THEME_COLOR_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        scene.theme.bgPreset = preset.bgPreset;
        scene.theme.customBgColor = preset.bgColor1;
        scene.theme.gradientColor2 = preset.bgColor2;
        scene.theme.gradientAngle = preset.gradientAngle || 135;
        scene.theme.gridColor = preset.gridColor;
        scene.theme.gridOpacity = preset.gridOpacity;

        scene.elements.forEach((el) => {
          el.style.bgColor = preset.cardBg;
          el.style.borderColor = preset.cardBorder;
          el.style.glowColor = preset.cardGlow;
          el.style.bgOpacity = preset.cardBgOpacity;
          el.style.glowIntensity = preset.cardGlowIntensity;
          el.typography.textColor = preset.primaryText;
          el.typography.highlightColor = preset.highlightText;

          if (el.type === 'header_card') {
            el.style.bgColor = preset.headerBg;
            el.style.borderColor = preset.headerBorder;
            el.typography.textColor = preset.headerText;
            if (el.data) {
              el.data.badgeBg = preset.badgeBg;
              el.data.badgeTextColor = preset.badgeText;
            }
          } else if (el.type === 'footer_card') {
            el.style.bgColor = preset.footerBg;
            el.style.borderColor = preset.footerBorder;
            el.typography.textColor = preset.footerText;
            if (el.data) {
              el.data.noteColor = preset.footerNote;
            }
          } else if (el.type === 'subtitle_caption') {
            if (el.data) {
              el.data.accentColor = preset.highlightText;
            }
          }
        });

        scene.masterHeader.bgColor = preset.headerBg;
        scene.masterHeader.borderColor = preset.headerBorder;
        scene.masterHeader.textColor = preset.headerText;
        scene.masterHeader.badgeBg = preset.badgeBg;
        scene.masterHeader.badgeTextColor = preset.badgeText;

        scene.masterFooter.bgColor = preset.footerBg;
        scene.masterFooter.borderColor = preset.footerBorder;
        scene.masterFooter.textColor = preset.footerText;
        scene.masterFooter.noteColor = preset.footerNote;
      });
      get().recordHistory();
    },

    syncSceneElementsWithVoice: (sceneId: string, forceAll = false) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return;
        const { updatedElements } = syncSceneElementsWithVoiceover(scene, forceAll);
        scene.elements = updatedElements;
      });
      get().recordHistory();
    },

    updateMasterHeader: (id, header) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (scene) Object.assign(scene.masterHeader, header);
      });
      get().recordHistory();
    },

    updateMasterFooter: (id, footer) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === id);
        if (scene) Object.assign(scene.masterFooter, footer);
      });
      get().recordHistory();
    },

    applyThemeToAllScenes: (theme, header, footer) => {
      set((state) => {
        state.project.scenes.forEach((scene) => {
          scene.theme = JSON.parse(JSON.stringify(theme));
          scene.masterHeader = JSON.parse(JSON.stringify(header));
          scene.masterFooter = JSON.parse(JSON.stringify(footer));
          const palette = resolveThemePalette(scene.theme);
          scene.elements.forEach((el) => {
            el.style.bgColor = palette.cardBg;
            el.style.borderColor = palette.cardBorder;
            el.style.glowColor = palette.cardGlow;
            el.style.bgOpacity = palette.cardBgOpacity;
            el.typography.textColor = palette.primaryText;
            el.typography.highlightColor = palette.highlightText;

            if (el.type === 'header_card') {
              el.style.bgColor = palette.headerBg;
              el.style.borderColor = palette.headerBorder;
              el.typography.textColor = palette.headerText;
              if (el.data) {
                el.data.badgeBg = palette.badgeBg;
                el.data.badgeTextColor = palette.badgeText;
              }
            } else if (el.type === 'footer_card') {
              el.style.bgColor = palette.footerBg;
              el.style.borderColor = palette.footerBorder;
              el.typography.textColor = palette.footerText;
              if (el.data) {
                el.data.noteColor = palette.footerNote;
              }
            } else if (el.type === 'subtitle_caption') {
              if (el.data) {
                el.data.accentColor = palette.highlightText;
              }
            }
          });
        });
      });
      get().recordHistory();
    },

    // Element management
    addElement: (type, customData, geometryOverride) => {
      const def = getComponentDefaults(type);
      const activeScene = get().project.scenes.find((s) => s.id === get().project.activeSceneId);
      const nextStepOrder = (activeScene?.elements.length || 0) + 1;
      const palette = activeScene ? resolveThemePalette(activeScene.theme) : null;

      // Auto compute default startAtSecond synced with voiceover
      let defaultStartSecond = (nextStepOrder - 1) * 2.5;
      if (activeScene && activeScene.narrationScript?.trim()) {
        const cues = computeVoiceoverCues(activeScene.narrationScript, activeScene.duration);
        if (cues.length >= nextStepOrder) {
          defaultStartSecond = cues[nextStepOrder - 1];
        } else {
          const safeDuration = Math.max(2, activeScene.duration - 1.5);
          defaultStartSecond = Number(((nextStepOrder - 1) / Math.max(1, nextStepOrder)) * safeDuration);
        }
      }

      const initialStyle: ElementStyle = palette
        ? {
            ...JSON.parse(JSON.stringify(def.defaultStyle)),
            bgColor: palette.cardBg,
            borderColor: palette.cardBorder,
            glowColor: palette.cardGlow,
            bgOpacity: palette.cardBgOpacity,
            glowIntensity: palette.cardGlowIntensity
          }
        : JSON.parse(JSON.stringify(def.defaultStyle));

      const initialTypography: Typography = palette
        ? {
            ...JSON.parse(JSON.stringify(def.defaultTypography)),
            textColor: palette.primaryText,
            highlightColor: palette.highlightText
          }
        : JSON.parse(JSON.stringify(def.defaultTypography));

      const defaultVariant = (def as any).defaultLayoutVariant || ((def as any).layoutVariants?.[0]?.id) || undefined;
      const { width: sceneW, height: sceneH } = getSceneDimensions(activeScene?.aspectRatio);
      const defaultGeom = def.defaultGeometry;
      const initialWidth = Math.min(defaultGeom.width, sceneW - 40);

      let initialX = defaultGeom.x;
      let initialY = defaultGeom.y;

      if (type === 'header_card') {
        initialX = Math.round((sceneW - initialWidth) / 2);
        initialY = activeScene?.theme.safeGuard?.enabled ? activeScene.theme.safeGuard.top : 40;
      } else if (type === 'footer_card') {
        initialX = Math.round((sceneW - initialWidth) / 2);
        const bottomMargin = activeScene?.theme.safeGuard?.enabled ? activeScene.theme.safeGuard.bottom : 40;
        initialY = Math.max(0, sceneH - bottomMargin - defaultGeom.height);
      } else {
        // Natural centering horizontally
        initialX = Math.max(20, Math.min(sceneW - initialWidth - 20, Math.round((sceneW - initialWidth) / 2)));
      }

      const newElement: SceneElement = {
        id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type,
        layoutVariant: defaultVariant,
        geometry: {
          ...defaultGeom,
          width: initialWidth,
          x: geometryOverride?.x ?? initialX,
          y: geometryOverride?.y ?? initialY,
          ...geometryOverride
        },
        style: initialStyle,
        typography: initialTypography,
        animation: {
          ...JSON.parse(JSON.stringify(def.defaultAnimation)),
          stepOrder: nextStepOrder,
          startAtSecond: Math.max(0, Number(defaultStartSecond.toFixed(1))),
          syncWithVoice: true
        },
        data: customData ? { ...def.defaultData, ...customData } : JSON.parse(JSON.stringify(def.defaultData)),
        subStyles: {},
        cornerRadius: {
          topLeft: initialStyle.borderRadius ?? 16,
          topRight: initialStyle.borderRadius ?? 16,
          bottomRight: initialStyle.borderRadius ?? 16,
          bottomLeft: initialStyle.borderRadius ?? 16,
          linked: true
        }
      };

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          scene.elements.push(newElement);
          state.selectedElementId = newElement.id;
        }
      });
      get().recordHistory();
    },

    updateElementGeometry: (id, geom) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (!scene || !element) return;

        Object.assign(element.geometry, geom);
        const { width: W, height: H } = getSceneDimensions(scene.aspectRatio);

        // Constrain width and height within canvas boundary
        if (element.geometry.width > W) element.geometry.width = W;
        if (element.geometry.height > H) element.geometry.height = H;

        // Strict containment: card can NEVER be placed outside the frame
        element.geometry.x = Math.max(0, Math.min(Math.max(0, W - element.geometry.width), element.geometry.x));
        element.geometry.y = Math.max(0, Math.min(Math.max(0, H - element.geometry.height), element.geometry.y));
      });
      get().saveToIndexedDb();
    },

    autoFitElementHeight: (id: string, measuredHeight?: number) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (!scene || !element) return;

        const { height: H } = getSceneDimensions(scene.aspectRatio);

        // Accurate vertical chrome: top/bottom padding + top/bottom borders
        const padTop = element.geometry.paddingBox?.top ?? element.style.padding ?? 20;
        const padBottom = element.geometry.paddingBox?.bottom ?? element.style.padding ?? 20;
        const borderTop = element.style.borderWidths?.top ?? element.style.borderWidth ?? 1;
        const borderBottom = element.style.borderWidths?.bottom ?? element.style.borderWidth ?? 1;
        const verticalChrome = padTop + padBottom + borderTop + borderBottom;

        // Accurate horizontal chrome for line-wrapping calculations
        const padLeft = element.geometry.paddingBox?.left ?? element.style.padding ?? 20;
        const padRight = element.geometry.paddingBox?.right ?? element.style.padding ?? 20;
        const borderLeft = element.style.borderWidths?.left ?? element.style.borderWidth ?? 1;
        const borderRight = element.style.borderWidths?.right ?? element.style.borderWidth ?? 1;
        const innerW = Math.max(80, element.geometry.width - padLeft - padRight - borderLeft - borderRight);

        let calculatedMinH = verticalChrome + 80;

        switch (element.type) {
          case 'hero_text': {
            const titleSub = element.subStyles?.title;
            const bodySub = element.subStyles?.body;
            const fontSize = titleSub?.typography?.fontSize ?? element.typography.fontSize ?? 48;
            const lineHeight = titleSub?.typography?.lineHeight ?? element.typography.lineHeight ?? 1.3;
            const rawText = (element.data.text || 'প্রধান শিরোনাম').replace(/[\[\]{}]/g, '');
            const charsPerLine = Math.max(1, Math.floor(innerW / (fontSize * 0.55)));
            const lineCount = Math.max(1, Math.ceil(rawText.length / charsPerLine));
            let textH = Math.round(lineCount * fontSize * lineHeight);

            // Subtitle height if present
            if (
              element.layoutVariant === 'title_with_subtitle' ||
              (element.data.subtitle && element.data.showSubtitle !== false)
            ) {
              const subFontSize =
                bodySub?.typography?.fontSize ?? Math.max(14, Math.round(fontSize * 0.45));
              const subLineHeight = bodySub?.typography?.lineHeight ?? 1.4;
              const rawSub = (element.data.subtitle || '').replace(/[\[\]{}]/g, '');
              const subCharsPerLine = Math.max(1, Math.floor(innerW / (subFontSize * 0.55)));
              const subLineCount = Math.max(1, Math.ceil(rawSub.length / subCharsPerLine));
              const subH = Math.round(subLineCount * subFontSize * subLineHeight);
              textH += subH + 16;
            }

            calculatedMinH = verticalChrome + textH + 20;
            break;
          }
          case 'header_card': {
            const titleSub = element.subStyles?.title;
            const titleFontSize = titleSub?.typography?.fontSize ?? element.typography.fontSize ?? 22;
            calculatedMinH = verticalChrome + Math.max(36, titleFontSize * 1.4);
            break;
          }
          case 'footer_card': {
            const bodySub = element.subStyles?.body;
            const noteFontSize = bodySub?.typography?.fontSize ?? element.typography.fontSize ?? 16;
            const isProgress = element.layoutVariant === 'progress_bar';
            calculatedMinH = verticalChrome + Math.max(30, noteFontSize * 1.4) + (isProgress ? 14 : 0);
            break;
          }
          case 'subtitle_caption': {
            const titleSub = element.subStyles?.title;
            const bodySub = element.subStyles?.body;
            const titleFontSize = titleSub?.typography?.fontSize ?? element.typography.fontSize ?? 22;
            const titleLineHeight = titleSub?.typography?.lineHeight ?? 1.3;
            const bodyFontSize =
              bodySub?.typography?.fontSize ?? Math.max(14, Math.round(titleFontSize * 0.75));
            const bodyLineHeight = bodySub?.typography?.lineHeight ?? 1.5;

            let contentH = 0;
            if (element.data.showBadge !== false && element.data.badge) {
              contentH += 26;
            }
            if (element.data.showTitle !== false && element.data.title) {
              const rawTitle = element.data.title.replace(/[\[\]{}]/g, '');
              const titleChars = Math.max(1, Math.floor(innerW / (titleFontSize * 0.55)));
              const titleLines = Math.max(1, Math.ceil(rawTitle.length / titleChars));
              contentH += Math.round(titleLines * titleFontSize * titleLineHeight) + 8;
            }
            if (element.data.body) {
              const rawBody = element.data.body.replace(/[\[\]{}]/g, '');
              const bodyChars = Math.max(1, Math.floor(innerW / (bodyFontSize * 0.55)));
              const bodyLines = Math.max(1, Math.ceil(rawBody.length / bodyChars));
              contentH += Math.round(bodyLines * bodyFontSize * bodyLineHeight);
            }
            calculatedMinH = verticalChrome + Math.max(50, contentH) + 12;
            break;
          }
          case 'basic_text': {
            const fontSize = element.typography.fontSize ?? 20;
            const lineHeight = element.typography.lineHeight || 1.4;
            const rawText = element.data.text || 'সাধারণ টেক্সট ব্লক';
            const charsPerLine = Math.max(1, Math.floor(innerW / (fontSize * 0.55)));
            const lineCount = Math.max(1, Math.ceil(rawText.length / charsPerLine));
            const textH = Math.round(lineCount * fontSize * lineHeight);
            calculatedMinH = verticalChrome + textH + 16;
            break;
          }
          case 'basic_badge': {
            calculatedMinH = verticalChrome + 32;
            break;
          }
          case 'basic_divider': {
            calculatedMinH = verticalChrome + 12;
            break;
          }
          case 'container_box': {
            const rawChildren = scene.elements.filter(
              (e) => e.parentId === element.id || (Array.isArray(element.data?.childIds) && element.data.childIds.includes(e.id))
            );
            const gap = element.data?.gap ?? 16;
            const variant = element.layoutVariant || 'flex_row';
            if (variant === 'flex_column') {
              const totalH = rawChildren.reduce((acc, c) => acc + c.geometry.height, 0);
              const gapsH = Math.max(0, rawChildren.length - 1) * gap;
              calculatedMinH = verticalChrome + Math.max(60, totalH + gapsH);
            } else if (variant === 'grid_2col') {
              const rows = Math.ceil(rawChildren.length / 2);
              calculatedMinH = verticalChrome + Math.max(80, rows * 120 + Math.max(0, rows - 1) * gap);
            } else if (variant === 'grid_3col') {
              const rows = Math.ceil(rawChildren.length / 3);
              calculatedMinH = verticalChrome + Math.max(80, rows * 120 + Math.max(0, rows - 1) * gap);
            } else {
              const maxChildH = rawChildren.reduce((max, c) => Math.max(max, c.geometry.height), 0);
              calculatedMinH = verticalChrome + Math.max(60, maxChildH);
            }
            break;
          }
          default:
            calculatedMinH = verticalChrome + 120;
        }

        const idealHeight = (typeof measuredHeight === 'number' && measuredHeight > 0)
          ? Math.max(measuredHeight, calculatedMinH)
          : calculatedMinH;

        element.geometry.height = Math.min(H - 40, Math.max(24, Math.round(idealHeight)));
        if (element.geometry.y + element.geometry.height > H - 20) {
          element.geometry.y = Math.max(20, H - element.geometry.height - 20);
        }
      });
      get().recordHistory();
    },

    updateElementStyle: (id, style) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          Object.assign(element.style, style);
        }
      });
      get().recordHistory();
    },

    updateElementTypography: (id, typo) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          Object.assign(element.typography, typo);
        }
      });
      get().recordHistory();
    },

    updateElementAnimation: (id, anim) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          Object.assign(element.animation, anim);
          // When startAtSecond is 0, auto-sync with voice cues; if > 0 and syncWithVoice not specified, mark manual lock
          if (anim.startAtSecond !== undefined) {
            if (anim.startAtSecond === 0) {
              element.animation.syncWithVoice = true;
            } else if (anim.startAtSecond > 0 && anim.syncWithVoice === undefined) {
              element.animation.syncWithVoice = false;
            }
          }
        }
      });
      get().recordHistory();
    },

    updateElementComments: (id, comments) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.comments = comments;
        }
      });
      get().recordHistory();
    },

    updateElementData: (id, data) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.data = data;
        }
      });
      get().recordHistory();
    },

    deleteElement: (id) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          // If deleted element is a container, un-nest all its children
          scene.elements.forEach((e) => {
            if (e.parentId === id) {
              e.parentId = undefined;
            }
          });
          // Also remove from any parent container childIds
          scene.elements.forEach((e) => {
            if (e.type === 'container_box' && Array.isArray(e.data?.childIds)) {
              e.data.childIds = e.data.childIds.filter((cid: string) => cid !== id);
            }
          });
          scene.elements = scene.elements.filter((e) => e.id !== id);
          if (state.selectedElementId === id) {
            state.selectedElementId = scene.elements[0]?.id || null;
          }
        }
      });
      get().recordHistory();
    },

    duplicateElement: (id) => {
      const activeScene = get().project.scenes.find((s) => s.id === get().project.activeSceneId);
      const element = activeScene?.elements.find((e) => e.id === id);
      if (!element) return;

      const duplicated: SceneElement = JSON.parse(JSON.stringify(element));
      duplicated.id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const { width: W, height: H } = getSceneDimensions(activeScene?.aspectRatio);
      duplicated.geometry.x = Math.max(0, Math.min(Math.max(0, W - duplicated.geometry.width), duplicated.geometry.x + 30));
      duplicated.geometry.y = Math.max(0, Math.min(Math.max(0, H - duplicated.geometry.height), duplicated.geometry.y + 30));
      duplicated.parentId = undefined;
      duplicated.animation.stepOrder = (activeScene?.elements.length || 0) + 1;

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          scene.elements.push(duplicated);
          state.selectedElementId = duplicated.id;
        }
      });
      get().recordHistory();
    },

    bringToFront: (id) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          const maxZ = Math.max(...scene.elements.map((e) => e.geometry.zIndex), 10);
          const element = scene.elements.find((e) => e.id === id);
          if (element) element.geometry.zIndex = maxZ + 1;
        }
      });
      get().recordHistory();
    },

    sendToBack: (id) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          const minZ = Math.min(...scene.elements.map((e) => e.geometry.zIndex), 10);
          const element = scene.elements.find((e) => e.id === id);
          if (element) element.geometry.zIndex = Math.max(1, minZ - 1);
        }
      });
      get().recordHistory();
    },

    alignElement: (id, align) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (!scene || !element) return;

        const { width: W, height: H } = getSceneDimensions(scene.aspectRatio);
        const ew = element.geometry.width;
        const eh = element.geometry.height;

        const sg = scene.theme.safeGuard?.enabled
          ? scene.theme.safeGuard
          : { top: 30, right: 30, bottom: 30, left: 30 };

        const headerH = scene.masterHeader.enabled ? scene.masterHeader.height : 0;
        const footerH = scene.masterFooter.enabled ? scene.masterFooter.height : 0;

        const headerMaintain = scene.masterHeader.enabled && (scene.masterHeader.maintainSafeGuard !== false);
        const footerMaintain = scene.masterFooter.enabled && (scene.masterFooter.maintainSafeGuard !== false);

        const safeLeft = sg.left ?? 30;
        const safeRight = sg.right ?? 30;
        const safeTop = headerMaintain
          ? (sg.top ?? 30) + headerH + 20
          : (headerH > 0 ? headerH + 20 : (sg.top ?? 30));
        const safeBottom = footerMaintain
          ? (sg.bottom ?? 30) + footerH + 20
          : (footerH > 0 ? footerH + 20 : (sg.bottom ?? 30));

        const topBoundary = safeTop;
        const bottomBoundary = H - eh - safeBottom;

        switch (align) {
          case 'left':
            element.geometry.x = safeLeft;
            break;
          case 'center-h':
            element.geometry.x = Math.max(0, Math.round((W - ew) / 2));
            break;
          case 'right':
            element.geometry.x = Math.max(safeLeft, W - ew - safeRight);
            break;
          case 'top':
            element.geometry.y = topBoundary;
            break;
          case 'center-v': {
            const usableH = H - headerH - footerH;
            element.geometry.y = Math.max(topBoundary, Math.round(headerH + (usableH - eh) / 2));
            break;
          }
          case 'bottom':
            element.geometry.y = Math.max(topBoundary, bottomBoundary);
            break;
        }

        // Strict frame containment guarantee
        element.geometry.x = Math.max(0, Math.min(Math.max(0, W - ew), element.geometry.x));
        element.geometry.y = Math.max(0, Math.min(Math.max(0, H - eh), element.geometry.y));
      });
      get().recordHistory();
    },

    setElementLayoutVariant: (id, variant) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.layoutVariant = variant;
        }
      });
      get().recordHistory();
    },

    updateElementSubStyle: (id, target, style) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          if (!element.subStyles) element.subStyles = {};
          element.subStyles[target] = {
            ...(element.subStyles[target] || {}),
            ...style
          };
        }
      });
      get().recordHistory();
    },

    clearElementSubStyle: (id, target) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element?.subStyles && element.subStyles[target]) {
          delete element.subStyles[target];
        }
      });
      get().recordHistory();
    },

    updateElementPaddingBox: (id, padding) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.geometry.paddingBox = padding;
          if (padding.linked) {
            element.style.padding = padding.top;
          }
        }
      });
      get().recordHistory();
    },

    updateElementBorderWidths: (id, borderWidths) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          // When linked, normalize all 4 sides to the same value so panel inputs stay in sync
          const normalized = borderWidths.linked
            ? { top: borderWidths.top, right: borderWidths.top, bottom: borderWidths.top, left: borderWidths.top, linked: true }
            : borderWidths;
          element.style.borderWidths = normalized;
          if (normalized.linked) {
            element.style.borderWidth = normalized.top;
          }
        }
      });
      get().recordHistory();
    },

    updateElementMarginBox: (id, margin) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.geometry.marginBox = margin;
        }
      });
      get().recordHistory();
    },

    updateElementCornerRadius: (id, radius) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.cornerRadius = radius;
          if (radius.linked) {
            element.style.borderRadius = radius.topLeft;
          }
        }
      });
      get().recordHistory();
    },

    nestElementInContainer: (elementId, containerId) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (!scene) return;
        const element = scene.elements.find((e) => e.id === elementId);
        const container = scene.elements.find((e) => e.id === containerId);
        if (!element || !container || container.type !== 'container_box') return;

        element.parentId = containerId;
        if (!Array.isArray(container.data.childIds)) {
          container.data.childIds = [];
        }
        if (!container.data.childIds.includes(elementId)) {
          container.data.childIds.push(elementId);
        }
      });
      get().recordHistory();
    },

    detachElementFromContainer: (elementId) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (!scene) return;
        const element = scene.elements.find((e) => e.id === elementId);
        if (!element || !element.parentId) return;

        const parentContainer = scene.elements.find((e) => e.id === element.parentId);
        if (parentContainer && Array.isArray(parentContainer.data?.childIds)) {
          parentContainer.data.childIds = parentContainer.data.childIds.filter((cid: string) => cid !== elementId);
        }
        element.parentId = undefined;
      });
      get().recordHistory();
    },

    reorderContainerChildren: (containerId, newOrder) => {
      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const container = scene?.elements.find((e) => e.id === containerId);
        if (container && container.type === 'container_box') {
          container.data.childIds = newOrder;
        }
      });
      get().recordHistory();
    },

    applyThemePresetToElement: (id, presetKey) => {
      const preset = THEME_COLOR_PRESETS.find((p) => p.id === presetKey);
      if (!preset) return;

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        const element = scene?.elements.find((e) => e.id === id);
        if (element) {
          element.style.bgColor = preset.cardBg;
          element.style.borderColor = preset.cardBorder;
          element.style.glowColor = preset.cardGlow;
          element.style.bgOpacity = preset.cardBgOpacity;
          element.style.glowIntensity = preset.cardGlowIntensity;
          element.typography.textColor = preset.primaryText;
          element.typography.highlightColor = preset.highlightText;
          if (element.data) {
            element.data.highlightColor = preset.highlightText;
          }
        }
      });
      get().recordHistory();
    },

    // Presets
    saveElementAsPreset: (id, name) => {
      const activeScene = get().project.scenes.find((s) => s.id === get().project.activeSceneId);
      const element = activeScene?.elements.find((e) => e.id === id);
      if (!element) return;

      const preset: SavedPreset = {
        id: `preset_${Date.now()}`,
        name: name || `${element.type} Preset`,
        componentType: element.type,
        layoutVariant: element.layoutVariant,
        subStyles: element.subStyles ? JSON.parse(JSON.stringify(element.subStyles)) : {},
        cornerRadius: element.cornerRadius ? JSON.parse(JSON.stringify(element.cornerRadius)) : undefined,
        geometry: { width: element.geometry.width, height: element.geometry.height },
        style: JSON.parse(JSON.stringify(element.style)),
        typography: JSON.parse(JSON.stringify(element.typography)),
        animation: JSON.parse(JSON.stringify(element.animation)),
        data: JSON.parse(JSON.stringify(element.data)),
        createdAt: new Date().toISOString()
      };

      set((state) => {
        state.project.savedPresets.push(preset);
      });
      get().recordHistory();
    },

    applyPreset: (preset) => {
      const newElement: SceneElement = {
        id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: preset.componentType,
        layoutVariant: preset.layoutVariant,
        geometry: {
          x: 400,
          y: 300,
          width: preset.geometry.width || 440,
          height: preset.geometry.height || 260,
          zIndex: 10
        },
        style: JSON.parse(JSON.stringify(preset.style)),
        typography: JSON.parse(JSON.stringify(preset.typography)),
        animation: JSON.parse(JSON.stringify(preset.animation)),
        data: JSON.parse(JSON.stringify(preset.data)),
        subStyles: preset.subStyles ? JSON.parse(JSON.stringify(preset.subStyles)) : {},
        cornerRadius: preset.cornerRadius
          ? JSON.parse(JSON.stringify(preset.cornerRadius))
          : {
              topLeft: preset.style.borderRadius ?? 16,
              topRight: preset.style.borderRadius ?? 16,
              bottomRight: preset.style.borderRadius ?? 16,
              bottomLeft: preset.style.borderRadius ?? 16,
              linked: true
            }
      };

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === state.project.activeSceneId);
        if (scene) {
          scene.elements.push(newElement);
          state.selectedElementId = newElement.id;
        }
      });
      get().recordHistory();
    },

    deletePreset: (presetId) => {
      set((state) => {
        state.project.savedPresets = state.project.savedPresets.filter((p) => p.id !== presetId);
      });
      get().recordHistory();
    },

    // Educational Scene Templates
    applyTemplate: (templateId) => {
      const activeSceneId = get().project.activeSceneId;

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === activeSceneId);
        if (!scene) return;

        if (templateId === 'hardware_anatomy') {
          scene.name = 'Hardware Anatomy Layout';
          scene.elements = [
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
          ];
        } else if (templateId === 'concept_comparison') {
          scene.name = 'Concept Comparison Layout';
          scene.elements = [
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
          ];
        } else if (templateId === 'code_walkthrough') {
          scene.name = 'Code Walkthrough Layout';
          scene.elements = [
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
          ];
        }
      });

      get().recordHistory();
    },

    // Export / Import
    exportProjectJson: () => {
      return JSON.stringify(get().project, null, 2);
    },

    importProjectJson: (json: string) => {
      try {
        const parsed = JSON.parse(json);
        if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
          throw new Error('Invalid VSSS project format');
        }
        set((state) => {
          state.project = parsed;
          state.project.activeSceneId = parsed.scenes[0]?.id || 'scene_1';
          state.selectedElementId = parsed.scenes[0]?.elements[0]?.id || null;
        });
        get().recordHistory();
        return true;
      } catch (err) {
        console.error('Failed to import VSSS project:', err);
        return false;
      }
    }
  }))
);

const BASE_STYLE_COPY: ElementStyle = {
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
  glowIntensity: 8
};

const BASE_TYPO_COPY: Typography = {
  fontFamily: 'Kalpurush',
  fontSize: 22,
  fontWeight: '500',
  lineHeight: 1.4,
  textAlign: 'left',
  textColor: '#f8fafc'
};

const BASE_ANIM_COPY: AnimationChoreography = {
  stepOrder: 1,
  startAtSecond: 0,
  entrance: 'fadeIn',
  duration: 0.8,
  delay: 0,
  easing: 'spring',
  stagger: 0.15,
  emphasis: 'none'
};
