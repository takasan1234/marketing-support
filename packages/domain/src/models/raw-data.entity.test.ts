import { describe, expect, it, vi, afterEach } from "vitest";
import { RawDataEntity } from "./raw-data.entity";
import { RawDataType } from "../shared/raw-data-type";
import { calcExpiresAt } from "../raw-data/ttl";

describe("RawDataEntity", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create()", () => {
    it("sets expiresAt from calcExpiresAt", () => {
      const collectedAt = new Date("2024-01-01T00:00:00Z");
      const entity = RawDataEntity.create({
        projectId: "proj-1",
        type: RawDataType.NEWS,
        title: "Title",
        content: "Content",
        collectedAt,
      });
      expect(entity.expiresAt?.getTime()).toBe(
        calcExpiresAt(RawDataType.NEWS, collectedAt).getTime(),
      );
    });

    it("uses current time for collectedAt when omitted", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-03-15T12:00:00Z"));
      const entity = RawDataEntity.create({
        projectId: "proj-1",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
      });
      expect(entity.collectedAt.toISOString()).toBe("2025-03-15T12:00:00.000Z");
    });

    it("defaults tags to empty array", () => {
      const entity = RawDataEntity.create({
        projectId: "proj-1",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
      });
      expect(entity.tags).toEqual([]);
    });

    it("defaults sourceUrl and sourceNote to null", () => {
      const entity = RawDataEntity.create({
        projectId: "proj-1",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
      });
      expect(entity.sourceUrl).toBeNull();
      expect(entity.sourceNote).toBeNull();
    });
  });

  describe("isFresh()", () => {
    it("returns true when expiresAt is in the future", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-01T00:00:00Z"));
      const entity = RawDataEntity.reconstruct({
        id: "id",
        projectId: "p",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-12-31"),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(entity.isFresh()).toBe(true);
    });

    it("returns false when expiresAt is in the past", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));
      const entity = RawDataEntity.reconstruct({
        id: "id",
        projectId: "p",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-12-31"),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(entity.isFresh()).toBe(false);
    });

    it("returns false when expiresAt equals now (boundary)", () => {
      const now = new Date("2024-06-01T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const entity = RawDataEntity.reconstruct({
        id: "id",
        projectId: "p",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
        expiresAt: now,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(entity.isFresh()).toBe(false);
    });

    it("returns true when expiresAt is null", () => {
      const entity = RawDataEntity.reconstruct({
        id: "id",
        projectId: "p",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
        collectedAt: new Date(),
        expiresAt: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(entity.isFresh()).toBe(true);
    });
  });

  describe("refreshCollectedAt()", () => {
    it("updates collectedAt and recalculates expiresAt", () => {
      const entity = RawDataEntity.create({
        projectId: "p",
        type: RawDataType.MARKET_STATS,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
      });
      const newCollected = new Date("2024-06-01");
      const refreshed = entity.refreshCollectedAt(newCollected);
      expect(refreshed.collectedAt).toEqual(newCollected);
      expect(refreshed.expiresAt?.getTime()).toBe(
        calcExpiresAt(RawDataType.MARKET_STATS, newCollected).getTime(),
      );
    });

    it("updates updatedAt", () => {
      const entity = RawDataEntity.reconstruct({
        id: "id",
        projectId: "p",
        type: RawDataType.NEWS,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-12-31"),
        tags: [],
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-01"),
      });
      const refreshed = entity.refreshCollectedAt(new Date("2024-06-01"));
      expect(refreshed.updatedAt.getTime()).toBeGreaterThan(entity.updatedAt.getTime());
    });

    it("preserves type, id, and projectId", () => {
      const entity = RawDataEntity.reconstruct({
        id: "keep-id",
        projectId: "keep-proj",
        type: RawDataType.SALES_DATA,
        title: "T",
        content: "C",
        collectedAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-12-31"),
        tags: ["a"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const refreshed = entity.refreshCollectedAt(new Date("2024-06-01"));
      expect(refreshed.id).toBe("keep-id");
      expect(refreshed.projectId).toBe("keep-proj");
      expect(refreshed.type).toBe(RawDataType.SALES_DATA);
    });
  });
});
