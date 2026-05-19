"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  PositioningMap,
  type PositioningMapData,
} from "@/components/frameworks/PositioningMap";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

const DEFAULT_MAP_DATA: PositioningMapData = {
  xAxisLabel: "価格",
  xAxisLow: "安い",
  xAxisHigh: "高い",
  yAxisLabel: "本格度",
  yAxisLow: "手軽",
  yAxisHigh: "本格的",
  points: [
    {
      id: globalThis.crypto.randomUUID(),
      label: "自社",
      x: 30,
      y: 70,
      isOwnCompany: true,
    },
  ],
};

type PositioningData = {
  map: PositioningMapData;
  xAxisRationale: string;
  yAxisRationale: string;
  valueProposition: string;
};

const DEFAULT_DATA: PositioningData = {
  map: DEFAULT_MAP_DATA,
  xAxisRationale: "",
  yAxisRationale: "",
  valueProposition: "",
};

export default function PositioningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [posData, setPosData] = useState<PositioningData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "POSITIONING");
        setEntry(fetched);
        const raw = fetched.data as Partial<PositioningData>;
        setPosData({
          map: (raw.map as PositioningMapData | undefined) ?? DEFAULT_MAP_DATA,
          xAxisRationale: raw.xAxisRationale ?? "",
          yAxisRationale: raw.yAxisRationale ?? "",
          valueProposition: raw.valueProposition ?? "",
        });
      } catch {
        setPosData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "POSITIONING", {
        data: posData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "POSITIONING", {
        data: posData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function update(patch: Partial<PositioningData>) {
    setPosData((prev) => ({ ...prev, ...patch }));
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
          {" / ポジショニング"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">ポジショニング</h1>
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
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Axis rationale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  X 軸を採用する理由
                </label>
                <Textarea
                  value={posData.xAxisRationale}
                  onChange={(e) => update({ xAxisRationale: e.target.value })}
                  placeholder="例：顧客の購買決定で最も重視される要素であるため"
                  className="min-h-[80px] text-sm resize-none"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Y 軸を採用する理由
                </label>
                <Textarea
                  value={posData.yAxisRationale}
                  onChange={(e) => update({ yAxisRationale: e.target.value })}
                  placeholder="例：X 軸と相関が低く、差別化の軸として有効なため"
                  className="min-h-[80px] text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Positioning map */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">ポジショニングマップ</h2>
              <p className="text-xs text-muted-foreground">
                ヒント：相関性が低い 2 軸を選ぶことで、より意味のある差別化が見えやすくなります。
                マップをクリックして競合・自社を配置し、★ ボタンで狙うポジションを設定してください。
              </p>
              <PositioningMap
                data={posData.map}
                onChange={(map) => update({ map })}
              />
            </div>

            <Separator />

            {/* Value proposition */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">提供価値</h2>
              <p className="text-xs text-muted-foreground">
                ターゲットに対して、このポジションから何を提供するかを一文で表現してください。
              </p>
              <Textarea
                value={posData.valueProposition}
                onChange={(e) =>
                  update({ valueProposition: e.target.value })
                }
                placeholder="例：初心者でも本格的な大自然を低価格で楽しめる、唯一のガイド付きアウトドア体験"
                className="min-h-[100px] text-sm"
                rows={4}
              />
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="POSITIONING" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
