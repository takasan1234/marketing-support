import { PrismaClient } from "@prisma/client";

export type LinkDto = {
  id: string;
  rawDataId: string;
  subElementId?: string | null;
  note?: string | null;
  createdAt: string;
};

export class FrameworkRawDataLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
    return {
      id: record.id,
      rawDataId: record.rawDataId,
      subElementId: record.subElementId,
      note: record.note,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async delete(linkId: string): Promise<void> {
    await this.prisma.frameworkRawDataLink.delete({ where: { id: linkId } });
  }

  async findByFrameworkEntry(frameworkEntryId: string): Promise<LinkDto[]> {
    const records = await this.prisma.frameworkRawDataLink.findMany({
      where: { frameworkEntryId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => ({
      id: r.id,
      rawDataId: r.rawDataId,
      subElementId: r.subElementId,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
