# KGI / KSF / KPI 設定

## 目的

事業の最終目標から逆算して、達成のための重要成功要因と評価指標を階層的に設計する。

## サブ要素

| サブ要素 ID | 名称 | 内容 | 評価期間 |
|---|---|---|---|
| `kgi` | KGI（重要目標達成指標） | 最終的な数値目標 | 年次 |
| `ksf` | KSF（重要成功要因） | KGI 達成のための要因（定性） | 月次・四半期 |
| `kpi` | KPI（重要業績評価指標） | KSF を定量化した数値目標 | 月次・四半期 |

階層構造：
```
KGI（1 つ、または少数）
 ├─ サブ KGI（必要に応じて）
 │   └─ KSF（複数）
 │       └─ KPI（複数）
```

## 上流（参照すべき）

| サブ要素 | 上流フレームワーク | 生データ種類 |
|---|---|---|
| kgi | 戦略コンセプトシート（ビジョン） | （上流経由） |
| ksf | 3C+C 分析、クロスSWOT | （上流経由） |
| kpi | KSF + 4P | SALES_DATA |

## 下流（出力先）

| 下流フレームワーク | 何を渡すか |
|---|---|
| 施策実施（4P 全体） | 評価指標 |
| CRM 分析 | 顧客指標 |

## データスキーマ

```typescript
{
  kgi: {
    id: string;
    name: string;                    // 例：「年間売上 20% UP」
    target: string;                  // 数値目標
    unit: string;
    timeframe: string;               // 例：「3 年後」
    rationale: string;
    visionReference?: string;        // 戦略コンセプトシートへの参照
  };
  subKgis: Array<{                  // 必要に応じて
    id: string;
    parentId: string;
    name: string;
    target: string;
    unit: string;
    timeframe: string;
  }>;
  ksfs: Array<{
    id: string;
    parentKgiId: string;
    name: string;                    // 例：「リピート顧客の増加」
    description: string;
    rationale: string;
    sourceFrameworks: FrameworkType[]; // 3C+C など
  }>;
  kpis: Array<{
    id: string;
    parentKsfId: string;
    name: string;                    // 例：「リピート率」
    target: string;                  // 例：「30%」
    unit: string;
    measurementMethod: string;       // 計測方法
    frequency: 'monthly' | 'quarterly';
    owner: string;                   // 担当者
    currentValue?: string;           // 現在値
  }>;
}
```

## UI パターン

**ツリー型**

```
┌──────────────────────────────────────┐
│ 【KGI】 年間売上 20% UP（3 年後）        │
├──────────────────────────────────────┤
│   │                                    │
│   ├─【サブ KGI】月間アクティブ顧客 10 万│
│   │   │                                │
│   │   ├─【KSF】新規獲得力の強化         │
│   │   │   │                            │
│   │   │   ├─【KPI】月次新規 1,000 件   │
│   │   │   └─【KPI】CAC 5 万円以下      │
│   │   │                                │
│   │   └─【KSF】既存顧客のリピート向上   │
│   │       ├─【KPI】NPS 70 以上          │
│   │       └─【KPI】月次解約率 < 2%     │
│   │                                    │
│   └─【サブ KGI】顧客単価 50% UP        │
│       ├─【KSF】高付加価値化            │
│       │   └─【KPI】平均単価 1 万円      │
│       │                                │
│       └─【KSF】クロスセル              │
│           └─【KPI】1 顧客あたり購入数 3 │
└──────────────────────────────────────┘

[+ KGI 追加] [+ KSF 追加] [+ KPI 追加]
[ノードドラッグで階層変更]
```

機能：
- ノードの追加・削除・並び替え
- 各ノードに数値目標、現在値、担当者、期限を入力
- KGI は戦略コンセプトシートから自動引用
- KSF は 3C+C / クロスSWOT から自動引用
- KPI の現在値はダッシュボード表示

## Claude Code 連携の例

```
「3C+C と クロスSWOT の結果から、KSF の候補をリストアップ」

「KGI に対して、達成のための具体的な KSF と KPI のセットを設計」
```

## 注意

- KGI は数値目標が必須
- KSF は定性、KPI は定量という違い
- 数が多すぎると管理しきれない（KGI 1 つ、KSF 3-5 個、KPI 5-10 個が目安）
- PDCA で見直しサイクルを回す
