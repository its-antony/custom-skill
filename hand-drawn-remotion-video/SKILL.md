---
name: hand-drawn-remotion-video
description: Use when creating Remotion explainer videos with hand-drawn Excalidraw-style visuals, SVG path animations, typewriter text effects, or sketch-style graphics on paper backgrounds
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
| Resolution | 1280x720, 30fps |
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
    HandDrawnText.tsx      # 打字机/淡入/弹出文字
    SafeArea.tsx           # 安全区域布局辅助
  scenes/
    SceneTitle.tsx         # 片头
    Scene[Content].tsx     # 内容场景（按主题拆分）
    SceneOutro.tsx         # 片尾
```

## Core Components

三个核心组件文件的完整实现见本 skill 目录下：
- `components/ExcalidrawElement.tsx` — ExcalidrawPath, HandDrawnBox, HandDrawnArrow, HandDrawnCircle
- `components/HandDrawnText.tsx` — typewriter / fadeIn / popIn 三种文字动画
- `components/SafeArea.tsx` — 安全区域布局

**直接复制到项目 `src/components/` 下使用。**

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

### 手绘抖动（Jitter）

```tsx
// 矩形的每个顶点加随机偏移
const jitter = () => (Math.random() - 0.5) * roughness; // roughness 默认 3
`M ${x + jitter()} ${y + jitter()} L ${x + w + jitter()} ...`
```

### 打字机效果

```tsx
// 按时间推进逐字显示，附带闪烁光标
const charsToShow = Math.floor(
  interpolate(frame, [delay * fps, (delay + text.length * 0.05) * fps], [0, text.length], { ... })
);
```

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
4. **多段文字**：优先纵向排列（标题 y=180, 描述 y=220），**禁止**将 x 定位在容器右边缘然后向右延伸
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
export const SceneXxx: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#FFFDF6" }}>
    <svg width={1280} height={720} viewBox="0 0 1280 720">
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
- 优点条目：`stroke="#81B29A"` + `fill="#81B29A15"`
- 缺点条目：`stroke="#E07A5F"` + `fill="#E07A5F15"`
- 条目文字前缀 `+ ` / `- `

### 架构图/流程图

- 用 `HandDrawnCircle` 表示节点
- 用 `HandDrawnArrow` 连接节点
- 节点标签用 `HandDrawnText` popIn 效果
- 右侧/下方用 `HandDrawnBox` 放关键特点列表

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
2. **场景拆分**：将内容分为 5-8 个场景（片头 + 3-6 个内容 + 片尾）
3. **可视化设计**：每个场景选择合适的模式（架构图/对比表/卡片/流程图）
4. **Delay 规划**：为每个场景规划动画时间线
5. **代码生成**：按模板生成组件代码
6. **总时长计算**：所有场景帧数求和，设为 `TOTAL_DURATION`

## 配音与音画同步

### TTS 服务选择

生成配音前，**提醒用户选择 TTS 服务**：

> 配音有两种方案：
> 1. **MiniMax 语音合成**（推荐）— 音质自然、情感丰富，适合正式视频，需要 API Key
> 2. **edge-tts**（默认）— 免费开箱即用，音质尚可，适合快速原型
>
> 你想用哪种？如果有 MiniMax API Key 可以获得更好的配音效果。

用户未明确选择时，默认使用 edge-tts。

### edge-tts 配音生成

```bash
# 安装
pip install edge-tts

# 生成单个场景配音
python3 -m edge_tts \
  --voice zh-CN-YunxiNeural \
  --rate="+5%" \
  --text "旁白文案内容" \
  --write-media public/audio/scene1.mp3

# 常用中文音色
# zh-CN-YunxiNeural    — 男声（推荐）
# zh-CN-XiaoxiaoNeural — 女声
# zh-CN-YunjianNeural  — 男声（沉稳）
```

### MiniMax 配音生成

需要用户提供 API Key，通过 MiniMax T2A（Text-to-Audio）API 生成。具体调用方式参考 MiniMax 官方文档。

### 音频时长驱动帧数

**核心原则：音频时长决定场景帧数，而非反过来。**

```bash
# 获取每个音频文件的时长
ffprobe -v quiet -show_entries format=duration \
  -of csv=p=0 public/audio/scene1.mp3
```

```
帧数计算公式：
sceneFrames = ceil(audioDurationSeconds * fps) + bufferFrames

bufferFrames = 30~60（1~2秒缓冲，让最后的动画播完）
```

### 场景内集成 Audio

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const SceneXxx: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#FFFDF6" }}>
    <Audio src={staticFile("audio/sceneX.mp3")} />
    <svg width={1280} height={720} viewBox="0 0 1280 720">
      {/* 场景内容... */}
    </svg>
  </AbsoluteFill>
);
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
2. **场景拆分** → 5-8 个场景
3. **编写旁白文案** → 每个场景一段
4. **提醒用户选择 TTS**（推荐 MiniMax，默认 edge-tts）
5. **生成音频** → `public/audio/scene{N}.mp3`
6. **获取时长** → ffprobe 每个文件
7. **计算帧数** → `ceil(duration * 30) + buffer`
8. **可视化设计** → 选择场景模式
9. **Delay 编排** → 匹配旁白节奏
10. **代码生成** → 场景中嵌入 `<Audio>`
11. **总时长计算** → 更新 `TOTAL_DURATION`

## Common Mistakes

| 错误 | 修正 |
|------|------|
| `#888` 文字在有色 fill 背景上 | 改用 `#1e1e1e` 或 `#555` |
| 文字 x 在容器右边缘向右延伸 | 改为左对齐或居中 |
| delay 总和超过场景时长 | 调整间隔或增加场景帧数 |
| 忘记 `dominantBaseline="middle"` | 所有 `<text>` 必须添加 |
| `jitter()` 在 render 中每帧重算 | 用 `useMemo` 缓存路径 |
| 装饰框 fill 不透明度过高 | 保持 `08`-`20` 范围 |
| `loadFont()` 放在组件函数内 | 提到模块顶层执行 |
| 场景帧数不匹配音频时长 | 先获取音频时长，再算帧数：`ceil(sec * 30) + buffer` |
| 有配音但 delay 间隔仍用无配音的紧凑值 | 有配音时间隔放大 2~3 倍，匹配旁白节奏 |
| 忘记安装 `@remotion/media` | 有配音时 `npm i @remotion/media` |
| 未提醒用户 TTS 选择 | 默认 edge-tts，但推荐 MiniMax（音质更好） |
