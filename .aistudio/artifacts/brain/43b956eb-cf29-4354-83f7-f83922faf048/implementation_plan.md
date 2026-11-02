# Revised Architecture & Implementation Plan: Dual-Tier Component System & Elementor-Grade Studio Engine

## Executive Architecture Summary
Refocus the Studio pipeline around a **Dual-Tier Component System**:
1. **Tier 1 (90% of workflow): Pre-Built Smart Components** featuring **4–5 Structural Layout Variations (`layoutVariant`)** that switch actual HTML/SVG layout structures, coupled with **100% Granular Sub-Part Styling Control** (targeting container, header/badge, title, subtitle/body, items/cells, accent/icon independently).
2. **Tier 2 (Custom workflow): `container_box` + Basic Atomic Widgets** (`basic_text`, `basic_badge`, `basic_divider`) allowing users to compose arbitrary nested cards and layouts with Flex/Grid auto-layout and drag-to-nest capability.
3. **Elementor-Grade 3-Tab Inspector (`RightSidebar.tsx`)**:
   - **`📝 Content` Tab**: Visual Layout Variant switcher + Dynamic component data controls + Child management.
   - **`🎨 Style` Tab**: Sub-Part Target selector (`[Main Container]`, `[Header / Badge]`, `[Main Title]`, etc.), full Typography per sub-part (Bangla + Latin), Surface (Solid/Gradient/Blur/Opacity), 4-Corner Border Radius (`TL, TR, BR, BL`), Border Width & Neon Glow, and 1-Click Theme Presets.
   - **`⚙️ Advanced` Tab**: Elementor 4-Way Box Model (Linked/Unlinked Padding & Margin `T, R, B, L`), Exact Geometry & Quick Canvas Alignments, Z-Index, Container nesting/detaching, and Animation Voiceover Timing (`startAtSecond`, `syncWithVoice`, `entrance`, `stagger`, `emphasis`).
4. **Export Engine**: Pixel-accurate 1920x1080 PNG export and dual Remotion (`Flex/Grid` TSX) & Manim (`VGroup.arrange` Python) AI prompt spec.

---

## 1. Type Definitions & Store Architecture (`src/types/studio.ts` & `src/store/studioStore.ts`)

### A. Extended Geometry with 4-Way Box Model
```typescript
export interface BoxModelValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked: boolean;
}

export interface CornerRadiusValues {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  linked: boolean;
}

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  autoHeight?: boolean;
  paddingBox?: BoxModelValues;
  marginBox?: BoxModelValues;
}
```

### B. Sub-Part Targeting & Granular Styling
```typescript
export type SubPartTarget = 
  | 'container'
  | 'badge'
  | 'title'
  | 'body'
  | 'items'
  | 'accent';

export interface SubPartStyle {
  typography?: Partial<Typography>;
  bgColor?: string;
  bgOpacity?: number;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  glowColor?: string;
  glowIntensity?: number;
}

export interface SceneElement {
  id: string;
  type: string;
  layoutVariant?: string; // 4-5 structural variants per smart component
  parentId?: string;      // If nested inside a container_box
  containerSlot?: number; // Position index in flex/grid flow
  containerSizing?: 'auto' | '100%' | 'flex-1' | 'fixed';
  geometry: Geometry;
  style: ElementStyle;
  typography: Typography;
  animation: AnimationChoreography;
  comments?: string;
  data: Record<string, any>;
  subStyles?: Partial<Record<SubPartTarget, SubPartStyle>>;
  cornerRadius?: CornerRadiusValues;
}
```

### C. Store Actions to Add
- `setElementLayoutVariant(id: string, variant: string)`
- `updateElementSubStyle(id: string, target: SubPartTarget, style: SubPartStyle)`
- `updateElementPaddingBox(id: string, padding: BoxModelValues)`
- `updateElementMarginBox(id: string, margin: BoxModelValues)`
- `updateElementCornerRadius(id: string, radius: CornerRadiusValues)`
- `nestElementInContainer(elementId: string, containerId: string)`
- `detachElementFromContainer(elementId: string)`
- `reorderContainerChildren(containerId: string, newOrder: string[])`
- `applyThemePresetToElement(id: string, presetKey: string)`

---

## 2. Dual-Tier Component System (`src/registry/componentRegistry.tsx`)

### Tier 1: 7 Pre-Built Smart Components (Each with 4–5 Structural Variants)

1. **`hero_text` (Smart Header & Typography Window)**:
   - `'standard_stack'`: Centered or left-aligned badge + large title + subtitle.
   - `'numbered_chapter'`: Giant Bangla/English chapter number (`০১` / `01`) with vertical accent bar and side-by-side title stack.
   - `'kinetic_word_box'`: Dynamic highlighted key phrase inside an animated, glowing punch-box card.
   - `'terminal_banner'`: Monospace command-line header with `>_` blinking prompt and tech badge.
   - `'editorial_quote'`: Large stylized quote marks (`“ ”`) with prominent editorial heading and author citation.

2. **`concept_card` (Smart Concept & KPI Card)**:
   - `'blueprint_header_card'`: Top technical title bar with status pill, followed by clean content area.
   - `'glass_card'`: Glassmorphic blurred card with gradient borders and floating icon.
   - `'horizontal_icon_card'`: Left-column icon badge box + right-column title, tags, and description.
   - `'kpi_metric_stat'`: Huge numeric counter with delta percentage badge (`+42%`), status trend arrow, and mini progress meter.
   - `'warning_callout'`: Thick prominent accent left-stripe border, warning/info badge, and callout text.

3. **`dynamic_list` (Smart List, Stepper & Timeline)**:
   - `'bento_card_pills'`: Each item rendered as an individual glass bento tile with icon/number.
   - `'vertical_timeline'`: Connected vertical line with active/completed milestone circular nodes and time tags.
   - `'horizontal_roadmap'`: Left-to-right step-by-step progress cards connected with glowing directional arrows.
   - `'two_col_grid'`: 2-column feature/concept matrix with alternating highlighted cards.
   - `'compact_checklist'`: High-density clean list with custom Bangla/English bullets, checkboxes, or arrows.

4. **`code_formula` (Smart Code & Equation Window)**:
   - `'macos_terminal'`: Native macOS window header with colored red-yellow-green traffic lights, title bar, and dark terminal canvas.
   - `'vscode_tab'`: VS Code style editor tab with file extension icon, line numbers, and selective line-highlighting.
   - `'split_code_output'`: Top/Left code editor box + Bottom/Right simulated terminal output execution console.
   - `'math_formula_box'`: Large centered formula canvas with highlighted symbols and bottom variable legend pills.

5. **`svg_diagram` (Hardware & Logic Schematic)**:
   - Built-in schematics: AND, OR, NOT, NAND, NOR, XOR, Arduino Uno Pinout, 555 Timer IC.
   - Local `.svg` / `.png` upload via FileReader and inline `<svg>` code editor.
   - Variants: `'clean_frame'`, `'labeled_blueprint'` (with technical crosshairs and dimension labels), `'pinout_card'`.

6. **`truth_table` (Dynamic Matrix / Table)**:
   - Variants: `'cyber_grid'` (neon grid lines), `'striped_datasheet'` (alternating row fills with technical headers), `'highlighted_output_col'` (emphasis on the result column).

7. **`callout_pointer` (Directional Pointer & Badge)**:
   - Variants: `'arrow_badge'` (directional SVG arrow pointer), `'pulsing_pin_label'` (radar pulse beacon), `'bracket_annotation'` (dimension brackets enclosing a focal point).

---

### Tier 2: Layout Container & Basic Atomic Widgets

1. **`container_box` (Flex / Grid Layout Container)**:
   - Modes: `flex-row`, `flex-column`, `2-col grid`, `3-col grid`.
   - Properties: `gap` (0-80px), `justifyContent`, `alignItems`, `flexWrap`, full surface background, 4-corner border radius, glow.
   - Top-level containers drag and resize via `react-rnd`.
   - Nested elements (`parentId === container.id`) render sequentially in the Flex/Grid container without coordinate collisions. Each nested item can be reordered up/down, styled, or detached back to the free canvas with 1 click.
2. **`basic_text`**: Lightweight atomic text block (Heading 1-4, Body, Monospace) with full typography controls.
3. **`basic_badge`**: Independent status pill/tag with optional Lucide icon and glow.
4. **`basic_divider`**: Glowing technical separator line (horizontal or vertical, solid/dashed/gradient).

---

## 3. Left Sidebar Organization (`src/components/LeftSidebar.tsx`)
In the **`🧩 Components`** tab, structure the layout into two distinct sections:
- **Header Section**: Search / Filter input.
- **Section A: 🚀 Smart Components (Pre-Built)**: 7 cards with variant count badges (e.g. "5 Variants").
- **Section B: 🧱 Layout & Atomic Widgets**: `container_box`, `basic_text`, `basic_badge`, `basic_divider`.
- **Section C: 💾 Saved Custom Presets**: User's 1-click saved styled components with instant spawn and delete.

---

## 4. Elementor-Grade 3-Tab Inspector (`src/components/RightSidebar.tsx`)

### Tab 1: `📝 Content` Tab
- **Visual Layout Variant Switcher**: Thumbnail grid showing the 4–5 layout options with active highlight. Changing variant updates the component's structure in real-time.
- **Component Data Form**: Tailored inputs for each component (title, subtitle, items list with add/remove/reorder, table matrix, code language, schematic selector).
- **Container Children Manager** (when `container_box` is selected): List of nested children with reorder up/down and "Detach to Canvas" action.

### Tab 2: `🎨 Style` Tab (Full Per-Part & Surface Control)
- **Sub-Part Target Selector**: Interactive pill group `[Main Container]`, `[Header / Badge]`, `[Main Title]`, `[Subtitle / Body]`, `[Items / Cells]`, `[Accent / Icon]`.
- **Target Typography**: Font Family (`Kalpurush`, `Hind Siliguri`, `Noto Sans Bengali`, `Inter`, `JetBrains Mono`), Font Size (10px–140px slider + number input), Weight, Line Height, Letter Spacing, Text Align, Color picker, and Text Glow toggle.
- **Surface & Background**: Solid Color, 2-Stop Gradient (Color 1, Color 2, Angle 0–360°), Opacity slider (0–100%), Glass Backdrop Blur (0–30px).
- **4-Corner Border Radius**: 4 independent inputs (`TL`, `TR`, `BR`, `BL`) with a "Link" toggle icon.
- **Border & Glow**: Border width (0–12px), Border style (`solid`, `dashed`, `dotted`, `none`), Border color, Box Neon Glow (color + intensity slider).
- **1-Click Theme Presets**: Quick palette buttons (`Cyber Cyan`, `Emerald Logic`, `Amber Warning`, `Minimal Slate`, `Purple Neon`).

### Tab 3: `⚙️ Advanced` Tab (Box Model, Geometry & Motion)
- **Elementor 4-Way Box Model**:
  - **Padding Box**: 4 inputs (`Top`, `Right`, `Bottom`, `Left`) + Link toggle (0–120px).
  - **Margin Box**: 4 inputs (`Top`, `Right`, `Bottom`, `Left`) + Link toggle (-40px to 120px).
- **Geometry & Alignment**:
  - Exact `X`, `Y`, `Width`, `Height` numerical inputs.
  - Quick Canvas Alignment buttons (`Left`, `Center H`, `Right`, `Top`, `Center V`, `Bottom`).
  - `Z-Index` order up/down, `Auto Height` toggle.
  - Parent Container status: Display parent container name if nested, with "Detach to Canvas" button; or dropdown to assign to an existing `container_box`.
- **Animation Choreography & Voice Sync**:
  - `stepOrder` (sequence number).
  - `startAtSecond` (lock to exact voiceover timestamp).
  - `syncWithVoice` (auto-sync with narration script cues).
  - `entrance` animation preset (`fadeIn`, `slideUp`, `scaleSpring`, `typewriter`, etc.).
  - `duration`, `stagger`, `emphasis` (pulse, borderBeam, float).
  - Remotion / Manim custom AI prompt note.

---

## 5. Dual AI Spec Exporters (`src/utils/specGenerator.ts`)
- **Remotion Export**:
  - Map `container_box` to `<div style={{ display: 'flex', flexDirection, gap, ... }}>`.
  - Nested elements rendered inside their container block with relative sizing (`flex-1` or `width: 100%`).
  - Top-level elements rendered with `<AbsoluteFill>` and exact `style={{ left, top, width, height }}`.
  - Output exact `layoutVariant` and per-part styles.
  - Convert `startAtSecond` to exact frame start: `const startFrame = ${Math.round(startAtSecond * 30)};`.
- **Manim Export**:
  - Map `container_box` to `VGroup(*[...children]).arrange(RIGHT/DOWN, buff=...)`.
  - Include structural variant comments and animation commands: `self.play(FadeIn(...), run_time=${duration})` with `self.wait(${startAtSecond})`.

---

## 6. Verification & Validation Steps
1. **Compilation**: Run `compile_applet` and verify 0 TypeScript / Vite bundle errors.
2. **Linting**: Run `lint_applet` to check for unused imports or formatting issues.
3. **Interactive Testing**:
   - Verify all 7 smart components render with their 4–5 layout variants.
   - Verify `container_box` layout flow and child nesting.
   - Verify the 3-tab Right Inspector with sub-part styling, 4-corner radius, and 4-way box model.
   - Test PNG snapshot at 1920x1080 resolution.
   - Verify Remotion / Manim code generation includes container groups and variant structures.
