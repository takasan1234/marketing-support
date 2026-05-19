import { FrameworkType } from "../shared/framework-type";
import { RawDataType } from "../shared/raw-data-type";

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

const { PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO, THREE_C_PLUS_C, SWOT, CROSS_SWOT,
  SEGMENTATION, TARGETING, POSITIONING, CONCEPT_SHEET,
  PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P, FOUR_C_SEVEN_P,
  BLUE_OCEAN, EXPERIENCE_VALUE, VALUE_ADD_METHODS,
  KGI_KSF_KPI, CUSTOMER_JOURNEY, CRM_ANALYSIS } = FrameworkType;

const { MARKET_STATS, INDUSTRY_REPORT, NEWS, CUSTOMER_RESEARCH, SNS_ANALYTICS,
  SEARCH_TRENDS, LOCATION_DATA, SALES_DATA, COMPETITOR_INFO,
  PARTNER_HEARING, FINANCIAL_DATA, EXPERT_HEARING } = RawDataType;

export const FRAMEWORK_DEPENDENCIES: Record<FrameworkType, FrameworkDependency> = {
  [PEST]: {
    upstream: [],
    downstream: [SWOT, THREE_C_PLUS_C],
    subElements: [
      { id: "politics", upstreamFrameworks: [], rawDataTypes: [NEWS, INDUSTRY_REPORT] },
      { id: "economy", upstreamFrameworks: [], rawDataTypes: [MARKET_STATS, NEWS] },
      { id: "society", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, SNS_ANALYTICS, CUSTOMER_RESEARCH] },
      { id: "technology", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, NEWS] },
    ],
  },
  [FIVE_FORCES]: {
    upstream: [],
    downstream: [SWOT, THREE_C_PLUS_C],
    subElements: [
      { id: "new_entrants", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, NEWS] },
      { id: "substitutes", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, COMPETITOR_INFO] },
      { id: "buyers", upstreamFrameworks: [], rawDataTypes: [CUSTOMER_RESEARCH, MARKET_STATS] },
      { id: "suppliers", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, PARTNER_HEARING] },
      { id: "rivalry", upstreamFrameworks: [], rawDataTypes: [COMPETITOR_INFO, INDUSTRY_REPORT] },
    ],
  },
  [INTERNAL_ANALYSIS]: {
    upstream: [],
    downstream: [SWOT, THREE_C_PLUS_C, VRIO],
    subElements: [
      { id: "strength", upstreamFrameworks: [], rawDataTypes: [SALES_DATA, FINANCIAL_DATA] },
      { id: "weakness", upstreamFrameworks: [], rawDataTypes: [SALES_DATA, FINANCIAL_DATA] },
      { id: "resources", upstreamFrameworks: [], rawDataTypes: [FINANCIAL_DATA, EXPERT_HEARING] },
      { id: "capabilities", upstreamFrameworks: [], rawDataTypes: [EXPERT_HEARING, PARTNER_HEARING] },
    ],
  },
  [VRIO]: {
    upstream: [INTERNAL_ANALYSIS],
    downstream: [SWOT],
    subElements: [
      { id: "resources", upstreamFrameworks: [INTERNAL_ANALYSIS], rawDataTypes: [FINANCIAL_DATA, EXPERT_HEARING] },
    ],
  },
  [THREE_C_PLUS_C]: {
    upstream: [PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: "customer", upstreamFrameworks: [PEST, INTERNAL_ANALYSIS], rawDataTypes: [MARKET_STATS, CUSTOMER_RESEARCH, SNS_ANALYTICS] },
      { id: "company", upstreamFrameworks: [INTERNAL_ANALYSIS], rawDataTypes: [FINANCIAL_DATA, SALES_DATA] },
      { id: "competitor", upstreamFrameworks: [FIVE_FORCES], rawDataTypes: [COMPETITOR_INFO, INDUSTRY_REPORT] },
      { id: "co_operator", upstreamFrameworks: [], rawDataTypes: [PARTNER_HEARING, EXPERT_HEARING] },
    ],
  },
  [SWOT]: {
    upstream: [PEST, FIVE_FORCES, INTERNAL_ANALYSIS, VRIO],
    downstream: [CROSS_SWOT],
    subElements: [
      { id: "strength", upstreamFrameworks: [INTERNAL_ANALYSIS, VRIO], rawDataTypes: [SALES_DATA, FINANCIAL_DATA] },
      { id: "weakness", upstreamFrameworks: [INTERNAL_ANALYSIS, VRIO], rawDataTypes: [SALES_DATA, FINANCIAL_DATA] },
      { id: "opportunity", upstreamFrameworks: [PEST, FIVE_FORCES], rawDataTypes: [MARKET_STATS, INDUSTRY_REPORT] },
      { id: "threat", upstreamFrameworks: [PEST, FIVE_FORCES], rawDataTypes: [NEWS, COMPETITOR_INFO] },
    ],
  },
  [CROSS_SWOT]: {
    upstream: [SWOT],
    downstream: [SEGMENTATION],
    subElements: [
      { id: "so", upstreamFrameworks: [SWOT], rawDataTypes: [] },
      { id: "st", upstreamFrameworks: [SWOT], rawDataTypes: [] },
      { id: "wo", upstreamFrameworks: [SWOT], rawDataTypes: [] },
      { id: "wt", upstreamFrameworks: [SWOT], rawDataTypes: [] },
    ],
  },
  [SEGMENTATION]: {
    upstream: [CROSS_SWOT],
    downstream: [TARGETING],
    subElements: [
      { id: "axes", upstreamFrameworks: [CROSS_SWOT], rawDataTypes: [MARKET_STATS, CUSTOMER_RESEARCH] },
    ],
  },
  [TARGETING]: {
    upstream: [SEGMENTATION],
    downstream: [POSITIONING, PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P],
    subElements: [
      { id: "segments", upstreamFrameworks: [SEGMENTATION], rawDataTypes: [CUSTOMER_RESEARCH, SEARCH_TRENDS] },
    ],
  },
  [POSITIONING]: {
    upstream: [TARGETING],
    downstream: [CONCEPT_SHEET, PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P],
    subElements: [
      { id: "axes", upstreamFrameworks: [TARGETING], rawDataTypes: [COMPETITOR_INFO, CUSTOMER_RESEARCH] },
    ],
  },
  [CONCEPT_SHEET]: {
    upstream: [CROSS_SWOT, POSITIONING, THREE_C_PLUS_C],
    downstream: [PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P, KGI_KSF_KPI],
    subElements: [
      { id: "vision", upstreamFrameworks: [CROSS_SWOT], rawDataTypes: [] },
      { id: "issues", upstreamFrameworks: [THREE_C_PLUS_C, SWOT], rawDataTypes: [] },
      { id: "direction", upstreamFrameworks: [CROSS_SWOT], rawDataTypes: [] },
      { id: "target", upstreamFrameworks: [TARGETING], rawDataTypes: [] },
      { id: "position", upstreamFrameworks: [POSITIONING], rawDataTypes: [] },
      { id: "needs", upstreamFrameworks: [SEGMENTATION, TARGETING], rawDataTypes: [CUSTOMER_RESEARCH] },
      { id: "brand_message", upstreamFrameworks: [SEGMENTATION, TARGETING, POSITIONING], rawDataTypes: [] },
    ],
  },
  [PRODUCT_4P]: {
    upstream: [CONCEPT_SHEET, TARGETING, BLUE_OCEAN, EXPERIENCE_VALUE],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: "core", upstreamFrameworks: [CONCEPT_SHEET], rawDataTypes: [CUSTOMER_RESEARCH] },
      { id: "actual", upstreamFrameworks: [CONCEPT_SHEET], rawDataTypes: [COMPETITOR_INFO] },
      { id: "augmented", upstreamFrameworks: [CONCEPT_SHEET], rawDataTypes: [] },
    ],
  },
  [PRICE_4P]: {
    upstream: [CONCEPT_SHEET, VALUE_ADD_METHODS],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: "method", upstreamFrameworks: [CONCEPT_SHEET], rawDataTypes: [MARKET_STATS, COMPETITOR_INFO, FINANCIAL_DATA] },
    ],
  },
  [PLACE_4P]: {
    upstream: [CONCEPT_SHEET, TARGETING],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: "channels", upstreamFrameworks: [TARGETING], rawDataTypes: [LOCATION_DATA, SALES_DATA] },
    ],
  },
  [PROMOTION_4P]: {
    upstream: [CONCEPT_SHEET, TARGETING, CUSTOMER_JOURNEY],
    downstream: [KGI_KSF_KPI],
    subElements: [
      { id: "steps", upstreamFrameworks: [CONCEPT_SHEET, TARGETING], rawDataTypes: [SNS_ANALYTICS, SEARCH_TRENDS] },
    ],
  },
  [FOUR_C_SEVEN_P]: {
    upstream: [PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P],
    downstream: [],
    subElements: [
      { id: "four_c", upstreamFrameworks: [PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P], rawDataTypes: [CUSTOMER_RESEARCH] },
      { id: "seven_p", upstreamFrameworks: [PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P], rawDataTypes: [] },
    ],
  },
  [BLUE_OCEAN]: {
    upstream: [FOUR_C_SEVEN_P],
    downstream: [PRODUCT_4P],
    subElements: [
      { id: "canvas", upstreamFrameworks: [], rawDataTypes: [COMPETITOR_INFO, INDUSTRY_REPORT] },
      { id: "four_actions", upstreamFrameworks: [], rawDataTypes: [] },
    ],
  },
  [EXPERIENCE_VALUE]: {
    upstream: [FOUR_C_SEVEN_P],
    downstream: [PRODUCT_4P],
    subElements: [
      { id: "values", upstreamFrameworks: [], rawDataTypes: [CUSTOMER_RESEARCH, SNS_ANALYTICS] },
    ],
  },
  [VALUE_ADD_METHODS]: {
    upstream: [PRICE_4P],
    downstream: [PRICE_4P],
    subElements: [
      { id: "methods", upstreamFrameworks: [], rawDataTypes: [INDUSTRY_REPORT, COMPETITOR_INFO] },
    ],
  },
  [KGI_KSF_KPI]: {
    upstream: [CONCEPT_SHEET, THREE_C_PLUS_C, PRODUCT_4P, PRICE_4P, PLACE_4P, PROMOTION_4P],
    downstream: [CRM_ANALYSIS],
    subElements: [
      { id: "kgi", upstreamFrameworks: [CONCEPT_SHEET], rawDataTypes: [FINANCIAL_DATA] },
      { id: "ksf", upstreamFrameworks: [THREE_C_PLUS_C], rawDataTypes: [] },
      { id: "kpi", upstreamFrameworks: [], rawDataTypes: [SALES_DATA] },
    ],
  },
  [CUSTOMER_JOURNEY]: {
    upstream: [TARGETING],
    downstream: [PROMOTION_4P, CRM_ANALYSIS],
    subElements: [
      { id: "stages", upstreamFrameworks: [TARGETING], rawDataTypes: [CUSTOMER_RESEARCH, SNS_ANALYTICS] },
    ],
  },
  [FrameworkType.CRM_OVERVIEW]: {
    upstream: [KGI_KSF_KPI],
    downstream: [CRM_ANALYSIS],
    subElements: [],
  },
  [CRM_ANALYSIS]: {
    upstream: [KGI_KSF_KPI, CUSTOMER_JOURNEY],
    downstream: [SEGMENTATION, TARGETING],
    subElements: [
      { id: "methods", upstreamFrameworks: [], rawDataTypes: [SALES_DATA, CUSTOMER_RESEARCH] },
    ],
  },
};
