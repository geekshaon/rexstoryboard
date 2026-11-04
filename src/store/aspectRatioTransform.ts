import { Scene, AspectRatioType, Geometry, getSceneDimensions } from '../types/studio';

/**
 * Handles aspect ratio transformation with cached snapshots and non-destructive responsive layouts.
 */
export function transformSceneAspectRatio(scene: Scene, newRatio: AspectRatioType): void {
  const oldRatio = scene.aspectRatio || '16:9';
  if (oldRatio === newRatio) return;

  if (!scene.aspectRatioLayouts) {
    scene.aspectRatioLayouts = {};
  }

  // 1. Snapshot current layout for oldRatio so it can be restored perfectly if user switches back
  const currentSnapshot: Record<string, Geometry> = {};
  scene.elements.forEach((el) => {
    currentSnapshot[el.id] = { ...el.geometry };
  });
  scene.aspectRatioLayouts[oldRatio] = currentSnapshot;

  scene.aspectRatio = newRatio;
  const { width: newW, height: newH } = getSceneDimensions(newRatio);
  const { width: oldW, height: oldH } = getSceneDimensions(oldRatio);

  // 2. If user already had a saved layout for this target ratio, restore it with 100% precision
  const cachedLayout = scene.aspectRatioLayouts[newRatio];
  if (cachedLayout && Object.keys(cachedLayout).length > 0) {
    scene.elements.forEach((el) => {
      if (cachedLayout[el.id]) {
        el.geometry = { ...cachedLayout[el.id] };
      }
    });
    return;
  }

  // 3. Smart non-destructive repositioning & containment:
  const sg = scene.theme.safeGuard?.enabled && scene.theme.safeGuard
    ? scene.theme.safeGuard
    : { top: 60, right: 60, bottom: 60, left: 60 };
  const topMargin = scene.masterHeader.enabled ? Math.max(sg.top, scene.masterHeader.height + 24) : sg.top;
  const bottomMargin = scene.masterFooter.enabled ? Math.max(sg.bottom, scene.masterFooter.height + 24) : sg.bottom;
  const availableW = newW - sg.left - sg.right;
  const availableH = newH - topMargin - bottomMargin;

  if (newRatio === '9:16') {
    // Converting Landscape (1920x1080) to Vertical (1080x1920) for Shorts / Mobile
    const sorted = [...scene.elements].sort((a, b) => (a.geometry.y - b.geometry.y) || (a.geometry.x - b.geometry.x));
    const count = sorted.length;
    const targetW = Math.min(availableW, 940);
    const startX = Math.round((newW - targetW) / 2);
    const gap = 24;
    const targetH = Math.min(420, Math.max(160, Math.floor((availableH - (count - 1) * gap) / Math.max(1, count))));

    sorted.forEach((sortedEl, index) => {
      const el = scene.elements.find((e) => e.id === sortedEl.id);
      if (!el) return;
      el.geometry.width = targetW;
      el.geometry.height = Math.min(el.geometry.height, targetH);
      el.geometry.x = startX;
      el.geometry.y = topMargin + index * (targetH + gap);
    });
  } else if (newRatio === '16:9' && oldRatio === '9:16') {
    // Converting Vertical (1080x1920) to Landscape (1920x1080)
    const sorted = [...scene.elements].sort((a, b) => a.geometry.y - b.geometry.y);
    if (sorted.length >= 2) {
      const colW = Math.round((availableW - 40) / 2);
      const rowCount = Math.ceil(sorted.length / 2);
      const rowH = Math.min(420, Math.max(200, Math.floor((availableH - (rowCount - 1) * 30) / rowCount)));
      sorted.forEach((sortedEl, index) => {
        const el = scene.elements.find((e) => e.id === sortedEl.id);
        if (!el) return;
        const col = index % 2;
        const row = Math.floor(index / 2);
        el.geometry.width = colW;
        el.geometry.height = rowH;
        el.geometry.x = sg.left + col * (colW + 40);
        el.geometry.y = topMargin + row * (rowH + 30);
      });
    } else {
      sorted.forEach((sortedEl) => {
        const el = scene.elements.find((e) => e.id === sortedEl.id);
        if (!el) return;
        el.geometry.width = Math.min(940, availableW);
        el.geometry.height = Math.min(520, availableH);
        el.geometry.x = Math.round((newW - el.geometry.width) / 2);
        el.geometry.y = topMargin + 20;
      });
    }
  } else {
    // General Proportional Scaling
    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    scene.elements.forEach((el) => {
      const scaledW = Math.round(el.geometry.width * scaleX);
      const scaledH = Math.round(el.geometry.height * scaleY);
      const finalW = Math.min(availableW, Math.max(240, scaledW));
      const finalH = Math.min(availableH, Math.max(120, scaledH));
      const scaledX = Math.round(el.geometry.x * scaleX);
      const scaledY = Math.round(el.geometry.y * scaleY);
      const finalX = Math.max(sg.left, Math.min(newW - sg.right - finalW, scaledX));
      const finalY = Math.max(topMargin, Math.min(newH - bottomMargin - finalH, scaledY));

      el.geometry.width = finalW;
      el.geometry.height = finalH;
      el.geometry.x = finalX;
      el.geometry.y = finalY;
    });
  }
}

