import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request } from "express";
import { RawDataController } from "./raw-data.controller";
import { mockResponse } from "../../test-utils";
import { CreateRawDataCommand } from "../../application/commands/create-raw-data.command";
import { UpdateRawDataCommand } from "../../application/commands/update-raw-data.command";
import { DeleteRawDataCommand } from "../../application/commands/delete-raw-data.command";
import { ListRawDataQuery } from "../../application/queries/list-raw-data.query";
import { GetRawDataQuery } from "../../application/queries/get-raw-data.query";
import { NotFoundError } from "../../application/errors";
import type { RawDataDto } from "../../application/dto/raw-data.dto";
import { RawDataType } from "@workspace/domain";

const makeRawDataDto = (overrides: Partial<RawDataDto> = {}): RawDataDto => ({
  id: "test-id",
  projectId: "project-id",
  type: RawDataType.NEWS,
  title: "Test Title",
  content: "Test content",
  sourceUrl: null,
  sourceNote: null,
  collectedAt: new Date().toISOString(),
  expiresAt: null,
  tags: [],
  isFresh: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

function makeReq<P extends Record<string, string>, B, Q = Record<string, string | string[] | undefined>>(
  params: P,
  body?: B,
  query?: Q,
): Request<P, unknown, B, Q> {
  return { params, body, query: query ?? ({} as Q) } as Request<P, unknown, B, Q>;
}

describe("RawDataController", () => {
  let createRawDataCommand: { execute: ReturnType<typeof vi.fn> };
  let updateRawDataCommand: { execute: ReturnType<typeof vi.fn> };
  let deleteRawDataCommand: { execute: ReturnType<typeof vi.fn> };
  let listRawDataQuery: { execute: ReturnType<typeof vi.fn> };
  let getRawDataQuery: { execute: ReturnType<typeof vi.fn> };
  let controller: RawDataController;

  beforeEach(() => {
    createRawDataCommand = { execute: vi.fn() };
    updateRawDataCommand = { execute: vi.fn() };
    deleteRawDataCommand = { execute: vi.fn() };
    listRawDataQuery = { execute: vi.fn() };
    getRawDataQuery = { execute: vi.fn() };

    controller = new RawDataController(
      createRawDataCommand as unknown as CreateRawDataCommand,
      updateRawDataCommand as unknown as UpdateRawDataCommand,
      deleteRawDataCommand as unknown as DeleteRawDataCommand,
      listRawDataQuery as unknown as ListRawDataQuery,
      getRawDataQuery as unknown as GetRawDataQuery,
    );
  });

  describe("list", () => {
    it("returns 200 with a list of raw data (no filter)", async () => {
      const items = [makeRawDataDto()];
      listRawDataQuery.execute.mockResolvedValue(items);

      const req = makeReq({ projectId: "project-id" });
      const res = mockResponse();

      await controller.list(req, res);

      expect(listRawDataQuery.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        type: undefined,
        expired: false,
      });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("returns 200 with type filter", async () => {
      const items = [makeRawDataDto({ type: RawDataType.NEWS })];
      listRawDataQuery.execute.mockResolvedValue(items);

      const req = makeReq({ projectId: "project-id" }, undefined, { type: "NEWS" });
      const res = mockResponse();

      await controller.list(req, res);

      expect(listRawDataQuery.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        type: "NEWS",
        expired: false,
      });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("returns 200 with expired filter", async () => {
      const items = [makeRawDataDto({ isFresh: false })];
      listRawDataQuery.execute.mockResolvedValue(items);

      const req = makeReq({ projectId: "project-id" }, undefined, { expired: "true" });
      const res = mockResponse();

      await controller.list(req, res);

      expect(listRawDataQuery.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        type: undefined,
        expired: true,
      });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("returns 400 when type filter is invalid", async () => {
      const req = makeReq({ projectId: "project-id" }, undefined, { type: "INVALID_TYPE" });
      const res = mockResponse();

      await controller.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(listRawDataQuery.execute).not.toHaveBeenCalled();
    });

    it("returns 500 when the query throws", async () => {
      listRawDataQuery.execute.mockRejectedValue(new Error("DB error"));
      const req = makeReq({ projectId: "project-id" });
      const res = mockResponse();

      await controller.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("create", () => {
    it("returns 201 with the created raw data", async () => {
      const dto = makeRawDataDto({ title: "New Data" });
      createRawDataCommand.execute.mockResolvedValue(dto);

      const req = makeReq(
        { projectId: "project-id" },
        { type: "NEWS", title: "New Data", content: "Content" },
      );
      const res = mockResponse();

      await controller.create(req, res);

      expect(createRawDataCommand.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        type: "NEWS",
        title: "New Data",
        content: "Content",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 400 when validation fails (empty title)", async () => {
      const req = makeReq(
        { projectId: "project-id" },
        { type: "NEWS", title: "", content: "Content" },
      );
      const res = mockResponse();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(createRawDataCommand.execute).not.toHaveBeenCalled();
    });

    it("returns 400 when validation fails (invalid type)", async () => {
      const req = makeReq(
        { projectId: "project-id" },
        { type: "INVALID_TYPE", title: "Title", content: "Content" },
      );
      const res = mockResponse();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(createRawDataCommand.execute).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("returns 200 with the raw data", async () => {
      const dto = makeRawDataDto();
      getRawDataQuery.execute.mockResolvedValue(dto);

      const req = makeReq({ projectId: "project-id", id: "test-id" });
      const res = mockResponse();

      await controller.get(req, res);

      expect(getRawDataQuery.execute).toHaveBeenCalledWith({ id: "test-id" });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 404 when raw data is not found", async () => {
      getRawDataQuery.execute.mockRejectedValue(new NotFoundError("RawData", "missing-id"));

      const req = makeReq({ projectId: "project-id", id: "missing-id" });
      const res = mockResponse();

      await controller.get(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("returns 200 with the updated raw data", async () => {
      const dto = makeRawDataDto({ title: "Updated Title" });
      updateRawDataCommand.execute.mockResolvedValue(dto);

      const req = makeReq({ projectId: "project-id", id: "test-id" }, { title: "Updated Title" });
      const res = mockResponse();

      await controller.update(req, res);

      expect(updateRawDataCommand.execute).toHaveBeenCalledWith({
        id: "test-id",
        projectId: "project-id",
        title: "Updated Title",
      });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 404 when raw data is not found", async () => {
      updateRawDataCommand.execute.mockRejectedValue(new NotFoundError("RawData", "missing-id"));

      const req = makeReq({ projectId: "project-id", id: "missing-id" }, { title: "Updated" });
      const res = mockResponse();

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 when validation fails (empty title)", async () => {
      const req = makeReq({ projectId: "project-id", id: "test-id" }, { title: "" });
      const res = mockResponse();

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(updateRawDataCommand.execute).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("returns 204 when raw data is deleted", async () => {
      deleteRawDataCommand.execute.mockResolvedValue(undefined);

      const req = makeReq({ projectId: "project-id", id: "test-id" });
      const res = mockResponse();

      await controller.delete(req, res);

      expect(deleteRawDataCommand.execute).toHaveBeenCalledWith({
        id: "test-id",
        projectId: "project-id",
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 404 when raw data is not found", async () => {
      deleteRawDataCommand.execute.mockRejectedValue(new NotFoundError("RawData", "missing-id"));

      const req = makeReq({ projectId: "project-id", id: "missing-id" });
      const res = mockResponse();

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
