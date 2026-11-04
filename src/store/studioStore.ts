import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
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
import { INITIAL_PROJECT, EDUCATIONAL_TEMPLATES } from './initialData';
import { transformSceneAspectRatio } from './aspectRatioTransform';
import { calculateAutoFitHeight } from './autoFitHeight';
import { debouncedSaveToDb, loadFromDb, migrateLegacyScene } from './persistence';

export { INITIAL_PROJECT };

export interface StudioState {
  project: ProjectData;
  selectedElementId: string | null;
  zoomScale: number;
  panOffset: { x: number; y: number };
  isAutoFit: boolean;
  isPreviewMode: boolean;
  snapGrid: 20 | 10 | 0;
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
      const saved = await loadFromDb();
      if (saved && saved.scenes && saved.scenes.length > 0) {
        saved.scenes.forEach((sc) => migrateLegacyScene(sc));
        set((state) => {
          state.project = saved;
          state.history = [saved];
          state.historyIndex = 0;
          state.selectedElementId = saved.scenes[0]?.elements[0]?.id || null;
          state.isInitialized = true;
        });
        return;
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
      if (scenes.length <= 1) return;

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
        transformSceneAspectRatio(scene, newRatio);
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

        const headerMaintain = scene.masterHeader.enabled && (scene.masterHeader.maintainSafeGuard !== false);
        const headerTopOffset = headerMaintain
          ? sg.top + scene.masterHeader.height + 20
          : (scene.masterHeader.enabled ? scene.masterHeader.height + 20 : sg.top);

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

        if (element.geometry.width > W) element.geometry.width = W;
        if (element.geometry.height > H) element.geometry.height = H;

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

        calculateAutoFitHeight(element, scene, measuredHeight);
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
          scene.elements.forEach((e) => {
            if (e.parentId === id) {
              e.parentId = undefined;
            }
          });
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
      const tpl = EDUCATIONAL_TEMPLATES[templateId];
      if (!tpl) return;

      set((state) => {
        const scene = state.project.scenes.find((s) => s.id === activeSceneId);
        if (!scene) return;

        scene.name = tpl.name;
        scene.elements = JSON.parse(JSON.stringify(tpl.elements));
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
