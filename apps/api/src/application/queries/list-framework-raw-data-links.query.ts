import { BaseQueryUseCase } from "./base.query";
import { IFrameworkRawDataLinkRepository, LinkDto, FrameworkType } from "@workspace/domain";
import { GetFrameworkEntryQuery } from "./get-framework-entry.query";

type ListFrameworkRawDataLinksInput = {
  projectId: string;
  frameworkType: FrameworkType;
};

export class ListFrameworkRawDataLinksQuery extends BaseQueryUseCase<
  ListFrameworkRawDataLinksInput,
  LinkDto[]
> {
  constructor(
    private readonly linkRepo: IFrameworkRawDataLinkRepository,
    private readonly getFrameworkEntryQuery: GetFrameworkEntryQuery,
  ) {
    super();
  }

  async execute(input: ListFrameworkRawDataLinksInput): Promise<LinkDto[]> {
    // Get the framework entry (will throw NotFoundError if not found)
    const entry = await this.getFrameworkEntryQuery.execute({
      projectId: input.projectId,
      frameworkType: input.frameworkType,
    });

    // Get all links for this framework entry
    const links = await this.linkRepo.findByFrameworkEntry(entry.id);
    return links;
  }
}
