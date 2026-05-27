---
name: review
description: CodeRabbit スタイルのコードレビュースキル。差分のみを解析し、GitHub PR にインラインコメントを直接投稿する。
---

# /review

CodeRabbit スタイルのコードレビュー。**差分のみ**を解析し、GitHub PR Review API でインラインコメントを投稿する。

## 使用方法

```
/review [PR番号]
```

- PR番号あり: 指定 PR をレビュー（例: `/review 42`）
- PR番号なし: 現在ブランチの open PR を自動検出

---

## 実行フロー

### Step 1: PR 情報の取得

```bash
# PR番号指定あり
gh pr view {番号} --json number,headRefOid,baseRefName,headRefName,title,body

# 番号なし → 現在ブランチの PR を検出
gh pr view --json number,headRefOid,baseRefName,headRefName,title,body
```

### Step 2: 差分の取得（差分のみをレビュー対象にする）

```bash
# PR の差分を取得（unified diff 形式）
gh pr diff {PR番号} --patch
```

差分から以下を抽出する：
- 変更ファイル一覧（`diff --git a/... b/...`）
- 各ファイルの追加行（`+` で始まる行）と行番号
- 削除行（`-` で始まる行）と行番号
- コンテキスト行（変更周辺の未変更行）

**重要**: GitHub PR Review API のインラインコメントは **diff に含まれる行にのみ** 配置できる。
追加行（`+`）→ `side: "RIGHT"`、削除行（`-`）→ `side: "LEFT"`、コンテキスト行 → `side: "RIGHT"` を使う。

### Step 3: 差分の解析

差分を **ファイル単位** で処理する。各ファイルについて：

1. 変更された行の内容を読む（diff から直接取得）
2. 必要に応じて `Read` ツールで周辺コンテキストを読む
3. プロジェクト規約（`docs/architecture.md`, `docs/frontend-guidelines.md`）と照合

**解析対象は差分に含まれる変更のみ**。変更されていないコードには触れない。

### Step 4: Walkthrough コメントの作成（PR 全体コメント）

CodeRabbit と同形式の Walkthrough を PR コメントとして投稿する：

```bash
gh pr comment {PR番号} --body "$(cat <<'EOF'
## Walkthrough

{変更全体の1〜2行サマリー}

## Changes

| File | Summary |
|------|---------|
| `path/to/file.ts` | 変更内容の要約 |
| `path/to/other.ts` | 変更内容の要約 |

## Assessment

{全体的な評価。良い点・懸念点を簡潔に}

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 5: インラインコメントの投稿

GitHub PR Review API を使い、差分の各行にコメントを付ける。

#### JSON ファイルの作成

```bash
cat > /tmp/review_{PR番号}.json << 'JSONEOF'
{
  "commit_id": "{headRefOid}",
  "body": "",
  "event": "COMMENT",
  "comments": [
    {
      "path": "変更されたファイルのパス（リポジトリルートからの相対パス）",
      "line": 追加行の実際のファイル行番号（整数）,
      "side": "RIGHT",
      "body": "コメント本文"
    }
  ]
}
JSONEOF
```

#### API 呼び出し

```bash
gh api repos/{owner}/{repo}/pulls/{PR番号}/reviews \
  --method POST \
  --input /tmp/review_{PR番号}.json
```

#### owner/repo の取得

```bash
gh repo view --json nameWithOwner -q '.nameWithOwner'
```

---

## インラインコメントの制約

| 制約 | 説明 |
|------|------|
| 配置できる行 | diff に含まれる行のみ（追加行・削除行・コンテキスト行） |
| 行番号 | `side: "RIGHT"` の場合は変更後ファイルの行番号 |
| コメント数 | 問題がない場合は投稿しない（ノイズを避ける） |
| 対象 | **変更された箇所のみ** をコメント。未変更コードには触れない |

---

## コメントフォーマット

### 重大度の絵文字プレフィックス

| 重大度 | 絵文字 | 使用場面 |
|--------|--------|---------|
| Critical | 🔴 | バグ・セキュリティ脆弱性・データロスのリスク |
| Warning | ⚠️ | ベストプラクティス違反・将来の問題になりうる箇所 |
| Suggestion | 💡 | 改善提案（対応は任意） |
| Nitpick | 🔧 | スタイル・命名など軽微な指摘 |
| Praise | ✨ | 良い実装への称賛 |

### コメント本文テンプレート

```markdown
{絵文字} **[{重大度}] {問題のタイトル}**

{問題の説明。なぜ問題なのかを1〜2文で説明}

```suggestion
{修正後のコードをそのまま記載（GitHub の suggestion 機能）}
```
```

**コード提案がある場合は必ず `suggestion` コードブロックを使う**（GitHub UI から1クリックで適用可能になる）。

### 良い例

```markdown
⚠️ **[Warning] `as unknown as` 二段階キャストは型安全性を損なう**

Prisma enum と Domain enum を `as unknown as` で強制変換しています。
enum 値の追加・変更時に実行時エラーが起きる可能性があります。

```suggestion
const TYPE_MAP: Record<PrismaRawDataType, RawDataType> = {
  NEWS: RawDataType.NEWS,
  SURVEY: RawDataType.SURVEY,
};
type: TYPE_MAP[model.type],
```
```

---

## レビュー観点（差分の変更箇所について）

### コード品質
- `as unknown as` / `as any` などの型安全性を損なうキャスト
- 空文字列・null・undefined の不正な初期値
- 重複コード（同じパターンが複数ファイルの差分に現れている場合）
- エラーハンドリングの漏れ（catch ブロックが空・ログなし）

### プロジェクト規約（CLAUDE.md 準拠）
- **BE**: CQRS分離・Zodバリデーション・エラー集約・バレルパターン
- **FE**: `apiClient` 使用・ハードコード色禁止・`use client` 最小化
- **テスト**: co-located 配置・`test-utils/` 集約

### セキュリティ
- 入力バリデーション不足
- 機密情報のハードコード
- 認証・認可チェックの欠如

### パフォーマンス
- N+1 クエリ（全件取得してからメモリでフィルタ）
- 不要な再レンダリング
- 大量データの非ページング取得

---

## 注意事項

- **差分外のコードには絶対にコメントしない**
- コメントが 0 件でも問題ない（良いコードには Walkthrough のみ投稿）
- 問題がない場合は ✨ Praise コメントで称賛する
- `suggestion` ブロックは複数行でも使える（行数が変わらない場合のみ有効）
- JSON 生成時は文字列内のダブルクォートを適切にエスケープする
- コメント数は多くても **15件以内** に絞る（ノイズを防ぐ）
