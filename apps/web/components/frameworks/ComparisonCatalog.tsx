"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  scores: Record<string, number>; // axis name → score 1-5
  note: string;
};

type ComparisonCatalogProps = {
  items: CatalogItem[];
  axes: string[]; // score axis names
  onChange: (items: CatalogItem[]) => void;
  allowAddItems?: boolean;
  title?: string;
};

function clampScore(v: number): number {
  return Math.min(5, Math.max(1, Math.round(v)));
}

function totalScore(item: CatalogItem, axes: string[]): number {
  return axes.reduce((sum, axis) => sum + (item.scores[axis] ?? 0), 0);
}

function averageScore(item: CatalogItem, axes: string[]): string {
  if (axes.length === 0) return "0.0";
  return (totalScore(item, axes) / axes.length).toFixed(1);
}

export function ComparisonCatalog({
  items,
  axes,
  onChange,
  allowAddItems = false,
  title,
}: ComparisonCatalogProps) {
  function updateItem(id: string, patch: Partial<CatalogItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function updateScore(id: string, axis: string, raw: string) {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    const item = items.find((it) => it.id === id);
    if (!item) return;
    updateItem(id, { scores: { ...item.scores, [axis]: clampScore(n) } });
  }

  function addItem() {
    const newItem: CatalogItem = {
      id: globalThis.crypto.randomUUID(),
      name: "",
      description: "",
      selected: false,
      scores: Object.fromEntries(axes.map((a) => [a, 3])),
      note: "",
    };
    onChange([...items, newItem]);
  }

  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left font-semibold w-8">選択</th>
              <th className="border p-2 text-left font-semibold min-w-[120px]">名称</th>
              <th className="border p-2 text-left font-semibold min-w-[160px]">説明</th>
              {axes.map((axis) => (
                <th key={axis} className="border p-2 text-center font-semibold min-w-[80px] whitespace-pre-wrap">
                  {axis}
                  <div className="text-xs font-normal text-muted-foreground">(1-5)</div>
                </th>
              ))}
              <th className="border p-2 text-center font-semibold min-w-[80px]">
                合計
                <div className="text-xs font-normal text-muted-foreground">(平均)</div>
              </th>
              <th className="border p-2 text-left font-semibold min-w-[140px]">メモ</th>
              {allowAddItems && (
                <th className="border p-2 w-10" />
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={`align-top ${item.selected ? "bg-primary/5" : ""}`}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => updateItem(item.id, { selected: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="border p-2">
                  {allowAddItems ? (
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      placeholder="名称を入力"
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </td>
                <td className="border p-2">
                  {allowAddItems ? (
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="説明を入力"
                      className="text-xs min-h-[60px] resize-none"
                      rows={2}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </td>
                {axes.map((axis) => (
                  <td key={axis} className="border p-2 text-center">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={item.scores[axis] ?? 3}
                      onChange={(e) => updateScore(item.id, axis, e.target.value)}
                      className="w-14 h-8 text-center mx-auto"
                    />
                  </td>
                ))}
                <td className="border p-2 text-center">
                  <div className="font-semibold text-sm">{totalScore(item, axes)}</div>
                  <div className="text-xs text-muted-foreground">({averageScore(item, axes)})</div>
                </td>
                <td className="border p-2">
                  <Textarea
                    value={item.note}
                    onChange={(e) => updateItem(item.id, { note: e.target.value })}
                    placeholder="メモ..."
                    className="text-xs min-h-[60px] resize-none"
                    rows={2}
                  />
                </td>
                {allowAddItems && (
                  <td className="border p-2 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                      onClick={() => removeItem(item.id)}
                    >
                      削除
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allowAddItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={addItem}
        >
          + 項目を追加
        </Button>
      )}
    </div>
  );
}
