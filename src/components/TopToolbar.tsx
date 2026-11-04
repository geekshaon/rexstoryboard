import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  Undo2,
  Redo2,
  Maximize2,
  Grid,
  Download,
  FolderOpen,
  Camera,
  ClipboardCopy,
  Copy,
  Sparkles,
  Check,
  Film,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
  Smartphone,
  Monitor,
  Square,
  Play,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { generateSceneSpec } from '../utils/specGenerator';
import { AspectRatioType, getSceneDimensions } from '../types/studio';
import {
  copyFullSceneHtml,
  downloadFullSceneHtml,
  copyAllComponentsHtml,
  downloadAllComponentsHtml,
  copyIndividualComponentHtml,
  generateIndividualComponentHtml,
  downloadIndividualComponentHtml
} from '../utils/figmaHtmlExporter';
import { getComponentDefinition } from '../registry/componentRegistry';
import { resolveThemePalette } from '../utils/themePalettes';

interface TopToolbarProps {
  onOpenFullSpec: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onOpenFullSpec }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const title = useStudioStore((s) => s.project.title);
  const zoomScale = useStudioStore((s) => s.zoomScale);
  const snapGrid = useStudioStore((s) => s.snapGrid);
  const canUndo = useStudioStore((s) => s.historyIndex > 0);
  const canRedo = useStudioStore((s) => s.historyIndex < s.history.length - 1);

  const isLeftSidebarOpen = useStudioStore((s) => s.isLeftSidebarOpen);
  const isRightSidebarOpen = useStudioStore((s) => s.isRightSidebarOpen);
  const isBottomBarOpen = useStudioStore((s) => s.isBottomBarOpen);

  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const activeScene = useStudioStore((s) =>
    s.project.scenes.find((sc) => sc.id === activeSceneId)
  );

  const [showFigmaMenu, setShowFigmaMenu] = useState(false);
  const [copiedSceneHtml, setCopiedSceneHtml] = useState(false);
  const [copiedAllHtml, setCopiedAllHtml] = useState(false);
  const [copiedElementHtml, setCopiedElementHtml] = useState(false);

  const selectedElementId = useStudioStore((s) => s.selectedElementId);
  const selectedElement = activeScene?.elements.find((e) => e.id === selectedElementId);
  const selectedDef = selectedElement ? getComponentDefinition(selectedElement.type) : null;
  const activePalette = activeScene ? resolveThemePalette(activeScene.theme) : null;
  const sceneDimensions = getSceneDimensions(activeScene?.aspectRatio);

  const handleCopySceneHtml = async () => {
    if (!activeScene) return;
    const ok = await copyFullSceneHtml(activeScene);
    if (ok) {
      setCopiedSceneHtml(true);
      setTimeout(() => setCopiedSceneHtml(false), 2500);
    } else {
      downloadFullSceneHtml(activeScene);
      alert('Clipboard write was restricted by your browser. The scene HTML file has been downloaded instead!');
    }
  };

  const handleDownloadSceneHtml = () => {
    if (!activeScene) return;
    downloadFullSceneHtml(activeScene);
  };

  const handleCopyAllComponentsHtml = async () => {
    const ok = await copyAllComponentsHtml(activeScene?.theme);
    if (ok) {
      setCopiedAllHtml(true);
      setTimeout(() => setCopiedAllHtml(false), 2500);
    } else {
      downloadAllComponentsHtml(activeScene?.theme);
      alert('Clipboard write was restricted by your browser. The components HTML file has been downloaded instead!');
    }
  };

  const handleDownloadAllComponentsHtml = () => {
    downloadAllComponentsHtml(activeScene?.theme);
  };

  const handleCopyElementHtml = async () => {
    if (!selectedElement) return;
    const def = getComponentDefinition(selectedElement.type);
    const ok = await copyIndividualComponentHtml(selectedElement, def, activeScene?.theme);
    if (ok) {
      setCopiedElementHtml(true);
      setTimeout(() => setCopiedElementHtml(false), 2500);
    } else {
      downloadIndividualComponentHtml(selectedElement, def, activeScene?.theme);
      alert('Clipboard write was restricted by your browser. The element HTML file has been downloaded instead!');
    }
  };

  const handleDownloadElementHtml = () => {
    if (!selectedElement) return;
    const def = getComponentDefinition(selectedElement.type);
    downloadIndividualComponentHtml(selectedElement, def, activeScene?.theme);
  };

  const setProjectTitle = useStudioStore((s) => s.setProjectTitle);
  const setZoomScale = useStudioStore((s) => s.setZoomScale);
  const zoomIn = useStudioStore((s) => s.zoomIn);
  const zoomOut = useStudioStore((s) => s.zoomOut);
  const setSnapGrid = useStudioStore((s) => s.setSnapGrid);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const toggleLeftSidebar = useStudioStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStudioStore((s) => s.toggleRightSidebar);
  const toggleBottomBar = useStudioStore((s) => s.toggleBottomBar);
  const updateSceneAspectRatio = useStudioStore((s) => s.updateSceneAspectRatio);
  const exportProjectJson = useStudioStore((s) => s.exportProjectJson);
  const importProjectJson = useStudioStore((s) => s.importProjectJson);
  const togglePreviewMode = useStudioStore((s) => s.togglePreviewMode);

  // Cycle snap grid: 20px -> 10px -> 0 (Off)
  const handleCycleSnap = () => {
    if (snapGrid === 20) setSnapGrid(10);
    else if (snapGrid === 10) setSnapGrid(0);
    else setSnapGrid(20);
  };

  // Export scene PNG with exact dynamic aspect ratio resolution (1920x1080 or 1080x1920)
  const handleExportPng = async () => {
    const node = document.getElementById('vsss-artboard-canvas');
    if (!node || !activeScene) return;

    const prevSelectedId = useStudioStore.getState().selectedElementId;

    try {
      setIsExportingPng(true);

      // Deselect element during capture so selection bounding box is completely hidden
      if (prevSelectedId) {
        useStudioStore.getState().setSelectedElementId(null);
        await new Promise((r) => setTimeout(r, 60));
      }

      const sceneName = activeScene.name || 'scene';
      const { width: targetWidth, height: targetHeight } = getSceneDimensions(
        activeScene.aspectRatio
      );

      const dataUrl = await toPng(node, {
        pixelRatio: 1,
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`
        },
        filter: (childNode) => {
          // Hide UI handles, floating badges, and editor safeguard guides
          if (childNode instanceof HTMLElement) {
            if (childNode.classList.contains('vsss-export-hide')) return false;
            if (childNode.classList.contains('vsss-safeguard-guide')) return false;
            if (childNode.getAttribute('data-export-hide') === 'true') return false;
            if (childNode.getAttribute('data-safeguard-guide') === 'true') return false;
            if (childNode.classList.contains('rnd-handle')) return false;
          }
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `${sceneName.replace(/\s+/g, '_')}_${targetWidth}x${targetHeight}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG snapshot:', err);
    } finally {
      if (prevSelectedId) {
        useStudioStore.getState().setSelectedElementId(prevSelectedId);
      }
      setIsExportingPng(false);
    }
  };

  // Copy scene spec to clipboard
  const handleCopySceneSpec = async () => {
    if (!activeScene) return;
    const spec = generateSceneSpec(activeScene, useStudioStore.getState().project.fps);
    await navigator.clipboard.writeText(spec);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Backup .vsss.json file
  const handleSaveJson = () => {
    const jsonStr = exportProjectJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.vsss.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load .vsss.json file
  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProjectJson(content);
      if (!success) {
        alert('Invalid .vsss.json file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentRatio = activeScene?.aspectRatio || '16:9';

  return (
    <header className="h-[52px] bg-[#0b0f19] border-b border-slate-800/80 px-3 flex items-center justify-between gap-2 z-40 select-none shrink-0">
      {/* Zone 1: Panel Toggles, Brand & Project Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Toggle Left Sidebar */}
        <button
          onClick={toggleLeftSidebar}
          title={isLeftSidebarOpen ? 'Hide Left Panel' : 'Show Left Panel'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isLeftSidebarOpen
              ? 'bg-slate-800 border-slate-700 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap hidden sm:inline">
            VSSS
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <input
          type="text"
          value={title}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="bg-slate-900/60 hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-cyan-500/50 rounded px-2 py-1 text-xs font-medium text-slate-200 outline-none w-36 sm:w-48 truncate transition-colors"
          title="Click to rename project"
        />
      </div>

      {/* Zone 2: Viewport Controls, Frame Aspect Ratio, Zoom & History */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio Switcher (16:9 Landscape vs 9:16 Vertical Shorts vs 1:1) */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => activeScene && updateSceneAspectRatio(activeScene.id, '16:9')}
            title="16:9 Landscape (1920x1080 Full HD)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              currentRatio === '16:9'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">16:9</span>
          </button>

          <button
            onClick={() => activeScene && updateSceneAspectRatio(activeScene.id, '9:16')}
            title="9:16 Vertical (1080x1920 Shorts/Reels/TikTok)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              currentRatio === '9:16'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">9:16</span>
          </button>

          <button
            onClick={() => activeScene && updateSceneAspectRatio(activeScene.id, '1:1')}
            title="1:1 Square (1080x1080)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              currentRatio === '1:1'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">1:1</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-25 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-25 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Snap to Grid */}
        <button
          onClick={handleCycleSnap}
          title={`Snap Grid: ${snapGrid > 0 ? `${snapGrid}px` : 'Off'}`}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-medium border transition-colors ${
            snapGrid > 0
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{snapGrid > 0 ? `${snapGrid}px` : 'Off'}</span>
        </button>

        {/* Flexible Zoom Controls with In/Out buttons, slider, and presets */}
        <div className="relative flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
          <button
            onClick={zoomOut}
            title="Zoom Out (Ctrl -)"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Clickable Percentage that toggles fine-grained menu */}
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="px-2 py-1 text-[11px] font-mono text-cyan-400 font-semibold hover:bg-slate-800 rounded transition-colors"
          >
            {Math.round(zoomScale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            title="Zoom In (Ctrl +)"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomScale(0.65, true)}
            title="Fit to Screen"
            className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors ml-0.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Menu Dropdown */}
          {showZoomMenu && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Free Zoom Slider</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(zoomScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.05"
                value={zoomScale}
                onChange={(e) => setZoomScale(Number(e.target.value), false)}
                className="w-full accent-cyan-500 cursor-pointer"
              />

              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1">
                {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setZoomScale(pct, false);
                      setShowZoomMenu(false);
                    }}
                    className={`px-1.5 py-1 rounded text-[10px] font-mono transition-colors ${
                      Math.abs(zoomScale - pct) < 0.02
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {Math.round(pct * 100)}%
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setZoomScale(0.65, true);
                  setShowZoomMenu(false);
                }}
                className="w-full py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-xs text-slate-300 transition-colors"
              >
                Auto-Fit Screen
              </button>
            </div>
          )}
        </div>

        {/* Save / Load .vsss.json */}
        <div className="hidden xl:flex items-center gap-1">
          <button
            onClick={handleSaveJson}
            title="Backup Project (.vsss.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Save .vsss</span>
          </button>

          <label
            title="Load Project (.vsss.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 cursor-pointer transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Load</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vsss.json,application/json"
              onChange={handleLoadJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Zone 3: Primary Actions & Right/Bottom Panel Toggles */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Bottom Bar */}
        <button
          onClick={toggleBottomBar}
          title={isBottomBarOpen ? 'Hide Bottom Strip' : 'Show Bottom Strip'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isBottomBarOpen
              ? 'bg-slate-800 border-slate-700 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isBottomBarOpen ? (
            <PanelBottomClose className="w-4 h-4" />
          ) : (
            <PanelBottomOpen className="w-4 h-4" />
          )}
        </button>

        {/* Toggle Right Inspector */}
        <button
          onClick={toggleRightSidebar}
          title={isRightSidebarOpen ? 'Hide Right Panel' : 'Show Right Panel'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isRightSidebarOpen
              ? 'bg-slate-800 border-slate-700 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isRightSidebarOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Figma HTML Export / Import to Figma Menu */}
        <div className="relative">
          <button
            onClick={() => setShowFigmaMenu(!showFigmaMenu)}
            title="Export HTML for Figma (All Backgrounds, Full Scenes & Components with Active Theme)"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              showFigmaMenu
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Figma Export</span>
            <ChevronDown className="w-3 h-3 text-cyan-400/80" />
          </button>

          {showFigmaMenu && (
            <div
              className="absolute right-0 top-11 w-96 bg-[#0c1222] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl z-50 space-y-3.5 text-slate-200 select-none backdrop-blur-xl animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none">
                      Figma HTML Importer
                    </h3>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Theme: {activePalette?.label || activeScene?.theme.bgPreset}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  html.to.design
                </span>
              </div>

              {/* Option 1: Full Active Scene Frame */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    🎬 Full Scene Frame (Active Scene)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    {sceneDimensions.width} × {sceneDimensions.height}px
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Includes full frame background, grid, title safe margins, and all {activeScene?.elements.length || 0} placed components.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopySceneHtml}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {copiedSceneHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSceneHtml ? 'Copied Scene HTML!' : 'Copy Scene HTML'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSceneHtml}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Download scene .html file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 2: Full 57 Component Variations (Library) */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    📦 All 57 Components & Variations
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
                    Full System
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  All 14 component categories rendered with active theme colors, borders, and Bengali fonts.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyAllComponentsHtml}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {copiedAllHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAllHtml ? 'Copied All Components!' : 'Copy All Components HTML'}</span>
                  </button>
                  <button
                    onClick={handleDownloadAllComponentsHtml}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Download complete library .html file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 3: Selected Component on Canvas (if any) */}
              {selectedElement && selectedDef && (
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 truncate">
                      🎯 Selected: {selectedDef.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedElement.layoutVariant || 'default'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyElementHtml}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedElementHtml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedElementHtml ? 'Copied!' : 'Copy Element HTML'}</span>
                    </button>
                    <button
                      onClick={handleDownloadElementHtml}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Download element .html"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer link to interactive showcase */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <a
                  href="/?view=showcase"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Open Interactive Browser View</span>
                  <span>→</span>
                </a>
                <button
                  onClick={() => setShowFigmaMenu(false)}
                  className="text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Presentation Preview Mode */}
        <button
          onClick={togglePreviewMode}
          title="Preview Presentation Mode (Esc to exit, or P)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Preview</span>
        </button>

        {/* Export Scene PNG */}
        <button
          onClick={handleExportPng}
          disabled={isExportingPng}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">
            {isExportingPng ? 'Exporting...' : 'Export PNG'}
          </span>
        </button>

        {/* Copy Scene Spec */}
        <button
          onClick={handleCopySceneSpec}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
        >
          {copySuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ClipboardCopy className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>{copySuccess ? 'Copied!' : 'Copy Spec'}</span>
        </button>

        {/* Export Full Video Spec Modal Button */}
        <button
          onClick={onOpenFullSpec}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-900/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full Spec</span>
        </button>
      </div>
    </header>
  );
};
