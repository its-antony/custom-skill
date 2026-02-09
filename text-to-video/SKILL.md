---
name: text-to-video
description: 使用 Remotion + GSAP 创建专业知识讲解视频的完整工作流
metadata:
  tags: remotion, gsap, video, animation, motion-graphics, react
---

## When to use

当需要创建知识讲解视频、演示视频、教程视频时使用此 skill。涵盖：
- 创建新的视频 Composition
- 使用动画预设组件
- 搭建场景（背景 + 装饰 + 安全区 + 内容）
- 启动预览和渲染

## 项目信息

- **技术栈**: Remotion v4 + GSAP v3.12 + React 19 + TypeScript
- **视频规格**: 1920x1080 (16:9), 30fps
- **主题风格**: 深色系科技感，反 AI 审美
- **入口文件**: `src/index.ts`
- **预设目录**: `src/presets/`
- **层组件目录**: `src/layers/`
- **Composition 目录**: `src/compositions/`

## 核心架构

### Remotion + GSAP 集成

Remotion 控制时间帧，GSAP 控制动画。通过 `useGsapTimeline` Hook 桥接：

```tsx
import { useGsapTimeline } from "../hooks/useGsapTimeline";

// 在组件中使用
const containerRef = useRef<HTMLDivElement>(null);

useGsapTimeline((tl) => {
  if (!containerRef.current) return;
  // 用 GSAP timeline API 定义动画序列
  tl.from(containerRef.current, {
    y: 30, opacity: 0, duration: 0.6, ease: "power3.out",
  });
}, [deps]); // deps 变化时重建 timeline
```

**原理**: 每一帧 Remotion 调用 `timeline.seek(frame / fps)`，GSAP 计算该时间点的动画状态。

### 场景多层架构

每个场景由 4 层组成（从底到顶）：

```tsx
<Sequence from={0} durationInFrames={5 * 30}>
  <AbsoluteFill>
    <BackgroundLayer variant="gradient" />   {/* 1. 背景层 */}
    <DecoLine x1={5} y1={20} x2={5} y2={80} /> {/* 2. 装饰层 */}
    <SafeArea align="center">                {/* 3. 安全区 */}
      <TextReveal lines={["内容在这里"]} />   {/* 4. 内容层 */}
    </SafeArea>
  </AbsoluteFill>
</Sequence>
```

### Composition 注册

在 `src/Root.tsx` 中注册：

```tsx
<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={30 * 30}  // 30秒
  fps={30}
  width={1920}
  height={1080}
/>
```

## 主题系统（CSS 变量）

```css
:root {
  --color-bg: #0a0a0f;           /* 深色背景 */
  --color-surface: #14141f;       /* 卡片/面板背景 */
  --color-primary: #e0e0e0;       /* 主要文字 */
  --color-accent: #4a9eff;        /* 强调色（蓝） */
  --color-muted: #666680;         /* 次要文字 */
  --font-heading: "Inter", "SF Pro Display", system-ui, sans-serif;
  --font-body: "Inter", "SF Pro Text", system-ui, sans-serif;
  --font-code: "JetBrains Mono", "SF Mono", "Fira Code", monospace;
}
```

**使用时必须 `import "../styles/theme.css"`**

## 设计原则

1. **反 AI 审美**: 禁止渐变紫、emoji、过度圆角、花哨渐变。最多 3 色。
2. **克制**: 装饰层只做氛围，不抢内容焦点。透明度低 (0.04~0.15)。
3. **专业 Motion Graphics 级**: 不是 PPT 级别。多层动画协同，timing 错开。
4. **深色主题**: 背景极深 (#0a0a0f)，文字偏灰白，蓝色强调。

## 层组件

### BackgroundLayer

```tsx
import { BackgroundLayer } from "../layers/BackgroundLayer";

<BackgroundLayer
  variant="gradient"  // "gradient" | "grid" | "dots"
  baseColor="#0a0a0f"  // 可选，默认 #0a0a0f
  accentColor="#4a9eff" // 可选，默认 #4a9eff
/>
```

- **gradient**: 两个大光晕缓慢漂移，带 blur 模糊
- **grid**: 倾斜 (-15deg) + 持续滚动的网格线
- **dots**: 点阵纹理，微弱漂浮

### DecorationLayer 组件

```tsx
import { DecoLine, DecoCircle, DecoRect } from "../layers/DecorationLayer";

// 装饰线条（SVG 线条绘制动画）
<DecoLine x1={5} y1={20} x2={5} y2={80} color="rgba(74,158,255,0.3)" delay={0} duration={0.8} />

// 装饰圆形（从中心扩展）
<DecoCircle cx={90} cy={15} radius={30} color="rgba(74,158,255,0.15)" delay={0} duration={0.6} />

// 装饰色块（从左侧展开）
<DecoRect x={10} y={70} width={30} height={2} color="rgba(74,158,255,0.08)" delay={0} duration={0.5} />
```

坐标都是百分比 (0-100)。

### SafeArea

```tsx
import { SafeArea } from "../layers/SafeArea";

<SafeArea
  align="center"  // "center" | "top-left" | "top-center" | "center-left"
  debug={false}    // 显示安全区边框（调试用）
>
  {/* 内容 */}
</SafeArea>
```

横屏安全边距: 水平 10% (192px), 垂直 12% (130px)。

## 动画预设库（20 个）

### 一、文字入场动画

#### TextReveal — 逐行揭示

```tsx
<TextReveal
  lines={["第一行", "第二行"]}
  fontSize={48}        // 默认 48
  lineHeight={1.4}     // 默认 1.4
  color="var(--color-primary)"
  staggerDelay={0.15}  // 行间延迟（秒）
  duration={0.6}
/>
```

文字按行从下方滑入，带 overflow hidden 遮罩。通用标题入场。

#### TextFadeUp — 淡入上移

```tsx
<TextFadeUp
  text="标题文字"
  fontSize={48}
  color="var(--color-primary)"
  delay={0}       // 延迟（秒），用于编排多行
  duration={0.7}
/>
```

最基础入场动画。多行时用 delay 错开。

#### SplitTextBounce — 逐字弹入

```tsx
<SplitTextBounce
  text="逐字弹入效果"
  fontSize={72}
  color="var(--color-primary)"
  splitBy="char"       // "char" | "word"
  staggerDelay={0.06}  // 字/词间延迟
  duration={0.5}
/>
```

将文本拆分为字符或单词，逐个弹入 (back.out)。

#### Typewriter — 打字机

```tsx
<Typewriter
  text="逐字打出..."
  fontSize={28}
  typingSpeed={20}     // 每秒字符数
  cursorColor="var(--color-accent)"
  showCursor={true}
/>
```

不使用 GSAP，直接基于 Remotion 帧计算。带闪烁光标。

#### TextColorFill — 颜色填充

```tsx
<TextColorFill
  text="颜色从左到右填充"
  fontSize={64}
  fillColor="var(--color-primary)"
  baseColor="rgba(255,255,255,0.2)"
  duration={1.5}
/>
```

两层文字叠加，上层用 clip-path 从左到右揭示。

### 二、文字强调动画

#### TextHighlight — 荧光笔高亮

```tsx
<TextHighlight
  text="荧光笔高亮标记"
  fontSize={52}
  color="var(--color-primary)"
  highlightColor="rgba(74,158,255,0.25)"
  duration={0.6}
  delay={0}
/>
```

文字背后色块从左到右展开，高度约 40%，模拟荧光笔。

#### TextUnderline — 下划线绘制

```tsx
<TextUnderline
  text="下划线从左到右绘制"
  fontSize={44}
  color="var(--color-primary)"
  lineColor="var(--color-accent)"
  lineWidth={3}
  duration={0.5}
  delay={0}
/>
```

底部下划线从左到右展开。

### 三、列表与步骤动画

#### StaggerList — 多层列表

```tsx
<StaggerList
  items={["要点一", "要点二", "要点三"]}
  title="标题"
  fontSize={32}
  staggerDelay={0.25}
/>
```

每条 = 装饰色条展开 → 序号弹入 → 文字滑入。带左侧竖线。最重的列表预设。

#### BulletPointList — 简洁圆点列表

```tsx
<BulletPointList
  items={["条目一", "条目二", "条目三"]}
  title="标题"          // 可选
  fontSize={30}
  bulletColor="var(--color-accent)"
  staggerDelay={0.2}
/>
```

轻量版列表。圆点弹入 + 文字滑入。

#### NumberedSteps — 编号步骤

```tsx
<NumberedSteps
  steps={[
    { title: "步骤一", description: "描述" },
    { title: "步骤二", description: "描述" },
  ]}
  fontSize={26}
  staggerDelay={0.15}
/>
```

大编号 (01, 02) + 标题滑入 + 描述淡入 + 连接线绘制。

### 四、数据可视化动画

#### NumberCounter — 数字跳动

```tsx
<NumberCounter
  to={1234}
  from={0}           // 默认 0
  label="用户总数"
  prefix=""          // 如 "$"
  suffix=""          // 如 "%"
  fontSize={64}
  color="var(--color-accent)"
  duration={2}       // 秒
  separator={true}   // 千分位分隔
/>
```

环形进度 + 数字 spring 动画 + 标签淡入。

#### BarChart — 垂直柱状图

```tsx
<BarChart
  data={[
    { label: "React", value: 85, color: "var(--color-accent)" },
    { label: "Vue", value: 62 },
  ]}
  height={280}
  fontSize={14}
  duration={0.6}
  staggerDelay={0.12}
/>
```

参考线淡入 → 柱子从底部生长 → 数值/标签淡入。

#### HorizontalBar — 水平条形图

```tsx
<HorizontalBar
  data={[
    { label: "TypeScript", value: 920 },
    { label: "JavaScript", value: 780 },
  ]}
  width={700}
  fontSize={14}
  duration={0.5}
  staggerDelay={0.12}
/>
```

标签淡入 → 条形从左到右生长 → 数值淡入。自动归一化。

#### ProgressBar — 进度条

```tsx
<ProgressBar
  value={87}
  label="项目完成度"
  color="var(--color-accent)"
  height={12}
  duration={2}
  showPercentage={true}
/>
```

使用 Remotion spring 驱动填充和百分比数字。

### 五、结构/流程动画

#### FlowChart — 流程图

```tsx
<FlowChart
  nodes={[
    { id: "a", label: "输入", x: 10, y: 50, width: 120 },
    { id: "b", label: "处理", x: 50, y: 50, width: 120 },
    { id: "c", label: "输出", x: 90, y: 50, width: 120 },
  ]}
  edges={[
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ]}
  width={880}
  height={200}
  duration={0.5}
  staggerDelay={0.3}
/>
```

x/y 是百分比 (0-100)。节点弹入 → SVG 连线 strokeDasharray 绘制 → 箭头。

#### TimelineHorizontal — 水平时间线

```tsx
<TimelineHorizontal
  events={[
    { label: "阶段一", date: "Week 1", description: "详情" },
    { label: "阶段二", date: "Week 2" },
  ]}
  fontSize={18}
  staggerDelay={0.25}
  duration={0.4}
/>
```

主线从左到右绘制 → 节点上下交替出现（圆点→竖线→内容）。

### 六、转场动画

#### MaskTransition — 遮罩揭示转场

```tsx
<MaskTransition
  color="var(--color-accent)"
  direction="left"     // "left" | "right" | "up" | "down"
  duration={0.4}
>
  <div>新内容</div>
</MaskTransition>
```

色块从一侧擦过屏幕，露出新内容。

#### CircleExpand — 圆形扩展转场

```tsx
<CircleExpand
  mode="cover"         // "cover" | "reveal"
  color="var(--color-surface)"
  duration={1.0}
  originX={50}         // 圆心 X 百分比
  originY={50}         // 圆心 Y 百分比
>
  <div>内容</div>
</CircleExpand>
```

cover: 圆从 0 扩大覆盖。reveal: 圆从全覆盖缩小揭示。

### 七、特殊组件

#### CodeBlock — 终端风格代码块

```tsx
<CodeBlock
  code={`const x = 1;\nconsole.log(x);`}
  filename="index.ts"
  fontSize={18}
  lineDelay={0.12}     // 行间延迟
  duration={0.4}
  showLineNumbers={true}
/>
```

macOS 终端风格（三色圆点标题栏）→ 每行 stagger 滑入。

#### SectionTitle — 章节标题卡

```tsx
<SectionTitle
  title="动画预设库"
  subtitle="专业动画预设，覆盖全场景"
  number="PART 03"
  enterDuration={1.0}
  holdDuration={2.0}
  exitDuration={0.6}
/>
```

入场（编号弹入 → 标题滑入 → 副标题淡入 → 横线展开） → 停留 → 出场。

## 创建新 Composition 的步骤

1. 在 `src/compositions/` 创建新文件
2. 导入需要的预设和层组件
3. 用 `Sequence` 编排场景顺序
4. 在 `src/Root.tsx` 注册 Composition
5. 记得 `import "../styles/theme.css"`

场景编排模式：

```tsx
const fps = 30;
const sceneDuration = 5 * fps;

let offset = 0;
const scene = (duration = sceneDuration) => {
  const from = offset;
  offset += duration;
  return { from, durationInFrames: duration };
};

const s1 = scene();        // 5秒
const s2 = scene(7 * fps); // 7秒（复杂场景给更多时间）

return (
  <AbsoluteFill>
    <Sequence {...s1}>
      <AbsoluteFill>
        <BackgroundLayer variant="gradient" />
        <SafeArea align="center">
          <TextReveal lines={["标题"]} fontSize={56} />
        </SafeArea>
      </AbsoluteFill>
    </Sequence>
    <Sequence {...s2}>
      {/* ... */}
    </Sequence>
  </AbsoluteFill>
);
```

## 常用命令

所有命令在项目根目录下执行。

### 启动 Remotion Studio（预览）

```bash
npx remotion studio src/index.ts --port 3123 --public-dir public
```

### TypeScript 检查

```bash
npx tsc --noEmit
```

### 渲染视频

```bash
npx remotion render src/index.ts <CompositionId> out/video.mp4
```

## 创建新预设的模板

```tsx
import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface MyPresetProps {
  // 必须参数
  text: string;
  // 可选参数（都给默认值）
  fontSize?: number;
  color?: string;
  duration?: number;
}

export const MyPreset: React.FC<MyPresetProps> = ({
  text,
  fontSize = 48,
  color = "var(--color-primary)",
  duration = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    // 定义动画序列...
    tl.from(containerRef.current, {
      y: 30, opacity: 0, duration, ease: "power3.out",
    });
  }, [text]); // 内容变化时重建 timeline

  return (
    <div ref={containerRef} style={{ fontSize, color, fontFamily: "var(--font-heading)" }}>
      {text}
    </div>
  );
};
```

**关键规则**:
- 所有预设都是纯函数组件
- 使用 `useGsapTimeline` 定义动画，不要手动操作 GSAP
- 使用 CSS 变量（`var(--color-xxx)`）而不是硬编码颜色
- 使用 `useRef` + `querySelector` 获取动画目标元素
- 所有尺寸参数给合理默认值
- 如果需要帧级精确控制（如逐字显示），可以直接用 Remotion 的 `useCurrentFrame` + `interpolate`/`spring`
