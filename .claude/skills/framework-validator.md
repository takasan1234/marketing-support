---
name: framework-validator
description: フレームワークの入力完成度をチェックし、充足度スコア（0-100）と不足要素のリストを返す。「PESTは埋まってる？」「SWOTを始める準備はできてる？」のような依頼や「次に進める？」ボタンから呼ばれる。
tools: [Read, Bash]
---

# framework-validator スキル

## 目的

指定フレームワークの入力完成度を検証し、充足度スコア（0-100）と具体的な不足要素をリストアップする。

## フレームワーク別サブ要素定義

各フレームワークの必須サブ要素と推奨生データ:

| フレームワーク | 必須サブ要素 | 推奨 RawDataType |
|---|---|---|
| PEST | Politics, Economy, Society, Technology | NEWS, INDUSTRY_REPORT, MARKET_STATS, SNS_ANALYTICS |
| FIVE_FORCES | 新規参入, 代替品, 買い手, 売り手, 競合 | COMPETITOR_INFO, INDUSTRY_REPORT |
| THREE_C_PLUS_C | Customer, Competitor, Company, Channel | CUSTOMER_RESEARCH, COMPETITOR_INFO, MARKET_STATS |
| SWOT | Strength, Weakness, Opportunity, Threat | - (上流FWが主な入力源) |
| CROSS_SWOT | SO戦略, WO戦略, ST戦略, WT戦略 | - (SWOTが主な入力源) |
| SEGMENTATION | セグメント定義, 評価基準, 選択結果 | CUSTOMER_RESEARCH, MARKET_STATS |
| TARGETING | ターゲットセグメント, 根拠 | - |
| POSITIONING | 軸定義, ポジション | COMPETITOR_INFO |
| CONCEPT_SHEET | WHO, WHAT, WHY, HOW | - |
| PRODUCT_4P | 製品コンセプト, 機能, 差別化 | - |
| PRICE_4P | 価格, 価格戦略, 根拠 | COMPETITOR_INFO, MARKET_STATS |
| PLACE_4P | チャネル, 流通方針 | MARKET_STATS |
| PROMOTION_4P | 施策, メッセージ, 媒体 | SNS_ANALYTICS, SEARCH_TRENDS |

## 充足度スコアの算出方法

各評価項目に重みを設定:

```
充足度スコア = (サブ要素充足スコア × 0.6)
             + (生データ参照スコア × 0.3)
             + (上流FW参照スコア × 0.1)
```

**サブ要素充足スコア**:
- 各必須サブ要素が入力済み (空でない) かチェック
- `入力済みサブ要素数 / 全必須サブ要素数 × 100`

**生データ参照スコア**:
- 推奨 RawDataType の生データが少なくとも1件リンクされているかチェック
- `リンク済み推奨タイプ数 / 全推奨タイプ数 × 100`

**上流FW参照スコア**:
- 上流フレームワークが存在するかチェック（依存グラフ参照）
- `存在する上流FW数 / 全上流FW数 × 100`（上流なしの場合は100）

## 処理手順

1. **入力の確認**
   - `projectId`: 対象プロジェクトID
   - `frameworkType`: チェック対象フレームワーク

2. **フレームワークデータ取得**
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType>
   ```
   存在しない場合は充足度0として報告。

3. **上流フレームワーク確認**
   依存グラフから上流FWを特定し、各フレームワークの存在確認:
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <上流FWタイプ>
   ```

4. **生データリンク確認**
   ```bash
   # API経由でリンク情報を取得
   # GET /api/v1/projects/:projectId/frameworks/:frameworkType/links
   ```

5. **スコア算出とレポート出力**

```
<frameworkType> 充足度レポート
プロジェクト: <projectId>

■ 総合充足度: <スコア>%
  ■■■■■■■□□□  (視覚的なバー)

■ サブ要素別充足度:
  ✅ <サブ要素名>: 入力済み（X文字）
  ⚠️  <サブ要素名>: 入力が不十分（推奨: 50文字以上）
  ❌ <サブ要素名>: 未入力

■ 生データ参照:
  ✅ MARKET_STATS: 2件リンク済み
  ❌ NEWS: 未リンク（推奨）

■ 上流フレームワーク:
  ✅ PEST v2（最新）
  ❌ FIVE_FORCES（未着手）

■ 判定:
  <充足度 80%以上> このフレームワークは完成度が高く、次のステップに進めます。
  <充足度 50-79%> 不足している項目を補強することを推奨しますが、暫定的に次のステップに進めます。
  <充足度 50%未満> 必須項目が不足しています。次のステップに進む前に補強が必要です。

■ 推奨アクション:
  1. <具体的なアクション>
  2. ...
```

## エラー時の対応

- **フレームワーク未作成**: 充足度 0% として報告し、作成を促す
- **上流FWが存在しない**: 上流から先に作成するよう依存チェーンを案内する
- **API接続エラー**: サーバーの起動確認を促す
