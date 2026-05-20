import { IFrameworkEntryRepository, FrameworkType } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { FrameworkEntryDto, toFrameworkEntryDto } from "../dto/framework-entry.dto";

type CreateFrameworkVersionInput = {
  projectId: string;
  frameworkType: FrameworkType;
  data: Record<string, unknown>;
  note?: string;
};

export class CreateFrameworkVersionCommand extends BaseCommandUseCase<
  CreateFrameworkVersionInput,
  FrameworkEntryDto
> {
  constructor(private readonly repo: IFrameworkEntryRepository) {
    super();
  }

  async execute(input: CreateFrameworkVersionInput): Promise<FrameworkEntryDto> {
    const entity = await this.repo.createNextVersion(
      input.projectId,
      input.frameworkType,
      input.data,
      input.note ?? null,
    );
    return toFrameworkEntryDto(entity);
  }
}
