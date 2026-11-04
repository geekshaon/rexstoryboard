/**
 * Utility for measuring rendered element content in the DOM.
 * Accurately measures inner content bounds + computed padding & borders,
 * ensuring Auto-Fit Height never collapses elements against their content.
 */

export function measureDomElementHeight(elementId: string): number | undefined {
  if (typeof document === 'undefined') return undefined;

  const wrapper = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement | null;
  if (!wrapper) return undefined;

  // The root rendered element of the component (has containerStyle with padding & border)
  const container = wrapper.firstElementChild as HTMLElement | null;
  if (!container) return undefined;

  const comp = window.getComputedStyle(container);
  const borderTop = parseFloat(comp.borderTopWidth) || 0;
  const borderBottom = parseFloat(comp.borderBottomWidth) || 0;

  // Temporarily collapse container height to 'auto' so it reflects true intrinsic content
  const prevHeight = container.style.height;
  const prevMaxHeight = container.style.maxHeight;
  container.style.height = 'auto';
  container.style.maxHeight = 'none';

  // Also remove flex-1 stretching on any immediate content sub-containers
  const flex1Elements = Array.from(container.querySelectorAll<HTMLElement>('.flex-1'));
  const prevFlexStyles = flex1Elements.map((el) => ({
    flex: el.style.flex,
    height: el.style.height
  }));

  flex1Elements.forEach((el) => {
    el.style.flex = '0 0 auto';
    el.style.height = 'auto';
  });

  // In CSS box-sizing: border-box, offsetHeight with height: 'auto' is the exact border-box height!
  const measuredTotalHeight = container.offsetHeight || (container.scrollHeight + borderTop + borderBottom);

  // Restore previous inline styles immediately before paint
  container.style.height = prevHeight;
  container.style.maxHeight = prevMaxHeight;
  flex1Elements.forEach((el, i) => {
    el.style.flex = prevFlexStyles[i].flex;
    el.style.height = prevFlexStyles[i].height;
  });

  if (measuredTotalHeight > 0) {
    return Math.round(measuredTotalHeight);
  }

  return undefined;
}

