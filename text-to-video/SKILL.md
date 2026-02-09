---
name: text-to-video
description: 使用 Remotion + GSAP 创建专业知识讲解视频。当用户需要创建讲解视频、演示视频、教程视频，或提到 Remotion/GSAP 动画视频时使用。
---

## What this skill provides

这个 skill 包含创建知识讲解视频所需的全部代码和知识：

- **核心 Hook**: `useGsapTimeline` — 桥接 Remotion 帧驱动和 GSAP 动画
- **20 个动画预设组件**: 文字入场、列表、图表、流程图、转场等
- **3 个层组件**: 背景层、装饰层、安全区
- **主题 CSS**: 深色科技感配色方案
- **模板**: 创建新预设和 Composition 的模板

## Skill directory structure

```
text-to-video/
├── SKILL.md                          ← 你在这里
├── reference/
│   └── presets-api.md                ← 全部 20 个预设的 Props 速查
├── templates/
│   ├── theme.css                     ← CSS 变量主题（复制到项目）
│   ├── useGsapTimeline.ts            ← 核心 Hook（复制到项目）
│   ├── new-preset.tsx                ← 创建新预设的模板
│   └── new-composition.tsx           ← 创建新 Composition 的模板
├── presets/                          ← 20 个动画预设（复制到项目）
│   ├── TextReveal.tsx, TextFadeUp.tsx, SplitTextBounce.tsx, ...
│   └── SectionTitle.tsx
└── layers/                           ← 3 个层组件（复制到项目）
    ├── BackgroundLayer.tsx
    ├── DecorationLayer.tsx
    └── SafeArea.tsx
```

## How to use

### 搭建新项目

1. 创建 Remotion 项目，安装依赖：`remotion`, `@remotion/cli`, `gsap`, `react`
2. 从本 skill 目录复制文件到项目中：
   - `templates/useGsapTimeline.ts` → `src/hooks/useGsapTimeline.ts`
   - `templates/theme.css` → `src/styles/theme.css`
   - `layers/*` → `src/layers/`
   - `presets/*` → `src/presets/`（按需选取）
3. 在 `src/Root.tsx` 注册 Composition

### 创建 Composition

参考 [templates/new-composition.tsx](templates/new-composition.tsx) 了解完整模式。核心结构：

```tsx
<Sequence from={0} durationInFrames={5 * 30}>
  <AbsoluteFill>
    <BackgroundLayer variant="gradient" />    {/* 背景层 */}
    <DecoLine x1={5} y1={20} x2={5} y2={80} /> {/* 装饰层 */}
    <SafeArea align="center">                 {/* 安全区 */}
      <TextReveal lines={["内容"]} />          {/* 内容组件 */}
    </SafeArea>
  </AbsoluteFill>
</Sequence>
```

### 创建新预设

参考 [templates/new-preset.tsx](templates/new-preset.tsx)，核心模式：

```tsx
const containerRef = useRef<HTMLDivElement>(null);
useGsapTimeline((tl) => {
  if (!containerRef.current) return;
  tl.from(containerRef.current, { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" });
}, [deps]);
```

### 查看预设 API

完整 Props 速查见 [reference/presets-api.md](reference/presets-api.md)。

### 常用命令

```bash
# 预览
npx remotion studio src/index.ts --port 3123 --public-dir public

# 类型检查
npx tsc --noEmit

# 渲染
npx remotion render src/index.ts <CompositionId> out/video.mp4
```

## Architecture: Remotion + GSAP

**Remotion** 控制时间帧和视频渲染，**GSAP** 控制动画。通过 `useGsapTimeline` Hook 桥接：
- Remotion 每帧调用 `timeline.seek(frame / fps)`
- GSAP 计算该时间点的动画状态
- 结果：帧精度的专业 Motion Graphics 动画

每个场景 = 4 层叠加：
1. **BackgroundLayer** — 微妙氛围（渐变光晕 / 滚动网格 / 点阵）
2. **DecorationLayer** — SVG 装饰（线条 / 圆形 / 色块），低透明度
3. **SafeArea** — 内容安全区，防止被平台 UI 遮挡
4. **Content** — 动画预设组件

## Design principles

1. **反 AI 审美**: 禁止渐变紫、emoji、过度圆角、花哨渐变。最多 3 色。
2. **克制**: 装饰层只做氛围，不抢焦点。透明度 0.04~0.15。
3. **专业 Motion Graphics 级**: 多层动画协同，timing 错开，不是 PPT。
4. **深色主题**: 背景极深 (#0a0a0f)，文字偏灰白，蓝色强调 (#4a9eff)。

## Theme (CSS variables)

```css
--color-bg: #0a0a0f;
--color-surface: #14141f;
--color-primary: #e0e0e0;
--color-accent: #4a9eff;
--color-muted: #666680;
--font-heading: "Inter", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-code: "JetBrains Mono", monospace;
```

完整 CSS 文件见 [templates/theme.css](templates/theme.css)。

## Key rules for writing presets

- 所有预设都是纯函数组件，用 `useGsapTimeline` 定义动画
- 使用 CSS 变量 `var(--color-xxx)` 而不是硬编码颜色
- 用 `useRef` + `querySelector` 获取动画目标元素
- 所有尺寸参数给合理默认值
- 帧级精确控制（如逐字显示）可用 Remotion 的 `useCurrentFrame` + `interpolate`/`spring`
