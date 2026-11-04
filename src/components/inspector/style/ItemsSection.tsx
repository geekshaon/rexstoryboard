import React from 'react';
import { SceneElement, SubPartStyle } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';
import { Sliders, Layers, Sparkles } from 'lucide-react';

interface ItemsSectionProps {
  element: SceneElement;
  currentSubStyle: SubPartStyle;
}

export const ItemsSection: React.FC<ItemsSectionProps> = ({ element, currentSubStyle }) => {
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);
  const updateElementData = useStudioStore((s) => s.updateElementData);

  const paddingVal = currentSubStyle.padding ?? element.data.itemPadding ?? 14;
  const gapVal = currentSubStyle.gap ?? currentSubStyle.margin ?? element.data.itemGap ?? 12;
  const radiusVal = currentSubStyle.borderRadius ?? 14;
  const borderWidthVal = currentSubStyle.borderWidth ?? 1;
  const borderColorVal = currentSubStyle.borderColor || 'rgba(255, 255, 255, 0.08)';
  const bgColorVal = currentSubStyle.bgColor || 'rgba(15, 23, 42, 0.65)';
  const bgOpacityVal = currentSubStyle.bgOpacity !== undefined ? Math.round(currentSubStyle.bgOpacity * 100) : 65;
  const glowVal = currentSubStyle.glowIntensity ?? 0;
  const glowColorVal = currentSubStyle.glowColor || '#06b6d4';

  const handleUpdate = (updates: Partial<SubPartStyle>) => {
    updateElementSubStyle(element.id, 'items', updates);
    // Also keep element.data synced for itemGap/itemPadding if present
    if (updates.gap !== undefined) {
      updateElementData(element.id, { itemGap: updates.gap });
    }
    if (updates.padding !== undefined) {
      updateElementData(element.id, { itemPadding: updates.padding });
    }
  };

  return (
    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Item Cards Surface & Box Model</span>
        </label>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
          Items / Cells
        </span>
      </div>

      {/* 1. Item Background Color & Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Item Card Background</span>
          <button
            type="button"
            onClick={() => handleUpdate({ bgColor: 'transparent', bgOpacity: 0 })}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 cursor-pointer underline"
          >
            Set Transparent
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <input
                type="color"
                value={bgColorVal.startsWith('#') ? bgColorVal : '#0f172a'}
                onChange={(e) => handleUpdate({ bgColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={bgColorVal}
                placeholder="rgba(...) or #hex"
                onChange={(e) => handleUpdate({ bgColor: e.target.value })}
                className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none truncate"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Opacity</span>
              <span className="font-mono text-cyan-400">{bgOpacityVal}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgOpacityVal}
              onChange={(e) => handleUpdate({ bgOpacity: Number(e.target.value) / 100 })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>
        </div>
      </div>

      {/* 2. Spacing & Padding Controls */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
        <label className="text-[11px] font-semibold text-slate-300 block flex items-center gap-1">
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>Padding & Spacing (Margins & Gap)</span>
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Item Inner Padding */}
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Item Padding</span>
              <span className="font-mono text-cyan-400">{paddingVal}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="4"
                max="36"
                value={paddingVal}
                onChange={(e) => handleUpdate({ padding: Number(e.target.value) })}
                className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <input
                type="number"
                min="4"
                max="48"
                value={paddingVal}
                onChange={(e) => handleUpdate({ padding: Number(e.target.value) })}
                className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono text-xs text-center"
              />
            </div>
          </div>

          {/* Gap Between Items (Margin) */}
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Item Spacing (Gap)</span>
              <span className="font-mono text-cyan-400">{gapVal}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="36"
                value={gapVal}
                onChange={(e) => handleUpdate({ gap: Number(e.target.value), margin: Number(e.target.value) })}
                className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <input
                type="number"
                min="0"
                max="48"
                value={gapVal}
                onChange={(e) => handleUpdate({ gap: Number(e.target.value), margin: Number(e.target.value) })}
                className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono text-xs text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Border & Corner Radius Controls */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
        <label className="text-[11px] font-semibold text-slate-300 block">
          Item Border & Corner Radius
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Border Width */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Border Width</span>
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              {[0, 1, 2, 3].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleUpdate({ borderWidth: w })}
                  className={`py-1 rounded font-mono cursor-pointer transition-all ${
                    borderWidthVal === w
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Corner Radius</span>
              <span className="font-mono text-cyan-400">{radiusVal}px</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min="0"
                max="32"
                value={radiusVal}
                onChange={(e) => handleUpdate({ borderRadius: Number(e.target.value) })}
                className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <input
                type="number"
                min="0"
                max="48"
                value={radiusVal}
                onChange={(e) => handleUpdate({ borderRadius: Number(e.target.value) })}
                className="w-10 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-200 font-mono text-xs text-center"
              />
            </div>
          </div>
        </div>

        {/* Border Color */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Border Color</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <input
                type="color"
                value={borderColorVal.startsWith('#') ? borderColorVal : '#38bdf8'}
                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={borderColorVal}
                placeholder="rgba(...) or #hex"
                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none truncate"
              />
            </div>
          </div>

          {/* Active Item Glow */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>Active Glow</span>
              </span>
              <span className="font-mono text-cyan-400">{glowVal}px</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <input
                type="color"
                value={glowColorVal.startsWith('#') ? glowColorVal : '#06b6d4'}
                onChange={(e) => handleUpdate({ glowColor: e.target.value })}
                className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="range"
                min="0"
                max="32"
                value={glowVal}
                onChange={(e) => handleUpdate({ glowIntensity: Number(e.target.value) })}
                className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

