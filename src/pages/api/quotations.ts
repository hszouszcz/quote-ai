import { z } from "zod";
import type { APIRoute } from "astro";
import type { Json } from "../../db/database.types";
import { analyzeProject } from "../../lib/services/ai.service";
import { listQuotations } from "../../lib/services/quotation.service";

// Validation schema for the request body
const createQuotationSchema = z.object({
  estimation_type: z.enum(["Fixed Price", "Time & Material"]),
  scope: z.string().max(10000, "Scope description cannot exceed 10000 characters"),
  platforms: z.array(z.string()).min(1, "At least one platform must be selected"),
  dynamic_attributes: z.union([z.record(z.unknown()), z.null()]).optional(),
});

// Query params schema
const QueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z.string().optional(),
  filter: z.string().optional(),
});

// Apply buffer to total man_days (minimum 30%)
const applyBuffer = (totalManDays: number): number => {
  return Math.ceil(totalManDays * 0.3); // 30% buffer
};

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase, user } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const quotationData = validationResult.data;

    try {
      // Get AI estimation and tasks with man_days
      const aiAnalysis = await analyzeProject(
        quotationData.scope,
        quotationData.platforms,
        quotationData.estimation_type,
        quotationData.dynamic_attributes as Json
      );

      // Calculate total man_days and buffer
      const totalManDays = aiAnalysis.tasks.reduce((sum, task) => sum + (task.man_days || 0), 0);
      const buffer = applyBuffer(totalManDays);

      // Create the quotation record
      const { data: quotation, error: insertError } = await supabase
        .from("quotations")
        .insert({
          user_id: user.id,
          estimation_type: quotationData.estimation_type,
          scope: quotationData.scope,
          buffer: buffer,
          dynamic_attributes: quotationData.dynamic_attributes || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting quotation:", insertError);
        throw new Error("Failed to create quotation");
      }

      // Create quotation_platforms relationships
      const { error: platformsError } = await supabase.from("quotation_platforms").insert(
        quotationData.platforms.map((platformId: string) => ({
          quotation_id: quotation.id,
          platform_id: platformId,
        }))
      );

      if (platformsError) {
        console.error("Error linking platforms:", platformsError);
        // Attempt to rollback the quotation creation
        await supabase.from("quotations").delete().eq("id", quotation.id);
        throw new Error("Failed to link platforms");
      }

      // Create tasks from AI analysis with man_days
      const { error: tasksError } = await supabase.from("quotation_tasks").insert(
        aiAnalysis.tasks.map((task) => ({
          quotation_id: quotation.id,
          task_description: task.description,
          man_days: task.man_days,
        }))
      );

      if (tasksError) {
        console.error("Error creating tasks:", tasksError);
        throw new Error("Failed to create tasks");
      }

      return new Response(JSON.stringify(quotation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in quotation creation process:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error creating quotation:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.cause : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase, user } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parsowanie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedParams = QueryParamsSchema.safeParse(queryParams);

    if (!validatedParams.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validatedParams.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobieranie danych przy użyciu serwisu
    const result = await listQuotations(supabase, {
      userId: user.id,
      ...validatedParams.data,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/quotations:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
