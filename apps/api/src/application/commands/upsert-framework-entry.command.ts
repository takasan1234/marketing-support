import { IFrameworkEntryRepository, FrameworkType } from "@workspace/domain";
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
    const entity = await this.repo.upsertLatest(
      input.projectId,
      input.frameworkType,
      input.data,
      input.note,
    );
    return toFrameworkEntryDto(entity);
  }
}
