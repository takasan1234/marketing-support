// Mirror of packages/domain/src/frameworks/dependencies.ts for use in apps/web
// (apps/web does not depend on @workspace/domain)

export type RawDataType =
  | "MARKET_STATS"
  | "INDUSTRY_REPORT"
  | "NEWS"
  | "CUSTOMER_RESEARCH"
  | "SNS_ANALYTICS"
  | "SEARCH_TRENDS"
  | "LOCATION_DATA"
  | "SALES_DATA"
  | "COMPETITOR_INFO"
  | "PARTNER_HEARING"
  | "FINANCIAL_DATA"
  | "EXPERT_HEARING";

export type FrameworkType =
  | "PEST"
  | "FIVE_FORCES"
  | "INTERNAL_ANALYSIS"
  | "VRIO"
  | "THREE_C_PLUS_C"
  | "SWOT"
  | "CROSS_SWOT"
  | "SEGMENTATION"
  | "TARGETING"
  | "POSITIONING"
  | "CONCEPT_SHEET"
  | "PRODUCT_4P"
  | "PRICE_4P"
  | "PLACE_4P"
  | "PROMOTION_4P"
  | "FOUR_C_SEVEN_P"
  | "BLUE_OCEAN"
  | "EXPERIENCE_VALUE"
  | "VALUE_ADD_METHODS"
  | "KGI_KSF_KPI"
  | "CUSTOMER_JOURNEY"
  | "CRM_OVERVIEW"
  | "CRM_ANALYSIS";

export interface SubElementDef {
  id: string;
  upstreamFrameworks: FrameworkType[];
  rawDataTypes: RawDataType[];
}

export interface FrameworkDependency {
  upstream: FrameworkType[];
  downstream: FrameworkType[];
  subElements: SubElementDef[];
}

export const RAW_DATA_TYPE_LABELS: Record<RawDataType, string> = {
  MARKET_STATS: "市場統計",
  INDUSTRY_REPORT: "業界レポート",
  NEWS: "ニュース",
  CUSTOMER_RESEARCH: "顧客調査",
  SNS_ANALYTICS: "SNS分析",
  SEARCH_TRENDS: "検索トレンド",
  LOCATION_DATA: "位置情報",
  SALES_DATA: "販売実績",
  COMPETITOR_INFO: "競合情報",
  PARTNER_HEARING: "協業者ヒアリング",
  FINANCIAL_DATA: "財務データ",
  EXPERT_HEARING: "専門家ヒアリング",
};

export const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  PEST: "PEST分析",
  FIVE_FORCES: "5Forces分析",
  INTERNAL_ANALYSIS: "整理軸分析",
  VRIO: "VRIO分析",
  THREE_C_PLUS_C: "3C+C分析",
  SWOT: "SWOT分析",
  CROSS_SWOT: "クロスSWOT分析",
  SEGMENTATION: "セグメンテーション",
  TARGETING: "ターゲティング",
  POSITIONING: "ポジショニング",
  CONCEPT_SHEET: "戦略コンセプトシート",
  PRODUCT_4P: "Product（4P）",
  PRICE_4P: "Price（4P）",
  PLACE_4P: "Place（4P）",
  PROMOTION_4P: "Promotion（4P）",
  FOUR_C_SEVEN_P: "4C/7P検証",
  BLUE_OCEAN: "ブルーオーシャン戦略",
  EXPERIENCE_VALUE: "経験価値マーケティング",
  VALUE_ADD_METHODS: "高付加価値化7方法論",
  KGI_KSF_KPI: "KGI/KSF/KPI設定",
  CUSTOMER_JOURNEY: "カスタマージャーニー",
  CRM_OVERVIEW: "CRM概要",
  CRM_ANALYSIS: "CRM分析",
};

/**
 * 鮮度切れの生データ種類から、影響を受けるフレームワーク種類の集合を返す
 */
export function getAffectedFrameworks(
  staleTypes: Set<RawDataType>
): Set<FrameworkType> {
  const affected = new Set<FrameworkType>();
  if (staleTypes.size === 0) return affected;

  for (const [fw, dep] of Object.entries(FRAMEWORK_DEPENDENCIES) as [
    FrameworkType,
    FrameworkDependency,
  ][]) {
    const refs = dep.subElements.flatMap((se) => se.rawDataTypes);
    if (refs.some((t) => staleTypes.has(t))) {
      affected.add(fw);
    }
  }
  return affected;
}

export const FRAMEWORK_DEPENDENCIES: Record<FrameworkType, FrameworkDependency> = {
  PEST: {
    upstream: [],
    downstream: ["SWOT", "THREE_C_PLUS_C"],
    subElements: [
      { id: "politics", upstreamFrameworks: [], rawDataTypes: ["NEWS", "INDUSTRY_REPORT"] },
      { id: "economy", upstreamFrameworks: [], rawDataTypes: ["MARKET_STATS", "NEWS"] },
      { id: "society", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "SNS_ANALYTICS", "CUSTOMER_RESEARCH"] },
      { id: "technology", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "NEWS"] },
    ],
  },
  FIVE_FORCES: {
    upstream: [],
    downstream: ["SWOT", "THREE_C_PLUS_C"],
    subElements: [
      { id: "new_entrants", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "NEWS"] },
      { id: "substitutes", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "COMPETITOR_INFO"] },
      { id: "buyers", upstreamFrameworks: [], rawDataTypes: ["CUSTOMER_RESEARCH", "MARKET_STATS"] },
      { id: "suppliers", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "PARTNER_HEARING"] },
      { id: "rivalry", upstreamFrameworks: [], rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT"] },
    ],
  },
  INTERNAL_ANALYSIS: {
    upstream: [],
    downstream: ["SWOT", "THREE_C_PLUS_C", "VRIO"],
    subElements: [
      { id: "strength", upstreamFrameworks: [], rawDataTypes: ["SALES_DATA", "FINANCIAL_DATA"] },
      { id: "weakness", upstreamFrameworks: [], rawDataTypes: ["SALES_DATA", "FINANCIAL_DATA"] },
      { id: "resources", upstreamFrameworks: [], rawDataTypes: ["FINANCIAL_DATA", "EXPERT_HEARING"] },
      { id: "capabilities", upstreamFrameworks: [], rawDataTypes: ["EXPERT_HEARING", "PARTNER_HEARING"] },
    ],
  },
  VRIO: {
    upstream: ["INTERNAL_ANALYSIS"],
    downstream: ["SWOT"],
    subElements: [
      { id: "resources", upstreamFrameworks: ["INTERNAL_ANALYSIS"], rawDataTypes: ["FINANCIAL_DATA", "EXPERT_HEARING"] },
    ],
  },
  THREE_C_PLUS_C: {
    upstream: ["PEST", "FIVE_FORCES", "INTERNAL_ANALYSIS", "VRIO"],
    downstream: ["KGI_KSF_KPI"],
    subElements: [
      { id: "customer", upstreamFrameworks: ["PEST", "INTERNAL_ANALYSIS"], rawDataTypes: ["MARKET_STATS", "CUSTOMER_RESEARCH", "SNS_ANALYTICS"] },
      { id: "company", upstreamFrameworks: ["INTERNAL_ANALYSIS"], rawDataTypes: ["FINANCIAL_DATA", "SALES_DATA"] },
      { id: "competitor", upstreamFrameworks: ["FIVE_FORCES"], rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT"] },
      { id: "co_operator", upstreamFrameworks: [], rawDataTypes: ["PARTNER_HEARING", "EXPERT_HEARING"] },
    ],
  },
  SWOT: {
    upstream: ["PEST", "FIVE_FORCES", "INTERNAL_ANALYSIS", "VRIO"],
    downstream: ["CROSS_SWOT"],
    subElements: [
      { id: "strength", upstreamFrameworks: ["INTERNAL_ANALYSIS", "VRIO"], rawDataTypes: ["SALES_DATA", "FINANCIAL_DATA"] },
      { id: "weakness", upstreamFrameworks: ["INTERNAL_ANALYSIS", "VRIO"], rawDataTypes: ["SALES_DATA", "FINANCIAL_DATA"] },
      { id: "opportunity", upstreamFrameworks: ["PEST", "FIVE_FORCES"], rawDataTypes: ["MARKET_STATS", "INDUSTRY_REPORT"] },
      { id: "threat", upstreamFrameworks: ["PEST", "FIVE_FORCES"], rawDataTypes: ["NEWS", "COMPETITOR_INFO"] },
    ],
  },
  CROSS_SWOT: {
    upstream: ["SWOT"],
    downstream: ["SEGMENTATION"],
    subElements: [
      { id: "so", upstreamFrameworks: ["SWOT"], rawDataTypes: [] },
      { id: "st", upstreamFrameworks: ["SWOT"], rawDataTypes: [] },
      { id: "wo", upstreamFrameworks: ["SWOT"], rawDataTypes: [] },
      { id: "wt", upstreamFrameworks: ["SWOT"], rawDataTypes: [] },
    ],
  },
  SEGMENTATION: {
    upstream: ["CROSS_SWOT"],
    downstream: ["TARGETING"],
    subElements: [
      { id: "axes", upstreamFrameworks: ["CROSS_SWOT"], rawDataTypes: ["MARKET_STATS", "CUSTOMER_RESEARCH"] },
    ],
  },
  TARGETING: {
    upstream: ["SEGMENTATION"],
    downstream: ["POSITIONING", "PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"],
    subElements: [
      { id: "segments", upstreamFrameworks: ["SEGMENTATION"], rawDataTypes: ["CUSTOMER_RESEARCH", "SEARCH_TRENDS"] },
    ],
  },
  POSITIONING: {
    upstream: ["TARGETING"],
    downstream: ["CONCEPT_SHEET", "PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"],
    subElements: [
      { id: "axes", upstreamFrameworks: ["TARGETING"], rawDataTypes: ["COMPETITOR_INFO", "CUSTOMER_RESEARCH"] },
    ],
  },
  CONCEPT_SHEET: {
    upstream: ["CROSS_SWOT", "POSITIONING", "THREE_C_PLUS_C"],
    downstream: ["PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P", "KGI_KSF_KPI"],
    subElements: [
      { id: "vision", upstreamFrameworks: ["CROSS_SWOT"], rawDataTypes: [] },
      { id: "issues", upstreamFrameworks: ["THREE_C_PLUS_C", "SWOT"], rawDataTypes: [] },
      { id: "direction", upstreamFrameworks: ["CROSS_SWOT"], rawDataTypes: [] },
      { id: "target", upstreamFrameworks: ["TARGETING"], rawDataTypes: [] },
      { id: "position", upstreamFrameworks: ["POSITIONING"], rawDataTypes: [] },
      { id: "needs", upstreamFrameworks: ["SEGMENTATION", "TARGETING"], rawDataTypes: ["CUSTOMER_RESEARCH"] },
      { id: "brand_message", upstreamFrameworks: ["SEGMENTATION", "TARGETING", "POSITIONING"], rawDataTypes: [] },
    ],
  },
  PRODUCT_4P: {
    upstream: ["CONCEPT_SHEET", "TARGETING", "BLUE_OCEAN", "EXPERIENCE_VALUE"],
    downstream: ["KGI_KSF_KPI"],
    subElements: [
      { id: "core", upstreamFrameworks: ["CONCEPT_SHEET"], rawDataTypes: ["CUSTOMER_RESEARCH"] },
      { id: "actual", upstreamFrameworks: ["CONCEPT_SHEET"], rawDataTypes: ["COMPETITOR_INFO"] },
      { id: "augmented", upstreamFrameworks: ["CONCEPT_SHEET"], rawDataTypes: [] },
    ],
  },
  PRICE_4P: {
    upstream: ["CONCEPT_SHEET", "VALUE_ADD_METHODS"],
    downstream: ["KGI_KSF_KPI"],
    subElements: [
      { id: "method", upstreamFrameworks: ["CONCEPT_SHEET"], rawDataTypes: ["MARKET_STATS", "COMPETITOR_INFO", "FINANCIAL_DATA"] },
    ],
  },
  PLACE_4P: {
    upstream: ["CONCEPT_SHEET", "TARGETING"],
    downstream: ["KGI_KSF_KPI"],
    subElements: [
      { id: "channels", upstreamFrameworks: ["TARGETING"], rawDataTypes: ["LOCATION_DATA", "SALES_DATA"] },
    ],
  },
  PROMOTION_4P: {
    upstream: ["CONCEPT_SHEET", "TARGETING", "CUSTOMER_JOURNEY"],
    downstream: ["KGI_KSF_KPI"],
    subElements: [
      { id: "steps", upstreamFrameworks: ["CONCEPT_SHEET", "TARGETING"], rawDataTypes: ["SNS_ANALYTICS", "SEARCH_TRENDS"] },
    ],
  },
  FOUR_C_SEVEN_P: {
    upstream: ["PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"],
    downstream: [],
    subElements: [
      { id: "four_c", upstreamFrameworks: ["PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"], rawDataTypes: ["CUSTOMER_RESEARCH"] },
      { id: "seven_p", upstreamFrameworks: ["PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"], rawDataTypes: [] },
    ],
  },
  BLUE_OCEAN: {
    upstream: ["FOUR_C_SEVEN_P"],
    downstream: ["PRODUCT_4P"],
    subElements: [
      { id: "canvas", upstreamFrameworks: [], rawDataTypes: ["COMPETITOR_INFO", "INDUSTRY_REPORT"] },
      { id: "four_actions", upstreamFrameworks: [], rawDataTypes: [] },
    ],
  },
  EXPERIENCE_VALUE: {
    upstream: ["FOUR_C_SEVEN_P"],
    downstream: ["PRODUCT_4P"],
    subElements: [
      { id: "values", upstreamFrameworks: [], rawDataTypes: ["CUSTOMER_RESEARCH", "SNS_ANALYTICS"] },
    ],
  },
  VALUE_ADD_METHODS: {
    upstream: ["PRICE_4P"],
    downstream: ["PRICE_4P"],
    subElements: [
      { id: "methods", upstreamFrameworks: [], rawDataTypes: ["INDUSTRY_REPORT", "COMPETITOR_INFO"] },
    ],
  },
  KGI_KSF_KPI: {
    upstream: ["CONCEPT_SHEET", "THREE_C_PLUS_C", "PRODUCT_4P", "PRICE_4P", "PLACE_4P", "PROMOTION_4P"],
    downstream: ["CRM_ANALYSIS"],
    subElements: [
      { id: "kgi", upstreamFrameworks: ["CONCEPT_SHEET"], rawDataTypes: ["FINANCIAL_DATA"] },
      { id: "ksf", upstreamFrameworks: ["THREE_C_PLUS_C"], rawDataTypes: [] },
      { id: "kpi", upstreamFrameworks: [], rawDataTypes: ["SALES_DATA"] },
    ],
  },
  CUSTOMER_JOURNEY: {
    upstream: ["TARGETING"],
    downstream: ["PROMOTION_4P", "CRM_ANALYSIS"],
    subElements: [
      { id: "stages", upstreamFrameworks: ["TARGETING"], rawDataTypes: ["CUSTOMER_RESEARCH", "SNS_ANALYTICS"] },
    ],
  },
  CRM_OVERVIEW: {
    upstream: ["KGI_KSF_KPI"],
    downstream: ["CRM_ANALYSIS"],
    subElements: [],
  },
  CRM_ANALYSIS: {
    upstream: ["KGI_KSF_KPI", "CUSTOMER_JOURNEY"],
    downstream: ["SEGMENTATION", "TARGETING"],
    subElements: [
      { id: "methods", upstreamFrameworks: [], rawDataTypes: ["SALES_DATA", "CUSTOMER_RESEARCH"] },
    ],
  },
};
