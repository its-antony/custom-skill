import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface MaskTransitionProps {
  color?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  children?: React.ReactNode;
}

/**
 * 预设4：遮罩揭示转场
 * 一个色块从一侧擦过屏幕，露出新内容。
 * 分两步：色块进入覆盖 → 色块离开揭示新内容。
 */
export const MaskTransition: React.FC<MaskTransitionProps> = ({
  color = "var(--color-accent)",
  direction = "left",
  duration = 0.4,
  children,
}) => {
  const maskRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getTransform = (phase: "enter" | "exit") => {
    const map = {
      left: {
        enter: { from: "translateX(-100%)", to: "translateX(0%)" },
        exit: { from: "translateX(0%)", to: "translateX(100%)" },
      },
      right: {
        enter: { from: "translateX(100%)", to: "translateX(0%)" },
        exit: { from: "translateX(0%)", to: "translateX(-100%)" },
      },
      up: {
        enter: { from: "translateY(-100%)", to: "translateY(0%)" },
        exit: { from: "translateY(0%)", to: "translateY(100%)" },
      },
      down: {
        enter: { from: "translateY(100%)", to: "translateY(0%)" },
        exit: { from: "translateY(0%)", to: "translateY(-100%)" },
      },
    };
    return map[direction][phase];
  };

  useGsapTimeline((tl) => {
    if (!maskRef.current || !contentRef.current) return;

    const enter = getTransform("enter");
    const exit = getTransform("exit");

    // 内容先隐藏
    tl.set(contentRef.current, { opacity: 0 });

    // 色块进入
    tl.fromTo(
      maskRef.current,
      { transform: enter.from },
      { transform: enter.to, duration, ease: "power2.inOut" }
    );

    // 色块覆盖时，切换内容
    tl.set(contentRef.current, { opacity: 1 });

    // 色块离开
    tl.fromTo(
      maskRef.current,
      { transform: exit.from },
      { transform: exit.to, duration, ease: "power2.inOut" }
    );
  }, [direction, duration]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div ref={contentRef}>{children}</div>
      <div
        ref={maskRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          zIndex: 10,
        }}
      />
    </div>
  );
};
