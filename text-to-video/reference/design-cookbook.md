# 设计手册：如何做出专业级画面

这是 text-to-video skill 中最重要的文件。预设只是零件，这份手册教你怎么组装出专业效果。

## 核心原则：为什么你的视频看起来像 PPT

| PPT 级别 | 专业级别 |
|---------|---------|
| 单层内容直接入场 | 4 层架构，速度分层产生深度感 |
| 静态背景 | 背景持续微妙运动（3-5s 循环） |
| 所有元素同时出现 | stagger 错开，装饰→内容→强调 |
| 一种字号打天下 | 明确的字号层级对比 |
| 渐变紫 + emoji + 大圆角 | 最多 3 色，克制，参考 Dribbble |

## 一、速度分层（深度感的来源）

这是区分 PPT 和专业视频的第一要素。不同层的运动速度必须不同：

```
背景层：最慢（3-5s 周期，模糊 60-80px）
  ↓
装饰层：中等（提前 50-100ms 给内容「铺路」）
  ↓
内容层：最快（主要动画 0.3-0.6s）
  ↓
强调层：最后触发（内容完成后 200-300ms）
```

### 实际示例：一个要点列表场景

```tsx
// ❌ 错误：只有内容层
<SafeArea>
  <StaggerList items={items} />
</SafeArea>

// ✅ 正确：4 层协同
<AbsoluteFill>
  {/* 背景：缓慢漂移的光晕，8s 周期 */}
  <BackgroundLayer variant="gradient" />

  {/* 装饰：左侧竖线提前绘制 */}
  <DecoLine x1={8} y1={15} x2={8} y2={85} delay={0} duration={0.8} />
  <DecoCircle cx={92} cy={12} radius={25} delay={0.3} />

  {/* 内容：在装饰线完成一半时开始 */}
  <SafeArea align="center-left">
    <StaggerList items={items} title="核心要点" />
  </SafeArea>
</AbsoluteFill>
```

## 二、动画时序编排

### 时长参考表

| 动画类型 | 推荐时长 | 缓动 |
|---------|---------|------|
| 简单淡入/淡出 | 0.3-0.5s | power2.out |
| 文字入场（逐行/逐字） | 0.4-0.6s per item | power3.out |
| 列表项 stagger | 0.2-0.3s 项间延迟 | power2.out |
| 图表生长 | 0.6-1.0s | power2.out |
| 转场效果 | 0.4-0.8s | power2.inOut |
| 数字跳动 | 1.5-2.0s | spring |
| 强调效果（高亮/下划线） | 0.3-0.6s | power2.out |
| 背景层运动 | 3-8s 周期 | sine.inOut |

### Stagger 编排模式

```
装饰层触发（提前 50-100ms）
  ↓  -50ms
内容元素 1: delay 0.0s
内容元素 2: delay 0.2s
内容元素 3: delay 0.4s
  ↓  +200ms
强调效果触发（高亮、下划线等）
```

### 多层协同的 GSAP 写法

```tsx
useGsapTimeline((tl) => {
  // 装饰层：最先触发
  tl.from(decoLine, { scaleY: 0, duration: 0.6, ease: "power2.inOut" }, 0);

  // 内容层：装饰线画到一半时开始
  tl.from(title, { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.3);

  // 列表项：标题之后 stagger 入场
  tl.from(items, {
    x: 30, opacity: 0, duration: 0.4,
    ease: "power2.out",
    stagger: 0.2,
  }, 0.6);

  // 强调层：列表完成后
  tl.from(highlight, { scaleX: 0, duration: 0.4, ease: "power2.out" }, "+=0.2");
});
```

## 三、背景层使用指南

### 必须有运动感

```
❌ 静态纹理
❌ 运动太快抢注意力
❌ 边缘生硬截断

✅ 缓慢、微妙（几乎察觉不到）
✅ 模糊处理（60-80px blur）
✅ 上下各 25% 渐隐遮罩
✅ 速度远慢于内容层
```

### 三种背景的适用场景

| 背景 | 适合 | 不适合 |
|------|------|-------|
| `gradient` | 标题页、开场、结尾 | 信息密集页 |
| `grid` | 数据页、技术内容、对比 | 文艺/简约内容 |
| `dots` | 列表页、步骤页、通用 | 需要强存在感的场景 |

### 同一视频内交替使用

避免连续多个场景用同一种背景，交替切换增加节奏感：

```
场景1: gradient（标题）
场景2: grid（技术要点）
场景3: dots（列表）
场景4: gradient（数据展示）
场景5: grid（对比）
场景6: gradient（总结）
```

## 四、装饰层配方

### 基本规则

- 透明度极低：0.04~0.15（若更高会喧宾夺主）
- 颜色统一使用 accent 色的透明版本
- 位置在边角或侧边，不和内容重叠

### 常用组合

**标题页**：
```tsx
<DecoLine x1={5} y1={20} x2={5} y2={80} />          {/* 左侧竖线 */}
<DecoCircle cx={90} cy={15} radius={30} delay={0.3} /> {/* 右上角圆 */}
```

**列表页**：
```tsx
<DecoLine x1={8} y1={10} x2={8} y2={90} />          {/* 左侧引导线 */}
<DecoRect x={85} y={75} width={12} height={2} delay={0.5} /> {/* 右下角色块 */}
```

**数据页**：
```tsx
<DecoCircle cx={15} cy={85} radius={40} />           {/* 左下角大圆 */}
<DecoCircle cx={88} cy={20} radius={20} delay={0.2} /> {/* 右上角小圆 */}
<DecoLine x1={30} y1={90} x2={70} y2={90} delay={0.4} /> {/* 底部横线 */}
```

**代码页**：
```tsx
<DecoLine x1={3} y1={30} x2={3} y2={70} />          {/* 极左侧细线 */}
```

## 五、字号层级规范

```
H1（场景标题）: 48-60px, fontWeight: 700-800, --font-heading
H2（副标题）:   32-40px, fontWeight: 600,     --font-heading
正文:           20-28px, fontWeight: 400,     --font-body
辅助文字:       14-18px, fontWeight: 400,     --font-body, --color-muted
代码:           16-20px, fontWeight: 400,     --font-code
大数字:         56-72px, fontWeight: 800,     --font-heading
```

### 一个场景内的层级对比

```tsx
// ✅ 层级清晰
<TextReveal lines={["Git 核心概念"]} fontSize={52} />           {/* 大标题 */}
<TextFadeUp text="理解这三个区域的关系" fontSize={24} delay={0.5}
  color="var(--color-muted)" />                                 {/* 副标题 */}
<StaggerList items={items} fontSize={30} />                     {/* 正文 */}

// ❌ 没有层级
<TextReveal lines={["Git 核心概念"]} fontSize={36} />
<TextFadeUp text="理解这三个区域的关系" fontSize={32} />
<StaggerList items={items} fontSize={30} />
```

## 六、场景类型配方

### 标题页

```tsx
<BackgroundLayer variant="gradient" />
<DecoLine x1={5} y1={25} x2={5} y2={75} />
<SafeArea align="center">
  <SectionTitle number="PART 01" title="核心概念" subtitle="..." />
</SafeArea>
```
- 背景用 gradient（最有氛围感）
- 内容居中，留白充足
- 3-5 秒（enterDuration + holdDuration + exitDuration）

### 要点列表页

```tsx
<BackgroundLayer variant="grid" />
<DecoLine x1={8} y1={10} x2={8} y2={90} />
<SafeArea align="center-left">
  <StaggerList title="核心要点" items={[...]} />
</SafeArea>
```
- 背景用 grid（有结构感）
- 内容左对齐
- 5-7 秒（取决于要点数量，每条约 0.8-1s）

### 数据展示页

```tsx
<BackgroundLayer variant="gradient" />
<DecoCircle cx={15} cy={85} radius={40} />
<SafeArea align="center">
  <TextReveal lines={["关键数据"]} fontSize={40} />
  <div style={{ display: "flex", gap: 80, marginTop: 40 }}>
    <NumberCounter to={1234} label="用户数" suffix="+" />
    <NumberCounter to={99} label="满意度" suffix="%" />
  </div>
</SafeArea>
```
- 多个 NumberCounter 并排，间距 60-80px
- 标题 + 数据 2 行结构

### 流程/时间线页

```tsx
<BackgroundLayer variant="grid" />
<SafeArea align="center">
  <TextReveal lines={["开发流程"]} fontSize={40} />
  <FlowChart nodes={[...]} edges={[...]} />
</SafeArea>
```
- 背景用 grid（和连线/节点风格搭配）
- 给 7s 以上时间（流程图动画复杂）

### 代码展示页

```tsx
<BackgroundLayer variant="dots" />
<DecoLine x1={3} y1={30} x2={3} y2={70} />
<SafeArea align="center">
  <TextReveal lines={["核心实现"]} fontSize={40} />
  <CodeBlock code={`...`} filename="index.ts" />
</SafeArea>
```
- 背景用 dots（不和代码行竞争）
- 6s 以上（代码逐行出现需要时间）

## 七、颜色使用禁忌

### 绝对不要

```
❌ 渐变紫（#6366f1 → #a855f7）
❌ 彩虹配色
❌ emoji 作为视觉元素
❌ 圆角 > 12px
❌ 毛玻璃 + 阴影堆砌
❌ 荧光色（#00ff00 之类）
```

### 正确的强调色使用

```
✅ accent 色用于：编号、高亮色块、进度条、环形进度
✅ 强调色的透明版本用于：装饰层、背景色块
   rgba(74, 158, 255, 0.3)  → 装饰线
   rgba(74, 158, 255, 0.15) → 装饰圆
   rgba(74, 158, 255, 0.08) → 装饰色块
   rgba(74, 158, 255, 0.06) → 列表行背景
✅ 变换 accent 色时保持同色系：
   主强调: #4a9eff（蓝）
   辅助色: rgba(40, 200, 100, 0.8)（绿，用于正面数据）
   警告色: rgba(255, 180, 50, 0.8)（橙，用于警告数据）
```

## 八、场景时长计算

```
标题页:       3-5 秒
要点页（3条）: 5 秒
要点页（5条）: 7 秒
数据页:       5-6 秒
流程图:       7-8 秒
时间线:       7-8 秒
代码页:       6-7 秒（取决于行数）
转场:         1-2 秒
```

计算公式：`入场时间 + 内容停留 + 余量 ≈ 总时长`
- 入场时间 = 最后一个元素完成动画的时间
- 内容停留 = 至少 1-2 秒让观众阅读
- 余量 = 0.5-1 秒

## 九、完整场景示例

### 从零搭建一个「技术要点」场景

```tsx
<Sequence from={startFrame} durationInFrames={7 * 30}>
  <AbsoluteFill>
    {/* 1. 背景层 - grid 有技术感 */}
    <BackgroundLayer variant="grid" />

    {/* 2. 装饰层 - 左侧引导线 + 右上角圆 */}
    <DecoLine x1={8} y1={12} x2={8} y2={88}
      color="rgba(74,158,255,0.25)" duration={0.8} />
    <DecoCircle cx={92} cy={10} radius={25}
      color="rgba(74,158,255,0.12)" delay={0.3} />

    {/* 3. 安全区 + 内容 */}
    <SafeArea align="center-left">
      <StaggerList
        title="Remotion + GSAP 优势"
        items={[
          "帧精度控制，支持进度条拖动",
          "GSAP 的 timeline 编排能力",
          "React 组件化，可复用预设库",
          "导出 MP4，支持 4K 分辨率",
        ]}
        fontSize={30}
        staggerDelay={0.25}
      />
    </SafeArea>
  </AbsoluteFill>
</Sequence>
```

**为什么这样搭配**：
- grid 背景和技术内容气质匹配
- 左侧装饰线和 StaggerList 的左侧竖线呼应
- 右上角圆形平衡画面，避免左重右轻
- center-left 对齐，列表内容从左读到右更自然
- 4 条要点 × stagger 0.25s ≈ 3s 入场 + 2s 停留 + 2s 余量 = 7s
