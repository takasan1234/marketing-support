import { IRawDataRepository, RawDataEntity } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { RawDataDto, toRawDataDto } from "../dto/raw-data.dto";
import { NotFoundError } from "../errors";

type UpdateRawDataInput = {
  id: string;
  title?: string;
  content?: string;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  collectedAt?: string;
  tags?: string[];
};

export class UpdateRawDataCommand extends BaseCommandUseCase<UpdateRawDataInput, RawDataDto> {
  constructor(private readonly repo: IRawDataRepository) {
    super();
  }

  async execute(input: UpdateRawDataInput): Promise<RawDataDto> {
    let entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("RawData", input.id);
    }

    if (input.collectedAt !== undefined) {
      entity = entity.refreshCollectedAt(new Date(input.collectedAt));
    }

    entity = RawDataEntity.reconstruct({
      id: entity.id,
      projectId: entity.projectId,
      type: entity.type,
      title: input.title !== undefined ? input.title : entity.title,
      content: input.content !== undefined ? input.content : entity.content,
      sourceUrl: input.sourceUrl !== undefined ? input.sourceUrl : entity.sourceUrl ?? null,
      sourceNote: input.sourceNote !== undefined ? input.sourceNote : entity.sourceNote ?? null,
      collectedAt: entity.collectedAt,
      expiresAt: entity.expiresAt ?? null,
      tags: input.tags !== undefined ? input.tags : entity.tags,
      createdAt: entity.createdAt,
      updatedAt: new Date(),
    });

    await this.repo.save(entity);
    return toRawDataDto(entity);
  }
}
