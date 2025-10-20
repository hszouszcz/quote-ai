import type { APIRoute } from "astro";
import { z } from "zod";
import { withErrorHandling, AuthorizationError, ValidationError } from "@/lib/errors";
import { validateRequestBody, validateQueryParams, commonSchemas } from "@/lib/validation";
import { createQuotationService } from "@/lib/services/quotation.service";
import { analyzeProject } from "@/lib/services/ai.service";

// Validation schemas
const createQuotationSchema = z.object({
  estimation_type: z.enum(["Fixed Price", "Time & Material"]),
  scope: z.string().max(10000, "Scope description cannot exceed 10000 characters"),
  platforms: z.array(z.string()).min(1, "At least one platform must be selected"),
  dynamic_attributes: z.union([z.record(z.unknown()), z.null()]).optional(),
});

const quotationQuerySchema = commonSchemas.pagination.extend({
  filter: z.string().optional(),
});

export const prerender = false;

/**
 * Create new quotation
 */
export const POST: APIRoute = withErrorHandling(async ({ request, locals }) => {
  const { supabase, user } = locals;

  // Authorization check
  if (!user?.id) {
    throw new AuthorizationError("Authentication required to create quotations");
  }

  // Validate request body
  const validatedData = await validateRequestBody(request, createQuotationSchema);
  const { estimation_type, scope, platforms, dynamic_attributes } = validatedData;

  // Create quotation service
  const quotationService = createQuotationService(supabase);

  // Analyze project with AI
  const analysisResult = await analyzeProject(scope, platforms, estimation_type);

  // Apply buffer to total man_days (minimum 30%)
  const applyBuffer = (totalManDays: number): number => Math.ceil(totalManDays * 0.3);
  const totalBuffer = applyBuffer(analysisResult.total_man_days);

  // Create quotation
  const quotation = await quotationService.createQuotation({
    user_id: user.id,
    estimation_type,
    scope,
    platforms,
    project_analysis: analysisResult.project_analysis,
    total_man_days: analysisResult.total_man_days,
    buffer_man_days: totalBuffer,
    total_with_buffer: analysisResult.total_man_days + totalBuffer,
    dynamic_attributes: dynamic_attributes as Record<string, unknown> | null,
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: quotation,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
});

/**
 * Get quotations list
 */
export const GET: APIRoute = withErrorHandling(async ({ request, locals }) => {
  const { supabase, user } = locals;

  // Authorization check
  if (!user?.id) {
    throw new AuthorizationError("Authentication required to view quotations");
  }

  // Validate query parameters
  const url = new URL(request.url);
  const { page, limit, sort, order, filter } = validateQueryParams(url, quotationQuerySchema);

  // Create quotation service
  const quotationService = createQuotationService(supabase);

  // Get quotations
  const { quotations, totalCount } = await quotationService.getQuotationsByUserId(
    user.id,
    { page, limit, sort, order, filter }
  );

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return new Response(
    JSON.stringify({
      success: true,
      data: quotations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});