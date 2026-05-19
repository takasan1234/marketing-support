# 3C+C 分析

## 目的

外部環境分析・内部環境分析の結果を 4 観点（Company / Customer / Competitor / Co-Operator）に整理し、事業の重要成功要因（KSF）を導出する。

## サブ要素

| サブ要素 ID | 名称 | 説明 |
|---|---|---|
| `company` | Company（自社） | 自社の動向、強み、課題 |
| `customer` | Customer（顧客） | 顧客の動向、ニーズ |
| `competitor` | Competitor（競合） | 競合の動向、競争状況 |
| `co_operator` | Co-Operator（協業者） | パートナー、サプライヤー、関連業者の動向 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| company | 整理軸分析 | FINANCIAL_DATA, SALES_DATA |
| customer | PEST 分析、整理軸分析 | MARKET_STATS, CUSTOMER_RESEARCH |
| competitor | 5Forces 分析 | COMPETITOR_INFO, INDUSTRY_REPORT |
| co_operator | （直接ヒアリング） | PARTNER_HEARING, EXPERT_HEARING |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| KGI/KSF/KPI | KSF（重要成功要因）の材料 |

## データスキーマ

```typescript
{
  company: {
    items: Array<{
      text: string;
      sources: string[];               // RawData ID
      upstreamFrameworks: FrameworkType[]; // 参照した上流 FW
    }>;
    informationSources: string[];
    summary: string;
  };
  customer: { /* 同上 */ };
  competitor: { /* 同上 */ };
  co_operator: { /* 同上 */ };
  ksf: string[];                       // 導出された重要成功要因
  overallSummary: string;
}
```

## UI パターン

**2 列テーブル型 + KSF セクション**

```
┌─────────────┬─────────────────────┬─────────────────┐
│ 観点         │ 情報ソース           │ 分析結果         │
│             │ （上流参照含む）       │                 │
├─────────────┼─────────────────────┼─────────────────┤
│ Company     │ ← 整理軸分析の結果   │ ...             │
│             │ + RawData          │                 │
├─────────────┼─────────────────────┼─────────────────┤
│ Customer    │ ← PEST 分析 +       │ ...             │
│             │   整理軸分析の結果   │                 │
├─────────────┼─────────────────────┼─────────────────┤
│ Competitor  │ ← 5Forces の結果    │ ...             │
├─────────────┼─────────────────────┼─────────────────┤
│ Co-Operator │ ← PARTNER_HEARING   │ ...             │
└─────────────┴─────────────────────┴─────────────────┘

【KSF（重要成功要因）】
- [自由記入]
- [自由記入]
```

「情報ソース」列に上流フレームワーク参照を埋め込みできるのが特徴。

## Claude Code 連携の例

```
「3C+C 分析を、最新の PEST、5Forces、整理軸分析の結果から
 下書きしてほしい。Co-Operator は空欄でいい」
→ Claude Code が他フレームワークの結果を集めて自動構築
```

## 注意

- サブ要素ごとに参照すべき上流が違うのが最大の特徴
- UI 上で各サブ要素の「あなたが今見るべき上流」を強くガイドする
- KSF は KGI/KSF/KPI フレームワークの入力となる
