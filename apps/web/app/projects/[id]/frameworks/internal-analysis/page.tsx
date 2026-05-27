"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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

type SwFlag = "strength" | "weakness" | "neutral";

const INTERNAL_ROWS: RowDef[] = [
  {
    id: "customer",
    label: "顧客",
    description: "既に獲得している顧客の状況（認知度、評判、入込客数、リピート率、属性）",
    rawDataTypes: ["CUSTOMER_RESEARCH", "SALES_DATA"],
  },
  {
    id: "product",
    label: "商品・サービス",
    description: "提供するモノやサービスの状況（魅力、ブランド力、品質、付帯サービス）",
    rawDataTypes: ["SALES_DATA", "COMPETITOR_INFO"],
  },
  {
    id: "human_org",
    label: "人材・組織",
    description: "組織体制、人材、ナレッジ（体制、人材、情報発信力、ナレッジ）",
    rawDataTypes: [],
  },
  {
    id: "finance",
    label: "財務",
    description: "財源、コスト構造、収益性（財源、自主収入、コスト構造）",
    rawDataTypes: ["FINANCIAL_DATA"],
  },
];

const SW_LABELS: Record<SwFlag, string> = {
  strength: "強み (S)",
  weakness: "弱み (W)",
  neutral: "中立 (N)",
};

const SW_CLASSES: Record<SwFlag, string> = {
  strength: "bg-blue-100 text-blue-800",
  weakness: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-700",
};

export default function InternalAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [tableData, setTableData] = useState<Record<string, RowData>>({});
  const [swFlags, setSwFlags] = useState<Record<string, SwFlag>>({});
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "INTERNAL_ANALYSIS"),
          listLinks(id, "INTERNAL_ANALYSIS"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as Record<string, unknown>;
        const { _swFlags, ...tableRows } = rawData as {
          _swFlags?: Record<string, SwFlag>;
          [key: string]: unknown;
        };
        setTableData(tableRows as Record<string, RowData>);
        setSwFlags(_swFlags ?? {});
      } catch {
        // Entry may not exist yet
        setTableData({});
        setSwFlags({});
      }
    }
    load();
  }, [id]);

  function buildSavePayload(): Record<string, unknown> {
    return {
      ...(tableData as Record<string, unknown>),
      _swFlags: swFlags,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "INTERNAL_ANALYSIS", {
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
      const newVersion = await createFrameworkVersion(id, "INTERNAL_ANALYSIS", {
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

  function getSwFlag(rowId: string): SwFlag {
    return swFlags[rowId] ?? "neutral";
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 内部環境分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">内部環境分析</h1>
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
            {/* S/W/N summary badges */}
            <div className="flex flex-wrap gap-3">
              {INTERNAL_ROWS.map((row) => {
                const flag = getSwFlag(row.id);
                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{row.label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ${SW_CLASSES[flag]}`}
                    >
                      {SW_LABELS[flag]}
                    </span>
                  </div>
                );
              })}
            </div>

            <TwoColumnTable
              rows={INTERNAL_ROWS}
              data={tableData}
              onChange={setTableData}
              projectId={id}
            />

            {/* S/W/N selectors per row */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">強み・弱み評価</h2>
              <p className="text-xs text-muted-foreground">
                各観点を Strength（強み）/ Weakness（弱み）/ Neutral（中立）で評価してください。SWOT分析の S / W の材料となります。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERNAL_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {row.description}
                      </p>
                    </div>
                    <Select
                      value={getSwFlag(row.id)}
                      onValueChange={(val) =>
                        setSwFlags((prev) => ({
                          ...prev,
                          [row.id]: val as SwFlag,
                        }))
                      }
                    >
                      <SelectTrigger className="w-28 h-8 text-xs shrink-0 ml-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">強み (S)</SelectItem>
                        <SelectItem value="weakness">弱み (W)</SelectItem>
                        <SelectItem value="neutral">中立 (N)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw data linker per sub-element */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {INTERNAL_ROWS.map((row) => (
                <div key={row.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{row.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="INTERNAL_ANALYSIS"
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
            <UpstreamPanel frameworkType="INTERNAL_ANALYSIS" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
