import { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

/**
 * 核心 Hook：将 Remotion 的帧驱动接入 GSAP timeline
 *
 * Remotion 控制时间（帧精度），GSAP 控制动画。
 * 每一帧，Remotion 告诉 GSAP "现在是第几秒"，
 * GSAP 的 timeline 跳到对应位置，计算出该帧的动画状态。
 *
 * 复制到项目: src/hooks/useGsapTimeline.ts
 */
export function useGsapTimeline(
  factory: (tl: gsap.core.Timeline) => void,
  deps: React.DependencyList = []
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // 创建 timeline（只在挂载时执行一次）
  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    factory(tl);
    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // 每帧驱动 GSAP 到对应时间点
  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return tlRef;
}
