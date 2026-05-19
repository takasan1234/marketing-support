# マーケティング支援システム 計画書

## 概要

マーケティングフレームワークを「抜け漏れなく・サイクルを回しながら」運用するための、完全ローカルな支援システム。ブラウザから入力でき、Claude Code が直接ファイルを編集できる。

**スタック：** Turborepo + Next.js + Express + Prisma + PostgreSQL（[next-express-template](https://github.com/takasan1234/next-express-template) ベース）

## 読み方

このフォルダは構造化された計画書である。トークン効率のため、必要な部分だけを読めば良い。

### 🤖 AI エージェントが実装するとき（最重要）

1. **[PROGRESS.md](PROGRESS.md) を最初に読む** — 進捗状況と次のタスクを確認
2. PROGRESS.md に書かれた「参照」ファイルのみを読み、実装に着手
3. 完了したらステータスを更新

### 全体像を理解したいとき
1. [00-vision.md](00-vision.md) — なぜ作るか
2. [01-architecture.md](01-architecture.md) — 何を作るか
3. [03-dependencies.md](03-dependencies.md) — フレームワーク間の依存図

### 実装計画を確認するとき
1. [PROGRESS.md](PROGRESS.md) — 進捗管理（実装の起点）
2. [08-implementation-roadmap.md](08-implementation-roadmap.md) — フェーズ分けの背景
3. [02-data-model.md](02-data-model.md) — Prisma スキーマ設計
4. [05-ui-patterns.md](05-ui-patterns.md) — UI コンポーネント設計

### 特定のフレームワークを実装するとき
1. [frameworks/README.md](frameworks/README.md) — フレームワーク一覧
2. [frameworks/{該当フレームワーク}.md](frameworks/) — 詳細スキーマ・依存・UI パターン
3. [04-raw-data-types.md](04-raw-data-types.md) — 必要な生データ種類

### Claude Code との連携を設計するとき
1. [06-claude-code-integration.md](06-claude-code-integration.md) — 役割と呼び出し方法
2. [07-versioning.md](07-versioning.md) — サイクル・バージョン管理

## ファイル一覧

### 進捗管理（最重要）
| ファイル | 内容 |
|---|---|
| [PROGRESS.md](PROGRESS.md) | **実装の進捗管理。AI エージェントの起点。** |

### コア設計（root レベル）
| ファイル | 内容 |
|---|---|
| [00-vision.md](00-vision.md) | ビジョン・課題・価値提案 |
| [01-architecture.md](01-architecture.md) | アーキテクチャ・技術スタック |
| [02-data-model.md](02-data-model.md) | データモデル（Prisma スキーマ） |
| [03-dependencies.md](03-dependencies.md) | フレームワーク間の依存グラフ |
| [04-raw-data-types.md](04-raw-data-types.md) | 生データ12種類 |
| [05-ui-patterns.md](05-ui-patterns.md) | UI コンポーネント7パターン |
| [06-claude-code-integration.md](06-claude-code-integration.md) | Claude Code 連携設計（全体像） |
| [07-versioning.md](07-versioning.md) | バージョン・サイクル管理 |
| [08-implementation-roadmap.md](08-implementation-roadmap.md) | 実装フェーズ |
| [09-skills.md](09-skills.md) | Claude Code Skills（専用エージェント）設計 |

### フレームワーク詳細（frameworks/）
| カテゴリ | フレームワーク |
|---|---|
| 外部環境分析 | PEST, 5Forces |
| 内部環境分析 | 整理軸分析, VRIO |
| 統合分析 | 3C+C, SWOT, クロスSWOT |
| STP | セグメンテーション, ターゲティング, ポジショニング, 戦略コンセプトシート |
| 4P | Product, Price, Place, Promotion, 4C/7P |
| 戦略 | ブルー・オーシャン, 経験価値, 高付加価値化 |
| 目標設定 | KGI/KSF/KPI |
| カスタマージャーニー | AIDMA/AISAS + ジャーニーマップ |
| CRM | CRM 全体像, 7分析手法 |

## 設計上の主な決定事項

| 項目 | 決定 |
|---|---|
| 対象ビジネス | 汎用マーケティング（観光特化なし） |
| プロジェクト粒度 | 1事業・1製品 = 1プロジェクト |
| バージョン管理 | 履歴を残す（前回との変化を見られる） |
| Claude Code の介入レベル | B レベル（WebFetch で取得・要約） |
| 生データの鮮度 | TTL（有効期間）を種類ごとに設定 |
| UI 方針 | PDF のレイアウトを忠実に再現（7パターンに分類） |
