import { IFrameworkEntryRepository, FrameworkEntryEntity, FrameworkType } from "@workspace/domain";
import { BaseCommandUseCase } from "./base.command";
import { FrameworkEntryDto, toFrameworkEntryDto } from "../dto/framework-entry.dto";

type TransactionClient = {
  $transaction: (fn: (tx: unknown) => Promise<void>) => Promise<void>;
};

type CreateFrameworkVersionInput = {
  projectId: string;
  frameworkType: FrameworkType;
  data: Record<string, unknown>;
  note?: string;
};

export class CreateFrameworkVersionCommand extends BaseCommandUseCase<
  CreateFrameworkVersionInput,
  FrameworkEntryDto
> {
  constructor(
    private readonly repo: IFrameworkEntryRepository,
    private readonly prisma: TransactionClient,
  ) {
    super();
  }

  async execute(input: CreateFrameworkVersionInput): Promise<FrameworkEntryDto> {
    let newEntity!: FrameworkEntryEntity;

    await this.prisma.$transaction(async () => {
      // 1. Existing latest entry -> markNotLatest
      const existing = await this.repo.findLatest(input.projectId, input.frameworkType);
      if (existing) {
        const notLatest = existing.markNotLatest();
        await this.repo.save(notLatest);
      }

      // 2. Get next version number
      const nextVersion = await this.repo.getNextVersion(input.projectId, input.frameworkType);

      // 3. Create new version entity
      newEntity = FrameworkEntryEntity.reconstruct({
        id: "",
        projectId: input.projectId,
        frameworkType: input.frameworkType,
        version: nextVersion,
        isLatest: true,
        data: input.data,
        note: input.note ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.repo.save(newEntity);
    });

    return toFrameworkEntryDto(newEntity);
  }
}
