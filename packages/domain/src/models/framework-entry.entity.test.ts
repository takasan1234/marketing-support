import { describe, expect, it } from "vitest";
import { FrameworkEntryEntity } from "./framework-entry.entity";
import { FrameworkType } from "../shared/framework-type";

describe("FrameworkEntryEntity", () => {
  describe("create()", () => {
    it("initializes version to 1", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: { politics: [] },
      });
      expect(entity.version).toBe(1);
    });

    it("initializes isLatest to true", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.SWOT,
        data: {},
      });
      expect(entity.isLatest).toBe(true);
    });

    it("sets data correctly", () => {
      const data = { strengths: ["a"] };
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.SWOT,
        data,
      });
      expect(entity.data).toEqual(data);
    });

    it("sets note to null when omitted", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: {},
      });
      expect(entity.note).toBeNull();
    });
  });

  describe("updateData()", () => {
    it("returns entity with updated data", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: { old: true },
      });
      const updated = entity.updateData({ new: true });
      expect(updated.data).toEqual({ new: true });
    });

    it("does not change version or isLatest", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: {},
      });
      const updated = entity.updateData({ x: 1 });
      expect(updated.version).toBe(1);
      expect(updated.isLatest).toBe(true);
    });

    it("updates updatedAt", () => {
      const entity = FrameworkEntryEntity.reconstruct({
        id: "id",
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        version: 1,
        isLatest: true,
        data: {},
        note: null,
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-01"),
      });
      const updated = entity.updateData({ x: 1 });
      expect(updated.updatedAt.getTime()).toBeGreaterThan(entity.updatedAt.getTime());
    });
  });

  describe("markNotLatest()", () => {
    it("sets isLatest to false", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: {},
      });
      const marked = entity.markNotLatest();
      expect(marked.isLatest).toBe(false);
    });

    it("does not change version or data", () => {
      const entity = FrameworkEntryEntity.create({
        projectId: "p",
        frameworkType: FrameworkType.PEST,
        data: { k: "v" },
      });
      const marked = entity.markNotLatest();
      expect(marked.version).toBe(1);
      expect(marked.data).toEqual({ k: "v" });
    });
  });
});
