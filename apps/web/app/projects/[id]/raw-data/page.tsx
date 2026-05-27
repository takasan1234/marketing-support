import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { CollectDataHint } from "@/components/raw-data/CollectDataHint";
import { RawDataExplorer } from "@/components/raw-data/RawDataExplorer";
import { listRawData } from "@/lib/api-client";

export default async function RawDataListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let rawDataList: Awaited<ReturnType<typeof listRawData>> = [];
  try {
    rawDataList = await listRawData(id);
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

        <CollectDataHint projectId={id} />

        {rawDataList.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>生データがありません。</p>
            <p className="mt-2">
              上の「Claude Code で生データを収集」から収集するか、
              <Link
                href={`/projects/${id}/raw-data/new`}
                className="underline"
              >
                手動で追加
              </Link>
              できます。
            </p>
          </div>
        ) : (
          <RawDataExplorer projectId={id} items={rawDataList} />
        )}
      </div>
    </div>
  );
}
