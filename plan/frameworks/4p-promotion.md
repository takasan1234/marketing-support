# Promotion 戦略（4P）

## 目的

ターゲットに商品の魅力を効果的に伝えるための、訴求内容・メディア・予算・効果測定を設計する。

## サブ要素（8 ステップ）

| サブ要素 ID | 名称 | 内容 |
|---|---|---|
| `target_clarify` | ターゲットの明確化 | （ターゲティング由来） |
| `goal_clarify` | プロモーション目的 | 認知獲得 / 興味喚起 / 来訪促進 |
| `message` | メッセージ・キャッチコピー | 訴求内容 |
| `mix` | プロモーション・ミックス | 5 種類の組み合わせ |
| `media` | メディア選定 | 具体的な媒体 |
| `budget` | 予算 | 必要予算 |
| `execution` | 実施計画 | 実施スケジュール |
| `measurement` | 効果測定 | KPI 設定 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| target_clarify | ターゲティング | （上流経由） |
| goal_clarify | カスタマージャーニー | （上流経由） |
| message | ポジショニング、ブランドメッセージ | （上流経由） |
| media | カスタマージャーニー | SEARCH_TRENDS, SNS_ANALYTICS |
| measurement | KGI/KSF/KPI | （上流経由） |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| KGI/KSF/KPI | プロモーション指標 |
| カスタマージャーニー | タッチポイント情報 |
| CRM 分析 | 反応データ |

## データスキーマ

```typescript
{
  goalClarify: {
    psychologyModel: 'aidma' | 'aisas';
    focusStage: string;             // 例：「Awareness」「Interest」
    behaviorChange: string;
  };
  message: {
    coreMessage: string;
    catchphrase: string;
    rationale: string;
  };
  mix: {
    advertising: { adopted: boolean; details: string };       // 広告
    publicity: { adopted: boolean; details: string };         // 広報活動
    salesPromotion: { adopted: boolean; details: string };    // 販売促進
    personalSelling: { adopted: boolean; details: string };   // 人的販売
    wordOfMouth: { adopted: boolean; details: string };       // 口コミ
  };
  media: Array<{
    id: string;
    type: string;                   // 例：「動画広告」「SNS 広告」
    category: 'owned' | 'paid' | 'earned';
    name: string;
    targetReach: string;
    creative: string;               // クリエイティブの方向性
  }>;
  budget: {
    total: number;
    currency: string;
    breakdown: Array<{ mediaId: string; amount: number }>;
  };
  measurement: {
    kpis: Array<{
      name: string;
      target: string;
      unit: string;
    }>;
  };
}
```

## UI パターン

**カタログ + チェックリスト + ステップ表示**

```
【ステップ表示】
1. ターゲット明確化 → 2. 目的明確化 → 3. メッセージ作成 →
4. PM 検討 → 5. メディア選定 → 6. 予算 → 7. 実施 → 8. 効果測定

【プロモーション・ミックス（5種）】
☑ 広告 [テキスト]
☑ 広報活動 [テキスト]
☐ 販売促進
☑ 人的販売 [テキスト]
☑ 口コミ [テキスト]

【メディア選定】
オウンドメディア:
 ・自社 Web サイト [採用]
ペイドメディア:
 ・SNS 広告 [採用]
 ・動画広告 [採用]
 ・交通広告 [検討]
アーンドメディア:
 ・口コミサイト [採用]

【予算】
合計: 500万円
内訳: SNS 広告 200万、動画広告 200万、SEO 100万

【効果測定 KPI】
・認知度向上: アンケート認知度 20% UP
・コンバージョン率: 5% 以上
```

## Claude Code 連携の例

```
「ターゲットの SNS 利用傾向を SNS_ANALYTICS から分析して、
 適切なメディアミックスを提案して」
```

## 注意

- カスタマージャーニーと連動：各ステージでどのメディアが効くかを意識
- AIDMA/AISAS のステージで使うべきメディアが異なる
- 効果測定 KPI は KGI/KSF/KPI で詳細化
