"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import type { RawDataType } from "@/lib/api-client";
import { COLLECTABLE_TYPES, type CollectableType } from "@/lib/raw-data";
import { RAW_DATA_TYPE_LABELS } from "@/lib/frameworks/dependencies";

// 種類ごとの収集観点と topic 入力欄のプレースホルダ
const TYPE_GUIDE: Record<
  CollectableType,
  { placeholder: string; focus: string }
> = {
  MARKET_STATS: {
    placeholder: "例: 国内SaaS市場規模",
    focus: "市場規模・成長率（CAGR）・予測期間と出典を整理",
  },
  INDUSTRY_REPORT: {
    placeholder: "例: 生成AIの業界動向",
    focus: "業界動向・主要プレイヤー・トレンドと出典を整理",
  },
  NEWS: {
    placeholder: "例: SaaS関連の規制動向",
    focus: "日付・概要・自社への影響と出典を整理",
  },
  SEARCH_TRENDS: {
    placeholder: "例: マーケティング自動化",
    focus: "検索ボリュームの推移・関連キーワード・季節性を整理",
  },
  COMPETITOR_INFO: {
    placeholder: "例: 主要競合3社",
    focus: "企業名・主要製品・価格帯・強み/弱みと出典を整理",
  },
  SNS_ANALYTICS: {
    placeholder: "例: 自社カテゴリの言及",
    focus: "話題量・主要な言及内容・センチメントと出典を整理",
  },
};

function buildTypePrompt(
  projectId: string,
  type: RawDataType,
  topic: string
): string {
  const label = RAW_DATA_TYPE_LABELS[type];
  const theme = topic.trim() || "（テーマを指定してください）";
  const focus = TYPE_GUIDE[type as CollectableType].focus;

  return `プロジェクトID: ${projectId}

${label}（${type}）の生データを Web から収集して保存してください。
テーマ: ${theme}

- 日本国内ソース（政府統計・国内調査会社・国内ニュース等）と、グローバルソース（海外調査会社・英語の一次情報等）の両方を収集してください。
- 一方の地域に偏らせず、バランスよく拾ってください。
- ${focus}してください。
- 保存時、日本国内ソースには --tags に region:JP を、グローバルソースには region:GLOBAL を必ず含めてください。

使用 Skill: data-collector`;
}

function buildBatchPrompt(projectId: string, theme: string): string {
  const t = theme.trim() || "（テーマを指定してください）";
  const typeList = COLLECTABLE_TYPES.map(
    (type) => `  - ${RAW_DATA_TYPE_LABELS[type]}（${type}）`
  ).join("\n");

  return `プロジェクトID: ${projectId}

以下のテーマについて、ネットで完結する公開情報の生データを一括で収集して保存してください。
テーマ: ${t}

対象の生データ種類:
${typeList}

収集方針:
- 各種類について、日本国内ソースとグローバルソースの両方を収集してください。
- グローバルに偏って国内情報が不足したり、国内に偏って重要なグローバル情報が抜けたりしないよう、バランスを取ってください。
- 保存時、日本国内ソースには --tags に region:JP を、グローバルソースには region:GLOBAL を必ず含めてください。
- 種類ごとに、JP と GLOBAL それぞれ何件保存したかを報告してください。

使用 Skill: data-collector`;
}

function CopyablePrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では何もしない（pre から手動選択可能）
    }
  }

  return (
    <>
      <pre className="mb-3 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-blue-200 bg-white p-3 text-xs leading-relaxed text-gray-700 dark:border-blue-700 dark:bg-blue-950 dark:text-gray-300">
        {prompt}
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="border-blue-400 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
        onClick={handleCopy}
      >
        {copied ? "コピーしました ✓" : "クリップボードにコピー"}
      </Button>
    </>
  );
}

type CollectDataHintProps = {
  projectId: string;
};

export function CollectDataHint({ projectId }: CollectDataHintProps) {
  const [open, setOpen] = useState(false);
  const [batchTheme, setBatchTheme] = useState("");
  const [openType, setOpenType] = useState<RawDataType | null>(null);
  const [topics, setTopics] = useState<Partial<Record<RawDataType, string>>>(
    {}
  );

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <span aria-hidden="true">🌐</span>
          Claude Code で生データを収集
        </span>
        <span
          className="text-xs text-blue-500 dark:text-blue-400"
          aria-hidden="true"
        >
          {open ? "▲ 閉じる" : "▼ 収集プロンプトを表示"}
        </span>
      </button>

      {open && (
        <div className="border-t border-blue-200 px-4 pb-4 pt-3 dark:border-blue-800">
          {/* 一括収集 */}
          <p className="mb-2 text-xs font-medium text-blue-700 dark:text-blue-300">
            一括収集（全種類をまとめて）
          </p>
          <p className="mb-2 text-xs text-blue-600 dark:text-blue-400">
            テーマを入力し、生成された依頼文を Claude Code CLI
            にコピー&ペーストしてください
          </p>
          <Input
            value={batchTheme}
            onChange={(e) => setBatchTheme(e.target.value)}
            placeholder="例: 国内外のマーケティング支援SaaS市場"
            className="mb-2 bg-white dark:bg-blue-950"
          />
          <CopyablePrompt prompt={buildBatchPrompt(projectId, batchTheme)} />

          {/* 種類別の個別収集 */}
          <p className="mb-2 mt-5 text-xs font-medium text-blue-700 dark:text-blue-300">
            種類ごとに収集
          </p>
          <div className="flex flex-col gap-2">
            {COLLECTABLE_TYPES.map((type) => {
              const guide = TYPE_GUIDE[type];
              const isOpen = openType === type;
              const topic = topics[type] ?? "";
              return (
                <div
                  key={type}
                  className="rounded border border-blue-200 dark:border-blue-700"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300"
                    onClick={() => setOpenType(isOpen ? null : type)}
                    aria-expanded={isOpen}
                  >
                    <span>{RAW_DATA_TYPE_LABELS[type]}</span>
                    <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      <Input
                        value={topic}
                        onChange={(e) =>
                          setTopics((prev) => ({
                            ...prev,
                            [type]: e.target.value,
                          }))
                        }
                        placeholder={guide.placeholder}
                        className="mb-2 bg-white dark:bg-blue-950"
                      />
                      <CopyablePrompt
                        prompt={buildTypePrompt(projectId, type, topic)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
