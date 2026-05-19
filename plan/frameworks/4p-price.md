# Price 戦略（4P）

## 目的

商品の価値・ターゲットに合った価格設定の手法を選び、具体的な価格戦略を立てる。

## サブ要素

| サブ要素 ID | 名称 | 内容 |
|---|---|---|
| `method` | 価格設定手法 | コスト基準 / 競合基準 / 需要基準 |
| `approach` | 価格戦略アプローチ | マス向け / 高付加価値 |
| `specifics` | 具体的な価格設定 | 商品ごとの値付け |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| method | （なし） | SALES_DATA, FINANCIAL_DATA |
| approach | Product 戦略、ターゲティング | （上流経由） |
| specifics | 競合の価格帯 | COMPETITOR_INFO, MARKET_STATS |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| KGI/KSF/KPI | 収益指標 |
| Place 戦略 | チャネル別の価格 |
| Promotion 戦略 | お得感の訴求 |

## データスキーマ

```typescript
{
  method: {
    type: 'cost_based' | 'competitor_based' | 'demand_based';
    rationale: string;              // 採用理由
    inputs: {                       // 採用方式に応じたインプット
      // cost_based の場合
      cost?: number;
      laborCost?: number;
      promotionCost?: number;
      targetProfit?: number;
      // competitor_based の場合
      competitorPrices?: Array<{ name: string; price: number; note: string }>;
      // demand_based の場合
      demandData?: string;
      surveyResults?: string;
    };
  };
  approach: {
    type: 'mass_market' | 'high_value';
    description: string;
    rationale: string;
  };
  specifics: Array<{
    productName: string;
    price: number;
    currency: string;
    pricingRange: {                 // 価格幅（ダイナミックプライシング想定）
      min: number;
      max: number;
    };
    note: string;
  }>;
  highValueMethods: Array<{        // 高付加価値化 7 方法論との連携
    methodId: string;              // strategy-value-add.md の方法 ID
    adopted: boolean;
  }>;
}
```

## UI パターン

**比較カタログ型 + フォーム**

```
【価格設定手法】
┌──────────────┬──────────────┬──────────────┐
│ コスト基準型    │ 競合基準型     │ 需要基準型     │
│ ○             │ ○             │ ● [採用]      │
├──────────────┼──────────────┼──────────────┤
│ 原価+利益     │ 競合価格参照   │ 顧客の支払意思│
│ メリット...    │ メリット...    │ メリット...   │
│ デメリット...  │ デメリット...  │ デメリット... │
└──────────────┴──────────────┴──────────────┘

【価格戦略】 
[○ マス向け（お得感訴求）] [● 高付加価値（一定価格帯維持）]

【具体的な価格】
┌─────────────┬────────┬─────────────┐
│ 商品名        │ 価格    │ 幅            │
├─────────────┼────────┼─────────────┤
│ プレミアム版 │ ¥30,000 │ ¥25k - ¥35k │
└─────────────┴────────┴─────────────┘

【高付加価値化方法論との連携】
□ 二面価値構築 □ 段階的調整 □ 外部評価活用 ...
```

## Claude Code 連携の例

```
「競合の価格を COMPETITOR_INFO から抽出して、競合基準型の
 inputs に整理して」

「需要基準型を採用する場合、顧客調査から支払意思に関する
 データを抜き出して」
```

## 注意

- 観光や旅行系で適していた「需要基準型」が一般的にも有用
- 「最初は低めスタート → 段階的に値上げ」は B2B SaaS でもよく使われる
- ダイナミックプライシング対応は将来拡張
