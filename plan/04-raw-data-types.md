# 04. 生データ種類

## 概要

生データは 12 種類に分類。各種類に「想定鮮度（TTL）」を持つ。

## 一覧

| # | 種類 (RawDataType) | 内容 | 想定鮮度 (TTL) | 主な取得方法 |
|---|---|---|---|---|
| 1 | MARKET_STATS | 市場統計（政府統計、業界統計） | 1 年 | 官公庁、業界団体のWebサイト |
| 2 | INDUSTRY_REPORT | 業界レポート、シンクタンク調査 | 6 ヶ月 | 調査会社、シンクタンク |
| 3 | NEWS | ニュース、業界紙、新聞 | 3 ヶ月 | Web ニュース、新聞 |
| 4 | CUSTOMER_RESEARCH | 顧客調査、アンケート、インタビュー | 3 ヶ月 | 自社実施、調査会社 |
| 5 | SNS_ANALYTICS | SNS 分析、投稿データ | 1 ヶ月 | Twitter/X、Instagram の分析 |
| 6 | SEARCH_TRENDS | 検索エンジントレンド | 1 ヶ月 | Google Trends など |
| 7 | LOCATION_DATA | 位置情報、行動データ | 3 ヶ月 | 民間データ提供事業者 |
| 8 | SALES_DATA | 販売実績、購買データ、Web 解析 | 1 ヶ月 | 自社 EC、Google Analytics |
| 9 | COMPETITOR_INFO | 競合の動向、価格、商品情報 | 3 ヶ月 | 公開情報、競合 Web サイト |
| 10 | PARTNER_HEARING | 協業者ヒアリング、パートナー情報 | 6 ヶ月 | 直接対話、メール |
| 11 | FINANCIAL_DATA | 財務データ、予算、コスト構造 | 1 ヶ月 | 社内会計、財務諸表 |
| 12 | EXPERT_HEARING | 専門家ヒアリング、有識者意見 | 1 年 | コンサル、顧問、業界専門家 |

## TTL 定数の定義

```typescript
// packages/domain/src/raw-data/ttl.ts
export const TTL_BY_TYPE: Record<RawDataType, number> = {
  MARKET_STATS:      365, // days
  INDUSTRY_REPORT:   180,
  NEWS:              90,
  CUSTOMER_RESEARCH: 90,
  SNS_ANALYTICS:     30,
  SEARCH_TRENDS:     30,
  LOCATION_DATA:     90,
  SALES_DATA:        30,
  COMPETITOR_INFO:   90,
  PARTNER_HEARING:   180,
  FINANCIAL_DATA:    30,
  EXPERT_HEARING:    365,
};
```

## 鮮度切れの取り扱い

- `expiresAt < now()` の生データは「鮮度切れ」状態
- UI 上で赤バッジ表示
- それを参照しているフレームワークにも「上流データ鮮度切れ」警告（黄バッジ）
- Claude Code に「鮮度切れデータを再収集して」と依頼可能

## 各種類の典型的なフィールド

各 RawData は共通フィールド（title, content, sourceUrl, sourceNote, tags）を持つ。
種類ごとに、`content` の中に書く内容のテンプレートを定義。

### MARKET_STATS（市場統計）の例
```markdown
## 市場規模
[数値・単位]

## 成長率
[CAGR、過去傾向]

## 主要セグメント別シェア
[セグメント、シェア]

## 出典
[組織名、レポート名、発行年]
```

### CUSTOMER_RESEARCH（顧客調査）の例
```markdown
## 調査概要
- 対象：[属性、人数]
- 期間：[日付]
- 手法：[アンケート / インタビュー / フォーカスグループ]

## 主要な発見
- [箇条書き]

## 注目すべき顧客の声（インサイト）
> [引用]
```

テンプレートは UI で生データ作成時に種類別に提示する。

## Claude Code が取得を支援できる種類

| 種類 | Claude Code 支援可能 | 備考 |
|---|---|---|
| MARKET_STATS | ✅ | WebFetch で公開統計を取得 |
| INDUSTRY_REPORT | ✅ | 公開レポートのみ |
| NEWS | ✅ | WebFetch / WebSearch |
| CUSTOMER_RESEARCH | ❌ | 自社実施が前提 |
| SNS_ANALYTICS | △ | API キーが必要なので人間が用意 |
| SEARCH_TRENDS | ✅ | Google Trends など |
| LOCATION_DATA | ❌ | 有料データ |
| SALES_DATA | ❌ | 自社データ |
| COMPETITOR_INFO | ✅ | 公開情報のみ |
| PARTNER_HEARING | ❌ | 人間が実施 |
| FINANCIAL_DATA | ❌ | 自社データ |
| EXPERT_HEARING | ❌ | 人間が実施 |

詳細は [06-claude-code-integration.md](06-claude-code-integration.md) を参照。
