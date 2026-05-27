import { IRepository } from "./base.repository";
import { RawDataEntity } from "../models/raw-data.entity";
import { RawDataType } from "../shared/raw-data-type";

export interface IRawDataRepository extends IRepository<RawDataEntity, string> {
  findByProject(projectId: string, type?: RawDataType): Promise<RawDataEntity[]>;
  findExpired(projectId: string): Promise<RawDataEntity[]>;
}
