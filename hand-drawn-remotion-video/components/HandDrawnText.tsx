import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

type HandDrawnTextProps = {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  delay?: number;
  style?: "typewriter" | "fadeIn" | "popIn";
  textAnchor?: "start" | "middle" | "end";
};

export const HandDrawnText: React.FC<HandDrawnTextProps> = ({
  text,
  x,
  y,
  fontSize = 32,
  fontFamily = "'Caveat Brush', 'Segoe Print', cursive",
  fill = "#1e1e1e",
  delay = 0,
  style = "typewriter",
  textAnchor = "start",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (style === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(frame, [delay * fps, (delay + text.length * 0.05) * fps], [0, text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    const displayText = text.slice(0, charsToShow);

    return (
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={fill}
        dominantBaseline="middle"
        textAnchor={textAnchor}
      >
        {displayText}
        {charsToShow < text.length && charsToShow > 0 && (
          <tspan
            style={{
              opacity: frame % (fps / 2) < fps / 4 ? 1 : 0,
            }}
          >
            |
          </tspan>
        )}
      </text>
    );
  }

  if (style === "popIn") {
    const scale = spring({
      frame: frame - delay * fps,
      fps,
      config: { damping: 8, stiffness: 200 },
    });

    return (
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={fill}
        dominantBaseline="middle"
        textAnchor={textAnchor}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${x}px ${y}px`,
        }}
      >
        {text}
      </text>
    );
  }

  // fadeIn
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + 0.5) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      opacity={opacity}
      dominantBaseline="middle"
      textAnchor={textAnchor}
    >
      {text}
    </text>
  );
};
