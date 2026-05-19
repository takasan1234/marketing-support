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

type AdoptionStatus = "yes" | "no" | "considering";

type MethodEntry = {
  adopted: AdoptionStatus;
  description: string;
  plan: string;
  expectedImpact: string;
};

type ValueAddData = Record<string, MethodEntry>;

// ─── Constants ───────────────────────────────────────────────────────────────

const METHODS: {
  id: string;
  name: string;
  description: string;
  massMarket: boolean;
  highValue: boolean;
}[] = [
  {
    id: "1",
    name: "認知価値の二面構築",
    description: "機能的価値 × 情緒的価値で構成し、両軸から顧客に訴求する",
    massMarket: true,
    highValue: false,
  },
  {
    id: "2",
    name: "段階的価格調整",
    description: "低めの価格でスタートし、段階的に値上げしてブランド価値を形成する",
    massMarket: true,
    highValue: false,
  },
  {
    id: "3",
    name: "外部評価活用",
    description: "権威・受賞・メディア掲載などの第三者評価を積極的に活用する",
    massMarket: true,
    highValue: false,
  },
  {
    id: "4",
    name: "ステークホルダー協力",
    description: "エリア・業界全体で価値の一貫性を担保するため、関係者と連携する",
    massMarket: true,
    highValue: true,
  },
  {
    id: "5",
    name: "パーソナル感",
    description: "カスタマイズや特別対応を通じて、顧客一人ひとりへの特別感を演出する",
    massMarket: true,
    highValue: true,
  },
  {
    id: "6",
    name: "枯渇感・希少性",
    description: "限定商品・チャネル絞込みにより、希少性と購買意欲を高める",
    massMarket: true,
    highValue: true,
  },
  {
    id: "7",
    name: "顧客の選択（エクスクルーシブ）",
    description: "価値を共有できる顧客を選び、エクスクルーシブなブランドポジションを築く",
    massMarket: true,
    highValue: true,
  },
];

const ADOPTION_OPTIONS: { value: AdoptionStatus; label: string }[] = [
  { value: "yes", label: "採用" },
  { value: "considering", label: "検討中" },
  { value: "no", label: "未採用" },
];

const ADOPTION_BADGE_VARIANT: Record<
  AdoptionStatus,
  "default" | "secondary" | "outline"
> = {
  yes: "default",
  considering: "secondary",
  no: "outline",
};

const DEFAULT_ENTRY: MethodEntry = {
  adopted: "no",
  description: "",
  plan: "",
  expectedImpact: "",
};

function buildDefaultData(): ValueAddData {
  return Object.fromEntries(METHODS.map((m) => [m.id, { ...DEFAULT_ENTRY }]));
}

// ─── Method Card ──────────────────────────────────────────────────────────────

type MethodCardProps = {
  method: (typeof METHODS)[number];
  entry: MethodEntry;
  onChange: (v: MethodEntry) => void;
};

function MethodCard({ method, entry, onChange }: MethodCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-3 transition-colors ${
        entry.adopted === "yes"
          ? "border-primary/40 bg-primary/5"
          : entry.adopted === "considering"
          ? "border-yellow-400/40 bg-yellow-50/30"
          : "bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">
              {method.id}
            </span>
            <span className="font-semibold text-sm">{method.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {method.massMarket && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                マス向け
              </Badge>
            )}
            {method.highValue && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                高付加価値向け
              </Badge>
            )}
          </div>
        </div>
        {/* Adoption toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {ADOPTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...entry, adopted: opt.value })}
              className="focus:outline-none"
            >
              <Badge
                variant={
                  entry.adopted === opt.value
                    ? ADOPTION_BADGE_VARIANT[opt.value]
                    : "outline"
                }
                className={`cursor-pointer text-xs ${
                  entry.adopted === opt.value ? "" : "opacity-40 hover:opacity-70"
                }`}
              >
                {opt.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            具体的な実装方法
          </label>
          <Textarea
            value={entry.description}
            onChange={(e) => onChange({ ...entry, description: e.target.value })}
            placeholder="どのように実施するか..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            実施計画
          </label>
          <Textarea
            value={entry.plan}
            onChange={(e) => onChange({ ...entry, plan: e.target.value })}
            placeholder="スケジュール・手順・担当..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            期待される効果
          </label>
          <Textarea
            value={entry.expectedImpact}
            onChange={(e) =>
              onChange({ ...entry, expectedImpact: e.target.value })
            }
            placeholder="売上・ブランド・顧客満足への影響..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ValueAddMethodsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [formData, setFormData] = useState<ValueAddData>(buildDefaultData());
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "VALUE_ADD_METHODS");
        setEntry(fetched);
        const raw = fetched.data as Partial<ValueAddData>;
        const merged = buildDefaultData();
        for (const m of METHODS) {
          const saved = raw[m.id];
          if (saved) {
            merged[m.id] = saved;
          }
        }
        setFormData(merged);
      } catch {
        setFormData(buildDefaultData());
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "VALUE_ADD_METHODS", {
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
      const newVersion = await createFrameworkVersion(id, "VALUE_ADD_METHODS", {
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

  function updateMethod(id_: string, v: MethodEntry) {
    setFormData((prev) => ({ ...prev, [id_]: v }));
  }

  // Stats
  const adoptedCount = METHODS.filter(
    (m) => formData[m.id]?.adopted === "yes"
  ).length;
  const consideringCount = METHODS.filter(
    (m) => formData[m.id]?.adopted === "considering"
  ).length;

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 高付加価値化7方法論"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">高付加価値化 7 方法論</h1>
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
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Summary stats */}
            <div className="rounded-lg border p-4 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">採用状況：</span>
              <div className="flex gap-3">
                <span>
                  <span className="font-semibold text-primary">{adoptedCount}</span>
                  <span className="text-muted-foreground ml-1">採用</span>
                </span>
                <span>
                  <span className="font-semibold text-yellow-600">{consideringCount}</span>
                  <span className="text-muted-foreground ml-1">検討中</span>
                </span>
                <span>
                  <span className="font-semibold text-muted-foreground">
                    {METHODS.length - adoptedCount - consideringCount}
                  </span>
                  <span className="text-muted-foreground ml-1">未採用</span>
                </span>
              </div>
            </div>

            {/* Method cards */}
            {METHODS.map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                entry={formData[method.id] ?? { ...DEFAULT_ENTRY }}
                onChange={(v) => updateMethod(method.id, v)}
              />
            ))}
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="VALUE_ADD_METHODS" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
