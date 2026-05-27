"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
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

const PEST_ROWS: RowDef[] = [
  {
    id: "politics",
    label: "Politics（政治）",
    description: "法規制、政策、政府の動向",
    rawDataTypes: ["NEWS", "INDUSTRY_REPORT"],
  },
  {
    id: "economy",
    label: "Economy（経済）",
    description: "景気動向、金利、為替、市場規模",
    rawDataTypes: ["MARKET_STATS", "NEWS"],
  },
  {
    id: "society",
    label: "Society（社会）",
    description: "人口動態、ライフスタイル、価値観",
    rawDataTypes: ["INDUSTRY_REPORT", "SNS_ANALYTICS", "CUSTOMER_RESEARCH"],
  },
  {
    id: "technology",
    label: "Technology（技術）",
    description: "技術革新、デジタル化、特許",
    rawDataTypes: ["INDUSTRY_REPORT", "NEWS"],
  },
];

export default function PestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [tableData, setTableData] = useState<Record<string, RowData>>({});
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "PEST"),
          listLinks(id, "PEST"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as Record<string, RowData>;
        setTableData(rawData ?? {});
      } catch {
        // Entry may not exist yet
        setTableData({});
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "PEST", {
        data: tableData as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "PEST", {
        data: tableData as Record<string, unknown>,
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
          {" / PEST分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">PEST分析</h1>
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
              rows={PEST_ROWS}
              data={tableData}
              onChange={setTableData}
              projectId={id}
            />

            {/* Raw data linker per sub-element */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {PEST_ROWS.map((row) => (
                <div key={row.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{row.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="PEST"
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
            <UpstreamPanel frameworkType="PEST" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
