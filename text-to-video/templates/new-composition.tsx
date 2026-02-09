/**
 * 新 Composition 模板
 *
 * 使用步骤：
 * 1. 复制此文件到 src/compositions/YourComposition.tsx
 * 2. 在 src/Root.tsx 注册：
 *    <Composition id="YourId" component={YourComposition}
 *      durationInFrames={totalFrames} fps={30} width={1920} height={1080} />
 * 3. 导入需要的预设组件
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "../styles/theme.css";
import { BackgroundLayer } from "../layers/BackgroundLayer";
import { SafeArea } from "../layers/SafeArea";
import { DecoLine } from "../layers/DecorationLayer";
// 按需导入预设
// import { TextReveal } from "../presets/TextReveal";
// import { StaggerList } from "../presets/StaggerList";

const fps = 30;

// 场景计时工具：自动累加偏移
let _offset = 0;
const scene = (seconds: number) => {
  const from = _offset;
  const durationInFrames = seconds * fps;
  _offset += durationInFrames;
  return { from, durationInFrames };
};

export const MyComposition: React.FC = () => {
  // 重置偏移（组件可能重复渲染）
  _offset = 0;

  const s1 = scene(5); // 5 秒
  const s2 = scene(7); // 7 秒（复杂场景给更多时间）
  const s3 = scene(5);

  return (
    <AbsoluteFill>
      {/* 场景 1：标题 */}
      <Sequence {...s1}>
        <AbsoluteFill>
          <BackgroundLayer variant="gradient" />
          <DecoLine x1={5} y1={20} x2={5} y2={80} />
          <SafeArea align="center">
            {/* 放内容组件 */}
          </SafeArea>
        </AbsoluteFill>
      </Sequence>

      {/* 场景 2：要点列表 */}
      <Sequence {...s2}>
        <AbsoluteFill>
          <BackgroundLayer variant="grid" />
          <SafeArea align="center-left">
            {/* 放内容组件 */}
          </SafeArea>
        </AbsoluteFill>
      </Sequence>

      {/* 场景 3：结尾 */}
      <Sequence {...s3}>
        <AbsoluteFill>
          <BackgroundLayer variant="dots" />
          <SafeArea align="center">
            {/* 放内容组件 */}
          </SafeArea>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
