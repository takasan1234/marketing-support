---
name: framework-drafter
description: フレームワークの未入力・不完全なサブ要素を、関連する上流フレームワークと生データから下書きする。「SWOTの Strength を下書きして」「3C+CのCustomerを埋めて」のような依頼から呼ばれる。
tools: [Read, Bash]
---

# framework-drafter スキル

## 目的

指定フレームワークの未入力・不完全なサブ要素について、上流フレームワークデータと関連生データを元に下書きを生成し、保存する。

## フレームワーク依存チェーン

```
PEST / FIVE_FORCES / INTERNAL_ANALYSIS / VRIO
    ↓
THREE_C_PLUS_C / SWOT
    ↓
CROSS_SWOT
    ↓
SEGMENTATION / TARGETING / POSITIONING / CONCEPT_SHEET
    ↓
PRODUCT_4P / PRICE_4P / PLACE_4P / PROMOTION_4P / FOUR_C_SEVEN_P
    ↓
BLUE_OCEAN / EXPERIENCE_VALUE / VALUE_ADD_METHODS
    ↓
KGI_KSF_KPI / CUSTOMER_JOURNEY / CRM_OVERVIEW / CRM_ANALYSIS
```

## サブ要素と参照すべき上流

| フレームワーク | サブ要素 | 参照上流 FW | 参照 RawDataType |
|---|---|---|---|
| PEST | Politics | - | NEWS, INDUSTRY_REPORT |
| PEST | Economy | - | MARKET_STATS, FINANCIAL_DATA |
| PEST | Society | - | SNS_ANALYTICS, SEARCH_TRENDS |
| PEST | Technology | - | NEWS, INDUSTRY_REPORT |
| THREE_C_PLUS_C | Customer | PEST | CUSTOMER_RESEARCH, MARKET_STATS |
| THREE_C_PLUS_C | Competitor | PEST, FIVE_FORCES | COMPETITOR_INFO |
| THREE_C_PLUS_C | Company | INTERNAL_ANALYSIS, VRIO | SALES_DATA, FINANCIAL_DATA |
| THREE_C_PLUS_C | Channel | PEST | MARKET_STATS |
| SWOT | Strength | THREE_C_PLUS_C, VRIO, INTERNAL_ANALYSIS | - |
| SWOT | Weakness | THREE_C_PLUS_C, VRIO, INTERNAL_ANALYSIS | - |
| SWOT | Opportunity | PEST, FIVE_FORCES, THREE_C_PLUS_C | - |
| SWOT | Threat | PEST, FIVE_FORCES, THREE_C_PLUS_C | - |
| CROSS_SWOT | SO戦略 | SWOT | - |
| CROSS_SWOT | WO戦略 | SWOT | - |
| CROSS_SWOT | ST戦略 | SWOT | - |
| CROSS_SWOT | WT戦略 | SWOT | - |

## 処理手順

1. **入力の確認**
   - `projectId`: 対象プロジェクトID
   - `frameworkType`: 対象フレームワーク（例: `SWOT`）
   - `subElementId` (optional): 特定のサブ要素（例: `strength`）

2. **現在のフレームワークデータ取得**
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType>
   ```

3. **上流フレームワークデータ取得**
   上記テーブルを参照し、必要な上流フレームワークを取得:
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <上流FWタイプ>
   ```

4. **関連生データ取得**
   ```bash
   npx tsx .claude/scripts/list-raw-data.ts <projectId> [type] --fresh-only
   ```

5. **下書き生成**
   - 既存入力は上書きしない（提案として追記する）
   - 各下書き項目に参照元を明記する:
     ```
     [下書き] 参照: PEST.Economy (v1), MARKET_STATS rawdata_xyz
     - ...
     ```
   - subElementId が指定された場合はそのサブ要素のみ対象
   - 指定なしの場合は空/不完全なサブ要素をすべて対象

6. **下書き保存**
   既存データをベースに下書きを追記して保存:
   ```bash
   npx tsx .claude/scripts/save-framework.ts <projectId> <frameworkType> \
     --data '<更新済みdataオブジェクト>' \
     --note "AI下書き生成: <日付>"
   ```

## 注意事項

- 既存ユーザー入力は絶対に削除・上書きしない
- 下書きには必ず「[下書き]」プレフィックスと参照元情報を付ける
- 上流フレームワークが存在しない場合は、その旨をユーザーに伝え、利用可能な生データのみで下書きする
- 生データが鮮度切れの場合は警告を表示する

## エラー時の対応

- **フレームワークが存在しない**: まず `save-framework.ts` で空エントリを作成するか確認
- **上流フレームワーク未作成**: 依存する上流から先に作成するよう案内する
- **生データなし**: `data-collector` スキルで収集するよう案内する
