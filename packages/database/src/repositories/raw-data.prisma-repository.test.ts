import { describe, expect, it, vi, afterEach } from "vitest";
import { prisma } from "../test-utils/db-setup";
import { ProjectPrismaRepository } from "./project.prisma-repository";
import { RawDataPrismaRepository } from "./raw-data.prisma-repository";
import { ProjectEntity, RawDataEntity, RawDataType } from "@workspace/domain";

describe("RawDataPrismaRepository (integration)", () => {
  const projectRepo = new ProjectPrismaRepository(prisma);
  const repo = new RawDataPrismaRepository(prisma);
  let projectId: string;

  afterEach(async () => {
    vi.useRealTimers();
  });

  const seedProject = async () => {
    const project = ProjectEntity.create({ name: "Raw Data Project" });
    await projectRepo.save(project);
    projectId = project.id;
    return project;
  };

  it("save and findById round-trip", async () => {
    await seedProject();
    const entity = RawDataEntity.create({
      projectId,
      type: RawDataType.NEWS,
      title: "Title",
      content: "Body",
      tags: ["tag1"],
    });
    await repo.save(entity);

    const found = await repo.findById(entity.id);
    expect(found!.title).toBe("Title");
    expect(found!.tags).toEqual(["tag1"]);
  });

  it("findByProject filters by projectId", async () => {
    await seedProject();
    const other = ProjectEntity.create({ name: "Other" });
    await projectRepo.save(other);

    await repo.save(
      RawDataEntity.create({
        projectId,
        type: RawDataType.NEWS,
        title: "Mine",
        content: "C",
      }),
    );
    await repo.save(
      RawDataEntity.create({
        projectId: other.id,
        type: RawDataType.NEWS,
        title: "Other",
        content: "C",
      }),
    );

    const list = await repo.findByProject(projectId);
    expect(list).toHaveLength(1);
    expect(list[0]!.title).toBe("Mine");
  });

  it("findByProject filters by type", async () => {
    await seedProject();
    await repo.save(
      RawDataEntity.create({
        projectId,
        type: RawDataType.NEWS,
        title: "News",
        content: "C",
      }),
    );
    await repo.save(
      RawDataEntity.create({
        projectId,
        type: RawDataType.SALES_DATA,
        title: "Sales",
        content: "C",
      }),
    );

    const list = await repo.findByProject(projectId, RawDataType.NEWS);
    expect(list).toHaveLength(1);
    expect(list[0]!.type).toBe(RawDataType.NEWS);
  });

  it("findExpired returns only expired records", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));
    await seedProject();

    const expired = RawDataEntity.reconstruct({
      id: globalThis.crypto.randomUUID(),
      projectId,
      type: RawDataType.SALES_DATA,
      title: "Expired",
      content: "C",
      sourceUrl: null,
      sourceNote: null,
      collectedAt: new Date("2024-01-01"),
      expiresAt: new Date("2024-12-31"),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const fresh = RawDataEntity.create({
      projectId,
      type: RawDataType.NEWS,
      title: "Fresh",
      content: "C",
    });
    await repo.save(expired);
    await repo.save(fresh);

    const list = await repo.findExpired(projectId);
    expect(list).toHaveLength(1);
    expect(list[0]!.title).toBe("Expired");
  });

  it("persists all RawDataType values", async () => {
    await seedProject();
    for (const type of Object.values(RawDataType)) {
      const entity = RawDataEntity.create({
        projectId,
        type,
        title: `Title ${type}`,
        content: "C",
      });
      await repo.save(entity);
      const found = await repo.findById(entity.id);
      expect(found!.type).toBe(type);
    }
  });
});
