import type {
  FrameworkEntry as PrismaFrameworkEntry,
  FrameworkType as PrismaFrameworkType,
  Prisma,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { FrameworkEntryEntity, IFrameworkEntryRepository } from "@workspace/domain";
import { FrameworkType } from "@workspace/domain";
import { BasePrismaRepository } from "./base.prisma-repository";

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
      frameworkType: model.frameworkType as unknown as FrameworkType,
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
      frameworkType: entity.frameworkType as unknown as PrismaFrameworkType,
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
    if (!entity.id) {
      await this.prisma.frameworkEntry.create({ data });
    } else {
      await this.prisma.frameworkEntry.upsert({
        where: { id: entity.id },
        create: { ...data, id: entity.id },
        update: data,
      });
    }
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
        frameworkType: frameworkType as unknown as PrismaFrameworkType,
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
        frameworkType: frameworkType as unknown as PrismaFrameworkType,
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
        frameworkType: frameworkType as unknown as PrismaFrameworkType,
      },
      _max: { version: true },
    });
    const maxVersion = result._max.version;
    return maxVersion === null ? 1 : maxVersion + 1;
  }
}
