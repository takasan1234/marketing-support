# 01. アーキテクチャ

## 技術スタック

[next-express-template](https://github.com/takasan1234/next-express-template) をベースに採用。

| 層 | 技術 |
|---|---|
| モノレポ管理 | Turborepo + pnpm workspaces |
| フロントエンド | Next.js (App Router) |
| バックエンド | Express |
| ORM | Prisma |
| DB | PostgreSQL |
| バリデーション | Zod |
| テスト | Vitest（ユニット）+ Playwright（E2E） |
| アーキ思想 | DDD + CQRS |

## ディレクトリ構成

```
marketing-support/
├── apps/
│   ├── web/                    # Next.js フロントエンド
│   │   ├── app/                # ルーティング
│   │   ├── components/         # UI コンポーネント
│   │   │   └── frameworks/     # 各フレームワーク専用 UI
│   │   ├── hooks/
│   │   └── lib/
│   └── api/                    # Express バックエンド
│       └── src/
│           ├── domain/         # エンティティ・リポジトリインターフェース
│           ├── infrastructure/ # Prisma 実装
│           ├── application/    # ユースケース（CQRS）
│           └── presentation/   # コントローラ・Zod
├── packages/
│   ├── domain/                 # 共通ドメインモデル
│   ├── database/               # Prisma スキーマ
│   ├── ui/                     # 共通 UI コンポーネント
│   ├── eslint-config/
│   └── typescript-config/
└── docker-compose.yml          # PostgreSQL（ローカル開発用）
```

## 主要コンポーネント分割

### `apps/web/components/frameworks/`
フレームワーク専用 UI を集約。各フレームワークが UI パターン（[05-ui-patterns.md](05-ui-patterns.md) 参照）のひとつを使う。

```
components/frameworks/
├── shared/
│   ├── UpstreamPanel.tsx       # 「参照すべき上流分析・生データ」表示
│   ├── DataReferenceLink.tsx   # 生データへのリンク
│   └── VersionBadge.tsx        # バージョン表示
├── environment/
│   ├── PESTAnalysis.tsx        # 2列テーブル型
│   ├── FiveForcesAnalysis.tsx  # 2列テーブル型
│   ├── InternalAnalysis.tsx    # 2列テーブル型
│   └── VRIOAnalysis.tsx        # フローチャート型
├── integration/
│   ├── ThreeCPlusC.tsx
│   ├── SWOTAnalysis.tsx        # 2×2 マトリックス
│   └── CrossSWOT.tsx           # 2×2 マトリックス
├── stp/
│   ├── Segmentation.tsx
│   ├── Targeting.tsx
│   ├── Positioning.tsx         # インタラクティブ視覚化
│   └── ConceptSheet.tsx        # コンセプトシート型
└── ... 以下同様
```

### `apps/api/src/`
DDD + CQRS を採用（テンプレートに準拠）。

| 層 | 役割 | 例 |
|---|---|---|
| domain | エンティティ、リポジトリインターフェース | `Project`, `Framework`, `RawData` |
| infrastructure | Prisma 実装、外部 API | `PrismaProjectRepository` |
| application | ユースケース（Command/Query 分離） | `CreateProjectUseCase`, `GetFrameworkQuery` |
| presentation | コントローラ、Zod スキーマ | `ProjectController` |

## データの保存場所

- **PostgreSQL**：プロジェクト、フレームワーク、生データ、バージョン履歴
- **ファイルシステム**：（必要に応じて）大きな添付ファイルや PDF
- **Claude Code が読み書きするのは PostgreSQL 経由 or 直接 SQL**：API 経由でも可能

詳細は [02-data-model.md](02-data-model.md) を参照。

## ローカル起動の流れ

```bash
docker-compose up -d        # PostgreSQL 起動
pnpm install
pnpm db:migrate
pnpm dev                    # web + api 同時起動
```

ブラウザで `http://localhost:3000` にアクセス。
Claude Code から触る場合は、`apps/api` の API を叩くか、Prisma クライアントを通じて直接 DB を読み書き。

## 主なルーティング

### Web (Next.js)
| パス | 内容 |
|---|---|
| `/` | プロジェクト一覧 |
| `/projects/new` | プロジェクト作成 |
| `/projects/[id]` | プロジェクトダッシュボード（依存グラフ表示） |
| `/projects/[id]/frameworks/[fwId]` | フレームワーク編集画面 |
| `/projects/[id]/frameworks/[fwId]/versions/[v]` | 過去バージョン閲覧 |
| `/projects/[id]/raw-data` | 生データ一覧 |
| `/projects/[id]/raw-data/[dataId]` | 生データ詳細・編集 |

### API (Express)
| パス | メソッド | 内容 |
|---|---|---|
| `/projects` | GET / POST | プロジェクト CRUD |
| `/projects/:id/frameworks/:fwId` | GET / PUT | フレームワーク取得・更新 |
| `/projects/:id/frameworks/:fwId/versions` | GET / POST | バージョン履歴・新規作成 |
| `/projects/:id/raw-data` | GET / POST | 生データ CRUD |
| `/projects/:id/dependencies` | GET | 依存グラフ取得 |
