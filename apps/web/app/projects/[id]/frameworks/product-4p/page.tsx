"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  ConcentricCircles,
  type ConcentricCirclesData,
} from "@/components/frameworks/ConcentricCircles";
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

const DEFAULT_DATA: ConcentricCirclesData = {
  core: { description: "", focusLevel: "medium" },
  actual: { items: [], description: "", focusLevel: "medium" },
  augmented: { items: [], description: "", focusLevel: "medium" },
};

type ProductData = {
  circles: ConcentricCirclesData;
  focusRationale: string;
  upstreamNotes: string;
};

const DEFAULT_PRODUCT_DATA: ProductData = {
  circles: DEFAULT_DATA,
  focusRationale: "",
  upstreamNotes: "",
};

export default function Product4PPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [productData, setProductData] = useState<ProductData>(DEFAULT_PRODUCT_DATA);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "PRODUCT_4P"),
          listLinks(id, "PRODUCT_4P"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const raw = fetchedEntry.data as Partial<ProductData>;
        setProductData({
          circles: (raw.circles as ConcentricCirclesData) ?? DEFAULT_DATA,
          focusRationale: raw.focusRationale ?? "",
          upstreamNotes: raw.upstreamNotes ?? "",
        });
      } catch {
        setProductData(DEFAULT_PRODUCT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "PRODUCT_4P", {
        data: productData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "PRODUCT_4P", {
        data: productData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  const SUB_ELEMENTS = [
    { id: "core", label: "コア（中核ベネフィット）" },
    { id: "actual", label: "実体（形態・物理的属性）" },
    { id: "augmented", label: "拡張（付随サービス・保証）" },
  ] as const;

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
          {" / Product戦略（4P）"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Product戦略（4P）</h1>
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
            {/* Concentric circles */}
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-base font-semibold mb-1">
                3層構造（同心円モデル）
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                各レイヤーに内容を入力し、注力レイヤーを選択してください。
              </p>
              <ConcentricCircles
                data={productData.circles}
                onChange={(circles) =>
                  setProductData((prev) => ({ ...prev, circles }))
                }
              />
            </div>

            {/* Focus rationale */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-2">注力レイヤーの根拠</h2>
              <p className="text-xs text-muted-foreground mb-3">
                なぜそのレイヤーに注力するのか、ターゲットとの関連も含めて記述してください。
              </p>
              <Textarea
                value={productData.focusRationale}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    focusRationale: e.target.value,
                  }))
                }
                placeholder="例：富裕層ターゲットのため、コアベネフィット（体験価値）に注力。価格感度が低く、実体（スペック）よりも情緒的価値を重視する。"
                className="min-h-[100px] resize-none text-sm"
                rows={4}
              />
            </div>

            {/* Upstream reference notes */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-2">上流参照メモ</h2>
              <p className="text-xs text-muted-foreground mb-3">
                ポジショニング・ターゲティングからの参照内容を記録してください。
              </p>
              <Textarea
                value={productData.upstreamNotes}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    upstreamNotes: e.target.value,
                  }))
                }
                placeholder="例：ターゲット：30代女性・富裕層 / ポジショニング：プレミアム体験型"
                className="min-h-[80px] resize-none text-sm"
                rows={3}
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
                    frameworkType="PRODUCT_4P"
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
            <UpstreamPanel frameworkType="PRODUCT_4P" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
