import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request } from "express";
import { FrameworkEntryController } from "./framework-entry.controller";
import { mockResponse } from "../../test-utils";
import { UpsertFrameworkEntryCommand } from "../../application/commands/upsert-framework-entry.command";
import { CreateFrameworkVersionCommand } from "../../application/commands/create-framework-version.command";
import { GetFrameworkEntryQuery } from "../../application/queries/get-framework-entry.query";
import { ListFrameworkVersionsQuery } from "../../application/queries/list-framework-versions.query";
import { NotFoundError } from "../../application/errors";
import type { FrameworkEntryDto } from "../../application/dto/framework-entry.dto";
import { FrameworkType } from "@workspace/domain";
import type { FrameworkRawDataLinkRepository, LinkDto } from "@workspace/database";

const makeEntryDto = (overrides: Partial<FrameworkEntryDto> = {}): FrameworkEntryDto => ({
  id: "entry-id",
  projectId: "project-id",
  frameworkType: FrameworkType.PEST,
  version: 1,
  isLatest: true,
  data: { political: "stable" },
  note: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeLinkDto = (overrides: Partial<LinkDto> = {}): LinkDto => ({
  id: "link-id",
  rawDataId: "raw-data-id",
  subElementId: null,
  note: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

function makeReq<P extends Record<string, string>, B>(params: P, body?: B): Request<P, unknown, B> {
  return { params, body } as Request<P, unknown, B>;
}

describe("FrameworkEntryController", () => {
  let upsertCmd: { execute: ReturnType<typeof vi.fn> };
  let createVersionCmd: { execute: ReturnType<typeof vi.fn> };
  let getEntryQuery: { execute: ReturnType<typeof vi.fn> };
  let listVersionsQuery: { execute: ReturnType<typeof vi.fn> };
  let linkRepo: {
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findByFrameworkEntry: ReturnType<typeof vi.fn>;
  };
  let controller: FrameworkEntryController;

  beforeEach(() => {
    upsertCmd = { execute: vi.fn() };
    createVersionCmd = { execute: vi.fn() };
    getEntryQuery = { execute: vi.fn() };
    listVersionsQuery = { execute: vi.fn() };
    linkRepo = {
      create: vi.fn(),
      delete: vi.fn(),
      findByFrameworkEntry: vi.fn(),
    };

    controller = new FrameworkEntryController(
      upsertCmd as unknown as UpsertFrameworkEntryCommand,
      createVersionCmd as unknown as CreateFrameworkVersionCommand,
      getEntryQuery as unknown as GetFrameworkEntryQuery,
      listVersionsQuery as unknown as ListFrameworkVersionsQuery,
      linkRepo as unknown as FrameworkRawDataLinkRepository,
    );
  });

  // -----------------------------------------------------------------------
  // upsert
  // -----------------------------------------------------------------------
  describe("upsert", () => {
    it("returns 200 with the upserted entry", async () => {
      const dto = makeEntryDto();
      upsertCmd.execute.mockResolvedValue(dto);

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { data: { political: "stable" } },
      );
      const res = mockResponse();

      await controller.upsert(req, res);

      expect(upsertCmd.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        frameworkType: FrameworkType.PEST,
        data: { political: "stable" },
        note: undefined,
      });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 400 for invalid frameworkType", async () => {
      const req = makeReq(
        { projectId: "project-id", frameworkType: "INVALID_TYPE" },
        { data: {} },
      );
      const res = mockResponse();

      await controller.upsert(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(upsertCmd.execute).not.toHaveBeenCalled();
    });

    it("returns 400 when body validation fails", async () => {
      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        // data field missing
        { note: "test" } as unknown as { data: Record<string, unknown> },
      );
      const res = mockResponse();

      await controller.upsert(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(upsertCmd.execute).not.toHaveBeenCalled();
    });

    it("returns 500 on unexpected error", async () => {
      upsertCmd.execute.mockRejectedValue(new Error("DB error"));

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { data: {} },
      );
      const res = mockResponse();

      await controller.upsert(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // createVersion (versioning logic)
  // -----------------------------------------------------------------------
  describe("createVersion", () => {
    it("returns 201 with the new version", async () => {
      const dto = makeEntryDto({ version: 2, isLatest: true });
      createVersionCmd.execute.mockResolvedValue(dto);

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { data: { political: "new data" } },
      );
      const res = mockResponse();

      await controller.createVersion(req, res);

      expect(createVersionCmd.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        frameworkType: FrameworkType.PEST,
        data: { political: "new data" },
        note: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 400 for invalid frameworkType", async () => {
      const req = makeReq(
        { projectId: "project-id", frameworkType: "BAD_TYPE" },
        { data: {} },
      );
      const res = mockResponse();

      await controller.createVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(createVersionCmd.execute).not.toHaveBeenCalled();
    });

    it("ensures new version is marked isLatest=true", async () => {
      const dto = makeEntryDto({ version: 3, isLatest: true });
      createVersionCmd.execute.mockResolvedValue(dto);

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { data: {} },
      );
      const res = mockResponse();

      await controller.createVersion(req, res);

      const result = ((res.json as ReturnType<typeof vi.fn>).mock.calls[0] as [FrameworkEntryDto])[0];
      expect(result.isLatest).toBe(true);
      expect(result.version).toBe(3);
    });

    it("returns 500 on unexpected error", async () => {
      createVersionCmd.execute.mockRejectedValue(new Error("DB error"));

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { data: {} },
      );
      const res = mockResponse();

      await controller.createVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // addLink
  // -----------------------------------------------------------------------
  describe("addLink", () => {
    it("returns 201 with the created link", async () => {
      const entryDto = makeEntryDto();
      const linkDto = makeLinkDto();
      getEntryQuery.execute.mockResolvedValue(entryDto);
      linkRepo.create.mockResolvedValue(linkDto);

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { rawDataId: "raw-data-id" },
      );
      const res = mockResponse();

      await controller.addLink(req, res);

      expect(getEntryQuery.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        frameworkType: FrameworkType.PEST,
      });
      expect(linkRepo.create).toHaveBeenCalledWith({
        frameworkEntryId: "entry-id",
        rawDataId: "raw-data-id",
        subElementId: undefined,
        note: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(linkDto);
    });

    it("returns 404 when framework entry not found", async () => {
      getEntryQuery.execute.mockRejectedValue(
        new NotFoundError("FrameworkEntry", "project-id/PEST"),
      );

      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        { rawDataId: "raw-data-id" },
      );
      const res = mockResponse();

      await controller.addLink(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 when rawDataId is missing", async () => {
      const req = makeReq(
        { projectId: "project-id", frameworkType: "PEST" },
        {} as { rawDataId: string },
      );
      const res = mockResponse();

      await controller.addLink(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(linkRepo.create).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // deleteLink
  // -----------------------------------------------------------------------
  describe("deleteLink", () => {
    it("returns 204 when link is deleted", async () => {
      linkRepo.delete.mockResolvedValue(undefined);

      const req = makeReq({
        projectId: "project-id",
        frameworkType: "PEST",
        linkId: "link-id",
      });
      const res = mockResponse();

      await controller.deleteLink(req, res);

      expect(linkRepo.delete).toHaveBeenCalledWith("link-id");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 400 for invalid frameworkType", async () => {
      const req = makeReq({
        projectId: "project-id",
        frameworkType: "INVALID",
        linkId: "link-id",
      });
      const res = mockResponse();

      await controller.deleteLink(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(linkRepo.delete).not.toHaveBeenCalled();
    });

    it("returns 500 on unexpected error", async () => {
      linkRepo.delete.mockRejectedValue(new Error("DB error"));

      const req = makeReq({
        projectId: "project-id",
        frameworkType: "PEST",
        linkId: "link-id",
      });
      const res = mockResponse();

      await controller.deleteLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // getLatest
  // -----------------------------------------------------------------------
  describe("getLatest", () => {
    it("returns 200 with the latest entry", async () => {
      const dto = makeEntryDto();
      getEntryQuery.execute.mockResolvedValue(dto);

      const req = makeReq({ projectId: "project-id", frameworkType: "PEST" });
      const res = mockResponse();

      await controller.getLatest(req, res);

      expect(getEntryQuery.execute).toHaveBeenCalledWith({
        projectId: "project-id",
        frameworkType: FrameworkType.PEST,
      });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 404 when not found", async () => {
      getEntryQuery.execute.mockRejectedValue(
        new NotFoundError("FrameworkEntry", "project-id/PEST"),
      );

      const req = makeReq({ projectId: "project-id", frameworkType: "PEST" });
      const res = mockResponse();

      await controller.getLatest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
