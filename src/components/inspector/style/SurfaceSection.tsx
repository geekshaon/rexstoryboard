import React from 'react';
import { SceneElement } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface SurfaceSectionProps {
  element: SceneElement;
  currentBgColor: string;
}

export const SurfaceSection: React.FC<SurfaceSectionProps> = ({ element, currentBgColor }) => {
  const updateElementStyle = useStudioStore((s) => s.updateElementStyle);

  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
      <label className="text-xs font-bold text-slate-300 block">
        Surface & Background (Global)
      </label>

      <div className="space-y-2 text-xs">
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Background Mode</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            {(['solid', 'gradient', 'transparent'] as const).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`bg-mode-${m}`}
                onClick={() => {
                  if (m === 'transparent') {
                    updateElementStyle(element.id, {
                      bgMode: 'transparent',
                      bgOpacity: 0,
                      backdropBlur: 0
                    });
                  } else if (m === 'solid') {
                    updateElementStyle(element.id, {
                      bgMode: 'solid',
                      bgOpacity: (element.style.bgOpacity ?? 0) === 0 ? 0.9 : (element.style.bgOpacity ?? 0.9),
                      backdropBlur: (element.style.backdropBlur ?? 0) === 0 ? 8 : (element.style.backdropBlur ?? 8)
                    });
                  } else if (m === 'gradient') {
                    updateElementStyle(element.id, {
                      bgMode: 'gradient',
                      bgOpacity: (element.style.bgOpacity ?? 0) === 0 ? 0.9 : (element.style.bgOpacity ?? 0.9),
                      backdropBlur: (element.style.backdropBlur ?? 0) === 0 ? 8 : (element.style.backdropBlur ?? 8)
                    });
                  }
                }}
                className={`py-1 rounded text-center capitalize cursor-pointer text-[11px] ${
                  element.style.bgMode === m
                    ? 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Primary BG</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
              <input
                type="color"
                value={currentBgColor}
                onChange={(e) => updateElementStyle(element.id, { bgColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <span className="text-[10px] font-mono text-slate-300 truncate">{currentBgColor}</span>
            </div>
          </div>
          {element.style.bgMode === 'gradient' && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Secondary BG</span>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                <input
                  type="color"
                  value={element.style.gradientColor2 || '#1e293b'}
                  onChange={(e) => updateElementStyle(element.id, { gradientColor2: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <span className="text-[10px] font-mono text-slate-300 truncate">{element.style.gradientColor2 || '#1e293b'}</span>
              </div>
            </div>
          )}
        </div>

        {element.style.bgMode === 'gradient' && (
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Gradient Angle</span>
              <span className="font-mono text-cyan-400">{element.style.gradientAngle ?? 135}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={element.style.gradientAngle ?? 135}
              onChange={(e) => updateElementStyle(element.id, { gradientAngle: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>BG Opacity</span>
            <span className="font-mono text-cyan-400">{Math.round((element.style.bgOpacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.style.bgOpacity ?? 1}
            onChange={(e) => updateElementStyle(element.id, { bgOpacity: Number(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Backdrop Glass Blur</span>
            <span className="font-mono text-cyan-400">{element.style.backdropBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            value={element.style.backdropBlur}
            onChange={(e) => updateElementStyle(element.id, { backdropBlur: Number(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
};

