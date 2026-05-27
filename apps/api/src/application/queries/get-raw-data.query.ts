import { IRawDataRepository } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { RawDataDto, toRawDataDto } from "../dto/raw-data.dto";
import { NotFoundError } from "../errors";

type GetRawDataInput = {
  id: string;
};

export class GetRawDataQuery extends BaseQueryUseCase<GetRawDataInput, RawDataDto> {
  constructor(private readonly repo: IRawDataRepository) {
    super();
  }

  async execute(input: GetRawDataInput): Promise<RawDataDto> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("RawData", input.id);
    }
    return toRawDataDto(entity);
  }
}
