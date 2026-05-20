import { IRepository } from "./base.repository";
import { FrameworkEntryEntity } from "../models/framework-entry.entity";
import { FrameworkType } from "../shared/framework-type";

export interface IFrameworkEntryRepository extends IRepository<FrameworkEntryEntity, string> {
  findLatest(projectId: string, frameworkType: FrameworkType): Promise<FrameworkEntryEntity | null>;
  findAllVersions(projectId: string, frameworkType: FrameworkType): Promise<FrameworkEntryEntity[]>;
  findByVersion(projectId: string, frameworkType: FrameworkType, version: number): Promise<FrameworkEntryEntity | null>;
  findLatestByProject(projectId: string): Promise<FrameworkEntryEntity[]>;
  getNextVersion(projectId: string, frameworkType: FrameworkType): Promise<number>;
  createNextVersion(
    projectId: string,
    frameworkType: FrameworkType,
    data: Record<string, unknown>,
    note?: string | null,
  ): Promise<FrameworkEntryEntity>;
}
