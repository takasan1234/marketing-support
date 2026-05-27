import { Request, Response } from "express";
import {
  CreateRawDataCommand,
  UpdateRawDataCommand,
  DeleteRawDataCommand,
  ListRawDataQuery,
  GetRawDataQuery,
  NotFoundError,
} from "../../application";
import { CreateRawDataSchema, UpdateRawDataSchema } from "../schemas/raw-data.schema";
import { RawDataType } from "@workspace/domain";

function parseRawDataType(value: string): RawDataType | null {
  const values = Object.values(RawDataType) as string[];
  if (values.includes(value)) {
    return value as RawDataType;
  }
  return null;
}

export class RawDataController {
  constructor(
    private readonly createRawDataCommand: CreateRawDataCommand,
    private readonly updateRawDataCommand: UpdateRawDataCommand,
    private readonly deleteRawDataCommand: DeleteRawDataCommand,
    private readonly listRawDataQuery: ListRawDataQuery,
    private readonly getRawDataQuery: GetRawDataQuery,
  ) {}

  list = async (req: Request<{ projectId: string }>, res: Response): Promise<void> => {
    try {
      const { type, expired } = req.query as { type?: string; expired?: string };
      if (type && !parseRawDataType(type)) {
        res.status(400).json({ error: `Invalid type: ${type}` });
        return;
      }
      const rawDataList = await this.listRawDataQuery.execute({
        projectId: req.params.projectId,
        type: type ? parseRawDataType(type)! : undefined,
        expired: expired === "true",
      });
      res.json(rawDataList);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  create = async (req: Request<{ projectId: string }>, res: Response): Promise<void> => {
    try {
      const parsed = CreateRawDataSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }
      const rawData = await this.createRawDataCommand.execute({
        projectId: req.params.projectId,
        ...parsed.data,
      });
      res.status(201).json(rawData);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  get = async (req: Request<{ projectId: string; id: string }>, res: Response): Promise<void> => {
    try {
      const rawData = await this.getRawDataQuery.execute({ id: req.params.id });
      if (rawData.projectId !== req.params.projectId) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(rawData);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  update = async (req: Request<{ projectId: string; id: string }>, res: Response): Promise<void> => {
    try {
      const parsed = UpdateRawDataSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }
      const rawData = await this.updateRawDataCommand.execute({
        id: req.params.id,
        projectId: req.params.projectId,
        ...parsed.data,
      });
      res.json(rawData);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  delete = async (req: Request<{ projectId: string; id: string }>, res: Response): Promise<void> => {
    try {
      await this.deleteRawDataCommand.execute({
        id: req.params.id,
        projectId: req.params.projectId,
      });
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
