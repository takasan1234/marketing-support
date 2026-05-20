import { z } from "zod";
import { RawDataType } from "@workspace/domain";

export const CreateRawDataSchema = z.object({
  type: z.nativeEnum(RawDataType),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100_000),
  sourceUrl: z.string().url().optional(),
  sourceNote: z.string().max(1_000).optional(),
  collectedAt: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const UpdateRawDataSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100_000).optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceNote: z.string().max(1_000).nullable().optional(),
  collectedAt: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export type CreateRawDataInput = z.infer<typeof CreateRawDataSchema>;
export type UpdateRawDataInput = z.infer<typeof UpdateRawDataSchema>;
