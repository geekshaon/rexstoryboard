import React from 'react';
import { Minus } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';

export const BasicDividerRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { style } = element;
  return (
    <div className="w-full h-full flex items-center justify-center px-2">
      <div
        className="w-full h-0.5 rounded-full"
        style={{
          backgroundColor: style.borderColor || '#38bdf8',
          boxShadow: style.glowIntensity > 0 ? `0 0 10px ${style.glowColor || '#38bdf8'}` : undefined
        }}
      />
    </div>
  );
};

export const BasicDividerInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = () => {
  return (
    <div className="text-xs text-slate-400">
      Use the Style tab to configure line thickness, border color, and glow intensity.
    </div>
  );
};

export const basicDividerDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.basic_divider,
  type: 'basic_divider',
  label: 'Basic Divider Line',
  category: 'Atomic',
  tier: 'atomic',
  icon: Minus,
  CanvasRenderer: BasicDividerRenderer,
  DataInspector: BasicDividerInspector,
  specFormatter: () => `
- **Divider Line**`
};

