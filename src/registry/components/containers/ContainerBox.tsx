import React from 'react';
import { Box, ArrowUp, ArrowDown } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles } from '../../styleUtils';
import { useStudioStore } from '../../../store/studioStore';
import { ElementErrorBoundary } from '../../../components/ElementErrorBoundary';
import { lookupComponentDefinition } from '../../componentLookup';

export const ContainerBoxRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, layoutVariant = 'flex_row' } = element;
  const containerStyle = resolveElementStyles(element);

  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const scene = useStudioStore((s) => s.project.scenes.find((sc) => sc.id === activeSceneId));
  const selectedElementId = useStudioStore((s) => s.selectedElementId);
  const setSelectedElementId = useStudioStore((s) => s.setSelectedElementId);

  // Retrieve nested children
  const rawChildren = scene?.elements.filter(
    (e) => e.parentId === element.id || (Array.isArray(data.childIds) && data.childIds.includes(e.id))
  ) || [];

  const children = Array.isArray(data.childIds) && data.childIds.length > 0
    ? [...rawChildren].sort((a, b) => {
        const idxA = data.childIds.indexOf(a.id);
        const idxB = data.childIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      })
    : rawChildren;

  const gap = data.gap ?? 16;
  const isRow = layoutVariant === 'flex_row';
  const isCol = layoutVariant === 'flex_column';
  const isGrid2 = layoutVariant === 'grid_2col';
  const isGrid3 = layoutVariant === 'grid_3col';

  return (
    <div
      className={`w-full h-full relative transition-all ${
        isGrid2
          ? 'grid grid-cols-2'
          : isGrid3
            ? 'grid grid-cols-3'
            : isCol
              ? 'flex flex-col'
              : 'flex flex-row'
      }`}
      style={{
        ...containerStyle,
        gap: `${gap}px`
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElementId(element.id);
      }}
    >
      {children.length === 0 ? (
        <div className="w-full h-full min-h-[120px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 rounded-xl text-slate-500 text-xs p-4 text-center select-none">
          <Box className="w-6 h-6 text-slate-600 mb-2" />
          <span className="font-semibold text-slate-400">Empty Layout Container</span>
          <span className="text-[11px] text-slate-500 mt-1">
            Nest elements here via the Advanced Tab or spawn atomic widgets.
          </span>
        </div>
      ) : (
        children.map((child) => {
          const childDef = lookupComponentDefinition(child.type);
          if (!childDef) return null;
          const ChildRenderer = childDef.CanvasRenderer;
          const isChildSelected = child.id === selectedElementId;

          return (
            <div
              key={child.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(child.id);
              }}
              className={`relative cursor-pointer transition-all ${
                isChildSelected
                  ? 'ring-2 ring-cyan-400 shadow-xl z-20'
                  : 'hover:ring-1 hover:ring-slate-500'
              } ${isRow || isCol ? (child.containerSizing === 'flex-1' ? 'flex-1' : 'w-full') : ''}`}
              style={{
                borderRadius: `${child.style.borderRadius || 12}px`
              }}
            >
              <ElementErrorBoundary elementId={child.id} elementType={child.type}>
                <ChildRenderer element={child} isSelected={isChildSelected} />
              </ElementErrorBoundary>
            </div>
          );
        })
      )}
    </div>
  );
};

export const ContainerBoxInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;
  const activeSceneId = useStudioStore((s) => s.project.activeSceneId);
  const scene = useStudioStore((s) => s.project.scenes.find((sc) => sc.id === activeSceneId));
  const detachElement = useStudioStore((s) => s.detachElementFromContainer);
  const reorderChildren = useStudioStore((s) => s.reorderContainerChildren);
  const setSelectedElementId = useStudioStore((s) => s.setSelectedElementId);

  const rawChildren = scene?.elements.filter(
    (e) => e.parentId === element.id || (Array.isArray(data.childIds) && data.childIds.includes(e.id))
  ) || [];

  const children = Array.isArray(data.childIds) && data.childIds.length > 0
    ? [...rawChildren].sort((a, b) => {
        const idxA = data.childIds.indexOf(a.id);
        const idxB = data.childIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      })
    : rawChildren;

  const moveChild = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= children.length) return;
    const newOrder = children.map((c) => c.id);
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    reorderChildren(element.id, newOrder);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-mono text-slate-400 block mb-1">Item Gap (px)</label>
        <input
          type="range"
          min={0}
          max={60}
          value={data.gap ?? 16}
          onChange={(e) => onChange({ gap: Number(e.target.value) })}
          className="w-full accent-cyan-400"
        />
        <div className="text-right text-[11px] font-mono text-cyan-400">{data.gap ?? 16}px</div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <label className="text-xs font-mono text-slate-400 block mb-2">Nested Children ({children.length})</label>
        {children.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No elements nested inside this container.</p>
        ) : (
          <div className="space-y-1.5">
            {children.map((child, idx) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs gap-1.5"
              >
                <button
                  onClick={() => setSelectedElementId(child.id)}
                  className="text-cyan-400 hover:underline font-mono truncate max-w-[120px] text-left cursor-pointer"
                  title="Select element"
                >
                  {child.type}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveChild(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Up in flow"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-slate-300 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveChild(idx, 'down')}
                    disabled={idx === children.length - 1}
                    title="Move Down in flow"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-slate-300 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => detachElement(child.id)}
                    className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30 text-[10px] cursor-pointer"
                    title="Detach to free canvas"
                  >
                    Detach
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const containerBoxDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.container_box,
  type: 'container_box',
  label: 'Layout Container: Flex/Grid Box',
  category: 'Containers',
  tier: 'atomic',
  icon: Box,
  CanvasRenderer: ContainerBoxRenderer,
  DataInspector: ContainerBoxInspector,
  specFormatter: (el) => `
- **Layout Container: Flex/Grid Box**
  - Variant: \`${el.layoutVariant || 'flex_row'}\`
  - Gap: ${el.data.gap ?? 16}px`
};

