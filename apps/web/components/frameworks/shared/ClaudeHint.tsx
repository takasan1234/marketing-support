"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@workspace/ui/components/button";

// URL スラグ → FrameworkType
const SLUG_TO_TYPE: Record<string, string> = {
  pest: "PEST",
  "five-forces": "FIVE_FORCES",
  "internal-analysis": "INTERNAL_ANALYSIS",
  vrio: "VRIO",
  "three-c-plus-c": "THREE_C_PLUS_C",
  swot: "SWOT",
  "cross-swot": "CROSS_SWOT",
  segmentation: "SEGMENTATION",
  targeting: "TARGETING",
  positioning: "POSITIONING",
  "concept-sheet": "CONCEPT_SHEET",
  "product-4p": "PRODUCT_4P",
  "price-4p": "PRICE_4P",
  "place-4p": "PLACE_4P",
  "promotion-4p": "PROMOTION_4P",
  "four-c-seven-p": "FOUR_C_SEVEN_P",
  "blue-ocean": "BLUE_OCEAN",
  "experience-value": "EXPERIENCE_VALUE",
  "value-add-methods": "VALUE_ADD_METHODS",
  "kgi-ksf-kpi": "KGI_KSF_KPI",
  "customer-journey": "CUSTOMER_JOURNEY",
  "crm-overview": "CRM_OVERVIEW",
  "crm-analysis": "CRM_ANALYSIS",
};

// フレームワーク種類 → Claude Code への依頼文テンプレート
const FRAMEWORK_HINTS: Record<string, string> = {
  PEST: `PEST分析の各サブ要素（Politics / Economy / Society / Technology）を、紐付けられた生データ（ニュース、業界レポート等）を参照して下書きしてください。
各サブ要素に「現状の事実」「自社への影響」を簡潔にまとめてください。

使用 Skill: framework-drafter`,

  FIVE_FORCES: `5Forces分析の各サブ要素（新規参入者 / 代替品 / 買い手 / 売り手 / 業界内競合）を、競合情報や業界レポートの生データを参照して下書きしてください。
各力の「強さ（高・中・低）」と「理由」を整理してください。

使用 Skill: framework-drafter`,

  INTERNAL_ANALYSIS: `整理軸分析（内部環境）の各サブ要素を、財務データ・販売実績の生データを参照して分析してください。
強み・弱みと経営資源・ケイパビリティを整理してください。

使用 Skill: framework-drafter`,

  VRIO: `VRIO分析の各経営資源について、Value / Rarity / Imitability / Organization の観点から評価してください。
整理軸分析の結果を上流として参照し、競争優位の持続性を判定してください。

使用 Skill: framework-drafter`,

  THREE_C_PLUS_C: `3C+C分析の各サブ要素（Customer / Company / Competitor / Co-operator）を下書きしてください。
- Customer: PEST分析・整理軸分析を参照
- Company: 整理軸分析を参照
- Competitor: 5Forces分析・競合情報を参照
KSFも合わせて整理してください。

使用 Skill: framework-drafter`,

  SWOT: `SWOT分析の4セル（Strength / Weakness / Opportunity / Threat）を下書きしてください。
- S/W: 整理軸分析・VRIO分析を参照
- O/T: PEST分析・5Forces分析を参照
各セルに箇条書きで3〜5項目を挙げてください。

使用 Skill: framework-drafter`,

  CROSS_SWOT: `クロスSWOT分析の4戦略（SO / ST / WO / WT）を下書きしてください。
SWOT分析の結果を読み取り、組み合わせから有効な戦略案を複数抽出してください。
実現性と効果の評価も加えてください。

使用 Skill: framework-drafter`,

  SEGMENTATION: `セグメンテーションの整理軸と各セグメントを定義してください。
クロスSWOTの戦略方向性と市場統計・顧客調査データを参照して、有効な市場分割軸を提案してください。

使用 Skill: framework-drafter`,

  TARGETING: `ターゲティングのセグメント評価を行ってください。
セグメンテーションで定義したセグメントを「規模・成長性・競合・適合性・到達性」の5軸でスコアリングし、メインターゲット・サブターゲットを選定してください。

使用 Skill: framework-drafter`,

  POSITIONING: `ポジショニングマップの軸設定と各社配置を提案してください。
ターゲティングの結果と競合情報を参照して、自社が狙うべきポジションを明確にしてください。

使用 Skill: framework-drafter`,

  CONCEPT_SHEET: `戦略コンセプトシートの7セクションを下書きしてください。
- ビジョン: クロスSWOT参照
- 課題点: 3C+C・SWOT参照
- 戦略方向性: クロスSWOT参照
- ターゲット・ニーズ: STP参照
- ポジション/提供価値: ポジショニング参照
- ブランドメッセージ: STP全体参照

使用 Skill: framework-drafter`,

  PRODUCT_4P: `Product（4P）の3層構造（コア製品 / 実際の製品 / 付随的製品）を下書きしてください。
コンセプトシートと顧客調査・競合情報を参照して、製品設計の方向性を整理してください。

使用 Skill: framework-drafter`,

  PRICE_4P: `Price（4P）の価格戦略を下書きしてください。
市場統計・競合情報・財務データを参照して、コスト積み上げ／競合比較／知覚価値の3手法から適切な価格設定方針を選択・整理してください。

使用 Skill: framework-drafter`,

  PLACE_4P: `Place（4P）のチャネル戦略を下書きしてください。
ターゲティングの結果と位置情報・販売実績データを参照して、流通チャネルの選定とチャネルミックスを整理してください。

使用 Skill: framework-drafter`,

  PROMOTION_4P: `Promotion（4P）の施策計画を下書きしてください。
カスタマージャーニーと検索トレンド・SNS分析を参照して、8ステップのプロモーション計画を整理してください。

使用 Skill: framework-drafter`,

  FOUR_C_SEVEN_P: `4C検証と7P拡張を行ってください。
4Pの各施策を顧客視点（Customer Value / Cost / Convenience / Communication）で検証し、サービス業向けの7P拡張（People / Process / Physical Evidence）も整理してください。

使用 Skill: framework-drafter`,

  BLUE_OCEAN: `ブルーオーシャン戦略の戦略キャンバスと4アクション（取り除く・減らす・増やす・付け加える）を下書きしてください。
競合情報と業界レポートを参照して、業界の競争要因を洗い出してください。

使用 Skill: framework-drafter`,

  EXPERIENCE_VALUE: `経験価値マーケティングの5つの価値モジュール（SENSE / FEEL / THINK / ACT / RELATE）を評価してください。
顧客調査とSNS分析を参照して、自社製品・サービスでの体験価値提供状況を整理してください。

使用 Skill: framework-drafter`,

  VALUE_ADD_METHODS: `高付加価値化7方法論（ブランド化・プレミアム化・バンドリング・サブスクリプション・エコシステム・プラットフォーム・データ活用）の採用可否を評価してください。
業界レポートと競合情報を参照してください。

使用 Skill: framework-drafter`,

  KGI_KSF_KPI: `KGI / KSF / KPI のツリー構造を下書きしてください。
- KGI: コンセプトシートのビジョンと財務データを参照
- KSF: 3C+C分析の結果を参照
- KPI: 各4P施策の測定指標を設定
達成期限と目標値も合わせて整理してください。

使用 Skill: framework-drafter`,

  CUSTOMER_JOURNEY: `カスタマージャーニーマップを下書きしてください。
ターゲティングで選定したペルソナを対象に、AIDMA/AISASの各ステージで顧客の行動・感情・タッチポイントを整理してください。
顧客調査とSNS分析を参照してください。

使用 Skill: framework-drafter`,

  CRM_OVERVIEW: `CRM概要として、現在の顧客管理状況と課題を整理してください。
KGI/KSF/KPIの目標値を参照して、顧客獲得・維持・拡大の方針を記述してください。

使用 Skill: framework-drafter`,

  CRM_ANALYSIS: `CRM 7分析手法（RFM / デシル / コホート / 離反予測 / LTV / ファネル / NPS）の適用可否を評価し、結果を記録してください。
販売実績と顧客調査データを参照してください。

使用 Skill: framework-drafter`,
};

type ClaudeHintProps = {
  projectId: string;
};

export function ClaudeHint({ projectId }: ClaudeHintProps) {
  const pathname = usePathname();
  const slug =
    pathname.split("/frameworks/")[1]?.split("/")[0]?.toLowerCase() ?? "";
  const type = SLUG_TO_TYPE[slug];
  const hintTemplate = type ? FRAMEWORK_HINTS[type] : null;

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  if (!hintTemplate) return null;

  const prompt = `プロジェクトID: ${projectId}\n\n${hintTemplate}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select textarea
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <span aria-hidden="true">💬</span>
          Claude Code に依頼
        </span>
        <span
          className="text-xs text-blue-500 dark:text-blue-400"
          aria-hidden="true"
        >
          {open ? "▲ 閉じる" : "▼ 依頼文を表示"}
        </span>
      </button>
      {open && (
        <div className="border-t border-blue-200 dark:border-blue-800 px-4 pb-4 pt-3">
          <p className="mb-2 text-xs text-blue-600 dark:text-blue-400">
            以下の文を Claude Code CLI にコピー&ペーストしてください
          </p>
          <pre className="mb-3 whitespace-pre-wrap rounded bg-white dark:bg-blue-950 border border-blue-200 dark:border-blue-700 p-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed max-h-48 overflow-auto">
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
        </div>
      )}
    </div>
  );
}
