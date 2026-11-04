import React from 'react';
import { AlertCircle } from 'lucide-react';
import { SceneElement, SubPartTarget } from '../../../types/studio';
import { ComponentDefinition } from '../../../registry/componentRegistry';
import { useStudioStore } from '../../../store/studioStore';
import { SUBPART_LABELS, getSubPartSupport } from './styleTabUtils';

interface SubPartSelectorProps {
  element: SceneElement;
  def: ComponentDefinition | null;
  activeSubPart: SubPartTarget;
  onSelectSubPart: (part: SubPartTarget) => void;
  onClearSubStyle: (part: SubPartTarget) => void;
}

export const SubPartSelector: React.FC<SubPartSelectorProps> = ({
  element,
  def,
  activeSubPart,
  onSelectSubPart,
  onClearSubStyle
}) => {
  const setElementLayoutVariant = useStudioStore((s) => s.setElementLayoutVariant);
  const updateElementData = useStudioStore((s) => s.updateElementData);

  if (!def?.availableSubParts || def.availableSubParts.length === 0) {
    return null;
  }

  const isTargetingSubPart = activeSubPart !== 'container';
  const hasSubPartCustomStyle = isTargetingSubPart && Boolean(element.subStyles?.[activeSubPart] && Object.keys(element.subStyles[activeSubPart]!).length > 0);
  const currentPartSupport = getSubPartSupport(element, activeSubPart);
  const currentLabel = activeSubPart === 'body' && element.type === 'footer_card'
    ? 'Footer Note'
    : SUBPART_LABELS[activeSubPart] || activeSubPart;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 block">Sub-Part Target</label>
        {hasSubPartCustomStyle && (
          <button
            onClick={() => onClearSubStyle(activeSubPart)}
            className="text-[10px] font-mono text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
            title={`Reset custom ${activeSubPart} override`}
          >
            Reset {currentLabel}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {def.availableSubParts.map((part) => {
          const isPartActive = activeSubPart === part;
          const isCustomized = Boolean(element.subStyles?.[part] && Object.keys(element.subStyles[part]!).length > 0);
          const support = getSubPartSupport(element, part);
          const label = part === 'body' && element.type === 'footer_card' ? 'Footer Note' : SUBPART_LABELS[part] || part;

          return (
            <button
              key={part}
              disabled={!support.supported}
              onClick={() => support.supported && onSelectSubPart(part)}
              title={!support.supported ? support.reason : `Customize ${label}`}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                !support.supported
                  ? 'opacity-40 line-through cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
                  : isPartActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm cursor-pointer'
                  : 'text-slate-400 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <span>{label}</span>
              {isCustomized && support.supported && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              {!support.supported && (
                <span className="text-[9px] text-amber-500 font-mono no-underline ml-0.5">✕</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-part scope indicator */}
      {isTargetingSubPart && currentPartSupport.supported && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px]">
          <span className="text-amber-300 font-semibold">
            Styling: <span className="text-amber-200 font-bold">{currentLabel}</span> override
          </span>
          {hasSubPartCustomStyle && (
            <button
              onClick={() => onClearSubStyle(activeSubPart)}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Disabled Sub-part Banner with 1-Click Action */}
      {!currentPartSupport.supported && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sub-part "{currentLabel}" is disabled</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            {currentPartSupport.reason}
          </p>
          {currentPartSupport.actionType === 'hero_switch_subtitle' && (
            <button
              onClick={() => setElementLayoutVariant(element.id, 'title_with_subtitle')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Switch to Title with Subtitle
            </button>
          )}
          {currentPartSupport.actionType === 'header_switch_pill' && (
            <button
              onClick={() => setElementLayoutVariant(element.id, 'floating_pill')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Switch to Floating Pill
            </button>
          )}
          {currentPartSupport.actionType === 'header_enable_subtitle' && (
            <button
              onClick={() => updateElementData(element.id, { showSubtitle: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Subtitle
            </button>
          )}
          {currentPartSupport.actionType === 'header_enable_badge' && (
            <button
              onClick={() => updateElementData(element.id, { showBadge: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Status Badge
            </button>
          )}
          {currentPartSupport.actionType === 'footer_enable_progress' && (
            <button
              onClick={() => updateElementData(element.id, { showProgress: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Progress Tag
            </button>
          )}
          {currentPartSupport.actionType === 'subtitle_enable_title' && (
            <button
              onClick={() => updateElementData(element.id, { showTitle: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Section Headline
            </button>
          )}
          {currentPartSupport.actionType === 'list_enable_title' && (
            <button
              onClick={() => updateElementData(element.id, { showTitle: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable List Title
            </button>
          )}
          {currentPartSupport.actionType === 'timeline_enable_title' && (
            <button
              onClick={() => updateElementData(element.id, { showTitle: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Timeline Header
            </button>
          )}
          {currentPartSupport.actionType === 'subtitle_switch_pill' && (
            <button
              onClick={() => setElementLayoutVariant(element.id, 'caption_pill')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Switch to Caption Pill
            </button>
          )}
          {currentPartSupport.actionType === 'subtitle_enable_badge' && (
            <button
              onClick={() => updateElementData(element.id, { showBadge: true })}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all"
            >
              Enable Badge Tag
            </button>
          )}
        </div>
      )}
    </div>
  );
};
