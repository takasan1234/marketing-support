import { IFrameworkEntryRepository, FrameworkType } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { FrameworkEntryDto, toFrameworkEntryDto } from "../dto/framework-entry.dto";
import { NotFoundError } from "../errors";

type GetFrameworkEntryInput = {
  projectId: string;
  frameworkType: FrameworkType;
  version?: number;
};

export class GetFrameworkEntryQuery extends BaseQueryUseCase<
  GetFrameworkEntryInput,
  FrameworkEntryDto
> {
  constructor(private readonly repo: IFrameworkEntryRepository) {
    super();
  }

  async execute(input: GetFrameworkEntryInput): Promise<FrameworkEntryDto> {
    if (input.version !== undefined) {
      const versions = await this.repo.findAllVersions(input.projectId, input.frameworkType);
      const entity = versions.find((e) => e.version === input.version);
      if (!entity) {
        throw new NotFoundError(
          "FrameworkEntry",
          `${input.projectId}/${input.frameworkType}/v${input.version}`,
        );
      }
      return toFrameworkEntryDto(entity);
    }

    const entity = await this.repo.findLatest(input.projectId, input.frameworkType);
    if (!entity) {
      throw new NotFoundError(
        "FrameworkEntry",
        `${input.projectId}/${input.frameworkType}`,
      );
    }
    return toFrameworkEntryDto(entity);
  }
}
