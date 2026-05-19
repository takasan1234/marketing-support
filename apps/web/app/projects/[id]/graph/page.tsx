import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { getProject, getFrameworkEntry, listRawData } from "@/lib/api-client";
import type { FrameworkType, RawDataType } from "@/lib/api-client";
import { getAffectedFrameworks } from "@/lib/frameworks/dependencies";
import { DependencyGraph } from "@/components/frameworks/DependencyGraph";

const ALL_FW_TYPES: FrameworkType[] = [
  "PEST", "FIVE_FORCES", "INTERNAL_ANALYSIS", "VRIO",
  "THREE_C_PLUS_C", "SWOT", "CROSS_SWOT",
  "SEGMENTATION", "TARGETING", "POSITIONING", "CONCEPT_SHEET",
  "PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P",
  "FOUR_C_SEVEN_P", "BLUE_OCEAN", "EXPERIENCE_VALUE", "VALUE_ADD_METHODS",
  "KGI_KSF_KPI", "CUSTOMER_JOURNEY",
  "CRM_OVERVIEW", "CRM_ANALYSIS",
];

export default async function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch project info and raw data in parallel
  const [projectResult, rawDataResult] = await Promise.allSettled([
    getProject(id),
    listRawData(id),
  ]);

  const project =
    projectResult.status === "fulfilled" ? projectResult.value : null;
  const rawDataList =
    rawDataResult.status === "fulfilled" ? rawDataResult.value : [];

  const staleCount = rawDataList.filter((r) => !r.isFresh).length;
  const hasStaleness = staleCount > 0;

  // 鮮度切れ種類を特定し、影響するフレームワークのみ警告対象に
  const staleTypes = new Set<RawDataType>(
    rawDataList.filter((r) => !r.isFresh).map((r) => r.type as RawDataType)
  );
  const staleAffectedFrameworks = getAffectedFrameworks(staleTypes);

  // Fetch all framework entries in parallel (catch 404s → null)
  const entries = await Promise.allSettled(
    ALL_FW_TYPES.map((type) => getFrameworkEntry(id, type))
  );

  const nodes = ALL_FW_TYPES.map((type, i) => {
    const result = entries[i];
    const entry =
      result?.status === "fulfilled" ? result.value : null;
    return {
      id: type,
      status: entry
        ? staleAffectedFrameworks.has(type)
          ? ("stale_warning" as const)
          : ("filled" as const)
        : ("empty" as const),
      version: entry?.version,
    };
  });

  const filledCount = nodes.filter((n) => n.status !== "empty").length;

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumb + header */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:underline">
              プロジェクト一覧
            </Link>{" "}
            /{" "}
            <Link href={`/projects/${id}`} className="hover:underline">
              {project?.name ?? "プロジェクト"}
            </Link>{" "}
            /
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">依存グラフ</h1>
            <Button asChild variant="outline">
              <Link href={`/projects/${id}`}>ダッシュボードに戻る</Link>
            </Button>
          </div>
        </div>

        {/* Freshness warning banner */}
        {hasStaleness && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <span aria-hidden="true">⚠</span>
            <span>
              {staleCount}件の生データが期限切れです
              →
              フレームワークノードに警告バッジを表示しています
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{filledCount}</strong> /{" "}
            {ALL_FW_TYPES.length} フレームワーク入力済み
          </span>
          {hasStaleness && (
            <span className="text-yellow-700">
              <strong>{staleCount}</strong> 件の生データが期限切れ
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-3.5 w-10 rounded border border-dashed border-gray-400 bg-gray-200"
              aria-hidden="true"
            />
            <span>未入力</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-3.5 w-10 rounded border border-green-600 bg-green-200"
              aria-hidden="true"
            />
            <span>入力済み</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-3.5 w-10 rounded border border-yellow-500 bg-yellow-200"
              aria-hidden="true"
            />
            <span>⚠ 鮮度警告あり</span>
          </div>
        </div>

        {/* Graph */}
        <DependencyGraph nodes={nodes} projectId={id} />

        <p className="mt-3 text-xs text-muted-foreground">
          ノードをクリックするとフレームワーク詳細ページに遷移します。
        </p>
      </div>
    </div>
  );
}
