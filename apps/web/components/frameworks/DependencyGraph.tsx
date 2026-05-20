"use client";

import { useRouter } from "next/navigation";

// ─── Dependency data (hardcoded) ──────────────────────────────────────────────

const FRAMEWORK_LAYERS: Record<string, number> = {
  PEST: 1, FIVE_FORCES: 1, INTERNAL_ANALYSIS: 1, VRIO: 1,
  THREE_C_PLUS_C: 2, SWOT: 2, CROSS_SWOT: 2,
  SEGMENTATION: 3, TARGETING: 3, POSITIONING: 3, CONCEPT_SHEET: 3,
  PRODUCT_4P: 4, PRICE_4P: 4, PLACE_4P: 4, PROMOTION_4P: 4,
  FOUR_C_SEVEN_P: 5, BLUE_OCEAN: 5, EXPERIENCE_VALUE: 5, VALUE_ADD_METHODS: 5,
  KGI_KSF_KPI: 6, CUSTOMER_JOURNEY: 6,
  CRM_OVERVIEW: 7, CRM_ANALYSIS: 7,
};

const FRAMEWORK_EDGES: [string, string][] = [
  ["PEST", "SWOT"], ["PEST", "THREE_C_PLUS_C"],
  ["FIVE_FORCES", "SWOT"], ["FIVE_FORCES", "THREE_C_PLUS_C"],
  ["INTERNAL_ANALYSIS", "SWOT"], ["INTERNAL_ANALYSIS", "THREE_C_PLUS_C"], ["INTERNAL_ANALYSIS", "VRIO"],
  ["VRIO", "SWOT"],
  ["THREE_C_PLUS_C", "KGI_KSF_KPI"],
  ["SWOT", "CROSS_SWOT"],
  ["CROSS_SWOT", "SEGMENTATION"],
  ["SEGMENTATION", "TARGETING"],
  ["TARGETING", "POSITIONING"], ["TARGETING", "PRODUCT_4P"], ["TARGETING", "PRICE_4P"],
  ["TARGETING", "PLACE_4P"], ["TARGETING", "PROMOTION_4P"], ["TARGETING", "CUSTOMER_JOURNEY"],
  ["POSITIONING", "CONCEPT_SHEET"],
  ["CROSS_SWOT", "CONCEPT_SHEET"], ["THREE_C_PLUS_C", "CONCEPT_SHEET"],
  ["CONCEPT_SHEET", "PRODUCT_4P"], ["CONCEPT_SHEET", "PRICE_4P"],
  ["CONCEPT_SHEET", "PLACE_4P"], ["CONCEPT_SHEET", "PROMOTION_4P"],
  ["CONCEPT_SHEET", "KGI_KSF_KPI"],
  ["PRODUCT_4P", "FOUR_C_SEVEN_P"], ["PRICE_4P", "FOUR_C_SEVEN_P"],
  ["PLACE_4P", "FOUR_C_SEVEN_P"], ["PROMOTION_4P", "FOUR_C_SEVEN_P"],
  ["FOUR_C_SEVEN_P", "BLUE_OCEAN"], ["FOUR_C_SEVEN_P", "EXPERIENCE_VALUE"],
  ["BLUE_OCEAN", "PRODUCT_4P"], ["EXPERIENCE_VALUE", "PRODUCT_4P"],
  ["VALUE_ADD_METHODS", "PRICE_4P"],
  ["PRODUCT_4P", "KGI_KSF_KPI"], ["PRICE_4P", "KGI_KSF_KPI"],
  ["PLACE_4P", "KGI_KSF_KPI"], ["PROMOTION_4P", "KGI_KSF_KPI"],
  ["CUSTOMER_JOURNEY", "PROMOTION_4P"], ["CUSTOMER_JOURNEY", "CRM_ANALYSIS"],
  ["KGI_KSF_KPI", "CRM_ANALYSIS"],
  ["CRM_ANALYSIS", "SEGMENTATION"],
];

const FRAMEWORK_LABELS: Record<string, string> = {
  PEST: "PEST", FIVE_FORCES: "5Forces", INTERNAL_ANALYSIS: "整理軸分析",
  VRIO: "VRIO", THREE_C_PLUS_C: "3C+C", SWOT: "SWOT", CROSS_SWOT: "クロスSWOT",
  SEGMENTATION: "セグメンテーション", TARGETING: "ターゲティング", POSITIONING: "ポジショニング",
  CONCEPT_SHEET: "コンセプトシート", PRODUCT_4P: "Product", PRICE_4P: "Price",
  PLACE_4P: "Place", PROMOTION_4P: "Promotion", FOUR_C_SEVEN_P: "4C/7P",
  BLUE_OCEAN: "ブルーオーシャン", EXPERIENCE_VALUE: "経験価値", VALUE_ADD_METHODS: "高付加価値化",
  KGI_KSF_KPI: "KGI/KSF/KPI", CUSTOMER_JOURNEY: "CJ", CRM_OVERVIEW: "CRM概要", CRM_ANALYSIS: "CRM分析",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type NodeStatus = "empty" | "filled" | "stale_warning";

type NodeData = {
  id: string;
  status: NodeStatus;
  version?: number;
};

type DependencyGraphProps = {
  nodes: NodeData[];
  projectId: string;
};

// ─── Layout constants ─────────────────────────────────────────────────────────

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 900;
const NODE_W = 120;
const NODE_H = 40;
const NODE_RX = 8;

const LAYER_Y: Record<number, number> = {
  1: 80,
  2: 200,
  3: 320,
  4: 440,
  5: 560,
  6: 680,
  7: 800,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPositions(): Record<string, { x: number; y: number }> {
  // Group nodes by layer
  const byLayer: Record<number, string[]> = {};
  for (const [fw, layer] of Object.entries(FRAMEWORK_LAYERS)) {
    if (!byLayer[layer]) byLayer[layer] = [];
    byLayer[layer].push(fw);
  }

  const positions: Record<string, { x: number; y: number }> = {};

  for (const [layerStr, fws] of Object.entries(byLayer)) {
    const layer = Number(layerStr);
    const count = fws.length;
    const totalWidth = count * NODE_W + (count - 1) * 20; // 20px gap
    const startX = CANVAS_WIDTH / 2 - totalWidth / 2;

    fws.forEach((fw, i) => {
      positions[fw] = {
        x: startX + i * (NODE_W + 20),
        y: (LAYER_Y[layer] ?? 0) - NODE_H / 2,
      };
    });
  }

  return positions;
}

function nodeColor(status: NodeStatus): { fill: string; stroke: string; strokeDasharray?: string } {
  switch (status) {
    case "empty":
      return { fill: "#e5e7eb", stroke: "#9ca3af", strokeDasharray: "6,3" };
    case "filled":
      return { fill: "#bbf7d0", stroke: "#16a34a" };
    case "stale_warning":
      return { fill: "#fef08a", stroke: "#ca8a04" };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DependencyGraph({ nodes, projectId }: DependencyGraphProps) {
  const router = useRouter();
  const positions = buildPositions();

  // Build a lookup by id
  const nodeMap: Record<string, NodeData> = {};
  for (const n of nodes) nodeMap[n.id] = n;

  function handleNodeClick(fw: string) {
    router.push(`/projects/${projectId}/frameworks/${fw.toLowerCase().replace(/_/g, "-")}`);
  }

  // Build edge paths
  const edges = FRAMEWORK_EDGES.map(([src, tgt], idx) => {
    const sp = positions[src];
    const tp = positions[tgt];
    if (!sp || !tp) return null;

    // Center-bottom of source node, center-top of target node
    const x1 = sp.x + NODE_W / 2;
    const y1 = sp.y + NODE_H;
    const x2 = tp.x + NODE_W / 2;
    const y2 = tp.y;

    // Cubic bezier: control points midway vertically
    const cy = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;

    // Determine edge color based on source node status
    const srcNode = nodeMap[src];
    const stroke =
      srcNode?.status === "stale_warning"
        ? "#ca8a04"
        : srcNode?.status === "filled"
        ? "#16a34a"
        : "#d1d5db";

    return (
      <path
        key={`edge-${idx}`}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={srcNode?.status === "empty" ? 1 : 1.5}
        strokeOpacity={srcNode?.status === "empty" ? 0.4 : 0.7}
        markerEnd="url(#arrow)"
      />
    );
  });

  return (
    <div className="overflow-auto border rounded-lg bg-white">
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        style={{ fontFamily: "sans-serif" }}
        role="img"
        aria-label="Framework dependency graph showing relationships between analysis frameworks across 7 layers"
      >
        <title>Framework Dependency Graph</title>
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Layer labels */}
        {Object.entries(LAYER_Y).map(([layerStr, y]) => (
          <text
            key={`layer-${layerStr}`}
            x={16}
            y={y + 4}
            fontSize={11}
            fill="#6b7280"
            fontWeight="500"
          >
            L{layerStr}
          </text>
        ))}

        {/* Edges (drawn first, behind nodes) */}
        {edges}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          const { fill, stroke, strokeDasharray } = nodeColor(node.status);
          const label = FRAMEWORK_LABELS[node.id] ?? node.id;
          const cx = pos.x + NODE_W / 2;
          const cy = pos.y + NODE_H / 2;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={label}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
                rx={NODE_RX}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray={strokeDasharray}
              />
              {/* Framework label */}
              <text
                x={cx}
                y={cy + (node.status !== "empty" && node.version !== undefined ? -5 : 4)}
                textAnchor="middle"
                fontSize={11}
                fontWeight="600"
                fill="#1f2937"
              >
                {label}
              </text>
              {/* Version badge */}
              {node.status !== "empty" && node.version !== undefined && (
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b7280"
                >
                  v{node.version}
                </text>
              )}
              {/* Stale warning icon */}
              {node.status === "stale_warning" && (
                <text
                  x={pos.x + NODE_W - 6}
                  y={pos.y + 14}
                  textAnchor="end"
                  fontSize={12}
                  aria-hidden="true"
                >
                  ⚠
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
