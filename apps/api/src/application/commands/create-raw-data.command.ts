import { IRawDataRepository, RawDataEntity, RawDataType } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { RawDataDto, toRawDataDto } from "../dto/raw-data.dto";

type CreateRawDataInput = {
  projectId: string;
  type: RawDataType;
  title: string;
  content: string;
  sourceUrl?: string;
  sourceNote?: string;
  collectedAt?: string;
  tags?: string[];
};

export class CreateRawDataCommand extends BaseCommandUseCase<CreateRawDataInput, RawDataDto> {
  constructor(private readonly repo: IRawDataRepository) {
    super();
  }

  async execute(input: CreateRawDataInput): Promise<RawDataDto> {
    const entity = RawDataEntity.create({
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      content: input.content,
      sourceUrl: input.sourceUrl,
      sourceNote: input.sourceNote,
      collectedAt: input.collectedAt ? new Date(input.collectedAt) : undefined,
      tags: input.tags,
    });
    await this.repo.save(entity);
    return toRawDataDto(entity);
  }
}
