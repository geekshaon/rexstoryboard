import { ComponentDefinition } from './types';

let lookupFn: ((type: string) => ComponentDefinition) | null = null;

export function registerComponentLookup(fn: (type: string) => ComponentDefinition): void {
  lookupFn = fn;
}

export function lookupComponentDefinition(type: string): ComponentDefinition | null {
  return lookupFn ? lookupFn(type) : null;
}

