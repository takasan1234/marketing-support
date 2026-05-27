# 整理軸分析（内部環境分析）

## 目的

自社・自事業の内部資源を、抜け漏れなく複数観点で整理する。SWOT と 3C+C の Customer / Company の材料となる。

## サブ要素

| サブ要素 ID | 名称 | 説明 |
|---|---|---|
| `customer` | 顧客 | 既に獲得している顧客の状況 |
| `product` | 商品・サービス | 提供するモノやサービスの状況 |
| `human_org` | 人材・組織 | 組織体制、人材、ナレッジ |
| `finance` | 財務 | 財源、コスト構造、収益性 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| customer | （なし） | CUSTOMER_RESEARCH, SALES_DATA |
| product | （なし） | SALES_DATA, COMPETITOR_INFO |
| human_org | （なし） | （自社内部情報、ヒアリング） |
| finance | （なし） | FINANCIAL_DATA |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| SWOT 分析 | Strength, Weakness の材料 |
| 3C+C 分析（Customer） | 顧客の状況 |
| 3C+C 分析（Company） | 自社の状況 |
| VRIO 分析 | 評価対象の資源リスト |

## データスキーマ

```typescript
{
  customer: {
    items: Array<{
      text: string;        // 例：「主要セグメントは20代女性、リピート率45%」
      type: 'strength' | 'weakness' | 'neutral';
      sources: string[];   // RawData ID
    }>;
    examples: string[];    // 観点メモ：認知度、評判、入込客数、リピート率、属性
    summary: string;
  };
  product: {
    items: Array<{...}>;
    examples: string[];    // 観点メモ：魅力、ブランド力、品質、付帯サービス
    summary: string;
  };
  human_org: {
    items: Array<{...}>;
    examples: string[];    // 観点メモ：体制、人材、情報発信力、ナレッジ
    summary: string;
  };
  finance: {
    items: Array<{...}>;
    examples: string[];    // 観点メモ：財源、自主収入、コスト構造
    summary: string;
  };
  overallSummary: string;
}
```

## UI パターン

**2 列テーブル型**

PEST と同形式だが、「分析結果」列の代わりに「Strength / Weakness / Neutral」の 3 段階フラグ。

```
┌──────────────┬────────────────┬──────────────────┬───────┐
│ 観点          │ 情報ソース       │ 内容              │ 評価   │
├──────────────┼────────────────┼──────────────────┼───────┤
│ 顧客          │ [メモ]          │ [箇条書き]        │ [S/W] │
│ 商品・サービス │                 │                   │       │
│ 人材・組織     │                 │                   │       │
│ 財務          │                 │                   │       │
└──────────────┴────────────────┴──────────────────┴───────┘
```

## Claude Code 連携の例

```
「整理軸分析の Customer に、CUSTOMER_RESEARCH と SALES_DATA から
 取れる情報を抽出して箇条書きにして」
```

## 注意

- 「観点メモ（examples）」は PDF にあった例を UI 上でヒントとして常時表示
- 業界・業種によって追加観点が必要な場合、柔軟に拡張できる設計に
- SWOT のインプットになるため、Strength / Weakness の判定は重要
