import { describe, expect, it } from "vitest";
import { prisma } from "../test-utils/db-setup";
import { ProjectPrismaRepository } from "./project.prisma-repository";
import { FrameworkEntryPrismaRepository } from "./framework-entry.prisma-repository";
import { RawDataPrismaRepository } from "./raw-data.prisma-repository";
import { FrameworkRawDataLinkRepository } from "./framework-raw-data-link.prisma-repository";
import {
  FrameworkEntryEntity,
  FrameworkType,
  ProjectEntity,
  RawDataEntity,
  RawDataType,
} from "@workspace/domain";

describe("FrameworkRawDataLinkRepository (integration)", () => {
  const projectRepo = new ProjectPrismaRepository(prisma);
  const entryRepo = new FrameworkEntryPrismaRepository(prisma);
  const rawRepo = new RawDataPrismaRepository(prisma);
  const linkRepo = new FrameworkRawDataLinkRepository(prisma);

  const seed = async () => {
    const project = ProjectEntity.create({ name: "Link Project" });
    await projectRepo.save(project);
    const entry = FrameworkEntryEntity.create({
      projectId: project.id,
      frameworkType: FrameworkType.PEST,
      data: {},
    });
    await entryRepo.save(entry);
    const raw = RawDataEntity.create({
      projectId: project.id,
      type: RawDataType.NEWS,
      title: "Source",
      content: "C",
    });
    await rawRepo.save(raw);
    return { entry, raw };
  };

  it("create returns LinkDto with id and rawDataId", async () => {
    const { entry, raw } = await seed();

    const link = await linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: raw.id,
      subElementId: "politics",
      note: "ref",
    });

    expect(link.id).toBeTruthy();
    expect(link.rawDataId).toBe(raw.id);
    expect(link.subElementId).toBe("politics");
    expect(link.note).toBe("ref");
    expect(link.createdAt).toBeTruthy();
  });

  it("create allows optional subElementId and note", async () => {
    const { entry, raw } = await seed();

    const link = await linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: raw.id,
    });

    expect(link.subElementId).toBeNull();
    expect(link.note).toBeNull();
  });

  it("findByFrameworkEntry returns links ordered by createdAt asc", async () => {
    const { entry, raw } = await seed();
    const link1 = await linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: raw.id,
      subElementId: "a",
    });
    await new Promise((r) => setTimeout(r, 10));
    const link2 = await linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: raw.id,
      subElementId: "b",
    });

    const links = await linkRepo.findByFrameworkEntry(entry.id);
    expect(links).toHaveLength(2);
    expect(links[0]!.id).toBe(link1.id);
    expect(links[1]!.id).toBe(link2.id);
  });

  it("delete removes the link", async () => {
    const { entry, raw } = await seed();
    const link = await linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: raw.id,
    });

    await linkRepo.delete(link.id);

    const links = await linkRepo.findByFrameworkEntry(entry.id);
    expect(links).toHaveLength(0);
  });
});
