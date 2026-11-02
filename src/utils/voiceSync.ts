import { Scene, SceneElement } from '../types/studio';

/**
 * Extracts timestamp cues from narration script or computes word-paced sentence markers
 */
export function computeVoiceoverCues(script: string, sceneDuration: number): number[] {
  const clean = script.trim();
  if (!clean) return [];

  // 1. Look for explicit bracket timestamps like [00:03], [3s], [02:15], (3.5s)
  const explicitMatches = [...clean.matchAll(/\[(?:(\d+):)?(\d+(?:\.\d+)?)\s*s?\]|\((\d+(?:\.\d+)?)\s*s\)/gi)];
  if (explicitMatches.length >= 2) {
    const times = explicitMatches.map((m) => {
      if (m[3]) return parseFloat(m[3]);
      const min = m[1] ? parseInt(m[1], 10) : 0;
      const sec = parseFloat(m[2]);
      return min * 60 + sec;
    });
    return times.sort((a, b) => a - b);
  }

  // 2. Sentence and clause segmentation (supports Bengali '।', '?', '!', '\n', and standard punctuation)
  const segments = clean
    .split(/([।?!.\n]+)/)
    .filter((s) => s.trim().length > 1 && !/^[।?!.\n]+$/.test(s.trim()));

  if (segments.length === 0) return [0];

  const totalWords = clean.split(/\s+/).filter(Boolean).length;
  let accumulatedWords = 0;
  const timestamps: number[] = [];

  segments.forEach((seg, idx) => {
    if (idx === 0) {
      timestamps.push(0);
    } else {
      // Calculate timestamp proportionally based on reading pace across scene duration
      const proportion = accumulatedWords / Math.max(1, totalWords);
      const estTime = Math.min(sceneDuration - 1.2, proportion * sceneDuration);
      timestamps.push(Number(estTime.toFixed(1)));
    }
    const wordsInSeg = seg.split(/\s+/).filter(Boolean).length;
    accumulatedWords += wordsInSeg;
  });

  return timestamps;
}

/**
 * Synchronizes animation startAtSecond timestamps for all elements in a scene with voiceover
 */
export function syncSceneElementsWithVoiceover(
  scene: Scene,
  forceAll: boolean = false
): { updatedElements: SceneElement[]; syncCount: number } {
  const elements = scene.elements;
  if (!elements || elements.length === 0) {
    return { updatedElements: [], syncCount: 0 };
  }

  // Sort elements by stepOrder
  const sorted = [...elements].sort((a, b) => a.animation.stepOrder - b.animation.stepOrder);
  const cues = computeVoiceoverCues(scene.narrationScript, scene.duration);

  let syncCount = 0;
  const updatedElements = sorted.map((el, idx) => {
    // If element is not set to sync and forceAll is false, keep current time
    if (!forceAll && el.animation.syncWithVoice === false) {
      return el;
    }

    let calculatedTime = 0;
    if (cues.length > 0 && idx < cues.length) {
      calculatedTime = cues[idx];
    } else if (cues.length > 0) {
      // Interpolate between last cue and scene end
      const lastCue = cues[cues.length - 1];
      const remainingTime = Math.max(1, scene.duration - 1.5 - lastCue);
      const extraSteps = sorted.length - cues.length;
      calculatedTime = Number((lastCue + (remainingTime * ((idx - cues.length + 1) / (extraSteps + 1)))).toFixed(1));
    } else {
      // Evenly distribute across scene duration leaving 1.5s outro buffer
      const safeDuration = Math.max(2, scene.duration - 1.5);
      calculatedTime = Number(((idx / Math.max(1, sorted.length)) * safeDuration).toFixed(1));
    }

    syncCount++;
    return {
      ...el,
      animation: {
        ...el.animation,
        startAtSecond: Math.max(0, calculatedTime),
        syncWithVoice: true
      }
    };
  });

  return { updatedElements, syncCount };
}
