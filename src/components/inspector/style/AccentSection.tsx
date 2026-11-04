import React from 'react';
import { Sparkles } from 'lucide-react';
import { SceneElement, SubPartStyle, Typography } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface AccentSectionProps {
  element: SceneElement;
  currentHighlightColor: string;
  currentFontWeight: string;
  currentHighlightGlow: number;
  currentSubStyle: SubPartStyle;
  onUpdateHighlightColor: (val: string) => void;
  onUpdateHighlightGlow: (val: number) => void;
  onUpdateTypographyProp: (propName: keyof Typography, val: any) => void;
}

export const AccentSection: React.FC<AccentSectionProps> = ({
  element,
  currentHighlightColor,
  currentFontWeight,
  currentHighlightGlow,
  currentSubStyle,
  onUpdateHighlightColor,
  onUpdateHighlightGlow,
  onUpdateTypographyProp
}) => {
  const updateElementSubStyle = useStudioStore((s) => s.updateElementSubStyle);

  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Highlight Accent Styling</span>
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          [brackets] or matched words
        </span>
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
          Accent Highlight Color
        </label>
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <input
            type="color"
            value={currentHighlightColor.startsWith('#') ? currentHighlightColor : '#d97706'}
            onChange={(e) => onUpdateHighlightColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent shrink-0"
          />
          <input
            type="text"
            value={currentHighlightColor}
            onChange={(e) => onUpdateHighlightColor(e.target.value)}
            className="w-full bg-transparent text-xs font-mono text-slate-200 outline-none uppercase font-bold"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="text-[10px] text-slate-400 block mb-1">Font Weight</label>
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
          {(['400', '500', '600', '700', '800'] as const).map((w) => (
            <button
              key={w}
              onClick={() => onUpdateTypographyProp('fontWeight', w)}
              className={`py-1 rounded font-mono cursor-pointer transition-all ${
                currentFontWeight === w
                  ? 'bg-slate-800 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ fontWeight: w }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight Glow */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
          <span>Accent Glow Intensity</span>
          <span className="font-mono text-amber-400">
            {currentHighlightGlow === 0 ? 'Off (Clean Text)' : `${currentHighlightGlow}px`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="32"
          step="2"
          value={currentHighlightGlow}
          onChange={(e) => onUpdateHighlightGlow(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </div>

      {/* Font Size Override (Optional) */}
      <div className="pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400 font-semibold">
            Font Size Override (Optional)
          </span>
          {currentSubStyle.typography?.fontSize ? (
            <button
              type="button"
              onClick={() => {
                const nextTypo = { ...currentSubStyle.typography };
                delete nextTypo.fontSize;
                updateElementSubStyle(element.id, 'accent', { typography: nextTypo });
              }}
              className="text-[9px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Reset to Match Parent
            </button>
          ) : (
            <span className="text-[9px] text-slate-500 font-mono">
              Inherited from line
            </span>
          )}
        </div>
        {currentSubStyle.typography?.fontSize ? (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Custom Size</span>
              <span className="font-mono text-cyan-400">{currentSubStyle.typography.fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="96"
              value={currentSubStyle.typography.fontSize}
              onChange={(e) => onUpdateTypographyProp('fontSize', Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUpdateTypographyProp('fontSize', element.typography.fontSize || 38)}
            className="w-full py-1 text-[11px] rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
          >
            Set Custom Accent Font Size
          </button>
        )}
      </div>

      {/* Optional Background Pill Badge */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300">
            Pill Badge Background (Optional)
          </label>
          {currentSubStyle.bgColor && (
            <button
              type="button"
              onClick={() =>
                updateElementSubStyle(element.id, 'accent', {
                  bgColor: undefined,
                  borderColor: undefined,
                  borderWidth: undefined,
                  borderRadius: undefined
                })
              }
              className="text-[9px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Remove Pill
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Pill BG Color</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
              <input
                type="color"
                value={currentSubStyle.bgColor && currentSubStyle.bgColor.startsWith('#') ? currentSubStyle.bgColor : '#d97706'}
                onChange={(e) =>
                  updateElementSubStyle(element.id, 'accent', { bgColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={currentSubStyle.bgColor || ''}
                placeholder="none (text only)"
                onChange={(e) =>
                  updateElementSubStyle(element.id, 'accent', { bgColor: e.target.value })
                }
                className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none truncate"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Corner Radius</span>
            <input
              type="number"
              min="0"
              max="32"
              value={currentSubStyle.borderRadius ?? 6}
              onChange={(e) =>
                updateElementSubStyle(element.id, 'accent', { borderRadius: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

