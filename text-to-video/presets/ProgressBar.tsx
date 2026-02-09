import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
  height?: number;
  duration?: number;
  showPercentage?: boolean;
}

/**
 * 进度条 + 百分比数字
 *
 * 动画：
 * 1. 容器淡入（GSAP）
 * 2. 填充条 scaleX: 0 → value/100（Remotion spring）
 * 3. 百分比数字同步增长 0% → value%（Remotion spring）
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = "var(--color-accent)",
  height = 12,
  duration = 2,
  showPercentage = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 80, mass: 1 },
    durationInFrames: Math.round(duration * fps),
  });

  const fillScale = interpolate(progress, [0, 1], [0, value / 100]);
  const currentPercent = Math.round(interpolate(progress, [0, 1], [0, value]));

  // 容器淡入
  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    tl.from(containerRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
      }}
    >
      {/* 上方：标签 + 百分比 */}
      {(label || showPercentage) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          {label && (
            <span
              style={{
                fontSize: 16,
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-primary)",
                fontFamily: "var(--font-code)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currentPercent}%
            </span>
          )}
        </div>
      )}

      {/* 进度条 */}
      <div
        style={{
          width: "100%",
          height,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: height / 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: color,
            borderRadius: height / 2,
            transformOrigin: "left center",
            transform: `scaleX(${fillScale})`,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
};
