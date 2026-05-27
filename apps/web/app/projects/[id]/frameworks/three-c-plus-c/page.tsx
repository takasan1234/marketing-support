"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { TwoColumnTable, type RowDef, type RowData } from "@/components/frameworks/TwoColumnTable";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import { RawDataLinker } from "@/components/frameworks/shared/RawDataLinker";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  listLinks,
  type FrameworkEntryDto,
  type LinkDto,
} from "@/lib/api-client";

const THREE_C_ROWS: RowDef[] = [
  {
    id: "company",
    label: "Company（自社）",
    description: "自社の動向、強み、課題（整理軸分析より）",
    rawDataTypes: ["FINANCIAL_DATA", "SALES_DATA"],
  },
  {
    id: "customer",
    label: "Customer（顧客）",
    description: "顧客の動向、ニーズ（PEST分析・整理軸分析より）",
    rawDataTypes: ["MARKET_STATS", "CUSTOMER_RESEARCH"],
  },
  {
    id: "competitor",
    label: "Competitor（競合）",
    description: "競合の動向、競争状況（5Forces分析より）",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT"],
  },
  {
    id: "co_operator",
    label: "Co-Operator（協業者）",
    description: "パートナー、サプライヤー、関連業者の動向",
    rawDataTypes: ["PARTNER_HEARING", "EXPERT_HEARING"],
  },
];

type SaveData = {
  _tableData?: Record<string, RowData>;
  _ksf?: string;
  [key: string]: unknown;
};

export default function ThreeCPlusCPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [tableData, setTableData] = useState<Record<string, RowData>>({});
  const [ksfText, setKsfText] = useState<string>("");
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "THREE_C_PLUS_C"),
          listLinks(id, "THREE_C_PLUS_C"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as SaveData;
        const { _tableData, _ksf, ...rest } = rawData;
        // Support both new format (_tableData) and legacy format (direct row keys)
        if (_tableData) {
          setTableData(_tableData);
        } else {
          // Fallback: treat all non-underscore keys as table data
          const legacyTable: Record<string, RowData> = {};
          for (const key of Object.keys(rest)) {
            if (!key.startsWith("_")) {
              legacyTable[key] = rest[key] as RowData;
            }
          }
          setTableData(legacyTable);
        }
        setKsfText(typeof _ksf === "string" ? _ksf : "");
      } catch {
        // Entry may not exist yet
        setTableData({});
        setKsfText("");
      }
    }
    load();
  }, [id]);

  function buildSavePayload(): Record<string, unknown> {
    return {
      _tableData: tableData as Record<string, unknown>,
      _ksf: ksfText,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "THREE_C_PLUS_C", {
        data: buildSavePayload(),
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
      const newVersion = await createFrameworkVersion(id, "THREE_C_PLUS_C", {
        data: buildSavePayload(),
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function getLinksForSubElement(subElementId: string): LinkDto[] {
    return links.filter((l) => l.subElementId === subElementId);
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 3C+C分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">3C+C分析</h1>
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

        {/* Main layout: table + right panel */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <TwoColumnTable
              rows={THREE_C_ROWS}
              data={tableData}
              onChange={setTableData}
              projectId={id}
            />

            {/* KSF section */}
            <div className="border rounded-lg p-5 flex flex-col gap-3">
              <div>
                <h2 className="text-base font-semibold">KSF（重要成功要因）</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  上記の3C+C分析から導出された重要成功要因（Key Success Factors）を記入してください。KGI/KSF/KPIフレームワークの入力となります。
                </p>
              </div>
              <Textarea
                value={ksfText}
                onChange={(e) => setKsfText(e.target.value)}
                placeholder={"例：\n- 顧客リピート率の向上\n- 競合との差別化ポイントの強化\n- パートナーとの連携強化"}
                className="min-h-[140px] text-sm"
                rows={6}
              />
            </div>

            {/* Raw data linker per sub-element */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {THREE_C_ROWS.map((row) => (
                <div key={row.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{row.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="THREE_C_PLUS_C"
                    subElementId={row.id}
                    existingLinks={getLinksForSubElement(row.id)}
                    onLinksChange={(updated) => {
                      const otherLinks = links.filter(
                        (l) => l.subElementId !== row.id
                      );
                      setLinks([...otherLinks, ...updated]);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="THREE_C_PLUS_C" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
