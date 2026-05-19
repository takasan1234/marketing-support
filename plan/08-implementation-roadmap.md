# 08. 実装ロードマップ

## フェーズ構成

3 フェーズに分けて段階的に実装。

| フェーズ | 目的 | 期間目安 |
|---|---|---|
| Phase 1 | 土台 | データモデル + 生データ管理 + 1 つのフレームワークが動く |
| Phase 2 | フレームワーク網羅 | 全 22 種類のフレームワーク UI を実装 |
| Phase 3 | Claude Code 連携 + 視覚化強化 | 自動収集、依存グラフ可視化、バージョン比較 |

## Phase 1：土台（MVP）

### 目標
- プロジェクト作成、PEST 分析が入力でき、生データが紐付けられる状態

### タスク
1. テンプレートのクローン、PostgreSQL 起動確認
2. `packages/database` の Prisma スキーマ実装（Project, FrameworkEntry, RawData, FrameworkRawDataLink）
3. `packages/domain` で Project エンティティ、FrameworkType / RawDataType 列挙
4. `packages/domain/src/frameworks/dependencies.ts` の骨組み作成（PEST のみ）
5. `packages/domain/src/raw-data/ttl.ts` 実装
6. `apps/api`：Project CRUD、PEST 取得・更新、生データ CRUD
7. `apps/web`：プロジェクト一覧、プロジェクト作成、PEST 編集画面、生データ管理画面
8. `TwoColumnTable.tsx` UI コンポーネント実装

### 完了基準
- ブラウザで PEST 分析を入力 → 保存 → 再表示できる
- 生データを追加 → PEST のセルから参照リンクが張れる
- DB を直接覗いて、データが正しい構造で入っている

## Phase 2：フレームワーク網羅

### 目標
- 22 フレームワークすべての入力 UI が動く

### サブフェーズ

#### 2A. 外部・内部環境分析（4 フレームワーク）
- PEST（Phase 1 で完了）
- 5Forces（2列テーブル型流用）
- 整理軸分析（2列テーブル型流用）
- VRIO（フローチャート型を新規実装）

#### 2B. 統合分析（3 フレームワーク）
- 3C+C（2列テーブル型、ただし上流参照表示が複雑）
- SWOT（2×2 マトリックス型を新規実装）
- クロスSWOT（2×2 マトリックス型を流用）

#### 2C. STP（4 フレームワーク）
- セグメンテーション（テーブル型）
- ターゲティング（カタログ型）
- ポジショニング（インタラクティブ視覚化型を新規実装）
- 戦略コンセプトシート（コンセプトシート型を新規実装）

#### 2D. 4P（5 フレームワーク）
- Product, Price, Place, Promotion（カタログ型流用）
- 4C / 7P（チェックリスト型を新規実装）

#### 2E. 戦略補完（3 フレームワーク）
- ブルー・オーシャン（戦略キャンバス：インタラクティブ視覚化型を新規実装）
- 経験価値（チェックリスト型流用）
- 高付加価値化（カタログ型流用）

#### 2F. 目標 + ジャーニー + CRM（3 フレームワーク）
- KGI/KSF/KPI（ツリー型を新規実装）
- カスタマージャーニー（インタラクティブ視覚化型を新規実装）
- CRM 分析（カタログ型流用）

### 完了基準
- 22 フレームワークすべて入力可能
- 各フレームワーク画面に「上流参照パネル」「下流参照パネル」表示
- バージョン管理が全フレームワークで動く

## Phase 3：Claude Code 連携 + 視覚化強化

### 目標
- Claude Code から DB を直接触ってデータ収集・更新
- 依存グラフのインタラクティブ可視化
- バージョン比較

### タスク
1. `CLAUDE.md` 整備（Claude Code 向けの規約）
2. `.claude/scripts/` の CLI スクリプト実装（Prisma 直アクセス）
3. `.claude/skills/` の Skill 群実装（6 種、詳細は [09-skills.md](09-skills.md)）
   - data-collector
   - framework-drafter
   - dependency-tracer
   - version-differ
   - freshness-auditor
   - framework-validator
4. `.claude/commands/` のスラッシュコマンド実装（Skills を呼び出す薄いラッパー）
   - `/collect-data` → data-collector
   - `/refresh-data` → freshness-auditor + data-collector
   - `/new-version`
   - `/diff-versions` → version-differ
5. プロジェクトダッシュボードに依存グラフ表示（D3.js / Reaflow など）
   - 各フレームワークノードの色：未着手 / 入力済 / 鮮度警告
   - クリックでそのフレームワーク画面に遷移
6. バージョン比較 UI 実装（version-differ Skill を活用）
7. 鮮度警告の連鎖表示（freshness-auditor Skill と連動）
8. UI 上の「Claude Code に依頼」ヒントボタン（対応する Skill を呼ぶ依頼文）

### 完了基準
- Claude Code CLI から `/collect-data project market-stats` で実際にデータが収集される
- ダッシュボードで依存グラフが見える
- バージョン v1 と v2 を並べて比較できる

## 将来的な拡張案（Phase 4+）

- インポート / エクスポート（JSON, Markdown, PDF）
- 複数プロジェクト横断分析（業界比較など）
- MCP 連携（Web UI から直接 Claude を呼ぶ）
- バックアップ自動化
- 公開用テンプレート（ユーザの分析事例を匿名化して共有）

## 注意点

- **DDD/CQRS の厳密適用**は学習コストが高いため、最初は緩めに始める。template の構成を踏襲しつつ、必要に応じて適用範囲を広げる。
- **22 フレームワーク × 7 UI パターン**だが、実は 5 種類くらいのカスタム UI（VRIO, ポジショニング, ジャーニー, ツリー, 戦略キャンバス）が重い。Phase 2 の中で重点配分すること。
- **テスト戦略**：Phase 1 で Vitest によるユニットテストの土台を作る。Playwright は Phase 3 で本格導入。
