---
name: freshness-auditor
description: プロジェクトの生データ鮮度を点検し、鮮度切れ・間もなく期限切れのデータをリストアップして優先度付きの再収集アクションを提示する。「鮮度切れの生データを教えて」「データの健全性チェック」のような依頼から呼ばれる。
tools: [Read, Bash]
---

# freshness-auditor スキル

## 目的

プロジェクト全体の生データ鮮度を点検し、鮮度切れ・間もなく期限切れのデータを優先度順にリストアップする。どのフレームワークへの影響が大きいかも考慮して優先度を決定する。

## 処理手順

1. **入力の確認**
   - `projectId`: 対象プロジェクトID

2. **鮮度チェック実行**
   ```bash
   npx tsx .claude/scripts/check-freshness.ts <projectId>
   ```
   出力: `{ fresh: [...], stale: [...], expiringSoon: [...] }`

3. **フレームワーク参照状況の把握**
   鮮度切れ・間もなく期限切れのデータについて、どのフレームワークから参照されているか確認:
   - 各フレームワーク種類が主に参照する RawDataType（`framework-drafter.md` のテーブル参照）
   - 参照されているフレームワークの数・重要度が優先度に直結する

4. **フレームワーク戦略上の重要度**
   | 優先度 | フレームワーク |
   |---|---|
   | 高 | SWOT, THREE_C_PLUS_C, CONCEPT_SHEET, POSITIONING |
   | 中 | PEST, FIVE_FORCES, CROSS_SWOT, SEGMENTATION |
   | 低 | VRIO, INTERNAL_ANALYSIS, KGI_KSF_KPI, CRM_ANALYSIS |

5. **優先度スコア算出**
   ```
   スコア = 経過日数（超過）× 参照フレームワーク数 × フレームワーク重要度係数
   重要度係数: 高=3, 中=2, 低=1
   ```

6. **レポート出力**
   以下の形式でレポートを生成:

```
鮮度監査レポート
プロジェクト: <projectId>
実行日時: <現在日時>

■ サマリー:
  合計生データ: X件
  鮮度OK: X件
  鮮度切れ: X件
  間もなく期限切れ（30日以内）: X件

■ 鮮度切れデータ（優先度順）:

  [優先度: 高]
  1. <タイトル>（<type>）
     期限切れ: <expiresAt>（<N>日経過）
     参照フレームワーク: <FW名>, <FW名>
     推奨アクション: /collect-data <projectId> <type>

  [優先度: 中]
  2. ...

■ 間もなく期限切れ（30日以内）:
  1. <タイトル>（<type>）
     期限: <expiresAt>（残り<N>日）

■ 推奨アクション:
  今すぐ: /refresh-data <projectId>
  優先収集: /collect-data <projectId> <最優先type>
```

## エラー時の対応

- **生データが0件**: プロジェクトにデータがまだない旨を伝え、`data-collector` スキルで収集を促す
- **API接続エラー**: サーバーの起動確認を促す
- **すべてのデータが鮮度OK**: 良好な状態であることを報告し、次の点検目安日を提示する
