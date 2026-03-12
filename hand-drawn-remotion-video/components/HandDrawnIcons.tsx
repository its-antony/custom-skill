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

type IconProps = {
  cx: number;
  cy: number;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  delay?: number;
  drawDuration?: number;
};

export const HandDrawnCheckmark: React.FC<IconProps> = ({
  cx,
  cy,
  size = 20,
  stroke = "#81B29A",
  strokeWidth = 3,
  delay = 0,
  drawDuration = 0.4,
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
    const rand = mulberry32(hashSeed(cx, cy, size, 1));
    const jitter = () => (rand() - 0.5) * 1.5;
    const half = size / 2;

    // Checkmark: short stroke down-right, then long stroke up-right
    const startX = cx - half + jitter();
    const startY = cy + jitter();
    const midX = cx - half * 0.3 + jitter();
    const midY = cy + half * 0.5 + jitter();
    const endX = cx + half + jitter();
    const endY = cy - half * 0.5 + jitter();

    return `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`;
  }, [cx, cy, size]);

  const pathLength = size * 2.5;

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      strokeDashoffset={pathLength * (1 - progress)}
    />
  );
};

export const HandDrawnCross: React.FC<IconProps> = ({
  cx,
  cy,
  size = 20,
  stroke = "#E07A5F",
  strokeWidth = 3,
  delay = 0,
  drawDuration = 0.4,
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

  const paths = React.useMemo(() => {
    const rand = mulberry32(hashSeed(cx, cy, size, 2));
    const jitter = () => (rand() - 0.5) * 1.5;
    const half = size / 2;

    const d1 = `M ${cx - half + jitter()} ${cy - half + jitter()} L ${cx + half + jitter()} ${cy + half + jitter()}`;
    const d2 = `M ${cx + half + jitter()} ${cy - half + jitter()} L ${cx - half + jitter()} ${cy + half + jitter()}`;

    return { d1, d2 };
  }, [cx, cy, size]);

  const pathLength = size * 1.8;

  // First stroke draws in first half, second stroke in second half
  const progress1 = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress2 = interpolate(progress, [0.4, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      <path
        d={paths.d1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress1)}
      />
      <path
        d={paths.d2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress2)}
      />
    </g>
  );
};
