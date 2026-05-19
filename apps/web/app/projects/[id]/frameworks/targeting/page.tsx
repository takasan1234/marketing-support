"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  ComparisonCatalog,
  type CatalogItem,
} from "@/components/frameworks/ComparisonCatalog";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

const TARGETING_AXES = [
  "市場規模",
  "成長性",
  "競合強度（逆）",
  "自社適合性",
  "到達可能性",
];

const DEFAULT_SEGMENTS: CatalogItem[] = [
  {
    id: globalThis.crypto.randomUUID(),
    name: "セグメント A",
    description: "（セグメンテーションで定義したセグメントを記入）",
    selected: false,
    scores: Object.fromEntries(TARGETING_AXES.map((a) => [a, 3])),
    note: "",
  },
  {
    id: globalThis.crypto.randomUUID(),
    name: "セグメント B",
    description: "（セグメンテーションで定義したセグメントを記入）",
    selected: false,
    scores: Object.fromEntries(TARGETING_AXES.map((a) => [a, 3])),
    note: "",
  },
];

type Approach = "concentrated" | "differentiated" | "undifferentiated";

const APPROACH_LABELS: Record<Approach, string> = {
  concentrated: "集中型マーケティング",
  differentiated: "差別型マーケティング",
  undifferentiated: "無差別型マーケティング",
};

type TargetingData = {
  segments: CatalogItem[];
  mainTarget: string;
  subTargets: string;
  rationale: string;
  approach: Approach;
};

const DEFAULT_DATA: TargetingData = {
  segments: DEFAULT_SEGMENTS,
  mainTarget: "",
  subTargets: "",
  rationale: "",
  approach: "concentrated",
};

export default function TargetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [targetingData, setTargetingData] =
    useState<TargetingData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "TARGETING");
        setEntry(fetched);
        const raw = fetched.data as Partial<TargetingData>;
        setTargetingData({
          segments:
            (raw.segments as CatalogItem[] | undefined) ?? DEFAULT_SEGMENTS,
          mainTarget: raw.mainTarget ?? "",
          subTargets: raw.subTargets ?? "",
          rationale: raw.rationale ?? "",
          approach: (raw.approach as Approach | undefined) ?? "concentrated",
        });
      } catch {
        setTargetingData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "TARGETING", {
        data: targetingData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "TARGETING", {
        data: targetingData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function update(patch: Partial<TargetingData>) {
    setTargetingData((prev) => ({ ...prev, ...patch }));
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
          {" / ターゲティング"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">ターゲティング</h1>
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

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Catalog */}
            <ComparisonCatalog
              title="セグメント別評価"
              items={targetingData.segments}
              axes={TARGETING_AXES}
              onChange={(segments) => update({ segments })}
              allowAddItems
            />

            <Separator />

            {/* Selection results */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">選定結果</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    メインターゲット
                  </label>
                  <Input
                    value={targetingData.mainTarget}
                    onChange={(e) => update({ mainTarget: e.target.value })}
                    placeholder="例：20代女性アニメ好き"
                    className="h-9"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    サブターゲット
                  </label>
                  <Input
                    value={targetingData.subTargets}
                    onChange={(e) => update({ subTargets: e.target.value })}
                    placeholder="例：30代男性アクティブ、40代家族層"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  マーケティングアプローチ
                </label>
                <Select
                  value={targetingData.approach}
                  onValueChange={(v) => update({ approach: v as Approach })}
                >
                  <SelectTrigger className="w-64 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(APPROACH_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">選定理由</label>
                <Textarea
                  value={targetingData.rationale}
                  onChange={(e) => update({ rationale: e.target.value })}
                  placeholder="メインターゲットを選んだ理由を記入してください..."
                  className="min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="TARGETING" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
