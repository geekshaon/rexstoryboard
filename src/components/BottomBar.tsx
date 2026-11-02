import React, { useState } from 'react';
import { Plus, Copy, Trash2, Clock, Mic, FileText, MessageSquare, Zap, Check } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';

export const BottomBar: React.FC = () => {
  const [activeRightTab, setActiveRightTab] = useState<'voiceover' | 'notes'>('voiceover');
  const [voiceSyncSuccess, setVoiceSyncSuccess] = useState(false);
  const scenes = useStudioStore((s) => s.project.scenes);
  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  const setActiveScene = useStudioStore((s) => s.setActiveScene);
  const addScene = useStudioStore((s) => s.addScene);
  const duplicateScene = useStudioStore((s) => s.duplicateScene);
  const deleteScene = useStudioStore((s) => s.deleteScene);
  const updateSceneDuration = useStudioStore((s) => s.updateSceneDuration);
  const toggleSceneAutoDuration = useStudioStore((s) => s.toggleSceneAutoDuration);
  const updateSceneNarration = useStudioStore((s) => s.updateSceneNarration);
  const updateSceneComments = useStudioStore((s) => s.updateSceneComments);
  const syncSceneElementsWithVoice = useStudioStore((s) => s.syncSceneElementsWithVoice);

  if (!activeScene) return null;

  // Calculate word count and estimated speech time
  const scriptText = activeScene.narrationScript || '';
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(5, Math.ceil(wordCount / 2.2) + 2);

  return (
    <footer className="h-[120px] bg-[#0b0f19] border-t border-slate-800/80 px-4 py-2 flex items-stretch gap-4 z-40 select-none shrink-0 overflow-hidden">
      {/* Left Section: Scene Strip (45% width) */}
      <div className="w-[52%] flex flex-col justify-between border-r border-slate-800/80 pr-4">
        {/* Strip Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Scenes ({scenes.length})
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Duration:</span>
              <input
                type="number"
                min="3"
                max="120"
                value={activeScene.duration}
                onChange={(e) => updateSceneDuration(activeScene.id, Number(e.target.value))}
                className="w-10 bg-transparent text-cyan-400 font-mono font-bold outline-none text-center"
              />
              <span className="text-slate-500">s</span>
              <button
                onClick={() => toggleSceneAutoDuration(activeScene.id, !activeScene.autoDuration)}
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold transition-all border cursor-pointer ${
                  activeScene.autoDuration
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Auto duration: Scene length tracks voiceover audio script words automatically"
              >
                {activeScene.autoDuration ? 'Auto 🎙️' : 'Manual'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => duplicateScene(activeScene.id)}
              title="Duplicate Active Scene"
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
            >
              <Copy className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
            <button
              onClick={() => deleteScene(activeScene.id)}
              disabled={scenes.length <= 1}
              title="Delete Active Scene"
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => addScene(undefined, activeScene.aspectRatio || '16:9')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Scene</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scene Card Carousel */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
          {scenes.map((scene, idx) => {
            const isActive = scene.id === activeSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => setActiveScene(scene.id)}
                className={`flex-shrink-0 w-36 h-[64px] rounded-lg p-2 cursor-pointer border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    SCENE {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-cyan-400">
                      {scene.aspectRatio || '16:9'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {scene.duration}s
                    </span>
                  </div>
                </div>
                <span
                  className="text-xs font-semibold text-slate-200 truncate"
                  style={{ fontFamily: "'Kalpurush', 'Hind Siliguri', sans-serif" }}
                >
                  {scene.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {scene.elements.length} elements
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Section: Voiceover Script OR Scene Review Notes (48% width) */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveRightTab('voiceover')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
                activeRightTab === 'voiceover'
                  ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3 h-3 text-amber-400" />
              <span>Voiceover Script</span>
            </button>
            <button
              onClick={() => setActiveRightTab('notes')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
                activeRightTab === 'notes'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Scene Notes</span>
              {activeScene.sceneComments?.trim() ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              ) : null}
            </button>
          </div>

          {activeRightTab === 'voiceover' ? (
            <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
              <span>{wordCount} words</span>
              <span>•</span>
              <span className={estimatedSeconds > activeScene.duration && !activeScene.autoDuration ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                Est. ~{estimatedSeconds}s {activeScene.autoDuration ? '(Auto-synced)' : `/ ${activeScene.duration}s`}
              </span>
              <button
                onClick={() => {
                  syncSceneElementsWithVoice(activeScene.id, true);
                  setVoiceSyncSuccess(true);
                  setTimeout(() => setVoiceSyncSuccess(false), 2000);
                }}
                title="Automatically calculate entrance timestamps for all cards based on voiceover pacing"
                className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-sans text-[11px] font-semibold transition-all shadow-sm active:scale-95"
              >
                {voiceSyncSuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Synced!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Sync Voice to Elements</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">
              Saved into AI animation specs
            </span>
          )}
        </div>

        {activeRightTab === 'voiceover' ? (
          <textarea
            rows={3}
            value={activeScene.narrationScript}
            onChange={(e) => updateSceneNarration(activeScene.id, e.target.value)}
            className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500/50 resize-none font-sans leading-relaxed"
            style={{ fontFamily: "'Kalpurush', 'Hind Siliguri', sans-serif" }}
            placeholder="এখানে দৃশ্যটির বাংলা বা ইংরেজি ভয়েসওভার স্ক্রিপ্ট লিখুন। (যেমন: 'আজকে আমরা জানব অ্যান্ড গেট (AND Gate) সম্পর্কে...')"
          />
        ) : (
          <textarea
            rows={3}
            value={activeScene.sceneComments || ''}
            onChange={(e) => updateSceneComments(activeScene.id, e.target.value)}
            className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50 resize-none font-sans leading-relaxed"
            placeholder="Add director feedback, visual choreography cues, or transition instructions for this scene..."
          />
        )}
      </div>
    </footer>
  );
};
