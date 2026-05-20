import { describe, expect, it } from "vitest";
import { prisma } from "../test-utils/db-setup";
import { ProjectPrismaRepository } from "./project.prisma-repository";
import { FrameworkEntryPrismaRepository } from "./framework-entry.prisma-repository";
import { FrameworkEntryEntity, FrameworkType, ProjectEntity } from "@workspace/domain";

describe("FrameworkEntryPrismaRepository (integration)", () => {
  const projectRepo = new ProjectPrismaRepository(prisma);
  const repo = new FrameworkEntryPrismaRepository(prisma);

  const seedProject = async () => {
    const project = ProjectEntity.create({ name: "FW Project" });
    await projectRepo.save(project);
    return project;
  };

  it("save and findById round-trip with nested JSON data", async () => {
    const project = await seedProject();
    const entity = FrameworkEntryEntity.create({
      projectId: project.id,
      frameworkType: FrameworkType.SWOT,
      data: { strengths: ["a"], nested: { x: 1 } },
    });
    await repo.save(entity);

    const found = await repo.findById(entity.id);
    expect(found!.data).toEqual({ strengths: ["a"], nested: { x: 1 } });
  });

  it("findLatest returns isLatest entry", async () => {
    const project = await seedProject();
    const v1 = FrameworkEntryEntity.create({
      projectId: project.id,
      frameworkType: FrameworkType.PEST,
      data: { v: 1 },
    });
    await repo.save(v1);
    await repo.save(v1.markNotLatest());
    const v2 = FrameworkEntryEntity.reconstruct({
      id: globalThis.crypto.randomUUID(),
      projectId: project.id,
      frameworkType: FrameworkType.PEST,
      version: 2,
      isLatest: true,
      data: { v: 2 },
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repo.save(v2);

    const latest = await repo.findLatest(project.id, FrameworkType.PEST);
    expect(latest!.version).toBe(2);
    expect(latest!.data).toEqual({ v: 2 });
  });

  it("findAllVersions returns all versions desc", async () => {
    const project = await seedProject();
    for (const version of [1, 2, 3]) {
      await repo.save(
        FrameworkEntryEntity.reconstruct({
          id: globalThis.crypto.randomUUID(),
          projectId: project.id,
          frameworkType: FrameworkType.SWOT,
          version,
          isLatest: version === 3,
          data: {},
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    const versions = await repo.findAllVersions(project.id, FrameworkType.SWOT);
    expect(versions.map((v) => v.version)).toEqual([3, 2, 1]);
  });

  it("getNextVersion returns 1 when no entries", async () => {
    const project = await seedProject();
    const next = await repo.getNextVersion(project.id, FrameworkType.VRIO);
    expect(next).toBe(1);
  });

  it("getNextVersion increments max version", async () => {
    const project = await seedProject();
    await repo.save(
      FrameworkEntryEntity.reconstruct({
        id: globalThis.crypto.randomUUID(),
        projectId: project.id,
        frameworkType: FrameworkType.VRIO,
        version: 5,
        isLatest: true,
        data: {},
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const next = await repo.getNextVersion(project.id, FrameworkType.VRIO);
    expect(next).toBe(6);
  });

  it("getNextVersion is isolated per framework type", async () => {
    const project = await seedProject();
    await repo.save(
      FrameworkEntryEntity.create({
        projectId: project.id,
        frameworkType: FrameworkType.PEST,
        data: {},
      }),
    );

    const nextSwot = await repo.getNextVersion(project.id, FrameworkType.SWOT);
    expect(nextSwot).toBe(1);
  });
});
