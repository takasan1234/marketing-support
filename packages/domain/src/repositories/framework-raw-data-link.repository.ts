export type LinkDto = {
  id: string;
  frameworkEntryId: string;
  rawDataId: string;
  subElementId?: string | null;
  note?: string | null;
  createdAt: string;
};

export interface IFrameworkRawDataLinkRepository {
  findById(linkId: string): Promise<LinkDto | null>;
  create(data: {
    frameworkEntryId: string;
    rawDataId: string;
    subElementId?: string;
    note?: string;
  }): Promise<LinkDto>;
  delete(linkId: string): Promise<void>;
  findByFrameworkEntry(frameworkEntryId: string): Promise<LinkDto[]>;
}
