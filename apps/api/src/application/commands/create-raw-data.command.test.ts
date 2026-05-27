import { describe, expect, it, vi } from "vitest";
import { CreateRawDataCommand } from "./create-raw-data.command";
import { RawDataEntity, RawDataType } from "@workspace/domain";
import type { IRawDataRepository } from "@workspace/domain";

describe("CreateRawDataCommand", () => {
  it("saves RawDataEntity and returns DTO with type, title, isFresh", async () => {
    const repo: IRawDataRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findByProject: vi.fn(),
      findExpired: vi.fn(),
    };
    const command = new CreateRawDataCommand(repo);

    const result = await command.execute({
      projectId: "proj-1",
      type: RawDataType.NEWS,
      title: "Headline",
      content: "Body",
    });

    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0]![0];
    expect(saved).toBeInstanceOf(RawDataEntity);
    expect(result.type).toBe(RawDataType.NEWS);
    expect(result.title).toBe("Headline");
    expect(result.isFresh).toBe(true);
  });
});
