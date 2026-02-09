import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface FlowChartNode {
  id: string;
  label: string;
  x: number; // 百分比 0-100
  y: number; // 百分比 0-100
  width?: number;
  height?: number;
}

interface FlowChartEdge {
  from: string;
  to: string;
}

interface FlowChartProps {
  nodes: FlowChartNode[];
  edges: FlowChartEdge[];
  width?: number;
  height?: number;
  duration?: number;
  staggerDelay?: number;
}

/**
 * 流程图逐步绘制
 * 节点逐个弹入 + SVG 连线逐段绘制
 */
export const FlowChart: React.FC<FlowChartProps> = ({
  nodes,
  edges,
  width = 900,
  height = 500,
  duration = 0.5,
  staggerDelay = 0.3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultNodeW = 140;
  const defaultNodeH = 50;

  // 将百分比坐标转为实际像素
  const toPixel = (node: FlowChartNode) => ({
    px: (node.x / 100) * width,
    py: (node.y / 100) * height,
    pw: node.width ?? defaultNodeW,
    ph: node.height ?? defaultNodeH,
  });

  // 计算连线路径（从源节点中心到目标节点中心）
  const getEdgePath = (edge: FlowChartEdge): string => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return "";

    const f = toPixel(fromNode);
    const t = toPixel(toNode);

    const x1 = f.px + f.pw / 2;
    const y1 = f.py + f.ph / 2;
    const x2 = t.px + t.pw / 2;
    const y2 = t.py + t.ph / 2;

    // 简单直线或带弯曲的路径
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dy) < 10) {
      // 水平连线
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    // 带曲线的连线
    const cx = x1 + dx * 0.5;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  // 按节点出现顺序，记录每个节点的 index（用于确定边何时绘制）
  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((n, i) => nodeIndexMap.set(n.id, i));

  useGsapTimeline(
    (tl) => {
      if (!containerRef.current) return;

      const nodeEls = containerRef.current.querySelectorAll(".fc-node");
      const edgeEls = containerRef.current.querySelectorAll(
        ".fc-edge"
      ) as NodeListOf<SVGPathElement>;

      // 初始隐藏所有节点
      tl.set(nodeEls, { scale: 0, opacity: 0 });
      // 初始隐藏所有连线
      edgeEls.forEach((pathEl) => {
        const length = pathEl.getTotalLength();
        tl.set(pathEl, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      // 逐个节点出现，节点出现后绘制其出边
      nodes.forEach((node, i) => {
        const nodeEl = nodeEls[i];
        if (!nodeEl) return;

        const pos = i === 0 ? "+=0" : `+=${staggerDelay * 0.3}`;

        // 节点弹入
        tl.to(
          nodeEl,
          {
            scale: 1,
            opacity: 1,
            duration,
            ease: "back.out(1.7)",
          },
          pos
        );

        // 该节点的出边
        edges.forEach((edge, ei) => {
          if (edge.from !== node.id) return;
          const pathEl = edgeEls[ei];
          if (!pathEl) return;

          tl.to(
            pathEl,
            {
              strokeDashoffset: 0,
              duration: duration * 0.8,
              ease: "power2.inOut",
            },
            "-=0.15"
          );
        });
      });
    },
    [nodes, edges, width, height]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      {/* SVG 连线层 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
      >
        <defs>
          <marker
            id="fc-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path
              d="M 0 0 L 8 4 L 0 8 Z"
              fill="rgba(255,255,255,0.3)"
            />
          </marker>
        </defs>
        {edges.map((edge, i) => (
          <path
            key={i}
            className="fc-edge"
            d={getEdgePath(edge)}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1.5}
            markerEnd="url(#fc-arrow)"
          />
        ))}
      </svg>

      {/* 节点层 */}
      {nodes.map((node) => {
        const { px, py, pw, ph } = toPixel(node);
        return (
          <div
            key={node.id}
            className="fc-node"
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: pw,
              height: ph,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};
