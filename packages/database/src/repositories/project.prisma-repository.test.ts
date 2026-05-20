import { describe, expect, it } from "vitest";
import { prisma } from "../test-utils/db-setup";
import { ProjectPrismaRepository } from "./project.prisma-repository";
import { ProjectEntity } from "@workspace/domain";

describe("ProjectPrismaRepository (integration)", () => {
  const repo = new ProjectPrismaRepository(prisma);

  it("save creates a new record and findById returns matching entity", async () => {
    const entity = ProjectEntity.create({ name: "Integration Project", description: "desc" });
    await repo.save(entity);

    const found = await repo.findById(entity.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Integration Project");
    expect(found!.description).toBe("desc");
  });

  it("save updates existing record", async () => {
    const entity = ProjectEntity.create({ name: "Before" });
    await repo.save(entity);
    const persisted = await repo.findById(entity.id);

    const updated = persisted!.updateName("After");
    await repo.save(updated);

    const found = await repo.findById(entity.id);
    expect(found!.name).toBe("After");
    expect(found!.createdAt.toISOString()).toBe(persisted!.createdAt.toISOString());
  });

  it("findById returns null for unknown id", async () => {
    const found = await repo.findById("nonexistent-id");
    expect(found).toBeNull();
  });

  it("findAll returns records ordered by createdAt desc", async () => {
    const a = ProjectEntity.create({ name: "A" });
    const b = ProjectEntity.create({ name: "B" });
    await repo.save(a);
    await new Promise((r) => setTimeout(r, 10));
    await repo.save(b);

    const all = await repo.findAll();
    const ours = all.filter((p) => p.id === a.id || p.id === b.id);
    expect(ours[0]!.id).toBe(b.id);
    expect(ours[1]!.id).toBe(a.id);
  });

  it("delete removes the record", async () => {
    const entity = ProjectEntity.create({ name: "To Delete" });
    await repo.save(entity);
    await repo.delete(entity);

    const found = await repo.findById(entity.id);
    expect(found).toBeNull();
  });

  it("round-trips all fields through save and findById", async () => {
    const original = ProjectEntity.create({ name: "Round Trip", description: "note" });
    await repo.save(original);
    const saved = await repo.findById(original.id);
    expect(saved!.name).toBe("Round Trip");
    expect(saved!.description).toBe("note");
  });
});
