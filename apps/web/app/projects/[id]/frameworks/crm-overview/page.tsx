"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

const FW_TYPE = "CRM_OVERVIEW" as const;

type CrmOverviewData = {
  mission: string;
  currentCrmTools: string;
  dataAssets: string;
  customerSegmentStrategy: string;
  retentionGoals: string;
  ltv: string;
  notes: string;
};

const INITIAL: CrmOverviewData = {
  mission: "",
  currentCrmTools: "",
  dataAssets: "",
  customerSegmentStrategy: "",
  retentionGoals: "",
  ltv: "",
  notes: "",
};

export default function CrmOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [data, setData] = useState<CrmOverviewData>(INITIAL);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, FW_TYPE);
        setEntry(fetched);
        setData((fetched.data as CrmOverviewData) ?? INITIAL);
      } catch {
        setData(INITIAL);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, FW_TYPE, {
        data: data as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, FW_TYPE, {
        data: data as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function field(
    label: string,
    key: keyof CrmOverviewData,
    placeholder: string
  ) {
    return (
      <div>
        <label className="text-sm font-medium mb-1 block">{label}</label>
        <Textarea
          value={data[key]}
          onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          className="text-sm"
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / CRM概要"}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">CRM概要</h1>
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

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {field("CRM ミッション・目的", "mission", "CRM活動の目的と目指す状態を記述...")}
            {field("現在利用中のCRMツール", "currentCrmTools", "Salesforce, HubSpot 等...")}
            {field("顧客データ資産", "dataAssets", "保有している顧客データの種類・件数・品質...")}
            {field("顧客セグメント戦略", "customerSegmentStrategy", "RFM分析によるセグメント分類など...")}
            {field("顧客維持・解約防止目標", "retentionGoals", "目標解約率、NPS等...")}
            {field("LTV（顧客生涯価値）目標", "ltv", "現状LTVと目標LTV、改善施策...")}
            {field("備考", "notes", "その他メモ...")}
          </div>

          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType={FW_TYPE} projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
