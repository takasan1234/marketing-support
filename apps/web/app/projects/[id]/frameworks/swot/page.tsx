"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  MatrixTwoByTwo,
  type MatrixData,
} from "@/components/frameworks/MatrixTwoByTwo";
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

const EMPTY_MATRIX: MatrixData = {
  strengths: { items: [], summary: "" },
  weaknesses: { items: [], summary: "" },
  opportunities: { items: [], summary: "" },
  threats: { items: [], summary: "" },
};

const SWOT_CELLS: { id: keyof MatrixData; label: string }[] = [
  { id: "strengths", label: "Strengths（強み）" },
  { id: "weaknesses", label: "Weaknesses（弱み）" },
  { id: "opportunities", label: "Opportunities（機会）" },
  { id: "threats", label: "Threats（脅威）" },
];

export default function SwotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData>(EMPTY_MATRIX);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "SWOT"),
          listLinks(id, "SWOT"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const rawData = fetchedEntry.data as unknown as MatrixData;
        setMatrixData(rawData ?? EMPTY_MATRIX);
      } catch {
        setMatrixData(EMPTY_MATRIX);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "SWOT", {
        data: matrixData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "SWOT", {
        data: matrixData as unknown as Record<string, unknown>,
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
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>
          {" / SWOT分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">SWOT分析</h1>
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

        {/* Main layout: matrix + right panel */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <MatrixTwoByTwo
              data={matrixData}
              onChange={setMatrixData}
              colorScheme="swot"
              title="SWOT マトリックス"
            />

            {/* Raw data linker per sub-element */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {SWOT_CELLS.map((cell) => (
                <div key={cell.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{cell.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="SWOT"
                    subElementId={cell.id}
                    existingLinks={getLinksForSubElement(cell.id)}
                    onLinksChange={(updated) => {
                      const otherLinks = links.filter(
                        (l) => l.subElementId !== cell.id
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
            <UpstreamPanel frameworkType="SWOT" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
