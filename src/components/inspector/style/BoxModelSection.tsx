import React from 'react';
import { Link, Unlink } from 'lucide-react';
import { BoxModelValues, CornerRadiusValues, SceneElement } from '../../../types/studio';
import { useStudioStore } from '../../../store/studioStore';

interface BoxModelSectionProps {
  element: SceneElement;
  paddingBox: BoxModelValues;
  cornerRadius: CornerRadiusValues;
}

export const BoxModelSection: React.FC<BoxModelSectionProps> = ({
  element,
  paddingBox,
  cornerRadius
}) => {
  const updateElementStyle = useStudioStore((s) => s.updateElementStyle);
  const updateElementPaddingBox = useStudioStore((s) => s.updateElementPaddingBox);
  const updateElementBorderWidths = useStudioStore((s) => s.updateElementBorderWidths);
  const updateElementCornerRadius = useStudioStore((s) => s.updateElementCornerRadius);

  return (
    <>
      {/* Box Model — Padding & Border Presets */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300">Box Model (Padding & Quick Presets)</label>

        {/* Padding 4-Way */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-cyan-400 font-semibold">Padding (px)</span>
            <button
              onClick={() => updateElementPaddingBox(element.id, { ...paddingBox, linked: !paddingBox.linked })}
              className={`p-1 rounded cursor-pointer ${
                paddingBox.linked ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
              }`}
              title={paddingBox.linked ? 'Unlink Padding' : 'Link Padding'}
            >
              {paddingBox.linked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side}>
                <span className="text-slate-500 block mb-0.5 capitalize">{side.slice(0, 1).toUpperCase() + side.slice(1, 3)}</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={paddingBox[side]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (paddingBox.linked) {
                      updateElementPaddingBox(element.id, { top: val, right: val, bottom: val, left: val, linked: true });
                    } else {
                      updateElementPaddingBox(element.id, { ...paddingBox, [side]: val });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Border Presets */}
        <div>
          <span className="text-[9px] text-slate-500 block mb-1 font-mono">QUICK BORDER & SURFACE PRESETS</span>
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: 'Clean', isClean: true, cls: 'text-emerald-400 font-bold bg-emerald-950/40 border-emerald-500/30' },
              { label: 'Full Box', t: 2, r: 2, b: 2, l: 2, cls: 'text-slate-300' },
              { label: 'Left Bar', t: 0, r: 0, b: 0, l: 6, cls: 'text-cyan-400' },
              { label: 'Btm Line', t: 0, r: 0, b: 3, l: 0, cls: 'text-amber-400' },
              { label: 'None', t: 0, r: 0, b: 0, l: 0, cls: 'text-slate-500' }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                data-testid={preset.isClean ? 'preset-clean' : `preset-border-${preset.label.toLowerCase()}`}
                onClick={() => {
                  if (preset.isClean) {
                    updateElementStyle(element.id, {
                      bgMode: 'transparent',
                      bgOpacity: 0,
                      backdropBlur: 0,
                      borderWidth: 0,
                      borderColor: 'transparent',
                      glowIntensity: 0
                    });
                    updateElementBorderWidths(element.id, {
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      linked: true
                    });
                  } else {
                    updateElementBorderWidths(element.id, {
                      top: preset.t ?? 1,
                      right: preset.r ?? 1,
                      bottom: preset.b ?? 1,
                      left: preset.l ?? 1,
                      linked: preset.t === preset.r && preset.r === preset.b && preset.b === preset.l
                    });
                  }
                }}
                className={`px-1 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-center truncate cursor-pointer ${preset.cls}`}
                title={preset.isClean ? 'Clean Text: 100% Transparent Box, No Borders, No Blur' : undefined}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Corner Independent Border Radius */}
      <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">4-Corner Border Radius</label>
          <button
            onClick={() => {
              const nextLinked = !cornerRadius.linked;
              updateElementCornerRadius(element.id, { ...cornerRadius, linked: nextLinked });
            }}
            className={`p-1 rounded cursor-pointer ${
              cornerRadius.linked ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
            }`}
            title={cornerRadius.linked ? 'Unlink Corners' : 'Link Corners'}
          >
            {cornerRadius.linked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
          <div>
            <span className="text-slate-500 block mb-0.5">TL</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.topLeft}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (cornerRadius.linked) {
                  updateElementCornerRadius(element.id, {
                    topLeft: val,
                    topRight: val,
                    bottomRight: val,
                    bottomLeft: val,
                    linked: true
                  });
                } else {
                  updateElementCornerRadius(element.id, { ...cornerRadius, topLeft: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">TR</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.topRight}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, topRight: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">BR</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.bottomRight}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, bottomRight: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">BL</span>
            <input
              type="number"
              min="0"
              max="64"
              value={cornerRadius.bottomLeft}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateElementCornerRadius(element.id, { ...cornerRadius, bottomLeft: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-200 text-center font-mono"
            />
          </div>
        </div>
      </div>
    </>
  );
};

