# /diff-versions

## 概要

同じフレームワークの2バージョン間の差分を要約する。`version-differ` スキルのショートカット。

## 使い方

```
/diff-versions <projectId> <frameworkType> <v1> <v2>
```

- `projectId`: プロジェクトID
- `frameworkType`: フレームワーク種類（例: `SWOT`）
- `v1`: 比較元バージョン番号（古い方）
- `v2`: 比較先バージョン番号（新しい方）

バージョン一覧を確認するには:
```bash
# APIで確認
curl http://localhost:8080/api/v1/projects/<projectId>/frameworks/<frameworkType>/versions
```

## 手順

1. **両バージョンのデータ取得**:
   ```bash
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType> --version <v1>
   npx tsx .claude/scripts/load-framework.ts <projectId> <frameworkType> --version <v2>
   ```

2. `version-differ` スキルを使用して差分を分析する:
   - サブ要素ごとに追加・削除・変更・変更なしを分類
   - 単純な文字列差分ではなく、意味的な変化を識別する
   - 更新ノート（`note` フィールド）も比較する

3. **差分サマリーを出力**（`version-differ` スキルの出力フォーマットに従う）

## 出力例

```
SWOT バージョン差分レポート
比較: v1（2024-01-15）→ v2（2024-03-20）

■ 更新ノート:
  v1: 初版
  v2: 競合分析更新後に再評価

■ サブ要素別差分:

[strength]
  変更種別: 拡張
  変化の概要: 知的財産（特許3件）が新たな強みとして追加された。

[weakness]
  変更種別: 変更なし

[opportunity]
  変更種別: 微修正
  変化の概要: 表現の明確化。趣旨は同じ。

[threat]
  変更種別: 変更(重要)
  変化の概要: 抽象的な「競争激化」から、具体的な「海外大手2社の参入による価格競争」へ更新。

■ 変更サマリー:
  変更: 2件（うち重要: 1件）、追加: 0件、削除: 0件、変更なし: 1件

■ 全体的な変化の解釈:
  競合情報の更新を受けて、脅威の具体性が増した。強みについても知的財産が新たに認識された。
  全体的に外部環境への意識が高まった改訂といえる。
```
