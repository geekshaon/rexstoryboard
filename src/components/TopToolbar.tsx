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
  Play
} from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { generateSceneSpec } from '../utils/specGenerator';
import { AspectRatioType, getSceneDimensions } from '../types/studio';

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

    try {
      setIsExportingPng(true);

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
          // Hide UI handles, floating badges, and selection outlines
          if (childNode instanceof HTMLElement) {
            if (childNode.classList.contains('vsss-export-hide')) return false;
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
