"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  JourneyMap,
  type JourneyMapData,
  type JourneyStage,
} from "@/components/frameworks/JourneyMap";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

const AIDMA_STAGES: JourneyStage[] = [
  "Attention",
  "Interest",
  "Desire",
  "Memory",
  "Action",
].map((name) => ({
  id: globalThis.crypto.randomUUID(),
  name,
  touchpoints: [""],
  emotions: "",
  emotionScore: 0,
  painPoints: [""],
  opportunities: [""],
  note: "",
}));

const DEFAULT_DATA: JourneyMapData = {
  persona: "",
  stages: AIDMA_STAGES,
  model: "aidma",
};

export default function CustomerJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyMapData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "CUSTOMER_JOURNEY");
        setEntry(fetched);
        const rawData = fetched.data as JourneyMapData;
        if (rawData?.stages) {
          setJourneyData(rawData);
        }
      } catch {
        // Entry may not exist yet
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "CUSTOMER_JOURNEY", {
        data: journeyData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "CUSTOMER_JOURNEY", {
        data: journeyData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
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
          {" / カスタマージャーニー"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">カスタマージャーニー</h1>
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
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              ターゲット顧客の認知から購買・共有までの体験を可視化します。
              心理モデル（AIDMA / AISAS）を選択すると各ステージが自動設定されます。
            </p>
            <JourneyMap data={journeyData} onChange={setJourneyData} />
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="CUSTOMER_JOURNEY" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
