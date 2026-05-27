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

type StrengthLevel = "weak" | "medium" | "strong";

const FIVE_FORCES_ROWS: RowDef[] = [
  {
    id: "rivalry",
    label: "競合との競争",
    description: "既存競合との競争の激しさ",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT", "MARKET_STATS"],
  },
  {
    id: "new_entrants",
    label: "新規参入者の脅威",
    description: "新しい競合の参入しやすさ",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT", "MARKET_STATS"],
  },
  {
    id: "substitutes",
    label: "代替品の脅威",
    description: "別の解決手段に置き換えられるリスク",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT", "MARKET_STATS"],
  },
  {
    id: "supplier_power",
    label: "売り手の交渉力",
    description: "仕入先・サプライヤーの力",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT", "MARKET_STATS"],
  },
  {
    id: "buyer_power",
    label: "買い手の交渉力",
    description: "顧客の価格交渉力",
    rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT", "MARKET_STATS"],
  },
];

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  weak: "弱",
  medium: "中",
  strong: "強",
};

const STRENGTH_CLASSES: Record<StrengthLevel, string> = {
  weak: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  strong: "bg-red-100 text-red-800",
};

export default function FiveForcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [tableData, setTableData] = useState<Record<string, RowData>>({});
  const [strengthData, setStrengthData] = useState<Record<string, StrengthLevel>>({});
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "FIVE_FORCES"),
          listLinks(id, "FIVE_FORCES"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as Record<string, unknown>;
        const { _strength, ...tableRows } = rawData as {
          _strength?: Record<string, StrengthLevel>;
          [key: string]: unknown;
        };
        setTableData(tableRows as Record<string, RowData>);
        setStrengthData(_strength ?? {});
      } catch {
        // Entry may not exist yet
        setTableData({});
        setStrengthData({});
      }
    }
    load();
  }, [id]);

  function buildSavePayload(): Record<string, unknown> {
    return {
      ...(tableData as Record<string, unknown>),
      _strength: strengthData,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "FIVE_FORCES", {
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
      const newVersion = await createFrameworkVersion(id, "FIVE_FORCES", {
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

  function getStrength(rowId: string): StrengthLevel {
    return strengthData[rowId] ?? "medium";
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 5Forces分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">5Forces分析</h1>
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
            {/* Strength summary bar */}
            <div className="flex flex-wrap gap-3">
              {FIVE_FORCES_ROWS.map((row) => {
                const level = getStrength(row.id);
                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{row.label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ${STRENGTH_CLASSES[level]}`}
                    >
                      {STRENGTH_LABELS[level]}
                    </span>
                  </div>
                );
              })}
            </div>

            <TwoColumnTable
              rows={FIVE_FORCES_ROWS}
              data={tableData}
              onChange={setTableData}
              projectId={id}
            />

            {/* Strength selectors per row */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">圧力の強さ評価</h2>
              <p className="text-xs text-muted-foreground">
                各要因が自社事業に与える圧力の強さを3段階で評価してください。（弱：影響小 / 中：中程度 / 強：影響大）
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FIVE_FORCES_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.description}</p>
                    </div>
                    <Select
                      value={getStrength(row.id)}
                      onValueChange={(val) =>
                        setStrengthData((prev) => ({
                          ...prev,
                          [row.id]: val as StrengthLevel,
                        }))
                      }
                    >
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weak">弱</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="strong">強</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw data linker per sub-element */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {FIVE_FORCES_ROWS.map((row) => (
                <div key={row.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{row.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="FIVE_FORCES"
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
            <UpstreamPanel frameworkType="FIVE_FORCES" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
