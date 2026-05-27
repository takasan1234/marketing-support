import { describe, expect, it, vi } from "vitest";
import { CreateFrameworkVersionCommand } from "./create-framework-version.command";
import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import type { IFrameworkEntryRepository } from "@workspace/domain";

const makeEntry = (version: number, isLatest = true) =>
  FrameworkEntryEntity.reconstruct({
    id: `entry-${version}`,
    projectId: "proj-1",
    frameworkType: FrameworkType.SWOT,
    version,
    isLatest,
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
  upsertLatest: vi.fn(),
  ...overrides,
});

describe("CreateFrameworkVersionCommand", () => {
  const input = {
    projectId: "proj-1",
    frameworkType: FrameworkType.SWOT,
    data: { strengths: [] },
  };

  it("delegates to repo.createNextVersion and returns dto", async () => {
    const newEntry = makeEntry(1);
    const repo = makeRepo({
      createNextVersion: vi.fn().mockResolvedValue(newEntry),
    });
    const command = new CreateFrameworkVersionCommand(repo);

    const result = await command.execute(input);

    expect(repo.createNextVersion).toHaveBeenCalledWith(
      "proj-1",
      FrameworkType.SWOT,
      { strengths: [] },
      null,
    );
    expect(result.version).toBe(1);
    expect(result.isLatest).toBe(true);
  });

  it("passes note when provided", async () => {
    const newEntry = makeEntry(2);
    const repo = makeRepo({
      createNextVersion: vi.fn().mockResolvedValue(newEntry),
    });
    const command = new CreateFrameworkVersionCommand(repo);

    await command.execute({ ...input, note: "v2 note" });

    expect(repo.createNextVersion).toHaveBeenCalledWith(
      "proj-1",
      FrameworkType.SWOT,
      { strengths: [] },
      "v2 note",
    );
  });

  it("propagates errors from repo", async () => {
    const repo = makeRepo({
      createNextVersion: vi.fn().mockRejectedValue(new Error("db error")),
    });
    const command = new CreateFrameworkVersionCommand(repo);

    await expect(command.execute(input)).rejects.toThrow("db error");
  });
});
