"use client";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export type StrategyCanvasData = {
  factors: string[]; // competitive factors
  curves: {
    id: string;
    name: string; // e.g. 自社, 競合A, 競合B, 戦略的ターゲット
    isTarget?: boolean; // true = own target curve
    values: number[]; // score for each factor, 1-5
    color: string;
  }[];
};

type StrategyCanvasProps = {
  data: StrategyCanvasData;
  onChange: (data: StrategyCanvasData) => void;
};

const CHART_WIDTH = 600;
const CHART_HEIGHT = 260;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const INNER_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const INNER_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const Y_MIN = 1;
const Y_MAX = 5;

function yPos(val: number): number {
  return (
    PADDING_TOP + INNER_HEIGHT - ((val - Y_MIN) / (Y_MAX - Y_MIN)) * INNER_HEIGHT
  );
}

function xPos(index: number, total: number): number {
  if (total <= 1) return PADDING_LEFT + INNER_WIDTH / 2;
  return PADDING_LEFT + (index / (total - 1)) * INNER_WIDTH;
}

const DEFAULT_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#f59e0b",
  "#0891b2",
  "#be185d",
];

export function StrategyCanvas({ data, onChange }: StrategyCanvasProps) {
  const { factors, curves } = data;
  const factorCount = factors.length;

  function updateFactorName(index: number, name: string) {
    const newFactors = [...factors];
    newFactors[index] = name;
    onChange({ ...data, factors: newFactors });
  }

  function addFactor() {
    const newFactors = [...factors, `要素${factors.length + 1}`];
    const newCurves = curves.map((c) => ({
      ...c,
      values: [...c.values, 3],
    }));
    onChange({ ...data, factors: newFactors, curves: newCurves });
  }

  function removeFactor(index: number) {
    if (factors.length <= 2) return;
    const newFactors = factors.filter((_, i) => i !== index);
    const newCurves = curves.map((c) => ({
      ...c,
      values: c.values.filter((_, i) => i !== index),
    }));
    onChange({ ...data, factors: newFactors, curves: newCurves });
  }

  function addCurve() {
    const colorIndex = curves.length % DEFAULT_COLORS.length;
    const newCurve = {
      id: globalThis.crypto.randomUUID(),
      name: `プレイヤー${curves.length + 1}`,
      values: factors.map(() => 3),
      color: DEFAULT_COLORS[colorIndex] ?? "#6b7280",
    };
    onChange({ ...data, curves: [...curves, newCurve] });
  }

  function removeCurve(id: string) {
    if (curves.length <= 1) return;
    onChange({ ...data, curves: curves.filter((c) => c.id !== id) });
  }

  function updateCurveName(id: string, name: string) {
    onChange({
      ...data,
      curves: curves.map((c) => (c.id === id ? { ...c, name } : c)),
    });
  }

  function updateCurveValue(id: string, factorIndex: number, raw: string) {
    const n = Math.min(5, Math.max(1, parseInt(raw, 10)));
    if (isNaN(n)) return;
    onChange({
      ...data,
      curves: curves.map((c) => {
        if (c.id !== id) return c;
        const newVals = [...c.values];
        newVals[factorIndex] = n;
        return { ...c, values: newVals };
      }),
    });
  }

  // Build SVG polyline points for a curve
  function buildPoints(curve: StrategyCanvasData["curves"][number]): string {
    return curve.values
      .map((v, i) => `${xPos(i, factorCount)},${yPos(v)}`)
      .join(" ");
  }

  const yGridValues = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-6">
      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full max-w-3xl border rounded-lg bg-background"
          style={{ minWidth: "400px" }}
        >
          {/* Grid lines (horizontal) */}
          {yGridValues.map((yv) => {
            const y = yPos(yv);
            return (
              <g key={yv}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={CHART_WIDTH - PADDING_RIGHT}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={PADDING_LEFT - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#9ca3af"
                >
                  {yv}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines for each factor */}
          {factors.map((_, i) => {
            const x = xPos(i, factorCount);
            return (
              <line
                key={i}
                x1={x}
                y1={PADDING_TOP}
                x2={x}
                y2={CHART_HEIGHT - PADDING_BOTTOM}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
            );
          })}

          {/* X axis */}
          <line
            x1={PADDING_LEFT}
            y1={CHART_HEIGHT - PADDING_BOTTOM}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y2={CHART_HEIGHT - PADDING_BOTTOM}
            stroke="#d1d5db"
            strokeWidth={1}
          />

          {/* Y axis */}
          <line
            x1={PADDING_LEFT}
            y1={PADDING_TOP}
            x2={PADDING_LEFT}
            y2={CHART_HEIGHT - PADDING_BOTTOM}
            stroke="#d1d5db"
            strokeWidth={1}
          />

          {/* X axis factor labels */}
          {factors.map((f, i) => {
            const x = xPos(i, factorCount);
            return (
              <text
                key={i}
                x={x}
                y={CHART_HEIGHT - PADDING_BOTTOM + 14}
                textAnchor="middle"
                fontSize={9}
                fill="#6b7280"
              >
                {f.length > 6 ? f.slice(0, 6) + "…" : f}
              </text>
            );
          })}

          {/* Curves */}
          {curves.map((curve) => (
            <g key={curve.id}>
              <polyline
                points={buildPoints(curve)}
                fill="none"
                stroke={curve.color}
                strokeWidth={curve.isTarget ? 2.5 : 1.8}
                strokeDasharray={curve.isTarget ? "6 3" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {curve.values.map((v, i) => (
                <circle
                  key={i}
                  cx={xPos(i, factorCount)}
                  cy={yPos(v)}
                  r={4}
                  fill={curve.isTarget ? "white" : curve.color}
                  stroke={curve.color}
                  strokeWidth={curve.isTarget ? 2 : 1}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {curves.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5">
            <span
              className="inline-block w-6 h-0.5"
              style={{
                backgroundColor: c.color,
                borderTop: c.isTarget ? `2px dashed ${c.color}` : undefined,
                display: "inline-block",
              }}
            />
            <span
              className="text-xs"
              style={{ color: c.color }}
            >
              {c.name}
            </span>
            {c.isTarget && (
              <span className="text-xs text-muted-foreground">(目標)</span>
            )}
          </div>
        ))}
      </div>

      {/* Factor name editors */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">競争要素の編集</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFactor}
            className="text-xs h-7"
          >
            + 要素を追加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {factors.map((f, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                value={f}
                onChange={(e) => updateFactorName(i, e.target.value)}
                className="h-7 text-xs w-28"
                placeholder={`要素${i + 1}`}
              />
              {factors.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeFactor(i)}
                  className="text-muted-foreground hover:text-destructive text-xs"
                  title="削除"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Score table: factors × curves */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">スコア入力（1〜5）</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCurve}
            className="text-xs h-7"
          >
            + プレイヤーを追加
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-left min-w-[100px]">要素 / プレイヤー</th>
                {curves.map((c) => (
                  <th key={c.id} className="border p-2 text-center min-w-[100px]">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <Input
                        value={c.name}
                        onChange={(e) => updateCurveName(c.id, e.target.value)}
                        className="h-6 text-xs w-20 text-center"
                      />
                      {curves.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCurve(c.id)}
                          className="text-muted-foreground hover:text-destructive ml-1"
                          title="削除"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factors.map((factor, fi) => (
                <tr key={fi} className="align-middle">
                  <td className="border p-2 font-medium text-xs">{factor}</td>
                  {curves.map((c) => (
                    <td key={c.id} className="border p-2 text-center">
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={c.values[fi] ?? 3}
                        onChange={(e) =>
                          updateCurveValue(c.id, fi, e.target.value)
                        }
                        className="h-7 text-xs w-14 text-center mx-auto"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
