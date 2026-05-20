import { describe, expect, it, vi } from "vitest";
import { DeleteRawDataCommand } from "./delete-raw-data.command";
import { RawDataEntity, RawDataType } from "@workspace/domain";
import type { IRawDataRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("DeleteRawDataCommand", () => {
  it("finds and deletes the entity", async () => {
    const entity = RawDataEntity.reconstruct({
      id: "raw-1",
      projectId: "proj-1",
      type: RawDataType.NEWS,
      title: "T",
      content: "C",
      sourceUrl: null,
      sourceNote: null,
      collectedAt: new Date(),
      expiresAt: new Date("2099-01-01"),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo: IRawDataRepository = {
      findById: vi.fn().mockResolvedValue(entity),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const command = new DeleteRawDataCommand(repo);

    await command.execute({ id: "raw-1" });

    expect(repo.delete).toHaveBeenCalledWith(entity);
  });

  it("throws NotFoundError when raw data does not exist", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const command = new DeleteRawDataCommand(repo);

    await expect(command.execute({ id: "missing" })).rejects.toThrow(NotFoundError);
  });
});
