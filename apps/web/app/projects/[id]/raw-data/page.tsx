import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FreshnessIndicator } from "@/components/frameworks/shared/FreshnessIndicator";
import { listRawData, type RawDataType } from "@/lib/api-client";
import { RAW_DATA_TYPE_LABELS } from "@/lib/frameworks/dependencies";

const RAW_DATA_TYPES: RawDataType[] = [
  "MARKET_STATS",
  "INDUSTRY_REPORT",
  "NEWS",
  "CUSTOMER_RESEARCH",
  "SNS_ANALYTICS",
  "SEARCH_TRENDS",
  "LOCATION_DATA",
  "SALES_DATA",
  "COMPETITOR_INFO",
  "PARTNER_HEARING",
  "FINANCIAL_DATA",
  "EXPERT_HEARING",
];

export default async function RawDataListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;

  const selectedType = RAW_DATA_TYPES.includes(type as RawDataType)
    ? (type as RawDataType)
    : undefined;

  let rawDataList: Awaited<ReturnType<typeof listRawData>> = [];
  try {
    rawDataList = await listRawData(id, selectedType);
  } catch {
    // API not running
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>
          {" / 生データ管理"}
        </p>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">生データ管理</h1>
          <Button asChild>
            <Link href={`/projects/${id}/raw-data/new`}>新規追加</Link>
          </Button>
        </div>

        {/* Filter by type (client-side form using GET params) */}
        <form className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium">種類でフィルタ:</label>
          <div className="w-48">
            <Select name="type" defaultValue={selectedType ?? "all"}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {RAW_DATA_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {RAW_DATA_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="outline" size="sm">
            絞り込み
          </Button>
          {selectedType && (
            <Link
              href={`/projects/${id}/raw-data`}
              className="text-sm text-muted-foreground underline"
            >
              クリア
            </Link>
          )}
        </form>

        {rawDataList.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>生データがありません。</p>
            <p className="mt-2">
              <Link
                href={`/projects/${id}/raw-data/new`}
                className="underline"
              >
                最初の生データを追加する
              </Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rawDataList.map((rd) => (
              <Link
                key={rd.id}
                href={`/projects/${id}/raw-data/${rd.id}`}
                className="block border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{rd.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {RAW_DATA_TYPE_LABELS[rd.type] ?? rd.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {rd.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      収集日:{" "}
                      {new Date(rd.collectedAt).toLocaleDateString("ja-JP")}
                      {rd.expiresAt && (
                        <>
                          {" / "}有効期限:{" "}
                          {new Date(rd.expiresAt).toLocaleDateString("ja-JP")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <FreshnessIndicator
                      expiresAt={rd.expiresAt}
                      collectedAt={rd.collectedAt}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
