import { describe, expect, it, vi } from "vitest";
import { UpdateRawDataCommand } from "./update-raw-data.command";
import { RawDataEntity, RawDataType } from "@workspace/domain";
import type { IRawDataRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("UpdateRawDataCommand", () => {
  const makeEntity = () =>
    RawDataEntity.reconstruct({
      id: "raw-1",
      projectId: "proj-1",
      type: RawDataType.NEWS,
      title: "Old",
      content: "Old content",
      sourceUrl: null,
      sourceNote: null,
      collectedAt: new Date("2024-01-01"),
      expiresAt: new Date("2024-12-31"),
      tags: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });

  it("finds, updates, saves and returns DTO", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn().mockResolvedValue(makeEntity()),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const command = new UpdateRawDataCommand(repo);

    const result = await command.execute({ id: "raw-1", title: "New title" });

    expect(repo.findById).toHaveBeenCalledWith("raw-1");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.title).toBe("New title");
  });

  it("throws NotFoundError when raw data does not exist", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const command = new UpdateRawDataCommand(repo);

    await expect(command.execute({ id: "missing", title: "X" })).rejects.toThrow(NotFoundError);
  });
});
