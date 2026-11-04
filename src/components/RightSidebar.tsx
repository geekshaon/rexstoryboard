import React, { useState } from 'react';
import {
  Sliders,
  FileCode,
  Copy,
  Trash2,
  Bookmark,
  Check,
  ClipboardCopy,
  Box,
  Layers,
  Download
} from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { getComponentDefinition } from '../registry/componentRegistry';
import { generateSceneSpec } from '../utils/specGenerator';
import {
  generateIndividualComponentHtml,
  downloadIndividualComponentHtml,
  copyIndividualComponentHtml
} from '../utils/figmaHtmlExporter';
import { ContentTab } from './inspector/ContentTab';
import { StyleTab } from './inspector/StyleTab';
import { AdvancedTab } from './inspector/AdvancedTab';

export const RightSidebar: React.FC = () => {
  // Main modes: inspector or full scene spec
  const [mainMode, setMainMode] = useState<'inspector' | 'spec'>('inspector');
  // Elementor-grade 3 tabs: content, style, advanced
  const [elementorTab, setElementorTab] = useState<'content' | 'style' | 'advanced'>('content');

  const [savePresetModal, setSavePresetModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedFigmaHtml, setCopiedFigmaHtml] = useState(false);

  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const scene = useStudioStore((s) => s.project.scenes.find((sc) => sc.id === activeSceneId));
  const selectedElementId = useStudioStore((s) => s.selectedElementId);
  const element = scene?.elements.find((e) => e.id === selectedElementId);

  // Store actions
  const deleteElement = useStudioStore((s) => s.deleteElement);
  const duplicateElement = useStudioStore((s) => s.duplicateElement);
  const saveElementAsPreset = useStudioStore((s) => s.saveElementAsPreset);

  const def = element ? getComponentDefinition(element.type) : null;

  const handleSavePreset = () => {
    if (!element || !presetNameInput.trim()) return;
    saveElementAsPreset(element.id, presetNameInput.trim());
    setPresetNameInput('');
    setSavePresetModal(false);
  };

  const liveSceneSpec = scene ? generateSceneSpec(scene) : '';

  const handleCopySpec = async () => {
    await navigator.clipboard.writeText(liveSceneSpec);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const handleCopyFigmaHtml = async () => {
    if (!element) return;
    const ok = await copyIndividualComponentHtml(element, def, scene?.theme);
    if (ok) {
      setCopiedFigmaHtml(true);
      setTimeout(() => setCopiedFigmaHtml(false), 2500);
    } else {
      downloadIndividualComponentHtml(element, def, scene?.theme);
      alert('Clipboard write was restricted by your browser. The component HTML file has been downloaded instead!');
    }
  };

  const handleDownloadFigmaHtml = () => {
    if (!element) return;
    downloadIndividualComponentHtml(element, def, scene?.theme);
  };

  // Available containers in current scene for parent assignment
  const containerOptions = scene?.elements.filter(
    (e) => e.type === 'container_box' && e.id !== element?.id
  ) || [];

  return (
    <aside className="w-[360px] bg-[#0b0f19] border-l border-slate-800/80 flex flex-col h-full select-none shrink-0 z-30">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 p-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMainMode('inspector')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mainMode === 'inspector'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setMainMode('spec')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mainMode === 'spec'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>AI Spec</span>
          </button>
        </div>

        {element && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyFigmaHtml}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border ${
                copiedFigmaHtml
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-cyan-400 border-slate-700 hover:bg-slate-850 hover:border-cyan-500/50'
              }`}
              title="Copy component HTML for Figma (Paste directly into html.to.design plugin)"
            >
              {copiedFigmaHtml ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Layers className="w-3 h-3 text-cyan-400" />
              )}
              <span>{copiedFigmaHtml ? 'Copied!' : 'Figma'}</span>
            </button>
            <button
              onClick={handleDownloadFigmaHtml}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
              title="Download standalone .html file for Figma"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSavePresetModal(true)}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
              title="Save as Preset"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => duplicateElement(element.id)}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteElement(element.id)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
              title="Delete (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Mode 1: Full AI Spec View */}
      {mainMode === 'spec' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-300">Live Dual AI Spec</span>
            <button
              onClick={handleCopySpec}
              className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/40 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedSpec ? <Check className="w-3 h-3 text-emerald-400" /> : <ClipboardCopy className="w-3 h-3" />}
              <span>{copiedSpec ? 'Copied!' : 'Copy Spec'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={liveSceneSpec}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
          />
        </div>
      )}

      {/* Main Mode 2: Elementor-Grade Inspector */}
      {mainMode === 'inspector' && (
        <>
          {!element ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Box className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-xs font-semibold text-slate-400">No Element Selected</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click any component or container on the canvas to inspect and edit its properties.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Element Header Badge */}
              <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 truncate">{def?.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    Step {element.animation.stepOrder}
                  </span>
                  {element.parentId && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                      Nested
                    </span>
                  )}
                </div>
              </div>

              {/* Elementor 3 Tabs: Content, Style, Advanced */}
              <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950 text-xs">
                <button
                  data-testid="tab-content"
                  onClick={() => setElementorTab('content')}
                  className={`py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
                    elementorTab === 'content'
                      ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📝 Content
                </button>
                <button
                  data-testid="tab-style"
                  onClick={() => setElementorTab('style')}
                  className={`py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
                    elementorTab === 'style'
                      ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎨 Style
                </button>
                <button
                  data-testid="tab-advanced"
                  onClick={() => setElementorTab('advanced')}
                  className={`py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
                    elementorTab === 'advanced'
                      ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚙️ Advanced
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {elementorTab === 'content' && <ContentTab element={element} def={def} />}
                {elementorTab === 'style' && <StyleTab element={element} def={def} />}
                {elementorTab === 'advanced' && (
                  <AdvancedTab element={element} containerOptions={containerOptions} />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Preset Name Modal */}
      {savePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Save Component as Preset</h3>
            <input
              type="text"
              value={presetNameInput}
              onChange={(e) => setPresetNameInput(e.target.value)}
              placeholder="e.g., Tech Header Blueprint"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSavePresetModal(false)}
                className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                className="px-3 py-1 rounded bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 cursor-pointer"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
