"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import type { LinkDto, RawDataDto, FrameworkType } from "@/lib/api-client";
import { listRawData, addLink, deleteLink } from "@/lib/api-client";
import { DataReferenceLink } from "./DataReferenceLink";

type RawDataLinkerProps = {
  projectId: string;
  frameworkType: FrameworkType;
  subElementId: string;
  existingLinks: LinkDto[];
  onLinksChange?: (links: LinkDto[]) => void;
};

export function RawDataLinker({
  projectId,
  frameworkType,
  subElementId,
  existingLinks,
  onLinksChange,
}: RawDataLinkerProps) {
  const [links, setLinks] = useState<LinkDto[]>(existingLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawDataList, setRawDataList] = useState<RawDataDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLinks(existingLinks);
  }, [existingLinks]);

  async function openModal() {
    setIsModalOpen(true);
    setIsLoading(true);
    try {
      const data = await listRawData(projectId);
      setRawDataList(data);
    } catch {
      setRawDataList([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddLink(rawDataId: string) {
    try {
      const newLink = await addLink(projectId, frameworkType, {
        rawDataId,
        subElementId,
      });
      const updated = [...links, newLink];
      setLinks(updated);
      onLinksChange?.(updated);
      setIsModalOpen(false);
    } catch {
      // silently ignore
    }
  }

  async function handleDeleteLink(linkId: string) {
    try {
      await deleteLink(projectId, frameworkType, linkId);
      const updated = links.filter((l) => l.id !== linkId);
      setLinks(updated);
      onLinksChange?.(updated);
    } catch {
      // silently ignore
    }
  }

  const linkedRawDataIds = new Set(links.map((l) => l.rawDataId));

  return (
    <div className="flex flex-col gap-2">
      {links.length > 0 && (
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2 group">
              <DataReferenceLink
                projectId={projectId}
                rawDataId={link.rawDataId}
                title={`生データ #${link.rawDataId.slice(0, 8)}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-xs opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                onClick={() => handleDeleteLink(link.id)}
              >
                削除
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start text-xs h-7"
        onClick={openModal}
      >
        + 生データを紐付け
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>生データを選択して紐付け</DialogTitle>
            <DialogDescription>
              このサブ要素（{subElementId}）に関連する生データを選択してください
            </DialogDescription>
          </DialogHeader>
          <Separator />
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">読み込み中...</p>
          ) : rawDataList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              生データがありません
            </p>
          ) : (
            <ul className="flex flex-col gap-2 mt-2">
              {rawDataList.map((rd) => {
                const alreadyLinked = linkedRawDataIds.has(rd.id);
                return (
                  <li
                    key={rd.id}
                    className="flex items-center justify-between gap-3 p-2 rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rd.title}</p>
                      <p className="text-xs text-muted-foreground">{rd.type}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={alreadyLinked ? "secondary" : "default"}
                      disabled={alreadyLinked}
                      onClick={() => handleAddLink(rd.id)}
                    >
                      {alreadyLinked ? "紐付け済み" : "追加"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
