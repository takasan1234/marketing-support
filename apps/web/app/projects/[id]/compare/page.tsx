"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  listFrameworkVersions,
  type FrameworkEntryDto,
  type FrameworkType,
} from "@/lib/api-client";

const FRAMEWORK_LABEL: Record<string, string> = {
  PEST: "PEST分析",
  FIVE_FORCES: "5Forces分析",
  INTERNAL_ANALYSIS: "整理軸分析",
  VRIO: "VRIO分析",
  THREE_C_PLUS_C: "3C+C分析",
  SWOT: "SWOT分析",
  CROSS_SWOT: "クロスSWOT",
  SEGMENTATION: "セグメンテーション",
  TARGETING: "ターゲティング",
  POSITIONING: "ポジショニング",
  CONCEPT_SHEET: "コンセプトシート",
  PRODUCT_4P: "Product",
  PRICE_4P: "Price",
  PLACE_4P: "Place",
  PROMOTION_4P: "Promotion",
  FOUR_C_SEVEN_P: "4C/7P",
  BLUE_OCEAN: "ブルーオーシャン",
  EXPERIENCE_VALUE: "経験価値",
  VALUE_ADD_METHODS: "高付加価値化",
  KGI_KSF_KPI: "KGI/KSF/KPI",
  CUSTOMER_JOURNEY: "カスタマージャーニー",
  CRM_OVERVIEW: "CRM概要",
  CRM_ANALYSIS: "CRM分析",
};

const ALL_FRAMEWORK_TYPES = Object.keys(FRAMEWORK_LABEL) as FrameworkType[];

type DiffStatus = "changed" | "added" | "removed" | "same";

type DiffRow = {
  key: string;
  status: DiffStatus;
  v1Value: unknown;
  v2Value: unknown;
};

function computeDiff(
  v1Data: Record<string, unknown>,
  v2Data: Record<string, unknown>
): DiffRow[] {
  const allKeys = Array.from(
    new Set([...Object.keys(v1Data), ...Object.keys(v2Data)])
  );
  return allKeys.map((key) => {
    const hasInV1 = Object.prototype.hasOwnProperty.call(v1Data, key);
    const hasInV2 = Object.prototype.hasOwnProperty.call(v2Data, key);
    const v1Val = v1Data[key];
    const v2Val = v2Data[key];
    let status: DiffStatus;
    if (!hasInV1) {
      status = "added";
    } else if (!hasInV2) {
      status = "removed";
    } else if (JSON.stringify(v1Val) !== JSON.stringify(v2Val)) {
      status = "changed";
    } else {
      status = "same";
    }
    return { key, status, v1Value: v1Val, v2Value: v2Val };
  });
}

function renderValue(val: unknown): React.ReactNode {
  if (val === undefined || val === null) {
    return <span className="text-muted-foreground italic">（なし）</span>;
  }
  if (typeof val === "object") {
    return (
      <pre className="text-xs whitespace-pre-wrap break-words bg-muted/40 rounded p-2 max-h-48 overflow-auto">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }
  return <span className="text-sm">{String(val)}</span>;
}

function rowBgClass(status: DiffStatus): string {
  switch (status) {
    case "changed":
      return "bg-yellow-50 dark:bg-yellow-950/30";
    case "added":
      return "bg-green-50 dark:bg-green-950/30";
    case "removed":
      return "bg-red-50 dark:bg-red-950/30";
    default:
      return "";
  }
}

function StatusBadge({ status }: { status: DiffStatus }) {
  if (status === "same") return null;
  const map: Record<Exclude<DiffStatus, "same">, { label: string; className: string }> = {
    changed: { label: "変更", className: "bg-yellow-500 text-white hover:bg-yellow-600" },
    added: { label: "追加", className: "bg-green-600 text-white hover:bg-green-700" },
    removed: { label: "削除", className: "bg-red-600 text-white hover:bg-red-700" },
  };
  const cfg = map[status];
  return (
    <Badge className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

export default function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const initialType = (searchParams.get("type") as FrameworkType | null) ?? null;
  const initialV1 = searchParams.get("v1");
  const initialV2 = searchParams.get("v2");

  const [frameworkType, setFrameworkType] = useState<FrameworkType | null>(initialType);
  const [versions, setVersions] = useState<FrameworkEntryDto[]>([]);
  const [v1Id, setV1Id] = useState<string | null>(initialV1);
  const [v2Id, setV2Id] = useState<string | null>(initialV2);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadVersions = useCallback(
    async (type: FrameworkType) => {
      setIsLoadingVersions(true);
      setLoadError(null);
      try {
        const fetched = await listFrameworkVersions(id, type);
        setVersions(fetched);
      } catch {
        setLoadError("バージョン一覧の取得に失敗しました");
        setVersions([]);
      } finally {
        setIsLoadingVersions(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (frameworkType) {
      loadVersions(frameworkType);
    }
  }, [frameworkType, loadVersions]);

  function handleTypeChange(val: string) {
    setFrameworkType(val as FrameworkType);
    setV1Id(null);
    setV2Id(null);
    setVersions([]);
  }

  const v1Entry = versions.find((v) => v.id === v1Id) ?? null;
  const v2Entry = versions.find((v) => v.id === v2Id) ?? null;

  const diffRows: DiffRow[] =
    v1Entry && v2Entry
      ? computeDiff(v1Entry.data, v2Entry.data)
      : [];

  const changedCount = diffRows.filter((r) => r.status !== "same").length;

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>{" "}
          /{" "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>{" "}
          / バージョン比較
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">バージョン比較</h1>
        </div>

        <Separator className="mb-6" />

        {/* Selectors */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">比較対象を選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              {/* Framework type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  フレームワーク
                </label>
                <Select
                  value={frameworkType ?? ""}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="種類を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_FRAMEWORK_TYPES.map((ft) => (
                      <SelectItem key={ft} value={ft}>
                        {FRAMEWORK_LABEL[ft]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* V1 selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  バージョン 1（左）
                </label>
                <Select
                  value={v1Id ?? ""}
                  onValueChange={(val) => setV1Id(val || null)}
                  disabled={!frameworkType || isLoadingVersions || versions.length === 0}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version}
                        {v.isLatest ? " (最新)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* V2 selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  バージョン 2（右）
                </label>
                <Select
                  value={v2Id ?? ""}
                  onValueChange={(val) => setV2Id(val || null)}
                  disabled={!frameworkType || isLoadingVersions || versions.length === 0}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version}
                        {v.isLatest ? " (最新)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingVersions && (
                <span className="text-sm text-muted-foreground">読み込み中...</span>
              )}
              {loadError && (
                <span className="text-sm text-destructive">{loadError}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diff view */}
        {v1Entry && v2Entry ? (
          <div>
            {/* Summary */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">
                {frameworkType ? FRAMEWORK_LABEL[frameworkType] : ""} —{" "}
                v{v1Entry.version} vs v{v2Entry.version}
              </span>
              {changedCount > 0 ? (
                <Badge variant="secondary">{changedCount} 件の差分</Badge>
              ) : (
                <Badge className="bg-green-600 text-white hover:bg-green-700">
                  差分なし
                </Badge>
              )}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[200px_1fr_1fr] gap-0 border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs font-semibold border-b border-r text-muted-foreground">
                キー
              </div>
              <div className="bg-muted px-4 py-2 text-xs font-semibold border-b border-r text-muted-foreground">
                v{v1Entry.version}
                {v1Entry.isLatest ? " (最新)" : ""}
              </div>
              <div className="bg-muted px-4 py-2 text-xs font-semibold border-b text-muted-foreground">
                v{v2Entry.version}
                {v2Entry.isLatest ? " (最新)" : ""}
              </div>

              {diffRows.map((row, idx) => (
                <div
                  key={row.key}
                  className={`contents`}
                >
                  {/* Key cell */}
                  <div
                    className={`px-4 py-3 border-r text-sm font-medium flex items-start gap-2 ${rowBgClass(row.status)} ${idx < diffRows.length - 1 ? "border-b" : ""}`}
                  >
                    <span className="break-all">{row.key}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  {/* V1 value */}
                  <div
                    className={`px-4 py-3 border-r ${rowBgClass(row.status)} ${idx < diffRows.length - 1 ? "border-b" : ""}`}
                  >
                    {row.status === "added"
                      ? <span className="text-muted-foreground italic">（なし）</span>
                      : renderValue(row.v1Value)}
                  </div>
                  {/* V2 value */}
                  <div
                    className={`px-4 py-3 ${rowBgClass(row.status)} ${idx < diffRows.length - 1 ? "border-b" : ""}`}
                  >
                    {row.status === "removed"
                      ? <span className="text-muted-foreground italic">（なし）</span>
                      : renderValue(row.v2Value)}
                  </div>
                </div>
              ))}

              {diffRows.length === 0 && (
                <div className="col-span-3 px-4 py-8 text-center text-sm text-muted-foreground">
                  データがありません
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {!frameworkType
              ? "フレームワーク種類を選択してください"
              : !v1Id || !v2Id
              ? "比較するバージョンを2つ選択してください"
              : "読み込み中..."}
          </div>
        )}

        {/* Back button */}
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}`}>ダッシュボードに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
