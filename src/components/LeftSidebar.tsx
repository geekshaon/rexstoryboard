import React, { useState } from 'react';
import {
  Palette,
  Component as ComponentIcon,
  LayoutTemplate,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  FileCode2,
  Cpu,
  Bookmark,
  MessageSquare,
  Shield,
  Sliders,
  Clock,
  Maximize2,
  RotateCcw,
  Box
} from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { getAllComponentDefinitions } from '../registry/componentRegistry';
import { GridType, SafeGuardPreset } from '../types/studio';
import { THEME_COLOR_PRESETS } from '../utils/themePalettes';

const SAFEGUARD_PRESETS: Record<SafeGuardPreset, { top: number; right: number; bottom: number; left: number; label: string }> = {
  youtube_video: { top: 60, right: 80, bottom: 80, left: 80, label: 'YouTube 16:9 Title Safe' },
  shorts_tiktok: { top: 160, right: 120, bottom: 240, left: 60, label: 'TikTok / Shorts 9:16 Safe Zone' },
  broadcast: { top: 108, right: 192, bottom: 108, left: 192, label: 'Standard Broadcast 10%' },
  minimal: { top: 40, right: 40, bottom: 40, left: 40, label: 'Minimal Edge 40px' },
  custom: { top: 60, right: 60, bottom: 60, left: 60, label: 'Custom Margins' }
};

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theme' | 'components' | 'templates'>('components');
  const [applyAllSuccess, setApplyAllSuccess] = useState(false);
  const [syncThemeSuccess, setSyncThemeSuccess] = useState(false);
  const [autoSyncComponents, setAutoSyncComponents] = useState(true);
  const [ratioChangeNotice, setRatioChangeNotice] = useState<string | null>(null);
  const [fitSafeGuardSuccess, setFitSafeGuardSuccess] = useState(false);

  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const scene = useStudioStore((s) => s.project.scenes.find((sc) => sc.id === activeSceneId));
  const savedPresets = useStudioStore((s) => s.project.savedPresets);

  const updateSceneTheme = useStudioStore((s) => s.updateSceneTheme);
  const applyThemeColorsToAllElements = useStudioStore((s) => s.applyThemeColorsToAllElements);
  const applyColorPresetToScene = useStudioStore((s) => s.applyColorPresetToScene);
  const updateSceneAspectRatio = useStudioStore((s) => s.updateSceneAspectRatio);
  const updateSceneDuration = useStudioStore((s) => s.updateSceneDuration);
  const toggleSceneAutoDuration = useStudioStore((s) => s.toggleSceneAutoDuration);
  const updateSceneSafeGuard = useStudioStore((s) => s.updateSceneSafeGuard);
  const fitElementsToSafeGuard = useStudioStore((s) => s.fitElementsToSafeGuard);
  const undo = useStudioStore((s) => s.undo);
  const canUndo = useStudioStore((s) => s.historyIndex > 0);
  const updateSceneComments = useStudioStore((s) => s.updateSceneComments);
  const applyThemeToAllScenes = useStudioStore((s) => s.applyThemeToAllScenes);
  const addElement = useStudioStore((s) => s.addElement);
  const applyPreset = useStudioStore((s) => s.applyPreset);
  const deletePreset = useStudioStore((s) => s.deletePreset);
  const applyTemplate = useStudioStore((s) => s.applyTemplate);

  const componentDefs = getAllComponentDefinitions();

  if (!scene) return null;

  const handleApplyToAll = () => {
    applyThemeToAllScenes(scene.theme, scene.masterHeader, scene.masterFooter);
    setApplyAllSuccess(true);
    setTimeout(() => setApplyAllSuccess(false), 2000);
  };

  return (
    <aside className="w-[280px] bg-[#0b0f19] border-r border-slate-800/80 flex flex-col h-full select-none shrink-0 z-30">
      {/* 3 Tab Headers */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === 'components'
              ? 'bg-slate-900 text-cyan-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ComponentIcon className="w-3.5 h-3.5" />
          <span>Components</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === 'theme'
              ? 'bg-slate-900 text-cyan-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Frame</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-slate-900 text-cyan-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>
      </div>

      {/* Tab 1: Scene & Frame Theme */}
      {activeTab === 'theme' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Frame Orientation & Resolution with Mistake Safety */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-bold block">
                Frame Aspect Ratio
              </label>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                {scene.aspectRatio || '16:9'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {[
                { id: '16:9', label: '16:9', desc: '1920x1080' },
                { id: '9:16', label: '9:16', desc: '1080x1920' },
                { id: '1:1', label: '1:1', desc: '1080x1080' }
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => {
                    if (scene.aspectRatio === ratio.id) return;
                    updateSceneAspectRatio(scene.id, ratio.id as any);
                    setRatioChangeNotice(`Adapted layout to ${ratio.id}`);
                    setTimeout(() => setRatioChangeNotice(null), 6000);
                  }}
                  className={`p-1.5 rounded text-center transition-all cursor-pointer ${
                    (scene.aspectRatio || '16:9') === ratio.id
                      ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm ring-1 ring-cyan-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block font-mono text-xs">{ratio.label}</span>
                  <span className="block text-[9px] text-slate-500">{ratio.desc}</span>
                </button>
              ))}
            </div>

            {/* Revert / Mistake Protection Banner */}
            {ratioChangeNotice && (
              <div className="mt-2 p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-between text-[11px] text-cyan-200 animate-fadeIn">
                <span className="truncate">{ratioChangeNotice}</span>
                {canUndo && (
                  <button
                    onClick={() => {
                      undo();
                      setRatioChangeNotice(null);
                    }}
                    className="ml-2 px-2 py-0.5 rounded bg-cyan-900 hover:bg-cyan-850 text-cyan-200 font-semibold border border-cyan-400/50 flex items-center gap-1 cursor-pointer shrink-0 text-[10px]"
                    title="Undo aspect ratio change and restore previous card positions"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Revert</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scene Duration & Voiceover Audio Sync */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Scene Duration & Audio Sync</span>
              </label>
              <button
                onClick={() => toggleSceneAutoDuration(scene.id, !scene.autoDuration)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold border cursor-pointer transition-all ${
                  scene.autoDuration
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Automatically calculate duration from narration voiceover word count"
              >
                {scene.autoDuration ? 'Auto 🎙️' : 'Manual ⏱'}
              </button>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Duration (seconds):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="3"
                    max="180"
                    value={scene.duration}
                    onChange={(e) => updateSceneDuration(scene.id, Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-400 font-mono font-bold text-center outline-none"
                  />
                  <span className="text-slate-500 font-mono">s</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                {scene.autoDuration
                  ? '⚡ Auto-mode active: Scene length is dynamically synced with the voiceover audio script word pacing.'
                  : 'Manual duration mode. Click "Auto" to automatically lock duration to the narration speech rate.'}
              </p>
            </div>
          </div>

          {/* Safe Guard Margins & Guides */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Safe Guard Margins</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scene.theme.safeGuard?.showGuides ?? true}
                    onChange={(e) => updateSceneSafeGuard(scene.id, { showGuides: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 cursor-pointer"
                  />
                  <span>Guides</span>
                </label>
                <input
                  type="checkbox"
                  checked={scene.theme.safeGuard?.enabled ?? true}
                  onChange={(e) => updateSceneSafeGuard(scene.id, { enabled: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 cursor-pointer"
                  title="Enable Safe Guard Margin boundaries"
                />
              </div>
            </div>

            {scene.theme.safeGuard?.enabled && (
              <div className="space-y-2.5 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Preset Profile</label>
                  <select
                    value={scene.theme.safeGuard.preset || 'youtube_video'}
                    onChange={(e) => {
                      const key = e.target.value as SafeGuardPreset;
                      const p = SAFEGUARD_PRESETS[key] || SAFEGUARD_PRESETS.custom;
                      updateSceneSafeGuard(scene.id, {
                        preset: key,
                        top: p.top,
                        right: p.right,
                        bottom: p.bottom,
                        left: p.left
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none text-xs"
                  >
                    <option value="youtube_video">YouTube 16:9 Title Safe (60/80/80/80)</option>
                    <option value="shorts_tiktok">TikTok / Shorts 9:16 Safe (160/120/240/60)</option>
                    <option value="broadcast">Standard Broadcast 10% (108/192/108/192)</option>
                    <option value="minimal">Minimal Padding (40/40/40/40)</option>
                    <option value="custom">Custom Safe Area...</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Top (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      step="10"
                      value={scene.theme.safeGuard.top}
                      onChange={(e) => updateSceneSafeGuard(scene.id, { top: Number(e.target.value), preset: 'custom' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Bottom (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      step="10"
                      value={scene.theme.safeGuard.bottom}
                      onChange={(e) => updateSceneSafeGuard(scene.id, { bottom: Number(e.target.value), preset: 'custom' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Left (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      step="10"
                      value={scene.theme.safeGuard.left}
                      onChange={(e) => updateSceneSafeGuard(scene.id, { left: Number(e.target.value), preset: 'custom' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Right (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      step="10"
                      value={scene.theme.safeGuard.right}
                      onChange={(e) => updateSceneSafeGuard(scene.id, { right: Number(e.target.value), preset: 'custom' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    fitElementsToSafeGuard(scene.id);
                    setFitSafeGuardSuccess(true);
                    setTimeout(() => setFitSafeGuardSuccess(false), 2000);
                  }}
                  className="w-full py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  {fitSafeGuardSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Cards Fitted Inside Safe Guard!</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Fit All Cards Inside Safe Guard</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Background Theme & Color Presets */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold block">
                Frame Theme & Color Presets
              </label>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <input
                  type="checkbox"
                  id="auto-sync-cb"
                  checked={autoSyncComponents}
                  onChange={(e) => setAutoSyncComponents(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 cursor-pointer"
                />
                <label htmlFor="auto-sync-cb" className="cursor-pointer" title="Auto-update all card colors when theme changes">
                  Auto-Sync Cards
                </label>
              </div>
            </div>

            {/* Dropdown for Preset Selection */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Select Color Palette Preset (Dropdown)
              </label>
              <select
                value={
                  THEME_COLOR_PRESETS.some((p) => p.id === scene.theme.bgPreset)
                    ? scene.theme.bgPreset
                    : scene.theme.bgPreset === 'custom'
                      ? 'custom'
                      : 'blueprint'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    updateSceneTheme(scene.id, { bgPreset: 'custom' }, autoSyncComponents);
                  } else {
                    applyColorPresetToScene(scene.id, val);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <optgroup label="Dark Technical / Studio">
                  <option value="blueprint">Dark Technical Blueprint (#0d1117)</option>
                  <option value="slate">Charcoal Slate (#0f172a)</option>
                  <option value="deep_space">Deep Obsidian Space (#090d16)</option>
                </optgroup>
                <optgroup label="Modern Light Studio">
                  <option value="light_studio">Clean Light Studio (#f8fafc)</option>
                  <option value="ivory_paper">Warm Academic Ivory (#fdfbf7)</option>
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
                <optgroup label="Custom Color Picker">
                  <option value="custom">⚙️ Custom User Colors (Pick Hex)...</option>
                </optgroup>
              </select>
            </div>

            {/* Quick 1-Click Tile Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'blueprint', label: 'Dark Blueprint', preview: 'bg-[#0d1117]' },
                { id: 'slate', label: 'Charcoal Slate', preview: 'bg-[#0f172a]' },
                { id: 'deep_space', label: 'Deep Space', preview: 'bg-[#090d16]' },
                { id: 'cyber_neon', label: 'Cyber Neon', preview: 'bg-[#030712] border border-purple-500/50' },
                { id: 'mesh_gradient', label: 'Mesh Gradient', preview: 'bg-gradient-to-tr from-indigo-900 via-sky-900 to-purple-900' },
                { id: 'aurora_mesh', label: 'Aurora Mesh', preview: 'bg-gradient-to-tr from-purple-900 via-emerald-950 to-blue-900' },
                { id: 'light_studio', label: 'Light Studio', preview: 'bg-slate-100 text-slate-800' },
                { id: 'ivory_paper', label: 'Ivory Paper', preview: 'bg-amber-50 text-amber-900' },
                { id: 'custom', label: 'Custom Color', preview: 'bg-slate-800 border-dashed' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (p.id === 'custom') {
                      updateSceneTheme(scene.id, { bgPreset: 'custom' }, autoSyncComponents);
                    } else {
                      applyColorPresetToScene(scene.id, p.id);
                    }
                  }}
                  className={`p-1.5 rounded border text-left flex items-center gap-2 transition-all ${
                    scene.theme.bgPreset === p.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-white font-semibold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 ${p.preview}`} />
                  <span className="truncate text-[11px]">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Controls */}
            <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Custom Palette Fine-Tuning
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-14 shrink-0">Color 1:</span>
                <input
                  type="color"
                  value={scene.theme.customBgColor || '#0d1117'}
                  onChange={(e) =>
                    updateSceneTheme(
                      scene.id,
                      { bgPreset: 'custom', customBgColor: e.target.value },
                      autoSyncComponents
                    )
                  }
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                />
                <input
                  type="text"
                  value={scene.theme.customBgColor || '#0d1117'}
                  onChange={(e) =>
                    updateSceneTheme(
                      scene.id,
                      { bgPreset: 'custom', customBgColor: e.target.value },
                      autoSyncComponents
                    )
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-14 shrink-0">Color 2:</span>
                <input
                  type="color"
                  value={scene.theme.gradientColor2 || '#1e293b'}
                  onChange={(e) =>
                    updateSceneTheme(
                      scene.id,
                      { bgPreset: 'custom', gradientColor2: e.target.value },
                      autoSyncComponents
                    )
                  }
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                />
                <input
                  type="text"
                  value={scene.theme.gradientColor2 || ''}
                  onChange={(e) =>
                    updateSceneTheme(
                      scene.id,
                      { bgPreset: 'custom', gradientColor2: e.target.value },
                      autoSyncComponents
                    )
                  }
                  placeholder="Optional gradient"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              {/* Quick Swatches Row */}
              <div className="pt-1">
                <label className="text-[10px] text-slate-400 block mb-1">Quick Custom Swatches</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { color: '#0d1117', label: 'Navy' },
                    { color: '#0f172a', label: 'Slate' },
                    { color: '#030712', label: 'Black' },
                    { color: '#180509', label: 'Crimson' },
                    { color: '#130826', label: 'Amethyst' },
                    { color: '#022c22', label: 'Forest' },
                    { color: '#f8fafc', label: 'Studio' },
                    { color: '#fdfbf7', label: 'Ivory' }
                  ].map((s) => (
                    <button
                      key={s.color}
                      onClick={() =>
                        updateSceneTheme(
                          scene.id,
                          { bgPreset: 'custom', customBgColor: s.color },
                          autoSyncComponents
                        )
                      }
                      title={s.label}
                      className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition-transform shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sync All Elements Button */}
            <button
              onClick={() => {
                applyThemeColorsToAllElements(scene.id);
                setSyncThemeSuccess(true);
                setTimeout(() => setSyncThemeSuccess(false), 2000);
              }}
              className="w-full py-1.5 px-2.5 rounded bg-cyan-950 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
            >
              {syncThemeSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cards Synchronized to Theme!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sync All Cards to Frame Theme</span>
                </>
              )}
            </button>
          </div>

          {/* Grid Overlay Controls */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-400 font-semibold">Grid Overlay</label>
              <input
                type="checkbox"
                checked={scene.theme.gridEnabled}
                onChange={(e) =>
                  updateSceneTheme(scene.id, { gridEnabled: e.target.checked })
                }
                className="rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
            </div>

            {scene.theme.gridEnabled && (
              <div className="space-y-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Grid Type</label>
                  <select
                    value={scene.theme.gridType}
                    onChange={(e) =>
                      updateSceneTheme(scene.id, { gridType: e.target.value as GridType })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
                  >
                    <option value="line">Line Grid</option>
                    <option value="dot">Dot Matrix</option>
                    <option value="isometric">Isometric</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Grid Size ({scene.theme.gridSize}px)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={scene.theme.gridSize}
                    onChange={(e) =>
                      updateSceneTheme(scene.id, { gridSize: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Opacity ({Math.round(scene.theme.gridOpacity * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.05"
                    value={scene.theme.gridOpacity}
                    onChange={(e) =>
                      updateSceneTheme(scene.id, { gridOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>





          {/* Scene / Frame Review Notes & Comments */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Scene Director Notes</span>
              </label>
              {scene.sceneComments?.trim() ? (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Has comments" />
              ) : null}
            </div>
            <textarea
              rows={3}
              value={scene.sceneComments || ''}
              onChange={(e) => updateSceneComments(scene.id, e.target.value)}
              placeholder="Add director feedback, scene transition ideas, voiceover pacing, or motion guidelines for this frame..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500/60 rounded p-2 text-xs text-slate-200 resize-none outline-none leading-relaxed placeholder:text-slate-600"
            />
            <span className="text-[10px] text-slate-500 block">
              Saved into Remotion/Manim animation prompt specification
            </span>
          </div>

          {/* Apply To All Scenes Button */}
          <div className="pt-2">
            <button
              onClick={handleApplyToAll}
              className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors flex items-center justify-center gap-1.5"
            >
              {applyAllSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Applied to All Scenes!</span>
                </>
              ) : (
                <span>Apply Theme to All Scenes</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Components & Presets (Dual-Tier Architecture) */}
      {activeTab === 'components' && (() => {
        const smartComponents = componentDefs.filter((d) => d.tier === 'smart');
        const atomicComponents = componentDefs.filter((d) => d.tier === 'atomic');
        const selectedId = useStudioStore.getState().selectedElementId;

        return (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Section A: Pre-Built Smart Components */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 🚀 Smart Components (Pre-Built)
                </span>
                <span className="text-[10px] font-mono text-slate-500">{smartComponents.length} Types</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {smartComponents.map((def) => {
                  const Icon = def.icon;
                  const variantCount = def.layoutVariants?.length || 1;
                  return (
                    <button
                      key={def.type}
                      onClick={() => addElement(def.type)}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-cyan-300">
                            {def.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 truncate">
                            {def.category}
                          </span>
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                            {variantCount} Variants
                          </span>
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section B: Layout Container & Basic Atomic Widgets */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" /> 🧱 Layout & Atomic Widgets
                </span>
                <span className="text-[10px] font-mono text-slate-500">Custom Canvas</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {atomicComponents.map((def) => {
                  const Icon = def.icon;
                  return (
                    <button
                      key={def.type}
                      onClick={() => addElement(def.type)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-300 block truncate group-hover:text-amber-300">
                          {def.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {def.type === 'container_box' ? 'Auto-Layout Flex/Grid' : 'Building Block'}
                        </span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section C: Saved Presets Section */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3 text-cyan-400" /> Saved Presets ({savedPresets.length})
                </span>
                {selectedId && (
                  <button
                    onClick={() => {
                      const name = prompt('Enter a name for this custom preset:');
                      if (name && name.trim()) {
                        useStudioStore.getState().saveElementAsPreset(selectedId, name.trim());
                      }
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 cursor-pointer"
                  >
                    + Save Selected
                  </button>
                )}
              </div>

              {savedPresets.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic bg-slate-900/30 p-2.5 rounded border border-slate-800/60 text-center">
                  Select an element on canvas and click "+ Save Selected" to save and reuse it here anytime.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700"
                    >
                      <button
                        onClick={() => applyPreset(preset)}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <span className="text-xs font-medium text-slate-200 block truncate hover:text-cyan-400">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {preset.componentType}
                        </span>
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab 3: Templates */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed mb-1">
            Apply 1-click educational scene layouts to the current canvas:
          </p>

          {[
            {
              id: 'hardware_anatomy',
              title: 'Hardware Anatomy',
              desc: 'Left SVG Diagram + Right Dynamic List + Callout Pointers',
              icon: Cpu,
              accent: 'border-cyan-500/40'
            },
            {
              id: 'concept_comparison',
              title: 'Concept Comparison',
              desc: '2 Side-by-Side Concept Cards + Bottom Summary Card',
              icon: Layers,
              accent: 'border-purple-500/40'
            },
            {
              id: 'code_walkthrough',
              title: 'Code Walkthrough',
              desc: 'Left Code Block + Right Step-by-Step Explained List',
              icon: FileCode2,
              accent: 'border-emerald-500/40'
            }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => applyTemplate(t.id)}
                  className="w-full py-1.5 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  Apply to Scene
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
