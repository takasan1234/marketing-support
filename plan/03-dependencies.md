# 03. フレームワーク間の依存グラフ

## 全体図

```
[生データ層（12種類）]
        │
        ▼
┌─────────────────────────────────────────┐
│ Layer 1: 外部・内部環境分析                       │
│   PEST分析  5Forces分析  整理軸分析  VRIO分析    │
└─────────────────────────────────────────┘
        │ （4つの出力が並列に流れる）
        ├─────────────────┐
        ▼                  ▼
┌────────────┐    ┌────────────┐
│ 3C+C分析    │    │ SWOT分析    │
│ ↓出力       │    │ ↓出力       │
│ KSF設定     │    │ クロスSWOT  │
└────────────┘    │ ↓出力       │
                  │ STP骨子     │
                  └─────┬──────┘
                        ▼
        ┌───────────────────────┐
        │ Layer 2: STP                       │
        │   S → T → P （順次）                │
        └─────────────┬─────────┘
                      ▼
              戦略コンセプトシート
              + ブランドメッセージ
                      │
                      ▼
        ┌───────────────────────┐
        │ Layer 3: 戦略補完                  │
        │   ブルー・オーシャン                 │
        │   経験価値                          │
        │   高付加価値化                       │
        └─────────────┬─────────┘
                      ▼
        ┌───────────────────────┐
        │ Layer 4: 4P                        │
        │   Product / Price / Place /        │
        │   Promotion                        │
        │   ↑ 4C で検証 / 7P 拡張             │
        └─────────────┬─────────┘
                      ▼
              KGI / KSF / KPI 設定
                      │
                      ▼
              施策実施・効果測定
                      │
                      ▼
              CRM 分析（7手法）
                      │
                      ▼ フィードバック
              生データ層に「販売実績」「顧客調査」追加
                      │
                      ▼ サイクル開始
                  STP / 4P 見直し
```

## サブ要素レベルの上流参照

「フレームワーク」ではなく「サブ要素」レベルで、参照すべき上流分析が違う。

### 3C+C 分析（典型例）
| サブ要素 | 参照すべき上流分析 | 参照すべき生データ種類 |
|---|---|---|
| Customer（顧客） | PEST 分析、整理軸分析 | 市場統計、顧客調査、SNS分析 |
| Company（自社） | 整理軸分析 | 財務データ、販売実績 |
| Competitor（競合） | 5Forces 分析 | 競合情報、業界レポート |
| Co-Operator（協業者） | （なし。直接ヒアリングのみ） | 協業者ヒアリング、専門家ヒアリング |

### SWOT 分析
| サブ要素 | 参照すべき上流分析 |
|---|---|
| Strength（強み） | 整理軸分析、VRIO 分析 |
| Weakness（弱み） | 整理軸分析、VRIO 分析 |
| Opportunity（機会） | PEST 分析、5Forces 分析 |
| Threat（脅威） | PEST 分析、5Forces 分析 |

### 戦略コンセプトシート
| サブ要素 | 参照すべき上流分析 |
|---|---|
| ビジョン | クロスSWOT |
| 環境分析で明らかとなった課題点 | 3C+C、SWOT |
| 戦略の方向性 | クロスSWOT |
| ターゲット | STP（ターゲティング） |
| ポジション / 提供価値 | STP（ポジショニング） |
| ターゲットのニーズと悩み | STP（セグメンテーション、ターゲティング） |
| ブランドメッセージ | STP 全体 |

その他のサブ要素レベルの参照は、各フレームワーク詳細ファイルを参照。

## 「下流」情報（分析結果の活用方法）

PDF の「3. 分析結果の活用方法」欄から逆算。

| フレームワーク | 下流（出力先） |
|---|---|
| PEST 分析 | SWOT 分析、3C+C 分析（Customer） |
| 5Forces 分析 | SWOT 分析、3C+C 分析（Competitor） |
| 整理軸分析 | SWOT 分析、3C+C 分析（Customer/Company） |
| VRIO 分析 | SWOT 分析 |
| 3C+C 分析 | KSF 設定（KGI/KSF/KPI） |
| SWOT 分析 | クロスSWOT 分析 |
| クロスSWOT 分析 | STP の骨子 |
| セグメンテーション | ターゲティング |
| ターゲティング | ポジショニング、4P 全体 |
| ポジショニング | 4P 全体、戦略コンセプトシート |
| 戦略コンセプトシート | 4P 全体、KGI/KSF/KPI |
| Product/Price/Place/Promotion | KGI/KSF/KPI、施策実施 |
| 4C/7P | 4P の検証 |
| ブルー・オーシャン | Product 4P |
| 経験価値 | Product 4P |
| 高付加価値化 | Price 4P、Product 4P |
| KGI/KSF/KPI | 施策実施・効果測定 |
| カスタマージャーニー | Promotion 4P、CRM |
| CRM 分析 | STP 見直し（サイクル） |

## 依存グラフの保持方法

依存関係は**コードで定義**（DB ではなく）。
理由：構造はあまり変わらないので、コード定義のほうが見通しが良い。

```typescript
// packages/domain/src/frameworks/dependencies.ts
export const FRAMEWORK_DEPENDENCIES: Record<FrameworkType, {
  upstream: FrameworkType[];
  downstream: FrameworkType[];
  subElements: SubElementDef[];
}> = {
  PEST: {
    upstream: [],
    downstream: [SWOT, THREE_C_PLUS_C],
    subElements: [
      { id: 'politics', upstreamFrameworks: [], rawDataTypes: [NEWS, INDUSTRY_REPORT] },
      { id: 'economy', upstreamFrameworks: [], rawDataTypes: [MARKET_STATS, NEWS] },
      // ...
    ]
  },
  THREE_C_PLUS_C: {
    upstream: [PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: 'customer', upstreamFrameworks: [PEST, INTERNAL_ANALYSIS], rawDataTypes: [MARKET_STATS, CUSTOMER_RESEARCH] },
      { id: 'company', upstreamFrameworks: [INTERNAL_ANALYSIS], rawDataTypes: [FINANCIAL_DATA, SALES_DATA] },
      { id: 'competitor', upstreamFrameworks: [FIVE_FORCES], rawDataTypes: [COMPETITOR_INFO, INDUSTRY_REPORT] },
      { id: 'co_operator', upstreamFrameworks: [], rawDataTypes: [PARTNER_HEARING, EXPERT_HEARING] },
    ]
  },
  // ... 全フレームワーク分定義
};
```

UI 側はこの定義を読み、各フレームワーク画面に「参照すべき上流分析・生データ」を自動表示する。
