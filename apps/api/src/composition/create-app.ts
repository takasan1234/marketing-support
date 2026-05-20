import express from "express";
import cors from "cors";
import { HealthController, ProjectController, RawDataController, FrameworkEntryController } from "../presentation";
import {
  createPrismaClient,
  ProjectPrismaRepository,
  RawDataPrismaRepository,
  FrameworkEntryPrismaRepository,
  FrameworkRawDataLinkRepository,
} from "@workspace/database";
import {
  CreateProjectCommand,
  UpdateProjectCommand,
  DeleteProjectCommand,
  ListProjectsQuery,
  GetProjectQuery,
  CreateRawDataCommand,
  UpdateRawDataCommand,
  DeleteRawDataCommand,
  ListRawDataQuery,
  GetRawDataQuery,
  UpsertFrameworkEntryCommand,
  CreateFrameworkVersionCommand,
  GetFrameworkEntryQuery,
  ListFrameworkVersionsQuery,
  AddFrameworkRawDataLinkCommand,
  DeleteFrameworkRawDataLinkCommand,
  ListFrameworkRawDataLinksQuery,
} from "../application";
import { env } from "../infrastructure/env";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS.split(","),
      credentials: true,
    })
  );
  app.use(express.json());

  const apiRouter = express.Router();
  const healthController = new HealthController();

  apiRouter.get("/health", healthController.check);

  // Project DI
  const prisma = createPrismaClient(env.DATABASE_URL);
  const projectRepo = new ProjectPrismaRepository(prisma);
  const createProject = new CreateProjectCommand(projectRepo);
  const updateProject = new UpdateProjectCommand(projectRepo);
  const deleteProject = new DeleteProjectCommand(projectRepo);
  const listProjects = new ListProjectsQuery(projectRepo);
  const getProject = new GetProjectQuery(projectRepo);
  const projectController = new ProjectController(
    createProject,
    updateProject,
    deleteProject,
    listProjects,
    getProject,
  );

  apiRouter.get("/projects", projectController.list);
  apiRouter.post("/projects", projectController.create);
  apiRouter.get("/projects/:id", projectController.get);
  apiRouter.put("/projects/:id", projectController.update);
  apiRouter.delete("/projects/:id", projectController.delete);

  // RawData DI
  const rawDataRepo = new RawDataPrismaRepository(prisma);
  const createRawData = new CreateRawDataCommand(rawDataRepo);
  const updateRawData = new UpdateRawDataCommand(rawDataRepo);
  const deleteRawData = new DeleteRawDataCommand(rawDataRepo);
  const listRawData = new ListRawDataQuery(rawDataRepo);
  const getRawData = new GetRawDataQuery(rawDataRepo);
  const rawDataController = new RawDataController(
    createRawData,
    updateRawData,
    deleteRawData,
    listRawData,
    getRawData,
  );

  apiRouter.get("/projects/:projectId/raw-data", rawDataController.list);
  apiRouter.post("/projects/:projectId/raw-data", rawDataController.create);
  apiRouter.get("/projects/:projectId/raw-data/:id", rawDataController.get);
  apiRouter.put("/projects/:projectId/raw-data/:id", rawDataController.update);
  apiRouter.delete("/projects/:projectId/raw-data/:id", rawDataController.delete);

  // FrameworkEntry DI
  const frameworkEntryRepo = new FrameworkEntryPrismaRepository(prisma);
  const linkRepo = new FrameworkRawDataLinkRepository(prisma);
  const upsertFrameworkEntry = new UpsertFrameworkEntryCommand(frameworkEntryRepo);
  const createFrameworkVersion = new CreateFrameworkVersionCommand(frameworkEntryRepo);
  const getFrameworkEntry = new GetFrameworkEntryQuery(frameworkEntryRepo);
  const listFrameworkVersions = new ListFrameworkVersionsQuery(frameworkEntryRepo);
  const addLink = new AddFrameworkRawDataLinkCommand(linkRepo, getRawData, getFrameworkEntry);
  const deleteLink = new DeleteFrameworkRawDataLinkCommand(linkRepo, getFrameworkEntry);
  const listLinks = new ListFrameworkRawDataLinksQuery(linkRepo, getFrameworkEntry);
  const frameworkController = new FrameworkEntryController(
    upsertFrameworkEntry,
    createFrameworkVersion,
    getFrameworkEntry,
    listFrameworkVersions,
    addLink,
    deleteLink,
    listLinks,
  );

  apiRouter.get("/projects/:projectId/frameworks/:frameworkType", frameworkController.getLatest);
  apiRouter.put("/projects/:projectId/frameworks/:frameworkType", frameworkController.upsert);
  apiRouter.get("/projects/:projectId/frameworks/:frameworkType/versions", frameworkController.listVersions);
  apiRouter.post("/projects/:projectId/frameworks/:frameworkType/versions", frameworkController.createVersion);
  apiRouter.get("/projects/:projectId/frameworks/:frameworkType/versions/:version", frameworkController.getVersion);
  apiRouter.post("/projects/:projectId/frameworks/:frameworkType/links", frameworkController.addLink);
  apiRouter.delete("/projects/:projectId/frameworks/:frameworkType/links/:linkId", frameworkController.deleteLink);
  apiRouter.get("/projects/:projectId/frameworks/:frameworkType/links", frameworkController.listLinks);

  app.use("/api/v1", apiRouter);

  return app;
}
