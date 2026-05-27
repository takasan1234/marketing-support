"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

type AxisCategory =
  | "demographic"
  | "geographic"
  | "psychographic"
  | "behavioral";

const AXIS_CATEGORY_LABELS: Record<AxisCategory, string> = {
  demographic: "人口動態（デモグラフィック）",
  geographic: "地理的（ジオグラフィック）",
  psychographic: "心理的（サイコグラフィック）",
  behavioral: "行動（ビヘイビアル）",
};

type Axis = {
  id: string;
  category: AxisCategory;
  name: string;
  values: string[]; // stored as array, edited as comma-separated
  rationale: string;
};

type Segment = {
  id: string;
  name: string;
  axisValues: Record<string, string>; // axisId → value
  characteristics: string;
  estimatedSize: string;
  selected: boolean;
};

type SegmentationData = {
  axes: Axis[];
  segments: Segment[];
  rationale: string;
};

const DEFAULT_DATA: SegmentationData = {
  axes: [],
  segments: [],
  rationale: "",
};

function parseValues(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SegmentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [segData, setSegData] = useState<SegmentationData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "SEGMENTATION");
        setEntry(fetched);
        const raw = fetched.data as Partial<SegmentationData>;
        setSegData({
          axes: raw.axes ?? [],
          segments: raw.segments ?? [],
          rationale: raw.rationale ?? "",
        });
      } catch {
        setSegData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "SEGMENTATION", {
        data: segData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "SEGMENTATION", {
        data: segData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  // ── Axis helpers ─────────────────────────────────────────────

  function addAxis() {
    const newAxis: Axis = {
      id: globalThis.crypto.randomUUID(),
      category: "demographic",
      name: "",
      values: [],
      rationale: "",
    };
    setSegData((prev) => ({ ...prev, axes: [...prev.axes, newAxis] }));
  }

  function updateAxis(axisId: string, patch: Partial<Axis>) {
    setSegData((prev) => ({
      ...prev,
      axes: prev.axes.map((a) => (a.id === axisId ? { ...a, ...patch } : a)),
    }));
  }

  function removeAxis(axisId: string) {
    setSegData((prev) => ({
      ...prev,
      axes: prev.axes.filter((a) => a.id !== axisId),
      // Clean up axisValues in segments
      segments: prev.segments.map((seg) => {
        const { [axisId]: _removed, ...rest } = seg.axisValues;
        return { ...seg, axisValues: rest };
      }),
    }));
  }

  // ── Segment helpers ───────────────────────────────────────────

  function addSegment() {
    const axisValues: Record<string, string> = {};
    segData.axes.forEach((a) => {
      axisValues[a.id] = a.values[0] ?? "";
    });
    const newSeg: Segment = {
      id: globalThis.crypto.randomUUID(),
      name: "",
      axisValues,
      characteristics: "",
      estimatedSize: "",
      selected: false,
    };
    setSegData((prev) => ({ ...prev, segments: [...prev.segments, newSeg] }));
  }

  function updateSegment(segId: string, patch: Partial<Segment>) {
    setSegData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) =>
        s.id === segId ? { ...s, ...patch } : s
      ),
    }));
  }

  function removeSegment(segId: string) {
    setSegData((prev) => ({
      ...prev,
      segments: prev.segments.filter((s) => s.id !== segId),
    }));
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
          {" / セグメンテーション"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">セグメンテーション</h1>
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
            {/* Rationale */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">セグメンテーション方針</h2>
              <Textarea
                value={segData.rationale}
                onChange={(e) =>
                  setSegData((prev) => ({ ...prev, rationale: e.target.value }))
                }
                placeholder="セグメンテーション全体の方針・目的を記入してください"
                className="min-h-[80px]"
                rows={3}
              />
            </div>

            <Separator />

            {/* Axes section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">整理軸（変数）の選定</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAxis}
                >
                  + 軸を追加
                </Button>
              </div>

              {segData.axes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  「軸を追加」ボタンで整理軸を追加してください。
                </p>
              )}

              <div className="flex flex-col gap-4">
                {segData.axes.map((axis) => (
                  <div
                    key={axis.id}
                    className="border rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            カテゴリ
                          </label>
                          <Select
                            value={axis.category}
                            onValueChange={(v) =>
                              updateAxis(axis.id, {
                                category: v as AxisCategory,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(AXIS_CATEGORY_LABELS).map(
                                ([val, label]) => (
                                  <SelectItem key={val} value={val}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            軸名
                          </label>
                          <Input
                            value={axis.name}
                            onChange={(e) =>
                              updateAxis(axis.id, { name: e.target.value })
                            }
                            placeholder="例：年齢"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            値（カンマ区切り）
                          </label>
                          <Input
                            value={axis.values.join(", ")}
                            onChange={(e) =>
                              updateAxis(axis.id, {
                                values: parseValues(e.target.value),
                              })
                            }
                            placeholder="例：20代, 30代, 40代"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 px-2 text-xs shrink-0"
                        onClick={() => removeAxis(axis.id)}
                      >
                        削除
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        この軸を採用する理由
                      </label>
                      <Input
                        value={axis.rationale}
                        onChange={(e) =>
                          updateAxis(axis.id, { rationale: e.target.value })
                        }
                        placeholder="なぜこの軸を採用するか"
                        className="h-8 text-sm"
                      />
                    </div>
                    {axis.values.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {axis.values.map((v) => (
                          <Badge key={v} variant="secondary" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Segments section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">生成されたセグメント</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSegment}
                >
                  + セグメントを追加
                </Button>
              </div>

              {segData.segments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  「セグメントを追加」ボタンでセグメントを追加してください。
                </p>
              )}

              <div className="flex flex-col gap-4">
                {segData.segments.map((seg) => (
                  <div
                    key={seg.id}
                    className={`border rounded-lg p-4 flex flex-col gap-3 transition-colors ${
                      seg.selected ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={seg.selected}
                        onChange={(e) =>
                          updateSegment(seg.id, { selected: e.target.checked })
                        }
                        className="w-4 h-4 mt-1 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            セグメント名
                          </label>
                          <Input
                            value={seg.name}
                            onChange={(e) =>
                              updateSegment(seg.id, { name: e.target.value })
                            }
                            placeholder="例：20代女性アニメ好き"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">
                            規模感
                          </label>
                          <Input
                            value={seg.estimatedSize}
                            onChange={(e) =>
                              updateSegment(seg.id, {
                                estimatedSize: e.target.value,
                              })
                            }
                            placeholder="例：約50万人"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 px-2 text-xs shrink-0"
                        onClick={() => removeSegment(seg.id)}
                      >
                        削除
                      </Button>
                    </div>

                    {/* Axis value assignments */}
                    {segData.axes.length > 0 && (
                      <div className="flex flex-col gap-2 pl-7">
                        <label className="text-xs text-muted-foreground font-medium">
                          軸の値
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {segData.axes.map((axis) => (
                            <div key={axis.id} className="flex flex-col gap-1">
                              <label className="text-xs text-muted-foreground">
                                {axis.name || "(軸名未設定)"}
                              </label>
                              {axis.values.length > 0 ? (
                                <Select
                                  value={seg.axisValues[axis.id] ?? ""}
                                  onValueChange={(v) =>
                                    updateSegment(seg.id, {
                                      axisValues: {
                                        ...seg.axisValues,
                                        [axis.id]: v,
                                      },
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="選択..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {axis.values.map((v) => (
                                      <SelectItem key={v} value={v}>
                                        {v}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={seg.axisValues[axis.id] ?? ""}
                                  onChange={(e) =>
                                    updateSegment(seg.id, {
                                      axisValues: {
                                        ...seg.axisValues,
                                        [axis.id]: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="値を入力"
                                  className="h-7 text-xs"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pl-7 flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        セグメントの特徴
                      </label>
                      <Textarea
                        value={seg.characteristics}
                        onChange={(e) =>
                          updateSegment(seg.id, {
                            characteristics: e.target.value,
                          })
                        }
                        placeholder="このセグメントの特徴・ニーズを記入..."
                        className="text-sm min-h-[60px] resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="SEGMENTATION" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
