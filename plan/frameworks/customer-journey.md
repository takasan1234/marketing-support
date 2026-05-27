# カスタマージャーニー（AIDMA / AISAS）

## 目的

ターゲット顧客が認知→検討→購入→共有に至る一連の体験を可視化し、各ステージでの行動・思考・タッチポイントを設計する。

## 心理モデル

### AIDMA（伝統的）
| ステージ | 意味 |
|---|---|
| Attention | 注目 |
| Interest | 興味 |
| Desire | 欲求 |
| Memory | 記憶 |
| Action | 行動 |

### AISAS（インターネット時代）
| ステージ | 意味 |
|---|---|
| Attention | 注目 |
| Interest | 興味 |
| Search | 検索 |
| Action | 行動 |
| Share | 共有 |

## サブ要素

| サブ要素 ID | 内容 |
|---|---|
| `model` | 採用する心理モデル |
| `stages` | 各ステージの行動・思考・タッチポイント |
| `media_mapping` | ステージ別のメディアマッピング |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| stages | ターゲティング、ポジショニング | CUSTOMER_RESEARCH, SNS_ANALYTICS |
| media_mapping | Promotion 戦略 | SEARCH_TRENDS |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| Promotion 戦略 | タッチポイント設計 |
| CRM 分析 | ステージ別の顧客行動分析 |

## データスキーマ

```typescript
{
  model: 'aidma' | 'aisas' | 'custom';
  customStages?: string[];           // カスタムモデルの場合
  stages: Array<{
    id: string;
    name: string;                    // 例：「Attention」「Search」
    order: number;
    customerActions: string[];       // 顧客の行動
    customerThoughts: string[];      // 思考・感情
    touchpoints: Array<{             // タッチポイント
      type: string;                  // 例：「動画広告」「SNS」
      name: string;
      effectiveness: 'low' | 'medium' | 'high';
    }>;
    painPoints: string[];            // 課題・障害
    opportunities: string[];         // 改善機会
    relatedMediaId?: string;         // Promotion 戦略のメディア ID 参照
  }>;
}
```

## UI パターン

**インタラクティブ視覚化型（横スクロール）**

```
【心理モデル】 [● AIDMA  ○ AISAS  ○ カスタム]

【カスタマージャーニー】

┌────────────┬────────────┬────────────┬────────────┬────────────┐
│  Attention │  Interest  │   Desire   │   Memory   │   Action   │
├────────────┼────────────┼────────────┼────────────┼────────────┤
│ 顧客行動    │            │            │            │            │
│ ・YouTube    │ ・Insta で  │ ・店舗を    │ ・忘れない  │ ・サイトで  │
│   広告を見る │   検索      │   調べる    │   よう保存  │   購入      │
│             │            │            │            │            │
│ 思考・感情  │            │            │            │            │
│ おっ、何だ？│ よさそう    │ 行きたい！  │ いつかね    │ 楽しみ！    │
│             │            │            │            │            │
│ タッチポイント│           │            │            │            │
│ 動画広告 [高]│ SNS [中]    │ Web [高]    │ DM [中]     │ EC [高]    │
└────────────┴────────────┴────────────┴────────────┴────────────┘

[ステージ追加 +] [PNG/PDF エクスポート]
```

機能：
- ステージごとに「行動」「思考」「タッチポイント」「課題」「機会」を入力
- タッチポイントの効果度を 3 段階で評価
- Promotion 戦略のメディアと連携
- 印刷・エクスポート対応

## Claude Code 連携の例

```
「ターゲット層が AIDMA の各ステージでどんな行動をするか、
 SNS_ANALYTICS と SEARCH_TRENDS から推定して」
```

## 注意

- ターゲットセグメントごとに別ジャーニーを作るのが理想
- 「タッチポイント」と「Promotion メディア」を別概念として扱う
- 顧客行動の検証は SNS / 検索データで継続的に行う
