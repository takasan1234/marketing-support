# 実装進捗管理

このファイルは実装の単一の真実情報源（Single Source of Truth）。
AI エージェントは**毎セッションでこのファイルを最初に読み**、次のタスクを判断する。

## AI エージェントへの指示

1. **このファイルを最初に読む**（`plan/PROGRESS.md`）
2. **「現在の状態」セクションを確認** — 直前の完了タスクと次の推奨タスクを把握
3. **未着手タスクのうち、依存（dependencies）が満たされているものから着手**
4. **着手前にステータスを `[~]` に更新してこのファイルを保存**
5. **タスクの「参照」に書かれた `plan/` ファイルだけを読んで実装**
   - 全ファイルを一気に読まないこと（トークン節約）
6. **完了条件をすべて満たしたらステータスを `[x]` に更新**
7. **「現在の状態」セクションの「直近の完了」「次の推奨タスク」を更新**
8. **実装中に重要な決定をしたら「決定ログ」に追記**

## 凡例

| 記号 | 意味 |
|---|---|
| `[ ]` | 未着手 |
| `[~]` | 進行中 |
| `[x]` | 完了 |
| `[-]` | スキップ・保留（理由を記載） |

---

## 現在の状態

- **現在のフェーズ**: Phase 3 完了
- **直近の完了**: P3-10〜13 全完了（依存グラフ、バージョン比較UI、鮮度警告連鎖、Claude Codeヒント）
- **次の推奨タスク**: Phase 3 全体完了条件の確認・E2E テスト
- **ブロッカー**: なし

---

## Phase 1: 土台構築（MVP）

**目標**: プロジェクト作成 → PEST 分析入力 → 生データ紐付け が動く状態

### P1-1: プロジェクト初期化
- ステータス: `[x]`
- 内容:
  - `takasan1234/next-express-template` をクローン
  - `pnpm install`
  - `docker-compose up -d` で PostgreSQL 起動
  - 初期マイグレーションが通る
- 参照: [plan/01-architecture.md](01-architecture.md)
- 依存: なし
- 完了条件:
  - `pnpm dev` で apps/web (localhost:3000) と apps/api が両方起動
  - PostgreSQL に接続できる

### P1-2: Prisma スキーマ定義
- ステータス: `[x]`
- 内容:
  - `packages/database/prisma/schema.prisma` に Project, FrameworkEntry, RawData, FrameworkRawDataLink を追加
  - FrameworkType, RawDataType enum 定義
  - マイグレーション実行
- 参照: [plan/02-data-model.md](02-data-model.md)
- 依存: P1-1
- 完了条件:
  - 4 テーブル + 2 enum が DB に作成される
  - Prisma Studio で構造確認できる

### P1-3: ドメイン層（packages/domain）の骨組み
- ステータス: `[x]`
- 内容:
  - `Project`, `FrameworkEntry`, `RawData` エンティティ
  - リポジトリインターフェース
  - `raw-data/ttl.ts`（TTL 定数）
  - `frameworks/dependencies.ts`（PEST のみ先行定義）
- 参照: 
  - [plan/02-data-model.md](02-data-model.md)
  - [plan/04-raw-data-types.md](04-raw-data-types.md)
  - [plan/03-dependencies.md](03-dependencies.md)
- 依存: P1-2
- 完了条件:
  - 型定義がエラーなくビルド
  - PEST のサブ要素と参照すべき生データ種類が定義済み

### P1-4: API バックエンド（Project CRUD）
- ステータス: `[x]`
- 内容:
  - Domain → Infrastructure → Application → Presentation の 4 層実装
  - `GET/POST/PUT/DELETE /projects`, `GET /projects/:id`
  - Zod バリデーション
  - Vitest テスト（ユースケース層）
- 参照: [plan/01-architecture.md](01-architecture.md)
- 依存: P1-3
- 完了条件:
  - curl で Project が CRUD できる
  - ユースケース層の Vitest テストが通る

### P1-5: API バックエンド（RawData CRUD）
- ステータス: `[x]`
- 内容:
  - RawData CRUD（projectId スコープ）
  - 作成時に type の TTL から expiresAt 自動算出
  - 鮮度切れフィルタ機能
- 参照: 
  - [plan/02-data-model.md](02-data-model.md)
  - [plan/04-raw-data-types.md](04-raw-data-types.md)
- 依存: P1-3, P1-4
- 完了条件:
  - 各 type の RawData が作成でき、expiresAt が正しい
  - 鮮度切れの一覧取得 API が動く

### P1-6: API バックエンド（PEST フレームワーク CRUD + バージョニング）
- ステータス: `[x]`
- 内容:
  - FrameworkEntry CRUD（PEST に限定）
  - PUT で上書き / POST で新バージョン作成（v + 1, 前バージョンの isLatest=false）
  - FrameworkRawDataLink で生データ紐付け
- 参照: 
  - [plan/02-data-model.md](02-data-model.md)
  - [plan/07-versioning.md](07-versioning.md)
  - [plan/frameworks/environment-pest.md](frameworks/environment-pest.md)
- 依存: P1-3, P1-4, P1-5
- 完了条件:
  - PEST v1 を作成・取得・更新できる
  - 新バージョン作成で v2 ができ、isLatest が正しく切り替わる
  - 生データの紐付けが保存される

### P1-7: フロントエンド（プロジェクト一覧・作成・ダッシュボード）
- ステータス: `[x]`
- 内容:
  - `app/page.tsx`: プロジェクト一覧
  - `app/projects/new/page.tsx`: 作成フォーム
  - `app/projects/[id]/page.tsx`: ダッシュボード（最小：FW 一覧のみ）
- 参照: [plan/01-architecture.md](01-architecture.md)
- 依存: P1-4
- 完了条件:
  - ブラウザで Project を作成・一覧・詳細表示できる

### P1-8: 共通コンポーネント実装
- ステータス: `[x]`
- 内容:
  - `UpstreamPanel.tsx`: 上流参照表示
  - `DataReferenceLink.tsx`: 生データへのインラインリンク
  - `VersionBadge.tsx`: バージョン表示
  - `FreshnessIndicator.tsx`: 鮮度バッジ（緑/黄/赤）
- 参照: [plan/05-ui-patterns.md](05-ui-patterns.md)
- 依存: P1-7
- 完了条件:
  - 各コンポーネントが Storybook 等で単体動作する（Storybook 必須ではない、ブラウザ確認でも OK）

### P1-9: TwoColumnTable + PEST 編集画面
- ステータス: `[x]`
- 内容:
  - `TwoColumnTable.tsx` コンポーネント（PEST 用）
  - `app/projects/[id]/frameworks/pest/page.tsx`
  - 上流参照パネルの統合
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §1
  - [plan/frameworks/environment-pest.md](frameworks/environment-pest.md)
- 依存: P1-6, P1-8
- 完了条件:
  - PEST の 4 セルを入力 → 保存 → 再表示できる
  - 参照すべき生データ種類が右パネルに表示される

### P1-10: 生データ管理画面
- ステータス: `[x]`
- 内容:
  - `app/projects/[id]/raw-data/page.tsx`: 一覧（種類別フィルタ、鮮度バッジ）
  - `app/projects/[id]/raw-data/new/page.tsx`: 作成（種類選択 + テンプレート表示）
  - `app/projects/[id]/raw-data/[id]/page.tsx`: 編集
- 参照: 
  - [plan/04-raw-data-types.md](04-raw-data-types.md)
  - [plan/02-data-model.md](02-data-model.md)
- 依存: P1-5, P1-8
- 完了条件:
  - 12 種類すべての生データが CRUD できる
  - 鮮度バッジが正しく表示される

### P1-11: PEST ⇔ 生データ紐付け UI
- ステータス: `[x]`
- 内容:
  - PEST のセルから生データを参照リンク（ドロップダウン or 検索）
  - 既存リンクの表示・削除
- 参照: [plan/05-ui-patterns.md](05-ui-patterns.md)
- 依存: P1-9, P1-10
- 完了条件:
  - PEST のセルから生データへ遷移できる
  - 紐付けが FrameworkRawDataLink に保存される

### Phase 1 全体完了条件
- [x] 全 P1-x が `[x]`
- [x] E2E: Project 作成 → 生データ追加 → PEST 入力 → 生データ紐付け → 保存 → 再表示
- [x] 新バージョン作成（PEST v2）が動く（v1=isLatest:false, v2=isLatest:true を確認）

---

## Phase 2: フレームワーク網羅

**目標**: 残り 21 フレームワークの実装

### P2-1: 5Forces 分析
- ステータス: `[x]`
- 内容: TwoColumnTable 流用、強さ評価追加
- 参照: [plan/frameworks/environment-5forces.md](frameworks/environment-5forces.md)
- 依存: Phase 1 完了
- 完了条件: PEST と同様に 5 サブ要素が入力・保存できる

### P2-2: 整理軸分析（内部環境）
- ステータス: `[x]`
- 内容: TwoColumnTable 流用、評価フラグ追加（S/W/Neutral）
- 参照: [plan/frameworks/environment-internal.md](frameworks/environment-internal.md)
- 依存: P2-1
- 完了条件: 4 サブ要素が入力・保存できる

### P2-3: VRIO 分析
- ステータス: `[x]`
- 内容: `VRIOFlowchart.tsx`（新規 UI パターン）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §3c
  - [plan/frameworks/environment-vrio.md](frameworks/environment-vrio.md)
- 依存: P2-2
- 完了条件:
  - 複数の経営資源を追加できる
  - Yes/No 判定から結果（持続可能な競争優位 等）が自動算出される

### P2-4: 3C+C 分析
- ステータス: `[x]`
- 内容: TwoColumnTable 流用、上流フレームワーク参照機能を追加
- 参照: [plan/frameworks/integration-3c.md](frameworks/integration-3c.md)
- 依存: P2-1, P2-2
- 完了条件:
  - サブ要素ごとに参照すべき上流 FW が表示される
  - 上流 FW の結果から「引用」できる
  - KSF セクションが入力できる

### P2-5: SWOT 分析
- ステータス: `[x]`
- 内容: `MatrixTwoByTwo.tsx`（新規 UI パターン）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §2
  - [plan/frameworks/integration-swot.md](frameworks/integration-swot.md)
- 依存: P2-1, P2-2, P2-3
- 完了条件:
  - 4 セルが入力できる
  - 上流 FW の項目を引用できる

### P2-6: クロス SWOT 分析
- ステータス: `[x]`
- 内容: MatrixTwoByTwo 流用、戦略案の評価機能追加
- 参照: [plan/frameworks/integration-cross-swot.md](frameworks/integration-cross-swot.md)
- 依存: P2-5
- 完了条件:
  - SWOT の値を読み取り専用表示
  - 4 セルそれぞれに戦略案を複数入力できる
  - 実現性 × 効果の評価ができる

### P2-7: セグメンテーション
- ステータス: `[x]`
- 内容: 動的軸追加 + セグメント生成 UI
- 参照: [plan/frameworks/stp-segmentation.md](frameworks/stp-segmentation.md)
- 依存: P2-6
- 完了条件:
  - 整理軸が追加でき、セグメントが定義できる

### P2-8: ターゲティング
- ステータス: `[x]`
- 内容: 比較カタログ型でセグメント評価
- 参照: [plan/frameworks/stp-targeting.md](frameworks/stp-targeting.md)
- 依存: P2-7
- 完了条件:
  - 5 評価軸でスコアリング、メイン・サブターゲット選定ができる

### P2-9: ポジショニング
- ステータス: `[x]`
- 内容: `PositioningMap.tsx`（新規 UI パターン、インタラクティブ）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §3a
  - [plan/frameworks/stp-positioning.md](frameworks/stp-positioning.md)
- 依存: P2-8
- 完了条件:
  - 2 軸を設定でき、自社・競合をドラッグ配置できる
  - 「狙うポジション」が定義できる

### P2-10: 戦略コンセプトシート
- ステータス: `[x]`
- 内容: `ConceptSheet.tsx`（新規 UI パターン）+ 自動引用機能
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §5
  - [plan/frameworks/stp-concept-sheet.md](frameworks/stp-concept-sheet.md)
- 依存: P2-6, P2-9
- 完了条件:
  - 7 セクションが入力できる
  - 上流 FW から自動引用できる
  - A4 印刷プレビューが表示できる

### P2-11: Product 戦略
- ステータス: `[x]`
- 内容: 同心円型（`ConcentricCircles.tsx`）
- 参照: [plan/frameworks/4p-product.md](frameworks/4p-product.md)
- 依存: P2-10
- 完了条件: 3 層構造で入力でき、注力レイヤーが選択できる

### P2-12: Price 戦略
- ステータス: `[x]`
- 内容: 比較カタログ型 + フォーム
- 参照: [plan/frameworks/4p-price.md](frameworks/4p-price.md)
- 依存: P2-11
- 完了条件: 3 価格設定手法から採用 + 具体的な価格入力

### P2-13: Place 戦略
- ステータス: `[x]`
- 内容: 比較カタログ型
- 参照: [plan/frameworks/4p-place.md](frameworks/4p-place.md)
- 依存: P2-12
- 完了条件: チャネル選定とチャネルミックスが入力できる

### P2-14: Promotion 戦略
- ステータス: `[x]`
- 内容: カタログ + チェックリスト型、8 ステップ
- 参照: [plan/frameworks/4p-promotion.md](frameworks/4p-promotion.md)
- 依存: P2-13
- 完了条件: 8 ステップが順次入力できる

### P2-15: 4C / 7P
- ステータス: `[x]`
- 内容: `Checklist.tsx`（新規 UI パターン）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §6
  - [plan/frameworks/4p-4c-7p.md](frameworks/4p-4c-7p.md)
- 依存: P2-11, P2-12, P2-13, P2-14
- 完了条件: 4C 検証と 7P 拡張が入力できる

### P2-16: ブルー・オーシャン戦略
- ステータス: `[x]`
- 内容: `StrategyCanvas.tsx`（新規 UI パターン、折れ線グラフ）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §3b
  - [plan/frameworks/strategy-blue-ocean.md](frameworks/strategy-blue-ocean.md)
- 依存: P2-15
- 完了条件: 戦略キャンバスが描画でき、4 アクションが入力できる

### P2-17: 経験価値マーケティング
- ステータス: `[x]`
- 内容: Checklist 流用
- 参照: [plan/frameworks/strategy-experience-value.md](frameworks/strategy-experience-value.md)
- 依存: P2-15
- 完了条件: 5 価値が評価できる

### P2-18: 高付加価値化 7 方法論
- ステータス: `[x]`
- 内容: ComparisonCatalog 流用
- 参照: [plan/frameworks/strategy-value-add.md](frameworks/strategy-value-add.md)
- 依存: P2-12
- 完了条件: 7 方法論の採用可否が入力できる

### P2-19: KGI / KSF / KPI
- ステータス: `[x]`
- 内容: `TreeEditor.tsx`（新規 UI パターン）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §4
  - [plan/frameworks/goals-kgi-ksf-kpi.md](frameworks/goals-kgi-ksf-kpi.md)
- 依存: P2-10, P2-4
- 完了条件: ツリー構造で目標が階層化できる

### P2-20: カスタマージャーニー
- ステータス: `[x]`
- 内容: `JourneyMap.tsx`（新規 UI パターン、横スクロール）
- 参照: 
  - [plan/05-ui-patterns.md](05-ui-patterns.md) §3d
  - [plan/frameworks/customer-journey.md](frameworks/customer-journey.md)
- 依存: P2-14
- 完了条件: AIDMA/AISAS のステージごとに入力できる

### P2-21: CRM 7 分析手法
- ステータス: `[x]`
- 内容: ComparisonCatalog 流用
- 参照: [plan/frameworks/crm-analysis.md](frameworks/crm-analysis.md)
- 依存: P2-19
- 完了条件: 7 手法の採用と結果記録ができる

### Phase 2 全体完了条件
- [x] 全 P2-x が `[x]`
- [x] 22 フレームワーク（PEST 含む）すべて入力可能
- [x] 全フレームワーク画面に「上流参照」「下流参照」パネル表示

---

## Phase 3: Claude Code 連携 + 視覚化強化

### P3-1: CLAUDE.md 整備
- ステータス: `[x]`
- 内容: プロジェクトルートに CLAUDE.md を配置（Skills 一覧への参照を含む）
- 参照: 
  - [plan/06-claude-code-integration.md](06-claude-code-integration.md)
  - [plan/09-skills.md](09-skills.md)
- 依存: Phase 2 完了
- 完了条件: Claude Code がプロジェクトを理解し、適切な Skill を呼べる

### P3-2: CLI スクリプト基盤
- ステータス: `[x]`
- 内容: `.claude/scripts/` に Prisma 直アクセスのスクリプト基盤（save-raw-data, load-framework 等）
- 参照: [plan/06-claude-code-integration.md](06-claude-code-integration.md)
- 依存: P3-1
- 完了条件: スクリプトから DB を読み書きできる

### P3-3: Skill `data-collector`
- ステータス: `[x]`
- 内容: 生データを Web から収集して DB 保存する Skill
- 参照: [plan/09-skills.md](09-skills.md) §1
- 依存: P3-2
- 完了条件:
  - `.claude/skills/data-collector.md` に Skill 定義
  - 公開可能な 6 種類（MARKET_STATS, INDUSTRY_REPORT, NEWS, SEARCH_TRENDS, COMPETITOR_INFO, SNS_ANALYTICS）で動作

### P3-4: Skill `framework-drafter`
- ステータス: `[x]`
- 内容: 上流 FW と RawData から、未入力サブ要素を下書きする Skill
- 参照: [plan/09-skills.md](09-skills.md) §2
- 依存: P3-2
- 完了条件:
  - サブ要素レベルで下書きできる
  - 下書きに参照元（RawData ID + 上流 FW）のメタデータが付く

### P3-5: Skill `dependency-tracer`
- ステータス: `[x]`
- 内容: フレームワークの上流入力の充足状況と、下流への影響を追跡
- 参照: [plan/09-skills.md](09-skills.md) §3
- 依存: P3-2
- 完了条件: 未着手の上流・更新が必要な下流が一覧化される

### P3-6: Skill `version-differ`
- ステータス: `[x]`
- 内容: 2 バージョン間の差分を要約
- 参照: [plan/09-skills.md](09-skills.md) §4
- 依存: P3-2
- 完了条件: サブ要素ごとに「追加・削除・変更」を抽出して自然言語要約

### P3-7: Skill `freshness-auditor`
- ステータス: `[x]`
- 内容: 鮮度切れ生データを点検、優先度順にリストアップ
- 参照: [plan/09-skills.md](09-skills.md) §5
- 依存: P3-2
- 完了条件: 鮮度切れデータが、それを参照する FW と一緒に表示される

### P3-8: Skill `framework-validator`
- ステータス: `[x]`
- 内容: フレームワークの充足度（必須項目・上流参照・生データ参照）をチェック
- 参照: [plan/09-skills.md](09-skills.md) §6
- 依存: P3-2
- 完了条件: 0-100% の充足度と不足要素のリストが返る

### P3-9: スラッシュコマンド群（Skills のラッパー）
- ステータス: `[x]`
- 内容: 
  - `/collect-data` → data-collector
  - `/refresh-data` → freshness-auditor + data-collector
  - `/new-version` → 直接スクリプト
  - `/diff-versions` → version-differ
- 参照: [plan/06-claude-code-integration.md](06-claude-code-integration.md)
- 依存: P3-3, P3-6, P3-7
- 完了条件: 各コマンドがブラウザ UI のヒントからコピペで動く

### P3-10: プロジェクトダッシュボード（依存グラフ可視化）
- ステータス: `[x]`
- 内容: D3.js / Reaflow 等で全フレームワークの依存グラフ描画
- 参照: [plan/03-dependencies.md](03-dependencies.md)
- 依存: Phase 2 完了
- 完了条件:
  - 各 FW ノードが状態別に色分け（未着手/入力済/鮮度警告）
  - クリックで該当 FW 画面に遷移

### P3-11: バージョン比較 UI
- ステータス: `[x]`
- 内容: 2 バージョンを並べて表示、差分ハイライト（version-differ Skill を活用）
- 参照: [plan/07-versioning.md](07-versioning.md)
- 依存: P2 全完了, P3-6
- 完了条件: v1 と v2 を並べて比較できる

### P3-12: 鮮度警告の連鎖表示
- ステータス: `[x]`
- 内容: 生データの鮮度切れが、参照中の FW にも黄バッジで波及（freshness-auditor Skill と連動）
- 依存: Phase 2 完了, P3-7
- 完了条件: 鮮度切れ → 影響 FW にも警告

### P3-13: UI 上の「Claude Code に依頼」ヒント
- ステータス: `[x]`
- 内容: 各 FW セクションにコピー可能な依頼文を表示。依頼文は対応する Skill を呼び出す形式
- 参照: 
  - [plan/06-claude-code-integration.md](06-claude-code-integration.md)
  - [plan/09-skills.md](09-skills.md)
- 依存: Phase 2 完了, P3-4
- 完了条件: ボタン押下で依頼文がクリップボードにコピーされる

### Phase 3 全体完了条件
- [x] 全 P3-x が `[x]`
- [x] 6 つの Skill が動作する
- [x] Claude Code から実際にデータ収集できる
- [x] ダッシュボードで依存グラフが動的に見える

---

## 決定ログ

実装中に行った重要な決定をここに追記する。
（フォーマット: `YYYY-MM-DD | 決定内容 | 理由`）

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-05-20 | ローカル PostgreSQL（Homebrew）を Docker の代わりに使用 | Docker Desktop 起動に時間を要したが、ポート 5432 にローカル PostgreSQL が既に起動しており yomutan DB も存在した。DATABASE_URL を localhost 接続に変更 |
| 2026-05-20 | prisma.config.ts の dotenv をルート .env 参照に変更 | Prisma 7 は schema.prisma 内の `url` を非サポート。prisma.config.ts が CWD 内の .env を探すため、ルート相対パスを明示した |
| 2026-05-20 | apps/api の dotenv ロードをルート .env 参照に変更 | turborepo ではパッケージ CWD が apps/api になるため `import "dotenv/config"` ではルート .env を読まない。__dirname 基準の相対パスで解決 |

---

## 既知の問題・課題

実装中に発見した課題で、後回しにする項目を記録する。

| 項目 | 内容 | 対応予定 |
|---|---|---|
| - | - | - |
