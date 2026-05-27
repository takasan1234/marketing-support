# SWOT 分析

## 目的

自社にとってのプラス要因（強み・機会）とマイナス要因（弱み・脅威）を、内部 / 外部の 2×2 マトリックスで整理する。

## サブ要素

| サブ要素 ID | 名称 | 軸 |
|---|---|---|
| `strength` | Strength（強み） | 内部 × プラス |
| `weakness` | Weakness（弱み） | 内部 × マイナス |
| `opportunity` | Opportunity（機会） | 外部 × プラス |
| `threat` | Threat（脅威） | 外部 × マイナス |

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| strength | 整理軸分析、VRIO 分析 | FINANCIAL_DATA, SALES_DATA |
| weakness | 整理軸分析、VRIO 分析 | FINANCIAL_DATA, SALES_DATA |
| opportunity | PEST 分析、5Forces 分析 | NEWS, MARKET_STATS |
| threat | PEST 分析、5Forces 分析 | NEWS, COMPETITOR_INFO |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| クロス SWOT 分析 | 4 セルすべて |

## データスキーマ

```typescript
{
  strength: {
    items: Array<{
      text: string;
      sources: string[];                    // RawData ID
      upstreamItems: Array<{                // 上流 FW の特定 item を参照
        framework: FrameworkType;
        path: string;                       // 例：'customer.items[0]'
      }>;
    }>;
  };
  weakness: { /* 同上 */ };
  opportunity: { /* 同上 */ };
  threat: { /* 同上 */ };
}
```

## UI パターン

**2×2 マトリックス型**

```
                 │ プラス要因           │ マイナス要因
─────────────────┼─────────────────────┼─────────────────────
   内部環境       │ Strength（強み）      │ Weakness（弱み）
   ↑              │ ・[項目1]            │ ・[項目1]
   整理軸分析     │ ・[項目2]            │ ・[項目2]
   VRIO 分析     │                       │
─────────────────┼─────────────────────┼─────────────────────
   外部環境       │ Opportunity（機会）  │ Threat（脅威）
   ↑              │ ・[項目1]            │ ・[項目1]
   PEST 分析     │ ・[項目2]            │ ・[項目2]
   5Forces 分析  │                       │
```

機能：
- 各セルは複数行入力
- セルから上流分析の特定項目に「引用」ボタンで参照リンク
- セル間ドラッグで項目を移動可能（誤分類の修正）

## Claude Code 連携の例

```
「SWOT を、最新の PEST・5Forces・整理軸・VRIO の結果から
 自動で初稿を作って」
→ 4 セルそれぞれに該当する上流項目を抽出して埋める
```

## 注意

- 各項目は「上流 FW のどの項目から引いてきたか」を明示する（バックリンク）
- これにより、上流が更新されたときの再評価がしやすい
