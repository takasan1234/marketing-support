"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
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

type PlaceData = {
  selectedChannels: string[];
  channelMix: string;
  primaryChannel: string;
  channelNotes: Record<string, string>;
  distributionStrategy: string;
};

const DEFAULT_PLACE_DATA: PlaceData = {
  selectedChannels: [],
  channelMix: "",
  primaryChannel: "",
  channelNotes: {},
  distributionStrategy: "",
};

type ChannelDef = {
  id: string;
  label: string;
  type: "デジタル" | "リアル" | "B2B";
  description: string;
};

const CHANNEL_DEFS: ChannelDef[] = [
  {
    id: "direct_online",
    label: "直販（オンライン）",
    type: "デジタル",
    description: "自社ECサイト・LP経由の直接販売",
  },
  {
    id: "direct_offline",
    label: "直販（オフライン）",
    type: "リアル",
    description: "直営店・ポップアップ・展示会での直接販売",
  },
  {
    id: "agency_wholesale",
    label: "代理店・卸",
    type: "リアル",
    description: "代理店・卸売業者を経由した間接販売",
  },
  {
    id: "reseller",
    label: "リセラー",
    type: "リアル",
    description: "再販業者・VARを通じた販売",
  },
  {
    id: "ec_mall",
    label: "ECモール",
    type: "デジタル",
    description: "Amazon・楽天・Yahoo!ショッピング等のモール",
  },
  {
    id: "sns_sales",
    label: "SNS販売",
    type: "デジタル",
    description: "Instagram・TikTokショップ・LINEを通じた販売",
  },
  {
    id: "b2b_direct",
    label: "B2B直接",
    type: "B2B",
    description: "法人顧客への直接営業・テレセールス",
  },
];

const TYPE_COLORS: Record<ChannelDef["type"], string> = {
  デジタル: "bg-blue-100 text-blue-700",
  リアル: "bg-green-100 text-green-700",
  B2B: "bg-orange-100 text-orange-700",
};

const SUB_ELEMENTS = [
  { id: "channels", label: "採用チャネル" },
  { id: "mix", label: "チャネルミックス・主力チャネル" },
] as const;

export default function Place4PPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [placeData, setPlaceData] = useState<PlaceData>(DEFAULT_PLACE_DATA);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "PLACE_4P"),
          listLinks(id, "PLACE_4P"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const raw = fetchedEntry.data as Partial<PlaceData>;
        setPlaceData({
          selectedChannels: raw.selectedChannels ?? [],
          channelMix: raw.channelMix ?? "",
          primaryChannel: raw.primaryChannel ?? "",
          channelNotes: raw.channelNotes ?? {},
          distributionStrategy: raw.distributionStrategy ?? "",
        });
      } catch {
        setPlaceData(DEFAULT_PLACE_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "PLACE_4P", {
        data: placeData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "PLACE_4P", {
        data: placeData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function toggleChannel(channelId: string) {
    const current = placeData.selectedChannels;
    const next = current.includes(channelId)
      ? current.filter((c) => c !== channelId)
      : [...current, channelId];
    setPlaceData((prev) => ({ ...prev, selectedChannels: next }));
  }

  function updateChannelNote(channelId: string, note: string) {
    setPlaceData((prev) => ({
      ...prev,
      channelNotes: { ...prev.channelNotes, [channelId]: note },
    }));
  }

  function getLinksForSubElement(subElementId: string): LinkDto[] {
    return links.filter((l) => l.subElementId === subElementId);
  }

  const selectedChannelDefs = CHANNEL_DEFS.filter((c) =>
    placeData.selectedChannels.includes(c.id)
  );

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
          {" / Place戦略（4P）"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Place戦略（4P）</h1>
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

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Channel selection */}
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-base font-semibold mb-1">販路・チャネル選択</h2>
              <p className="text-xs text-muted-foreground mb-4">
                採用するチャネルにチェックを入れてください（複数選択可）。
              </p>
              <div className="flex flex-col gap-3">
                {CHANNEL_DEFS.map((channel) => {
                  const isSelected = placeData.selectedChannels.includes(
                    channel.id
                  );
                  return (
                    <label
                      key={channel.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleChannel(channel.id)}
                        className="mt-0.5 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium">
                            {channel.label}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[channel.type]}`}
                          >
                            {channel.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes for selected channels */}
            {selectedChannelDefs.length > 0 && (
              <div className="border rounded-lg p-4 bg-card">
                <h2 className="text-base font-semibold mb-3">
                  採用チャネルのメモ・詳細
                </h2>
                <div className="flex flex-col gap-3">
                  {selectedChannelDefs.map((channel) => (
                    <div key={channel.id} className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">
                        {channel.label}
                      </label>
                      <Input
                        value={placeData.channelNotes[channel.id] ?? ""}
                        onChange={(e) =>
                          updateChannelNote(channel.id, e.target.value)
                        }
                        placeholder="利用理由・運用方針・想定売上比率などを記述"
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Channel mix & primary channel */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-4">チャネルミックス設計</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">主力チャネル</label>
                  <Input
                    value={placeData.primaryChannel}
                    onChange={(e) =>
                      setPlaceData((prev) => ({
                        ...prev,
                        primaryChannel: e.target.value,
                      }))
                    }
                    placeholder="例：直販（オンライン）"
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    チャネルミックスの説明
                  </label>
                  <Textarea
                    value={placeData.channelMix}
                    onChange={(e) =>
                      setPlaceData((prev) => ({
                        ...prev,
                        channelMix: e.target.value,
                      }))
                    }
                    placeholder="例：直販オンライン 60%・ECモール 30%・B2B直接 10%\n各チャネルの役割分担・シェア配分を記述してください。"
                    className="min-h-[80px] resize-none text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Distribution strategy */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-2">流通戦略・データ取得方針</h2>
              <Textarea
                value={placeData.distributionStrategy}
                onChange={(e) =>
                  setPlaceData((prev) => ({
                    ...prev,
                    distributionStrategy: e.target.value,
                  }))
                }
                placeholder="チャネル管理方針・在庫管理・データ収集戦略・CRM連携計画などを記述してください。"
                className="min-h-[100px] resize-none text-sm"
                rows={4}
              />
            </div>

            {/* Raw data linker */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {SUB_ELEMENTS.map((sub) => (
                <div key={sub.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{sub.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="PLACE_4P"
                    subElementId={sub.id}
                    existingLinks={getLinksForSubElement(sub.id)}
                    onLinksChange={(updated) => {
                      const otherLinks = links.filter(
                        (l) => l.subElementId !== sub.id
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
            <UpstreamPanel frameworkType="PLACE_4P" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
