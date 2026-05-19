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

type PricingMethod = "cost_plus" | "competitive" | "value_based";

type PriceData = {
  selectedMethod: PricingMethod | null;
  specificPrice: string;
  priceRange: string;
  rationale: string;
  costPlusDetails: string;
  competitiveDetails: string;
  valueBasedDetails: string;
};

const DEFAULT_PRICE_DATA: PriceData = {
  selectedMethod: null,
  specificPrice: "",
  priceRange: "",
  rationale: "",
  costPlusDetails: "",
  competitiveDetails: "",
  valueBasedDetails: "",
};

type MethodCard = {
  id: PricingMethod;
  title: string;
  subtitle: string;
  description: string;
  merit: string;
  demerit: string;
  detailsKey: keyof Pick<
    PriceData,
    "costPlusDetails" | "competitiveDetails" | "valueBasedDetails"
  >;
  detailsPlaceholder: string;
};

const METHOD_CARDS: MethodCard[] = [
  {
    id: "cost_plus",
    title: "コスト積上げ法",
    subtitle: "Cost-plus Pricing",
    description: "原価にマージンを上乗せして価格を決定する方法",
    merit: "計算が簡単・利益を確保しやすい",
    demerit: "顧客の支払意思・競合価格を無視しがち",
    detailsKey: "costPlusDetails",
    detailsPlaceholder:
      "例：原価 5,000円 + 利益率 40% = 販売価格 8,333円\n原材料費、人件費、諸経費の内訳を記述してください。",
  },
  {
    id: "competitive",
    title: "競合比較法",
    subtitle: "Competitive Pricing",
    description: "競合他社の価格帯を参照して自社の価格を設定する方法",
    merit: "市場相場に合いやすい・顧客受け入れやすい",
    demerit: "価格競争に陥るリスク・自社強みを活かしにくい",
    detailsKey: "competitiveDetails",
    detailsPlaceholder:
      "例：競合A ¥9,800 / 競合B ¥12,000 / 競合C ¥7,500\n各競合の価格と自社のポジションを記述してください。",
  },
  {
    id: "value_based",
    title: "価値ベース法",
    subtitle: "Value-based Pricing",
    description: "顧客が感じる価値・支払意思額（WTP）を基に価格を設定する方法",
    merit: "高い利益率・ブランド価値と整合",
    demerit: "顧客調査が必要・実装に時間がかかる",
    detailsKey: "valueBasedDetails",
    detailsPlaceholder:
      "例：顧客インタビューでの支払意思額 ¥15,000〜¥20,000\n価値認識・WTPデータを記述してください。",
  },
];

const SUB_ELEMENTS = [
  { id: "method", label: "価格設定手法" },
  { id: "specifics", label: "具体的な価格・根拠" },
] as const;

export default function Price4PPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [priceData, setPriceData] = useState<PriceData>(DEFAULT_PRICE_DATA);
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "PRICE_4P"),
          listLinks(id, "PRICE_4P"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const raw = fetchedEntry.data as Partial<PriceData>;
        setPriceData({
          selectedMethod: (raw.selectedMethod as PricingMethod | null) ?? null,
          specificPrice: raw.specificPrice ?? "",
          priceRange: raw.priceRange ?? "",
          rationale: raw.rationale ?? "",
          costPlusDetails: raw.costPlusDetails ?? "",
          competitiveDetails: raw.competitiveDetails ?? "",
          valueBasedDetails: raw.valueBasedDetails ?? "",
        });
      } catch {
        setPriceData(DEFAULT_PRICE_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "PRICE_4P", {
        data: priceData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "PRICE_4P", {
        data: priceData as unknown as Record<string, unknown>,
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

  const selectedCard = METHOD_CARDS.find(
    (c) => c.id === priceData.selectedMethod
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
          {" / Price戦略（4P）"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Price戦略（4P）</h1>
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
            {/* Method selection cards */}
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-base font-semibold mb-1">価格設定手法の選択</h2>
              <p className="text-xs text-muted-foreground mb-4">
                3つの手法からクリックして選択してください。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {METHOD_CARDS.map((card) => {
                  const isSelected = priceData.selectedMethod === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() =>
                        setPriceData((prev) => ({
                          ...prev,
                          selectedMethod: card.id,
                        }))
                      }
                      className={`text-left rounded-lg border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{card.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {card.subtitle}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {card.description}
                      </p>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs">
                          <span className="text-green-600 font-medium">
                            メリット：
                          </span>
                          {card.merit}
                        </p>
                        <p className="text-xs">
                          <span className="text-red-500 font-medium">
                            デメリット：
                          </span>
                          {card.demerit}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected method details */}
            {selectedCard && (
              <div className="border rounded-lg p-4 bg-card">
                <h2 className="text-base font-semibold mb-2">
                  {selectedCard.title}の詳細情報
                </h2>
                <Textarea
                  value={priceData[selectedCard.detailsKey]}
                  onChange={(e) =>
                    setPriceData((prev) => ({
                      ...prev,
                      [selectedCard.detailsKey]: e.target.value,
                    }))
                  }
                  placeholder={selectedCard.detailsPlaceholder}
                  className="min-h-[100px] resize-none text-sm"
                  rows={4}
                />
              </div>
            )}

            {/* Specific price & range */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-4">具体的な価格設定</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">具体的な価格</label>
                  <Input
                    value={priceData.specificPrice}
                    onChange={(e) =>
                      setPriceData((prev) => ({
                        ...prev,
                        specificPrice: e.target.value,
                      }))
                    }
                    placeholder="例：¥9,800（税込）"
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">価格帯</label>
                  <Input
                    value={priceData.priceRange}
                    onChange={(e) =>
                      setPriceData((prev) => ({
                        ...prev,
                        priceRange: e.target.value,
                      }))
                    }
                    placeholder="例：¥8,000〜¥12,000"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rationale */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-2">価格設定の根拠・説明</h2>
              <Textarea
                value={priceData.rationale}
                onChange={(e) =>
                  setPriceData((prev) => ({
                    ...prev,
                    rationale: e.target.value,
                  }))
                }
                placeholder="この価格設定を採用した理由、ターゲットとの整合性、競合との差別化ポイントを記述してください。"
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
                    frameworkType="PRICE_4P"
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
            <UpstreamPanel frameworkType="PRICE_4P" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
