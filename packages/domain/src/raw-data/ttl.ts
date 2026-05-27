import { RawDataType } from "../shared/raw-data-type";

/** TTL in days for each RawDataType */
export const TTL_BY_TYPE: Record<RawDataType, number> = {
  [RawDataType.MARKET_STATS]: 365,
  [RawDataType.INDUSTRY_REPORT]: 180,
  [RawDataType.NEWS]: 90,
  [RawDataType.CUSTOMER_RESEARCH]: 90,
  [RawDataType.SNS_ANALYTICS]: 30,
  [RawDataType.SEARCH_TRENDS]: 30,
  [RawDataType.LOCATION_DATA]: 90,
  [RawDataType.SALES_DATA]: 30,
  [RawDataType.COMPETITOR_INFO]: 90,
  [RawDataType.PARTNER_HEARING]: 180,
  [RawDataType.FINANCIAL_DATA]: 30,
  [RawDataType.EXPERT_HEARING]: 365,
};

export function calcExpiresAt(type: RawDataType, collectedAt: Date): Date {
  const ttlDays = TTL_BY_TYPE[type];
  const expires = new Date(collectedAt);
  expires.setDate(expires.getDate() + ttlDays);
  return expires;
}
