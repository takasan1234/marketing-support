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

// ─── Types ────────────────────────────────────────────────────────────────────

type CrmMethodStatus = "planning" | "in_progress" | "done" | "not_applicable";

type CrmMethodEntry = {
  adopted: boolean;
  status: CrmMethodStatus;
  description: string;
  keyMetrics: string;
  findings: string;
  nextActions: string;
};

type CrmData = Record<string, CrmMethodEntry>;

// ─── Constants ────────────────────────────────────────────────────────────────

type MethodMeta = {
  id: string;
  name: string;
  purpose: string;
  overview: string;
};

const CRM_METHODS: MethodMeta[] = [
  {
    id: "cluster",
    name: "クラスター分析",
    purpose: "特性別集団抽出",
    overview: "似た要素のグループ分け",
  },
  {
    id: "segmentation",
    name: "セグメンテーション分析",
    purpose: "顧客ニーズ確認",
    overview: "属性・購買履歴でグルーピング",
  },
  {
    id: "decile",
    name: "デシル分析",
    purpose: "売上構成確認",
    overview: "購入金額で上位10分位",
  },
  {
    id: "sales",
    name: "売上分析",
    purpose: "売上傾向確認",
    overview: "組織・商品ごとの売上比較",
  },
  {
    id: "cpm",
    name: "CPM（Customer Portfolio Management）分析",
    purpose: "優良顧客抽出",
    overview: "現役 / 離脱 × 段階で10分類",
  },
  {
    id: "rfm",
    name: "RFM分析",
    purpose: "優良顧客抽出",
    overview: "Recency × Frequency × Monetary",
  },
  {
    id: "ctb",
    name: "CTB分析",
    purpose: "商品購入傾向",
    overview: "Category × Taste × Brand",
  },
];

const STATUS_LABELS: Record<CrmMethodStatus, string> = {
  planning: "計画中",
  in_progress: "進行中",
  done: "完了",
  not_applicable: "対象外",
};

const STATUS_COLORS: Record<CrmMethodStatus, string> = {
  planning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  done: "bg-green-100 text-green-800 border-green-300",
  not_applicable: "bg-gray-100 text-gray-600 border-gray-300",
};

function createDefaultEntry(): CrmMethodEntry {
  return {
    adopted: false,
    status: "planning",
    description: "",
    keyMetrics: "",
    findings: "",
    nextActions: "",
  };
}

function buildDefaultData(): CrmData {
  const data: CrmData = {};
  for (const m of CRM_METHODS) {
    data[m.id] = createDefaultEntry();
  }
  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type MethodCardProps = {
  meta: MethodMeta;
  entry: CrmMethodEntry;
  onChange: (entry: CrmMethodEntry) => void;
};

function MethodCard({ meta, entry, onChange }: MethodCardProps) {
  const [expanded, setExpanded] = useState(false);

  function update(patch: Partial<CrmMethodEntry>) {
    onChange({ ...entry, ...patch });
  }

  return (
    <div
      className={`rounded-lg border bg-card transition-colors ${
        entry.adopted ? "border-primary/40 bg-primary/5" : ""
      }`}
    >
      {/* Card header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-sm text-muted-foreground w-4 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>

        <input
          type="checkbox"
          checked={entry.adopted}
          onChange={(e) => {
            e.stopPropagation();
            update({ adopted: e.target.checked });
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 cursor-pointer shrink-0"
          aria-label={`${meta.name} 採用`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{meta.name}</span>
            {entry.adopted && (
              <span className="text-xs text-primary font-medium">★ 採用</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            目的: {meta.purpose} — {meta.overview}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status]}`}
        >
          {STATUS_LABELS[entry.status]}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t p-4 flex flex-col gap-4">
          {/* Status selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              ステータス
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {(
                [
                  "planning",
                  "in_progress",
                  "done",
                  "not_applicable",
                ] as CrmMethodStatus[]
              ).map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`${meta.id}-status`}
                    value={s}
                    checked={entry.status === s}
                    onChange={() => update({ status: s })}
                    className="w-3.5 h-3.5"
                  />
                  <span className="text-xs">{STATUS_LABELS[s]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              現状・実施内容
            </label>
            <Textarea
              value={entry.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="現在の取り組み状況や分析の概要を記入..."
              className="text-sm min-h-[72px] resize-none"
              rows={3}
            />
          </div>

          {/* Key Metrics */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              KPI・計測指標
            </label>
            <Textarea
              value={entry.keyMetrics}
              onChange={(e) => update({ keyMetrics: e.target.value })}
              placeholder="追跡している指標や KPI を記入..."
              className="text-sm min-h-[56px] resize-none"
              rows={2}
            />
          </div>

          {/* Findings */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              主要な発見・インサイト
            </label>
            <Textarea
              value={entry.findings}
              onChange={(e) => update({ findings: e.target.value })}
              placeholder="分析から得られた主要な発見を記入..."
              className="text-sm min-h-[72px] resize-none"
              rows={3}
            />
          </div>

          {/* Next Actions */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              次のアクション
            </label>
            <Textarea
              value={entry.nextActions}
              onChange={(e) => update({ nextActions: e.target.value })}
              placeholder="次に実施すべき施策やアクションを記入..."
              className="text-sm min-h-[56px] resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrmAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [crmData, setCrmData] = useState<CrmData>(buildDefaultData());
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "CRM_ANALYSIS");
        setEntry(fetched);
        const rawData = fetched.data as CrmData;
        if (rawData && typeof rawData === "object") {
          // Merge with defaults to ensure all methods exist
          const merged = buildDefaultData();
          for (const key of Object.keys(merged)) {
            if (rawData[key]) {
              merged[key] = { ...merged[key], ...rawData[key] };
            }
          }
          setCrmData(merged);
        }
      } catch {
        // Entry may not exist yet
      }
    }
    load();
  }, [id]);

  function updateMethod(methodId: string, entry: CrmMethodEntry) {
    setCrmData((prev) => ({ ...prev, [methodId]: entry }));
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "CRM_ANALYSIS", {
        data: crmData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "CRM_ANALYSIS", {
        data: crmData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  const adoptedCount = CRM_METHODS.filter(
    (m) => crmData[m.id]?.adopted
  ).length;

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
          {" / CRM分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">CRM分析</h1>
            {entry && (
              <VersionBadge version={entry.version} isLatest={entry.isLatest} />
            )}
            <Badge variant="secondary" className="text-xs">
              {adoptedCount} / {CRM_METHODS.length} 採用
            </Badge>
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

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              7つのCRM分析手法から、事業フェーズに応じて2〜3つを選定して適用します。
              各手法のカードをクリックすると詳細を入力できます。
            </p>

            {/* Method cards */}
            <div className="flex flex-col gap-3">
              {CRM_METHODS.map((meta) => (
                <MethodCard
                  key={meta.id}
                  meta={meta}
                  entry={crmData[meta.id] ?? createDefaultEntry()}
                  onChange={(updated) => updateMethod(meta.id, updated)}
                />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="CRM_ANALYSIS" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
