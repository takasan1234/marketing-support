"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

export type JourneyStage = {
  id: string;
  name: string;
  touchpoints: string[];
  emotions: string;
  emotionScore: number;
  painPoints: string[];
  opportunities: string[];
  note: string;
};

export type JourneyMapData = {
  persona: string;
  stages: JourneyStage[];
  model: "aidma" | "aisas" | "custom";
};

type JourneyMapProps = {
  data: JourneyMapData;
  onChange: (data: JourneyMapData) => void;
};

const AIDMA_STAGES = ["Attention", "Interest", "Desire", "Memory", "Action"];
const AISAS_STAGES = ["Attention", "Interest", "Search", "Action", "Share"];

function createStage(name: string): JourneyStage {
  return {
    id: globalThis.crypto.randomUUID(),
    name,
    touchpoints: [""],
    emotions: "",
    emotionScore: 0,
    painPoints: [""],
    opportunities: [""],
    note: "",
  };
}

function emotionScoreLabel(score: number): string {
  if (score <= -2) return "😞 非常にネガティブ";
  if (score === -1) return "😕 ネガティブ";
  if (score === 0) return "😐 中立";
  if (score === 1) return "🙂 ポジティブ";
  return "😄 非常にポジティブ";
}

function emotionScoreBarColor(score: number): string {
  if (score <= -2) return "bg-red-500";
  if (score === -1) return "bg-orange-400";
  if (score === 0) return "bg-gray-300";
  if (score === 1) return "bg-blue-400";
  return "bg-green-500";
}

// Multi-line list editor (newline-separated items stored as string[])
type ListEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

function ListEditor({ items, onChange, placeholder }: ListEditorProps) {
  function updateItem(idx: number, val: string) {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    onChange(next.length === 0 ? [""] : next);
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <Input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={placeholder}
            className="h-6 text-xs"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-destructive text-xs hover:opacity-70 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-xs text-primary hover:opacity-70 text-left"
      >
        + 追加
      </button>
    </div>
  );
}

export function JourneyMap({ data, onChange }: JourneyMapProps) {
  function updateStage(id: string, patch: Partial<JourneyStage>) {
    onChange({
      ...data,
      stages: data.stages.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function addStage() {
    const newStage = createStage("新ステージ");
    onChange({ ...data, stages: [...data.stages, newStage] });
  }

  function removeStage(id: string) {
    onChange({ ...data, stages: data.stages.filter((s) => s.id !== id) });
  }

  function handleModelChange(model: JourneyMapData["model"]) {
    let stages: JourneyStage[];
    if (model === "aidma") {
      stages = AIDMA_STAGES.map(createStage);
    } else if (model === "aisas") {
      stages = AISAS_STAGES.map(createStage);
    } else {
      stages = data.stages.length > 0 ? data.stages : [createStage("ステージ1")];
    }
    onChange({ ...data, model, stages });
  }

  const { stages } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* Model selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">心理モデル</label>
        <div className="flex items-center gap-4">
          {(["aidma", "aisas", "custom"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="journey-model"
                value={m}
                checked={data.model === m}
                onChange={() => handleModelChange(m)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                {m === "aidma" ? "AIDMA" : m === "aisas" ? "AISAS" : "カスタム"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Persona */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">ペルソナ</label>
        <Textarea
          value={data.persona}
          onChange={(e) => onChange({ ...data, persona: e.target.value })}
          placeholder="例：30代女性、都市部在住、スマートフォンユーザー..."
          className="text-sm min-h-[64px] resize-none"
          rows={3}
        />
      </div>

      {/* Journey table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs min-w-max">
          <thead>
            <tr>
              <th className="border bg-muted/50 p-2 text-left font-semibold w-28 shrink-0">
                項目
              </th>
              {stages.map((stage) => (
                <th key={stage.id} className="border bg-muted/50 p-2 min-w-[180px]">
                  <div className="flex items-center justify-between gap-1">
                    <Input
                      value={stage.name}
                      onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                      className="h-6 text-sm font-semibold text-center flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeStage(stage.id)}
                      className="text-destructive hover:opacity-70 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
              <th className="border bg-muted/50 p-2 w-20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs w-full"
                  onClick={addStage}
                >
                  + 追加
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Touchpoints row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">
                タッチポイント
              </td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <ListEditor
                    items={stage.touchpoints}
                    onChange={(v) => updateStage(stage.id, { touchpoints: v })}
                    placeholder="例：SNS広告"
                  />
                </td>
              ))}
              <td className="border" />
            </tr>

            {/* Emotions row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">
                感情・心理
              </td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <Textarea
                    value={stage.emotions}
                    onChange={(e) => updateStage(stage.id, { emotions: e.target.value })}
                    placeholder="例：興味が湧いてきた..."
                    className="text-xs min-h-[56px] resize-none"
                    rows={2}
                  />
                </td>
              ))}
              <td className="border" />
            </tr>

            {/* Emotion score row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">
                感情スコア
                <div className="text-[10px] font-normal text-muted-foreground">(-2 〜 +2)</div>
              </td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <div className="flex flex-col gap-1 items-center">
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={1}
                      value={stage.emotionScore}
                      onChange={(e) =>
                        updateStage(stage.id, {
                          emotionScore: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-full ${emotionScoreBarColor(stage.emotionScore)}`}
                      />
                      <span className="text-[10px] text-center">
                        {emotionScoreLabel(stage.emotionScore)}
                      </span>
                    </div>
                  </div>
                </td>
              ))}
              <td className="border" />
            </tr>

            {/* Pain points row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">
                課題・ペイン
              </td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <ListEditor
                    items={stage.painPoints}
                    onChange={(v) => updateStage(stage.id, { painPoints: v })}
                    placeholder="例：情報が多すぎる"
                  />
                </td>
              ))}
              <td className="border" />
            </tr>

            {/* Opportunities row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">
                機会・施策
              </td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <ListEditor
                    items={stage.opportunities}
                    onChange={(v) => updateStage(stage.id, { opportunities: v })}
                    placeholder="例：比較コンテンツ強化"
                  />
                </td>
              ))}
              <td className="border" />
            </tr>

            {/* Note row */}
            <tr className="align-top">
              <td className="border bg-muted/30 p-2 font-semibold text-xs">メモ</td>
              {stages.map((stage) => (
                <td key={stage.id} className="border p-2">
                  <Textarea
                    value={stage.note}
                    onChange={(e) => updateStage(stage.id, { note: e.target.value })}
                    placeholder="メモ..."
                    className="text-xs min-h-[48px] resize-none"
                    rows={2}
                  />
                </td>
              ))}
              <td className="border" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
