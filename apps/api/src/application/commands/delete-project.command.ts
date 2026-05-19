import { IProjectRepository } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { NotFoundError } from "../errors";

type DeleteProjectInput = {
  id: string;
};

export class DeleteProjectCommand extends BaseCommandUseCase<DeleteProjectInput, void> {
  constructor(private readonly repo: IProjectRepository) {
    super();
  }

  async execute(input: DeleteProjectInput): Promise<void> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("Project", input.id);
    }
    await this.repo.delete(entity);
  }
}
