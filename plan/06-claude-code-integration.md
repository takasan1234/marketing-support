# 06. Claude Code との連携

## 介入レベル

**レベル B：取得・要約まで**

- ソース提案だけでなく、WebFetch で実際に取得して構造化済みの生データとして保存
- 一次ドラフトの自動生成（レベル C）は今回は実装しない

## 役割

| シーン | Claude Code がやること |
|---|---|
| 生データ収集 | WebFetch / WebSearch でソース取得 → DB に RawData として保存 |
| 生データ整形 | 取得した内容を、種類別テンプレートに沿って構造化 |
| サブ要素ヒント | 「PEST.Politics に該当する記述を抽出して」と頼まれて、生データから箇条書きを生成 |
| 鮮度切れ再収集 | 古い生データを最新ソースで置換 |
| バージョン比較 | 「SWOT v1 と v2 の差分を要約して」 |

## 連携方式

Claude Code は API 経由ではなく、**Prisma クライアントで直接 DB を読み書き**する。
理由：完全ローカルかつシンプル。API のシリアライゼーションを挟まないので、構造化データを扱いやすい。

### ディレクトリ配置

```
marketing-support/
├── .claude/
│   ├── settings.json
│   ├── skills/                    # Skills（専用エージェント）詳細は plan/09-skills.md
│   │   ├── data-collector.md
│   │   ├── framework-drafter.md
│   │   ├── dependency-tracer.md
│   │   ├── version-differ.md
│   │   ├── freshness-auditor.md
│   │   └── framework-validator.md
│   ├── commands/                  # スラッシュコマンド（Skills を呼び出す薄いラッパー）
│   │   ├── collect-data.md        # /collect-data → data-collector
│   │   ├── refresh-data.md        # /refresh-data → freshness-auditor + data-collector
│   │   ├── new-version.md         # /new-version
│   │   └── diff-versions.md       # /diff-versions → version-differ
│   └── scripts/                   # CLI スクリプト（DB 直アクセス）
│       ├── save-raw-data.ts
│       ├── load-framework.ts
│       └── ...
└── CLAUDE.md                      # Claude Code 向けのプロジェクト指示
```

3 つのレイヤーの関係：

| レイヤー | 役割 | 例 |
|---|---|---|
| Slash Command | ユーザ起点のショートカット | `/collect-data` |
| Skill | 判断・推論を含むタスク | `framework-drafter`, `dependency-tracer` |
| Script | 副作用（DB 読み書き）の実装 | `save-raw-data.ts` |

スラッシュコマンドは Skill を呼び、Skill は Script を呼ぶ。Skill 設計の詳細は [09-skills.md](09-skills.md) を参照。

## CLAUDE.md の主な内容

```markdown
# このプロジェクトについて
マーケティング支援システム。プロジェクトごとにフレームワーク分析を管理する。

## データを触るとき
- Prisma クライアント経由で DB を読み書きする
- `packages/database/src/client.ts` の prisma インスタンスを使う
- 生データ作成時は必ず `type` の TTL から `expiresAt` を自動計算

## フレームワーク定義
- `packages/domain/src/frameworks/definitions/` に各フレームワーク定義あり
- スキーマと依存関係はそこを参照

## サブ要素レベルの参照
- 3C+C など、サブ要素ごとに参照すべき上流が違う
- `packages/domain/src/frameworks/dependencies.ts` を参照
```

## スラッシュコマンド設計

### `/collect-data <project> <type>`
指定プロジェクトの指定種類の生データを Web から収集。

例：
```
/collect-data my-saas-startup market-stats
```
→ Claude Code が WebSearch / WebFetch で関連統計を集め、構造化して DB に保存。

### `/refresh-data <project>`
鮮度切れの生データをすべて再収集。

### `/new-version <project> <framework>`
指定フレームワークの新バージョンを作成。前バージョンの内容をベースに更新。

例：
```
/new-version my-saas-startup swot
```

### `/diff-versions <project> <framework> <v1> <v2>`
バージョン間の差分を要約。

## Claude Code が読み書きするときの典型コード

```typescript
// .claude/scripts/collect.ts
import { prisma } from '../../packages/database/src/client';
import { TTL_BY_TYPE } from '../../packages/domain/src/raw-data/ttl';

async function saveRawData(params: {
  projectId: string;
  type: RawDataType;
  title: string;
  content: string;
  sourceUrl?: string;
}) {
  const ttlDays = TTL_BY_TYPE[params.type];
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  return await prisma.rawData.create({
    data: {
      ...params,
      collectedAt: new Date(),
      expiresAt,
    }
  });
}
```

## ブラウザ UI 上での Claude Code 連携ヒント

各フレームワーク画面の各セクションに、Claude Code への依頼文を「コピー」できるボタンを配置：

```
[3C+C.Customer のセクション]
─────────────────────────
[💬 Claude Code に依頼]
"このプロジェクトの 3C+C.Customer に必要な情報を、
 PEST と整理軸の結果から抽出して埋めて"
─────────────────────────
```

ユーザはこれをコピーして Claude Code CLI に貼り付け。
将来的に直接 Claude Code を Web UI から起動する形（MCP, IDE 拡張）も検討。
