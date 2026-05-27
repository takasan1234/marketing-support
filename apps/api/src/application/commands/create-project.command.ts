import { IProjectRepository, ProjectEntity } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { ProjectDto, toProjectDto } from "../dto/project.dto";

type CreateProjectInput = {
  name: string;
  description?: string;
};

export class CreateProjectCommand extends BaseCommandUseCase<CreateProjectInput, ProjectDto> {
  constructor(private readonly repo: IProjectRepository) {
    super();
  }

  async execute(input: CreateProjectInput): Promise<ProjectDto> {
    const entity = ProjectEntity.create({ name: input.name, description: input.description });
    await this.repo.save(entity);
    return toProjectDto(entity);
  }
}
