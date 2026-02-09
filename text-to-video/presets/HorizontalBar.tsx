import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface HorizontalBarData {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarProps {
  data: HorizontalBarData[];
  width?: number;
  fontSize?: number;
  duration?: number;
  staggerDelay?: number;
}

/**
 * 水平条形图
 *
 * 动画序列：
 * 1. 标签淡入
 * 2. 条形从左到右 scaleX: 0→1 生长（带 stagger）
 * 3. 数值淡入
 */
export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  data,
  width = 500,
  fontSize = 14,
  duration = 0.5,
  staggerDelay = 0.12,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maxValue = Math.max(...data.map((d) => d.value));
  const labelWidth = 80;
  const valueWidth = 50;
  const barMaxWidth = width - labelWidth - valueWidth - 24;

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;

    // 标签淡入
    const labels = containerRef.current.querySelectorAll(".hb-label");
    if (labels.length > 0) {
      tl.from(labels, {
        opacity: 0,
        x: -10,
        duration: 0.3,
        stagger: staggerDelay * 0.5,
        ease: "power2.out",
      });
    }

    // 条形生长
    const bars = containerRef.current.querySelectorAll(".hb-bar");
    if (bars.length > 0) {
      tl.from(bars, {
        scaleX: 0,
        duration,
        stagger: staggerDelay,
        ease: "power2.out",
      }, "-=0.2");
    }

    // 数值淡入
    const values = containerRef.current.querySelectorAll(".hb-value");
    if (values.length > 0) {
      tl.from(values, {
        opacity: 0,
        duration: 0.3,
        stagger: staggerDelay * 0.5,
        ease: "power2.out",
      }, `-=${duration * 0.4}`);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width,
      }}
    >
      {data.map((item, i) => {
        const barWidth = maxValue > 0 ? (item.value / maxValue) * barMaxWidth : 0;
        const barColor = item.color || "var(--color-accent)";
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* 标签 */}
            <span
              className="hb-label"
              style={{
                width: labelWidth,
                fontSize,
                color: "var(--color-muted)",
                fontFamily: "var(--font-body)",
                textAlign: "right",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {item.label}
            </span>

            {/* 条形 */}
            <div
              style={{
                flex: 1,
                height: 28,
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 4,
                position: "relative",
              }}
            >
              <div
                className="hb-bar"
                style={{
                  width: barWidth,
                  height: "100%",
                  backgroundColor: barColor,
                  borderRadius: "4px",
                  transformOrigin: "left center",
                  opacity: 0.85,
                }}
              />
            </div>

            {/* 数值 */}
            <span
              className="hb-value"
              style={{
                width: valueWidth,
                fontSize,
                fontWeight: 600,
                color: "var(--color-primary)",
                fontFamily: "var(--font-code)",
                flexShrink: 0,
              }}
            >
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
