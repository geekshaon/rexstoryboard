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
  const padTop = parseFloat(comp.paddingTop) || 0;
  const padBottom = parseFloat(comp.paddingBottom) || 0;
  const borderTop = parseFloat(comp.borderTopWidth) || 0;
  const borderBottom = parseFloat(comp.borderBottomWidth) || 0;
  const verticalChrome = padTop + padBottom + borderTop + borderBottom;

  // Determine current zoom scale of canvas artboard transform (e.g., 0.26 for 26% zoom)
  const artboard = document.getElementById('vsss-artboard-canvas');
  let scale = 1;
  if (artboard && artboard.offsetWidth > 0) {
    scale = artboard.getBoundingClientRect().width / artboard.offsetWidth;
  } else {
    const containerRect = container.getBoundingClientRect();
    if (container.offsetWidth > 0 && containerRect.width > 0) {
      scale = containerRect.width / container.offsetWidth;
    }
  }
  if (scale <= 0) scale = 1;

  const innerChildren = Array.from(container.children) as HTMLElement[];
  if (innerChildren.length > 0) {
    let minY = Infinity;
    let maxY = -Infinity;

    for (const child of innerChildren) {
      // Ignore hidden or floating toolbars
      if (child.classList.contains('vsss-export-hide')) continue;

      const r = child.getBoundingClientRect();
      if (r.height > 0) {
        minY = Math.min(minY, r.top);
        maxY = Math.max(maxY, r.bottom);
      }
    }

    // Direct unscaled heights in local artboard pixel space
    const directH = innerChildren.reduce((acc, c) => {
      if (c.classList.contains('vsss-export-hide')) return acc;
      return acc + (c.scrollHeight || c.offsetHeight || 0);
    }, 0);

    let contentHeight = directH;
    if (minY !== Infinity && maxY !== -Infinity && scale > 0) {
      const rectH = (maxY - minY) / scale;
      contentHeight = Math.max(directH, rectH);
    }

    if (contentHeight > 0) {
      // Add vertical chrome + 20px breathing room so text never clips or touches borders tightly
      return Math.round(contentHeight + verticalChrome + 20);
    }
  }

  return undefined;
}

