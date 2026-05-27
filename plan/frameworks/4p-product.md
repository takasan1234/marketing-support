# Product 戦略（4P）

## 目的

ターゲット顧客に刺さる商品・サービスの内容を、3 層構造（コア・形態・付随機能）で設計する。

## サブ要素

| サブ要素 ID | 名称 | 内容 |
|---|---|---|
| `core` | コア（中核ベネフィット） | 商品が顧客に提供する本質的価値 |
| `form` | 形態 | 特徴、品質水準、形、ブランド名 |
| `additional` | 付随機能 | サポート、保証、アフターサービス |
| `focus` | 注力レイヤー | コア / 形態 / 付随のどれに注力するか |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| core | ポジショニング、ターゲティング | CUSTOMER_RESEARCH |
| form | （現在の商品状況） | SALES_DATA, COMPETITOR_INFO |
| additional | ターゲット顧客のニーズ | CUSTOMER_RESEARCH |
| focus | ターゲットの優先事項 | CUSTOMER_RESEARCH |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| Price 戦略 | 商品の価値水準 |
| Place 戦略 | 商品の特性 |
| Promotion 戦略 | 訴求すべきポイント |
| KGI/KSF/KPI | 商品の指標 |

## データスキーマ

```typescript
{
  core: {
    benefit: string;                // 中核ベネフィット（一言）
    description: string;            // 詳細
    examples: string[];             // 該当する商品例
    sources: string[];              // RawData ID
  };
  form: {
    features: string[];             // 特徴
    qualityLevel: string;           // 品質水準
    brandName: string;
    category: string;
  };
  additional: {
    services: string[];             // 付帯サービス
    guarantees: string[];           // 保証
    supportLevel: string;
  };
  focus: 'core' | 'form' | 'additional';
  focusRationale: string;           // なぜそのレイヤーに注力するか
}
```

## UI パターン

**ツリー型（同心円バリエーション）**

```
              ┌──────────────┐
              │ 付随機能       │
              │ ・サポート      │
              │ ・保証          │
              │   ┌──────┐    │
              │   │ 形態  │    │
              │   │ ・特徴│    │
              │   │ ・品質│    │
              │   │ ┌──┐ │    │
              │   │ │コア│ │    │
              │   │ │便益│ │    │
              │   │ └──┘ │    │
              │   └──────┘    │
              └──────────────┘

【注力レイヤー】 [● コア] [○ 形態] [○ 付随]
注力理由: [テキスト]
```

機能：
- 同心円の各レイヤーに項目を入力
- 「注力レイヤー」を選択（PDF の指針：富裕層→コア、FIT→形態、付加価値型→付随）
- ターゲットのニーズと連携

## Claude Code 連携の例

```
「ポジショニングと CUSTOMER_RESEARCH から、Product 3 層構造の
 各レイヤーに何を入れるべきか提案して」
```

## 注意

- 全てを充実させようとせず、注力レイヤーを 1 つに絞ることが重要
- ターゲットが何を重視するかで注力レイヤーが変わる
