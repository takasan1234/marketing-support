# /refresh-data

## 概要

プロジェクトの鮮度切れ生データをすべて再収集する。`freshness-auditor` スキルで鮮度を確認した後、優先度の高い項目から `data-collector` スキルで再収集する。

## 使い方

```
/refresh-data <projectId> [--stale-only | --expiring-only]
```

- `projectId`: プロジェクトID
- `--stale-only`: 鮮度切れデータのみ再収集（デフォルト: 鮮度切れ + 30日以内に期限切れ）
- `--expiring-only`: 間もなく期限切れのデータのみ先行更新

## 手順

1. **鮮度監査の実行**（`freshness-auditor` スキルを使用）:
   ```bash
   npx tsx .claude/scripts/check-freshness.ts <projectId>
   ```

2. 鮮度切れ（`stale`）と間もなく期限切れ（`expiringSoon`）のデータを確認する

3. フラグに応じて対象データをフィルタリング:
   - `--stale-only`: `stale` リストのみ
   - `--expiring-only`: `expiringSoon` リストのみ
   - フラグなし: `stale` + `expiringSoon` 両方

4. **優先度を算出**（`freshness-auditor` スキルの優先度ロジックを使用）:
   - 経過日数 × 参照フレームワーク数 × フレームワーク重要度係数

5. **優先度順に再収集**:
   各対象データについて `data-collector` スキルを使用してWebから最新情報を収集:
   ```bash
   npx tsx .claude/scripts/save-raw-data.ts <projectId> \
     --type <type> \
     --title "<更新タイトル>" \
     --content "<最新コンテンツ>" \
     --source-url "<URL>"
   ```
   注意: 自社固有データ（`SALES_DATA`, `FINANCIAL_DATA`, `CUSTOMER_RESEARCH`等）はスキップし、ユーザーに手動更新を依頼する。

6. **完了レポートを出力**

## 出力例

```
鮮度チェック結果:
- 鮮度OK: 8件
- 鮮度切れ: 3件（対象）
- 間もなく期限切れ: 1件（対象）

再収集完了:
1. ✅ 国内クラウド市場統計 2024 → rawdata_new001（MARKET_STATS）
2. ✅ 競合A最新情報 → rawdata_new002（COMPETITOR_INFO）
3. ⏭️  顧客調査データ（CUSTOMER_RESEARCH）→ スキップ（手動更新が必要）
4. ✅ 業界規制ニュース 最新版 → rawdata_new003（NEWS）

4件中3件を更新しました。
手動更新が必要: 顧客調査データ
```
