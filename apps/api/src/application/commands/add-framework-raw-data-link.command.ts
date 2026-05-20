import { BaseCommandUseCase } from "./base.command";
import { FrameworkRawDataLinkRepository, LinkDto } from "@workspace/database";
import { FrameworkType } from "@workspace/domain";
import { GetRawDataQuery } from "../queries/get-raw-data.query";
import { GetFrameworkEntryQuery } from "../queries/get-framework-entry.query";

type AddFrameworkRawDataLinkInput = {
  projectId: string;
  frameworkType: FrameworkType;
  rawDataId: string;
  subElementId?: string;
  note?: string;
};

export class AddFrameworkRawDataLinkCommand extends BaseCommandUseCase<
  AddFrameworkRawDataLinkInput,
  LinkDto
> {
  constructor(
    private readonly linkRepo: FrameworkRawDataLinkRepository,
    private readonly getRawDataQuery: GetRawDataQuery,
    private readonly getFrameworkEntryQuery: GetFrameworkEntryQuery,
  ) {
    super();
  }

  async execute(input: AddFrameworkRawDataLinkInput): Promise<LinkDto> {
    // Verify raw data belongs to the same project
    const rawData = await this.getRawDataQuery.execute({ id: input.rawDataId });
    if (rawData.projectId !== input.projectId) {
      throw new Error("Raw data does not belong to this project");
    }

    // Get the framework entry (will throw NotFoundError if not found)
    const entry = await this.getFrameworkEntryQuery.execute({
      projectId: input.projectId,
      frameworkType: input.frameworkType,
    });

    // Create the link
    const link = await this.linkRepo.create({
      frameworkEntryId: entry.id,
      rawDataId: input.rawDataId,
      subElementId: input.subElementId,
      note: input.note,
    });

    return link;
  }
}
