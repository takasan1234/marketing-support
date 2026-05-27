import { IProjectRepository } from "@workspace/domain";
import { BaseQueryUseCase } from "./base.query";
import { ProjectDto, toProjectDto } from "../dto/project.dto";

export class ListProjectsQuery extends BaseQueryUseCase<Record<never, never>, ProjectDto[]> {
  constructor(private readonly repo: IProjectRepository) {
    super();
  }

  async execute(_: Record<never, never>): Promise<ProjectDto[]> {
    const entities = await this.repo.findAll();
    return entities.map(toProjectDto);
  }
}
