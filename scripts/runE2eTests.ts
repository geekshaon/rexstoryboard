import { useStudioStore } from '../src/store/studioStore';
import {
  getAllComponentDefinitions,
  getComponentDefinition,
  COMPONENT_REGISTRY
} from '../src/registry/componentRegistry';
import { COMPONENT_DEFAULTS } from '../src/registry/componentDefaults';
import {
  resolveElementStyles,
  getSubPartStyle,
  getFontFamilyCss,
  toBanglaDigit
} from '../src/registry/styleUtils';
import { computeVoiceoverCues, syncSceneElementsWithVoiceover } from '../src/utils/voiceSync';
import { generateSceneSpec, screenToManimCoords } from '../src/utils/specGenerator';
import { THEME_COLOR_PRESETS } from '../src/utils/themePalettes';
import { getSceneDimensions, SceneElement } from '../src/types/studio';

// Test harness state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, errorDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    const msg = `FAIL: ${testName}${errorDetail ? ` -> ${errorDetail}` : ''}`;
    failures.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(
    match,
    testName,
    match ? undefined : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  );
}

console.log('================================================================');
console.log('  VSSS / REX STORYBOARD COMPREHENSIVE E2E & COMPONENT AUDIT');
console.log('================================================================\n');

// ─── SUITE 1: Component Registry & Defaults Verification ───────────────────────
console.log('--- Suite 1: Component Registry & Schema Audit ---');
{
  const definitions = getAllComponentDefinitions();
  assertEqual(definitions.length, 8, 'PRIMARY_DEFINITIONS contains exactly 8 components');

  const expectedTypes = [
    'hero_text',
    'header_card',
    'footer_card',
    'subtitle_caption',
    'container_box',
    'basic_text',
    'basic_badge',
    'basic_divider'
  ];

  expectedTypes.forEach((type) => {
    const def = getComponentDefinition(type);
    assert(Boolean(def), `Component definition exists for: ${type}`);
    assertEqual(def.type, type, `Component type matches: ${type}`);
    assert(typeof def.CanvasRenderer === 'function', `${type} has valid CanvasRenderer`);
    assert(typeof def.specFormatter === 'function', `${type} has valid specFormatter`);
    assert(def.defaultGeometry.width > 0, `${type} has positive default width`);
    assert(def.defaultGeometry.height > 0, `${type} has positive default height`);
    assert(Boolean(def.defaultStyle.bgColor), `${type} has defaultStyle.bgColor`);
    assert(Boolean(def.defaultTypography.fontFamily), `${type} has defaultTypography.fontFamily`);
    assert(Boolean(def.defaultAnimation.entrance), `${type} has defaultAnimation.entrance`);

    // Verify specFormatter returns markdown with component data
    const dummyElement: SceneElement = {
      id: `test_${type}`,
      type,
      geometry: { ...def.defaultGeometry },
      style: { ...def.defaultStyle },
      typography: { ...def.defaultTypography },
      animation: { ...def.defaultAnimation },
      data: { ...def.defaultData }
    };
    const formatted = def.specFormatter(dummyElement);
    assert(typeof formatted === 'string' && formatted.length > 0, `${type} specFormatter outputs non-empty markdown`);
  });

  // Verify Layout Variants
  definitions.forEach((def) => {
    if (def.layoutVariants && def.layoutVariants.length > 0) {
      const ids = def.layoutVariants.map((v) => v.id);
      const uniqueIds = new Set(ids);
      assertEqual(ids.length, uniqueIds.size, `${def.type} layout variants have unique IDs`);
      def.layoutVariants.forEach((v) => {
        assert(Boolean(v.label), `${def.type} variant [${v.id}] has label`);
      });
    }
  });

  // Verify Legacy Aliases Fallback
  const legacyTypes = [
    'concept_card',
    'dynamic_list',
    'code_formula',
    'svg_diagram',
    'truth_table',
    'callout_pointer',
    'step_flow',
    'code_runner',
    'logic_gate'
  ];
  legacyTypes.forEach((legacy) => {
    const fallback = getComponentDefinition(legacy);
    assert(Boolean(fallback), `Legacy type [${legacy}] safely falls back`);
    assertEqual(fallback.type, 'hero_text', `Legacy type [${legacy}] resolves to hero_text`);
  });
}

// ─── SUITE 2: Style Utilities & Resolvers ────────────────────────────────────────
console.log('\n--- Suite 2: Style Utilities & Resolvers ---');
{
  const testElement: SceneElement = {
    id: 'style_test_elem',
    type: 'hero_text',
    layoutVariant: 'simple_title_block',
    geometry: {
      x: 100,
      y: 100,
      width: 800,
      height: 200,
      zIndex: 10,
      paddingBox: { top: 25, right: 30, bottom: 25, left: 30, linked: false }
    },
    style: {
      bgMode: 'gradient',
      bgColor: '#1e1b4b',
      gradientColor2: '#0369a1',
      gradientAngle: 90,
      bgOpacity: 0.95,
      backdropBlur: 16,
      borderWidth: 2,
      borderWidths: { top: 4, right: 2, bottom: 4, left: 2, linked: false },
      borderStyle: 'solid',
      borderColor: '#38bdf8',
      borderRadius: 16,
      padding: 24,
      glowColor: '#38bdf8',
      glowIntensity: 12
    },
    cornerRadius: {
      topLeft: 24,
      topRight: 8,
      bottomRight: 24,
      bottomLeft: 8,
      linked: false
    },
    typography: {
      fontFamily: 'Hind Siliguri',
      fontSize: 42,
      fontWeight: '700',
      lineHeight: 1.35,
      textAlign: 'center',
      textColor: '#ffffff',
      highlightColor: '#f59e0b',
      highlightGlow: 20
    },
    animation: {
      stepOrder: 1,
      startAtSecond: 0,
      entrance: 'fadeIn',
      duration: 0.8,
      delay: 0,
      easing: 'spring',
      emphasis: 'none'
    },
    data: {
      text: 'টেস্টিং [হেডলাইন]'
    },
    subStyles: {
      title: {
        typography: {
          fontSize: 48,
          textColor: '#67e8f9',
          textAlign: 'left'
        }
      }
    }
  };

  const resolved = resolveElementStyles(testElement);
  assert(Boolean(resolved.borderRadius), 'Resolved styles include borderRadius');
  assert(Boolean(resolved.background), 'Resolved styles include background');

  // Verify independent 4-corner radius resolution
  assertEqual(
    resolved.borderRadius,
    '24px 8px 24px 8px',
    'Independent 4-corner radius resolved accurately'
  );

  // Verify independent 4-way padding
  assertEqual(
    resolved.padding,
    '25px 30px 25px 30px',
    'Independent 4-way padding box resolved accurately'
  );

  // Verify independent 4-way border widths
  assertEqual(resolved.borderTopWidth, '4px', 'Border top width resolved');
  assertEqual(resolved.borderRightWidth, '2px', 'Border right width resolved');

  // Verify gradient background resolution
  assert(
    typeof resolved.background === 'string' &&
      resolved.background.includes('linear-gradient'),
    'Gradient background generated properly'
  );

  // Verify sub-style title override via getSubPartStyle
  const titleSub = getSubPartStyle(testElement, 'title');
  assertEqual(titleSub.typography?.fontSize, 48, 'Sub-style title fontSize override applied');
  assertEqual(titleSub.typography?.textColor, '#67e8f9', 'Sub-style title textColor override applied');
  assertEqual(titleSub.typography?.textAlign, 'left', 'Sub-style title textAlign override applied');

  // Verify font family CSS mapping
  assertEqual(
    getFontFamilyCss('Kalpurush'),
    "'Kalpurush', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    'getFontFamilyCss Kalpurush'
  );
  assertEqual(
    getFontFamilyCss('JetBrains Mono'),
    "'JetBrains Mono', monospace",
    'getFontFamilyCss JetBrains Mono'
  );

  // Verify Bangla digit conversion
  assertEqual(toBanglaDigit(0), '০', 'toBanglaDigit(0)');
  assertEqual(toBanglaDigit(2026), '২০২৬', 'toBanglaDigit(2026)');
  assertEqual(toBanglaDigit('Scene 3'), 'Scene ৩', 'toBanglaDigit mixed string');
}

// ─── SUITE 3: Voiceover Sync & Pacing Engine ─────────────────────────────────────
console.log('\n--- Suite 3: Voiceover Sync & Pacing Engine ---');
{
  const script = 'ডিজিটাল ইলেকট্রনিক্স কোর্সে স্বাগতম। আজকে আমরা অ্যান্ড গেট শিখব। ইনপুট ১ এবং ১ হলে আউটপুট ১ হবে।';
  const cues = computeVoiceoverCues(script, 12);
  assert(Array.isArray(cues) && cues.length === 3, 'Voice cues parsed 3 sentences from punctuation');
  assertEqual(cues[0], 0, 'First cue starts at 0s');
  assert(cues[1] > cues[0], 'Second cue is after first cue');
  assert(cues[2] > cues[1], 'Third cue is after second cue');
  assert(cues[2] < 12, 'All cues fit within 12s duration');

  // Test syncSceneElementsWithVoiceover
  const testScene: any = {
    id: 'sc_voice_test',
    duration: 15,
    narrationScript: script,
    elements: [
      { id: 'el_1', animation: { stepOrder: 1, startAtSecond: 0, syncWithVoice: true } },
      { id: 'el_2', animation: { stepOrder: 2, startAtSecond: 0, syncWithVoice: true } },
      { id: 'el_3', animation: { stepOrder: 3, startAtSecond: 9.5, syncWithVoice: false } } // manual lock
    ]
  };

  const cues15 = computeVoiceoverCues(script, 15);
  const syncResult = syncSceneElementsWithVoiceover(testScene, false);
  assertEqual(syncResult.updatedElements[0].animation.startAtSecond, cues15[0], 'Element 1 synced to cue 0');
  assertEqual(syncResult.updatedElements[1].animation.startAtSecond, cues15[1], 'Element 2 synced to cue 1');
  assertEqual(syncResult.updatedElements[2].animation.startAtSecond, 9.5, 'Element 3 manual lock preserved');

  // Force all sync
  const forcedSync = syncSceneElementsWithVoiceover(testScene, true);
  assertEqual(forcedSync.updatedElements[2].animation.startAtSecond, cues15[2], 'Force sync updates manual lock');
}

// ─── SUITE 4: Studio Store Core Lifecycle ─────────────────────────────────────────
console.log('\n--- Suite 4: Studio Store Core Lifecycle ---');
{
  const store = useStudioStore.getState();

  // Project title
  store.setProjectTitle('Rex Storyboard Masterclass');
  assertEqual(useStudioStore.getState().project.title, 'Rex Storyboard Masterclass', 'Project title updated');

  // Scene management
  const initialSceneCount = useStudioStore.getState().project.scenes.length;
  store.addScene('New Lesson Intro');
  const afterAddCount = useStudioStore.getState().project.scenes.length;
  assertEqual(afterAddCount, initialSceneCount + 1, 'addScene creates new scene');

  const newScene = useStudioStore.getState().project.scenes[afterAddCount - 1];
  assertEqual(newScene.name, 'New Lesson Intro', 'Scene name matches');

  // Aspect ratio dimensions check
  assertEqual(getSceneDimensions('16:9'), { width: 1920, height: 1080 }, '16:9 dimensions');
  assertEqual(getSceneDimensions('9:16'), { width: 1080, height: 1920 }, '9:16 dimensions');
  assertEqual(getSceneDimensions('1:1'), { width: 1080, height: 1080 }, '1:1 dimensions');

  // Aspect ratio switching & non-destructive layout persistence
  store.updateSceneAspectRatio(newScene.id, '9:16');
  const updatedScene = useStudioStore.getState().project.scenes.find((s) => s.id === newScene.id);
  assertEqual(updatedScene?.aspectRatio, '9:16', 'Scene aspect ratio updated to 9:16');

  // Safe Guard Margins
  store.updateSceneSafeGuard(newScene.id, {
    enabled: true,
    showGuides: true,
    top: 80,
    right: 80,
    bottom: 120,
    left: 80,
    preset: 'youtube_video'
  });
  const sgScene = useStudioStore.getState().project.scenes.find((s) => s.id === newScene.id);
  assertEqual(sgScene?.theme.safeGuard?.top, 80, 'Safe guard top updated');
  assertEqual(sgScene?.theme.safeGuard?.bottom, 120, 'Safe guard bottom updated');
}

// ─── SUITE 5: Element Creation & Placement for All 8 Types ─────────────────────
console.log('\n--- Suite 5: Element Creation for All 8 Types ---');
{
  const store = useStudioStore.getState();
  const activeSceneId = useStudioStore.getState().project.activeSceneId;

  const componentTypes = [
    'hero_text',
    'header_card',
    'footer_card',
    'subtitle_caption',
    'container_box',
    'basic_text',
    'basic_badge',
    'basic_divider'
  ];

  componentTypes.forEach((type) => {
    store.addElement(type);
    const scene = useStudioStore.getState().project.scenes.find((s) => s.id === activeSceneId);
    const added = scene?.elements[scene.elements.length - 1];
    assert(Boolean(added), `Element of type [${type}] added successfully`);
    assertEqual(added?.type, type, `Added element type matches [${type}]`);
    assertEqual(useStudioStore.getState().selectedElementId, added?.id, `Newly added [${type}] is selected`);

    // Smart positioning check:
    if (type === 'header_card') {
      assert(added!.geometry.y <= 120, 'header_card placed at top boundary');
    } else if (type === 'footer_card') {
      const { height: H } = getSceneDimensions(scene?.aspectRatio);
      assert(added!.geometry.y >= H - 240, 'footer_card placed at bottom boundary');
    }
  });
}

// ─── SUITE 6: Geometry Constraints & Auto-Height Fitting ────────────────────────
console.log('\n--- Suite 6: Geometry Constraints & Auto-Height ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;
  const { width: W, height: H } = getSceneDimensions(activeScene.aspectRatio);

  const heroElement = activeScene.elements.find((e) => e.type === 'hero_text')!;
  assert(Boolean(heroElement), 'Found hero_text element for geometry tests');

  // Test Boundary Clamping
  store.updateElementGeometry(heroElement.id, { x: 99999, y: 99999 });
  const clamped = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;

  assert(clamped.geometry.x <= W - clamped.geometry.width, 'X coordinate clamped to right canvas boundary');
  assert(clamped.geometry.y <= H - clamped.geometry.height, 'Y coordinate clamped to bottom canvas boundary');

  // Negative Clamping
  store.updateElementGeometry(heroElement.id, { x: -500, y: -500 });
  const clampedNeg = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assertEqual(clampedNeg.geometry.x, 0, 'Negative X clamped to 0');
  assertEqual(clampedNeg.geometry.y, 0, 'Negative Y clamped to 0');

  // Auto-fit height tests across different component types
  activeScene.elements.forEach((el) => {
    const prevH = el.geometry.height;
    store.autoFitElementHeight(el.id);
    const fitted = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeScene.id)!
      .elements.find((e) => e.id === el.id)!;

    assert(fitted.geometry.height > 0, `Auto-fit height positive for ${el.type}`);
    assert(fitted.geometry.height < H, `Auto-fit height within canvas boundary for ${el.type}`);
  });

  // Hero Text with Subtitle Auto-Height
  store.setElementLayoutVariant(heroElement.id, 'title_with_subtitle');
  store.updateElementData(heroElement.id, {
    subtitle: 'দীর্ঘ সাবটাইটেল যা কার্ডের উচ্চতা বৃদ্ধি নিশ্চিত করে।'
  });
  store.autoFitElementHeight(heroElement.id);
  const fittedWithSub = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assert(fittedWithSub.geometry.height >= 140, 'Hero text with subtitle auto-fit computed extra vertical room');
}

// ─── SUITE 7: Alignment & Stacking Order ─────────────────────────────────────────
console.log('\n--- Suite 7: Alignment & Stacking Order ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;
  const { width: W, height: H } = getSceneDimensions(activeScene.aspectRatio);
  const heroElement = activeScene.elements.find((e) => e.type === 'hero_text')!;

  // Left
  store.alignElement(heroElement.id, 'left');
  let aligned = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assert(aligned.geometry.x >= 0, 'Aligned Left within canvas');

  // Center Horizontal
  store.alignElement(heroElement.id, 'center-h');
  aligned = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  const expectedCenterX = Math.round((W - aligned.geometry.width) / 2);
  assertEqual(aligned.geometry.x, expectedCenterX, 'Center-H aligns to exact horizontal center');

  // Bring to front & send to back
  const prevZ = aligned.geometry.zIndex;
  store.bringToFront(heroElement.id);
  aligned = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assert(aligned.geometry.zIndex > prevZ, 'bringToFront increments zIndex');

  store.sendToBack(heroElement.id);
  aligned = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assert(aligned.geometry.zIndex <= 10, 'sendToBack decreases zIndex to minimum');
}

// ─── SUITE 8: Container Nesting & Flex Auto-Layout ──────────────────────────────
console.log('\n--- Suite 8: Container Nesting & Flex Auto-Layout ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;

  const container = activeScene.elements.find((e) => e.type === 'container_box')!;
  const textElem = activeScene.elements.find((e) => e.type === 'basic_text')!;
  const badgeElem = activeScene.elements.find((e) => e.type === 'basic_badge')!;

  assert(Boolean(container && textElem && badgeElem), 'Found container and child candidates');

  // Nest
  store.nestElementInContainer(textElem.id, container.id);
  store.nestElementInContainer(badgeElem.id, container.id);

  let updatedScene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  let updatedText = updatedScene.elements.find((e) => e.id === textElem.id)!;
  let updatedContainer = updatedScene.elements.find((e) => e.id === container.id)!;

  assertEqual(updatedText.parentId, container.id, 'textElem parentId set to container');
  assert(updatedContainer.data.childIds.includes(textElem.id), 'Container childIds includes textElem');
  assert(updatedContainer.data.childIds.includes(badgeElem.id), 'Container childIds includes badgeElem');

  // Reorder
  store.reorderContainerChildren(container.id, [badgeElem.id, textElem.id]);
  updatedContainer = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === container.id)!;
  assertEqual(updatedContainer.data.childIds[0], badgeElem.id, 'Reordered child 0 is badgeElem');

  // Detach
  store.detachElementFromContainer(textElem.id);
  updatedScene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  updatedText = updatedScene.elements.find((e) => e.id === textElem.id)!;
  updatedContainer = updatedScene.elements.find((e) => e.id === container.id)!;

  assertEqual(updatedText.parentId, undefined, 'textElem parentId cleared on detach');
  assert(!updatedContainer.data.childIds.includes(textElem.id), 'Container childIds no longer contains textElem');
}

// ─── SUITE 9: Sub-Part Styling & Independent Corner Radii ────────────────────────
console.log('\n--- Suite 9: Sub-Part Styling & Corner Radii ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;
  const heroElement = activeScene.elements.find((e) => e.type === 'hero_text')!;

  // Independent 4-corner radius
  store.updateElementCornerRadius(heroElement.id, {
    topLeft: 32,
    topRight: 4,
    bottomRight: 32,
    bottomLeft: 4,
    linked: false
  });

  let el = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;

  assertEqual(el.cornerRadius?.topLeft, 32, 'Corner radius topLeft updated');
  assertEqual(el.cornerRadius?.topRight, 4, 'Corner radius topRight updated');

  // Sub-style title
  store.updateElementSubStyle(heroElement.id, 'title', {
    typography: { fontSize: 64, textColor: '#38bdf8', highlightGlow: 24 }
  });

  el = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;

  assertEqual(el.subStyles?.title?.typography?.fontSize, 64, 'Title subStyle fontSize updated to 64');
  assertEqual(el.subStyles?.title?.typography?.highlightGlow, 24, 'Title highlightGlow updated');

  // Clear sub-style
  store.clearElementSubStyle(heroElement.id, 'title');
  el = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!
    .elements.find((e) => e.id === heroElement.id)!;
  assertEqual(el.subStyles?.title, undefined, 'clearElementSubStyle removed title override');
}

// ─── SUITE 10: Theme Presets & Color Synchronizations ────────────────────────────
console.log('\n--- Suite 10: Theme Presets & Palette Sync ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;

  // Apply cyber_neon preset
  store.applyColorPresetToScene(activeScene.id, 'cyber_neon');
  let scene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  assertEqual(scene.theme.bgPreset, 'cyber_neon', 'Scene theme bgPreset is cyber_neon');

  // Apply light_studio preset
  store.applyColorPresetToScene(activeScene.id, 'light_studio');
  scene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  assertEqual(scene.theme.bgPreset, 'light_studio', 'Scene theme bgPreset is light_studio');

  // Batch sync to all elements
  store.applyThemeColorsToAllElements(scene.id);
  scene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  const headerCard = scene.elements.find((e) => e.type === 'header_card');
  assert(Boolean(headerCard), 'header_card exists for theme synchronization');
}

// ─── SUITE 11: History System (Undo / Redo) ──────────────────────────────────────
console.log('\n--- Suite 11: History System (Undo / Redo) ---');
{
  const store = useStudioStore.getState();
  const initialTitle = useStudioStore.getState().project.title;

  assert(store.canUndo(), 'canUndo is true after previous mutations');

  store.setProjectTitle('History Test Title 1');
  assertEqual(useStudioStore.getState().project.title, 'History Test Title 1', 'Title set to Title 1');

  store.setProjectTitle('History Test Title 2');
  assertEqual(useStudioStore.getState().project.title, 'History Test Title 2', 'Title set to Title 2');

  // Undo back to Title 1
  store.undo();
  assertEqual(
    useStudioStore.getState().project.title,
    'History Test Title 1',
    'undo() restored title to Title 1'
  );

  // Undo back to initialTitle
  store.undo();
  assertEqual(
    useStudioStore.getState().project.title,
    initialTitle,
    'undo() restored initialTitle'
  );

  // Redo forward to Title 1
  store.redo();
  assertEqual(
    useStudioStore.getState().project.title,
    'History Test Title 1',
    'redo() restored title to Title 1'
  );

  // Redo forward to Title 2
  store.redo();
  assertEqual(
    useStudioStore.getState().project.title,
    'History Test Title 2',
    'redo() restored title to Title 2'
  );
}

// ─── SUITE 12: Presets & Templates ───────────────────────────────────────────────
console.log('\n--- Suite 12: Presets & Templates ---');
{
  const store = useStudioStore.getState();
  const activeScene = useStudioStore.getState().project.scenes.find(
    (s) => s.id === useStudioStore.getState().project.activeSceneId
  )!;
  const elToSave = activeScene.elements[0];

  // Save preset
  store.saveElementAsPreset(elToSave.id, 'My Custom Card Preset');
  const presets = useStudioStore.getState().project.savedPresets;
  const saved = presets.find((p) => p.name === 'My Custom Card Preset');
  assert(Boolean(saved), 'Preset saved to savedPresets');
  assertEqual(saved?.componentType, elToSave.type, 'Saved preset componentType matches');

  // Apply preset
  const countBefore = activeScene.elements.length;
  store.applyPreset(saved!);
  const countAfter = useStudioStore.getState().project.scenes
    .find((s) => s.id === activeScene.id)!.elements.length;
  assertEqual(countAfter, countBefore + 1, 'applyPreset created new element on canvas');

  // Delete preset
  store.deletePreset(saved!.id);
  const presetsAfterDel = useStudioStore.getState().project.savedPresets;
  assert(!presetsAfterDel.some((p) => p.id === saved!.id), 'Preset removed after deletePreset');

  // Educational Scene Templates
  store.applyTemplate('hardware_anatomy');
  const hwScene = useStudioStore.getState().project.scenes.find((s) => s.id === activeScene.id)!;
  assert(hwScene.elements.length >= 3, 'hardware_anatomy template applied with >=3 elements');
  assertEqual(hwScene.elements[0].type, 'hero_text', 'Hardware template has hero_text');
}

// ─── SUITE 13: Project JSON Serialization & Import/Export ────────────────────────
console.log('\n--- Suite 13: Project JSON Serialization & Import/Export ---');
{
  const store = useStudioStore.getState();
  const exportedJson = store.exportProjectJson();
  assert(typeof exportedJson === 'string' && exportedJson.length > 100, 'exportProjectJson produces valid string');

  const parsed = JSON.parse(exportedJson);
  assert(Array.isArray(parsed.scenes), 'Exported JSON has scenes array');
  assert(parsed.resolution.width === 1920, 'Exported resolution width is 1920');

  // Round-trip import test
  const importSuccess = store.importProjectJson(exportedJson);
  assert(importSuccess, 'importProjectJson successfully loaded valid JSON');

  const reloadedProject = useStudioStore.getState().project;
  assertEqual(reloadedProject.title, parsed.title, 'Project title matched after import');
  assertEqual(reloadedProject.scenes.length, parsed.scenes.length, 'Scene count matched after import');
}

// ─── SUITE 14: AI Specification Generator ────────────────────────────────────────
console.log('\n--- Suite 14: AI Specification Generator ---');
{
  const activeScene = useStudioStore.getState().project.scenes[0];
  const spec = generateSceneSpec(activeScene, 30);

  assert(spec.includes('# SCENE SPECIFICATION:'), 'Spec has title header');
  assert(spec.includes('VOICEOVER NARRATION'), 'Spec includes voiceover section');
  assert(spec.includes('MASTER CHROME'), 'Spec includes master chrome section');
  assert(spec.includes('ORDERED ANIMATION CHOREOGRAPHY'), 'Spec includes animation choreography');
  assert(spec.includes('REMOTION (REACT / TYPESCRIPT) IMPLEMENTATION BLUEPRINT'), 'Spec includes Remotion code');
  assert(spec.includes('MANIM (PYTHON) IMPLEMENTATION BLUEPRINT'), 'Spec includes Manim Python code');

  // Screen to Manim coordinate conversion
  const manimCoords = screenToManimCoords(100, 100, 400, 200, 1920, 1080);
  assert(typeof manimCoords.manimX === 'string', 'manimX is string');
  assert(typeof manimCoords.manimY === 'string', 'manimY is string');
  assert(typeof manimCoords.manimW === 'string', 'manimW is string');
  assert(typeof manimCoords.manimH === 'string', 'manimH is string');
}

// ─── SUITE 15: Deep Property Inspection Audit Across All 8 Components ─────────────
console.log('\n--- Suite 15: Deep Property Inspection Audit Across All 8 Components ---');
{
  const store = useStudioStore.getState();
  const activeSceneId = useStudioStore.getState().project.activeSceneId;
  const defs = getAllComponentDefinitions();

  defs.forEach((def) => {
    // 1. Add fresh element of this type
    store.addElement(def.type);
    const scene = useStudioStore.getState().project.scenes.find((s) => s.id === activeSceneId)!;
    const el = scene.elements[scene.elements.length - 1];

    console.log(`  -> Testing Inspector Properties for [${def.type}]`);

    // --- Content Tab: Layout Variants ---
    if (def.layoutVariants && def.layoutVariants.length > 0) {
      def.layoutVariants.forEach((v) => {
        store.setElementLayoutVariant(el.id, v.id);
        const currentEl = useStudioStore.getState().project.scenes
          .find((s) => s.id === activeSceneId)!
          .elements.find((e) => e.id === el.id)!;
        assertEqual(currentEl.layoutVariant, v.id, `[${def.type}] layoutVariant switched to ${v.id}`);
      });
    }

    // --- Content Tab: Component Data & Text Content ---
    const testDataMap: Record<string, any> = {
      hero_text: {
        text: 'অডিটেড হিরো টেক্সট [হাইলাইট]',
        subtitle: 'অডিটেড সাবটাইটেল প্যারাগ্রাফ',
        highlightWords: 'হাইলাইট',
        highlightColor: '#f43f5e'
      },
      header_card: {
        title: 'অডিটেড হেডার টাইটেল',
        subtitle: 'অডিটেড চ্যাপ্টার নোট',
        badge: 'ভেরিফায়েড',
        showSubtitle: true,
        showBadge: true,
        badgeBg: 'rgba(244, 63, 94, 0.2)',
        badgeTextColor: '#f43f5e'
      },
      footer_card: {
        note: 'অডিটেড সমীকরণ ও নোট',
        progress: '০৩ / ০৪',
        showProgress: true,
        progressPercent: 75,
        noteColor: '#38bdf8'
      },
      subtitle_caption: {
        title: 'অডিটেড ক্যাপশন শিরোনাম',
        body: 'অডিটেড ক্যাপশন বডি ডেসক্রিপশন টেক্সট।',
        badge: 'সংজ্ঞা',
        showBadge: true,
        showTitle: true,
        accentColor: '#10b981'
      },
      container_box: {
        gap: 28
      },
      basic_text: {
        text: 'সাধারণ টেক্সট কন্টেন্ট অডিট'
      },
      basic_badge: {
        text: 'STATUS: OK'
      },
      basic_divider: {}
    };

    const targetPatch = testDataMap[def.type] || {};
    store.updateElementData(el.id, targetPatch);
    const updatedEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    Object.keys(targetPatch).forEach((k) => {
      assertEqual(updatedEl.data[k], targetPatch[k], `[${def.type}] data.${k} updated accurately`);
    });

    // --- Style Tab: Typography ---
    store.updateElementTypography(el.id, {
      fontFamily: 'Noto Sans Bengali',
      fontSize: 34,
      fontWeight: '600',
      lineHeight: 1.5,
      textAlign: 'center',
      textColor: '#f1f5f9',
      highlightColor: '#fbbf24',
      highlightGlow: 18
    });

    const typoEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(typoEl.typography.fontFamily, 'Noto Sans Bengali', `[${def.type}] typography.fontFamily`);
    assertEqual(typoEl.typography.fontSize, 34, `[${def.type}] typography.fontSize`);
    assertEqual(typoEl.typography.fontWeight, '600', `[${def.type}] typography.fontWeight`);
    assertEqual(typoEl.typography.lineHeight, 1.5, `[${def.type}] typography.lineHeight`);
    assertEqual(typoEl.typography.textAlign, 'center', `[${def.type}] typography.textAlign`);
    assertEqual(typoEl.typography.textColor, '#f1f5f9', `[${def.type}] typography.textColor`);
    assertEqual(typoEl.typography.highlightColor, '#fbbf24', `[${def.type}] typography.highlightColor`);
    assertEqual(typoEl.typography.highlightGlow, 18, `[${def.type}] typography.highlightGlow`);

    // --- Style Tab: Surface & Background ---
    store.updateElementStyle(el.id, {
      bgMode: 'gradient',
      bgColor: '#030712',
      gradientColor2: '#1e1b4b',
      gradientAngle: 60,
      bgOpacity: 0.85,
      backdropBlur: 14
    });

    const bgEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(bgEl.style.bgMode, 'gradient', `[${def.type}] style.bgMode`);
    assertEqual(bgEl.style.bgColor, '#030712', `[${def.type}] style.bgColor`);
    assertEqual(bgEl.style.gradientColor2, '#1e1b4b', `[${def.type}] style.gradientColor2`);
    assertEqual(bgEl.style.gradientAngle, 60, `[${def.type}] style.gradientAngle`);
    assertEqual(bgEl.style.bgOpacity, 0.85, `[${def.type}] style.bgOpacity`);
    assertEqual(bgEl.style.backdropBlur, 14, `[${def.type}] style.backdropBlur`);

    // --- Style Tab: Borders & Frame ---
    store.updateElementStyle(el.id, {
      borderStyle: 'dashed',
      borderColor: '#38bdf8'
    });
    store.updateElementBorderWidths(el.id, {
      top: 3,
      right: 1,
      bottom: 3,
      left: 1,
      linked: false
    });

    const borderEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(borderEl.style.borderStyle, 'dashed', `[${def.type}] style.borderStyle`);
    assertEqual(borderEl.style.borderColor, '#38bdf8', `[${def.type}] style.borderColor`);
    assertEqual(borderEl.style.borderWidths?.top, 3, `[${def.type}] borderWidths.top`);
    assertEqual(borderEl.style.borderWidths?.right, 1, `[${def.type}] borderWidths.right`);

    // --- Style Tab: Independent 4-Corner Radius ---
    store.updateElementCornerRadius(el.id, {
      topLeft: 24,
      topRight: 6,
      bottomRight: 24,
      bottomLeft: 6,
      linked: false
    });

    const cornerEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(cornerEl.cornerRadius?.topLeft, 24, `[${def.type}] cornerRadius.topLeft`);
    assertEqual(cornerEl.cornerRadius?.topRight, 6, `[${def.type}] cornerRadius.topRight`);

    // --- Style Tab: 4-Way Padding Box ---
    store.updateElementPaddingBox(el.id, {
      top: 18,
      right: 22,
      bottom: 18,
      left: 22,
      linked: false
    });

    const padEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(padEl.geometry.paddingBox?.top, 18, `[${def.type}] paddingBox.top`);
    assertEqual(padEl.geometry.paddingBox?.right, 22, `[${def.type}] paddingBox.right`);

    // --- Style Tab: Glow Effect ---
    store.updateElementStyle(el.id, {
      glowColor: '#a855f7',
      glowIntensity: 15
    });

    const glowEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(glowEl.style.glowColor, '#a855f7', `[${def.type}] style.glowColor`);
    assertEqual(glowEl.style.glowIntensity, 15, `[${def.type}] style.glowIntensity`);

    // --- Style Tab: Sub-Part Overrides ---
    if (def.availableSubParts && def.availableSubParts.length > 0) {
      def.availableSubParts.forEach((subPart) => {
        if (subPart !== 'container') {
          store.updateElementSubStyle(el.id, subPart, {
            textColor: '#34d399',
            typography: { fontSize: 38 }
          });

          const subEl = useStudioStore.getState().project.scenes
            .find((s) => s.id === activeSceneId)!
            .elements.find((e) => e.id === el.id)!;

          assertEqual(subEl.subStyles?.[subPart]?.textColor, '#34d399', `[${def.type}] subStyle[${subPart}] textColor`);
          assertEqual(subEl.subStyles?.[subPart]?.typography?.fontSize, 38, `[${def.type}] subStyle[${subPart}] fontSize`);

          // Clear sub-style
          store.clearElementSubStyle(el.id, subPart);
          const clearedEl = useStudioStore.getState().project.scenes
            .find((s) => s.id === activeSceneId)!
            .elements.find((e) => e.id === el.id)!;
          assertEqual(clearedEl.subStyles?.[subPart], undefined, `[${def.type}] clearElementSubStyle(${subPart})`);
        }
      });
    }

    // --- Advanced Tab: Margin Box ---
    store.updateElementMarginBox(el.id, {
      top: 12,
      right: 14,
      bottom: 12,
      left: 14,
      linked: false
    });

    const marginEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(marginEl.geometry.marginBox?.top, 12, `[${def.type}] marginBox.top`);
    assertEqual(marginEl.geometry.marginBox?.right, 14, `[${def.type}] marginBox.right`);

    // --- Advanced Tab: Geometry Exact Coordinates ---
    store.updateElementGeometry(el.id, { x: 120, y: 140, width: 720, height: 180 });
    const geomEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(geomEl.geometry.x, 120, `[${def.type}] geometry.x`);
    assertEqual(geomEl.geometry.y, 140, `[${def.type}] geometry.y`);
    assertEqual(geomEl.geometry.width, 720, `[${def.type}] geometry.width`);
    assertEqual(geomEl.geometry.height, 180, `[${def.type}] geometry.height`);

    // --- Advanced Tab: Canvas Alignments ---
    const aligns = ['left', 'center-h', 'right', 'top', 'center-v', 'bottom'] as const;
    aligns.forEach((al) => {
      store.alignElement(el.id, al);
      const aligned = useStudioStore.getState().project.scenes
        .find((s) => s.id === activeSceneId)!
        .elements.find((e) => e.id === el.id)!;
      assert(aligned.geometry.x >= 0 && aligned.geometry.y >= 0, `[${def.type}] alignElement(${al}) valid position`);
    });

    // --- Advanced Tab: Motion & Voice Sync Spec ---
    // Test 1: Start at Second = 0 (Auto Voice rule)
    store.updateElementAnimation(el.id, {
      stepOrder: 3,
      startAtSecond: 0,
      entrance: 'typewriter',
      duration: 0,
      delay: 0,
      emphasis: 'borderBeam',
      aiNote: 'Prompt for animation engine'
    });

    let animEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(animEl.animation.stepOrder, 3, `[${def.type}] animation.stepOrder`);
    assertEqual(animEl.animation.startAtSecond, 0, `[${def.type}] animation.startAtSecond = 0`);
    assertEqual(animEl.animation.syncWithVoice, true, `[${def.type}] startAtSecond = 0 automatically sets syncWithVoice = true`);
    assertEqual(animEl.animation.entrance, 'typewriter', `[${def.type}] animation.entrance`);
    assertEqual(animEl.animation.duration, 0, `[${def.type}] animation.duration = 0 (Auto)`);
    assertEqual(animEl.animation.delay, 0, `[${def.type}] animation.delay = 0 (Auto)`);
    assertEqual(animEl.animation.emphasis, 'borderBeam', `[${def.type}] animation.emphasis`);
    assertEqual(animEl.animation.aiNote, 'Prompt for animation engine', `[${def.type}] animation.aiNote`);

    // Test 2: Start at Second > 0 (Manual lock rule)
    store.updateElementAnimation(el.id, { startAtSecond: 4.5 });
    animEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;

    assertEqual(animEl.animation.startAtSecond, 4.5, `[${def.type}] animation.startAtSecond manual time`);
    assertEqual(animEl.animation.syncWithVoice, false, `[${def.type}] startAtSecond > 0 automatically marks syncWithVoice = false`);

    // --- Advanced Tab: Director & Review Comments ---
    store.updateElementComments(el.id, 'Director instruction: ensure smooth easing');
    const commentEl = useStudioStore.getState().project.scenes
      .find((s) => s.id === activeSceneId)!
      .elements.find((e) => e.id === el.id)!;
    assertEqual(commentEl.comments, 'Director instruction: ensure smooth easing', `[${def.type}] comments updated`);
  });
}

console.log('\n================================================================');
console.log(`  AUDIT & TEST RESULTS: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests > 0) {
  console.error(`  ${failedTests} tests failed!`);
  failures.forEach((f) => console.error(`   - ${f}`));
  process.exit(1);
} else {
  console.log('  ALL 15 TEST SUITES PASSED CLEANLY WITH ZERO ERRORS! 🚀');
  console.log('================================================================\n');
}
