# ターゲティング

## 目的

セグメンテーションで分けたセグメントの中から、自社が狙うべき市場を選定する。

## サブ要素

| サブ要素 ID | 内容 |
|---|---|
| `evaluation` | 各セグメントの評価 |
| `selection` | メイン・サブターゲットの選定 |
| `rationale` | 選定理由 |

## 上流（参照すべき）

| 入力 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| セグメント一覧 | セグメンテーション | （セグメンテーション経由） |
| 市場規模 | （なし） | MARKET_STATS, INDUSTRY_REPORT |
| セグメント別需要 | （なし） | CUSTOMER_RESEARCH, SNS_ANALYTICS |
| 競合の動向 | 5Forces 分析 | COMPETITOR_INFO |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| ポジショニング | メインターゲット |
| 戦略コンセプトシート | ターゲット情報 |
| 4P 全体 | ターゲット情報 |
| カスタマージャーニー | ターゲットの行動を分析 |

## データスキーマ

```typescript
{
  evaluations: Array<{
    segmentId: string;              // セグメンテーションの segment.id
    marketSize: string;             // 市場規模（数値 or 範囲）
    growthRate: string;             // 成長率
    competition: 'low' | 'medium' | 'high'; // 競争状況
    fitWithStrengths: 'low' | 'medium' | 'high'; // 自社の強みとの適合
    expectedRoi: 'low' | 'medium' | 'high';      // 期待 ROI
    note: string;
    sources: string[];              // RawData ID
  }>;
  selection: {
    mainTarget: string;             // セグメント ID
    subTargets: string[];           // セグメント ID 配列
    rationale: string;              // 選定理由
  };
  approach: 'concentrated' | 'differentiated' | 'undifferentiated';
}
```

`approach`:
- concentrated: 集中型マーケティング
- differentiated: 差別型マーケティング
- undifferentiated: 無差別型マーケティング

## UI パターン

**比較カタログ型**

セグメントごとにカードを表示し、5 つの評価軸でスコアリング。

```
【セグメント別評価】
┌─────────────────────────────────┐
│ セグメント A: 20代女性アニメ好き      │
├─────────────────────────────────┤
│ 市場規模：    [大 ✕] [中 ✓] [小]   │
│ 成長率：      [高 ✓] [中]    [低]   │
│ 競争状況：    [激] [中 ✓]  [緩]    │
│ 自社強みとの適合: [高 ✓]            │
│ 期待 ROI：    [高 ✓]                │
│                                    │
│ メモ：[テキスト]                    │
└─────────────────────────────────┘
[★ メインターゲット] [☆ サブターゲット]

【選定結果】
メインターゲット: セグメント A
サブターゲット: セグメント B, C
アプローチ: 集中型マーケティング
選定理由: [テキスト]
```

## Claude Code 連携の例

```
「セグメンテーションで挙げた 5 つのセグメントの市場規模を、
 MARKET_STATS と INDUSTRY_REPORT から数値化して」
```

## 注意

- 「ニッチすぎる選定」を避けるため、市場規模の確認は必須
- 自社の強み（VRIO / 整理軸の Strength）との適合度を重視
- 1 つに絞らず、メイン + サブで段階的に展開するのが現実的
