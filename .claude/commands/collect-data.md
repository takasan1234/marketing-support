# /collect-data

## 概要

指定プロジェクトの指定種類の生データをWebから収集してDBに保存する。`data-collector` スキルのショートカット。

## 使い方

```
/collect-data <projectId> <type> [topic]
```

- `projectId`: プロジェクトID（`list-projects.ts` で確認可能）
- `type`: 収集する RawDataType（下記参照）
- `topic`: 収集テーマ（省略時はプロジェクト名から推定）

### 指定可能な type

| type | 説明 |
|---|---|
| `MARKET_STATS` | 市場規模・成長率統計 |
| `INDUSTRY_REPORT` | 業界動向レポート |
| `NEWS` | 業界・規制ニュース |
| `SEARCH_TRENDS` | 検索トレンド |
| `COMPETITOR_INFO` | 競合他社の公開情報 |
| `SNS_ANALYTICS` | SNS上のトレンド・言及 |

## 手順

1. プロジェクト情報の確認:
   ```bash
   npx tsx .claude/scripts/list-projects.ts
   ```

2. `data-collector` スキルを参照し、指定された `type` と `topic` に基づいてWebからデータを収集する

3. 収集した内容を構造化し、適切なタイトルとタグを付けて保存:
   ```bash
   npx tsx .claude/scripts/save-raw-data.ts <projectId> \
     --type <type> \
     --title "<タイトル>" \
     --content "<構造化されたコンテンツ>" \
     --source-url "<URL>" \
     --tags "<タグ1>,<タグ2>"
   ```

4. 保存したデータのIDとタイトルを報告する

## 出力例

```
収集完了:
- ID: rawdata_abc123
- タイトル: 国内SaaS市場規模 2024年版
- 種類: MARKET_STATS
- 期限: 2024-12-31 (180日後)
- ソース: https://www.meti.go.jp/...
```
