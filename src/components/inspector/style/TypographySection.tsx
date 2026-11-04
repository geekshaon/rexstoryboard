import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Sparkles } from 'lucide-react';
import { FontFamilyType, SubPartTarget, Typography } from '../../../types/studio';

interface TypographySectionProps {
  safeActiveSubPart: SubPartTarget;
  label: string;
  currentFontSize: number;
  currentFontFamily: FontFamilyType;
  currentFontWeight: string;
  currentLineHeight: number;
  currentTextColor: string;
  currentHighlightColor: string;
  currentHighlightGlow: number;
  currentTextAlign: 'left' | 'center' | 'right';
  onUpdateTypographyProp: (propName: keyof Typography, val: any) => void;
  onUpdateTextColor: (val: string) => void;
  onUpdateHighlightColor: (val: string) => void;
  onUpdateHighlightGlow: (val: number) => void;
  onUpdateTextAlign: (val: 'left' | 'center' | 'right') => void;
  onGoToAccentTab: () => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
  safeActiveSubPart,
  label,
  currentFontSize,
  currentFontFamily,
  currentFontWeight,
  currentLineHeight,
  currentTextColor,
  currentHighlightColor,
  currentHighlightGlow,
  currentTextAlign,
  onUpdateTypographyProp,
  onUpdateTextColor,
  onUpdateHighlightColor,
  onUpdateHighlightGlow,
  onUpdateTextAlign,
  onGoToAccentTab
}) => {
  return (
    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300">
          Typography ({label})
        </label>
        <span className="text-[10px] font-mono text-cyan-400">
          {currentFontSize}px
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Font Family</label>
          <select
            value={currentFontFamily}
            onChange={(e) => onUpdateTypographyProp('fontFamily', e.target.value as FontFamilyType)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
          >
            <option value="Kalpurush">Kalpurush (Bangla Standard)</option>
            <option value="Hind Siliguri">Hind Siliguri (Modern Bangla)</option>
            <option value="Noto Sans Bengali">Noto Sans Bengali</option>
            <option value="Inter">Inter (Latin UI)</option>
            <option value="JetBrains Mono">JetBrains Mono (Code/Math)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Font Weight</label>
          <div className="grid grid-cols-5 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            {(['400', '500', '600', '700', '800'] as const).map((w) => (
              <button
                key={w}
                onClick={() => onUpdateTypographyProp('fontWeight', w)}
                className={`py-1 rounded font-mono cursor-pointer transition-all ${
                  currentFontWeight === w ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ fontWeight: w }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Line Height</span>
            <span className="font-mono text-cyan-400">
              {currentLineHeight}×
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.05"
            value={currentLineHeight}
            onChange={(e) => onUpdateTypographyProp('lineHeight', Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">
            Font Size (px)
          </label>
          <input
            type="range"
            min="12"
            max="120"
            value={currentFontSize}
            onChange={(e) => onUpdateTypographyProp('fontSize', Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Text Color Input */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">
            {safeActiveSubPart === 'title'
              ? 'Headline / Title Color'
              : safeActiveSubPart === 'body'
              ? 'Body Text Color'
              : 'Text Color'}
          </label>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
            <input
              type="color"
              value={currentTextColor.startsWith('#') ? currentTextColor : '#f8fafc'}
              onChange={(e) => onUpdateTextColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              value={currentTextColor}
              onChange={(e) => onUpdateTextColor(e.target.value)}
              className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none truncate"
            />
          </div>
        </div>

        {/* Highlight Accent reminder for title/body */}
        {(safeActiveSubPart === 'title' || safeActiveSubPart === 'body') && (
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Word Highlights & Brackets:</span>
            <button
              type="button"
              onClick={onGoToAccentTab}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Highlight Accent tab</span>
            </button>
          </div>
        )}

        {/* Global Container Highlight & Glow defaults */}
        {safeActiveSubPart === 'container' && (
          <>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Default Highlight Accent Color</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                <input
                  type="color"
                  value={currentHighlightColor.startsWith('#') ? currentHighlightColor : '#38bdf8'}
                  onChange={(e) => onUpdateHighlightColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={currentHighlightColor}
                  onChange={(e) => onUpdateHighlightColor(e.target.value)}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none truncate"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Default Highlight Glow</span>
                <span className="font-mono text-cyan-400">
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
                className="w-full accent-cyan-400"
              />
            </div>
          </>
        )}

        {/* Independent Text Alignment (Left / Center / Right) */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">
            Alignment ({label})
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            {(['left', 'center', 'right'] as const).map((al) => (
              <button
                key={al}
                onClick={() => onUpdateTextAlign(al)}
                className={`py-1 rounded text-xs capitalize flex items-center justify-center cursor-pointer ${
                  currentTextAlign === al
                    ? 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

