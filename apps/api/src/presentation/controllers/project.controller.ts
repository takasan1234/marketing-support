import { Request, Response } from "express";
import {
  CreateProjectCommand,
  UpdateProjectCommand,
  DeleteProjectCommand,
  ListProjectsQuery,
  GetProjectQuery,
  NotFoundError,
} from "../../application";
import { CreateProjectSchema, UpdateProjectSchema } from "../schemas/project.schema";

export class ProjectController {
  constructor(
    private readonly createProjectCommand: CreateProjectCommand,
    private readonly updateProjectCommand: UpdateProjectCommand,
    private readonly deleteProjectCommand: DeleteProjectCommand,
    private readonly listProjectsQuery: ListProjectsQuery,
    private readonly getProjectQuery: GetProjectQuery,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.listProjectsQuery.execute({});
      res.json(projects);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }
      const project = await this.createProjectCommand.execute(parsed.data);
      res.status(201).json(project);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  get = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const project = await this.getProjectQuery.execute({ id: req.params.id });
      res.json(project);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const parsed = UpdateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }
      const project = await this.updateProjectCommand.execute({ id: req.params.id, ...parsed.data });
      res.json(project);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      await this.deleteProjectCommand.execute({ id: req.params.id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
