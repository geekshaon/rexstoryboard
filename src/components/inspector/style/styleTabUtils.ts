import { SceneElement, SubPartTarget } from '../../../types/studio';

export const SUBPART_LABELS: Record<SubPartTarget, string> = {
  container: 'Box / Frame',
  badge: 'Badge Pill',
  title: 'Headline / Title',
  body: 'Body Text',
  items: 'Items / Cells',
  accent: 'Highlight Accent'
};

export interface SubPartSupportResult {
  supported: boolean;
  reason?: string;
  actionType?: string;
}

/**
 * Checks whether a sub-part is supported by the element and its active variant / settings.
 */
export function getSubPartSupport(el: SceneElement, part: SubPartTarget): SubPartSupportResult {
  // Hero Text
  if (el.type === 'hero_text' && part === 'body') {
    const variant = el.layoutVariant || 'simple_title_block';
    if (variant === 'simple_title_block') {
      return {
        supported: false,
        reason: 'Simple Title Block variant has no subtitle/body text. Switch to "Title with Subtitle" variant in the Content tab to enable.',
        actionType: 'hero_switch_subtitle'
      };
    }
  }

  // Header Card
  if (el.type === 'header_card') {
    const variant = el.layoutVariant || 'floating_pill';
    if (part === 'body') {
      if (variant === 'minimal_headline') {
        return {
          supported: false,
          reason: 'Minimal Headline variant has no subtitle. Switch to "Floating Pill" or "Top Bar" variant to enable.',
          actionType: 'header_switch_pill'
        };
      }
      if (el.data.showSubtitle === false) {
        return {
          supported: false,
          reason: 'Subtitle is toggled off in the Content tab.',
          actionType: 'header_enable_subtitle'
        };
      }
    }
    if (part === 'badge') {
      if (variant === 'minimal_headline') {
        return {
          supported: false,
          reason: 'Minimal Headline variant has no badge. Switch to "Floating Pill" or "Top Bar" variant to enable.',
          actionType: 'header_switch_pill'
        };
      }
      if (el.data.showBadge === false) {
        return {
          supported: false,
          reason: 'Status badge is toggled off in the Content tab.',
          actionType: 'header_enable_badge'
        };
      }
    }
  }

  // Footer Card
  if (el.type === 'footer_card') {
    if (part === 'badge') {
      if (el.data.showProgress === false) {
        return {
          supported: false,
          reason: 'Progress / Page Tag is toggled off in the Content tab.',
          actionType: 'footer_enable_progress'
        };
      }
    }
  }

  // Subtitle / Caption Card
  if (el.type === 'subtitle_caption') {
    const variant = el.layoutVariant || 'standard_subtitle';
    if (part === 'title') {
      if (el.data.showTitle === false) {
        return {
          supported: false,
          reason: 'Subtitle section headline is toggled off in the Content tab.',
          actionType: 'subtitle_enable_title'
        };
      }
    }
    if (part === 'badge') {
      if (variant === 'callout_quote') {
        return {
          supported: false,
          reason: 'Callout Quote variant has no badge pill. Switch to "Caption Pill" or "Key Takeaway" variant to enable.',
          actionType: 'subtitle_switch_pill'
        };
      }
      if (el.data.showBadge === false) {
        return {
          supported: false,
          reason: 'Badge / Category tag is toggled off in the Content tab.',
          actionType: 'subtitle_enable_badge'
        };
      }
    }
  }

  // List Card
  if (el.type === 'list_card') {
    if (part === 'title' && el.data.showTitle === false) {
      return {
        supported: false,
        reason: 'List title is toggled off in the Content tab.',
        actionType: 'list_enable_title'
      };
    }
  }

  // Timeline Card
  if (el.type === 'timeline_card') {
    if (part === 'title' && el.data.showTitle === false) {
      return {
        supported: false,
        reason: 'Timeline header title is toggled off in the Content tab.',
        actionType: 'timeline_enable_title'
      };
    }
  }

  // Number Card
  if (el.type === 'number_card') {
    if (part === 'title' && el.data.showTitle === false) {
      return {
        supported: false,
        reason: 'Metric headline is toggled off in the Content tab.',
        actionType: 'number_enable_title'
      };
    }
    if (part === 'badge' && el.data.showBadge === false) {
      return {
        supported: false,
        reason: 'Trend badge is toggled off in the Content tab.',
        actionType: 'number_enable_badge'
      };
    }
  }

  // Data Visual Card
  if (el.type === 'data_visual_card') {
    if (part === 'title' && el.data.showTitle === false) {
      return {
        supported: false,
        reason: 'Chart title is toggled off in the Content tab.',
        actionType: 'dataviz_enable_title'
      };
    }
    if (part === 'badge' && el.data.showBadge === false) {
      return {
        supported: false,
        reason: 'Header status tag is toggled off in the Content tab.',
        actionType: 'dataviz_enable_badge'
      };
    }
  }

  // Button & Pill Card
  if (el.type === 'button_pill_card') {
    if (part === 'badge' && el.data.showBadge === false) {
      return {
        supported: false,
        reason: 'Button status badge is toggled off in the Content tab.',
        actionType: 'button_enable_badge'
      };
    }
  }

  // Image & Media Card
  if (el.type === 'image_media_card') {
    if (part === 'title' && el.data.showTitle === false) {
      return {
        supported: false,
        reason: 'Media title is toggled off in the Content tab.',
        actionType: 'imagemedia_enable_title'
      };
    }
    if (part === 'body' && el.data.showCaption === false) {
      return {
        supported: false,
        reason: 'Caption is toggled off in the Content tab.',
        actionType: 'imagemedia_enable_caption'
      };
    }
    if (part === 'badge' && el.data.showBadge === false) {
      return {
        supported: false,
        reason: 'Media badge is toggled off in the Content tab.',
        actionType: 'imagemedia_enable_badge'
      };
    }
  }

  return { supported: true };
}

