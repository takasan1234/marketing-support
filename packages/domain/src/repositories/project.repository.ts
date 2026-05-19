import { IRepository } from "./base.repository";
import { ProjectEntity } from "../models/project.entity";

export interface IProjectRepository extends IRepository<ProjectEntity, string> {
  findAll(): Promise<ProjectEntity[]>;
}
