# 动画预设 API 速查

## 一、文字入场动画

### TextReveal — 逐行揭示
```tsx
<TextReveal lines={["行1","行2"]} fontSize={48} lineHeight={1.4} color="var(--color-primary)" staggerDelay={0.15} duration={0.6} />
```
文字按行从下方滑入，overflow hidden 遮罩裁切。

### TextFadeUp — 淡入上移
```tsx
<TextFadeUp text="标题" fontSize={48} color="var(--color-primary)" delay={0} duration={0.7} />
```
最基础入场。多行用 delay 错开。

### SplitTextBounce — 逐字弹入
```tsx
<SplitTextBounce text="弹入" fontSize={72} color="var(--color-primary)" splitBy="char" staggerDelay={0.06} duration={0.5} />
```
splitBy: `"char"` | `"word"`。back.out 弹性。

### Typewriter — 打字机
```tsx
<Typewriter text="逐字..." fontSize={28} typingSpeed={20} cursorColor="var(--color-accent)" showCursor={true} />
```
基于 Remotion 帧计算（不用 GSAP）。闪烁光标。

### TextColorFill — 颜色填充
```tsx
<TextColorFill text="填充" fontSize={64} fillColor="var(--color-primary)" baseColor="rgba(255,255,255,0.2)" duration={1.5} />
```
两层文字，clip-path 从左到右揭示。

## 二、文字强调动画

### TextHighlight — 荧光笔高亮
```tsx
<TextHighlight text="高亮" fontSize={52} color="var(--color-primary)" highlightColor="rgba(74,158,255,0.25)" duration={0.6} delay={0} />
```
背后色块从左展开，高度 40%。

### TextUnderline — 下划线绘制
```tsx
<TextUnderline text="下划线" fontSize={44} color="var(--color-primary)" lineColor="var(--color-accent)" lineWidth={3} duration={0.5} delay={0} />
```
底部线条 scaleX: 0→1。

## 三、列表与步骤动画

### StaggerList — 多层列表
```tsx
<StaggerList items={["要点一","要点二","要点三"]} title="标题" fontSize={32} staggerDelay={0.25} />
```
色条展开 → 序号弹入 → 文字滑入。带左侧竖线。最重的列表预设。

### BulletPointList — 简洁圆点列表
```tsx
<BulletPointList items={["条目一","条目二"]} title="标题" fontSize={30} bulletColor="var(--color-accent)" staggerDelay={0.2} />
```
轻量版。圆点弹入 + 文字滑入。

### NumberedSteps — 编号步骤
```tsx
<NumberedSteps steps={[{title:"步骤一",description:"描述"},{title:"步骤二"}]} fontSize={26} staggerDelay={0.15} />
```
大编号 (01,02) + 标题滑入 + 描述淡入 + 连接线。

## 四、数据可视化动画

### NumberCounter — 数字跳动
```tsx
<NumberCounter to={1234} from={0} label="用户总数" prefix="$" suffix="%" fontSize={64} color="var(--color-accent)" duration={2} separator={true} />
```
环形进度 + spring 数字动画 + 标签淡入。

### BarChart — 垂直柱状图
```tsx
<BarChart data={[{label:"React",value:85,color:"var(--color-accent)"},{label:"Vue",value:62}]} height={280} fontSize={14} duration={0.6} staggerDelay={0.12} />
```
参考线淡入 → 柱子从底生长 → 数值/标签淡入。

### HorizontalBar — 水平条形图
```tsx
<HorizontalBar data={[{label:"TS",value:920},{label:"JS",value:780}]} width={700} fontSize={14} duration={0.5} staggerDelay={0.12} />
```
标签淡入 → 条形左到右 → 数值淡入。自动归一化。

### ProgressBar — 进度条
```tsx
<ProgressBar value={87} label="完成度" color="var(--color-accent)" height={12} duration={2} showPercentage={true} />
```
Remotion spring 驱动填充和百分比数字。

## 五、结构/流程动画

### FlowChart — 流程图
```tsx
<FlowChart
  nodes={[{id:"a",label:"输入",x:10,y:50,width:120},{id:"b",label:"处理",x:50,y:50},{id:"c",label:"输出",x:90,y:50}]}
  edges={[{from:"a",to:"b"},{from:"b",to:"c"}]}
  width={880} height={200} duration={0.5} staggerDelay={0.3}
/>
```
x/y 百分比 (0-100)。节点弹入 → SVG 连线 strokeDasharray → 箭头。

### TimelineHorizontal — 水平时间线
```tsx
<TimelineHorizontal events={[{label:"阶段一",date:"Week 1",description:"详情"},{label:"阶段二",date:"Week 2"}]} fontSize={18} staggerDelay={0.25} duration={0.4} />
```
主线绘制 → 节点上下交替出现。

## 六、转场动画

### MaskTransition — 遮罩揭示转场
```tsx
<MaskTransition color="var(--color-accent)" direction="left" duration={0.4}>
  <div>新内容</div>
</MaskTransition>
```
direction: `"left"` | `"right"` | `"up"` | `"down"`。色块擦过露出新内容。

### CircleExpand — 圆形扩展转场
```tsx
<CircleExpand mode="cover" color="var(--color-surface)" duration={1.0} originX={50} originY={50}>
  <div>内容</div>
</CircleExpand>
```
mode: `"cover"` 扩大覆盖 | `"reveal"` 缩小揭示。

## 七、特殊组件

### CodeBlock — 终端风格代码块
```tsx
<CodeBlock code={`const x = 1;\nconsole.log(x);`} filename="index.ts" fontSize={18} lineDelay={0.12} duration={0.4} showLineNumbers={true} />
```
macOS 终端风格（三色圆点标题栏）→ 每行 stagger 滑入。

### SectionTitle — 章节标题卡
```tsx
<SectionTitle title="章节标题" subtitle="副标题说明" number="PART 03" enterDuration={1.0} holdDuration={2.0} exitDuration={0.6} />
```
入场 → 停留 → 出场。编号弹入 → 标题滑入 → 副标题淡入 → 横线展开。
