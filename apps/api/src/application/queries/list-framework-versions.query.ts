import { IFrameworkEntryRepository, FrameworkType } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { FrameworkEntryDto, toFrameworkEntryDto } from "../dto/framework-entry.dto";

type ListFrameworkVersionsInput = {
  projectId: string;
  frameworkType: FrameworkType;
};

export class ListFrameworkVersionsQuery extends BaseQueryUseCase<
  ListFrameworkVersionsInput,
  FrameworkEntryDto[]
> {
  constructor(private readonly repo: IFrameworkEntryRepository) {
    super();
  }

  async execute(input: ListFrameworkVersionsInput): Promise<FrameworkEntryDto[]> {
    const entities = await this.repo.findAllVersions(input.projectId, input.frameworkType);
    return entities.map(toFrameworkEntryDto);
  }
}
