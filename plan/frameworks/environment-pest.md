# PEST 分析

## 目的

自社・自事業に間接的に影響を与えるマクロ外部環境要因を、政治・経済・社会・技術の 4 観点から抜け漏れなく洗い出す。

## サブ要素

| サブ要素 ID | 名称 | 説明 |
|---|---|---|
| `politics` | Politics（政治的要因） | 法規制、税制、政治動向、外交 |
| `economy` | Economy（経済的要因） | 景気、物価、為替、金利、経済成長率 |
| `society` | Society（社会的要因） | 人口動態、ライフスタイル、世論、文化 |
| `technology` | Technology（技術的要因） | IT 技術、技術革新、インフラ整備 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| politics | （なし） | NEWS, INDUSTRY_REPORT |
| economy | （なし） | MARKET_STATS, NEWS |
| society | （なし） | INDUSTRY_REPORT, SNS_ANALYTICS, CUSTOMER_RESEARCH |
| technology | （なし） | INDUSTRY_REPORT, NEWS |

PEST は依存グラフの出発点なので上流フレームワークはない。

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| SWOT 分析 | Opportunity, Threat の材料 |
| 3C+C 分析（Customer） | 顧客環境の状況 |

## データスキーマ

```typescript
{
  politics: {
    items: Array<{
      text: string;            // 要因の説明
      impact: '+' | '-' | '±'; // 自社へのプラス・マイナス
      sources: string[];       // RawData ID の配列
    }>;
    informationSources: string[]; // テキストでメモ
    summary: string;              // 全体のまとめ
  };
  economy: { /* 同上 */ };
  society: { /* 同上 */ };
  technology: { /* 同上 */ };
  overallSummary: string;
}
```

## UI パターン

**2 列テーブル型**（[05-ui-patterns.md](../05-ui-patterns.md#1-2列テーブル型情報ソース--分析結果) 参照）

レイアウト：

```
┌─────────────┬─────────────────┬─────────────────┐
│ 要素         │ 情報ソース        │ 分析結果（±）     │
├─────────────┼─────────────────┼─────────────────┤
│ Politics    │ [メモ]           │ [リスト + 影響]   │
│             │ [生データリンク]  │                  │
├─────────────┼─────────────────┼─────────────────┤
│ Economy     │ ...              │ ...              │
└─────────────┴─────────────────┴─────────────────┘
```

右サイドパネル：
- 推奨される生データ種類（黄ハイライト）
- 下流：「この PEST は SWOT 分析、3C+C.Customer に流れます」

## Claude Code 連携の例

```
/collect-data {projectId} news
→ Claude Code が政治・経済関連のニュースを集めて RawData として保存

「このプロジェクトの PEST.Politics に該当する内容を、
 NEWS と INDUSTRY_REPORT の生データから抽出して下書きを作って」
→ Claude Code が DB から関連 RawData を読み、items を生成
```

## 注意

- 「Legal: 法的要因」「Environmental: 環境要因」を加えた PESTLE 分析が必要なら、サブ要素を追加可能な設計にする
- 「影響の正負」は当初は手動入力、将来的に Claude Code が候補提案
