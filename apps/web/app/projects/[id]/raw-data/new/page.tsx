"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RawDataForm } from "@/components/raw-data/RawDataForm";
import { createRawData, type RawDataType } from "@/lib/api-client";

export default function NewRawDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  async function handleSubmit(data: {
    type: RawDataType;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceNote?: string;
    collectedAt: string;
    tags: string[];
  }) {
    await createRawData(id, data);
    router.push(`/projects/${id}/raw-data`);
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
          {" / 新規追加"}
        </p>
        <h1 className="text-2xl font-bold mb-6">生データ 新規追加</h1>
        <RawDataForm
          projectId={id}
          onSubmit={handleSubmit}
          submitLabel="追加する"
        />
      </div>
    </div>
  );
}
