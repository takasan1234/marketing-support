import { describe, expect, it, vi } from "vitest";
import { ListRawDataQuery } from "./list-raw-data.query";
import { RawDataEntity, RawDataType } from "@workspace/domain";
import type { IRawDataRepository } from "@workspace/domain";

const makeRawData = () =>
  RawDataEntity.reconstruct({
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

describe("ListRawDataQuery", () => {
  it("calls findByProject when expired is false", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn().mockResolvedValue([makeRawData()]),
      findExpired: vi.fn(),
    };
    const query = new ListRawDataQuery(repo);

    const result = await query.execute({ projectId: "proj-1" });

    expect(repo.findByProject).toHaveBeenCalledWith("proj-1", undefined);
    expect(repo.findExpired).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it("calls findByProject with type filter", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn().mockResolvedValue([]),
      findExpired: vi.fn(),
    };
    const query = new ListRawDataQuery(repo);

    await query.execute({ projectId: "proj-1", type: RawDataType.NEWS });

    expect(repo.findByProject).toHaveBeenCalledWith("proj-1", RawDataType.NEWS);
  });

  it("calls findExpired when expired is true", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn().mockResolvedValue([makeRawData()]),
    };
    const query = new ListRawDataQuery(repo);

    const result = await query.execute({ projectId: "proj-1", expired: true });

    expect(repo.findExpired).toHaveBeenCalledWith("proj-1");
    expect(repo.findByProject).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});
