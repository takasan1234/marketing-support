"use client";

import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";

export type ChecklistItem = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  score?: number; // optional 1-5 score
  note: string;
  category?: string;
};

type ChecklistProps = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  showScore?: boolean;
  groupByCategory?: boolean;
  title?: string;
};

const SCORE_LABELS: Record<number, string> = {
  1: "1 - 不十分",
  2: "2 - やや不十分",
  3: "3 - 普通",
  4: "4 - 良好",
  5: "5 - 優秀",
};

function StarScore({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-lg leading-none transition-colors ${
            star <= value
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-muted-foreground/30 hover:text-yellow-300"
          }`}
          title={SCORE_LABELS[star]}
        >
          ★
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value}/5</span>
    </div>
  );
}

function ChecklistItemRow({
  item,
  onUpdate,
  showScore,
}: {
  item: ChecklistItem;
  onUpdate: (patch: Partial<ChecklistItem>) => void;
  showScore: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-2 transition-colors ${
        item.checked ? "bg-primary/5 border-primary/30" : "bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onUpdate({ checked: e.target.checked })}
          className="mt-0.5 w-4 h-4 cursor-pointer accent-primary shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{item.label}</span>
            {item.description && (
              <span
                className="text-xs text-muted-foreground cursor-help"
                title={item.description}
              >
                ({item.description})
              </span>
            )}
          </div>
          {showScore && item.score !== undefined && (
            <div className="mt-1">
              <StarScore
                value={item.score}
                onChange={(v) => onUpdate({ score: v })}
              />
            </div>
          )}
        </div>
      </div>
      <Textarea
        value={item.note}
        onChange={(e) => onUpdate({ note: e.target.value })}
        placeholder="メモ・評価コメント..."
        className="text-xs min-h-[60px] resize-none"
        rows={2}
      />
    </div>
  );
}

export function Checklist({
  items,
  onChange,
  showScore = false,
  groupByCategory = false,
  title,
}: ChecklistProps) {
  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const checkedCount = items.filter((it) => it.checked).length;
  const totalCount = items.length;
  const fillPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  function renderItems(list: ChecklistItem[]) {
    return list.map((item) => (
      <ChecklistItemRow
        key={item.id}
        item={item}
        onUpdate={(patch) => updateItem(item.id, patch)}
        showScore={showScore}
      />
    ));
  }

  function renderGrouped() {
    const categories = Array.from(
      new Set(items.map((it) => it.category ?? "その他"))
    );
    return categories.map((cat) => {
      const catItems = items.filter((it) => (it.category ?? "その他") === cat);
      return (
        <div key={cat} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {cat}
          </h3>
          {renderItems(catItems)}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {title && <h2 className="text-base font-semibold">{title}</h2>}
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline" className="text-xs">
            {checkedCount}/{totalCount} 充足
          </Badge>
          <span className="text-xs text-muted-foreground">{fillPct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {groupByCategory ? renderGrouped() : renderItems(items)}
      </div>
    </div>
  );
}
