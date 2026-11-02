import React from 'react';
import {
  Link,
  Unlink,
  Maximize2,
  ArrowUpToLine,
  ArrowDownToLine,
  Zap,
  MessageSquare
} from 'lucide-react';
import {
  SceneElement,
  BoxModelValues,
  EntranceAnimation,
  EmphasisAnimation
} from '../../types/studio';
import { useStudioStore } from '../../store/studioStore';
import { measureDomElementHeight } from '../../utils/domMeasurement';

interface AdvancedTabProps {
  element: SceneElement;
  containerOptions: SceneElement[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ element, containerOptions }) => {
  const updateElementGeometry = useStudioStore((s) => s.updateElementGeometry);
  const updateElementMarginBox = useStudioStore((s) => s.updateElementMarginBox);
  const updateElementAnimation = useStudioStore((s) => s.updateElementAnimation);
  const updateElementComments = useStudioStore((s) => s.updateElementComments);
  const nestElementInContainer = useStudioStore((s) => s.nestElementInContainer);
  const autoFitElementHeight = useStudioStore((s) => s.autoFitElementHeight);
  const bringToFront = useStudioStore((s) => s.bringToFront);
  const sendToBack = useStudioStore((s) => s.sendToBack);
  const alignElement = useStudioStore((s) => s.alignElement);

  const marginBox: BoxModelValues = element.geometry.marginBox || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    linked: true
  };

  const isAutoTime = element.animation.startAtSecond === 0 || element.animation.syncWithVoice !== false;
  const isAutoDuration = element.animation.duration === 0;
  const isAutoDelay = element.animation.delay === 0;

  return (
    <div className="space-y-4">
      {/* Margin Box Widget */}
      <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Margin Box</span>
          </label>
        </div>

        {/* Margin 4-Way */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-amber-400 font-semibold">Margin (px)</span>
            <button
              onClick={() => {
                const nextLinked = !marginBox.linked;
                updateElementMarginBox(element.id, { ...marginBox, linked: nextLinked });
              }}
              className={`p-1 rounded cursor-pointer ${
                marginBox.linked ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
              }`}
              title={marginBox.linked ? 'Unlink Margin' : 'Link Margin'}
            >
              {marginBox.linked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div>
              <span className="text-slate-500 block mb-0.5">Top</span>
              <input
                type="number"
                min="-20"
                max="120"
                value={marginBox.top}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (marginBox.linked) {
                    updateElementMarginBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementMarginBox(element.id, { ...marginBox, top: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Right</span>
              <input
                type="number"
                min="-20"
                max="120"
                value={marginBox.right}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (marginBox.linked) {
                    updateElementMarginBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementMarginBox(element.id, { ...marginBox, right: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Bottom</span>
              <input
                type="number"
                min="-20"
                max="120"
                value={marginBox.bottom}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (marginBox.linked) {
                    updateElementMarginBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementMarginBox(element.id, { ...marginBox, bottom: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Left</span>
              <input
                type="number"
                min="-20"
                max="120"
                value={marginBox.left}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (marginBox.linked) {
                    updateElementMarginBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                  } else {
                    updateElementMarginBox(element.id, { ...marginBox, left: val });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exact Geometry & Quick Canvas Alignments */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">Geometry & Position</label>
          <button
            onClick={() => {
              const measured = measureDomElementHeight(element.id);
              autoFitElementHeight(element.id, measured);
            }}
            className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] cursor-pointer"
          >
            Auto Height ↕
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">X (px)</span>
            <input
              type="number"
              value={Math.round(element.geometry.x)}
              onChange={(e) => updateElementGeometry(element.id, { x: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Y (px)</span>
            <input
              type="number"
              value={Math.round(element.geometry.y)}
              onChange={(e) => updateElementGeometry(element.id, { y: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">W (px)</span>
            <input
              type="number"
              value={Math.round(element.geometry.width)}
              onChange={(e) => updateElementGeometry(element.id, { width: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">H (px)</span>
            <input
              type="number"
              value={Math.round(element.geometry.height)}
              onChange={(e) => updateElementGeometry(element.id, { height: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Quick Canvas Align Buttons */}
        <div>
          <span className="text-[10px] text-slate-400 block mb-1">Canvas Align</span>
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => alignElement(element.id, 'left')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Align Left"
            >
              Left
            </button>
            <button
              onClick={() => alignElement(element.id, 'center-h')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer font-bold text-cyan-400"
              title="Center Horizontal"
            >
              Ctr H
            </button>
            <button
              onClick={() => alignElement(element.id, 'right')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Align Right"
            >
              Right
            </button>
            <button
              onClick={() => alignElement(element.id, 'top')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Align Top"
            >
              Top
            </button>
            <button
              onClick={() => alignElement(element.id, 'center-v')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer font-bold text-cyan-400"
              title="Center Vertical"
            >
              Ctr V
            </button>
            <button
              onClick={() => alignElement(element.id, 'bottom')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Align Bottom"
            >
              Btm
            </button>
          </div>
        </div>

        {/* Z-Index & Container Assignment */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => bringToFront(element.id)}
            className="py-1 px-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowUpToLine className="w-3.5 h-3.5 text-cyan-400" /> Bring to Front
          </button>
          <button
            onClick={() => sendToBack(element.id)}
            className="py-1 px-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" /> Send to Back
          </button>
        </div>

        {containerOptions.length > 0 && !element.parentId && (
          <div className="pt-2 border-t border-slate-800/60">
            <label className="text-[10px] text-slate-400 block mb-1">Nest into Container</label>
            <select
              onChange={(e) => {
                if (e.target.value) nestElementInContainer(element.id, e.target.value);
              }}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
            >
              <option value="" disabled>Select Container Box...</option>
              {containerOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  Container ({c.id.slice(-6)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Animation Choreography & Voice Sync */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Motion & Voice Sync Spec</span>
          </label>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Step Order</span>
              <input
                type="number"
                min="1"
                value={element.animation.stepOrder}
                onChange={(e) => updateElementAnimation(element.id, { stepOrder: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-amber-400 font-semibold">Start at Second</span>
                {isAutoTime && (
                  <span className="text-[9px] text-amber-400/90 font-mono">Auto Voice</span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={element.animation.startAtSecond ?? 0}
                onChange={(e) => updateElementAnimation(element.id, { startAtSecond: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-slate-950 border border-amber-500/30 rounded px-2 py-1 text-amber-300 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Entrance Animation</span>
            <select
              value={element.animation.entrance}
              onChange={(e) => updateElementAnimation(element.id, { entrance: e.target.value as EntranceAnimation })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            >
              <option value="fadeIn">Fade In (Opacity)</option>
              <option value="slideUp">Slide Up</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideRight">Slide Right</option>
              <option value="scaleSpring">Scale Spring (Pop)</option>
              <option value="drawSvgStroke">Draw SVG Stroke</option>
              <option value="typewriter">Typewriter Line-by-Line</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Duration</span>
                <span className="font-mono text-cyan-400">
                  {isAutoDuration ? 'Auto (Voice)' : `${element.animation.duration}s`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.1"
                value={element.animation.duration ?? 0.8}
                onChange={(e) => updateElementAnimation(element.id, { duration: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Delay</span>
                <span className="font-mono text-cyan-400">
                  {isAutoDelay ? '0s (Auto)' : `${element.animation.delay}s`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={element.animation.delay ?? 0}
                onChange={(e) => updateElementAnimation(element.id, { delay: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-tight">
            🎙️ <span className="text-amber-300 font-semibold">Voice Sync Rule:</span> Setting <code className="text-cyan-300 font-mono">Start Time = 0</code>, <code className="text-cyan-300 font-mono">Duration = 0</code>, or <code className="text-cyan-300 font-mono">Delay = 0</code> automatically syncs timing with voiceover pacing and audio cues.
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Emphasis Animation</span>
            <select
              value={element.animation.emphasis}
              onChange={(e) => updateElementAnimation(element.id, { emphasis: e.target.value as EmphasisAnimation })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            >
              <option value="none">None (Static)</option>
              <option value="pulseGlow">Pulse Neon Glow</option>
              <option value="borderBeam">Rotating Border Beam</option>
              <option value="float">Floating Sine Wave</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Remotion / Manim AI Prompt Instruction</label>
            <input
              type="text"
              value={element.animation.aiNote || ''}
              onChange={(e) => updateElementAnimation(element.id, { aiNote: e.target.value })}
              placeholder="e.g. Draw gate pins first, then fill boundary"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Production Comments / Animator Review Notes */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Card Review & Animator Notes</span>
        </label>
        <textarea
          rows={2}
          value={element.comments || ''}
          onChange={(e) => updateElementComments(element.id, e.target.value)}
          placeholder="Add director feedback, voice cue notes, or layout instructions..."
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 resize-none outline-none focus:border-amber-500/50"
        />
      </div>
    </div>
  );
};

