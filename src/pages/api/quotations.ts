import type { APIRoute } from "astro";
import { z } from "zod";
import type { Json } from "../../db/database.types";
import { withErrorHandling, AuthorizationError } from "../../lib/errors";
import { validateRequestBody, validateQueryParams, commonSchemas } from "../../lib/validation";
import { createQuotationService } from "../../lib/services/quotation.service";
import { analyzeProject } from "../../lib/services/ai.service";

// Validation schema for the request body
const createQuotationSchema = z.object({
  estimation_type: z.enum(["Fixed Price", "Time & Material"]),
  scope: z.string().max(10000, "Scope description cannot exceed 10000 characters"),
  platforms: z.array(z.string()).min(1, "At least one platform must be selected"),
  dynamic_attributes: z.union([z.record(z.unknown()), z.null()]).optional(),
});

// Query params schema
const quotationQuerySchema = commonSchemas.pagination.extend({
  filter: z.string().optional(),
});

// Apply buffer to total man_days (minimum 30%)
const applyBuffer = (totalManDays: number): number => {
  return Math.ceil(totalManDays * 0.3); // 30% buffer
};

export const prerender = false;

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
  const aiAnalysis = await analyzeProject(scope, platforms, estimation_type, dynamic_attributes as Json, user.id);

  // Calculate total man_days and buffer
  const totalManDays = aiAnalysis.tasks.reduce((sum, task) => sum + (task.man_days || 0), 0);
  const buffer = applyBuffer(totalManDays);

  // Create quotation
  const quotation = await quotationService.createQuotation({
    user_id: user.id,
    estimation_type,
    scope,
    man_days: totalManDays,
    buffer: buffer,
    dynamic_attributes: (dynamic_attributes || null) as Json,
    platforms,
    tasks: aiAnalysis.tasks.map((task) => ({
      description: task.description,
      man_days: task.man_days || 0,
    })),
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

export const GET: APIRoute = withErrorHandling(async ({ request, locals }) => {
  const { supabase, user } = locals;

  // Authorization check
  if (!user?.id) {
    throw new AuthorizationError("Authentication required to view quotations");
  }

  // Validate query parameters
  const url = new URL(request.url);
  const validatedParams = validateQueryParams(url, quotationQuerySchema);

  // Create quotation service
  const quotationService = createQuotationService(supabase);

  // Get quotations
  const result = await quotationService.listQuotations({
    userId: user.id,
    page: validatedParams.page ?? 1,
    limit: validatedParams.limit ?? 10,
    sort: validatedParams.sort,
    filter: validatedParams.filter,
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: result.data,
      pagination: result.pagination,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
