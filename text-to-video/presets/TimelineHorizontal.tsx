import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TimelineEvent {
  label: string;
  description?: string;
  date?: string;
}

interface TimelineHorizontalProps {
  events: TimelineEvent[];
  fontSize?: number;
  staggerDelay?: number;
  duration?: number;
}

/**
 * 水平时间线
 * 主线从左到右绘制 → 节点上下交替出现
 */
export const TimelineHorizontal: React.FC<TimelineHorizontalProps> = ({
  events,
  fontSize = 18,
  staggerDelay = 0.25,
  duration = 0.4,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const lineY = 120; // 主线的 Y 位置
  const stemHeight = 40;
  const dotSize = 10;
  const padding = 60; // 左右留白

  useGsapTimeline(
    (tl) => {
      if (!containerRef.current) return;

      // 主线绘制
      const mainLine = containerRef.current.querySelector(
        ".th-main-line"
      ) as SVGLineElement | null;
      if (mainLine) {
        const length = mainLine.getTotalLength();
        tl.set(mainLine, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        tl.to(mainLine, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.inOut",
        });
      }

      // 每个事件节点
      const eventGroups =
        containerRef.current.querySelectorAll(".th-event-group");
      eventGroups.forEach((group, i) => {
        const dot = group.querySelector(".th-dot");
        const stem = group.querySelector(".th-stem") as SVGLineElement | null;
        const content = group.querySelector(".th-content");

        const pos = i === 0 ? "-=0.3" : `+=${staggerDelay * 0.3}`;

        // 圆点出现
        if (dot) {
          tl.from(
            dot,
            {
              scale: 0,
              opacity: 0,
              duration: duration * 0.5,
              ease: "back.out(2)",
            },
            pos
          );
        }

        // 竖线绘制
        if (stem) {
          const stemLen = stem.getTotalLength();
          tl.set(stem, {
            strokeDasharray: stemLen,
            strokeDashoffset: stemLen,
          });
          tl.to(
            stem,
            {
              strokeDashoffset: 0,
              duration: duration * 0.5,
              ease: "power2.out",
            },
            "-=0.1"
          );
        }

        // 文字内容淡入
        if (content) {
          tl.from(
            content,
            {
              y: 10,
              opacity: 0,
              duration: duration * 0.6,
              ease: "power2.out",
            },
            "-=0.15"
          );
        }
      });
    },
    [events]
  );

  // 计算每个事件的 X 位置（均匀分布）
  const totalWidth = 900; // 默认宽度，使用百分比会更好但保持一致
  const spacing =
    events.length > 1
      ? (totalWidth - padding * 2) / (events.length - 1)
      : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: totalWidth,
        height: 260,
      }}
    >
      {/* SVG 层：主线 + 竖线 + 圆点 */}
      <svg
        width={totalWidth}
        height={260}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* 主线 */}
        <line
          className="th-main-line"
          x1={padding}
          y1={lineY}
          x2={totalWidth - padding}
          y2={lineY}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
        />

        {events.map((_, i) => {
          const x = events.length === 1 ? totalWidth / 2 : padding + i * spacing;
          const isAbove = i % 2 === 0;
          const stemY1 = lineY;
          const stemY2 = isAbove ? lineY - stemHeight : lineY + stemHeight;

          return (
            <g key={i} className="th-event-group">
              {/* 竖线 */}
              <line
                className="th-stem"
                x1={x}
                y1={stemY1}
                x2={x}
                y2={stemY2}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1}
              />
              {/* 圆点 */}
              <circle
                className="th-dot"
                cx={x}
                cy={lineY}
                r={dotSize / 2}
                fill="var(--color-accent)"
              />
            </g>
          );
        })}
      </svg>

      {/* 文字内容层 */}
      {events.map((event, i) => {
        const x = events.length === 1 ? totalWidth / 2 : padding + i * spacing;
        const isAbove = i % 2 === 0;

        return (
          <div
            key={i}
            className="th-event-group"
            style={{ position: "absolute" }}
          >
            <div
              className="th-content"
              style={{
                position: "absolute",
                left: x,
                top: isAbove ? lineY - stemHeight - 12 : lineY + stemHeight + 12,
                transform: "translateX(-50%)",
                textAlign: "center",
                display: "flex",
                flexDirection: isAbove ? "column-reverse" : "column",
                gap: 4,
                maxWidth: spacing > 0 ? spacing - 16 : 200,
              }}
            >
              {event.date && (
                <div
                  style={{
                    fontSize: fontSize * 0.7,
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-code)",
                    fontWeight: 600,
                  }}
                >
                  {event.date}
                </div>
              )}
              <div
                style={{
                  fontSize,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {event.label}
              </div>
              {event.description && (
                <div
                  style={{
                    fontSize: fontSize * 0.8,
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.4,
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
