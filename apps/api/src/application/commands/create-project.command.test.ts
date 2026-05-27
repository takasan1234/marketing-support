import { describe, expect, it, vi } from "vitest";
import { CreateProjectCommand } from "./create-project.command";
import type { IProjectRepository } from "@workspace/domain";
import { ProjectEntity } from "@workspace/domain";

describe("CreateProjectCommand", () => {
  it("saves a ProjectEntity and returns DTO with name and description", async () => {
    const repo: IProjectRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new CreateProjectCommand(repo);

    const result = await command.execute({ name: "Alpha", description: "Desc" });

    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0]![0];
    expect(saved).toBeInstanceOf(ProjectEntity);
    expect(saved.name).toBe("Alpha");
    expect(result.name).toBe("Alpha");
    expect(result.description).toBe("Desc");
  });

  it("works without description", async () => {
    const repo: IProjectRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    const command = new CreateProjectCommand(repo);

    const result = await command.execute({ name: "Beta" });

    expect(result.description).toBeNull();
  });
});
