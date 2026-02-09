import React, { useRef } from "react";
import { AbsoluteFill } from "remotion";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface DecoLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  delay?: number;
  duration?: number;
}

/**
 * 装饰线条：SVG 线条绘制动画
 */
export const DecoLine: React.FC<DecoLineProps> = ({
  x1, y1, x2, y2,
  color = "rgba(74, 158, 255, 0.3)",
  delay = 0,
  duration = 0.8,
}) => {
  const lineRef = useRef<SVGLineElement>(null);

  useGsapTimeline((tl) => {
    if (!lineRef.current) return;
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    tl.set(lineRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    tl.to(lineRef.current, {
      strokeDashoffset: 0,
      duration,
      ease: "power2.inOut",
      delay,
    });
  }, [x1, y1, x2, y2]);

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <line
        ref={lineRef}
        x1={`${x1}%`} y1={`${y1}%`}
        x2={`${x2}%`} y2={`${y2}%`}
        stroke={color}
        strokeWidth={1}
      />
    </svg>
  );
};

interface DecoCircleProps {
  cx: number;
  cy: number;
  radius: number;
  color?: string;
  delay?: number;
  duration?: number;
}

/**
 * 装饰圆形：从中心扩展出来
 */
export const DecoCircle: React.FC<DecoCircleProps> = ({
  cx, cy, radius,
  color = "rgba(74, 158, 255, 0.15)",
  delay = 0,
  duration = 0.6,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);

  useGsapTimeline((tl) => {
    if (!circleRef.current) return;
    tl.from(circleRef.current, {
      attr: { r: 0 },
      opacity: 0,
      duration,
      ease: "power2.out",
      delay,
    });
  }, [cx, cy, radius]);

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <circle
        ref={circleRef}
        cx={`${cx}%`} cy={`${cy}%`}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
    </svg>
  );
};

interface DecoRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  delay?: number;
  duration?: number;
}

/**
 * 装饰色块：从左侧展开
 */
export const DecoRect: React.FC<DecoRectProps> = ({
  x, y, width, height,
  color = "rgba(74, 158, 255, 0.08)",
  delay = 0,
  duration = 0.5,
}) => {
  const rectRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!rectRef.current) return;
    tl.from(rectRef.current, {
      scaleX: 0,
      opacity: 0,
      duration,
      ease: "power2.out",
      delay,
    });
  }, [x, y, width, height]);

  return (
    <div
      ref={rectRef}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius: 4,
        transformOrigin: "left center",
      }}
    />
  );
};
