"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { RawDataDto, RawDataType } from "@/lib/api-client";
import { RAW_DATA_TYPE_LABELS } from "@/lib/frameworks/dependencies";

const RAW_DATA_TYPES: RawDataType[] = [
  "MARKET_STATS",
  "INDUSTRY_REPORT",
  "NEWS",
  "CUSTOMER_RESEARCH",
  "SNS_ANALYTICS",
  "SEARCH_TRENDS",
  "LOCATION_DATA",
  "SALES_DATA",
  "COMPETITOR_INFO",
  "PARTNER_HEARING",
  "FINANCIAL_DATA",
  "EXPERT_HEARING",
];

const CONTENT_TEMPLATES: Record<RawDataType, string> = {
  MARKET_STATS: `## 市場規模
[数値・単位]

## 成長率
[CAGR、過去傾向]

## 主要セグメント別シェア
[セグメント、シェア]

## 出典
[組織名、レポート名、発行年]`,

  INDUSTRY_REPORT: `## レポート概要
[調査機関、発行年]

## 主要トレンド
-

## データ・統計
-

## 示唆
- `,

  NEWS: `## 概要
[見出し・要約]

## 詳細
[本文・要点]

## 出所
[メディア名、URL、日付]`,

  CUSTOMER_RESEARCH: `## 調査概要
- 対象：[属性、人数]
- 期間：[日付]
- 手法：[アンケート / インタビュー / フォーカスグループ]

## 主要な発見
-

## 注目すべき顧客の声（インサイト）
> `,

  SNS_ANALYTICS: `## 分析概要
- プラットフォーム：[Twitter/X、Instagram 等]
- 期間：
- 対象キーワード：

## 主要指標
- インプレッション：
- エンゲージメント率：
- トレンドハッシュタグ：

## インサイト
- `,

  SEARCH_TRENDS: `## 分析概要
- ツール：[Google Trends 等]
- キーワード：
- 期間：

## トレンド推移
[グラフ概要・数値]

## 関連キーワード
-

## 示唆
- `,

  LOCATION_DATA: `## データ概要
- 提供元：
- 期間：
- エリア：

## 主要指標
- 人流：
- 滞在時間：
- 来訪者属性：

## 示唆
- `,

  SALES_DATA: `## 集計期間
[月次 / 四半期 / 年次]

## 主要指標
- 売上高：
- 販売数量：
- 客単価：
- 新規 / リピート比率：

## 前期比較
-

## チャネル別
- `,

  COMPETITOR_INFO: `## 競合企業名
[社名]

## 概要
- 主力製品：
- ターゲット：
- 価格帯：

## 強み
-

## 弱み
-

## 最近の動向
- `,

  PARTNER_HEARING: `## ヒアリング対象
- 企業名：
- 担当者：
- 日時：

## 主要な発言・意見
-

## 協業可能性
-

## 次のアクション
- `,

  FINANCIAL_DATA: `## 期間
[会計年度 / 月次]

## 主要指標
- 売上高：
- 粗利益率：
- 営業利益率：
- コスト構造：

## 前年比
-

## 課題・示唆
- `,

  EXPERT_HEARING: `## ヒアリング対象
- 氏名 / 所属：
- 専門領域：
- 日時：

## 主要な意見・知見
-

## 業界トレンドに関するコメント
>

## 示唆
- `,
};

type RawDataFormProps = {
  projectId: string;
  initialData?: RawDataDto;
  onSubmit: (data: {
    type: RawDataType;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceNote?: string;
    collectedAt: string;
    tags: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
};

export function RawDataForm({
  projectId,
  initialData,
  onSubmit,
  onDelete,
  submitLabel = "保存",
}: RawDataFormProps) {
  const router = useRouter();
  const [type, setType] = useState<RawDataType>(
    initialData?.type ?? "MARKET_STATS"
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(
    initialData?.content ?? CONTENT_TEMPLATES["MARKET_STATS"]
  );
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [sourceNote, setSourceNote] = useState(initialData?.sourceNote ?? "");
  const [collectedAt, setCollectedAt] = useState<string>(
    initialData?.collectedAt
      ? (new Date(initialData.collectedAt).toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10))
      : new Date().toISOString().slice(0, 10)
  );
  const [tagsInput, setTagsInput] = useState(
    (initialData?.tags ?? []).join(", ")
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleTypeChange(newType: RawDataType) {
    setType(newType);
    // Auto-fill template only when creating (no initialData)
    if (!initialData) {
      setContent(CONTENT_TEMPLATES[newType] ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        content,
        sourceUrl: sourceUrl.trim() || undefined,
        sourceNote: sourceNote.trim() || undefined,
        collectedAt: new Date(collectedAt).toISOString(),
        tags,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("この生データを削除しますか？")) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch {
      setError("削除に失敗しました");
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Type */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">
          種類 <span className="text-destructive">*</span>
        </Label>
        <div className="w-64">
          <Select
            value={type}
            onValueChange={(v) => handleTypeChange(v as RawDataType)}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RAW_DATA_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {RAW_DATA_TYPE_LABELS[t as keyof typeof RAW_DATA_TYPE_LABELS] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">
          タイトル <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：2024年度 国内観光市場規模調査"
          required
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="font-mono text-xs"
          placeholder="内容を入力してください（Markdown 可）"
        />
      </div>

      {/* Source URL */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceUrl">情報ソース URL（任意）</Label>
        <Input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com/report"
        />
      </div>

      {/* Source Note */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceNote">情報ソースメモ（任意）</Label>
        <Input
          id="sourceNote"
          value={sourceNote}
          onChange={(e) => setSourceNote(e.target.value)}
          placeholder="出典の補足説明"
        />
      </div>

      {/* Collected At */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="collectedAt">収集日</Label>
        <Input
          id="collectedAt"
          type="date"
          value={collectedAt}
          onChange={(e) => setCollectedAt(e.target.value)}
          className="w-48"
        />
        {initialData?.expiresAt && (
          <p className="text-xs text-muted-foreground">
            有効期限:{" "}
            {new Date(initialData.expiresAt).toLocaleDateString("ja-JP")}
            （収集日を変更すると自動再計算されます）
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">タグ（任意、カンマ区切り）</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="観光, 市場調査, 2024"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || isDeleting}>
          {isSubmitting ? "保存中..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}/raw-data`)}
          disabled={isSubmitting || isDeleting}
        >
          キャンセル
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="ml-auto"
          >
            {isDeleting ? "削除中..." : "削除"}
          </Button>
        )}
      </div>
    </form>
  );
}
