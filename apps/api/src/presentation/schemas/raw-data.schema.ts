import { z } from "zod";
import { RawDataType } from "@workspace/domain";

export const CreateRawDataSchema = z.object({
  type: z.nativeEnum(RawDataType),
  title: z.string().min(1),
  content: z.string(),
  sourceUrl: z.string().url().optional(),
  sourceNote: z.string().optional(),
  collectedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateRawDataSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceNote: z.string().nullable().optional(),
  collectedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateRawDataInput = z.infer<typeof CreateRawDataSchema>;
export type UpdateRawDataInput = z.infer<typeof UpdateRawDataSchema>;
