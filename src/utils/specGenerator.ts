import { Scene, SceneElement, ProjectData, getSceneDimensions } from '../types/studio';
import { getComponentDefinition } from '../registry/componentRegistry';

/**
 * Translates screen pixels to Manim 2D camera coordinates
 */
export function screenToManimCoords(
  x: number,
  y: number,
  w: number,
  h: number,
  canvasWidth: number = 1920,
  canvasHeight: number = 1080
) {
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const manimX = ((centerX - canvasWidth / 2) / 100).toFixed(2);
  const manimY = ((canvasHeight / 2 - centerY) / 100).toFixed(2);
  const manimW = (w / 100).toFixed(2);
  const manimH = (h / 100).toFixed(2);
  return { manimX, manimY, manimW, manimH };
}

/**
 * Generates structured Markdown + JSON specification for a single active scene
 */
export function generateSceneSpec(scene: Scene, projectFps: number = 30): string {
  const { width: canvasWidth, height: canvasHeight } = getSceneDimensions(scene.aspectRatio);
  const ratioLabel =
    scene.aspectRatio === '9:16'
      ? '9:16 Vertical (Shorts/Reels/TikTok)'
      : scene.aspectRatio === '1:1'
        ? '1:1 Square'
        : '16:9 Landscape (Full HD)';

  // Sort elements by startAtSecond (primary) then stepOrder (secondary)
  const sortedElements = [...scene.elements].sort((a, b) => {
    const timeA = a.animation.startAtSecond ?? 0;
    const timeB = b.animation.startAtSecond ?? 0;
    if (timeA !== timeB) return timeA - timeB;
    return a.animation.stepOrder - b.animation.stepOrder;
  });

  let doc = `# SCENE SPECIFICATION: "${scene.name.toUpperCase()}"\n`;
  doc += `- **Canvas Resolution**: ${canvasWidth} x ${canvasHeight} px (${ratioLabel})\n`;
  doc += `- **Aspect Ratio**: \`${scene.aspectRatio || '16:9'}\`\n`;
  doc += `- **Target Framerate**: ${projectFps} fps\n`;
  doc += `- **Scene Duration**: ${scene.duration} seconds (${scene.duration * projectFps} frames) [${scene.autoDuration ? 'Auto-synced with voiceover script' : 'Manual duration'}]\n`;
  if (scene.sceneComments?.trim()) {
    doc += `- **Scene Director & Review Notes**:\n> ${scene.sceneComments.trim().replace(/\n/g, '\n> ')}\n`;
  }
  doc += `- **Background Preset**: \`${scene.theme.bgPreset}\` (${scene.theme.customBgColor || '#0d1117'})\n`;
  if (scene.theme.safeGuard?.enabled) {
    const sg = scene.theme.safeGuard;
    doc += `- **Safe Guard Margins**: Top: ${sg.top}px, Right: ${sg.right}px, Bottom: ${sg.bottom}px, Left: ${sg.left}px (Preset: \`${sg.preset || 'custom'}\`)\n`;
  }
  doc += `- **Grid Overlay**: ${scene.theme.gridEnabled ? `Type: ${scene.theme.gridType}, Size: ${scene.theme.gridSize}px, Color: ${scene.theme.gridColor} (${Math.round(scene.theme.gridOpacity * 100)}% opacity)` : 'Disabled'}\n\n`;

  // Voiceover Narration Section
  doc += `## 1. VOICEOVER NARRATION & TIMELINE SCRIPT\n`;
  if (scene.narrationScript.trim()) {
    doc += `\`\`\`text\n${scene.narrationScript.trim()}\n\`\`\`\n\n`;
  } else {
    doc += `*(No voiceover script provided for this scene)*\n\n`;
  }

  // Master Frame Chrome
  doc += `## 2. MASTER CHROME & FIXED CONTAINERS\n`;
  if (scene.masterHeader.enabled) {
    const headerPosDesc = scene.masterHeader.maintainSafeGuard !== false && scene.theme.safeGuard?.enabled
      ? `Positioned strictly inside Safe Guard (Top: ${scene.theme.safeGuard.top}px, Left: ${scene.theme.safeGuard.left}px, Right: ${scene.theme.safeGuard.right}px)`
      : `Position: ${scene.masterHeader.layoutMode === 'floating' ? 'Floating (Top: 24px)' : 'Top Banner (0px)'}`;
    doc += `- **Master Header Card** (Layout: \`${scene.masterHeader.layoutMode || 'banner'}\`, Height: ${scene.masterHeader.height}px, Radius: ${scene.masterHeader.borderRadius ?? 0}px, Padding: ${scene.masterHeader.paddingX ?? 32}px)\n`;
    doc += `  - Alignment: ${headerPosDesc}\n`;
    doc += `  - Left Title: "${scene.masterHeader.title}" (Font: ${scene.masterHeader.titleFontSize ?? 24}px)\n`;
    if (scene.masterHeader.showSubtitle !== false && scene.masterHeader.subtitle) {
      doc += `  - Center Subtitle: "${scene.masterHeader.subtitle}"\n`;
    }
    if (scene.masterHeader.showBadge !== false && scene.masterHeader.badge) {
      doc += `  - Right Badge: "${scene.masterHeader.badge}" (Bg: \`${scene.masterHeader.badgeBg}\`, Text: \`${scene.masterHeader.badgeTextColor}\`)\n`;
    }
    doc += `  - Styling: Bg: \`${scene.masterHeader.bgColor}\`, Border: \`${scene.masterHeader.borderColor}\`, Blur: \`${scene.masterHeader.blur ?? 12}px\`\n`;
  } else {
    doc += `- Master Header Card: Disabled\n`;
  }

  if (scene.masterFooter.enabled) {
    const footerPosDesc = scene.masterFooter.maintainSafeGuard !== false && scene.theme.safeGuard?.enabled
      ? `Positioned strictly inside Safe Guard (Bottom: ${scene.theme.safeGuard.bottom}px, Left: ${scene.theme.safeGuard.left}px, Right: ${scene.theme.safeGuard.right}px)`
      : `Position: ${scene.masterFooter.layoutMode === 'floating' ? 'Floating (Bottom: 24px)' : 'Bottom Banner (0px)'}`;
    doc += `- **Master Footer Card** (Layout: \`${scene.masterFooter.layoutMode || 'banner'}\`, Height: ${scene.masterFooter.height}px, Radius: ${scene.masterFooter.borderRadius ?? 0}px, Padding: ${scene.masterFooter.paddingX ?? 32}px)\n`;
    doc += `  - Alignment: ${footerPosDesc}\n`;
    doc += `  - Left Note: "${scene.masterFooter.note}" (Font: ${scene.masterFooter.noteFontSize ?? 16}px)\n`;
    if (scene.masterFooter.showProgress !== false && scene.masterFooter.progress) {
      doc += `  - Right Step: "${scene.masterFooter.progress}"\n`;
    }
    doc += `  - Styling: Bg: \`${scene.masterFooter.bgColor}\`, Border: \`${scene.masterFooter.borderColor}\`\n\n`;
  } else {
    doc += `- Master Footer Card: Disabled\n\n`;
  }

  // Elements Step-by-Step Choreography
  doc += `## 3. ORDERED ANIMATION CHOREOGRAPHY (SORTED BY TIMELINE)\n`;
  sortedElements.forEach((el, index) => {
    const def = getComponentDefinition(el.type);
    const startSec = el.animation.startAtSecond ?? 0;
    const effectiveDuration = el.animation.duration === 0 ? 0.8 : (el.animation.duration ?? 0.8);
    const startFrame = Math.round(startSec * projectFps);
    const endFrame = Math.round((startSec + effectiveDuration) * projectFps);
    const { manimX, manimY, manimW, manimH } = screenToManimCoords(
      el.geometry.x,
      el.geometry.y,
      el.geometry.width,
      el.geometry.height,
      canvasWidth,
      canvasHeight
    );

    doc += `### Step ${el.animation.stepOrder} [Index #${index + 1}]: \`${el.type}\` (ID: \`${el.id}\`)\n`;
    if (el.layoutVariant) {
      doc += `- **Structural Layout Variant**: \`${el.layoutVariant}\`\n`;
    }
    if (el.parentId) {
      doc += `- **Parent Layout Container**: Nested inside Container \`${el.parentId}\`\n`;
    }
    doc += `- **Timeline Lock**: Start at **${startSec}s** (Frame **${startFrame}** to **${endFrame}** at ${projectFps}fps) [Voice Sync: ${el.animation.syncWithVoice !== false ? 'Enabled (Auto-synced with voiceover)' : 'Manual Override'}]\n`;
    doc += `- **Pixel Geometry**: \`x: ${el.geometry.x}px, y: ${el.geometry.y}px, w: ${el.geometry.width}px, h: ${el.geometry.height}px, zIndex: ${el.geometry.zIndex}\`\n`;
    if (el.geometry.paddingBox) {
      const p = el.geometry.paddingBox;
      doc += `- **Padding Box**: Top: ${p.top}px, Right: ${p.right}px, Bottom: ${p.bottom}px, Left: ${p.left}px\n`;
    }
    if (el.geometry.marginBox) {
      const m = el.geometry.marginBox;
      doc += `- **Margin Box**: Top: ${m.top}px, Right: ${m.right}px, Bottom: ${m.bottom}px, Left: ${m.left}px\n`;
    }
    if (el.cornerRadius) {
      const r = el.cornerRadius;
      doc += `- **Corner Radius**: TL: ${r.topLeft}px, TR: ${r.topRight}px, BR: ${r.bottomRight}px, BL: ${r.bottomLeft}px\n`;
    }
    if (el.style.borderWidths) {
      const bw = el.style.borderWidths;
      doc += `- **Individual Border Widths**: Top: ${bw.top}px, Right: ${bw.right}px, Bottom: ${bw.bottom}px, Left: ${bw.left}px\n`;
    }
    if (el.subStyles && Object.keys(el.subStyles).length > 0) {
      doc += `- **Granular Sub-Part Styles**: \`${JSON.stringify(el.subStyles)}\`\n`;
    }
    doc += `- **Manim Coordinates**: \`pos: [${manimX}, ${manimY}, 0], size: [${manimW}, ${manimH}]\`\n`;
    doc += `- **Typography**: Font \`${el.typography.fontFamily}\`, Size \`${el.typography.fontSize}px\`, Weight \`${el.typography.fontWeight}\`, Color \`${el.typography.textColor}\`\n`;
    doc += `- **Surface & Glow**: Mode \`${el.style.bgMode}\`, Bg \`${el.style.bgColor}\`, Border \`${el.style.borderWidth}px ${el.style.borderStyle} ${el.style.borderColor}\`, Radius \`${el.style.borderRadius}px\`, Glow \`${el.style.glowColor} (${el.style.glowIntensity}%)\`\n`;
    const durDesc = el.animation.duration === 0 ? 'Auto (Voice Sync)' : `${el.animation.duration}s`;
    const delayDesc = el.animation.delay === 0 ? '0s (Auto)' : `${el.animation.delay}s`;
    doc += `- **Motion Parameters**: Entrance \`${el.animation.entrance}\`, Duration \`${durDesc}\`, Delay \`${delayDesc}\`, Easing \`${el.animation.easing}\`, Stagger \`${el.animation.stagger ?? 0}s\`, Emphasis \`${el.animation.emphasis}\`\n`;
    if (el.animation.aiNote) {
      doc += `- **AI Animation Note**: *"${el.animation.aiNote}"*\n`;
    }
    if (el.comments?.trim()) {
      doc += `- **Card Review & Animator Notes**: *"${el.comments.trim()}"*\n`;
    }
    doc += `- **Structured Content & Component Data**:\n${def.specFormatter(el)}\n\n`;
  });

  // Remotion Code Mapping
  doc += `## 4. REMOTION (REACT / TYPESCRIPT) IMPLEMENTATION BLUEPRINT\n`;
  doc += `\`\`\`tsx\n`;
  doc += `// Remotion Scene Component for "${scene.name}" (${canvasWidth}x${canvasHeight} ${ratioLabel})\n`;
  doc += `import { AbsoluteFill, Sequence, spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';\n\n`;
  doc += `export const Scene_${scene.id.replace(/[^a-zA-Z0-9]/g, '_')}: React.FC = () => {\n`;
  doc += `  const frame = useCurrentFrame();\n`;
  doc += `  const { fps } = useVideoConfig();\n\n`;
  doc += `  return (\n`;
  doc += `    <AbsoluteFill style={{ width: ${canvasWidth}, height: ${canvasHeight}, backgroundColor: '${scene.theme.customBgColor || '#0d1117'}' }}>\n`;
  sortedElements.forEach((el) => {
    const startSec = el.animation.startAtSecond ?? 0;
    const startFrame = Math.round(startSec * projectFps);
    const durationFrames = Math.round(el.animation.duration * projectFps);
    const isContainer = el.type === 'container_box';
    const isGrid = el.layoutVariant?.startsWith('grid');
    const isCol = el.layoutVariant === 'flex_column';

    doc += `      {/* Step ${el.animation.stepOrder}: ${el.type} (${el.id}) | Variant: ${el.layoutVariant || 'default'} */}\n`;
    doc += `      <Sequence from={${startFrame}} durationInFrames={${Math.max(durationFrames, (scene.duration - startSec) * projectFps)}}>\n`;
    doc += `        <div style={{\n`;
    doc += `          position: '${el.parentId ? 'relative' : 'absolute'}',\n`;
    if (!el.parentId) {
      doc += `          left: ${el.geometry.x},\n`;
      doc += `          top: ${el.geometry.y},\n`;
    }
    doc += `          width: ${el.geometry.width},\n`;
    doc += `          height: ${el.geometry.height},\n`;
    doc += `          zIndex: ${el.geometry.zIndex},\n`;
    if (isContainer) {
      doc += `          display: '${isGrid ? 'grid' : 'flex'}',\n`;
      doc += `          flexDirection: '${isCol ? 'column' : 'row'}',\n`;
      doc += `          gap: ${el.data?.gap ?? 16},\n`;
    }
    doc += `          borderRadius: ${el.style.borderRadius},\n`;
    if (el.style.borderWidths) {
      const bw = el.style.borderWidths;
      doc += `          borderTop: '${bw.top}px ${el.style.borderStyle} ${el.style.borderColor}',\n`;
      doc += `          borderRight: '${bw.right}px ${el.style.borderStyle} ${el.style.borderColor}',\n`;
      doc += `          borderBottom: '${bw.bottom}px ${el.style.borderStyle} ${el.style.borderColor}',\n`;
      doc += `          borderLeft: '${bw.left}px ${el.style.borderStyle} ${el.style.borderColor}',\n`;
    } else {
      doc += `          border: '${el.style.borderWidth}px ${el.style.borderStyle} ${el.style.borderColor}',\n`;
    }
    doc += `          backgroundColor: '${el.style.bgColor}',\n`;
    doc += `          boxShadow: '0 0 ${el.style.glowIntensity}px ${el.style.glowColor}'\n`;
    doc += `        }}>\n`;
    doc += `          {/* Render ${el.type} with variant: ${el.layoutVariant || 'standard'} & entrance: ${el.animation.entrance} */}\n`;
    doc += `        </div>\n`;
    doc += `      </Sequence>\n`;
  });
  doc += `    </AbsoluteFill>\n`;
  doc += `  );\n};\n\`\`\`\n\n`;

  // Manim Python Code Mapping
  doc += `## 5. MANIM (PYTHON) IMPLEMENTATION BLUEPRINT\n`;
  doc += `\`\`\`python\n`;
  doc += `from manim import *\n\n`;
  doc += `class Scene_${scene.id.replace(/[^a-zA-Z0-9]/g, '_')}(Scene):\n`;
  doc += `    def construct(self):\n`;
  doc += `        # Background and camera configured for ${canvasWidth}x${canvasHeight} (${ratioLabel})\n`;
  doc += `        self.camera.background_color = "${scene.theme.customBgColor || '#0d1117'}"\n\n`;
  sortedElements.forEach((el) => {
    const { manimX, manimY, manimW, manimH } = screenToManimCoords(
      el.geometry.x,
      el.geometry.y,
      el.geometry.width,
      el.geometry.height,
      canvasWidth,
      canvasHeight
    );
    const startSec = el.animation.startAtSecond ?? 0;
    doc += `        # Step ${el.animation.stepOrder} [${startSec}s]: ${el.type} (Variant: ${el.layoutVariant || 'standard'})\n`;
    if (el.type === 'container_box') {
      doc += `        elem_${el.id.replace(/[^a-zA-Z0-9]/g, '_')} = VGroup().arrange(RIGHT, buff=0.25).move_to([${manimX}, ${manimY}, 0])\n`;
    } else {
      doc += `        elem_${el.id.replace(/[^a-zA-Z0-9]/g, '_')} = RoundedRectangle(\n`;
      doc += `            width=${manimW}, height=${manimH}, corner_radius=${(el.style.borderRadius / 100).toFixed(2)},\n`;
      doc += `            color="${el.style.borderColor.startsWith('#') ? el.style.borderColor : '#38bdf8'}",\n`;
      doc += `            fill_color="${el.style.bgColor.startsWith('#') ? el.style.bgColor : '#0f172a'}", fill_opacity=${el.style.bgOpacity}\n`;
      doc += `        ).move_to([${manimX}, ${manimY}, 0])\n`;
    }
    if (startSec > 0) {
      doc += `        self.wait(${startSec})\n`;
    }
    if (el.animation.entrance === 'drawSvgStroke') {
      doc += `        self.play(Create(elem_${el.id.replace(/[^a-zA-Z0-9]/g, '_')}), run_time=${el.animation.duration})\n`;
    } else if (el.animation.entrance === 'scaleSpring') {
      doc += `        self.play(GrowFromCenter(elem_${el.id.replace(/[^a-zA-Z0-9]/g, '_')}), run_time=${el.animation.duration})\n`;
    } else {
      doc += `        self.play(FadeIn(elem_${el.id.replace(/[^a-zA-Z0-9]/g, '_')}), run_time=${el.animation.duration})\n`;
    }
  });
  doc += `        self.wait(${Math.max(2, scene.duration - (sortedElements[sortedElements.length - 1]?.animation.startAtSecond ?? 0))})\n`;
  doc += `\`\`\`\n\n`;

  // Raw JSON block
  doc += `## 6. RAW JSON SCENE GRAPH\n`;
  doc += `\`\`\`json\n`;
  doc += JSON.stringify(scene, null, 2);
  doc += `\n\`\`\`\n`;

  return doc;
}

/**
 * Generates full project multi-scene specification
 */
export function generateFullProjectSpec(project: ProjectData): string {
  let doc = `# MASTER VIDEO SPECIFICATION: "${project.title.toUpperCase()}"\n`;
  doc += `- **Target Platform**: Remotion & Manim Animation Engine\n`;
  doc += `- **Resolution**: ${project.resolution.width} x ${project.resolution.height} px\n`;
  doc += `- **Framerate**: ${project.fps} fps\n`;
  doc += `- **Total Scenes**: ${project.scenes.length}\n`;
  const totalDuration = project.scenes.reduce((acc, s) => acc + s.duration, 0);
  doc += `- **Total Estimated Runtime**: ${totalDuration} seconds (~${(totalDuration / 60).toFixed(1)} minutes)\n\n`;

  doc += `## SCENE BREAKDOWN OVERVIEW\n`;
  project.scenes.forEach((s, idx) => {
    doc += `${idx + 1}. **${s.name}** — ${s.duration}s | Elements: ${s.elements.length} | Narration: "${s.narrationScript.slice(0, 60)}..."\n`;
  });
  doc += `\n---\n\n`;

  project.scenes.forEach((s) => {
    doc += generateSceneSpec(s, project.fps);
    doc += `\n\n---\n\n`;
  });

  return doc;
}
