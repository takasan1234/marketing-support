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
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(null),
      findAllVersions: vi.fn(),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
    };
    const command = new UpsertFrameworkEntryCommand(repo);

    const result = await command.execute(input);

    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0]![0];
    expect(saved).toBeInstanceOf(FrameworkEntryEntity);
    expect(result.version).toBe(1);
    expect(result.isLatest).toBe(true);
    expect(result.frameworkType).toBe(FrameworkType.PEST);
  });

  it("updates existing entry via updateData when latest exists", async () => {
    const existing = FrameworkEntryEntity.create({
      projectId: "proj-1",
      frameworkType: FrameworkType.PEST,
      data: { old: true },
    });
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(existing),
      findAllVersions: vi.fn(),
      findByVersion: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
      createNextVersion: vi.fn(),
    };
    const command = new UpsertFrameworkEntryCommand(repo);

    const result = await command.execute({ ...input, data: { new: true } });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.data).toEqual({ new: true });
    expect(result.frameworkType).toBe(FrameworkType.PEST);
  });
});
