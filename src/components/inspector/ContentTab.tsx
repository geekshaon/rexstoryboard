import React from 'react';
import { LayoutGrid, Box } from 'lucide-react';
import { SceneElement } from '../../types/studio';
import { ComponentDefinition } from '../../registry/componentRegistry';
import { useStudioStore } from '../../store/studioStore';

interface ContentTabProps {
  element: SceneElement;
  def: ComponentDefinition | null;
}

export const ContentTab: React.FC<ContentTabProps> = ({ element, def }) => {
  const setElementLayoutVariant = useStudioStore((s) => s.setElementLayoutVariant);
  const updateElementData = useStudioStore((s) => s.updateElementData);
  const detachElementFromContainer = useStudioStore((s) => s.detachElementFromContainer);

  const DataInspector = def?.DataInspector;

  return (
    <div className="space-y-4">
      {/* Visual Layout Variant Switcher */}
      {def?.layoutVariants && def.layoutVariants.length > 0 && (
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
              <span>Structural Layout Variant</span>
            </label>
            <span className="text-[10px] font-mono text-cyan-400">
              {element.layoutVariant || def.layoutVariants[0].id}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {def.layoutVariants.map((v) => {
              const isActive = (element.layoutVariant || def.layoutVariants![0].id) === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setElementLayoutVariant(element.id, v.id)}
                  className={`flex items-start gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${isActive ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{v.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight truncate">{v.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Component-Specific Data Inspector */}
      {DataInspector && (
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Component Data & Text Content
          </label>
          <DataInspector
            element={element}
            onChange={(patch) => updateElementData(element.id, { ...element.data, ...patch })}
          />
        </div>
      )}

      {/* Container Parent Status / Detach */}
      {element.parentId && (
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Box className="w-3.5 h-3.5" />
            <span>Nested inside container</span>
          </div>
          <button
            onClick={() => detachElementFromContainer(element.id)}
            className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-semibold text-[11px] cursor-pointer"
          >
            Detach to Canvas
          </button>
        </div>
      )}
    </div>
  );
};

