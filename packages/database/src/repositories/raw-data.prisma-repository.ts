import type { RawData as PrismaRawData, RawDataType as PrismaRawDataType } from "@prisma/client";
import { RawDataEntity, IRawDataRepository, RawDataType } from "@workspace/domain";
import { PrismaClient } from "@prisma/client";
import { BasePrismaRepository } from "./base.prisma-repository";

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
      type: model.type as unknown as RawDataType,
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
      type: entity.type as unknown as PrismaRawDataType,
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
    if (!entity.id) {
      await this.prisma.rawData.create({ data });
    } else {
      await this.prisma.rawData.upsert({
        where: { id: entity.id },
        create: { ...data, id: entity.id },
        update: data,
      });
    }
  }

  async delete(entity: RawDataEntity): Promise<void> {
    await this.prisma.rawData.delete({ where: { id: entity.id } });
  }

  async findByProject(projectId: string, type?: RawDataType): Promise<RawDataEntity[]> {
    const records = await this.prisma.rawData.findMany({
      where: {
        projectId,
        ...(type ? { type: type as unknown as PrismaRawDataType } : {}),
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
