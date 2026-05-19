import { z } from "zod";

export const UpsertFrameworkEntrySchema = z.object({
  data: z.record(z.unknown()),
  note: z.string().optional(),
});

export const CreateVersionSchema = z.object({
  data: z.record(z.unknown()),
  note: z.string().optional(),
});

export const AddLinkSchema = z.object({
  rawDataId: z.string().min(1),
  subElementId: z.string().optional(),
  note: z.string().optional(),
});

export type UpsertFrameworkEntryInput = z.infer<typeof UpsertFrameworkEntrySchema>;
export type CreateVersionInput = z.infer<typeof CreateVersionSchema>;
export type AddLinkInput = z.infer<typeof AddLinkSchema>;
