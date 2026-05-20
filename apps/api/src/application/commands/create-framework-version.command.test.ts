import { describe, expect, it, vi } from "vitest";
import { CreateFrameworkVersionCommand } from "./create-framework-version.command";
import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import type { IFrameworkEntryRepository } from "@workspace/domain";

describe("CreateFrameworkVersionCommand", () => {
  const input = {
    projectId: "proj-1",
    frameworkType: FrameworkType.SWOT,
    data: { strengths: [] },
  };

  it("creates first version without markNotLatest when no existing entry", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(null),
      findAllVersions: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn().mockResolvedValue(1),
    };
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const command = new CreateFrameworkVersionCommand(repo, prisma);

    const result = await command.execute(input);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(repo.getNextVersion).toHaveBeenCalledWith("proj-1", FrameworkType.SWOT);
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.version).toBe(1);
    expect(result.isLatest).toBe(true);
  });

  it("marks existing latest not latest and saves new version", async () => {
    const existing = FrameworkEntryEntity.reconstruct({
      id: "entry-1",
      projectId: "proj-1",
      frameworkType: FrameworkType.SWOT,
      version: 1,
      isLatest: true,
      data: {},
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn().mockResolvedValue(existing),
      findAllVersions: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn().mockResolvedValue(2),
    };
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const command = new CreateFrameworkVersionCommand(repo, prisma);

    const result = await command.execute(input);

    expect(repo.save).toHaveBeenCalledTimes(2);
    const firstSave = vi.mocked(repo.save).mock.calls[0]![0];
    expect(firstSave.isLatest).toBe(false);
    expect(result.version).toBe(2);
    expect(result.isLatest).toBe(true);
  });

  it("propagates transaction errors", async () => {
    const repo: IFrameworkEntryRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findLatest: vi.fn(),
      findAllVersions: vi.fn(),
      findLatestByProject: vi.fn(),
      getNextVersion: vi.fn(),
    };
    const prisma = {
      $transaction: vi.fn().mockRejectedValue(new Error("tx failed")),
    };
    const command = new CreateFrameworkVersionCommand(repo, prisma);

    await expect(command.execute(input)).rejects.toThrow("tx failed");
  });
});
