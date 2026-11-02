/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PanelLeftOpen, PanelRightOpen, PanelBottomOpen } from 'lucide-react';
import { useStudioStore } from './store/studioStore';
import { TopToolbar } from './components/TopToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasViewport } from './components/CanvasViewport';
import { RightSidebar } from './components/RightSidebar';
import { BottomBar } from './components/BottomBar';
import { FullSpecModal } from './components/FullSpecModal';

export default function App() {
  const [isFullSpecModalOpen, setIsFullSpecModalOpen] = useState(false);
  const initialize = useStudioStore((s) => s.initialize);
  const isInitialized = useStudioStore((s) => s.isInitialized);
  const isPreviewMode = useStudioStore((s) => s.isPreviewMode);

  const isLeftSidebarOpen = useStudioStore((s) => s.isLeftSidebarOpen);
  const isRightSidebarOpen = useStudioStore((s) => s.isRightSidebarOpen);
  const isBottomBarOpen = useStudioStore((s) => s.isBottomBarOpen);

  const toggleLeftSidebar = useStudioStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStudioStore((s) => s.toggleRightSidebar);
  const toggleBottomBar = useStudioStore((s) => s.toggleBottomBar);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="w-screen h-screen bg-[#070a12] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING STUDIO ENGINE...</span>
        </div>
      </div>
    );
  }

  // Pure presentation mode: full-screen canvas with floating preview HUD
  if (isPreviewMode) {
    return (
      <div className="w-screen h-screen bg-[#070a12] text-slate-100 flex flex-col overflow-hidden select-none relative">
        <CanvasViewport />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#070a12] text-slate-100 flex flex-col overflow-hidden select-none relative">
      {/* 1. Top Toolbar (52px) */}
      <TopToolbar onOpenFullSpec={() => setIsFullSpecModalOpen(true)} />

      {/* 2. Middle Studio Workspace: Left Sidebar + Canvas + Right Inspector */}
      <div className="flex-1 flex items-stretch overflow-hidden relative">
        {/* Left Sidebar (collapsible) */}
        {isLeftSidebarOpen && <LeftSidebar />}

        {/* Re-open Left Tab if collapsed */}
        {!isLeftSidebarOpen && (
          <button
            onClick={toggleLeftSidebar}
            title="Expand Left Panel"
            className="absolute left-2 top-3 z-30 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-cyan-400 shadow-xl transition-all"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Center Canvas Viewport */}
        <CanvasViewport />

        {/* Re-open Right Tab if collapsed */}
        {!isRightSidebarOpen && (
          <button
            onClick={toggleRightSidebar}
            title="Expand Right Inspector"
            className="absolute right-2 top-3 z-30 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-cyan-400 shadow-xl transition-all"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}

        {/* Right Sidebar Inspector (collapsible) */}
        {isRightSidebarOpen && <RightSidebar />}
      </div>

      {/* 3. Bottom Scene & Voiceover Script Bar (120px) (collapsible) */}
      {isBottomBarOpen ? (
        <BottomBar />
      ) : (
        <button
          onClick={toggleBottomBar}
          title="Expand Bottom Script & Scene Strip"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-400 hover:text-cyan-400 shadow-xl flex items-center gap-1.5 transition-all"
        >
          <PanelBottomOpen className="w-3.5 h-3.5" />
          <span>Show Scenes & Voiceover</span>
        </button>
      )}

      {/* 4. Full AI Specification Modal */}
      <FullSpecModal
        isOpen={isFullSpecModalOpen}
        onClose={() => setIsFullSpecModalOpen(false)}
      />
    </div>
  );
}
