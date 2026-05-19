# /new-version

## 概要

指定フレームワークの新バージョンを作成する。前バージョンのデータをベースに、更新内容を加えて新バージョンとして保存する。

## 使い方

```
/new-version <projectId> <frameworkType> [--note "更新理由"]
```

- `projectId`: プロジェクトID
- `frameworkType`: フレームワーク種類（例: `SWOT`, `PEST`）
- `--note`: バージョン更新の理由・コメント（推奨）

### 指定可能な frameworkType

```
PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO,
THREE_C_PLUS_C, SWOT, CROSS_SWOT,
SEGMENTATION, TARGETING, POSITIONING, CONCEPT_SHEET,
PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P, FOUR_C_SEVEN_P,
BLUE_OCEAN, EXPERIENCE_VALUE, VALUE_ADD_METHODS,
KGI_KSF_KPI, CUSTOMER_JOURNEY, CRM_OVERVIEW, CRM_ANALYSIS
```

## 手順

1. **現在の最新バージョンを取得**:
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType>
   ```

2. 取得したデータを確認し、現在のバージョン番号（`version` フィールド）を記録する

3. **ユーザーに更新内容の確認**:
   - 「どの部分を更新しますか？」と問いかけるか、既に具体的な変更内容が指示されている場合はそのまま進む

4. **新バージョンとして保存**（`--new-version` フラグを使用）:
   ```bash
   npx tsx .claude/scripts/save-framework.ts <projectId> <frameworkType> \
     --data '<更新済みdataオブジェクト>' \
     --note "<更新理由>" \
     --new-version
   ```

5. **保存完了を報告**:
   - 新しいバージョン番号
   - 前バージョンとの主な変更点（ `version-differ` スキルを使って差分サマリーを生成）
   - 下流フレームワークへの影響（`dependency-tracer` スキルで確認）

## 出力例

```
新バージョン作成完了:
- フレームワーク: SWOT
- 旧バージョン: v2
- 新バージョン: v3
- 更新日時: 2024-06-15 14:30

主な変更点:
- Threat に「海外大手の参入リスク」を追加
- Opportunity に「規制緩和による新市場」を追加

下流への影響:
- CROSS_SWOT v2 → 再生成を推奨（/new-version <projectId> CROSS_SWOT）
```
