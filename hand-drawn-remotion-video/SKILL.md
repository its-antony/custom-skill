---
name: hand-drawn-remotion-video
description: 用 Remotion 制作手绘风格/Excalidraw风格/sketch风格的讲解视频、白板动画视频。包含 SVG 路径动画、打字机文字效果、手绘图形组件。Use when creating Remotion explainer videos with hand-drawn Excalidraw-style visuals, whiteboard animations, or sketch-style graphics.
---

# Hand-Drawn Style Remotion Explainer Video

## Overview

A complete recipe for creating Excalidraw-style hand-drawn explainer videos with Remotion. Given any topic, generates a full video project with SVG stroke-dasharray path animations, jittery hand-drawn shapes, typewriter text, and paper-texture backgrounds.

**REQUIRED:** Use `remotion-best-practices` skill for Remotion-specific API guidance (transitions, timing, fonts, compositions).

## When to Use

- User wants a "手绘风格" / "Excalidraw 风格" / "sketch-style" explainer video
- User wants SVG path-draw animations with hand-drawn feel
- User asks for a whiteboard / chalkboard / notebook style video

## Quick Reference

| Aspect | Value |
|--------|-------|
| Resolution（默认） | 1280×720, 30fps（横版标清） |
| Resolution（全高清） | 1920×1080, 30fps（YouTube/B站） |
| Resolution（竖版） | 1080×1920, 30fps（抖音/小红书/Shorts） |
| Background | `#FFFDF6` (米白色纸张) |
| Font | `@remotion/google-fonts/CaveatBrush` |
| Animation | SVG `stroke-dasharray` + `stroke-dashoffset` |
| Transitions | `TransitionSeries` with `fade()` / `slide()` alternating |
| Transition duration | 20 frames |
| Scene duration (无配音) | 120-270 frames (4-9 seconds) |
| Scene duration (有配音) | 由音频时长决定：`ceil(audioSeconds * 30) + 30~60` |
| TTS（默认） | `edge-tts` + `zh-CN-YunxiNeural`（免费，效果一般） |
| TTS（推荐） | MiniMax 语音合成（音质更自然，需 API Key） |
| Audio component | `<Audio>` from `@remotion/media` |

## Project Setup

```bash
npx create-video@latest --template blank
npm i @remotion/transitions @remotion/google-fonts @remotion/media
```

**remotion.config.ts:**
```ts
import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

## Architecture Pattern

```
src/
  Root.tsx              # Composition 注册（fps/尺寸/总时长）
  Composition.tsx       # TransitionSeries 场景编排
  components/
    ExcalidrawElement.tsx  # 手绘图形组件（Path/Box/Arrow/Circle）
    HandDrawnText.tsx      # 打字机/淡入/弹出 单行文字
    HandDrawnParagraph.tsx # 自动换行多行文字
    HandDrawnHighlight.tsx # 荧光笔高亮/手绘下划线
    HandDrawnIcons.tsx     # 手绘对勾/叉号图标
    SafeArea.tsx           # 安全区域布局辅助
    Resolution.ts          # 多分辨率预设与缩放工具
  scenes/
    SceneTitle.tsx         # 片头
    Scene[Content].tsx     # 内容场景（按主题拆分）
    SceneOutro.tsx         # 片尾
```

## Core Components

所有组件文件的完整实现见本 skill 目录下 `components/`。**直接复制到项目 `src/components/` 下使用。**

### 组件一览

| 文件 | 导出组件 | 用途 |
|------|---------|------|
| `ExcalidrawElement.tsx` | `ExcalidrawPath` | SVG 路径绘制动画（基础组件） |
| | `HandDrawnBox` | 手绘矩形（抖动边框） |
| | `HandDrawnArrow` | 手绘箭头（含箭头尖） |
| | `HandDrawnCircle` | 手绘圆形（贝塞尔曲线） |
| `HandDrawnText.tsx` | `HandDrawnText` | 单行文字（typewriter/fadeIn/popIn） |
| `HandDrawnParagraph.tsx` | `HandDrawnParagraph` | 自动换行多行文字（typewriter/fadeIn） |
| `HandDrawnHighlight.tsx` | `HandDrawnHighlight` | 荧光笔高亮或手绘下划线 |
| `HandDrawnIcons.tsx` | `HandDrawnCheckmark` | 手绘对勾 ✓ 动画 |
| | `HandDrawnCross` | 手绘叉号 ✗ 动画 |
| `SafeArea.tsx` | `SafeArea`, `useSafeArea` | 安全区域布局 |
| `Resolution.ts` | `RESOLUTIONS`, `scaleFontSize` | 分辨率预设与字号缩放 |

### 手绘效果原理

```tsx
// SVG stroke-dasharray 路径动画核心
<path
  d={d}
  strokeDasharray={pathLength}          // 虚线段长度 = 路径总长
  strokeDashoffset={pathLength * (1 - progress)} // 偏移量递减 → 笔画逐渐显现
  strokeLinecap="round"
  strokeLinejoin="round"
/>
```

### 确定性手绘抖动（Seed-based Jitter）

所有抖动使用 **mulberry32 伪随机数生成器**，用组件参数作为 seed，确保：
- 相同参数 → 相同抖动路径（跨帧、跨 worker 一致）
- React Strict Mode 双重渲染安全
- Remotion 多 worker 并行渲染一致

```tsx
// 内部实现（已内置于组件中，无需手动调用）
const rand = mulberry32(hashSeed(x, y, width, height));
const jitter = () => (rand() - 0.5) * roughness;
```

### 打字机效果

```tsx
// 按时间推进逐字显示，附带闪烁光标
const charsToShow = Math.floor(
  interpolate(frame, [delay * fps, (delay + text.length * 0.05) * fps], [0, text.length], { ... })
);
```

### 自动换行文字（HandDrawnParagraph）

解决 SVG `<text>` 没有自动换行的痛点。按 `maxWidth` 自动拆行，支持中英文混排：

```tsx
<HandDrawnParagraph
  text="这是一段很长的中文文字，会自动根据 maxWidth 换行显示，支持打字机效果跨行连续打字"
  x={80} y={120}
  maxWidth={500}
  fontSize={22}
  delay={0.5}
  style="typewriter"
/>
```

**字符宽度估算规则**：
- 中文/CJK 字符：`fontSize × 0.9`
- 英文大写：`fontSize × 0.6`
- 英文小写/数字：`fontSize × 0.55`

### 荧光笔高亮 / 手绘下划线（HandDrawnHighlight）

用于强调关键词，两种模式：

```tsx
{/* 荧光笔高亮 — 半透明矩形从左到右涂出 */}
<HandDrawnHighlight x={200} y={95} width={160} type="highlight" color="#E8D44D" delay={1.0} />

{/* 手绘下划线 — 微弯线条绘制动画 */}
<HandDrawnHighlight x={200} y={110} width={160} type="underline" color="#E07A5F" delay={1.0} />
```

### 手绘对勾与叉号（HandDrawnCheckmark / HandDrawnCross）

替代优缺点场景中的 `+/-` 文字前缀，更有视觉表现力：

```tsx
{/* 优点 — 绿色对勾 */}
<HandDrawnCheckmark cx={100} cy={200} size={20} delay={0.5} />
<HandDrawnText text="性能更好" x={125} y={200} delay={0.6} />

{/* 缺点 — 红色叉号 */}
<HandDrawnCross cx={100} cy={240} size={20} delay={1.0} />
<HandDrawnText text="学习成本高" x={125} y={240} delay={1.1} />
```

## 多分辨率支持

### 预设配置

```ts
import { RESOLUTIONS, scaleFontSize } from "./components/Resolution";

// 三种预设
RESOLUTIONS.landscape_hd   // { width: 1280, height: 720,  fps: 30 } — 默认
RESOLUTIONS.landscape_fhd  // { width: 1920, height: 1080, fps: 30 } — YouTube/B站
RESOLUTIONS.portrait_hd    // { width: 1080, height: 1920, fps: 30 } — 抖音/小红书
```

### Root.tsx 中使用

```tsx
import { RESOLUTIONS } from "./components/Resolution";

const res = RESOLUTIONS.landscape_hd; // 根据需求切换

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyVideo"
    component={MyComposition}
    durationInFrames={TOTAL_DURATION}
    fps={res.fps}
    width={res.width}
    height={res.height}
  />
);
```

### 场景中使用

```tsx
import { useVideoConfig } from "remotion";

export const SceneXxx: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFDF6" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 用 width/height 替代硬编码 1280/720 */}
      </svg>
    </AbsoluteFill>
  );
};
```

### 字号缩放

```tsx
import { scaleFontSize } from "./components/Resolution";

// 基于 1280×720 的基准字号，自动缩放到目标分辨率
const titleSize = scaleFontSize(38, "landscape_fhd"); // → 57
const bodySize = scaleFontSize(22, "portrait_hd");     // → 33
```

### 竖版视频注意事项

| 横版（1280×720 / 1920×1080） | 竖版（1080×1920） |
|------------------------------|-------------------|
| 左右并排布局（对比/卡片） | 改为上下堆叠 |
| 字号 22-38 | 字号 ×1.3（29-50） |
| 每场景 5-8 个元素 | 精简到 3-5 个元素 |
| 横向时间线 | 改为纵向步骤流程 |
| 三列对比表 | 改为两列或卡片堆叠 |

## 色彩规范（严格遵守）

### 调色板

| 角色 | 颜色 | 用途 |
|------|------|------|
| 背景 | `#FFFDF6` | AbsoluteFill backgroundColor |
| 主色A | `#6C5CE7` | 概念A标题/边框/强调 |
| 主色B | `#E07A5F` | 概念B标题/边框/强调 |
| 辅助绿 | `#81B29A` | 正面/优点/CTA |
| 辅助黄 | `#E8D44D` | 装饰线/分隔/高亮 |
| 辅助蓝 | `#61DAFB` | 第三类元素 |

### 文字颜色层级

| 层级 | 颜色 | 规则 |
|------|------|------|
| 主要文字 | `#1e1e1e` | 正文、列表项 |
| 次要标签 | `#555` | 小节标题、说明文字（不低于此） |
| 辅助文字 | `#999` | **仅用于** `#FFFDF6` 纯米白背景上 |
| **禁止** | `#888` 或更浅 | 禁止在任何有色 fill 背景上使用 |

### 对比度规则

1. **浅色背景**（fill 含透明度 08-20，如 `#6C5CE715`）→ 使用深色/饱和色文字
2. **深色/饱和背景** → 使用白色或极浅色文字
3. **装饰框 fill 透明度**：一律 `08`-`20`（如 `#6C5CE715`、`#E07A5F20`）
4. **区分区域**：用 `stroke` 颜色区分，不靠 fill
5. **中性区域**（表格中间列等）：`fill="none"` 或 `#f5f3ec10`
6. **自检**：每个 `<text>` 检查同层/父级 `<rect>`/`HandDrawnBox` 的 fill，确保 ≥ 4.5:1 对比度

## SVG 文字布局规则（关键约束）

SVG `<text>` **没有自动换行和 overflow:hidden**，必须严格遵守：

1. **左对齐**：`textAnchor="start"`，x 设为容器左侧 + 内边距（如 `x={containerX + 30}`），文字向右延伸
2. **居中**：`textAnchor="middle"`，x 设为容器水平中心（如 `x={containerX + containerWidth / 2}`）
3. **右对齐**：`textAnchor="end"`，x 设为容器右边缘 - 内边距
4. **多段文字**：优先使用 `HandDrawnParagraph` 组件自动换行；手动排列时纵向排列（标题 y=180, 描述 y=220），**禁止**将 x 定位在容器右边缘然后向右延伸
5. **字号与容器宽度关系**：中文 fontSize 20-22 约可容纳 ~20 字 / 490px 宽度
6. 所有 `<text>` 添加 `dominantBaseline="middle"` 确保垂直居中

## 场景编排模式

### Composition.tsx 模板

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

const TRANSITION_DURATION = 20;

export const MyComposition: React.FC = () => (
  <TransitionSeries>
    {/* 片头 */}
    <TransitionSeries.Sequence durationInFrames={120}>
      <SceneTitle />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />

    {/* 内容场景们... fade 和 slide 交替使用 */}
    <TransitionSeries.Sequence durationInFrames={240}>
      <SceneContent1 />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />

    {/* ... 更多场景 ... */}

    {/* 片尾 */}
    <TransitionSeries.Sequence durationInFrames={150}>
      <SceneOutro />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

### 场景时长指南

| 场景类型 | 帧数 | 秒数 | 说明 |
|----------|------|------|------|
| 片头 | 120 | 4s | spring 标题 + 装饰动画 |
| 内容轻量 | 180 | 6s | 3-4 个动画元素 |
| 内容中等 | 240 | 8s | 5-8 个动画元素 |
| 内容复杂 | 270 | 9s | 表格/对比图/多行列表 |
| 片尾 | 150 | 5s | 总结 + CTA |

### 场景内部模板

每个场景遵循统一结构：

```tsx
import { useVideoConfig } from "remotion";

export const SceneXxx: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFDF6" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 1. 标题 (delay=0) */}
        <HandDrawnText text="场景标题" x={80} y={55} fontSize={38} delay={0} style="typewriter" />

        {/* 2. 主图形元素 (delay=0.3~1.0) */}
        <HandDrawnBox ... delay={0.5} />
        <HandDrawnCircle ... delay={0.8} />
        <HandDrawnArrow ... delay={1.2} />

        {/* 3. 详细文字说明 (delay=递增, 每项间隔 0.5~0.7s) */}
        <HandDrawnText ... delay={1.5} style="typewriter" />
        <HandDrawnText ... delay={2.2} style="typewriter" />

        {/* 4. 底部总结框 (最后出现) */}
        <HandDrawnBox ... delay={最大delay} />
        <HandDrawnText ... delay={最大delay + 0.2} style="typewriter" />
      </svg>
    </AbsoluteFill>
  );
};
```

### Delay 编排规范

- 标题：`delay=0`
- 主图形：`delay=0.3` 起，间隔 `0.2~0.3`
- 详细内容：`delay=1.0` 起，间隔 `0.5~0.7`（给打字机效果留时间）
- 总结：场景最后 `1~1.5s` 出现
- `.map()` 列表：`baseDelay + i * 0.5`
- **总 delay 不应超过场景时长**（帧数 ÷ 30）

## 常见场景类型代码模式

### 片头（SceneTitle）

- 主标题用 `spring` scale 弹出（`transformOrigin` 设为画面中心）
- 副标题用 `spring` opacity 淡入（延迟 30 帧）
- 四角放装饰 `HandDrawnBox`（小方块 25-30px）
- 装饰 `HandDrawnCircle` 点缀
- 外围大 `HandDrawnBox` 作边框

### 对比表格（SceneComparison）

- 三列结构：左概念 | 维度标签 | 右概念
- 表头用 `HandDrawnBox` 带色彩 fill 区分
- 数据行用 `.map()` 循环渲染
- 行间用 `ExcalidrawPath` 画手绘分隔线（Q 贝塞尔曲线微弯）

### 优缺点卡片（SceneProsCons）

- 左右两大 `HandDrawnBox` 卡片
- 优点条目：`HandDrawnCheckmark` + `HandDrawnText`，`stroke="#81B29A"`
- 缺点条目：`HandDrawnCross` + `HandDrawnText`，`stroke="#E07A5F"`
- 卡片背景：优点 `fill="#81B29A15"`，缺点 `fill="#E07A5F15"`

```tsx
{/* 优点卡片示例 */}
<HandDrawnBox x={50} y={100} width={540} height={400} stroke="#81B29A" fill="#81B29A10" delay={0.3} />
<HandDrawnText text="优点" x={280} y={130} fontSize={30} fill="#81B29A" textAnchor="middle" delay={0.5} />
{pros.map((item, i) => (
  <g key={i}>
    <HandDrawnCheckmark cx={90} cy={190 + i * 50} size={18} delay={0.8 + i * 0.5} />
    <HandDrawnText text={item} x={115} y={190 + i * 50} fontSize={22} delay={0.9 + i * 0.5} />
  </g>
))}
```

### 架构图/流程图

- 用 `HandDrawnCircle` 表示节点
- 用 `HandDrawnArrow` 连接节点
- 节点标签用 `HandDrawnText` popIn 效果
- 右侧/下方用 `HandDrawnBox` 放关键特点列表

### 时间线/步骤流程（SceneTimeline）

**横向时间线**（适合横版视频）：

```tsx
const steps = ["调研", "设计", "开发", "测试", "上线"];
const startX = 120;
const stepWidth = (width - 240) / (steps.length - 1);

{/* 底部手绘横线 */}
<ExcalidrawPath
  d={`M ${startX} 420 L ${width - startX} 420`}
  delay={0} drawDuration={1.0} pathLength={width - startX * 2}
/>

{/* 节点 + 标签 */}
{steps.map((step, i) => {
  const cx = startX + i * stepWidth;
  const d = 0.3 + i * 0.5;
  return (
    <g key={i}>
      <HandDrawnCircle cx={cx} cy={420} r={18} fill="#6C5CE715" stroke="#6C5CE7" delay={d} />
      <HandDrawnText text={step} x={cx} y={380} fontSize={22} textAnchor="middle" delay={d + 0.2} style="popIn" />
      <HandDrawnText text={`第${i + 1}步`} x={cx} y={460} fontSize={16} fill="#555" textAnchor="middle" delay={d + 0.3} />
    </g>
  );
})}
```

**纵向步骤流程**（适合竖版视频）：

```tsx
const steps = [
  { title: "需求分析", desc: "收集用户需求，定义产品范围" },
  { title: "系统设计", desc: "架构设计，技术选型" },
  { title: "编码实现", desc: "按模块逐步开发" },
];
const startY = 200;
const stepHeight = 180;

{steps.map((step, i) => {
  const cy = startY + i * stepHeight;
  const d = 0.3 + i * 0.8;
  return (
    <g key={i}>
      {/* 编号圆圈 */}
      <HandDrawnCircle cx={120} cy={cy} r={25} fill="#6C5CE715" stroke="#6C5CE7" delay={d} />
      <HandDrawnText text={`${i + 1}`} x={120} y={cy} fontSize={24} fill="#6C5CE7" textAnchor="middle" delay={d + 0.1} style="popIn" />
      {/* 步骤说明 */}
      <HandDrawnBox x={170} y={cy - 35} width={780} height={70} stroke="#6C5CE730" fill="#6C5CE708" delay={d + 0.2} />
      <HandDrawnText text={step.title} x={190} y={cy - 10} fontSize={24} fill="#1e1e1e" delay={d + 0.3} />
      <HandDrawnText text={step.desc} x={190} y={cy + 20} fontSize={18} fill="#555" delay={d + 0.4} />
      {/* 连接虚线箭头（非最后一个） */}
      {i < steps.length - 1 && (
        <HandDrawnArrow x1={120} y1={cy + 30} x2={120} y2={cy + stepHeight - 30} stroke="#6C5CE750" delay={d + 0.5} />
      )}
    </g>
  );
})}
```

### 代码展示（SceneCode）

用于技术讲解视频中展示代码片段：

```tsx
const codeLines = [
  'const app = express();',
  'app.get("/api", (req, res) => {',
  '  const data = fetchData();',
  '  res.json({ data });',
  '});',
];

{/* 深色终端背景 */}
<HandDrawnBox x={80} y={100} width={width - 160} height={codeLines.length * 45 + 60}
  stroke="#555" fill="#2d2d2d" delay={0.2} />

{/* 终端标题栏装饰 */}
<HandDrawnCircle cx={115} cy={125} r={6} fill="#E07A5F" stroke="none" delay={0.4} />
<HandDrawnCircle cx={140} cy={125} r={6} fill="#E8D44D" stroke="none" delay={0.4} />
<HandDrawnCircle cx={165} cy={125} r={6} fill="#81B29A" stroke="none" delay={0.4} />

{/* 代码行 — 逐行淡入 */}
{codeLines.map((line, i) => (
  <HandDrawnText
    key={i}
    text={line}
    x={110}
    y={170 + i * 45}
    fontSize={20}
    fontFamily="'Fira Code', 'Source Code Pro', monospace"
    fill="#e0e0e0"
    delay={0.6 + i * 0.8}
    style="fadeIn"
  />
))}

{/* 可选：高亮关键行 */}
<HandDrawnHighlight x={100} y={258} width={width - 180} type="highlight" color="#E8D44D" opacity={0.15} delay={3.0} />
```

### 数据列表（SceneIconList）

用 `HandDrawnCheckmark` / `HandDrawnCross` 替代纯文字 `+/-`：

```tsx
const items = [
  { text: "类型安全，编译时发现错误", positive: true },
  { text: "丰富的生态系统", positive: true },
  { text: "学习曲线较陡", positive: false },
  { text: "编译速度有待提升", positive: false },
];

{items.map((item, i) => {
  const y = 160 + i * 55;
  const d = 0.5 + i * 0.5;
  return (
    <g key={i}>
      {item.positive ? (
        <HandDrawnCheckmark cx={100} cy={y} size={18} delay={d} />
      ) : (
        <HandDrawnCross cx={100} cy={y} size={18} delay={d} />
      )}
      <HandDrawnText text={item.text} x={130} y={y} fontSize={22} delay={d + 0.1} />
    </g>
  );
})}
```

### 片尾（SceneOutro）

- 同心 `HandDrawnCircle` 做装饰（递增 delay）
- 主文字 `spring` 弹出
- CTA 按钮用 `HandDrawnBox` + `HandDrawnText`

## 字体加载

```tsx
import { loadFont } from "@remotion/google-fonts/CaveatBrush";
const { fontFamily } = loadFont();
// 每个场景文件顶部执行一次
```

## 内容规划流程

收到主题后，按以下步骤规划视频：

1. **内容调研**：用 WebSearch 收集主题核心知识点
2. **选择分辨率**：确认横版/竖版，默认 1280×720
3. **场景拆分**：将内容分为 5-8 个场景（片头 + 3-6 个内容 + 片尾）
4. **可视化设计**：每个场景选择合适的模式（架构图/对比表/卡片/流程图/时间线/代码展示/图标列表）
5. **Delay 规划**：为每个场景规划动画时间线
6. **代码生成**：按模板生成组件代码
7. **总时长计算**：所有场景帧数求和，设为 `TOTAL_DURATION`

## 配音与音画同步

### TTS 服务选择

生成配音前，**提醒用户选择 TTS 服务**：

> 配音有两种方案：
> 1. **MiniMax 语音合成**（推荐）— 音质自然、情感丰富，适合正式视频，需要 API Key
> 2. **edge-tts**（默认）— 免费开箱即用，音质尚可，适合快速原型
>
> 你想用哪种？如果有 MiniMax API Key 可以获得更好的配音效果。

用户未明确选择时，默认使用 edge-tts。

### edge-tts 批量配音生成

一个脚本完成所有场景的配音生成 + 时长获取 + 帧数计算：

```python
#!/usr/bin/env python3
"""batch_tts.py — 批量生成配音并计算帧数"""
import asyncio, json, subprocess, math, os
import edge_tts

VOICE = "zh-CN-YunxiNeural"  # 可选: zh-CN-XiaoxiaoNeural(女), zh-CN-YunjianNeural(沉稳男)
RATE = "+5%"
OUTPUT_DIR = "public/audio"
FPS = 30
BUFFER_FRAMES = 45  # 1.5 秒缓冲

# ====== 在这里填写每个场景的旁白文案 ======
SCENES = {
    "scene1": "欢迎来到本期视频，今天我们来聊聊...",
    "scene2": "首先，让我们了解一下背景...",
    "scene3": "接下来看看核心概念...",
    "scene4": "让我们对比一下两种方案...",
    "scene5": "总结一下今天的内容...",
}

async def generate_audio(name: str, text: str):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = f"{OUTPUT_DIR}/{name}.mp3"
    tts = edge_tts.Communicate(text, VOICE, rate=RATE)
    await tts.save(output_path)
    return output_path

def get_duration(path: str) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())

async def main():
    results = {}
    for name, text in SCENES.items():
        path = await generate_audio(name, text)
        duration = get_duration(path)
        frames = math.ceil(duration * FPS) + BUFFER_FRAMES
        results[name] = {"duration_sec": round(duration, 2), "frames": frames}
        print(f"  {name}: {duration:.2f}s → {frames} frames")

    total = sum(r["frames"] for r in results.values())
    transitions = (len(SCENES) - 1) * 20
    print(f"\n  Total: {total} frames - {transitions} transitions = {total - transitions} frames ({(total - transitions) / FPS:.1f}s)")
    print(f"\n  const SCENE_FRAMES = {json.dumps({k: v['frames'] for k, v in results.items()})};")

asyncio.run(main())
```

```bash
# 安装依赖
pip install edge-tts

# 运行
python3 batch_tts.py
```

### MiniMax 配音生成

需要用户提供 API Key，通过 MiniMax T2A（Text-to-Audio）API 生成。具体调用方式参考 MiniMax 官方文档。

### 音频时长驱动帧数

**核心原则：音频时长决定场景帧数，而非反过来。**

```
帧数计算公式：
sceneFrames = ceil(audioDurationSeconds * fps) + bufferFrames

bufferFrames = 30~60（1~2秒缓冲，让最后的动画播完）
```

### 场景内集成 Audio

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { useVideoConfig } from "remotion";

export const SceneXxx: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFDF6" }}>
      <Audio src={staticFile("audio/sceneX.mp3")} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 场景内容... */}
      </svg>
    </AbsoluteFill>
  );
};
```

### 音画同步 Delay 编排

有配音时，动画 delay 需要匹配旁白节奏，而非均匀分布：

| 模式 | 无配音 delay 间隔 | 有配音 delay 间隔 |
|------|-------------------|-------------------|
| 标题 | `0` | `0` |
| 主图形 | `0.3` 起，间隔 `0.2~0.3` | `1.0` 起，间隔 `0.5~1.0` |
| 详细内容 | `1.0` 起，间隔 `0.5~0.7` | `3.0` 起，间隔 `1.0~1.5` |
| 列表项 | `baseDelay + i * 0.5` | `baseDelay + i * 1.0~1.5` |
| 总结 | 最后 `1~1.5s` | 最后 `2~3s` |

### Delay 均匀分布公式

当不确定具体旁白节奏时，用此公式均匀分布动画：

```
elementDelay = audioSeconds / (elementCount + 1) * elementIndex

示例：场景音频 12 秒，6 个动画元素
→ element1: 12/7*1 = 1.7s
→ element2: 12/7*2 = 3.4s
→ element3: 12/7*3 = 5.1s
→ element4: 12/7*4 = 6.9s
→ element5: 12/7*5 = 8.6s
→ element6: 12/7*6 = 10.3s
```

**经验法则**：
- 听一遍旁白，在每句话的语义转折点设置 delay
- 中文 TTS 每个短句约 2~4 秒，据此均分 delay
- 总 delay 上限 = `(sceneFrames - bufferFrames) / fps`

### 总时长计算（含配音）

```
totalFrames = Σ(sceneFrames) - transitionCount × TRANSITION_DURATION

示例：7 场景 + 6 转场
= (270+540+660+600+720+750+375) - 6×20
= 3915 - 120 = 3795 帧 (126.5秒)
```

### 完整工作流（含配音）

1. **内容调研** → WebSearch
2. **选择分辨率** → 确认横版/竖版
3. **场景拆分** → 5-8 个场景
4. **编写旁白文案** → 每个场景一段
5. **提醒用户选择 TTS**（推荐 MiniMax，默认 edge-tts）
6. **批量生成音频** → 运行 `batch_tts.py`，得到 `public/audio/scene{N}.mp3` + 帧数
7. **可视化设计** → 选择场景模式
8. **Delay 编排** → 用均匀分布公式或匹配旁白节奏
9. **代码生成** → 场景中嵌入 `<Audio>`
10. **总时长计算** → 更新 `TOTAL_DURATION`

## Common Mistakes

| 错误 | 修正 |
|------|------|
| `#888` 文字在有色 fill 背景上 | 改用 `#1e1e1e` 或 `#555` |
| 文字 x 在容器右边缘向右延伸 | 改为左对齐或居中 |
| delay 总和超过场景时长 | 调整间隔或增加场景帧数 |
| 忘记 `dominantBaseline="middle"` | 所有 `<text>` 必须添加 |
| `Math.random()` 做 jitter | 已改为 seed-based，直接用组件即可 |
| 装饰框 fill 不透明度过高 | 保持 `08`-`20` 范围 |
| `loadFont()` 放在组件函数内 | 提到模块顶层执行 |
| 场景帧数不匹配音频时长 | 先获取音频时长，再算帧数：`ceil(sec * 30) + buffer` |
| 有配音但 delay 间隔仍用无配音的紧凑值 | 有配音时间隔放大 2~3 倍，匹配旁白节奏 |
| 忘记安装 `@remotion/media` | 有配音时 `npm i @remotion/media` |
| 未提醒用户 TTS 选择 | 默认 edge-tts，但推荐 MiniMax（音质更好） |
| 长文字手动拆行计算 y 偏移 | 改用 `HandDrawnParagraph` 自动换行 |
| 优缺点用 `+/-` 文字前缀 | 改用 `HandDrawnCheckmark` / `HandDrawnCross` |
| 硬编码 `width={1280} height={720}` | 用 `useVideoConfig()` 获取 + `Resolution.ts` 预设 |
| 竖版视频仍用横版并排布局 | 改为上下堆叠，字号 ×1.3，元素精简 |
| `HandDrawnHighlight` 的 clipPath id 冲突 | 确保同一场景中多个 Highlight 的 x/y 不完全相同 |
