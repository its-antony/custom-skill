import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// Reuse the same seeded random from ExcalidrawElement
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(...values: number[]): number {
  let h = 0;
  for (const v of values) {
    h = ((h << 5) - h + (v * 1000)) | 0;
  }
  return h;
}

type HandDrawnHighlightProps = {
  x: number;
  y: number;
  width: number;
  height?: number;
  type?: "highlight" | "underline";
  color?: string;
  opacity?: number;
  delay?: number;
  drawDuration?: number;
};

export const HandDrawnHighlight: React.FC<HandDrawnHighlightProps> = ({
  x,
  y,
  width,
  height,
  type = "highlight",
  color = "#E8D44D",
  opacity = 0.4,
  delay = 0,
  drawDuration = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay * fps, (delay + drawDuration) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  const d = React.useMemo(() => {
    const rand = mulberry32(hashSeed(x, y, width));
    const jitter = () => (rand() - 0.5) * 2;

    if (type === "underline") {
      // A slightly wavy hand-drawn underline using quadratic bezier
      const midX = x + width / 2;
      const cpY = y + (rand() - 0.5) * 4; // slight wave
      return `M ${x + jitter()} ${y + jitter()} Q ${midX + jitter()} ${cpY + jitter()} ${x + width + jitter()} ${y + jitter()}`;
    }

    // Highlight: a filled rectangular swipe
    const h = height ?? 18;
    return [
      `M ${x + jitter()} ${y + jitter()}`,
      `L ${x + width + jitter()} ${y + jitter()}`,
      `L ${x + width + jitter()} ${y + h + jitter()}`,
      `L ${x + jitter()} ${y + h + jitter()}`,
      `Z`,
    ].join(" ");
  }, [x, y, width, height, type]);

  if (type === "underline") {
    const pathLength = width + 20;
    return (
      <path
        d={d}
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
      />
    );
  }

  // Highlight: swipe from left to right using clipPath
  return (
    <g>
      <defs>
        <clipPath id={`highlight-clip-${x}-${y}`}>
          <rect x={x} y={y} width={width * progress} height={(height ?? 18) + 4} />
        </clipPath>
      </defs>
      <path
        d={d}
        fill={color}
        opacity={opacity}
        stroke="none"
        clipPath={`url(#highlight-clip-${x}-${y})`}
      />
    </g>
  );
};
