"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

export type VRIOCriteria = {
  value: boolean;
  rarity: boolean;
  imitability: boolean;
  organization: boolean;
  note: string;
};

export type VRIOResource = {
  id: string;
  name: string;
  criteria: VRIOCriteria;
};

type VRIOResult =
  | "sustained"
  | "unexploited"
  | "temporary"
  | "parity"
  | "disadvantage"
  | "incomplete";

export type VRIOFlowchartProps = {
  resources: VRIOResource[];
  onChange: (resources: VRIOResource[]) => void;
};

const CRITERIA_KEYS: Array<keyof Omit<VRIOCriteria, "note">> = [
  "value",
  "rarity",
  "imitability",
  "organization",
];

const CRITERIA_LABELS: Record<keyof Omit<VRIOCriteria, "note">, string> = {
  value: "V — Value（価値）",
  rarity: "R — Rarity（希少性）",
  imitability: "I — Imitability（模倣困難性）",
  organization: "O — Organization（組織活用）",
};

const CRITERIA_QUESTIONS: Record<keyof Omit<VRIOCriteria, "note">, string> = {
  value: "顧客価値を提供するか？",
  rarity: "競合他社にはない希少なものか？",
  imitability: "他社が模倣しにくいか？",
  organization: "活用できる組織体制があるか？",
};

const RESULT_LABELS: Record<VRIOResult, string> = {
  sustained: "持続的競争優位",
  unexploited: "未活用の競争優位",
  temporary: "一時的競争優位",
  parity: "競合同位",
  disadvantage: "競合劣位",
  incomplete: "評価中...",
};

const RESULT_COLORS: Record<VRIOResult, string> = {
  sustained: "bg-emerald-600 text-white hover:bg-emerald-700",
  unexploited: "bg-blue-500 text-white hover:bg-blue-600",
  temporary: "bg-yellow-500 text-white hover:bg-yellow-600",
  parity: "bg-gray-400 text-white hover:bg-gray-500",
  disadvantage: "bg-red-500 text-white hover:bg-red-600",
  incomplete: "bg-muted text-muted-foreground",
};

function calcResult(
  criteria: VRIOCriteria,
  answered: Set<string>
): VRIOResult {
  if (!answered.has("value")) return "incomplete";
  if (!criteria.value) return "disadvantage";
  if (!answered.has("rarity")) return "incomplete";
  if (!criteria.rarity) return "parity";
  if (!answered.has("imitability")) return "incomplete";
  if (!criteria.imitability) return "temporary";
  if (!answered.has("organization")) return "incomplete";
  if (!criteria.organization) return "unexploited";
  return "sustained";
}

/** Returns the set of criteria keys that are visible given the current answers.
 *  The chain stops at the first "No" answer. */
function visibleKeys(
  criteria: VRIOCriteria,
  answered: Set<string>
): Array<keyof Omit<VRIOCriteria, "note">> {
  const result: Array<keyof Omit<VRIOCriteria, "note">> = [];
  for (const key of CRITERIA_KEYS) {
    result.push(key);
    if (answered.has(key) && !criteria[key]) break; // chain stops on No
  }
  return result;
}

type ResourceCardProps = {
  resource: VRIOResource;
  onUpdate: (updated: VRIOResource) => void;
  onRemove: () => void;
};

function ResourceCard({ resource, onUpdate, onRemove }: ResourceCardProps) {
  // Track which criteria the user has explicitly answered
  const [answered, setAnswered] = useState<Set<string>>(() => {
    // Treat all criteria as already answered on initial load
    return new Set(CRITERIA_KEYS);
  });

  const effectiveVisible = visibleKeys(resource.criteria, answered);
  const result = calcResult(resource.criteria, answered);

  function setCriterion(key: keyof Omit<VRIOCriteria, "note">, val: boolean) {
    // Mark all keys up to and including this one as answered
    const newAnswered = new Set<string>();
    for (const k of CRITERIA_KEYS) {
      newAnswered.add(k);
      if (k === key) break;
    }
    setAnswered(newAnswered);
    onUpdate({
      ...resource,
      criteria: { ...resource.criteria, [key]: val },
    });
  }

  function setNote(note: string) {
    onUpdate({ ...resource, criteria: { ...resource.criteria, note } });
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Resource name header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30">
        <Input
          value={resource.name}
          onChange={(e) => onUpdate({ ...resource, name: e.target.value })}
          placeholder="資源名を入力..."
          className="flex-1 font-medium"
        />
        <Badge className={RESULT_COLORS[result]}>{RESULT_LABELS[result]}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          削除
        </Button>
      </div>

      <Separator />

      {/* Criteria rows */}
      <div className="p-4 flex flex-col gap-3">
        {CRITERIA_KEYS.map((key, idx) => {
          const isVisible = effectiveVisible.includes(key);
          const isAnswered = answered.has(key);

          return (
            <div
              key={key}
              className={`flex items-start gap-4 transition-opacity ${
                !isVisible ? "opacity-30 pointer-events-none" : "opacity-100"
              }`}
            >
              {/* Step number */}
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>

              {/* Label & question */}
              <div className="w-52 shrink-0">
                <p className="text-sm font-medium">{CRITERIA_LABELS[key]}</p>
                <p className="text-xs text-muted-foreground">
                  {CRITERIA_QUESTIONS[key]}
                </p>
              </div>

              {/* Yes / No buttons */}
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    isAnswered && resource.criteria[key] ? "default" : "outline"
                  }
                  className={
                    isAnswered && resource.criteria[key]
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                      : ""
                  }
                  onClick={() => setCriterion(key, true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    isAnswered && !resource.criteria[key] ? "default" : "outline"
                  }
                  className={
                    isAnswered && !resource.criteria[key]
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      : ""
                  }
                  onClick={() => setCriterion(key, false)}
                >
                  No
                </Button>
              </div>

              {/* Inline result badge when chain stops at this No */}
              {isAnswered && !resource.criteria[key] && (
                <Badge className={`${RESULT_COLORS[result]} shrink-0 self-center`}>
                  {RESULT_LABELS[result]}
                </Badge>
              )}
            </div>
          );
        })}

        {/* Note field */}
        <div className="mt-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">メモ</p>
          <Textarea
            value={resource.criteria.note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="この資源に関するメモ..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function VRIOFlowchart({ resources, onChange }: VRIOFlowchartProps) {
  function addResource() {
    const newResource: VRIOResource = {
      id: globalThis.crypto.randomUUID(),
      name: "",
      criteria: {
        value: true,
        rarity: true,
        imitability: true,
        organization: true,
        note: "",
      },
    };
    onChange([...resources, newResource]);
  }

  function updateResource(index: number, updated: VRIOResource) {
    const next = [...resources];
    next[index] = updated;
    onChange(next);
  }

  function removeResource(index: number) {
    onChange(resources.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">経営資源の評価</h2>
        <Button type="button" variant="outline" size="sm" onClick={addResource}>
          + 資源を追加
        </Button>
      </div>

      {/* Resource cards */}
      {resources.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
          資源がまだありません。「+ 資源を追加」から評価対象を追加してください。
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resources.map((resource, idx) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onUpdate={(updated) => updateResource(idx, updated)}
              onRemove={() => removeResource(idx)}
            />
          ))}
        </div>
      )}

      {/* VRIO flowchart legend */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground mb-3">
          VRIO 判定フロー
        </p>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">V=No</span>
            <span className="text-muted-foreground">──→</span>
            <Badge className={`${RESULT_COLORS.disadvantage} text-xs`}>
              {RESULT_LABELS.disadvantage}
            </Badge>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <span className="text-muted-foreground">R=No</span>
            <span className="text-muted-foreground">──→</span>
            <Badge className={`${RESULT_COLORS.parity} text-xs`}>
              {RESULT_LABELS.parity}
            </Badge>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <span className="text-muted-foreground">I=No</span>
            <span className="text-muted-foreground">──→</span>
            <Badge className={`${RESULT_COLORS.temporary} text-xs`}>
              {RESULT_LABELS.temporary}
            </Badge>
          </div>
          <div className="flex items-center gap-2 ml-18">
            <span className="text-muted-foreground">O=No</span>
            <span className="text-muted-foreground">──→</span>
            <Badge className={`${RESULT_COLORS.unexploited} text-xs`}>
              {RESULT_LABELS.unexploited}
            </Badge>
          </div>
          <div className="flex items-center gap-2 ml-18">
            <span className="text-muted-foreground">O=Yes</span>
            <span className="text-muted-foreground">──→</span>
            <Badge className={`${RESULT_COLORS.sustained} text-xs`}>
              {RESULT_LABELS.sustained}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
