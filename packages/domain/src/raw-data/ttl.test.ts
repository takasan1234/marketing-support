import { describe, expect, it } from "vitest";
import { TTL_BY_TYPE, calcExpiresAt } from "./ttl";
import { RawDataType } from "../shared/raw-data-type";

describe("TTL_BY_TYPE", () => {
  it("MARKET_STATS is 365 days", () => {
    expect(TTL_BY_TYPE[RawDataType.MARKET_STATS]).toBe(365);
  });

  it("INDUSTRY_REPORT is 180 days", () => {
    expect(TTL_BY_TYPE[RawDataType.INDUSTRY_REPORT]).toBe(180);
  });

  it("NEWS is 90 days", () => {
    expect(TTL_BY_TYPE[RawDataType.NEWS]).toBe(90);
  });

  it("CUSTOMER_RESEARCH is 90 days", () => {
    expect(TTL_BY_TYPE[RawDataType.CUSTOMER_RESEARCH]).toBe(90);
  });

  it("SNS_ANALYTICS is 30 days", () => {
    expect(TTL_BY_TYPE[RawDataType.SNS_ANALYTICS]).toBe(30);
  });

  it("SEARCH_TRENDS is 30 days", () => {
    expect(TTL_BY_TYPE[RawDataType.SEARCH_TRENDS]).toBe(30);
  });

  it("LOCATION_DATA is 90 days", () => {
    expect(TTL_BY_TYPE[RawDataType.LOCATION_DATA]).toBe(90);
  });

  it("SALES_DATA is 30 days", () => {
    expect(TTL_BY_TYPE[RawDataType.SALES_DATA]).toBe(30);
  });

  it("COMPETITOR_INFO is 90 days", () => {
    expect(TTL_BY_TYPE[RawDataType.COMPETITOR_INFO]).toBe(90);
  });

  it("PARTNER_HEARING is 180 days", () => {
    expect(TTL_BY_TYPE[RawDataType.PARTNER_HEARING]).toBe(180);
  });

  it("FINANCIAL_DATA is 30 days", () => {
    expect(TTL_BY_TYPE[RawDataType.FINANCIAL_DATA]).toBe(30);
  });

  it("EXPERT_HEARING is 365 days", () => {
    expect(TTL_BY_TYPE[RawDataType.EXPERT_HEARING]).toBe(365);
  });

  it("covers all RawDataType values", () => {
    const types = Object.values(RawDataType);
    expect(Object.keys(TTL_BY_TYPE)).toHaveLength(types.length);
    for (const type of types) {
      expect(TTL_BY_TYPE[type]).toBeDefined();
    }
  });
});

describe("calcExpiresAt()", () => {
  it("NEWS: returns date 90 days after collectedAt", () => {
    const collectedAt = new Date("2024-01-01T00:00:00Z");
    const expires = calcExpiresAt(RawDataType.NEWS, collectedAt);
    expect(expires.getUTCDate()).toBe(31);
    expect(expires.getUTCMonth()).toBe(2); // March (0-indexed)
    expect(expires.getUTCFullYear()).toBe(2024);
  });

  it("MARKET_STATS: returns date 365 days after collectedAt", () => {
    const collectedAt = new Date("2024-01-01T12:00:00Z");
    const expires = calcExpiresAt(RawDataType.MARKET_STATS, collectedAt);
    const diffMs = expires.getTime() - collectedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(365);
  });

  it("handles month rollover (Jan 31 + 30 days)", () => {
    const collectedAt = new Date("2024-01-31T00:00:00Z");
    const expires = calcExpiresAt(RawDataType.SNS_ANALYTICS, collectedAt);
    expect(expires.getUTCMonth()).toBe(2);
    expect(expires.getUTCDate()).toBe(1);
  });

  it("does not mutate the input Date", () => {
    const collectedAt = new Date("2024-06-15T00:00:00Z");
    const originalTime = collectedAt.getTime();
    calcExpiresAt(RawDataType.NEWS, collectedAt);
    expect(collectedAt.getTime()).toBe(originalTime);
  });
});
