import { z } from "zod";

export const quotationIdSchema = z.string().uuid();

export const updateQuotationSchema = z.object({
  estimation_type: z.string().optional(),
  scope: z.string().max(10000).optional(),
  platforms: z.array(z.string().uuid()).optional(),
  dynamic_attributes: z.record(z.unknown()).optional(),
});

export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
