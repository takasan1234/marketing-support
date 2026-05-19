import { IRawDataRepository, RawDataType } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { RawDataDto, toRawDataDto } from "../dto/raw-data.dto";

type ListRawDataInput = {
  projectId: string;
  type?: RawDataType;
  expired?: boolean;
};

export class ListRawDataQuery extends BaseQueryUseCase<ListRawDataInput, RawDataDto[]> {
  constructor(private readonly repo: IRawDataRepository) {
    super();
  }

  async execute(input: ListRawDataInput): Promise<RawDataDto[]> {
    if (input.expired) {
      const entities = await this.repo.findExpired(input.projectId);
      return entities.map(toRawDataDto);
    }
    const entities = await this.repo.findByProject(input.projectId, input.type);
    return entities.map(toRawDataDto);
  }
}
