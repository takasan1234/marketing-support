import { describe, expect, it, vi } from "vitest";
import { GetRawDataQuery } from "./get-raw-data.query";
import { RawDataEntity, RawDataType } from "@workspace/domain";
import type { IRawDataRepository } from "@workspace/domain";
import { NotFoundError } from "../errors";

describe("GetRawDataQuery", () => {
  it("returns RawDataDto when found", async () => {
    const entity = RawDataEntity.reconstruct({
      id: "r1",
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
    const query = new GetRawDataQuery(repo);

    const result = await query.execute({ id: "r1" });

    expect(result.id).toBe("r1");
    expect(result.title).toBe("T");
  });

  it("throws NotFoundError when not found", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const query = new GetRawDataQuery(repo);

    await expect(query.execute({ id: "missing" })).rejects.toThrow(NotFoundError);
  });
});
