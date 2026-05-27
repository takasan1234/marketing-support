"use client";

import { Textarea } from "@workspace/ui/components/textarea";

export type FocusLevel = "high" | "medium" | "low";

export type ConcentricCirclesData = {
  core: { description: string; focusLevel: FocusLevel };
  actual: { items: string[]; description: string; focusLevel: FocusLevel };
  augmented: { items: string[]; description: string; focusLevel: FocusLevel };
};

type ConcentricCirclesProps = {
  data: ConcentricCirclesData;
  onChange: (data: ConcentricCirclesData) => void;
};

const FOCUS_LEVEL_LABELS: Record<FocusLevel, string> = {
  high: "高（注力）",
  medium: "中（維持）",
  low: "低（最小限）",
};

const FOCUS_LEVEL_COLORS: Record<FocusLevel, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-secondary text-secondary-foreground",
  low: "bg-muted text-muted-foreground",
};

function FocusSelector({
  value,
  onChange,
}: {
  value: FocusLevel;
  onChange: (v: FocusLevel) => void;
}) {
  const levels: FocusLevel[] = ["high", "medium", "low"];
  return (
    <div className="flex gap-2 flex-wrap">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
            value === level
              ? FOCUS_LEVEL_COLORS[level] + " border-transparent"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {FOCUS_LEVEL_LABELS[level]}
        </button>
      ))}
    </div>
  );
}

const LAYER_STROKE_COLORS: Record<"augmented" | "actual" | "core", string> = {
  augmented: "#6366f1",
  actual: "#8b5cf6",
  core: "#a855f7",
};

const LAYER_FILL_COLORS: Record<"augmented" | "actual" | "core", string> = {
  augmented: "#eef2ff",
  actual: "#f5f3ff",
  core: "#faf5ff",
};

export function ConcentricCircles({ data, onChange }: ConcentricCirclesProps) {
  function patchCore(patch: Partial<typeof data.core>) {
    onChange({ ...data, core: { ...data.core, ...patch } });
  }
  function patchActual(patch: Partial<typeof data.actual>) {
    onChange({ ...data, actual: { ...data.actual, ...patch } });
  }
  function patchAugmented(patch: Partial<typeof data.augmented>) {
    onChange({ ...data, augmented: { ...data.augmented, ...patch } });
  }

  function handleActualItemChange(index: number, value: string) {
    const items = [...data.actual.items];
    items[index] = value;
    patchActual({ items });
  }
  function addActualItem() {
    patchActual({ items: [...data.actual.items, ""] });
  }
  function removeActualItem(index: number) {
    patchActual({ items: data.actual.items.filter((_, i) => i !== index) });
  }

  function handleAugmentedItemChange(index: number, value: string) {
    const items = [...data.augmented.items];
    items[index] = value;
    patchAugmented({ items });
  }
  function addAugmentedItem() {
    patchAugmented({ items: [...data.augmented.items, ""] });
  }
  function removeAugmentedItem(index: number) {
    patchAugmented({ items: data.augmented.items.filter((_, i) => i !== index) });
  }

  const svgSize = 320;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const rAugmented = 140;
  const rActual = 95;
  const rCore = 50;

  const focusBorder = (layer: "core" | "actual" | "augmented") => {
    const level = data[layer].focusLevel;
    if (level === "high") return "3";
    if (level === "medium") return "2";
    return "1";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SVG visualization */}
      <div className="flex justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="overflow-visible"
          aria-label="3層同心円図"
        >
          {/* Augmented circle */}
          <circle
            cx={cx}
            cy={cy}
            r={rAugmented}
            fill={LAYER_FILL_COLORS.augmented}
            stroke={LAYER_STROKE_COLORS.augmented}
            strokeWidth={focusBorder("augmented")}
          />
          {/* Actual circle */}
          <circle
            cx={cx}
            cy={cy}
            r={rActual}
            fill={LAYER_FILL_COLORS.actual}
            stroke={LAYER_STROKE_COLORS.actual}
            strokeWidth={focusBorder("actual")}
          />
          {/* Core circle */}
          <circle
            cx={cx}
            cy={cy}
            r={rCore}
            fill={LAYER_FILL_COLORS.core}
            stroke={LAYER_STROKE_COLORS.core}
            strokeWidth={focusBorder("core")}
          />

          {/* Labels */}
          {/* Core label */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={LAYER_STROKE_COLORS.core}
          >
            コア
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            中核ベネフィット
          </text>

          {/* Actual label - positioned at top of actual ring */}
          <text
            x={cx}
            y={cy - rActual + 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={LAYER_STROKE_COLORS.actual}
          >
            実体
          </text>
          <text
            x={cx}
            y={cy - rActual + 35}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            特徴・品質・ブランド
          </text>

          {/* Augmented label - positioned at top of augmented ring */}
          <text
            x={cx}
            y={cy - rAugmented + 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={LAYER_STROKE_COLORS.augmented}
          >
            拡張
          </text>
          <text
            x={cx}
            y={cy - rAugmented + 35}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            サポート・保証・ブランド
          </text>

          {/* Focus level indicators (dot in each ring) */}
          {data.core.focusLevel === "high" && (
            <circle cx={cx + 32} cy={cy - 10} r={5} fill={LAYER_STROKE_COLORS.core} />
          )}
          {data.actual.focusLevel === "high" && (
            <circle cx={cx + 65} cy={cy - rActual + 26} r={5} fill={LAYER_STROKE_COLORS.actual} />
          )}
          {data.augmented.focusLevel === "high" && (
            <circle cx={cx + 100} cy={cy - rAugmented + 26} r={5} fill={LAYER_STROKE_COLORS.augmented} />
          )}
        </svg>
      </div>

      {/* Form sections for each layer */}
      <div className="flex flex-col gap-6">
        {/* Core layer */}
        <div className="border rounded-lg p-4 border-purple-200 bg-purple-50/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-purple-800">
              コア（中核ベネフィット）
            </h3>
            <FocusSelector
              value={data.core.focusLevel}
              onChange={(v) => patchCore({ focusLevel: v })}
            />
          </div>
          <Textarea
            value={data.core.description}
            onChange={(e) => patchCore({ description: e.target.value })}
            placeholder="商品・サービスが顧客に提供する本質的な価値・ベネフィットを記述してください"
            className="text-sm min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* Actual layer */}
        <div className="border rounded-lg p-4 border-violet-200 bg-violet-50/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-violet-800">
              実体（形態・物理的属性）
            </h3>
            <FocusSelector
              value={data.actual.focusLevel}
              onChange={(v) => patchActual({ focusLevel: v })}
            />
          </div>
          <Textarea
            value={data.actual.description}
            onChange={(e) => patchActual({ description: e.target.value })}
            placeholder="特徴、品質水準、デザイン、ブランド名などを記述してください"
            className="text-sm min-h-[60px] resize-none mb-3"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium">特徴・属性リスト</p>
            {data.actual.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleActualItemChange(i, e.target.value)}
                  placeholder={`特徴 ${i + 1}`}
                  className="flex-1 h-8 px-3 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => removeActualItem(i)}
                  className="text-xs text-destructive hover:underline px-2"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addActualItem}
              className="self-start text-xs text-primary hover:underline"
            >
              + 特徴を追加
            </button>
          </div>
        </div>

        {/* Augmented layer */}
        <div className="border rounded-lg p-4 border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-indigo-800">
              拡張（付随サービス・保証・ブランド）
            </h3>
            <FocusSelector
              value={data.augmented.focusLevel}
              onChange={(v) => patchAugmented({ focusLevel: v })}
            />
          </div>
          <Textarea
            value={data.augmented.description}
            onChange={(e) => patchAugmented({ description: e.target.value })}
            placeholder="アフターサービス、保証、配送、ブランドイメージなどを記述してください"
            className="text-sm min-h-[60px] resize-none mb-3"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium">付随サービス・機能リスト</p>
            {data.augmented.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleAugmentedItemChange(i, e.target.value)}
                  placeholder={`サービス ${i + 1}`}
                  className="flex-1 h-8 px-3 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => removeAugmentedItem(i)}
                  className="text-xs text-destructive hover:underline px-2"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAugmentedItem}
              className="self-start text-xs text-primary hover:underline"
            >
              + サービスを追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
