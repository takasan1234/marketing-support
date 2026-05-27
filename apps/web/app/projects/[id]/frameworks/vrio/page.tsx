"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  VRIOFlowchart,
  type VRIOResource,
} from "@/components/frameworks/VRIOFlowchart";
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

type VRIOData = {
  resources: VRIOResource[];
};

function isVRIOData(data: Record<string, unknown>): data is VRIOData {
  return Array.isArray((data as VRIOData).resources);
}

export default function VRIOPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [resources, setResources] = useState<VRIOResource[]>([]);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "VRIO"),
          listLinks(id, "VRIO"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        if (isVRIOData(fetchedEntry.data)) {
          setResources(fetchedEntry.data.resources);
        }
      } catch {
        // Entry may not exist yet
        setResources([]);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "VRIO", {
        data: { resources } as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "VRIO", {
        data: { resources } as Record<string, unknown>,
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
          {" / VRIO分析"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">VRIO分析</h1>
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

        {/* Main layout: flowchart + right panel */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <VRIOFlowchart resources={resources} onChange={setResources} />

            {/* Raw data linker (shared for the whole VRIO entry) */}
            <div className="border rounded-lg p-4">
              <h2 className="text-base font-semibold mb-3">生データ紐付け</h2>
              <RawDataLinker
                projectId={id}
                frameworkType="VRIO"
                subElementId="resources"
                existingLinks={links}
                onLinksChange={setLinks}
              />
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="VRIO" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
