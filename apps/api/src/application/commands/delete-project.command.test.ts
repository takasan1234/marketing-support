import { describe, expect, it, vi } from "vitest";
import { DeleteProjectCommand } from "./delete-project.command";
import { ProjectEntity } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("DeleteProjectCommand", () => {
  it("finds and deletes the entity", async () => {
    const entity = ProjectEntity.reconstruct({
      id: "proj-1",
      name: "P",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = {
      findById: vi.fn().mockResolvedValue(entity),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new DeleteProjectCommand(repo);

    await command.execute({ id: "proj-1" });

    expect(repo.findById).toHaveBeenCalledWith("proj-1");
    expect(repo.delete).toHaveBeenCalledWith(entity);
  });

  it("throws NotFoundError when project does not exist", async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new DeleteProjectCommand(repo);

    await expect(command.execute({ id: "missing" })).rejects.toThrow(NotFoundError);
  });
});
