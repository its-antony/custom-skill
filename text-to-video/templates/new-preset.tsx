/**
 * 新预设模板
 *
 * 使用步骤：
 * 1. 复制此文件到 src/presets/YourPresetName.tsx
 * 2. 重命名组件和接口
 * 3. 定义 GSAP 动画序列
 *
 * 关键规则：
 * - 使用 useGsapTimeline 定义动画，不要手动操作 GSAP
 * - 使用 CSS 变量 var(--color-xxx) 而不是硬编码颜色
 * - 所有尺寸参数给合理默认值
 * - 帧级精确控制可用 Remotion 的 useCurrentFrame + interpolate/spring
 */
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
      y: 30,
      opacity: 0,
      duration,
      ease: "power3.out",
    });
  }, [text]); // 内容变化时重建 timeline

  return (
    <div
      ref={containerRef}
      style={{
        fontSize,
        color,
        fontFamily: "var(--font-heading)",
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
};
