"use client";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";

export type MatrixCell = {
  items: string[];
  summary: string;
};

export type MatrixData = {
  strengths: MatrixCell;
  weaknesses: MatrixCell;
  opportunities: MatrixCell;
  threats: MatrixCell;
};

type CellKey = keyof MatrixData;

type MatrixTwoByTwoProps = {
  data: MatrixData;
  onChange: (data: MatrixData) => void;
  readOnly?: boolean;
  title?: string;
  colorScheme?: "swot" | "cross";
};

type CellConfig = {
  key: CellKey;
  label: string;
  labelJa: string;
  headerBg: string;
  borderColor: string;
  badgeColor: string;
};

const CELL_CONFIGS: CellConfig[] = [
  {
    key: "strengths",
    label: "Strengths",
    labelJa: "強み",
    headerBg: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800",
  },
  {
    key: "weaknesses",
    label: "Weaknesses",
    labelJa: "弱み",
    headerBg: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
  },
  {
    key: "opportunities",
    label: "Opportunities",
    labelJa: "機会",
    headerBg: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    key: "threats",
    label: "Threats",
    labelJa: "脅威",
    headerBg: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
  },
];

function MatrixCellEditor({
  config,
  cell,
  onChange,
  readOnly,
}: {
  config: CellConfig;
  cell: MatrixCell;
  onChange: (cell: MatrixCell) => void;
  readOnly: boolean;
}) {
  function addItem() {
    onChange({ ...cell, items: [...cell.items, ""] });
  }

  function removeItem(index: number) {
    onChange({ ...cell, items: cell.items.filter((_, i) => i !== index) });
  }

  function updateItem(index: number, value: string) {
    onChange({
      ...cell,
      items: cell.items.map((item, i) => (i === index ? value : item)),
    });
  }

  function updateSummary(value: string) {
    onChange({ ...cell, summary: value });
  }

  return (
    <div
      className={`border-2 ${config.borderColor} rounded-lg overflow-hidden flex flex-col`}
    >
      {/* Cell Header */}
      <div className={`${config.headerBg} px-3 py-2 border-b ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badgeColor}`}
          >
            {config.labelJa}
          </span>
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>
      </div>

      {/* Cell Body */}
      <div className="flex-1 p-3 flex flex-col gap-3 bg-white">
        {/* Items list */}
        <div className="flex flex-col gap-2">
          {cell.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5 group">
              <span className="text-muted-foreground text-xs mt-2 shrink-0">•</span>
              {readOnly ? (
                <p className="text-sm flex-1 min-h-[32px] py-1">{item}</p>
              ) : (
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(idx, e.target.value)}
                  placeholder="項目を入力..."
                  className="text-sm min-h-[36px] resize-none flex-1 py-1"
                  rows={2}
                />
              )}
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeItem(idx)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start text-xs h-7 mt-1"
              onClick={addItem}
            >
              + 項目を追加
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="border-t pt-2 mt-auto">
          <label className="text-xs text-muted-foreground mb-1 block">サマリー</label>
          {readOnly ? (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {cell.summary || "—"}
            </p>
          ) : (
            <Textarea
              value={cell.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="このセルのサマリーを記入..."
              className="text-xs min-h-[48px] resize-none"
              rows={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function MatrixTwoByTwo({
  data,
  onChange,
  readOnly = false,
  title,
  colorScheme: _colorScheme = "swot",
}: MatrixTwoByTwoProps) {
  function updateCell(key: CellKey, cell: MatrixCell) {
    onChange({ ...data, [key]: cell });
  }

  // Order: strengths (top-left), weaknesses (top-right), opportunities (bottom-left), threats (bottom-right)
  const topRow = [CELL_CONFIGS[0], CELL_CONFIGS[1]] as [CellConfig, CellConfig];
  const bottomRow = [CELL_CONFIGS[2], CELL_CONFIGS[3]] as [CellConfig, CellConfig];

  return (
    <div className="flex flex-col gap-3">
      {title && <h2 className="text-base font-semibold">{title}</h2>}

      {/* Axis labels */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          内部環境（強み・弱み）
        </span>
        <span className="mx-2 text-muted-foreground/50">|</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          外部環境（機会・脅威）
        </span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...topRow, ...bottomRow].map((config) => (
          <MatrixCellEditor
            key={config.key}
            config={config}
            cell={data[config.key]}
            onChange={(cell) => updateCell(config.key, cell)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
