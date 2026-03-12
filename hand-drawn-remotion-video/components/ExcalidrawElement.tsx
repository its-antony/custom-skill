import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

type ExcalidrawElementProps = {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  delay?: number;
  drawDuration?: number;
  pathLength?: number;
};

export const ExcalidrawPath: React.FC<ExcalidrawElementProps> = ({
  d,
  stroke = "#1e1e1e",
  strokeWidth = 2,
  fill = "none",
  delay = 0,
  drawDuration = 1,
  pathLength = 1000,
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
      easing: Easing.inOut(Easing.quad),
    },
  );

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      strokeDashoffset={pathLength * (1 - progress)}
    />
  );
};

type HandDrawnBoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  delay?: number;
  drawDuration?: number;
  roughness?: number;
};

function generateRoughRect(
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number,
): string {
  const jitter = () => (Math.random() - 0.5) * roughness;
  return [
    `M ${x + jitter()} ${y + jitter()}`,
    `L ${x + w + jitter()} ${y + jitter()}`,
    `L ${x + w + jitter()} ${y + h + jitter()}`,
    `L ${x + jitter()} ${y + h + jitter()}`,
    `Z`,
  ].join(" ");
}

export const HandDrawnBox: React.FC<HandDrawnBoxProps> = ({
  x,
  y,
  width,
  height,
  stroke = "#1e1e1e",
  strokeWidth = 2,
  fill = "none",
  delay = 0,
  drawDuration = 0.8,
  roughness = 3,
}) => {
  const d = React.useMemo(
    () => generateRoughRect(x, y, width, height, roughness),
    [x, y, width, height, roughness],
  );

  const perimeter = 2 * (width + height) + roughness * 10;

  return (
    <ExcalidrawPath
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      delay={delay}
      drawDuration={drawDuration}
      pathLength={perimeter}
    />
  );
};

type HandDrawnArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  delay?: number;
  drawDuration?: number;
};

export const HandDrawnArrow: React.FC<HandDrawnArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  stroke = "#1e1e1e",
  strokeWidth = 2,
  delay = 0,
  drawDuration = 0.6,
}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 15;
  const jitter = () => (Math.random() - 0.5) * 2;

  const d = React.useMemo(() => {
    const arrowHead1X = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const arrowHead1Y = y2 - headLen * Math.sin(angle - Math.PI / 6);
    const arrowHead2X = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const arrowHead2Y = y2 - headLen * Math.sin(angle + Math.PI / 6);

    return [
      `M ${x1 + jitter()} ${y1 + jitter()}`,
      `L ${x2 + jitter()} ${y2 + jitter()}`,
      `M ${x2} ${y2}`,
      `L ${arrowHead1X + jitter()} ${arrowHead1Y + jitter()}`,
      `M ${x2} ${y2}`,
      `L ${arrowHead2X + jitter()} ${arrowHead2Y + jitter()}`,
    ].join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x1, y1, x2, y2]);

  const totalLength =
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) + headLen * 2 + 20;

  return (
    <ExcalidrawPath
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      delay={delay}
      drawDuration={drawDuration}
      pathLength={totalLength}
    />
  );
};

type HandDrawnCircleProps = {
  cx: number;
  cy: number;
  r: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  delay?: number;
  drawDuration?: number;
};

export const HandDrawnCircle: React.FC<HandDrawnCircleProps> = ({
  cx,
  cy,
  r,
  stroke = "#1e1e1e",
  strokeWidth = 2,
  fill = "none",
  delay = 0,
  drawDuration = 0.8,
}) => {
  const d = React.useMemo(() => {
    const jitter = () => (Math.random() - 0.5) * 2;
    const segments = 12;
    const points: string[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = cx + r * Math.cos(angle) + jitter();
      const py = cy + r * Math.sin(angle) + jitter();
      if (i === 0) {
        points.push(`M ${px} ${py}`);
      } else {
        const prevAngle = ((i - 0.5) / segments) * Math.PI * 2;
        const cpx = cx + r * 1.1 * Math.cos(prevAngle) + jitter();
        const cpy = cy + r * 1.1 * Math.sin(prevAngle) + jitter();
        points.push(`Q ${cpx} ${cpy} ${px} ${py}`);
      }
    }
    return points.join(" ");
  }, [cx, cy, r]);

  return (
    <ExcalidrawPath
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      delay={delay}
      drawDuration={drawDuration}
      pathLength={2 * Math.PI * r + 30}
    />
  );
};
