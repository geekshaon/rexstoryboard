import React from 'react';
import { Type } from 'lucide-react';
import { SceneElement } from '../../../types/studio';
import { ComponentDefinition } from '../../types';
import { COMPONENT_DEFAULTS } from '../../componentDefaults';
import { resolveElementStyles, getFontFamilyCss } from '../../styleUtils';

export const BasicTextRenderer: React.FC<{ element: SceneElement; isSelected: boolean }> = ({ element }) => {
  const { data, typography } = element;
  const containerStyle = resolveElementStyles(element);

  return (
    <div className="w-full h-full flex flex-col justify-center" style={containerStyle}>
      <p
        style={{
          fontFamily: getFontFamilyCss(typography.fontFamily),
          fontSize: `${typography.fontSize}px`,
          fontWeight: typography.fontWeight,
          lineHeight: typography.lineHeight,
          color: typography.textColor,
          textAlign: typography.textAlign
        }}
      >
        {data.text || 'সাধারণ টেক্সট ব্লক'}
      </p>
    </div>
  );
};

export const BasicTextInspector: React.FC<{
  element: SceneElement;
  onChange: (newData: Record<string, any>) => void;
}> = ({ element, onChange }) => {
  const data = element.data;
  return (
    <div>
      <label className="text-xs font-mono text-slate-400 block mb-1">Text Content</label>
      <textarea
        rows={3}
        value={data.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 resize-none"
      />
    </div>
  );
};

export const basicTextDef: ComponentDefinition = {
  ...COMPONENT_DEFAULTS.basic_text,
  type: 'basic_text',
  label: 'Basic Text Block',
  category: 'Atomic',
  tier: 'atomic',
  icon: Type,
  CanvasRenderer: BasicTextRenderer,
  DataInspector: BasicTextInspector,
  specFormatter: (el) => `
- **Basic Text: "${el.data.text || ''}"**`
};

