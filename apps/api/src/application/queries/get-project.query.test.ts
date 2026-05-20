import { describe, expect, it, vi } from "vitest";
import { GetProjectQuery } from "./get-project.query";
import { ProjectEntity } from "@workspace/domain";
import type { IProjectRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("GetProjectQuery", () => {
  it("returns ProjectDto when found", async () => {
    const entity = ProjectEntity.reconstruct({
      id: "p1",
      name: "P",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(entity),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const query = new GetProjectQuery(repo);

    const result = await query.execute({ id: "p1" });

    expect(result.id).toBe("p1");
    expect(result.name).toBe("P");
  });

  it("throws NotFoundError when not found", async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const query = new GetProjectQuery(repo);

    await expect(query.execute({ id: "missing" })).rejects.toThrow(NotFoundError);
  });
});
