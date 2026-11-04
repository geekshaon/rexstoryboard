import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Scene, SceneElement, SceneTheme, getSceneDimensions } from '../types/studio';
import { ComponentDefinition, getComponentDefinition, getAllComponentDefinitions } from '../registry/componentRegistry';
import { resolveThemePalette, ThemeColorPreset } from './themePalettes';

/**
 * Computes exact CSS background styling for a given scene theme
 */
export function getThemeBackgroundCss(theme?: SceneTheme): string {
  if (!theme) return 'background-color: #0d1117;';
  switch (theme.bgPreset) {
    case 'slate':
      return 'background-color: #0f172a;';
    case 'deep_space':
      return 'background-color: #090d16;';
    case 'cyber_neon':
      return 'background-color: #030712; background-image: radial-gradient(circle at 50% 15%, #2e1065 0%, #030712 70%);';
    case 'mesh_gradient':
      return 'background-color: #030712; background-image: radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 55%), radial-gradient(at 100% 0%, #0369a1 0px, transparent 50%), radial-gradient(at 100% 100%, #172554 0px, transparent 55%), radial-gradient(at 0% 100%, #3b0764 0px, transparent 50%);';
    case 'aurora_mesh':
      return 'background-color: #020617; background-image: radial-gradient(at 20% 15%, #4c1d95 0px, transparent 50%), radial-gradient(at 85% 85%, #064e3b 0px, transparent 50%), radial-gradient(at 85% 20%, #1e3a8a 0px, transparent 50%), radial-gradient(at 20% 85%, #701a75 0px, transparent 50%);';
    case 'light_studio':
      return 'background-color: #f8fafc; background-image: linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%);';
    case 'ivory_paper':
      return 'background-color: #faf8f5; background-image: linear-gradient(145deg, #faf8f5 0%, #f4efe6 50%, #eae2d5 100%);';
    case 'custom':
      if (theme.gradientColor2) {
        return `background-image: linear-gradient(${theme.gradientAngle || 135}deg, ${theme.customBgColor || '#0d1117'}, ${theme.gradientColor2});`;
      }
      return `background-color: ${theme.customBgColor || '#0d1117'};`;
    case 'blueprint':
    default:
      return 'background-color: #0d1117;';
  }
}

/**
 * Computes exact CSS grid overlay styling for a given scene theme
 */
export function getThemeGridCss(theme?: SceneTheme): string {
  if (!theme || !theme.gridEnabled) return '';
  const isLight = theme.bgPreset === 'light_studio' || theme.bgPreset === 'ivory_paper';
  const size = theme.gridSize || 20;
  const color = theme.gridColor || (isLight ? 'rgba(71, 85, 105, 0.18)' : 'rgba(56, 189, 248, 0.15)');
  const opacity = theme.gridOpacity ?? (isLight ? 0.25 : 0.15);

  if (theme.gridType === 'dot') {
    return `background-image: radial-gradient(circle, ${color} 1px, transparent 1px); background-size: ${size}px ${size}px; opacity: ${opacity};`;
  }
  if (theme.gridType === 'isometric') {
    return `background-image: linear-gradient(30deg, ${color} 1px, transparent 1px), linear-gradient(-30deg, ${color} 1px, transparent 1px); background-size: ${size * 1.5}px ${size}px; opacity: ${opacity};`;
  }
  return `background-image: linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px); background-size: ${size}px ${size}px; opacity: ${opacity};`;
}

/**
 * Common HTML head with Google Fonts, Bengali typography, Tailwind Play CDN, and CSS variables
 */
function getHtmlHead(title: string, palette?: ThemeColorPreset, theme?: SceneTheme): string {
  const isLight = palette?.isLight ?? false;
  return `  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Google Fonts: Inter, JetBrains Mono, Hind Siliguri, Noto Sans Bengali -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/torifat/js-bangla-fonts@master/kalpurush.css">
  <!-- Tailwind CSS Play CDN for instant styling in Figma imports -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            kalpurush: ['Kalpurush', 'Hind Siliguri', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --theme-bg: ${palette?.bgColor1 || '#0d1117'};
      --theme-card-bg: ${palette?.cardBg || '#0f172a'};
      --theme-card-border: ${palette?.cardBorder || 'rgba(56, 189, 248, 0.4)'};
      --theme-card-glow: ${palette?.cardGlow || '#38bdf8'};
      --theme-primary-text: ${palette?.primaryText || '#f8fafc'};
      --theme-secondary-text: ${palette?.secondaryText || '#94a3b8'};
      --theme-accent: ${palette?.highlightText || '#38bdf8'};
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Kalpurush', 'Hind Siliguri', sans-serif;
      color: ${palette?.primaryText || '#f8fafc'};
      background-color: ${palette?.bgColor1 || '#070a12'};
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    .figma-scene-frame {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    .figma-grid-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .figma-component-wrapper {
      position: relative;
      box-sizing: border-box;
    }
  </style>`;
}

/**
 * Generates full, production-ready HTML for the entire Active Scene:
 * Frame dimensions (e.g. 1920x1080), exact background preset/gradient,
 * grid overlay, master header, master footer, and all scene elements
 * positioned at their exact canvas coordinates.
 */
export function generateFullSceneHtml(scene: Scene): string {
  const { width: canvasW, height: canvasH } = getSceneDimensions(scene.aspectRatio);
  const palette = resolveThemePalette(scene.theme);
  const bgCss = getThemeBackgroundCss(scene.theme);
  const gridCss = getThemeGridCss(scene.theme);

  // Render Master Header if enabled
  let masterHeaderMarkup = '';
  if (scene.masterHeader?.enabled) {
    const mh = scene.masterHeader;
    const isFloating = mh.layoutMode === 'floating';
    const maintainSafe = mh.maintainSafeGuard !== false && scene.theme.safeGuard?.enabled;
    const safeTop = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.top : (isFloating ? 24 : 0);
    const safeLeft = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.left : (isFloating ? 32 : 0);
    const safeRight = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.right : (isFloating ? 32 : 0);
    const headerWidth = canvasW - safeLeft - safeRight;
    const headerRadius = mh.borderRadius ?? (isFloating ? 16 : 0);

    masterHeaderMarkup = `
    <!-- Figma Node: Master Header -->
    <header
      id="vsss-master-header"
      data-figma-component="master_header"
      data-figma-name="Master Header (${mh.title || 'Header'})"
      class="figma-header-frame"
      style="position: absolute; top: ${safeTop}px; left: ${safeLeft}px; width: ${headerWidth}px; height: ${mh.height}px; background-color: ${mh.bgColor || palette.headerBg}; border: 1px solid ${mh.borderColor || palette.headerBorder}; border-radius: ${headerRadius}px; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 0 ${mh.paddingX || 32}px; backdrop-filter: blur(${mh.blur || 12}px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);"
    >
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: ${mh.titleFontSize || 22}px; font-weight: 800; color: ${mh.textColor || palette.headerText}; letter-spacing: -0.02em;">
          ${mh.title || 'TopicMentor Storyboard'}
        </span>
        ${mh.showSubtitle !== false && mh.subtitle ? `
          <div style="width: 1px; height: 16px; background-color: rgba(148, 163, 184, 0.3); margin: 0 4px;"></div>
          <span style="font-size: 13px; font-weight: 500; color: ${palette.secondaryText};">${mh.subtitle}</span>
        ` : ''}
      </div>
      ${mh.showBadge !== false && mh.badge ? `
        <div style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; background-color: ${mh.badgeBg || palette.badgeBg}; color: ${mh.badgeTextColor || palette.badgeText}; border: 1px solid rgba(56, 189, 248, 0.3);">
          ${mh.badge}
        </div>
      ` : ''}
    </header>`;
  }

  // Render Master Footer if enabled
  let masterFooterMarkup = '';
  if (scene.masterFooter?.enabled) {
    const mf = scene.masterFooter;
    const isFloating = mf.layoutMode === 'floating';
    const maintainSafe = mf.maintainSafeGuard !== false && scene.theme.safeGuard?.enabled;
    const safeBottom = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.bottom : (isFloating ? 24 : 0);
    const safeLeft = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.left : (isFloating ? 32 : 0);
    const safeRight = maintainSafe && scene.theme.safeGuard ? scene.theme.safeGuard.right : (isFloating ? 32 : 0);
    const footerWidth = canvasW - safeLeft - safeRight;
    const footerRadius = mf.borderRadius ?? (isFloating ? 16 : 0);

    masterFooterMarkup = `
    <!-- Figma Node: Master Footer -->
    <footer
      id="vsss-master-footer"
      data-figma-component="master_footer"
      data-figma-name="Master Footer"
      class="figma-footer-frame"
      style="position: absolute; bottom: ${safeBottom}px; left: ${safeLeft}px; width: ${footerWidth}px; height: ${mf.height}px; background-color: ${mf.bgColor || palette.footerBg}; border: 1px solid ${mf.borderColor || palette.footerBorder}; border-radius: ${footerRadius}px; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 0 ${mf.paddingX || 32}px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);"
    >
      <span style="font-size: ${mf.noteFontSize || 12}px; color: ${mf.textColor || palette.secondaryText}; font-weight: 500;">
        ${mf.note || 'Generated by Rex Storyboard Studio'}
      </span>
      ${mf.showProgress !== false && mf.progress ? `
        <span style="font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: ${mf.noteColor || palette.highlightText};">
          ${mf.progress}
        </span>
      ` : ''}
    </footer>`;
  }

  // Render Elements
  const topLevelElements = scene.elements.filter((e) => !e.parentId);
  const elementsMarkup = topLevelElements
    .map((el) => {
      const def = getComponentDefinition(el.type);
      let markup = '';
      try {
        markup = renderToStaticMarkup(
          React.createElement(def.CanvasRenderer, {
            element: el,
            isSelected: false
          })
        );
      } catch (err: any) {
        markup = `<div style="padding: 12px; color: #ef4444; font-size: 11px;">Error rendering ${el.type}: ${err.message}</div>`;
      }

      const title = `${def.label} — ${el.layoutVariant || 'Standard'}`;

      return `
    <!-- Figma Component Node: ${def.label} (${el.layoutVariant || 'default'}) -->
    <div
      id="${el.id}"
      data-figma-id="${el.id}"
      data-figma-component="${el.type}"
      data-figma-variant="${el.layoutVariant || 'default'}"
      data-figma-name="${title}"
      class="figma-component-wrapper"
      style="position: absolute; left: ${el.geometry.x}px; top: ${el.geometry.y}px; width: ${el.geometry.width}px; height: ${el.geometry.height}px; z-index: ${el.geometry.zIndex}; box-sizing: border-box;"
    >
      ${markup}
    </div>`;
    })
    .join('\n');

  const sceneTitle = `${scene.name || 'Scene'} (${scene.aspectRatio || '16:9'} • ${canvasW}x${canvasH})`;

  return `<!doctype html>
<html lang="en" class="${palette.isLight ? 'light' : 'dark'}">
<head>
${getHtmlHead(sceneTitle, palette, scene.theme)}
</head>
<body
  id="vsss-artboard-canvas"
  data-figma-frame="scene"
  data-figma-name="${sceneTitle}"
  class="figma-scene-frame"
  style="margin: 0; padding: 0; width: ${canvasW}px; height: ${canvasH}px; min-width: ${canvasW}px; min-height: ${canvasH}px; max-width: ${canvasW}px; max-height: ${canvasH}px; position: relative; overflow: hidden; box-sizing: border-box; ${bgCss}"
>
  <!-- Background Grid Pattern -->
  ${scene.theme.gridEnabled ? `<div class="figma-grid-layer" style="${gridCss}"></div>` : ''}

  ${masterHeaderMarkup}
  ${elementsMarkup}
  ${masterFooterMarkup}
</body>
</html>`;
}

/**
 * Generates a complete, self-contained HTML document for an individual component,
 * fully styled with Tailwind CSS, Google Web Fonts, and active theme backdrop/grid,
 * ready for 1-click import into Figma (via html.to.design or Builder.io).
 */
/**
 * Generates a clean, pure HTML document containing ONLY the component itself.
 * 100% transparent background, ZERO page frames, ZERO grid overlays, ZERO extra wrappers.
 * Imports directly into Figma as a standalone component without unwanted borders or container frames.
 */
export function generateIndividualComponentHtml(
  element: SceneElement,
  def?: ComponentDefinition | null,
  _theme?: SceneTheme
): string {
  const componentDef = def || getComponentDefinition(element.type);
  const width = Math.max(120, Math.round(element.geometry?.width || componentDef.defaultGeometry.width));
  const height = Math.max(40, Math.round(element.geometry?.height || componentDef.defaultGeometry.height));

  let componentMarkup = '';
  try {
    componentMarkup = renderToStaticMarkup(
      React.createElement(componentDef.CanvasRenderer, {
        element,
        isSelected: false
      })
    );
  } catch (err: any) {
    componentMarkup = `<div style="padding: 20px; color: red;">Failed to render: ${err.message}</div>`;
  }

  const title = `${componentDef.label} — ${element.layoutVariant || 'Standard'}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <!-- Component Dimensions: ${width}x${height}px -->
  <meta name="viewport" content="width=${width}, initial-scale=1.0" />
  <meta name="figma-import-mode" content="component" />
  <meta name="figma-component-width" content="${width}" />
  <meta name="figma-component-height" content="${height}" />
  <!-- Google Fonts: Inter, JetBrains Mono, Hind Siliguri, Noto Sans Bengali -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/torifat/js-bangla-fonts@master/kalpurush.css">
  <!-- Tailwind CSS Play CDN for instant styling in Figma imports -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            kalpurush: ['Kalpurush', 'Hind Siliguri', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    html, body {
      width: ${width}px !important;
      max-width: ${width}px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      box-sizing: border-box;
      overflow: visible !important;
      -webkit-font-smoothing: antialiased;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
  </style>
</head>
<body
  data-figma-component="${element.type}"
  data-figma-variant="${element.layoutVariant || 'default'}"
  data-figma-name="${title}"
  style="margin: 0 !important; padding: 0 !important; width: ${width}px !important; max-width: ${width}px !important; background: transparent !important; background-color: transparent !important; overflow: visible !important;"
>
  <!-- Figma Component: ${title} (${width}x${height}px) -->
  <div
    data-figma-component="${element.type}"
    data-figma-variant="${element.layoutVariant || 'default'}"
    data-figma-name="${title}"
    style="position: relative; width: ${width}px; max-width: ${width}px; box-sizing: border-box; background: transparent;"
  >
    ${componentMarkup}
  </div>
</body>
</html>`;
}

/**
 * Generates raw, unadorned HTML snippet for direct pasting without <html> or <body> tags
 */
export function generateComponentRawSnippet(
  element: SceneElement,
  def?: ComponentDefinition | null
): string {
  const componentDef = def || getComponentDefinition(element.type);
  const width = Math.max(120, Math.round(element.geometry?.width || componentDef.defaultGeometry.width));
  let componentMarkup = '';
  try {
    componentMarkup = renderToStaticMarkup(
      React.createElement(componentDef.CanvasRenderer, {
        element,
        isSelected: false
      })
    );
  } catch (err: any) {
    componentMarkup = `<div style="padding: 20px; color: red;">Failed to render: ${err.message}</div>`;
  }
  const title = `${componentDef.label} — ${element.layoutVariant || 'Standard'}`;
  return `<div data-figma-component="${element.type}" data-figma-variant="${element.layoutVariant || 'default'}" data-figma-name="${title}" style="position: relative; width: ${width}px; box-sizing: border-box;">\n${componentMarkup}\n</div>`;
}

/**
 * Generates the complete HTML showcase containing all 14 component categories
 * and all 57 variations.
 * TRANSPARENT background, NO extra page frames, NO grid overlays, NO outer card frames or header labels.
 * Each component is output directly as a native standalone component!
 */
export function generateAllComponentsShowcaseHtml(theme?: SceneTheme): string {
  const definitions = getAllComponentDefinitions();
  const palette = theme ? resolveThemePalette(theme) : undefined;

  // Group definitions by category
  const categories: Record<string, ComponentDefinition[]> = {};
  definitions.forEach((def) => {
    const cat = def.category || 'General';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(def);
  });

  let sectionsHtml = '';

  for (const [catName, defs] of Object.entries(categories)) {
    let cardsInCatHtml = '';

    for (const def of defs) {
      const variants = def.layoutVariants && def.layoutVariants.length > 0
        ? def.layoutVariants
        : [{ id: 'default', label: 'Default Variant', description: '' }];

      for (const v of variants) {
        let frameW = def.defaultGeometry.width;
        let frameH = def.defaultGeometry.height;

        if (def.type === 'button_pill_card') {
          if (v.id === 'all_pills_showcase') {
            frameW = 880;
            frameH = 680;
          } else {
            frameW = 440;
            frameH = 120;
          }
        }

        const testElement: SceneElement = {
          id: `showcase_${def.type}_${v.id}`,
          type: def.type,
          layoutVariant: v.id === 'default' ? undefined : v.id,
          geometry: {
            x: 0,
            y: 0,
            width: frameW,
            height: frameH,
            zIndex: 10
          },
          style: {
            ...def.defaultStyle,
            bgColor: palette?.cardBg || def.defaultStyle.bgColor,
            borderColor: palette?.cardBorder || def.defaultStyle.borderColor,
            glowColor: palette?.cardGlow || def.defaultStyle.glowColor
          },
          typography: {
            ...def.defaultTypography,
            textColor: palette?.primaryText || def.defaultTypography.textColor,
            highlightColor: palette?.highlightText || def.defaultTypography.highlightColor
          },
          animation: { ...def.defaultAnimation },
          data: {
            ...def.defaultData,
            showPillLabel: true,
            pillLabel: ''
          }
        };

        let rendered = '';
        try {
          rendered = renderToStaticMarkup(
            React.createElement(def.CanvasRenderer, {
              element: testElement,
              isSelected: false
            })
          );
        } catch (err: any) {
          rendered = `<div style="padding: 12px; color: red;">Failed to render: ${err.message}</div>`;
        }

        cardsInCatHtml += `
        <!-- Figma Component: ${def.label} - ${v.label} -->
        <div
          data-figma-component="${def.type}"
          data-figma-variant="${v.id}"
          data-figma-name="${def.label} — ${v.label}"
          style="position: relative; width: ${frameW}px; max-width: 100%; box-sizing: border-box;"
        >
          ${rendered}
        </div>`;
      }
    }

    sectionsHtml += `
    <!-- Figma Section: ${catName} -->
    <section data-figma-section="${catName}" style="margin-bottom: 48px; display: flex; flex-wrap: wrap; gap: 32px; align-items: start;">
      ${cardsInCatHtml}
    </section>`;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>All Storyboard Components (Figma Import)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Google & Bengali Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/torifat/js-bangla-fonts@master/kalpurush.css">
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            kalpurush: ['Kalpurush', 'Hind Siliguri', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
  </style>
</head>
<body style="margin: 0 !important; padding: 40px !important; background: transparent !important; background-color: transparent !important;">
  <div style="position: relative; z-index: 1;">
    ${sectionsHtml}
  </div>
</body>
</html>`;
}

/**
 * Multi-layer ultra-reliable clipboard copying function.
 * 1. Tries modern Clipboard API with dual MIME types ('text/html' and 'text/plain')
 *    so Figma & plugins immediately detect rich HTML.
 * 2. Tries standard navigator.clipboard.writeText.
 * 3. Tries legacy document.execCommand('copy') with invisible textarea.
 * Returns true if succeeded, false if browser blocked all methods.
 */
export async function copyHtmlToClipboard(html: string): Promise<boolean> {
  // Method 1: Modern ClipboardItem with dual MIME types (rich text/html + text/plain)
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof window !== 'undefined' &&
    typeof window.ClipboardItem !== 'undefined'
  ) {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const textBlob = new Blob([html], { type: 'text/plain;charset=utf-8' });
      const item = new window.ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      // Fall through to writeText
    }
  }

  // Method 2: Standard navigator.clipboard.writeText
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(html);
      return true;
    } catch {
      // Fall through to execCommand
    }
  }

  // Method 3: Legacy document.execCommand('copy') with textarea
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = html;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.zIndex = '-9999';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (err) {
      console.warn('execCommand copy failed:', err);
    }
  }

  return false;
}

/**
 * Triggers clipboard copy of the full active scene HTML
 */
export async function copyFullSceneHtml(scene: Scene): Promise<boolean> {
  const html = generateFullSceneHtml(scene);
  return await copyHtmlToClipboard(html);
}

/**
 * Triggers browser download of the full active scene HTML file
 */
export function downloadFullSceneHtml(scene: Scene): void {
  const html = generateFullSceneHtml(scene);
  const sceneName = (scene.name || 'scene').replace(/\s+/g, '_').toLowerCase();
  const filename = `${sceneName}_${scene.aspectRatio || '16x9'}_figma.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clipboard copy of the entire 57-component showcase HTML with active theme
 */
export async function copyAllComponentsHtml(theme?: SceneTheme): Promise<boolean> {
  const html = generateAllComponentsShowcaseHtml(theme);
  return await copyHtmlToClipboard(html);
}

/**
 * Triggers clipboard copy of individual component HTML
 */
export async function copyIndividualComponentHtml(
  element: SceneElement,
  def?: ComponentDefinition | null,
  theme?: SceneTheme
): Promise<boolean> {
  const html = generateIndividualComponentHtml(element, def, theme);
  return await copyHtmlToClipboard(html);
}

/**
 * Triggers clipboard copy of raw component HTML snippet (no <html> or <body> tags)
 */
export async function copyComponentRawSnippet(
  element: SceneElement,
  def?: ComponentDefinition | null
): Promise<boolean> {
  const html = generateComponentRawSnippet(element, def);
  return await copyHtmlToClipboard(html);
}

/**
 * Triggers browser download of the entire 57-component showcase HTML file with active theme
 */
export function downloadAllComponentsHtml(theme?: SceneTheme): void {
  const html = generateAllComponentsShowcaseHtml(theme);
  const themeName = (theme?.bgPreset || 'active_theme').toLowerCase();
  const filename = `figma_components_library_${themeName}.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser download of the individual component HTML file
 */
export function downloadIndividualComponentHtml(
  element: SceneElement,
  def?: ComponentDefinition | null,
  theme?: SceneTheme
): void {
  const html = generateIndividualComponentHtml(element, def, theme);
  const filename = `${element.type}_${element.layoutVariant || 'default'}.html`.toLowerCase();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
