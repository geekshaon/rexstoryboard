import { Scene, SceneElement, getSceneDimensions } from '../types/studio';

/**
 * Calculates optimal element height based on content line-wrapping, chrome, and typography.
 */
export function calculateAutoFitHeight(
  element: SceneElement,
  scene: Scene,
  measuredHeight?: number
): void {
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

      // Subtitle height if present (only for title_with_subtitle variant)
      if (
        element.layoutVariant === 'title_with_subtitle' &&
        element.data.subtitle?.trim()
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
    case 'list_card': {
      const items = Array.isArray(element.data?.items) ? element.data.items : [];
      const titleSub = element.subStyles?.title;
      const titleFontSize = titleSub?.typography?.fontSize ?? element.typography.fontSize ?? 22;
      const titleH = element.data?.showTitle !== false ? titleFontSize * 1.6 + 16 : 0;
      const itemGap = element.data?.itemGap ?? 12;
      const variant = element.layoutVariant || 'numbered_steps';
      const perItemH = variant === 'bullet_minimal' ? 28 : variant === 'split_badge_pills' ? 44 : 64;
      calculatedMinH = verticalChrome + titleH + Math.max(40, items.length * perItemH + Math.max(0, items.length - 1) * itemGap);
      break;
    }
    case 'timeline_card': {
      const steps = Array.isArray(element.data?.steps) ? element.data.steps : [];
      const titleSub = element.subStyles?.title;
      const titleFontSize = titleSub?.typography?.fontSize ?? element.typography.fontSize ?? 22;
      const titleH = element.data?.showTitle !== false ? titleFontSize * 1.6 + 16 : 0;
      const variant = element.layoutVariant || 'vertical_spine';
      const isHorizontal = variant === 'horizontal_pipeline' || variant === 'horizontal_cards' || variant === 'chevron_flow';
      if (isHorizontal) {
        calculatedMinH = verticalChrome + titleH + (variant === 'horizontal_cards' ? 180 : 130);
      } else {
        const perStepH = variant === 'vertical_cards' ? 68 : 60;
        calculatedMinH = verticalChrome + titleH + Math.max(60, steps.length * perStepH + 20);
      }
      break;
    }
    case 'number_card': {
      const titleH = element.data?.showTitle !== false ? 36 : 0;
      calculatedMinH = verticalChrome + titleH + 140;
      break;
    }
    case 'data_visual_card': {
      const titleH = element.data?.showTitle !== false ? 38 : 0;
      calculatedMinH = verticalChrome + titleH + 200;
      break;
    }
    case 'button_pill_card': {
      const variant = element.layoutVariant || 'live_pulse_pill';
      if (variant === 'all_pills_showcase') {
        calculatedMinH = verticalChrome + 440;
      } else {
        const hasHeader = element.data?.showPillLabel !== false ? 26 : 0;
        calculatedMinH = verticalChrome + hasHeader + 58;
      }
      break;
    }
    case 'image_media_card': {
      const titleH = element.data?.showTitle !== false ? 38 : 0;
      const capH = element.data?.showCaption !== false && element.data?.caption ? 28 : 0;
      calculatedMinH = verticalChrome + titleH + capH + 240;
      break;
    }
    default:
      calculatedMinH = verticalChrome + 120;
  }

  const idealHeight = (typeof measuredHeight === 'number' && measuredHeight > 0)
    ? measuredHeight
    : calculatedMinH;

  element.geometry.height = Math.min(H - 40, Math.max(24, Math.round(idealHeight)));
  if (element.geometry.y + element.geometry.height > H - 20) {
    element.geometry.y = Math.max(20, H - element.geometry.height - 20);
  }
}

