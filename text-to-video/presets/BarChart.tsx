import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  fontSize?: number;
  duration?: number;
  staggerDelay?: number;
}

/**
 * 垂直柱状图
 *
 * 动画序列：
 * 1. 参考线淡入
 * 2. 柱子从底部 scaleY: 0→1 生长（带 stagger）
 * 3. 数值标签淡入
 * 4. 类别标签淡入
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  fontSize = 14,
  duration = 0.6,
  staggerDelay = 0.12,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maxValue = Math.max(...data.map((d) => d.value));
  const refLineCount = 4;

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;

    // 参考线淡入
    const refLines = containerRef.current.querySelectorAll(".bc-ref-line");
    if (refLines.length > 0) {
      tl.from(refLines, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    }

    // 柱子生长
    const bars = containerRef.current.querySelectorAll(".bc-bar");
    if (bars.length > 0) {
      tl.from(bars, {
        scaleY: 0,
        duration,
        stagger: staggerDelay,
        ease: "power2.out",
      }, "-=0.1");
    }

    // 数值标签
    const values = containerRef.current.querySelectorAll(".bc-value");
    if (values.length > 0) {
      tl.from(values, {
        opacity: 0,
        y: 8,
        duration: 0.3,
        stagger: staggerDelay * 0.5,
        ease: "power2.out",
      }, `-=${duration * 0.3}`);
    }

    // 类别标签
    const labels = containerRef.current.querySelectorAll(".bc-label");
    if (labels.length > 0) {
      tl.from(labels, {
        opacity: 0,
        duration: 0.3,
        stagger: staggerDelay * 0.5,
        ease: "power2.out",
      }, "-=0.3");
    }
  }, [data]);

  const barGap = 16;
  const barWidth = Math.max(24, Math.min(64, (600 - barGap * (data.length - 1)) / data.length));

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* 图表区域 */}
      <div
        style={{
          position: "relative",
          height,
          display: "flex",
          alignItems: "flex-end",
          gap: barGap,
          paddingLeft: 40,
        }}
      >
        {/* 水平参考线 */}
        {Array.from({ length: refLineCount }).map((_, i) => {
          const y = ((i + 1) / refLineCount) * height;
          const refValue = Math.round((maxValue * (i + 1)) / refLineCount);
          return (
            <div
              key={`ref-${i}`}
              className="bc-ref-line"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: y,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: fontSize * 0.85,
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-code)",
                  width: 36,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {refValue}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />
            </div>
          );
        })}

        {/* 柱子 */}
        {data.map((item, i) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 20) : 0;
          const barColor = item.color || "var(--color-accent)";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                width: barWidth,
              }}
            >
              {/* 数值 */}
              <span
                className="bc-value"
                style={{
                  fontSize,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-code)",
                }}
              >
                {item.value}
              </span>
              {/* 柱体 */}
              <div
                className="bc-bar"
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: "4px 4px 0 0",
                  transformOrigin: "bottom center",
                  opacity: 0.85,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 底部标签 */}
      <div
        style={{
          display: "flex",
          gap: barGap,
          paddingLeft: 40,
          marginTop: 12,
        }}
      >
        {data.map((item, i) => (
          <span
            key={i}
            className="bc-label"
            style={{
              width: barWidth,
              fontSize: fontSize * 0.9,
              color: "var(--color-muted)",
              fontFamily: "var(--font-body)",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
