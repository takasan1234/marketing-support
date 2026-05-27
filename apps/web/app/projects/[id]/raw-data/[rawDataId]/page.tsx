"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RawDataForm } from "@/components/raw-data/RawDataForm";
import {
  getRawData,
  updateRawData,
  deleteRawData,
  type RawDataDto,
  type RawDataType,
} from "@/lib/api-client";

export default function EditRawDataPage({
  params,
}: {
  params: Promise<{ id: string; rawDataId: string }>;
}) {
  const { id, rawDataId } = use(params);
  const router = useRouter();
  const [rawData, setRawData] = useState<RawDataDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getRawData(id, rawDataId)
      .then(setRawData)
      .catch(() => setLoadError("データの取得に失敗しました"))
      .finally(() => setIsLoading(false));
  }, [id, rawDataId]);

  async function handleSubmit(data: {
    type: RawDataType;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceNote?: string;
    collectedAt: string;
    tags: string[];
  }) {
    await updateRawData(id, rawDataId, data);
    router.push(`/projects/${id}/raw-data`);
  }

  async function handleDelete() {
    await deleteRawData(id, rawDataId);
    router.push(`/projects/${id}/raw-data`);
  }

  if (isLoading) {
    return (
      <div className="min-h-svh p-6">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (loadError || !rawData) {
    return (
      <div className="min-h-svh p-6">
        <p className="text-destructive">{loadError ?? "データが見つかりません"}</p>
        <Link
          href={`/projects/${id}/raw-data`}
          className="text-sm underline mt-2 block"
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>
          {" / "}
          <Link href={`/projects/${id}/raw-data`} className="hover:underline">
            生データ管理
          </Link>
          {" / 編集"}
        </p>
        <h1 className="text-2xl font-bold mb-6">生データ 編集</h1>
        <RawDataForm
          projectId={id}
          initialData={rawData}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          submitLabel="更新する"
        />
      </div>
    </div>
  );
}
