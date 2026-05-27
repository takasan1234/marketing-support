import { describe, expect, it, vi } from "vitest";
import { UpdateProjectCommand } from "./update-project.command";
import { ProjectEntity } from "@workspace/domain";
import type { IProjectRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("UpdateProjectCommand", () => {
  const makeEntity = () =>
    ProjectEntity.reconstruct({
      id: "proj-1",
      name: "Old",
      description: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });

  it("finds, updates, saves and returns DTO", async () => {
    const entity = makeEntity();
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(entity),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new UpdateProjectCommand(repo);

    const result = await command.execute({ id: "proj-1", name: "New" });

    expect(repo.findById).toHaveBeenCalledWith("proj-1");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.name).toBe("New");
  });

  it("throws NotFoundError when project does not exist", async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new UpdateProjectCommand(repo);

    await expect(command.execute({ id: "missing", name: "X" })).rejects.toThrow(NotFoundError);
  });
});
