# Hand-Drawn Remotion Video Skill — 全面提升设计文档

**日期**：2026-03-12
**范围**：组件修复 + 新增组件 + 多分辨率 + 场景模板 + 配音工作流

---

## 1. 修复现有组件

### 1.1 Seed-based jitter 替换 Math.random()

**问题**：`HandDrawnBox`、`HandDrawnArrow`、`HandDrawnCircle` 中的 `jitter()` 使用 `Math.random()`，导致：
- React Strict Mode 双重渲染产生不同路径
- Remotion 多 worker 渲染不一致

**方案**：在 `ExcalidrawElement.tsx` 顶部添加 `seededRandom(seed: number)` 函数（mulberry32 算法），所有 jitter 调用改为用组件参数哈希作为 seed。

### 1.2 HandDrawnArrow eslint-disable 清理

**问题**：`angle` 在 `useMemo` 外计算但在内部使用，有 eslint-disable 注释。

**方案**：将 `angle` 计算移入 `useMemo` 内部，移除 eslint-disable。

---

## 2. 新增组件

### 2.1 HandDrawnParagraph

**用途**：自动换行多行文字，解决 SVG text 没有 word-wrap 的痛点。

**Props**：
- `text: string` — 完整文本
- `x, y: number` — 起始位置
- `maxWidth: number` — 最大宽度
- `lineHeight?: number` — 行高（默认 fontSize × 1.4）
- `fontSize?: number` — 字号（默认 24）
- `fontFamily?: string`
- `fill?: string`
- `delay?: number`
- `style?: "typewriter" | "fadeIn"` — typewriter 模式跨行连续打字

**实现要点**：
- 中文字符宽度按 `fontSize × 0.9` 估算
- 英文/数字按 `fontSize × 0.55` 估算
- 输出多个 `<tspan>` 元素，每行 `dy={lineHeight}`

### 2.2 HandDrawnHighlight

**用途**：荧光笔高亮或手绘下划线，强调关键词。

**Props**：
- `x, y: number` — 位置
- `width: number` — 宽度
- `height?: number` — 高亮高度（默认 fontSize × 0.4）
- `type?: "highlight" | "underline"` — 模式
- `color?: string` — 颜色（默认 `#E8D44D`）
- `delay?: number`
- `drawDuration?: number`

**实现要点**：
- highlight：半透明矩形 + jitter（seed-based），stroke-dasharray 从左到右绘制
- underline：Q 贝塞尔曲线手绘线条，同样有绘制动画

### 2.3 HandDrawnCheckmark / HandDrawnCross

**用途**：替代优缺点场景中的 `+/-` 文字前缀。

**Props**：
- `cx, cy: number` — 中心点
- `size?: number` — 尺寸（默认 20）
- `stroke?: string` — 颜色（Checkmark 默认 `#81B29A`，Cross 默认 `#E07A5F`）
- `delay?: number`
- `drawDuration?: number`

**实现要点**：
- Checkmark：两段 path（短斜线 + 长斜线）组成 ✓
- Cross：两段交叉 path 组成 ✗
- 都用 stroke-dasharray 动画绘制

---

## 3. 多分辨率支持

### 3.1 Resolution.ts

新增 `components/Resolution.ts`，导出：

```ts
export const RESOLUTIONS = {
  landscape_hd:  { width: 1280, height: 720,  fps: 30 },
  landscape_fhd: { width: 1920, height: 1080, fps: 30 },
  portrait_hd:   { width: 1080, height: 1920, fps: 30 },
} as const;
```

### 3.2 SKILL.md 适配指导

- 场景模板中用 resolution 变量替代硬编码 1280x720
- 竖版视频注意事项：布局从左右并排改为上下堆叠，字号 ×1.3，内容精简

---

## 4. 场景模板扩充

### 4.1 时间线/步骤流程

- 横向时间线：底部手绘横线 + 等距圆形节点 + 箭头连接 + 标签
- 纵向步骤流程：左侧编号圆圈 + 右侧步骤说明框 + 虚线箭头连接

### 4.2 代码展示

- 深色 HandDrawnBox 背景模拟终端
- 等宽字体 + 逐行 fadeIn + HandDrawnHighlight 关键行标记

### 4.3 数据列表（带图标）

- 左侧 HandDrawnCheckmark/Cross + 右侧说明文字
- 替代纯文字 +/- 方案

---

## 5. 配音工作流完善

### 5.1 批量 TTS 脚本模板

替换当前单条命令为 Python 批量脚本：
- 输入场景文案字典
- 循环生成音频 + 自动获取时长 + 输出帧数

### 5.2 Delay 计算公式

```
elementDelay = audioSeconds / (elementCount + 1) * elementIndex
```

配合完整有配音场景示例说明。

### 5.3 MiniMax TTS

保持简略提及，不写完整代码模板。

---

## 6. 实施顺序

1. 修复 ExcalidrawElement.tsx（seed-based jitter + Arrow 清理）
2. 新增 HandDrawnParagraph
3. 新增 HandDrawnHighlight
4. 新增 HandDrawnCheckmark / HandDrawnCross
5. 新增 Resolution.ts
6. 全面更新 SKILL.md（组件文档 + 场景模板 + 配音工作流 + 分辨率）
