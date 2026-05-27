import { PrismaClient } from "@prisma/client";
import { IFrameworkRawDataLinkRepository, LinkDto } from "@workspace/domain";

export class FrameworkRawDataLinkRepository implements IFrameworkRawDataLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDto(record: {
    id: string;
    frameworkEntryId: string;
    rawDataId: string;
    subElementId: string | null;
    note: string | null;
    createdAt: Date;
  }): LinkDto {
    return {
      id: record.id,
      frameworkEntryId: record.frameworkEntryId,
      rawDataId: record.rawDataId,
      subElementId: record.subElementId,
      note: record.note,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async findById(linkId: string): Promise<LinkDto | null> {
    const record = await this.prisma.frameworkRawDataLink.findUnique({
      where: { id: linkId },
    });
    if (!record) return null;
    return this.toDto(record);
  }

  async create(data: {
    frameworkEntryId: string;
    rawDataId: string;
    subElementId?: string;
    note?: string;
  }): Promise<LinkDto> {
    const record = await this.prisma.frameworkRawDataLink.create({
      data: {
        frameworkEntryId: data.frameworkEntryId,
        rawDataId: data.rawDataId,
        subElementId: data.subElementId ?? null,
        note: data.note ?? null,
      },
    });
    return this.toDto(record);
  }

  async delete(linkId: string): Promise<void> {
    await this.prisma.frameworkRawDataLink.delete({ where: { id: linkId } });
  }

  async findByFrameworkEntry(frameworkEntryId: string): Promise<LinkDto[]> {
    const records = await this.prisma.frameworkRawDataLink.findMany({
      where: { frameworkEntryId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toDto(r));
  }
}
