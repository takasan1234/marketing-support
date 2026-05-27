import { IProjectRepository } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { ProjectDto, toProjectDto } from "../dto/project.dto";
import { NotFoundError } from "../errors";

type UpdateProjectInput = {
  id: string;
  name?: string;
  description?: string | null;
};

export class UpdateProjectCommand extends BaseCommandUseCase<UpdateProjectInput, ProjectDto> {
  constructor(private readonly repo: IProjectRepository) {
    super();
  }

  async execute(input: UpdateProjectInput): Promise<ProjectDto> {
    let entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("Project", input.id);
    }

    if (input.name !== undefined) {
      entity = entity.updateName(input.name);
    }
    if (input.description !== undefined) {
      entity = entity.updateDescription(input.description);
    }

    await this.repo.save(entity);
    return toProjectDto(entity);
  }
}
