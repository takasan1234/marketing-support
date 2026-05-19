# CRM 7 分析手法

## 目的

顧客との関係を継続的に強化するため、7 つの代表的な分析手法を選択・適用し、One to One マーケティングへつなげる。

## 7 つの分析手法

| ID | 名称 | 目的 | 概要 |
|---|---|---|---|
| `cluster` | クラスター分析 | 特性別集団抽出 | 似た要素のグループ分け |
| `segmentation` | セグメンテーション分析 | 顧客ニーズ確認 | 属性・購買履歴でグルーピング |
| `decile` | デシル分析 | 売上構成確認 | 購入金額で上位 10 分位 |
| `sales` | 売上分析 | 売上傾向確認 | 組織・商品ごとの売上比較 |
| `cpm` | CPM（Customer Portfolio Management）分析 | 優良顧客抽出 | 現役 / 離脱 × 段階で 10 分類 |
| `rfm` | RFM 分析 | 優良顧客抽出 | Recency × Frequency × Monetary |
| `ctb` | CTB 分析 | 商品購入傾向 | Category × Taste × Brand |

## サブ要素

各分析手法ごとにサブ要素として持つ：

```typescript
type AnalysisMethod = 'cluster' | 'segmentation' | 'decile' | 'sales' | 'cpm' | 'rfm' | 'ctb';
```

## 上流（参照すべき）

| 入力 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| 顧客データ | （なし） | SALES_DATA, CUSTOMER_RESEARCH, LOCATION_DATA |
| セグメント定義 | セグメンテーション | （上流経由） |
| 評価指標 | KGI/KSF/KPI | （上流経由） |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| セグメンテーション | 新セグメント発見 |
| ターゲティング | 優良顧客像の更新 |
| Promotion 戦略 | パーソナライズ施策 |

## データスキーマ

```typescript
{
  methods: Array<{
    id: AnalysisMethod;
    name: string;
    adopted: boolean;
    rationale: string;
    inputs: string[];               // 必要なデータ種類
    results: {                      // 分析結果
      summary: string;
      keyFindings: string[];
      visualizationUrl?: string;    // チャート画像 URL
    } | null;
    actions: Array<{                // 結果に基づく施策
      description: string;
      targetSegment: string;
      expectedImpact: string;
    }>;
    lastAnalyzedAt?: Date;
    sources: string[];              // RawData ID
  }>;
  oneToOneStrategy: {
    enabled: boolean;
    description: string;
    personalizationRules: Array<{
      condition: string;            // 例：「過去 3 ヶ月以内に購入」
      action: string;               // 例：「クロスセル DM 送付」
    }>;
  };
}
```

## UI パターン

**比較カタログ型**

```
【7 分析手法の選定】

┌──────────────────────────────────────┐
│ ① クラスター分析                       │
│ 目的: 特性別集団抽出                    │
│ 採用: ☐                                │
│ 必要データ: 顧客属性、行動履歴          │
│ 結果サマリ: -                          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ② セグメンテーション分析                │
│ 目的: 顧客ニーズ確認                    │
│ 採用: ☑                                │
│ 必要データ: 購買履歴、属性              │
│ 結果サマリ:                            │
│  ・上位 3 セグメントが全体の 75% を占める│
│ 施策:                                  │
│  ・セグメント A 向けに...               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ⑥ RFM 分析  ★採用★                   │
│ 目的: 優良顧客抽出                      │
│ 採用: ☑                                │
│ 必要データ: SALES_DATA                  │
│ 結果サマリ:                            │
│  ・優良顧客（R↑F↑M↑）: 350 名         │
│  ・離反顧客: 1,200 名                  │
│ 施策:                                  │
│  ・離反顧客に再来訪促進 DM             │
└──────────────────────────────────────┘

...

【One to One マーケティング】
☑ 有効化
パーソナライズルール:
 ・過去 3 ヶ月購入なし → 復活クーポン
 ・優良顧客 → 限定先行案内
```

## Claude Code 連携の例

```
「SALES_DATA から RFM 分析を実行して、優良顧客・離反顧客の
 セグメントを導出して」

「クラスター分析の結果から、新セグメントの候補を抽出して
 セグメンテーション フレームワークへ反映を提案」
```

## 注意

- 全ての手法を採用する必要はない。事業フェーズに応じて 2-3 個を選定
- 導入期：セグメンテーション分析、クラスター分析
- 成長期：RFM、デシル、CPM
- 成熟期：CTB、One to One マーケティング
- 分析結果を可視化するライブラリ（Recharts など）と連携
