---
name: dependency-tracer
description: フレームワークの上流・下流依存関係を追跡し、欠けている入力と更新が必要な下流を報告する。「SWOTに必要な上流は何？」「PESTを更新したら何に影響する？」のような依頼から呼ばれる。
tools: [Read, Bash]
---

# dependency-tracer スキル

## 目的

指定フレームワークについて、上流（必要な入力）と下流（影響を受ける出力）を追跡し、現在の充足状況と更新推奨事項を報告する。

## フレームワーク依存グラフ（完全版）

```
レイヤー1 (環境分析):
  PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO

レイヤー2 (統合分析):
  THREE_C_PLUS_C  ← PEST, FIVE_FORCES, INTERNAL_ANALYSIS
  SWOT            ← PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO, THREE_C_PLUS_C

レイヤー3 (方向性):
  CROSS_SWOT      ← SWOT

レイヤー4 (戦略策定):
  SEGMENTATION    ← THREE_C_PLUS_C, SWOT, CROSS_SWOT
  TARGETING       ← SEGMENTATION
  POSITIONING     ← SEGMENTATION, TARGETING
  CONCEPT_SHEET   ← SEGMENTATION, TARGETING, POSITIONING, SWOT

レイヤー5 (マーケティングMix):
  PRODUCT_4P      ← CONCEPT_SHEET, POSITIONING
  PRICE_4P        ← CONCEPT_SHEET, POSITIONING
  PLACE_4P        ← CONCEPT_SHEET, TARGETING
  PROMOTION_4P    ← CONCEPT_SHEET, TARGETING, POSITIONING
  FOUR_C_SEVEN_P  ← PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P

レイヤー6 (差別化・価値):
  BLUE_OCEAN      ← SWOT, FIVE_FORCES
  EXPERIENCE_VALUE← CONCEPT_SHEET, CUSTOMER_JOURNEY
  VALUE_ADD_METHODS← EXPERIENCE_VALUE

レイヤー7 (KPI・実行):
  KGI_KSF_KPI     ← CONCEPT_SHEET, FOUR_C_SEVEN_P
  CUSTOMER_JOURNEY← CONCEPT_SHEET, TARGETING, POSITIONING
  CRM_OVERVIEW    ← CUSTOMER_JOURNEY, TARGETING
  CRM_ANALYSIS    ← CRM_OVERVIEW
```

## 処理手順

1. **入力の確認**
   - `projectId`: 対象プロジェクトID
   - `frameworkType`: チェック対象フレームワーク（例: `SWOT`）

2. **対象フレームワークの現状確認**
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType>
   ```

3. **上流フレームワークの状態確認**
   依存グラフから上流フレームワーク一覧を取得し、それぞれの状態を確認:
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <上流FWタイプ>
   ```
   各上流について:
   - 存在するか (DB に記録があるか)
   - 最終更新日が対象FWより新しいか
   - 参照している生データが鮮度切れでないか

4. **下流フレームワークの状態確認**
   依存グラフから下流フレームワーク一覧を取得し、それぞれの状態を確認:
   - 下流FWが存在する場合: 対象FWの最終更新日より前に作成されているか確認
   - 対象FWの更新後に下流が更新されていなければ「再生成推奨」と判定

5. **レポート出力**
   以下の形式でレポートを生成:

```
<frameworkType> 分析の依存状態レポート

■ 上流入力の状態:
  ✅ <FW名> v<n>（最新・鮮度OK）
  ⚠️  <FW名> v<n>（鮮度切れの生データを参照）
  ❌ <FW名>（未着手）

■ 下流への影響:
  ✅ <FW名> v<n>（対象FW更新後に再生成済み）
  ⚠️  <FW名> v<n>（対象FWの古いバージョンを参照、再生成推奨）
  - <FW名>（未着手、影響なし）

■ 推奨アクション:
  1. <優先度高> <具体的なアクション>
  2. <優先度中> ...
```

## エラー時の対応

- **フレームワーク未作成**: 「未着手」として記録し、先に作成すべき上流を案内する
- **API接続エラー**: サーバーの起動確認を促す
- **データ取得エラー**: エラーの詳細を表示して継続可能な範囲で処理する
