import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { getProject, getFrameworkEntry, listRawData } from "@/lib/api-client";
import type { FrameworkType, RawDataType } from "@/lib/api-client";
import { getAffectedFrameworks } from "@/lib/frameworks/dependencies";

const FRAMEWORK_LABELS: Record<string, string> = {
  PEST: "PEST分析",
  FIVE_FORCES: "5Forces分析",
  INTERNAL_ANALYSIS: "整理軸分析",
  VRIO: "VRIO分析",
  THREE_C_PLUS_C: "3C+C分析",
  SWOT: "SWOT分析",
  CROSS_SWOT: "クロスSWOT分析",
  SEGMENTATION: "セグメンテーション",
  TARGETING: "ターゲティング",
  POSITIONING: "ポジショニング",
  CONCEPT_SHEET: "戦略コンセプトシート",
  PRODUCT_4P: "Product（4P）",
  PRICE_4P: "Price（4P）",
  PLACE_4P: "Place（4P）",
  PROMOTION_4P: "Promotion（4P）",
  FOUR_C_SEVEN_P: "4C/7P検証",
  BLUE_OCEAN: "ブルーオーシャン戦略",
  EXPERIENCE_VALUE: "経験価値マーケティング",
  VALUE_ADD_METHODS: "高付加価値化7方法論",
  KGI_KSF_KPI: "KGI/KSF/KPI設定",
  CUSTOMER_JOURNEY: "カスタマージャーニー",
  CRM_OVERVIEW: "CRM概要",
  CRM_ANALYSIS: "CRM分析",
};

const FRAMEWORK_LAYER: Record<string, string> = {
  PEST: "Layer 1: 環境分析",
  FIVE_FORCES: "Layer 1: 環境分析",
  INTERNAL_ANALYSIS: "Layer 1: 環境分析",
  VRIO: "Layer 1: 環境分析",
  THREE_C_PLUS_C: "Layer 1+: 統合分析",
  SWOT: "Layer 1+: 統合分析",
  CROSS_SWOT: "Layer 1+: 統合分析",
  SEGMENTATION: "Layer 2: STP",
  TARGETING: "Layer 2: STP",
  POSITIONING: "Layer 2: STP",
  CONCEPT_SHEET: "Layer 2: 戦略立案",
  PRODUCT_4P: "Layer 3: 4P",
  PRICE_4P: "Layer 3: 4P",
  PLACE_4P: "Layer 3: 4P",
  PROMOTION_4P: "Layer 3: 4P",
  FOUR_C_SEVEN_P: "Layer 3: 検証",
  BLUE_OCEAN: "Layer 3: 戦略補完",
  EXPERIENCE_VALUE: "Layer 3: 戦略補完",
  VALUE_ADD_METHODS: "Layer 3: 戦略補完",
  KGI_KSF_KPI: "Layer 4: KPI管理",
  CUSTOMER_JOURNEY: "Layer 4: 顧客体験",
  CRM_OVERVIEW: "Layer 5: CRM",
  CRM_ANALYSIS: "Layer 5: CRM",
};

const ALL_FRAMEWORKS: FrameworkType[] = [
  "PEST", "FIVE_FORCES", "INTERNAL_ANALYSIS", "VRIO",
  "THREE_C_PLUS_C", "SWOT", "CROSS_SWOT",
  "SEGMENTATION", "TARGETING", "POSITIONING", "CONCEPT_SHEET",
  "PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P",
  "FOUR_C_SEVEN_P", "BLUE_OCEAN", "EXPERIENCE_VALUE", "VALUE_ADD_METHODS",
  "KGI_KSF_KPI", "CUSTOMER_JOURNEY",
  "CRM_OVERVIEW", "CRM_ANALYSIS",
];

export default async function ProjectDashboardPage({
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

  // 鮮度切れの生データ種類を特定し、影響するフレームワークを算出
  const staleTypes = new Set<RawDataType>(
    rawDataList.filter((r) => !r.isFresh).map((r) => r.type as RawDataType)
  );
  const staleAffectedFrameworks = getAffectedFrameworks(staleTypes);

  // Fetch all framework entries in parallel (catch 404s → null)
  const entries = await Promise.allSettled(
    ALL_FRAMEWORKS.map((type) => getFrameworkEntry(id, type))
  );

  // Build a set of filled framework types
  const filledFrameworks = new Set<string>();
  ALL_FRAMEWORKS.forEach((type, i) => {
    const result = entries[i];
    if (result?.status === "fulfilled") {
      filledFrameworks.add(type);
    }
  });

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Link href="/" className="hover:underline">
                  プロジェクト一覧
                </Link>{" "}
                /
              </p>
              <h1 className="text-2xl font-bold">
                {project?.name ?? "プロジェクト"}
              </h1>
              {project?.description && (
                <p className="text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/projects/${id}/graph`}>依存グラフ</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/projects/${id}/compare`}>バージョン比較</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/projects/${id}/raw-data`}>生データ管理</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Freshness warning banner */}
        {hasStaleness && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <span aria-hidden="true">⚠</span>
            <span>
              {staleCount}件の生データが期限切れです
              → 影響するフレームワークに警告バッジを表示しています
            </span>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">フレームワーク一覧</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ALL_FRAMEWORKS.map((fw) => {
            const isFilled = filledFrameworks.has(fw);
            // 鮮度切れ生データを実際に参照しているフレームワークのみ警告表示
            const showWarning = isFilled && staleAffectedFrameworks.has(fw as FrameworkType);

            return (
              <Link
                key={fw}
                href={`/projects/${id}/frameworks/${fw.toLowerCase().replace(/_/g, "-")}`}
                className="block"
              >
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        {FRAMEWORK_LABELS[fw]}
                      </CardTitle>
                      {showWarning && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-yellow-400 bg-yellow-50 text-yellow-700 text-xs"
                        >
                          ⚠
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {FRAMEWORK_LAYER[fw]}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
