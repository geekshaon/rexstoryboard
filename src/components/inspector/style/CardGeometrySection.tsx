import React from 'react';
import { Move, Sparkles } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';
import { measureDomElementHeight } from '../../../utils/domMeasurement';

interface CardGeometrySectionProps {
  element: SceneElement;
}

export const CardGeometrySection: React.FC<CardGeometrySectionProps> = ({ element }) => {
  const updateElementGeometry = useStudioStore((s) => s.updateElementGeometry);
  const autoFitElementHeight = useStudioStore((s) => s.autoFitElementHeight);
  const alignElement = useStudioStore((s) => s.alignElement);
  const updateElementStyle = useStudioStore((s) => s.updateElementStyle);

  return (
    <>
      {/* Exact Card Geometry & Canvas Align */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Card Position & Dimensions</span>
          </label>
          <button
            onClick={() => {
              const measured = measureDomElementHeight(element.id);
              autoFitElementHeight(element.id, measured);
            }}
            className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] cursor-pointer flex items-center gap-1 font-semibold"
            title="Auto-fit card height to content"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Height ↕</span>
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
          <span className="text-[10px] text-slate-400 block mb-1">Canvas Alignment</span>
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => alignElement(element.id, 'left')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer text-center"
              title="Align Left"
            >
              Left
            </button>
            <button
              onClick={() => alignElement(element.id, 'center-h')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold cursor-pointer text-center"
              title="Center Horizontal"
            >
              Ctr H
            </button>
            <button
              onClick={() => alignElement(element.id, 'right')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer text-center"
              title="Align Right"
            >
              Right
            </button>
            <button
              onClick={() => alignElement(element.id, 'top')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer text-center"
              title="Align Top"
            >
              Top
            </button>
            <button
              onClick={() => alignElement(element.id, 'center-v')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold cursor-pointer text-center"
              title="Center Vertical"
            >
              Ctr V
            </button>
            <button
              onClick={() => alignElement(element.id, 'bottom')}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer text-center"
              title="Align Bottom"
            >
              Btm
            </button>
          </div>
        </div>
      </div>

      {/* Card Content Flow Alignment (Vertical & Horizontal inside frame) */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2.5">
        <label className="text-xs font-bold text-slate-300 block">
          Card Content Flow Alignment
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Vertical Content Flow */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Vertical Content Flow</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
              {(['top', 'center', 'bottom'] as const).map((vAlign) => {
                const isActive = (element.style.verticalAlign || 'center') === vAlign;
                return (
                  <button
                    key={vAlign}
                    type="button"
                    onClick={() => updateElementStyle(element.id, { verticalAlign: vAlign })}
                    className={`py-1 rounded capitalize cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {vAlign === 'center' ? 'Mid' : vAlign}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Content Flow */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Horizontal Flow</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
              {(['left', 'center', 'right'] as const).map((hAlign) => {
                const isActive = (element.style.horizontalAlign || 'center') === hAlign;
                return (
                  <button
                    key={hAlign}
                    type="button"
                    onClick={() => updateElementStyle(element.id, { horizontalAlign: hAlign })}
                    className={`py-1 rounded capitalize cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hAlign === 'center' ? 'Ctr' : hAlign}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

