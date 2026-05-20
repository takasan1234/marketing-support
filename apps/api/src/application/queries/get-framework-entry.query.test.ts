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

const makeRepo = (
  overrides: Partial<IFrameworkEntryRepository> = {},
): IFrameworkEntryRepository => ({
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  findLatest: vi.fn(),
  findAllVersions: vi.fn(),
  findByVersion: vi.fn(),
  findLatestByProject: vi.fn(),
  getNextVersion: vi.fn(),
  createNextVersion: vi.fn(),
  ...overrides,
});

describe("GetFrameworkEntryQuery", () => {
  it("uses findLatest when version is omitted", async () => {
    const latest = makeEntry(2);
    const repo = makeRepo({ findLatest: vi.fn().mockResolvedValue(latest) });
    const query = new GetFrameworkEntryQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
    });

    expect(repo.findLatest).toHaveBeenCalledWith("proj-1", FrameworkType.PEST);
    expect(result.version).toBe(2);
  });

  it("throws NotFoundError when latest is missing", async () => {
    const repo = makeRepo({ findLatest: vi.fn().mockResolvedValue(null) });
    const query = new GetFrameworkEntryQuery(repo);

    await expect(
      query.execute({ projectId: "proj-1", frameworkType: FrameworkType.PEST }),
    ).rejects.toThrow(NotFoundError);
  });

  it("finds specific version via findByVersion", async () => {
    const entry = makeEntry(1);
    const repo = makeRepo({ findByVersion: vi.fn().mockResolvedValue(entry) });
    const query = new GetFrameworkEntryQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
      version: 1,
    });

    expect(repo.findByVersion).toHaveBeenCalledWith("proj-1", FrameworkType.PEST, 1);
    expect(result.version).toBe(1);
  });

  it("throws NotFoundError when version does not exist", async () => {
    const repo = makeRepo({ findByVersion: vi.fn().mockResolvedValue(null) });
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
