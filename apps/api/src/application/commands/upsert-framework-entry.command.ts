import { IFrameworkEntryRepository, FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { FrameworkEntryDto, toFrameworkEntryDto } from "../dto/framework-entry.dto";

type UpsertFrameworkEntryInput = {
  projectId: string;
  frameworkType: FrameworkType;
  data: Record<string, unknown>;
  note?: string;
};

export class UpsertFrameworkEntryCommand extends BaseCommandUseCase<
  UpsertFrameworkEntryInput,
  FrameworkEntryDto
> {
  constructor(private readonly repo: IFrameworkEntryRepository) {
    super();
  }

  async execute(input: UpsertFrameworkEntryInput): Promise<FrameworkEntryDto> {
    const existing = await this.repo.findLatest(input.projectId, input.frameworkType);

    if (existing) {
      const updated = existing.updateData(input.data);
      await this.repo.save(updated);
      return toFrameworkEntryDto(updated);
    } else {
      const entity = FrameworkEntryEntity.create({
        projectId: input.projectId,
        frameworkType: input.frameworkType,
        data: input.data,
        note: input.note,
      });
      await this.repo.save(entity);
      return toFrameworkEntryDto(entity);
    }
  }
}
