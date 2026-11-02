# Rex Storyboard (VSSS) 🎬✨
### Visual Storyboard Studio for Educational Motion Graphics, Remotion & Manim

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-orange)](https://github.com/pmndrs/zustand)
[![Tests Passing](https://img.shields.io/badge/Tests-702%20Passed%20(100%25)-brightgreen)](scripts/runE2eTests.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Rex Storyboard (VSSS)** is a high-performance visual storyboard and animation choreography studio designed for educators, technical content creators, and motion graphics animators. Build slide-by-slide storyboard scenes, visually choreograph animations to Bengali or English voiceover scripts, and generate production-ready **Remotion (React)** and **Manim (Python)** code blueprints in seconds.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Canvas & Navigation Engine](#-canvas--navigation-engine)
- [Component Library (Dual-Tier Architecture)](#-component-library-dual-tier-architecture)
- [Inspector Architecture (3-Tab System)](#-inspector-architecture-3-tab-system)
- [Voiceover Synchronization & Audio Pacing](#-voiceover-synchronization--audio-pacing)
- [Code Generation (Remotion & Manim)](#-code-generation-remotion--manim)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Getting Started](#-getting-started)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Key Features

- **Infinite Interactive Artboard**: Smooth GPU-accelerated 120fps pan and specific-point zoom centered on the cursor.
- **Multi-Aspect Ratio Support**: Switch non-destructively between **16:9 Landscape** (1920x1080), **9:16 Vertical** (1080x1920 for Shorts/Reels/TikTok), and **1:1 Square** (1080x1080) with independent layout caching.
- **Title Safe Areas & Broadcast Guides**: Customizable margin guides for YouTube, TikTok, and standard broadcast with 1-click automatic boundary fitting.
- **Dual-Tier Component Architecture**: Pre-built Smart Educational Cards alongside atomic Flex/Grid containers and building blocks.
- **Elementor-Style Property Inspector**: Granular sub-part targeting (`container`, `title`, `body`, `badge`, `accent`) with 4-way box models and 4-corner independent radii.
- **Voiceover Pacing Engine**: Auto-syncs motion timing directly from narration scripts using linguistic punctuation analysis (Bengali `।`, commas, periods).
- **Instant Code Blueprints**: 1-click export to **Remotion (React/TypeScript)** and **Manim (Python)** syntax with accurate 2D camera coordinates.
- **Offline Persistence & History**: Debounced IndexedDB auto-save, 40-step undo/redo stack, and lossless `.vsss.json` import/export.

---

## 🖥️ Canvas & Navigation Engine

| Capability | How It Works |
| :--- | :--- |
| **Cursor-Point Zoom** | `Ctrl + Wheel` or pinch zooms smoothly into the exact point under the mouse cursor (`15%` to `250%`). |
| **Buttery Pan Tool** | Hold `Space` + drag, middle-click drag, or use the floating Hand tool widget. |
| **Trackpad / Scroll Pan** | Two-finger scroll or `Shift + Wheel` moves the entire frame horizontally and vertically. |
| **Auto-Fit to Screen** | Calculates available viewport space with 56px breathing room; accessible via toolbar or `Maximize` button. |
| **Smart Quick Menu** | Floating action capsule over selected elements with `Auto Height ↕`, `Copy (Ctrl+D)`, and `Delete`. Automatically flips above or below the element to prevent clipping. |
| **Preview Presentation Mode** | Press `P` or click `Preview` to enter fullscreen distraction-free presentation with `←` / `→` scene navigation. |

---

## 🧩 Component Library (Dual-Tier Architecture)

Rex Storyboard organizes components into **Smart Pre-Built Components** and **Atomic Building Blocks**:

### 1. Smart Components (Pre-Built)
- **`hero_text` (Hero Header Block)**:
  - *Variants*: `simple_title_block`, `title_with_subtitle`
  - *Features*: Bracket parsing (`[word]` highlights), word-specific highlight accent, glow effects, and secondary subtitle paragraphs.
- **`header_card` (Header Card)**:
  - *Variants*: `floating_pill`, `top_bar`, `minimal_headline`
  - *Features*: Module headline, explanatory chapter note, and category status pill.
- **`footer_card` (Footer Card)**:
  - *Variants*: `floating_pill`, `bottom_bar`, `progress_bar`
  - *Features*: Bottom key takeaway note, progress counter (`ধাপ ০১ / ০৪`), and visual accent progress bars.
- **`subtitle_caption` (Subtitle & Caption Card)**:
  - *Variants*: `callout_quote`, `caption_pill`, `standard_subtitle`, `key_takeaway`
  - *Features*: Stylized left accent bar, quote icon, title headline, and rich body explanation.

### 2. Layout & Atomic Widgets
- **`container_box`**: Auto-layout flex/grid container supporting `flex_row`, `flex_column`, `grid_2col`, and `grid_3col` with customizable gaps. Supports child nesting and drag reordering.
- **`basic_text`**: Lightweight text building block for freeform paragraphs.
- **`basic_badge`**: Compact status pills and tags.
- **`basic_divider`**: Glowing horizontal separator lines.

---

## 🎛️ Inspector Architecture (3-Tab System)

The right sidebar provides deep control organized into three tabs:

```
┌───────────────────────────────────────────────┐
│                   INSPECTOR                   │
├───────────────┬───────────────┬───────────────┤
│    Content    │     Style     │   Advanced    │
└───────────────┴───────────────┴───────────────┘
```

### 1. Content Tab
- **Structural Layout Variant**: 1-click switching between component variations.
- **Component Data & Text**: Dynamic fields per component (titles, bracket-highlights, badges, subtitle toggles).
- **Container Slot Manager**: Displays parent nesting status and provides a 1-click **Detach to Canvas** button.

### 2. Style Tab (Elementor-Style Sub-Part Targeting)
- **Sub-Part Target Selector**: Choose whether styles apply globally to the `Box / Frame` or granularly override `Headline / Title`, `Body Text`, `Badge Pill`, or `Highlight Accent`.
- **Typography**: 5 font families (`Kalpurush`, `Hind Siliguri`, `Noto Sans Bengali`, `Inter`, `JetBrains Mono`), font size (`12px` to `120px`), weight (`400`–`800`), line height (`1.0`–`2.5×`), text color, highlight color, highlight glow (`0`–`32px`), and text alignment (`left`, `center`, `right`).
- **Surface & Background**: `solid`, `gradient`, or `transparent` modes with 360° gradient angles, opacity, and backdrop blur.
- **Borders & Frame**: `solid`, `dashed`, `dotted`, or `none` with independent 4-way border widths (`top`, `right`, `bottom`, `left`).
- **4-Corner Independent Radius**: Unlink corners to craft asymmetric pill designs (`topLeft`, `topRight`, `bottomRight`, `bottomLeft`).
- **4-Way Padding Box**: Independent padding model for precise internal spacing.
- **Card Glow Intensity**: Neon glow styling with customizable color and spread radius.

### 3. Advanced Tab
- **4-Way Margin Box**: External margin offsets with linked/unlinked mode.
- **Exact Geometry**: Pixel-accurate `X`, `Y`, `W`, `H` inputs with canvas boundary clamping.
- **1-Click Auto Height (↕)**: Intelligently calculates text line count, font size, line-height, and padding to fit cards perfectly.
- **Canvas Align**: 1-click alignment buttons (`Left`, `Ctr H`, `Right`, `Top`, `Ctr V`, `Btm`).
- **Stacking Order**: `Bring to Front` and `Send to Back` z-index layering.
- **Motion & Voice Sync Spec**: Step order, entrance animation (`fadeIn`, `slideUp`, `slideLeft`, `slideRight`, `scaleSpring`, `drawSvgStroke`, `typewriter`), duration, delay, and emphasis (`pulseGlow`, `borderBeam`, `float`).
- **Review Notes**: Director feedback and animation prompts saved per element.

---

## 🎙️ Voiceover Synchronization & Audio Pacing

Rex Storyboard eliminates tedious manual timeline adjustments:

1. **Intelligent Script Parsing**: Paste your Bengali or English script into the bottom bar. The engine splits sentences using native punctuation (`।`, `,`, `.`, `?`, `!`) and computes pacing based on speech rate.
2. **Auto-Sync Rule**:
   - Setting **`Start at Second = 0`**, **`Duration = 0`**, or **`Delay = 0`** automatically binds the element's entrance to the corresponding voiceover sentence.
3. **Manual Director Lock**:
   - Setting a specific start second (`> 0s`) locks the timestamp manually, preventing automatic voice syncing from overriding intentional timing.
4. **1-Click Sync**: Click **`⚡ Sync Voice to Elements`** anytime you adjust script pacing.

---

## ⚡ Code Generation (Remotion & Manim)

Every scene automatically generates ready-to-use production animation code:

### Remotion (React / TypeScript) Blueprint
```tsx
import { AbsoluteFill, Sequence, spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene_intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, backgroundColor: '#0d1117' }}>
      {/* Step 1: hero_text | Variant: simple_title_block */}
      <Sequence from={0} durationInFrames={75}>
        <div style={{
          position: 'absolute',
          left: 140,
          top: 160,
          width: 840,
          height: 160,
          borderRadius: 16,
          backgroundColor: '#0f172a',
          boxShadow: '0 0 10px #38bdf8'
        }}>
          {/* Card content & animations */}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Manim (Python) Blueprint
```python
from manim import *

class Scene_intro(Scene):
    def construct(self):
        self.camera.background_color = "#0d1117"

        # Step 1 [0s]: hero_text (pos: [-4.00, 3.00, 0], size: [8.40, 1.60])
        elem_hero = RoundedRectangle(
            width=8.40, height=1.60, corner_radius=0.16,
            color="#38bdf8", fill_opacity=0.9
        ).move_to([-4.00, 3.00, 0])
        
        self.play(FadeIn(elem_hero), run_time=0.8)
        self.wait(1.5)
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Scroll` / `Cmd + Scroll` | Specific-Point Zoom into mouse position |
| `Space + Drag` | Pan canvas smoothly |
| `Shift + Scroll` | Scroll canvas horizontally |
| `Scroll` | Scroll canvas vertically |
| `Ctrl + D` / `Cmd + D` | Duplicate selected element |
| `Delete` / `Backspace` | Delete selected element |
| `Arrow Keys` | Nudge element by `1px` |
| `Shift + Arrow Keys` | Nudge element by `10px` |
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo action |
| `P` | Toggle Fullscreen Preview / Presentation Mode |
| `←` / `→` (in Preview) | Navigate between scenes |
| `Esc` | Deselect element or exit Preview Mode |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `pnpm`

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rex-storyboard.git
cd rex-storyboard

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Lint with TypeScript compiler
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Testing & Quality Assurance

Rex Storyboard includes a comprehensive, automated test suite covering store mutations, geometry constraints, aspect ratio adapters, voiceover syncing, and inspector properties across every component.

Run the test suite with:

```bash
npm test
```

### Test Suite Summary (15 Suites — 702 Assertions)

```text
================================================================
  VSSS / REX STORYBOARD COMPREHENSIVE E2E & COMPONENT AUDIT
================================================================
  ✓ Suite 1:  Component Registry & Schema Audit (82 tests)
  ✓ Suite 2:  Style Utilities & Resolvers (14 tests)
  ✓ Suite 3:  Voiceover Sync & Pacing Engine (8 tests)
  ✓ Suite 4:  Studio Store Core Lifecycle (9 tests)
  ✓ Suite 5:  Element Creation for All 8 Types (26 tests)
  ✓ Suite 6:  Geometry Constraints & Auto-Height (22 tests)
  ✓ Suite 7:  Alignment & Stacking Order (4 tests)
  ✓ Suite 8:  Container Nesting & Flex Auto-Layout (7 tests)
  ✓ Suite 9:  Sub-Part Styling & Corner Radii (5 tests)
  ✓ Suite 10: Theme Presets & Palette Sync (3 tests)
  ✓ Suite 11: History System (Undo / Redo) (7 tests)
  ✓ Suite 12: Presets & Templates (6 tests)
  ✓ Suite 13: Project JSON Serialization & Import/Export (6 tests)
  ✓ Suite 14: AI Specification Generator (10 tests)
  ✓ Suite 15: Deep Property Inspection Audit Across All 8 Components (483 tests)
================================================================
  AUDIT & TEST RESULTS: 702 / 702 assertions passed (100%)
  ALL 15 TEST SUITES PASSED CLEANLY WITH ZERO ERRORS! 🚀
================================================================
```

---

## 📁 Project Structure

```text
rex_storyboard/
├── src/
│   ├── components/                 # Core Studio UI Components
│   │   ├── inspector/              # 3-Tab Property Inspector
│   │   │   ├── ContentTab.tsx      # Variants & Data Inspector
│   │   │   ├── StyleTab.tsx        # Sub-Part Target, Typography, Surface, Borders
│   │   │   └── AdvancedTab.tsx     # Geometry, Align, Auto-Height, Motion Sync
│   │   ├── BottomBar.tsx           # Voiceover Script & Scene Timeline Strip
│   │   ├── CanvasViewport.tsx      # 120fps Pan/Zoom Canvas & Quick Menu
│   │   ├── FullSpecModal.tsx       # Specification Modal (Remotion/Manim)
│   │   ├── LeftSidebar.tsx         # Components, Theme & Templates Sidebar
│   │   ├── RightSidebar.tsx        # Inspector / AI Spec Tabs
│   │   └── TopToolbar.tsx          # Ratio, Undo/Redo, Snap, Export Buttons
│   ├── registry/                   # Component Registry Architecture
│   │   ├── components/
│   │   │   ├── smart/              # HeroText, HeaderCard, FooterCard, SubtitleCaption
│   │   │   ├── containers/         # ContainerBox (Flex/Grid)
│   │   │   └── atomic/             # BasicText, BasicBadge, BasicDivider
│   │   ├── componentDefaults.ts    # Default schemas and layout variant definitions
│   │   ├── componentRegistry.tsx   # O(1) registry dictionary & legacy aliases
│   │   ├── styleUtils.ts           # Box model, sub-part, & font family resolvers
│   │   └── types.ts                # Component interface definitions
│   ├── store/
│   │   └── studioStore.ts          # Zustand store with history, IDB, & mutations
│   ├── types/
│   │   └── studio.ts               # Core TypeScript models (Scene, Element, Geometry)
│   └── utils/
│       ├── domMeasurement.ts       # Accurate DOM element height calculation
│       ├── specGenerator.ts        # Markdown, Remotion, & Manim code generator
│       ├── themePalettes.ts        # Curated dark/light theme presets
│       └── voiceSync.ts            # Punctuation & audio pacing algorithm
├── scripts/
│   └── runE2eTests.ts              # 702-assertion E2E test runner
├── package.json
└── vite.config.ts
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
