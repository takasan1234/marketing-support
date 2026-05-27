import { describe, expect, it } from "vitest";
import { ProjectEntity } from "./project.entity";

describe("ProjectEntity", () => {
  describe("create()", () => {
    it("assigns a UUID id", () => {
      const entity = ProjectEntity.create({ name: "Test" });
      expect(entity.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("sets name correctly", () => {
      const entity = ProjectEntity.create({ name: "My Project" });
      expect(entity.name).toBe("My Project");
    });

    it("sets description when provided", () => {
      const entity = ProjectEntity.create({ name: "P", description: "desc" });
      expect(entity.description).toBe("desc");
    });

    it("sets description to null when omitted", () => {
      const entity = ProjectEntity.create({ name: "P" });
      expect(entity.description).toBeNull();
    });

    it("sets createdAt and updatedAt to approximately now", () => {
      const before = Date.now();
      const entity = ProjectEntity.create({ name: "P" });
      const after = Date.now();
      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe("reconstruct()", () => {
    it("restores all props", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-06-01");
      const entity = ProjectEntity.reconstruct({
        id: "id-1",
        name: "N",
        description: "D",
        createdAt,
        updatedAt,
      });
      expect(entity.id).toBe("id-1");
      expect(entity.name).toBe("N");
      expect(entity.description).toBe("D");
      expect(entity.createdAt).toBe(createdAt);
      expect(entity.updatedAt).toBe(updatedAt);
    });
  });

  describe("updateName()", () => {
    it("returns a new entity with updated name", () => {
      const original = ProjectEntity.create({ name: "Old" });
      const updated = original.updateName("New");
      expect(updated.name).toBe("New");
    });

    it("does not mutate the original entity", () => {
      const original = ProjectEntity.create({ name: "Old" });
      original.updateName("New");
      expect(original.name).toBe("Old");
    });

    it("updates updatedAt", () => {
      const original = ProjectEntity.reconstruct({
        id: "id",
        name: "N",
        description: null,
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-01"),
      });
      const updated = original.updateName("New");
      expect(updated.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime());
    });

    it("preserves id and createdAt", () => {
      const createdAt = new Date("2020-01-01");
      const original = ProjectEntity.reconstruct({
        id: "same-id",
        name: "N",
        description: null,
        createdAt,
        updatedAt: createdAt,
      });
      const updated = original.updateName("New");
      expect(updated.id).toBe("same-id");
      expect(updated.createdAt).toBe(createdAt);
    });
  });

  describe("updateDescription()", () => {
    it("updates description", () => {
      const entity = ProjectEntity.create({ name: "P" });
      const updated = entity.updateDescription("new desc");
      expect(updated.description).toBe("new desc");
    });

    it("allows null description", () => {
      const entity = ProjectEntity.create({ name: "P", description: "x" });
      const updated = entity.updateDescription(null);
      expect(updated.description).toBeNull();
    });
  });

  describe("equals()", () => {
    it("returns true for entities with the same id", () => {
      const props = {
        id: "same",
        name: "A",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const a = ProjectEntity.reconstruct(props);
      const b = ProjectEntity.reconstruct({ ...props, name: "B" });
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different ids", () => {
      const a = ProjectEntity.create({ name: "A" });
      const b = ProjectEntity.create({ name: "B" });
      expect(a.equals(b)).toBe(false);
    });

    it("returns false when compared with undefined", () => {
      const a = ProjectEntity.create({ name: "A" });
      expect(a.equals(undefined)).toBe(false);
    });
  });
});
