import { Request, Response } from "express";
import { FrameworkType } from "@workspace/domain";
import {
  UpsertFrameworkEntryCommand,
  CreateFrameworkVersionCommand,
  GetFrameworkEntryQuery,
  GetRawDataQuery,
  ListFrameworkVersionsQuery,
  NotFoundError,
} from "../../application";
import { FrameworkRawDataLinkRepository } from "@workspace/database";
import {
  UpsertFrameworkEntrySchema,
  CreateVersionSchema,
  AddLinkSchema,
} from "../schemas/framework-entry.schema";

function parseFrameworkType(value: string): FrameworkType | null {
  const values = Object.values(FrameworkType) as string[];
  if (values.includes(value)) {
    return value as FrameworkType;
  }
  return null;
}

export class FrameworkEntryController {
  constructor(
    private readonly upsertFrameworkEntryCommand: UpsertFrameworkEntryCommand,
    private readonly createFrameworkVersionCommand: CreateFrameworkVersionCommand,
    private readonly getFrameworkEntryQuery: GetFrameworkEntryQuery,
    private readonly listFrameworkVersionsQuery: ListFrameworkVersionsQuery,
    private readonly linkRepo: FrameworkRawDataLinkRepository,
    private readonly getRawDataQuery: GetRawDataQuery,
  ) {}

  getLatest = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    try {
      const dto = await this.getFrameworkEntryQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
      });
      res.json(dto);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  upsert = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    const parsed = UpsertFrameworkEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    try {
      const dto = await this.upsertFrameworkEntryCommand.execute({
        projectId: req.params.projectId,
        frameworkType,
        data: parsed.data.data,
        note: parsed.data.note,
      });
      res.json(dto);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  listVersions = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    try {
      const dtos = await this.listFrameworkVersionsQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
      });
      res.json(dtos);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  createVersion = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    const parsed = CreateVersionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    try {
      const dto = await this.createFrameworkVersionCommand.execute({
        projectId: req.params.projectId,
        frameworkType,
        data: parsed.data.data,
        note: parsed.data.note,
      });
      res.status(201).json(dto);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getVersion = async (
    req: Request<{ projectId: string; frameworkType: string; version: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    const version = parseInt(req.params.version, 10);
    if (isNaN(version) || version < 1) {
      res.status(400).json({ error: "Invalid version number" });
      return;
    }
    try {
      const dto = await this.getFrameworkEntryQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
        version,
      });
      res.json(dto);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  addLink = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    const parsed = AddLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    try {
      // Verify raw data belongs to the same project
      const rawData = await this.getRawDataQuery.execute({ id: parsed.data.rawDataId });
      if (rawData.projectId !== req.params.projectId) {
        res.status(400).json({ error: "Raw data does not belong to this project" });
        return;
      }

      const entry = await this.getFrameworkEntryQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
      });
      const link = await this.linkRepo.create({
        frameworkEntryId: entry.id,
        rawDataId: parsed.data.rawDataId,
        subElementId: parsed.data.subElementId,
        note: parsed.data.note,
      });
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteLink = async (
    req: Request<{ projectId: string; frameworkType: string; linkId: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    try {
      // Verify the link belongs to the correct project's framework
      const link = await this.linkRepo.findById(req.params.linkId);
      if (!link) {
        res.status(404).json({ error: "Link not found" });
        return;
      }
      const entry = await this.getFrameworkEntryQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
      });
      if (link.frameworkEntryId !== entry.id) {
        res.status(404).json({ error: "Link not found" });
        return;
      }
      await this.linkRepo.delete(req.params.linkId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };

  listLinks = async (
    req: Request<{ projectId: string; frameworkType: string }>,
    res: Response,
  ): Promise<void> => {
    const frameworkType = parseFrameworkType(req.params.frameworkType);
    if (!frameworkType) {
      res.status(400).json({ error: `Invalid frameworkType: ${req.params.frameworkType}` });
      return;
    }
    try {
      const entry = await this.getFrameworkEntryQuery.execute({
        projectId: req.params.projectId,
        frameworkType,
      });
      const links = await this.linkRepo.findByFrameworkEntry(entry.id);
      res.json(links);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
