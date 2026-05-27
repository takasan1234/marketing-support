# フレームワーク詳細

各フレームワークの「スキーマ・上流・下流・UI パターン・必要な生データ種類」を 1 ファイルにまとめている。

## 一覧

### 環境分析（4）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [environment-pest.md](environment-pest.md) | PEST 分析 | 2列テーブル |
| [environment-5forces.md](environment-5forces.md) | 5Forces 分析 | 2列テーブル |
| [environment-internal.md](environment-internal.md) | 整理軸分析（顧客/商品/組織/財務） | 2列テーブル |
| [environment-vrio.md](environment-vrio.md) | VRIO 分析 | フローチャート |

### 統合分析（3）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [integration-3c.md](integration-3c.md) | 3C+C 分析 | 2列テーブル |
| [integration-swot.md](integration-swot.md) | SWOT 分析 | 2×2 マトリックス |
| [integration-cross-swot.md](integration-cross-swot.md) | クロス SWOT 分析 | 2×2 マトリックス |

### STP（4）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [stp-segmentation.md](stp-segmentation.md) | セグメンテーション | テーブル |
| [stp-targeting.md](stp-targeting.md) | ターゲティング | カタログ |
| [stp-positioning.md](stp-positioning.md) | ポジショニング | インタラクティブ |
| [stp-concept-sheet.md](stp-concept-sheet.md) | 戦略コンセプトシート | コンセプトシート |

### 4P（5）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [4p-product.md](4p-product.md) | Product 戦略（3層構造） | ツリー（同心円） |
| [4p-price.md](4p-price.md) | Price 戦略 | カタログ |
| [4p-place.md](4p-place.md) | Place 戦略 | カタログ |
| [4p-promotion.md](4p-promotion.md) | Promotion 戦略 | カタログ + チェックリスト |
| [4p-4c-7p.md](4p-4c-7p.md) | 4C / 7P（検証用） | チェックリスト |

### 戦略補完（3）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [strategy-blue-ocean.md](strategy-blue-ocean.md) | ブルー・オーシャン戦略 + 戦略キャンバス + 4 つのアクション | インタラクティブ |
| [strategy-experience-value.md](strategy-experience-value.md) | 経験価値マーケティング | チェックリスト |
| [strategy-value-add.md](strategy-value-add.md) | 高付加価値化 7 方法論 | カタログ |

### 目標 + ジャーニー + CRM（3）
| ファイル | 名称 | UI パターン |
|---|---|---|
| [goals-kgi-ksf-kpi.md](goals-kgi-ksf-kpi.md) | KGI / KSF / KPI 設定 | ツリー |
| [customer-journey.md](customer-journey.md) | カスタマージャーニー（AIDMA/AISAS） | インタラクティブ |
| [crm-analysis.md](crm-analysis.md) | CRM 7 分析手法 | カタログ |

## 各ファイルの構成

すべてのフレームワーク詳細ファイルは以下の章立てで書く：

```markdown
# {フレームワーク名}

## 目的
（PDF / 東大 IPC 記事の趣旨）

## サブ要素

| サブ要素 ID | 名称 | 説明 |
| ... | ... | ... |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
| ... | ... | ... |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
| ... | ... |

## データスキーマ（FrameworkEntry.data JSON）

```json
{ ... }
```

## UI パターン
- パターン名
- 特徴的な要素

## Claude Code 連携の例
- 想定する依頼文
```
