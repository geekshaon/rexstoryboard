import React, { useState } from 'react';
import { Download, ArrowLeft, ExternalLink, Sparkles, Layers, Copy, Check, Palette } from 'lucide-react';
import { getAllComponentDefinitions } from '../registry/componentRegistry';
import { SceneElement, SceneTheme, BgPresetType } from '../types/studio';
import {
  generateIndividualComponentHtml,
  downloadIndividualComponentHtml,
  copyIndividualComponentHtml,
  copyComponentRawSnippet,
  copyAllComponentsHtml,
  downloadAllComponentsHtml,
  getThemeBackgroundCss,
  getThemeGridCss
} from '../utils/figmaHtmlExporter';
import { resolveThemePalette, THEME_COLOR_PRESETS } from '../utils/themePalettes';
import { useStudioStore } from '../store/studioStore';

export const FigmaShowcaseView: React.FC = () => {
  const definitions = getAllComponentDefinitions();
  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const activeScene = useStudioStore((s) => s.project.scenes.find((sc) => sc.id === activeSceneId));

  // Default to active scene theme, or blueprint
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    activeScene?.theme?.bgPreset || 'blueprint'
  );
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Construct working SceneTheme based on selected preset
  const selectedThemePreset = THEME_COLOR_PRESETS.find((p) => p.id === selectedPresetId) || THEME_COLOR_PRESETS[0];

  const currentTheme: SceneTheme = {
    bgPreset: selectedThemePreset.bgPreset,
    customBgColor: selectedThemePreset.bgColor1,
    gradientColor2: selectedThemePreset.bgColor2,
    gradientAngle: selectedThemePreset.gradientAngle || 135,
    gridEnabled: true,
    gridType: 'line',
    gridSize: 24,
    gridColor: selectedThemePreset.gridColor,
    gridOpacity: selectedThemePreset.gridOpacity
  };

  const palette = resolveThemePalette(currentTheme);
  const bgCss = getThemeBackgroundCss(currentTheme);
  const gridCss = getThemeGridCss(currentTheme);

  const handleCopyCardHtml = async (element: SceneElement, def: any, cardId: string) => {
    const ok = await copyIndividualComponentHtml(element, def, currentTheme);
    if (ok) {
      setCopiedCardId(cardId);
      setTimeout(() => setCopiedCardId(null), 2000);
    } else {
      downloadIndividualComponentHtml(element, def, currentTheme);
      alert('Clipboard write was restricted by your browser. The component HTML file has been downloaded instead!');
    }
  };

  const handleCopyRawSnippet = async (element: SceneElement, def: any, cardId: string) => {
    const ok = await copyComponentRawSnippet(element, def);
    if (ok) {
      setCopiedSnippetId(cardId);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    }
  };

  const handleCopyAllHtml = async () => {
    const ok = await copyAllComponentsHtml(currentTheme);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } else {
      downloadAllComponentsHtml(currentTheme);
      alert('Clipboard write was restricted by your browser. The components library HTML file has been downloaded instead!');
    }
  };

  const handleDownloadAllHtml = () => {
    downloadAllComponentsHtml(currentTheme);
  };

  return (
    <div
      className="w-screen h-screen overflow-y-auto p-8 select-auto relative transition-colors duration-300"
      style={{
        backgroundColor: palette.bgColor1,
        color: palette.primaryText
      }}
    >
      {/* Dynamic Grid Overlay */}
      {currentTheme.gridEnabled && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            ...(() => {
              if (currentTheme.gridType === 'dot') {
                return {
                  backgroundImage: `radial-gradient(circle, ${currentTheme.gridColor} 1px, transparent 1px)`,
                  backgroundSize: `${currentTheme.gridSize}px ${currentTheme.gridSize}px`,
                  opacity: currentTheme.gridOpacity
                };
              }
              return {
                backgroundImage: `linear-gradient(to right, ${currentTheme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.gridColor} 1px, transparent 1px)`,
                backgroundSize: `${currentTheme.gridSize}px ${currentTheme.gridSize}px`,
                opacity: currentTheme.gridOpacity
              };
            })()
          }}
        />
      )}

      <div className="max-w-[1600px] mx-auto space-y-12 relative z-10">
        {/* Navigation & Toolbar Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Studio</span>
              </a>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-400 font-bold">
                FIGMA LIVE SHOWCASE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: palette.primaryText }}>
              All Components & Variations (Figma Import Bundle)
            </h1>
            <p className="text-xs mt-0.5" style={{ color: palette.secondaryText }}>
              57 rendered variations with active theme colors, Bengali fonts, and native Auto-Layout frame metadata.
            </p>
          </div>

          {/* Theme Selector & Bulk Export Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-md">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-400">Theme:</span>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-cyan-300 outline-none cursor-pointer"
              >
                <optgroup label="Dark Technical / Studio">
                  <option value="blueprint">Dark Technical Blueprint</option>
                  <option value="slate">Charcoal Slate</option>
                  <option value="deep_space">Deep Obsidian Space</option>
                </optgroup>
                <optgroup label="Modern Light Studio">
                  <option value="light_studio">Clean Light Studio</option>
                  <option value="ivory_paper">Warm Academic Ivory</option>
                </optgroup>
                <optgroup label="Vibrant Mesh Gradients">
                  <option value="mesh_gradient">Modern Indigo Mesh</option>
                  <option value="aurora_mesh">Aurora Emerald Matrix</option>
                </optgroup>
                <optgroup label="Specialty Custom Palettes">
                  <option value="cyber_neon">Cyberpunk Neon Matrix</option>
                  <option value="crimson_nightfall">Crimson Nightfall</option>
                  <option value="royal_amethyst">Royal Amethyst</option>
                  <option value="nordic_pine">Nordic Pine & Teal</option>
                  <option value="midnight_sapphire">Midnight Sapphire</option>
                </optgroup>
              </select>
            </div>

            {/* 1-Click Copy All HTML */}
            <button
              onClick={handleCopyAllHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              title="Copy entire 57-component catalog HTML to clipboard"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All to Clipboard!' : 'Copy All HTML (Figma)'}</span>
            </button>

            {/* Download Standalone HTML */}
            <button
              onClick={handleDownloadAllHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Download standalone HTML file with active theme"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download .html</span>
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs shadow-lg">
          <div className="space-y-1.5 flex-1">
            <span className="font-bold text-cyan-300 font-mono flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>How to import into Figma (TopicMentor HTML to Figma / html.to.design):</span>
            </span>
            <div className="text-slate-300 text-[11px] leading-relaxed space-y-1">
              <p>
                1. Click <strong className="text-cyan-300">"Copy HTML"</strong> on any component card below (or click <strong>"Copy All HTML"</strong> in the top header).
              </p>
              <p>
                2. In Figma, open your <strong className="text-white">TopicMentor HTML to Figma</strong> plugin and paste the HTML into <em>"OR PASTE HTML"</em>.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/40 text-amber-200 text-[11px] mt-2">
                <strong className="text-amber-300 font-mono">⚡ IMPORTANT FOR INDIVIDUAL COMPONENTS:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                  <li>
                    The plugin has <strong>VIEWPORT: Portrait (1080×1920)</strong> selected by default, which wraps your component in a 1080×1920 canvas frame.
                  </li>
                  <li>
                    To get <strong className="text-emerald-400">JUST THE COMPONENT</strong> with zero outer frame: In Figma, select the imported frame and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">Ctrl + Shift + G</kbd> (Mac: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">Cmd + Shift + G</kbd>) to <strong>Ungroup</strong>! The outer 1080×1920 frame dissolves instantly, leaving <em>only</em> your component!
                  </li>
                  <li>
                    Alternatively, in the plugin under <strong>VIEWPORT</strong>, click <strong>Custom</strong> and enter the component dimensions shown on the card (e.g. <code>480 × 120</code>).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Grid */}
        {definitions.map((def) => {
          const variants = def.layoutVariants && def.layoutVariants.length > 0
            ? def.layoutVariants
            : [{ id: 'default', label: 'Default Variant', description: '' }];

          return (
            <div key={def.type} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <h2 className="text-lg font-bold tracking-tight font-mono uppercase" style={{ color: palette.primaryText }}>
                    {def.label}
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-bold" style={{ color: palette.secondaryText }}>
                  {variants.length} Variations
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map((v) => {
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

                  const testEl: SceneElement = {
                    id: `showcase_${def.type}_${v.id}`,
                    type: def.type,
                    layoutVariant: v.id === 'default' ? undefined : v.id,
                    geometry: { x: 0, y: 0, width: frameW, height: frameH, zIndex: 10 },
                    style: {
                      ...def.defaultStyle,
                      bgColor: palette.cardBg || def.defaultStyle.bgColor,
                      borderColor: palette.cardBorder || def.defaultStyle.borderColor,
                      glowColor: palette.cardGlow || def.defaultStyle.glowColor
                    },
                    typography: {
                      ...def.defaultTypography,
                      textColor: palette.primaryText || def.defaultTypography.textColor,
                      highlightColor: palette.highlightText || def.defaultTypography.highlightColor
                    },
                    animation: { ...def.defaultAnimation },
                    data: { ...def.defaultData, showPillLabel: true, pillLabel: '' }
                  };

                  return (
                    <div
                      key={v.id}
                      className="p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xl"
                      style={{
                        backgroundColor: palette.cardBg,
                        borderColor: palette.cardBorder
                      }}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold block" style={{ color: palette.highlightText }}>
                            {def.label}
                          </span>
                          <span className="text-sm font-bold" style={{ color: palette.primaryText }}>
                            {v.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-950/70" style={{ color: palette.secondaryText }}>
                          {frameW} × {frameH}px
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-center p-3 rounded-xl border border-slate-800/80 min-h-[100px] overflow-hidden"
                        style={{ backgroundColor: 'rgba(5, 8, 15, 0.6)' }}
                      >
                        <div style={{ width: '100%', maxWidth: `${frameW}px`, minHeight: `${frameH}px` }}>
                          <def.CanvasRenderer element={testEl} isSelected={false} />
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono">
                        <span style={{ color: palette.secondaryText }}>Frame: {def.type} / {v.id}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyCardHtml(testEl, def, `${def.type}_${v.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Copy pure component HTML (no page frames, no grid, transparent background)"
                          >
                            {copiedCardId === `${def.type}_${v.id}` ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            <span>{copiedCardId === `${def.type}_${v.id}` ? 'Copied!' : 'Copy HTML'}</span>
                          </button>
                          <button
                            onClick={() => handleCopyRawSnippet(testEl, def, `${def.type}_${v.id}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-purple-500 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                            title="Copy raw snippet markup (<div> only, no html/body tags)"
                          >
                            {copiedSnippetId === `${def.type}_${v.id}` ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <span className="font-mono text-[9px] font-bold">&lt;/&gt;</span>
                            )}
                            <span>{copiedSnippetId === `${def.type}_${v.id}` ? 'Copied!' : 'Raw'}</span>
                          </button>
                          <button
                            onClick={() => downloadIndividualComponentHtml(testEl, def, currentTheme)}
                            className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Download standalone component .html file"
                          >
                            <Download className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
