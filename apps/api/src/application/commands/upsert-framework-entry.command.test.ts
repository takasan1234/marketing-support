import { describe, expect, it, vi } from "vitest";
import { UpsertFrameworkEntryCommand } from "./upsert-framework-entry.command";
import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import type { IFrameworkEntryRepository } from "@workspace/domain";

describe("UpsertFrameworkEntryCommand", () => {
  const input = {
    projectId: "proj-1",
    frameworkType: FrameworkType.PEST,
    data: { politics: [] },
  };

  it("creates new entry when none exists", async () => {
    const createdEntity = FrameworkEntryEntity.create({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
      data: { politics: [] },
    });
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn(),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
      upsertLatest: vi.fn().mockResolvedValue(createdEntity),
    };
    const command = new UpsertFrameworkEntryCommand(repo);

    const result = await command.execute(input);

    expect(repo.upsertLatest).toHaveBeenCalledWith(
      "proj-1",
      FrameworkType.PEST,
      { politics: [] },
      undefined,
    );
    expect(result.version).toBe(1);
    expect(result.isLatest).toBe(true);
    expect(result.frameworkType).toBe(FrameworkType.PEST);
  });

  it("updates existing entry when latest exists", async () => {
    const updatedEntity = FrameworkEntryEntity.create({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
      data: { new: true },
    });
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn(),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
      upsertLatest: vi.fn().mockResolvedValue(updatedEntity),
    };
    const command = new UpsertFrameworkEntryCommand(repo);

    const result = await command.execute({ ...input, data: { new: true } });

    expect(repo.upsertLatest).toHaveBeenCalledWith(
      "proj-1",
      FrameworkType.PEST,
      { new: true },
      undefined,
    );
    expect(result.data).toEqual({ new: true });
    expect(result.frameworkType).toBe(FrameworkType.PEST);
  });
});
