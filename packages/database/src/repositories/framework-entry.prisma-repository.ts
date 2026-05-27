import type {
  FrameworkEntry as PrismaFrameworkEntry,
  FrameworkType as PrismaFrameworkType,
  Prisma,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { FrameworkEntryEntity, IFrameworkEntryRepository } from "@workspace/domain";
import { FrameworkType } from "@workspace/domain";
import { BasePrismaRepository } from "./base.prisma-repository";

const PRISMA_TO_DOMAIN_FRAMEWORK_TYPE: Record<PrismaFrameworkType, FrameworkType> = {
  PEST: FrameworkType.PEST,
  FIVE_FORCES: FrameworkType.FIVE_FORCES,
  INTERNAL_ANALYSIS: FrameworkType.INTERNAL_ANALYSIS,
  VRIO: FrameworkType.VRIO,
  THREE_C_PLUS_C: FrameworkType.THREE_C_PLUS_C,
  SWOT: FrameworkType.SWOT,
  CROSS_SWOT: FrameworkType.CROSS_SWOT,
  SEGMENTATION: FrameworkType.SEGMENTATION,
  TARGETING: FrameworkType.TARGETING,
  POSITIONING: FrameworkType.POSITIONING,
  CONCEPT_SHEET: FrameworkType.CONCEPT_SHEET,
  PRODUCT_4P: FrameworkType.PRODUCT_4P,
  PRICE_4P: FrameworkType.PRICE_4P,
  PLACE_4P: FrameworkType.PLACE_4P,
  PROMOTION_4P: FrameworkType.PROMOTION_4P,
  FOUR_C_SEVEN_P: FrameworkType.FOUR_C_SEVEN_P,
  BLUE_OCEAN: FrameworkType.BLUE_OCEAN,
  EXPERIENCE_VALUE: FrameworkType.EXPERIENCE_VALUE,
  VALUE_ADD_METHODS: FrameworkType.VALUE_ADD_METHODS,
  KGI_KSF_KPI: FrameworkType.KGI_KSF_KPI,
  CUSTOMER_JOURNEY: FrameworkType.CUSTOMER_JOURNEY,
  CRM_OVERVIEW: FrameworkType.CRM_OVERVIEW,
  CRM_ANALYSIS: FrameworkType.CRM_ANALYSIS,
};

const DOMAIN_TO_PRISMA_FRAMEWORK_TYPE: Record<FrameworkType, PrismaFrameworkType> = {
  [FrameworkType.PEST]: "PEST",
  [FrameworkType.FIVE_FORCES]: "FIVE_FORCES",
  [FrameworkType.INTERNAL_ANALYSIS]: "INTERNAL_ANALYSIS",
  [FrameworkType.VRIO]: "VRIO",
  [FrameworkType.THREE_C_PLUS_C]: "THREE_C_PLUS_C",
  [FrameworkType.SWOT]: "SWOT",
  [FrameworkType.CROSS_SWOT]: "CROSS_SWOT",
  [FrameworkType.SEGMENTATION]: "SEGMENTATION",
  [FrameworkType.TARGETING]: "TARGETING",
  [FrameworkType.POSITIONING]: "POSITIONING",
  [FrameworkType.CONCEPT_SHEET]: "CONCEPT_SHEET",
  [FrameworkType.PRODUCT_4P]: "PRODUCT_4P",
  [FrameworkType.PRICE_4P]: "PRICE_4P",
  [FrameworkType.PLACE_4P]: "PLACE_4P",
  [FrameworkType.PROMOTION_4P]: "PROMOTION_4P",
  [FrameworkType.FOUR_C_SEVEN_P]: "FOUR_C_SEVEN_P",
  [FrameworkType.BLUE_OCEAN]: "BLUE_OCEAN",
  [FrameworkType.EXPERIENCE_VALUE]: "EXPERIENCE_VALUE",
  [FrameworkType.VALUE_ADD_METHODS]: "VALUE_ADD_METHODS",
  [FrameworkType.KGI_KSF_KPI]: "KGI_KSF_KPI",
  [FrameworkType.CUSTOMER_JOURNEY]: "CUSTOMER_JOURNEY",
  [FrameworkType.CRM_OVERVIEW]: "CRM_OVERVIEW",
  [FrameworkType.CRM_ANALYSIS]: "CRM_ANALYSIS",
};

type FrameworkEntryCreateInput = {
  projectId: string;
  frameworkType: PrismaFrameworkType;
  version: number;
  isLatest: boolean;
  data: Prisma.InputJsonValue;
  note?: string | null;
};

export class FrameworkEntryPrismaRepository
  extends BasePrismaRepository<
    FrameworkEntryEntity,
    string,
    PrismaFrameworkEntry,
    FrameworkEntryCreateInput
  >
  implements IFrameworkEntryRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected toDomain(model: PrismaFrameworkEntry): FrameworkEntryEntity {
    return FrameworkEntryEntity.reconstruct({
      id: model.id,
      projectId: model.projectId,
      frameworkType: PRISMA_TO_DOMAIN_FRAMEWORK_TYPE[model.frameworkType],
      version: model.version,
      isLatest: model.isLatest,
      data: model.data as Record<string, unknown>,
      note: model.note,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  protected toPersistence(entity: FrameworkEntryEntity): FrameworkEntryCreateInput {
    return {
      projectId: entity.projectId,
      frameworkType: DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[entity.frameworkType],
      version: entity.version,
      isLatest: entity.isLatest,
      data: entity.data as Prisma.InputJsonValue,
      note: entity.note ?? null,
    };
  }

  async findById(id: string): Promise<FrameworkEntryEntity | null> {
    const record = await this.prisma.frameworkEntry.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(entity: FrameworkEntryEntity): Promise<void> {
    const data = this.toPersistence(entity);
    await this.prisma.frameworkEntry.upsert({
      where: { id: entity.id },
      create: { ...data, id: entity.id },
      update: data,
    });
  }

  async delete(entity: FrameworkEntryEntity): Promise<void> {
    await this.prisma.frameworkEntry.delete({ where: { id: entity.id } });
  }

  async findLatest(
    projectId: string,
    frameworkType: FrameworkType,
  ): Promise<FrameworkEntryEntity | null> {
    const record = await this.prisma.frameworkEntry.findFirst({
      where: {
        projectId,
        frameworkType: DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType],
        isLatest: true,
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllVersions(
    projectId: string,
    frameworkType: FrameworkType,
  ): Promise<FrameworkEntryEntity[]> {
    const records = await this.prisma.frameworkEntry.findMany({
      where: {
        projectId,
        frameworkType: DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType],
      },
      orderBy: { version: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findLatestByProject(projectId: string): Promise<FrameworkEntryEntity[]> {
    const records = await this.prisma.frameworkEntry.findMany({
      where: {
        projectId,
        isLatest: true,
      },
    });
    return records.map((r) => this.toDomain(r));
  }

  async getNextVersion(projectId: string, frameworkType: FrameworkType): Promise<number> {
    const result = await this.prisma.frameworkEntry.aggregate({
      where: {
        projectId,
        frameworkType: DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType],
      },
      _max: { version: true },
    });
    const maxVersion = result._max.version;
    return maxVersion === null ? 1 : maxVersion + 1;
  }

  async findByVersion(
    projectId: string,
    frameworkType: FrameworkType,
    version: number,
  ): Promise<FrameworkEntryEntity | null> {
    const record = await this.prisma.frameworkEntry.findFirst({
      where: {
        projectId,
        frameworkType: DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType],
        version,
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async createNextVersion(
    projectId: string,
    frameworkType: FrameworkType,
    data: Record<string, unknown>,
    note?: string | null,
  ): Promise<FrameworkEntryEntity> {
    const prismaType = DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType];
    return this.prisma.$transaction(async (tx) => {
      await tx.frameworkEntry.updateMany({
        where: { projectId, frameworkType: prismaType, isLatest: true },
        data: { isLatest: false },
      });

      const aggregate = await tx.frameworkEntry.aggregate({
        where: { projectId, frameworkType: prismaType },
        _max: { version: true },
      });
      const nextVersion =
        aggregate._max.version === null ? 1 : aggregate._max.version + 1;

      const created = await tx.frameworkEntry.create({
        data: {
          projectId,
          frameworkType: prismaType,
          version: nextVersion,
          isLatest: true,
          data: data as Prisma.InputJsonValue,
          note: note ?? null,
        },
      });

      return this.toDomain(created);
    });
  }

  async upsertLatest(
    projectId: string,
    frameworkType: FrameworkType,
    data: Record<string, unknown>,
    note?: string | null,
  ): Promise<FrameworkEntryEntity> {
    const prismaType = DOMAIN_TO_PRISMA_FRAMEWORK_TYPE[frameworkType];
    return this.prisma.$transaction(async (tx) => {
      const latest = await tx.frameworkEntry.findFirst({
        where: {
          projectId,
          frameworkType: prismaType,
          isLatest: true,
        },
      });

      if (latest) {
        const updated = await tx.frameworkEntry.update({
          where: { id: latest.id },
          data: {
            data: data as Prisma.InputJsonValue,
            note: note ?? null,
          },
        });
        return this.toDomain(updated);
      } else {
        const created = await tx.frameworkEntry.create({
          data: {
            projectId,
            frameworkType: prismaType,
            version: 1,
            isLatest: true,
            data: data as Prisma.InputJsonValue,
            note: note ?? null,
          },
        });
        return this.toDomain(created);
      }
    });
  }
}
