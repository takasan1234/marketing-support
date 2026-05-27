import { IProjectRepository } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { ProjectDto, toProjectDto } from "../dto/project.dto";
import { NotFoundError } from "../errors";

type GetProjectInput = {
  id: string;
};

export class GetProjectQuery extends BaseQueryUseCase<GetProjectInput, ProjectDto> {
  constructor(private readonly repo: IProjectRepository) {
    super();
  }

  async execute(input: GetProjectInput): Promise<ProjectDto> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("Project", input.id);
    }
    return toProjectDto(entity);
  }
}
