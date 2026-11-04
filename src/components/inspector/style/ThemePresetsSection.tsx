import React, { useState } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { THEME_COLOR_PRESETS } from '../../../utils/themePalettes';
import { useStudioStore } from '../../../store/studioStore';

interface ThemePresetsSectionProps {
  element: SceneElement;
}

export const ThemePresetsSection: React.FC<ThemePresetsSectionProps> = ({ element }) => {
  const [presetFilter, setPresetFilter] = useState<'all' | 'light' | 'dark'>('all');
  const applyThemePresetToElement = useStudioStore((s) => s.applyThemePresetToElement);

  const filteredPresets = THEME_COLOR_PRESETS.filter((p) => {
    if (presetFilter === 'light') return p.isLight;
    if (presetFilter === 'dark') return !p.isLight;
    return true;
  });

  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>Theme Presets ({filteredPresets.length})</span>
        </label>
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setPresetFilter('all')}
            className={`px-1.5 py-0.5 rounded font-mono cursor-pointer transition-all ${
              presetFilter === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setPresetFilter('light')}
            className={`px-1.5 py-0.5 rounded font-mono cursor-pointer flex items-center gap-0.5 transition-all ${
              presetFilter === 'light' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            <Sun className="w-2.5 h-2.5 text-amber-400" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setPresetFilter('dark')}
            className={`px-1.5 py-0.5 rounded font-mono cursor-pointer flex items-center gap-0.5 transition-all ${
              presetFilter === 'dark' ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400'
            }`}
          >
            <Moon className="w-2.5 h-2.5 text-indigo-400" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyThemePresetToElement(element.id, preset.id)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 flex items-center gap-2 text-left cursor-pointer transition-all group"
          >
            {/* Dual Swatch (Card Surface + Highlight Accent) */}
            <div
              className="w-5 h-5 rounded-md shrink-0 border border-white/20 flex items-center justify-center shadow-inner overflow-hidden"
              style={{ backgroundColor: preset.cardBg }}
            >
              <div
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: preset.highlightText }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-200 block truncate leading-tight group-hover:text-cyan-300">
                {preset.label}
              </span>
              <span className="text-[9px] font-mono text-slate-500 block truncate">
                {preset.isLight ? '☀️ Light' : '🌙 Dark'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

