"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import { RawDataLinker } from "@/components/frameworks/shared/RawDataLinker";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  listLinks,
  type FrameworkEntryDto,
  type LinkDto,
} from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type StrategyEntry = {
  id: string;
  description: string;
  feasibility: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
};

type QuadrantKey = "so" | "wo" | "st" | "wt";

type CrossSwotData = {
  so: StrategyEntry[];
  wo: StrategyEntry[];
  st: StrategyEntry[];
  wt: StrategyEntry[];
};

const EMPTY_DATA: CrossSwotData = { so: [], wo: [], st: [], wt: [] };

// ─── Cell configs ─────────────────────────────────────────────────────────────

type QuadrantConfig = {
  key: QuadrantKey;
  label: string;
  subtitle: string;
  description: string;
  headerBg: string;
  borderColor: string;
  badgeColor: string;
};

const QUADRANT_CONFIGS: QuadrantConfig[] = [
  {
    key: "so",
    label: "S × O 積極攻勢",
    subtitle: "強み × 機会",
    description: "強みを活かして機会を最大限に取り込む戦略",
    headerBg: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800",
  },
  {
    key: "st",
    label: "S × T 差別化戦略",
    subtitle: "強み × 脅威",
    description: "強みを活かして脅威を乗り越える戦略",
    headerBg: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    key: "wo",
    label: "W × O 弱点強化",
    subtitle: "弱み × 機会",
    description: "弱みを克服して機会を逃さない戦略",
    headerBg: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    key: "wt",
    label: "W × T 専守防衛",
    subtitle: "弱み × 脅威",
    description: "弱みと脅威が重なる際の防衛・撤退戦略",
    headerBg: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
  },
];

// ─── Star rating component ────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  label,
}: {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {([1, 2, 3, 4, 5] as const).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-base leading-none transition-colors ${
              star <= value ? "text-yellow-400" : "text-gray-200 hover:text-yellow-200"
            }`}
            aria-label={`${label} ${star}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">{value}/5</span>
    </div>
  );
}

// ─── Average score badge ──────────────────────────────────────────────────────

function AvgScoreBadge({ entries }: { entries: StrategyEntry[] }) {
  if (entries.length === 0) return null;
  const avgFeasibility =
    entries.reduce((acc, e) => acc + e.feasibility, 0) / entries.length;
  const avgImpact =
    entries.reduce((acc, e) => acc + e.impact, 0) / entries.length;
  const combined = ((avgFeasibility + avgImpact) / 2).toFixed(1);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>平均スコア</span>
      <span>
        実現性: <strong>{avgFeasibility.toFixed(1)}</strong>
      </span>
      <span>
        効果: <strong>{avgImpact.toFixed(1)}</strong>
      </span>
      <span>
        総合: <strong>{combined}</strong>
      </span>
    </div>
  );
}

// ─── Quadrant cell ────────────────────────────────────────────────────────────

function QuadrantCell({
  config,
  entries,
  onChange,
}: {
  config: QuadrantConfig;
  entries: StrategyEntry[];
  onChange: (entries: StrategyEntry[]) => void;
}) {
  function addEntry() {
    const newEntry: StrategyEntry = {
      id: globalThis.crypto.randomUUID(),
      description: "",
      feasibility: 3,
      impact: 3,
    };
    onChange([...entries, newEntry]);
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  function updateEntry(id: string, patch: Partial<StrategyEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  return (
    <div
      className={`border-2 ${config.borderColor} rounded-lg overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div
        className={`${config.headerBg} px-3 py-2 border-b ${config.borderColor}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badgeColor}`}
              >
                {config.subtitle}
              </span>
            </div>
            <p className="text-sm font-semibold mt-0.5">{config.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 flex flex-col gap-3 bg-white">
        {entries.length > 0 && (
          <AvgScoreBadge entries={entries} />
        )}

        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="border rounded-md p-3 flex flex-col gap-2 group relative"
          >
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground font-medium mt-1 shrink-0">
                {idx + 1}.
              </span>
              <Textarea
                value={entry.description}
                onChange={(e) =>
                  updateEntry(entry.id, { description: e.target.value })
                }
                placeholder="戦略案を入力..."
                className="text-sm min-h-[52px] resize-none flex-1"
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeEntry(entry.id)}
              >
                ×
              </Button>
            </div>
            <div className="flex flex-col gap-1 pl-5">
              <StarRating
                label="実現性"
                value={entry.feasibility}
                onChange={(v) => updateEntry(entry.id, { feasibility: v })}
              />
              <StarRating
                label="効果"
                value={entry.impact}
                onChange={(v) => updateEntry(entry.id, { impact: v })}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start text-xs h-7 mt-1"
          onClick={addEntry}
        >
          + 戦略案を追加
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrossSwotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [crossSwotData, setCrossSwotData] = useState<CrossSwotData>(EMPTY_DATA);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "CROSS_SWOT"),
          listLinks(id, "CROSS_SWOT"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as unknown as CrossSwotData;
        setCrossSwotData(rawData ?? EMPTY_DATA);
      } catch {
        setCrossSwotData(EMPTY_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "CROSS_SWOT", {
        data: crossSwotData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "CROSS_SWOT", {
        data: crossSwotData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function updateQuadrant(key: QuadrantKey, entries: StrategyEntry[]) {
    setCrossSwotData((prev) => ({ ...prev, [key]: entries }));
  }

  function getLinksForSubElement(subElementId: string): LinkDto[] {
    return links.filter((l) => l.subElementId === subElementId);
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>
          {" / クロスSWOT分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">クロスSWOT分析</h1>
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
            <Button
              onClick={handleSave}
              disabled={isSaving || isCreatingVersion}
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
        <ClaudeHint projectId={id} />
        <div className="mb-2" />

        {/* Main layout: grid + right panel */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Strategy matrix description */}
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              SWOT分析の4要素を掛け合わせ、4パターンの戦略の方向性を導出します。各戦略案に実現性と効果を評価してください。
            </div>

            {/* 2x2 strategy grid */}
            <div>
              <h2 className="text-base font-semibold mb-3">戦略マトリックス</h2>
              <div className="grid grid-cols-2 gap-3">
                {QUADRANT_CONFIGS.map((config) => (
                  <QuadrantCell
                    key={config.key}
                    config={config}
                    entries={crossSwotData[config.key]}
                    onChange={(entries) => updateQuadrant(config.key, entries)}
                  />
                ))}
              </div>
            </div>

            {/* Raw data linker per quadrant */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {QUADRANT_CONFIGS.map((config) => (
                <div key={config.key} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{config.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="CROSS_SWOT"
                    subElementId={config.key}
                    existingLinks={getLinksForSubElement(config.key)}
                    onLinksChange={(updated) => {
                      const otherLinks = links.filter(
                        (l) => l.subElementId !== config.key
                      );
                      setLinks([...otherLinks, ...updated]);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="CROSS_SWOT" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
