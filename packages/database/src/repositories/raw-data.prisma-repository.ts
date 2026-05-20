import type { RawData as PrismaRawData, RawDataType as PrismaRawDataType } from "@prisma/client";
import { RawDataEntity, IRawDataRepository, RawDataType } from "@workspace/domain";
import { PrismaClient } from "@prisma/client";
import { BasePrismaRepository } from "./base.prisma-repository";

const PRISMA_TO_DOMAIN_RAW_DATA_TYPE: Record<PrismaRawDataType, RawDataType> = {
  MARKET_STATS: RawDataType.MARKET_STATS,
  INDUSTRY_REPORT: RawDataType.INDUSTRY_REPORT,
  NEWS: RawDataType.NEWS,
  CUSTOMER_RESEARCH: RawDataType.CUSTOMER_RESEARCH,
  SNS_ANALYTICS: RawDataType.SNS_ANALYTICS,
  SEARCH_TRENDS: RawDataType.SEARCH_TRENDS,
  LOCATION_DATA: RawDataType.LOCATION_DATA,
  SALES_DATA: RawDataType.SALES_DATA,
  COMPETITOR_INFO: RawDataType.COMPETITOR_INFO,
  PARTNER_HEARING: RawDataType.PARTNER_HEARING,
  FINANCIAL_DATA: RawDataType.FINANCIAL_DATA,
  EXPERT_HEARING: RawDataType.EXPERT_HEARING,
};

const DOMAIN_TO_PRISMA_RAW_DATA_TYPE: Record<RawDataType, PrismaRawDataType> = {
  [RawDataType.MARKET_STATS]: "MARKET_STATS",
  [RawDataType.INDUSTRY_REPORT]: "INDUSTRY_REPORT",
  [RawDataType.NEWS]: "NEWS",
  [RawDataType.CUSTOMER_RESEARCH]: "CUSTOMER_RESEARCH",
  [RawDataType.SNS_ANALYTICS]: "SNS_ANALYTICS",
  [RawDataType.SEARCH_TRENDS]: "SEARCH_TRENDS",
  [RawDataType.LOCATION_DATA]: "LOCATION_DATA",
  [RawDataType.SALES_DATA]: "SALES_DATA",
  [RawDataType.COMPETITOR_INFO]: "COMPETITOR_INFO",
  [RawDataType.PARTNER_HEARING]: "PARTNER_HEARING",
  [RawDataType.FINANCIAL_DATA]: "FINANCIAL_DATA",
  [RawDataType.EXPERT_HEARING]: "EXPERT_HEARING",
};

type RawDataCreateInput = {
  projectId: string;
  type: PrismaRawDataType;
  title: string;
  content: string;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  collectedAt: Date;
  expiresAt?: Date | null;
  tags: string[];
};

export class RawDataPrismaRepository
  extends BasePrismaRepository<RawDataEntity, string, PrismaRawData, RawDataCreateInput>
  implements IRawDataRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected toDomain(model: PrismaRawData): RawDataEntity {
    return RawDataEntity.reconstruct({
      id: model.id,
      projectId: model.projectId,
      type: PRISMA_TO_DOMAIN_RAW_DATA_TYPE[model.type],
      title: model.title,
      content: model.content,
      sourceUrl: model.sourceUrl,
      sourceNote: model.sourceNote,
      collectedAt: model.collectedAt,
      expiresAt: model.expiresAt,
      tags: model.tags,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  protected toPersistence(entity: RawDataEntity): RawDataCreateInput {
    return {
      projectId: entity.projectId,
      type: DOMAIN_TO_PRISMA_RAW_DATA_TYPE[entity.type],
      title: entity.title,
      content: entity.content,
      sourceUrl: entity.sourceUrl ?? null,
      sourceNote: entity.sourceNote ?? null,
      collectedAt: entity.collectedAt,
      expiresAt: entity.expiresAt ?? null,
      tags: entity.tags,
    };
  }

  async findById(id: string): Promise<RawDataEntity | null> {
    const record = await this.prisma.rawData.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(entity: RawDataEntity): Promise<void> {
    const data = this.toPersistence(entity);
    await this.prisma.rawData.upsert({
      where: { id: entity.id },
      create: { ...data, id: entity.id },
      update: data,
    });
  }

  async delete(entity: RawDataEntity): Promise<void> {
    await this.prisma.rawData.delete({ where: { id: entity.id } });
  }

  async findByProject(projectId: string, type?: RawDataType): Promise<RawDataEntity[]> {
    const records = await this.prisma.rawData.findMany({
      where: {
        projectId,
        ...(type ? { type: DOMAIN_TO_PRISMA_RAW_DATA_TYPE[type] } : {}),
      },
      orderBy: { collectedAt: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findExpired(projectId: string): Promise<RawDataEntity[]> {
    const now = new Date();
    const records = await this.prisma.rawData.findMany({
      where: {
        projectId,
        expiresAt: { lt: now },
      },
      orderBy: { expiresAt: "asc" },
    });
    return records.map((r) => this.toDomain(r));
  }
}
