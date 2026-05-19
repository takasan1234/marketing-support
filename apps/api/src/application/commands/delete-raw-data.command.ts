import { IRawDataRepository } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { NotFoundError } from "../errors";

type DeleteRawDataInput = {
  id: string;
};

export class DeleteRawDataCommand extends BaseCommandUseCase<DeleteRawDataInput, void> {
  constructor(private readonly repo: IRawDataRepository) {
    super();
  }

  async execute(input: DeleteRawDataInput): Promise<void> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundError("RawData", input.id);
    }
    await this.repo.delete(entity);
  }
}
