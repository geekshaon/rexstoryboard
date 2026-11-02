import React from 'react';
import {
  SceneElement,
  Geometry,
  ElementStyle,
  Typography,
  AnimationChoreography,
  SubPartTarget
} from '../types/studio';

export interface LayoutVariantDef {
  id: string;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  category: 'Text' | 'Data & Logic' | 'Diagrams' | 'Callouts' | 'Containers' | 'Atomic';
  tier: 'smart' | 'atomic';
  icon: React.ComponentType<{ className?: string }>;
  defaultGeometry: Geometry;
  defaultStyle: ElementStyle;
  defaultTypography: Typography;
  defaultAnimation: AnimationChoreography;
  defaultData: Record<string, any>;
  defaultLayoutVariant?: string;
  layoutVariants?: LayoutVariantDef[];
  availableSubParts?: SubPartTarget[];
  CanvasRenderer: React.FC<{
    element: SceneElement;
    isSelected: boolean;
  }>;
  DataInspector: React.FC<{
    element: SceneElement;
    onChange: (newData: Record<string, any>) => void;
  }>;
  specFormatter: (element: SceneElement) => string;
}

