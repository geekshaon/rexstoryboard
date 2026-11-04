import React from 'react';
import { SceneElement, SubPartStyle } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface BadgeSectionProps {
  element: SceneElement;
  currentSubStyle: SubPartStyle;
}

export const BadgeSection: React.FC<BadgeSectionProps> = ({ element, currentSubStyle }) => {
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);

  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
      <label className="text-xs font-bold text-slate-300 block">
        Badge Pill Styling
      </label>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Badge Background</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
            <input
              type="color"
              value={currentSubStyle.bgColor && currentSubStyle.bgColor.startsWith('#') ? currentSubStyle.bgColor : '#38bdf8'}
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', { bgColor: e.target.value })
              }
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              value={currentSubStyle.bgColor || ''}
              placeholder="rgba(...) or #hex"
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', { bgColor: e.target.value })
              }
              className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none truncate"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Badge Text Color</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
            <input
              type="color"
              value={currentSubStyle.textColor && currentSubStyle.textColor.startsWith('#') ? currentSubStyle.textColor : '#38bdf8'}
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', {
                  textColor: e.target.value,
                  typography: { ...currentSubStyle.typography, textColor: e.target.value }
                })
              }
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              value={currentSubStyle.textColor || ''}
              placeholder="#38bdf8"
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', {
                  textColor: e.target.value,
                  typography: { ...currentSubStyle.typography, textColor: e.target.value }
                })
              }
              className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none truncate"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Badge Border Color</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
            <input
              type="color"
              value={currentSubStyle.borderColor && currentSubStyle.borderColor.startsWith('#') ? currentSubStyle.borderColor : '#38bdf8'}
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', { borderColor: e.target.value })
              }
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              value={currentSubStyle.borderColor || ''}
              placeholder="rgba(...) or #hex"
              onChange={(e) =>
                updateElementSubStyle(element.id, 'badge', { borderColor: e.target.value })
              }
              className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none truncate"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Border Width (px)</span>
          <input
            type="number"
            min="0"
            max="6"
            value={currentSubStyle.borderWidth ?? 1}
            onChange={(e) =>
              updateElementSubStyle(element.id, 'badge', { borderWidth: Number(e.target.value) })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Corner Radius (px)</span>
          <input
            type="number"
            min="0"
            max="32"
            value={currentSubStyle.borderRadius ?? 9999}
            onChange={(e) =>
              updateElementSubStyle(element.id, 'badge', { borderRadius: Number(e.target.value) })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Font Size (px)</span>
          <input
            type="number"
            min="8"
            max="24"
            value={currentSubStyle.typography?.fontSize ?? 11}
            onChange={(e) =>
              updateElementSubStyle(element.id, 'badge', {
                typography: { ...currentSubStyle.typography, fontSize: Number(e.target.value) }
              })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">Font Weight</label>
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
          {(['400', '500', '600', '700', '800'] as const).map((w) => (
            <button
              key={w}
              onClick={() =>
                updateElementSubStyle(element.id, 'badge', {
                  typography: { ...currentSubStyle.typography, fontWeight: w }
                })
              }
              className={`py-1 rounded font-mono cursor-pointer transition-all ${
                (currentSubStyle.typography?.fontWeight || '600') === w
                  ? 'bg-slate-800 text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ fontWeight: w }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

