# ブルー・オーシャン戦略

## 目的

競合のいない新しい市場空間を切り拓くため、戦略キャンバスで現状を可視化し、4 つのアクションで提供価値とコストを同時に最適化する。

## サブ要素

| サブ要素 ID | 名称 | 内容 |
|---|---|---|
| `canvas` | 戦略キャンバス | 業界の競争要素 × レベル |
| `four_actions` | 4 つのアクション | 取り除く / 減らす / 増やす / 付け加える |
| `value_innovation` | バリューイノベーション | 新しい提供価値の定義 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| canvas | 5Forces 分析、ポジショニング | COMPETITOR_INFO, CUSTOMER_RESEARCH |
| four_actions | （Product 戦略と相互参照） | CUSTOMER_RESEARCH |
| value_innovation | 戦略キャンバス + 4 つのアクション | （内部処理） |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| Product 戦略 | コア・形態・付随機能の見直し |
| Price 戦略 | 価格水準の見直し |
| ポジショニング | 新しいポジション |

## データスキーマ

```typescript
{
  canvas: {
    competitionFactors: Array<{    // 横軸：競争要素
      id: string;
      name: string;                // 例：「価格」「機能数」「サポート」
      order: number;
    }>;
    players: Array<{
      id: string;
      name: string;                // 「自社」or 競合名
      type: 'self' | 'competitor' | 'target';
      levels: Record<string, number>; // factorId → レベル(0-10)
    }>;
  };
  fourActions: {
    eliminate: Array<{             // 取り除く
      factorId: string;
      rationale: string;
    }>;
    reduce: Array<{                // 減らす
      factorId: string;
      currentLevel: number;
      newLevel: number;
      rationale: string;
    }>;
    raise: Array<{                 // 増やす
      factorId: string;
      currentLevel: number;
      newLevel: number;
      rationale: string;
    }>;
    create: Array<{                // 付け加える
      newFactorName: string;
      newLevel: number;
      rationale: string;
    }>;
  };
  valueInnovation: {
    coreInnovation: string;        // 新しい提供価値の核
    targetCustomer: string;        // 新しい顧客層
    expectedCostReduction: string;
    expectedValueIncrease: string;
  };
}
```

## UI パターン

**インタラクティブ視覚化型（折れ線グラフ）**

```
【戦略キャンバス】

レベル
  10 │
  9  │
  8  │     ●─────●
  7  │    /       \
  6  │   ●         ●─●
  5  │              │
  4  │ ●            │      ●（自社・狙う）
  3  │  \          ●─●─●
  2  │   ●       
  1  │    \─●
  0  │
       価格 機能 サポ 体験 速度  新要素
       └─現在の自社  ─現在の競合  ┄狙う自社─┘

【4 つのアクション】
取り除く: 価格 / 過剰機能
減らす:   サポート 8 → 4
増やす:   体験 5 → 9
付け加える: 新要素「リアルタイム支援」 0 → 8

【バリューイノベーション】
コア: [テキスト]
ターゲット: [テキスト]
コスト削減: [テキスト]
価値向上: [テキスト]
```

機能：
- 横軸（競争要素）は動的追加
- 各プレイヤー（自社・競合・狙う位置）の折れ線を描画
- 4 つのアクションを実行すると、「狙う自社」の折れ線が変化
- 関連の Product 戦略への自動反映

## Claude Code 連携の例

```
「業界の競争要素を 5Forces と COMPETITOR_INFO から抽出して、
 戦略キャンバスの factors を構築して」

「現在の自社と競合のレベルから、4 つのアクションの候補を提案」
```

## 注意

- 競合のいないポジションを狙うので、ポジショニングと密接に関連
- 「取り除く」「減らす」がコスト削減、「増やす」「付け加える」が価値向上
- 同時に達成するのがブルーオーシャンの本質
