# 02. データモデル

## 概要

PostgreSQL + Prisma で管理。主要エンティティは 4 つ：
1. **Project** — マーケティング対象（1事業・1製品）
2. **FrameworkEntry** — フレームワークの入力結果（バージョン管理あり）
3. **RawData** — 生データ（鮮度 TTL 付き）
4. **FrameworkRawDataLink** — フレームワーク ⇔ 生データの参照リンク

## Prisma スキーマ（案）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// プロジェクト：1事業・1製品 = 1プロジェクト
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  frameworkEntries FrameworkEntry[]
  rawData          RawData[]
}

// フレームワーク入力結果
// 同じ frameworkType でも version で複数バージョン保持
model FrameworkEntry {
  id            String       @id @default(cuid())
  projectId     String
  frameworkType FrameworkType
  version       Int          @default(1)
  isLatest      Boolean      @default(true)
  data          Json         // フレームワーク固有のスキーマで保存
  note          String?      // バージョン作成時のメモ
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  dataLinks     FrameworkRawDataLink[]

  @@unique([projectId, frameworkType, version])
  @@index([projectId, frameworkType, isLatest])
}

// 生データ
model RawData {
  id          String       @id @default(cuid())
  projectId   String
  type        RawDataType
  title       String
  content     String       // 本文（テキスト・マークダウン）
  sourceUrl   String?      // 出典 URL（Claude Code が取得した場合）
  sourceNote  String?      // 出典メモ
  collectedAt DateTime     @default(now())  // 取得日時
  expiresAt   DateTime?    // 鮮度切れ日時（type の TTL から自動算出）
  tags        String[]     // 自由タグ
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  links       FrameworkRawDataLink[]

  @@index([projectId, type])
  @@index([projectId, expiresAt])
}

// フレームワークと生データのリンク（多対多 + サブ要素情報）
model FrameworkRawDataLink {
  id                String   @id @default(cuid())
  frameworkEntryId  String
  rawDataId         String
  subElementId      String?  // 例: "politics", "customer" など
  note              String?  // なぜこの生データを参照したか
  createdAt         DateTime @default(now())

  frameworkEntry FrameworkEntry @relation(fields: [frameworkEntryId], references: [id], onDelete: Cascade)
  rawData        RawData @relation(fields: [rawDataId], references: [id], onDelete: Cascade)

  @@unique([frameworkEntryId, rawDataId, subElementId])
}

// フレームワーク種類（列挙）
enum FrameworkType {
  PEST
  FIVE_FORCES
  INTERNAL_ANALYSIS
  VRIO
  THREE_C_PLUS_C
  SWOT
  CROSS_SWOT
  SEGMENTATION
  TARGETING
  POSITIONING
  CONCEPT_SHEET
  PRODUCT_4P
  PRICE_4P
  PLACE_4P
  PROMOTION_4P
  FOUR_C_SEVEN_P
  BLUE_OCEAN
  EXPERIENCE_VALUE
  VALUE_ADD_METHODS
  KGI_KSF_KPI
  CUSTOMER_JOURNEY
  CRM_OVERVIEW
  CRM_ANALYSIS
}

// 生データ種類（列挙）
enum RawDataType {
  MARKET_STATS         // 市場統計
  INDUSTRY_REPORT      // 業界レポート
  NEWS                 // ニュース
  CUSTOMER_RESEARCH    // 顧客調査・インタビュー
  SNS_ANALYTICS        // SNS 分析
  SEARCH_TRENDS        // 検索トレンド
  LOCATION_DATA        // 位置情報・行動データ
  SALES_DATA           // 販売実績
  COMPETITOR_INFO      // 競合情報
  PARTNER_HEARING      // 協業者ヒアリング
  FINANCIAL_DATA       // 財務データ
  EXPERT_HEARING       // 専門家ヒアリング
}
```

## フレームワーク固有データの保存方針

`FrameworkEntry.data` は JSON 型で、フレームワークごとに固有スキーマを持つ。

### 例：PEST 分析
```json
{
  "politics": {
    "items": [
      { "text": "新規制 X の施行", "impact": "positive", "sources": ["rawDataId-1"] }
    ],
    "summary": "...",
    "informationSources": ["白書 2026", "..."]
  },
  "economy": { ... },
  "society": { ... },
  "technology": { ... }
}
```

各フレームワークの具体スキーマは [frameworks/](frameworks/) 配下を参照。

## バージョン管理の挙動

- 新規作成時：`version = 1`, `isLatest = true`
- 更新時：以下の2 つのモードを選択可能
  - **編集モード**：既存バージョンを上書き
  - **新バージョンモード**：`version + 1`、前のバージョンの `isLatest = false`
- 履歴を辿りたいときは `version` 列を参照（ORDER BY version DESC）

詳細は [07-versioning.md](07-versioning.md) を参照。

## 鮮度管理（TTL）

`RawData.expiresAt` は登録時に `type` の TTL から自動算出。

```
expiresAt = collectedAt + TTL_BY_TYPE[type]
```

TTL の定義は [04-raw-data-types.md](04-raw-data-types.md) を参照。
ユーザが手動で `collectedAt` を更新したら、`expiresAt` も再計算する。
