import z from "zod";
import { DISCOVERY_SESSION_STATUS } from "../enums/discovery.enums";

export const ListSessionsQueryParamsSchema = z.object({
  userId: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  status: z
    .enum([
      DISCOVERY_SESSION_STATUS.IN_PROGRESS,
      DISCOVERY_SESSION_STATUS.COMPLETED,
      DISCOVERY_SESSION_STATUS.ABANDONED,
    ])
    .optional(),
  sortBy: z.enum(["created_at", "updated_at", "completeness_score"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListSessionsQueryParams = z.infer<typeof ListSessionsQueryParamsSchema>;
