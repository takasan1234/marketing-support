# Place 戦略（4P）

## 目的

ターゲットに商品を届けるための販路・チャネルを設計する。リアルとデジタル、複数チャネルを組み合わせる。

## サブ要素

| サブ要素 ID | 名称 | 内容 |
|---|---|---|
| `channels` | 採用チャネル一覧 | 個別チャネルの選定 |
| `mix` | チャネルミックスの設計 | 組み合わせ方針 |
| `data_strategy` | データ取得戦略 | チャネル経由のデータ収集 |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| channels | ターゲティング、Product 戦略 | （上流経由） |
| mix | Product 戦略 | SALES_DATA |
| data_strategy | （なし） | （自社方針） |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| Promotion 戦略 | チャネル別プロモーション |
| KGI/KSF/KPI | チャネル別売上指標 |
| CRM 全体像 | データ収集点 |

## データスキーマ

```typescript
{
  channels: Array<{
    id: string;
    type: 'real' | 'digital';
    category: string;               // 例：「自社EC」「OTA」「現地販売」
    name: string;                   // 例：「自社サイト」「Amazon」
    rationale: string;              // なぜこのチャネルか
    targetSegment: string;          // 主に狙う顧客層
    dataCollection: 'yes' | 'no' | 'limited'; // 顧客データ取得可否
    note: string;
  }>;
  mix: {
    primaryChannel: string;         // 主力チャネルの id
    rationale: string;
    expectedShare: Record<string, number>; // channel id → 期待売上シェア%
  };
  dataStrategy: {
    targetData: string[];           // 取得したいデータ
    collectionMethod: string;       // 収集方法
    crmIntegration: boolean;        // CRM 連携の予定
  };
}
```

## UI パターン

**比較カタログ型**

```
【販路候補】
┌─────────────┬──────────┬────────┬────────────┐
│ チャネル名    │ タイプ    │ 採用？  │ データ取得   │
├─────────────┼──────────┼────────┼────────────┤
│ 自社サイト   │ デジタル  │ ✅ メイン│ ✅          │
│ Amazon       │ デジタル  │ ✅      │ ❌          │
│ 直営店       │ リアル    │ ⏸ 検討 │ ✅          │
│ 代理店       │ リアル    │ ❌      │ ❌          │
└─────────────┴──────────┴────────┴────────────┘

【チャネルミックス】
主力: 自社サイト
売上シェア期待: 自社サイト 60%, Amazon 30%, 直営店 10%

【データ取得戦略】
取得したいデータ: 購買履歴、閲覧履歴、会員属性
収集方法: 会員登録 + Google Analytics
CRM 連携: 予定
```

## Claude Code 連携の例

```
「このターゲット層が利用しそうな販路をリストアップして、
 それぞれのメリット・デメリットを整理して」
```

## 注意

- データ取得可能なデジタルチャネルを優先（CRM のため）
- 多すぎるチャネルは在庫管理・ブランド管理が困難
- B2B / B2C で全く違うチャネル選定になる
