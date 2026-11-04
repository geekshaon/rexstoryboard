import React from 'react';
import { Link, Unlink } from 'lucide-react';
import { BoxModelValues, SceneElement } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface BorderSectionProps {
  element: SceneElement;
  borderWidths: BoxModelValues;
  currentBorderColor: string;
  currentGlowIntensity: number;
}

export const BorderSection: React.FC<BorderSectionProps> = ({
  element,
  borderWidths,
  currentBorderColor,
  currentGlowIntensity
}) => {
  const updateElementStyle = useStudioStore((s) => s.updateElementStyle);
  const updateElementBorderWidths = useStudioStore((s) => s.updateElementBorderWidths);

  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300">
          Border & Neon Glow (Global)
        </label>
        <button
          type="button"
          onClick={() => {
            updateElementBorderWidths(element.id, {
              ...borderWidths,
              linked: !borderWidths.linked
            });
          }}
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            borderWidths.linked
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}
          title={borderWidths.linked ? 'Unlink to set individual border sides' : 'Link all sides together'}
        >
          {borderWidths.linked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4-Sided Border Width Inputs */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 block font-mono">
          {borderWidths.linked ? 'Linked Border Width (px)' : 'Individual Sides (Top, Right, Bottom, Left)'}
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
          <div>
            <span className="text-[9px] text-slate-500 block mb-0.5">TOP</span>
            <input
              type="number"
              min="0"
              max="24"
              value={borderWidths.top}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                if (borderWidths.linked) {
                  updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                } else {
                  updateElementBorderWidths(element.id, { ...borderWidths, top: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block mb-0.5">RIGHT</span>
            <input
              type="number"
              min="0"
              max="24"
              value={borderWidths.right}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                if (borderWidths.linked) {
                  updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                } else {
                  updateElementBorderWidths(element.id, { ...borderWidths, right: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block mb-0.5">BOTTOM</span>
            <input
              type="number"
              min="0"
              max="24"
              value={borderWidths.bottom}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                if (borderWidths.linked) {
                  updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                } else {
                  updateElementBorderWidths(element.id, { ...borderWidths, bottom: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
            />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block mb-0.5">LEFT</span>
            <input
              type="number"
              min="0"
              max="24"
              value={borderWidths.left}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                if (borderWidths.linked) {
                  updateElementBorderWidths(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                } else {
                  updateElementBorderWidths(element.id, { ...borderWidths, left: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-1 text-center text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Border Color & Style */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Border Style</span>
          <select
            value={element.style.borderStyle || 'solid'}
            onChange={(e) => {
              updateElementStyle(element.id, {
                borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none'
              });
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Border Color</span>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={currentBorderColor.startsWith('#') ? currentBorderColor : '#38bdf8'}
              onChange={(e) => updateElementStyle(element.id, { borderColor: e.target.value })}
              className="w-7 h-7 rounded bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={currentBorderColor}
              onChange={(e) => updateElementStyle(element.id, { borderColor: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] truncate"
            />
          </div>
        </div>
      </div>

      {/* Glow Intensity */}
      <div className="pt-1 border-t border-slate-800/60">
        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
          <span>Glow Intensity</span>
          <span className="font-mono text-cyan-400">{currentGlowIntensity}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="32"
          value={currentGlowIntensity}
          onChange={(e) => updateElementStyle(element.id, { glowIntensity: Number(e.target.value) })}
          className="w-full accent-cyan-400"
        />
      </div>
    </div>
  );
};

