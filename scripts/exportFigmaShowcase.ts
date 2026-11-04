import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAllComponentDefinitions } from '../src/registry/componentRegistry';
import { SceneElement } from '../src/types/studio';

console.log('================================================================');
console.log('  GENERATING FIGMA HTML COMPONENT SHOWCASE & IMPORT BUNDLE');
console.log('================================================================\n');

const definitions = getAllComponentDefinitions();
const showcaseItems: Array<{
  category: string;
  componentType: string;
  componentLabel: string;
  variantId: string;
  variantLabel: string;
  html: string;
  width: number;
  height: number;
}> = [];

// Generate static markup for every component and every layout variant
definitions.forEach((def) => {
  const variants = def.layoutVariants && def.layoutVariants.length > 0
    ? def.layoutVariants
    : [{ id: 'default', label: 'Default Variant', description: '' }];

  variants.forEach((v) => {
    // For single pill variants, adjust width/height for clean pill frame
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
      id: `elem_${def.type}_${v.id}`,
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
        bgMode: 'solid',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        bgOpacity: 0.9,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1.5,
        borderRadius: 16
      },
      typography: { ...def.defaultTypography },
      animation: { ...def.defaultAnimation },
      data: {
        ...def.defaultData,
        showPillLabel: true,
        pillLabel: ''
      }
    };

    try {
      const renderedHtml = renderToStaticMarkup(
        React.createElement(def.CanvasRenderer, {
          element: testElement,
          isSelected: false
        })
      );

      showcaseItems.push({
        category: def.category || 'Components',
        componentType: def.type,
        componentLabel: def.label,
        variantId: v.id,
        variantLabel: v.label,
        html: renderedHtml,
        width: frameW,
        height: frameH
      });
      console.log(`  ✓ Rendered [${def.label}] -> ${v.label}`);
    } catch (err: any) {
      console.error(`  ✗ Failed to render [${def.label}] variant [${v.id}]:`, err.message);
    }
  });
});

// Group items by category
const categories: Record<string, typeof showcaseItems> = {};
showcaseItems.forEach((item) => {
  if (!categories[item.category]) {
    categories[item.category] = [];
  }
  categories[item.category].push(item);
});

// Build complete, self-contained HTML page
const htmlDocument = `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>REX Storyboard — All Components & Variations for Figma Import</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Google Fonts: Inter, JetBrains Mono, Bengali Web Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/torifat/js-bangla-fonts@master/kalpurush.css">
  <!-- Tailwind CSS Play CDN for instant standalone styling -->
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
    body {
      background-color: #070a12;
      background-image: 
        radial-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 24px 24px;
      color: #f8fafc;
      font-family: 'Inter', 'Kalpurush', sans-serif;
      margin: 0;
      padding: 40px;
    }
    .figma-frame-card {
      background: rgba(11, 15, 25, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 18px;
      padding: 24px;
      transition: all 0.2s ease;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .figma-frame-card:hover {
      border-color: rgba(56, 189, 248, 0.45);
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
    }
    /* Auto layout friendly container */
    .figma-component-wrapper {
      position: relative;
      box-sizing: border-box;
      margin: 0 auto;
    }
  </style>
</head>
<body class="antialiased">
  <div class="max-w-[1600px] mx-auto space-y-16">
    <!-- Showcase Header -->
    <header class="border-b border-slate-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold mb-3">
          <span>● FIGMA DESIGN SYSTEM EXPORT</span>
          <span>•</span>
          <span>${showcaseItems.length} VARIATIONS</span>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight">
          REX Storyboard Design System Showcase
        </h1>
        <p class="text-slate-400 text-sm mt-1 max-w-2xl">
          Clean HTML & CSS bundle of all smart components, variants, and cyber status badges.
          Import directly into Figma using the <strong class="text-cyan-400 font-mono">html.to.design</strong> or <strong class="text-cyan-400 font-mono">Builder.io</strong> plugin.
        </p>
      </div>

      <!-- Quick Instructions Box -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-1.5 max-w-md shrink-0">
        <div class="font-bold text-cyan-400 font-mono flex items-center gap-1.5">
          <span>⚡ How to Import into Figma:</span>
        </div>
        <ol class="list-decimal list-inside text-slate-300 space-y-1">
          <li>Install the free <strong class="text-white">html.to.design</strong> Figma plugin.</li>
          <li>Drag & drop this <code class="bg-slate-800 px-1 rounded text-cyan-300">.html</code> file directly into the plugin window.</li>
          <li>Or run dev server and enter <code class="bg-slate-800 px-1 rounded text-cyan-300">http://localhost:3000/?view=showcase</code>.</li>
        </ol>
      </div>
    </header>

    <!-- Component Sections by Category -->
    ${Object.entries(categories)
      .map(([catName, items]) => `
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <h2 class="text-xl font-bold tracking-tight text-white uppercase font-mono">${catName}</h2>
          </div>
          <span class="text-xs font-mono text-slate-500 font-bold">${items.length} Variations</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${items
            .map(
              (item) => `
            <div class="figma-frame-card flex flex-col justify-between" data-figma-component="${item.componentType}" data-figma-variant="${item.variantId}">
              <!-- Top Spec Badge -->
              <div class="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-2.5">
                <div>
                  <div class="text-[11px] font-mono text-cyan-400 font-bold tracking-wide">${item.componentLabel}</div>
                  <div class="text-sm font-bold text-white tracking-tight">${item.variantLabel}</div>
                </div>
                <div class="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ${item.width} × ${item.height}px
                </div>
              </div>

              <!-- Rendered Component Canvas Frame -->
              <div class="flex items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-900 min-h-[120px] overflow-hidden">
                <div class="figma-component-wrapper" style="width: 100%; max-width: ${item.width}px; min-height: ${item.height}px;">
                  ${item.html}
                </div>
              </div>

              <!-- Frame Subtitle / Layer ID for Figma naming -->
              <div class="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Frame: ${item.componentType} / ${item.variantId}</span>
                <span class="text-cyan-500/70">Auto-Layout Ready</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `)
      .join('')}

    <!-- Footer -->
    <footer class="pt-8 border-t border-slate-800 text-center text-xs font-mono text-slate-500">
      REX Storyboard Studio • Ready for Figma Component Library & Remotion/Manim Video Pipelines
    </footer>
  </div>
</body>
</html>`;

const outputPath = path.resolve(process.cwd(), 'figma-components-showcase.html');
fs.writeFileSync(outputPath, htmlDocument, 'utf-8');

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'figma-components-showcase.html'), htmlDocument, 'utf-8');

// Also export each individual component as a standalone .html file
const individualExportDir = path.resolve(process.cwd(), 'exported_components');
if (!fs.existsSync(individualExportDir)) {
  fs.mkdirSync(individualExportDir, { recursive: true });
}

showcaseItems.forEach((item) => {
  const compDir = path.join(individualExportDir, item.componentType);
  if (!fs.existsSync(compDir)) {
    fs.mkdirSync(compDir, { recursive: true });
  }

  const individualHtml = `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>${item.componentLabel} — ${item.variantLabel} (Figma Frame)</title>
  <meta name="viewport" content="width=${item.width}, initial-scale=1.0" />
  <meta name="figma-import-mode" content="component" />
  <meta name="figma-component-width" content="${item.width}" />
  <meta name="figma-component-height" content="${item.height}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/torifat/js-bangla-fonts@master/kalpurush.css">
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
    body {
      background: transparent !important;
      background-color: transparent !important;
      color: #f8fafc;
      font-family: 'Inter', 'Kalpurush', sans-serif;
      margin: 0;
      padding: 0;
      width: ${item.width}px;
      position: relative;
      box-sizing: border-box;
    }
    .figma-frame-box {
      width: 100%;
      box-sizing: border-box;
      position: relative;
      background: transparent;
    }
  </style>
</head>
<body>
  <div class="figma-frame-box" data-figma-component="${item.componentType}" data-figma-variant="${item.variantId}" data-figma-name="${item.componentLabel} - ${item.variantLabel}">
    ${item.html}
  </div>
</body>
</html>`;

  const fileName = `${item.variantId}.html`.toLowerCase();
  fs.writeFileSync(path.join(compDir, fileName), individualHtml, 'utf-8');
});

console.log(`\n================================================================`);
console.log(`  SUCCESSFULLY EXPORTED ${showcaseItems.length} COMPONENT VARIATIONS!`);
console.log(`  Combined Showcase: ${outputPath}`);
console.log(`  Individual Files:  ${individualExportDir}/<component>/<variant>.html`);
console.log(`  Static server route: public/figma-components-showcase.html`);
console.log('================================================================\n');
