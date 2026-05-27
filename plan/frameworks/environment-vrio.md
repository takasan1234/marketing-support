# VRIO 分析

## 目的

自社の経営資源（製品、技術、組織、ブランドなど）を 4 つの視点で評価し、競争優位性を判定する。

## サブ要素（各経営資源 × 4 評価軸）

VRIO は「リソースごと」に 4 つの Yes/No 判定をするフローチャート型。

| 評価軸 ID | 名称 | 判定基準 |
|---|---|---|
| `value` | Value（価値） | その資源に顧客価値があるか |
| `rarity` | Rarity（希少性） | 他社にない希少なものか |
| `imitability` | Imitability（模倣困難性） | 他社に真似されにくいか |
| `organization` | Organization（組織活用） | 活用する体制があるか |

判定結果：
- 全て Yes → 持続可能な競争優位
- O のみ No → 活用されない競争優位
- I, O が No → 一次的競争優位
- R, I, O が No → 競争均衡
- V が No → 競争劣位

## 上流（参照すべき）

| 評価軸 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| value | 整理軸分析（Customer） | CUSTOMER_RESEARCH, SALES_DATA |
| rarity | 5Forces, 競合情報 | COMPETITOR_INFO, INDUSTRY_REPORT |
| imitability | （資源の特性で判断） | EXPERT_HEARING |
| organization | 整理軸分析（人材・組織） | 自社内部情報 |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| SWOT 分析 | Strength（持続可能な競争優位 / 一次的競争優位の資源） |

## データスキーマ

```typescript
{
  resources: Array<{
    id: string;
    name: string;                // 資源名
    description: string;         // 説明
    evaluation: {
      value: 'yes' | 'no' | 'unknown';
      valueNote: string;
      rarity: 'yes' | 'no' | 'unknown';
      rarityNote: string;
      imitability: 'yes' | 'no' | 'unknown';
      imitabilityNote: string;
      organization: 'yes' | 'no' | 'unknown';
      organizationNote: string;
    };
    result: 'sustained' | 'temporary' | 'unused' | 'parity' | 'disadvantage' | 'unknown';
    sources: string[];           // RawData ID
  }>;
  overallSummary: string;
}
```

`result` は `value`/`rarity`/`imitability`/`organization` から自動計算。

## UI パターン

**インタラクティブ視覚化型（フローチャート）**

レイアウト：

```
[資源を追加] ボタン

┌──────────────────────────────────────────────┐
│ 資源名：[テキスト入力]                              │
├──────────────────────────────────────────────┤
│ Value:        [Yes] [No] [?]  メモ：[テキスト]     │
│ Rarity:       [Yes] [No] [?]  メモ：                │
│ Imitability:  [Yes] [No] [?]  メモ：                │
│ Organization: [Yes] [No] [?]  メモ：                │
├──────────────────────────────────────────────┤
│ 結果： 持続可能な競争優位 ✅                          │
└──────────────────────────────────────────────┘
```

下部にフローチャート図を表示：

```
Value? ──No──> 競争劣位
   │
   Yes
   │
Rarity? ──No──> 競争均衡
   │
   Yes
Imitability? ──No──> 一次的競争優位
   │
   Yes
Organization? ──No──> 活用されない競争優位
   │
   Yes
   │
   └─> 持続可能な競争優位 🌟
```

## Claude Code 連携の例

```
「整理軸分析の Strength に挙がっている資源を、VRIO の resources に
 取り込んで初期評価を付けて」
```

## 注意

- 1 つのプロジェクトで複数の資源を評価する（資源リストとして管理）
- 「結果」は自動計算だが、ユーザが手動上書きも可能（特殊事情がある場合）
