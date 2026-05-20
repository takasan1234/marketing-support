import { describe, expect, it, vi } from "vitest";
import { ListProjectsQuery } from "./list-projects.query";
import { ProjectEntity } from "@workspace/domain";
import type { IProjectRepository } from "@workspace/domain";

describe("ListProjectsQuery", () => {
  it("returns DTOs from findAll", async () => {
    const entity = ProjectEntity.reconstruct({
      id: "p1",
      name: "P",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo: IProjectRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn().mockResolvedValue([entity]),
    };
    const query = new ListProjectsQuery(repo);

    const result = await query.execute({});

    expect(repo.findAll).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("P");
  });

  it("returns empty array when no projects", async () => {
    const repo: IProjectRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
    };
    const query = new ListProjectsQuery(repo);

    const result = await query.execute({});

    expect(result).toEqual([]);
  });
});
