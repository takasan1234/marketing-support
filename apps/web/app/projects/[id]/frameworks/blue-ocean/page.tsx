"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { StrategyCanvas, type StrategyCanvasData } from "@/components/frameworks/StrategyCanvas";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type ErrcData = {
  eliminate: string[];
  reduce: string[];
  raise: string[];
  create: string[];
};

type BlueOceanData = {
  canvas: StrategyCanvasData;
  errc: ErrcData;
  summary: string;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CANVAS: StrategyCanvasData = {
  factors: ["価格", "機能数", "サポート", "ブランド", "体験"],
  curves: [
    {
      id: "self",
      name: "自社（現在）",
      values: [3, 4, 3, 3, 3],
      color: "#2563eb",
    },
    {
      id: "competitor",
      name: "競合",
      values: [4, 3, 2, 4, 2],
      color: "#dc2626",
    },
    {
      id: "target",
      name: "自社（目標）",
      isTarget: true,
      values: [2, 3, 2, 3, 5],
      color: "#16a34a",
    },
  ],
};

const DEFAULT_ERRC: ErrcData = {
  eliminate: [""],
  reduce: [""],
  raise: [""],
  create: [""],
};

const DEFAULT_DATA: BlueOceanData = {
  canvas: DEFAULT_CANVAS,
  errc: DEFAULT_ERRC,
  summary: "",
};

// ─── ERRC List Editor ─────────────────────────────────────────────────────────

type ErrcListEditorProps = {
  label: string;
  color: string;
  items: string[];
  onChange: (items: string[]) => void;
};

function ErrcListEditor({ label, color, items, onChange }: ErrcListEditorProps) {
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) {
      onChange([""]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold" style={{ color }}>
        {label}
      </h3>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder="内容を入力..."
              className="h-8 text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-muted-foreground hover:text-destructive text-sm shrink-0"
              title="削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addItem}
        className="self-start h-7 text-xs"
      >
        + 追加
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlueOceanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [formData, setFormData] = useState<BlueOceanData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "BLUE_OCEAN");
        setEntry(fetched);
        const raw = fetched.data as Partial<BlueOceanData>;
        setFormData({
          canvas: raw.canvas ?? DEFAULT_CANVAS,
          errc: raw.errc ?? DEFAULT_ERRC,
          summary: raw.summary ?? "",
        });
      } catch {
        setFormData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "BLUE_OCEAN", {
        data: formData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "BLUE_OCEAN", {
        data: formData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function updateErrc(key: keyof ErrcData, items: string[]) {
    setFormData((prev) => ({
      ...prev,
      errc: { ...prev.errc, [key]: items },
    }));
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / ブルーオーシャン戦略"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">ブルーオーシャン戦略</h1>
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
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Strategy Canvas */}
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">戦略キャンバス</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  業界の競争要素ごとに自社・競合のレベルをプロットし、差別化ポイントを視覚化します。
                </p>
              </div>
              <StrategyCanvas
                data={formData.canvas}
                onChange={(canvas) => setFormData((prev) => ({ ...prev, canvas }))}
              />
            </section>

            <Separator />

            {/* ERRC - 4 Actions */}
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">4 つのアクション（ERRC）</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  「取り除く・減らす」でコスト削減、「増やす・付け加える」で価値向上を同時に実現します。
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ErrcListEditor
                  label="取り除く（Eliminate）"
                  color="#dc2626"
                  items={formData.errc.eliminate}
                  onChange={(items) => updateErrc("eliminate", items)}
                />
                <ErrcListEditor
                  label="減らす（Reduce）"
                  color="#f59e0b"
                  items={formData.errc.reduce}
                  onChange={(items) => updateErrc("reduce", items)}
                />
                <ErrcListEditor
                  label="増やす（Raise）"
                  color="#2563eb"
                  items={formData.errc.raise}
                  onChange={(items) => updateErrc("raise", items)}
                />
                <ErrcListEditor
                  label="付け加える（Create）"
                  color="#16a34a"
                  items={formData.errc.create}
                  onChange={(items) => updateErrc("create", items)}
                />
              </div>
            </section>

            <Separator />

            {/* Summary */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">バリューイノベーション・サマリー</h2>
              <Textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="新しい提供価値・目指すポジション・期待効果などをまとめてください..."
                className="min-h-[120px] resize-y text-sm"
                rows={5}
              />
            </section>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="BLUE_OCEAN" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
