import React, { useState } from 'react';
import { X, ClipboardCopy, Check, Download, FileText, Code2, Sparkles } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { generateFullProjectSpec } from '../utils/specGenerator';

interface FullSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullSpecModal: React.FC<FullSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  const project = useStudioStore((s) => s.project);

  if (!isOpen) return null;

  const fullMarkdownSpec = generateFullProjectSpec(project);
  const rawJsonSpec = JSON.stringify(project, null, 2);

  const contentToDisplay = activeTab === 'markdown' ? fullMarkdownSpec : rawJsonSpec;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([fullMarkdownSpec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_Spec.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([rawJsonSpec], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_Project.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0c101c] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Master Video AI Specification
              </h2>
              <p className="text-xs text-slate-400">
                1-Shot prompt ready for Remotion (React/TSX) or Manim (Python) generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown Spec</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'json'
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Code Viewer Body */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-[#070a12]">
          <div className="flex-1 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 overflow-auto font-jetbrains text-xs text-slate-200 whitespace-pre leading-relaxed select-text">
            {contentToDisplay}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{project.scenes.length} Scenes Total</span>
            <span>•</span>
            <span>
              ~{project.scenes.reduce((acc, s) => acc + s.duration, 0)}s Duration
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download .md</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download .json</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-900/40 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="w-4 h-4" />
                  <span>Copy AI Specification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
