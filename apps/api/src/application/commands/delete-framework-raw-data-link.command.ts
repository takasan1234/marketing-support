import { BaseCommandUseCase } from "./base.command";
import { FrameworkRawDataLinkRepository } from "@workspace/database";
import { FrameworkType } from "@workspace/domain";
import { GetFrameworkEntryQuery } from "../queries/get-framework-entry.query";
import { NotFoundError } from "../errors";

type DeleteFrameworkRawDataLinkInput = {
  projectId: string;
  frameworkType: FrameworkType;
  linkId: string;
};

export class DeleteFrameworkRawDataLinkCommand extends BaseCommandUseCase<
  DeleteFrameworkRawDataLinkInput,
  void
> {
  constructor(
    private readonly linkRepo: FrameworkRawDataLinkRepository,
    private readonly getFrameworkEntryQuery: GetFrameworkEntryQuery,
  ) {
    super();
  }

  async execute(input: DeleteFrameworkRawDataLinkInput): Promise<void> {
    // Verify the link exists
    const link = await this.linkRepo.findById(input.linkId);
    if (!link) {
      throw new NotFoundError("Link", input.linkId);
    }

    // Verify the link belongs to the correct project's framework
    const entry = await this.getFrameworkEntryQuery.execute({
      projectId: input.projectId,
      frameworkType: input.frameworkType,
    });

    if (link.frameworkEntryId !== entry.id) {
      throw new NotFoundError("Link", input.linkId);
    }

    // Delete the link
    await this.linkRepo.delete(input.linkId);
  }
}
