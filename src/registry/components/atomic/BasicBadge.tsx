import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles } from '../../styleUtils';

export const BasicBadgeRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, typography } = element;
  const containerStyle = resolveElementStyles(element);

  return (
    <div className="w-full h-full flex items-center justify-center" style={containerStyle}>
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
        style={{ color: typography.textColor }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {data.text || 'TAG'}
      </span>
    </div>
  );
};

export const BasicBadgeInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;
  return (
    <div>
      <label className="text-xs font-mono text-slate-400 block mb-1">Badge Text</label>
      <input
        type="text"
        value={data.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
      />
    </div>
  );
};

export const basicBadgeDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.basic_badge,
  type: 'basic_badge',
  label: 'Basic Status Tag',
  category: 'Atomic',
  tier: 'atomic',
  icon: Tag,
  CanvasRenderer: BasicBadgeRenderer,
  DataInspector: BasicBadgeInspector,
  specFormatter: (el) => `
- **Basic Badge: "${el.data.text || ''}"**`
};

