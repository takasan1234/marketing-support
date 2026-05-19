---
name: data-collector
description: 指定プロジェクトの指定種類の生データをWebから収集してDBに保存する。「市場統計を集めて」「競合情報を調べて」「業界ニュースを収集して」のような依頼や /collect-data コマンドから呼ばれる。
tools: [WebSearch, WebFetch, Bash]
---

# data-collector スキル

## 目的

指定されたプロジェクトと生データ種類について、Webから情報を収集し、構造化してDBに保存する。

## 対応する RawDataType（公開情報のみ）

| 種類 | 説明 | 主なソース |
|---|---|---|
| `MARKET_STATS` | 市場規模・成長率統計 | 調査会社レポート、政府統計 |
| `INDUSTRY_REPORT` | 業界動向レポート | 業界団体、シンクタンク |
| `NEWS` | 業界・規制ニュース | ニュースサイト、官報 |
| `SEARCH_TRENDS` | 検索トレンド | Google Trends |
| `COMPETITOR_INFO` | 競合他社の公開情報 | 競合サイト、IR情報 |
| `SNS_ANALYTICS` | SNS上のトレンド・言及 | Twitter/X, Reddit等の公開データ |

**注意**: 自社固有データ（`SALES_DATA`, `FINANCIAL_DATA`, `CUSTOMER_RESEARCH`, `PARTNER_HEARING`, `EXPERT_HEARING`, `LOCATION_DATA`）はこのスキルの対象外。

## 処理手順

1. **入力の確認**
   - `projectId`: 対象プロジェクトのID
   - `type`: 収集する RawDataType
   - `topic`: 収集テーマ（例: 「国内SaaS市場規模」）

2. **ソース探索**
   - WebSearch で関連ソースを検索（3〜5件を目安）
   - 検索クエリ例: `[topic] 統計 2024 site:gov.jp OR site:meti.go.jp`

3. **コンテンツ取得**
   - WebFetch で各ソースの内容を取得
   - 必要な情報を構造化テキストに整形

4. **構造化**
   種類ごとのテンプレートに沿って整形:

   **MARKET_STATS**:
   ```
   - 市場規模: XXX億円（YYYY年）
   - 成長率: X.X%（CAGR）
   - 予測期間: YYYY〜YYYY年
   - 出典: [ソース名]
   ```

   **COMPETITOR_INFO**:
   ```
   - 企業名: XXX
   - 主要製品/サービス: ...
   - 価格帯: ...
   - 強み: ...
   - 弱み: ...
   - 出典: [URL]
   ```

   **NEWS**:
   ```
   - 日付: YYYY-MM-DD
   - 概要: ...
   - 影響: ...
   - 出典: [URL]
   ```

5. **DB保存**
   ```bash
   npx tsx .claude/scripts/save-raw-data.ts <projectId> \
     --type <TYPE> \
     --title "<タイトル>" \
     --content "<構造化されたコンテンツ>" \
     --source-url "<元URL>" \
     --tags "<関連タグ（カンマ区切り）>"
   ```

6. **完了報告**
   保存した RawData の ID とタイトルを返す。

## 例

### 呼び出し例
```
市場統計データを収集して。プロジェクトID: proj_abc123、種類: MARKET_STATS、テーマ: 国内クラウドサービス市場
```

### 実行例
```bash
# 1. 検索
WebSearch: "国内クラウドサービス市場 規模 2024 統計"

# 2. 取得
WebFetch: https://www.soumu.go.jp/...

# 3. 保存
npx tsx .claude/scripts/save-raw-data.ts proj_abc123 \
  --type MARKET_STATS \
  --title "国内クラウドサービス市場規模 2024年版" \
  --content "市場規模: 1.2兆円（2024年）\n成長率: 18.5%（CAGR）\n..." \
  --source-url "https://www.soumu.go.jp/..." \
  --tags "クラウド,SaaS,市場規模"
```

## エラー時の対応

- **ソースが見つからない**: 検索クエリを変えて再試行。3回試みて見つからなければユーザーに報告。
- **API接続エラー**: API サーバー (`http://localhost:8080`) が起動しているか確認するよう促す。
- **保存エラー**: エラーメッセージを表示し、手動での保存方法を案内する。
