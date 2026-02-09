import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface NumberCounterProps {
  from?: number;
  to: number;
  fontSize?: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
  duration?: number;
  separator?: boolean;
}

/**
 * 预设5（升级版）：数字跳动
 * 多层组合：环形进度 + 数字跳动 + 标签淡入 + 装饰元素
 *
 * 动画序列：
 * 1. 外圈装饰环淡入
 * 2. 进度弧绘制
 * 3. 数字从 0 跳到目标值
 * 4. 标签文字淡入
 */
export const NumberCounter: React.FC<NumberCounterProps> = ({
  from = 0,
  to,
  fontSize = 64,
  label,
  prefix = "",
  suffix = "",
  color = "var(--color-accent)",
  duration = 2,
  separator = true,
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

  const currentValue = Math.round(interpolate(progress, [0, 1], [from, to]));
  const formatted = separator ? currentValue.toLocaleString("en-US") : String(currentValue);

  // 环形尺寸根据目标数字位数自适应
  const digitCount = String(to).length + (separator && to >= 1000 ? Math.floor((String(to).length - 1) / 3) : 0);
  const radius = Math.max(72, fontSize * 0.55 * Math.max(digitCount, 2));

  // 环形进度的角度
  const arcAngle = interpolate(progress, [0, 1], [0, 280]);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (arcAngle / 360) * circumference;

  // 标签淡入（数字动画完成后）
  const labelOpacity = interpolate(
    frame,
    [Math.round(duration * fps * 0.6), Math.round(duration * fps * 0.8)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 装饰环淡入
  const ringOpacity = interpolate(
    frame,
    [0, Math.round(fps * 0.3)],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    tl.from(containerRef.current, {
      scale: 0.9,
      opacity: 0,
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
        alignItems: "center",
        gap: 16,
        position: "relative",
      }}
    >
      {/* 环形进度装饰 */}
      <div style={{ position: "relative", width: radius * 2 + 32, height: radius * 2 + 32 }}>
        <svg
          width={radius * 2 + 32}
          height={radius * 2 + 32}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* 底圈 */}
          <circle
            cx={radius + 16}
            cy={radius + 16}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={3}
            opacity={ringOpacity}
          />
          {/* 进度弧 */}
          <circle
            cx={radius + 16}
            cy={radius + 16}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            opacity={0.8}
            transform={`rotate(-90 ${radius + 16} ${radius + 16})`}
          />
          {/* 顶部小圆点 */}
          <circle
            cx={radius + 16}
            cy={16}
            r={4}
            fill={color}
            opacity={ringOpacity}
          />
        </svg>

        {/* 数字居中 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            {prefix && (
              <span style={{ fontSize: fontSize * 0.4, color: "rgba(255,255,255,0.4)" }}>
                {prefix}
              </span>
            )}
            <span
              style={{
                fontSize,
                fontWeight: 800,
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {formatted}
            </span>
            {suffix && (
              <span style={{ fontSize: fontSize * 0.35, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div
        style={{
          fontSize: 18,
          color: "var(--color-muted)",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          opacity: labelOpacity,
        }}
      >
        {label}
      </div>
    </div>
  );
};
