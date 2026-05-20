import { describe, expect, it, vi } from "vitest";
import { GetFrameworkEntryQuery } from "./get-framework-entry.query";
import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import type { IFrameworkEntryRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

const makeEntry = (version: number) =>
  FrameworkEntryEntity.reconstruct({
    id: `entry-${version}`,
    projectId: "proj-1",
    frameworkType: FrameworkType.PEST,
    version,
    isLatest: version === 2,
    data: {},
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("GetFrameworkEntryQuery", () => {
  it("uses findLatest when version is omitted", async () => {
    const latest = makeEntry(2);
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(latest),
      findAllVersions: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
    };
    const query = new GetFrameworkEntryQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
    });

    expect(repo.findLatest).toHaveBeenCalledWith("proj-1", FrameworkType.PEST);
    expect(result.version).toBe(2);
  });

  it("throws NotFoundError when latest is missing", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(null),
      findAllVersions: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
    };
    const query = new GetFrameworkEntryQuery(repo);

    await expect(
      query.execute({ projectId: "proj-1", frameworkType: FrameworkType.PEST }),
    ).rejects.toThrow(NotFoundError);
  });

  it("finds specific version via findAllVersions", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn().mockResolvedValue([makeEntry(2), makeEntry(1)]),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
    };
    const query = new GetFrameworkEntryQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
      version: 1,
    });

    expect(result.version).toBe(1);
  });

  it("throws NotFoundError when version does not exist", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn().mockResolvedValue([makeEntry(1)]),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
    };
    const query = new GetFrameworkEntryQuery(repo);

    await expect(
      query.execute({
        projectId: "proj-1",
        frameworkType: FrameworkType.PEST,
        version: 99,
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
