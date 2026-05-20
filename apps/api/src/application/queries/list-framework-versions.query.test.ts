import { describe, expect, it, vi } from "vitest";
import { ListFrameworkVersionsQuery } from "./list-framework-versions.query";
import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import type { IFrameworkEntryRepository } from "@workspace/domain";

describe("ListFrameworkVersionsQuery", () => {
  it("returns DTOs from findAllVersions", async () => {
    const entities = [
      FrameworkEntryEntity.reconstruct({
        id: "e2",
        projectId: "proj-1",
        frameworkType: FrameworkType.SWOT,
        version: 2,
        isLatest: true,
        data: {},
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn().mockResolvedValue(entities),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
    };
    const query = new ListFrameworkVersionsQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.SWOT,
    });

    expect(repo.findAllVersions).toHaveBeenCalledWith("proj-1", FrameworkType.SWOT);
    expect(result).toHaveLength(1);
    expect(result[0]!.version).toBe(2);
  });

  it("returns empty array when no versions", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn().mockResolvedValue([]),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
    };
    const query = new ListFrameworkVersionsQuery(repo);

    const result = await query.execute({
      projectId: "proj-1",
      frameworkType: FrameworkType.SWOT,
    });

    expect(result).toEqual([]);
  });
});
