"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type ValueStatus = "covered" | "partial" | "missing" | "na";

type ValueEntry = {
  status: ValueStatus;
  score: number; // 1-5
  currentInitiatives: string;
  improvementPlans: string;
};

type ExperienceValueData = {
  sense: ValueEntry;
  feel: ValueEntry;
  think: ValueEntry;
  act: ValueEntry;
  relate: ValueEntry;
  overallSummary: string;
  priorities: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

type ValueKey = keyof Omit<ExperienceValueData, "overallSummary" | "priorities">;

const VALUE_DEFS: {
  key: ValueKey;
  label: string;
  subtitle: string;
  color: string;
}[] = [
  {
    key: "sense",
    label: "SENSE（感覚価値）",
    subtitle: "五感に訴える要素",
    color: "#f59e0b",
  },
  {
    key: "feel",
    label: "FEEL（感情価値）",
    subtitle: "感情・愛着を呼び起こす要素",
    color: "#ec4899",
  },
  {
    key: "think",
    label: "THINK（認知価値）",
    subtitle: "知的好奇心・新たな発見",
    color: "#8b5cf6",
  },
  {
    key: "act",
    label: "ACT（行動価値）",
    subtitle: "行動・習慣に影響する要素",
    color: "#2563eb",
  },
  {
    key: "relate",
    label: "RELATE（関係価値）",
    subtitle: "コミュニティ・社会への帰属",
    color: "#16a34a",
  },
];

const STATUS_OPTIONS: { value: ValueStatus; label: string }[] = [
  { value: "covered", label: "充足" },
  { value: "partial", label: "部分的" },
  { value: "missing", label: "不足" },
  { value: "na", label: "該当なし" },
];

const STATUS_BADGE_VARIANT: Record<
  ValueStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  covered: "default",
  partial: "secondary",
  missing: "destructive",
  na: "outline",
};

const DEFAULT_ENTRY: ValueEntry = {
  status: "missing",
  score: 3,
  currentInitiatives: "",
  improvementPlans: "",
};

const DEFAULT_DATA: ExperienceValueData = {
  sense: { ...DEFAULT_ENTRY },
  feel: { ...DEFAULT_ENTRY },
  think: { ...DEFAULT_ENTRY },
  act: { ...DEFAULT_ENTRY },
  relate: { ...DEFAULT_ENTRY },
  overallSummary: "",
  priorities: "",
};

// ─── Star Score ───────────────────────────────────────────────────────────────

function StarScore({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-lg leading-none transition-colors"
          style={{
            color: star <= value ? color : "#d1d5db",
          }}
          title={`${star}/5`}
        >
          ★
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value}/5</span>
    </div>
  );
}

// ─── Value Card ───────────────────────────────────────────────────────────────

type ValueCardProps = {
  label: string;
  subtitle: string;
  color: string;
  value: ValueEntry;
  onChange: (v: ValueEntry) => void;
};

function ValueCard({ label, subtitle, color, value, onChange }: ValueCardProps) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-sm" style={{ color }}>
            {label}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...value, status: opt.value })}
              className="focus:outline-none"
            >
              <Badge
                variant={
                  value.status === opt.value
                    ? STATUS_BADGE_VARIANT[opt.value]
                    : "outline"
                }
                className={`cursor-pointer text-xs ${
                  value.status === opt.value ? "" : "opacity-40 hover:opacity-70"
                }`}
              >
                {opt.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          充足スコア
        </p>
        <StarScore
          value={value.score}
          onChange={(v) => onChange({ ...value, score: v })}
          color={color}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            現在の取り組み
          </label>
          <Textarea
            value={value.currentInitiatives}
            onChange={(e) =>
              onChange({ ...value, currentInitiatives: e.target.value })
            }
            placeholder="現在実施している施策や要素..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            改善計画
          </label>
          <Textarea
            value={value.improvementPlans}
            onChange={(e) =>
              onChange({ ...value, improvementPlans: e.target.value })
            }
            placeholder="強化・改善のための計画..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExperienceValuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [formData, setFormData] = useState<ExperienceValueData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "EXPERIENCE_VALUE");
        setEntry(fetched);
        const raw = fetched.data as Partial<ExperienceValueData>;
        setFormData({
          sense: raw.sense ?? { ...DEFAULT_ENTRY },
          feel: raw.feel ?? { ...DEFAULT_ENTRY },
          think: raw.think ?? { ...DEFAULT_ENTRY },
          act: raw.act ?? { ...DEFAULT_ENTRY },
          relate: raw.relate ?? { ...DEFAULT_ENTRY },
          overallSummary: raw.overallSummary ?? "",
          priorities: raw.priorities ?? "",
        });
      } catch {
        setFormData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "EXPERIENCE_VALUE", {
        data: formData as unknown as Record<string, unknown>,
      });
      setEntry(updated);
      setMessage("保存しました");
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateVersion() {
    setIsCreatingVersion(true);
    setMessage(null);
    try {
      const newVersion = await createFrameworkVersion(id, "EXPERIENCE_VALUE", {
        data: formData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function updateValue(key: ValueKey, v: ValueEntry) {
    setFormData((prev) => ({ ...prev, [key]: v }));
  }

  // Stats
  const coverageCount = VALUE_DEFS.filter(
    (d) => formData[d.key].status === "covered"
  ).length;
  const partialCount = VALUE_DEFS.filter(
    (d) => formData[d.key].status === "partial"
  ).length;
  const coveragePct = Math.round(
    ((coverageCount + partialCount * 0.5) / VALUE_DEFS.length) * 100
  );

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 経験価値マーケティング"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">経験価値マーケティング</h1>
            {entry && (
              <VersionBadge version={entry.version} isLatest={entry.isLatest} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
            <Button
              variant="outline"
              onClick={handleCreateVersion}
              disabled={isCreatingVersion || isSaving}
            >
              {isCreatingVersion ? "作成中..." : "新バージョンとして保存"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isCreatingVersion}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
        <ClaudeHint projectId={id} />
        <div className="mb-2" />

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Coverage bar */}
            <div className="rounded-lg border p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">充足率（参考）</span>
                <span className="text-muted-foreground">{coveragePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>充足: {coverageCount}</span>
                <span>部分的: {partialCount}</span>
                <span>
                  不足:{" "}
                  {VALUE_DEFS.filter((d) => formData[d.key].status === "missing").length}
                </span>
                <span>
                  該当なし:{" "}
                  {VALUE_DEFS.filter((d) => formData[d.key].status === "na").length}
                </span>
              </div>
            </div>

            {/* 5 value cards */}
            {VALUE_DEFS.map((def) => (
              <ValueCard
                key={def.key}
                label={def.label}
                subtitle={def.subtitle}
                color={def.color}
                value={formData[def.key]}
                onChange={(v) => updateValue(def.key, v)}
              />
            ))}

            <Separator />

            {/* Summary and priorities */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">総括サマリー</label>
                <Textarea
                  value={formData.overallSummary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      overallSummary: e.target.value,
                    }))
                  }
                  placeholder="5 つの経験価値の全体評価・方針..."
                  className="min-h-[100px] resize-y text-sm"
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">強化すべき優先順位</label>
                <Textarea
                  value={formData.priorities}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priorities: e.target.value,
                    }))
                  }
                  placeholder="例）1. RELATE  2. THINK  3. ACT..."
                  className="min-h-[100px] resize-y text-sm"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="EXPERIENCE_VALUE" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
