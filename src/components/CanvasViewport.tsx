import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  Sparkles,
  Copy,
  Trash2,
  Hand,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { getComponentDefinition } from '../registry/componentRegistry';
import { SceneElement, getSceneDimensions } from '../types/studio';
import { ElementErrorBoundary } from './ElementErrorBoundary';
import { measureDomElementHeight } from '../utils/domMeasurement';

export const CanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const scenes = useStudioStore((s) => s.project.scenes);
  const scene = scenes.find((sc) => sc.id === activeSceneId);
  const selectedElementId = useStudioStore((s) => s.selectedElementId);
  const zoomScale = useStudioStore((s) => s.zoomScale);
  const panOffset = useStudioStore((s) => s.panOffset);
  const isAutoFit = useStudioStore((s) => s.isAutoFit);
  const isPreviewMode = useStudioStore((s) => s.isPreviewMode);
  const snapGrid = useStudioStore((s) => s.snapGrid);

  const setZoomScale = useStudioStore((s) => s.setZoomScale);
  const setPanOffset = useStudioStore((s) => s.setPanOffset);
  const resetPan = useStudioStore((s) => s.resetPan);
  const setPreviewMode = useStudioStore((s) => s.setPreviewMode);
  const togglePreviewMode = useStudioStore((s) => s.togglePreviewMode);
  const setSelectedElementId = useStudioStore((s) => s.setSelectedElementId);
  const updateElementGeometry = useStudioStore((s) => s.updateElementGeometry);
  const recordHistory = useStudioStore((s) => s.recordHistory);
  const deleteElement = useStudioStore((s) => s.deleteElement);
  const duplicateElement = useStudioStore((s) => s.duplicateElement);
  const setActiveScene = useStudioStore((s) => s.setActiveScene);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);

  // Pan interaction states
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);

  const panDragRef = useRef<{
    isDown: boolean;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    currentX: number;
    currentY: number;
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    currentX: 0,
    currentY: 0
  });

  // Dynamic canvas dimensions based on aspect ratio (16:9 Landscape 1920x1080, 9:16 Vertical 1080x1920, 1:1 Square 1080x1080)
  const { width: artboardWidth, height: artboardHeight } = getSceneDimensions(scene?.aspectRatio);
  const currentSceneIndex = scenes.findIndex((sc) => sc.id === activeSceneId);

  // Auto-fit calculation
  const calculateAutoFit = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Available space with 48px padding around artboard
    const availableW = clientWidth - 56;
    const availableH = clientHeight - 56;

    const scaleX = availableW / artboardWidth;
    const scaleY = availableH / artboardHeight;
    const fitScale = Math.min(scaleX, scaleY);
    // Round to 3 decimals
    const rounded = Math.round(fitScale * 1000) / 1000;
    setZoomScale(Math.max(0.18, Math.min(1.5, rounded)), true);
  }, [artboardWidth, artboardHeight, setZoomScale]);

  // Window & panel resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (useStudioStore.getState().isAutoFit) {
        calculateAutoFit();
      }
    });
    ro.observe(containerRef.current);
    calculateAutoFit();
    return () => ro.disconnect();
  }, [calculateAutoFit]);

  // Re-fit on aspect ratio change if in auto-fit mode
  useEffect(() => {
    if (isAutoFit) {
      calculateAutoFit();
    }
  }, [scene?.aspectRatio, calculateAutoFit, isAutoFit]);

  // Specific-Point Zoom & Wheel Frame Movement (GPU accelerated with rAF batching)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelRaf: number | null = null;
    let pendingPan = { x: 0, y: 0 };
    let hasPendingPan = false;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Specific point zoom towards mouse cursor position
        const containerRect = container.getBoundingClientRect();
        const screenX = e.clientX - containerRect.left;
        const screenY = e.clientY - containerRect.top;
        const cx = screenX - containerRect.width / 2;
        const cy = screenY - containerRect.height / 2;

        const currentScale = useStudioStore.getState().zoomScale;
        const currentPan = useStudioStore.getState().panOffset;

        // Smooth zoom step
        const delta = -e.deltaY;
        const factor = Math.exp(delta * 0.002);
        const rawNewScale = currentScale * factor;
        const newScale = Math.max(0.15, Math.min(2.5, Math.round(rawNewScale * 100) / 100));

        if (newScale !== currentScale) {
          const scaleRatio = newScale / currentScale;
          const newPanX = Math.round((cx - (cx - currentPan.x) * scaleRatio) * 10) / 10;
          const newPanY = Math.round((cy - (cy - currentPan.y) * scaleRatio) * 10) / 10;

          // Direct DOM transform for zero visual delay
          if (artboardRef.current) {
            artboardRef.current.style.transform = `translate3d(${newPanX}px, ${newPanY}px, 0px) scale(${newScale})`;
          }

          if (wheelRaf) cancelAnimationFrame(wheelRaf);
          wheelRaf = requestAnimationFrame(() => {
            setZoomScale(newScale, false);
            setPanOffset({ x: newPanX, y: newPanY });
          });
        }
      } else {
        // Full frame horizontal and vertical movement via scroll/trackpad
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
        const deltaY = e.shiftKey ? 0 : e.deltaY;

        if (!hasPendingPan) {
          const currentPan = useStudioStore.getState().panOffset;
          pendingPan = { x: currentPan.x, y: currentPan.y };
          hasPendingPan = true;
        }

        pendingPan.x = Math.round(pendingPan.x - deltaX);
        pendingPan.y = Math.round(pendingPan.y - deltaY);

        // Direct DOM transform for zero visual delay
        if (artboardRef.current) {
          const s = useStudioStore.getState().zoomScale;
          artboardRef.current.style.transform = `translate3d(${pendingPan.x}px, ${pendingPan.y}px, 0px) scale(${s})`;
        }

        if (wheelRaf) cancelAnimationFrame(wheelRaf);
        wheelRaf = requestAnimationFrame(() => {
          setPanOffset({ x: pendingPan.x, y: pendingPan.y });
          hasPendingPan = false;
        });
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
    };
  }, [setZoomScale, setPanOffset]);

  // Pan drag listeners (Direct DOM transform during drag for buttery smooth 120fps, rAF store sync on up)
  useEffect(() => {
    let mouseRaf: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panDragRef.current.isDown) return;
      const dx = e.clientX - panDragRef.current.startX;
      const dy = e.clientY - panDragRef.current.startY;
      const curX = Math.round(panDragRef.current.initialPanX + dx);
      const curY = Math.round(panDragRef.current.initialPanY + dy);
      panDragRef.current.currentX = curX;
      panDragRef.current.currentY = curY;

      // Direct GPU transform update on the DOM node — ZERO React re-render overhead during drag!
      if (artboardRef.current) {
        const s = useStudioStore.getState().zoomScale;
        artboardRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0px) scale(${s})`;
      }
    };

    const handleMouseUp = () => {
      if (panDragRef.current.isDown) {
        panDragRef.current.isDown = false;
        setIsDraggingPan(false);
        // Commit final resting position to store once dragging ends
        setPanOffset({
          x: panDragRef.current.currentX,
          y: panDragRef.current.currentY
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mouseRaf) cancelAnimationFrame(mouseRaf);
    };
  }, [setPanOffset]);

  // Spacebar and keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Spacebar hold for pan hand tool
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      // Preview mode toggle: Ctrl+P or P
      if ((e.key.toLowerCase() === 'p' && (e.ctrlKey || e.metaKey)) || (e.key === 'p' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        togglePreviewMode();
        return;
      }

      // Escape key exits preview or deselects
      if (e.key === 'Escape') {
        e.preventDefault();
        if (useStudioStore.getState().isPreviewMode) {
          setPreviewMode(false);
        } else {
          setSelectedElementId(null);
        }
        return;
      }

      // Preview mode arrow navigation between scenes
      if (useStudioStore.getState().isPreviewMode) {
        if (e.key === 'ArrowLeft' && currentSceneIndex > 0) {
          e.preventDefault();
          setActiveScene(scenes[currentSceneIndex - 1].id);
          return;
        }
        if (e.key === 'ArrowRight' && currentSceneIndex < scenes.length - 1) {
          e.preventDefault();
          setActiveScene(scenes[currentSceneIndex + 1].id);
          return;
        }
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      const selId = useStudioStore.getState().selectedElementId;
      if (!selId) return;

      // Duplicate: Ctrl+D / Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateElement(selId);
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteElement(selId);
        return;
      }

      // Arrow keys movement for selected element
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const currentScene = useStudioStore
          .getState()
          .project.scenes.find((s) => s.id === useStudioStore.getState().project.activeSceneId);
        const el = currentScene?.elements.find((item) => item.id === selId);
        if (!el) return;

        let { x, y } = el.geometry;
        if (e.key === 'ArrowLeft') x -= delta;
        if (e.key === 'ArrowRight') x += delta;
        if (e.key === 'ArrowUp') y -= delta;
        if (e.key === 'ArrowDown') y += delta;

        updateElementGeometry(selId, { x, y });
        recordHistory();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    deleteElement,
    duplicateElement,
    updateElementGeometry,
    recordHistory,
    undo,
    redo,
    togglePreviewMode,
    setPreviewMode,
    setSelectedElementId,
    currentSceneIndex,
    scenes,
    setActiveScene
  ]);

  if (!scene) return null;

  // Background style computation with new modern trend presets
  const getCanvasBackgroundStyle = (): React.CSSProperties => {
    switch (scene.theme.bgPreset) {
      case 'slate':
        return { backgroundColor: '#0f172a' };
      case 'deep_space':
        return { backgroundColor: '#090d16' };
      case 'cyber_neon':
        return {
          backgroundColor: '#030712',
          backgroundImage: 'radial-gradient(circle at 50% 15%, #2e1065 0%, #030712 70%)'
        };
      case 'mesh_gradient':
        return {
          backgroundColor: '#030712',
          backgroundImage: `
            radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 55%),
            radial-gradient(at 100% 0%, #0369a1 0px, transparent 50%),
            radial-gradient(at 100% 100%, #172554 0px, transparent 55%),
            radial-gradient(at 0% 100%, #3b0764 0px, transparent 50%)
          `
        };
      case 'aurora_mesh':
        return {
          backgroundColor: '#020617',
          backgroundImage: `
            radial-gradient(at 20% 15%, #4c1d95 0px, transparent 50%),
            radial-gradient(at 85% 85%, #064e3b 0px, transparent 50%),
            radial-gradient(at 85% 20%, #1e3a8a 0px, transparent 50%),
            radial-gradient(at 20% 85%, #701a75 0px, transparent 50%)
          `
        };
      case 'light_studio':
        return {
          backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)'
        };
      case 'ivory_paper':
        return {
          backgroundColor: '#faf8f5',
          backgroundImage: 'linear-gradient(145deg, #faf8f5 0%, #f4efe6 50%, #eae2d5 100%)'
        };
      case 'custom':
        if (scene.theme.gradientColor2) {
          return {
            backgroundImage: `linear-gradient(${scene.theme.gradientAngle || 135}deg, ${scene.theme.customBgColor || '#0d1117'}, ${scene.theme.gradientColor2})`
          };
        }
        return { backgroundColor: scene.theme.customBgColor || '#0d1117' };
      case 'blueprint':
      default:
        return { backgroundColor: '#0d1117' };
    }
  };

  const isLightPreset = scene.theme.bgPreset === 'light_studio' || scene.theme.bgPreset === 'ivory_paper';

  // Grid style computation
  const getGridStyle = (): React.CSSProperties => {
    if (!scene.theme.gridEnabled || isPreviewMode) return {};
    const size = scene.theme.gridSize || 20;
    const color = scene.theme.gridColor || (isLightPreset ? 'rgba(71, 85, 105, 0.18)' : 'rgba(56, 189, 248, 0.15)');
    const opacity = scene.theme.gridOpacity ?? (isLightPreset ? 0.25 : 0.15);

    if (scene.theme.gridType === 'dot') {
      return {
        backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity
      };
    }
    if (scene.theme.gridType === 'isometric') {
      return {
        backgroundImage: `
          linear-gradient(30deg, ${color} 1px, transparent 1px),
          linear-gradient(-30deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size * 1.5}px ${size}px`,
        opacity
      };
    }
    // Standard line grid
    return {
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${size}px ${size}px`,
      opacity
    };
  };

  const gridStep = snapGrid > 0 ? snapGrid : 1;

  // Viewport container mousedown (handles middle-click and space-drag)
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    const isMiddleClick = e.button === 1;
    const isSpacePan = e.button === 0 && isSpacePressed;
    const isHandPan = e.button === 0 && isHandToolActive;
    const isDirectBackground = e.button === 0 && (e.target === containerRef.current || (e.target as HTMLElement).id === 'vsss-artboard-canvas');

    if (isMiddleClick || isSpacePan || isHandPan || isDirectBackground) {
      if (isMiddleClick || isSpacePan || isHandPan) {
        e.preventDefault();
      }
      panDragRef.current = {
        isDown: true,
        startX: e.clientX,
        startY: e.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
        currentX: panOffset.x,
        currentY: panOffset.y
      };
      setIsDraggingPan(true);
    }
  };

  // Cursor calculation
  const getContainerCursor = () => {
    if (isDraggingPan) return 'grabbing';
    if (isSpacePressed || isHandToolActive) return 'grab';
    return 'default';
  };

  // Counter-scale for UI elements so they render at crisp native size
  const uiCounterScale = Math.min(3.5, Math.max(0.6, 1 / zoomScale));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      style={{ cursor: getContainerCursor() }}
      className="flex-1 w-full h-full bg-[#05080f] overflow-hidden relative flex items-center justify-center p-4"
      onClick={(e) => {
        // Deselect if clicking directly on background wrapper (and not dragging)
        if (!isDraggingPan && (e.target === containerRef.current || (e.target as HTMLElement).id === 'vsss-artboard-canvas')) {
          setSelectedElementId(null);
        }
      }}
    >
      {/* Floating Preview Mode Controller HUD */}
      {isPreviewMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl select-none">
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-red-950/80 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-xs font-semibold cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Preview (Esc)</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">
              Scene {currentSceneIndex + 1} / {scenes.length}:
            </span>
            <span className="font-bold text-white max-w-[200px] truncate">
              {scene.name || 'Untitled Scene'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1">
            <button
              disabled={currentSceneIndex <= 0}
              onClick={() => currentSceneIndex > 0 && setActiveScene(scenes[currentSceneIndex - 1].id)}
              title="Previous Scene (←)"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentSceneIndex >= scenes.length - 1}
              onClick={() => currentSceneIndex < scenes.length - 1 && setActiveScene(scenes[currentSceneIndex + 1].id)}
              title="Next Scene (→)"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400 font-semibold">
            {scene.aspectRatio}
          </span>
        </div>
      )}

      {/* Floating Canvas Navigation / Hand Tool Widget (Editor Mode) */}
      {!isPreviewMode && (
        <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md text-xs select-none">
          <button
            onClick={() => setIsHandToolActive(!isHandToolActive)}
            title={isHandToolActive ? 'Hand Tool Active (Click canvas to pan)' : 'Hand Tool (or hold Space to pan)'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isHandToolActive || isSpacePressed
                ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/40'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              calculateAutoFit();
              resetPan();
            }}
            title="Fit Frame to Screen & Reset Pan (Center)"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 border border-slate-700/40 cursor-pointer transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              onClick={resetPan}
              title="Reset Pan Offset to Center (0, 0)"
              className="px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 text-[10px] font-mono text-slate-400 hover:text-cyan-300 border border-slate-700/40 cursor-pointer"
            >
              Pan: {panOffset.x},{panOffset.y}
            </button>
          )}

          <span className="hidden md:inline text-[10px] text-slate-500 font-mono px-1">
            Space+Drag to Pan • Ctrl+Scroll to Zoom
          </span>
        </div>
      )}

      {/* Interactive Artboard Container (1920x1080 Landscape, 1080x1920 Vertical, or 1080x1080 Square) */}
      <div
        id="vsss-artboard-canvas"
        ref={artboardRef}
        className="relative shrink-0 shadow-2xl select-none"
        style={{
          width: `${artboardWidth}px`,
          height: `${artboardHeight}px`,
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${zoomScale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          ...getCanvasBackgroundStyle(),
          boxShadow: isLightPreset
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Grid Overlay Layer */}
        {scene.theme.gridEnabled && !isPreviewMode && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={getGridStyle()}
          />
        )}

        {/* Safeguard / Title Safe Area Guides (Hidden in Preview & PNG Export) */}
        {!isPreviewMode && scene.theme.safeGuard?.enabled && scene.theme.safeGuard?.showGuides && (
          <div
            className="vsss-export-hide vsss-safeguard-guide absolute pointer-events-none z-20 border-2 border-dashed border-cyan-400/40 rounded-sm"
            data-export-hide="true"
            data-safeguard-guide="true"
            style={{
              top: `${scene.theme.safeGuard.top}px`,
              left: `${scene.theme.safeGuard.left}px`,
              right: `${scene.theme.safeGuard.right}px`,
              bottom: `${scene.theme.safeGuard.bottom}px`,
              backgroundColor: 'rgba(6, 182, 212, 0.02)'
            }}
          >
            {/* Guide Corner & Label Badges */}
            <div className="absolute top-1 left-2 flex items-center gap-1.5 bg-slate-950/80 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>TITLE SAFE ZONE ({scene.theme.safeGuard.top}px / {scene.theme.safeGuard.right}px / {scene.theme.safeGuard.bottom}px / {scene.theme.safeGuard.left}px)</span>
            </div>
            {/* 4 Corner Markers */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
          </div>
        )}

        {/* Scene Interactive Elements (Top-level elements without parent container) */}
        {scene.elements
          .filter((element: SceneElement) => !element.parentId)
          .map((element: SceneElement) => {
            const isSelected = selectedElementId === element.id;
            const def = getComponentDefinition(element.type);
            const Renderer = def.CanvasRenderer;
            const isNearTop = element.geometry.y < 85;

            return (
              <Rnd
                key={element.id}
                size={{
                  width: element.geometry.width,
                  height: element.geometry.height
                }}
                position={{
                  x: element.geometry.x,
                  y: element.geometry.y
                }}
                scale={zoomScale}
                dragGrid={[gridStep, gridStep]}
                resizeGrid={[gridStep, gridStep]}
                bounds="#vsss-artboard-canvas"
                disableDragging={isPreviewMode}
                enableResizing={isPreviewMode ? false : {
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: true,
                  topLeft: true
                }}
                onDragStart={() => {
                  if (!isPreviewMode) {
                    setSelectedElementId(element.id);
                  }
                }}
                onDragStop={(_, d) => {
                  updateElementGeometry(element.id, { x: d.x, y: d.y });
                  recordHistory();
                }}
                onResizeStop={(_, __, ref, ___, position) => {
                  updateElementGeometry(element.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position
                  });
                  recordHistory();
                }}
                className={`group ${isSelected && !isPreviewMode ? 'vsss-rnd-selected' : isPreviewMode ? '' : 'hover:outline hover:outline-1 hover:outline-cyan-500/40'}`}
                style={{
                  zIndex: element.geometry.zIndex,
                  cursor: isPreviewMode ? 'default' : 'move'
                }}
                resizeHandleClasses={{
                  top: 'rnd-handle-edge-h',
                  bottom: 'rnd-handle-edge-h',
                  left: 'rnd-handle-edge-v',
                  right: 'rnd-handle-edge-v',
                  topLeft: 'rnd-handle',
                  topRight: 'rnd-handle',
                  bottomLeft: 'rnd-handle',
                  bottomRight: 'rnd-handle'
                }}
              >
                {/* Element Wrapper Container */}
                <div
                  className="w-full h-full relative"
                  data-element-id={element.id}
                  data-element-type={element.type}
                  onClick={(e) => {
                    if (!isPreviewMode) {
                      e.stopPropagation();
                      setSelectedElementId(element.id);
                    }
                  }}
                >
                  {/* Element Component Specific Render wrapped in ErrorBoundary */}
                  <ElementErrorBoundary elementId={element.id} elementType={element.type}>
                    <Renderer element={element} isSelected={isSelected && !isPreviewMode} />
                  </ElementErrorBoundary>
                </div>

                {/* Clean Minimal Quick Menu: Auto Height, Copy, Delete */}
                {isSelected && !isPreviewMode && (
                  <div
                    className="vsss-export-hide absolute z-50 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl whitespace-nowrap select-none"
                    style={{
                      transform: `scale(${uiCounterScale})`,
                      transformOrigin: isNearTop ? 'top left' : 'bottom left',
                      [isNearTop ? 'top' : 'bottom']: 'calc(100% + 12px)',
                      left: 0
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 1. Auto Height */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const measured = measureDomElementHeight(element.id);
                        useStudioStore.getState().autoFitElementHeight(element.id, measured);
                      }}
                      title="Auto-fit card height to content"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Height</span>
                    </button>

                    <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

                    {/* 2. Copy (Duplicate) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElement(element.id);
                      }}
                      title="Duplicate Element (Ctrl+D)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    {/* 3. Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      title="Delete Element (Delete)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </Rnd>
            );
          })}
      </div>
    </div>
  );
};
