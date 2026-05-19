import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request } from "express";
import { ProjectController } from "./project.controller";
import { mockRequest, mockResponse } from "../../test-utils";
import { CreateProjectCommand } from "../../application/commands/create-project.command";
import { UpdateProjectCommand } from "../../application/commands/update-project.command";
import { DeleteProjectCommand } from "../../application/commands/delete-project.command";
import { ListProjectsQuery } from "../../application/queries/list-projects.query";
import { GetProjectQuery } from "../../application/queries/get-project.query";
import { NotFoundError } from "../../application/errors";
import type { ProjectDto } from "../../application/dto/project.dto";

const makeProjectDto = (overrides: Partial<ProjectDto> = {}): ProjectDto => ({
  id: "test-id",
  name: "Test Project",
  description: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/** Helper: build a Request with params and optional body */
function makeReq<P extends Record<string, string>, B>(params: P, body?: B): Request<P, unknown, B> {
  return { params, body } as Request<P, unknown, B>;
}

describe("ProjectController", () => {
  let createProjectCommand: { execute: ReturnType<typeof vi.fn> };
  let updateProjectCommand: { execute: ReturnType<typeof vi.fn> };
  let deleteProjectCommand: { execute: ReturnType<typeof vi.fn> };
  let listProjectsQuery: { execute: ReturnType<typeof vi.fn> };
  let getProjectQuery: { execute: ReturnType<typeof vi.fn> };
  let controller: ProjectController;

  beforeEach(() => {
    createProjectCommand = { execute: vi.fn() };
    updateProjectCommand = { execute: vi.fn() };
    deleteProjectCommand = { execute: vi.fn() };
    listProjectsQuery = { execute: vi.fn() };
    getProjectQuery = { execute: vi.fn() };

    controller = new ProjectController(
      createProjectCommand as unknown as CreateProjectCommand,
      updateProjectCommand as unknown as UpdateProjectCommand,
      deleteProjectCommand as unknown as DeleteProjectCommand,
      listProjectsQuery as unknown as ListProjectsQuery,
      getProjectQuery as unknown as GetProjectQuery,
    );
  });

  describe("list", () => {
    it("returns 200 with a list of projects", async () => {
      const projects = [makeProjectDto()];
      listProjectsQuery.execute.mockResolvedValue(projects);

      const req = mockRequest();
      const res = mockResponse();

      await controller.list(req, res);

      expect(listProjectsQuery.execute).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(projects);
    });

    it("returns 500 when the query throws", async () => {
      listProjectsQuery.execute.mockRejectedValue(new Error("DB error"));
      const req = mockRequest();
      const res = mockResponse();

      await controller.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("create", () => {
    it("returns 201 with the created project", async () => {
      const dto = makeProjectDto({ name: "New Project" });
      createProjectCommand.execute.mockResolvedValue(dto);

      const req = makeReq({}, { name: "New Project" });
      const res = mockResponse();

      await controller.create(req, res);

      expect(createProjectCommand.execute).toHaveBeenCalledWith({ name: "New Project" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 400 when validation fails", async () => {
      const req = makeReq({}, { name: "" });
      const res = mockResponse();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(createProjectCommand.execute).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("returns 200 with the project", async () => {
      const dto = makeProjectDto();
      getProjectQuery.execute.mockResolvedValue(dto);

      const req = makeReq({ id: "test-id" });
      const res = mockResponse();

      await controller.get(req, res);

      expect(getProjectQuery.execute).toHaveBeenCalledWith({ id: "test-id" });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 404 when project is not found", async () => {
      getProjectQuery.execute.mockRejectedValue(new NotFoundError("Project", "missing-id"));

      const req = makeReq({ id: "missing-id" });
      const res = mockResponse();

      await controller.get(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("returns 200 with the updated project", async () => {
      const dto = makeProjectDto({ name: "Updated" });
      updateProjectCommand.execute.mockResolvedValue(dto);

      const req = makeReq({ id: "test-id" }, { name: "Updated" });
      const res = mockResponse();

      await controller.update(req, res);

      expect(updateProjectCommand.execute).toHaveBeenCalledWith({ id: "test-id", name: "Updated" });
      expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("returns 404 when project is not found", async () => {
      updateProjectCommand.execute.mockRejectedValue(new NotFoundError("Project", "missing-id"));

      const req = makeReq({ id: "missing-id" }, { name: "Updated" });
      const res = mockResponse();

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("returns 204 when project is deleted", async () => {
      deleteProjectCommand.execute.mockResolvedValue(undefined);

      const req = makeReq({ id: "test-id" });
      const res = mockResponse();

      await controller.delete(req, res);

      expect(deleteProjectCommand.execute).toHaveBeenCalledWith({ id: "test-id" });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 404 when project is not found", async () => {
      deleteProjectCommand.execute.mockRejectedValue(new NotFoundError("Project", "missing-id"));

      const req = makeReq({ id: "missing-id" });
      const res = mockResponse();

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
