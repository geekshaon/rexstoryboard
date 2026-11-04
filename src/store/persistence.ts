import { get as idbGet, set as idbSet } from 'idb-keyval';
import { ProjectData, Scene } from '../types/studio';

export const DB_STORAGE_KEY = 'vsss_project_state_v1';

let saveDbTimer: ReturnType<typeof setTimeout> | null = null;

export const debouncedSaveToDb = (project: ProjectData): void => {
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

export const loadFromDb = async (): Promise<ProjectData | undefined> => {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return undefined;
  try {
    return (await idbGet(DB_STORAGE_KEY)) as ProjectData | undefined;
  } catch (err) {
    console.warn('Could not load from IndexedDB, using default project.', err);
    return undefined;
  }
};

/**
 * Migrates older scenes to modern first-class header/footer card components
 * and ensures safe-guard defaults are present.
 */
export function migrateLegacyScene(sc: Scene): void {
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
}

