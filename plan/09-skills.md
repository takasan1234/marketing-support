# 09. Skills 設計

## Skills とは

Claude Code の Skill は、専用の指示・ツールを持つ「特化エージェント」。
スラッシュコマンドが「ユーザ起点のショートカット」であるのに対し、Skill は「Claude Code が判断して自律的に呼び出す/呼び出される」存在。

このプロジェクトでは、マーケティング作業に特化した複数の Skill を設計し、Claude Code CLI 上で運用する。

## 配置場所

```
.claude/
├── skills/                    # Claude Code Skills
│   ├── data-collector.md
│   ├── framework-drafter.md
│   ├── dependency-tracer.md
│   ├── version-differ.md
│   ├── freshness-auditor.md
│   └── framework-validator.md
├── commands/                  # Slash Commands（既出）
│   ├── collect-data.md
│   ├── refresh-data.md
│   ├── new-version.md
│   └── diff-versions.md
└── scripts/                   # Python/TypeScript Service（既出）
    └── ...
```

## Skill の構成パターン

各 Skill は Markdown ファイルで定義。フロントマター + 本文。

```markdown
---
name: skill-name
description: いつこのスキルを使うべきか（呼び出しの判断材料）
tools: [Read, Bash, WebFetch, ...]
---

# Skill の指示
具体的にどう動くか、何を出力するかを記述。
```

## 設計するスキル一覧

### 1. data-collector

**目的**: 指定プロジェクトの、指定生データ種類について、Web から情報を収集し DB に保存する。

**いつ使う**:
- 「PEST の Politics 用に最新の規制動向を集めて」
- 「市場統計データを更新して」
- スラッシュコマンド `/collect-data` から呼ばれる

**必要なツール**: WebFetch, WebSearch, Bash（Prisma スクリプト経由で DB 書き込み）

**処理フロー**:
1. プロジェクト ID と RawDataType を受け取る
2. 種類別に推奨ソース（[plan/04-raw-data-types.md](04-raw-data-types.md) の取得方法）を参照
3. WebSearch / WebFetch で情報を収集
4. 種類別テンプレートに沿って構造化
5. `.claude/scripts/save-raw-data.ts` 経由で DB に保存（TTL から expiresAt 自動算出）
6. 保存した RawData の ID を返す

**設計上の注意**:
- 自社固有データ（SALES_DATA, FINANCIAL_DATA, CUSTOMER_RESEARCH 等）は対象外
- 公開情報のみ扱う（[plan/04-raw-data-types.md](04-raw-data-types.md) の「Claude Code 支援可能」リスト参照）

### 2. framework-drafter

**目的**: フレームワークの未入力サブ要素を、関連する RawData と上流 FW の結果から下書きする。

**いつ使う**:
- 「SWOT の Strength を下書きして」
- 「3C+C.Customer を埋めて」
- フレームワーク編集画面の「Claude Code に依頼」ヒントから

**必要なツール**: Read, Bash（Prisma 経由で DB 読み取り・書き込み）

**処理フロー**:
1. プロジェクト ID、FrameworkType、サブ要素 ID（optional）を受け取る
2. `packages/domain/src/frameworks/dependencies.ts` から、サブ要素の上流 FW と必要な RawDataType を取得
3. 上流 FW の最新版を DB から取得
4. 関連 RawData を DB から取得
5. これらを材料に下書きを生成
6. 下書きを FrameworkEntry.data の対象サブ要素に書き込む（ユーザ確認用に「ドラフト」フラグ付き）

**設計上の注意**:
- 既存の入力は上書きしない（提案として追記）
- 各下書き項目に「参照した RawData ID と上流 FW」のメタデータを付ける（バックリンク）

### 3. dependency-tracer

**目的**: あるフレームワークの上流・下流を追跡し、欠けている入力や、更新が必要な下流を提示する。

**いつ使う**:
- 「SWOT に必要な上流は何？」
- 「PEST を更新したら何に影響する？」
- ダッシュボードでフレームワークをクリックしたとき

**必要なツール**: Read, Bash

**処理フロー**:
1. プロジェクト ID と FrameworkType を受け取る
2. `dependencies.ts` からそのフレームワークの上流・下流を取得
3. 上流の各 FW の最新版が DB に存在するかチェック
4. 下流の各 FW の最終更新日が、対象 FW より新しいかチェック
5. 「未着手の上流」「更新が必要な下流」をリスト化して返す

**出力例**:
```
SWOT 分析の状態:
- 上流入力:
  ✅ PEST 分析 v1（最新）
  ✅ 5Forces 分析 v1（最新）
  ⚠️  整理軸分析 v1（鮮度切れの生データを参照）
  ❌ VRIO 分析（未着手）
- 下流への影響:
  ⚠️ クロス SWOT v1 は SWOT v0 を参照中、再生成を推奨
```

### 4. version-differ

**目的**: 同じフレームワークの 2 つのバージョン間の差分を、構造化して要約する。

**いつ使う**:
- 「SWOT v1 と v2 の違いは？」
- スラッシュコマンド `/diff-versions` から
- バージョン比較 UI からのリンク

**必要なツール**: Read, Bash

**処理フロー**:
1. プロジェクト ID、FrameworkType、v1、v2 を受け取る
2. 両バージョンを DB から取得
3. フレームワーク固有スキーマを理解した上で、サブ要素ごとに差分を抽出
4. 「追加された項目」「削除された項目」「変更された項目」を整理
5. 自然言語で要約

**設計上の注意**:
- 単純な JSON diff ではなく、意味のある差分を出す
- 「項目の表現は変わったが趣旨は同じ」を識別

### 5. freshness-auditor

**目的**: プロジェクト全体の生データ鮮度を点検し、再収集が必要なものをリストアップする。

**いつ使う**:
- 「鮮度切れの生データを教えて」
- 定期的なヘルスチェック（cron 等で呼び出してもよい）

**必要なツール**: Read, Bash

**処理フロー**:
1. プロジェクト ID を受け取る
2. 全 RawData の `expiresAt < now()` をクエリ
3. 種類別に集計
4. それぞれを参照しているフレームワークを特定
5. 「優先度（参照されている数 × フレームワークの戦略上の重要度）」でランキング
6. レポート出力

**出力例**:
```
鮮度切れデータ: 5 件
優先度 高:
  - COMPETITOR_INFO: 競合A情報（210日経過、SWOT・5Forces・ポジショニング が参照）
優先度 中:
  - NEWS: 業界規制ニュース（95日経過、PEST が参照）
...
推奨アクション: /refresh-data {projectId}
```

### 6. framework-validator

**目的**: フレームワークの入力が完成しているか（必要な上流・生データが揃っているか）をチェック。

**いつ使う**:
- 「PEST は埋まってる？」
- 「STP を始める準備はできてる？」
- フレームワーク画面の「次に進める？」ボタンから

**必要なツール**: Read, Bash

**処理フロー**:
1. プロジェクト ID、FrameworkType を受け取る
2. 各サブ要素について：
   - 必須項目が入力されているか
   - 推奨される RawData 種類への参照があるか
   - 上流 FW の参照があるか
3. 充足度を 0-100% で算出
4. 不足要素を具体的に提示

**出力例**:
```
PEST 分析の充足度: 75%
- Politics: 80%（情報ソース 2 件、分析結果 3 件、NEWS への参照あり）
- Economy: 90%
- Society: 50%（情報ソースが空欄、SNS_ANALYTICS への参照なし）
- Technology: 80%

次のステップ: Society の情報を充実させるか、現状で SWOT に進む
```

## Skills と Slash Commands の使い分け

| | Skills | Slash Commands |
|---|---|---|
| 起動者 | Claude Code 自身が判断（または Skill ツール呼び出し） | ユーザが明示的に入力 |
| 用途 | 複雑な処理、判断を伴うタスク | 定型操作、ショートカット |
| 内部 | プロンプト + ツール | テンプレート展開 |
| 例 | framework-drafter, dependency-tracer | /collect-data, /new-version |

スラッシュコマンドが内部で Skill を呼ぶ構成も可能（推奨）：
```
/collect-data project market-stats
  └─→ data-collector skill を呼び出す
```

## CLAUDE.md からの参照

CLAUDE.md にこの Skills 群への言及を入れる：

```markdown
# Skills
このプロジェクトには専用の Skill が以下にある：
- `.claude/skills/data-collector.md` — 生データ収集
- `.claude/skills/framework-drafter.md` — フレームワーク下書き
- ...

タスクに応じて適切な Skill を呼び出すこと。
```

## 注意

- Skill のプロンプトは長くなりすぎないように。具体的な手順より、判断基準を書く
- 各 Skill が触れる DB の範囲を明確に（読み取り専用 / 書き込み可能）
- エラー時の挙動を明示（DB 接続失敗、外部 API タイムアウト等）
- Skill 同士の依存はなるべく避ける（複雑性低減）
