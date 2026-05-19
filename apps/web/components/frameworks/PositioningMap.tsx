"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

export type PositionPoint = {
  id: string;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
  isOwnCompany: boolean;
  color?: string;
};

export type PositioningMapData = {
  xAxisLabel: string;
  xAxisLow: string;
  xAxisHigh: string;
  yAxisLabel: string;
  yAxisLow: string;
  yAxisHigh: string;
  points: PositionPoint[];
  targetPosition?: { x: number; y: number; label: string };
};

type PositioningMapProps = {
  data: PositioningMapData;
  onChange: (data: PositioningMapData) => void;
};

const SVG_SIZE = 400;
const PADDING = 48;
const PLOT_SIZE = SVG_SIZE - PADDING * 2;

function toSvg(val: number): number {
  return PADDING + (val / 100) * PLOT_SIZE;
}

function fromSvg(svgVal: number): number {
  return Math.min(100, Math.max(0, ((svgVal - PADDING) / PLOT_SIZE) * 100));
}

const POINT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#14b8a6",
  "#eab308",
  "#ec4899",
];

function getPointColor(point: PositionPoint, index: number): string {
  if (point.isOwnCompany) return "#2563eb";
  return point.color ?? POINT_COLORS[index % POINT_COLORS.length] ?? "#6b7280";
}

export function PositioningMap({ data, onChange }: PositioningMapProps) {
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [addingTarget, setAddingTarget] = useState(false);

  function update(patch: Partial<PositioningMapData>) {
    onChange({ ...data, ...patch });
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const scaleX = SVG_SIZE / rect.width;
    const scaleY = SVG_SIZE / rect.height;
    const svgX = rawX * scaleX;
    const svgY = rawY * scaleY;
    const x = Math.round(fromSvg(svgX));
    const y = Math.round(100 - fromSvg(svgY)); // flip Y: top = high

    if (addingTarget) {
      update({
        targetPosition: {
          x,
          y,
          label: data.targetPosition?.label ?? "狙うポジション",
        },
      });
      setAddingTarget(false);
      return;
    }

    const newPoint: PositionPoint = {
      id: globalThis.crypto.randomUUID(),
      label: "新しい点",
      x,
      y,
      isOwnCompany: false,
    };
    update({ points: [...data.points, newPoint] });
  }

  function updatePoint(id: string, patch: Partial<PositionPoint>) {
    update({
      points: data.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function removePoint(id: string) {
    update({ points: data.points.filter((p) => p.id !== id) });
    if (editingPointId === id) setEditingPointId(null);
  }

  function removeTarget() {
    const { targetPosition: _tp, ...rest } = data;
    onChange({ ...rest } as PositioningMapData);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Axis settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">X 軸の設定</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">軸ラベル</label>
            <Input
              value={data.xAxisLabel}
              onChange={(e) => update({ xAxisLabel: e.target.value })}
              placeholder="例：価格"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">左（低）</label>
              <Input
                value={data.xAxisLow}
                onChange={(e) => update({ xAxisLow: e.target.value })}
                placeholder="例：安い"
                className="h-8 text-sm mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">右（高）</label>
              <Input
                value={data.xAxisHigh}
                onChange={(e) => update({ xAxisHigh: e.target.value })}
                placeholder="例：高い"
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Y 軸の設定</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">軸ラベル</label>
            <Input
              value={data.yAxisLabel}
              onChange={(e) => update({ yAxisLabel: e.target.value })}
              placeholder="例：本格度"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">下（低）</label>
              <Input
                value={data.yAxisLow}
                onChange={(e) => update({ yAxisLow: e.target.value })}
                placeholder="例：手軽"
                className="h-8 text-sm mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">上（高）</label>
              <Input
                value={data.yAxisHigh}
                onChange={(e) => update({ yAxisHigh: e.target.value })}
                placeholder="例：本格的"
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">
          マップ上をクリックして点を追加
        </span>
        <Button
          type="button"
          variant={addingTarget ? "default" : "outline"}
          size="sm"
          onClick={() => setAddingTarget((v) => !v)}
          className="text-xs h-7"
        >
          {addingTarget ? "クリックして配置..." : "★ 狙うポジションを追加"}
        </Button>
        {data.targetPosition && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-destructive hover:text-destructive"
            onClick={removeTarget}
          >
            狙いポジション削除
          </Button>
        )}
      </div>

      {/* Map */}
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className="border rounded-lg overflow-hidden bg-white shrink-0"
          style={{ width: SVG_SIZE, maxWidth: "100%" }}
        >
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className={`w-full h-auto ${addingTarget ? "cursor-crosshair" : "cursor-pointer"}`}
            onClick={handleSvgClick}
            style={{ display: "block" }}
          >
            {/* Grid lines */}
            {[25, 50, 75].map((pct) => {
              const pos = toSvg(pct);
              return (
                <g key={pct}>
                  <line
                    x1={pos}
                    y1={PADDING}
                    x2={pos}
                    y2={SVG_SIZE - PADDING}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <line
                    x1={PADDING}
                    y1={pos}
                    x2={SVG_SIZE - PADDING}
                    y2={pos}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={PADDING}
              y1={SVG_SIZE / 2}
              x2={SVG_SIZE - PADDING}
              y2={SVG_SIZE / 2}
              stroke="#6b7280"
              strokeWidth={1.5}
            />
            <line
              x1={SVG_SIZE / 2}
              y1={PADDING}
              x2={SVG_SIZE / 2}
              y2={SVG_SIZE - PADDING}
              stroke="#6b7280"
              strokeWidth={1.5}
            />

            {/* Axis labels */}
            <text
              x={SVG_SIZE / 2}
              y={SVG_SIZE - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#374151"
              fontWeight="600"
            >
              {data.xAxisLabel || "X軸"}
            </text>
            <text
              x={PADDING + 4}
              y={SVG_SIZE / 2 + 4}
              textAnchor="start"
              fontSize={10}
              fill="#6b7280"
            >
              {data.xAxisLow || "低"}
            </text>
            <text
              x={SVG_SIZE - PADDING - 4}
              y={SVG_SIZE / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
            >
              {data.xAxisHigh || "高"}
            </text>

            <text
              x={14}
              y={SVG_SIZE / 2}
              textAnchor="middle"
              fontSize={11}
              fill="#374151"
              fontWeight="600"
              transform={`rotate(-90, 14, ${SVG_SIZE / 2})`}
            >
              {data.yAxisLabel || "Y軸"}
            </text>
            <text
              x={SVG_SIZE / 2 + 4}
              y={SVG_SIZE - PADDING - 4}
              textAnchor="start"
              fontSize={10}
              fill="#6b7280"
            >
              {data.yAxisHigh || "高"}
            </text>
            <text
              x={SVG_SIZE / 2 + 4}
              y={PADDING + 12}
              textAnchor="start"
              fontSize={10}
              fill="#6b7280"
            >
              {data.yAxisLow || "低"}
            </text>

            {/* Target position star */}
            {data.targetPosition && (() => {
              const tx = toSvg(data.targetPosition.x);
              const ty = toSvg(100 - data.targetPosition.y);
              return (
                <g key="target">
                  <polygon
                    points={starPoints(tx, ty, 12, 6, 5)}
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth={1}
                  />
                  <text
                    x={tx + 14}
                    y={ty - 8}
                    fontSize={10}
                    fill="#92400e"
                    fontWeight="600"
                  >
                    {data.targetPosition.label}
                  </text>
                </g>
              );
            })()}

            {/* Points */}
            {data.points.map((point, idx) => {
              const cx = toSvg(point.x);
              const cy = toSvg(100 - point.y);
              const color = getPointColor(point, idx);
              const isEditing = editingPointId === point.id;
              return (
                <g
                  key={point.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPointId(isEditing ? null : point.id);
                    setAddingTarget(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={point.isOwnCompany ? 10 : 8}
                    fill={color}
                    stroke={isEditing ? "#1e40af" : "white"}
                    strokeWidth={isEditing ? 2.5 : 1.5}
                    opacity={0.9}
                  />
                  {point.isOwnCompany && (
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontSize={10}
                      fill="white"
                      fontWeight="bold"
                    >
                      自
                    </text>
                  )}
                  <text
                    x={cx + 12}
                    y={cy - 8}
                    fontSize={10}
                    fill="#1f2937"
                    fontWeight={point.isOwnCompany ? "600" : "400"}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Point list / editor */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">点の管理</h3>
          {data.points.length === 0 && (
            <p className="text-xs text-muted-foreground">
              マップ上をクリックして点を追加してください
            </p>
          )}
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {data.points.map((point, idx) => {
              const color = getPointColor(point, idx);
              const isEditing = editingPointId === point.id;
              return (
                <div
                  key={point.id}
                  className={`border rounded-lg p-3 flex flex-col gap-2 cursor-pointer transition-colors ${
                    isEditing ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                  }`}
                  onClick={() =>
                    setEditingPointId(isEditing ? null : point.id)
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium flex-1 min-w-0 truncate">
                      {point.label || "(未入力)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({point.x}, {point.y})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs text-destructive hover:text-destructive shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePoint(point.id);
                      }}
                    >
                      削除
                    </Button>
                  </div>
                  {isEditing && (
                    <div
                      className="flex flex-col gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="text-xs text-muted-foreground">ラベル</label>
                        <Input
                          value={point.label}
                          onChange={(e) =>
                            updatePoint(point.id, { label: e.target.value })
                          }
                          className="h-7 text-sm mt-1"
                          placeholder="ラベルを入力"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={point.isOwnCompany}
                            onChange={(e) =>
                              updatePoint(point.id, {
                                isOwnCompany: e.target.checked,
                              })
                            }
                            className="w-3.5 h-3.5"
                          />
                          自社
                        </label>
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-muted-foreground">X:</label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={point.x}
                            onChange={(e) =>
                              updatePoint(point.id, {
                                x: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              })
                            }
                            className="w-14 h-7 text-xs"
                          />
                          <label className="text-xs text-muted-foreground">Y:</label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={point.y}
                            onChange={(e) =>
                              updatePoint(point.id, {
                                y: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              })
                            }
                            className="w-14 h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Target position editor */}
          {data.targetPosition && (
            <div className="border rounded-lg p-3 bg-amber-50 border-amber-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">★</span>
                <span className="text-sm font-medium">狙うポジション</span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">ラベル</label>
                <Input
                  value={data.targetPosition.label}
                  onChange={(e) =>
                    update({
                      targetPosition: {
                        ...data.targetPosition!,
                        label: e.target.value,
                      },
                    })
                  }
                  className="h-7 text-sm mt-1"
                  placeholder="狙うポジションのラベル"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">X:</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.targetPosition.x}
                  onChange={(e) =>
                    update({
                      targetPosition: {
                        ...data.targetPosition!,
                        x: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      },
                    })
                  }
                  className="w-14 h-7 text-xs"
                />
                <label className="text-xs text-muted-foreground">Y:</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.targetPosition.y}
                  onChange={(e) =>
                    update({
                      targetPosition: {
                        ...data.targetPosition!,
                        y: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      },
                    })
                  }
                  className="w-14 h-7 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Generate SVG polygon points string for a star shape */
function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  numPoints: number
): string {
  const pts: string[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (Math.PI / numPoints) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}
